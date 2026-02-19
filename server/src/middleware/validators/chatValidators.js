const { body } = require('express-validator');

const chatMessageValidation = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('message must be between 1 and 4000 characters')
];

module.exports = {
  chatMessageValidation
};
