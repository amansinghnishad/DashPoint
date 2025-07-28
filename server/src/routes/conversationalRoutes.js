const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { conversationalLimiter } = require('../middleware/rateLimit');
const conversationalController = require('../controllers/conversationalController');

const router = express.Router();

/**
 * @route   POST /api/conversational/command
 * @desc    Process a natural language command
 * @access  Private
 * @body    { command: string, context?: object }
 */
router.post('/command',
  conversationalLimiter,
  auth,
  [
    body('command')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Command must be between 1 and 2000 characters'),
    body('context')
      .optional()
      .isObject()
      .withMessage('Context must be an object')
  ],
  conversationalController.processCommand
);

/**
 * @route   GET /api/conversational/health
 * @desc    Check if the conversational agent is healthy
 * @access  Private
 */
router.get('/health',
  auth,
  conversationalController.checkAgentHealth
);

/**
 * @route   GET /api/conversational/capabilities
 * @desc    Get list of supported conversational commands and patterns
 * @access  Private
 */
router.get('/capabilities',
  auth,
  conversationalController.getCapabilities
);

module.exports = router;
