const axios = require('axios');
const { validationResult } = require('express-validator');

const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
const TEXTRAZOR_API_KEY = process.env.TEXTRAZOR_API_KEY;
const UNIVERSAL_AI_AGENT_URL = process.env.UNIVERSAL_AI_AGENT_URL || 'http://localhost:8000';

// Hugging Face API endpoints
const HUGGING_FACE_BASE_URL = 'https://api-inference.huggingface.co/models';

// TextRazor API endpoints
const TEXTRAZOR_BASE_URL = 'https://api.textrazor.com';

// Available Hugging Face models
const MODELS = {
  summarization: 'facebook/bart-large-cnn',
  keywordExtraction: 'ml6team/keyphrase-extraction-kbir-inspec',
  sentimentAnalysis: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
  questionAnswering: 'deepset/roberta-base-squad2',
  grammarCheck: 'textattack/roberta-base-CoLA',
  textSummarization: 'facebook/bart-large-cnn',
  sentenceSimplification: 'tuner007/pegasus_paraphrase',
  punctuationRestoration: 'felflare/bert-restore-punctuation'
};

// Helper function to make Hugging Face API calls
const makeHuggingFaceRequest = async (modelPath, inputs, parameters = {}) => {
  if (!HUGGING_FACE_TOKEN) {
    throw new Error('Hugging Face token not configured');
  }

  const response = await axios.post(`${HUGGING_FACE_BASE_URL}/${modelPath}`, {
    inputs,
    parameters,
    options: {
      wait_for_model: true
    }
  }, {
    headers: {
      'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000
  });

  return response.data;
};

// Helper function to make TextRazor API calls
const makeTextRazorRequest = async (text, extractors = ['entities', 'topics', 'words']) => {
  if (!TEXTRAZOR_API_KEY) {
    throw new Error('TextRazor API key not configured');
  }

  const response = await axios.post(`${TEXTRAZOR_BASE_URL}/`, {
    text,
    extractors: extractors.join(',')
  }, {
    headers: {
      'x-textrazor-key': TEXTRAZOR_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 30000
  });

  return response.data;
};

// Text summarization endpoint
exports.summarizeText = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, maxLength = 150, minLength = 30 } = req.body;

    const result = await makeHuggingFaceRequest(MODELS.summarization, text, {
      max_length: maxLength,
      min_length: minLength,
      do_sample: false
    });

    res.json({
      success: true,
      data: {
        summary: result[0]?.summary_text || '',
        originalLength: text.length,
        summaryLength: result[0]?.summary_text?.length || 0
      }
    });

  } catch (error) {
    console.error('Text summarization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize text',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Keyword extraction endpoint
exports.extractKeywords = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text } = req.body;

    const result = await makeHuggingFaceRequest(MODELS.keywordExtraction, text);

    res.json({
      success: true,
      data: {
        keywords: result || []
      }
    });

  } catch (error) {
    console.error('Keyword extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract keywords',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Sentiment analysis endpoint
exports.analyzeSentiment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text } = req.body;

    const result = await makeHuggingFaceRequest(MODELS.sentimentAnalysis, text);

    res.json({
      success: true,
      data: {
        sentiment: result[0] || { label: 'NEUTRAL', score: 0.5 }
      }
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze sentiment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Text enhancement using multiple AI services
exports.enhanceText = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, options = {} } = req.body;
    const results = {
      original: text,
      enhanced: text,
      improvements: [],
      confidence: 0,
      processingTime: Date.now()
    };

    try {
      // Step 1: Grammar check using Hugging Face
      if (options.grammarCheck !== false) {
        const grammarResult = await makeHuggingFaceRequest(MODELS.grammarCheck, text);
        if (grammarResult && grammarResult[0]?.label === 'ACCEPTABLE') {
          results.improvements.push({
            type: 'grammar',
            status: 'good',
            confidence: grammarResult[0].score
          });
        }
      }

      // Step 2: Punctuation restoration
      if (options.punctuationFix !== false) {
        try {
          const punctuationResult = await makeHuggingFaceRequest(MODELS.punctuationRestoration, text);
          if (punctuationResult && punctuationResult[0]?.generated_text) {
            results.enhanced = punctuationResult[0].generated_text;
            results.improvements.push({
              type: 'punctuation', status: 'improved',
              before: text,
              after: punctuationResult[0].generated_text
            });
          }
        } catch (punctError) {
          // Punctuation restoration failed, continue with other enhancements
        }
      }

      // Step 3: TextRazor analysis (if available)
      if (options.entityExtraction !== false && TEXTRAZOR_API_KEY) {
        try {
          const textRazorResult = await makeTextRazorRequest(text, ['entities', 'topics']);
          if (textRazorResult && textRazorResult.response) {
            results.improvements.push({
              type: 'entities',
              data: textRazorResult.response.entities || [],
              topics: textRazorResult.response.topics || []
            });
          }
        } catch (textRazorError) {
          // TextRazor analysis failed, continue with other enhancements
        }
      }

    } catch (enhancementError) {
      // Some enhancement steps failed, returning partial results
    }

    results.confidence = results.improvements.length > 0 ?
      results.improvements.reduce((acc, imp) => acc + (imp.confidence || 0.5), 0) / results.improvements.length : 0.5;
    results.processingTime = Date.now() - results.processingTime;

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Text enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance text',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Question answering endpoint
exports.answerQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { question, context } = req.body;

    const result = await makeHuggingFaceRequest(MODELS.questionAnswering, {
      question,
      context
    });

    res.json({
      success: true,
      data: {
        answer: result.answer || 'No answer found',
        confidence: result.score || 0,
        start: result.start || 0,
        end: result.end || 0
      }
    });

  } catch (error) {
    console.error('Question answering error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Universal AI Agent integration endpoints
exports.summarizeTextWithUniversalAgent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text_content, summary_length = 'medium' } = req.body;

    const response = await axios.post(`${UNIVERSAL_AI_AGENT_URL}/summarize-text`, {
      text_content,
      summary_length
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: {
        summary: response.data.summary,
        originalLength: response.data.input_length,
        summaryLength: response.data.summary_length,
        service: 'universal-ai-agent'
      }
    });

  } catch (error) {
    console.error('Universal AI Agent text summarization error:', error);
    // Fallback to original Hugging Face implementation
    try {
      const fallbackResult = await makeHuggingFaceRequest(MODELS.summarization, req.body.text_content, {
        max_length: 150,
        min_length: 30,
        do_sample: false
      });

      res.json({
        success: true,
        data: {
          summary: fallbackResult[0]?.summary_text || '',
          originalLength: req.body.text_content.length,
          summaryLength: fallbackResult[0]?.summary_text?.length || 0,
          service: 'hugging-face-fallback'
        }
      });
    } catch (fallbackError) {
      next(error);
    }
  }
};

exports.summarizeYouTubeWithUniversalAgent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { youtube_url, summary_length = 'medium' } = req.body;

    const response = await axios.post(`${UNIVERSAL_AI_AGENT_URL}/summarize-youtube`, {
      youtube_url,
      summary_length
    }, {
      timeout: 120000, // YouTube videos might take longer
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: {
        summary: response.data.summary,
        video_url: response.data.video_url,
        summaryLength: response.data.summary_length,
        service: 'universal-ai-agent'
      }
    });

  } catch (error) {
    console.error('Universal AI Agent YouTube summarization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize YouTube video',
      error: error.message
    });
  }
};

exports.chatWithUniversalAgent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { prompt } = req.body;

    const response = await axios.post(`${UNIVERSAL_AI_AGENT_URL}/chat`, {
      prompt
    }, {
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: response.data.response,
      service: 'universal-ai-agent'
    });

  } catch (error) {
    console.error('Universal AI Agent chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request',
      error: error.message
    });
  }
};
