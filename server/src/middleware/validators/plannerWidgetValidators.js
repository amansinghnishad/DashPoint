const { body, param, query } = require('express-validator');
const { PLANNER_WIDGET_TYPES } = require('../../models/PlannerWidget');

const createValidation = [
  body('widgetType')
    .isIn(PLANNER_WIDGET_TYPES)
    .withMessage(`widgetType must be one of: ${PLANNER_WIDGET_TYPES.join(', ')}`),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('data').optional().isObject().withMessage('data must be an object')
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid planner widget id'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('data').optional().isObject().withMessage('data must be an object')
];

const listValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('limit must be between 1 and 200'),
  query('widgetType')
    .optional()
    .isIn(PLANNER_WIDGET_TYPES)
    .withMessage(`widgetType must be one of: ${PLANNER_WIDGET_TYPES.join(', ')}`)
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid planner widget id')
];

module.exports = {
  createValidation,
  updateValidation,
  listValidation,
  idValidation
};
