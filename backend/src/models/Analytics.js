const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous events
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'FAQ_GENERATION',
      'FAQ_EDIT',
      'FAQ_EXPORT',
      'USER_SIGNUP',
      'USER_LOGIN',
      'SEARCH_PERFORMED',
      'FEEDBACK_SUBMITTED'
    ]
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  sessionId: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
analyticsSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
