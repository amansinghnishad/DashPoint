/**
 * Secure AI Services API Client
 * All API calls go through the server to keep API keys secure
 */

class SecureAIService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.aiEndpoint = `${this.baseUrl}/ai`;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, data, method = 'POST') {
    try {
      const response = await fetch(`${this.aiEndpoint}${endpoint}`, {
        method,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API request failed: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`AI Service API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Summarize text using server-side Hugging Face API
   */
  async summarizeText(text, options = {}) {
    const { maxLength = 150, minLength = 30 } = options;

    return this.makeRequest('/summarize', {
      text,
      maxLength,
      minLength
    });
  }

  /**
   * Extract keywords from text
   */
  async extractKeywords(text) {
    return this.makeRequest('/keywords', { text });
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text) {
    return this.makeRequest('/sentiment', { text });
  }

  /**
   * Enhance text using multiple AI services
   */
  async enhanceText(text, options = {}) {
    return this.makeRequest('/enhance', {
      text,
      options: {
        grammarCheck: options.grammarCheck !== false,
        punctuationFix: options.punctuationFix !== false,
        entityExtraction: options.entityExtraction !== false,
        ...options
      }
    });
  }

  /**
   * Answer questions based on context
   */
  async answerQuestion(question, context) {
    return this.makeRequest('/answer', {
      question,
      context
    });
  }

  /**
   * Simple chat endpoint
   */
  async chat(message) {
    return this.makeRequest('/chat', { message });
  }

  /**
   * Get comprehensive content analysis
   */
  async analyzeContent(text, options = {}) {
    try {
      const promises = [];

      // Basic analysis
      if (options.sentiment !== false) {
        promises.push(this.analyzeSentiment(text).catch(() => null));
      }

      if (options.keywords !== false) {
        promises.push(this.extractKeywords(text).catch(() => null));
      }

      if (options.summary !== false && text.length > 200) {
        promises.push(this.summarizeText(text, options.summaryOptions).catch(() => null));
      }

      const results = await Promise.all(promises);

      return {
        success: true,
        data: {
          sentiment: results[0]?.data?.sentiment || null,
          keywords: results[1]?.data?.keywords || [],
          summary: results[2]?.data?.summary || null,
          originalText: text,
          analysisTimestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        success: false,
        message: error.message || 'Content analysis failed',
        data: null
      };
    }
  }

  /**
   * Format and enhance text for better readability
   */
  async formatText(text, options = {}) {
    try {
      const enhanceResult = await this.enhanceText(text, {
        grammarCheck: true,
        punctuationFix: true,
        entityExtraction: false,
        ...options
      });

      if (enhanceResult.success) {
        return {
          success: true,
          data: {
            original: text,
            formatted: enhanceResult.data.enhanced,
            improvements: enhanceResult.data.improvements,
            confidence: enhanceResult.data.confidence
          }
        };
      }

      throw new Error(enhanceResult.message || 'Text formatting failed');

    } catch (error) {
      console.error('Text formatting error:', error);

      // Fallback to basic formatting
      const basicFormatted = this.basicTextFormat(text);

      return {
        success: true,
        data: {
          original: text,
          formatted: basicFormatted,
          improvements: [{ type: 'basic', status: 'fallback' }],
          confidence: 0.3
        },
        warning: 'Used basic formatting due to API error'
      };
    }
  }

  /**
   * Basic client-side text formatting as fallback
   */
  basicTextFormat(text) {
    return text
      // Fix common spacing issues
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n\n')

      // Fix punctuation spacing
      .replace(/\s*([,.!?;:])\s*/g, '$1 ')
      .replace(/\s+([.!?])/g, '$1')

      // Capitalize sentences
      .replace(/(?:^|\. )([a-z])/g, (match, letter) =>
        match.replace(letter, letter.toUpperCase())
      )

      // Clean up
      .trim();
  }

  /**
   * Check if user is authenticated for AI services
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  /**
   * Get service status and availability
   */
  async getServiceStatus() {
    try {
      // Try a simple sentiment analysis to test connectivity
      await this.analyzeSentiment('This is a test.');

      return {
        available: true,
        authenticated: this.isAuthenticated(),
        lastChecked: new Date().toISOString(),
        services: {
          sentiment: true,
          keywords: true,
          summarization: true,
          enhancement: true,
          questionAnswering: true
        }
      };
    } catch (error) {
      return {
        available: false,
        authenticated: this.isAuthenticated(),
        lastChecked: new Date().toISOString(),
        error: error.message,
        services: {
          sentiment: false,
          keywords: false,
          summarization: false,
          enhancement: false,
          questionAnswering: false
        }
      };
    }
  }
}

export default new SecureAIService();
