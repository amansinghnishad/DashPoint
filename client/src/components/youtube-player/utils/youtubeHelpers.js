import { youtubeAPI } from "../../../services/api";
import {
  extractYouTubeId,
  validateYouTubeUrl
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
  };
};

/**
 * Add video to playlist
 */
export const addVideoToPlaylist = async (videoUrl, savedVideos) => {
  // Validate URL and extract video ID
  const videoId = processYouTubeUrl(videoUrl);

  // Check if video already exists
  if (checkVideoExists(savedVideos, videoId)) {
    throw new Error("This video is already in your playlist");
  }

  // Fetch video details from YouTube API
  const response = await youtubeAPI.getVideoDetails(videoId);
  if (!response.success) {
    throw new Error(response.message || "Failed to fetch video details");
  }

  // Create video object
  const newVideo = createVideoObject(response.data);

  // Save to database
  const saveResponse = await youtubeAPI.create(newVideo);
  if (!saveResponse.success) {
    throw new Error("Failed to save video to playlist");
  }

  return saveResponse.data;
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
