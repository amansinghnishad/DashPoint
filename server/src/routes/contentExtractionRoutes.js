const express = require('express');
const { body, query, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');

const router = express.Router();

// Import controller (will create it next)
const contentExtractionController = require('../controllers/contentExtractionController');

// All routes require authentication
router.use(auth);

// Rate limiting for content extraction (more restrictive due to external API calls)
const extractionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 extractions per 15 minutes
  message: {
    error: 'Too many content extraction requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced extraction rate limiting
const enhancedExtractionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // limit each IP to 10 enhanced extractions per 10 minutes
  message: {
    error: 'Too many enhanced content extraction requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const extractContentValidation = [
  body('url')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Please provide a valid HTTP/HTTPS URL'),
  body('extractImages')
    .optional()
    .isBoolean()
    .withMessage('Extract images must be a boolean'),
  body('extractLinks')
    .optional()
    .isBoolean()
    .withMessage('Extract links must be a boolean'),
  body('maxContentLength')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Max content length must be between 100 and 50000 characters')
];

const getExtractionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid extraction ID')
];

const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  query('domain')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Domain filter must be between 1 and 100 characters'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Enhanced content extraction with AI summarization
router.post('/extract-enhanced',
  enhancedExtractionLimiter,
  [
    body('url')
      .isURL({
        protocols: ['http', 'https'],
        require_protocol: true
      })
      .withMessage('Please provide a valid HTTP/HTTPS URL'),
    body('extractImages')
      .optional()
      .isBoolean()
      .withMessage('extractImages must be a boolean'),
    body('extractLinks')
      .optional()
      .isBoolean()
      .withMessage('extractLinks must be a boolean'),
    body('maxContentLength')
      .optional()
      .isInt({ min: 100, max: 50000 })
      .withMessage('maxContentLength must be between 100 and 50000'),
    body('generateSummary')
      .optional()
      .isBoolean()
      .withMessage('generateSummary must be a boolean'),
    body('summaryLength')
      .optional()
      .isString()
      .withMessage('summaryLength must be a string')
  ],
  contentExtractionController.extractContentWithSummary
);

// Intelligent content processing using AI agent
router.post('/process-ai',
  enhancedExtractionLimiter,
  [
    body('url')
      .optional()
      .isURL({
        protocols: ['http', 'https'],
        require_protocol: true
      })
      .withMessage('Please provide a valid HTTP/HTTPS URL'),
    body('content')
      .optional()
      .isString()
      .isLength({ min: 10, max: 50000 })
      .withMessage('Content must be between 10 and 50000 characters'),
    body('processType')
      .optional()
      .isIn(['summarize', 'analyze', 'keywords', 'topics', 'sentiment'])
      .withMessage('processType must be one of: summarize, analyze, keywords, topics, sentiment'),
    // At least one of url or content must be provided
    body().custom((value, { req }) => {
      if (!req.body.url && !req.body.content) {
        throw new Error('Either url or content must be provided');
      }
      return true;
    })
  ],
  contentExtractionController.processContentWithAI
);

// Routes
router.post('/extract', extractionLimiter, extractContentValidation, contentExtractionController.extractContent);
router.get('/', searchValidation, contentExtractionController.getExtractions);
router.get('/search', searchValidation, contentExtractionController.searchExtractions);
router.get('/:id', getExtractionValidation, contentExtractionController.getExtractionById);
router.delete('/:id', getExtractionValidation, contentExtractionController.deleteExtraction);

// CRUD routes for saved content
// GET /api/content-extraction - Get all saved content
router.get('/', contentExtractionController.getAll);

// POST /api/content-extraction - Save new content
router.post('/', [
  body('url').isURL().withMessage('Valid URL is required'),
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 300 }),
  body('content').notEmpty().withMessage('Content is required').isLength({ max: 50000 }),
  body('domain').notEmpty().withMessage('Domain is required'),
  body('category').optional().isString(),
  body('tags').optional().isArray(),
  body('summary').optional().isLength({ max: 1000 }),
  body('author').optional().isString(),
  body('language').optional().isString()
], contentExtractionController.create);

// PUT /api/content-extraction/:id - Update saved content
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid content ID'),
  body('title').optional().isLength({ max: 300 }),
  body('content').optional().isLength({ max: 50000 }),
  body('category').optional().isString(),
  body('tags').optional().isArray(),
  body('summary').optional().isLength({ max: 1000 })
], contentExtractionController.update);

// DELETE /api/content-extraction/:id - Delete saved content
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid content ID')
], contentExtractionController.delete);

module.exports = router;
