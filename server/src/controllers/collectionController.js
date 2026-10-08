const Collection = require('../models/Collection');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const PlannerWidget = require('../models/PlannerWidget');
const { attachEmbeddingToPlannerWidget } = require('../services/embeddingsService');
const {
  summarizePdfBuffer,
  buildSummaryNoteTitle
} = require('../services/documentSummarizationService');

const parseObjectId = (value) =>
  mongoose.isObjectIdOrHexString(value) ? new mongoose.Types.ObjectId(value) : null;

const invalidCollectionId = (res) =>
  res.status(404).json({ success: false, message: 'Collection not found' });

// Get all collections for user
exports.getCollections = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const requestedPage = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const search = typeof req.query.search === 'string'
      ? req.query.search.trim().slice(0, 100)
      : '';

    const query = { userId };

    if (search) {
      // Treat search text as a literal substring rather than compiling user input
      // into a regular expression. The length cap above also bounds query work.
      const searchTerm = { $toLower: { $literal: search } };
      const containsSearch = (field) => ({
        $gte: [{ $indexOfCP: [{ $toLower: field }, searchTerm] }, 0]
      });

      query.$expr = {
        $or: [
          containsSearch('$name'),
          containsSearch('$description'),
          {
            $anyElementTrue: {
              $map: {
                input: '$tags',
                as: 'tag',
                in: containsSearch('$$tag')
              }
            }
          }
        ]
      };
    }

    const total = await Collection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const page = Math.min(requestedPage, Math.max(totalPages, 1));

    const collections = await Collection.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        collections,
        pagination: {
          current: page,
          pages: totalPages,
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single collection with items
exports.getCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);

    const collection = await Collection.findOne({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

// Get collection with populated item data
exports.getCollectionWithItems = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Populate item data for each item in the collection
    const populatedItems = await Promise.all(
      collection.items.map(async (item) => {
        let itemData = null;

        try {
          switch (item.itemType) {
            case 'youtube':
              const YouTube = require('../models/YouTube');
              itemData = await YouTube.findOne({ _id: item.itemId, userId });
              break;
            case 'file':
              const File = require('../models/File');
              itemData = await File.findOne({ _id: item.itemId, userId });
              break;
            case 'planner':
              const PlannerWidget = require('../models/PlannerWidget');
              itemData = await PlannerWidget.findOne({ _id: item.itemId, userId });
              break;
            default:
              itemData = null;
          }
        } catch (error) {
          console.error(`Error fetching ${item.itemType} with id ${item.itemId}:`, error);
          itemData = null;
        }

        return {
          itemType: item.itemType,
          itemId: item.itemId,
          addedAt: item.addedAt,
          itemData: itemData
        };
      })
    );

    // Filter out items that couldn't be found (itemData is null)
    const validItems = populatedItems.filter(item => item.itemData !== null);

    const collectionWithItems = {
      ...collection.toObject(),
      items: validItems
    };

    res.status(200).json({
      success: true,
      data: collectionWithItems
    });
  } catch (error) {
    next(error);
  }
};

