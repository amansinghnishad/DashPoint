const { body } = require('express-validator');
const { PLANNER_WIDGET_TYPES } = require('../../models/PlannerWidget');

const collectionCreateValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Collection name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  body('layouts')
    .optional()
    .custom((value) => {
      if (value === null) return true;
      return typeof value === 'object' && !Array.isArray(value);
    })
    .withMessage('layouts must be an object')
];

const collectionUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Collection name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  body('layouts')
    .optional()
    .custom((value) => {
      if (value === null) return true;
      return typeof value === 'object' && !Array.isArray(value);
    })
    .withMessage('layouts must be an object')
];

const addItemValidation = [
  body('itemType')
    .isIn(['youtube', 'file', 'planner'])
    .withMessage('Invalid item type'),
  body('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
];

const addPlannerWidgetValidation = [
  body('widgetType')
    .isIn(PLANNER_WIDGET_TYPES)
    .withMessage(`widgetType must be one of: ${PLANNER_WIDGET_TYPES.join(', ')}`),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('data must be an object')
];

module.exports = {
  collectionCreateValidation,
  collectionUpdateValidation,
  addItemValidation,
  addPlannerWidgetValidation
};
