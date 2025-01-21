import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { cleanup } from '@testing-library/react';

// Configure testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Add custom matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid date`,
    };
  },
});
