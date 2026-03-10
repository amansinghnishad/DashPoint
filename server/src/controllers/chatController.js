const { validationResult } = require('express-validator');

const Collection = require('../models/Collection');
const PlannerWidget = require('../models/PlannerWidget');
const { runChat } = require('../services/chatService');
const {
  extractActionItemsFromText,
  mapSuggestionsToTodoItems
} = require('../services/actionItemExtractionService');
const { attachEmbeddingToPlannerWidget } = require('../services/embeddingsService');

const DEFAULT_ACTION_ITEM_TITLE = 'Action Items';

const normalizeTitle = (value) => {
  const normalized = String(value || '').trim().slice(0, 100);
  return normalized || DEFAULT_ACTION_ITEM_TITLE;
};

const normalizeApprovedTodoItems = (items = []) => {
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map((item) =>
      String(item?.text || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 280)
    )
    .filter(Boolean)
    .filter((text) => {
      const key = text.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((text) => ({
      text,
      done: false
    }));
};

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
        retrieval: result.retrieval,
        cache: result.cache || { hit: false }
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

    const rawText = String(req.body?.rawText || '');
    const maxItems = req.body?.maxItems;
    const title = normalizeTitle(req.body?.title);

    const extraction = await extractActionItemsFromText({
      rawText,
      maxItems
    });
    const todoItems = mapSuggestionsToTodoItems(extraction.suggestions);

    return res.status(200).json({
      success: true,
      data: {
        suggestions: extraction.suggestions,
        todoPreview: {
          widgetType: 'todo-list',
          title,
          data: {
            items: todoItems
          }
        },
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
    const collectionId = String(req.body?.collectionId || '').trim();
    const title = normalizeTitle(req.body?.title);
    const todoItems = normalizeApprovedTodoItems(req.body?.approvedItems);

    if (!collectionId) {
      return res.status(400).json({
        success: false,
        message: 'Choose a collection to save approved items'
      });
    }

    if (!todoItems.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid approved items provided'
      });
    }

    const collection = await Collection.findOne({
      _id: collectionId,
      userId
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    const widget = new PlannerWidget({
      userId,
      widgetType: 'todo-list',
      title,
      data: {
        items: todoItems
      }
    });

    await attachEmbeddingToPlannerWidget(widget);
    await widget.save();
    await collection.addItem('planner', String(widget._id));

    return res.status(201).json({
      success: true,
      message: 'Todo list created from approved action items',
      data: {
        widget,
        itemCount: todoItems.length,
        collection: {
          _id: String(collection._id),
          name: collection.name
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};
