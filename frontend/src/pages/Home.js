import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager at TechCorp",
      content: "QuickFAQs has revolutionized how we handle product documentation. What used to take days now takes minutes.",
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      name: "Michael Chen",
      role: "Startup Founder",
      content: "The AI-generated FAQs are incredibly accurate and save us countless hours. Best investment for our documentation needs.",
      image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      name: "Emily Davis",
      role: "Customer Success Lead",
      content: "Our support tickets dropped by 40% after implementing QuickFAQs. The AI understands exactly what our customers need to know.",
      image: "https://randomuser.me/api/portraits/women/3.jpg"
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section with Animation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Generate Professional FAQs</span>
            <span className="block text-primary-600">Powered by AI</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create comprehensive FAQ sections for your product or service in seconds. 
            Powered by advanced AI to generate relevant, accurate, and engaging questions and answers.
          </p>
          <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
            {user ? (
              <Link
                to="/generate"
                className="btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200"
              >
                Generate FAQ Now
              </Link>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/signup"
                  className="btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/pricing"
                  className="btn-secondary text-lg px-8 py-3 hover:bg-gray-100 transition-colors duration-200"
                >
                  View Pricing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-4xl font-bold text-primary-600">500+</div>
            <div className="text-gray-600 mt-2">Companies Trust Us</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-4xl font-bold text-primary-600">1M+</div>
            <div className="text-gray-600 mt-2">FAQs Generated</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-4xl font-bold text-primary-600">98%</div>
            <div className="text-gray-600 mt-2">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      {/* Features Section with Hover Effects */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose QuickFAQs?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Streamline your documentation process with our powerful features
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full transform hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Lightning Fast</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Generate comprehensive FAQs in seconds, not hours. Save time and focus on what matters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full transform hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">AI-Powered Quality</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Leverage advanced AI to create accurate, relevant, and engaging FAQ content.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full transform hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Easy Updates</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Keep your FAQs fresh and relevant with easy regeneration and updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Trusted by Industry Leaders
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our customers have to say about QuickFAQs
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-center">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                  <div className="ml-4">
                    <div className="text-lg font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to Transform Your FAQ Generation?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Join thousands of companies using QuickFAQs to streamline their documentation
          </p>
          {!user && (
            <div className="mt-8">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transform hover:scale-105 transition-all duration-200"
              >
                Start Your Free Trial
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
