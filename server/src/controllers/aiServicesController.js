const axios = require('axios');
const { validationResult } = require('express-validator');

const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
const TEXTRAZOR_API_KEY = process.env.TEXTRAZOR_API_KEY;
const DASHPOINT_AI_AGENT_URL = process.env.DASHPOINT_AI_AGENT_URL || 'http://localhost:8000';

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

// DashPoint AI Agent integration endpoints
exports.summarizeTextWithDashPointAgent = async (req, res, next) => {
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

    const response = await axios.post(`${DASHPOINT_AI_AGENT_URL}/summarize-text`, {
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
        originalLength: response.data.original_length,
        summaryLength: response.data.summary_length,
        service: 'dashpoint-ai-agent'
      }
    });

  } catch (error) {
    console.error('DashPoint AI Agent text summarization error:', error);
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

exports.summarizeYouTubeWithDashPointAgent = async (req, res, next) => {
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

    const response = await axios.post(`${DASHPOINT_AI_AGENT_URL}/summarize-youtube`, {
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
        service: 'dashpoint-ai-agent'
      }
    });

  } catch (error) {
    console.error('DashPoint AI Agent YouTube summarization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize YouTube video',
      error: error.message
    });
  }
};

exports.chatWithDashPointAgent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { prompt, approve, api_call: approvedApiCall } = req.body;

    // If the client already approved an action, execute it directly (still allowlisted).
    if (approve === true && approvedApiCall) {
      const executionResult = await executeAllowedApiCall(approvedApiCall, req);
      const responseTextParts = ['Action executed successfully.'];
      return res.json({
        success: true,
        data: {
          response: responseTextParts.join('\n'),
          requiresApproval: false,
          pending_action: null,
          execution_result: executionResult,
        },
        service: 'dashpoint-ai-agent'
      });
    }

    // Prefer the conversational endpoint since it can return an actionable api_call.
    const userTimezone = req.user?.preferences?.timezone || 'UTC';
    let agentResult = null;
    try {
      const agentResponse = await axios.post(`${DASHPOINT_AI_AGENT_URL}/conversational`, {
        command: prompt,
        context: {
          userId: req.user?._id,
          timezone: userTimezone,
        }
      }, {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      agentResult = agentResponse.data || {};
    } catch (agentConvError) {
      const status = agentConvError?.response?.status;
      const detail = agentConvError?.response?.data?.detail || agentConvError?.response?.data?.message || agentConvError?.message;

      // Only fall back to /chat if /conversational is not implemented on this agent.
      if (status === 404) {
        try {
          const fallbackResponse = await axios.post(`${DASHPOINT_AI_AGENT_URL}/chat`, { prompt }, {
            timeout: 120000,
            headers: { 'Content-Type': 'application/json' }
          });

          const fallbackPayload = fallbackResponse.data || {};
          const fallbackResults = Array.isArray(fallbackPayload.results) ? fallbackPayload.results : [];
          const text = fallbackResults
            .map((item) => {
              if (item?.type === 'text') return item.content;
              if (item?.type === 'function_result') return JSON.stringify(item.result);
              return JSON.stringify(item);
            })
            .filter(Boolean)
            .join('\n');

          return res.json({
            success: true,
            data: {
              response: text || 'AI agent responded, but no text was returned.',
              action: 'chat',
              api_call: null,
              execution_result: null,
            },
            service: 'dashpoint-ai-agent'
          });
        } catch (fallbackError) {
          const fallbackDetail = fallbackError?.response?.data?.detail || fallbackError?.message;
          return res.status(502).json({
            success: false,
            message: `DashPoint AI Agent is running but failed to process requests (${fallbackError?.response?.status || 'error'}).`,
            error: fallbackDetail,
          });
        }
      }

      // /conversational exists but failed: surface the agent's error so we can fix it.
      return res.status(502).json({
        success: false,
        message: 'DashPoint AI Agent failed to process the request.',
        error: detail,
      });
    }

    const responseMessage = agentResult?.message || 'Done.';

    // Require explicit user approval before executing any action.
    const hasPendingAction = Boolean(agentResult?.api_call);
    const responseTextParts = [responseMessage];
    if (hasPendingAction) {
      responseTextParts.push('Proposed action ready. Click Approve to execute.');
    }

    res.json({
      success: true,
      data: {
        response: responseTextParts.join('\n'),
        action: agentResult.action,
        confidence: agentResult.confidence,
        method: agentResult.method,
        requiresApproval: hasPendingAction,
        pending_action: hasPendingAction ? agentResult.api_call : null,
        execution_result: null,
      },
      service: 'dashpoint-ai-agent'
    });

  } catch (error) {
    console.error('DashPoint AI Agent chat error:', error);
    const isAxios = Boolean(error && (error.isAxiosError || error.response || error.request));
    const agentUnavailable = isAxios && (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT');
    const status = agentUnavailable ? 503 : 500;
    res.status(status).json({
      success: false,
      message: agentUnavailable
        ? 'DashPoint AI Agent is not available. Start the Agent service and try again.'
        : 'Failed to process chat request',
      error: error.message
    });
  }
};

async function executeAllowedApiCall(apiCall, req) {
  const { endpoint, method, data, params } = apiCall || {};

  const allowedEndpoints = new Set([
    '/api/calendar/google/schedule',
    '/api/calendar/google/freebusy',
  ]);

  if (!endpoint || typeof endpoint !== 'string' || !allowedEndpoints.has(endpoint)) {
    return {
      success: false,
      message: 'Action is not supported yet'
    };
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  const httpMethod = (method || 'POST').toLowerCase();

  const response = await axios({
    url: `${baseUrl}${endpoint}`,
    method: httpMethod,
    headers,
    params: params || undefined,
    data: data || undefined,
    timeout: 120000,
  });

  return response.data;
}
