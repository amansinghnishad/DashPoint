import { validateUrl, cleanUrl, getDomainFromUrl } from "../../../utils/urlUtils";
import { contentAPI, universalAIAPI, enhancedContentAPI } from "../../../services/api";
import TextFormatter from "../../../utils/textFormatter";

// Legacy services - deprecated, kept for fallback only
import huggingFaceService from "../../../services/huggingFaceService";
import freeAIServices from "../../../services/freeAIServices";
import aiTextFormattingService from "../../../services/aiTextFormattingService";

export const extractContentFromUrl = async (url, existingContents) => {
  if (!url.trim()) {
    throw new Error("Please enter a URL");
  }

  if (!validateUrl(url)) {
    throw new Error("Please enter a valid URL");
  }

  const cleanedUrl = cleanUrl(url);

  // Check if content already extracted
  const existing = existingContents.find(
    (content) => content.url === cleanedUrl
  );
  if (existing) {
    return { existing: true, content: existing };
  }

  // Call the backend API for content extraction
  const response = await contentAPI.extractContent(cleanedUrl);
  const extractedContent = response.data;  // Enhanced content processing with Universal AI Agent first, legacy services as fallback
  let rawContent = extractedContent.text || extractedContent.content;

  // Step 1: Basic formatting using TextFormatter
  let formattedContent = TextFormatter.formatContent(rawContent);
  const textStats = TextFormatter.getTextStats(formattedContent);

  // Step 2: Enhanced AI-powered formatting using Universal AI Agent
  let aiFormattingResult = null;
  let aiEnhancementResult = null;

  if (formattedContent && formattedContent.length > 100) {
    try {
      // Try Universal AI Agent first for superior text processing
      try {
        const universalResult = await universalAIAPI.summarizeText(formattedContent, 'medium');
        if (universalResult.success && universalResult.data?.summary) {
          aiFormattingResult = {
            formatted: universalResult.data.summary,
            confidence: 85, // Universal AI Agent provides high-quality results
            enhancements: ['Universal AI text processing', 'Advanced formatting'],
            method: 'Universal AI Agent'
          };
          formattedContent = universalResult.data.summary;
        }
      } catch (universalError) {
        console.warn('Universal AI Agent formatting failed, trying legacy services:', universalError);

        // Fallback to legacy AI formatting services
        if (aiTextFormattingService.isConfigured()) {
          aiFormattingResult = await aiTextFormattingService.formatText(
            formattedContent,
            {
              correctGrammar: true,
              improveStructure: true,
              enhanceReadability: true,
              improveSentences: true
            }
          );

          if (aiFormattingResult.confidence > 70) {
            formattedContent = aiFormattingResult.formatted;
          }
        }

        // Final fallback to free AI services
        if (!aiFormattingResult || aiFormattingResult.confidence < 70) {
          aiEnhancementResult = await freeAIServices.enhanceText(
            formattedContent,
            {
              correctGrammar: true,
              restorePunctuation: true,
              simplifySentences: true,
              cleanText: true
            }
          );

          if (aiEnhancementResult.confidence > 60) {
            formattedContent = aiEnhancementResult.enhanced;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ AI formatting failed, using basic formatting:', error);
    }
  }

  // Recalculate stats after AI formatting
  const finalStats = TextFormatter.getTextStats(formattedContent);

  let processedContent = {
    url: cleanedUrl,
    title:
      extractedContent.title ||
      `Content from ${getDomainFromUrl(cleanedUrl)}`,
    content: formattedContent,
    rawContent: rawContent, // Keep original for reference
    wordCount: finalStats.words,
    characterCount: finalStats.characters,
    paragraphCount: finalStats.paragraphs,
    readingTime: finalStats.readingTime,
    domain: getDomainFromUrl(cleanedUrl),
    category: extractedContent.category || "general",
    formatted: true,
    qualityScore: finalStats.readingTime || 0.7, // Use reading time as quality indicator
    // Add formatting metadata
    formattingApplied: {
      basic: true,
      universalAI: aiFormattingResult?.method === 'Universal AI Agent',
      aiAdvanced: aiFormattingResult?.confidence > 70,
      aiEnhanced: aiEnhancementResult?.confidence > 60,
      improvements: [
        ...(aiFormattingResult?.enhancements || []),
        ...(aiEnhancementResult?.improvements || [])
      ]
    }
  };

  // Add AI-powered enhancements using Universal AI Agent first
  if (processedContent.content && processedContent.content.length > 100) {
    try {
      // Try Universal AI Agent for content analysis and enhancement
      const universalEnhancements = await universalAIAPI.summarizeText(
        processedContent.content,
        'short' // Get a concise summary for metadata
      );

      if (universalEnhancements.success && universalEnhancements.data) {
        processedContent = {
          ...processedContent,
          summary: universalEnhancements.data.summary || '',
          keywords: [], // Universal AI Agent doesn't extract keywords separately yet
          sentiment: 'neutral', // Could be enhanced in future
          sentimentConfidence: 0.7,
          aiEnhanced: true,
          aiProvider: 'Universal AI Agent',
          extractionMethod: 'Universal AI-powered'
        };
      } else {
        // Fallback to legacy Hugging Face service
        const aiEnhancements = await huggingFaceService.extractContent(
          processedContent.content,
          {
            includeSummary: true,
            includeKeywords: true,
            includeSentiment: true,
            summaryOptions: { maxLength: 200, minLength: 50 },
            keywordOptions: { maxKeywords: 8 }
          }
        );

        if (aiEnhancements.success) {
          processedContent = {
            ...processedContent,
            summary: aiEnhancements.data.summary?.summary || '',
            keywords: aiEnhancements.data.keywords?.keywords || [],
            sentiment: aiEnhancements.data.sentiment?.sentiment || 'neutral',
            sentimentConfidence: aiEnhancements.data.sentiment?.confidence || 0,
            aiEnhanced: true,
            aiProvider: 'Hugging Face (Legacy)',
            extractionMethod: aiEnhancements.data.summary?.method || 'AI-powered'
          };
        } else {
          processedContent.aiEnhanced = false;
        }
      }
    } catch (error) {
      console.error('❌ AI enhancement error:', error);
      processedContent.aiEnhanced = false;
      processedContent.aiError = error.message;
    }
  }

  // Save to database
  const saveResponse = await contentAPI.create(processedContent);
  if (saveResponse.success) {
    return { existing: false, content: saveResponse.data };
  }

  throw new Error("Failed to save extracted content");
};

export const exportContentAsJson = (content) => {
  const dataStr = JSON.stringify(content, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `content-${content.domain}-${new Date().toISOString().split("T")[0]
    }.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};

/**
 * Extract content with AI summarization using Universal AI Agent
 */
export const extractContentWithSummary = async (url, options = {}) => {
  if (!url.trim()) {
    throw new Error("Please enter a URL");
  }

  if (!validateUrl(url)) {
    throw new Error("Please enter a valid URL");
  }

  const cleanedUrl = cleanUrl(url);
  const {
    extractImages = false,
    extractLinks = false,
    maxContentLength = 10000,
    generateSummary = false,
    summaryLength = 'medium'
  } = options;

  // Call the enhanced backend API for content extraction with AI summarization
  const response = await enhancedContentAPI.extractWithSummary(cleanedUrl, {
    extractImages,
    extractLinks,
    maxContentLength,
    generateSummary,
    summaryLength
  });

  if (!response.success) {
    throw new Error(response.message || "Failed to extract content");
  }

  const extractedContent = response.data;

  // Process the extracted content with AI summary
  const processedContent = {
    url: extractedContent.url,
    title: extractedContent.title,
    content: extractedContent.content,
    description: extractedContent.description,
    domain: getDomainFromUrl(cleanedUrl),
    images: extractedContent.images || [],
    links: extractedContent.links || [],
    aiSummary: extractedContent.metadata?.aiSummary || null,
    summaryGenerated: extractedContent.metadata?.summaryGenerated || false,
    extractedAt: new Date().toISOString(),
    wordCount: extractedContent.content ? extractedContent.content.split(' ').length : 0,
    readingTime: extractedContent.content ? Math.ceil(extractedContent.content.split(' ').length / 200) : 0
  };

  return processedContent;
};

/**
 * Generate AI summary for existing content
 */
export const generateContentSummary = async (content, summaryLength = 'medium') => {
  if (!content || content.length < 100) {
    throw new Error("Content is too short to summarize");
  }

  try {
    const response = await universalAIAPI.summarizeText(content, summaryLength);
    if (!response.success) {
      throw new Error(response.message || "Failed to generate summary");
    }
    return response.data.summary;
  } catch (error) {
    throw new Error(`Failed to generate AI summary: ${error.message}`);
  }
};
