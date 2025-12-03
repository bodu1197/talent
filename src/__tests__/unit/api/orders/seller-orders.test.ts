import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth middleware
vi.mock('@/lib/api/auth-middleware', () => ({
  withAuth: (handler: Function) => async (request: NextRequest) => {
    const mockUser = { id: 'seller-1', email: 'seller@example.com' };
    return handler(request, mockUser);
  },
}));

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  in: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/api/error-handler', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  handleApiError: vi.fn((error: Error & { status?: number }) => {
    const { NextResponse } = require('next/server');
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }),
}));

import { GET } from '@/app/api/orders/seller/route';

describe('Seller Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders/seller', () => {
    it('should return all orders for the seller', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          seller_id: 'seller-1',
          buyer_id: 'buyer-1',
          status: 'pending',
          amount: 50000,
          service: { id: 'service-1', title: 'Test Service' },
          buyer: { id: 'buyer-1', name: 'Buyer Name' },
        },
      ];

      mockSupabase.order.mockResolvedValueOnce({
        data: mockOrders,
        error: null,
      });

      mockSupabase.in.mockResolvedValueOnce({
        data: [{ order_id: 'order-1', total_revisions: 0, pending_revisions: 0 }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/orders/seller');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toBeDefined();
    });

    it('should return empty array when no orders exist', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/orders/seller');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/orders/seller');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
