const { body } = require('express-validator');

const chatMessageValidation = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('message must be between 1 and 4000 characters')
];

const actionItemExtractValidation = [
  body('rawText')
    .isString()
    .trim()
    .isLength({ min: 1, max: 25000 })
    .withMessage('rawText must be between 1 and 25000 characters'),
  body('maxItems')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('maxItems must be an integer between 1 and 20')
    .toInt(),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('title must be between 1 and 100 characters')
];

const actionItemApproveValidation = [
  body('approvedItems')
    .isArray({ min: 1, max: 100 })
    .withMessage('approvedItems must be an array with at least 1 item'),
  body('approvedItems.*.text')
    .isString()
    .trim()
    .isLength({ min: 1, max: 280 })
    .withMessage('each approved item text must be between 1 and 280 characters'),
  body('collectionId')
    .optional()
    .isString()
    .isMongoId()
    .withMessage('collectionId must be a valid MongoDB id'),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('title must be between 1 and 100 characters')
];

module.exports = {
  chatMessageValidation,
  actionItemExtractValidation,
  actionItemApproveValidation
};
