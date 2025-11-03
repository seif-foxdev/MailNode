const { createClient } = require('redis');

class Redis {
    constructor() {
        if (!this.client) {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

            // Main client for caching
            this.client = createClient({ url: redisUrl });

            // Separate clients for Pub/Sub
            this.publisher = createClient({ url: redisUrl });
            this.subscriber = createClient({ url: redisUrl });
        } else {
            console.log('[🧰] Redis client already exists.');
        }
    }

    async connect() {
        try {
            this.client.on('error', (err) => console.error('[❌] Redis Client Error', err));
            this.publisher.on('error', (err) => console.error('[❌] Redis Publisher Error', err));
            this.subscriber.on('error', (err) => console.error('[❌] Redis Subscriber Error', err));

            await Promise.all([
                this.client.connect(),
                this.publisher.connect(),
                this.subscriber.connect()
            ]);

            console.log('[🧰] Connected to Redis successfully.');
        } catch (err) {
            console.error('[❌] Error connecting to Redis:', err);
        }
    }

    // =====================
    // Caching Methods
    // =====================

    async setCache(key, value, expiration = 3600) {
        try {
            await this.client.setEx(key, expiration, JSON.stringify(value));
            console.log(`[📦] Cached data for key: ${key}`);
        } catch (error) {
            console.error('[❌] Error setting cache:', error);
        }
    }

    async getCache(key) {
        try {
            const data = await this.client.get(key);
            if (data) {
                console.log(`[📦] Cache hit for key: ${key}`);
                return JSON.parse(data);
            }
            console.log(`[📦] Cache miss for key: ${key}`);
            return null;
        } catch (error) {
            console.error('[❌] Error getting cache:', error);
            return null;
        }
    }

    async removeCache(key) {
        try {
            await this.client.del(key);
            console.log(`[🗑️] Removed cache for key: ${key}`);
        } catch (error) {
            console.error('[❌] Error removing cache:', error);
        }
    }

    // =====================
    // Pub/Sub Methods
    // =====================

    // Publish a message to a channel
    async publishMessage(channel, message) {
        try {
            const payload = typeof message === 'string' ? message : JSON.stringify(message);
            await this.publisher.publish(channel, payload);
            console.log(`[📢] Published message to channel: ${channel}`);
        } catch (error) {
            console.error('[❌] Error publishing message:', error);
        }
    }

    // Subscribe to a channel and handle messages
    async subscribeToChannel(channel, callback) {
        try {
            await this.subscriber.subscribe(channel, (message) => {
                console.log(`[📩] Received message on channel: ${channel}`);
                try {
                    const parsed = JSON.parse(message);
                    callback(parsed);
                } catch {
                    callback(message);
                }
            });
            console.log(`[🔔] Subscribed to channel: ${channel}`);
        } catch (error) {
            console.error('[❌] Error subscribing to channel:', error);
        }
    }

    // Unsubscribe from a channel
    async unsubscribeFromChannel(channel) {
        try {
            await this.subscriber.unsubscribe(channel);
            console.log(`[🔕] Unsubscribed from channel: ${channel}`);
        } catch (error) {
            console.error('[❌] Error unsubscribing from channel:', error);
        }
    }
}

module.exports = new Redis();
