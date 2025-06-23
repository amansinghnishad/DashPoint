const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const {
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoDetails,
  searchVideos,
  getChannelDetails,
  getVideoDetailsWithSummary,
  createVideoWithSummary
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

// Enhanced video details with AI summarization
router.get('/video-enhanced/:videoId',
  auth,
  [
    param('videoId').notEmpty().withMessage('Video ID is required'),
    query('generateSummary').optional().isBoolean().withMessage('generateSummary must be boolean'),
    query('summaryLength').optional().isString().withMessage('summaryLength must be string')
  ],
  getVideoDetailsWithSummary
);

// Enhanced video creation with AI summarization
router.post('/videos-enhanced', [
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
  body('isFavorite').optional().isBoolean(),
  body('generateSummary').optional().isBoolean().withMessage('generateSummary must be boolean'),
  body('summaryLength').optional().isString().withMessage('summaryLength must be string')
], createVideoWithSummary);

// Intelligent YouTube video processing using AI agent
router.post('/process-ai', [
  auth,
  body('youtube_url')
    .notEmpty()
    .withMessage('YouTube URL is required')
    .custom(value => {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
      if (!youtubeRegex.test(value)) {
        throw new Error('Invalid YouTube URL format');
      }
      return true;
    }),
  body('analysisType')
    .optional()
    .isIn(['summarize', 'analyze', 'transcribe', 'keywords', 'topics'])
    .withMessage('analysisType must be one of: summarize, analyze, transcribe, keywords, topics'),
  body('summaryLength')
    .optional()
    .isString()
    .withMessage('summaryLength must be string')
], async (req, res, next) => {
  try {
    const { youtube_url, analysisType = 'summarize', summaryLength = 'medium' } = req.body;

    // Use the new agent for intelligent YouTube processing
    let prompt;
    switch (analysisType.toLowerCase()) {
      case 'summarize':
        prompt = `Please provide a comprehensive summary of this YouTube video: ${youtube_url}`;
        break;
      case 'analyze':
        prompt = `Please analyze this YouTube video and provide detailed insights, key points, and summary: ${youtube_url}`;
        break;
      case 'transcribe':
        prompt = `Please extract and format the transcript from this YouTube video: ${youtube_url}`;
        break;
      case 'keywords':
        prompt = `Extract the most important keywords and topics from this YouTube video: ${youtube_url}`;
        break;
      case 'topics':
        prompt = `Identify the main topics and themes discussed in this YouTube video: ${youtube_url}`;
        break;
      default:
        prompt = `Please analyze and summarize this YouTube video: ${youtube_url}`;
    }

    const agentResponse = await axios.post(`${process.env.DASHPOINT_AI_AGENT_URL}/chat`, {
      prompt: prompt,
      context: `Analysis type: ${analysisType}. Summary length: ${summaryLength}. Video URL: ${youtube_url}`
    }, {
      timeout: 180000, // 3 minutes for video processing
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract results from agent response
    let processedResults = null;
    if (agentResponse.data && agentResponse.data.results) {
      processedResults = agentResponse.data.results;
    }

    res.status(200).json({
      success: true,
      message: 'YouTube video processed successfully',
      data: {
        videoUrl: youtube_url,
        analysisType,
        summaryLength,
        results: processedResults,
        agentVersion: "2.0.0",
        processedAt: new Date()
      }
    });

  } catch (error) {
    console.error('YouTube AI processing error:', error);

    // Fallback to direct YouTube summarization
    try {
      const fallbackResponse = await axios.post(`${process.env.DASHPOINT_AI_AGENT_URL}/summarize-youtube`, {
        youtube_url: req.body.youtube_url,
        summary_length: req.body.summaryLength
      }, {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      res.status(200).json({
        success: true,
        message: 'YouTube video processed successfully (fallback)',
        data: {
          videoUrl: req.body.youtube_url,
          analysisType: req.body.analysisType,
          summaryLength: req.body.summaryLength,
          results: [{ type: 'text', content: fallbackResponse.data.summary }],
          agentVersion: "2.0.0-fallback",
          processedAt: new Date()
        }
      });
    } catch (fallbackError) {
      next(new Error(`Both agent and fallback processing failed: ${error.message}`));
    }
  }
});

module.exports = router;
