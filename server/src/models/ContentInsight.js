const mongoose = require('mongoose');

const contentInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sourceType: {
      type: String,
      enum: ['file', 'youtube'],
      required: true,
      index: true
    },
    sourceId: {
      type: String,
      required: true,
      index: true
    },
    sourceLabel: {
      type: String,
      trim: true,
      maxlength: 240,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ''
    },
    keyPoints: [{
      type: String,
      trim: true,
      maxlength: 280
    }],
    tasks: [{
      text: {
        type: String,
        trim: true,
        maxlength: 280
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      reason: {
        type: String,
        trim: true,
        maxlength: 180,
        default: ''
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null
      }
    }],
    deadlines: [{
      text: {
        type: String,
        trim: true,
        maxlength: 220
      },
      date: {
        type: String,
        trim: true,
        maxlength: 40,
        default: ''
      },
      context: {
        type: String,
        trim: true,
        maxlength: 280,
        default: ''
      }
    }],
    entities: [{
      name: {
        type: String,
        trim: true,
        maxlength: 120
      },
      type: {
        type: String,
        trim: true,
        maxlength: 40,
        default: 'entity'
      }
    }],
    extractor: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    model: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ''
    },
    warning: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    acceptedWidgetId: {
      type: String,
      default: ''
    },
    acceptedCollectionId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

contentInsightSchema.index({ userId: 1, sourceType: 1, sourceId: 1, status: 1 });
contentInsightSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('ContentInsight', contentInsightSchema);
