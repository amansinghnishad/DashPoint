import { Bell, X, Settings } from "lucide-react";

export const NotificationHeader = ({
  unreadCount,
  onClose,
  filter,
  setFilter,
  totalCount,
  unreadOnly,
}) => {
  return (
    <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Bell size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <Settings size={18} className="text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-4 flex space-x-2 bg-white/60 rounded-xl p-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
            filter === "all"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:bg-white/50"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`flex-1 px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
            filter === "unread"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:bg-white/50"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>
    </div>
  );
};
