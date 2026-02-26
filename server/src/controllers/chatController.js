const { validationResult } = require('express-validator');

const { runChat } = require('../services/chatService');

exports.chat = async (req, res, next) => {
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
      message,
      provider = 'auto',
      model = 'auto',
      topK = 3,
      collectionIds = []
    } = req.body;

    const result = await runChat({
      userId,
      message: String(message),
      provider,
      model,
      topK,
      collectionIds: Array.isArray(collectionIds)
        ? collectionIds.map((id) => String(id))
        : []
    });

    return res.status(200).json({
      success: true,
      data: {
        response: result.response,
        provider: result.provider,
        model: result.model,
        mutations: result.mutations,
        retrieval: result.retrieval
      }
    });
  } catch (error) {
    return next(error);
  }
};
