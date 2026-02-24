const { body } = require('express-validator');

const CHAT_PROVIDER_VALUES = ['auto', 'openai', 'gemini'];

const chatMessageValidation = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('message must be between 1 and 4000 characters'),
  body('provider')
    .optional()
    .isString()
    .trim()
    .toLowerCase()
    .isIn(CHAT_PROVIDER_VALUES)
    .withMessage(`provider must be one of: ${CHAT_PROVIDER_VALUES.join(', ')}`),
  body('model')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('model must be between 1 and 100 characters'),
  body('topK')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('topK must be an integer between 1 and 8')
    .toInt(),
  body('collectionIds')
    .optional()
    .isArray({ max: 50 })
    .withMessage('collectionIds must be an array with at most 50 values'),
  body('collectionIds.*')
    .optional()
    .isString()
    .isMongoId()
    .withMessage('collectionIds values must be valid MongoDB ids')
];

module.exports = {
  chatMessageValidation
};
