import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
  getBuyerOrdersCount,
  getSellerOrdersCount,
} from '@/lib/supabase/queries/orders';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('orders queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBuyerOrders', () => {
    it('should fetch orders for a buyer', async () => {
      const mockOrders = [
        { id: '1', buyer_id: 'user-1', status: 'pending' },
        { id: '2', buyer_id: 'user-1', status: 'completed' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getBuyerOrders('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(mockQuery.eq).toHaveBeenCalledWith('buyer_id', 'user-1');
      expect(result).toEqual(mockOrders);
    });

    it('should filter by status when provided', async () => {
      const mockOrders = [{ id: '1', buyer_id: 'user-1', status: 'completed' }];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn(),
      };

      // order() returns chain with eq() that resolves to result (for status filter)
      mockQuery.order.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      });

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getBuyerOrders('user-1', 'completed');

      expect(mockQuery.eq).toHaveBeenCalledWith('buyer_id', 'user-1');
      expect(result).toEqual(mockOrders);
    });

    it('should throw error when query fails', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Query failed') }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(getBuyerOrders('user-1')).rejects.toThrow('Query failed');
    });
  });

  describe('getSellerOrders', () => {
    it('should fetch orders for a seller', async () => {
      const mockOrders = [
        { id: '1', seller_id: 'seller-1', status: 'in_progress' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getSellerOrders('seller-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(mockQuery.eq).toHaveBeenCalledWith('seller_id', 'seller-1');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrderById', () => {
    it('should fetch a single order by id', async () => {
      const mockOrder = {
        id: 'order-1',
        buyer_id: 'buyer-1',
        seller_id: 'seller-1',
        status: 'pending',
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getOrderById('order-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'order-1');
      expect(result).toEqual(mockOrder);
    });

    it('should throw error when order not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(getOrderById('non-existent')).rejects.toThrow('Not found');
    });
  });

  describe('getBuyerOrdersCount', () => {
    it('should return count of buyer orders with specific status', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Chain two eq calls
      mockQuery.eq.mockReturnValueOnce(mockQuery).mockResolvedValueOnce({ count: 5, error: null });

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getBuyerOrdersCount('user-1', 'completed');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(result).toBe(5);
    });

    it('should return 0 when count is null', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockReturnValueOnce(mockQuery).mockResolvedValueOnce({ count: null, error: null });

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getBuyerOrdersCount('user-1', 'completed');

      expect(result).toBe(0);
    });
  });

  describe('getSellerOrdersCount', () => {
    it('should return count of seller orders with specific status', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockReturnValueOnce(mockQuery).mockResolvedValueOnce({ count: 10, error: null });

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getSellerOrdersCount('seller-1', 'pending');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(result).toBe(10);
    });
  });
});
