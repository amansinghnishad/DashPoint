import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock initial notifications
  const initialNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Welcome to DashPoint',
      message: 'Your dashboard is ready! Explore all the features available.',
      time: new Date().toISOString(),
      read: false,
      category: 'welcome'
    }
  ];

  useEffect(() => {
    setNotifications(initialNotifications);
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      time: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-generate notifications for demo purposes
  useEffect(() => {
    const demoNotifications = [
      {
        type: 'info',
        title: 'Weather Update',
        message: 'Sunny weather expected today with 25°C',
        category: 'weather'
      },
      {
        type: 'success',
        title: 'Task Reminder',
        message: 'Don\'t forget to review your weekly goals',
        category: 'task'
      }
    ];

    // Add demo notifications after 5 seconds
    const timer = setTimeout(() => {
      demoNotifications.forEach((notification, index) => {
        setTimeout(() => {
          addNotification(notification);
        }, index * 2000);
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };
};
