const express = require('express');
const router = express.Router();
const { protect, checkCredits } = require('../middlewares/authMiddleware');
const { generateFAQ, getUserFAQs, getFAQById } = require('../controllers/faqController');

router.post('/generate', protect, checkCredits, generateFAQ);
router.get('/user', protect, getUserFAQs);
router.get('/:id', protect, getFAQById);

module.exports = router;
