const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [100, 'Collection name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  icon: {
    type: String,
    default: 'Folder',
    maxlength: [50, 'Icon name cannot exceed 50 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    itemType: {
      type: String,
      required: true,
      enum: ['youtube', 'content', 'file', 'planner']
    },
    itemId: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  // Stores widget layout(s) for the collection canvas.
  // Expected shape (client-owned): { version: 2, breakpoints: { xs|sm|md|lg: { items: { [itemKey]: {x,y,width,height} }, meta?: {...} } } }
  // Kept flexible to allow future iterations without migrations.
  layouts: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Index for user collections
collectionSchema.index({ userId: 1, createdAt: -1 });
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

// Virtual for item count
collectionSchema.virtual('itemCount').get(function () {
  return this.items.length;
});

// Method to add item to collection
collectionSchema.methods.addItem = function (itemType, itemId) {
  // Check if item already exists
  const existingItem = this.items.find(
    item => item.itemType === itemType && item.itemId === itemId
  );

  if (!existingItem) {
    this.items.push({ itemType, itemId });
  }

  return this.save();
};

// Method to remove item from collection
collectionSchema.methods.removeItem = function (itemType, itemId) {
  this.items = this.items.filter(
    item => !(item.itemType === itemType && item.itemId === itemId)
  );

  return this.save();
};

module.exports = mongoose.model('Collection', collectionSchema);
