import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  SearchIcon,
  FilterIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import { format } from 'date-fns';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, [filters, searchQuery]);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        search: searchQuery
      });
      const response = await fetch(`/api/admin/faqs?${queryParams}`);
      const data = await response.json();
      setFaqs(data);
      setError('');
    } catch (err) {
      setError('Failed to load FAQs');
      console.error('FAQs fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFAQStatus = async (faqId, status) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update FAQ status');
      }

      fetchFAQs();
      toast.success('FAQ status updated successfully');
    } catch (err) {
      toast.error('Failed to update FAQ status');
      console.error('Update FAQ status error:', err);
    }
  };

  const deleteFAQ = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete FAQ');
      }

      fetchFAQs();
      setSelectedFAQ(null);
      toast.success('FAQ deleted successfully');
    } catch (err) {
      toast.error('Failed to delete FAQ');
      console.error('Delete FAQ error:', err);
    }
  };

  const updateFAQ = async (faqId, faqData) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(faqData)
      });

      if (!response.ok) {
        throw new Error('Failed to update FAQ');
      }

      fetchFAQs();
      setShowEditModal(false);
      toast.success('FAQ updated successfully');
    } catch (err) {
      toast.error('Failed to update FAQ');
      console.error('Update FAQ error:', err);
    }
  };

  const FAQDetail = ({ faq }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Created by: {faq.createdBy?.name || 'Unknown'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingFAQ(faq);
              setShowEditModal(true);
            }}
            className="inline-flex items-center p-2 border border-transparent rounded-full text-primary-600 hover:bg-primary-50"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => deleteFAQ(faq._id)}
            className="inline-flex items-center p-2 border border-transparent rounded-full text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="prose max-w-none">
          <p className="text-gray-700">{faq.answer}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium text-gray-900">FAQ Details</h4>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {format(new Date(faq.createdAt), 'PPP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last Updated</dt>
              <dd className="text-sm text-gray-900">
                {format(new Date(faq.updatedAt), 'PPP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Category</dt>
              <dd className="text-sm text-gray-900">{faq.category}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900">Usage Statistics</h4>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Views</dt>
              <dd className="text-sm text-gray-900">{faq.viewCount || 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Helpful Votes</dt>
              <dd className="text-sm text-gray-900">
                {faq.helpfulVotes || 0} / {faq.totalVotes || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="text-sm">
                <select
                  value={faq.status}
                  onChange={(e) => updateFAQStatus(faq._id, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900">Tags</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {faq.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const EditFAQModal = ({ faq, onClose }) => {
    const [formData, setFormData] = useState({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags?.join(', ') || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      updateFAQ(faq._id, { ...formData, tags });
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit FAQ</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Answer
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !faqs.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">FAQ Management</h2>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <SearchIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search FAQs..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                {/* Add dynamic categories here */}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {faqs.map((faq) => (
                <li key={faq._id}>
                  <button
                    onClick={() => setSelectedFAQ(faq)}
                    className={`block hover:bg-gray-50 w-full text-left px-4 py-4 ${
                      selectedFAQ?._id === faq._id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {faq.question}
                          </p>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {faq.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              faq.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : faq.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          `}
                        >
                          {faq.status}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {selectedFAQ ? (
              <FAQDetail faq={selectedFAQ} />
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                Select an FAQ to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && editingFAQ && (
        <EditFAQModal
          faq={editingFAQ}
          onClose={() => {
            setShowEditModal(false);
            setEditingFAQ(null);
          }}
        />
      )}
    </div>
  );
};

export default FAQManagement;
