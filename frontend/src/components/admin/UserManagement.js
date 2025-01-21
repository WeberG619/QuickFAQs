import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  SearchIcon,
  FilterIcon,
  BanIcon,
  KeyIcon,
  UserAddIcon
} from '@heroicons/react/outline';
import { format } from 'date-fns';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters, searchQuery]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        search: searchQuery
      });
      const response = await fetch(`/api/admin/users?${queryParams}`);
      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Refresh user list
      fetchUsers();
      toast.success('User status updated successfully');
    } catch (err) {
      toast.error('Failed to update user status');
      console.error('Update user status error:', err);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Refresh user list
      fetchUsers();
      toast.success('User role updated successfully');
    } catch (err) {
      toast.error('Failed to update user role');
      console.error('Update user role error:', err);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      // Refresh user list
      fetchUsers();
      setShowAddUserModal(false);
      toast.success('User created successfully');
    } catch (err) {
      toast.error('Failed to create user');
      console.error('Create user error:', err);
    }
  };

  const UserDetail = ({ user }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <UserIcon className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={user.role}
            onChange={(e) => updateUserRole(user._id, e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <select
            value={user.status}
            onChange={(e) => updateUserStatus(user._id, e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Account Details</h4>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Member since</dt>
              <dd className="text-sm text-gray-900">
                {format(new Date(user.createdAt), 'PPP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last login</dt>
              <dd className="text-sm text-gray-900">
                {user.lastLogin
                  ? format(new Date(user.lastLogin), 'PPP')
                  : 'Never'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">FAQs created</dt>
              <dd className="text-sm text-gray-900">{user.faqCount || 0}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900">Usage Statistics</h4>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm text-gray-500">API calls (30 days)</dt>
              <dd className="text-sm text-gray-900">{user.apiCalls30d || 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Storage used</dt>
              <dd className="text-sm text-gray-900">
                {formatBytes(user.storageUsed || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Subscription</dt>
              <dd className="text-sm text-gray-900">
                {user.subscription || 'Free'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
        <ul className="mt-2 divide-y divide-gray-200">
          {user.recentActivity?.map((activity, index) => (
            <li key={index} className="py-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {format(new Date(activity.timestamp), 'PPp')}
                </span>
                <span className="text-sm text-gray-900">{activity.action}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const AddUserModal = () => {
    const [newUser, setNewUser] = useState({
      name: '',
      email: '',
      role: 'user',
      password: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      createUser(newUser);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New User
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <UserAddIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
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
                  placeholder="Search users..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user._id}>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className={`block hover:bg-gray-50 w-full text-left px-4 py-4 ${
                      selectedUser?._id === user._id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : user.status === 'suspended'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }
                          `}
                        >
                          {user.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'moderator'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          `}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {selectedUser ? (
              <UserDetail user={selectedUser} />
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                Select a user to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddUserModal && <AddUserModal />}
    </div>
  );
};

// Utility function to format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default UserManagement;
