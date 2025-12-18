import { useState } from "react";
import { NotificationCenter } from "../../components/notification-center/index";
import {
  KeyboardShortcuts,
  useKeyboardShortcuts,
} from "../../components/keyboard-shortcuts/index";
import { SettingsModal } from "../../components/settings-modal/index";
import { WidgetsDialog } from "../../components/widgets-dialog";
import { useToast } from "../../hooks/useToast";
import { useNotifications } from "../../hooks/useNotifications";
import { ToastContainer } from "../../components/toast/index";
import { useLocalStorage } from "../../hooks/useCommon";

import { ContentRenderer } from "./components/ContentRenderer";
import { DashboardSidebar } from "./components/DashboardSidebar";
import {
  getKeyboardShortcuts,
  handleTabChange,
} from "./utils/dashboardHelpers";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("collections");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useLocalStorage("theme-dark-mode", false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);

  // Toast functionality
  const { toasts, removeToast } = useToast();

  // Notifications functionality
  const {
    notifications,
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
    setWidgetsOpen,
  };
  const shortcuts = getKeyboardShortcuts(shortcutHandlers);
  useKeyboardShortcuts(shortcuts);
  // Handle tab change
  const handleTabChangeWithSidebar = (tab) => {
    handleTabChange(tab, setActiveTab, setSidebarOpen);
  };

  return (
    <div
      className={`min-h-screen scrollable-area ${
        isDark ? "bg-gray-900 dark" : "bg-gray-50"
      }`}
    >
      <div className="flex h-screen">
        <DashboardSidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={handleTabChangeWithSidebar}
          onClose={() => setSidebarOpen(false)}
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
          onNotificationsOpen={() => setNotificationsOpen(true)}
          onSettingsOpen={() => setSettingsOpen(true)}
          onShortcutsOpen={() => setShortcutsOpen(true)}
          onWidgetsOpen={() => setWidgetsOpen(true)}
        />
        {/* Main content area - add left margin for sidebar on large screens */}
        <div
          className={`flex-1 flex flex-col overflow-auto scrollable-area transition-[margin] duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-16"
          }`}
        >
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
      />
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {/* Widgets Dialog */}
      <WidgetsDialog
        isOpen={widgetsOpen}
        onClose={() => setWidgetsOpen(false)}
        isDark={isDark}
      />
    </div>
  );
};
