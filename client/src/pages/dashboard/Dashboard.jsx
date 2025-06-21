import { useState, useEffect } from "react";
import { NotificationCenter } from "../../components/notification-center/index";
import {
  KeyboardShortcuts,
  useKeyboardShortcuts,
} from "../../components/keyboard-shortcuts/index";
import { SettingsModal } from "../../components/settings-modal/index";
import { useToast } from "../../hooks/useToast";
import { useNotifications } from "../../hooks/useNotifications";
import { ToastContainer } from "../../components/toast/index";
import { useAuth } from "../../context/AuthContext";
import { useLocalStorage } from "../../hooks/useCommon";

import { DashboardHeader } from "./components/DashboardHeader";
import { ContentRenderer } from "./components/ContentRenderer";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { QuickActions } from "./components/QuickActions";
import {
  getPageTitle,
  getKeyboardShortcuts,
  handleTabChange,
} from "./utils/dashboardHelpers";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useLocalStorage("theme-dark-mode", false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Toast functionality
  const { toasts, removeToast, showToast } = useToast();

  // Notifications functionality
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  // Keyboard shortcuts handlers
  const shortcutHandlers = {
    setActiveTab,
    setShortcutsOpen,
    setSidebarOpen,
    sidebarOpen,
    setIsDark,
    isDark,
    setSettingsOpen,
    setNotificationsOpen,
  };
  const shortcuts = getKeyboardShortcuts(shortcutHandlers);
  useKeyboardShortcuts(shortcuts);

  // Get current page title
  const pageTitle = getPageTitle(activeTab);
  // Handle tab change
  const handleTabChangeWithSidebar = (tab) => {
    handleTabChange(tab, setActiveTab, setSidebarOpen);
  };

  // Quick Actions handlers
  const handleQuickNavigate = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleAddNote = () => {
    showToast("Opening note editor...", "info");
  };

  const handleAddTodo = () => {
    showToast("Opening todo list...", "info");
  };

  const handleUploadFile = () => {
    showToast("Opening file manager...", "info");
  };

  const handleBookmark = () => {
    showToast("Opening collections...", "info");
  };
  return (
    <div
      className={`min-h-screen scrollable-area ${
        isDark ? "bg-gray-900 dark" : "bg-gray-50"
      }`}
    >
      {" "}
      <div className="flex h-screen">
        <DashboardSidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={handleTabChangeWithSidebar}
          onClose={() => setSidebarOpen(false)}
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
          onSettingsOpen={() => setSettingsOpen(true)}
          onShortcutsOpen={() => setShortcutsOpen(true)}
        />

        {/* Main content area - add left margin for sidebar on large screens */}
        <div className="flex-1 flex flex-col overflow-auto scrollable-area lg:ml-64">
          {/* Header */}
          <DashboardHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            notificationsOpen={notificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            unreadCount={unreadCount}
            pageTitle={pageTitle}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isDark={isDark}
          />

          {/* Content */}
          <ContentRenderer activeTab={activeTab} />
        </div>
      </div>
      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemoveNotification={removeNotification}
        onClearAll={clearAllNotifications}
      />
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDark={isDark}
        setIsDark={setIsDark}
      />{" "}
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />{" "}
      {/* Quick Actions */}
      <QuickActions
        onNavigate={handleQuickNavigate}
        onAddNote={handleAddNote}
        onAddTodo={handleAddTodo}
        onUploadFile={handleUploadFile}
        onBookmark={handleBookmark}
      />
    </div>
  );
};
