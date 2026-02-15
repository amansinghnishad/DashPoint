const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoDetails,
  searchVideos,
  getChannelDetails,
} = require('../controllers/youtubeController');
const auth = require('../middleware/auth');

const router = express.Router();

// Rate limiting for YouTube API calls (more restrictive due to quota limits)
const youtubeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 100, // Limit requests per windowMs
  message: {
    success: false,
    message: 'Too many YouTube API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all YouTube routes
router.use(youtubeRateLimit);

// CRUD routes for saved videos
// GET /api/youtube/videos - Get all saved videos
router.get('/videos', auth, getAllVideos);

// POST /api/youtube/videos - Save a new video
router.post('/videos', [
  auth,
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
], createVideo);

// PUT /api/youtube/videos/:id - Update a saved video
router.put('/videos/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid video ID'),
  body('title').optional().isLength({ max: 200 }),
  body('tags').optional().isArray(),
  body('category').optional().isString(),
  body('isFavorite').optional().isBoolean()
], updateVideo);

// DELETE /api/youtube/videos/:id - Delete a saved video
router.delete('/videos/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid video ID')
], deleteVideo);

// Get video details by ID
// GET /api/youtube/video/:videoId
router.get('/video/:videoId', auth, getVideoDetails);

// Search videos
// GET /api/youtube/search?q=query&maxResults=10&order=relevance
router.get('/search', auth, searchVideos);

// Get channel details
// GET /api/youtube/channel/:channelId
router.get('/channel/:channelId', auth, getChannelDetails);

module.exports = router;
