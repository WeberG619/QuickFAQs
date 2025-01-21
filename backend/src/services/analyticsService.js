const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const logger = require('../utils/logger');

class AnalyticsService {
  async trackEvent(userId, eventType, metadata = {}) {
    try {
      const event = new Analytics({
        userId: userId ? mongoose.Types.ObjectId(userId) : null,
        eventType,
        metadata,
        timestamp: new Date()
      });
      await event.save();
      
      // Log event for monitoring
      logger.info('Analytics event tracked', {
        eventType,
        userId,
        metadata
      });
    } catch (error) {
      logger.error('Error tracking analytics event', {
        error: error.message,
        eventType,
        userId
      });
      throw error;
    }
  }

  async getEventStats(startDate, endDate, eventType = null) {
    try {
      const query = {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      };

      if (eventType) {
        query.eventType = eventType;
      }

      const stats = await Analytics.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              eventType: '$eventType',
              day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.eventType',
            dailyStats: {
              $push: {
                date: '$_id.day',
                count: '$count'
              }
            },
            totalCount: { $sum: '$count' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Error getting analytics stats', {
        error: error.message,
        startDate,
        endDate,
        eventType
      });
      throw error;
    }
  }

  async getUserJourney(userId, startDate, endDate) {
    try {
      return await Analytics.find({
        userId: mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ timestamp: 1 });
    } catch (error) {
      logger.error('Error getting user journey', {
        error: error.message,
        userId,
        startDate,
        endDate
      });
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
