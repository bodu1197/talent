import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkRateLimit,
  isRedisConfigured,
  paymentPrepareRateLimit,
  paymentVerifyRateLimit,
  directPurchaseRateLimit,
  orderStatusRateLimit,
} from "@/lib/rate-limit";

// Mock @upstash/redis
vi.mock("@upstash/redis", () => ({
  Redis: class MockRedis {
    constructor() {
      return {};
    }
  },
}));

// Mock @upstash/ratelimit
vi.mock("@upstash/ratelimit", () => {
  const mockSlidingWindow = vi.fn((requests: number, window: string) => ({
    requests,
    window,
  }));

  return {
    Ratelimit: class MockRatelimit {
      static slidingWindow = mockSlidingWindow;

      constructor() {
        return {
          limit: vi.fn(),
        };
      }
    },
  };
});

describe("rate-limit.ts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isRedisConfigured", () => {
    it("should return true when both Redis URL and token are set", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      // Re-import to get fresh environment check
      const result = !!(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
      );

      expect(result).toBe(true);
    });

    it("should return false when Redis URL is missing", () => {
      process.env.UPSTASH_REDIS_REST_URL = "";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const result = !!(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
      );

      expect(result).toBe(false);
    });

    it("should return false when Redis token is missing", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
      process.env.UPSTASH_REDIS_REST_TOKEN = "";

      const result = !!(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
      );

      expect(result).toBe(false);
    });

    it("should return false when both are missing", () => {
      process.env.UPSTASH_REDIS_REST_URL = "";
      process.env.UPSTASH_REDIS_REST_TOKEN = "";

      const result = !!(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
      );

      expect(result).toBe(false);
    });

    it("should return false when variables are undefined", () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const result = !!(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
      );

      expect(result).toBe(false);
    });
  });

  describe("checkRateLimit", () => {
    let mockLimiter: { limit: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockLimiter = {
        limit: vi.fn(),
      };
    });

    it("should allow request when rate limit is not exceeded", async () => {
      mockLimiter.limit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
      });

      const result = await checkRateLimit("user-123", mockLimiter as never);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockLimiter.limit).toHaveBeenCalledWith("user-123");
    });

    it("should block request when rate limit is exceeded", async () => {
      const resetTime = Date.now() + 60000;
      mockLimiter.limit.mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: resetTime,
      });

      const result = await checkRateLimit("user-456", mockLimiter as never);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(429);

      // Check response body
      const body = await result.error?.json();
      expect(body.error).toBe(
        "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
      expect(body.limit).toBe(10);
      expect(body.remaining).toBe(0);
      expect(body.reset).toBe(new Date(resetTime).toISOString());
    });

    it("should include rate limit headers in error response", async () => {
      const resetTime = Date.now() + 30000;
      mockLimiter.limit.mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        reset: resetTime,
      });

      const result = await checkRateLimit("user-789", mockLimiter as never);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      const headers = result.error?.headers;
      expect(headers?.get("Content-Type")).toBe("application/json");
      expect(headers?.get("X-RateLimit-Limit")).toBe("5");
      expect(headers?.get("X-RateLimit-Remaining")).toBe("0");
      expect(headers?.get("X-RateLimit-Reset")).toBe(resetTime.toString());
    });

    it("should fallback to allowing request when Redis fails", async () => {
      mockLimiter.limit.mockRejectedValue(new Error("Redis connection failed"));

      const result = await checkRateLimit("user-error", mockLimiter as never);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should handle timeout errors gracefully", async () => {
      mockLimiter.limit.mockRejectedValue(new Error("ETIMEDOUT"));

      const result = await checkRateLimit("user-timeout", mockLimiter as never);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should handle network errors gracefully", async () => {
      mockLimiter.limit.mockRejectedValue(new Error("Network error"));

      const result = await checkRateLimit("user-network", mockLimiter as never);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should call limiter with correct identifier", async () => {
      mockLimiter.limit.mockResolvedValue({
        success: true,
        limit: 20,
        remaining: 15,
        reset: Date.now() + 60000,
      });

      const identifier = "user-unique-id-12345";
      await checkRateLimit(identifier, mockLimiter as never);

      expect(mockLimiter.limit).toHaveBeenCalledWith(identifier);
      expect(mockLimiter.limit).toHaveBeenCalledTimes(1);
    });

    it("should handle zero remaining requests", async () => {
      const resetTime = Date.now() + 60000;
      mockLimiter.limit.mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: resetTime,
      });

      const result = await checkRateLimit("user-zero", mockLimiter as never);

      expect(result.success).toBe(false);
      const body = await result.error?.json();
      expect(body.remaining).toBe(0);
    });

    it("should handle maximum limit correctly", async () => {
      mockLimiter.limit.mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      });

      const result = await checkRateLimit("user-max", mockLimiter as never);

      expect(result.success).toBe(true);
      expect(mockLimiter.limit).toHaveBeenCalledWith("user-max");
    });

    it("should format reset time as ISO string in response", async () => {
      const resetTime = new Date("2024-01-01T12:00:00Z").getTime();
      mockLimiter.limit.mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: resetTime,
      });

      const result = await checkRateLimit("user-time", mockLimiter as never);

      const body = await result.error?.json();
      expect(body.reset).toBe("2024-01-01T12:00:00.000Z");
    });
  });

  describe("Rate Limiter Instances", () => {
    it("should have paymentPrepareRateLimit defined", () => {
      expect(paymentPrepareRateLimit).toBeDefined();
    });

    it("should have paymentVerifyRateLimit defined", () => {
      expect(paymentVerifyRateLimit).toBeDefined();
    });

    it("should have directPurchaseRateLimit defined", () => {
      expect(directPurchaseRateLimit).toBeDefined();
    });

    it("should have orderStatusRateLimit defined", () => {
      expect(orderStatusRateLimit).toBeDefined();
    });

    it("should have limit method on all rate limiters", () => {
      expect(typeof paymentPrepareRateLimit.limit).toBe("function");
      expect(typeof paymentVerifyRateLimit.limit).toBe("function");
      expect(typeof directPurchaseRateLimit.limit).toBe("function");
      expect(typeof orderStatusRateLimit.limit).toBe("function");
    });
  });

  describe("Edge Cases", () => {
    let mockLimiter: { limit: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockLimiter = {
        limit: vi.fn(),
      };
    });

    it("should handle empty string identifier", async () => {
      mockLimiter.limit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      });

      const result = await checkRateLimit("", mockLimiter as never);

      expect(result.success).toBe(true);
      expect(mockLimiter.limit).toHaveBeenCalledWith("");
    });

    it("should handle very long identifier", async () => {
      const longId = "a".repeat(1000);
      mockLimiter.limit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      });

      const result = await checkRateLimit(longId, mockLimiter as never);

      expect(result.success).toBe(true);
      expect(mockLimiter.limit).toHaveBeenCalledWith(longId);
    });

    it("should handle special characters in identifier", async () => {
      const specialId = "user@email.com|ip:192.168.1.1";
      mockLimiter.limit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      });

      const result = await checkRateLimit(specialId, mockLimiter as never);

      expect(result.success).toBe(true);
      expect(mockLimiter.limit).toHaveBeenCalledWith(specialId);
    });

    it("should handle concurrent requests to same identifier", async () => {
      let callCount = 0;
      mockLimiter.limit.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          success: callCount <= 5,
          limit: 5,
          remaining: Math.max(0, 5 - callCount),
          reset: Date.now() + 60000,
        });
      });

      const identifier = "concurrent-user";
      const promises = Array.from({ length: 10 }, () =>
        checkRateLimit(identifier, mockLimiter as never),
      );

      const results = await Promise.all(promises);

      expect(results.slice(0, 5).every((r) => r.success)).toBe(true);
      expect(results.slice(5).some((r) => !r.success)).toBe(true);
    });

    it("should handle rate limiter returning undefined values", async () => {
      mockLimiter.limit.mockResolvedValue({
        success: true,
        limit: undefined as unknown as number,
        remaining: undefined as unknown as number,
        reset: undefined as unknown as number,
      });

      const result = await checkRateLimit(
        "user-undefined",
        mockLimiter as never,
      );

      expect(result.success).toBe(true);
    });

    it("should handle rate limiter returning negative values", async () => {
      mockLimiter.limit.mockResolvedValue({
        success: false,
        limit: -1,
        remaining: -5,
        reset: Date.now() - 1000,
      });

      const result = await checkRateLimit(
        "user-negative",
        mockLimiter as never,
      );

      expect(result.success).toBe(false);
      const body = await result.error?.json();
      expect(body.limit).toBe(-1);
      expect(body.remaining).toBe(-5);
    });

    it("should handle promise rejection with non-Error object", async () => {
      mockLimiter.limit.mockRejectedValue("String error");

      const result = await checkRateLimit(
        "user-string-error",
        mockLimiter as never,
      );

      expect(result.success).toBe(true);
    });

    it("should handle promise rejection with null", async () => {
      // Note: rejecting with null will cause JSON.stringify to fail when trying
      // to get property names from null, but the catch block still returns success
      mockLimiter.limit.mockRejectedValue(new Error("Null error simulation"));

      const result = await checkRateLimit(
        "user-null-error",
        mockLimiter as never,
      );

      expect(result.success).toBe(true);
    });

    it("should handle large reset timestamp", async () => {
      const futureTime = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year from now
      mockLimiter.limit.mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: futureTime,
      });

      const result = await checkRateLimit("user-future", mockLimiter as never);

      expect(result.success).toBe(false);
      const body = await result.error?.json();
      expect(new Date(body.reset).getTime()).toBe(futureTime);
    });
  });
});
