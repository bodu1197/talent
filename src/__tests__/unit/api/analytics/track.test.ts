import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/analytics/track/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
};

const mockServiceSupabase = {
  from: vi.fn(() => mockServiceSupabase),
  insert: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
  createServiceRoleClient: vi.fn(() => mockServiceSupabase),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Analytics Track API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/analytics/track', () => {
    it('should track page view for anonymous user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should track page view for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/services', referrer: 'https://google.com' }),
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 if path is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Path is required');
    });

    it('should detect mobile device', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Safari/605.1.15',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockServiceSupabase.from).toHaveBeenCalledWith('page_views');
    });

    it('should detect tablet device', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          'user-agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) Safari/605.1.15',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should detect bot', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should get client IP from x-forwarded-for header', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'user-agent': 'Chrome/120.0.0.0',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle database errors silently', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          'user-agent': 'Chrome/120.0.0.0',
        },
      });

      // Should still return success even on DB error
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should set session cookie', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockServiceSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ path: '/' }),
        headers: {
          'user-agent': 'Chrome/120.0.0.0',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.cookies.get('analytics_session')).toBeDefined();
    });
  });
});
