const { validationResult } = require('express-validator');

const {
  acceptContentInsight,
  rejectContentInsight
} = require('../services/contentInsightService');

exports.acceptInsight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const result = await acceptContentInsight({
      userId: req.user._id,
      insightId: req.params.id,
      taskIds: req.body?.taskIds,
      collectionId: req.body?.collectionId,
      title: req.body?.title
    });

    return res.status(200).json({
      success: true,
      message: result.acceptedCount
        ? 'Action items saved'
        : 'Insight accepted without action items',
      data: result
    });
  } catch (error) {
    if (error.message === 'Insight not found' || error.message === 'Collection not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return next(error);
  }
};

exports.rejectInsight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const result = await rejectContentInsight({
      userId: req.user._id,
      insightId: req.params.id
    });

    return res.status(200).json({
      success: true,
      message: 'Insight dismissed',
      data: result
    });
  } catch (error) {
    if (error.message === 'Insight not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return next(error);
  }
};
