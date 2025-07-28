const axios = require('axios');
const { validationResult } = require('express-validator');

const UNIVERSAL_AI_AGENT_URL = process.env.UNIVERSAL_AI_AGENT_URL || 'http://localhost:8000';

// Import all the controllers for executing actions
const stickyNoteController = require('./stickyNoteController');
const todoController = require('./todoController');
const youtubeController = require('./youtubeController');
const contentExtractionController = require('./contentExtractionController');
const fileController = require('./fileController');
const collectionController = require('./collectionController');
const weatherController = require('./weatherController');

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

    // Add user context
    const userContext = {
      ...context,
      userId: userId,
      user: req.user
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
      console.error('Conversational agent failed:', agentError);

      // Fallback: try to handle simple commands locally
      const fallbackResult = await handleSimpleCommandsFallback(command, userContext);

      if (fallbackResult.success) {
        return res.status(200).json({
          ...fallbackResult,
          method: 'fallback',
          agent_version: '2.0.0-fallback'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Conversational agent is not available and command could not be processed locally',
        error: agentError.message
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
  const { endpoint, method, data, params } = apiCall;

  try {
    // Create a mock request object for the controller call
    const mockReq = {
      ...req,
      body: data || {},
      query: params || {},
      params: extractParamsFromEndpoint(endpoint)
    };

    // Route to appropriate controller based on endpoint
    if (endpoint.startsWith('/api/sticky-notes')) {
      return await executeControllerMethod(stickyNoteController, 'createNote', mockReq, res, next);
    } else if (endpoint.startsWith('/api/todos')) {
      if (endpoint.includes('search-and-complete')) {
        return await searchAndCompleteTodo(data, mockReq.user._id);
      }
      return await executeControllerMethod(todoController, 'createTodo', mockReq, res, next);
    } else if (endpoint.startsWith('/api/youtube')) {
      if (endpoint.includes('process-with-ai')) {
        return await executeYouTubeProcessing(data, mockReq, res, next);
      } else if (endpoint.includes('videos-enhanced')) {
        return await executeControllerMethod(youtubeController, 'createVideoWithSummary', mockReq, res, next);
      }
    } else if (endpoint.startsWith('/api/content-extraction')) {
      if (endpoint.includes('process-with-ai')) {
        return await executeControllerMethod(contentExtractionController, 'processContentWithAI', mockReq, res, next);
      }
    } else if (endpoint.startsWith('/api/files')) {
      return await executeControllerMethod(fileController, 'uploadFile', mockReq, res, next);
    } else if (endpoint.startsWith('/api/collections')) {
      return await executeControllerMethod(collectionController, 'createCollection', mockReq, res, next);
    } else if (endpoint.startsWith('/api/weather')) {
      return await executeControllerMethod(weatherController, 'getWeather', mockReq, res, next);
    } else if (endpoint.startsWith('/api/search')) {
      return await performGlobalSearch(params.q, mockReq.user._id);
    } else if (endpoint.startsWith('/api/ai-services')) {
      return await handleAIAssistance(data, mockReq.user._id);
    }

    return { success: false, message: 'Unknown endpoint' };

  } catch (error) {
    console.error('API call execution error:', error);
    throw error;
  }
}

/**
 * Execute a controller method with proper error handling
 */
async function executeControllerMethod(controller, methodName, req, res, next) {
  return new Promise((resolve, reject) => {
    // Create a mock response object to capture the result
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          resolve({ statusCode: code, data });
        }
      }),
      json: (data) => {
        resolve({ statusCode: 200, data });
      }
    };

    // Execute the controller method
    try {
      controller[methodName](req, mockRes, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve({ success: true, message: 'Method executed successfully' });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Search and complete a todo item
 */
async function searchAndCompleteTodo(data, userId) {
  try {
    const Todo = require('../models/Todo');

    // Search for the todo item
    const todos = await Todo.find({
      userId: userId,
      title: { $regex: data.search_term, $options: 'i' },
      completed: false
    }).limit(1);

    if (todos.length === 0) {
      return {
        success: false,
        message: `No uncompleted todo found matching: "${data.search_term}"`
      };
    }

    // Update the todo
    const todo = todos[0];
    todo.completed = true;
    todo.completedAt = new Date();
    await todo.save();

    return {
      success: true,
      message: `Completed todo: "${todo.title}"`,
      data: todo
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Execute YouTube processing
 */
async function executeYouTubeProcessing(data, req, res, next) {
  try {
    // This would call the YouTube processing route we created earlier
    const result = await axios.post(`${req.protocol}://${req.get('host')}/api/youtube/process-with-ai`, data, {
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: 'YouTube video processed successfully',
      data: result.data
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Perform global search across all user content
 */
async function performGlobalSearch(query, userId) {
  try {
    // Search across multiple collections
    const Todo = require('../models/Todo');
    const StickyNote = require('../models/StickyNote');
    const YouTube = require('../models/YouTube');
    const ContentExtraction = require('../models/ContentExtraction');

    const searchResults = await Promise.allSettled([
      Todo.find({
        userId: userId,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(5),

      StickyNote.find({
        userId: userId,
        content: { $regex: query, $options: 'i' }
      }).limit(5),

      YouTube.find({
        userId: userId,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(5),

      ContentExtraction.find({
        userId: userId,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      }).limit(5)
    ]);

    const results = {
      todos: searchResults[0].status === 'fulfilled' ? searchResults[0].value : [],
      notes: searchResults[1].status === 'fulfilled' ? searchResults[1].value : [],
      videos: searchResults[2].status === 'fulfilled' ? searchResults[2].value : [],
      content: searchResults[3].status === 'fulfilled' ? searchResults[3].value : []
    };

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return {
      success: true,
      message: `Found ${totalResults} results for "${query}"`,
      data: results
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Handle AI assistance requests
 */
async function handleAIAssistance(data, userId) {
  try {
    // This would integrate with your AI services
    const result = {
      success: true,
      message: `AI assistance for: "${data.message}"`,
      response: "This would connect to your AI service to provide an intelligent response."
    };

    return result;

  } catch (error) {
    throw error;
  }
}

/**
 * Extract parameters from endpoint path
 */
function extractParamsFromEndpoint(endpoint) {
  const params = {};
  const matches = endpoint.match(/:(\w+)/g);
  if (matches) {
    matches.forEach(match => {
      const paramName = match.substring(1);
      params[paramName] = 'extracted-value'; // This would need proper extraction logic
    });
  }
  return params;
}

/**
 * Fallback handler for simple commands when agent is unavailable
 */
async function handleSimpleCommandsFallback(command, userContext) {
  const lowerCommand = command.toLowerCase();

  // Simple note detection
  if (lowerCommand.includes('add note') || lowerCommand.includes('note:')) {
    const noteMatch = command.match(/(?:add note|note:)\s*["\']?(.+?)["\']?$/i);
    if (noteMatch) {
      return {
        success: true,
        message: `Would add note: "${noteMatch[1]}"`,
        action: 'add_note',
        api_call: {
          endpoint: '/api/sticky-notes',
          method: 'POST',
          data: { content: noteMatch[1] }
        }
      };
    }
  }

  // Simple todo detection
  if (lowerCommand.includes('add todo') || lowerCommand.includes('todo:')) {
    const todoMatch = command.match(/(?:add todo|todo:)\s*["\']?(.+?)["\']?$/i);
    if (todoMatch) {
      return {
        success: true,
        message: `Would add todo: "${todoMatch[1]}"`,
        action: 'add_todo',
        api_call: {
          endpoint: '/api/todos',
          method: 'POST',
          data: { title: todoMatch[1] }
        }
      };
    }
  }

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
        note_patterns: [
          'add note "content"',
          'create note "content"',
          'note: content',
          'remind me to ...'
        ],
        todo_patterns: [
          'add todo "content"',
          'add task "content"',
          'todo: content',
          'i need to ...'
        ],
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
        note_patterns: [
          'add note "content" - Add a sticky note',
          'create note "content" - Create a sticky note',
          'note: content - Quick note creation',
          'remind me to ... - Add reminder note'
        ],
        todo_patterns: [
          'add todo "content" - Add a todo item',
          'add task "content" - Add a task',
          'todo: content - Quick todo creation',
          'i need to ... - Add task from natural language'
        ],
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
        'add_note', 'add_todo', 'complete_todo', 'save_youtube',
        'summarize_youtube', 'extract_content', 'get_weather',
        'create_collection', 'search', 'ask_ai'
      ]
    });
  }
};

module.exports = exports;
