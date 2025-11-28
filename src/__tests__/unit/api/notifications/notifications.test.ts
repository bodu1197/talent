import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/notifications/route';

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

describe('Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/notifications');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should return notifications list', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockNotifications = [
        { id: 'n1', title: 'New order', is_read: false },
        { id: 'n2', title: 'Payment received', is_read: true },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/notifications');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notifications).toHaveLength(2);
    });

    it('should filter unread only notifications', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockNotifications = [{ id: 'n1', title: 'New order', is_read: false }];

      // When unread_only=true, there's an additional .eq('is_read', false) call after .limit()
      const queryChain: Record<string, ReturnType<typeof vi.fn>> = {
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
      };
      // Make all methods return the chain itself
      queryChain.select.mockReturnValue(queryChain);
      queryChain.eq.mockReturnValue(queryChain);
      queryChain.order.mockReturnValue(queryChain);
      // limit returns chain, then the final .eq() returns the result
      queryChain.limit.mockReturnValue({
        ...queryChain,
        eq: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
      });

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/notifications?unread_only=true');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notifications).toHaveLength(1);
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

      const request = new NextRequest('http://localhost:3000/api/notifications');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('알림을 불러올 수 없습니다');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/notifications');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });
  });
});
