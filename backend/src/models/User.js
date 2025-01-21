const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  faqCredits: {
    type: Number,
    default: 3 // Free users get 3 FAQ generations
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
