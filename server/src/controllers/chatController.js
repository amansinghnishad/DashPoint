const { validationResult } = require('express-validator');

const { runChat } = require('../services/chatService');
const { saveChatTurn } = require('../services/chatHistoryService');
const { sanitizeChatInput } = require('../utils/agentInputSanitizer');
const Collection = require('../models/Collection');
const PlannerWidget = require('../models/PlannerWidget');
const {
  extractActionItemsFromText,
  mapSuggestionsToTodoItems
} = require('../services/actionItemExtractionService');
const { attachEmbeddingToPlannerWidget } = require('../services/embeddingsService');

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
    const sessionId = req.body.sessionId || null;

    if (!sanitizedInput.message) {
      return res.status(400).json({
        success: false,
        message: 'message must include readable text'
      });
    }

    const result = await runChat({
      userId,
      sessionId,
      ...sanitizedInput
    });

    await saveChatTurn({
      userId,
      sessionId,
      userMessage: sanitizedInput.message,
      assistantMessage: result.response,
      provider: result.provider,
      model: result.model,
      mutations: result.mutations,
      retrieval: result.retrieval,
      routing: result.routing
    });

    return res.status(200).json({
      success: true,
      data: {
        response: result.response,
        provider: result.provider,
        model: result.model,
        routing: result.routing,
        mutations: result.mutations,
        retrieval: result.retrieval
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.streamChat = async (req, res) => {
  const userId = req.user._id;
  const sanitizedInput = sanitizeChatInput(req.body || {});
  const sessionId = req.body.sessionId || null;

  if (!sanitizedInput.message) {
    res.status(400).json({
      success: false,
      message: 'message must include readable text'
    });
    return;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (typeof res.flush === 'function') {
      res.flush();
    }
  };

  try {
    const result = await runChat({
      userId,
      sessionId,
      ...sanitizedInput,
      onMetadata: (metadata) => {
        sendEvent('metadata', metadata);
      },
      onDelta: (chunk) => {
        sendEvent('delta', { text: chunk });
      }
    });

    // Save chat turn
    await saveChatTurn({
      userId,
      sessionId,
      userMessage: sanitizedInput.message,
      assistantMessage: result.response,
      provider: result.provider,
      model: result.model,
      mutations: result.mutations,
      retrieval: result.retrieval,
      routing: result.routing
    });

    sendEvent('done', {
      response: result.response,
      provider: result.provider,
      model: result.model,
      routing: result.routing,
      mutations: result.mutations,
      retrieval: result.retrieval
    });

    res.end();
  } catch (error) {
    sendEvent('error', { message: error.message || 'Stream processing failed' });
    res.end();
  }
};

exports.extractActionItems = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rawText, maxItems, title } = req.body;
    const extraction = await extractActionItemsFromText({ rawText, maxItems });

    return res.status(200).json({
      success: true,
      data: {
        title: String(title || '').trim(),
        suggestions: extraction.suggestions,
        meta: extraction.meta
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.approveActionItems = async (req, res, next) => {
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
    const { approvedItems, collectionId, title } = req.body;

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    const todoItems = mapSuggestionsToTodoItems(approvedItems);
    if (!todoItems.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid approved items were provided'
      });
    }

    const widget = new PlannerWidget({
      userId,
      widgetType: 'todo-list',
      title: String(title || 'Action items').trim().slice(0, 100),
      data: {
        items: todoItems
      }
    });

    await attachEmbeddingToPlannerWidget(widget);
    await widget.save();
    await collection.addItem('planner', String(widget._id));

    return res.status(201).json({
      success: true,
      message: 'Action items saved to collection',
      data: {
        widget,
        collection: {
          _id: String(collection._id),
          name: collection.name
        },
        addedCount: todoItems.length
      }
    });
  } catch (error) {
    return next(error);
  }
};
