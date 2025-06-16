import { WeatherIcon } from "./WeatherIcon";

export const WeatherDisplay = ({ weather }) => {
  const temperature = weather.current?.temperature || weather.temperature;
  const condition = weather.current?.weather?.description || weather.condition;
  const feelsLike = weather.current?.feelsLike || temperature + 2;
  const icon = weather.current?.weather?.icon || weather.icon;

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="text-4xl font-bold mb-1">{temperature}°C</div>
        <div className="text-lg opacity-90 capitalize">{condition}</div>
        <div className="text-sm opacity-75">Feels like {feelsLike}°C</div>
      </div>

      <div className="text-6xl">
        {icon ? (
          <span>{icon}</span>
        ) : (
          <WeatherIcon condition={condition} size={60} />
        )}
      </div>
    </div>
  );
};
