const axios = require('axios');
const { validationResult } = require('express-validator');
const YouTube = require('../models/YouTube');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// CRUD Operations for saved YouTube videos
// Get all saved videos for the authenticated user
exports.getAllVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const videos = await YouTube.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalVideos = await YouTube.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalVideos / limit);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page,
        limit,
        totalVideos,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new saved video
exports.createVideo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const videoData = {
      ...req.body,
      userId: req.user._id
    };

    const video = new YouTube(videoData);
    await video.save();

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video saved successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This video is already saved'
      });
    }
    next(error);
  }
};

// Update a saved video
exports.updateVideo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const video = await YouTube.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video,
      message: 'Video updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete a saved video
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await YouTube.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get video details by ID
exports.getVideoDetails = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const video = response.data.items[0];

    // Parse duration from ISO 8601 format (PT4M13S) to readable format
    const duration = parseDuration(video.contentDetails.duration);

    const videoData = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: {
        default: video.snippet.thumbnails.default?.url,
        medium: video.snippet.thumbnails.medium?.url,
        high: video.snippet.thumbnails.high?.url,
        standard: video.snippet.thumbnails.standard?.url,
        maxres: video.snippet.thumbnails.maxres?.url
      },
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      duration: duration,
      viewCount: parseInt(video.statistics.viewCount || 0),
      likeCount: parseInt(video.statistics.likeCount || 0),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: `https://www.youtube.com/embed/${video.id}`
    };

    res.status(200).json({
      success: true,
      data: videoData
    });
  } catch (error) {
    console.error('YouTube API error:', error.response?.data || error.message);
    next(error);
  }
};

// Search videos
exports.searchVideos = async (req, res, next) => {
  try {
    const {
      q: query,
      maxResults = 10,
      order = 'relevance',
      type = 'video'
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: type,
        maxResults: Math.min(maxResults, 50), // Limit to 50 max
        order: order,
        key: YOUTUBE_API_KEY
      }
    });

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: {
        default: item.snippet.thumbnails.default?.url,
        medium: item.snippet.thumbnails.medium?.url,
        high: item.snippet.thumbnails.high?.url
      },
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
    }));

    res.status(200).json({
      success: true,
      data: {
        videos,
        totalResults: response.data.pageInfo?.totalResults || 0,
        nextPageToken: response.data.nextPageToken
      }
    });
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    next(error);
  }
};

// Get channel details
exports.getChannelDetails = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: 'Channel ID is required'
      });
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: YOUTUBE_API_KEY
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const channel = response.data.items[0];

    const channelData = {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: {
        default: channel.snippet.thumbnails.default?.url,
        medium: channel.snippet.thumbnails.medium?.url,
        high: channel.snippet.thumbnails.high?.url
      },
      subscriberCount: parseInt(channel.statistics.subscriberCount || 0),
      videoCount: parseInt(channel.statistics.videoCount || 0),
      viewCount: parseInt(channel.statistics.viewCount || 0),
      publishedAt: channel.snippet.publishedAt
    };

    res.status(200).json({
      success: true,
      data: channelData
    });
  } catch (error) {
    console.error('YouTube channel error:', error.response?.data || error.message);
    next(error);
  }
};

// Helper function to parse YouTube duration format (PT4M13S) to readable format
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (match[1] ? parseInt(match[1]) : 0);
  const minutes = (match[2] ? parseInt(match[2]) : 0);
  const seconds = (match[3] ? parseInt(match[3]) : 0);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};
