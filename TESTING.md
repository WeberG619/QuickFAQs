# QuickFAQs Testing Guide

This guide covers testing practices, configuration, and examples for both the frontend and backend of QuickFAQs.

## Testing Overview

### Test Categories

1. **Unit Tests**
   - Individual components and functions
   - Isolated business logic
   - Utility functions

2. **Integration Tests**
   - API endpoints
   - Component interactions
   - Database operations

3. **End-to-End Tests**
   - User flows
   - System integration
   - Browser compatibility

4. **Performance Tests**
   - Load testing
   - Stress testing
   - Scalability testing

## Backend Testing

### Setup

1. **Install testing dependencies**:
   ```bash
   cd backend
   npm install --save-dev jest supertest mongodb-memory-server @types/jest
   ```

2. **Configure Jest**:
   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'node',
     setupFilesAfterEnv: ['./tests/setup.js'],
     collectCoverageFrom: [
       'src/**/*.js',
       '!src/config/**',
       '!src/scripts/**'
     ],
     coverageThreshold: {
       global: {
         statements: 80,
         branches: 80,
         functions: 80,
         lines: 80
       }
     }
   };
   ```

### Test Structure

```
backend/
├── tests/
│   ├── setup.js                 # Test setup
│   ├── fixtures/               # Test data
│   │   ├── users.js
│   │   └── faqs.js
│   ├── integration/           # Integration tests
│   │   ├── auth.test.js
│   │   └── faq.test.js
│   ├── unit/                 # Unit tests
│   │   ├── services/
│   │   ├── utils/
│   │   └── models/
│   └── e2e/                  # E2E tests
```

### Testing FAQ Generation

1. **Unit Tests**:
   ```javascript
   // tests/unit/services/faqService.test.js
   describe('FAQ Generation Service', () => {
     it('generates FAQ with correct category and tags', async () => {
       const input = {
         companyName: 'Test Corp',
         productDetails: 'Test product details',
         category: 'Product',
         tags: ['software', 'tech']
       };
       
       const result = await generateFAQ(input);
       
       expect(result.category).toBe('Product');
       expect(result.tags).toEqual(['software', 'tech']);
       expect(result.generatedFAQ).toBeTruthy();
     });
     
     it('handles empty tags array', async () => {
       const input = {
         companyName: 'Test Corp',
         productDetails: 'Test product details',
         category: 'Product',
         tags: []
       };
       
       const result = await generateFAQ(input);
       
       expect(result.tags).toEqual([]);
     });
   });
   ```

2. **Integration Tests**:
   ```javascript
   // tests/integration/faq.test.js
   describe('FAQ API', () => {
     it('creates FAQ with category and tags', async () => {
       const response = await request(app)
         .post('/api/faq/generate')
         .set('Authorization', `Bearer ${token}`)
         .send({
           companyName: 'Test Corp',
           productDetails: 'Test details',
           category: 'Product',
           tags: ['tech']
         });
       
       expect(response.status).toBe(200);
       expect(response.body.faq.category).toBe('Product');
       expect(response.body.faq.tags).toContain('tech');
     });
     
     it('filters FAQs by category', async () => {
       const response = await request(app)
         .get('/api/faq/user')
         .set('Authorization', `Bearer ${token}`)
         .query({ category: 'Product' });
       
       expect(response.status).toBe(200);
       expect(response.body.faqs).toEqual(
         expect.arrayContaining([
           expect.objectContaining({ category: 'Product' })
         ])
       );
     });
     
     it('searches FAQs by text', async () => {
       const response = await request(app)
         .get('/api/faq/user')
         .set('Authorization', `Bearer ${token}`)
         .query({ search: 'test' });
       
       expect(response.status).toBe(200);
       expect(response.body.faqs.length).toBeGreaterThan(0);
     });
   });
   ```

## Frontend Testing

### Component Testing

1. **FAQ Generation Form**:
   ```javascript
   // src/components/__tests__/GenerateFAQForm.test.js
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import GenerateFAQForm from '../GenerateFAQForm';

   describe('GenerateFAQForm', () => {
     it('submits form with category and tags', async () => {
       const onSubmit = jest.fn();
       render(<GenerateFAQForm onSubmit={onSubmit} />);
       
       // Fill form
       await userEvent.type(
         screen.getByLabelText(/company name/i),
         'Test Corp'
       );
       await userEvent.type(
         screen.getByLabelText(/product details/i),
         'Test details'
       );
       await userEvent.selectOptions(
         screen.getByLabelText(/category/i),
         'Product'
       );
       
       // Add tags
       const tagInput = screen.getByPlaceholderText(/add tags/i);
       await userEvent.type(tagInput, 'tech{enter}');
       await userEvent.type(tagInput, 'software{enter}');
       
       // Submit form
       await userEvent.click(screen.getByRole('button', { name: /generate/i }));
       
       expect(onSubmit).toHaveBeenCalledWith({
         companyName: 'Test Corp',
         productDetails: 'Test details',
         category: 'Product',
         tags: ['tech', 'software']
       });
     });
     
     it('validates required fields', async () => {
       render(<GenerateFAQForm onSubmit={jest.fn()} />);
       
       await userEvent.click(screen.getByRole('button', { name: /generate/i }));
       
       expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
       expect(screen.getByText(/product details are required/i)).toBeInTheDocument();
     });
   });
   ```

2. **FAQ List Component**:
   ```javascript
   // src/components/__tests__/FAQList.test.js
   describe('FAQList', () => {
     const faqs = [
       {
         _id: '1',
         companyName: 'Test Corp',
         category: 'Product',
         tags: ['tech'],
         generatedFAQ: 'Test FAQ content'
       }
     ];
     
     it('filters FAQs by category', async () => {
       render(<FAQList faqs={faqs} />);
       
       await userEvent.selectOptions(
         screen.getByLabelText(/category/i),
         'Product'
       );
       
       expect(screen.getByText('Test Corp')).toBeInTheDocument();
       expect(screen.getByText('tech')).toBeInTheDocument();
     });
     
     it('exports FAQ to PDF', async () => {
       const exportToPDF = jest.fn();
       render(<FAQList faqs={faqs} onExportPDF={exportToPDF} />);
       
       await userEvent.click(screen.getByRole('button', { name: /export pdf/i }));
       
       expect(exportToPDF).toHaveBeenCalledWith(faqs[0]);
     });
   });
   ```

## E2E Testing

### Cypress Tests

1. **FAQ Generation Flow**:
   ```javascript
   // cypress/integration/faq.spec.js
   describe('FAQ Generation', () => {
     beforeEach(() => {
       cy.login();
     });
     
     it('generates and manages FAQs', () => {
       // Navigate to generate page
       cy.visit('/generate');
       
       // Fill the form
       cy.get('[data-testid="company-name"]').type('Test Corp');
       cy.get('[data-testid="product-details"]')
         .type('This is a test product description');
       cy.get('[data-testid="category-select"]').select('Product');
       cy.get('[data-testid="tag-input"]').type('tech{enter}');
       
       // Generate FAQ
       cy.get('[data-testid="generate-button"]').click();
       
       // Verify generation
       cy.url().should('include', '/dashboard');
       cy.contains('FAQ generated successfully');
       
       // Filter FAQs
       cy.get('[data-testid="category-filter"]').select('Product');
       cy.get('[data-testid="faq-list"]')
         .should('contain', 'Test Corp')
         .and('contain', 'tech');
       
       // Export FAQ
       cy.get('[data-testid="export-pdf"]').first().click();
       cy.readFile('downloads/faq.pdf').should('exist');
     });
   });
   ```

## Performance Testing

### Load Testing

1. **K6 Load Test**:
   ```javascript
   // tests/performance/load-test.js
   import http from 'k6/http';
   import { check, sleep } from 'k6';

   export const options = {
     stages: [
       { duration: '30s', target: 20 },
       { duration: '1m', target: 20 },
       { duration: '30s', target: 0 }
     ],
     thresholds: {
       http_req_duration: ['p(95)<500']
     }
   };

   export default function() {
     const BASE_URL = 'http://localhost:4000';
     
     // Test FAQ generation
     const payload = {
       companyName: 'Test Corp',
       productDetails: 'Test details',
       category: 'Product',
       tags: ['tech']
     };
     
     const res = http.post(`${BASE_URL}/api/faq/generate`, payload);
     check(res, {
       'status is 200': (r) => r.status === 200,
       'response time OK': (r) => r.timings.duration < 500
     });
     
     sleep(1);
   }
   ```

## Monitoring Tests

### Prometheus Metrics Tests

```javascript
describe('Metrics Endpoint', () => {
  it('exposes FAQ generation metrics', async () => {
    const response = await request(app).get('/metrics');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('faq_generation_total');
    expect(response.text).toContain('faq_generation_duration_seconds');
  });
});
```

## Security Testing

### API Security Tests

```javascript
describe('Security Headers', () => {
  it('includes required security headers', async () => {
    const response = await request(app).get('/');
    
    expect(response.headers).toMatchObject({
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'content-security-policy': expect.stringContaining("default-src 'self'")
    });
  });
  
  it('rate limits FAQ generation', async () => {
    const requests = Array(10).fill().map(() =>
      request(app)
        .post('/api/faq/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'Test Corp',
          productDetails: 'Test details'
        })
    );
    
    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

## Test Automation

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017
          
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
        
      - name: Run E2E Tests
        run: |
          npm start & npx wait-on http://localhost:3000
          npx cypress run
          
      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

## Best Practices

1. **Test Organization**
   - Group tests logically
   - Use descriptive test names
   - Maintain test data fixtures

2. **Test Coverage**
   - Aim for 80%+ coverage
   - Focus on critical paths
   - Include edge cases

3. **Test Maintenance**
   - Regular test reviews
   - Update tests with code changes
   - Remove obsolete tests

4. **Performance Testing**
   - Regular load testing
   - Monitor response times
   - Test scalability

5. **Security Testing**
   - Regular security scans
   - Penetration testing
   - Dependency audits
