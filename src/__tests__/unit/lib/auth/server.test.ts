import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { SupabaseManager } from '@/lib/supabase/singleton';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock the singleton module
vi.mock('@/lib/supabase/singleton', () => ({
  SupabaseManager: {
    getServerClient: vi.fn(),
  },
}));

describe('Server Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClient', () => {
    it('should return a Supabase client', async () => {
      const mockClient = {
        auth: { getUser: vi.fn() },
        from: vi.fn(),
      };

      vi.mocked(SupabaseManager.getServerClient).mockResolvedValue(
        mockClient as unknown as SupabaseClient
      );

      const client = await createClient();

      expect(client).toBeDefined();
      expect(client).toBe(mockClient);
    });

    it('should call SupabaseManager.getServerClient', async () => {
      const mockClient = { auth: {}, from: vi.fn() };

      vi.mocked(SupabaseManager.getServerClient).mockResolvedValue(
        mockClient as unknown as SupabaseClient
      );

      await createClient();

      expect(SupabaseManager.getServerClient).toHaveBeenCalledTimes(1);
      expect(SupabaseManager.getServerClient).toHaveBeenCalledWith();
    });

    it('should be an async function', () => {
      const mockClient = { auth: {}, from: vi.fn() };

      vi.mocked(SupabaseManager.getServerClient).mockResolvedValue(
        mockClient as unknown as SupabaseClient
      );

      const result = createClient();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should propagate errors from SupabaseManager', async () => {
      const error = new Error('Missing environment variables');

      vi.mocked(SupabaseManager.getServerClient).mockRejectedValue(error);

      await expect(createClient()).rejects.toThrow('Missing environment variables');
    });

    it('should create new client on each call', async () => {
      const mockClient1 = { id: 1, auth: {}, from: vi.fn() };
      const mockClient2 = { id: 2, auth: {}, from: vi.fn() };

      vi.mocked(SupabaseManager.getServerClient)
        .mockResolvedValueOnce(mockClient1 as unknown as SupabaseClient)
        .mockResolvedValueOnce(mockClient2 as unknown as SupabaseClient);

      const client1 = await createClient();
      const client2 = await createClient();

      expect(client1).not.toBe(client2);
      expect(SupabaseManager.getServerClient).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent calls', async () => {
      const mockClient = { auth: {}, from: vi.fn() };

      vi.mocked(SupabaseManager.getServerClient).mockResolvedValue(
        mockClient as unknown as SupabaseClient
      );

      const [client1, client2, client3] = await Promise.all([
        createClient(),
        createClient(),
        createClient(),
      ]);

      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
      expect(client3).toBeDefined();
      expect(SupabaseManager.getServerClient).toHaveBeenCalledTimes(3);
    });

    it('should return client with expected methods', async () => {
      const mockClient = {
        auth: {
          getUser: vi.fn(),
          signOut: vi.fn(),
          signInWithPassword: vi.fn(),
        },
        from: vi.fn(),
        storage: {
          from: vi.fn(),
        },
      };

      vi.mocked(SupabaseManager.getServerClient).mockResolvedValue(
        mockClient as unknown as SupabaseClient
      );

      const client = await createClient();

      expect(client).toHaveProperty('auth');
      expect(client).toHaveProperty('from');
      expect(client.auth).toHaveProperty('getUser');
      expect(client.auth).toHaveProperty('signOut');
    });

    it('should handle environment variable errors', async () => {
      const envError = new Error(
        'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );

      vi.mocked(SupabaseManager.getServerClient).mockRejectedValue(envError);

      await expect(createClient()).rejects.toThrow('Missing Supabase environment variables');
    });

    it('should work with async/await', async () => {
      const mockClient = { auth: {}, from: vi.fn() };

      vi.mocked(SupabaseManager.getServerClient).mockResolvedValue(
        mockClient as unknown as SupabaseClient
      );

      const client = await createClient();

      expect(client).toBe(mockClient);
    });

    it('should work with .then()', async () => {
      const mockClient = { auth: {}, from: vi.fn() };

      vi.mocked(SupabaseManager.getServerClient).mockResolvedValue(
        mockClient as unknown as SupabaseClient
      );

      await createClient().then((client) => {
        expect(client).toBe(mockClient);
      });
    });

    it('should handle rejection with .catch()', async () => {
      const error = new Error('Test error');

      vi.mocked(SupabaseManager.getServerClient).mockRejectedValue(error);

      await createClient().catch((err) => {
        expect(err).toBe(error);
      });
    });
  });
});
