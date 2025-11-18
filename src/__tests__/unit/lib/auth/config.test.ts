import { describe, it, expect, vi } from "vitest";
import {
  ALLOWED_REDIRECT_ORIGINS,
  RATE_LIMIT_CONFIG,
  isAllowedOrigin,
  getSecureRedirectUrl,
  createOAuthState,
  parseOAuthState,
} from "@/lib/auth/config";

describe("Auth Config", () => {
  describe("Constants", () => {
    it("should have correct allowed redirect origins", () => {
      expect(ALLOWED_REDIRECT_ORIGINS).toEqual([
        "http://localhost:3000",
        "https://dolpagu.com",
      ]);
      expect(ALLOWED_REDIRECT_ORIGINS).toHaveLength(2);
    });

    it("should have correct rate limit configuration", () => {
      expect(RATE_LIMIT_CONFIG).toHaveProperty("LOGIN");
      expect(RATE_LIMIT_CONFIG).toHaveProperty("REGISTER");
      expect(RATE_LIMIT_CONFIG).toHaveProperty("FORGOT_PASSWORD");

      expect(RATE_LIMIT_CONFIG.LOGIN).toEqual({
        MAX_ATTEMPTS: 5,
        LOCKOUT_DURATION: 300000,
      });

      expect(RATE_LIMIT_CONFIG.REGISTER).toEqual({
        MAX_ATTEMPTS: 3,
        LOCKOUT_DURATION: 600000,
      });

      expect(RATE_LIMIT_CONFIG.FORGOT_PASSWORD).toEqual({
        MAX_ATTEMPTS: 3,
        LOCKOUT_DURATION: 600000,
      });
    });
  });

  describe("isAllowedOrigin", () => {
    it("should return true for localhost origin", () => {
      expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    });

    it("should return true for production origin", () => {
      expect(isAllowedOrigin("https://dolpagu.com")).toBe(true);
    });

    it("should return false for unknown origin", () => {
      expect(isAllowedOrigin("https://malicious-site.com")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isAllowedOrigin("")).toBe(false);
    });

    it("should return false for similar but different origins", () => {
      expect(isAllowedOrigin("http://localhost:3001")).toBe(false);
      expect(isAllowedOrigin("https://dolpagu.com.evil.com")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(isAllowedOrigin("HTTP://localhost:3000")).toBe(false);
      expect(isAllowedOrigin("HTTPS://dolpagu.com")).toBe(false);
    });
  });

  describe("getSecureRedirectUrl", () => {
    it("should create redirect URL with default path", () => {
      const url = getSecureRedirectUrl("http://localhost:3000");
      expect(url).toBe("http://localhost:3000/auth/callback");
    });

    it("should create redirect URL with custom path", () => {
      const url = getSecureRedirectUrl("http://localhost:3000", "/custom/path");
      expect(url).toBe("http://localhost:3000/custom/path");
    });

    it("should work with production origin", () => {
      const url = getSecureRedirectUrl("https://dolpagu.com");
      expect(url).toBe("https://dolpagu.com/auth/callback");
    });

    it("should throw error for invalid origin", () => {
      expect(() => {
        getSecureRedirectUrl("https://malicious-site.com");
      }).toThrow("Invalid origin for redirect");
    });

    it("should throw error for empty origin", () => {
      expect(() => {
        getSecureRedirectUrl("");
      }).toThrow("Invalid origin for redirect");
    });

    it("should handle paths without leading slash", () => {
      const url = getSecureRedirectUrl("http://localhost:3000", "no-slash");
      expect(url).toBe("http://localhost:3000no-slash");
    });

    it("should handle empty path", () => {
      const url = getSecureRedirectUrl("http://localhost:3000", "");
      expect(url).toBe("http://localhost:3000");
    });
  });

  describe("createOAuthState", () => {
    it("should create base64 encoded state", () => {
      const data = { redirectTo: "/dashboard" };
      const state = createOAuthState(data);

      expect(typeof state).toBe("string");
      expect(state.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => atob(state)).not.toThrow();
    });

    it("should include original data in state", () => {
      const data = { redirectTo: "/dashboard", userId: "123" };
      const state = createOAuthState(data);

      const decoded = JSON.parse(atob(state));
      expect(decoded).toHaveProperty("redirectTo", "/dashboard");
      expect(decoded).toHaveProperty("userId", "123");
    });

    it("should include timestamp in state", () => {
      const beforeTime = Date.now();
      const data = { test: "value" };
      const state = createOAuthState(data);
      const afterTime = Date.now();

      const decoded = JSON.parse(atob(state));
      expect(decoded).toHaveProperty("timestamp");
      expect(decoded.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(decoded.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should include nonce in state", () => {
      const data = { test: "value" };
      const state = createOAuthState(data);

      const decoded = JSON.parse(atob(state));
      expect(decoded).toHaveProperty("nonce");
      expect(typeof decoded.nonce).toBe("string");
      expect(decoded.nonce.length).toBeGreaterThan(0);
    });

    it("should create unique states for identical data", () => {
      const data = { test: "value" };
      const state1 = createOAuthState(data);
      const state2 = createOAuthState(data);

      // States should be different due to random nonce
      expect(state1).not.toBe(state2);
    });

    it("should handle empty data object", () => {
      const state = createOAuthState({});

      const decoded = JSON.parse(atob(state));
      expect(decoded).toHaveProperty("timestamp");
      expect(decoded).toHaveProperty("nonce");
    });

    it("should handle complex nested data", () => {
      const data = {
        user: { id: "123", name: "Test" },
        settings: { theme: "dark" },
      };
      const state = createOAuthState(data);

      const decoded = JSON.parse(atob(state));
      expect(decoded).toHaveProperty("user");
      expect(decoded.user).toEqual({ id: "123", name: "Test" });
      expect(decoded.settings).toEqual({ theme: "dark" });
    });
  });

  describe("parseOAuthState", () => {
    it("should parse valid state", () => {
      const data = { redirectTo: "/dashboard" };
      const state = createOAuthState(data);

      const parsed = parseOAuthState(state);
      expect(parsed).toHaveProperty("redirectTo", "/dashboard");
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("nonce");
    });

    it("should throw error for invalid base64", () => {
      expect(() => {
        parseOAuthState("invalid-base64!!!");
      }).toThrow("Invalid state parameter");
    });

    it("should throw error for non-JSON content", () => {
      const invalidState = btoa("not json content");
      expect(() => {
        parseOAuthState(invalidState);
      }).toThrow("Invalid state parameter");
    });

    it("should throw error for expired state (default 10 minutes)", () => {
      // Create state with a timestamp from 11 minutes ago
      const elevenMinutesAgo = Date.now() - 11 * 60 * 1000;
      const expiredState = btoa(
        JSON.stringify({
          test: "value",
          timestamp: elevenMinutesAgo,
          nonce: "test-nonce",
        }),
      );

      expect(() => {
        parseOAuthState(expiredState);
      }).toThrow("Invalid state parameter");
    });

    it("should accept state within maxAge", () => {
      // Create state from 5 minutes ago (less than default 10 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const recentState = btoa(
        JSON.stringify({
          test: "value",
          timestamp: fiveMinutesAgo,
          nonce: "test-nonce",
        }),
      );

      expect(() => {
        parseOAuthState(recentState);
      }).not.toThrow();
    });

    it("should respect custom maxAge", () => {
      // Create state from 2 minutes ago
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      const state = btoa(
        JSON.stringify({
          test: "value",
          timestamp: twoMinutesAgo,
          nonce: "test-nonce",
        }),
      );

      // Should fail with 1 minute maxAge
      expect(() => {
        parseOAuthState(state, 60000);
      }).toThrow("Invalid state parameter");

      // Should pass with 5 minute maxAge
      expect(() => {
        parseOAuthState(state, 5 * 60 * 1000);
      }).not.toThrow();
    });

    it("should throw error for state without timestamp", () => {
      const stateWithoutTimestamp = btoa(JSON.stringify({ nonce: "abc123" }));

      expect(() => {
        parseOAuthState(stateWithoutTimestamp);
      }).toThrow("Invalid state parameter");
    });

    it("should return typed data", () => {
      interface CustomState {
        userId: string;
        redirectTo: string;
        timestamp: number;
        nonce: string;
      }

      const now = Date.now();
      const state = btoa(
        JSON.stringify({
          userId: "123",
          redirectTo: "/profile",
          timestamp: now,
          nonce: "test",
        }),
      );

      const parsed = parseOAuthState<CustomState>(state);
      expect(parsed.userId).toBe("123");
      expect(parsed.redirectTo).toBe("/profile");
    });

    it("should handle state with special characters", () => {
      const now = Date.now();
      const state = btoa(
        JSON.stringify({
          message: "Hello, World!",
          symbols: "!@#$%^&*()",
          timestamp: now,
          nonce: "test",
        }),
      );

      const parsed = parseOAuthState(state);
      expect(parsed).toHaveProperty("message", "Hello, World!");
      expect(parsed).toHaveProperty("symbols", "!@#$%^&*()");
    });

    it("should throw error for empty string", () => {
      expect(() => {
        parseOAuthState("");
      }).toThrow("Invalid state parameter");
    });

    it("should handle edge case: exactly at maxAge boundary", () => {
      const maxAge = 600000; // 10 minutes
      const exactlyAtMaxAge = Date.now() - maxAge - 1;

      const state = btoa(
        JSON.stringify({
          test: "value",
          timestamp: exactlyAtMaxAge,
          nonce: "test",
        }),
      );

      // Should throw because it's > maxAge
      expect(() => {
        parseOAuthState(state, maxAge);
      }).toThrow("Invalid state parameter");
    });

    it("should handle edge case: well within maxAge", () => {
      const maxAge = 600000; // 10 minutes
      const wellWithinMaxAge = Date.now() - maxAge + 10000; // 10 seconds before expiry

      const state = btoa(
        JSON.stringify({
          test: "value",
          timestamp: wellWithinMaxAge,
          nonce: "test",
        }),
      );

      expect(() => {
        parseOAuthState(state, maxAge);
      }).not.toThrow();
    });
  });
});
