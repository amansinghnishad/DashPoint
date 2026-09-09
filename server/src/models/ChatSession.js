const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: 120
    },
    provider: {
      type: String,
      default: 'auto',
      trim: true
    },
    model: {
      type: String,
      default: 'auto',
      trim: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });
chatSessionSchema.index({ userId: 1, isArchived: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
