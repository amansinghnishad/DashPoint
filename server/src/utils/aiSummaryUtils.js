/**
 * AI Summary Utilities
 * Helper functions for handling AI-generated summaries
 */

/**
 * Truncate AI summary to fit within the specified character limit
 * @param {string} summary - The AI-generated summary
 * @param {number} maxLength - Maximum allowed characters (default: 5000)
 * @returns {string} - Truncated summary with ellipsis if needed
 */
const truncateAISummary = (summary, maxLength = 5000) => {
  if (!summary || typeof summary !== 'string') {
    return '';
  }

  if (summary.length <= maxLength) {
    return summary;
  }

  // Truncate and add ellipsis, ensuring we don't cut off mid-word
  const truncated = summary.substring(0, maxLength - 3);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > maxLength - 100) { // If there's a space reasonably close to the end
    return truncated.substring(0, lastSpaceIndex) + '...';
  } else {
    return truncated + '...';
  }
};

/**
 * Validate and clean AI summary
 * @param {string} summary - The AI-generated summary
 * @param {number} maxLength - Maximum allowed characters
 * @returns {string} - Cleaned and validated summary
 */
const validateAISummary = (summary, maxLength = 5000) => {
  if (!summary) return '';

  // Clean up any extra whitespace
  const cleaned = summary.trim().replace(/\s+/g, ' ');

  // Truncate if necessary
  return truncateAISummary(cleaned, maxLength);
};

/**
 * Get character count and status for AI summary
 * @param {string} summary - The AI-generated summary
 * @param {number} maxLength - Maximum allowed characters
 * @returns {object} - Status object with count and validation info
 */
const getAISummaryStatus = (summary, maxLength = 5000) => {
  const length = summary ? summary.length : 0;
  return {
    length,
    maxLength,
    isValid: length <= maxLength,
    remainingChars: maxLength - length,
    percentUsed: Math.round((length / maxLength) * 100)
  };
};

module.exports = {
  truncateAISummary,
  validateAISummary,
  getAISummaryStatus
};
