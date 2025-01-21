import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/solid';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/feedback?status=${filter}`);
      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError('Failed to load feedback');
      console.error('Feedback fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeedbackStatus = async (id, status, resolution = '') => {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, resolution })
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback status');
      }

      // Refresh feedback list
      fetchFeedback();
      
      // Show success message
      toast.success('Feedback status updated successfully');
    } catch (err) {
      toast.error('Failed to update feedback status');
      console.error('Update feedback error:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'NEW':
        return <ExclamationIcon className="h-5 w-5 text-blue-500" />;
      case 'CLOSED':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const FeedbackDetail = ({ feedback }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{feedback.title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Submitted by: {feedback.userId ? feedback.userId : 'Anonymous'}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feedback.priority)}`}>
          {feedback.priority}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-gray-700">{feedback.description}</p>
      </div>

      {feedback.screenshots?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Screenshots</h4>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {feedback.screenshots.map((screenshot, index) => (
              <img
                key={index}
                src={screenshot.url}
                alt={`Screenshot ${index + 1}`}
                className="rounded-lg shadow-sm"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900">Update Status</h4>
        <div className="mt-2 flex space-x-2">
          {['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => updateFeedbackStatus(feedback._id, status)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${feedback.status === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {(feedback.status === 'RESOLVED' || feedback.status === 'CLOSED') && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Resolution Notes
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            rows={3}
            value={feedback.resolution || ''}
            onChange={(e) => updateFeedbackStatus(feedback._id, feedback.status, e.target.value)}
          />
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button
          onClick={fetchFeedback}
          className="mt-2 text-primary-600 hover:text-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Feedback Management</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All Feedback</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <button
                key={item._id}
                onClick={() => setSelectedFeedback(item)}
                className={`w-full text-left p-4 hover:bg-gray-50 focus:outline-none ${
                  selectedFeedback?._id === item._id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Detail */}
        <div>
          {selectedFeedback ? (
            <FeedbackDetail feedback={selectedFeedback} />
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              Select a feedback item to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
