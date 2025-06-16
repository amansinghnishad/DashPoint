import {
  WORLD_CLOCK_TIMEZONES,
  getTimeInTimezone,
  getTimezoneInfo,
} from "../utils/clockHelpers";

export const WorldClock = ({ currentTimezone, format24h }) => {
  const displayTimezones = WORLD_CLOCK_TIMEZONES.filter(
    (tz) => tz !== currentTimezone
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium opacity-90">World Clock</h3>

      <div className="grid grid-cols-1 gap-2">
        {displayTimezones.map((tz) => {
          const timezoneInfo = getTimezoneInfo(tz);
          const timezoneName = timezoneInfo?.label || tz;
          const time = getTimeInTimezone(tz, format24h);

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
  );
};
