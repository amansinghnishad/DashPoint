const express = require('express');
const { body, query, param } = require('express-validator');
const todoController = require('../controllers/todoController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const createTodoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
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

const updateTodoValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid todo ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
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
  query('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed filter must be a boolean'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority filter must be one of: low, medium, high'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category filter must be less than 50 characters'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags filter must be a string'),
  query('dueDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Due date from must be a valid ISO 8601 date'),
  query('dueDateTo')
    .optional()
    .isISO8601()
    .withMessage('Due date to must be a valid ISO 8601 date'),
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
  body('todoIds')
    .isArray({ min: 1 })
    .withMessage('Todo IDs must be a non-empty array'),
  body('todoIds.*')
    .isMongoId()
    .withMessage('Each todo ID must be a valid MongoDB ID'),
  body('operation')
    .isIn(['complete', 'incomplete', 'delete'])
    .withMessage('Operation must be one of: complete, incomplete, delete'),
  body('updateData')
    .optional()
    .isObject()
    .withMessage('Update data must be an object')
];

const overdueValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes
router.get('/', searchValidation, todoController.getTodos);
router.post('/', createTodoValidation, todoController.createTodo);
router.get('/stats', todoController.getTodoStats);
router.get('/search', searchValidation, todoController.searchTodos);
router.get('/overdue', overdueValidation, todoController.getOverdueTodos);
router.get('/upcoming', overdueValidation, todoController.getUpcomingTodos);
router.post('/bulk', bulkOperationValidation, todoController.bulkOperation);

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid todo ID')
], todoController.getTodoById);

router.put('/:id', updateTodoValidation, todoController.updateTodo);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid todo ID')
], todoController.deleteTodo);

router.patch('/:id/complete', [
  param('id').isMongoId().withMessage('Invalid todo ID')
], todoController.completeTodo);

router.patch('/:id/incomplete', [
  param('id').isMongoId().withMessage('Invalid todo ID')
], todoController.incompleteTodo);

module.exports = router;
