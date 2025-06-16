export const ForecastItem = ({ forecast }) => {
  return (
    <div className="bg-white/20 rounded-lg p-3 text-center">
      <p className="text-xs font-medium mb-1">{forecast.day}</p>
      <div className="text-lg mb-1">{forecast.icon}</div>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">{forecast.high}°</p>
        <p className="text-xs opacity-75">{forecast.low}°</p>
      </div>
    </div>
  );
};

export const WeatherForecast = ({ forecast }) => {
  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">3-Day Forecast</h3>
      <div className="grid grid-cols-3 gap-2">
        {forecast.map((forecastItem, index) => (
          <ForecastItem key={index} forecast={forecastItem} />
        ))}
      </div>
    </div>
  );
};
