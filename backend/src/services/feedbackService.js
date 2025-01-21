const Feedback = require('../models/Feedback');
const analyticsService = require('./analyticsService');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

class FeedbackService {
  async submitFeedback(feedbackData) {
    try {
      const feedback = new Feedback(feedbackData);
      await feedback.save();

      // Track feedback submission in analytics
      await analyticsService.trackEvent(
        feedbackData.userId,
        'FEEDBACK_SUBMITTED',
        {
          feedbackType: feedbackData.type,
          faqId: feedbackData.faqId
        }
      );

      // Send notification to admin for high priority feedback
      if (feedback.priority === 'HIGH' || feedback.priority === 'CRITICAL') {
        await this.notifyAdminOfHighPriorityFeedback(feedback);
      }

      logger.info('Feedback submitted successfully', {
        feedbackId: feedback._id,
        type: feedback.type,
        priority: feedback.priority
      });

      return feedback;
    } catch (error) {
      logger.error('Error submitting feedback', {
        error: error.message,
        feedbackData
      });
      throw error;
    }
  }

  async getFeedbackStats() {
    try {
      const stats = await Feedback.aggregate([
        {
          $group: {
            _id: {
              type: '$type',
              status: '$status'
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        {
          $group: {
            _id: '$_id.type',
            statusBreakdown: {
              $push: {
                status: '$_id.status',
                count: '$count',
                avgRating: '$avgRating'
              }
            },
            totalCount: { $sum: '$count' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Error getting feedback stats', {
        error: error.message
      });
      throw error;
    }
  }

  async updateFeedbackStatus(feedbackId, status, resolution = null) {
    try {
      const feedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        {
          status,
          resolution,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      // Notify user if feedback is resolved
      if (status === 'RESOLVED' && feedback.userId) {
        await this.notifyUserOfResolution(feedback);
      }

      logger.info('Feedback status updated', {
        feedbackId,
        newStatus: status,
        resolution
      });

      return feedback;
    } catch (error) {
      logger.error('Error updating feedback status', {
        error: error.message,
        feedbackId,
        status
      });
      throw error;
    }
  }

  async getFeedbackByUser(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const feedback = await Feedback.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Feedback.countDocuments({ userId });

      return {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting user feedback', {
        error: error.message,
        userId,
        page,
        limit
      });
      throw error;
    }
  }

  async notifyAdminOfHighPriorityFeedback(feedback) {
    try {
      const emailContent = {
        subject: `High Priority Feedback Received: ${feedback.title}`,
        text: `
          Priority: ${feedback.priority}
          Type: ${feedback.type}
          Description: ${feedback.description}
          User ID: ${feedback.userId || 'Anonymous'}
          Submitted: ${feedback.createdAt}
        `
      };

      await sendEmail(process.env.ADMIN_EMAIL, emailContent);
    } catch (error) {
      logger.error('Error notifying admin of high priority feedback', {
        error: error.message,
        feedbackId: feedback._id
      });
      // Don't throw error as this is a secondary operation
    }
  }

  async notifyUserOfResolution(feedback) {
    try {
      const user = await User.findById(feedback.userId);
      if (!user || !user.email) return;

      const emailContent = {
        subject: 'Your Feedback Has Been Resolved',
        text: `
          Dear ${user.name},

          Your feedback "${feedback.title}" has been resolved.
          
          Resolution: ${feedback.resolution}

          Thank you for helping us improve QuickFAQs!
        `
      };

      await sendEmail(user.email, emailContent);
    } catch (error) {
      logger.error('Error notifying user of feedback resolution', {
        error: error.message,
        feedbackId: feedback._id,
        userId: feedback.userId
      });
      // Don't throw error as this is a secondary operation
    }
  }
}

module.exports = new FeedbackService();
