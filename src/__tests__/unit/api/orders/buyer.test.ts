import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/orders/buyer/route';

// Mock Supabase
const mockSupabase = {
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

// Mock withAuth to pass user directly
vi.mock('@/lib/api/auth-middleware', () => ({
  withAuth: vi.fn((handler) => {
    return async (request: NextRequest) => {
      // Simulate authenticated user
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      return handler(request, mockUser);
    };
  }),
}));

describe('Buyer Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders/buyer', () => {
    it('should return buyer orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          status: 'paid',
          service: { id: 's1', title: 'Service 1' },
          seller: { id: 'seller-1', name: 'Seller 1' },
        },
        {
          id: 'order-2',
          status: 'completed',
          service: { id: 's2', title: 'Service 2' },
          seller: { id: 'seller-2', name: 'Seller 2' },
        },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/buyer');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const mockOrders = [{ id: 'order-1', status: 'paid' }];

      // When status is provided, there's an additional .eq('status', status) call after .order()
      const queryChain: Record<string, ReturnType<typeof vi.fn>> = {
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
      };
      queryChain.select.mockReturnValue(queryChain);
      queryChain.eq.mockReturnValue(queryChain);
      // order() returns chain with .eq() that resolves to result
      queryChain.order.mockReturnValue({
        ...queryChain,
        eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      });

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/buyer?status=paid');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(1);
    });

    it('should handle database error', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/buyer');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
