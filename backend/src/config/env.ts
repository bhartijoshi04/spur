import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  OPENAI_API_KEY: z.string().min(1),
  // Database configuration - supports either connection string or individual params
  DATABASE_URL: z.string().optional(),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_DB: z.string().default('spur_chat'),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  // Redis configuration - supports both Upstash REST API and traditional Redis
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
});

export const env = EnvSchema.parse({
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  REDIS_URL: process.env.REDIS_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: process.env.REDIS_DB,
});
