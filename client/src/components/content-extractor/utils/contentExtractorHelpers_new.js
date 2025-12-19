import { validateUrl, cleanUrl, getDomainFromUrl } from "../../../utils/urlUtils";
import { contentAPI, dashPointAIAPI, enhancedContentAPI } from "../../../services/api";
import TextFormatter from "../../../utils/textFormatter";

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
  const extractedContent = response.data;

  // Enhanced content processing with DashPoint AI Agent
  let rawContent = extractedContent.text || extractedContent.content;

  // Step 1: Basic formatting using TextFormatter
  let formattedContent = TextFormatter.formatContent(rawContent);

  // Step 2: Enhanced AI-powered formatting using DashPoint AI Agent
  let aiFormattingResult = null;

  if (formattedContent && formattedContent.length > 100) {
    try {
      // Use DashPoint AI Agent for superior text processing
      const dashPointResult = await dashPointAIAPI.summarizeText(formattedContent, 'medium');
      if (dashPointResult.success && dashPointResult.data?.summary) {
        aiFormattingResult = {
          formatted: dashPointResult.data.summary,
          confidence: 85, // DashPoint AI Agent provides high-quality results
          enhancements: ['DashPoint AI text processing', 'Advanced formatting'],
          method: 'DashPoint AI Agent'
        };
        formattedContent = dashPointResult.data.summary;
      }
    } catch (error) {
      console.warn("DashPoint AI Agent formatting failed:", error);
    }
  }

  // Recalculate stats after AI formatting
  const finalStats = TextFormatter.getTextStats(formattedContent);

  const processedContent = {
    url: cleanedUrl,
    title: extractedContent.title || `Content from ${getDomainFromUrl(cleanedUrl)}`,
    content: formattedContent,
    rawContent: rawContent, // Keep original for reference
    wordCount: finalStats.words,
    characterCount: finalStats.characters,
    paragraphCount: finalStats.paragraphs,
    readingTime: finalStats.readingTime,
    domain: getDomainFromUrl(cleanedUrl),
    category: extractedContent.category || "general",
    formatted: true,
    qualityScore: finalStats.readingTime || 0.7,
    // Add formatting metadata
    formattingApplied: {
      basic: true,
      dashPointAI: aiFormattingResult?.method === 'DashPoint AI Agent',
      aiAdvanced: aiFormattingResult?.confidence > 70,
      improvements: aiFormattingResult?.enhancements || []
    },
    aiEnhanced: !!aiFormattingResult,
    aiProvider: aiFormattingResult ? 'DashPoint AI Agent' : 'Basic Processing',
    agentVersion: aiFormattingResult ? "2.0.0" : null
  };

  // Save to database
  const saveResponse = await contentAPI.create(processedContent);
  if (saveResponse.success) {
    return { existing: false, content: saveResponse.data };
  }

  throw new Error("Failed to save extracted content");
};

export const extractContentWithSummary = async (url, options = {}) => {
  const {
    extractImages = false,
    extractLinks = false,
    maxContentLength = 10000,
    generateSummary = true,
    summaryLength = "medium"
  } = options;

  if (!url.trim()) {
    throw new Error("Please enter a URL");
  }

  if (!validateUrl(url)) {
    throw new Error("Please enter a valid URL");
  }

  const cleanedUrl = cleanUrl(url);

  // Call the enhanced backend API for content extraction with AI analysis
  const response = await enhancedContentAPI.extractContentWithSummary({
    url: cleanedUrl,
    extractImages,
    extractLinks,
    maxContentLength,
    generateSummary,
    summaryLength
  });

  if (!response.success) {
    throw new Error(response.message || "Failed to extract content");
  }

  return response.data;
};

/**
 * Generate AI summary for existing content using DashPoint AI Agent
 */
export const generateContentSummary = async (content, summaryLength = 'medium') => {
  try {
    if (!content || content.trim().length < 100) {
      throw new Error("Content is too short to summarize");
    }

    // Try the intelligent chat endpoint first for better results
    try {
      const chatResponse = await dashPointAIAPI.chat({
        prompt: `Please analyze and summarize the following content: "${content}"`,
        context: `Summary length: ${summaryLength}. Provide comprehensive analysis including key topics and insights.`
      });

      if (chatResponse.success && chatResponse.data.results) {
        for (const result of chatResponse.data.results) {
          if (result.type === 'function_result' && result.result && result.result.success) {
            return result.result.data;
          }
        }
      }
    } catch (chatError) {
      console.warn('Chat endpoint failed, trying direct summarization:', chatError);
    }

    // Fallback to direct summarization endpoint
    const response = await dashPointAIAPI.summarizeText(content, summaryLength);
    if (!response.success) {
      throw new Error(response.message || "Failed to generate summary");
    }

    return response.data.summary || response.data.data?.summary;
  } catch (error) {
    throw new Error(`Summary generation failed: ${error.message}`);
  }
};

export const exportContentAsJson = (content) => {
  const exportData = {
    title: content.title,
    url: content.url,
    domain: content.domain,
    extractedAt: content.createdAt,
    content: content.content,
    description: content.description,
    images: content.images || [],
    links: content.links || [],
    metadata: content.metadata || {},
    agentVersion: content.agentVersion || content.metadata?.agentVersion || null
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `${content.title || 'content'}_${new Date().toISOString().split('T')[0]}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const formatContentPreview = (content, maxLength = 200) => {
  if (!content) return "";

  const cleaned = content
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) return cleaned;

  return cleaned.substring(0, maxLength) + "...";
};

export const getContentStats = (content) => {
  if (!content) return { words: 0, characters: 0, paragraphs: 0 };

  const words = content.trim().split(/\s+/).length;
  const characters = content.length;
  const paragraphs = content.split(/\n\s*\n/).length;

  return { words, characters, paragraphs };
};

export const validateContentForSummary = (content) => {
  if (!content || typeof content !== 'string') {
    return { valid: false, reason: "No content provided" };
  }

  const trimmed = content.trim();
  if (trimmed.length < 50) {
    return { valid: false, reason: "Content too short (minimum 50 characters)" };
  }

  const words = trimmed.split(/\s+/).length;
  if (words < 20) {
    return { valid: false, reason: "Content too short (minimum 20 words)" };
  }

  return { valid: true };
};
