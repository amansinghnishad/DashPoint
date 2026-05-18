const { validationResult } = require('express-validator');

const { runChat } = require('../services/chatService');
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
