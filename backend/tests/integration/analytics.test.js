const request = require('supertest');
const app = require('../../src/app');
const {
  setupTestDB,
  createTestUser,
  createTestFAQ,
  createTestAnalytics,
  expectSuccess,
  expectAuthError,
  expectForbiddenError
} = require('./helpers');

setupTestDB();

describe('Analytics API', () => {
  let token;
  let userId;
  let adminToken;
  let faq;

  beforeEach(async () => {
    const testUser = await createTestUser('user');
    token = testUser.token;
    userId = testUser.user._id;

    const adminUser = await createTestUser('admin');
    adminToken = adminUser.token;

    faq = await createTestFAQ(userId);
    await createTestAnalytics(userId);
  });

  describe('GET /api/analytics/events', () => {
    it('should return events for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/events')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(Array.isArray(res.body.data.events)).toBe(true);
      expect(res.body.data.events.length).toBeGreaterThan(0);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
    });

    it('should filter events by type', async () => {
      await createTestAnalytics(userId, 'FAQ_CREATED');

      const res = await request(app)
        .get('/api/analytics/events')
        .query({ eventType: 'FAQ_CREATED' })
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(res.body.data.events).toHaveLength(1);
      expect(res.body.data.events[0].eventType).toBe('FAQ_CREATED');
    });

    it('should filter events by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const res = await request(app)
        .get('/api/analytics/events')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      res.body.data.events.forEach(event => {
        const eventDate = new Date(event.timestamp);
        expect(eventDate >= startDate && eventDate <= endDate).toBe(true);
      });
    });

    it('should return error if not admin', async () => {
      const res = await request(app)
        .get('/api/analytics/events')
        .set('Authorization', `Bearer ${token}`);

      expectForbiddenError(res);
    });
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard stats for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalFAQs');
      expect(res.body.data).toHaveProperty('totalViews');
      expect(res.body.data).toHaveProperty('averageRating');
      expect(res.body.data).toHaveProperty('topCategories');
      expect(res.body.data).toHaveProperty('recentActivity');
    });

    it('should return error if not admin', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expectForbiddenError(res);
    });
  });

  describe('GET /api/analytics/user-activity', () => {
    it('should return user activity for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/user-activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      expect(res.body.data).toHaveProperty('totalActiveUsers');
      expect(res.body.data).toHaveProperty('averageSessionDuration');
    });

    it('should return own activity for regular user', async () => {
      const res = await request(app)
        .get('/api/analytics/user-activity')
        .set('Authorization', `Bearer ${token}`);

      expectSuccess(res);
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      res.body.data.activities.forEach(activity => {
        expect(activity.userId.toString()).toBe(userId.toString());
      });
    });
  });

  describe('GET /api/analytics/faq-performance', () => {
    it('should return FAQ performance stats', async () => {
      const res = await request(app)
        .get('/api/analytics/faq-performance')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('topViewedFAQs');
      expect(res.body.data).toHaveProperty('topRatedFAQs');
      expect(res.body.data).toHaveProperty('categoryPerformance');
      expect(res.body.data).toHaveProperty('averageResponseTime');
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const res = await request(app)
        .get('/api/analytics/faq-performance')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
    });

    it('should return error if not admin', async () => {
      const res = await request(app)
        .get('/api/analytics/faq-performance')
        .set('Authorization', `Bearer ${token}`);

      expectForbiddenError(res);
    });
  });

  describe('GET /api/analytics/search-analytics', () => {
    it('should return search analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/search-analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('topSearches');
      expect(res.body.data).toHaveProperty('failedSearches');
      expect(res.body.data).toHaveProperty('averageSearchResults');
      expect(res.body.data).toHaveProperty('searchTrends');
    });

    it('should return error if not admin', async () => {
      const res = await request(app)
        .get('/api/analytics/search-analytics')
        .set('Authorization', `Bearer ${token}`);

      expectForbiddenError(res);
    });
  });

  describe('POST /api/analytics/track', () => {
    const validEvent = {
      eventType: 'FAQ_VIEWED',
      metadata: {
        faqId: 'faqId123',
        category: 'Test Category'
      }
    };

    it('should track event successfully', async () => {
      const res = await request(app)
        .post('/api/analytics/track')
        .set('Authorization', `Bearer ${token}`)
        .send(validEvent);

      expectSuccess(res);
      expect(res.body.data).toMatchObject({
        eventType: validEvent.eventType,
        metadata: validEvent.metadata,
        userId: userId.toString()
      });
    });

    it('should return error if not authenticated', async () => {
      const res = await request(app)
        .post('/api/analytics/track')
        .send(validEvent);

      expectAuthError(res);
    });

    it('should include user agent and IP', async () => {
      const res = await request(app)
        .post('/api/analytics/track')
        .set('Authorization', `Bearer ${token}`)
        .set('User-Agent', 'test-agent')
        .send(validEvent);

      expectSuccess(res);
      expect(res.body.data).toHaveProperty('userAgent', 'test-agent');
      expect(res.body.data).toHaveProperty('ipAddress');
    });
  });

  describe('GET /api/analytics/export', () => {
    it('should export analytics data for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
      expect(res.header['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('eventType,userId,timestamp');
    });

    it('should filter export by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const res = await request(app)
        .get('/api/analytics/export')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccess(res);
    });

    it('should return error if not admin', async () => {
      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', `Bearer ${token}`);

      expectForbiddenError(res);
    });
  });
});
