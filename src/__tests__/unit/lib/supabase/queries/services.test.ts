import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSellerServices,
  getServiceById,
  getSellerServicesCount,
  getServicesByCategory,
  getActiveServices,
} from "@/lib/supabase/queries/services";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/server");
vi.mock("@/lib/supabase/client");
vi.mock("@/lib/logger");

describe("Supabase Queries - Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSellerServices", () => {
    it("should return seller services without status filter", async () => {
      const mockData = [
        {
          id: "service-1",
          title: "Test Service",
          seller_id: "seller-123",
          status: "active",
          created_at: "2025-01-01T00:00:00Z",
          service_categories: [
            { category: { id: "cat-1", name: "Category 1" } },
          ],
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getSellerServices("seller-123");

      expect(result).toEqual(mockData);
      expect(mockQuery.eq).toHaveBeenCalledWith("seller_id", "seller-123");
    });

    it("should filter by status when provided", async () => {
      const mockData = [
        {
          id: "service-1",
          title: "Active Service",
          seller_id: "seller-123",
          status: "active",
          created_at: "2025-01-01T00:00:00Z",
          service_categories: [],
        },
      ];

      // Create a chainable query mock that works like Supabase
      const createChainableMock = () => {
        const mock = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
        };
        // Make each method return the same mock for chaining
        mock.select.mockReturnValue(mock);
        mock.eq.mockReturnValue(mock);
        mock.order.mockReturnValue(mock);
        return mock;
      };

      const mockQuery = createChainableMock();

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getSellerServices("seller-123", "active");

      expect(result).toEqual(mockData);
      expect(mockQuery.eq).toHaveBeenCalledWith("seller_id", "seller-123");
      expect(mockQuery.eq).toHaveBeenCalledWith("status", "active");
    });

    it('should not filter by status when status is "all"', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      await getSellerServices("seller-123", "all");

      // eq should only be called once for seller_id, not for status
      expect(mockQuery.eq).toHaveBeenCalledTimes(1);
      expect(mockQuery.eq).toHaveBeenCalledWith("seller_id", "seller-123");
    });

    it("should throw error on query failure", async () => {
      const mockError = { message: "Database error" };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      await expect(getSellerServices("seller-123")).rejects.toEqual(mockError);
    });
  });

  describe("getServiceById", () => {
    it("should return service with seller and category information", async () => {
      const mockService = {
        id: "service-1",
        title: "Test Service",
        seller: {
          id: "seller-1",
          business_name: "Test Business",
          user_id: "user-123",
        },
        service_categories: [
          { category: { id: "cat-1", name: "Category 1", slug: "cat-1" } },
        ],
      };

      const mockUser = {
        user_id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        profile_image: "profile.jpg",
      };

      const mockServiceQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockService, error: null }),
      };

      const mockUserQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "services") return mockServiceQuery;
          if (table === "profiles") return mockUserQuery;
          return mockServiceQuery;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getServiceById("service-1");

      expect(result).toBeDefined();
      expect(result.seller.user).toEqual({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        profile_image: "profile.jpg",
      });
    });

    it("should return service without user data if user query fails", async () => {
      const mockService = {
        id: "service-1",
        title: "Test Service",
        seller: {
          id: "seller-1",
          business_name: "Test Business",
          user_id: "user-123",
        },
        service_categories: [],
      };

      const mockServiceQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockService, error: null }),
      };

      const mockUserQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "services") return mockServiceQuery;
          if (table === "profiles") return mockUserQuery;
          return mockServiceQuery;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getServiceById("service-1");

      expect(result).toBeDefined();
      expect(result.seller.user).toBeUndefined();
    });

    it("should throw error on query failure", async () => {
      const mockError = { message: "Service not found" };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      await expect(getServiceById("service-1")).rejects.toEqual(mockError);
    });
  });

  describe("getSellerServicesCount", () => {
    it("should return count of seller services with status", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Chain the eq calls
      mockQuery.eq.mockImplementation((field) => {
        if (field === "seller_id") return mockQuery;
        if (field === "status") {
          return Promise.resolve({ count: 5, error: null });
        }
        return mockQuery;
      });

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getSellerServicesCount("seller-123", "active");

      expect(result).toBe(5);
    });

    it("should return 0 when no services found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockImplementation((field) => {
        if (field === "seller_id") return mockQuery;
        if (field === "status") {
          return Promise.resolve({ count: null, error: null });
        }
        return mockQuery;
      });

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getSellerServicesCount("seller-123", "active");

      expect(result).toBe(0);
    });

    it("should throw error on query failure", async () => {
      const mockError = { message: "Database error" };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockQuery.eq.mockImplementation((field) => {
        if (field === "seller_id") return mockQuery;
        if (field === "status") {
          return Promise.resolve({ count: null, error: mockError });
        }
        return mockQuery;
      });

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      await expect(
        getSellerServicesCount("seller-123", "active"),
      ).rejects.toEqual(mockError);
    });
  });

  describe("getServicesByCategory", () => {
    it("should return services for a 3rd level category", async () => {
      const mockCategory = { id: "cat-3", level: 3 };
      const mockServiceLinks = [
        { service_id: "service-1" },
        { service_id: "service-2" },
      ];
      const mockServices = [
        {
          id: "service-1",
          title: "Service 1",
          price: 10000,
          orders_count: 5,
          status: "active",
          seller: {
            id: "seller-1",
            business_name: "Business 1",
            user_id: "user-1",
            is_verified: true,
          },
          service_categories: [],
        },
      ];

      const mockQueries = {
        categories: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: mockCategory, error: null }),
        },
        service_categories: {
          select: vi.fn().mockReturnThis(),
          in: vi
            .fn()
            .mockResolvedValue({ data: mockServiceLinks, error: null }),
        },
        advertising_subscriptions: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
        services: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
        },
        reviews: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
        profiles: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "categories") return mockQueries.categories;
          if (table === "service_categories")
            return mockQueries.service_categories;
          if (table === "advertising_subscriptions")
            return mockQueries.advertising_subscriptions;
          if (table === "services") return mockQueries.services;
          if (table === "reviews") return mockQueries.reviews;
          if (table === "profiles") return mockQueries.profiles;
          return mockQueries.categories;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getServicesByCategory("cat-3", 100, true, 1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array when category not found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn(() => mockQuery),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getServicesByCategory("invalid-cat");

      expect(result).toEqual([]);
    });

    it("should use browser client when useAuth is false", async () => {
      const mockCategory = { id: "cat-1", level: 1 };

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
      };

      const mockServiceCategoriesQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(createBrowserClient).mockReturnValue({
        from: vi.fn((table) => {
          if (table === "categories") return mockCategoryQuery;
          if (table === "service_categories") return mockServiceCategoriesQuery;
          return mockCategoryQuery;
        }),
      } as unknown as ReturnType<typeof createBrowserClient>);

      const result = await getServicesByCategory("cat-1", 100, false, 1);

      expect(createBrowserClient).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should handle pagination correctly", async () => {
      const mockCategory = { id: "cat-1", level: 3 };
      const mockServiceLinks = Array.from({ length: 60 }, (_, i) => ({
        service_id: `service-${i}`,
      }));
      const mockServices = Array.from({ length: 60 }, (_, i) => ({
        id: `service-${i}`,
        title: `Service ${i}`,
        price: 10000,
        orders_count: 0,
        status: "active",
        seller: {
          id: "seller-1",
          business_name: "Business",
          user_id: "user-1",
          is_verified: true,
        },
        service_categories: [],
      }));

      const mockQueries = {
        categories: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: mockCategory, error: null }),
        },
        service_categories: {
          select: vi.fn().mockReturnThis(),
          in: vi
            .fn()
            .mockResolvedValue({ data: mockServiceLinks, error: null }),
        },
        advertising_subscriptions: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
        services: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
        },
        reviews: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
        profiles: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "categories") return mockQueries.categories;
          if (table === "service_categories")
            return mockQueries.service_categories;
          if (table === "advertising_subscriptions")
            return mockQueries.advertising_subscriptions;
          if (table === "services") return mockQueries.services;
          if (table === "reviews") return mockQueries.reviews;
          if (table === "profiles") return mockQueries.profiles;
          return mockQueries.categories;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      // Page 1 should have 28 items
      const page1 = await getServicesByCategory("cat-1", 100, true, 1);
      expect(page1.length).toBe(28);

      // Page 2 should have 28 items
      const page2 = await getServicesByCategory("cat-1", 100, true, 2);
      expect(page2.length).toBe(28);

      // Page 3 should have 4 items (60 - 28 - 28 = 4)
      const page3 = await getServicesByCategory("cat-1", 100, true, 3);
      expect(page3.length).toBe(4);
    });
  });

  describe("getActiveServices", () => {
    it("should return active services excluding AI category", async () => {
      const mockAiCategory = { id: "ai-cat-1" };
      const mockAiServiceLinks = [{ service_id: "ai-service-1" }];
      const mockServices = [
        {
          id: "service-1",
          title: "Regular Service",
          price: 10000,
          status: "active",
          orders_count: 5,
          seller: {
            id: "seller-1",
            business_name: "Business",
            user_id: "user-1",
            is_verified: true,
          },
          service_categories: [],
        },
      ];

      const mockQueries = {
        categories: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: mockAiCategory, error: null }),
        },
        service_categories: {
          select: vi.fn().mockReturnThis(),
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockAiServiceLinks, error: null }),
        },
        services: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
        },
        reviews: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "categories") return mockQueries.categories;
          if (table === "service_categories")
            return mockQueries.service_categories;
          if (table === "services") return mockQueries.services;
          if (table === "reviews") return mockQueries.reviews;
          return mockQueries.services;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getActiveServices(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return services when AI category does not exist", async () => {
      const mockServices = [
        {
          id: "service-1",
          title: "Service",
          price: 10000,
          orders_count: 0,
          status: "active",
          seller: {
            id: "seller-1",
            business_name: "Business",
            user_id: "user-1",
            is_verified: true,
          },
          service_categories: [],
        },
      ];

      const mockQueries = {
        categories: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
        services: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
        },
        reviews: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "categories") return mockQueries.categories;
          if (table === "services") return mockQueries.services;
          if (table === "reviews") return mockQueries.reviews;
          return mockQueries.services;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getActiveServices();

      expect(result).toBeDefined();
    });

    it("should throw error on query failure", async () => {
      const mockError = { message: "Database error" };

      const mockCategoriesQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockServicesQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "categories") return mockCategoriesQuery;
          if (table === "services") return mockServicesQuery;
          return mockServicesQuery;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      await expect(getActiveServices()).rejects.toEqual(mockError);
    });

    it("should add rating and review_count to services", async () => {
      const mockServices = [
        {
          id: "service-1",
          title: "Service",
          price: 10000,
          orders_count: 10,
          status: "active",
          seller: {
            id: "seller-1",
            business_name: "Business",
            user_id: "user-1",
            is_verified: true,
          },
          service_categories: [],
        },
      ];

      const mockReviews = [
        { service_id: "service-1", rating: 5 },
        { service_id: "service-1", rating: 4 },
      ];

      const mockQueries = {
        categories: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
        services: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
        },
        reviews: {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
        },
      };

      vi.mocked(createServerClient).mockResolvedValue({
        from: vi.fn((table) => {
          if (table === "categories") return mockQueries.categories;
          if (table === "services") return mockQueries.services;
          if (table === "reviews") return mockQueries.reviews;
          return mockQueries.services;
        }),
      } as unknown as Awaited<ReturnType<typeof createServerClient>>);

      const result = await getActiveServices();

      expect(result[0].rating).toBe(4.5); // (5 + 4) / 2
      expect(result[0].review_count).toBe(2);
      expect(result[0].order_count).toBe(10);
    });
  });
});
