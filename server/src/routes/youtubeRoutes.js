const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoDetails,
  searchVideos,
  getChannelDetails,
  reindexVideoTranscript,
  getTalkingToVideoContext,
} = require('../controllers/youtubeController');
const auth = require('../middleware/auth');
const {
  createVideoValidation,
  updateVideoValidation,
  deleteVideoValidation
} = require('../middleware/validators/youtubeValidators');

const router = express.Router();

// Rate limiting for YouTube API calls
const youtubeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 100,
  message: {
    success: false,
    message: 'Too many YouTube API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all YouTube routes
router.use(youtubeRateLimit);


// GET all saved videos
router.get('/videos', auth, getAllVideos);

// POST  Save a new video
router.post('/videos', [
  auth,
  ...createVideoValidation
], createVideo);

// PUT Update a saved video
router.put('/videos/:id', [
  auth,
  ...updateVideoValidation
], updateVideo);

// Re-index transcript/chunks for a saved video
router.post('/videos/:id/reindex-transcript', [
  auth,
  ...updateVideoValidation
], reindexVideoTranscript);

// Retrieve transcript chunks by semantic similarity for Talking to Video
router.post('/videos/:id/talk-context', [
  auth,
  ...updateVideoValidation
], getTalkingToVideoContext);

// DELETE  Delete a saved video
router.delete('/videos/:id', [
  auth,
  ...deleteVideoValidation
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
