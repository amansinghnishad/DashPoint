const { validationResult } = require('express-validator');
const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper function to make OpenWeather API calls
const makeWeatherRequest = async (endpoint, params) => {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  const response = await axios.get(`${OPENWEATHER_BASE_URL}${endpoint}`, {
    params: {
      ...params,
      appid: OPENWEATHER_API_KEY
    },
    timeout: 10000
  });

  return response.data;
};

// Get current weather by coordinates
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lon, units = 'metric' } = req.query;

    const weatherData = await makeWeatherRequest('/weather', {
      lat,
      lon,
      units
    });

    // Transform the data to a cleaner format
    const response = {
      location: {
        name: weatherData.name,
        country: weatherData.sys.country,
        coordinates: {
          lat: weatherData.coord.lat,
          lon: weatherData.coord.lon
        }
      },
      current: {
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        windSpeed: weatherData.wind?.speed,
        windDirection: weatherData.wind?.deg,
        cloudiness: weatherData.clouds.all,
        weather: {
          main: weatherData.weather[0].main,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon
        }
      },
      sun: {
        sunrise: new Date(weatherData.sys.sunrise * 1000).toISOString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toISOString()
      },
      units,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    next(error);
  }
};

// Get current weather by city name
exports.getCurrentWeatherByCity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { city, country, units = 'metric' } = req.query;
    const location = country ? `${city},${country}` : city;

    const weatherData = await makeWeatherRequest('/weather', {
      q: location,
      units
    });

    // Transform the data to a cleaner format
    const response = {
      location: {
        name: weatherData.name,
        country: weatherData.sys.country,
        coordinates: {
          lat: weatherData.coord.lat,
          lon: weatherData.coord.lon
        }
      },
      current: {
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        windSpeed: weatherData.wind?.speed,
        windDirection: weatherData.wind?.deg,
        cloudiness: weatherData.clouds.all,
        weather: {
          main: weatherData.weather[0].main,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon
        }
      },
      sun: {
        sunrise: new Date(weatherData.sys.sunrise * 1000).toISOString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toISOString()
      },
      units,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }
    next(error);
  }
};

// Get weather forecast by coordinates
exports.getForecast = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lon, days = 5, units = 'metric' } = req.query;

    const forecastData = await makeWeatherRequest('/forecast', {
      lat,
      lon,
      units,
      cnt: days * 8 // 8 forecasts per day (every 3 hours)
    });

    // Transform the data to a cleaner format
    const response = {
      location: {
        name: forecastData.city.name,
        country: forecastData.city.country,
        coordinates: {
          lat: forecastData.city.coord.lat,
          lon: forecastData.city.coord.lon
        }
      },
      forecast: forecastData.list.map(item => ({
        datetime: new Date(item.dt * 1000).toISOString(),
        temperature: {
          temp: item.main.temp,
          feelsLike: item.main.feels_like,
          min: item.main.temp_min,
          max: item.main.temp_max
        },
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind?.speed,
        windDirection: item.wind?.deg,
        cloudiness: item.clouds.all,
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        },
        precipitationProbability: item.pop * 100
      })),
      units,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    next(error);
  }
};

// Get weather forecast by city name
exports.getForecastByCity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { city, country, days = 5, units = 'metric' } = req.query;
    const location = country ? `${city},${country}` : city;

    const forecastData = await makeWeatherRequest('/forecast', {
      q: location,
      units,
      cnt: days * 8 // 8 forecasts per day (every 3 hours)
    });

    // Transform the data to a cleaner format
    const response = {
      location: {
        name: forecastData.city.name,
        country: forecastData.city.country,
        coordinates: {
          lat: forecastData.city.coord.lat,
          lon: forecastData.city.coord.lon
        }
      },
      forecast: forecastData.list.map(item => ({
        datetime: new Date(item.dt * 1000).toISOString(),
        temperature: {
          temp: item.main.temp,
          feelsLike: item.main.feels_like,
          min: item.main.temp_min,
          max: item.main.temp_max
        },
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind?.speed,
        windDirection: item.wind?.deg,
        cloudiness: item.clouds.all,
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        },
        precipitationProbability: item.pop * 100
      })),
      units,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }
    next(error);
  }
};
