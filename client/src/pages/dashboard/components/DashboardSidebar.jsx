import { Sidebar } from "../../../components/dashboard";

export const DashboardSidebar = ({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  isDark,
  toggleTheme,
  onSettingsOpen,
  onShortcutsOpen,
}) => {
  return (
    <Sidebar
      isOpen={isOpen}
      activeTab={activeTab}
      setActiveTab={onTabChange}
      onClose={onClose}
      isDark={isDark}
      toggleTheme={toggleTheme}
      onSettingsOpen={onSettingsOpen}
      onShortcutsOpen={onShortcutsOpen}
    />
  );
};
