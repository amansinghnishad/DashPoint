import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useWeather } from "../hooks/useWeather";
import { formatDateTime } from "../utils/dateUtils";

const WeatherIcon = ({ condition, size = 48 }) => {
  const iconMap = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: CloudSnow,
    default: Sun,
  };

  const IconComponent = iconMap[condition?.toLowerCase()] || iconMap.default;

  return <IconComponent size={size} className="text-blue-500" />;
};

const ForecastItem = ({ forecast }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
      <p className="text-sm font-medium text-gray-700 mb-2">{forecast.day}</p>
      <div className="mb-2">
        <span className="text-2xl">{forecast.icon}</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-gray-900">{forecast.high}°</p>
        <p className="text-sm text-gray-500">{forecast.low}°</p>
      </div>
    </div>
  );
};

export const Weather = () => {
  const { weather, loading, error, refetch, fetchByLocation } = useWeather();
  const [customLocation, setCustomLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);

  // handleLocationSubmit function
  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocation.trim()) {
      fetchByLocation(customLocation.trim());
      setShowLocationInput(false);
    }
  };

  if (loading) {
    return (
      <div className="weather-widget bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl p-6 text-white">
        <div className="text-center">
          <Cloud size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Weather Unavailable</p>
          <p className="text-sm opacity-80 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-widget bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl p-6 text-white">
        <div className="text-center">
          <Cloud size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No Weather Data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
      {/* Header */}{" "}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-2">
          <MapPin size={18} />
          <span className="font-medium">
            {weather.location?.name
              ? `${weather.location.name}, ${weather.location.country}`
              : weather.location}
          </span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowLocationInput(!showLocationInput)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Change location"
          >
            <MapPin size={16} />
          </button>
          <button
            onClick={refetch}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Refresh weather"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      {/* Location Input */}
      {showLocationInput && (
        <form onSubmit={handleLocationSubmit} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 p-2 rounded-lg bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none focus:border-white/50"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium"
            >
              Get Weather
            </button>
          </div>
        </form>
      )}{" "}
      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-bold mb-1">
            {weather.current?.temperature || weather.temperature}°C
          </div>
          <div className="text-lg opacity-90">
            {weather.current?.weather?.description || weather.condition}
          </div>
          <div className="text-sm opacity-75">
            Feels like {weather.current?.feelsLike || weather.temperature + 2}°C
          </div>
        </div>

        <div className="text-6xl">
          {weather.current?.weather?.icon ? `☀️` : weather.icon || "☀️"}
        </div>
      </div>{" "}
      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Droplets size={16} />
            <span className="text-sm">Humidity</span>
          </div>
          <div className="text-lg font-semibold">
            {weather.current?.humidity || weather.humidity}%
          </div>
        </div>

        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Wind size={16} />
            <span className="text-sm">Wind</span>
          </div>
          <div className="text-lg font-semibold">
            {weather.current?.windSpeed || weather.windSpeed} km/h
          </div>
        </div>
      </div>
      {/* Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">3-Day Forecast</h3>
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.map((forecast, index) => (
              <div
                key={index}
                className="bg-white/20 rounded-lg p-3 text-center"
              >
                <p className="text-xs font-medium mb-1">{forecast.day}</p>
                <div className="text-lg mb-1">{forecast.icon}</div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{forecast.high}°</p>
                  <p className="text-xs opacity-75">{forecast.low}°</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs opacity-75 text-center">
          Last updated: {formatDateTime(new Date(), "HH:mm")}
        </p>
      </div>
    </div>
  );
};
