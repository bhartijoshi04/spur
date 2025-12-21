import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import { routes } from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import logger from "./utils/logger.js";

export const app = express();

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:8080',
    'http://10.50.1.174:8080'  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: "1mb" }));

// Error handling for JSON parsing
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    logger.error('Invalid JSON:', err);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    // Import here to avoid circular dependency issues during startup
    const { cacheService } = await import("./services/cache.service.js");
    
    const isRedisHealthy = await cacheService.isHealthy();
    
    res.status(200).json({ 
      ok: true,
      services: {
        redis: isRedisHealthy ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false,
      error: 'Health check failed',
      services: {
        redis: 'unknown'
      }
    });
  }
});

app.use("/api", routes);

// Log all errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error processing ${req.method} ${req.url}:`, err);
  next(err);
});

app.use(notFoundHandler);
app.use(errorHandler);
