export const WeatherLoading = () => {
  return (
    <div className="weather-widget bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    </div>
  );
};
