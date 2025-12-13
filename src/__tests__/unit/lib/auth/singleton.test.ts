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

// Define interface for the mocked client structure
interface MockedSupabaseClient {
  _type: string;
  url: string;
  key: string;
  config: {
    auth?: {
      autoRefreshToken: boolean;
      persistSession: boolean;
      detectSessionInUrl?: boolean;
      flowType?: string;
      storageKey?: string;
    };
    global?: {
      headers: Record<string, string>;
    };
    cookies?: {
      getAll: () => { name: string; value: string }[];
      setAll: (
        cookies: { name: string; value: string; options?: Record<string, unknown> }[]
      ) => void;
    };
  };
}

// Mock next/headers
const mockCookieStore = {
  getAll: vi.fn(),
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
      const client = SupabaseManager.getBrowserClient() as unknown as MockedSupabaseClient;

      expect(client.config).toHaveProperty('auth');
      expect(client.config.auth).toEqual({
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'sb-auth-token',
      });
    });

    it('should include correct global headers', () => {
      const client = SupabaseManager.getBrowserClient() as unknown as MockedSupabaseClient;

      expect(client.config).toHaveProperty('global');
      expect(client.config.global).toHaveProperty('headers');
      expect(client.config.global?.headers).toEqual({
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
      const client = (await SupabaseManager.getServerClient()) as unknown as MockedSupabaseClient;

      expect(client.config).toHaveProperty('cookies');
      expect(client.config.cookies).toHaveProperty('getAll');
      expect(client.config.cookies).toHaveProperty('setAll');

      expect(typeof client.config.cookies?.getAll).toBe('function');
      expect(typeof client.config.cookies?.setAll).toBe('function');
    });

    it('should handle cookie get operations', async () => {
      mockCookieStore.getAll.mockReturnValue([{ name: 'test-cookie', value: 'test-cookie-value' }]);

      const client = (await SupabaseManager.getServerClient()) as unknown as MockedSupabaseClient;
      const result = client.config.cookies?.getAll();

      expect(result).toEqual([{ name: 'test-cookie', value: 'test-cookie-value' }]);
      expect(mockCookieStore.getAll).toHaveBeenCalled();
    });

    it('should handle cookie set operations', async () => {
      const client = (await SupabaseManager.getServerClient()) as unknown as MockedSupabaseClient;
      const cookiesToSet = [
        { name: 'test-cookie', value: 'value', options: { path: '/', httpOnly: true } },
      ];

      // Should not throw
      expect(() => {
        client.config.cookies?.setAll(cookiesToSet);
      }).not.toThrow();

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: 'value',
        path: '/',
        httpOnly: true,
      });
    });

    it('should catch errors in cookie set (Server Component case)', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cannot set cookie in Server Component');
      });

      const client = (await SupabaseManager.getServerClient()) as unknown as MockedSupabaseClient;

      // Should not throw - error is caught
      expect(() => {
        client.config.cookies?.setAll([{ name: 'test-cookie', value: 'value', options: {} }]);
      }).not.toThrow();
    });

    it('should include PKCE flow type in auth config', async () => {
      const client = (await SupabaseManager.getServerClient()) as unknown as MockedSupabaseClient;

      expect(client.config).toHaveProperty('auth');
      expect(client.config.auth).toEqual({
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

      const client = SupabaseManager.getServiceRoleClient() as unknown as MockedSupabaseClient;

      expect(client.config).toHaveProperty('auth');
      expect(client.config.auth).toEqual({
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

      const client = SupabaseManager.getServiceRoleClient() as unknown as MockedSupabaseClient;

      expect(client.url).toBe('https://test.supabase.co');
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
