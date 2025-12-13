import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getBuyerReviews,
  getSellerReviews,
  getPendingReviews,
} from '@/lib/supabase/queries/reviews';

// Mock Supabase client
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

describe('reviews queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBuyerReviews', () => {
    it('should fetch reviews written by a buyer', async () => {
      const mockReviews = [
        { id: '1', buyer_id: 'user-1', rating: 5, content: 'Great!' },
        { id: '2', buyer_id: 'user-1', rating: 4, content: 'Good' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getBuyerReviews('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('reviews');
      expect(mockQuery.eq).toHaveBeenCalledWith('buyer_id', 'user-1');
      expect(result).toEqual(mockReviews);
    });

    it('should return empty array on error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Query failed') }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getBuyerReviews('user-1');

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getBuyerReviews('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSellerReviews', () => {
    it('should fetch reviews received by a seller', async () => {
      const mockReviews = [
        { id: '1', seller_id: 'seller-1', rating: 5, content: 'Excellent work!' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getSellerReviews('seller-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('reviews');
      expect(mockQuery.eq).toHaveBeenCalledWith('seller_id', 'seller-1');
      expect(result).toEqual(mockReviews);
    });

    it('should throw error when query fails', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Query failed') }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(getSellerReviews('seller-1')).rejects.toThrow('Query failed');
    });
  });

  describe('getPendingReviews', () => {
    it('should fetch completed orders without reviews', async () => {
      const mockPendingReviews = [
        {
          id: 'order-1',
          order_number: 'ORD-001',
          buyer_id: 'user-1',
          status: 'completed',
          review_id: null,
        },
        {
          id: 'order-2',
          order_number: 'ORD-002',
          buyer_id: 'user-1',
          status: 'completed',
          review_id: null,
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPendingReviews, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getPendingReviews('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(mockQuery.eq).toHaveBeenCalledWith('buyer_id', 'user-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'completed');
      expect(mockQuery.is).toHaveBeenCalledWith('review_id', null);
      expect(result).toEqual(mockPendingReviews);
    });

    it('should return empty array on error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Query failed') }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getPendingReviews('user-1');

      expect(result).toEqual([]);
    });

    it('should return empty array when no pending reviews', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getPendingReviews('user-1');

      expect(result).toEqual([]);
    });
  });
});
