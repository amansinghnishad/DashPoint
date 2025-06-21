import { Button } from "../../ui";
import { SettingsSection } from "../components/SettingsSection";
import { Toggle } from "../components/Toggle";

export const PrivacySection = ({ settings, updateSetting }) => {
  return (
    <SettingsSection title="Privacy & Security">
      <Toggle
        enabled={settings.privacy.analytics}
        onToggle={() =>
          updateSetting("privacy", "analytics", !settings.privacy.analytics)
        }
        label="Analytics"
        description="Help improve the app by sharing usage analytics"
      />

      <Toggle
        enabled={settings.privacy.errorReporting}
        onToggle={() =>
          updateSetting(
            "privacy",
            "errorReporting",
            !settings.privacy.errorReporting
          )
        }
        label="Error Reporting"
        description="Automatically send error reports to help fix issues"
      />

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Data Management
        </h4>
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
          >
            <div className="text-sm font-medium text-gray-900">Export Data</div>
            <div className="text-xs text-gray-500">
              Download all your data in JSON format
            </div>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg"
          >
            <div className="text-sm font-medium text-red-700">
              Clear All Data
            </div>
            <div className="text-xs text-red-500">
              Permanently delete all your local data
            </div>
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
};
