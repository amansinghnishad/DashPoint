const express = require('express');
const rateLimit = require('express-rate-limit');

const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const chatSessionController = require('../controllers/chatSessionController');
const {
  chatMessageValidation,
  actionItemExtractValidation,
  actionItemApproveValidation
} = require('../middleware/validators/chatValidators');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI request limit reached. Please try again shortly.' }
});

router.use(auth);

// Session endpoints
router.get('/sessions', chatSessionController.listSessions);
router.post('/sessions', chatSessionController.createSession);
router.get('/sessions/:sessionId/messages', chatSessionController.getSessionMessages);
router.patch('/sessions/:sessionId', chatSessionController.updateSession);
router.delete('/sessions/:sessionId', chatSessionController.deleteSession);

// Streaming SSE endpoint
router.post('/stream', aiLimiter, chatMessageValidation, chatController.streamChat);

// Action item endpoints
router.post(
  '/action-items/extract',
  actionItemExtractValidation,
  chatController.extractActionItems
);

router.post(
  '/action-items/approve',
  actionItemApproveValidation,
  chatController.approveActionItems
);

// Standard chat endpoint
router.post(
  '/',
  aiLimiter,
  chatMessageValidation,
  chatController.chat
);

module.exports = router;
