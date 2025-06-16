import { useState, useEffect } from "react";
import { getUserTimezone } from "../utils/clockHelpers";

/**
 * Custom hook for clock functionality
 */
export const useClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState(getUserTimezone());
  const [format24h, setFormat24h] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };

  // Update timezone
  const updateTimezone = (newTimezone) => {
    setTimezone(newTimezone);
  };

  // Toggle time format
  const toggleFormat = () => {
    setFormat24h(prev => !prev);
  };

  return {
    currentTime,
    timezone,
    format24h,
    showSettings,
    setTimezone: updateTimezone,
    setFormat24h,
    toggleSettings,
    toggleFormat
  };
};
