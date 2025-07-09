import Redis from "ioredis";

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean; // Whether to compress the data
}

class CacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour default

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.redis.on("connect", () => {
      console.log("Cache service connected to Redis");
    });

    this.redis.on("error", (error) => {
      console.error("Redis cache error:", error);
    });
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;

      try {
        return JSON.parse(cached) as T;
      } catch {
        return cached as T;
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const serialized = typeof value === "string" ? value : JSON.stringify(value);

      const result = await this.redis.setex(key, ttl, serialized);
      return result === "OK";
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;
      return await this.redis.del(...keys);
    } catch (error) {
      console.error("Cache deleteMany error:", error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      const result = await this.redis.flushdb();
      return result === "OK";
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info("memory");
      const dbSize = await this.redis.dbsize();
      
      return {
        connected: this.redis.status === "ready",
        dbSize,
        memoryInfo: info
      };
    } catch (error) {
      console.error("Cache stats error:", error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Cache with fallback pattern
   */
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, get from fallback function
      const result = await fallbackFn();
      
      // Store in cache for next time
      await this.set(key, result, options);
      
      return result;
    } catch (error) {
      console.error(`Cache getOrSet error for key ${key}:`, error);
      // If cache fails, still return the fallback result
      return await fallbackFn();
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiration for existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      console.log("Cache service disconnected");
    } catch (error) {
      console.error("Cache disconnect error:", error);
    }
  }
}

export default new CacheService(); 