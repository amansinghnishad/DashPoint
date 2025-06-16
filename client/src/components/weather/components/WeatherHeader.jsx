import { MapPin, RefreshCw } from "lucide-react";

export const WeatherHeader = ({
  weather,
  onLocationToggle,
  onRefresh,
  showLocationInput,
}) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center space-x-2">
        <MapPin size={18} />
        <span className="font-medium">
          {weather?.location?.name
            ? `${weather.location.name}, ${weather.location.country}`
            : weather?.location || "Unknown Location"}
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onLocationToggle}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Change location"
        >
          <MapPin size={16} />
        </button>
        <button
          onClick={onRefresh}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Refresh weather"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};
