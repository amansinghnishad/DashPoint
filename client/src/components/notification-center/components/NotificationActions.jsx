import { CheckCircle, Trash2 } from "lucide-react";
import { Button } from "../../ui";

export const NotificationActions = ({
  hasUnread,
  onMarkAllAsRead,
  onClearAll,
}) => {
  return (
    <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
      <div className="flex space-x-2">
        {hasUnread && (
          <Button
            onClick={onMarkAllAsRead}
            variant="primary"
            size="sm"
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <CheckCircle size={16} />
            <span>Mark all read</span>
          </Button>
        )}
        <Button
          onClick={onClearAll}
          variant="primary"
          size="sm"
          className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700"
        >
          <Trash2 size={16} />
          <span>Clear all</span>
        </Button>
      </div>
    </div>
  );
};
