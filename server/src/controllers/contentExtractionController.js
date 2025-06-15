const { validationResult } = require('express-validator');
const ContentExtraction = require('../models/ContentExtraction');
const contentExtractorService = require('../services/contentExtractorService');

// Extract content from URL
exports.extractContent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { url, extractImages = false, extractLinks = false, maxContentLength = 10000 } = req.body;
    const userId = req.user.id;

    // Check if extraction already exists for this URL and user
    const existingExtraction = await ContentExtraction.findOne({
      userId,
      url,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // within last 24 hours
    });

    if (existingExtraction) {
      return res.status(200).json({
        success: true,
        message: 'Content extraction found (cached)',
        data: existingExtraction
      });
    }

    // Extract content using the service
    const extractedData = await contentExtractorService.extractContent(url, {
      extractImages,
      extractLinks,
      maxContentLength
    });

    // Save extraction to database
    const extraction = new ContentExtraction({
      userId,
      url,
      title: extractedData.title,
      content: extractedData.content,
      description: extractedData.description,
      images: extractImages ? extractedData.images : [],
      links: extractLinks ? extractedData.links : [],
      metadata: extractedData.metadata,
      domain: extractedData.domain,
      extractionOptions: {
        extractImages,
        extractLinks,
        maxContentLength
      }
    });

    await extraction.save();

    res.status(201).json({
      success: true,
      message: 'Content extracted successfully',
      data: extraction
    });
  } catch (error) {
    next(error);
  }
};

// Get user's content extractions
exports.getExtractions = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { page = 1, limit = 20, domain, dateFrom, dateTo } = req.query;

    // Build filter
    const filter = { userId };

    if (domain) {
      filter.domain = new RegExp(domain, 'i');
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Get extractions with pagination
    const skip = (page - 1) * limit;
    const extractions = await ContentExtraction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Exclude full content for list view

    const total = await ContentExtraction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: extractions,
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

// Search content extractions
exports.searchExtractions = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { q, page = 1, limit = 20, domain, dateFrom, dateTo } = req.query;

    // Build search filter
    const filter = { userId };

    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { content: new RegExp(q, 'i') },
        { url: new RegExp(q, 'i') }
      ];
    }

    if (domain) {
      filter.domain = new RegExp(domain, 'i');
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Get extractions with pagination
    const skip = (page - 1) * limit;
    const extractions = await ContentExtraction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Exclude full content for search results

    const total = await ContentExtraction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: extractions,
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

// Get extraction by ID
exports.getExtractionById = async (req, res, next) => {
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
    const userId = req.user.id;

    const extraction = await ContentExtraction.findOne({ _id: id, userId });

    if (!extraction) {
      return res.status(404).json({
        success: false,
        message: 'Content extraction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: extraction
    });
  } catch (error) {
    next(error);
  }
};

// Delete extraction
exports.deleteExtraction = async (req, res, next) => {
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
    const userId = req.user.id;

    const extraction = await ContentExtraction.findOneAndDelete({ _id: id, userId });

    if (!extraction) {
      return res.status(404).json({
        success: false,
        message: 'Content extraction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Content extraction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// CRUD Operations for saved content
// Get all saved content for the authenticated user
exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const contents = await ContentExtraction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalContents = await ContentExtraction.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalContents / limit);

    res.json({
      success: true,
      data: contents,
      pagination: {
        page,
        limit,
        totalContents,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new saved content
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const contentData = {
      ...req.body,
      userId: req.user._id
    };

    const content = new ContentExtraction(contentData);
    await content.save();

    res.status(201).json({
      success: true,
      data: content,
      message: 'Content saved successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This content is already saved'
      });
    }
    next(error);
  }
};

// Update saved content
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const content = await ContentExtraction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content,
      message: 'Content updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete saved content
exports.delete = async (req, res, next) => {
  try {
    const content = await ContentExtraction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
