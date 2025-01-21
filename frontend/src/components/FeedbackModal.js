import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { StarIcon } from '@heroicons/react/solid';
import { useAuth } from '../contexts/AuthContext';

const FeedbackModal = ({ isOpen, onClose, faqId = null }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({
    type: 'GENERAL',
    title: '',
    description: '',
    rating: 0,
    priority: 'MEDIUM',
    tags: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          ...feedback,
          userId: user?._id,
          faqId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      onClose();
      // Show success toast
      toast.success('Thank you for your feedback!');
    } catch (error) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <Dialog.Title className="text-lg font-medium text-gray-900">
            Share Your Feedback
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-4">
            {/* Feedback Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Type of Feedback
              </label>
              <select
                value={feedback.type}
                onChange={(e) => setFeedback(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="GENERAL">General Feedback</option>
                <option value="BUG_REPORT">Report a Bug</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="FAQ_QUALITY">FAQ Quality</option>
              </select>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className={`p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full ${
                      feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <StarIcon className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={feedback.title}
                onChange={(e) => setFeedback(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={feedback.description}
                onChange={(e) => setFeedback(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                maxLength={2000}
              />
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={feedback.priority}
                onChange={(e) => setFeedback(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center text-red-600">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default FeedbackModal;
