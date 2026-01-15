import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/users/profile/route';

// Mock Supabase clients
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
};

const mockServiceClient = {
  from: vi.fn(() => mockServiceClient),
  update: vi.fn(() => mockServiceClient),
  eq: vi.fn(() => mockServiceClient),
  select: vi.fn(() => mockServiceClient),
  single: vi.fn(),
  auth: {
    admin: {
      updateUserById: vi.fn().mockResolvedValue({ error: null }),
    },
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockServiceClient),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Users Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceClient.from.mockReturnValue(mockServiceClient);
    mockServiceClient.update.mockReturnValue(mockServiceClient);
    mockServiceClient.eq.mockReturnValue(mockServiceClient);
    mockServiceClient.select.mockReturnValue(mockServiceClient);
  });

  describe('PATCH /api/users/profile', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('로그인이 필요합니다');
    });

    it('should return 400 if name is not provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });

    it('should update profile successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockServiceClient.single.mockResolvedValue({
        data: { id: 'profile-1', name: 'New Name', profile_image: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe('New Name');
    });

    it('should update profile with image', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockServiceClient.single.mockResolvedValue({
        data: {
          id: 'profile-1',
          name: 'New Name',
          profile_image: 'https://example.com/image.jpg',
        },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'New Name',
          profile_image: 'https://example.com/image.jpg',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.profile_image).toBe('https://example.com/image.jpg');
    });

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      mockServiceClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed', code: 'ERROR', details: '' },
      });

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Update failed');
    });

    it('should handle invalid JSON body', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        body: 'invalid json',
      });

      const response = await PATCH(request);

      expect(response.status).toBe(500);
    });
  });
});
