const mongoose = require('mongoose');
const analyticsService = require('../../src/services/analyticsService');
const Analytics = require('../../src/models/Analytics');
const { ValidationError } = require('../../src/utils/errors');

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    const mockEventData = {
      userId: 'userId123',
      eventType: 'FAQ_VIEWED',
      metadata: {
        faqId: 'faqId123',
        category: 'Test Category'
      }
    };

    it('should track event successfully', async () => {
      const mockSavedEvent = {
        _id: 'eventId123',
        ...mockEventData,
        timestamp: new Date(),
        sessionId: expect.any(String),
        userAgent: expect.any(String),
        ipAddress: expect.any(String)
      };

      jest.spyOn(Analytics.prototype, 'save')
        .mockResolvedValue(mockSavedEvent);

      const result = await analyticsService.trackEvent(
        mockEventData.userId,
        mockEventData.eventType,
        mockEventData.metadata
      );

      expect(result).toEqual(mockSavedEvent);
    });

    it('should throw error if event type is invalid', async () => {
      await expect(analyticsService.trackEvent(
        mockEventData.userId,
        'INVALID_EVENT',
        mockEventData.metadata
      ))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('getEventStats', () => {
    const mockQuery = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-21'),
      eventType: 'FAQ_VIEWED'
    };

    it('should get event statistics successfully', async () => {
      const mockStats = [
        {
          _id: {
            day: '2025-01-01',
            eventType: 'FAQ_VIEWED'
          },
          count: 5
        },
        {
          _id: {
            day: '2025-01-02',
            eventType: 'FAQ_VIEWED'
          },
          count: 3
        }
      ];

      jest.spyOn(Analytics, 'aggregate')
        .mockResolvedValue(mockStats);

      const result = await analyticsService.getEventStats(mockQuery);

      expect(result).toEqual(mockStats);
    });
  });

  describe('getUserJourney', () => {
    const mockUserId = 'userId123';
    const mockTimeRange = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-21')
    };

    it('should get user journey successfully', async () => {
      const mockEvents = [
        {
          _id: 'eventId1',
          eventType: 'USER_LOGIN',
          timestamp: new Date('2025-01-01T10:00:00'),
          metadata: {}
        },
        {
          _id: 'eventId2',
          eventType: 'FAQ_VIEWED',
          timestamp: new Date('2025-01-01T10:05:00'),
          metadata: { faqId: 'faqId123' }
        }
      ];

      jest.spyOn(Analytics, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockEvents)
      });

      const result = await analyticsService.getUserJourney(mockUserId, mockTimeRange);

      expect(result).toEqual(mockEvents);
    });
  });

  describe('getPopularContent', () => {
    const mockTimeRange = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-21')
    };

    it('should get popular content successfully', async () => {
      const mockPopularContent = [
        {
          _id: 'faqId123',
          viewCount: 10,
          category: 'Test Category'
        },
        {
          _id: 'faqId124',
          viewCount: 8,
          category: 'Another Category'
        }
      ];

      jest.spyOn(Analytics, 'aggregate')
        .mockResolvedValue(mockPopularContent);

      const result = await analyticsService.getPopularContent(mockTimeRange);

      expect(result).toEqual(mockPopularContent);
    });
  });

  describe('getUserStats', () => {
    const mockUserId = 'userId123';

    it('should get user statistics successfully', async () => {
      const mockStats = {
        totalEvents: 15,
        eventBreakdown: {
          FAQ_VIEWED: 8,
          FAQ_CREATED: 3,
          FAQ_UPDATED: 4
        },
        lastActive: new Date()
      };

      jest.spyOn(Analytics, 'aggregate')
        .mockResolvedValue([mockStats]);

      const result = await analyticsService.getUserStats(mockUserId);

      expect(result).toEqual(mockStats);
    });
  });

  describe('getSystemMetrics', () => {
    const mockTimeRange = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-21')
    };

    it('should get system metrics successfully', async () => {
      const mockMetrics = {
        totalUsers: 100,
        totalFAQs: 500,
        activeUsers: 50,
        averageResponseTime: 250,
        errorRate: 0.02
      };

      jest.spyOn(Analytics, 'aggregate')
        .mockResolvedValue([mockMetrics]);

      const result = await analyticsService.getSystemMetrics(mockTimeRange);

      expect(result).toEqual(mockMetrics);
    });
  });

  describe('cleanupOldEvents', () => {
    it('should cleanup old events successfully', async () => {
      const mockDeleteResult = {
        deletedCount: 1000
      };

      jest.spyOn(Analytics, 'deleteMany')
        .mockResolvedValue(mockDeleteResult);

      const result = await analyticsService.cleanupOldEvents(30); // 30 days

      expect(result.deletedCount).toBe(mockDeleteResult.deletedCount);
    });
  });
});
