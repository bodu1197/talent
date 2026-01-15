import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  confirmOrder,
  requestRevision,
  cancelOrder,
  updateOrderStatus,
} from '@/lib/supabase/mutations/orders';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Orders Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'completed' }),
      });

      const result = await confirmOrder('order-1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/orders/order-1/confirm',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual({ status: 'completed' });
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' }),
      });

      await expect(confirmOrder('order-1')).rejects.toThrow('API Error');
    });
  });

  describe('requestRevision', () => {
    it('should request revision successfully', async () => {
      const mockOrder = { id: 'order-1', status: 'in_progress', revision_requested: true };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      const result = await requestRevision('order-1', 'Please fix the colors');

      expect(result.revision_requested).toBe(true);
      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'in_progress',
          revision_requested: true,
          revision_details: 'Please fix the colors',
        })
      );
    });

    it('should throw error on database failure', async () => {
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      await expect(requestRevision('order-1', 'Fix this')).rejects.toThrow();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const mockOrder = { id: 'order-1', status: 'cancelled', cancel_reason: 'Changed mind' };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      const result = await cancelOrder('order-1', 'Changed mind');

      expect(result.status).toBe('cancelled');
      expect(result.cancel_reason).toBe('Changed mind');
    });

    it('should throw error on database failure', async () => {
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      await expect(cancelOrder('order-1', 'Reason')).rejects.toThrow();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrder = { id: 'order-1', status: 'delivered' };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      const result = await updateOrderStatus('order-1', 'delivered');

      expect(result.status).toBe('delivered');
      expect(updateChain.update).toHaveBeenCalledWith({ status: 'delivered' });
    });

    it('should throw error on database failure', async () => {
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      await expect(updateOrderStatus('order-1', 'delivered')).rejects.toThrow();
    });
  });
});
