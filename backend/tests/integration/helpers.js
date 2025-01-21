const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const FAQ = require('../../src/models/FAQ');
const Analytics = require('../../src/models/Analytics');

let mongoServer;

const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });
};

const createTestUser = async (role = 'user') => {
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$testHashedPassword',
    role
  });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { user, token };
};

const createTestFAQ = async (userId) => {
  return await FAQ.create({
    question: 'Test Question?',
    answer: 'Test Answer',
    category: 'Test Category',
    tags: ['test'],
    createdBy: userId,
    status: 'published'
  });
};

const createTestAnalytics = async (userId, eventType = 'FAQ_VIEWED') => {
  return await Analytics.create({
    userId,
    eventType,
    metadata: {
      testData: 'test'
    },
    timestamp: new Date(),
    sessionId: 'test-session',
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1'
  });
};

const expectSuccess = (response, statusCode = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', true);
};

const expectError = (response, statusCode = 400) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('error');
};

const expectValidationError = (response) => {
  expectError(response, 400);
  expect(response.body.error).toMatch(/validation/i);
};

const expectAuthError = (response) => {
  expectError(response, 401);
  expect(response.body.error).toMatch(/unauthorized|authentication/i);
};

const expectNotFoundError = (response) => {
  expectError(response, 404);
  expect(response.body.error).toMatch(/not found/i);
};

const expectForbiddenError = (response) => {
  expectError(response, 403);
  expect(response.body.error).toMatch(/forbidden|permission/i);
};

module.exports = {
  setupTestDB,
  createTestUser,
  createTestFAQ,
  createTestAnalytics,
  expectSuccess,
  expectError,
  expectValidationError,
  expectAuthError,
  expectNotFoundError,
  expectForbiddenError
};
