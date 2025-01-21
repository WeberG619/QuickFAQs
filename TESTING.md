# QuickFAQs Testing Guide

This guide covers testing practices, configuration, and examples for both the frontend and backend of QuickFAQs.

## Backend Testing

### Setup

1. Install testing dependencies:
   ```bash
   cd backend
   npm install --save-dev jest supertest mongodb-memory-server
   ```

2. Configure test script in package.json:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

### Test Structure

```
backend/
├── tests/
│   ├── setup.js                 # Database setup
│   ├── setupAfterEnv.js        # Global test setup
│   ├── controllers/
│   │   ├── authController.test.js
│   │   ├── faqController.test.js
│   │   └── paymentController.test.js
│   ├── models/
│   │   ├── User.test.js
│   │   └── FAQ.test.js
│   ├── middlewares/
│   │   ├── auth.test.js
│   │   └── error.test.js
│   └── utils/
│       └── helpers.test.js
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Best Practices

1. **Database Testing**
   - Use mongodb-memory-server for testing
   - Clear database between tests
   - Use separate test database

2. **API Testing**
   - Use supertest for endpoint testing
   - Test both success and error cases
   - Validate response structure

3. **Authentication Testing**
   - Test protected routes
   - Verify token validation
   - Test permission levels

4. **Error Handling**
   - Test error middleware
   - Verify error responses
   - Check error logging

## Frontend Testing

### Setup

1. Install testing dependencies:
   ```bash
   cd frontend
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

2. Configure test script in package.json:
   ```json
   {
     "scripts": {
       "test": "react-scripts test",
       "test:coverage": "react-scripts test --coverage --watchAll=false"
     }
   }
   ```

### Test Structure

```
frontend/
├── src/
│   ├── test/
│   │   ├── setup.js            # Global setup
│   │   └── setupTests.js       # RTL setup
│   ├── components/
│   │   └── __tests__/
│   │       ├── Navbar.test.js
│   │       └── Footer.test.js
│   ├── pages/
│   │   └── __tests__/
│   │       ├── Home.test.js
│   │       └── Dashboard.test.js
│   └── contexts/
│       └── __tests__/
│           └── AuthContext.test.js
```

### Component Testing Best Practices

1. **Rendering Tests**
   ```javascript
   it('renders component correctly', () => {
     render(<MyComponent />);
     expect(screen.getByText('Expected Text')).toBeInTheDocument();
   });
   ```

2. **User Interaction**
   ```javascript
   it('handles user interaction', async () => {
     render(<MyComponent />);
     await userEvent.click(screen.getByRole('button'));
     expect(screen.getByText('Updated Text')).toBeInTheDocument();
   });
   ```

3. **Async Operations**
   ```javascript
   it('handles async operations', async () => {
     render(<MyComponent />);
     await waitFor(() => {
       expect(screen.getByText('Loaded Data')).toBeInTheDocument();
     });
   });
   ```

### Context Testing

1. **Provider Testing**
   ```javascript
   const wrapper = ({ children }) => (
     <AuthProvider>{children}</AuthProvider>
   );

   it('provides context value', () => {
     render(<TestComponent />, { wrapper });
     // Test context behavior
   });
   ```

2. **Hook Testing**
   ```javascript
   const { result } = renderHook(() => useAuth(), { wrapper });
   expect(result.current.user).toBe(null);
   ```

## Integration Testing

### API Integration Tests

1. **Setup Test Environment**
   ```javascript
   const app = require('../src/app');
   const request = require('supertest');

   describe('API Integration', () => {
     it('completes full workflow', async () => {
       // Test complete user journey
     });
   });
   ```

2. **User Flow Testing**
   ```javascript
   it('handles user authentication flow', async () => {
     // 1. Register user
     const signup = await request(app)
       .post('/api/auth/signup')
       .send(userData);

     // 2. Login
     const login = await request(app)
       .post('/api/auth/login')
       .send(loginData);

     // 3. Access protected route
     const protected = await request(app)
       .get('/api/protected')
       .set('Authorization', `Bearer ${login.body.token}`);

     expect(protected.status).toBe(200);
   });
   ```

## E2E Testing

### Cypress Setup

1. Install Cypress:
   ```bash
   npm install --save-dev cypress
   ```

2. Add Cypress scripts:
   ```json
   {
     "scripts": {
       "cypress:open": "cypress open",
       "cypress:run": "cypress run"
     }
   }
   ```

### Example E2E Test

```javascript
describe('User Authentication', () => {
  it('should allow user to sign up and login', () => {
    // Visit home page
    cy.visit('/');

    // Sign up
    cy.get('[data-testid="signup-button"]').click();
    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="signup-submit"]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
  });
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install Dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install

      - name: Run Backend Tests
        run: cd backend && npm test

      - name: Run Frontend Tests
        run: cd frontend && npm test -- --watchAll=false

      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

## Performance Testing

### Backend Performance Tests

```javascript
describe('API Performance', () => {
  it('handles multiple concurrent requests', async () => {
    const requests = Array(50).fill().map(() =>
      request(app).get('/api/endpoint')
    );
    
    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

### Frontend Performance Tests

```javascript
describe('Component Performance', () => {
  it('renders large lists efficiently', () => {
    const items = Array(1000).fill().map((_, i) => ({
      id: i,
      text: `Item ${i}`
    }));

    const startTime = performance.now();
    render(<ListView items={items} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## Security Testing

### API Security Tests

```javascript
describe('Security Headers', () => {
  it('includes security headers', async () => {
    const response = await request(app).get('/');
    
    expect(response.headers).toMatchObject({
      'x-frame-options': 'DENY',
      'x-xss-protection': '1; mode=block',
      'x-content-type-options': 'nosniff'
    });
  });
});
```

## Monitoring Test Coverage

1. View coverage report:
   ```bash
   npm run test:coverage
   ```

2. Coverage thresholds:
   ```javascript
   // jest.config.js
   module.exports = {
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80
       }
     }
   };
   ```

## Troubleshooting Tests

1. **Common Issues**
   - Async operation timing
   - Component re-renders
   - Context provider missing
   - Database connection issues

2. **Debug Tools**
   ```javascript
   // Add debug logs
   console.log('Debug:', value);
   
   // Use test.only
   it.only('should test this specific case', () => {
     // Test code
   });
   ```

## Continuous Improvement

1. Regular test review
2. Coverage monitoring
3. Performance benchmarking
4. Security scanning
5. Accessibility testing
