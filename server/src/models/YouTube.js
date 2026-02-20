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
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  embedding: {
    type: [Number], default: undefined
  },
  embeddingModel: {
    type: String, default: "text-embedding-3-small"
  },
  embeddingUpdatedAt: {
    type: Date, default: null
  },
  transcriptStatus: {
    type: String,
    enum: ['not-indexed', 'indexed', 'unavailable', 'failed'],
    default: 'not-indexed',
    index: true
  },
  transcriptLanguage: {
    type: String,
    default: ''
  },
  transcriptText: {
    type: String,
    default: '',
    maxlength: 200000
  },
  transcriptChunkCount: {
    type: Number,
    default: 0
  },
  transcriptIndexedAt: {
    type: Date,
    default: null
  },
  transcriptError: {
    type: String,
    default: null,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Compound index for user and videoId to prevent duplicates
youtubeSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Index for searching
youtubeSchema.index({ userId: 1, title: 'text', channelTitle: 'text', description: 'text' });

module.exports = mongoose.model('YouTube', youtubeSchema);
