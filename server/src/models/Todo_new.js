const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium',
    index: true
  },
  dueDate: {
    type: Date,
    default: null,
    index: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'general',
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Subtask title cannot exceed 100 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: null
    },
    notified: {
      type: Boolean,
      default: false
    }
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: null
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    endDate: {
      type: Date,
      default: null
    }
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
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, completed: 1 });
todoSchema.index({ userId: 1, dueDate: 1 });
todoSchema.index({ userId: 1, priority: 1 });
todoSchema.index({ userId: 1, category: 1 });
todoSchema.index({ userId: 1, tags: 1 });
todoSchema.index({ userId: 1, archived: 1 });
todoSchema.index({ dueDate: 1, completed: 1 }); // For overdue/upcoming queries

// Text index for search
todoSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

// Compound indexes for common queries
todoSchema.index({ userId: 1, completed: 1, dueDate: 1 });
todoSchema.index({ userId: 1, priority: 1, completed: 1 });

// Pre-save middleware
todoSchema.pre('save', function (next) {
  // Set completedAt when completed changes
  if (this.isModified('completed')) {
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.completed) {
      this.completedAt = null;
    }
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

// Virtual for progress percentage based on subtasks
todoSchema.virtual('progress').get(function () {
  if (this.subtasks.length === 0) {
    return this.completed ? 100 : 0;
  }

  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for overdue status
todoSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

// Virtual for due today status
todoSchema.virtual('isDueToday').get(function () {
  if (!this.dueDate) return false;

  const today = new Date();
  const dueDate = new Date(this.dueDate);

  return today.toDateString() === dueDate.toDateString();
});

// Method to toggle completion
todoSchema.methods.toggleCompleted = function () {
  this.completed = !this.completed;
  this.completedAt = this.completed ? new Date() : null;
  return this.save();
};

// Method to add subtask
todoSchema.methods.addSubtask = function (title) {
  this.subtasks.push({ title });
  return this.save();
};

// Method to complete subtask
todoSchema.methods.completeSubtask = function (subtaskId) {
  const subtask = this.subtasks.id(subtaskId);
  if (subtask) {
    subtask.completed = true;
    subtask.completedAt = new Date();
  }
  return this.save();
};

// Method to add tag
todoSchema.methods.addTag = function (tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
todoSchema.methods.removeTag = function (tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to find overdue todos
todoSchema.statics.findOverdue = function (userId, options = {}) {
  const { limit = 20, skip = 0 } = options;

  return this.find({
    userId,
    dueDate: { $lt: new Date() },
    completed: false,
    archived: false
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find upcoming todos
todoSchema.statics.findUpcoming = function (userId, days = 7, options = {}) {
  const { limit = 20, skip = 0 } = options;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    userId,
    dueDate: {
      $gte: new Date(),
      $lte: futureDate
    },
    completed: false,
    archived: false
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get user statistics
todoSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    { $match: { userId: userId, archived: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } },
        pending: { $sum: { $cond: ['$completed', 0, 1] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $eq: ['$completed', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Todo', todoSchema);
