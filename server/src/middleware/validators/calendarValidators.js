const { body } = require('express-validator');

const freeBusyValidation = [
  body('timeMin').isISO8601().withMessage('timeMin must be an ISO8601 datetime'),
  body('timeMax').isISO8601().withMessage('timeMax must be an ISO8601 datetime'),
  body('calendarIds').optional().isArray().withMessage('calendarIds must be an array'),
  body('timezone').optional().isString().isLength({ max: 100 })
];

const scheduleValidation = [
  body('title').optional().isString().isLength({ max: 200 }),
  body('summary').optional().isString().isLength({ max: 200 }),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('colorId').optional().isInt({ min: 1, max: 11 }).withMessage('colorId must be an integer between 1 and 11'),
  body('durationMinutes').isInt({ min: 5, max: 8 * 60 }).withMessage('durationMinutes must be between 5 and 480'),
  body('timeMin').isISO8601().withMessage('timeMin must be an ISO8601 datetime'),
  body('timeMax').isISO8601().withMessage('timeMax must be an ISO8601 datetime'),
  body('timezone').optional().isString().isLength({ max: 100 }),
  body('conflictStrategy')
    .optional()
    .isIn(['auto', 'split', 'shorten', 'next-window'])
    .withMessage('conflictStrategy must be one of: auto, split, shorten, next-window'),
  body('minSessionMinutes').optional().isInt({ min: 5, max: 240 }),
  body('maxSplitParts').optional().isInt({ min: 1, max: 24 }),
  body('allowLightPractice').optional().isBoolean(),
  body('searchDays').optional().isInt({ min: 0, max: 60 }),
  body('calendarId').optional().isString().isLength({ max: 256 }),
  body('createEvents').optional().isBoolean(),
  body('dashpointType').optional().isString().isLength({ max: 50 }),
  body('dashpointColor').optional().isString().isLength({ max: 30 })
];

module.exports = {
  freeBusyValidation,
  scheduleValidation
};