// Create new collection
exports.createCollection = async (req, res, next) => {
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
    const { name, description, color, icon, tags, isPrivate } = req.body;

    // Check if collection with same name already exists for user
    const existingCollection = await Collection.findOne({ userId, name });
    if (existingCollection) {
      return res.status(409).json({
        success: false,
        message: 'Collection with this name already exists'
      });
    }

    const collection = new Collection({
      name,
      description,
      color,
      icon,
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      userId
    });

    await collection.save();

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

// Update collection
exports.updateCollection = async (req, res, next) => {
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
    const { id } = req.params;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);
    const { name, description, color, icon, tags, isPrivate, layouts } = req.body;

    const collection = await Collection.findOne({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check if new name conflicts with existing collection
    if (name && name !== collection.name) {
      const existingCollection = await Collection.findOne({
        userId,
        name,
        _id: { $ne: collectionId }
      });
      if (existingCollection) {
        return res.status(409).json({
          success: false,
          message: 'Collection with this name already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (color !== undefined) collection.color = color;
    if (icon !== undefined) collection.icon = icon;
    if (tags !== undefined) collection.tags = tags;
    if (isPrivate !== undefined) collection.isPrivate = isPrivate;
    if (layouts !== undefined) collection.layouts = layouts;

    await collection.save();

    res.status(200).json({
      success: true,
      message: 'Collection updated successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

// Delete collection
exports.deleteCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);

    const collection = await Collection.findOneAndDelete({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add item to collection
exports.addItemToCollection = async (req, res, next) => {
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
    const { id } = req.params;
    const { itemType, itemId } = req.body;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);
    if (typeof itemId !== 'string' || !itemId.trim()) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    const collection = await Collection.findOne({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await collection.addItem(itemType, itemId);

    res.status(200).json({
      success: true,
      message: 'Item added to collection successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from collection
exports.removeItemFromCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, itemType, itemId } = req.params;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);

    const collection = await Collection.findOne({ _id: collectionId, userId });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await collection.removeItem(itemType, itemId);

    res.status(200).json({
      success: true,
      message: 'Item removed from collection successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

// Get collections containing specific item
exports.getCollectionsForItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemType, itemId } = req.params;

    const collections = await Collection.find({
      userId,
      'items.itemType': itemType,
      'items.itemId': itemId
    }).select('name color icon');

    res.status(200).json({
      success: true,
      data: collections
    });
  } catch (error) {
    next(error);
  }
};

// Create a planner widget and add it to a collection (atomic convenience endpoint)
exports.addPlannerWidgetToCollection = async (req, res, next) => {
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
    const { id } = req.params;
    const { widgetType, title, data } = req.body;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    const widget = new PlannerWidget({
      userId,
      widgetType,
      title: title || '',
      data: data || {}
    });
    await attachEmbeddingToPlannerWidget(widget);
    await widget.save();

    await collection.addItem('planner', String(widget._id));

    return res.status(201).json({
      success: true,
      message: 'Planner widget added to collection successfully',
      data: {
        widget,
        collection
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload a PDF, summarize it with Gemini, and save summary as a notes widget in collection
exports.summarizeDocumentToCollectionNote = async (req, res, next) => {
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
    const { id } = req.params;
    const file = req.file;
    const collectionId = parseObjectId(id);
    if (!collectionId) return invalidCollectionId(res);

    if (!file?.buffer) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    const extension = String(file.originalname || '')
      .toLowerCase()
      .trim();
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfByExt = extension.endsWith('.pdf');
    if (!isPdfMime && !isPdfByExt) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are supported for summarization'
      });
    }

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    const summaryResult = await summarizePdfBuffer({
      buffer: file.buffer,
      filename: file.originalname
    });

    const requestedTitle = String(req.body?.noteTitle || '').trim();
    const noteTitle = buildSummaryNoteTitle({
      filename: file.originalname,
      customTitle: requestedTitle
    });

    const noteBody = [
      `Source: ${String(file.originalname || 'Uploaded PDF').trim()}`,
      summaryResult.pageCount ? `Pages: ${summaryResult.pageCount}` : null,
      summaryResult.wasTruncated
        ? 'Note: Source text was truncated before summarization.'
        : null,
      '',
      summaryResult.summaryText || summaryResult.summaryMarkdown
    ]
      .filter(Boolean)
      .join('\n');

    const widget = new PlannerWidget({
      userId,
      widgetType: 'notes',
      title: noteTitle,
      data: {
        text: noteBody
      }
    });

    await attachEmbeddingToPlannerWidget(widget);
    await widget.save();
    await collection.addItem('planner', String(widget._id));

    return res.status(201).json({
      success: true,
      message: 'Document summarized and saved as note',
      data: {
        widget,
        collection: {
          _id: String(collection._id),
          name: collection.name
        },
        summaryMeta: {
          model: summaryResult.model,
          pageCount: summaryResult.pageCount,
          sourceCharacters: summaryResult.sourceCharacters,
          wasTruncated: summaryResult.wasTruncated
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
