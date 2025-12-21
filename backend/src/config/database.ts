import { Pool } from 'pg';
import { env } from './env.js';

// Create pool using either connection string (for Neon) or individual parameters
const pool = new Pool(
    env.DATABASE_URL 
        ? {
            connectionString: env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
        : {
            user: env.POSTGRES_USER,
            host: env.POSTGRES_HOST,
            database: env.POSTGRES_DB,
            password: env.POSTGRES_PASSWORD,
            port: env.POSTGRES_PORT,
        }
);

export default pool;
