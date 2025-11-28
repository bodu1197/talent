import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/orders/seller/count/route';

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

describe('Seller Orders Count API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders/seller/count', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/orders/seller/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should return order counts by status', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'seller-1' } },
        error: null,
      });

      const mockOrders = [
        { status: 'paid' },
        { status: 'in_progress' },
        { status: 'in_progress' },
        { status: 'delivered' },
        { status: 'completed' },
        { status: 'completed' },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/seller/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.counts).toEqual({
        paid: 1,
        in_progress: 2,
        delivered: 1,
        completed: 2,
        cancelled: 0,
        all: 6,
      });
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'seller-1' } },
        error: null,
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/seller/count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('주문 카운트를 불러올 수 없습니다');
    });
  });
});
