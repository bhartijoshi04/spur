import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { generateReply } from "../services/openai.service.js";
import { chatService } from "../services/chat.service.js";
import logger from '../utils/logger.js';

const ChatBodySchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().min(1)
});

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    logger.info('Processing chat request');
    const { message, sessionId } = ChatBodySchema.parse(req.body);
    logger.info(`Chat request - Session: ${sessionId}, Message length: ${message.length}`);
    
    // Get conversation history
    const history = await chatService.getConversationHistory(sessionId);
    logger.info(`Retrieved conversation history with ${history.length} messages`);
    
    // Generate reply from OpenAI
    logger.info('Generating OpenAI reply...');
    const reply = await generateReply(history, message);
    logger.info('OpenAI reply generated successfully');
    
    // Save the interaction to database
    await chatService.saveMessage(sessionId, message, reply);
    
    logger.info('Chat request completed successfully');
    res.status(200).json({ reply, sessionId });
  } catch (err) {
    logger.error(`Chat error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    next(err);
  }
}
