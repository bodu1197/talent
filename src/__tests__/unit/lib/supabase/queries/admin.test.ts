/* eslint-disable @typescript-eslint/no-unused-vars, sonarjs/no-nested-functions -- Test mocks require flexible typing and nested describe/it blocks */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminDashboardStats,
  getAdminRecentOrders,
  getAdminRecentUsers,
  getAdminRecentReviews,
  getAdminDailySales,
  getAdminUsers,
  getAdminUsersCount,
  getAdminOrders,
  getAdminOrdersCount,
  getAdminServices,
  getAdminServicesCount,
  getAdminReviews,
  getServiceRevisions,
  getServiceRevisionsCount,
  approveServiceRevision,
  rejectServiceRevision,
  getServiceRevisionDetail,
} from '@/lib/supabase/queries/admin';
import { createClient } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client');

describe('Supabase Queries - Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminDashboardStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      const mockQueries = {
        users: {
          select: vi.fn().mockResolvedValue({ count: 100, error: null }),
        },
        orders: {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              then: vi.fn((callback) => {
                callback({
                  data: [{ total_amount: 50000 }, { total_amount: 30000 }],
                  error: null,
                });
                return Promise.resolve({
                  data: [{ total_amount: 50000 }, { total_amount: 30000 }],
                  error: null,
                });
              }),
            })),
          })),
        },
        ordersInProgress: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ count: 5, error: null }),
        },
        reports: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              throwOnError: vi.fn().mockResolvedValue({ count: 3, error: null }),
            })),
          })),
        },
        monthOrders: {
          select: vi.fn(() => ({
            gte: vi.fn().mockResolvedValue({
              data: [
                { total_amount: 100000, status: 'completed' },
                { total_amount: 50000, status: 'completed' },
                { total_amount: 30000, status: 'paid' },
              ],
              error: null,
            }),
          })),
        },
        totalOrders: {
          select: vi.fn().mockResolvedValue({ count: 250, error: null }),
        },
        totalServices: {
          select: vi.fn().mockResolvedValue({ count: 75, error: null }),
        },
      };

      let callCount = 0;
      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table) => {
          if (table === 'users') return mockQueries.users;
          if (table === 'orders') {
            callCount++;
            if (callCount === 1) return mockQueries.orders;
            if (callCount === 2) return mockQueries.ordersInProgress;
            if (callCount === 3) return mockQueries.monthOrders;
            if (callCount === 4) return mockQueries.totalOrders;
          }
          if (table === 'reports') return mockQueries.reports;
          if (table === 'services') return mockQueries.totalServices;
          return mockQueries.users;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminDashboardStats();

      expect(result.totalUsers).toBe(100);
      expect(result.todayRevenue).toBeGreaterThanOrEqual(0);
      expect(result.inProgressOrders).toBe(5);
      expect(result.pendingReports).toBe(3);
      expect(result.monthlyRevenue).toBe(150000);
      expect(result.monthlyOrderCount).toBe(3);
      expect(result.totalOrders).toBe(250);
      expect(result.totalServices).toBe(75);
    });

    it('should handle missing reports table gracefully', async () => {
      const mockQueries = {
        users: {
          select: vi.fn().mockResolvedValue({ count: 50, error: null }),
        },
        orders: {
          select: vi.fn(() => ({
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        },
        ordersInProgress: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ count: 0, error: null }),
        },
        reports: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              throwOnError: vi.fn().mockRejectedValue(new Error('Table does not exist')),
            })),
          })),
        },
        totalOrders: {
          select: vi.fn().mockResolvedValue({ count: 0, error: null }),
        },
        totalServices: {
          select: vi.fn().mockResolvedValue({ count: 0, error: null }),
        },
      };

      let callCount = 0;
      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table) => {
          if (table === 'users') return mockQueries.users;
          if (table === 'orders') {
            callCount++;
            if (callCount === 1) return mockQueries.orders;
            if (callCount === 2) return mockQueries.ordersInProgress;
            if (callCount === 3) return mockQueries.orders;
            if (callCount === 4) return mockQueries.totalOrders;
          }
          if (table === 'reports') return mockQueries.reports;
          if (table === 'services') return mockQueries.totalServices;
          return mockQueries.users;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminDashboardStats();

      expect(result.pendingReports).toBe(0);
    });
  });

  describe('getAdminRecentOrders', () => {
    it('should return recent orders with relations', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'ORD-001',
          buyer_id: 'buyer-1',
          seller_id: 'seller-1',
          service: { id: 'service-1', title: 'Service Title' },
        },
      ];

      const mockBuyers = [{ user_id: 'buyer-1', name: 'Buyer Name' }];

      const mockBuyerUsers = [{ id: 'buyer-1', email: 'buyer@test.com' }];

      const mockSellers = [
        {
          id: 'seller-1',
          user_id: 'seller-1',
          display_name: 'Seller Display',
          business_name: 'Seller Business',
          profile_image: 'image.jpg',
        },
      ];

      const mockSellerUsers = [{ id: 'seller-1', email: 'seller@test.com' }];

      const mockOrdersQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      const mockBuyersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockBuyers }),
      };

      const mockBuyerUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockBuyerUsers }),
      };

      const mockSellersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSellers }),
      };

      const mockSellerUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSellerUsers }),
      };

      let profilesCallCount = 0;
      let usersCallCount = 0;
      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table: string) => {
          if (table === 'orders') return mockOrdersQuery;
          if (table === 'profiles') {
            profilesCallCount++;
            return mockBuyersQuery;
          }
          if (table === 'users') {
            usersCallCount++;
            // 첫 번째 호출은 buyer email, 두 번째 호출은 seller email
            return usersCallCount === 1 ? mockBuyerUsersQuery : mockSellerUsersQuery;
          }
          if (table === 'seller_profiles') return mockSellersQuery;
          return mockOrdersQuery;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminRecentOrders(10);

      expect(result).toHaveLength(1);
      expect(result[0].buyer).toEqual({
        id: 'buyer-1',
        name: 'Buyer Name',
        email: 'buyer@test.com',
      });
      expect(result[0].seller).toEqual({
        id: 'seller-1',
        name: 'Seller Display',
        email: 'seller@test.com',
        display_name: 'Seller Display',
        business_name: 'Seller Business',
        profile_image: 'image.jpg',
      });
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Query failed' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminRecentOrders()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminRecentUsers', () => {
    it('should return recent users', async () => {
      const mockProfiles = [
        {
          user_id: 'user-1',
          name: 'User 1',
          created_at: '2025-01-01T00:00:00Z',
          profile_image: null,
        },
      ];

      const mockUsers = [{ id: 'user-1', email: 'user1@test.com' }];

      const mockProfilesQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      };

      const mockUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockUsers }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table: string) => {
          if (table === 'profiles') return mockProfilesQuery;
          if (table === 'users') return mockUsersQuery;
          return mockProfilesQuery;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminRecentUsers(10);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'user-1',
        name: 'User 1',
        email: 'user1@test.com',
        created_at: '2025-01-01T00:00:00Z',
        profile_image: null,
      });
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Failed to fetch users' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminRecentUsers()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminRecentReviews', () => {
    it('should return recent reviews with relations', async () => {
      const mockData = [
        {
          id: 'review-1',
          rating: 5,
          content: 'Great service!',
          buyer: { id: 'buyer-1', name: 'Buyer' },
          seller: { id: 'seller-1', name: 'Seller' },
          service: { id: 'service-1', title: 'Service' },
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminRecentReviews(10);

      expect(result).toEqual(mockData);
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Query error' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminRecentReviews()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminDailySales', () => {
    it('should return daily sales for specified days', async () => {
      const mockData = [
        {
          total_amount: 50000,
          completed_at: '2025-01-15T10:00:00Z',
          status: 'completed',
        },
        {
          total_amount: 30000,
          completed_at: '2025-01-16T10:00:00Z',
          status: 'completed',
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminDailySales(7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Database error' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminDailySales()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminUsers', () => {
    it('should return users with filters', async () => {
      const mockProfiles = [
        {
          user_id: 'user-1',
          role: 'seller',
          created_at: '2025-01-01T00:00:00Z',
          name: 'John Doe',
          profile_image: 'image.jpg',
        },
      ];

      const mockUsers = [{ id: 'user-1', email: 'john@test.com' }];

      const mockProfilesQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      };

      const mockUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockUsers }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table: string) => {
          if (table === 'profiles') return mockProfilesQuery;
          if (table === 'users') return mockUsersQuery;
          if (table === 'sellers')
            return {
              select: vi.fn().mockResolvedValue({ data: [{ user_id: 'user-1' }] }),
            };
          if (table === 'admins' || table === 'helper_profiles')
            return {
              select: vi.fn().mockResolvedValue({ data: [] }),
            };
          return mockProfilesQuery;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminUsers({
        role: 'seller',
        searchQuery: 'John',
      });

      expect(result).toBeDefined();
      expect(result[0].id).toBe('user-1');
      expect(result[0].email).toBe('john@test.com');
    });

    it('should handle errors gracefully', async () => {
      const mockError = { message: 'Query failed', code: 'ERROR' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminUsers();

      expect(result).toEqual([]);
    });

    it('should not filter when role is "all"', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await getAdminUsers({ role: 'all' });

      expect(mockQuery.select).toHaveBeenCalled();
    });
  });

  describe('getAdminUsersCount', () => {
    it('should return count of users', async () => {
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ count: 42, error: null }),
        eq: vi.fn().mockResolvedValue({ count: 42, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminUsersCount('seller');

      expect(result).toBe(42);
    });

    it('should return 0 on error', async () => {
      const mockError = { message: 'Error' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminUsersCount();

      expect(result).toBe(0);
    });
  });

  describe('getAdminOrders', () => {
    it('should return orders with filters', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'ORD-001',
          status: 'paid',
          buyer_id: 'buyer-1',
          seller_id: 'seller-1',
          service: {
            id: 'service-1',
            title: 'Service',
            thumbnail_url: 'thumb.jpg',
          },
        },
      ];

      const mockBuyers = [{ user_id: 'buyer-1', name: 'Buyer' }];

      const mockBuyerUsers = [{ id: 'buyer-1', email: 'buyer@test.com' }];

      const mockSellers = [
        {
          id: 'seller-1',
          user_id: 'seller-1',
          display_name: 'Seller Display',
          business_name: 'Seller Business',
          profile_image: 'image.jpg',
        },
      ];

      const mockSellerUsers = [{ id: 'seller-1', email: 'seller@test.com' }];

      const mockOrdersQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      const mockBuyersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockBuyers, error: null }),
      };

      const mockBuyerUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockBuyerUsers, error: null }),
      };

      const mockSellersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSellers, error: null }),
      };

      const mockSellerUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockSellerUsers, error: null }),
      };

      let profilesCallCount = 0;
      let usersCallCount = 0;
      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table: string) => {
          if (table === 'orders') return mockOrdersQuery;
          if (table === 'profiles') {
            profilesCallCount++;
            return mockBuyersQuery;
          }
          if (table === 'users') {
            usersCallCount++;
            // 첫 번째 호출은 buyer email, 두 번째 호출은 seller email
            return usersCallCount === 1 ? mockBuyerUsersQuery : mockSellerUsersQuery;
          }
          if (table === 'seller_profiles') return mockSellersQuery;
          return mockOrdersQuery;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminOrders({
        status: 'paid',
        searchQuery: 'ORD',
      });

      expect(result).toHaveLength(1);
      expect(result[0].buyer).toEqual({
        id: 'buyer-1',
        name: 'Buyer',
        email: 'buyer@test.com',
      });
      expect(result[0].seller).toEqual({
        id: 'seller-1',
        name: 'Seller Display',
        email: 'seller@test.com',
        display_name: 'Seller Display',
        business_name: 'Seller Business',
        profile_image: 'image.jpg',
      });
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Failed' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminOrders()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminOrdersCount', () => {
    it('should return count of orders', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 100, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminOrdersCount('paid');

      expect(result).toBe(100);
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Error' };

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ count: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminOrdersCount()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminServices', () => {
    it('should return services with seller info', async () => {
      const mockServices = [
        {
          id: 'service-1',
          title: 'Service',
          status: 'active',
          seller: {
            id: 'seller-1',
            business_name: 'Business',
            user_id: 'user-1',
          },
        },
      ];

      const mockUsers = [{ id: 'user-1', name: 'User', email: 'user@test.com' }];

      const mockServicesQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
      };

      const mockUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table) => {
          if (table === 'services') return mockServicesQuery;
          if (table === 'users') return mockUsersQuery;
          return mockServicesQuery;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminServices({ status: 'active' });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0].seller?.user).toBeDefined();
      }
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Error' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminServices()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminServicesCount', () => {
    it('should return count of services', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 50, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminServicesCount('active');

      expect(result).toBe(50);
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Error' };

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ count: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminServicesCount()).rejects.toEqual(mockError);
    });
  });

  describe('getAdminReviews', () => {
    it('should return reviews with filters', async () => {
      const mockData = [
        {
          id: 'review-1',
          rating: 5,
          content: 'Great!',
          buyer: { id: 'buyer-1', name: 'Buyer', email: 'buyer@test.com' },
          seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com' },
          service: { id: 'service-1', title: 'Service' },
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getAdminReviews({ rating: 5, searchQuery: 'Great' });

      expect(result).toEqual(mockData);
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Error' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getAdminReviews()).rejects.toEqual(mockError);
    });
  });

  describe('getServiceRevisions', () => {
    it('should return service revisions with user info', async () => {
      const mockRevisions = [
        {
          id: 'revision-1',
          status: 'pending',
          service: {
            id: 'service-1',
            title: 'Service',
            status: 'active',
            seller_id: 'seller-1',
          },
          seller: {
            id: 'seller-1',
            business_name: 'Business',
            user_id: 'user-1',
          },
        },
      ];

      const mockUsers = [{ id: 'user-1', name: 'User', email: 'user@test.com' }];

      const mockRevisionsQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockRevisions, error: null }),
      };

      const mockUsersQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table) => {
          if (table === 'service_revisions') return mockRevisionsQuery;
          if (table === 'users') return mockUsersQuery;
          return mockRevisionsQuery;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getServiceRevisions({ status: 'pending' });

      expect(result).toBeDefined();
      expect(result[0].seller?.user).toBeDefined();
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Error' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getServiceRevisions()).rejects.toEqual(mockError);
    });
  });

  describe('getServiceRevisionsCount', () => {
    it('should return count of revisions', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getServiceRevisionsCount('pending');

      expect(result).toBe(10);
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Error' };

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ count: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getServiceRevisionsCount()).rejects.toEqual(mockError);
    });
  });

  describe('approveServiceRevision', () => {
    it('should approve a service revision', async () => {
      const mockRpc = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(createClient).mockReturnValue({
        rpc: mockRpc,
      } as unknown as ReturnType<typeof createClient>);

      await approveServiceRevision('revision-1');

      expect(mockRpc).toHaveBeenCalledWith('approve_service_revision', {
        revision_id_param: 'revision-1',
      });
    });

    it('should throw error on RPC failure', async () => {
      const mockError = { message: 'RPC failed' };
      const mockRpc = vi.fn().mockResolvedValue({ error: mockError });

      vi.mocked(createClient).mockReturnValue({
        rpc: mockRpc,
      } as unknown as ReturnType<typeof createClient>);

      await expect(approveServiceRevision('revision-1')).rejects.toEqual(mockError);
    });
  });

  describe('rejectServiceRevision', () => {
    it('should reject a service revision with admin note', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await rejectServiceRevision('revision-1', 'Needs improvement');

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'rejected',
          admin_note: 'Needs improvement',
        })
      );
    });

    it('should use default message when admin note not provided', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await rejectServiceRevision('revision-1');

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          admin_note: '수정 요청이 반려되었습니다.',
        })
      );
    });

    it('should throw error on update failure', async () => {
      const mockError = { message: 'Update failed' };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(rejectServiceRevision('revision-1')).rejects.toEqual(mockError);
    });
  });

  describe('getServiceRevisionDetail', () => {
    it('should return detailed revision with categories', async () => {
      const mockRevision = {
        id: 'revision-1',
        service_id: 'service-1',
        seller_id: 'seller-1',
        title: 'Revised Service',
      };

      const mockService = {
        id: 'service-1',
        title: 'Original Service',
      };

      const mockServiceCategoryLinks = [{ category_id: 'cat-1' }];
      const mockRevisionCategoryLinks = [{ category_id: 'cat-2' }];

      const mockCategories = [
        { id: 'cat-1', name: 'Category 1' },
        { id: 'cat-2', name: 'Category 2' },
      ];

      const mockSeller = {
        id: 'seller-1',
        business_name: 'Business',
        user_id: 'user-1',
      };

      const mockUser = {
        id: 'user-1',
        name: 'User',
        email: 'user@test.com',
      };

      let callIndex = 0;
      const mockQueries = {
        revisionQuery: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockRevision, error: null }),
        },
        serviceQuery: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockService, error: null }),
        },
        serviceCategoriesQuery: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: mockServiceCategoryLinks, error: null }),
        },
        revisionCategoriesQuery: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: mockRevisionCategoryLinks,
            error: null,
          }),
        },
        categoriesQuery1: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [mockCategories[0]], error: null }),
        },
        categoriesQuery2: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [mockCategories[1]], error: null }),
        },
        sellerQuery: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockSeller, error: null }),
        },
        userQuery: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
        },
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn((table) => {
          if (table === 'service_revisions') return mockQueries.revisionQuery;
          if (table === 'services') return mockQueries.serviceQuery;
          if (table === 'service_categories') return mockQueries.serviceCategoriesQuery;
          if (table === 'service_revision_categories') return mockQueries.revisionCategoriesQuery;
          if (table === 'categories') {
            callIndex++;
            if (callIndex === 1) return mockQueries.categoriesQuery1;
            return mockQueries.categoriesQuery2;
          }
          if (table === 'sellers') return mockQueries.sellerQuery;
          if (table === 'users') return mockQueries.userQuery;
          return mockQueries.revisionQuery;
        }),
      } as unknown as ReturnType<typeof createClient>);

      const result = await getServiceRevisionDetail('revision-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('revision-1');
      expect(result.service).toBeDefined();
      expect(result.seller).toBeDefined();
      expect(result.revision_categories).toBeDefined();
    });

    it('should throw error on query failure', async () => {
      const mockError = { message: 'Not found' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => mockQuery),
      } as unknown as ReturnType<typeof createClient>);

      await expect(getServiceRevisionDetail('invalid-id')).rejects.toEqual(mockError);
    });
  });
});
