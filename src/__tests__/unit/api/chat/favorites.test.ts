import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/favorites/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  maybeSingle: vi.fn(),
  delete: vi.fn(() => mockSupabase),
  insert: vi.fn(),
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

describe('Chat Favorites API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain methods
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
  });

  describe('POST /api/chat/favorites', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest('http://localhost:3000/api/chat/favorites', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if room_id is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const request = new NextRequest('http://localhost:3000/api/chat/favorites', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('room_id is required');
    });

    it('should add favorite when not exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockSupabase.maybeSingle.mockResolvedValue({ data: null });
      mockSupabase.insert.mockResolvedValue({ error: null });

      const request = new NextRequest('http://localhost:3000/api/chat/favorites', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_favorite).toBe(true);
    });

    it('should remove favorite when exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockSupabase.maybeSingle.mockResolvedValue({
        data: { id: 'favorite-1' },
      });

      // Setup delete chain - the delete().eq() chain returns the final result
      const mockDeleteChain = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.delete.mockReturnValue(mockDeleteChain);

      const request = new NextRequest('http://localhost:3000/api/chat/favorites', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_favorite).toBe(false);
    });

    it('should handle insert error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockSupabase.maybeSingle.mockResolvedValue({ data: null });
      mockSupabase.insert.mockResolvedValue({
        error: { message: 'Insert failed' },
      });

      const request = new NextRequest('http://localhost:3000/api/chat/favorites', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
