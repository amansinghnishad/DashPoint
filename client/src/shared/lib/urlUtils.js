// extractYouTubeId function - Enhanced with better pattern matching
export const extractYouTubeId = (url) => {
  // Multiple patterns to handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }

  return null;
};

// validateYouTubeUrl function - Enhanced validation
export const validateYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  // Clean the URL
  url = url.trim();

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Check if it's a valid URL format
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Check if it's a YouTube URL and has a valid video ID
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  const isYouTubeUrl = youtubeRegex.test(url);

  if (isYouTubeUrl) {
    const videoId = extractYouTubeId(url);
    return videoId !== null;
  }

  return false;
};

// getYouTubeThumbnail function
export const getYouTubeThumbnail = (videoId, quality = 'mqdefault') => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

// validateUrl function
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// cleanUrl function
export const cleanUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// getDomainFromUrl function
export const getDomainFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

// getYouTubeErrorMessage function - Provide user-friendly error messages
export const getYouTubeErrorMessage = (error) => {
  const errorMessage = error.message || error;

  if (errorMessage.includes('Transcripts are disabled')) {
    return 'This video has disabled captions/transcripts. Please try a different video.';
  }

  if (errorMessage.includes('No transcript content found')) {
    return 'No captions or transcript available for this video. Please try a video with captions enabled.';
  }

  if (errorMessage.includes('Invalid YouTube URL')) {
    return 'Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)';
  }

  if (errorMessage.includes('Video not accessible')) {
    return 'This video may be private, deleted, or restricted. Please try a different video.';
  }

  if (errorMessage.includes('quota')) {
    return 'AI service temporarily unavailable due to usage limits. Please try again later.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return 'Network error occurred. Please check your connection and try again.';
  }

  // Default error message
  return 'Unable to process this video. Please try a different YouTube video with captions enabled.';
};
