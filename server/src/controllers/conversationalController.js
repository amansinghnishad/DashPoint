const axios = require('axios');
const { validationResult } = require('express-validator');
const Collection = require('../models/Collection');

const UNIVERSAL_AI_AGENT_URL = process.env.UNIVERSAL_AI_AGENT_URL || 'http://localhost:8000';

// Note: We do not call controllers directly from conversational execution.
// We execute an allowlisted set of internal HTTP calls so that auth, middleware,
// and express-validator rules run consistently.

/**
 * Conversational Command Controller
 * Processes natural language commands and executes appropriate actions
 */

// Process conversational command
exports.processCommand = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { command, context = {} } = req.body;
    const userId = req.user._id;

    // Provide lightweight collection context to the agent so it can resolve
    // collection names to ids for user-scoped actions.
    let userCollections = [];
    try {
      userCollections = await Collection.find({ userId })
        .select('_id name')
        .sort({ createdAt: -1 })
        .lean();
    } catch (collectionLookupError) {
      // Non-fatal: agent can still respond without collection context.
      console.warn('Failed to load collections for conversational context:', collectionLookupError.message);
      userCollections = [];
    }

    // Add user context
    const userContext = {
      ...context,
      userId: userId,
      user: req.user,
      collections: userCollections.map((c) => ({
        id: String(c._id),
        name: c.name,
      }))
    };

    try {
      // Send command to conversational agent
      const agentResponse = await axios.post(`${UNIVERSAL_AI_AGENT_URL}/conversational`, {
        command: command,
        context: userContext
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const agentResult = agentResponse.data;

      if (!agentResult.success) {
        return res.status(400).json({
          success: false,
          message: agentResult.message || 'Command could not be processed',
          action: agentResult.action
        });
      }

      // If the agent provides an API call to execute, execute it
      if (agentResult.api_call) {
        try {
          const executionResult = await executeApiCall(agentResult.api_call, req, res, next);

          return res.status(200).json({
            success: true,
            message: agentResult.message,
            action: agentResult.action,
            confidence: agentResult.confidence,
            method: agentResult.method,
            execution_result: executionResult,
            agent_version: agentResult.agent_version
          });
        } catch (executionError) {
          console.error('API call execution failed:', executionError);

          // Return the agent result even if execution fails
          return res.status(200).json({
            success: true,
            message: agentResult.message,
            action: agentResult.action,
            confidence: agentResult.confidence,
            method: agentResult.method,
            execution_error: executionError.message,
            agent_version: agentResult.agent_version
          });
        }
      }

      // Return agent result without execution
      return res.status(200).json({
        success: true,
        message: agentResult.message,
        action: agentResult.action,
        confidence: agentResult.confidence,
        method: agentResult.method,
        agent_version: agentResult.agent_version
      });

    } catch (agentError) {
      const agentStatus = agentError?.response?.status;
      const agentDetail = agentError?.response?.data?.detail || agentError?.message;
      console.warn(`Conversational agent unavailable${agentStatus ? ` (${agentStatus})` : ''}: ${agentDetail}`);

      // Fallback: try to handle simple commands locally
      const fallbackResult = await handleSimpleCommandsFallback(command, userContext, req, res, next);

      if (fallbackResult.success) {
        return res.status(200).json({
          ...fallbackResult,
          method: 'fallback',
          agent_version: '2.0.0-fallback'
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Conversational agent is not available and command could not be processed locally',
        error: agentDetail
      });
    }

  } catch (error) {
    console.error('Conversational command processing error:', error);
    next(error);
  }
};

/**
 * Execute the API call suggested by the conversational agent
 */
async function executeApiCall(apiCall, req, res, next) {
  const { endpoint, method, data, params } = apiCall || {};
  return await executeAllowedApiCall({ endpoint, method, data, params }, req);
}

/**
 * Execute YouTube processing
 */
async function executeAllowedApiCall(apiCall, req) {
  const { endpoint, method, data, params } = apiCall || {};

  const allowlist = [
    // Calendar
    { method: 'post', pattern: /^\/api\/calendar\/google\/schedule$/ },
    { method: 'post', pattern: /^\/api\/calendar\/google\/freebusy$/ },

    // Notes & todos
    { method: 'post', pattern: /^\/api\/sticky-notes$/ },
    { method: 'post', pattern: /^\/api\/todos$/ },
    { method: 'post', pattern: /^\/api\/todos\/search-and-complete$/ },

    // YouTube & extraction
    { method: 'post', pattern: /^\/api\/youtube\/videos-enhanced$/ },
    { method: 'post', pattern: /^\/api\/youtube\/process-with-ai$/ },
    { method: 'post', pattern: /^\/api\/content-extraction\/process-with-ai$/ },

    // Files
    { method: 'post', pattern: /^\/api\/files\/upload$/ },

    // Collections
    { method: 'post', pattern: /^\/api\/collections$/ },
    { method: 'put', pattern: /^\/api\/collections\/[a-f\d]{24}$/i },
    { method: 'post', pattern: /^\/api\/collections\/[a-f\d]{24}\/items$/i },
    { method: 'delete', pattern: /^\/api\/collections\/[a-f\d]{24}\/items\/(youtube|content|file|planner)\/[^/]{1,200}$/i },
    { method: 'post', pattern: /^\/api\/collections\/[a-f\d]{24}\/planner-widgets$/i },

    // Weather & search
    { method: 'get', pattern: /^\/api\/weather(?:\/.*)?$/ },
    { method: 'get', pattern: /^\/api\/search$/ },

    // AI chat (server-side)
    { method: 'post', pattern: /^\/api\/ai-services\/chat$/ },
  ];

  if (!endpoint || typeof endpoint !== 'string') {
    return { success: false, message: 'Invalid api_call endpoint' };
  }

  const httpMethod = String(method || 'POST').toLowerCase();
  const isAllowed = allowlist.some((rule) => rule.method === httpMethod && rule.pattern.test(endpoint));
  if (!isAllowed) {
    return { success: false, message: 'Action is not supported yet' };
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  const response = await axios({
    url: `${baseUrl}${endpoint}`,
    method: httpMethod,
    headers,
    params: params || undefined,
    data: data || undefined,
    timeout: 120000,
  });

  return response.data;
}

/**
 * Fallback handler for simple commands when agent is unavailable
 */
async function handleSimpleCommandsFallback(command, userContext, req, res, next) {
  const lowerCommand = command.toLowerCase();

  return {
    success: false,
    message: 'Command not recognized and agent not available'
  };
}

// Check agent health
exports.checkAgentHealth = async (req, res, next) => {
  try {
    const healthResponse = await axios.get(`${UNIVERSAL_AI_AGENT_URL}/health`, {
      timeout: 5000
    });

    return res.status(200).json({
      success: true,
      message: 'Conversational agent is healthy',
      agent_status: healthResponse.data,
      agent_url: UNIVERSAL_AI_AGENT_URL
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Conversational agent is not available',
      error: error.message,
      agent_url: UNIVERSAL_AI_AGENT_URL
    });
  }
};

// Get agent capabilities
exports.getCapabilities = async (req, res, next) => {
  try {
    const capabilitiesResponse = await axios.get(`${UNIVERSAL_AI_AGENT_URL}/capabilities`, {
      timeout: 10000
    });

    return res.status(200).json({
      success: true,
      message: 'Agent capabilities retrieved',
      capabilities: capabilitiesResponse.data,
      fallback_patterns: {
        youtube_patterns: [
          'summarize https://youtube.com/...',
          'save youtube https://youtube.com/...'
        ],
        content_patterns: [
          'extract content from https://...',
          'summarize this page https://...'
        ]
      }
    });
  } catch (error) {
    // Return basic capabilities even if agent is down
    return res.status(200).json({
      success: true,
      message: 'Basic capabilities (agent unavailable)',
      agent_available: false,
      fallback_patterns: {
        youtube_patterns: [
          'summarize https://youtube.com/... - Summarize a YouTube video',
          'save youtube https://youtube.com/... - Save a YouTube video'
        ],
        content_patterns: [
          'extract content from https://... - Extract content from a webpage',
          'summarize this page https://... - Summarize a webpage'
        ],
        weather_patterns: [
          'weather for [location] - Get weather information',
          'what\'s the weather in [location] - Check weather'
        ]
      },
      supported_actions: [
        'save_youtube',
        'summarize_youtube', 'extract_content', 'get_weather',
        'create_collection', 'search', 'ask_ai'
      ]
    });
  }
};

module.exports = exports;
