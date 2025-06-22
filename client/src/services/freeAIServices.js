/**
 * Free AI Services Integration
 * 
 * @deprecated This service is deprecated. Use universalAIAPI from services/api.js instead.
 * The Universal AI Agent provides better performance and capabilities.
 * 
 * This file is kept minimal for backward compatibility and fallback support only.
 */

import secureAIService from './secureAIService.js';

class FreeAIServices {
  constructor() {
    this.secureService = secureAIService;

    // Deprecation warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 DEPRECATED: freeAIServices.js is deprecated. Use universalAIAPI from services/api.js instead for better AI capabilities.');
    }
  }

  /**
   * Enhanced text formatting using multiple AI services (now server-side)
   * @deprecated Use universalAIAPI.summarizeText() instead
   */
  async enhanceText(text, options = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ enhanceText() is deprecated. Use universalAIAPI.summarizeText() for better results.');
    }

    try {
      return await this.secureService.enhanceText(text, options);
    } catch (error) {
      console.error('Text enhancement error:', error); return {
        success: false,
        data: {
          original: text,
          enhanced: this.basicTextFormat(text),
          improvements: ['Basic text formatting applied'],
          confidence: 0.3
        },
        message: error.message
      };
    }
  }

  /**
   * Basic text formatting as emergency fallback
   */
  basicTextFormat(text) {
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

export default new FreeAIServices();
