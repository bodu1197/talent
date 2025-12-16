import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/user/service-views/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Service Views API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/user/service-views', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-views', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if serviceId is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-views', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(400);
      expect(data.error).toBe('Missing serviceId');
    });

    it('should track service view successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const upsertChain = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(upsertChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-views', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(200);
      expect(data.message).toBe('Service view tracked successfully');
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const upsertChain = {
        upsert: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(upsertChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-views', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(500);
      expect(data.error).toBe('Failed to track service view');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/user/service-views', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('GET /api/user/service-views', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-views');

      const response = await GET(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return service views list', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockViews = [
        { service_id: 's1', viewed_at: '2024-01-01', service: { id: 's1', title: 'Service 1' } },
        { service_id: 's2', viewed_at: '2024-01-02', service: { id: 's2', title: 'Service 2' } },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockViews, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-views');

      const response = await GET(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should respect limit parameter', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-views?limit=10');

      await GET(request);

      expect(queryChain.limit).toHaveBeenCalledWith(10);
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-views');

      const response = await GET(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(500);
      expect(data.error).toBe('Failed to fetch service views');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/user/service-views');

      const response = await GET(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
