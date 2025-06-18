/**
 * Hugging Face API Service for Content Extraction
 * Provides text summarization, keyword extraction, and content analysis
 */

class HuggingFaceService {
  constructor() {
    this.token = import.meta.env.VITE_HUGGING_FACE_TOKEN;
    this.baseUrl = 'https://api-inference.huggingface.co/models';

    // Available models for different tasks
    this.models = {
      summarization: 'facebook/bart-large-cnn',
      keywordExtraction: 'ml6team/keyphrase-extraction-kbir-inspec',
      sentimentAnalysis: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      questionAnswering: 'deepset/roberta-base-squad2'
    };
  }

  /**
   * Check if API token is configured
   */
  isConfigured() {
    return !!this.token && this.token !== 'your_hugging_face_token_here';
  }

  /**
   * Make API request to Hugging Face
   */
  async makeRequest(modelPath, inputs, parameters = {}) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face token not configured. Please add VITE_HUGGING_FACE_TOKEN to your .env file.');
    }

    const response = await fetch(`${this.baseUrl}/${modelPath}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs,
        parameters,
        options: {
          wait_for_model: true
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Summarize text content
   */
  async summarizeText(text, options = {}) {
    try {
      const {
        maxLength = 150,
        minLength = 50,
        doSample = false
      } = options;

      // Truncate input if too long (BART has ~1024 token limit)
      const truncatedText = text.length > 3000 ? text.substring(0, 3000) + '...' : text;

      const result = await this.makeRequest(
        this.models.summarization,
        truncatedText,
        {
          max_length: maxLength,
          min_length: minLength,
          do_sample: doSample
        }
      );

      return {
        success: true,
        summary: result[0]?.summary_text || 'Unable to generate summary',
        originalLength: text.length,
        summaryLength: result[0]?.summary_text?.length || 0,
        method: 'AI-powered (BART)'
      };
    } catch (error) {
      console.error('Summarization failed:', error);
      return {
        success: false,
        error: error.message,
        summary: this.fallbackSummary(text),
        method: 'Fallback extraction'
      };
    }
  }

  /**
   * Extract keywords from text
   */
  async extractKeywords(text, options = {}) {
    try {
      const { maxKeywords = 10 } = options;

      const result = await this.makeRequest(
        this.models.keywordExtraction,
        text
      );

      const keywords = Array.isArray(result)
        ? result.slice(0, maxKeywords).map(item =>
          typeof item === 'string' ? item : item.word || item.text
        )
        : [];

      return {
        success: true,
        keywords,
        method: 'AI-powered extraction'
      };
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      return {
        success: false,
        error: error.message,
        keywords: this.fallbackKeywords(text),
        method: 'Fallback extraction'
      };
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text) {
    try {
      const result = await this.makeRequest(
        this.models.sentimentAnalysis,
        text
      );

      const sentiment = result[0];
      return {
        success: true,
        sentiment: sentiment.label.toLowerCase(),
        confidence: sentiment.score,
        method: 'AI-powered analysis'
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return {
        success: false,
        error: error.message,
        sentiment: 'neutral',
        confidence: 0,
        method: 'Fallback'
      };
    }
  }

  /**
   * Complete content extraction with multiple features
   */
  async extractContent(text, options = {}) {
    const {
      includeSummary = true,
      includeKeywords = true,
      includeSentiment = false,
      summaryOptions = {},
      keywordOptions = {}
    } = options;

    const results = {
      originalText: text,
      textLength: text.length,
      wordCount: text.split(/\s+/).length,
      extractedAt: new Date().toISOString()
    };

    const promises = [];

    if (includeSummary) {
      promises.push(
        this.summarizeText(text, summaryOptions)
          .then(result => ({ type: 'summary', data: result }))
      );
    }

    if (includeKeywords) {
      promises.push(
        this.extractKeywords(text, keywordOptions)
          .then(result => ({ type: 'keywords', data: result }))
      );
    }

    if (includeSentiment) {
      promises.push(
        this.analyzeSentiment(text)
          .then(result => ({ type: 'sentiment', data: result }))
      );
    }

    try {
      const responses = await Promise.allSettled(promises);

      responses.forEach(response => {
        if (response.status === 'fulfilled') {
          const { type, data } = response.value;
          results[type] = data;
        }
      });

      return {
        success: true,
        data: results,
        provider: 'Hugging Face'
      };
    } catch (error) {
      console.error('Content extraction failed:', error);
      return {
        success: false,
        error: error.message,
        data: {
          ...results,
          summary: { summary: this.fallbackSummary(text), method: 'Fallback' },
          keywords: { keywords: this.fallbackKeywords(text), method: 'Fallback' }
        },
        provider: 'Fallback'
      };
    }
  }

  /**
   * Fallback summary when API fails
   */
  fallbackSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const maxSentences = Math.min(3, sentences.length);
    return sentences.slice(0, maxSentences).join('. ').trim() + '.';
  }

  /**
   * Fallback keyword extraction when API fails
   */
  fallbackKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Get API usage information
   */
  getUsageInfo() {
    return {
      provider: 'Hugging Face',
      freeLimit: '30,000 requests/month',
      models: this.models,
      configured: this.isConfigured(),
      documentation: 'https://huggingface.co/docs/api-inference/index'
    };
  }
}

export default new HuggingFaceService();
