import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/notifications/read-all/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
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

describe('Notifications Read All API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/notifications/read-all', {
        method: 'PATCH',
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should mark all notifications as read', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      // Chain: update().eq().eq()
      mockSupabase.eq.mockReturnValueOnce(mockSupabase).mockResolvedValueOnce({ error: null });

      const request = new NextRequest('http://localhost:3000/api/notifications/read-all', {
        method: 'PATCH',
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalledWith({ is_read: true });
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockResolvedValueOnce({ error: { message: 'Update failed' } });

      const request = new NextRequest('http://localhost:3000/api/notifications/read-all', {
        method: 'PATCH',
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('알림 읽음 처리에 실패했습니다');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/notifications/read-all', {
        method: 'PATCH',
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });
  });
});
