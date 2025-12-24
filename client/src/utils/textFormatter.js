/**
 * Text formatting utilities for improved readability
 */

export class TextFormatter {
  /**
 * Format raw extracted text for better readability
 */
  static formatContent(rawText) {
    if (!rawText) return '';

    let text = rawText;

    // Step 1: Clean up basic formatting
    text = this.cleanBasicFormatting(text);

    // Step 2: Normalize quotes
    text = this.normalizeQuotes(text);

    // Step 3: Format URLs
    text = this.formatUrls(text);

    // Step 4: Structure paragraphs
    text = this.structureParagraphs(text);

    // Step 5: Format lists
    text = this.formatLists(text);

    // Step 6: Enhance sentences
    text = this.enhanceSentences(text);

    // Step 7: Detect emphasis
    text = this.detectEmphasis(text);

    // Step 8: Handle quotes and citations
    text = this.formatQuotes(text);

    // Step 9: Clean up spacing (final cleanup)
    text = this.cleanSpacing(text);

    return text;
  }
  /**
 * Clean basic formatting issues
 */
  static cleanBasicFormatting(text) {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove weird characters but keep more punctuation
      .replace(/[^\w\s.,!?;:'"()\x5B\x5D\n\r&%$#@-]/g, ' ')
      // Fix common encoding issues
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€\x9d/g, '"')
      .replace(/â€"/g, '—')
      .replace(/â€"/g, '–')
      .replace(/â€¦/g, '...')
      // Remove navigation/menu text patterns
      .replace(/\b(Home|About|Contact|Menu|Search|Login|Register|Sign In|Sign Up)\b/gi, '')
      // Remove social media artifacts
      .replace(/\b(Share|Tweet|Like|Follow|Subscribe|Facebook|Twitter|Instagram|LinkedIn)\b/gi, '')
      // Remove cookie/privacy notices
      .replace(/\b(Cookie|Privacy Policy|Terms of Service|Accept|Decline)\b/gi, '')
      // Remove common web artifacts
      .replace(/\b(Click here|Read more|Continue reading|Skip to content)\b/gi, '')
      .trim();
  }
  /**
 * Structure text into proper paragraphs
 */
  static structureParagraphs(text) {
    return text
      // Split on multiple line breaks or periods followed by capital letters
      .split(/(?:\n\s*\n|\.\s+(?=[A-Z])|\?\s+(?=[A-Z])|!\s+(?=[A-Z]))/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 15) // Remove very short fragments
      .filter(paragraph => !this.isLikelyArtifact(paragraph)) // Remove artifacts
      .join('\n\n');
  }

  /**
   * Check if a paragraph is likely a web artifact
   */
  static isLikelyArtifact(text) {
    const artifacts = [
      /^(Advertisement|Sponsored|Related Articles?)$/i,
      /^(Tags?:|Categories?:|Filed under:)/i,
      /^(Published on|Updated on|Last modified)/i,
      /^(Share this|Print this|Email this)/i,
      /^(Copyright|All rights reserved)/i,
      /^\d+\s+(views?|comments?|shares?)$/i,
      /^(Next|Previous|Back to top)$/i
    ];

    return artifacts.some(pattern => pattern.test(text.trim()));
  }
  /**
 * Format lists for better readability
 */
  static formatLists(text) {
    return text
      // Convert bullet points
      .replace(/•\s*/g, '• ')
      .replace(/\*\s*/g, '• ')
      .replace(/-\s*(?=\w)/g, '• ')
      .replace(/→\s*/g, '• ')
      .replace(/➤\s*/g, '• ')
      // Convert numbered lists
      .replace(/(\d+)\.\s*/g, '$1. ')
      .replace(/(\d+)\)\s*/g, '$1. ')
      // Convert lettered lists
      .replace(/([a-z])\.\s*/g, '$1. ')
      .replace(/([A-Z])\.\s*/g, '$1. ')
      // Ensure list items are on new lines
      .replace(/•\s*([^•\n]+)/g, '\n• $1')
      .replace(/(\d+)\.\s*([^0-9\n]+)/g, '\n$1. $2')
      // Clean up spacing in lists
      .replace(/\n\s*\n\s*•/g, '\n•')
      .replace(/\n\s*\n\s*\d+\./g, '\n$1.');
  }

  /**
   * Format quotes and citations
   */
  static formatQuotes(text) {
    return text
      // Format quotes
      .replace(/[""]([^"""]+)[""]?/g, '"$1"')
      .replace(/['']([^''']+)['']?/g, "'$1'");
  }

  /**
   * Clean up spacing issues
   */
  static cleanSpacing(text) {
    return text
      // Fix multiple spaces
      .replace(/ {2,}/g, ' ')
      // Fix spacing around punctuation
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Clean up line breaks
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .trim();
  }

  /**
   * Extract and format sections from content
   */
  static extractSections(text) {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());

    let currentSection = null;

    for (const line of lines) {
      // Check if line looks like a heading
      if (this.isHeading(line)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          type: 'heading',
          title: line.trim(),
          content: []
        };
      } else if (this.isList(line)) {
        if (currentSection && currentSection.type !== 'list') {
          sections.push(currentSection);
          currentSection = {
            type: 'list',
            items: [line.trim()]
          };
        } else if (currentSection && currentSection.type === 'list') {
          currentSection.items.push(line.trim());
        } else {
          currentSection = {
            type: 'list',
            items: [line.trim()]
          };
        }
      } else {
        if (currentSection && currentSection.type === 'paragraph') {
          currentSection.content.push(line.trim());
        } else {
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = {
            type: 'paragraph',
            content: [line.trim()]
          };
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Check if a line is likely a heading
   */
  static isHeading(line) {
    const trimmed = line.trim();
    return (
      // Short lines that don't end with punctuation
      (trimmed.length < 60 && !/[.!?]$/.test(trimmed)) ||
      // All caps
      trimmed === trimmed.toUpperCase() ||
      // Starts with numbers (like "1. Introduction")
      /^\d+\.\s*[A-Z]/.test(trimmed)
    );
  }

  /**
   * Check if a line is part of a list
   */
  static isList(line) {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('•') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('-') ||
      /^\d+\.\s/.test(trimmed)
    );
  }

  /**
   * Calculate reading time
   */
  static getReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  }

  /**
   * Get text statistics
   */
  static getTextStats(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const characters = text.length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    return {
      sentences: sentences.length,
      words: words.length,
      characters: characters,
      paragraphs: paragraphs.length,
      readingTime: this.getReadingTime(text)
    };
  }

  /**
   * Enhance sentence structure and capitalization
   */
  static enhanceSentences(text) {
    return text
      // Ensure sentences start with capital letters
      .replace(/(\. |\? |! |^)([a-z])/g, (match, punctuation, letter) => {
        return punctuation + letter.toUpperCase();
      })
      // Fix spacing after punctuation
      .replace(/([.!?])([A-Z])/g, '$1 $2')
      // Handle abbreviations better
      .replace(/\b([A-Z])\.([A-Z])\.([A-Z])?\.?/g, '$1.$2.$3')
      // Fix common typos in capitalization
      .replace(/\bi\b/g, 'I')
      .replace(/\bdont\b/g, "don't")
      .replace(/\bcant\b/g, "can't")
      .replace(/\bwont\b/g, "won't");
  }

  /**
   * Format URLs and links for better readability
   */
  static formatUrls(text) {
    // Replace long URLs with domain names
    return text.replace(/(https?:\/\/)([^/\s]+)([^\s]*)/g, (match, protocol, domain, path) => {
      if (path.length > 30) {
        return `${domain}...`;
      }
      return match;
    });
  }

  /**
   * Detect and format emphasis (bold, italic)
   */
  static detectEmphasis(text) {
    return text
      // Convert ALL CAPS to sentence case with emphasis marker
      .replace(/\b[A-Z]{3,}\b/g, (match) => {
        return `**${match.charAt(0) + match.slice(1).toLowerCase()}**`;
      })
      // Detect repeated punctuation for emphasis
      .replace(/([!?]){2,}/g, '$1')
      .replace(/\.{3,}/g, '...');
  }

  /**
   * Normalize and format quotes
   */
  static normalizeQuotes(text) {
    return text
      // Standardize quote marks
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Ensure proper quote spacing
      .replace(/"\s*([^"]+)\s*"/g, '"$1"')
      .replace(/'\s*([^']+)\s*'/g, "'$1'")
      // Handle nested quotes
      .replace(/"([^"]*)'([^']*)'([^"]*)"/g, '"$1\'$2\'$3"');
  }
}

export default TextFormatter;
