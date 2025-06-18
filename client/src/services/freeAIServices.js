/**
 * Free AI Services Integration
 * Secure proxy service that routes through the server
 */

import secureAIService from './secureAIService.js';

class FreeAIServices {
  constructor() {
    this.secureService = secureAIService;
  }

  /**
   * Enhanced text formatting using multiple AI services (now server-side)
   */
  async enhanceText(text, options = {}) {
    try {
      return await this.secureService.enhanceText(text, options);
    } catch (error) {
      console.error('Text enhancement error:', error);
      return {
        success: false,
        data: {
          original: text,
          enhanced: this.basicTextFormat(text),
          improvements: [{ type: 'basic', status: 'fallback' }],
          confidence: 0.3
        },
        message: error.message
      };
    }
  }

  /**
   * Format text using server-side AI services
   */
  async formatText(text, options = {}) {
    return this.secureService.formatText(text, options);
  }

  /**
   * Grammar correction using server-side services
   */
  async correctGrammar(text) {
    try {
      const result = await this.secureService.enhanceText(text, { grammarCheck: true });
      return result.success ? result.data.enhanced : text;
    } catch (error) {
      console.error('Grammar correction error:', error);
      return this.basicTextFormat(text);
    }
  }

  /**
   * Punctuation restoration using server-side services
   */
  async restorePunctuation(text) {
    try {
      const result = await this.secureService.enhanceText(text, { punctuationFix: true });
      return result.success ? result.data.enhanced : text;
    } catch (error) {
      console.error('Punctuation restoration error:', error);
      return this.basicTextFormat(text);
    }
  }

  /**
   * Text summarization using server-side services
   */
  async summarizeText(text, options = {}) {
    try {
      const result = await this.secureService.summarizeText(text, options);
      return result.success ? result.data.summary : this.fallbackSummary(text);
    } catch (error) {
      console.error('Text summarization error:', error);
      return this.fallbackSummary(text);
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
   * Fallback summary method
   */
  fallbackSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';
    const wordCount = text.split(/\s+/).length;

    if (wordCount <= 50) return text;

    return firstSentence + (sentences.length > 1 ? '...' : '');
  }

  /**
   * Get text quality score (basic implementation)
   */
  getTextQualityScore(text) {
    let score = 0;

    // Check for proper capitalization
    const sentences = text.split(/[.!?]+/);
    const capitalizedSentences = sentences.filter(s =>
      s.trim().length > 0 && /^[A-Z]/.test(s.trim())
    ).length;

    if (sentences.length > 0) {
      score += (capitalizedSentences / sentences.length) * 0.3;
    }

    // Check for proper punctuation
    const hasPunctuation = /[.!?]$/.test(text.trim());
    if (hasPunctuation) score += 0.2;

    // Check for reasonable sentence length
    const avgSentenceLength = sentences.reduce((acc, s) =>
      acc + s.split(/\s+/).length, 0) / sentences.length;

    if (avgSentenceLength >= 5 && avgSentenceLength <= 25) {
      score += 0.3;
    }

    // Check for spelling (basic word recognition)
    const words = text.toLowerCase().split(/\s+/);
    const recognizedWords = words.filter(word =>
      word.length >= 2 && /^[a-z]+$/.test(word)
    ).length;

    if (words.length > 0) {
      score += (recognizedWords / words.length) * 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Batch process multiple texts
   */
  async batchEnhanceTexts(texts, options = {}) {
    const results = [];

    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await this.enhanceText(texts[i], options);
        results.push(result);

        // Add delay to avoid rate limiting
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          data: {
            original: texts[i],
            enhanced: this.basicTextFormat(texts[i])
          }
        });
      }
    }

    return results;
  }

  /**
   * Get service configuration status
   */
  getServiceStatus() {
    return this.secureService.getServiceStatus();
  }

  /**
   * Check if services are available
   */
  async isAvailable() {
    try {
      const status = await this.getServiceStatus();
      return status.available;
    } catch (error) {
      return false;
    }
  }
}

export default new FreeAIServices();
