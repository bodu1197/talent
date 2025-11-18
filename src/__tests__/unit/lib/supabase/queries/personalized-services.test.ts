import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPersonalizedServicesByInterest } from "@/lib/supabase/queries/personalized-services";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server");
vi.mock("@/lib/logger");

describe("Supabase Queries - Personalized Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPersonalizedServicesByInterest", () => {
    it("should return empty array when user is not authenticated", async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: null }),
        },
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getPersonalizedServicesByInterest();

      expect(result).toEqual([]);
    });

    it("should return empty array when no category visits found", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockAuthQuery = {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      };

      const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });

      vi.mocked(createClient).mockResolvedValue({
        auth: mockAuthQuery,
        rpc: mockRpc,
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getPersonalizedServicesByInterest();

      expect(result).toEqual([]);
      expect(mockRpc).toHaveBeenCalledWith("get_recent_category_visits", {
        p_user_id: "user-123",
        p_limit: 3,
      });
    });

    it("should return empty array when RPC returns error", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };
      const mockError = { message: "RPC error" };

      const mockAuthQuery = {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      };

      const mockRpc = vi
        .fn()
        .mockResolvedValue({ data: null, error: mockError });

      vi.mocked(createClient).mockResolvedValue({
        auth: mockAuthQuery,
        rpc: mockRpc,
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getPersonalizedServicesByInterest();

      expect(result).toEqual([]);
    });

    it("should return personalized services for level 3 category", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockTopCategories = [
        {
          category_id: "cat-3",
          category_name: "Sub Category",
          category_slug: "sub-category",
          visit_count: 5,
        },
      ];

      const mockCategoryInfo = {
        id: "cat-3",
        name: "Sub Category",
        slug: "sub-category",
        level: 3,
        parent_id: "cat-2",
      };

      const mockParent2nd = {
        id: "cat-2",
        parent_id: "cat-1",
      };

      const mockTopLevelCategory = {
        id: "cat-1",
        name: "Top Level",
        slug: "top-level",
        level: 1,
        parent_id: null,
      };

      const mockLevel2Categories = [{ id: "cat-2" }];
      const mockLevel3Categories = [{ id: "cat-3" }];

      const mockAdvertising: any[] = [];

      const mockServices = [
        {
          id: "service-1",
          title: "Service 1",
          description: "Description",
          price: 10000,
          thumbnail_url: "thumb.jpg",
          orders_count: 5,
          seller: [
            {
              id: "seller-1",
              business_name: "Business",
              is_verified: true,
            },
          ],
          service_categories: [{ category_id: "cat-3" }],
        },
      ];

      const mockReviews = [{ service_id: "service-1", rating: 5 }];

      let categoryCallCount = 0;

      const createMockQueries = () => ({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        rpc: vi
          .fn()
          .mockResolvedValue({ data: mockTopCategories, error: null }),
        from: vi.fn((table: string) => {
          if (table === "categories") {
            categoryCallCount++;
            if (categoryCallCount === 1) {
              // First call: get category info
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockCategoryInfo, error: null }),
              };
            } else if (categoryCallCount === 2) {
              // Second call: get parent (2nd level)
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockParent2nd, error: null }),
              };
            } else if (categoryCallCount === 3) {
              // Third call: get grandparent (top level)
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockTopLevelCategory,
                    error: null,
                  }),
              };
            } else if (categoryCallCount === 4) {
              // Fourth call: get level 2 categories
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockLevel2Categories,
                    error: null,
                  }),
              };
            } else if (categoryCallCount === 5) {
              // Fifth call: get level 3 categories
              return {
                select: vi.fn().mockReturnThis(),
                in: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockLevel3Categories,
                    error: null,
                  }),
              };
            }
          }

          if (table === "advertising_subscriptions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockAdvertising, error: null }),
            };
          }

          if (table === "services") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              limit: vi
                .fn()
                .mockResolvedValue({ data: mockServices, error: null }),
            };
          }

          if (table === "reviews") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
            };
          }

          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      });

      vi.mocked(createClient).mockResolvedValue(
        createMockQueries() as unknown as Awaited<
          ReturnType<typeof createClient>
        >,
      );

      const result = await getPersonalizedServicesByInterest();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].category_id).toBe("cat-1");
      expect(result[0].category_name).toBe("Top Level");
      expect(result[0].services).toBeDefined();
    });

    it("should return personalized services for level 2 category", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockTopCategories = [
        {
          category_id: "cat-2",
          category_name: "Mid Category",
          category_slug: "mid-category",
          visit_count: 3,
        },
      ];

      const mockCategoryInfo = {
        id: "cat-2",
        name: "Mid Category",
        slug: "mid-category",
        level: 2,
        parent_id: "cat-1",
      };

      const mockTopLevelCategory = {
        id: "cat-1",
        name: "Top Level",
        slug: "top-level",
        level: 1,
        parent_id: null,
      };

      const mockLevel2Categories = [{ id: "cat-2" }];
      const mockLevel3Categories = [{ id: "cat-3" }];
      const mockAdvertising: any[] = [];
      const mockServices: any[] = [];

      let categoryCallCount = 0;

      const createMockQueries = () => ({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        rpc: vi
          .fn()
          .mockResolvedValue({ data: mockTopCategories, error: null }),
        from: vi.fn((table: string) => {
          if (table === "categories") {
            categoryCallCount++;
            if (categoryCallCount === 1) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockCategoryInfo, error: null }),
              };
            } else if (categoryCallCount === 2) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockTopLevelCategory,
                    error: null,
                  }),
              };
            } else if (categoryCallCount === 3) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockLevel2Categories,
                    error: null,
                  }),
              };
            } else if (categoryCallCount === 4) {
              return {
                select: vi.fn().mockReturnThis(),
                in: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockLevel3Categories,
                    error: null,
                  }),
              };
            }
          }

          if (table === "advertising_subscriptions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockAdvertising, error: null }),
            };
          }

          if (table === "services") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              limit: vi
                .fn()
                .mockResolvedValue({ data: mockServices, error: null }),
            };
          }

          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      });

      vi.mocked(createClient).mockResolvedValue(
        createMockQueries() as unknown as Awaited<
          ReturnType<typeof createClient>
        >,
      );

      const result = await getPersonalizedServicesByInterest();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return personalized services for level 1 category", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockTopCategories = [
        {
          category_id: "cat-1",
          category_name: "Top Category",
          category_slug: "top-category",
          visit_count: 10,
        },
      ];

      const mockCategoryInfo = {
        id: "cat-1",
        name: "Top Category",
        slug: "top-category",
        level: 1,
        parent_id: null,
      };

      const mockLevel2Categories = [{ id: "cat-2" }];
      const mockLevel3Categories = [{ id: "cat-3" }];
      const mockAdvertising: any[] = [];
      const mockServices: any[] = [];

      let categoryCallCount = 0;

      const createMockQueries = () => ({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        rpc: vi
          .fn()
          .mockResolvedValue({ data: mockTopCategories, error: null }),
        from: vi.fn((table: string) => {
          if (table === "categories") {
            categoryCallCount++;
            if (categoryCallCount === 1) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockCategoryInfo, error: null }),
              };
            } else if (categoryCallCount === 2) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockLevel2Categories,
                    error: null,
                  }),
              };
            } else if (categoryCallCount === 3) {
              return {
                select: vi.fn().mockReturnThis(),
                in: vi
                  .fn()
                  .mockResolvedValue({
                    data: mockLevel3Categories,
                    error: null,
                  }),
              };
            }
          }

          if (table === "advertising_subscriptions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockAdvertising, error: null }),
            };
          }

          if (table === "services") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              limit: vi
                .fn()
                .mockResolvedValue({ data: mockServices, error: null }),
            };
          }

          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      });

      vi.mocked(createClient).mockResolvedValue(
        createMockQueries() as unknown as Awaited<
          ReturnType<typeof createClient>
        >,
      );

      const result = await getPersonalizedServicesByInterest();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle services with advertising", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockTopCategories = [
        {
          category_id: "cat-1",
          category_name: "Category",
          category_slug: "category",
          visit_count: 5,
        },
      ];

      const mockCategoryInfo = {
        id: "cat-1",
        name: "Category",
        slug: "category",
        level: 1,
        parent_id: null,
      };

      const mockAdvertising = [{ service_id: "service-1" }];

      const mockServices = [
        {
          id: "service-1",
          title: "Advertised Service",
          description: "Desc",
          price: 10000,
          thumbnail_url: "thumb.jpg",
          orders_count: 10,
          seller: [
            { id: "seller-1", business_name: "Business", is_verified: true },
          ],
          service_categories: [{ category_id: "cat-1" }],
        },
        {
          id: "service-2",
          title: "Regular Service",
          description: "Desc",
          price: 20000,
          thumbnail_url: "thumb2.jpg",
          orders_count: 5,
          seller: [
            { id: "seller-2", business_name: "Business 2", is_verified: false },
          ],
          service_categories: [{ category_id: "cat-1" }],
        },
      ];

      const mockReviews: any[] = [];

      let categoryCallCount = 0;

      const createMockQueries = () => ({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        rpc: vi
          .fn()
          .mockResolvedValue({ data: mockTopCategories, error: null }),
        from: vi.fn((table: string) => {
          if (table === "categories") {
            categoryCallCount++;
            if (categoryCallCount === 1) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockCategoryInfo, error: null }),
              };
            } else if (categoryCallCount === 2) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              };
            }
          }

          if (table === "advertising_subscriptions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi
                .fn()
                .mockResolvedValue({ data: mockAdvertising, error: null }),
            };
          }

          if (table === "services") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              limit: vi
                .fn()
                .mockResolvedValue({ data: mockServices, error: null }),
            };
          }

          if (table === "reviews") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
            };
          }

          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      });

      vi.mocked(createClient).mockResolvedValue(
        createMockQueries() as unknown as Awaited<
          ReturnType<typeof createClient>
        >,
      );

      const result = await getPersonalizedServicesByInterest();

      expect(result).toBeDefined();
      expect(result[0].services.length).toBeGreaterThan(0);
    });

    it("should handle errors gracefully and return empty array", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockAuthQuery = {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      };

      const mockRpc = vi.fn().mockRejectedValue(new Error("Unexpected error"));

      vi.mocked(createClient).mockResolvedValue({
        auth: mockAuthQuery,
        rpc: mockRpc,
      } as unknown as Awaited<ReturnType<typeof createClient>>);

      const result = await getPersonalizedServicesByInterest();

      expect(result).toEqual([]);
    });

    it("should return empty services when category info not found", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockTopCategories = [
        {
          category_id: "cat-1",
          category_name: "Category",
          category_slug: "category",
          visit_count: 5,
        },
      ];

      const createMockQueries = () => ({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        rpc: vi
          .fn()
          .mockResolvedValue({ data: mockTopCategories, error: null }),
        from: vi.fn((table: string) => {
          if (table === "categories") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
          }

          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      });

      vi.mocked(createClient).mockResolvedValue(
        createMockQueries() as unknown as Awaited<
          ReturnType<typeof createClient>
        >,
      );

      const result = await getPersonalizedServicesByInterest();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].services).toEqual([]);
    });

    it("should calculate rating and review_count for services", async () => {
      const mockUser = { id: "user-123", email: "user@test.com" };

      const mockTopCategories = [
        {
          category_id: "cat-1",
          category_name: "Category",
          category_slug: "category",
          visit_count: 5,
        },
      ];

      const mockCategoryInfo = {
        id: "cat-1",
        name: "Category",
        slug: "category",
        level: 1,
        parent_id: null,
      };

      const mockServices = [
        {
          id: "service-1",
          title: "Service 1",
          description: "Desc",
          price: 10000,
          thumbnail_url: "thumb.jpg",
          orders_count: 10,
          seller: [
            { id: "seller-1", business_name: "Business", is_verified: true },
          ],
          service_categories: [{ category_id: "cat-1" }],
        },
      ];

      const mockReviews = [
        { service_id: "service-1", rating: 5 },
        { service_id: "service-1", rating: 4 },
        { service_id: "service-1", rating: 3 },
      ];

      let categoryCallCount = 0;

      const createMockQueries = () => ({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        rpc: vi
          .fn()
          .mockResolvedValue({ data: mockTopCategories, error: null }),
        from: vi.fn((table: string) => {
          if (table === "categories") {
            categoryCallCount++;
            if (categoryCallCount === 1) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockCategoryInfo, error: null }),
              };
            } else if (categoryCallCount === 2) {
              return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              };
            }
          }

          if (table === "advertising_subscriptions") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
          }

          if (table === "services") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              limit: vi
                .fn()
                .mockResolvedValue({ data: mockServices, error: null }),
            };
          }

          if (table === "reviews") {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
            };
          }

          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      });

      vi.mocked(createClient).mockResolvedValue(
        createMockQueries() as unknown as Awaited<
          ReturnType<typeof createClient>
        >,
      );

      const result = await getPersonalizedServicesByInterest();

      expect(result).toBeDefined();
      expect(result[0].services[0].rating).toBe(4); // (5 + 4 + 3) / 3
      expect(result[0].services[0].review_count).toBe(3);
      expect(result[0].services[0].order_count).toBe(10);
    });
  });
});
