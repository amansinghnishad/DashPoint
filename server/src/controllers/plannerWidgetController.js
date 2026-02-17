const { validationResult } = require('express-validator');
const PlannerWidget = require('../models/PlannerWidget');

// Get all planner widgets for the authenticated user
exports.getAllPlannerWidgets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (req.query.widgetType) {
      query.widgetType = String(req.query.widgetType);
    }

    const widgets = await PlannerWidget.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PlannerWidget.countDocuments(query);

    res.json({
      success: true,
      data: widgets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a planner widget by id
exports.getPlannerWidgetById = async (req, res, next) => {
  try {
    const widget = await PlannerWidget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Planner widget not found'
      });
    }

    res.json({
      success: true,
      data: widget
    });
  } catch (error) {
    next(error);
  }
};

// Create a planner widget
exports.createPlannerWidget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const widget = new PlannerWidget({
      userId: req.user._id,
      widgetType: req.body.widgetType,
      title: req.body.title || '',
      data: req.body.data || {}
    });

    await widget.save();

    res.status(201).json({
      success: true,
      data: widget,
      message: 'Planner widget created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update a planner widget
exports.updatePlannerWidget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const widget = await PlannerWidget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(req.body.title !== undefined ? { title: req.body.title } : null),
        ...(req.body.data !== undefined ? { data: req.body.data } : null)
      },
      { new: true, runValidators: true }
    );

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Planner widget not found'
      });
    }

    res.json({
      success: true,
      data: widget,
      message: 'Planner widget updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete a planner widget
exports.deletePlannerWidget = async (req, res, next) => {
  try {
    const widget = await PlannerWidget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Planner widget not found'
      });
    }

    res.json({
      success: true,
      message: 'Planner widget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
