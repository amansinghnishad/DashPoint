

import secureAIService from './secureAIService.js';

class HuggingFaceService {
  constructor() {
    this.secureService = secureAIService;

    // Deprecation warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 DEPRECATED: huggingFaceService.js is deprecated. Use universalAIAPI from services/api.js for superior AI capabilities.');
    }
  }

  /**
   * Check if API token is configured (always true now since handled server-side)
   * @deprecated Service is deprecated
   */
  isConfigured() {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ isConfigured() is deprecated. Universal AI Agent handles configuration automatically.');
    }
    return true; // Always true since handled server-side
  }

  /**
   * Extract content with AI enhancements (legacy fallback)
   * @deprecated Use universalAIAPI.summarizeText() instead
   */
  async extractContent(text, options = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ extractContent() is deprecated. Use universalAIAPI.summarizeText() for better results.');
    }

    try {
      // Try to use secure service for content analysis
      const analysisResult = await this.secureService.analyzeContent(text, {
        sentiment: options.includeSentiment || false,
        keywords: options.includeKeywords || false,
        summary: options.includeSummary || false
      });

      if (analysisResult.success) {
        return {
          success: true,
          data: {
            summary: analysisResult.data.summary ? {
              summary: analysisResult.data.summary,
              method: 'Secure AI Service'
            } : null,
            keywords: analysisResult.data.keywords ? {
              keywords: analysisResult.data.keywords
            } : null,
            sentiment: analysisResult.data.sentiment ? {
              sentiment: analysisResult.data.sentiment.label || 'neutral',
              confidence: analysisResult.data.sentiment.score || 0.5
            } : null
          }
        };
      }
    } catch (error) {
      console.error('Content extraction error:', error);
    }

    // Basic fallback
    return {
      success: false,
      data: {
        summary: { summary: this.basicSummary(text), method: 'Basic fallback' },
        keywords: { keywords: [] },
        sentiment: { sentiment: 'neutral', confidence: 0.5 }
      },
      message: 'Fallback to basic processing'
    };
  }

  /**
   * Basic text summary as emergency fallback
   */
  basicSummary(text) {
    if (!text || typeof text !== 'string') return '';

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';

    if (text.split(/\s+/).length <= 50) return text;

    return firstSentence + (sentences.length > 1 ? '...' : '');
  }
}

export default new HuggingFaceService();
