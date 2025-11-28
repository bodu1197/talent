import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/notifications/[id]/read/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
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

describe('Notification Read API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH /api/notifications/[id]/read', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/notifications/notif-1/read', {
        method: 'PATCH',
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should mark notification as read successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      // Two eq calls: eq('id', id).eq('user_id', user.id)
      updateChain.eq.mockReturnValueOnce(updateChain).mockResolvedValueOnce({ error: null });

      mockSupabase.from.mockReturnValue(updateChain);

      const request = new NextRequest('http://localhost:3000/api/notifications/notif-1/read', {
        method: 'PATCH',
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      updateChain.eq
        .mockReturnValueOnce(updateChain)
        .mockResolvedValueOnce({ error: { message: 'DB error' } });

      mockSupabase.from.mockReturnValue(updateChain);

      const request = new NextRequest('http://localhost:3000/api/notifications/notif-1/read', {
        method: 'PATCH',
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('알림 읽음 처리에 실패했습니다');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/notifications/notif-1/read', {
        method: 'PATCH',
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });
  });
});
