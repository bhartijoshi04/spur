import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function initializeDatabase() {
    try {
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schemaSQL);
        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Error initializing database schema:', error);
        throw error;
    }
}

export default initializeDatabase;
