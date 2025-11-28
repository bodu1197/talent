import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/advertising/track/impression/route';

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

describe('Advertising Impression Track API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/advertising/track/impression', () => {
    it('should return 400 if serviceId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/advertising/track/impression', {
        method: 'POST',
        body: JSON.stringify({ categoryId: 'cat-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('serviceId and categoryId are required');
    });

    it('should return 400 if categoryId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/advertising/track/impression', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('serviceId and categoryId are required');
    });

    it('should return tracked=false when no active subscription', async () => {
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/advertising/track/impression', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1', categoryId: 'cat-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tracked).toBe(false);
    });

    it('should track impression and update subscription stats', async () => {
      const mockSubscription = {
        id: 'sub-1',
        service_id: 'service-1',
        total_impressions: 50,
      };

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
          // Insert impression
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        } else {
          // Update subscription
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/advertising/track/impression', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1', categoryId: 'cat-1', position: 2, page: 1 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.tracked).toBe(true);
      expect(data.impressionCount).toBe(51);
    });

    it('should handle impression insert error', async () => {
      const mockSubscription = {
        id: 'sub-1',
        service_id: 'service-1',
        total_impressions: 50,
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
        } else {
          return {
            insert: vi.fn().mockResolvedValue({ error: { message: 'Insert error' } }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/advertising/track/impression', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1', categoryId: 'cat-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create impression');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/advertising/track/impression', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1', categoryId: 'cat-1' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
