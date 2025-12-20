import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { OpenAIError } from "../errors/openai.error.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const zodErr = err as ZodError;
    res.status(400).json({
      error: {
        message: "Validation error",
        issues: zodErr.issues,
      },
    });
    return;
  }

  if (err instanceof OpenAIError) {
    res.status(err.statusCode).json({
      error: { message: err.message }
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({ error: { message: err.message } });
    return;
  }

  res.status(500).json({ error: { message: "Unknown error" } });
}
