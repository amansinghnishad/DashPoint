const { validationResult } = require('express-validator');
const ContentExtraction = require('../models/ContentExtraction');
const contentExtractorService = require('../services/contentExtractorService');
const axios = require('axios');
const { validateAISummary } = require('../utils/aiSummaryUtils');

const UNIVERSAL_AI_AGENT_URL = process.env.UNIVERSAL_AI_AGENT_URL || 'http://localhost:8000';

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

// Enhanced content extraction with AI summarization using new agent
exports.extractContentWithSummary = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      url,
      extractImages = false,
      extractLinks = false,
      maxContentLength = 10000,
      generateSummary = false,
      summaryLength = 'medium'
    } = req.body;
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

    let aiSummary = null;
    let aiAnalysis = null;

    if (generateSummary && extractedData.content && extractedData.content.length > 100) {
      try {
        // Use the new agent chat endpoint for more intelligent content analysis
        const analysisResponse = await axios.post(`${process.env.DASHPOINT_AI_AGENT_URL}/chat`, {
          prompt: `Please analyze and summarize the following web content: ${extractedData.content}`,
          context: `URL: ${url}. Title: ${extractedData.title || 'Unknown'}. Summary length: ${summaryLength}. Also extract key topics and sentiment.`
        }, {
          timeout: 120000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Extract analysis from agent response
        if (analysisResponse.data && analysisResponse.data.results) {
          for (const result of analysisResponse.data.results) {
            if (result.type === 'function_result' && result.result && result.result.success) {
              if (result.result.summary) {
                aiSummary = validateAISummary(result.result.summary, 3000);
              }
              if (result.result.keywords || result.result.topics || result.result.sentiment) {
                aiAnalysis = {
                  keywords: result.result.keywords || [],
                  topics: result.result.topics || [],
                  sentiment: result.result.sentiment || 'neutral'
                };
              }
              break;
            }
          }
        }
      } catch (summaryError) {
        console.error('AI analysis failed:', summaryError);

        // Fallback to direct text summarization endpoint
        try {
          const fallbackResponse = await axios.post(`${process.env.DASHPOINT_AI_AGENT_URL}/summarize-text`, {
            text_content: extractedData.content,
            summary_length: summaryLength
          }, {
            timeout: 60000,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          aiSummary = validateAISummary(fallbackResponse.data.summary, 3000);
        } catch (fallbackError) {
          console.error('Fallback summarization also failed:', fallbackError);
        }
      }
    }

    // Save extraction to database with AI analysis
    const extraction = new ContentExtraction({
      userId,
      url,
      title: extractedData.title,
      content: extractedData.content,
      description: extractedData.description,
      images: extractImages ? extractedData.images : [],
      links: extractLinks ? extractedData.links : [],
      metadata: {
        ...extractedData.metadata,
        extractionOptions: {
          extractImages,
          extractLinks,
          maxContentLength,
          generateSummary,
          summaryLength
        },
        aiSummary: aiSummary,
        aiAnalysis: aiAnalysis,
        summaryGenerated: !!aiSummary,
        agentVersion: (aiSummary || aiAnalysis) ? "2.0.0" : null
      },
      domain: extractedData.domain
    });

    await extraction.save();

    res.status(201).json({
      success: true,
      message: 'Content extracted and analyzed successfully',
      data: extraction
    });

  } catch (error) {
    console.error('Content extraction with summary error:', error);
    next(error);
  }
};

// Intelligent content processing using AI agent
exports.processContentWithAI = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { url, content, processType = 'analyze' } = req.body;
    const userId = req.user.id;

    let inputContent = content;
    let sourceUrl = url;

    // If URL is provided, extract content first
    if (url && !content) {
      try {
        const extractedData = await contentExtractorService.extractContent(url, {
          extractImages: false,
          extractLinks: false,
          maxContentLength: 10000
        });
        inputContent = extractedData.content;
        sourceUrl = url;
      } catch (extractError) {
        return res.status(400).json({
          success: false,
          message: 'Failed to extract content from URL',
          error: extractError.message
        });
      }
    }

    if (!inputContent) {
      return res.status(400).json({
        success: false,
        message: 'Either URL or content must be provided'
      });
    }

    try {
      // Use the new agent for intelligent content processing
      let prompt;
      switch (processType.toLowerCase()) {
        case 'summarize':
          prompt = `Please provide a comprehensive summary of this content: ${inputContent}`;
          break;
        case 'analyze':
          prompt = `Please analyze this content and provide summary, key topics, sentiment, and important insights: ${inputContent}`;
          break;
        case 'keywords':
          prompt = `Extract the most important keywords and key phrases from this content: ${inputContent}`;
          break;
        case 'topics':
          prompt = `Identify the main topics and themes discussed in this content: ${inputContent}`;
          break;
        case 'sentiment':
          prompt = `Analyze the sentiment and tone of this content: ${inputContent}`;
          break;
        default:
          prompt = `Please analyze and provide insights about this content: ${inputContent}`;
      }

      const agentResponse = await axios.post(`${process.env.DASHPOINT_AI_AGENT_URL}/chat`, {
        prompt: prompt,
        context: sourceUrl ? `Source URL: ${sourceUrl}. Processing type: ${processType}` : `Processing type: ${processType}`
      }, {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Extract results from agent response
      let processedResults = null;
      if (agentResponse.data && agentResponse.data.results) {
        processedResults = agentResponse.data.results;
      }

      // Save processing result to user's history (optional)
      const processingResult = {
        userId,
        sourceUrl,
        contentPreview: inputContent.substring(0, 500) + (inputContent.length > 500 ? '...' : ''),
        processType,
        results: processedResults,
        agentVersion: "2.0.0",
        processedAt: new Date()
      };

      res.status(200).json({
        success: true,
        message: 'Content processed successfully',
        data: processingResult
      });

    } catch (agentError) {
      console.error('AI agent processing failed:', agentError);

      // Fallback to direct endpoint based on process type
      try {
        let fallbackResponse;
        if (processType.toLowerCase() === 'summarize' || processType.toLowerCase() === 'analyze') {
          fallbackResponse = await axios.post(`${process.env.DASHPOINT_AI_AGENT_URL}/analyze-content`, {
            content: inputContent,
            analysis_type: processType.toLowerCase() === 'analyze' ? 'summary' : processType.toLowerCase()
          }, {
            timeout: 60000,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        res.status(200).json({
          success: true,
          message: 'Content processed successfully (fallback)',
          data: {
            userId,
            sourceUrl,
            contentPreview: inputContent.substring(0, 500) + (inputContent.length > 500 ? '...' : ''),
            processType,
            results: fallbackResponse?.data || { error: 'Processing failed' },
            agentVersion: "2.0.0-fallback",
            processedAt: new Date()
          }
        });
      } catch (fallbackError) {
        throw new Error(`Both agent and fallback processing failed: ${agentError.message}`);
      }
    }

  } catch (error) {
    console.error('Content processing error:', error);
    next(error);
  }
};
