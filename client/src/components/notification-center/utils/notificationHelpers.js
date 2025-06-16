/**
 * Calculate time ago from a timestamp
 */
export const getTimeAgo = (timeString) => {
  const now = new Date();
  const time = new Date(timeString);
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return time.toLocaleDateString();
};

/**
 * Mock notifications data
 */
export const getMockNotifications = () => [
  {
    id: 1,
    type: "success",
    title: "Task Completed",
    message: 'You completed "Review project proposal"',
    time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    category: "task",
  },
  {
    id: 2,
    type: "info",
    title: "New Note Saved",
    message: 'Your sticky note "Meeting agenda" was saved successfully',
    time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
    category: "note",
  },
  {
    id: 3,
    type: "warning",
    title: "Session Expiring",
    message: "Your session will expire in 15 minutes. Please save your work.",
    time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
    category: "system",
  },
  {
    id: 4,
    type: "info",
    title: "Weather Update",
    message: "Rain expected this afternoon in your area",
    time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
    category: "weather",
  },
  {
    id: 5,
    type: "error",
    title: "Upload Failed",
    message: "File upload failed. Please check your internet connection.",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    category: "file",
  },
];

/**
 * Filter notifications by type
 */
export const filterNotifications = (notifications, filter) => {
  switch (filter) {
    case "unread":
      return notifications.filter(n => !n.read);
    case "read":
      return notifications.filter(n => n.read);
    default:
      return notifications;
  }
};

/**
 * Count unread notifications
 */
export const getUnreadCount = (notifications) => {
  return notifications.filter(n => !n.read).length;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (notifications, notificationId) => {
  return notifications.map(notification =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification
  );
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = (notifications) => {
  return notifications.map(notification => ({ ...notification, read: true }));
};

/**
 * Remove notification
 */
export const removeNotification = (notifications, notificationId) => {
  return notifications.filter(notification => notification.id !== notificationId);
};
