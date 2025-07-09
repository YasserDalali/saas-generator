import { Queue, Worker } from "bullmq";
import cacheService from "./cacheService";

// Configure Redis connection
const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
};

// Create queues
const emailQueue = new Queue("email", { connection: redisConnection });
const dataProcessingQueue = new Queue("data-processing", { connection: redisConnection });

// Email worker
const emailWorker = new Worker("email", async (job: any) => {
  const { to, subject, html } = job.data;
  
  // Check cache for recent email to prevent duplicates
  const cacheKey = `email:recent:${to}:${subject}`;
  const recentEmail = await cacheService.get(cacheKey);
  
  if (recentEmail) {
    console.log(`Skipping duplicate email to ${to} (sent recently)`);
    return { success: false, reason: "duplicate_prevented" };
  }
  
  console.log(`Processing email job: ${job.id}`);
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Cache this email to prevent duplicates for 5 minutes
  await cacheService.set(cacheKey, { sentAt: new Date().toISOString() }, { ttl: 300 });
  
  return { success: true, emailId: `email_${Date.now()}` };
}, { connection: redisConnection });

// Data processing worker
const dataProcessingWorker = new Worker("data-processing", async (job: any) => {
  const { type, data } = job.data;
  
  console.log(`Processing data job: ${job.id}`);
  console.log(`Type: ${type}`);
  
  // Cache processing results for better performance
  const cacheKey = `processing:${type}:${JSON.stringify(data).slice(0, 50)}`;
  const cachedResult = await cacheService.get(cacheKey);
  
  if (cachedResult) {
    console.log(`Returning cached result for ${type} processing`);
    return cachedResult;
  }
  
  // Simulate data processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const result = { 
    success: true, 
    processedAt: new Date().toISOString(),
    type,
    dataLength: Array.isArray(data) ? data.length : Object.keys(data || {}).length
  };
  
  // Cache result for 1 hour
  await cacheService.set(cacheKey, result, { ttl: 3600 });
  
  return result;
}, { connection: redisConnection });

// Queue service class
class QueueService {
  async addEmailJob(emailData: { to: string; subject: string; html: string }) {
    try {
      const job = await emailQueue.add("send-email", emailData, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      });
      
      console.log(`Email job added: ${job.id}`);
      
      // Update queue stats in cache
      await this.updateQueueStatsCache();
      
      return job;
    } catch (error) {
      console.error("Failed to add email job:", error);
      throw error;
    }
  }

  async addDataProcessingJob(processingData: { type: string; data: any }) {
    try {
      const job = await dataProcessingQueue.add("process-data", processingData, {
        attempts: 2,
        delay: 1000,
      });
      
      console.log(`Data processing job added: ${job.id}`);
      
      // Update queue stats in cache
      await this.updateQueueStatsCache();
      
      return job;
    } catch (error) {
      console.error("Failed to add data processing job:", error);
      throw error;
    }
  }

  async getQueueStats() {
    try {
      // Try to get from cache first
      const cacheKey = "queue:stats";
      const cachedStats = await cacheService.get(cacheKey);
      
      if (cachedStats) {
        return { ...cachedStats, fromCache: true };
      }
      
      // If not cached, fetch fresh data
      const emailStats = await emailQueue.getJobCounts();
      const dataStats = await dataProcessingQueue.getJobCounts();
      
      const stats = {
        email: emailStats,
        dataProcessing: dataStats,
        timestamp: new Date().toISOString(),
        fromCache: false
      };
      
      // Cache for 30 seconds
      await cacheService.set(cacheKey, stats, { ttl: 30 });
      
      return stats;
    } catch (error) {
      console.error("Failed to get queue stats:", error);
      throw error;
    }
  }

  async updateQueueStatsCache() {
    try {
      const cacheKey = "queue:stats";
      // Invalidate cache so fresh stats are fetched next time
      await cacheService.delete(cacheKey);
    } catch (error) {
      console.error("Failed to update queue stats cache:", error);
    }
  }

  async getJobHistory(queueName: string, limit: number = 10) {
    try {
      const cacheKey = `queue:history:${queueName}:${limit}`;
      
      // Use cache with fallback pattern
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          const queue = queueName === "email" ? emailQueue : dataProcessingQueue;
          const completed = await queue.getJobs(["completed"], 0, limit - 1);
          const failed = await queue.getJobs(["failed"], 0, Math.floor(limit / 2));
          
          return {
            completed: completed.map(job => ({
              id: job.id,
              data: job.data,
              finishedOn: job.finishedOn,
              returnvalue: job.returnvalue
            })),
            failed: failed.map(job => ({
              id: job.id,
              data: job.data,
              failedReason: job.failedReason,
              finishedOn: job.finishedOn
            }))
          };
        },
        { ttl: 60 } // Cache for 1 minute
      );
    } catch (error) {
      console.error("Failed to get job history:", error);
      throw error;
    }
  }

  async clearCache() {
    try {
      // Clear all queue-related cache
      const queueKeys = await cacheService.keys("queue:*");
      const emailKeys = await cacheService.keys("email:*");
      const processingKeys = await cacheService.keys("processing:*");
      
      const allKeys = [...queueKeys, ...emailKeys, ...processingKeys];
      
      if (allKeys.length > 0) {
        await cacheService.deleteMany(allKeys);
        console.log(`Cleared ${allKeys.length} cache entries`);
      }
      
      return { cleared: allKeys.length };
    } catch (error) {
      console.error("Failed to clear cache:", error);
      throw error;
    }
  }

  async getCacheStats() {
    try {
      return await cacheService.getStats();
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      throw error;
    }
  }
}

export default new QueueService(); 