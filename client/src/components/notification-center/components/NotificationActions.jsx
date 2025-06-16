import { CheckCircle, Trash2 } from "lucide-react";

export const NotificationActions = ({
  hasUnread,
  onMarkAllAsRead,
  onClearAll,
}) => {
  return (
    <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
      <div className="flex space-x-2">
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <CheckCircle size={16} />
            <span>Mark all read</span>
          </button>
        )}
        <button
          onClick={onClearAll}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Trash2 size={16} />
          <span>Clear all</span>
        </button>
      </div>
    </div>
  );
};
