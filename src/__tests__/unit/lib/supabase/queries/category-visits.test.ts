import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentVisitedCategories } from '@/lib/supabase/queries/category-visits';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Category Visits Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecentVisitedCategories', () => {
    it('should return empty array if user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await getRecentVisitedCategories();

      expect(result).toEqual([]);
    });

    it('should return grouped category visits', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockVisits = [
        {
          category_id: 'cat-1',
          category_name: 'Category 1',
          category_slug: 'category-1',
          visited_at: '2024-01-03T10:00:00Z',
        },
        {
          category_id: 'cat-1',
          category_name: 'Category 1',
          category_slug: 'category-1',
          visited_at: '2024-01-02T10:00:00Z',
        },
        {
          category_id: 'cat-2',
          category_name: 'Category 2',
          category_slug: 'category-2',
          visited_at: '2024-01-01T10:00:00Z',
        },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockVisits, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getRecentVisitedCategories();

      expect(result).toHaveLength(2);
      // Category 1 should be first (most recent) with count 2
      expect(result[0].category_id).toBe('cat-1');
      expect(result[0].visit_count).toBe(2);
      // Category 2 should be second with count 1
      expect(result[1].category_id).toBe('cat-2');
      expect(result[1].visit_count).toBe(1);
    });

    it('should return empty array on database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getRecentVisitedCategories();

      expect(result).toEqual([]);
    });

    it('should return empty array when no visits', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getRecentVisitedCategories();

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockVisits = Array.from({ length: 15 }, (_, i) => ({
        category_id: `cat-${i}`,
        category_name: `Category ${i}`,
        category_slug: `category-${i}`,
        visited_at: new Date(Date.now() - i * 86400000).toISOString(),
      }));

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockVisits, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getRecentVisitedCategories(5);

      expect(result).toHaveLength(5);
    });
  });
});
