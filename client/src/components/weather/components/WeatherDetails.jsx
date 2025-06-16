import { Droplets, Wind } from "lucide-react";

export const WeatherDetails = ({ weather }) => {
  const humidity = weather.current?.humidity || weather.humidity;
  const windSpeed = weather.current?.windSpeed || weather.windSpeed;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white/20 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <Droplets size={16} />
          <span className="text-sm">Humidity</span>
        </div>
        <div className="text-lg font-semibold">{humidity}%</div>
      </div>

      <div className="bg-white/20 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <Wind size={16} />
          <span className="text-sm">Wind</span>
        </div>
        <div className="text-lg font-semibold">{windSpeed} km/h</div>
      </div>
    </div>
  );
};
