import { TIMEZONES } from "../utils/clockHelpers";

export const ClockSettings = ({
  timezone,
  format24h,
  onTimezoneChange,
  onFormatChange,
}) => {
  return (
    <div className="mb-6 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:border-white/50 text-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value} className="text-gray-900">
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="format24h"
            checked={format24h}
            onChange={(e) => onFormatChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="format24h" className="text-sm font-medium">
            24-hour format
          </label>
        </div>
      </div>
    </div>
  );
};
