import { youtubeAPI, dashPointAIAPI, enhancedYouTubeAPI } from "../../../services/api";
import {
  extractYouTubeId,
  validateYouTubeUrl,
  getYouTubeErrorMessage
} from "../../../utils/urlUtils";

/**
 * Validate and process YouTube URL
 */
export const processYouTubeUrl = (url) => {
  if (!url.trim()) {
    throw new Error("Please enter a YouTube URL");
  }

  if (!validateYouTubeUrl(url)) {
    throw new Error("Please enter a valid YouTube URL");
  }

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error("Could not extract video ID from URL");
  }

  return videoId;
};

/**
 * Check if video already exists in playlist
 */
export const checkVideoExists = (savedVideos, videoId) => {
  return savedVideos.some((video) => video.videoId === videoId);
};

/**
 * Create video object from API response
 */
export const createVideoObject = (videoData) => {
  return {
    videoId: videoData.id,
    title: videoData.title,
    thumbnail: videoData.thumbnail.medium || videoData.thumbnail.default,
    embedUrl: videoData.embedUrl,
    url: videoData.url,
    duration: videoData.duration,
    channelTitle: videoData.channelTitle,
    viewCount: videoData.viewCount,
    aiSummary: videoData.aiSummary,
    summaryGenerated: videoData.summaryGenerated,
    agentVersion: videoData.agentVersion
  };
};

/**
 * Add video to playlist with optional AI summarization
 */
export const addVideoToPlaylist = async (videoUrl, savedVideos, generateSummary = false, summaryLength = 'medium') => {
  // Validate URL and extract video ID
  const videoId = processYouTubeUrl(videoUrl);

  // Check if video already exists
  if (checkVideoExists(savedVideos, videoId)) {
    throw new Error("This video is already in your playlist");
  }

  // Fetch video details with optional AI summary
  const response = await enhancedYouTubeAPI.getVideoDetailsWithSummary(videoId, generateSummary, summaryLength);
  if (!response.success) {
    throw new Error(response.message || "Failed to fetch video details");
  }

  // Create video object
  const newVideo = createVideoObject(response.data);

  // Save to database with AI summary if generated
  const saveResponse = await enhancedYouTubeAPI.createWithSummary(newVideo, generateSummary, summaryLength);
  if (!saveResponse.success) {
    throw new Error("Failed to save video to playlist");
  }

  return saveResponse.data;
};

/**
 * Generate AI summary for existing video using DashPoint AI Agent
 */
export const generateVideoSummary = async (videoUrl, summaryLength = 'medium') => {
  try {
    // Validate URL first
    if (!validateYouTubeUrl(videoUrl)) {
      throw new Error('Please enter a valid YouTube URL');
    }    // Try the intelligent chat endpoint first for better results
    try {
      const chatResponse = await dashPointAIAPI.chat({
        prompt: `Please analyze and summarize this YouTube video: ${videoUrl}`,
        context: `Summary length: ${summaryLength}. Provide comprehensive analysis including key topics and insights.`
      });

      console.log('Chat response received:', chatResponse);

      // Check if chat was successful and has results
      if (chatResponse.success && chatResponse.results) {
        for (const result of chatResponse.results) {
          if (result.type === 'function_result' && result.result && result.result.success) {
            console.log('Found successful function result:', result.result.data);
            return result.result.data;
          }
        }
      }
    } catch (chatError) {
      console.warn('Chat endpoint failed, trying direct summarization:', chatError);
    }

    // Fallback to direct summarization endpoint
    const response = await dashPointAIAPI.summarizeYouTube(videoUrl, summaryLength);
    if (!response.success) {
      throw new Error(response.message || "Failed to generate video summary");
    }

    // Check if the response contains an error message in the summary
    const summary = response.data.summary || response.data.data?.summary;
    if (summary && summary.startsWith('Error:')) {
      throw new Error(summary);
    }

    return summary;
  } catch (error) {
    // Provide user-friendly error message
    const friendlyMessage = getYouTubeErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

/**
 * Load saved videos from API
 */
export const loadSavedVideos = async () => {
  const response = await youtubeAPI.getAll();
  if (!response.success) {
    throw new Error("Failed to load saved videos");
  }
  return response.data;
};

/**
 * Remove video from playlist
 */
export const removeVideoFromPlaylist = async (videoId) => {
  const response = await youtubeAPI.delete(videoId);
  if (!response.success) {
    throw new Error("Failed to remove video");
  }
  return true;
};
