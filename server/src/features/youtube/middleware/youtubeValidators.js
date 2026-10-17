const { body, param } = require('express-validator');

const createVideoValidation = [
  body('videoId').notEmpty().withMessage('Video ID is required'),
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('thumbnail').notEmpty().withMessage('Thumbnail URL is required'),
  body('embedUrl').notEmpty().withMessage('Embed URL is required'),
  body('url').notEmpty().withMessage('URL is required'),
  body('channelTitle').optional().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 1000 }),
  body('tags').optional().isArray(),
  body('category').optional().isString(),
  body('isFavorite').optional().isBoolean()
];

const updateVideoValidation = [
  param('id').isMongoId().withMessage('Invalid video ID'),
  body('title').optional().isLength({ max: 200 }),
  body('tags').optional().isArray(),
  body('category').optional().isString(),
  body('isFavorite').optional().isBoolean()
];

const deleteVideoValidation = [
  param('id').isMongoId().withMessage('Invalid video ID')
];

module.exports = {
  createVideoValidation,
  updateVideoValidation,
  deleteVideoValidation
};
