import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/orders/buyer/count/route';

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

describe('Buyer Orders Count API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders/buyer/count', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/orders/buyer/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should return order counts by status', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockOrders = [
        { status: 'paid' },
        { status: 'paid' },
        { status: 'in_progress' },
        { status: 'delivered' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'cancelled' },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/buyer/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.counts).toEqual({
        paid: 2,
        in_progress: 1,
        delivered: 1,
        completed: 3,
        cancelled: 1,
        all: 8,
      });
    });

    it('should return zero counts when no orders', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/buyer/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.counts.all).toBe(0);
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/buyer/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('주문 카운트를 불러올 수 없습니다');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/orders/buyer/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });
  });
});
