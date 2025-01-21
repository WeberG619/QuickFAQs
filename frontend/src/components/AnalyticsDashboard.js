import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Tab } from '@headlessui/react';
import { format, subDays } from 'date-fns';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [eventStats, setEventStats] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');

      const endDate = new Date();
      const startDate = getStartDate(timeRange);

      // Fetch event statistics
      const eventResponse = await fetch(`/api/analytics/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      const eventData = await eventResponse.json();

      // Fetch feedback statistics
      const feedbackResponse = await fetch('/api/analytics/feedback');
      const feedbackData = await feedbackResponse.json();

      setEventStats(formatEventData(eventData));
      setFeedbackStats(formatFeedbackData(feedbackData));
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStartDate = (range) => {
    switch (range) {
      case '7d':
        return subDays(new Date(), 7);
      case '30d':
        return subDays(new Date(), 30);
      case '90d':
        return subDays(new Date(), 90);
      default:
        return subDays(new Date(), 7);
    }
  };

  const formatEventData = (data) => {
    // Transform event data for charts
    return data.map(item => ({
      date: format(new Date(item._id.day), 'MMM dd'),
      [item._id.eventType]: item.count,
    }));
  };

  const formatFeedbackData = (data) => {
    // Transform feedback data for charts
    return data.map(item => ({
      type: item._id,
      count: item.totalCount,
      avgRating: item.statusBreakdown.reduce((acc, curr) => acc + (curr.avgRating || 0), 0) / item.statusBreakdown.length
    }));
  };

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
          onClick={fetchAnalytics}
          className="mt-2 text-primary-600 hover:text-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-900/20 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white text-primary-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }`
            }
          >
            Event Analytics
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white text-primary-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
              }`
            }
          >
            Feedback Analytics
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eventStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="FAQ_GENERATION"
                    stroke="#8884d8"
                    name="FAQ Generations"
                  />
                  <Line
                    type="monotone"
                    dataKey="USER_SIGNUP"
                    stroke="#82ca9d"
                    name="User Signups"
                  />
                  <Line
                    type="monotone"
                    dataKey="FAQ_EXPORT"
                    stroke="#ffc658"
                    name="FAQ Exports"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill="#8884d8"
                    name="Feedback Count"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="avgRating"
                    fill="#82ca9d"
                    name="Average Rating"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-primary-900">Total FAQs</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">
            {eventStats.reduce((acc, curr) => acc + (curr.FAQ_GENERATION || 0), 0)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-900">Avg. Rating</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {(feedbackStats.reduce((acc, curr) => acc + curr.avgRating, 0) / feedbackStats.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900">Active Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {eventStats.reduce((acc, curr) => acc + (curr.USER_LOGIN || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
