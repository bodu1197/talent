import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchAll, getRecommendedSearchTerms } from '@/lib/supabase/queries/search';

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

// Mock crypto shuffle to make tests deterministic
vi.mock('@/lib/utils/crypto-shuffle', () => ({
  cryptoShuffleArray: vi.fn((arr) => arr),
}));

describe('search queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchAll', () => {
    it('should search for services, experts, and portfolios', async () => {
      // Mock advertising subscriptions query
      const mockAdQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock services query
      const mockServicesQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'svc-1',
              title: 'AI Design',
              description: 'Test',
              price: 100,
              thumbnail_url: null,
              orders_count: 5,
              seller: null,
            },
          ],
          error: null,
        }),
      };

      // Mock experts query
      const mockExpertsQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'exp-1',
              user_id: 'user-1',
              business_name: 'AI Studio',
              display_name: 'John',
              profile_image: null,
              bio: 'Expert',
              is_verified: true,
              created_at: '2024-01-01',
            },
          ],
          error: null,
        }),
      };

      // Mock portfolios query
      const mockPortfoliosQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      // Mock reviews query for rating calculation
      const mockReviewsQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock services count query for expert stats
      const mockCountQuery = {
        select: vi.fn().mockResolvedValue({ count: 0, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      // Setup mock to return different queries based on table name
      mockSupabase.from.mockImplementation((table: string) => {
        switch (table) {
          case 'advertising_subscriptions':
            return mockAdQuery;
          case 'services':
            return mockServicesQuery;
          case 'seller_profiles':
            return mockExpertsQuery;
          case 'seller_portfolio':
            return mockPortfoliosQuery;
          case 'reviews':
            return mockReviewsQuery;
          default:
            return mockCountQuery;
        }
      });

      const result = await searchAll('design');

      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('experts');
      expect(result).toHaveProperty('portfolios');
      expect(Array.isArray(result.services)).toBe(true);
      expect(Array.isArray(result.experts)).toBe(true);
      expect(Array.isArray(result.portfolios)).toBe(true);
    });

    it('should return empty results on error', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await searchAll('test');

      expect(result).toEqual({
        services: [],
        experts: [],
        portfolios: [],
      });
    });
  });

  describe('getRecommendedSearchTerms', () => {
    it('should return recommended search terms based on category clicks', async () => {
      const mockCategoryClicks = [
        {
          category_id: 'cat-1',
          categories: [{ id: 'cat-1', name: 'AI Art', slug: 'ai-art', level: 3 }],
        },
        {
          category_id: 'cat-1',
          categories: [{ id: 'cat-1', name: 'AI Art', slug: 'ai-art', level: 3 }],
        },
        {
          category_id: 'cat-2',
          categories: [{ id: 'cat-2', name: 'AI Video', slug: 'ai-video', level: 3 }],
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockCategoryClicks, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getRecommendedSearchTerms(10);

      expect(mockSupabase.from).toHaveBeenCalledWith('category_visits');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no category clicks', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getRecommendedSearchTerms();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Query failed')),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getRecommendedSearchTerms();

      expect(result).toEqual([]);
    });

    it('should filter only level 3 categories', async () => {
      const mockCategoryClicks = [
        {
          category_id: 'cat-1',
          categories: [{ id: 'cat-1', name: 'Design', slug: 'design', level: 1 }],
        },
        {
          category_id: 'cat-2',
          categories: [{ id: 'cat-2', name: 'AI Art', slug: 'ai-art', level: 3 }],
        },
        {
          category_id: 'cat-3',
          categories: [{ id: 'cat-3', name: 'Graphics', slug: 'graphics', level: 2 }],
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockCategoryClicks, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getRecommendedSearchTerms();

      // Should only include level 3 categories
      expect(result.every((r: { name: string }) => r.name !== 'Design')).toBe(true);
      expect(result.every((r: { name: string }) => r.name !== 'Graphics')).toBe(true);
    });
  });
});
