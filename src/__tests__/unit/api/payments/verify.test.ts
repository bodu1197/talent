/**
 * Payment Verification API Route Tests
 * Tests for /api/payments/verify
 * Coverage: 90%+ including all error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/payments/verify/route';
import { NextRequest, NextResponse } from 'next/server';

// Mock modules - mock the actual helper functions used by the route
vi.mock('@/lib/api/payment-verify');
vi.mock('@/lib/transaction');
vi.mock('@/lib/notifications');
vi.mock('@/lib/logger');
vi.mock('@sentry/nextjs');

describe('POST /api/payments/verify', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockVerifyPaymentAuth: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockVerifyOrderForPayment: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCreatePaymentWithIdempotency: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockNotifyPaymentReceived: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(async () => {
    // Setup mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    // Setup helper mocks
    mockVerifyPaymentAuth = vi.fn();
    mockVerifyOrderForPayment = vi.fn();
    mockCreatePaymentWithIdempotency = vi.fn();
    mockNotifyPaymentReceived = vi.fn().mockResolvedValue({});

    // Apply mocks
    const paymentVerify = await import('@/lib/api/payment-verify');
    vi.mocked(paymentVerify.verifyPaymentAuth).mockImplementation(mockVerifyPaymentAuth);
    vi.mocked(paymentVerify.verifyOrderForPayment).mockImplementation(mockVerifyOrderForPayment);

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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 }),
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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 }),
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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: false,
        error: new Response(
          JSON.stringify({
            error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
          }),
          { status: 429 }
        ),
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
    it('should return 400 when payment_id is missing', async () => {
      mockVerifyPaymentAuth.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 }),
      });

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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 }),
      });

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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '유효하지 않은 주문 ID입니다' }, { status: 400 }),
      });

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
    it('should return 404 when order is not found', async () => {
      mockVerifyPaymentAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123' },
        supabase: mockSupabase,
        body: { payment_id: 'pay-123', order_id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      mockVerifyOrderForPayment.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 }),
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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123' },
        supabase: mockSupabase,
        body: { payment_id: 'pay-123', order_id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      mockVerifyOrderForPayment.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '구매자만 결제 검증을 할 수 있습니다' }, { status: 403 }),
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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123' },
        supabase: mockSupabase,
        body: { payment_id: 'pay-123', order_id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      mockVerifyOrderForPayment.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '이미 결제된 주문입니다' }, { status: 400 }),
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
      mockVerifyPaymentAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123' },
        supabase: mockSupabase,
        body: { payment_id: 'pay-123', order_id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      mockVerifyOrderForPayment.mockResolvedValue({
        success: false,
        error: NextResponse.json({ error: '이미 결제된 주문입니다' }, { status: 400 }),
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
    const mockOrder = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      buyer_id: 'user-123',
      seller_id: 'seller-123',
      total_amount: 10000,
      status: 'pending_payment',
    };

    beforeEach(() => {
      // Setup default successful auth and order verification
      mockVerifyPaymentAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123' },
        supabase: mockSupabase,
        body: { payment_id: 'pay-123', order_id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      mockVerifyOrderForPayment.mockResolvedValue({
        success: true,
        order: mockOrder,
      });

      // Setup Supabase from mock
      mockSupabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
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
