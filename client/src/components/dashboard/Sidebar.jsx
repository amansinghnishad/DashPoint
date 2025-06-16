import {
  Home,
  StickyNote,
  CheckSquare,
  Youtube,
  FileText,
  Cloud,
  Clock as ClockIcon,
  X,
  User,
  Settings,
  LogOut,
  Folder,
  Upload,
  Sun,
  Moon,
  Keyboard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  isDark,
  toggleTheme,
  onSettingsOpen,
  onShortcutsOpen,
}) => {
  const { user, logoutUser } = useAuth();
  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "collections", label: "Collections", icon: Folder },
    { id: "sticky-notes", label: "Sticky Notes", icon: StickyNote },
    { id: "todos", label: "Todo List", icon: CheckSquare },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "content", label: "Content Extractor", icon: FileText },
    { id: "weather", label: "Weather", icon: Cloud },
    { id: "clock", label: "Clock", icon: ClockIcon },
    { id: "files", label: "File Manager", icon: Upload },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}{" "}
      <div
        className={`fixed left-0 top-0 h-full w-64 ${
          isDark ? "bg-gray-800" : "bg-white"
        } shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : isDark
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Help Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onShortcutsOpen();
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Keyboard size={20} />
                <span className="font-medium">Keyboard Shortcuts</span>
              </button>
            </div>
          </nav>{" "}
          {/* User Profile */}
          <div
            className={`p-4 border-t ${
              isDark ? "border-gray-600" : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {user?.name}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {" "}
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center p-2 text-sm rounded-lg ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => {
                  onSettingsOpen();
                  onClose();
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>{" "}
              <button
                onClick={logoutUser}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg ${
                  isDark
                    ? "bg-red-800 hover:bg-red-700 text-red-200"
                    : "bg-red-100 hover:bg-red-200 text-red-700"
                }`}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
