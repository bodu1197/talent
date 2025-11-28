import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/analytics/devices/route';

// Mock admin auth
vi.mock('@/lib/admin/auth', () => ({
  checkAdminAuth: vi.fn(),
}));

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  gte: vi.fn(() => mockSupabase),
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

import { checkAdminAuth } from '@/lib/admin/auth';

describe('Admin Device Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/analytics/devices', () => {
    it('should return 401 if not authenticated', async () => {
      vi.mocked(checkAdminAuth).mockResolvedValue({
        isAdmin: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/analytics/devices');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return device stats', async () => {
      vi.mocked(checkAdminAuth).mockResolvedValue({
        isAdmin: true,
        userId: 'admin-1',
      });

      const mockDeviceData = [
        { device_type: 'desktop' },
        { device_type: 'desktop' },
        { device_type: 'mobile' },
        { device_type: 'tablet' },
        { device_type: 'bot' },
      ];

      mockSupabase.gte.mockResolvedValue({
        data: mockDeviceData,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/analytics/devices');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.desktop).toBe(2);
      expect(data.mobile).toBe(1);
      expect(data.tablet).toBe(1);
      expect(data.bot).toBe(1);
      expect(data.total).toBe(4); // bots excluded from total
    });

    it('should handle different periods', async () => {
      vi.mocked(checkAdminAuth).mockResolvedValue({
        isAdmin: true,
        userId: 'admin-1',
      });

      mockSupabase.gte.mockResolvedValue({
        data: [],
        error: null,
      });

      const periods = ['hour', 'day', 'month', 'year'];

      for (const period of periods) {
        const request = new NextRequest(`http://localhost:3000/api/admin/analytics/devices?period=${period}`);
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.period).toBe(period);
      }
    });

    it('should handle null device types as desktop', async () => {
      vi.mocked(checkAdminAuth).mockResolvedValue({
        isAdmin: true,
        userId: 'admin-1',
      });

      const mockDeviceData = [
        { device_type: null },
        { device_type: 'Desktop' },
        { device_type: 'MOBILE' },
      ];

      mockSupabase.gte.mockResolvedValue({
        data: mockDeviceData,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/analytics/devices');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.desktop).toBe(2); // null + 'Desktop'
      expect(data.mobile).toBe(1);
    });

    it('should handle database errors', async () => {
      vi.mocked(checkAdminAuth).mockResolvedValue({
        isAdmin: true,
        userId: 'admin-1',
      });

      mockSupabase.gte.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/admin/analytics/devices');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch device stats');
    });
  });
});
