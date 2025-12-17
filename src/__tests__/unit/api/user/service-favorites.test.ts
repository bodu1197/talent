import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, DELETE, GET } from '@/app/api/user/service-favorites/route';

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

describe('Service Favorites API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/user/service-favorites', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(401);
      expect(data.error).toBe('로그인이 필요합니다');
    });

    it('should return 400 if serviceId is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(400);
      expect(data.error).toBe('Missing serviceId');
    });

    it('should add favorite successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      // Insert chain
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      // Update wishlist count chain
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { wishlist_count: 5 } }),
      };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return insertChain;
        if (callCount === 2) return selectChain;
        return updateChain;
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(201);
      expect(data.message).toBe('Added to favorites');
    });

    it('should handle duplicate favorite (already favorited)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: { code: '23505' } }),
      };

      mockSupabase.from.mockReturnValue(insertChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(200);
      expect(data.message).toBe('Already favorited');
    });
  });

  describe('DELETE /api/user/service-favorites', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/user/service-favorites?serviceId=service-1'
      );

      const response = await DELETE(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(401);
      expect(data.error).toBe('로그인이 필요합니다');
    });

    it('should return 400 if serviceId is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites');

      const response = await DELETE(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(400);
      expect(data.error).toBe('Missing serviceId');
    });

    it('should remove favorite successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      // delete().eq('user_id').eq('service_id') - two .eq() calls
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(function (this: typeof deleteChain) {
          return this;
        }),
      };
      // Make final .eq() return resolved value
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: null });

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { wishlist_count: 5 } }),
      };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return deleteChain;
        if (callCount === 2) return selectChain;
        return updateChain;
      });

      const request = new NextRequest(
        'http://localhost:3000/api/user/service-favorites?serviceId=service-1'
      );

      const response = await DELETE(request);

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(200);
      expect(data.message).toBe('Removed from favorites');
    });
  });

  describe('GET /api/user/service-favorites', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites');

      const response = await GET(request, {
        params: Promise.resolve({} as Record<string, never>),
      });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(401);
      expect(data.error).toBe('로그인이 필요합니다');
    });

    it('should return favorites list', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockFavorites = [
        { service_id: 's1', created_at: '2024-01-01', service: { id: 's1', title: 'Service 1' } },
        { service_id: 's2', created_at: '2024-01-02', service: { id: 's2', title: 'Service 2' } },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites');

      const response = await GET(request, {
        params: Promise.resolve({} as Record<string, never>),
      });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/user/service-favorites');

      const response = await GET(request, {
        params: Promise.resolve({} as Record<string, never>),
      });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(500);
      expect(data.error).toBe('Failed to fetch favorites');
    });
  });
});
