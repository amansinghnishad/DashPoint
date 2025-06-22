/**
 * Get page title based on active tab
 */
export const getPageTitle = (activeTab) => {
  const titles = {
    overview: "Dashboard Overview",
    collections: "Collections",
    youtube: "YouTube Player",
    content: "Content Extractor",
    files: "File Manager",
  };

  return titles[activeTab] || "Dashboard";
};

/**
 * Get keyboard shortcuts configuration
 */
export const getKeyboardShortcuts = (handlers) => {
  return [
    {
      keys: "ctrl+1",
      action: () => handlers.setActiveTab("overview"),
      description: "Go to Overview"
    },
    {
      keys: "ctrl+2",
      action: () => handlers.setActiveTab("collections"),
      description: "Go to Collections"
    },
    {
      keys: "ctrl+3",
      action: () => handlers.setActiveTab("youtube"),
      description: "Go to YouTube Player"
    },
    {
      keys: "ctrl+4",
      action: () => handlers.setActiveTab("content"),
      description: "Go to Content Extractor"
    },
    {
      keys: "ctrl+5",
      action: () => handlers.setActiveTab("files"),
      description: "Go to File Manager"
    },
    {
      keys: "ctrl+/",
      action: () => handlers.setShortcutsOpen(true),
      description: "Show Keyboard Shortcuts"
    },
    {
      keys: "ctrl+b",
      action: () => handlers.setSidebarOpen(!handlers.sidebarOpen),
      description: "Toggle Sidebar"
    },
    {
      keys: "ctrl+d",
      action: () => handlers.setIsDark(!handlers.isDark),
      description: "Toggle Dark Mode"
    },
    {
      keys: "ctrl+,",
      action: () => handlers.setSettingsOpen(true),
      description: "Open Settings"
    }, {
      keys: "escape",
      action: () => {
        handlers.setNotificationsOpen(false);
        handlers.setShortcutsOpen(false);
        handlers.setSettingsOpen(false);
        handlers.setWidgetsOpen(false);
        handlers.setSidebarOpen(false);
      },
      description: "Close Modals/Panels"
    },
  ];
};

/**
 * Handle tab change and close mobile sidebar
 */
export const handleTabChange = (tab, setActiveTab, setSidebarOpen) => {
  setActiveTab(tab);
  // Close mobile sidebar when tab changes
  setSidebarOpen(false);
};
