import { useState, useEffect } from "react";
import { Clock as ClockIcon, MapPin, Settings } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";

export const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [format24h, setFormat24h] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const timezones = [
    { value: "America/New_York", label: "New York (EST)" },
    { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Kolkata", label: "Mumbai (IST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "UTC", label: "UTC" },
  ];

  // updateTime function
  const updateTime = () => {
    setCurrentTime(new Date());
  };

  // getTimeInTimezone function
  const getTimeInTimezone = (tz) => {
    return new Date().toLocaleString("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !format24h,
    });
  };

  // getDateInTimezone function
  const getDateInTimezone = (tz) => {
    return new Date().toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentTimeString = getTimeInTimezone(timezone);
  const currentDateString = getDateInTimezone(timezone);
  const selectedTimezone = timezones.find((tz) => tz.value === timezone);

  return (
    <div className="clock-widget bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <ClockIcon size={20} />
          <span className="font-medium">Clock</span>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:border-white/50 text-white"
              >
                {timezones.map((tz) => (
                  <option
                    key={tz.value}
                    value={tz.value}
                    className="text-gray-900"
                  >
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
                onChange={(e) => setFormat24h(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="format24h" className="text-sm font-medium">
                24-hour format
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Time Display */}
      <div className="text-center mb-6">
        <div className="text-4xl lg:text-5xl font-bold font-mono mb-2 tracking-wide">
          {currentTimeString.split(", ")[1]}
        </div>

        <div className="text-lg font-medium opacity-90 mb-1">
          {currentDateString}
        </div>

        <div className="flex items-center justify-center space-x-1 text-sm opacity-75">
          <MapPin size={14} />
          <span>{selectedTimezone?.label || timezone}</span>
        </div>
      </div>

      {/* Additional Time Zones */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium opacity-90">World Clock</h3>

        <div className="grid grid-cols-1 gap-2">
          {["America/New_York", "Europe/London", "Asia/Tokyo"].map((tz) => {
            if (tz === timezone) return null;

            const timezoneName =
              timezones.find((t) => t.value === tz)?.label || tz;
            const time = getTimeInTimezone(tz);

            return (
              <div
                key={tz}
                className="flex justify-between items-center p-2 bg-white/10 rounded-lg"
              >
                <span className="text-sm font-medium">
                  {timezoneName.split(" ")[0]}
                </span>
                <span className="text-sm font-mono">{time.split(", ")[1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Digital Calendar */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center font-medium opacity-75 p-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs mt-2">
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date();
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(
              date.getFullYear(),
              date.getMonth() + 1,
              0
            );
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);

            const isCurrentMonth = currentDate.getMonth() === date.getMonth();
            const isToday = currentDate.toDateString() === date.toDateString();

            return (
              <div
                key={i}
                className={`text-center p-1 rounded ${
                  isToday
                    ? "bg-white text-indigo-600 font-bold"
                    : isCurrentMonth
                    ? "text-white"
                    : "text-white/40"
                }`}
              >
                {currentDate.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
