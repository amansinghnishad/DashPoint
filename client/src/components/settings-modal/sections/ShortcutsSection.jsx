import { SettingsSection } from "../components/SettingsSection";
import { Toggle } from "../components/Toggle";

export const ShortcutsSection = ({ settings, updateSetting }) => {
  return (
    <SettingsSection title="Keyboard Shortcuts">
      <Toggle
        enabled={settings.shortcuts.enabled}
        onToggle={() =>
          updateSetting("shortcuts", "enabled", !settings.shortcuts.enabled)
        }
        label="Enable Shortcuts"
        description="Use keyboard shortcuts for quick actions"
      />

      <Toggle
        enabled={settings.shortcuts.showHints}
        onToggle={() =>
          updateSetting("shortcuts", "showHints", !settings.shortcuts.showHints)
        }
        label="Show Hints"
        description="Display keyboard shortcut hints in tooltips"
      />

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Available Shortcuts
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Open settings</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
              Ctrl + ,
            </kbd>
          </div>
          <div className="flex justify-between">
            <span>Search</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
              Ctrl + K
            </kbd>
          </div>
          <div className="flex justify-between">
            <span>New collection</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
              Ctrl + N
            </kbd>
          </div>
          <div className="flex justify-between">
            <span>Toggle theme</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
              Ctrl + Shift + T
            </kbd>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};
