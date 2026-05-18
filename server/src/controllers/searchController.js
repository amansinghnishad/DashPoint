const { validationResult } = require('express-validator');

const { searchAll } = require('../services/universalSearchService');

exports.searchAll = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const result = await searchAll({
      userId: req.user._id,
      query: req.query.q,
      limit: req.query.limit
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
};
