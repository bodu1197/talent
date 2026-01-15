import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/chat/unread-count/route';

// Mock Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSupabase: Record<string, any> = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  neq: vi.fn(),
  in: vi.fn(() => mockSupabase),
  or: vi.fn(() => mockSupabase),
  limit: vi.fn(),
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

describe('Chat Unread Count API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
  });

  describe('GET /api/chat/unread-count', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest('http://localhost:3000/api/chat/unread-count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 0 when user has no rooms', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockSupabase.or.mockResolvedValue({ data: [] });

      const request = new NextRequest('http://localhost:3000/api/chat/unread-count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.unreadCount).toBe(0);
    });

    it('should count rooms with unread messages', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      // 1. First query (rooms)
      mockSupabase.or.mockResolvedValue({
        data: [{ id: 'room-1' }, { id: 'room-2' }],
      });

      // 2. Second query (messages)
      mockSupabase.neq.mockResolvedValue({
        data: [{ room_id: 'room-1' }, { room_id: 'room-1' }, { room_id: 'room-2' }],
      });

      const request = new NextRequest('http://localhost:3000/api/chat/unread-count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.unreadCount).toBe(2);
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockSupabase.or.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/chat/unread-count');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
