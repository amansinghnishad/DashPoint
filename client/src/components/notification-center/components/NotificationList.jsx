import { Bell } from "lucide-react";
import { NotificationItem } from "./NotificationItem";

export const NotificationList = ({
  notifications,
  filter,
  onMarkAsRead,
  onRemoveNotification,
}) => {
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    return true;
  });

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === "unread" ? "All caught up!" : "No notifications"}
          </h3>
          <p className="text-gray-500 text-sm">
            {filter === "unread"
              ? "You have no unread notifications"
              : "We'll notify you when something happens"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onRemove={onRemoveNotification}
        />
      ))}
    </div>
  );
};
