const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const { connectRedis, disconnectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const createCsrfProtection = require('./middleware/csrfProtection');
const { assertJwtConfiguration } = require('./utils/jwt');

// Import routes
const authRoutes = require('./routes/authRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const fileRoutes = require('./routes/fileRoutes');
const plannerWidgetRoutes = require('./routes/plannerWidgetRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const chatRoutes = require('./routes/chatRoutes');
const searchRoutes = require('./routes/searchRoutes');
const focusRoutes = require('./routes/focusRoutes');
const contentInsightRoutes = require('./routes/contentInsightRoutes');

const app = express();

// Set NODE_ENV to production if not set (for deployment platforms)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

assertJwtConfiguration();

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
const configuredClientOrigins = String(process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return value;
    }
  });

const developmentOrigins = process.env.NODE_ENV === 'development'
  ? [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ]
  : [];

const allowedOrigins = new Set([...configuredClientOrigins, ...developmentOrigins]);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) {
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
app.use(cookieParser());
app.use(createCsrfProtection({ allowedOrigins }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'OK' : 'DEGRADED',
    message: 'Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    dependencies: { database: databaseReady ? 'connected' : 'disconnected' }
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
      youtube: '/api/youtube',
      collections: '/api/collections',
      files: '/api/files',
      chat: '/api/chat',
      search: '/api/search',
      focus: '/api/focus',
      insights: '/api/insights'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/planner-widgets', plannerWidgetRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/insights', contentInsightRoutes);

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

let server = null;
const startServer = async () => {
  await connectDB();
  await connectRedis();
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`Dashboard API available at http://localhost:${PORT}`);
    console.log(`Health check at http://localhost:${PORT}/health`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exitCode = 1;
  });
}

let isShuttingDown = false;
const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully...`);

  (async () => {
    try {
      if (server) {
        await new Promise((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve()))
        );
      }

      const results = await Promise.allSettled([mongoose.disconnect(), disconnectRedis()]);
      const failed = results.find((result) => result.status === 'rejected');
      if (failed) {
        console.error('One or more services failed to close cleanly:', failed.reason);
        process.exitCode = 1;
      } else {
        console.log('Process terminated');
      }
    } catch (error) {
      console.error('HTTP server failed to close cleanly:', error);
      process.exitCode = 1;
    }
  })();
};

// Graceful shutdown
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
