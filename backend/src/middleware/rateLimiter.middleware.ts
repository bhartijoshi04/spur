import type { Request, Response, NextFunction } from "express";
import { rateLimiterService } from "../services/rateLimiter.service.js";
import logger from "../utils/logger.js";

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract session ID from request body
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        error: { message: "Session ID is required" }
      });
    }

    // Check rate limits
    const rateLimitResult = await rateLimiterService.checkRateLimit(sessionId);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Session-Remaining': rateLimitResult.sessionLimit.remaining.toString(),
      'X-RateLimit-Session-Reset': new Date(rateLimitResult.sessionLimit.resetTime).toISOString(),
      'X-RateLimit-Global-Remaining': rateLimitResult.globalLimit.remaining.toString(),
      'X-RateLimit-Global-Reset': new Date(rateLimitResult.globalLimit.resetTime).toISOString()
    });

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.sessionLimit.resetTime - Date.now()) / 1000);
      
      logger.warn(`Rate limit exceeded for session ${sessionId}: ${rateLimitResult.reason}`);
      
      return res.status(429).json({
        error: {
          message: "Rate limit exceeded. Please try again later.",
          reason: rateLimitResult.reason,
          retryAfter
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Rate limit middleware error:', error);
    // Fail open - allow request if rate limiting fails
    next();
  }
}
