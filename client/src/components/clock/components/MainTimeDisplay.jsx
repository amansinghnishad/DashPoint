import { MapPin } from "lucide-react";
import {
  getTimeInTimezone,
  getDateInTimezone,
  getTimezoneInfo,
} from "../utils/clockHelpers";

export const MainTimeDisplay = ({ timezone, format24h }) => {
  const currentTimeString = getTimeInTimezone(timezone, format24h);
  const currentDateString = getDateInTimezone(timezone);
  const selectedTimezone = getTimezoneInfo(timezone);
  return (
    <div className="text-center mb-4 sm:mb-6">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono mb-2 tracking-wide">
        {currentTimeString.split(", ")[1]}
      </div>

      <div className="text-base sm:text-lg font-medium opacity-90 mb-1">
        {currentDateString}
      </div>

      <div className="flex items-center justify-center space-x-1 text-xs sm:text-sm opacity-75">
        <MapPin size={12} className="sm:hidden" />
        <MapPin size={14} className="hidden sm:block" />
        <span>{selectedTimezone?.label || timezone}</span>
      </div>
    </div>
  );
};
