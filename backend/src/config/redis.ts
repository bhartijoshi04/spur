import { createClient } from 'redis';
import { env } from './env.js';
import logger from '../utils/logger.js';

export type RedisClient = ReturnType<typeof createClient>;

// Create Redis client with priority: Valid REDIS_URL > Upstash config > individual params
function createRedisConfig() {
  // Check if REDIS_URL is valid (not placeholder)
  if (env.REDIS_URL && !env.REDIS_URL.includes('username:password')) {
    return { url: env.REDIS_URL };
  }
  
  // Check for Upstash configuration
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      socket: {
        host: new URL(env.UPSTASH_REDIS_REST_URL).hostname,
        port: parseInt(new URL(env.UPSTASH_REDIS_REST_URL).port) || 6379,
        tls: true
      },
      password: env.UPSTASH_REDIS_REST_TOKEN,
    };
  }
  
  // Fallback to individual parameters
  return {
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
    password: env.REDIS_PASSWORD || undefined,
    database: env.REDIS_DB,
  };
}

export const redisClient = createClient(createRedisConfig());

redisClient.on('error', (err: Error) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('end', () => {
  logger.info('Redis client disconnected');
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
    logger.info('Successfully connected to Redis');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redisClient.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
}
