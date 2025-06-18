import { useState, useEffect } from 'react';

export const useActivity = () => {
  const [activities, setActivities] = useState([]);

  // Load activities from localStorage on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('dashboardActivities');
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        // Only keep activities from the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const filtered = parsed.filter(activity =>
          new Date(activity.timestamp) > weekAgo
        );
        setActivities(filtered);
      } catch (error) {
        console.error('Failed to parse activities:', error);
        setActivities([]);
      }
    }
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('dashboardActivities', JSON.stringify(activities));
    }
  }, [activities]);

  const addActivity = (type, text, metadata = {}) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      type,
      text,
      timestamp: new Date().toISOString(),
      metadata
    };

    setActivities(prev => {
      const updated = [newActivity, ...prev];
      // Keep only the last 50 activities
      return updated.slice(0, 50);
    });
  };

  const getFormattedTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return activityTime.toLocaleDateString();
  };

  const getRecentActivities = (limit = 10) => {
    return activities
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        timeFormatted: getFormattedTime(activity.timestamp)
      }));
  };

  const clearOldActivities = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setActivities(prev =>
      prev.filter(activity => new Date(activity.timestamp) > weekAgo)
    );
  };

  return {
    activities,
    addActivity,
    getRecentActivities,
    clearOldActivities
  };
};
