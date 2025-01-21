import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout, signup } = useAuth();

  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button
        onClick={() => login({ email: 'test@example.com', password: 'password' })}
        data-testid="login-button"
      >
        Login
      </button>
      <button
        onClick={() => signup({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password'
        })}
        data-testid="signup-button"
      >
        Signup
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
  });

  it('handles login successfully', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };

    api.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        token: 'fake-token',
        data: { user: mockUser }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        `Logged in as ${mockUser.email}`
      );
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'token',
      'fake-token'
    );

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          status: 'error',
          message: errorMessage
        }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('handles signup successfully', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };

    api.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        token: 'fake-token',
        data: { user: mockUser }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('signup-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        `Logged in as ${mockUser.email}`
      );
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'token',
      'fake-token'
    );

    expect(api.post).toHaveBeenCalledWith('/auth/signup', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('handles logout', async () => {
    // First login
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };

    api.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        token: 'fake-token',
        data: { user: mockUser }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        `Logged in as ${mockUser.email}`
      );
    });

    // Then logout
    fireEvent.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('loads user from token on mount', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };

    // Mock localStorage.getItem to return a token
    localStorage.getItem.mockReturnValue('fake-token');

    // Mock the API call to get user data
    api.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { user: mockUser }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        `Logged in as ${mockUser.email}`
      );
    });

    expect(api.get).toHaveBeenCalledWith('/auth/me');
  });
});
