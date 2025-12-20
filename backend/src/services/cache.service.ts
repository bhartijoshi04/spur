import { redisClient } from '../config/redis.js';
import type { ChatMessage } from './openai.service.js';
import logger from '../utils/logger.js';

export class CacheService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_PREFIX = 'chat:history:';

  /**
   * Get cached conversation history
   */
  async getConversationHistory(sessionId: string): Promise<ChatMessage[] | null> {
    try {
      const key = `${this.CACHE_PREFIX}${sessionId}`;
      const cached = await redisClient.get(key);
      
      if (!cached) {
        logger.info(`Cache miss for session: ${sessionId}`);
        return null;
      }
      
      const history = JSON.parse(cached) as ChatMessage[];
      logger.info(`Cache hit for session: ${sessionId}, ${history.length} messages`);
      return history;
    } catch (error) {
      logger.error(`Cache get error for session ${sessionId}:`, error);
      return null; // Fail gracefully, fallback to database
    }
  }

  /**
   * Cache conversation history with TTL
   */
  async setConversationHistory(sessionId: string, history: ChatMessage[]): Promise<void> {
    try {
      const key = `${this.CACHE_PREFIX}${sessionId}`;
      const serialized = JSON.stringify(history);
      
      await redisClient.setEx(key, this.CACHE_TTL, serialized);
      logger.info(`Cached conversation history for session: ${sessionId}, ${history.length} messages`);
    } catch (error) {
      logger.error(`Cache set error for session ${sessionId}:`, error);
      // Don't throw - caching is not critical for functionality
    }
  }

  /**
   * Invalidate conversation history cache
   */
  async invalidateConversationHistory(sessionId: string): Promise<void> {
    try {
      const key = `${this.CACHE_PREFIX}${sessionId}`;
      await redisClient.del(key);
      logger.info(`Invalidated cache for session: ${sessionId}`);
    } catch (error) {
      logger.error(`Cache invalidation error for session ${sessionId}:`, error);
    }
  }

  /**
   * Add a new message to cached history (if exists)
   */
  async appendToConversationHistory(
    sessionId: string, 
    userMessage: string, 
    assistantResponse: string
  ): Promise<void> {
    try {
      const existingHistory = await this.getConversationHistory(sessionId);
      if (!existingHistory) {
        // No cached history, will be updated on next fetch
        return;
      }

      // Add new messages to history
      const updatedHistory: ChatMessage[] = [
        ...existingHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantResponse }
      ];

      // Keep only last 10 messages (5 exchanges)
      const trimmedHistory = updatedHistory.slice(-10);
      
      await this.setConversationHistory(sessionId, trimmedHistory);
    } catch (error) {
      logger.error(`Error appending to cached history for session ${sessionId}:`, error);
    }
  }

  /**
   * Check Redis connection health
   */
  async isHealthy(): Promise<boolean> {
    try {
      await redisClient.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService();
