import { Router } from "express";
import { chat } from "../controllers/ai.controller.js";
import { rateLimitMiddleware } from "../middleware/rateLimiter.middleware.js";

export const aiRoutes = Router();

aiRoutes.post("/chat/message", rateLimitMiddleware, chat);
