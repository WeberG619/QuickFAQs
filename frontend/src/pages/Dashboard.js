import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchFAQs();
    // If we have a new FAQ from the generation page, show success message
    if (location.state?.newFaq) {
      toast.success('New FAQ added to your dashboard!');
    }
  }, [location.state]);

  const fetchFAQs = async () => {
    try {
      const response = await api.get('/faq/user');
      setFaqs(response.data.faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load your FAQs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome, {user.name}!
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Subscription: {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
            </div>
            {user.subscriptionStatus !== 'premium' && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                Credits Remaining: {user.faqCredits}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/generate"
            className="btn-primary"
          >
            Generate New FAQ
          </Link>
        </div>
      </div>

      {/* FAQs List */}
      <div className="mt-8">
        {faqs.length === 0 ? (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first FAQ.
            </p>
            <div className="mt-6">
              <Link
                to="/generate"
                className="btn-primary"
              >
                Generate FAQ
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {faqs.map((faq) => (
                <li key={faq._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-primary-600 truncate">
                        {faq.companyName}
                      </h3>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {new Date(faq.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-600 whitespace-pre-wrap">
                        {faq.generatedFAQ}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end space-x-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(faq.generatedFAQ);
                          toast.success('FAQ copied to clipboard!');
                        }}
                        className="btn-secondary text-sm"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Upgrade Banner (show only for free/basic users) */}
      {user.subscriptionStatus !== 'premium' && (
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-primary-800 font-semibold">
                Upgrade to Premium
              </h3>
              <p className="mt-2 text-primary-700">
                Get unlimited FAQ generations and priority support.
              </p>
            </div>
            <Link
              to="/pricing"
              className="btn-primary"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
