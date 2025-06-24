import { Droplets, Wind } from "lucide-react";

export const WeatherDetails = ({ weather }) => {
  const humidity = weather.current?.humidity || weather.humidity;
  const windSpeed = weather.current?.windSpeed || weather.windSpeed;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-white/20 rounded-lg p-2 sm:p-3">
        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
          <Droplets size={14} className="sm:hidden" />
          <Droplets size={16} className="hidden sm:block" />
          <span className="text-xs sm:text-sm">Humidity</span>
        </div>
        <div className="text-base sm:text-lg font-semibold">{humidity}%</div>
      </div>

      <div className="bg-white/20 rounded-lg p-2 sm:p-3">
        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
          <Wind size={14} className="sm:hidden" />
          <Wind size={16} className="hidden sm:block" />
          <span className="text-xs sm:text-sm">Wind</span>
        </div>
        <div className="text-base sm:text-lg font-semibold">
          {windSpeed} km/h
        </div>
      </div>
    </div>
  );
};
