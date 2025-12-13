import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createOrderWithIdempotency,
  createPaymentWithIdempotency,
  updateOrderStatusWithLocking,
  deductCreditWithLocking,
} from '@/lib/transaction';
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import type { Tables } from '@/types/database';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock createClient
const mockCreateClient = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

describe('transaction.ts', () => {
  describe('createOrderWithIdempotency', () => {
    let mockSupabase: SupabaseClient;

    beforeEach(() => {
      vi.clearAllMocks();

      // Create a fresh mock Supabase client for each test
      mockSupabase = {
        from: vi.fn(),
      } as unknown as SupabaseClient;
    });

    it('should return existing order when idempotency key already exists', async () => {
      const existingOrder = {
        id: 'order-123',
        merchant_uid: 'idempotency-key-1',
        buyer_id: 'buyer-1',
        seller_id: 'seller-1',
        service_id: 'service-1',
        amount: 10000,
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'orders'>;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: existingOrder,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const orderData = {
        buyer_id: 'buyer-1',
        seller_id: 'seller-1',
        service_id: 'service-1',
        amount: 10000,
      };

      const result = await createOrderWithIdempotency(mockSupabase, orderData, 'idempotency-key-1');

      expect(result.data).toEqual(existingOrder);
      expect(result.error).toBeNull();
      expect(result.isExisting).toBe(true);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('merchant_uid', 'idempotency-key-1');
    });

    it('should create new order when idempotency key does not exist', async () => {
      const newOrder = {
        id: 'order-456',
        merchant_uid: 'idempotency-key-2',
        buyer_id: 'buyer-2',
        seller_id: 'seller-2',
        service_id: 'service-2',
        amount: 20000,
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'orders'>;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newOrder,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const orderData = {
        buyer_id: 'buyer-2',
        seller_id: 'seller-2',
        service_id: 'service-2',
        amount: 20000,
      };

      const result = await createOrderWithIdempotency(mockSupabase, orderData, 'idempotency-key-2');

      expect(result.data).toEqual(newOrder);
      expect(result.error).toBeNull();
      expect(result.isExisting).toBe(false);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        ...orderData,
        merchant_uid: 'idempotency-key-2',
      });
    });

    it('should handle race condition with unique constraint violation', async () => {
      const existingOrder = {
        id: 'order-789',
        merchant_uid: 'idempotency-key-3',
        buyer_id: 'buyer-3',
        seller_id: 'seller-3',
        service_id: 'service-3',
        amount: 30000,
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'orders'>;

      let callCount = 0;
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // First call: unique constraint violation
            return Promise.resolve({
              data: null,
              error: {
                code: '23505',
                message: 'duplicate key value violates unique constraint "orders_merchant_uid_key"',
              } as PostgrestError,
            });
          } else {
            // Second call: return existing order
            return Promise.resolve({
              data: existingOrder,
              error: null,
            });
          }
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const orderData = {
        buyer_id: 'buyer-3',
        seller_id: 'seller-3',
        service_id: 'service-3',
        amount: 30000,
      };

      const result = await createOrderWithIdempotency(mockSupabase, orderData, 'idempotency-key-3');

      expect(result.data).toEqual(existingOrder);
      expect(result.error).toBeNull();
      expect(result.isExisting).toBe(true);
      expect(mockQueryBuilder.single).toHaveBeenCalledTimes(2);
    });

    it('should return error when check query fails', async () => {
      const checkError = {
        code: 'PGRST301',
        message: 'Database connection failed',
      } as PostgrestError;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: checkError,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const orderData = {
        buyer_id: 'buyer-4',
        seller_id: 'seller-4',
        service_id: 'service-4',
        amount: 40000,
      };

      const result = await createOrderWithIdempotency(mockSupabase, orderData, 'idempotency-key-4');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(checkError);
      expect(result.isExisting).toBe(false);
    });

    it('should return error when insert fails with non-constraint error', async () => {
      const insertError = {
        code: 'PGRST400',
        message: 'Invalid data format',
      } as PostgrestError;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: insertError,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const orderData = {
        buyer_id: 'buyer-5',
        seller_id: 'seller-5',
        service_id: 'service-5',
        amount: 50000,
      };

      const result = await createOrderWithIdempotency(mockSupabase, orderData, 'idempotency-key-5');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(insertError);
      expect(result.isExisting).toBe(false);
    });

    it('should pass through additional order data fields', async () => {
      const newOrder = {
        id: 'order-999',
        merchant_uid: 'idempotency-key-6',
        buyer_id: 'buyer-6',
        seller_id: 'seller-6',
        service_id: 'service-6',
        amount: 60000,
        status: 'pending',
        custom_field: 'custom_value',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'orders'>;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newOrder,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const orderData = {
        buyer_id: 'buyer-6',
        seller_id: 'seller-6',
        service_id: 'service-6',
        amount: 60000,
        custom_field: 'custom_value',
      };

      const result = await createOrderWithIdempotency(mockSupabase, orderData, 'idempotency-key-6');

      expect(result.data).toEqual(newOrder);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        ...orderData,
        merchant_uid: 'idempotency-key-6',
      });
    });
  });

  describe('createPaymentWithIdempotency', () => {
    let mockSupabase: SupabaseClient;

    beforeEach(() => {
      vi.clearAllMocks();
      mockSupabase = {
        from: vi.fn(),
      } as unknown as SupabaseClient;
    });

    it('should return existing payment when payment_id already exists', async () => {
      const existingPayment = {
        id: 'payment-123',
        order_id: 'order-123',
        amount: 10000,
        payment_method: 'card',
        payment_id: 'pay-123',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'payments'>;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: existingPayment,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const paymentData = {
        order_id: 'order-123',
        amount: 10000,
        payment_method: 'card',
        payment_id: 'pay-123',
      };

      const result = await createPaymentWithIdempotency(mockSupabase, paymentData);

      expect(result.data).toEqual(existingPayment);
      expect(result.error).toBeNull();
      expect(result.isExisting).toBe(true);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('payment_id', 'pay-123');
    });

    it('should create new payment when payment_id does not exist', async () => {
      const newPayment = {
        id: 'payment-456',
        order_id: 'order-456',
        amount: 20000,
        payment_method: 'bank_transfer',
        payment_id: 'pay-456',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'payments'>;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newPayment,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const paymentData = {
        order_id: 'order-456',
        amount: 20000,
        payment_method: 'bank_transfer',
        payment_id: 'pay-456',
      };

      const result = await createPaymentWithIdempotency(mockSupabase, paymentData);

      expect(result.data).toEqual(newPayment);
      expect(result.error).toBeNull();
      expect(result.isExisting).toBe(false);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(paymentData);
    });

    it('should handle race condition with payment_id constraint violation', async () => {
      const existingPayment = {
        id: 'payment-789',
        order_id: 'order-789',
        amount: 30000,
        payment_method: 'card',
        payment_id: 'pay-789',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'payments'>;

      let callCount = 0;
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              data: null,
              error: {
                code: '23505',
                message: 'duplicate key value violates unique constraint "payments_payment_id_key"',
              } as PostgrestError,
            });
          } else {
            return Promise.resolve({
              data: existingPayment,
              error: null,
            });
          }
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const paymentData = {
        order_id: 'order-789',
        amount: 30000,
        payment_method: 'card',
        payment_id: 'pay-789',
      };

      const result = await createPaymentWithIdempotency(mockSupabase, paymentData);

      expect(result.data).toEqual(existingPayment);
      expect(result.error).toBeNull();
      expect(result.isExisting).toBe(true);
    });

    it('should return error when check query fails', async () => {
      const checkError = {
        code: 'PGRST301',
        message: 'Database connection failed',
      } as PostgrestError;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: checkError,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const paymentData = {
        order_id: 'order-error',
        amount: 40000,
        payment_method: 'card',
        payment_id: 'pay-error',
      };

      const result = await createPaymentWithIdempotency(mockSupabase, paymentData);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(checkError);
      expect(result.isExisting).toBe(false);
    });

    it('should return error when insert fails with non-constraint error', async () => {
      const insertError = {
        code: 'PGRST400',
        message: 'Invalid payment method',
      } as PostgrestError;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: insertError,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const paymentData = {
        order_id: 'order-invalid',
        amount: 50000,
        payment_method: 'invalid_method',
        payment_id: 'pay-invalid',
      };

      const result = await createPaymentWithIdempotency(mockSupabase, paymentData);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(insertError);
      expect(result.isExisting).toBe(false);
    });

    it('should pass through additional payment data fields', async () => {
      const newPayment = {
        id: 'payment-999',
        order_id: 'order-999',
        amount: 60000,
        payment_method: 'card',
        payment_id: 'pay-999',
        status: 'completed',
        extra_field: 'extra_value',
        created_at: '2024-01-01T00:00:00Z',
      } as unknown as Tables<'payments'>;

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newPayment,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const paymentData = {
        order_id: 'order-999',
        amount: 60000,
        payment_method: 'card',
        payment_id: 'pay-999',
        extra_field: 'extra_value',
      };

      const result = await createPaymentWithIdempotency(mockSupabase, paymentData);

      expect(result.data).toEqual(newPayment);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(paymentData);
    });
  });

  describe('updateOrderStatusWithLocking', () => {
    let mockSupabase: SupabaseClient;

    beforeEach(() => {
      vi.clearAllMocks();
      mockSupabase = {
        from: vi.fn(),
      } as unknown as SupabaseClient;
    });

    it('should successfully update order status with matching timestamp', async () => {
      const updatedOrder = {
        id: 'order-123',
        status: 'completed',
        updated_at: '2024-01-01T01:00:00Z',
      };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedOrder,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const result = await updateOrderStatusWithLocking(
        mockSupabase,
        'order-123',
        'completed',
        '2024-01-01T00:00:00Z'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedOrder);
      expect(result.error).toBeUndefined();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'order-123');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('updated_at', '2024-01-01T00:00:00Z');
    });

    it('should fail with optimistic lock error when timestamp does not match', async () => {
      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: 'PGRST116',
            message: 'No rows updated',
          } as PostgrestError,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const result = await updateOrderStatusWithLocking(
        mockSupabase,
        'order-123',
        'completed',
        '2024-01-01T00:00:00Z'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        '주문 상태가 이미 다른 사용자에 의해 변경되었습니다. 새로고침 후 다시 시도해주세요.'
      );
      expect(result.data).toBeUndefined();
    });

    it('should return error message for other database errors', async () => {
      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: 'PGRST400',
            message: 'Invalid status value',
          } as PostgrestError,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      const result = await updateOrderStatusWithLocking(
        mockSupabase,
        'order-123',
        'invalid_status',
        '2024-01-01T00:00:00Z'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid status value');
      expect(result.data).toBeUndefined();
    });

    it('should update with current timestamp', async () => {
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'order-123', status: 'completed' },
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQueryBuilder as never);

      await updateOrderStatusWithLocking(
        mockSupabase,
        'order-123',
        'completed',
        '2024-01-01T00:00:00Z'
      );

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        status: 'completed',
        updated_at: '2024-01-01T12:00:00.000Z',
      });

      vi.useRealTimers();
    });
  });

  describe('deductCreditWithLocking', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should successfully deduct credit', async () => {
      const mockRpcResponse = {
        data: {
          success: true,
          remaining: 5000,
          error: null,
        },
        error: null,
      };

      const mockSupabaseClient = {
        rpc: vi.fn().mockResolvedValue(mockRpcResponse),
      };

      mockCreateClient.mockResolvedValue(mockSupabaseClient);

      const result = await deductCreditWithLocking('credit-123', 3000);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5000);
      expect(result.error).toBeUndefined();
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('deduct_credit_safe', {
        p_credit_id: 'credit-123',
        p_amount: 3000,
      });
    });

    it('should return error when RPC call fails', async () => {
      const mockRpcResponse = {
        data: null,
        error: {
          message: 'Insufficient credits',
          code: 'P0001',
        },
      };

      const mockSupabaseClient = {
        rpc: vi.fn().mockResolvedValue(mockRpcResponse),
      };

      mockCreateClient.mockResolvedValue(mockSupabaseClient);

      const result = await deductCreditWithLocking('credit-456', 10000);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.error).toBe('Insufficient credits');
    });

    it('should handle RPC response with error field', async () => {
      const mockRpcResponse = {
        data: {
          success: false,
          remaining: 100,
          error: 'Not enough credits',
        },
        error: null,
      };

      const mockSupabaseClient = {
        rpc: vi.fn().mockResolvedValue(mockRpcResponse),
      };

      mockCreateClient.mockResolvedValue(mockSupabaseClient);

      const result = await deductCreditWithLocking('credit-789', 5000);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(100);
      expect(result.error).toBe('Not enough credits');
    });

    it('should handle null error field in successful response', async () => {
      const mockRpcResponse = {
        data: {
          success: true,
          remaining: 2000,
          error: null,
        },
        error: null,
      };

      const mockSupabaseClient = {
        rpc: vi.fn().mockResolvedValue(mockRpcResponse),
      };

      mockCreateClient.mockResolvedValue(mockSupabaseClient);

      const result = await deductCreditWithLocking('credit-999', 1000);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2000);
      expect(result.error).toBeUndefined();
    });
  });
});
