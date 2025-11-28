import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAdminAuth } from '@/lib/admin/auth';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Admin Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAdminAuth', () => {
    it('should return Unauthorized when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await checkAdminAuth();

      expect(result.isAdmin).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return Not an admin when user is not an admin', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await checkAdminAuth();

      expect(result.isAdmin).toBe(false);
      expect(result.error).toBe('Not an admin');
    });

    it('should return isAdmin true when user is an admin', async () => {
      const mockUser = { id: 'admin-1' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'admin-1', role: 'admin' },
        error: null,
      });

      const result = await checkAdminAuth();

      expect(result.isAdmin).toBe(true);
      expect(result.user?.id).toBe('admin-1');
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await checkAdminAuth();

      expect(result.isAdmin).toBe(false);
    });

    it('should handle auth errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      const result = await checkAdminAuth();

      expect(result.isAdmin).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });
});
