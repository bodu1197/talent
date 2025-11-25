/* eslint-disable @typescript-eslint/no-explicit-any -- Test mocks require flexible typing */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SupabaseManager } from '@/lib/supabase/singleton';

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn((url, key, config) => ({
    _type: 'browser',
    url,
    key,
    config,
  })),
  createServerClient: vi.fn((url, key, config) => ({
    _type: 'server',
    url,
    key,
    config,
  })),
}));

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((url, key, config) => ({
    _type: 'service',
    url,
    key,
    config,
  })),
}));

// Mock next/headers
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

describe('SupabaseManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    SupabaseManager.resetClients();

    // Set up environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    SupabaseManager.resetClients();
  });

  describe('getBrowserClient', () => {
    it('should create browser client with correct configuration', () => {
      const client = SupabaseManager.getBrowserClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('_type', 'browser');
      expect(client).toHaveProperty('url', 'https://test.supabase.co');
      expect(client).toHaveProperty('key', 'test-anon-key');
    });

    it('should return singleton instance on subsequent calls', () => {
      const client1 = SupabaseManager.getBrowserClient();
      const client2 = SupabaseManager.getBrowserClient();

      expect(client1).toBe(client2);
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      expect(() => {
        SupabaseManager.getBrowserClient();
      }).toThrow('Missing Supabase environment variables');
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        SupabaseManager.getBrowserClient();
      }).toThrow('Missing Supabase environment variables');
    });

    it('should throw error when both env variables are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        SupabaseManager.getBrowserClient();
      }).toThrow('Missing Supabase environment variables');
    });

    it('should include correct auth configuration', () => {
      const client = SupabaseManager.getBrowserClient();

      expect((client as any).config).toHaveProperty('auth');
      expect((client as any).config.auth).toEqual({
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'sb-auth-token',
      });
    });

    it('should include correct global headers', () => {
      const client = SupabaseManager.getBrowserClient();

      expect((client as any).config).toHaveProperty('global');
      expect((client as any).config.global).toHaveProperty('headers');
      expect((client as any).config.global.headers).toEqual({
        'x-application-name': 'talent-hub',
      });
    });

    it('should create new client after reset', () => {
      const client1 = SupabaseManager.getBrowserClient();
      SupabaseManager.resetClients();
      const client2 = SupabaseManager.getBrowserClient();

      // After reset, a new instance should be created
      expect(client1).not.toBe(client2);
    });
  });

  describe('getServerClient', () => {
    it('should create server client with correct configuration', async () => {
      const client = await SupabaseManager.getServerClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('_type', 'server');
      expect(client).toHaveProperty('url', 'https://test.supabase.co');
      expect(client).toHaveProperty('key', 'test-anon-key');
    });

    it('should create new instance on each call (not singleton)', async () => {
      const client1 = await SupabaseManager.getServerClient();
      const client2 = await SupabaseManager.getServerClient();

      // Server clients should be different instances
      expect(client1).not.toBe(client2);
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      await expect(SupabaseManager.getServerClient()).rejects.toThrow(
        'Missing Supabase environment variables'
      );
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      await expect(SupabaseManager.getServerClient()).rejects.toThrow(
        'Missing Supabase environment variables'
      );
    });

    it('should configure cookies handlers', async () => {
      const client = await SupabaseManager.getServerClient();

      expect((client as any).config).toHaveProperty('cookies');
      expect((client as any).config.cookies).toHaveProperty('get');
      expect((client as any).config.cookies).toHaveProperty('set');
      expect((client as any).config.cookies).toHaveProperty('remove');

      expect(typeof (client as any).config.cookies.get).toBe('function');
      expect(typeof (client as any).config.cookies.set).toBe('function');
      expect(typeof (client as any).config.cookies.remove).toBe('function');
    });

    it('should handle cookie get operations', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'test-cookie-value' });

      const client = await SupabaseManager.getServerClient();
      const result = (client as any).config.cookies.get('test-cookie');

      expect(result).toBe('test-cookie-value');
      expect(mockCookieStore.get).toHaveBeenCalledWith('test-cookie');
    });

    it('should handle cookie get when cookie does not exist', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const client = await SupabaseManager.getServerClient();
      const result = (client as any).config.cookies.get('nonexistent');

      expect(result).toBeUndefined();
    });

    it('should handle cookie set operations', async () => {
      const client = await SupabaseManager.getServerClient();
      const options = { path: '/', httpOnly: true };

      // Should not throw
      expect(() => {
        (client as any).config.cookies.set('test-cookie', 'value', options);
      }).not.toThrow();

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: 'value',
        ...options,
      });
    });

    it('should catch errors in cookie set (Server Component case)', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cannot set cookie in Server Component');
      });

      const client = await SupabaseManager.getServerClient();

      // Should not throw - error is caught
      expect(() => {
        (client as any).config.cookies.set('test-cookie', 'value', {});
      }).not.toThrow();
    });

    it('should handle cookie remove operations', async () => {
      const client = await SupabaseManager.getServerClient();
      const options = { path: '/' };

      expect(() => {
        (client as any).config.cookies.remove('test-cookie', options);
      }).not.toThrow();

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: '',
        ...options,
      });
    });

    it('should catch errors in cookie remove', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cannot remove cookie in Server Component');
      });

      const client = await SupabaseManager.getServerClient();

      // Should not throw - error is caught
      expect(() => {
        (client as any).config.cookies.remove('test-cookie', {});
      }).not.toThrow();
    });

    it('should include PKCE flow type in auth config', async () => {
      const client = await SupabaseManager.getServerClient();

      expect((client as any).config).toHaveProperty('auth');
      expect((client as any).config.auth).toEqual({
        flowType: 'pkce',
        storageKey: 'sb-auth-token',
      });
    });
  });

  describe('getServiceRoleClient', () => {
    const originalWindow = global.window;

    afterEach(() => {
      // Restore window
      global.window = originalWindow;
    });

    it('should create service role client with correct configuration', () => {
      // Mock server environment (no window)
      // @ts-expect-error - Mocking server environment
      delete global.window;

      const client = SupabaseManager.getServiceRoleClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('_type', 'service');
      expect(client).toHaveProperty('url', 'https://test.supabase.co');
      expect(client).toHaveProperty('key', 'test-service-key');
    });

    it('should return singleton instance on subsequent calls', () => {
      // @ts-expect-error - Mocking server environment
      delete global.window;

      const client1 = SupabaseManager.getServiceRoleClient();
      const client2 = SupabaseManager.getServiceRoleClient();

      expect(client1).toBe(client2);
    });

    it('should throw error when called from browser', () => {
      // Mock browser environment
      global.window = {} as Window & typeof globalThis;

      expect(() => {
        SupabaseManager.getServiceRoleClient();
      }).toThrow('Service Role Client는 서버 사이드에서만 사용할 수 있습니다!');
    });

    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
      // @ts-expect-error - Mocking server environment
      delete global.window;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => {
        SupabaseManager.getServiceRoleClient();
      }).toThrow('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다');
    });

    it('should configure with autoRefreshToken disabled', () => {
      // @ts-expect-error - Mocking server environment
      delete global.window;

      const client = SupabaseManager.getServiceRoleClient();

      expect((client as any).config).toHaveProperty('auth');
      expect((client as any).config.auth).toEqual({
        autoRefreshToken: false,
        persistSession: false,
      });
    });

    it('should create new client after reset', () => {
      // @ts-expect-error - Mocking server environment
      delete global.window;

      const client1 = SupabaseManager.getServiceRoleClient();
      SupabaseManager.resetClients();
      const client2 = SupabaseManager.getServiceRoleClient();

      expect(client1).not.toBe(client2);
    });

    it('should use NEXT_PUBLIC_SUPABASE_URL for service client', () => {
      // @ts-expect-error - Mocking server environment
      delete global.window;

      const client = SupabaseManager.getServiceRoleClient();

      expect((client as any).url).toBe('https://test.supabase.co');
    });
  });

  describe('resetClients', () => {
    it('should reset browser client', () => {
      const client1 = SupabaseManager.getBrowserClient();
      SupabaseManager.resetClients();
      const client2 = SupabaseManager.getBrowserClient();

      expect(client1).not.toBe(client2);
    });

    it('should reset service client', () => {
      // @ts-expect-error - Mocking server environment
      delete global.window;

      const client1 = SupabaseManager.getServiceRoleClient();
      SupabaseManager.resetClients();
      const client2 = SupabaseManager.getServiceRoleClient();

      expect(client1).not.toBe(client2);
    });

    it('should not throw when called multiple times', () => {
      expect(() => {
        SupabaseManager.resetClients();
        SupabaseManager.resetClients();
        SupabaseManager.resetClients();
      }).not.toThrow();
    });

    it('should allow creating new clients after reset', () => {
      SupabaseManager.getBrowserClient();
      SupabaseManager.resetClients();

      expect(() => {
        SupabaseManager.getBrowserClient();
      }).not.toThrow();
    });
  });
});
