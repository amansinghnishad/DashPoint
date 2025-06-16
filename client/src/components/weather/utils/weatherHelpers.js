/**
 * Weather utility functions
 */

/**
 * Format location name for display
 * @param {Object|String} location - Location object or string
 * @returns {String} Formatted location name
 */
export const formatLocationName = (location) => {
  if (!location) return "Unknown Location";

  if (typeof location === 'string') {
    return location;
  }

  if (location.name && location.country) {
    return `${location.name}, ${location.country}`;
  }

  return location.name || location.country || "Unknown Location";
};

/**
 * Get weather icon based on condition
 * @param {String} condition - Weather condition
 * @returns {String} Weather icon emoji
 */
export const getWeatherIcon = (condition) => {
  const iconMap = {
    sunny: "☀️",
    clear: "☀️",
    cloudy: "☁️",
    "partly cloudy": "⛅",
    overcast: "☁️",
    rainy: "🌧️",
    rain: "🌧️",
    snowy: "❄️",
    snow: "❄️",
    windy: "💨",
    fog: "🌫️",
    mist: "🌫️",
    thunderstorm: "⛈️",
    storm: "⛈️",
  };

  return iconMap[condition?.toLowerCase()] || "☀️";
};

/**
 * Format temperature with unit
 * @param {Number} temperature - Temperature value
 * @param {String} unit - Temperature unit (C/F)
 * @returns {String} Formatted temperature
 */
export const formatTemperature = (temperature, unit = "C") => {
  if (temperature === null || temperature === undefined) {
    return "N/A";
  }
  return `${Math.round(temperature)}°${unit}`;
};

/**
 * Get weather condition color scheme
 * @param {String} condition - Weather condition
 * @returns {Object} Color scheme object
 */
export const getWeatherColors = (condition) => {
  const colorSchemes = {
    sunny: "from-yellow-400 to-orange-500",
    clear: "from-blue-400 to-blue-600",
    cloudy: "from-gray-400 to-gray-600",
    rainy: "from-blue-600 to-blue-800",
    snowy: "from-blue-200 to-blue-400",
    windy: "from-teal-400 to-teal-600",
    thunderstorm: "from-purple-600 to-purple-800",
    default: "from-blue-400 to-blue-600"
  };

  return colorSchemes[condition?.toLowerCase()] || colorSchemes.default;
};
