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
  return {
    "ctrl+1": () => handlers.setActiveTab("overview"),
    "ctrl+2": () => handlers.setActiveTab("collections"),
    "ctrl+3": () => handlers.setActiveTab("sticky-notes"),
    "ctrl+4": () => handlers.setActiveTab("todos"),
    "ctrl+5": () => handlers.setActiveTab("youtube"),
    "ctrl+/": () => handlers.setShortcutsOpen(true),
    "ctrl+b": () => handlers.setSidebarOpen(!handlers.sidebarOpen),
    "ctrl+d": () => handlers.setIsDark(!handlers.isDark),
    "ctrl+,": () => handlers.setSettingsOpen(true),
    escape: () => {
      handlers.setNotificationsOpen(false);
      handlers.setShortcutsOpen(false);
      handlers.setSettingsOpen(false);
      handlers.setSidebarOpen(false);
    },
  };
};

/**
 * Handle tab change and close mobile sidebar
 */
export const handleTabChange = (tab, setActiveTab, setSidebarOpen) => {
  setActiveTab(tab);
  // Close mobile sidebar when tab changes
  setSidebarOpen(false);
};
