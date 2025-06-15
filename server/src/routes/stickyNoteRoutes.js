const express = require('express');
const { body, query, param } = require('express-validator');
const stickyNoteController = require('../controllers/stickyNoteController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const createStickyNoteValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content is required and must be less than 10000 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('position')
    .optional()
    .isObject()
    .withMessage('Position must be an object'),
  body('position.x')
    .optional()
    .isNumeric()
    .withMessage('Position x must be a number'),
  body('position.y')
    .optional()
    .isNumeric()
    .withMessage('Position y must be a number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

const updateStickyNoteValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid sticky note ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('position')
    .optional()
    .isObject()
    .withMessage('Position must be an object'),
  body('position.x')
    .optional()
    .isNumeric()
    .withMessage('Position x must be a number'),
  body('position.y')
    .optional()
    .isNumeric()
    .withMessage('Position y must be a number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags filter must be a string'),
  query('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color filter must be a valid hex color'),
  query('archived')
    .optional()
    .isBoolean()
    .withMessage('Archived filter must be a boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const bulkOperationValidation = [
  body('noteIds')
    .isArray({ min: 1 })
    .withMessage('Note IDs must be a non-empty array'),
  body('noteIds.*')
    .isMongoId()
    .withMessage('Each note ID must be a valid MongoDB ID'),
  body('operation')
    .isIn(['archive', 'restore', 'delete'])
    .withMessage('Operation must be one of: archive, restore, delete')
];

// Routes
router.get('/', searchValidation, stickyNoteController.getStickyNotes);
router.post('/', createStickyNoteValidation, stickyNoteController.createStickyNote);
router.get('/search', searchValidation, stickyNoteController.searchStickyNotes);
router.get('/archived', stickyNoteController.getArchivedStickyNotes);
router.post('/bulk', bulkOperationValidation, stickyNoteController.bulkOperation);

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid sticky note ID')
], stickyNoteController.getStickyNoteById);

router.put('/:id', updateStickyNoteValidation, stickyNoteController.updateStickyNote);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid sticky note ID')
], stickyNoteController.deleteStickyNote);

router.patch('/:id/archive', [
  param('id').isMongoId().withMessage('Invalid sticky note ID')
], stickyNoteController.archiveStickyNote);

router.patch('/:id/restore', [
  param('id').isMongoId().withMessage('Invalid sticky note ID')
], stickyNoteController.restoreStickyNote);

module.exports = router;
