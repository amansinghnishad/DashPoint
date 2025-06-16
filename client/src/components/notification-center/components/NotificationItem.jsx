import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { getTimeAgo } from "../utils/notificationHelpers";

export const NotificationItem = ({ notification, onMarkAsRead, onRemove }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "warning":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    setShowDropdown(false);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(notification.id);
    }
    setShowDropdown(false);
  };

  return (
    <div
      className={`group p-4 border-b border-gray-100/50 transition-all duration-200 hover:bg-gray-50/50 ${
        !notification.read ? "bg-blue-50/30 border-l-4 border-l-blue-400" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className={`text-sm font-medium ${
                  !notification.read ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{getTimeAgo(notification.time)}</span>
                </div>
                {!notification.read && (
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all duration-200"
              >
                <MoreVertical size={16} className="text-gray-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[140px]">
                  {!notification.read && (
                    <button
                      onClick={handleMarkAsRead}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <CheckCircle size={14} />
                      <span>Mark as read</span>
                    </button>
                  )}
                  <button
                    onClick={handleRemove}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
