const express = require('express');
const { body, param, query } = require('express-validator');

const auth = require('../middleware/auth');
const plannerWidgetController = require('../controllers/plannerWidgetController');
const { PLANNER_WIDGET_TYPES } = require('../models/PlannerWidget');

const router = express.Router();

router.use(auth);

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

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('limit must be between 1 and 200'),
    query('widgetType')
      .optional()
      .isIn(PLANNER_WIDGET_TYPES)
      .withMessage(`widgetType must be one of: ${PLANNER_WIDGET_TYPES.join(', ')}`)
  ],
  plannerWidgetController.getAllPlannerWidgets
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid planner widget id')],
  plannerWidgetController.getPlannerWidgetById
);

router.post('/', createValidation, plannerWidgetController.createPlannerWidget);
router.put('/:id', updateValidation, plannerWidgetController.updatePlannerWidget);
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid planner widget id')],
  plannerWidgetController.deletePlannerWidget
);

module.exports = router;
