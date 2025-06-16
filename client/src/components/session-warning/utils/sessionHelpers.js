/**
 * Session warning utility functions
 */

// Default session warning countdown in seconds (5 minutes)
export const DEFAULT_SESSION_COUNTDOWN = 300;

/**
 * Format countdown time for display
 * @param {number} seconds - Countdown time in seconds
 * @returns {string} Formatted time string (MM:SS)
 */
export const formatCountdownTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Calculate progress bar percentage
 * @param {number} currentTime - Current countdown time
 * @param {number} totalTime - Total countdown time
 * @returns {number} Progress percentage (0-100)
 */
export const getProgressPercentage = (currentTime, totalTime = DEFAULT_SESSION_COUNTDOWN) => {
  return Math.max(0, Math.min(100, (currentTime / totalTime) * 100));
};

/**
 * Get progress bar color based on remaining time
 * @param {number} percentage - Progress percentage
 * @returns {string} Color class name
 */
export const getProgressBarColor = (percentage) => {
  if (percentage > 50) return "bg-green-500";
  if (percentage > 25) return "bg-yellow-500";
  return "bg-red-500";
};
