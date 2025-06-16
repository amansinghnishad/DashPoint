import { useState, useEffect } from "react";
import { DEFAULT_TOAST_DURATION } from "../utils/toastHelpers";

/**
 * Custom hook for toast functionality
 * @param {number} duration - Toast display duration
 * @param {function} onClose - Callback when toast closes
 */
export const useToast = (duration = DEFAULT_TOAST_DURATION, onClose) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
      setIsEntering(false);
    }, 50);

    // Auto-close timer
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  return {
    isVisible,
    isEntering,
    handleClose
  };
};
