const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  summarizeText,
  extractKeywords,
  analyzeSentiment,
  enhanceText,
  answerQuestion,
  summarizeTextWithDashPointAgent,
  summarizeYouTubeWithDashPointAgent,
  chatWithDashPointAgent
} = require('../controllers/aiServicesController');

const router = express.Router();

// Text summarization route
router.post('/summarize',
  auth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  [
    body('text')
      .isString()
      .isLength({ min: 50, max: 10000 })
      .withMessage('Text must be between 50 and 10,000 characters'),
    body('maxLength')
      .optional()
      .isInt({ min: 30, max: 500 })
      .withMessage('Max length must be between 30 and 500'),
    body('minLength')
      .optional()
      .isInt({ min: 10, max: 200 })
      .withMessage('Min length must be between 10 and 200')
  ],
  summarizeText
);

// Keyword extraction route
router.post('/keywords',
  auth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), // 30 requests per 15 minutes
  [
    body('text')
      .isString()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Text must be between 10 and 5,000 characters')
  ],
  extractKeywords
);

// Sentiment analysis route
router.post('/sentiment',
  auth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  [
    body('text')
      .isString()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Text must be between 5 and 1,000 characters')
  ],
  analyzeSentiment
);

// Text enhancement route
router.post('/enhance',
  auth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 15 }), // 15 requests per 15 minutes (more intensive)
  [
    body('text')
      .isString()
      .isLength({ min: 10, max: 3000 })
      .withMessage('Text must be between 10 and 3,000 characters'),
    body('options')
      .optional()
      .isObject()
      .withMessage('Options must be an object')
  ],
  enhanceText
);

// Question answering route
router.post('/answer',
  auth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 25 }), // 25 requests per 15 minutes
  [
    body('question')
      .isString()
      .isLength({ min: 5, max: 500 })
      .withMessage('Question must be between 5 and 500 characters'),
    body('context')
      .isString()
      .isLength({ min: 20, max: 2000 })
      .withMessage('Context must be between 20 and 2,000 characters')
  ],
  answerQuestion
);

// DashPoint AI Agent routes
router.post('/dashpoint/summarize-text',
  auth,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }), // 10 requests per 5 minutes
  [
    body('text_content')
      .isString()
      .isLength({ min: 50, max: 50000 })
      .withMessage('Text content must be between 50 and 50,000 characters'),
    body('summary_length')
      .optional()
      .isString()
      .withMessage('Summary length must be a string')
  ],
  summarizeTextWithDashPointAgent
);

router.post('/dashpoint/summarize-youtube',
  auth,
  rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }), // 5 requests per 10 minutes
  [
    body('youtube_url')
      .isString()
      .matches(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/)
      .withMessage('Must be a valid YouTube URL'),
    body('summary_length')
      .optional()
      .isString()
      .withMessage('Summary length must be a string')
  ],
  summarizeYouTubeWithDashPointAgent
);

router.post('/dashpoint/chat',
  auth,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 15 }), // 15 requests per 5 minutes
  [
    body('prompt')
      .isString()
      .isLength({ min: 5, max: 2000 })
      .withMessage('Prompt must be between 5 and 2000 characters')
  ],
  chatWithDashPointAgent
);

module.exports = router;
