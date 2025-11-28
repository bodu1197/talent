import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createReview,
  updateReview,
  deleteReview,
  createReviewReply,
} from '@/lib/supabase/mutations/reviews';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('Reviews Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create review and update order successfully', async () => {
      const mockReview = { id: 'review-1', rating: 5, comment: 'Great work!' };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Insert review
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockReview, error: null }),
          };
        } else {
          // Update order with review_id
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      const result = await createReview({
        orderId: 'order-1',
        serviceId: 'service-1',
        sellerId: 'seller-1',
        buyerId: 'buyer-1',
        rating: 5,
        content: 'Great work!',
      });

      expect(result.id).toBe('review-1');
      expect(result.rating).toBe(5);
    });

    it('should throw error on insert failure', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });

      await expect(
        createReview({
          orderId: 'order-1',
          serviceId: 'service-1',
          sellerId: 'seller-1',
          buyerId: 'buyer-1',
          rating: 5,
          content: 'Great!',
        })
      ).rejects.toThrow();
    });
  });

  describe('updateReview', () => {
    it('should update review successfully', async () => {
      const mockReview = { id: 'review-1', rating: 4, comment: 'Updated review' };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockReview, error: null }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      const result = await updateReview('review-1', { rating: 4, content: 'Updated review' });

      expect(result.rating).toBe(4);
      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 4,
          comment: 'Updated review',
        })
      );
    });

    it('should throw error on update failure', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });

      await expect(updateReview('review-1', { rating: 4, content: 'Updated' })).rejects.toThrow();
    });
  });

  describe('deleteReview', () => {
    it('should delete review and remove from order successfully', async () => {
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Update order to remove review_id
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        } else {
          // Delete review
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      await expect(deleteReview('review-1')).resolves.not.toThrow();
    });

    it('should throw error on delete failure', async () => {
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        } else {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
          };
        }
      });

      await expect(deleteReview('review-1')).rejects.toThrow();
    });
  });

  describe('createReviewReply', () => {
    it('should add seller reply successfully', async () => {
      const mockReview = {
        id: 'review-1',
        seller_reply: 'Thank you for the feedback!',
      };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockReview, error: null }),
      };

      mockSupabase.from.mockReturnValue(updateChain);

      const result = await createReviewReply('review-1', 'Thank you for the feedback!');

      expect(result.seller_reply).toBe('Thank you for the feedback!');
      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          seller_reply: 'Thank you for the feedback!',
        })
      );
    });

    it('should throw error on reply failure', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });

      await expect(createReviewReply('review-1', 'Thanks!')).rejects.toThrow();
    });
  });
});
