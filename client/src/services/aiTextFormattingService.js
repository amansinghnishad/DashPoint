/**
 * AI Text Formatting Service
 * Integrates multiple free AI services for advanced text formatting and enhancement
 */

class AITextFormattingService {
  constructor() {
    this.huggingFaceToken = import.meta.env.VITE_HUGGING_FACE_TOKEN;
    this.openAIToken = import.meta.env.VITE_OPENAI_API_KEY; // Optional
    this.baseUrl = 'https://api-inference.huggingface.co/models';

    // AI Models for different formatting tasks
    this.models = {
      // Text correction and grammar
      grammar: 'grammarly/coedit-large',
      textCorrection: 'pszemraj/flan-t5-large-grammar-synthesis',

      // Text structuring
      paragraphSegmentation: 'microsoft/DialoGPT-medium',
      sentenceRewriter: 'tuner007/pegasus_paraphrase',

      // Content enhancement
      textSimplification: 'philippelaban/keep_it_simple',
      readabilityEnhancement: 'facebook/bart-large-cnn',

      // Text analysis for formatting
      textClassification: 'microsoft/DialoGPT-medium',
      languageDetection: 'papluca/xlm-roberta-base-language-detection'
    };

    // Fallback formatting rules
    this.fallbackRules = {
      removeWebArtifacts: true,
      enhanceParagraphs: true,
      improveReadability: true,
      standardizeFormatting: true
    };
  }

  /**
   * Check if services are configured
   */
  isConfigured() {
    return !!this.huggingFaceToken && this.huggingFaceToken !== 'your_hugging_face_token_here';
  }

  /**
   * Main text formatting method
   */
  async formatText(rawText, options = {}) {
    if (!rawText || rawText.trim().length === 0) {
      return { formatted: '', confidence: 0, enhancements: [] };
    }

    const results = {
      original: rawText,
      formatted: rawText,
      confidence: 0,
      enhancements: [],
      processingTime: Date.now()
    };

    try {
      // Step 1: Language detection
      const language = await this.detectLanguage(rawText);
      results.language = language;

      // Step 2: Grammar and spelling correction
      if (options.correctGrammar !== false) {
        const corrected = await this.correctGrammar(rawText);
        if (corrected.success) {
          results.formatted = corrected.text;
          results.enhancements.push('Grammar correction');
          results.confidence += 20;
        }
      }

      // Step 3: Text structuring and paragraph improvement
      if (options.improveStructure !== false) {
        const structured = await this.improveTextStructure(results.formatted);
        if (structured.success) {
          results.formatted = structured.text;
          results.enhancements.push('Structure improvement');
          results.confidence += 25;
        }
      }

      // Step 4: Readability enhancement
      if (options.enhanceReadability !== false) {
        const readable = await this.enhanceReadability(results.formatted);
        if (readable.success) {
          results.formatted = readable.text;
          results.enhancements.push('Readability enhancement');
          results.confidence += 30;
        }
      }

      // Step 5: Sentence-level improvements
      if (options.improveSentences !== false) {
        const improved = await this.improveSentences(results.formatted);
        if (improved.success) {
          results.formatted = improved.text;
          results.enhancements.push('Sentence improvement');
          results.confidence += 25;
        }
      }

    } catch (error) {
      console.warn('AI formatting failed, using fallback:', error);

      // Fallback to rule-based formatting
      results.formatted = this.applyFallbackFormatting(rawText);
      results.enhancements.push('Fallback formatting');
      results.confidence = 60;
    }

    results.processingTime = Date.now() - results.processingTime;
    return results;
  }

  /**
   * Detect text language using AI
   */
  async detectLanguage(text) {
    try {
      const response = await this.makeHuggingFaceRequest(
        this.models.languageDetection,
        text.slice(0, 500) // Use first 500 chars for detection
      );

      if (response && response[0] && response[0].label) {
        return response[0].label;
      }
    } catch (error) {
      console.warn('Language detection failed:', error);
    }

    return 'en'; // Default to English
  }

  /**
   * Correct grammar and spelling using AI
   */
  async correctGrammar(text) {
    try {
      // Split into chunks if text is too long
      const chunks = this.splitTextIntoChunks(text, 500);
      const correctedChunks = [];

      for (const chunk of chunks) {
        const response = await this.makeHuggingFaceRequest(
          this.models.textCorrection,
          `Fix grammar and spelling: ${chunk}`
        );

        if (response && response[0] && response[0].generated_text) {
          correctedChunks.push(response[0].generated_text);
        } else {
          correctedChunks.push(chunk); // Keep original if correction fails
        }

        // Add delay to avoid rate limiting
        await this.delay(100);
      }

      return {
        success: true,
        text: correctedChunks.join(' '),
        improvements: correctedChunks.length
      };
    } catch (error) {
      console.warn('Grammar correction failed:', error);
      return { success: false, text, error: error.message };
    }
  }

