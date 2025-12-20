import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

const server = createServer(app);

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await disconnectRedis();
  process.exit(0);
});

// Initialize Redis and start server
async function startServer() {
  try {
    // Connect to Redis
    await connectRedis();
    
    // Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`Server started successfully on port ${env.PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('Redis connection established');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
