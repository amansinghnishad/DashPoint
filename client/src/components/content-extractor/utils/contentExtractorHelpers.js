import { validateUrl, cleanUrl, getDomainFromUrl } from "../../../utils/urlUtils";
import { contentAPI } from "../../../services/api";
import huggingFaceService from "../../../services/huggingFaceService";
import freeAIServices from "../../../services/freeAIServices";
import aiTextFormattingService from "../../../services/aiTextFormattingService";
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
  const extractedContent = response.data;  // Enhanced content processing with multiple AI services and formatting
  let rawContent = extractedContent.text || extractedContent.content;

  // Step 1: Basic formatting using TextFormatter
  let formattedContent = TextFormatter.formatContent(rawContent);
  const textStats = TextFormatter.getTextStats(formattedContent);
  // Step 2: Enhanced AI-powered formatting
  let aiFormattingResult = null;
  let aiEnhancementResult = null;

  if (formattedContent && formattedContent.length > 100) {
    try {
      // Try advanced AI formatting first
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

      // Fallback to free AI services
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
    qualityScore: freeAIServices.getTextQualityScore(formattedContent),
    // Add formatting metadata
    formattingApplied: {
      basic: true,
      aiAdvanced: aiFormattingResult?.confidence > 70,
      aiEnhanced: aiEnhancementResult?.confidence > 60,
      improvements: [
        ...(aiFormattingResult?.enhancements || []),
        ...(aiEnhancementResult?.improvements || [])
      ]
    }
  };
  // Add AI-powered enhancements if content is available
  if (processedContent.content && processedContent.content.length > 100) {
    try {
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
          aiProvider: 'Hugging Face',
          extractionMethod: aiEnhancements.data.summary?.method || 'AI-powered'
        };
      } else {
        processedContent.aiEnhanced = false;
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
