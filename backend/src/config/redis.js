const redis = require("redis");
const logger = require("../utils/logger");

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      // Stop reconnecting after 2 attempts in development
      if (retries > 2) {
        logger.warn("Redis unavailable - continuing without cache");
        return false; // Stop reconnecting
      }
      return retries * 100;
    },
  },
});

redisClient.on("error", (err) => {
  // Suppress reconnection error messages after initial failure
  if (!err.message.includes("ECONNREFUSED")) {
    logger.error(`Redis Error: ${err.message}`);
  }
});

redisClient.on("connect", () => {
  logger.info("Redis Connected");
});

redisClient.on("reconnecting", () => {
  // Silent reconnection attempts
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error(`Redis Connection Error: ${error.message}`);
    logger.info("Server will continue without Redis caching");
  }
};

// Cache helper functions
const cacheGet = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache Get Error: ${error.message}`);
    return null;
  }
};

const cacheSet = async (key, value, expiryInSeconds = 1800) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.setEx(key, expiryInSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error(`Cache Set Error: ${error.message}`);
  }
};

const cacheDel = async (key) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Cache Delete Error: ${error.message}`);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  cacheGet,
  cacheSet,
  cacheDel,
};
