import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createNotification,
  notifyNewOrder,
  notifyPaymentReceived,
  notifyOrderCancelled,
  notifyWorkCompleted,
  notifyOrderConfirmed,
  notifyNewReview,
  notifyNewMessage,
} from '@/lib/notifications';

// Mock Supabase
const mockSupabase = {
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
  },
}));

describe('Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const mockNotification = {
        id: 'notif-1',
        user_id: 'user-1',
        type: 'test',
        title: 'Test Title',
        message: 'Test message',
        link_url: '/test',
        is_read: false,
      };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await createNotification({
        userId: 'user-1',
        type: 'test',
        title: 'Test Title',
        message: 'Test message',
        linkUrl: '/test',
      });

      expect(result).toEqual(mockNotification);
      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should return null on error', async () => {
      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await createNotification({
        userId: 'user-1',
        type: 'test',
        title: 'Test Title',
        message: 'Test message',
      });

      expect(result).toBeNull();
    });
  });

  describe('notifyNewOrder', () => {
    it('should create new order notification', async () => {
      const mockNotification = { id: 'notif-1' };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await notifyNewOrder('seller-1', 'order-1', 'Design Service');

      expect(result).toBeDefined();
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'seller-1',
          type: 'new_order',
          title: '새로운 주문이 들어왔습니다',
        })
      );
    });
  });

  describe('notifyPaymentReceived', () => {
    it('should create payment received notification', async () => {
      const mockNotification = { id: 'notif-1' };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await notifyPaymentReceived('seller-1', 'order-1', 50000);

      expect(result).toBeDefined();
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'seller-1',
          type: 'payment_received',
          message: expect.stringContaining('50,000원'),
        })
      );
    });
  });

  describe('notifyOrderCancelled', () => {
    it('should create order cancelled notification', async () => {
      const mockNotification = { id: 'notif-1' };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await notifyOrderCancelled('user-1', 'order-1', 'Service Name');

      expect(result).toBeDefined();
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order_cancelled',
        })
      );
    });
  });

  describe('notifyWorkCompleted', () => {
    it('should create work completed notification', async () => {
      const mockNotification = { id: 'notif-1' };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await notifyWorkCompleted('buyer-1', 'order-1', 'Service Name');

      expect(result).toBeDefined();
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'buyer-1',
          type: 'work_completed',
        })
      );
    });
  });

  describe('notifyOrderConfirmed', () => {
    it('should create order confirmed notification', async () => {
      const mockNotification = { id: 'notif-1' };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await notifyOrderConfirmed('seller-1', 'order-1', 100000);

      expect(result).toBeDefined();
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order_confirmed',
          message: expect.stringContaining('100,000원'),
        })
      );
    });
  });

  describe('notifyNewReview', () => {
    it('should create new review notification', async () => {
      const mockNotification = { id: 'notif-1' };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await notifyNewReview('seller-1', 'order-1', 5);

      expect(result).toBeDefined();
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'new_review',
          message: expect.stringContaining('별점 5점'),
        })
      );
    });
  });

  describe('notifyNewMessage', () => {
    it('should create new message notification', async () => {
      const mockNotification = { id: 'notif-1' };

      const queryChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await notifyNewMessage('user-1', 'John', 'room-1');

      expect(result).toBeDefined();
      expect(queryChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'new_message',
          message: expect.stringContaining('John'),
          link_url: '/chat/room-1',
        })
      );
    });
  });
});
