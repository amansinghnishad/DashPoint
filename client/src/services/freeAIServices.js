/**
 * Free AI Services Integration
 * Combines multiple free AI APIs for text formatting and enhancement
 */

class FreeAIServices {
  constructor() {
    this.services = {
      // Free text processing APIs
      huggingFace: {
        token: import.meta.env.VITE_HUGGING_FACE_TOKEN,
        baseUrl: 'https://api-inference.huggingface.co/models'
      },

      // Free grammar checking (using public APIs)
      languageTool: {
        baseUrl: 'https://api.languagetool.org/v2'
      },

      // Free text analysis
      textRazor: {
        apiKey: import.meta.env.VITE_TEXTRAZOR_API_KEY,
        baseUrl: 'https://api.textrazor.com'
      }
    };

    // Models for different tasks
    this.models = {
      grammarCheck: 'textattack/roberta-base-CoLA',
      textSummarization: 'facebook/bart-large-cnn',
      sentenceSimplification: 'tuner007/pegasus_paraphrase',
      punctuationRestoration: 'felflare/bert-restore-punctuation',
      textCleaning: 'microsoft/DialoGPT-medium'
    };
  }

  /**
   * Enhanced text formatting using multiple AI services
   */
  async enhanceText(text, options = {}) {
    const results = {
      original: text,
      enhanced: text,
      improvements: [],
      confidence: 0,
      processingTime: Date.now()
    };

    try {
      // Step 1: Grammar and punctuation correction
      if (options.correctGrammar !== false) {
        const grammarResult = await this.correctGrammarWithLanguageTool(text);
        if (grammarResult.success) {
          results.enhanced = grammarResult.text;
          results.improvements.push(...grammarResult.corrections);
          results.confidence += 25;
        }
      }

      // Step 2: Punctuation restoration
      if (options.restorePunctuation !== false) {
        const punctuationResult = await this.restorePunctuation(results.enhanced);
        if (punctuationResult.success) {
          results.enhanced = punctuationResult.text;
          results.improvements.push('Punctuation restored');
          results.confidence += 20;
        }
      }

      // Step 3: Sentence simplification
      if (options.simplifySentences !== false) {
        const simplificationResult = await this.simplifySentences(results.enhanced);
        if (simplificationResult.success) {
          results.enhanced = simplificationResult.text;
          results.improvements.push('Sentences simplified');
          results.confidence += 30;
        }
      }

      // Step 4: Text cleaning and formatting
      if (options.cleanText !== false) {
        const cleaningResult = await this.cleanAndFormatText(results.enhanced);
        if (cleaningResult.success) {
          results.enhanced = cleaningResult.text;
          results.improvements.push('Text cleaned and formatted');
          results.confidence += 25;
        }
      }

    } catch (error) {
      console.warn('AI enhancement failed:', error);
      results.enhanced = this.applyBasicFormatting(text);
      results.improvements.push('Basic formatting applied');
      results.confidence = 50;
    }

    results.processingTime = Date.now() - results.processingTime;
    return results;
  }

  /**
   * Use LanguageTool API for grammar correction (Free tier: 20 requests/minute)
   */
  async correctGrammarWithLanguageTool(text) {
    try {
      const response = await fetch(`${this.services.languageTool.baseUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          language: 'en-US',
          enabledOnly: 'false'
        })
      });

      if (!response.ok) {
        throw new Error(`LanguageTool API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.matches && result.matches.length > 0) {
        let correctedText = text;
        const corrections = [];

        // Apply corrections in reverse order to maintain string positions
        for (const match of result.matches.reverse()) {
          if (match.replacements && match.replacements[0]) {
            const before = correctedText.substring(0, match.offset);
            const after = correctedText.substring(match.offset + match.length);
            correctedText = before + match.replacements[0].value + after;

            corrections.push({
              type: 'grammar',
              original: match.context.text.substring(match.offset, match.offset + match.length),
              corrected: match.replacements[0].value,
              rule: match.rule.description
            });
          }
        }

        return {
          success: true,
          text: correctedText,
          corrections: corrections
        };
      }

      return { success: true, text: text, corrections: [] };
    } catch (error) {
      console.warn('LanguageTool correction failed:', error);
      return { success: false, text: text, error: error.message };
    }
  }

