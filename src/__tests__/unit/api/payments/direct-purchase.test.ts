/**
 * Direct Purchase API Route Tests
 * Tests for /api/payments/direct-purchase
 * Coverage: 90%+ including all error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/payments/direct-purchase/route';
import { NextRequest } from 'next/server';

// Mock modules
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/transaction');
vi.mock('@sentry/nextjs');

describe('POST /api/payments/direct-purchase', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockSupabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockCreateClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockCheckRateLimit: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mocks require flexible typing
  let mockCreateOrderWithIdempotency: any;

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
    mockCreateOrderWithIdempotency = vi.fn();

    // Apply mocks
    const supabaseServer = await import('@/lib/supabase/server');
    vi.mocked(supabaseServer.createClient).mockImplementation(mockCreateClient);

    const rateLimit = await import('@/lib/rate-limit');
    vi.mocked(rateLimit.checkRateLimit).mockImplementation(mockCheckRateLimit);

    const transaction = await import('@/lib/transaction');
    vi.mocked(transaction.createOrderWithIdempotency).mockImplementation(
      mockCreateOrderWithIdempotency
    );
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

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
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

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
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
          limit: 10,
          remaining: 0,
          reset: new Date().toISOString(),
        }),
        { status: 429 }
      );

      mockCheckRateLimit.mockResolvedValue({
        success: false,
        error: rateLimitResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
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

    it('should return 400 when seller_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('필수 정보가 누락되었습니다');
    });

    it('should return 400 when service_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('필수 정보가 누락되었습니다');
    });

    it('should return 400 when title is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('필수 정보가 누락되었습니다');
    });

    it('should return 400 when amount is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('필수 정보가 누락되었습니다');
    });

    it('should return 400 when amount is less than 1000', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 999,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 결제 금액입니다');
    });

    it('should return 400 when amount is greater than 100000000', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 100000001,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 결제 금액입니다');
    });

    it('should return 400 when amount is not a number', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 'invalid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 결제 금액입니다');
    });

    it('should return 400 when title is not a string', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 12345,
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 제목입니다');
    });

    it('should return 400 when title is longer than 200 characters', async () => {
      const longTitle = 'a'.repeat(201);

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: longTitle,
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 제목입니다');
    });
  });

  /**
   * Seller Validation Tests
   */
  describe('Seller Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should return 404 when seller is not found', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('전문가를 찾을 수 없습니다');
    });

    it('should return 403 when trying to buy own service', async () => {
      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'sellers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'seller-123', user_id: 'user-123' },
              error: null,
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

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('자신의 서비스는 구매할 수 없습니다');
    });
  });

  /**
   * Service Validation Tests
   */
  describe('Service Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'sellers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'seller-123', user_id: 'seller-user-123' },
              error: null,
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
    });

    it('should return 404 when service is not found', async () => {
      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'sellers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'seller-123', user_id: 'seller-user-123' },
              error: null,
            }),
          };
        }
        if (tableName === 'services') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
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

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('서비스를 찾을 수 없습니다');
    });

    it('should return 400 when service price does not match amount', async () => {
      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'sellers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'seller-123', user_id: 'seller-user-123' },
              error: null,
            }),
          };
        }
        if (tableName === 'services') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'service-123',
                title: 'Test Service',
                price: 15000,
                delivery_days: 7,
                revision_count: 2,
              },
              error: null,
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

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('서비스 가격과 일치하지 않습니다');
    });
  });

  /**
   * Order Creation Tests
   */
  describe('Order Creation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'sellers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'seller-123', user_id: 'seller-user-123' },
              error: null,
            }),
          };
        }
        if (tableName === 'services') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'service-123',
                title: 'Test Service',
                price: 10000,
                delivery_days: 7,
                revision_count: 2,
              },
              error: null,
            }),
          };
        }
        if (tableName === 'chat_rooms') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
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

    it('should return 500 when order creation fails', async () => {
      mockCreateOrderWithIdempotency.mockResolvedValue({
        data: null,
        error: {
          message: 'Database error',
          code: 'PGRST000',
          details: 'Some details',
          hint: 'Some hint',
        },
        isExisting: false,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('주문 생성 실패');
    });

    it('should successfully create order and return order details', async () => {
      const mockOrder = {
        id: 'order-123',
        buyer_id: 'user-123',
        seller_id: 'seller-user-123',
        service_id: 'service-123',
        amount: 10000,
        total_amount: 10000,
        status: 'pending_payment',
        title: 'Test Service',
      };

      mockCreateOrderWithIdempotency.mockResolvedValue({
        data: mockOrder,
        error: null,
        isExisting: false,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
          description: 'Test description',
          delivery_days: 5,
          revision_count: 3,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('order_id', 'order-123');
      expect(data).toHaveProperty('merchant_uid');
      expect(data).toHaveProperty('amount', 10000);
      expect(data.merchant_uid).toMatch(/^order_\d+_[a-z0-9]+$/);
    });

    it('should create chat room if it does not exist', async () => {
      const mockOrder = {
        id: 'order-123',
        buyer_id: 'user-123',
        seller_id: 'seller-user-123',
        service_id: 'service-123',
        amount: 10000,
        total_amount: 10000,
        status: 'pending_payment',
        title: 'Test Service',
      };

      mockCreateOrderWithIdempotency.mockResolvedValue({
        data: mockOrder,
        error: null,
        isExisting: false,
      });

      const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null });
      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'sellers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'seller-123', user_id: 'seller-user-123' },
              error: null,
            }),
          };
        }
        if (tableName === 'services') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'service-123',
                title: 'Test Service',
                price: 10000,
                delivery_days: 7,
                revision_count: 2,
              },
              error: null,
            }),
          };
        }
        if (tableName === 'chat_rooms') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: mockInsert,
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabase.from = mockFrom;

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      await POST(request);

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should not create duplicate chat room if it already exists', async () => {
      const mockOrder = {
        id: 'order-123',
        buyer_id: 'user-123',
        seller_id: 'seller-user-123',
        service_id: 'service-123',
        amount: 10000,
        total_amount: 10000,
        status: 'pending_payment',
        title: 'Test Service',
      };

      mockCreateOrderWithIdempotency.mockResolvedValue({
        data: mockOrder,
        error: null,
        isExisting: false,
      });

      const mockInsert = vi.fn();
      const mockFrom = vi.fn((tableName: string) => {
        if (tableName === 'sellers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'seller-123', user_id: 'seller-user-123' },
              error: null,
            }),
          };
        }
        if (tableName === 'services') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'service-123',
                title: 'Test Service',
                price: 10000,
                delivery_days: 7,
                revision_count: 2,
              },
              error: null,
            }),
          };
        }
        if (tableName === 'chat_rooms') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'existing-room' },
              error: null,
            }),
            insert: mockInsert,
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      mockSupabase.from = mockFrom;

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      await POST(request);

      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Error Handling', () => {
    it('should return 500 when unexpected error occurs', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
        method: 'POST',
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-123',
          title: 'Test Service',
          amount: 10000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });
  });
});
