import pool from '../config/database.js';
import type { ChatMessage } from './openai.service.js';
import { encode } from 'gpt-tokenizer';
import logger from '../utils/logger.js';
import { cacheService } from './cache.service.js';

export interface StoredMessage {
  message_id: string;
  conversation_id: string;
  user_text: string;
  llm_response: string;
  model_used: string;
  user_tokens: number;
  assistant_tokens: number;
  total_tokens: number;
  created_at: Date;
  metadata: Record<string, unknown>;
}

export class ChatService {
  async createConversation(sessionId: string): Promise<void> {
    logger.info(`Creating new conversation with ID: ${sessionId}`);
    await pool.query(
      'INSERT INTO conversations (conversation_id) VALUES ($1)',
      [sessionId]
    );
    logger.info(`Conversation created successfully: ${sessionId}`);
  }

  async saveMessage(
    sessionId: string,
    userText: string,
    llmResponse: string
  ): Promise<void> {
    logger.info(`Processing message for conversation: ${sessionId}`);
    
    // First ensure conversation exists
    const conversationResult = await pool.query(
      'SELECT conversation_id FROM conversations WHERE conversation_id = $1',
      [sessionId]
    );

    if (conversationResult.rows.length === 0) {
      logger.info(`Conversation ${sessionId} not found, creating new conversation`);
      await this.createConversation(sessionId);
    }

    try {
      // Parse the LLM response to get the message ID
      const parsedResponse = JSON.parse(llmResponse);
      const messageId = parsedResponse.message_id;
      logger.info(`Processing message ID: ${messageId}`);

      // Calculate token counts
      const userTokens = encode(userText).length;
      const assistantTokens = encode(parsedResponse.response).length;
      const totalTokens = userTokens + assistantTokens;
      
      logger.info(`Token counts - User: ${userTokens}, Assistant: ${assistantTokens}, Total: ${totalTokens}`);

      // Save the message
      await pool.query(
        `INSERT INTO messages 
         (message_id, conversation_id, user_text, llm_response, model_used, user_tokens, assistant_tokens, total_tokens) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [messageId, sessionId, userText, llmResponse, parsedResponse.model, userTokens, assistantTokens, totalTokens]
      );
      
      logger.info(`Message saved successfully - ID: ${messageId}, Model: ${parsedResponse.model}`);
      
      // Update cache with new messages
      await cacheService.appendToConversationHistory(sessionId, userText, parsedResponse.response);
    } catch (error) {
      logger.error(`Error saving message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getConversationHistory(sessionId: string): Promise<ChatMessage[]> {
    logger.info(`Fetching conversation history for session: ${sessionId}`);
    
    // Try cache first
    const cachedHistory = await cacheService.getConversationHistory(sessionId);
    if (cachedHistory) {
      return cachedHistory;
    }
    
    try {
      // Fallback to database
      const result = await pool.query<StoredMessage>(
        `SELECT * FROM messages 
         WHERE conversation_id = $1 
         ORDER BY created_at ASC`,
        [sessionId]
      );

      logger.info(`Found ${result.rows.length} messages in conversation ${sessionId}`);
      
      // Convert database rows to alternating user/assistant messages
      const history: ChatMessage[] = [];
      
      for (const row of result.rows) {
        // Add user message
        history.push({
          role: 'user',
          content: row.user_text
        });
        
        // Add assistant message if llm_response exists
        if (row.llm_response) {
          try {
            const parsedResponse = JSON.parse(row.llm_response);
            history.push({
              role: 'assistant',
              content: parsedResponse.response || row.llm_response
            });
          } catch (parseError) {
            // If parsing fails, use raw response
            history.push({
              role: 'assistant',
              content: row.llm_response
            });
          }
        }
      }
      
      // Cache the result for future requests
      if (history.length > 0) {
        await cacheService.setConversationHistory(sessionId, history);
      }
      
      logger.info(`Converted to ${history.length} chat messages for session ${sessionId}`);
      return history;
    } catch (error) {
      logger.error(`Error fetching conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

export const chatService = new ChatService();
