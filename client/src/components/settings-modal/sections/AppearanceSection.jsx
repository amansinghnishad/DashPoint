import { SettingsSection } from "../components/SettingsSection";
import { Toggle } from "../components/Toggle";
import { SelectField } from "../components/SelectField";

export const AppearanceSection = ({
  settings,
  updateSetting,
  isDark,
  toggleTheme,
}) => {
  const fontSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  return (
    <SettingsSection title="Appearance">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900">Theme</label>
          <p className="text-sm text-gray-500">Choose light or dark mode</p>
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              !isDark ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => isDark && toggleTheme()}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              isDark ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      <Toggle
        enabled={settings.appearance.compactMode}
        onToggle={() =>
          updateSetting(
            "appearance",
            "compactMode",
            !settings.appearance.compactMode
          )
        }
        label="Compact Mode"
        description="Reduce spacing and padding"
      />

      <SelectField
        label="Font Size"
        description="Adjust text size"
        value={settings.appearance.fontSize}
        onChange={(value) => updateSetting("appearance", "fontSize", value)}
        options={fontSizeOptions}
      />
    </SettingsSection>
  );
};
