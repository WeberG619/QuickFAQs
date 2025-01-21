import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      '3 FAQ generations per month',
      'Basic AI model',
      'Standard support',
      'Basic templates'
    ],
    priceId: null // No Stripe price ID for free plan
  },
  {
    name: 'Basic',
    price: 9.99,
    features: [
      '20 FAQ generations per month',
      'Enhanced AI model',
      'Priority email support',
      'Advanced templates',
      'FAQ customization'
    ],
    priceId: 'price_basic' // Replace with actual Stripe price ID
  },
  {
    name: 'Premium',
    price: 29.99,
    features: [
      'Unlimited FAQ generations',
      'Advanced AI model',
      'Priority 24/7 support',
      'All templates',
      'Custom branding',
      'API access'
    ],
    priceId: 'price_premium' // Replace with actual Stripe price ID
  }
];

function Pricing() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!priceId) {
      toast.error('Invalid subscription plan');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/payment/create-checkout-session', {
        priceId
      });
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:max-w-5xl lg:mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white
                ${plan.name === 'Premium' ? 'border-2 border-primary-500' : ''}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-medium text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-base font-medium text-gray-500">
                      /month
                    </span>
                  )}
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  {plan.name === 'Premium'
                    ? 'Best for businesses needing unlimited FAQs'
                    : plan.name === 'Basic'
                    ? 'Perfect for growing businesses'
                    : 'Great for getting started'}
                </p>
                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={loading || (user?.subscriptionStatus === plan.name.toLowerCase())}
                  className={`mt-8 w-full btn
                    ${plan.name === 'Premium'
                      ? 'btn-primary'
                      : 'btn-secondary'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading
                    ? 'Processing...'
                    : user?.subscriptionStatus === plan.name.toLowerCase()
                    ? 'Current Plan'
                    : plan.price === 0
                    ? 'Get Started'
                    : 'Subscribe'}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                  What's included
                </h4>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-gray-500">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-gray-900 text-center">
            Frequently Asked Questions
          </h3>
          <dl className="mt-8 space-y-6 divide-y divide-gray-200">
            <div className="pt-6">
              <dt className="text-lg font-medium text-gray-900">
                Can I change plans later?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-lg font-medium text-gray-900">
                What payment methods do you accept?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                We accept all major credit cards through our secure payment processor, Stripe.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-lg font-medium text-gray-900">
                Do unused credits roll over?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Credits reset at the beginning of each billing cycle and do not roll over to the next month.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
