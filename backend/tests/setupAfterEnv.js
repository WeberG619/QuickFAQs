const { closeDatabase, clearDatabase } = require('./setup');

// Set test timeout
jest.setTimeout(30000);

// Clear database after each test
afterEach(async () => {
  await clearDatabase();
});

// Close database connection after all tests
afterAll(async () => {
  await closeDatabase();
});
