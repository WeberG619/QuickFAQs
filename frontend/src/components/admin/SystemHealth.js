import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationIcon,
  XCircleIcon,
  RefreshIcon,
  ServerIcon,
  DatabaseIcon,
  CloudIcon,
  CogIcon
} from '@heroicons/react/solid';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SystemHealth = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, timeRange]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/system/metrics?timeRange=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
      setError('');
    } catch (err) {
      setError('Failed to load system metrics');
      console.error('Metrics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatus = (status) => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
          text: 'Healthy',
          class: 'text-green-700 bg-green-100'
        };
      case 'warning':
        return {
          icon: <ExclamationIcon className="h-5 w-5 text-yellow-500" />,
          text: 'Warning',
          class: 'text-yellow-700 bg-yellow-100'
        };
      case 'critical':
        return {
          icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
          text: 'Critical',
          class: 'text-red-700 bg-red-100'
        };
      default:
        return {
          icon: <CogIcon className="h-5 w-5 text-gray-500" />,
          text: 'Unknown',
          class: 'text-gray-700 bg-gray-100'
        };
    }
  };

  const ServiceCard = ({ name, status, icon: Icon, metrics }) => {
    const healthStatus = getHealthStatus(status);
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className="h-8 w-8 text-primary-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{name}</h3>
              <div className="flex items-center mt-1">
                {healthStatus.icon}
                <span className={`ml-2 text-sm px-2 py-1 rounded-full ${healthStatus.class}`}>
                  {healthStatus.text}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-900">
              {metrics.value}
            </p>
            <p className="text-sm text-gray-500">{metrics.unit}</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !metrics) {
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
          onClick={fetchMetrics}
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
        <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button
            onClick={fetchMetrics}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ServiceCard
          name="API Server"
          status={metrics?.api.status}
          icon={ServerIcon}
          metrics={{
            value: metrics?.api.responseTime,
            unit: 'ms avg response'
          }}
        />
        <ServiceCard
          name="Database"
          status={metrics?.database.status}
          icon={DatabaseIcon}
          metrics={{
            value: metrics?.database.connections,
            unit: 'active connections'
          }}
        />
        <ServiceCard
          name="OpenAI Service"
          status={metrics?.openai.status}
          icon={CloudIcon}
          metrics={{
            value: metrics?.openai.requestsPerMinute,
            unit: 'requests/min'
          }}
        />
        <ServiceCard
          name="Cache"
          status={metrics?.cache.status}
          icon={ServerIcon}
          metrics={{
            value: metrics?.cache.hitRate,
            unit: 'hit rate'
          }}
        />
      </div>

      {/* Performance Charts */}
      <div className="space-y-6">
        {/* CPU Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CPU Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.cpu.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#8884d8"
                  name="CPU Usage %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.memory.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="used"
                  stroke="#82ca9d"
                  name="Used Memory (MB)"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#ffc658"
                  name="Total Memory (MB)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Response Times */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Response Times</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.api.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="p50"
                  stroke="#8884d8"
                  name="P50 (ms)"
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  stroke="#82ca9d"
                  name="P95 (ms)"
                />
                <Line
                  type="monotone"
                  dataKey="p99"
                  stroke="#ffc658"
                  name="P99 (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {metrics?.alerts?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-4">
            {metrics.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  alert.severity === 'critical'
                    ? 'bg-red-50'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-50'
                    : 'bg-blue-50'
                }`}
              >
                <div className="flex items-center">
                  {alert.severity === 'critical' ? (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  ) : alert.severity === 'warning' ? (
                    <ExclamationIcon className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                  )}
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
