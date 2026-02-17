const axios = require('axios');
const { validationResult } = require('express-validator');

const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
const TEXTRAZOR_API_KEY = process.env.TEXTRAZOR_API_KEY;

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
  punctuationRestoration: 'felflare/bert-restore-punctuation',
  chat: 'facebook/blenderbot-400M-distill'
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

  const formBody = new URLSearchParams();
  formBody.append('text', text);
  formBody.append('extractors', extractors.join(','));

  const response = await axios.post(`${TEXTRAZOR_BASE_URL}/`, formBody.toString(), {
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

// Simple chat endpoint (no function calling / approvals)
exports.chat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message } = req.body;

    const result = await makeHuggingFaceRequest(
      MODELS.chat,
      String(message || ''),
      {
        max_new_tokens: 200,
        do_sample: true,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false
      }
    );

    let responseText = '';
    if (Array.isArray(result)) {
      responseText = result[0]?.generated_text || result[0]?.summary_text || '';
    } else if (typeof result === 'object' && result) {
      responseText = result.generated_text || result.summary_text || '';
    } else if (typeof result === 'string') {
      responseText = result;
    }

    if (!responseText) {
      responseText = 'No response generated.';
    }

    return res.json({
      success: true,
      data: {
        response: responseText
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate chat response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

