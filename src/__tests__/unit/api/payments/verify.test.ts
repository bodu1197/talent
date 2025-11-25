/**
 * Payment Verification API Route Tests
 * Tests for /api/payments/verify
 * Coverage: 90%+ including all error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/payments/verify/route';
import { NextRequest } from 'next/server';

// Mock modules
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/transaction');
vi.mock('@/lib/notifications');
vi.mock('@sentry/nextjs');

describe('POST /api/payments/verify', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockSupabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockCreateClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockCheckRateLimit: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockCreatePaymentWithIdempotency: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockNotifyPaymentReceived: any;

  beforeEach(async () => {
    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    mockCreateClient = vi.fn().mockResolvedValue(mockSupabase);

    // Setup rate limit mock (success by default)
    mockCheckRateLimit = vi.fn().mockResolvedValue({ success: true });

    // Setup transaction mock
    mockCreatePaymentWithIdempotency = vi.fn();

    // Setup notification mock
    mockNotifyPaymentReceived = vi.fn().mockResolvedValue({});

    // Apply mocks
    const supabaseServer = await import('@/lib/supabase/server');
    vi.mocked(supabaseServer.createClient).mockImplementation(mockCreateClient);

    const rateLimit = await import('@/lib/rate-limit');
    vi.mocked(rateLimit.checkRateLimit).mockImplementation(mockCheckRateLimit);

    const transaction = await import('@/lib/transaction');
    vi.mocked(transaction.createPaymentWithIdempotency).mockImplementation(
      mockCreatePaymentWithIdempotency
    );

    const notifications = await import('@/lib/notifications');
    vi.mocked(notifications.notifyPaymentReceived).mockImplementation(mockNotifyPaymentReceived);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Authentication Tests
   */
  describe('Authentication', () => {
    it('should return 401 when user is not authenticated (auth error)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('should return 401 when user is null', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });
  });

  /**
   * Rate Limiting Tests
   */
  describe('Rate Limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const rateLimitResponse = new Response(
        JSON.stringify({
          error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
          limit: 5,
          remaining: 0,
          reset: new Date().toISOString(),
        }),
        { status: 429 }
      );

      mockCheckRateLimit.mockResolvedValue({
        success: false,
        error: rateLimitResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
    });
  });

  /**
   * Input Validation Tests
   */
  describe('Input Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should return 400 when payment_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('필수 정보가 누락되었습니다');
    });

    it('should return 400 when order_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('필수 정보가 누락되었습니다');
    });

    it('should return 400 when order_id is not a valid UUID', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: 'invalid-uuid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 주문 ID입니다');
    });
  });

  /**
   * Order Validation Tests
   */
  describe('Order Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should return 404 when order is not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('주문을 찾을 수 없습니다');
    });

    it('should return 403 when user is not the buyer', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            buyer_id: 'other-user-123',
            seller_id: 'seller-123',
            total_amount: 10000,
            status: 'pending_payment',
          },
          error: null,
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('구매자만 결제 검증을 할 수 있습니다');
    });

    it('should return 400 when order is already paid', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            buyer_id: 'user-123',
            seller_id: 'seller-123',
            total_amount: 10000,
            status: 'paid',
          },
          error: null,
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('이미 결제된 주문입니다');
    });

    it('should return 400 when order status is in_progress', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            buyer_id: 'user-123',
            seller_id: 'seller-123',
            total_amount: 10000,
            status: 'in_progress',
          },
          error: null,
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('이미 결제된 주문입니다');
    });
  });

  /**
   * Payment Creation Tests
   */
  describe('Payment Creation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'orders') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                buyer_id: 'user-123',
                seller_id: 'seller-123',
                total_amount: 10000,
                status: 'pending_payment',
              },
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          };
        }
        if (tableName === 'payment_requests') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabase.from = mockFrom;
    });

    it('should return 500 when payment creation fails', async () => {
      mockCreatePaymentWithIdempotency.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        isExisting: false,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('결제 기록 생성 실패');
    });

    it('should return existing payment when payment already exists (idempotency)', async () => {
      const mockPayment = {
        id: 'payment-123',
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        payment_method: 'card',
        payment_id: 'pay-123',
        status: 'completed',
      };

      mockCreatePaymentWithIdempotency.mockResolvedValue({
        data: mockPayment,
        error: null,
        isExisting: true,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order.payment_id).toBe('payment-123');
    });

    it('should return 500 when order update fails', async () => {
      const mockPayment = {
        id: 'payment-123',
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        payment_method: 'card',
        payment_id: 'pay-123',
        status: 'completed',
      };

      mockCreatePaymentWithIdempotency.mockResolvedValue({
        data: mockPayment,
        error: null,
        isExisting: false,
      });

      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'orders') {
          const mockUpdate = vi.fn().mockReturnThis();
          const mockEq = vi.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          });

          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                buyer_id: 'user-123',
                seller_id: 'seller-123',
                total_amount: 10000,
                status: 'pending_payment',
              },
              error: null,
            }),
            update: mockUpdate.mockReturnValue({ eq: mockEq }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabase.from = mockFrom;

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('주문 상태 업데이트 실패');
    });

    it('should successfully verify payment and update order status', async () => {
      const mockPayment = {
        id: 'payment-123',
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        payment_method: 'card',
        payment_id: 'pay-123',
        status: 'completed',
      };

      mockCreatePaymentWithIdempotency.mockResolvedValue({
        data: mockPayment,
        error: null,
        isExisting: false,
      });

      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'orders') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                buyer_id: 'user-123',
                seller_id: 'seller-123',
                total_amount: 10000,
                status: 'pending_payment',
              },
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          };
        }
        if (tableName === 'payment_requests') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      // Mock update response
      mockSupabase.from = vi.fn((tableName: string) => {
        const base = mockFrom(tableName);
        if (tableName === 'orders') {
          return {
            ...base,
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return base;
      });

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(data.order.status).toBe('in_progress');
      expect(data.order.payment_id).toBe('payment-123');
      expect(mockNotifyPaymentReceived).toHaveBeenCalledWith(
        'seller-123',
        '123e4567-e89b-12d3-a456-426614174000',
        10000
      );
    });

    it('should update payment request status when payment_request_id is provided', async () => {
      const mockPayment = {
        id: 'payment-123',
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        payment_method: 'card',
        payment_id: 'pay-123',
        status: 'completed',
      };

      mockCreatePaymentWithIdempotency.mockResolvedValue({
        data: mockPayment,
        error: null,
        isExisting: false,
      });

      const mockUpdatePaymentRequest = vi.fn().mockReturnThis();
      const mockEqPaymentRequest = vi.fn().mockResolvedValue({ data: {}, error: null });

      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'orders') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                buyer_id: 'user-123',
                seller_id: 'seller-123',
                total_amount: 10000,
                status: 'pending_payment',
              },
              error: null,
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (tableName === 'payment_requests') {
          return {
            update: mockUpdatePaymentRequest.mockReturnValue({
              eq: mockEqPaymentRequest,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabase.from = mockFrom;

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
          payment_request_id: 'pr-123',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockUpdatePaymentRequest).toHaveBeenCalled();
      expect(mockEqPaymentRequest).toHaveBeenCalledWith('id', 'pr-123');
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Error Handling', () => {
    it('should return 500 when unexpected error occurs', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });

    it('should handle notification failure gracefully', async () => {
      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      const mockPayment = {
        id: 'payment-123',
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 10000,
        payment_method: 'card',
        payment_id: 'pay-123',
        status: 'completed',
      };

      mockCreatePaymentWithIdempotency.mockResolvedValue({
        data: mockPayment,
        error: null,
        isExisting: false,
      });

      // Notification fails but payment should still succeed
      mockNotifyPaymentReceived.mockRejectedValue(new Error('Notification failed'));

      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'orders') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                buyer_id: 'user-123',
                seller_id: 'seller-123',
                total_amount: 10000,
                status: 'pending_payment',
              },
              error: null,
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabase.from = mockFrom;

      const request = new NextRequest('http://localhost:3000/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: 'pay-123',
          order_id: '123e4567-e89b-12d3-a456-426614174000',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Payment should still succeed even if notification fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