  /**
   * Restore punctuation using Hugging Face
   */
  async restorePunctuation(text) {
    try {
      const response = await this.makeHuggingFaceRequest(
        this.models.punctuationRestoration,
        text
      );

      if (response && response[0] && response[0].generated_text) {
        return {
          success: true,
          text: response[0].generated_text
        };
      }
    } catch (error) {
      console.warn('Punctuation restoration failed:', error);
    }

    return { success: false, text: text };
  }

  /**
   * Simplify complex sentences
   */
  async simplifySentences(text) {
    try {
      // Split into sentences and process complex ones
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const simplifiedSentences = [];

      for (const sentence of sentences) {
        // Only simplify long, complex sentences
        if (sentence.length > 100 && sentence.includes(',')) {
          try {
            const response = await this.makeHuggingFaceRequest(
              this.models.sentenceSimplification,
              sentence.trim()
            );

            if (response && response[0] && response[0].generated_text) {
              simplifiedSentences.push(response[0].generated_text);
            } else {
              simplifiedSentences.push(sentence);
            }
          } catch (error) {
            simplifiedSentences.push(sentence);
          }

          // Rate limiting
          await this.delay(200);
        } else {
          simplifiedSentences.push(sentence);
        }
      }

      return {
        success: true,
        text: simplifiedSentences.join('. ').trim() + '.'
      };
    } catch (error) {
      console.warn('Sentence simplification failed:', error);
      return { success: false, text: text };
    }
  }

  /**
   * Clean and format text structure
   */
  async cleanAndFormatText(text) {
    try {
      let cleanedText = text;

      // Remove web artifacts and unwanted patterns
      cleanedText = cleanedText
        .replace(/\b(Advertisement|Sponsored|Related Articles?|Tags?:|Filed under:|Share this|Print this)\b/gi, '')
        .replace(/\b(Click here|Read more|Continue reading|Skip to content|Back to top)\b/gi, '')
        .replace(/\b(Facebook|Twitter|Instagram|LinkedIn|Subscribe|Follow|Like)\b/gi, '')
        .replace(/\b(Cookie|Privacy Policy|Terms of Service|Accept|Decline)\b/gi, '');

      // Normalize whitespace and punctuation
      cleanedText = cleanedText
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
        .replace(/([,;:])\s*/g, '$1 ')
        .replace(/\s+([.!?])/g, '$1');

      // Improve paragraph structure
      cleanedText = cleanedText
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 20)
        .join('\n\n');

      // Capitalize sentences
      cleanedText = cleanedText.replace(/(^|\.\s+)([a-z])/g, (match, prefix, letter) => {
        return prefix + letter.toUpperCase();
      });

      return {
        success: true,
        text: cleanedText.trim()
      };
    } catch (error) {
      console.warn('Text cleaning failed:', error);
      return { success: false, text: text };
    }
  }

  /**
   * Make request to Hugging Face API
   */
  async makeHuggingFaceRequest(model, inputs, parameters = {}) {
    const token = this.services.huggingFace.token;

    if (!token || token === 'your_hugging_face_token_here') {
      throw new Error('Hugging Face token not configured');
    }

    const response = await fetch(`${this.services.huggingFace.baseUrl}/${model}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: inputs,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          do_sample: false,
          ...parameters
        },
        options: {
          wait_for_model: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Apply basic formatting when AI services are unavailable
   */
  applyBasicFormatting(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, '$1 $2')
      .replace(/\b(Advertisement|Sponsored|Click here|Read more)\b/gi, '')
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 15)
      .join('\n\n')
      .trim();
  }

  /**
   * Get text quality score
   */
  getTextQualityScore(text) {
    let score = 0;

    // Length check
    if (text.length > 100) score += 20;

    // Sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 1) score += 20;

    // Proper capitalization
    if (/^[A-Z]/.test(text)) score += 10;

    // Punctuation
    if (/[.!?]$/.test(text.trim())) score += 10;

    // No excessive repetition
    if (!/(.{3,})\1{3,}/.test(text)) score += 20;

    // Paragraph structure
    if (text.includes('\n\n')) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Add delay for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch process multiple texts
   */
  async batchEnhanceTexts(texts, options = {}) {
    const results = [];

    for (let i = 0; i < texts.length; i++) {
      const result = await this.enhanceText(texts[i], options);
      results.push(result);

      // Rate limiting between requests
      if (i < texts.length - 1) {
        await this.delay(500);
      }
    }

    return results;
  }
}

export default new FreeAIServices();
