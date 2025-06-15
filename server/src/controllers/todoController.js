const { validationResult } = require('express-validator');
const Todo = require('../models/Todo');

// Get todos for user
exports.getTodos = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const {
      page = 1,
      limit = 50,
      completed,
      priority,
      category,
      dueDateFrom,
      dueDateTo
    } = req.query;

    // Build filter
    const filter = { userId };

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = new RegExp(category, 'i');
    }

    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
    }

    // Get todos with pagination
    const skip = (page - 1) * limit;
    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Todo.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: todos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new todo
exports.createTodo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const todoData = {
      ...req.body,
      userId
    };

    const todo = new Todo(todoData);
    await todo.save();

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// Get todo statistics
exports.getTodoStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Todo.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          pending: { $sum: { $cond: ['$completed', 0, 1] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    const overdue = await Todo.countDocuments({
      userId,
      dueDate: { $lt: new Date() },
      completed: false
    });

    const dueToday = await Todo.countDocuments({
      userId,
      dueDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      },
      completed: false
    });

    const result = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    res.status(200).json({
      success: true,
      data: {
        ...result,
        overdue,
        dueToday
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search todos
exports.searchTodos = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const {
      q,
      page = 1,
      limit = 20,
      completed,
      priority,
      category,
      tags
    } = req.query;

    // Build search filter
    const filter = { userId };

    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = new RegExp(category, 'i');
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Get todos with pagination
    const skip = (page - 1) * limit;
    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Todo.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: todos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get todo by ID
exports.getTodoById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const todo = await Todo.findOne({ _id: id, userId });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// Update todo
exports.updateTodo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// Delete todo
exports.deleteTodo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const todo = await Todo.findOneAndDelete({ _id: id, userId });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Complete todo
exports.completeTodo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      {
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Todo marked as completed',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// Mark todo as incomplete
exports.incompleteTodo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      {
        completed: false,
        completedAt: null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Todo marked as incomplete',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// Get overdue todos
exports.getOverdueTodos = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const filter = {
      userId,
      dueDate: { $lt: new Date() },
      completed: false
    };

    const skip = (page - 1) * limit;
    const todos = await Todo.find(filter)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Todo.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: todos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming todos
exports.getUpcomingTodos = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const filter = {
      userId,
      dueDate: { $gte: new Date() },
      completed: false
    };

    const skip = (page - 1) * limit;
    const todos = await Todo.find(filter)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Todo.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: todos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Bulk operations
exports.bulkOperation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { todoIds, operation, updateData } = req.body;
    const userId = req.user._id;

    let result;
    let message;

    switch (operation) {
      case 'complete':
        result = await Todo.updateMany(
          { _id: { $in: todoIds }, userId },
          {
            completed: true,
            completedAt: new Date(),
            updatedAt: new Date()
          }
        );
        message = `${result.modifiedCount} todos marked as completed`;
        break;

      case 'incomplete':
        result = await Todo.updateMany(
          { _id: { $in: todoIds }, userId },
          {
            completed: false,
            completedAt: null,
            updatedAt: new Date()
          }
        );
        message = `${result.modifiedCount} todos marked as incomplete`;
        break;

      case 'delete':
        result = await Todo.deleteMany(
          { _id: { $in: todoIds }, userId }
        );
        message = `${result.deletedCount} todos deleted`;
        break;

      case 'update':
        if (!updateData) {
          return res.status(400).json({
            success: false,
            message: 'Update data is required for update operation'
          });
        }
        result = await Todo.updateMany(
          { _id: { $in: todoIds }, userId },
          { ...updateData, updatedAt: new Date() }
        );
        message = `${result.modifiedCount} todos updated`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        operation,
        affectedCount: result.modifiedCount || result.deletedCount,
        todoIds
      }
    });
  } catch (error) {
    next(error);
  }
};
