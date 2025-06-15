import { useState, useEffect } from 'react';
import { useGeolocation } from './useCommon';
import { weatherAPI } from '../services/api';

// useWeather hook
export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  // fetchWeatherData function
  const fetchWeatherData = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);

      const response = await weatherAPI.getWeatherByCoords(lat, lon);
      setWeather(response.data);
      setLoading(false);

    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch weather data');
      setLoading(false);
    }
  };
  // fetchWeatherByLocation function
  const fetchWeatherByLocation = async (location) => {
    try {
      setLoading(true);
      setError(null);

      const response = await weatherAPI.getCurrentWeather(location);
      setWeather(response.data);
      setLoading(false);

    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch weather data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!geoLoading && !geoError && latitude && longitude) {
      fetchWeatherData(latitude, longitude);
    } else if (!geoLoading && geoError) {
      fetchWeatherByLocation('New York, NY'); // Default location
    }
  }, [latitude, longitude, geoError, geoLoading]);

  return {
    weather,
    loading,
    error,
    refetch: () => {
      if (latitude && longitude) {
        fetchWeatherData(latitude, longitude);
      }
    },
    fetchByLocation: fetchWeatherByLocation
  };
};
