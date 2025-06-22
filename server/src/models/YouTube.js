const mongoose = require('mongoose');

const youtubeSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  thumbnail: {
    type: String,
    required: true
  },
  embedUrl: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  duration: {
    type: String
  },
  channelTitle: {
    type: String,
    trim: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'general'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },  // AI summarization fields
  aiSummary: {
    type: String,
    maxlength: 5000 // Increased from 2000 to 5000 characters
  },
  summaryGenerated: {
    type: Boolean,
    default: false
  },
  summaryLength: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for user and videoId to prevent duplicates
youtubeSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Index for searching
youtubeSchema.index({ userId: 1, title: 'text', channelTitle: 'text', description: 'text' });

module.exports = mongoose.model('YouTube', youtubeSchema);
