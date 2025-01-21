const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  faqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ',
    required: false // Feedback might not be related to a specific FAQ
  },
  type: {
    type: String,
    required: true,
    enum: ['BUG_REPORT', 'FEATURE_REQUEST', 'FAQ_QUALITY', 'GENERAL']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    required: true,
    enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'NEW'
  },
  priority: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  tags: [{
    type: String,
    trim: true
  }],
  screenshots: [{
    url: String,
    filename: String
  }],
  adminNotes: {
    type: String,
    required: false
  },
  resolution: {
    type: String,
    required: false
  },
  browser: {
    type: String,
    required: false
  },
  operatingSystem: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
