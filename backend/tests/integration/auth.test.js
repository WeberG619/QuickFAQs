const request = require('supertest');
const app = require('../../src/app');
const {
  setupTestDB,
  createTestUser,
  expectSuccess,
  expectValidationError,
  expectAuthError
} = require('./helpers');

setupTestDB();

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expectSuccess(res, 201);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', validUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return error if email already exists', async () => {
      await createTestUser();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          email: 'test@example.com'
        });

      expectValidationError(res);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('should return error if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: validUser.email
        });

      expectValidationError(res);
    });

    it('should return error if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          email: 'invalid-email'
        });

      expectValidationError(res);
    });

    it('should return error if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          password: '123'
        });

      expectValidationError(res);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        });

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return error with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expectAuthError(res);
    });

    it('should return error with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpassword'
        });

      expectAuthError(res);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const testUser = await createTestUser();
      token = testUser.token;
    });

    it('should return current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return error if no token provided', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expectAuthError(res);
    });

    it('should return error if invalid token provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expectAuthError(res);
    });
  });

  describe('POST /api/auth/change-password', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const testUser = await createTestUser();
      token = testUser.token;
      userId = testUser.user._id;
    });

    it('should change password successfully', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'testpassword',
          newPassword: 'newpassword123'
        });

      expectSuccess(res);

      // Verify can login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword123'
        });

      expectSuccess(loginRes);
    });

    it('should return error if current password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expectAuthError(res);
    });

    it('should return error if new password is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'testpassword',
          newPassword: '123' // too short
        });

      expectValidationError(res);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should send reset password email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expectSuccess(res);
      // In a real test, we would verify that the email was sent
      // and check its contents
    });

    it('should not reveal if email exists', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expectSuccess(res);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      const testUser = await createTestUser();
      // In a real app, this would be generated and stored when
      // forgot-password is called
      resetToken = 'valid-reset-token';
    });

    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123'
        });

      expectSuccess(res);

      // Verify can login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword123'
        });

      expectSuccess(loginRes);
    });

    it('should return error with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123'
        });

      expectAuthError(res);
    });

    it('should return error if new password is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '123' // too short
        });

      expectValidationError(res);
    });
  });
});
