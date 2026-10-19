import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  provider: "upstash" | "memory_fallback";
}

// In-memory sliding-window fallback store (used when Upstash credentials are not set or during Redis outages)
const fallbackStore = new Map<string, { count: number; resetAt: number }>();

function memoryFallbackLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();
  const entry = fallbackStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    fallbackStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetAt,
      provider: "memory_fallback",
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetAt,
      provider: "memory_fallback",
    };
  }

  entry.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetAt,
    provider: "memory_fallback",
  };
}

let upstashRatelimit: Ratelimit | null = null;
let upstashInitialized = false;

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashInitialized) return upstashRatelimit;
  upstashInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && !url.includes("your_") && !token.includes("your_")) {
    try {
      const redis = new Redis({ url, token });
      upstashRatelimit = new Ratelimit({
        redis,
        // 5 requests per 10 minutes sliding window
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "portfolio_ratelimit",
        analytics: false,
      });
    } catch (err) {
      console.warn(
        "[RateLimit] Failed to initialize Upstash Redis client, using fallback:",
        err instanceof Error ? err.message : "Unknown error",
      );
      upstashRatelimit = null;
    }
  }

  return upstashRatelimit;
}

/**
 * Hashes client IP with a server salt using SHA-256 so raw personal IP addresses
 * are never stored in Redis keys, logs, or analytics.
 */
export function hashIdentifier(identifier: string): string {
  const salt = process.env.RATE_LIMIT_SALT || "portfolio_secure_salt_2026";
  return crypto.createHmac("sha256", salt).update(identifier).digest("hex").slice(0, 32);
}

/**
 * Extracts client IP from trusted platform headers in order of priority:
 * 1. x-vercel-ip (set securely by Vercel Edge)
 * 2. x-real-ip (standard proxy IP header)
 * 3. x-forwarded-for (first entry only to prevent spoofing)
 */
export function resolveClientIp(headersList: Headers): string {
  const vercelIp = headersList.get("x-vercel-ip");
  if (vercelIp && vercelIp.trim()) return vercelIp.trim();

  const realIp = headersList.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return "127.0.0.1";
}

/**
 * Checks rate limit for a given request.
 * Prioritizes Upstash Redis if configured; falls back safely to in-memory sliding window
 * on local development or Redis service errors.
 */
export async function checkRateLimit(headersList: Headers): Promise<RateLimitResult> {
  const rawIp = resolveClientIp(headersList);
  const hashedIp = hashIdentifier(rawIp);
  const ratelimiter = getUpstashRatelimit();

  if (ratelimiter) {
    try {
      const result = await ratelimiter.limit(hashedIp);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        provider: "upstash",
      };
    } catch (err) {
      console.warn(
        "[RateLimit] Upstash Redis request failed, falling back safely to local limiter:",
        err instanceof Error ? err.message : "Unknown error",
      );
      return memoryFallbackLimit(hashedIp);
    }
  }

  return memoryFallbackLimit(hashedIp);
}
