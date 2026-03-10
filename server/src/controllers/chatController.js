const { validationResult } = require('express-validator');

const { runChat } = require('../services/chatService');
const { sanitizeChatInput } = require('../utils/agentInputSanitizer');

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
    const sanitizedInput = sanitizeChatInput(req.body || {});

    if (!sanitizedInput.message) {
      return res.status(400).json({
        success: false,
        message: 'message must include readable text'
      });
    }

    const result = await runChat({
      userId,
      ...sanitizedInput
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
