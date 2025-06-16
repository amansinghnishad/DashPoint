import { SettingsSection } from "../components/SettingsSection";

export const DataSection = ({ settings, updateSetting }) => {
  return (
    <SettingsSection title="Data Management">
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Storage Usage
          </h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex justify-between">
              <span>Collections</span>
              <span>2.3 MB</span>
            </div>
            <div className="flex justify-between">
              <span>Videos</span>
              <span>1.8 MB</span>
            </div>
            <div className="flex justify-between">
              <span>Notes</span>
              <span>0.9 MB</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>5.0 MB</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-sm font-medium text-gray-900">Backup Data</div>
            <div className="text-xs text-gray-500">
              Create a backup of all your data
            </div>
          </button>

          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-sm font-medium text-gray-900">Import Data</div>
            <div className="text-xs text-gray-500">
              Restore data from a backup file
            </div>
          </button>

          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-sm font-medium text-gray-900">
              Sync Settings
            </div>
            <div className="text-xs text-gray-500">
              Synchronize data across devices
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">
            ⚠️ Danger Zone
          </h4>
          <button className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200">
            <div className="text-sm font-medium text-red-700">
              Reset All Settings
            </div>
            <div className="text-xs text-red-500">
              Restore all settings to default values
            </div>
          </button>
        </div>
      </div>
    </SettingsSection>
  );
};
