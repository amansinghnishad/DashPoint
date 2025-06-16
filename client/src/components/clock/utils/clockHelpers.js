/**
 * Clock utility functions and constants
 */

// Predefined timezones
export const TIMEZONES = [
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "Mumbai (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
];

// World clock default timezones (shown in the widget)
export const WORLD_CLOCK_TIMEZONES = ["America/New_York", "Europe/London", "Asia/Tokyo"];

/**
 * Get formatted time for a specific timezone
 * @param {string} timezone - Timezone identifier
 * @param {boolean} format24h - Whether to use 24-hour format
 * @returns {string} Formatted time string
 */
export const getTimeInTimezone = (timezone, format24h = false) => {
  return new Date().toLocaleString("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !format24h,
  });
};

/**
 * Get formatted date for a specific timezone
 * @param {string} timezone - Timezone identifier
 * @returns {string} Formatted date string
 */
export const getDateInTimezone = (timezone) => {
  return new Date().toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Get timezone display name from timezone value
 * @param {string} timezoneValue - Timezone identifier
 * @returns {Object|null} Timezone object or null if not found
 */
export const getTimezoneInfo = (timezoneValue) => {
  return TIMEZONES.find((tz) => tz.value === timezoneValue) || null;
};

/**
 * Generate calendar days for current month
 * @param {Date} date - Reference date (usually current date)
 * @returns {Array} Array of calendar day objects
 */
export const generateCalendarDays = (date = new Date()) => {
  const days = [];
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  for (let i = 0; i < 35; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    const isCurrentMonth = currentDate.getMonth() === date.getMonth();
    const isToday = currentDate.toDateString() === date.toDateString();

    days.push({
      date: currentDate.getDate(),
      isCurrentMonth,
      isToday,
      fullDate: new Date(currentDate)
    });
  }

  return days;
};

/**
 * Get current user's timezone
 * @returns {string} User's timezone identifier
 */
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
