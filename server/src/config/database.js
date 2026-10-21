const mongoose = require('mongoose');
const { logger } = require('../utils/observability');
require('dotenv').config();

// connectDatabase function
const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info('dependency.connected', { dependency: 'mongodb', host: conn.connection.host });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('dependency.error', { dependency: 'mongodb', errorName: err.name, errorCode: err.code });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('dependency.disconnected', { dependency: 'mongodb' });
    });

  } catch (error) {
    logger.error('dependency.connection_failed', {
      dependency: 'mongodb',
      errorName: error.name,
      errorCode: error.code
    });
    throw error;
  }
};

module.exports = connectDatabase;
