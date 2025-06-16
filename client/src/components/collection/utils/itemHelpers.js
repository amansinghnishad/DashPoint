/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export const extractYouTubeId = (url) => {
  if (!url) return null;

  const regex = /(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Gets the appropriate icon color based on item type
 * @param {string} itemType - Type of the item
 * @returns {string} - Tailwind CSS color class
 */
export const getItemTypeColor = (itemType) => {
  switch (itemType) {
    case "youtube":
      return "text-red-500";
    case "content":
      return "text-blue-500";
    case "sticky-note":
      return "text-yellow-500";
    case "todo":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

/**
 * Gets the appropriate background color for todo priority
 * @param {string} priority - Priority level
 * @returns {string} - Tailwind CSS background class
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/**
 * Gets the appropriate status color for todo completion
 * @param {boolean} completed - Whether the todo is completed
 * @returns {string} - Tailwind CSS color classes
 */
export const getStatusColor = (completed) => {
  return completed
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";
};

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Formats a number for display (e.g., view counts)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};
