import { useState } from "react";
import {
  Settings,
  Bell,
  Palette,
  Keyboard,
  Shield,
  Database,
} from "lucide-react";
import { Modal, Button } from "../ui";
import { GeneralSection } from "./sections/GeneralSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { ShortcutsSection } from "./sections/ShortcutsSection";
import { PrivacySection } from "./sections/PrivacySection";
import { DataSection } from "./sections/DataSection";

export const SettingsModal = ({ isOpen, onClose, isDark, toggleTheme }) => {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      desktop: false,
      sound: true,
    },
    appearance: {
      theme: isDark ? "dark" : "light",
      compactMode: false,
      fontSize: "medium",
    },
    privacy: {
      analytics: true,
      errorReporting: true,
      autosave: true,
    },
    shortcuts: {
      enabled: true,
      showHints: true,
    },
  });

  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "data", label: "Data", icon: Database },
  ];

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSection settings={settings} updateSetting={updateSetting} />
        );
      case "appearance":
        return (
          <AppearanceSection
            settings={settings}
            updateSetting={updateSetting}
            isDark={isDark}
            toggleTheme={toggleTheme}
          />
        );
      case "notifications":
        return (
          <NotificationsSection
            settings={settings}
            updateSetting={updateSetting}
          />
        );
      case "shortcuts":
        return (
          <ShortcutsSection settings={settings} updateSetting={updateSetting} />
        );
      case "privacy":
        return (
          <PrivacySection settings={settings} updateSetting={updateSetting} />
        );
      case "data":
        return (
          <DataSection settings={settings} updateSetting={updateSetting} />
        );
      default:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {sections.find((s) => s.id === activeSection)?.label}
              </h3>
              <p className="text-gray-600">
                Settings for this section coming soon...
              </p>
            </div>
          </div>
        );
    }
  };
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="4xl"
      showCloseButton={false}
    >
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 rounded-l-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Settings className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{section.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {sections.find((s) => s.id === activeSection)?.label}
            </h3>
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-y-auto">{renderSection()}</div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={onClose} variant="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
