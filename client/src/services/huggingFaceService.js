/**
 * Hugging Face API Service for Content Extraction
 * Secure proxy service that routes through the server
 */

import secureAIService from './secureAIService.js';

class HuggingFaceService {
  constructor() {
    this.secureService = secureAIService;
  }

  /**
   * Check if API token is configured (always true now since handled server-side)
   */
  isConfigured() {
    return true; // Always true since handled server-side
  }
  /**
   * Make API request to Hugging Face (proxied through server)
   */
  async makeRequest(modelPath, inputs, parameters = {}) {
    // Route to appropriate secure service method
    if (modelPath.includes('summarization')) {
      return this.secureService.summarizeText(inputs, parameters);
    } else if (modelPath.includes('sentiment')) {
      return this.secureService.analyzeSentiment(inputs);
    } else if (modelPath.includes('keyword')) {
      return this.secureService.extractKeywords(inputs);
    }

    throw new Error(`Unsupported model path: ${modelPath}`);
  }

  /**
   * Summarize text using secure server-side API
   */
  async summarizeText(text, options = {}) {
    try {
      const result = await this.secureService.summarizeText(text, options);
      return result.success ? [{ summary_text: result.data.summary }] : [];
    } catch (error) {
      console.error('Summarization error:', error);
      return [{ summary_text: this.fallbackSummary(text) }];
    }
  }

  /**
   * Extract keywords using secure server-side API
   */
  async extractKeywords(text) {
    try {
      const result = await this.secureService.extractKeywords(text);
      return result.success ? result.data.keywords : [];
    } catch (error) {
      console.error('Keyword extraction error:', error);
      return this.fallbackKeywords(text);
    }
  }

  /**
   * Analyze sentiment using secure server-side API
   */
  async analyzeSentiment(text) {
    try {
      const result = await this.secureService.analyzeSentiment(text);
      return result.success ? [result.data.sentiment] : [];
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return [{ label: 'NEUTRAL', score: 0.5 }];
    }
  }

  /**
   * Answer questions using secure server-side API
   */
  async answerQuestion(question, context) {
    try {
      const result = await this.secureService.answerQuestion(question, context);
      return result.success ? result.data : { answer: 'No answer found', score: 0 };
    } catch (error) {
      console.error('Question answering error:', error);
      return { answer: 'Service unavailable', score: 0 };
    }
  }

  /**
   * Extract and analyze content comprehensively
   */
  async extractContent(text, options = {}) {
    try {
      const result = await this.secureService.analyzeContent(text, options);
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Content extraction error:', error);
      return {
        summary: this.fallbackSummary(text),
        keywords: this.fallbackKeywords(text),
        sentiment: { label: 'NEUTRAL', score: 0.5 },
        metadata: {
          wordCount: text.split(/\s+/).length,
          charCount: text.length,
          readingTime: Math.ceil(text.split(/\s+/).length / 200)
        }
      };
    }
  }

  /**
   * Fallback summary method for when API is unavailable
   */
  fallbackSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';
    const wordCount = text.split(/\s+/).length;

    if (wordCount <= 50) return text;

    return firstSentence + (sentences.length > 1 ? '...' : '');
  }

  /**
   * Fallback keyword extraction for when API is unavailable
   */
  fallbackKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => ({ text: word, score: 0.5 }));
  }

  /**
   * Get service usage information
   */
  getUsageInfo() {
    return {
      service: 'Secure AI Service (Server-side)',
      authenticated: this.secureService.isAuthenticated(),
      deprecated: true,
      recommendation: 'Use secureAIService.js directly'
    };
  }
}

export default new HuggingFaceService();
