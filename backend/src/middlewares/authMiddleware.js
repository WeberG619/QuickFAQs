const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// Middleware to check if user has available FAQ credits
exports.checkCredits = async (req, res, next) => {
  try {
    if (req.user.subscriptionStatus === 'premium') {
      return next(); // Premium users have unlimited access
    }

    if (req.user.faqCredits <= 0) {
      return res.status(403).json({
        message: 'No FAQ credits remaining. Please upgrade your subscription.'
      });
    }

    next();
  } catch (error) {
    console.error('Credit check middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
