import { Menu, Bell } from "lucide-react";

export const DashboardHeader = ({
  sidebarOpen,
  setSidebarOpen,
  notificationsOpen,
  setNotificationsOpen,
  unreadCount,
  pageTitle,
  searchQuery,
  setSearchQuery,
  isDark,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-sm border-b transition-all duration-200 ${
        isDark
          ? "bg-gray-800/95 border-gray-700 shadow-lg shadow-gray-900/10"
          : "bg-white/95 border-gray-200 shadow-sm"
      }`}
    >
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {" "}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 lg:hidden ${
                isDark
                  ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
              aria-label="Toggle sidebar"
            >
              <Menu size={18} className="sm:w-5 sm:h-5" />
            </button>
            <div className="hidden lg:block w-6"></div>
            <h1
              className={`text-lg sm:text-xl font-semibold truncate transition-colors duration-200 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-48 md:w-64 lg:w-72 px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark
                    ? "border-gray-600 bg-gray-700/80 text-white placeholder-gray-400 hover:bg-gray-700 focus:bg-gray-700"
                    : "border-gray-300 bg-gray-50/80 text-gray-900 placeholder-gray-500 hover:bg-white focus:bg-white"
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <kbd
                  className={`px-2 py-1 text-xs rounded border ${
                    isDark
                      ? "bg-gray-600 text-gray-300 border-gray-500"
                      : "bg-gray-200 text-gray-500 border-gray-300"
                  }`}
                >
                  ⌘K
                </kbd>
              </div>
            </div>{" "}
            {/* Mobile Search Button */}
            <button
              className={`sm:hidden p-2 rounded-lg transition-all duration-200 ${
                isDark
                  ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {/* Notifications Button */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2 rounded-lg transition-all duration-200 ${
                isDark
                  ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              } ${
                notificationsOpen ? "ring-2 ring-blue-500 ring-opacity-50" : ""
              }`}
              aria-label="Notifications"
            >
              <Bell size={18} className="sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-400 rounded-full h-5 w-5 animate-ping opacity-75"></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
