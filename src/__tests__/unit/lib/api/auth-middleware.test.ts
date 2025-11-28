import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withOptionalAuth } from '@/lib/api/auth-middleware';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withAuth', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const request = new NextRequest('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler with user when authenticated', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrappedHandler = withAuth(handler);

      const request = new NextRequest('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(handler).toHaveBeenCalledWith(request, mockUser);
    });

    it('should return 401 on auth error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      const handler = vi.fn();
      const wrappedHandler = withAuth(handler);

      const request = new NextRequest('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);

      expect(response.status).toBe(401);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('withOptionalAuth', () => {
    it('should call handler with null user when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ guest: true }));
      const wrappedHandler = withOptionalAuth(handler);

      const request = new NextRequest('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.guest).toBe(true);
      expect(handler).toHaveBeenCalledWith(request, null);
    });

    it('should call handler with user when authenticated', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ authenticated: true }));
      const wrappedHandler = withOptionalAuth(handler);

      const request = new NextRequest('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.authenticated).toBe(true);
      expect(handler).toHaveBeenCalledWith(request, mockUser);
    });
  });
});
