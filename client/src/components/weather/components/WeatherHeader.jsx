import { MapPin, RefreshCw } from "lucide-react";

export const WeatherHeader = ({ weather, onLocationToggle, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <MapPin size={16} className="sm:hidden" />
        <MapPin size={18} className="hidden sm:block" />
        <span className="font-medium text-sm sm:text-base">
          {weather?.location?.name
            ? `${weather.location.name}, ${weather.location.country}`
            : weather?.location || "Unknown Location"}
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onLocationToggle}
          className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors touch-manipulation"
          title="Change location"
        >
          <MapPin size={14} className="sm:hidden" />
          <MapPin size={16} className="hidden sm:block" />
        </button>
        <button
          onClick={onRefresh}
          className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors touch-manipulation"
          title="Refresh weather"
        >
          <RefreshCw size={14} className="sm:hidden" />
          <RefreshCw size={16} className="hidden sm:block" />
        </button>
      </div>
    </div>
  );
};
