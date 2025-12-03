import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllCategoriesTree,
  getTopLevelCategories,
  getCategoryBySlug,
  getCategoryPath,
} from '@/lib/categories';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');
  });

  describe('getAllCategoriesTree', () => {
    it('should return tree structure of categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Design', slug: 'design', parent_id: null, level: 1 },
        { id: 'cat-2', name: 'Logo', slug: 'logo', parent_id: 'cat-1', level: 2 },
        { id: 'cat-3', name: 'Development', slug: 'development', parent_id: null, level: 1 },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getAllCategoriesTree();

      expect(result).toHaveLength(2); // Two root categories
      expect(result[0].slug).toBe('design');
      expect(result[0].children).toBeDefined();
      expect(result[0].children![0].slug).toBe('logo');
    });

    it('should return empty array on error', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getAllCategoriesTree();

      expect(result).toEqual([]);
    });
  });

  describe('getTopLevelCategories', () => {
    it('should return top level categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Design', slug: 'design', parent_id: null, level: 1 },
        { id: 'cat-2', name: 'Development', slug: 'development', parent_id: null, level: 1 },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getTopLevelCategories();

      expect(result).toHaveLength(2);
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category with children', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Design',
        slug: 'design',
        parent_id: null,
        level: 1,
      };
      const mockChildren = [
        { id: 'cat-2', name: 'Logo', slug: 'logo', parent_id: 'cat-1', level: 2 },
      ];

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
          };
        } else {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockChildren, error: null }),
          };
        }
      });

      const result = await getCategoryBySlug('design');

      expect(result).toBeDefined();
      expect(result!.slug).toBe('design');
      expect(result!.children).toHaveLength(1);
    });

    it('should return null when category not found', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getCategoryBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getCategoryPath', () => {
    it('should return category path using RPC', async () => {
      const mockPath = [
        { id: 'cat-1', name: 'Design', slug: 'design', level: 1 },
        { id: 'cat-2', name: 'Logo', slug: 'logo', level: 2 },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockPath, error: null });

      const result = await getCategoryPath('cat-2');

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('design');
      expect(result[1].slug).toBe('logo');
    });

    it('should fallback to manual lookup on RPC error', async () => {
      const mockCategory1 = {
        id: 'cat-1',
        name: 'Design',
        slug: 'design',
        parent_id: null,
        level: 1,
      };
      const mockCategory2 = {
        id: 'cat-2',
        name: 'Logo',
        slug: 'logo',
        parent_id: 'cat-1',
        level: 2,
      };

      mockSupabase.rpc.mockResolvedValue({ data: null, error: { code: '42883' } });

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        let mockData = null;
        if (callCount === 1) {
          mockData = mockCategory2;
        } else if (callCount === 2) {
          mockData = mockCategory1;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        };
      });

      const result = await getCategoryPath('cat-2');

      expect(result).toHaveLength(2);
    });
  });
});
