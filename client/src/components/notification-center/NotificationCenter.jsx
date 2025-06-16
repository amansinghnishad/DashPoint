import { useState, useEffect } from "react";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationList } from "./components/NotificationList";
import { NotificationActions } from "./components/NotificationActions";
import {
  getMockNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} from "./utils/notificationHelpers";

export const NotificationCenter = ({
  isOpen,
  onClose,
  notifications: propNotifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onClearAll,
}) => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(
      propNotifications.length > 0 ? propNotifications : getMockNotifications()
    );
  }, [propNotifications]);

  const unreadCount = getUnreadCount(notifications);
  const hasUnread = unreadCount > 0;

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) => markNotificationAsRead(prev, notificationId));
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => markAllNotificationsAsRead(prev));
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleRemoveNotification = (notificationId) => {
    setNotifications((prev) => removeNotification(prev, notificationId));
    if (onRemoveNotification) {
      onRemoveNotification(notificationId);
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    if (onClearAll) {
      onClearAll();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Notification Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-lg shadow-2xl transform transition-all duration-300 ease-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } border-l border-gray-200/50`}
      >
        <div className="flex flex-col h-full">
          <NotificationHeader
            unreadCount={unreadCount}
            onClose={onClose}
            filter={filter}
            setFilter={setFilter}
            totalCount={notifications.length}
          />

          <NotificationList
            notifications={notifications}
            filter={filter}
            onMarkAsRead={handleMarkAsRead}
            onRemoveNotification={handleRemoveNotification}
          />

          <NotificationActions
            hasUnread={hasUnread}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAll={handleClearAll}
          />
        </div>
      </div>
    </>
  );
};
