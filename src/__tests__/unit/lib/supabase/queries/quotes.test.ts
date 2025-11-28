import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBuyerQuotes, getSellerQuotes, getQuoteResponses } from '@/lib/supabase/queries/quotes';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('Quotes Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBuyerQuotes', () => {
    it('should return buyer quotes with response count', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          title: 'Quote 1',
          buyer_id: 'user-1',
          category: { id: 'cat-1', name: 'Category 1' },
          quote_responses: [{ count: 5 }],
        },
        {
          id: 'quote-2',
          title: 'Quote 2',
          buyer_id: 'user-1',
          category: { id: 'cat-2', name: 'Category 2' },
          quote_responses: [],
        },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockQuotes, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getBuyerQuotes('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].responseCount).toBe(5);
      expect(result[1].responseCount).toBe(0);
    });

    it('should throw error on database failure', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      await expect(getBuyerQuotes('user-1')).rejects.toThrow();
    });
  });

  describe('getSellerQuotes', () => {
    it('should return pending quotes for sellers', async () => {
      const mockQuotes = [
        {
          id: 'quote-1',
          title: 'Quote 1',
          status: 'pending',
          buyer: { id: 'buyer-1', name: 'Buyer 1' },
          category: { id: 'cat-1', name: 'Category 1' },
        },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockQuotes, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getSellerQuotes();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });

    it('should respect limit parameter', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      await getSellerQuotes(10);

      expect(queryChain.limit).toHaveBeenCalledWith(10);
    });

    it('should throw error on database failure', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      await expect(getSellerQuotes()).rejects.toThrow();
    });
  });

  describe('getQuoteResponses', () => {
    it('should return responses for a quote', async () => {
      const mockResponses = [
        {
          id: 'response-1',
          quote_id: 'quote-1',
          seller: { id: 'seller-1', name: 'Seller 1' },
        },
        {
          id: 'response-2',
          quote_id: 'quote-1',
          seller: { id: 'seller-2', name: 'Seller 2' },
        },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockResponses, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const result = await getQuoteResponses('quote-1');

      expect(result).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('quote_responses');
    });

    it('should throw error on database failure', async () => {
      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      await expect(getQuoteResponses('quote-1')).rejects.toThrow();
    });
  });
});
