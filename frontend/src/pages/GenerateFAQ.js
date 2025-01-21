import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function GenerateFAQ() {
  const [companyName, setCompanyName] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/faq/generate', {
        companyName,
        productDetails,
      });

      toast.success('FAQ generated successfully!');
      navigate('/dashboard', { 
        state: { newFaq: response.data.faq }
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to generate FAQ. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Generate FAQ
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Provide details about your company and product to generate a
              comprehensive FAQ section.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  required
                  className="input"
                  placeholder="e.g., Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="product"
                className="block text-sm font-medium text-gray-700"
              >
                Product/Service Details
              </label>
              <div className="mt-1">
                <textarea
                  id="product"
                  name="product"
                  rows={4}
                  required
                  className="input"
                  placeholder="Describe your product or service in detail. Include key features, benefits, and any specific areas you want the FAQ to cover."
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {loading ? 'Generating...' : 'Generate FAQ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-lg font-medium text-gray-900">Tips for Better Results</h4>
          <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
            <li>Be specific about your product or service features</li>
            <li>Include your target audience and their common pain points</li>
            <li>Mention any unique selling propositions</li>
            <li>Add technical specifications if relevant</li>
            <li>Include pricing tiers or business model information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GenerateFAQ;
