/**
 * Get page title based on active tab
 */
export const getPageTitle = (activeTab) => {
  const titles = {
    overview: "Dashboard Overview",
    collections: "Collections",
    "sticky-notes": "Sticky Notes",
    todos: "Todo List",
    youtube: "YouTube Player",
    content: "Content Extractor",
    weather: "Weather",
    clock: "Clock",
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
      action: () => handlers.setActiveTab("sticky-notes"),
      description: "Go to Sticky Notes"
    },
    {
      keys: "ctrl+4",
      action: () => handlers.setActiveTab("todos"),
      description: "Go to Todo List"
    },
    {
      keys: "ctrl+5",
      action: () => handlers.setActiveTab("youtube"),
      description: "Go to YouTube Player"
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
    },
    {
      keys: "escape",
      action: () => {
        handlers.setNotificationsOpen(false);
        handlers.setShortcutsOpen(false);
        handlers.setSettingsOpen(false);
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
