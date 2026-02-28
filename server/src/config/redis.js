const { createClient } = require('redis');

let redisClient = null;
let connectPromise = null;

const REDIS_DISABLED_VALUES = new Set(['0', 'false', 'no', 'off']);

const isRedisEnabled = () => {
  const raw = String(process.env.REDIS_ENABLED || 'true')
    .trim()
    .toLowerCase();
  return !REDIS_DISABLED_VALUES.has(raw);
};

const getRedisUrl = () => String(process.env.REDIS_URL || '').trim();

const getRedisClient = () => {
  if (!redisClient || !redisClient.isReady) {
    return null;
  }
  return redisClient;
};

const connectRedis = async () => {
  if (!isRedisEnabled()) {
    console.log('[Redis] Disabled via REDIS_ENABLED');
    return null;
  }

  if (!getRedisUrl()) {
    console.warn('[Redis] REDIS_URL is missing. Chat cache is disabled.');
    return null;
  }

  if (redisClient?.isReady) {
    return redisClient;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const redisUrl = getRedisUrl();
  redisClient = createClient({ url: redisUrl });

  redisClient.on('error', (error) => {
    console.warn('[Redis] Client error:', error.message);
  });

  connectPromise = redisClient
    .connect()
    .then(() => {
      console.log('[Redis] Connected');
      return redisClient;
    })
    .catch((error) => {
      console.warn('[Redis] Connection failed:', error.message);
      redisClient = null;
      return null;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
};

const disconnectRedis = async () => {
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.quit();
    console.log('[Redis] Disconnected');
  } catch (error) {
    console.warn('[Redis] Disconnect failed:', error.message);
  } finally {
    redisClient = null;
  }
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedisClient
};
