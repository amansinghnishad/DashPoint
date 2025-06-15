const mongoose = require('mongoose');

const contentExtractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid HTTP/HTTPS URL']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters'],
    default: ''
  },
  content: {
    type: String,
    trim: true,
    maxlength: [50000, 'Content cannot exceed 50000 characters'],
    default: ''
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  images: [{
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
    }
  }],
  links: [{
    href: {
      type: String,
      required: true
    },
    text: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['internal', 'external', 'email', 'tel'],
      default: 'external'
    }
  }],
  metadata: {
    author: {
      type: String,
      default: ''
    },
    publishDate: {
      type: Date,
      default: null
    },
    keywords: [{
      type: String,
      trim: true
    }],
    language: {
      type: String,
      default: 'en'
    },
    wordCount: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number, // in minutes
      default: 0
    },
    socialTags: {
      ogTitle: {
        type: String,
        default: ''
      },
      ogDescription: {
        type: String,
        default: ''
      },
      ogImage: {
        type: String,
        default: ''
      },
      twitterTitle: {
        type: String,
        default: ''
      },
      twitterDescription: {
        type: String,
        default: ''
      },
      twitterImage: {
        type: String,
        default: ''
      }
    }
  },
  extractionOptions: {
    extractImages: {
      type: Boolean,
      default: false
    },
    extractLinks: {
      type: Boolean,
      default: false
    },
    maxContentLength: {
      type: Number,
      default: 10000,
      min: 100,
      max: 50000
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
    index: true
  },
  error: {
    type: String,
    default: null
  },
  extractionTime: {
    type: Number, // in milliseconds
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  },
  favorite: {
    type: Boolean,
    default: false,
    index: true
  },
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
contentExtractionSchema.index({ userId: 1, createdAt: -1 });
contentExtractionSchema.index({ userId: 1, domain: 1 });
contentExtractionSchema.index({ userId: 1, favorite: 1 });
contentExtractionSchema.index({ userId: 1, archived: 1 });
contentExtractionSchema.index({ userId: 1, status: 1 });
contentExtractionSchema.index({ userId: 1, tags: 1 });
contentExtractionSchema.index({ url: 1, userId: 1 }); // For checking duplicates

// Text index for search
contentExtractionSchema.index({
  title: 'text',
  content: 'text',
  description: 'text',
  url: 'text',
  domain: 'text',
  tags: 'text',
  notes: 'text'
});

// Pre-save middleware
contentExtractionSchema.pre('save', function (next) {
  // Extract domain from URL
  if (this.isModified('url')) {
    try {
      const urlObj = new URL(this.url);
      this.domain = urlObj.hostname.replace('www.', '');
    } catch (error) {
      // If URL is invalid, keep domain empty
      this.domain = '';
    }
  }

  // Calculate word count and reading time
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).filter(word => word.length > 0);
    this.metadata.wordCount = words.length;
    this.metadata.readingTime = Math.ceil(words.length / 200); // Average reading speed
  }

  // Set archivedAt when archived changes
  if (this.isModified('archived')) {
    if (this.archived && !this.archivedAt) {
      this.archivedAt = new Date();
    } else if (!this.archived) {
      this.archivedAt = null;
    }
  }

  next();
});

// Virtual for content preview
contentExtractionSchema.virtual('contentPreview').get(function () {
  if (!this.content) return '';
  const maxLength = 200;
  return this.content.length > maxLength
    ? this.content.substring(0, maxLength) + '...'
    : this.content;
});

// Virtual for extraction age
contentExtractionSchema.virtual('extractionAge').get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
});

// Method to toggle favorite
contentExtractionSchema.methods.toggleFavorite = function () {
  this.favorite = !this.favorite;
  return this.save();
};

// Method to toggle archive
contentExtractionSchema.methods.toggleArchive = function () {
  this.archived = !this.archived;
  this.archivedAt = this.archived ? new Date() : null;
  return this.save();
};

// Method to add tag
contentExtractionSchema.methods.addTag = function (tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
contentExtractionSchema.methods.removeTag = function (tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to find by domain
contentExtractionSchema.statics.findByDomain = function (userId, domain, options = {}) {
  const { limit = 20, skip = 0 } = options;

  return this.find({
    userId,
    domain: new RegExp(domain, 'i'),
    archived: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find recent extractions
contentExtractionSchema.statics.findRecent = function (userId, days = 7, options = {}) {
  const { limit = 20, skip = 0 } = options;
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);

  return this.find({
    userId,
    createdAt: { $gte: pastDate },
    archived: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get domain statistics
contentExtractionSchema.statics.getDomainStats = function (userId) {
  return this.aggregate([
    { $match: { userId: userId, archived: false } },
    {
      $group: {
        _id: '$domain',
        count: { $sum: 1 },
        lastExtraction: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

// Static method to search content
contentExtractionSchema.statics.searchContent = function (userId, query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    domain = null,
    dateFrom = null,
    dateTo = null,
    favorite = null,
    archived = false
  } = options;

  let searchFilter = {
    userId,
    archived,
    $text: { $search: query }
  };

  if (domain) {
    searchFilter.domain = new RegExp(domain, 'i');
  }

  if (dateFrom || dateTo) {
    searchFilter.createdAt = {};
    if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo);
  }

  if (favorite !== null) {
    searchFilter.favorite = favorite;
  }

  return this.find(searchFilter)
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('ContentExtraction', contentExtractionSchema);
