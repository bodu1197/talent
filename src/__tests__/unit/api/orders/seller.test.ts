import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/orders/seller/route';

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
      const mockUser = { id: 'seller-1', email: 'seller@example.com' };
      return handler(request, mockUser);
    };
  }),
}));

describe('Seller Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders/seller', () => {
    it('should return seller orders with revision stats', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          status: 'in_progress',
          service: { id: 's1', title: 'Service 1' },
          buyer: { id: 'buyer-1', name: 'Buyer 1' },
        },
      ];

      const mockRevisionStats = [
        { order_id: 'order-1', total_revisions: 2, pending_revisions: 1 },
      ];

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
          };
        } else {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: mockRevisionStats, error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/orders/seller');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(1);
      expect(data.orders[0].revision_count).toBe(2);
      expect(data.orders[0].pending_revision_count).toBe(1);
    });

    it('should return empty array when no orders', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/orders/seller');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toEqual([]);
    });

    it('should filter by status', async () => {
      const mockOrders = [{ id: 'order-1', status: 'delivered' }];

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // When status is provided, order() returns chain with additional .eq()
          const queryChain: Record<string, ReturnType<typeof vi.fn>> = {
            select: vi.fn(),
            eq: vi.fn(),
            order: vi.fn(),
          };
          queryChain.select.mockReturnValue(queryChain);
          queryChain.eq.mockReturnValue(queryChain);
          queryChain.order.mockReturnValue({
            ...queryChain,
            eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
          });
          return queryChain;
        } else {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/orders/seller?status=delivered');

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

      const request = new NextRequest('http://localhost:3000/api/orders/seller');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
