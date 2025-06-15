const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000
  },
  wordCount: {
    type: Number,
    default: 0
  },
  domain: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'news', 'blog', 'documentation', 'article', 'research', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  summary: {
    type: String,
    maxlength: 1000
  },
  author: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date
  },
  language: {
    type: String,
    default: 'en'
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
  }
}, {
  timestamps: true
});

// Compound index for user and url to prevent duplicates
contentSchema.index({ userId: 1, url: 1 }, { unique: true });

// Index for searching
contentSchema.index({ userId: 1, title: 'text', content: 'text', tags: 'text' });

// Index for filtering by domain and category
contentSchema.index({ userId: 1, domain: 1, category: 1 });

module.exports = mongoose.model('Content', contentSchema);
