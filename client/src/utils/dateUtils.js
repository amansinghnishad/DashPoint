import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// formatDateTime function
export const formatDateTime = (date, formatString = 'MMM dd, yyyy HH:mm') => {
  if (!date) return 'No date';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return format(dateObj, formatString);
};

// getRelativeTime function
export const getRelativeTime = (date) => {
  if (!date) return 'No date';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  if (isToday(dateObj)) {
    return `Today ${format(dateObj, 'HH:mm')}`;
  }

  if (isYesterday(dateObj)) {
    return `Yesterday ${format(dateObj, 'HH:mm')}`;
  }

  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// getCurrentDateTime function
export const getCurrentDateTime = () => {
  return new Date().toISOString();
};

// isValidDate function
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};
