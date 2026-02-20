const mongoose = require('mongoose');

const youtubeTranscriptChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    youtubeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'YouTube',
      required: true,
      index: true
    },
    videoId: {
      type: String,
      required: true,
      index: true
    },
    chunkIndex: {
      type: Number,
      required: true
    },
    startSec: {
      type: Number,
      required: true,
      default: 0
    },
    durationSec: {
      type: Number,
      required: true,
      default: 0
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000
    },
    embedding: {
      type: [Number],
      default: undefined
    },
    embeddingModel: {
      type: String,
      default: 'text-embedding-3-small'
    },
    embeddingUpdatedAt: {
      type: Date,
      default: null
    },
    sourceLanguage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

youtubeTranscriptChunkSchema.index({ userId: 1, youtubeId: 1, chunkIndex: 1 }, { unique: true });
youtubeTranscriptChunkSchema.index({ userId: 1, youtubeId: 1, createdAt: -1 });

module.exports = mongoose.model('YouTubeTranscriptChunk', youtubeTranscriptChunkSchema);
