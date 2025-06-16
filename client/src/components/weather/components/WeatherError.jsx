import { Cloud } from "lucide-react";

export const WeatherError = ({ error, onRetry }) => {
  return (
    <div className="weather-widget bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl p-6 text-white">
      <div className="text-center">
        <Cloud size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Weather Unavailable</p>
        <p className="text-sm opacity-80 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
