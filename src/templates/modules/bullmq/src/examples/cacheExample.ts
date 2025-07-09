import cacheService from "../services/cacheService";

async function cacheExamples() {
  console.log("=== Cache Service Examples ===");

  try {
    // Basic set and get
    await cacheService.set("user:123", { name: "John", email: "john@example.com" });
    const user = await cacheService.get("user:123");
    console.log("Retrieved user:", user);

    // Set with TTL
    await cacheService.set("temp:data", "temporary value", { ttl: 60 }); // 1 minute
    console.log("TTL for temp:data:", await cacheService.ttl("temp:data"));

    // Cache with fallback pattern
    const expensiveData = await cacheService.getOrSet(
      "expensive:calculation",
      async () => {
        console.log("Computing expensive calculation...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return { result: Math.random() * 1000, computed: new Date() };
      },
      { ttl: 300 } // Cache for 5 minutes
    );
    console.log("Expensive data:", expensiveData);

    // Call again - should get from cache
    const cachedData = await cacheService.getOrSet(
      "expensive:calculation",
      async () => {
        console.log("This should not execute");
        return { result: 0 };
      }
    );
    console.log("Cached data:", cachedData);

    // Increment counter
    await cacheService.increment("page:views", 1);
    await cacheService.increment("page:views", 5);
    const views = await cacheService.get("page:views");
    console.log("Page views:", views);

    // Check if key exists
    const exists = await cacheService.exists("user:123");
    console.log("User 123 exists:", exists);

    // Get all keys matching pattern
    const userKeys = await cacheService.keys("user:*");
    console.log("User keys:", userKeys);

    // Get cache stats
    const stats = await cacheService.getStats();
    console.log("Cache stats:", stats);

    // Clean up
    await cacheService.delete("user:123");
    await cacheService.delete("temp:data");
    await cacheService.delete("expensive:calculation");
    await cacheService.delete("page:views");

  } catch (error) {
    console.error("Cache example error:", error);
  }
}

// Queue + Cache integration example
async function queueCacheIntegration() {
  console.log("=== Queue + Cache Integration ===");

  try {
    // Example of caching queue statistics
    const queueStats = await cacheService.getOrSet(
      "queue:dashboard:stats",
      async () => {
        // This would normally fetch from BullMQ
        return {
          totalJobs: 150,
          completedJobs: 120,
          failedJobs: 5,
          waitingJobs: 25,
          timestamp: new Date().toISOString()
        };
      },
      { ttl: 30 } // Cache dashboard stats for 30 seconds
    );
    console.log("Queue stats:", queueStats);

    // Example of rate limiting with cache
    const rateLimitKey = "rate_limit:user:123";
    const currentCount = await cacheService.get(rateLimitKey) || 0;
    
    if (currentCount >= 10) {
      console.log("Rate limit exceeded!");
    } else {
      await cacheService.increment(rateLimitKey);
      await cacheService.expire(rateLimitKey, 3600); // 1 hour window
      console.log("Request allowed, count:", currentCount + 1);
    }

  } catch (error) {
    console.error("Queue cache integration error:", error);
  }
}

export { cacheExamples, queueCacheIntegration }; 