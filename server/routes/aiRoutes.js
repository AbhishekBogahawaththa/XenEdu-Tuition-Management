const express = require('express');
const router = express.Router();
const { chat, learn, faqChat } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/chat', protect, chat);
router.post('/learn', protect, authorize('student'), learn);

router.post('/faq', faqChat);
module.exports = router;