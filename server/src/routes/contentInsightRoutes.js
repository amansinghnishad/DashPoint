const express = require('express');
const { body, param } = require('express-validator');

const auth = require('../middleware/auth');
const contentInsightController = require('../controllers/contentInsightController');

const router = express.Router();

router.use(auth);

const insightIdValidation = [
  param('id').isMongoId().withMessage('id must be a valid insight id')
];

router.post(
  '/:id/accept',
  [
    ...insightIdValidation,
    body('taskIds')
      .optional()
      .isArray({ max: 100 })
      .withMessage('taskIds must be an array with at most 100 values'),
    body('taskIds.*')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('taskIds values must be strings'),
    body('collectionId')
      .optional()
      .isMongoId()
      .withMessage('collectionId must be a valid MongoDB id'),
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('title must be between 1 and 100 characters')
  ],
  contentInsightController.acceptInsight
);

router.post(
  '/:id/reject',
  insightIdValidation,
  contentInsightController.rejectInsight
);

module.exports = router;
