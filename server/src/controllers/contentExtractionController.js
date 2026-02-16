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

