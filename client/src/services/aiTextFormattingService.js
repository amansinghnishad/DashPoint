/**
 * AI Text Formatting Service
 * 
 * @deprecated This service is deprecated. Use universalAIAPI from services/api.js instead.
 * The Universal AI Agent provides superior text processing capabilities.
 * 
 * This file is kept minimal for backward compatibility and fallback support only.
 * All complex functionality has been removed. Use Universal AI Agent for new features.
 */

import secureAIService from './secureAIService.js';

class AITextFormattingService {
  constructor() {
    this.secureService = secureAIService;

    // Deprecation warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 DEPRECATED: aiTextFormattingService.js is deprecated. Use universalAIAPI.summarizeText() for better text processing.');
    }
  }

  /**
   * Format text using comprehensive AI services (server-side)
   * @deprecated Use universalAIAPI.summarizeText() instead
   */
  async formatText(text, options = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ formatText() is deprecated. Use universalAIAPI.summarizeText() for better formatting.');
    }

    try {
      return await this.secureService.formatText(text, options);
    } catch (error) {
      console.error('AI formatting error, using basic fallback:', error);
      return {
        success: false,
        formatted: this.basicFormat(text),
        confidence: 0.2,
        error: error.message
      };
    }
  }

  /**
   * Check if the service is properly configured
   * @deprecated Always returns true since handled server-side
   */
  isConfigured() {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ isConfigured() is deprecated. Universal AI Agent handles configuration automatically.');
    }
    return true; // Always true since handled server-side
  }

  /**
   * Basic text formatting as fallback
   * Minimal implementation for emergency fallback only
   */
  basicFormat(text) {
    if (!text || typeof text !== 'string') return '';

    return text
      .replace(/\s+/g, ' ') // Fix spacing
      .replace(/\s*([,.!?;:])\s*/g, '$1 ') // Fix punctuation spacing
      .replace(/(?:^|\. )([a-z])/g, (match, letter) => // Capitalize sentences
        match.replace(letter, letter.toUpperCase())
      )
      .trim();
  }
}

export default new AITextFormattingService();
