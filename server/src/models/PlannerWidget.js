const mongoose = require('mongoose');

const PLANNER_WIDGET_TYPES = [
  'top-priorities',
  'todo-list',
  'appointments',
  'daily-schedule',
  'goals',
  'notes',
  'meal-planner',
  'water-tracker',
  'calls-emails',
  'expense-tracker',
  'notes-tomorrow',
  'rate-your-day'
];

const plannerWidgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    widgetType: {
      type: String,
      required: true,
      enum: PLANNER_WIDGET_TYPES,
      index: true
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: ''
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

plannerWidgetSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PlannerWidget', plannerWidgetSchema);
module.exports.PLANNER_WIDGET_TYPES = PLANNER_WIDGET_TYPES;
