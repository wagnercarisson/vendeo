import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 1 hour
// You can adjust these values as needed
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1h"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@vendeo/ratelimit",
});

/**
 * Helper to check rate limit for a given identifier (e.g. user ID or IP)
 * @param identifier Unique string to identify the user/client
 */
export async function checkRateLimit(identifier: string) {
  // If env vars are missing, we bypass to avoid breaking the app in dev
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Upstash Redis env vars missing. Rate limiting bypassed.");
    }
    return { success: true, remaining: 999, limit: 999, reset: 0 };
  }

  return await ratelimit.limit(identifier);
}
