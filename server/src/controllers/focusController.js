const { getFocusSummary } = require('../services/focusService');

exports.getFocusSummary = async (req, res, next) => {
  try {
    const summary = await getFocusSummary({
      userId: req.user._id
    });

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    return next(error);
  }
};
