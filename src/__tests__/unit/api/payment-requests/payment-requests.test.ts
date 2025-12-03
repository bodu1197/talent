import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/payment-requests/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  single: vi.fn(),
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

describe('Payment Requests API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/payment-requests', () => {
    it('should return 401 if not authenticated', async () => {
      // @ts-expect-error - Mock structure type mismatch
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/payment-requests', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1', title: 'Test', amount: 10000 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 if required fields are missing', async () => {
      // @ts-expect-error - Mock structure type mismatch
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/payment-requests', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 if amount is less than 1000', async () => {
      // @ts-expect-error - Mock structure type mismatch
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/payment-requests', {
        method: 'POST',
        body: JSON.stringify({ room_id: 'room-1', title: 'Test', amount: 500 }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('1,000');
    });
  });

  describe('GET /api/payment-requests', () => {
    it('should return 401 if not authenticated', async () => {
      // @ts-expect-error - Mock structure type mismatch
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/payment-requests?room_id=room-1');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 if room_id is missing', async () => {
      // @ts-expect-error - Mock structure type mismatch
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/payment-requests');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should return payment requests list', async () => {
      // @ts-expect-error - Mock structure type mismatch
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      // @ts-expect-error - Mock structure type mismatch
      mockSupabase.order.mockResolvedValue({
        // @ts-expect-error - Mock structure type mismatch
        data: [{ id: 'pr-1', amount: 10000, status: 'pending' }],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/payment-requests?room_id=room-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.payment_requests).toBeDefined();
    });
  });
});
