import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getBuyerDashboardStats,
  getBuyerRecentOrders,
  getBuyerRecentFavorites,
  getBuyerBenefits,
  getSellerDashboardStats,
  getSellerRecentOrders,
} from '@/lib/supabase/queries/dashboard';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server');
vi.mock('@/lib/logger');

describe('Supabase Queries - Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBuyerDashboardStats', () => {
    it('should return correct buyer dashboard statistics', async () => {
      const mockOrders = [
        {
          status: 'in_progress',
          review_id: null,
          created_at: new Date().toISOString(),
        },
        {
          status: 'in_progress',
          review_id: null,
          created_at: new Date().toISOString(),
        },
        {
          status: 'delivered',
          review_id: null,
          created_at: new Date().toISOString(),
        },
        {
          status: 'completed',
          review_id: null,
          created_at: new Date().toISOString(),
        },
        {
          status: 'completed',
          review_id: 'review-1',
          created_at: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerDashboardStats('buyer-123');

      expect(result.inProgressOrders).toBe(2);
      expect(result.deliveredOrders).toBe(1);
      expect(result.pendingReviews).toBe(1); // completed without review_id
      expect(result.monthlyPurchases).toBeGreaterThanOrEqual(0);
    });

    it('should return zero stats when no orders exist', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerDashboardStats('buyer-123');

      expect(result.inProgressOrders).toBe(0);
      expect(result.deliveredOrders).toBe(0);
      expect(result.pendingReviews).toBe(0);
      expect(result.monthlyPurchases).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database connection failed' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerDashboardStats('buyer-123');

      expect(result.inProgressOrders).toBe(0);
      expect(result.deliveredOrders).toBe(0);
      expect(result.pendingReviews).toBe(0);
      expect(result.monthlyPurchases).toBe(0);
    });

    it('should calculate monthly purchases correctly', async () => {
      const thisMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const mockOrders = [
        {
          status: 'completed',
          review_id: null,
          created_at: thisMonth.toISOString(),
        },
        {
          status: 'completed',
          review_id: null,
          created_at: thisMonth.toISOString(),
        },
        {
          status: 'completed',
          review_id: null,
          created_at: lastMonth.toISOString(), // Should not be counted
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerDashboardStats('buyer-123');

      expect(result.monthlyPurchases).toBe(2);
    });
  });

  describe('getBuyerRecentOrders', () => {
    it('should return recent orders with service and seller info', async () => {
      const mockData = [
        {
          id: 'order-1',
          status: 'in_progress',
          created_at: '2025-01-15T10:00:00Z',
          service: {
            id: 'service-1',
            title: 'Web Development',
            thumbnail_url: 'thumb.jpg',
          },
          seller: {
            id: 'seller-1',
            name: 'John Seller',
            profile_image: 'profile.jpg',
          },
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerRecentOrders('buyer-123', 5);

      expect(result).toEqual(mockData);
      expect(result.length).toBe(1);
      expect(result[0].service.title).toBe('Web Development');
    });

    it('should return empty array when no orders found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerRecentOrders('buyer-123');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      const mockError = { message: 'Query failed' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerRecentOrders('buyer-123');

      expect(result).toEqual([]);
    });

    it('should respect the limit parameter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      await getBuyerRecentOrders('buyer-123', 10);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('getBuyerRecentFavorites', () => {
    it('should return recent favorites with service info', async () => {
      const mockData = [
        {
          id: 'fav-1',
          created_at: '2025-01-15T10:00:00Z',
          service: {
            id: 'service-1',
            title: 'Design Service',
            seller: {
              id: 'seller-1',
              name: 'Jane Seller',
            },
          },
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerRecentFavorites('buyer-123', 5);

      expect(result).toEqual(mockData);
      expect((result[0].service as unknown as { title: string }).title).toBe('Design Service');
    });

    it('should return empty array when no favorites found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerRecentFavorites('buyer-123');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      const mockError = { message: 'Database error' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getBuyerRecentFavorites('buyer-123');

      expect(result).toEqual([]);
    });
  });

  describe('getBuyerBenefits', () => {
    it('should return empty benefits (feature removed)', async () => {
      const result = await getBuyerBenefits('buyer-123');

      expect(result).toEqual({
        points: 0,
        coupons: 0,
        membershipLevel: 'basic',
      });
    });
  });

  describe('getSellerDashboardStats', () => {
    it('should return correct seller dashboard statistics', async () => {
      const mockOrders = [
        {
          status: 'paid',
          total_amount: 10000,
          created_at: new Date().toISOString(),
        },
        {
          status: 'in_progress',
          total_amount: 20000,
          created_at: new Date().toISOString(),
        },
        {
          status: 'delivered',
          total_amount: 15000,
          created_at: new Date().toISOString(),
        },
        {
          status: 'completed',
          total_amount: 25000,
          created_at: new Date().toISOString(),
        },
        {
          status: 'completed',
          total_amount: 30000,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      const mockSupabase = {
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>;

      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const result = await getSellerDashboardStats(mockSupabase, 'seller-123');

      expect(result.newOrders).toBe(1);
      expect(result.inProgressOrders).toBe(1);
      expect(result.deliveredOrders).toBe(1);
      expect(result.completedOrders).toBe(2);
      expect(result.monthlyRevenue).toBe(25000); // Only current month completed orders
    });

    it('should return zero stats when no orders exist', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockSupabase = {
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>;

      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const result = await getSellerDashboardStats(mockSupabase, 'seller-123');

      expect(result.newOrders).toBe(0);
      expect(result.inProgressOrders).toBe(0);
      expect(result.deliveredOrders).toBe(0);
      expect(result.completedOrders).toBe(0);
      expect(result.monthlyRevenue).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Connection timeout' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      const mockSupabase = {
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>;

      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const result = await getSellerDashboardStats(mockSupabase, 'seller-123');

      expect(result.newOrders).toBe(0);
      expect(result.inProgressOrders).toBe(0);
      expect(result.deliveredOrders).toBe(0);
      expect(result.completedOrders).toBe(0);
      expect(result.monthlyRevenue).toBe(0);
    });
  });

  describe('getSellerRecentOrders', () => {
    it('should return recent orders with buyer and service info', async () => {
      const mockData = [
        {
          id: 'order-1',
          status: 'paid',
          created_at: '2025-01-15T10:00:00Z',
          service: {
            id: 'service-1',
            title: 'Consulting Service',
            thumbnail_url: 'thumb.jpg',
          },
          buyer: {
            id: 'buyer-1',
            name: 'John Buyer',
            profile_image: 'profile.jpg',
          },
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      const mockSupabase = {
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>;

      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      const result = await getSellerRecentOrders(mockSupabase, 'seller-123', 5);

      expect(result).toEqual(mockData);
      expect(result[0].buyer.name).toBe('John Buyer');
      expect(result[0].service.title).toBe('Consulting Service');
    });

    it('should filter by correct statuses', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockSupabase = {
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>;

      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      await getSellerRecentOrders(mockSupabase, 'seller-123', 5);

      expect(mockQuery.in).toHaveBeenCalledWith('status', ['paid', 'in_progress', 'delivered']);
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Query failed' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      const mockSupabase = {
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>;

      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      await expect(getSellerRecentOrders(mockSupabase, 'seller-123')).rejects.toEqual(mockError);
    });

    it('should respect the limit parameter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockSupabase = {
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createClient>>;

      vi.mocked(createClient).mockResolvedValue(mockSupabase);

      await getSellerRecentOrders(mockSupabase, 'seller-123', 10);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });
});