  /**
   * Improve text structure and paragraph organization
   */
  async improveTextStructure(text) {
    try {
      // Use AI to identify paragraph boundaries and improve structure
      const response = await this.makeHuggingFaceRequest(
        this.models.paragraphSegmentation,
        `Organize this text into well-structured paragraphs: ${text.slice(0, 1000)}`
      );

      if (response && response[0] && response[0].generated_text) {
        return {
          success: true,
          text: response[0].generated_text,
          improvements: 1
        };
      }
    } catch (error) {
      console.warn('Structure improvement failed:', error);
    }

    // Fallback: Apply basic structure rules
    return {
      success: true,
      text: this.applyBasicStructure(text),
      improvements: 1
    };
  }

  /**
   * Enhance readability using AI
   */
  async enhanceReadability(text) {
    try {
      const response = await this.makeHuggingFaceRequest(
        this.models.textSimplification,
        text.slice(0, 800)
      );

      if (response && response[0] && response[0].generated_text) {
        return {
          success: true,
          text: response[0].generated_text,
          improvements: 1
        };
      }
    } catch (error) {
      console.warn('Readability enhancement failed:', error);
    }

    return { success: false, text };
  }

  /**
   * Improve individual sentences
   */
  async improveSentences(text) {
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const improvedSentences = [];

      // Process a few key sentences
      for (const sentence of sentences.slice(0, 3)) {
        const response = await this.makeHuggingFaceRequest(
          this.models.sentenceRewriter,
          sentence.trim()
        );

        if (response && response[0] && response[0].generated_text) {
          improvedSentences.push(response[0].generated_text);
        } else {
          improvedSentences.push(sentence);
        }

        await this.delay(100);
      }

      // Combine improved sentences with the rest
      const remainingSentences = sentences.slice(3);
      const allSentences = [...improvedSentences, ...remainingSentences];

      return {
        success: true,
        text: allSentences.join('. ') + '.',
        improvements: improvedSentences.length
      };
    } catch (error) {
      console.warn('Sentence improvement failed:', error);
      return { success: false, text };
    }
  }

  /**
   * Make request to Hugging Face API
   */
  async makeHuggingFaceRequest(model, inputs, parameters = {}) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face token not configured');
    }

    const response = await fetch(`${this.baseUrl}/${model}`, {
      headers: {
        'Authorization': `Bearer ${this.huggingFaceToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          ...parameters
        },
        options: {
          wait_for_model: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Apply fallback formatting rules when AI services fail
   */
  applyFallbackFormatting(text) {
    let formatted = text;

    // Remove web artifacts
    formatted = formatted
      .replace(/\b(Advertisement|Sponsored|Related Articles?)\b/gi, '')
      .replace(/\b(Share|Tweet|Like|Follow|Subscribe)\b/gi, '')
      .replace(/\b(Cookie|Privacy Policy|Terms of Service)\b/gi, '');

    // Improve paragraph structure
    formatted = this.applyBasicStructure(formatted);

    // Enhance readability
    formatted = formatted
      .replace(/([.!?])\s*([a-z])/g, '$1 $2') // Fix spacing after punctuation
      .replace(/\s+/g, ' ') // Remove extra spaces
      .replace(/\n{3,}/g, '\n\n'); // Normalize line breaks

    return formatted.trim();
  }

  /**
   * Apply basic structure improvements
   */
  applyBasicStructure(text) {
    return text
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 15)
      .join('\n\n');
  }

  /**
   * Split text into manageable chunks
   */
  splitTextIntoChunks(text, maxLength = 500) {
    const sentences = text.split(/[.!?]+/);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '. ';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Add delay to avoid rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get formatting suggestions without applying them
   */
  async getFormattingSuggestions(text) {
    const suggestions = [];

    // Analyze text and provide suggestions
    if (text.length > 2000) {
      suggestions.push({
        type: 'length',
        message: 'Text is quite long. Consider breaking into sections.',
        priority: 'medium'
      });
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    if (avgSentenceLength > 100) {
      suggestions.push({
        type: 'readability',
        message: 'Sentences are quite long. AI can help simplify them.',
        priority: 'high'
      });
    }

    if (!/[A-Z]/.test(text.charAt(0))) {
      suggestions.push({
        type: 'capitalization',
        message: 'Text should start with a capital letter.',
        priority: 'low'
      });
    }

    return suggestions;
  }
}

export default new AITextFormattingService();
