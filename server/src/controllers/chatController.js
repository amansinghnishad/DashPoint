const OpenAI = require('openai');
const { validationResult } = require('express-validator');

const Collection = require('../models/Collection');
const PlannerWidget = require('../models/PlannerWidget');
const { tools } = require('../services/openaiTools');
const { executeToolCall } = require('../services/chatToolExecutor');
const {
  extractActionItemsFromText,
  mapSuggestionsToTodoItems
} = require('../services/actionItemExtractionService');
const { attachEmbeddingToPlannerWidget } = require('../services/embeddingsService');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const DEFAULT_ACTION_ITEM_TITLE = 'Action Items';

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const parseToolArgs = (argsString) => {
  if (!argsString) return {};
  try {
    return JSON.parse(argsString);
  } catch {
    throw new Error('Invalid tool arguments from model');
  }
};

const extractFinalText = (response) => {
  if (response.output_text) return response.output_text;

  const chunks = (response.output || []).flatMap((item) => {
    if (item.type !== 'message' || !Array.isArray(item.content)) return [];
    return item.content
      .filter((part) => part.type === 'output_text' || part.type === 'text')
      .map((part) => part.text || '');
  });

  return chunks.join('\n').trim();
};

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
    const { message } = req.body;
    const client = getClient();

    let response = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: 'system',
          content: 'You are DashPoint assistant. Use tools when the user asks to create collections or save notes. If the user asks for multiple actions in one command, complete all required DB actions in the same turn by either calling createCollectionWithNote or chaining multiple tool calls. Keep responses concise and factual.'
        },
        {
          role: 'user',
          content: String(message)
        }
      ],
      tools,
      tool_choice: 'auto'
    });

    while (true) {
      const functionCalls = (response.output || []).filter(
        (item) => item.type === 'function_call'
      );

      if (!functionCalls.length) break;

      const toolOutputs = [];

      for (const call of functionCalls) {
        try {
          const args = parseToolArgs(call.arguments);
          const result = await executeToolCall({
            name: call.name,
            args,
            userId
          });

          toolOutputs.push({
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify({ ok: true, result })
          });
        } catch (toolError) {
          toolOutputs.push({
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify({ ok: false, error: toolError.message })
          });
        }
      }

      response = await client.responses.create({
        model: MODEL,
        previous_response_id: response.id,
        input: toolOutputs
      });
    }

    const text = extractFinalText(response) || 'Done.';

    return res.status(200).json({
      success: true,
      data: {
        response: text
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

    if (!todoItems.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid approved items provided'
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

    let collectionPayload = null;
    if (collectionId) {
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

      await collection.addItem('planner', String(widget._id));
      collectionPayload = {
        _id: String(collection._id),
        name: collection.name
      };
    }

    return res.status(201).json({
      success: true,
      message: 'Todo list created from approved action items',
      data: {
        widget,
        itemCount: todoItems.length,
        collection: collectionPayload
      }
    });
  } catch (error) {
    return next(error);
  }
};
