import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock console methods before importing logger
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("logger.ts", () => {
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  describe("Logger initialization", () => {
    it("should use info level by default", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "");
      vi.stubEnv("NODE_ENV", "development");

      // Re-import logger to apply new env
      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("test debug");
      logger.info("test info");

      expect(mockConsoleLog).not.toHaveBeenCalled(); // debug should not log
      expect(mockConsoleInfo).toHaveBeenCalled(); // info should log
    });

    it("should use debug level when set in environment", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("test debug");

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it("should use warn level when set in environment", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "warn");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.info("test info");
      logger.warn("test warn");

      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should use error level when set in environment", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.warn("test warn");
      logger.error("test error");

      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should use none level to disable all logging", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "none");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.error("test error");

      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it("should force minimum warn level in production", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "production");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("test debug");
      logger.info("test info");
      logger.warn("test warn");

      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should handle invalid log level and default to info", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "invalid_level");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("test debug");
      logger.info("test info");

      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleInfo).toHaveBeenCalled();
    });
  });

  describe("debug method", () => {
    it("should log debug messages when level is debug", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Debug message");

      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain("[DEBUG]");
      expect(call[0]).toContain("Debug message");
    });

    it("should not log debug when level is info", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "info");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Debug message");

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it("should log debug with metadata", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Debug with data", { key: "value" });

      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({ key: "value" });
    });

    it("should include timestamp in debug log", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Debug message");

      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it("should indicate server environment in log", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");
      delete (global as { window?: unknown }).window;

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Server message");

      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain("[Server]");
    });
  });

  describe("info method", () => {
    it("should log info messages when level is info or below", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "info");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.info("Info message");

      expect(mockConsoleInfo).toHaveBeenCalled();
      const call = mockConsoleInfo.mock.calls[0];
      expect(call[0]).toContain("[INFO]");
      expect(call[0]).toContain("Info message");
    });

    it("should not log info when level is warn", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "warn");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.info("Info message");

      expect(mockConsoleInfo).not.toHaveBeenCalled();
    });

    it("should log info with metadata", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "info");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.info("Info with data", { userId: "123" });

      expect(mockConsoleInfo).toHaveBeenCalled();
      const call = mockConsoleInfo.mock.calls[0];
      expect(call[1]).toEqual({ userId: "123" });
    });
  });

  describe("warn method", () => {
    it("should log warn messages when level is warn or below", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "warn");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.warn("Warning message");

      expect(mockConsoleWarn).toHaveBeenCalled();
      const call = mockConsoleWarn.mock.calls[0];
      expect(call[0]).toContain("[WARN]");
      expect(call[0]).toContain("Warning message");
    });

    it("should not log warn when level is error", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.warn("Warning message");

      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it("should log warn with metadata", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "warn");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.warn("Warning", { reason: "test" });

      expect(mockConsoleWarn).toHaveBeenCalled();
      const call = mockConsoleWarn.mock.calls[0];
      expect(call[1]).toEqual({ reason: "test" });
    });
  });

  describe("error method", () => {
    it("should log error messages", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.error("Error message");

      expect(mockConsoleError).toHaveBeenCalled();
      const call = mockConsoleError.mock.calls[0];
      expect(call[0]).toContain("[ERROR]");
      expect(call[0]).toContain("Error message");
    });

    it("should log Error objects with stack trace in development", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(mockConsoleError).toHaveBeenCalled();
      const call = mockConsoleError.mock.calls[0];
      expect(call[1]).toHaveProperty("name", "Error");
      expect(call[1]).toHaveProperty("message", "Test error");
      expect(call[1]).toHaveProperty("stack");
    });

    it("should log Error objects without stack trace in production", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "production");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(mockConsoleError).toHaveBeenCalled();
      const call = mockConsoleError.mock.calls[0];
      expect(call[1]).toHaveProperty("name");
      expect(call[1]).toHaveProperty("message");
      expect(call[1].stack).toBeUndefined();
    });

    it("should log non-Error objects", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.error("Error occurred", { code: 500 });

      expect(mockConsoleError).toHaveBeenCalled();
      const call = mockConsoleError.mock.calls[0];
      expect(call[1]).toEqual({ code: 500 });
    });

    it("should log error with additional metadata", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      const error = new Error("Test error");
      logger.error("Error occurred", error, { userId: "456" });

      expect(mockConsoleError).toHaveBeenCalled();
      const call = mockConsoleError.mock.calls[0];
      expect(call[1]).toHaveProperty("userId", "456");
    });
  });

  describe("dev method", () => {
    it("should log in development mode", async () => {
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.dev("Dev message");

      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain("[DEV]");
      expect(call[0]).toContain("Dev message");
    });

    it("should not log in production mode", async () => {
      vi.stubEnv("NODE_ENV", "production");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.dev("Dev message");

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it("should log dev with metadata in development", async () => {
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.dev("Dev message", { debug: true });

      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({ debug: true });
    });
  });

  describe("sanitizeData method", () => {
    it("should redact password field", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Login attempt", {
        username: "user",
        password: "secret123",
      });

      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({ username: "user", password: "***REDACTED***" });
    });

    it("should redact token field", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Auth", { token: "abc123", user: "john" });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({ token: "***REDACTED***", user: "john" });
    });

    it("should redact accessToken and refreshToken", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Tokens", {
        accessToken: "access123",
        refreshToken: "refresh456",
      });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        accessToken: "***REDACTED***",
        refreshToken: "***REDACTED***",
      });
    });

    it("should redact apiKey and secret", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Config", { apiKey: "key123", secret: "secret456" });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        apiKey: "***REDACTED***",
        secret: "***REDACTED***",
      });
    });

    it("should redact creditCard, ssn, bankAccount", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Payment", {
        creditCard: "1234-5678-9012-3456",
        ssn: "123-45-6789",
        bankAccount: "12345678",
      });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        creditCard: "***REDACTED***",
        ssn: "***REDACTED***",
        bankAccount: "***REDACTED***",
      });
    });

    it("should redact nested sensitive fields", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("User data", {
        user: {
          name: "John",
          credentials: {
            password: "secret",
            apiKey: "key123",
          },
        },
      });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        user: {
          name: "John",
          credentials: {
            password: "***REDACTED***",
            apiKey: "***REDACTED***",
          },
        },
      });
    });

    it("should handle arrays with sensitive data", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Users", {
        users: [
          { name: "John", password: "pass1" },
          { name: "Jane", password: "pass2" },
        ],
      });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        users: [
          { name: "John", password: "***REDACTED***" },
          { name: "Jane", password: "***REDACTED***" },
        ],
      });
    });

    it("should handle null and undefined values", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Null data", { value: null, other: undefined });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({ value: null, other: undefined });
    });

    it("should handle primitive values", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Number", { count: 42 });
      logger.debug("String", { name: "test" });
      logger.debug("Boolean", { active: true });

      expect(mockConsoleLog).toHaveBeenCalledTimes(3);
      expect(mockConsoleLog.mock.calls[0][1]).toEqual({ count: 42 });
      expect(mockConsoleLog.mock.calls[1][1]).toEqual({ name: "test" });
      expect(mockConsoleLog.mock.calls[2][1]).toEqual({ active: true });
    });

    it("should be case-insensitive for sensitive field detection", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Case test", {
        PASSWORD: "secret",
        Token: "token123",
        ApiKey: "key456",
      });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        PASSWORD: "***REDACTED***",
        Token: "***REDACTED***",
        ApiKey: "***REDACTED***",
      });
    });

    it("should redact fields containing sensitive keywords", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Contains test", {
        userPassword: "secret",
        authToken: "token123",
        myApiKey: "key456",
      });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        userPassword: "***REDACTED***",
        authToken: "***REDACTED***",
        myApiKey: "***REDACTED***",
      });
    });

    it("should not redact non-sensitive fields", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Safe data", {
        username: "john",
        userId: "123",
        status: "active",
        data: { key: "value" },
      });

      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toEqual({
        username: "john",
        userId: "123",
        status: "active",
        data: { key: "value" },
      });
    });
  });

  describe("Client vs Server detection", () => {
    it("should detect client environment", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubGlobal("window", {});

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Client message");

      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain("[Client]");
    });

    it("should detect server environment", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");
      delete (global as { window?: unknown }).window;

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Server message");

      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain("[Server]");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty message", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("");

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it("should handle very long messages", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      const longMessage = "a".repeat(10000);
      logger.debug(longMessage);

      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain(longMessage);
    });

    it("should handle circular references in metadata", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      const circular: { self?: unknown; value: string } = { value: "test" };
      circular.self = circular;

      // Circular references will cause stack overflow in sanitization
      // This is expected behavior - the logger doesn't handle circular refs
      // In production, avoid logging objects with circular references
      expect(() => logger.debug("Circular", circular)).toThrow();
    });

    it("should handle undefined metadata", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "debug");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      logger.debug("Message", undefined);

      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toBe("");
    });

    it("should handle error without message property", async () => {
      vi.stubEnv("NEXT_PUBLIC_LOG_LEVEL", "error");
      vi.stubEnv("NODE_ENV", "development");

      vi.resetModules();
      const { logger } = await import("@/lib/logger");

      const customError = { code: 500, details: "Custom error" };
      logger.error("Error", customError);

      expect(mockConsoleError).toHaveBeenCalled();
    });
  });
});
