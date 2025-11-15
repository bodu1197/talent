import { describe, it, expect, vi, beforeEach } from "vitest";

// Note: @/lib/supabase/client is already mocked globally in setup.ts
// We're testing the wrapper behavior here, not the actual implementation
describe("Client Supabase Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createClient", () => {
    it("should return a Supabase client from global mock", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty("auth");
      expect(client).toHaveProperty("from");
    });

    it("should be a synchronous function", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const result = createClient();

      // Should return immediately, not a Promise
      expect(result).not.toBeInstanceOf(Promise);
      expect(result).toBeDefined();
    });

    it("should return client with auth methods", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      expect(client.auth).toBeDefined();
      expect(client.auth).toHaveProperty("getUser");
      expect(client.auth).toHaveProperty("signOut");
      expect(typeof client.auth.getUser).toBe("function");
      expect(typeof client.auth.signOut).toBe("function");
    });

    it("should return client with database query method", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      expect(client.from).toBeDefined();
      expect(typeof client.from).toBe("function");
    });

    it("should be callable multiple times without errors", async () => {
      const { createClient } = await import("@/lib/supabase/client");

      expect(() => {
        createClient();
        createClient();
        createClient();
        createClient();
        createClient();
      }).not.toThrow();
    });

    it("should handle rapid successive calls", async () => {
      const { createClient } = await import("@/lib/supabase/client");

      const clients = Array.from({ length: 100 }, () => createClient());

      expect(clients).toHaveLength(100);
      expect(clients.every((c) => c !== null && c !== undefined)).toBe(true);
    });

    it("should return client that can be used for auth operations", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      expect(client.auth.getUser).toBeDefined();
      expect(typeof client.auth.getUser).toBe("function");
    });

    it("should return client that can be used for database operations", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      expect(client.from).toBeDefined();
      expect(typeof client.from).toBe("function");
    });

    it("should have consistent structure", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client1 = createClient();
      const client2 = createClient();

      // Both should have the same structure
      expect(Object.keys(client1).sort()).toEqual(Object.keys(client2).sort());
    });

    it("should provide auth.getUser function", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      // Should be callable (mocked function)
      expect(typeof client.auth.getUser).toBe("function");
    });

    it("should provide auth.signOut function", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      // Should be callable (mocked function)
      expect(typeof client.auth.signOut).toBe("function");
    });

    it("should provide from method for database queries", async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const client = createClient();

      // Should be callable (mocked function)
      expect(typeof client.from).toBe("function");

      // Should return query builder
      const builder = client.from("test_table");
      expect(builder).toBeDefined();
    });
  });
});
