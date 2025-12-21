import { redisClient, connectRedis, disconnectRedis } from '../config/redis.js';
import { env } from '../config/env.js';

async function testUpstashRedis() {
    try {
        console.log('Testing Upstash Redis connection...');
        
        // Log configuration being used
        if (env.REDIS_URL) {
            console.log('Using REDIS_URL connection');
        } else if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
            console.log('Using Upstash REST API connection');
            console.log(`Endpoint: ${env.UPSTASH_REDIS_REST_URL}`);
        } else {
            console.log('Using traditional Redis parameters');
            console.log(`Host: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
        }
        
        // Connect to Redis
        await connectRedis();
        console.log('✅ Successfully connected to Upstash Redis');
        
        // Test basic operations
        const testKey = 'test:connection';
        const testValue = 'Hello Upstash!';
        
        // Set a value
        await redisClient.set(testKey, testValue);
        console.log('✅ SET operation successful');
        
        // Get the value
        const retrievedValue = await redisClient.get(testKey);
        if (retrievedValue === testValue) {
            console.log('✅ GET operation successful:', retrievedValue);
        } else {
            throw new Error(`GET failed: expected "${testValue}", got "${retrievedValue}"`);
        }
        
        // Test with expiration
        await redisClient.setEx('test:expiry', 10, 'expires in 10s');
        console.log('✅ SETEX operation successful');
        
        // Test PING
        const pong = await redisClient.ping();
        console.log('✅ PING successful:', pong);
        
        // Test cache service functionality
        const { cacheService } = await import('../services/cache.service.js');
        const isHealthy = await cacheService.isHealthy();
        if (isHealthy) {
            console.log('✅ Cache service health check passed');
        } else {
            throw new Error('Cache service health check failed');
        }
        
        // Clean up test data
        await redisClient.del(testKey);
        await redisClient.del('test:expiry');
        console.log('✅ Cleanup successful');
        
        console.log('\n🎉 Upstash Redis connection is fully operational!');
        
    } catch (error) {
        console.error('❌ Error testing Upstash Redis:', error);
        console.error('\nTroubleshooting:');
        console.error('1. Check your Upstash Redis credentials in .env file');
        console.error('2. Ensure your Upstash Redis database is active');
        console.error('3. Verify network connectivity and TLS settings');
        console.error('4. Check if you\'re using the correct endpoint and token');
        process.exit(1);
    } finally {
        await disconnectRedis();
        process.exit(0);
    }
}

testUpstashRedis();
