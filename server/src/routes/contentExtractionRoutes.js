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

// Routes
router.post('/extract', extractionLimiter, extractContentValidation, contentExtractionController.extractContent);
router.get('/', searchValidation, contentExtractionController.getExtractions);
router.get('/search', searchValidation, contentExtractionController.searchExtractions);
router.get('/:id', getExtractionValidation, contentExtractionController.getExtractionById);
router.delete('/:id', getExtractionValidation, contentExtractionController.deleteExtraction);

module.exports = router;
