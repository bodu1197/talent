import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/advertising/track/click/route';

// Mock createServiceRoleClient
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Advertising Click Track API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/advertising/track/click', () => {
    it('should return 400 if serviceId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/advertising/track/click', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('serviceId is required');
    });

    it('should return tracked=false when no active subscription', async () => {
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/advertising/track/click', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tracked).toBe(false);
    });

    it('should track click and update subscription stats', async () => {
      const mockSubscription = {
        id: 'sub-1',
        service_id: 'service-1',
        total_clicks: 5,
        total_impressions: 100,
      };

      const mockImpression = { id: 'imp-1' };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Subscription lookup
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockSubscription }),
          };
        } else if (callCount === 2) {
          // Recent impression lookup
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockImpression }),
          };
        } else if (callCount === 3) {
          // Update impression
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        } else {
          // Update subscription
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/advertising/track/click', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tracked).toBe(true);
      expect(data.clickCount).toBe(6);
    });

    it('should handle update error', async () => {
      const mockSubscription = {
        id: 'sub-1',
        service_id: 'service-1',
        total_clicks: 5,
        total_impressions: 100,
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockSubscription }),
          };
        } else if (callCount === 2) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          };
        } else {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: { message: 'Update error' } }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/advertising/track/click', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update click stats');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/advertising/track/click', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
