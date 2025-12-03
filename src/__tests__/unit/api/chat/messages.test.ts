import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/chat/messages/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  neq: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  single: vi.fn(),
  maybeSingle: vi.fn(),
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

describe('Chat Messages API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/chat/messages', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages?room_id=123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if room_id is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('room_id is required');
    });

    it('should return messages for valid room_id', async () => {
      const mockUser = { id: 'user-1' };
      const mockMessages = [
        {
          id: 'msg-1',
          room_id: 'room-1',
          sender_id: 'user-1',
          message: 'Hello',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          room_id: 'room-1',
          sender_id: 'user-2',
          message: 'Hi',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.order.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      mockSupabase.maybeSingle.mockResolvedValue({
        data: { display_name: 'Test User', profile_image: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages?room_id=room-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.messages).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages?room_id=room-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });
  });

  describe('POST /api/chat/messages', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1', message: 'Hello' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if room_id is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('room_id is required');
    });

    it('should return 400 if message and file are both missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('message or file is required');
    });

    it('should create message successfully', async () => {
      const mockUser = { id: 'user-1' };
      const mockNewMessage = {
        id: 'msg-1',
        room_id: 'room-1',
        sender_id: 'user-1',
        message: 'Hello',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockNewMessage,
        error: null,
      });

      mockSupabase.maybeSingle.mockResolvedValue({
        data: { display_name: 'Test User', profile_image: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1', message: 'Hello' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
    });

    it('should handle file uploads', async () => {
      const mockUser = { id: 'user-1' };
      const mockNewMessage = {
        id: 'msg-1',
        room_id: 'room-1',
        sender_id: 'user-1',
        message: '',
        file_url: 'https://example.com/file.pdf',
        file_name: 'file.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockNewMessage,
        error: null,
      });

      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          room_id: 'room-1',
          file_url: 'https://example.com/file.pdf',
          file_name: 'file.pdf',
          file_size: 1024,
          file_type: 'application/pdf',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message.file_url).toBeDefined();
    });
  });
});
