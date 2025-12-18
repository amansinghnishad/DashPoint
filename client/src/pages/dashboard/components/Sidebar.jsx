import {
  Home,
  Youtube,
  FileText,
  X,
  User,
  Settings,
  LogOut,
  Folder,
  Upload,
  Sun,
  Moon,
  Keyboard,
  Grid3X3,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { InstallButton } from "../../../components/install-button";

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  isDark,
  toggleTheme,
  onNotificationsOpen,
  onSettingsOpen,
  onShortcutsOpen,
  onWidgetsOpen,
}) => {
  const { user, logoutUser } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isOpen || isHovered;
  const menuItems = [
    { id: "collections", label: "Home", icon: Home },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "content", label: "Content Extractor", icon: FileText },
    { id: "files", label: "File Manager", icon: Upload },
  ];
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-full transform transition-all duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          isDark
            ? "bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 shadow-2xl shadow-gray-900/20"
            : "bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-xl"
        } ${isExpanded ? "w-64" : "w-64 lg:w-16"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`${
              isExpanded ? "p-6" : "p-3"
            } border-b transition-colors duration-200 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <img
                src="/logo-vertical.png"
                alt="DashPoint Logo"
                className={`transition-all duration-200 ${
                  isExpanded ? "h-16" : "h-10 lg:h-8"
                } ${isExpanded ? "" : "lg:mx-auto"}`}
              />
              <button
                onClick={onClose}
                className={`lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className={`flex-1 overflow-y-auto scrollable-area ${
              isExpanded ? "p-4" : "p-2"
            }`}
          >
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center rounded-xl transition-all duration-200 relative ${
                        isActive
                          ? isDark
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                          : isDark
                          ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      } ${
                        isExpanded
                          ? "space-x-3 px-4 py-3 text-left"
                          : "px-0 py-0 lg:mx-auto lg:w-12 lg:h-12 lg:justify-center"
                      }`}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <Icon size={20} />
                      <span
                        className={`font-medium transition-all duration-200 ${
                          isExpanded
                            ? "opacity-100"
                            : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Active indicator */}
                      {isActive && isExpanded && (
                        <div
                          className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-l-full ${
                            isDark ? "bg-blue-400" : "bg-blue-600"
                          }`}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {/* Help Section */}
            <div
              className={`transition-colors duration-200 ${
                isDark ? "border-gray-700" : "border-gray-200"
              } ${isExpanded ? "mt-6 pt-4 border-t" : "mt-3 pt-2"}`}
            >
              <button
                onClick={() => {
                  if (onNotificationsOpen) onNotificationsOpen();
                  onClose();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 mb-2 ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                } ${
                  isExpanded
                    ? "space-x-3"
                    : "px-0 py-0 lg:mx-auto lg:w-12 lg:h-12 lg:justify-center"
                }`}
                title={!isExpanded ? "Notifications" : undefined}
              >
                <Bell size={20} />
                <span
                  className={`font-medium transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100"
                      : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  }`}
                >
                  Notifications
                </span>
              </button>
              <div className="mb-2">
                <InstallButton
                  compact={!isExpanded}
                  className={
                    isExpanded
                      ? "w-full justify-center"
                      : "lg:w-12 lg:h-12 lg:p-0 lg:mx-auto lg:justify-center"
                  }
                />
              </div>
              <button
                onClick={() => {
                  if (onWidgetsOpen) onWidgetsOpen();
                  onClose();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 mb-2 ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                } ${
                  isExpanded
                    ? "space-x-3"
                    : "px-0 py-0 lg:mx-auto lg:w-12 lg:h-12 lg:justify-center"
                }`}
                title={!isExpanded ? "Widgets" : undefined}
              >
                <Grid3X3 size={20} />
                <span
                  className={`font-medium transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100"
                      : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  }`}
                >
                  Widgets
                </span>
              </button>
              <button
                onClick={() => {
                  onShortcutsOpen();
                  onClose();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                } ${
                  isExpanded
                    ? "space-x-3"
                    : "px-0 py-0 lg:mx-auto lg:w-12 lg:h-12 lg:justify-center"
                }`}
                title={!isExpanded ? "Keyboard Shortcuts" : undefined}
              >
                <Keyboard size={20} />
                <span
                  className={`font-medium transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100"
                      : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  }`}
                >
                  Keyboard Shortcuts
                </span>
              </button>
            </div>
          </nav>

          {/* User Profile */}
          <div
            className={`${
              isExpanded ? "p-4" : "p-3"
            } border-t transition-colors duration-200 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* User Info */}
            <div
              className={`flex items-center mb-4 p-3 rounded-xl transition-all duration-200 ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              } ${isExpanded ? "space-x-3" : "mb-3 lg:justify-center"}`}
              title={
                !isExpanded ? user?.name || user?.email || "User" : undefined
              }
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <User size={20} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div
                className={`flex-1 min-w-0 transition-all duration-200 ${
                  isExpanded
                    ? "opacity-100"
                    : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <p
                  className={`font-medium truncate transition-colors duration-200 ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {user?.name || "User"}
                </p>
                <p
                  className={`text-sm truncate transition-colors duration-200 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-2">
              <div
                className={`flex ${
                  isExpanded
                    ? "space-x-2"
                    : "lg:flex-col lg:space-x-0 lg:space-y-2"
                }`}
              >
                <button
                  onClick={toggleTheme}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? "bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                  }`}
                  title={
                    isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button
                  onClick={() => {
                    onSettingsOpen();
                    onClose();
                  }}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? "bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                  } ${
                    isExpanded
                      ? "space-x-2"
                      : "lg:flex-initial lg:w-10 lg:h-10 lg:px-0 lg:py-0"
                  }`}
                  title={!isExpanded ? "Settings" : undefined}
                >
                  <Settings size={16} />
                  <span
                    className={`text-sm font-medium transition-all duration-200 ${
                      isExpanded
                        ? "opacity-100"
                        : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                    }`}
                  >
                    Settings
                  </span>
                </button>
              </div>

              <button
                onClick={logoutUser}
                className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isDark
                    ? "bg-red-900/50 hover:bg-red-800 text-red-300 hover:text-red-200 border border-red-800"
                    : "bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200"
                } ${
                  isExpanded
                    ? "w-full"
                    : "lg:w-10 lg:h-10 lg:mx-auto lg:px-0 lg:py-0"
                }`}
                title={!isExpanded ? "Logout" : undefined}
              >
                <LogOut size={16} />
                <span
                  className={`text-sm font-medium transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100"
                      : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  }`}
                >
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
