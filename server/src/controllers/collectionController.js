const Collection = require('../models/Collection');
const { validationResult } = require('express-validator');
const PlannerWidget = require('../models/PlannerWidget');
const { attachEmbeddingToPlannerWidget } = require('../services/embeddingsService');

// Get all collections for user
exports.getCollections = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, search } = req.query;

    const query = { userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const collections = await Collection.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Collection.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        collections,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
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

    const collection = await Collection.findOne({ _id: id, userId });

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

    const collection = await Collection.findOne({ _id: id, userId });
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
    const { name, description, color, icon, tags, isPrivate, layouts } = req.body;

    const collection = await Collection.findOne({ _id: id, userId });

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
        _id: { $ne: id }
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

    const collection = await Collection.findOneAndDelete({ _id: id, userId });

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

    const collection = await Collection.findOne({ _id: id, userId });

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

    const collection = await Collection.findOne({ _id: id, userId });

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

    const collection = await Collection.findOne({ _id: id, userId });
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
