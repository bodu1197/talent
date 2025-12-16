import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/orders/[id]/revision/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Order Revision API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/orders/[id]/revision', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Please fix this' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should return 400 if reason is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(400);
      expect(data.error).toBe('수정 요청 사유가 필요합니다');
    });

    it('should return 400 if reason is empty', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({ reason: '   ' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(400);
      expect(data.error).toBe('수정 요청 사유가 필요합니다');
    });

    it('should return 404 if order not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Please fix this' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(404);
      expect(data.error).toBe('주문을 찾을 수 없습니다');
    });

    it('should return 403 if user is not the buyer', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockOrder = { id: 'order-1', buyer_id: 'other-user' };
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Please fix this' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(403);
      expect(data.error).toBe('권한이 없습니다');
    });

    it('should create revision request successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockOrder = { id: 'order-1', buyer_id: 'user-1' };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Order lookup
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
          };
        } else if (callCount === 2) {
          // Update order status
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        } else {
          // Insert revision history
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Please fix the colors' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle order update error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockOrder = { id: 'order-1', buyer_id: 'user-1' };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
          };
        } else {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: { message: 'Update error' } }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Please fix this' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(500);
      expect(data.error).toBe('수정 요청에 실패했습니다');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected'));

      const request = new NextRequest('http://localhost:3000/api/orders/order-1/revision', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Please fix this' }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response).toBeDefined();
      const data = await response!.json();
      expect(response!.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });
  });
});
