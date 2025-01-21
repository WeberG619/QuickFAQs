const request = require('supertest');
const app = require('../../src/app');
const {
  setupTestDB,
  createTestUser,
  createTestFAQ,
  expectSuccess,
  expectValidationError,
  expectAuthError,
  expectNotFoundError,
  expectForbiddenError
} = require('./helpers');

setupTestDB();

describe('FAQ API', () => {
  let token;
  let userId;
  let adminToken;

  beforeEach(async () => {
    const testUser = await createTestUser('user');
    token = testUser.token;
    userId = testUser.user._id;

    const adminUser = await createTestUser('admin');
    adminToken = adminUser.token;
  });

  describe('POST /api/faqs', () => {
    const validFAQ = {
      question: 'Test Question?',
      answer: 'Test Answer',
      category: 'Test Category',
      tags: ['test']
    };

    it('should create FAQ successfully', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${token}`)
        .send(validFAQ);

      expectSuccess(res, 201);
      expect(res.body.data).toMatchObject({
        question: validFAQ.question,
        answer: validFAQ.answer,
        category: validFAQ.category,
        createdBy: userId.toString()
      });
    });

    it('should return error if not authenticated', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .send(validFAQ);

      expectAuthError(res);
    });

    it('should return error if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          question: validFAQ.question
        });

      expectValidationError(res);
    });
  });

  describe('GET /api/faqs', () => {
    beforeEach(async () => {
      await createTestFAQ(userId);
      await createTestFAQ(userId);
    });

    it('should return list of FAQs', async () => {
      const res = await request(app)
        .get('/api/faqs')
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);
      expect(Array.isArray(res.body.data.faqs)).toBe(true);
      expect(res.body.data.faqs).toHaveLength(2);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('totalPages');
    });

    it('should filter FAQs by category', async () => {
      await createTestFAQ(userId, {
        category: 'Different Category'
      });

      const res = await request(app)
        .get('/api/faqs')
        .query({ category: 'Test Category' })
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);
      expect(res.body.data.faqs).toHaveLength(2);
      res.body.data.faqs.forEach(faq => {
        expect(faq.category).toBe('Test Category');
      });
    });

    it('should search FAQs by query', async () => {
      await createTestFAQ(userId, {
        question: 'Different Question?',
        answer: 'Different Answer'
      });

      const res = await request(app)
        .get('/api/faqs')
        .query({ search: 'Test' })
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);
      expect(res.body.data.faqs).toHaveLength(2);
      res.body.data.faqs.forEach(faq => {
        expect(faq.question).toMatch(/Test/);
      });
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/faqs')
        .query({ page: 1, limit: 1 })
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);
      expect(res.body.data.faqs).toHaveLength(1);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.totalPages).toBe(2);
    });
  });

  describe('GET /api/faqs/:id', () => {
    let faq;

    beforeEach(async () => {
      faq = await createTestFAQ(userId);
    });

    it('should return FAQ by ID', async () => {
      const res = await request(app)
        .get(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);
      expect(res.body.data).toMatchObject({
        question: faq.question,
        answer: faq.answer,
        category: faq.category
      });
    });

    it('should return error if FAQ not found', async () => {
      const res = await request(app)
        .get('/api/faqs/nonexistentid')
        .set('Authorization', `Bearer ${token}`);

      expectNotFoundError(res);
    });
  });

  describe('PATCH /api/faqs/:id', () => {
    let faq;

    beforeEach(async () => {
      faq = await createTestFAQ(userId);
    });

    it('should update FAQ successfully', async () => {
      const updates = {
        question: 'Updated Question?',
        answer: 'Updated Answer'
      };

      const res = await request(app)
        .patch(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expectSuccess(res);
      expect(res.body.data).toMatchObject(updates);
    });

    it('should return error if not FAQ owner or admin', async () => {
      const otherUser = await createTestUser();
      const res = await request(app)
        .patch(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${otherUser.token}`)
        .send({ question: 'Updated Question?' });

      expectForbiddenError(res);
    });

    it('should allow admin to update any FAQ', async () => {
      const updates = {
        question: 'Admin Updated Question?'
      };

      const res = await request(app)
        .patch(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expectSuccess(res);
      expect(res.body.data).toMatchObject(updates);
    });
  });

  describe('DELETE /api/faqs/:id', () => {
    let faq;

    beforeEach(async () => {
      faq = await createTestFAQ(userId);
    });

    it('should delete FAQ successfully', async () => {
      const res = await request(app)
        .delete(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);

      // Verify FAQ is deleted
      const getRes = await request(app)
        .get(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${token}`);

      expectNotFoundError(getRes);
    });

    it('should return error if not FAQ owner or admin', async () => {
      const otherUser = await createTestUser();
      const res = await request(app)
        .delete(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${otherUser.token}`);

      expectForbiddenError(res);
    });

    it('should allow admin to delete any FAQ', async () => {
      const res = await request(app)
        .delete(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
    });
  });

  describe('POST /api/faqs/:id/vote', () => {
    let faq;

    beforeEach(async () => {
      faq = await createTestFAQ(userId);
    });

    it('should record helpful vote successfully', async () => {
      const res = await request(app)
        .post(`/api/faqs/${faq._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ helpful: true });

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('helpfulVotes', 1);
      expect(res.body.data).toHaveProperty('totalVotes', 1);
    });

    it('should record not helpful vote successfully', async () => {
      const res = await request(app)
        .post(`/api/faqs/${faq._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ helpful: false });

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('helpfulVotes', 0);
      expect(res.body.data).toHaveProperty('totalVotes', 1);
    });

    it('should prevent multiple votes from same user', async () => {
      await request(app)
        .post(`/api/faqs/${faq._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ helpful: true });

      const res = await request(app)
        .post(`/api/faqs/${faq._id}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ helpful: true });

      expectValidationError(res);
      expect(res.body.error).toMatch(/already voted/i);
    });
  });

  describe('GET /api/faqs/stats', () => {
    beforeEach(async () => {
      await createTestFAQ(userId);
      await createTestFAQ(userId);
    });

    it('should return FAQ statistics', async () => {
      const res = await request(app)
        .get('/api/faqs/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('totalFAQs');
      expect(res.body.data).toHaveProperty('faqsByCategory');
      expect(res.body.data).toHaveProperty('faqsByStatus');
      expect(res.body.data).toHaveProperty('topViewedFAQs');
      expect(res.body.data).toHaveProperty('topRatedFAQs');
    });

    it('should return error if not admin', async () => {
      const res = await request(app)
        .get('/api/faqs/stats')
        .set('Authorization', `Bearer ${token}`);

      expectForbiddenError(res);
    });
  });
});
