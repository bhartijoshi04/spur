import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

export class RateLimiterService {
  private readonly SESSION_WINDOW = 60; // 1 minute in seconds
  private readonly GLOBAL_WINDOW = 60; // 1 minute in seconds
  private readonly SESSION_LIMIT = 10; // requests per session per minute
  private readonly GLOBAL_LIMIT = 1000; // total requests per minute

  /**
   * Check if session is rate limited
   */
  async checkSessionRateLimit(sessionId: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const key = `rate_limit:session:${sessionId}`;
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        // First request, set expiration
        await redisClient.expire(key, this.SESSION_WINDOW);
      }
      
      const ttl = await redisClient.ttl(key);
      const remaining = Math.max(0, this.SESSION_LIMIT - current);
      const resetTime = Date.now() + (ttl * 1000);
      
      if (current > this.SESSION_LIMIT) {
        logger.warn(`Session rate limit exceeded for session: ${sessionId}, count: ${current}`);
        return { allowed: false, remaining: 0, resetTime };
      }
      
      logger.debug(`Session rate limit check passed for ${sessionId}: ${current}/${this.SESSION_LIMIT}`);
      return { allowed: true, remaining, resetTime };
    } catch (error) {
      logger.error(`Session rate limit check failed for ${sessionId}:`, error);
      // Fail open - allow request if Redis is down
      return { allowed: true, remaining: this.SESSION_LIMIT, resetTime: Date.now() + (this.SESSION_WINDOW * 1000) };
    }
  }

  /**
   * Check global rate limit
   */
  async checkGlobalRateLimit(): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const key = 'rate_limit:global';
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        // First request, set expiration
        await redisClient.expire(key, this.GLOBAL_WINDOW);
      }
      
      const ttl = await redisClient.ttl(key);
      const remaining = Math.max(0, this.GLOBAL_LIMIT - current);
      const resetTime = Date.now() + (ttl * 1000);
      
      if (current > this.GLOBAL_LIMIT) {
        logger.warn(`Global rate limit exceeded: ${current}/${this.GLOBAL_LIMIT}`);
        return { allowed: false, remaining: 0, resetTime };
      }
      
      logger.debug(`Global rate limit check passed: ${current}/${this.GLOBAL_LIMIT}`);
      return { allowed: true, remaining, resetTime };
    } catch (error) {
      logger.error('Global rate limit check failed:', error);
      // Fail open - allow request if Redis is down
      return { allowed: true, remaining: this.GLOBAL_LIMIT, resetTime: Date.now() + (this.GLOBAL_WINDOW * 1000) };
    }
  }

  /**
   * Check both session and global rate limits
   */
  async checkRateLimit(sessionId: string): Promise<{
    allowed: boolean;
    sessionLimit: { remaining: number; resetTime: number };
    globalLimit: { remaining: number; resetTime: number };
    reason?: string;
  }> {
    const [sessionResult, globalResult] = await Promise.all([
      this.checkSessionRateLimit(sessionId),
      this.checkGlobalRateLimit()
    ]);

    if (!sessionResult.allowed) {
      return {
        allowed: false,
        sessionLimit: { remaining: sessionResult.remaining, resetTime: sessionResult.resetTime },
        globalLimit: { remaining: globalResult.remaining, resetTime: globalResult.resetTime },
        reason: 'Session rate limit exceeded'
      };
    }

    if (!globalResult.allowed) {
      return {
        allowed: false,
        sessionLimit: { remaining: sessionResult.remaining, resetTime: sessionResult.resetTime },
        globalLimit: { remaining: globalResult.remaining, resetTime: globalResult.resetTime },
        reason: 'Global rate limit exceeded'
      };
    }

    return {
      allowed: true,
      sessionLimit: { remaining: sessionResult.remaining, resetTime: sessionResult.resetTime },
      globalLimit: { remaining: globalResult.remaining, resetTime: globalResult.resetTime }
    };
  }
}

export const rateLimiterService = new RateLimiterService();
