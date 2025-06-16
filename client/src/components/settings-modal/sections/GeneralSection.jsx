import { SettingsSection } from "../components/SettingsSection";
import { Toggle } from "../components/Toggle";
import { SelectField } from "../components/SelectField";

export const GeneralSection = ({ settings, updateSetting }) => {
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
  ];

  const timezoneOptions = [
    { value: "utc", label: "UTC" },
    { value: "est", label: "EST" },
    { value: "pst", label: "PST" },
    { value: "gmt", label: "GMT" },
  ];

  return (
    <SettingsSection title="General Settings">
      <Toggle
        enabled={settings.privacy.autosave}
        onToggle={() =>
          updateSetting("privacy", "autosave", !settings.privacy.autosave)
        }
        label="Auto-save"
        description="Automatically save your work"
      />

      <SelectField
        label="Language"
        description="Choose your preferred language"
        value="en"
        onChange={() => {}} // Placeholder - implement language switching
        options={languageOptions}
      />

      <SelectField
        label="Time Zone"
        description="Set your local time zone"
        value="utc"
        onChange={() => {}} // Placeholder - implement timezone switching
        options={timezoneOptions}
      />
    </SettingsSection>
  );
};
