const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const contentExtractionRoutes = require('./routes/contentExtractionRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const aiServicesRoutes = require('./routes/aiServicesRoutes');
const fileRoutes = require('./routes/fileRoutes');
const conversationalRoutes = require('./routes/conversationalRoutes');
const plannerWidgetRoutes = require('./routes/plannerWidgetRoutes');
const calendarRoutes = require('./routes/calendarRoutes');

const app = express();

// Set NODE_ENV to production if not set (for deployment platforms)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 30 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      process.env.CLIENT_URL,
      // Allow all Vercel deployments for this project
      /^https:\/\/dash-point-.*\.vercel\.app$/,
      /^https:\/\/dashpoint-.*\.vercel\.app$/
    ].filter(Boolean);

    // Check if origin matches any allowed origin (string or regex)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('CORS blocked origin:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  }, credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route - API information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'DashPoint API',
    version: '1.0.0',
    message: 'Welcome to the DashPoint Dashboard API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      'content-extraction': '/api/content-extraction', weather: '/api/weather',
      youtube: '/api/youtube',
      collections: '/api/collections',
      ai: '/api/ai',
      files: '/api/files'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/content-extraction', contentExtractionRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/ai', aiServicesRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/conversational', conversationalRoutes);
app.use('/api/planner-widgets', plannerWidgetRoutes);
app.use('/api/calendar', calendarRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
