import pool from '../config/database.js';
import { env } from '../config/env.js';

async function testNeonConnection() {
    try {
        console.log('Testing Neon PostgreSQL connection...');
        console.log(`Using ${env.DATABASE_URL ? 'DATABASE_URL' : 'individual parameters'}`);
        
        // Test basic connection
        const client = await pool.connect();
        console.log('✅ Successfully connected to Neon PostgreSQL');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Query test successful:', result.rows[0]);
        
        // Test database info
        const dbInfo = await client.query('SELECT version()');
        console.log('✅ Database version:', dbInfo.rows[0].version);
        
        client.release();
        
        // Test connection pool
        await pool.query('SELECT 1');
        console.log('✅ Connection pool working correctly');
        
        console.log('\n🎉 Neon PostgreSQL connection is fully operational!');
        
    } catch (error) {
        console.error('❌ Error testing Neon connection:', error);
        console.error('\nTroubleshooting:');
        console.error('1. Check your DATABASE_URL in .env file');
        console.error('2. Ensure your Neon database is running and accessible');
        console.error('3. Verify SSL settings and network connectivity');
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testNeonConnection();
