const { validationResult } = require('express-validator');
const StickyNote = require('../models/StickyNote');

// Get sticky notes for user
exports.getStickyNotes = async (req, res, next) => {
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
    const {
      page = 1,
      limit = 50,
      archived = false,
      tags,
      color
    } = req.query;

    // Build filter
    const filter = {
      userId,
      archived: archived === 'true'
    };

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    if (color) {
      filter.color = color;
    }

    // Get sticky notes with pagination
    const skip = (page - 1) * limit;
    const stickyNotes = await StickyNote.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StickyNote.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: stickyNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new sticky note
exports.createStickyNote = async (req, res, next) => {
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
    const stickyNoteData = {
      ...req.body,
      userId
    };

    const stickyNote = new StickyNote(stickyNoteData);
    await stickyNote.save();

    res.status(201).json({
      success: true,
      message: 'Sticky note created successfully',
      data: stickyNote
    });
  } catch (error) {
    next(error);
  }
};

// Search sticky notes
exports.searchStickyNotes = async (req, res, next) => {
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
    const {
      q,
      page = 1,
      limit = 20,
      tags,
      color,
      archived
    } = req.query;

    // Build search filter
    const filter = { userId };

    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { content: new RegExp(q, 'i') }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    if (color) {
      filter.color = color;
    }

    if (archived !== undefined) {
      filter.archived = archived === 'true';
    }

    // Get sticky notes with pagination
    const skip = (page - 1) * limit;
    const stickyNotes = await StickyNote.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StickyNote.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: stickyNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get archived sticky notes
exports.getArchivedStickyNotes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const filter = { userId, archived: true };

    const skip = (page - 1) * limit;
    const stickyNotes = await StickyNote.find(filter)
      .sort({ archivedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StickyNote.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: stickyNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get sticky note by ID
exports.getStickyNoteById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const stickyNote = await StickyNote.findOne({ _id: id, userId });

    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: stickyNote
    });
  } catch (error) {
    next(error);
  }
};

// Update sticky note
exports.updateStickyNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const stickyNote = await StickyNote.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sticky note updated successfully',
      data: stickyNote
    });
  } catch (error) {
    next(error);
  }
};

// Delete sticky note
exports.deleteStickyNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const stickyNote = await StickyNote.findOneAndDelete({ _id: id, userId });

    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sticky note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Archive sticky note
exports.archiveStickyNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const stickyNote = await StickyNote.findOneAndUpdate(
      { _id: id, userId },
      {
        archived: true,
        archivedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sticky note archived successfully',
      data: stickyNote
    });
  } catch (error) {
    next(error);
  }
};

// Restore sticky note
exports.restoreStickyNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const stickyNote = await StickyNote.findOneAndUpdate(
      { _id: id, userId },
      {
        archived: false,
        archivedAt: null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!stickyNote) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sticky note restored successfully',
      data: stickyNote
    });
  } catch (error) {
    next(error);
  }
};

// Bulk operations
exports.bulkOperation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { noteIds, operation } = req.body;
    const userId = req.user._id;

    let result;
    let message;

    switch (operation) {
      case 'archive':
        result = await StickyNote.updateMany(
          { _id: { $in: noteIds }, userId },
          {
            archived: true,
            archivedAt: new Date(),
            updatedAt: new Date()
          }
        );
        message = `${result.modifiedCount} sticky notes archived`;
        break;

      case 'restore':
        result = await StickyNote.updateMany(
          { _id: { $in: noteIds }, userId },
          {
            archived: false,
            archivedAt: null,
            updatedAt: new Date()
          }
        );
        message = `${result.modifiedCount} sticky notes restored`;
        break;

      case 'delete':
        result = await StickyNote.deleteMany(
          { _id: { $in: noteIds }, userId }
        );
        message = `${result.deletedCount} sticky notes deleted`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        operation,
        affectedCount: result.modifiedCount || result.deletedCount,
        noteIds
      }
    });
  } catch (error) {
    next(error);
  }
};
