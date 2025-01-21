import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initializeErrorTracking = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      environment: process.env.NODE_ENV,
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Only enable error tracking in production
      enabled: process.env.NODE_ENV === 'production',

      // Before sending an event, check if it should be sent
      beforeSend(event) {
        // Don't send events for network errors or user cancellations
        if (event.exception) {
          const errorMessage = event.exception.values[0].value.toLowerCase();
          if (
            errorMessage.includes('network error') ||
            errorMessage.includes('user cancelled') ||
            errorMessage.includes('aborted')
          ) {
            return null;
          }
        }
        return event;
      },
    });
  }
};

// Custom error boundary component
export const ErrorBoundary = Sentry.ErrorBoundary;

// Function to manually capture exceptions
export const captureException = (error, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', error);
    console.log('Context:', context);
  }

  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
      Sentry.captureException(error);
    });
  }
};

// Function to manually capture messages
export const captureMessage = (message, level = 'info') => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${level.toUpperCase()}: ${message}`);
  }

  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
};

// Performance monitoring
export const startTransaction = (name, op) => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    return Sentry.startTransaction({
      name,
      op,
    });
  }
  return null;
};

// User tracking
export const setUser = (user) => {
  if (process.env.REACT_APP_SENTRY_DSN && user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      subscription: user.subscriptionStatus,
    });
  }
};

// Clear user tracking
export const clearUser = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.setUser(null);
  }
};
