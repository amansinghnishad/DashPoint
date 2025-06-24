import { useState } from "react";
import { useWeather } from "../../hooks/useWeather";
import { WeatherLoading } from "./components/WeatherLoading";
import { WeatherError } from "./components/WeatherError";
import { WeatherHeader } from "./components/WeatherHeader";
import { LocationInput } from "./components/LocationInput";
import { CurrentWeather } from "./components/CurrentWeather";
import { WeatherDetails } from "./components/WeatherDetails";
import { WeatherForecast } from "./components/WeatherForecast";
import { WeatherFooter } from "./components/WeatherFooter";
import { getWeatherColors } from "./utils/weatherHelpers";

export const Weather = () => {
  const { weather, loading, error, refetch, fetchByLocation } = useWeather();
  const [customLocation, setCustomLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocation.trim()) {
      fetchByLocation(customLocation.trim());
      setShowLocationInput(false);
      setCustomLocation("");
    }
  };

  const handleLocationToggle = () => {
    setShowLocationInput(!showLocationInput);
  };

  if (loading) {
    return <WeatherLoading />;
  }

  if (error) {
    return <WeatherError error={error} onRetry={refetch} />;
  }

  if (!weather) {
    return <WeatherError error="No weather data available" onRetry={refetch} />;
  }

  const weatherCondition =
    weather.current?.weather?.main || weather.condition || "clear";
  const gradientColors = getWeatherColors(weatherCondition);
  return (
    <div
      className={`weather-widget bg-gradient-to-br ${gradientColors} rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg`}
    >
      <WeatherHeader
        weather={weather}
        onLocationToggle={handleLocationToggle}
        onRefresh={refetch}
      />

      {showLocationInput && (
        <LocationInput
          value={customLocation}
          onChange={setCustomLocation}
          onSubmit={handleLocationSubmit}
        />
      )}

      <CurrentWeather weather={weather} />

      <WeatherDetails weather={weather} />

      <WeatherForecast forecast={weather.forecast} />

      <WeatherFooter />
    </div>
  );
};
