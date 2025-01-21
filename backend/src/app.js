const express = require('express');
const router = express.Router();
const authRoutes = require('./routes/authRoutes');
const faqRoutes = require('./routes/faqRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

router.use('/auth', authRoutes);
router.use('/faq', faqRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;
