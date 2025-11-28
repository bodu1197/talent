import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/chat/search/route';

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

describe('Chat Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/chat/search', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/search?q=hello');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should return empty roomIds when no query', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/search');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roomIds).toEqual([]);
    });

    it('should return empty roomIds when user has no chat rooms', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: [] }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/chat/search?q=hello');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roomIds).toEqual([]);
    });

    it('should return matching roomIds', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockRooms = [{ id: 'room-1' }, { id: 'room-2' }];
      const mockMessages = [{ room_id: 'room-1' }, { room_id: 'room-1' }, { room_id: 'room-2' }];

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Chat rooms query
          return {
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockResolvedValue({ data: mockRooms }),
          };
        } else {
          // Messages query
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockResolvedValue({ data: mockMessages }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/chat/search?q=hello');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roomIds).toHaveLength(2);
      expect(data.roomIds).toContain('room-1');
      expect(data.roomIds).toContain('room-2');
    });

    it('should handle empty search results', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockRooms = [{ id: 'room-1' }];

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockResolvedValue({ data: mockRooms }),
          };
        } else {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockResolvedValue({ data: [] }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/chat/search?q=nonexistent');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roomIds).toEqual([]);
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/chat/search?q=hello');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('검색 중 오류가 발생했습니다');
    });
  });
});
