import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

/**
 * Toast utility functions and constants
 */

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Default toast duration
export const DEFAULT_TOAST_DURATION = 4000;

/**
 * Get icon component for toast type
 * @param {string} type - Toast type
 * @returns {React.Component} Icon component
 */
export const getToastIcon = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return CheckCircle;
    case TOAST_TYPES.ERROR:
      return XCircle;
    case TOAST_TYPES.WARNING:
      return AlertCircle;
    default:
      return Info;
  }
};

/**
 * Get styles for toast type
 * @param {string} type - Toast type
 * @returns {string} CSS classes
 */
export const getToastStyles = (type) => {
  const baseStyles = "flex items-center gap-3 p-4 rounded-lg shadow-lg min-w-80 max-w-md backdrop-blur-sm";

  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return `${baseStyles} bg-green-50/95 text-green-800 border border-green-200`;
    case TOAST_TYPES.ERROR:
      return `${baseStyles} bg-red-50/95 text-red-800 border border-red-200`;
    case TOAST_TYPES.WARNING:
      return `${baseStyles} bg-yellow-50/95 text-yellow-800 border border-yellow-200`;
    default:
      return `${baseStyles} bg-blue-50/95 text-blue-800 border border-blue-200`;
  }
};

/**
 * Get animation classes for toast visibility
 * @param {boolean} isVisible - Whether toast is visible
 * @param {boolean} isEntering - Whether toast is entering
 * @returns {string} CSS classes
 */
export const getToastAnimationClasses = (isVisible, isEntering) => {
  if (isVisible) {
    return "opacity-100 translate-y-0 scale-100";
  }
  if (isEntering) {
    return "opacity-0 translate-y-[-20px] scale-95";
  }
  return "opacity-0 translate-y-[-10px] scale-95";
};
