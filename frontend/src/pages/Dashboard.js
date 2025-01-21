import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { exportToMarkdown, exportToPDF } from '../utils/exportUtils';

const CATEGORIES = ['All', 'Product', 'Service', 'Technical', 'Support', 'Other'];

function Dashboard() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    tags: []
  });
  const [editingFaq, setEditingFaq] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchFAQs();
    // If we have a new FAQ from the generation page, show success message
    if (location.state?.newFaq) {
      toast.success('New FAQ added to your dashboard!');
    }
  }, [location.state, filters]);

  const fetchFAQs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'All') {
        params.append('category', filters.category);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      const response = await api.get(`/faq/user?${params.toString()}`);
      setFaqs(response.data.faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load your FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFaq = async (faqId, updates) => {
    try {
      const response = await api.patch(`/faq/${faqId}`, updates);
      setFaqs(faqs.map(faq => 
        faq._id === faqId ? response.data.faq : faq
      ));
      toast.success('FAQ updated successfully!');
      setEditingFaq(null);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      await api.delete(`/faq/${faqId}`);
      setFaqs(faqs.filter(faq => faq._id !== faqId));
      toast.success('FAQ deleted successfully!');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
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

      {/* Filters Section */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Search FAQs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
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
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {faq.category}
                        </span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {new Date(faq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {faq.tags && faq.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {faq.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2">
                      {editingFaq === faq._id ? (
                        <textarea
                          className="w-full p-2 border rounded-md"
                          rows="10"
                          value={faq.customizedFAQ || faq.generatedFAQ}
                          onChange={(e) => {
                            const updatedFaqs = faqs.map(f => 
                              f._id === faq._id 
                                ? { ...f, customizedFAQ: e.target.value }
                                : f
                            );
                            setFaqs(updatedFaqs);
                          }}
                        />
                      ) : (
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                          {faq.customizedFAQ || faq.generatedFAQ}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end space-x-3">
                      {editingFaq === faq._id ? (
                        <>
                          <button
                            onClick={() => handleUpdateFaq(faq._id, {
                              customizedFAQ: faq.customizedFAQ
                            })}
                            className="btn-primary text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingFaq(null)}
                            className="btn-secondary text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingFaq(faq._id)}
                            className="btn-secondary text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq._id)}
                            className="btn-danger text-sm"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => exportToMarkdown(faq)}
                            className="btn-secondary text-sm"
                          >
                            Export MD
                          </button>
                          <button
                            onClick={() => exportToPDF(faq)}
                            className="btn-secondary text-sm"
                          >
                            Export PDF
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(faq.customizedFAQ || faq.generatedFAQ);
                              toast.success('FAQ copied to clipboard!');
                            }}
                            className="btn-secondary text-sm"
                          >
                            Copy
                          </button>
                        </>
                      )}
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
