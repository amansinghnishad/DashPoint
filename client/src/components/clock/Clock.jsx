import { ClockHeader } from "./components/ClockHeader";
import { ClockSettings } from "./components/ClockSettings";
import { MainTimeDisplay } from "./components/MainTimeDisplay";
import { WorldClock } from "./components/WorldClock";
import { MiniCalendar } from "./components/MiniCalendar";
import { useClock } from "./hooks/useClock";

export const Clock = () => {
  const {
    timezone,
    format24h,
    showSettings,
    setTimezone,
    setFormat24h,
    toggleSettings,
  } = useClock();
  return (
    <div className="clock-widget bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
      <ClockHeader onSettingsToggle={toggleSettings} />

      {showSettings && (
        <ClockSettings
          timezone={timezone}
          format24h={format24h}
          onTimezoneChange={setTimezone}
          onFormatChange={setFormat24h}
        />
      )}

      <MainTimeDisplay timezone={timezone} format24h={format24h} />

      <WorldClock currentTimezone={timezone} format24h={format24h} />

      <MiniCalendar />
    </div>
  );
};
