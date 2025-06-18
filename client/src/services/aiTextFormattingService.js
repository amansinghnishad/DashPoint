/**
 * AI Text Formatting Service
 * Secure proxy service that routes through the server
 */

import secureAIService from './secureAIService.js';

class AITextFormattingService {
  constructor() {
    this.secureService = secureAIService;
  }

  /**
   * Format text using comprehensive AI services (server-side)
   */
  async formatText(text, options = {}) {
    return this.secureService.formatText(text, options);
  }

  /**
   * Enhance text readability and structure
   */
  async enhanceReadability(text, options = {}) {
    return this.secureService.enhanceText(text, {
      grammarCheck: true,
      punctuationFix: true,
      ...options
    });
  }

  /**
   * Fix grammar and spelling using AI
   */
  async fixGrammarAndSpelling(text) {
    try {
      const result = await this.secureService.enhanceText(text, {
        grammarCheck: true,
        punctuationFix: true
      });

      return {
        success: result.success,
        formattedText: result.success ? result.data.enhanced : text,
        improvements: result.success ? result.data.improvements : [],
        confidence: result.success ? result.data.confidence : 0
      };
    } catch (error) {
      console.error('Grammar fixing error:', error);
      return {
        success: false,
        formattedText: this.basicFormat(text),
        improvements: [{ type: 'basic', status: 'fallback' }],
        confidence: 0.3,
        error: error.message
      };
    }
  }

  /**
   * Improve text structure and flow
   */
  async improveStructure(text, options = {}) {
    try {
      const result = await this.secureService.enhanceText(text, {
        grammarCheck: true,
        punctuationFix: true,
        entityExtraction: true,
        ...options
      });

      return {
        success: result.success,
        originalText: text,
        improvedText: result.success ? result.data.enhanced : text,
        structuralChanges: result.success ? result.data.improvements : [],
        readabilityScore: this.calculateReadabilityScore(text)
      };
    } catch (error) {
      console.error('Structure improvement error:', error);
      return {
        success: false,
        originalText: text,
        improvedText: this.basicFormat(text),
        structuralChanges: [],
        readabilityScore: this.calculateReadabilityScore(text),
        error: error.message
      };
    }
  }

  /**
   * Format text for specific purposes (email, blog, academic, etc.)
   */
  async formatForPurpose(text, purpose = 'general', options = {}) {
    const purposeSettings = {
      email: {
        grammarCheck: true,
        punctuationFix: true,
        formal: true
      },
      blog: {
        grammarCheck: true,
        punctuationFix: true,
        engaging: true
      },
      academic: {
        grammarCheck: true,
        punctuationFix: true,
        formal: true,
        precise: true
      },
      social: {
        grammarCheck: true,
        casual: true
      },
      general: {
        grammarCheck: true,
        punctuationFix: true
      }
    };

    const settings = purposeSettings[purpose] || purposeSettings.general;

    try {
      const result = await this.secureService.enhanceText(text, {
        ...settings,
        ...options
      });

      return {
        success: result.success,
        originalText: text,
        formattedText: result.success ? result.data.enhanced : this.basicFormat(text),
        purpose,
        appliedSettings: settings,
        improvements: result.success ? result.data.improvements : []
      };
    } catch (error) {
      console.error('Purpose formatting error:', error);
      return {
        success: false,
        originalText: text,
        formattedText: this.basicFormat(text),
        purpose,
        appliedSettings: settings,
        improvements: [],
        error: error.message
      };
    }
  }

  /**
   * Batch format multiple texts
   */
  async batchFormat(texts, options = {}) {
    const results = [];

    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await this.formatText(texts[i], options);
        results.push({
          index: i,
          success: true,
          ...result
        });

        // Add delay to avoid overwhelming the server
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        results.push({
          index: i,
          success: false,
          originalText: texts[i],
          formattedText: this.basicFormat(texts[i]),
          error: error.message
        });
      }
    }

    return {
      success: true,
      totalProcessed: texts.length,
      successfullyProcessed: results.filter(r => r.success).length,
      results
    };
  }

  /**
   * Basic text formatting as fallback
   */
  basicFormat(text) {
    return text
      // Fix spacing
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n\n')

      // Fix punctuation
      .replace(/\s*([,.!?;:])\s*/g, '$1 ')
      .replace(/\s+([.!?])/g, '$1')

      // Capitalize sentences
      .replace(/(?:^|\. )([a-z])/g, (match, letter) =>
        match.replace(letter, letter.toUpperCase())
      )

      // Remove extra spaces before punctuation
      .replace(/\s+([,.!?;:])/g, '$1')

      .trim();
  }

  /**
   * Calculate basic readability score
   */
  calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length || 0;

    // Simple readability score (0-100)
    let score = 100;

    // Penalize very long sentences
    if (avgWordsPerSentence > 20) {
      score -= (avgWordsPerSentence - 20) * 2;
    }

    // Penalize very short sentences
    if (avgWordsPerSentence < 5) {
      score -= (5 - avgWordsPerSentence) * 3;
    }

    // Check for variety in sentence length
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const variance = this.calculateVariance(sentenceLengths);
    if (variance < 5) {
      score -= 10; // Penalize monotonous sentence structure
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate variance for sentence length analysis
   */
  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    return variance;
  }

  /**
   * Get service status and capabilities
   */
  async getCapabilities() {
    try {
      const status = await this.secureService.getServiceStatus();
      return {
        available: status.available,
        authenticated: status.authenticated,
        services: {
          grammarCorrection: status.services?.sentiment || false,
          textEnhancement: status.services?.enhancement || false,
          structureImprovement: status.services?.enhancement || false,
          purposeFormatting: status.services?.enhancement || false,
          batchProcessing: status.available
        },
        limitations: {
          rateLimit: 'Server-side rate limiting applied',
          authRequired: 'User authentication required',
          textLength: 'Maximum 3000 characters per request'
        }
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        services: {
          grammarCorrection: false,
          textEnhancement: false,
          structureImprovement: false,
          purposeFormatting: false,
          batchProcessing: false
        }
      };
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured() {
    return this.secureService.isAuthenticated();
  }

  /**
   * Get usage recommendations
   */
  getUsageRecommendations() {
    return {
      bestPractices: [
        'Use specific purposes (email, blog, academic) for better results',
        'Keep text under 3000 characters for optimal performance',
        'Use batch processing for multiple texts with delays',
        'Always check the confidence score of enhancements'
      ],
      security: [
        'All API calls are now routed through your secure server',
        'API keys are no longer exposed to the client',
        'User authentication is required for AI services'
      ],
      migration: 'This service is deprecated. Use secureAIService.js directly for new implementations.'
    };
  }
}

export default new AITextFormattingService();
