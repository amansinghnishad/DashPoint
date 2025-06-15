const express = require('express');
const { query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');

const router = express.Router();

// Import controller (will create it next)
const weatherController = require('../controllers/weatherController');

// All routes require authentication
router.use(auth);

// Rate limiting for weather API calls
const weatherLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 weather requests per 15 minutes
  message: {
    error: 'Too many weather requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const getCurrentWeatherValidation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lon')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('units')
    .optional()
    .isIn(['metric', 'imperial', 'kelvin'])
    .withMessage('Units must be one of: metric, imperial, kelvin')
];

const getWeatherByCityValidation = [
  query('city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City name is required and must be less than 100 characters'),
  query('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters'),
  query('units')
    .optional()
    .isIn(['metric', 'imperial', 'kelvin'])
    .withMessage('Units must be one of: metric, imperial, kelvin')
];

const getForecastValidation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lon')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Days must be between 1 and 7'),
  query('units')
    .optional()
    .isIn(['metric', 'imperial', 'kelvin'])
    .withMessage('Units must be one of: metric, imperial, kelvin')
];

// Routes
router.get('/current', weatherLimiter, getCurrentWeatherValidation, weatherController.getCurrentWeather);
router.get('/current/city', weatherLimiter, getWeatherByCityValidation, weatherController.getCurrentWeatherByCity);
router.get('/forecast', weatherLimiter, getForecastValidation, weatherController.getForecast);
router.get('/forecast/city', weatherLimiter, getWeatherByCityValidation, weatherController.getForecastByCity);

module.exports = router;
