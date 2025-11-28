import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/search/services/route';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  or: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(),
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

describe('Search Services API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
  });

  describe('GET /api/search/services', () => {
    it('should return empty array when no query provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/search/services');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.services).toEqual([]);
    });

    it('should return empty array when query is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/search/services?q=');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.services).toEqual([]);
    });

    it('should search services successfully', async () => {
      const mockServices = [
        { id: '1', title: 'AI Design', price: 50000, orders_count: 10 },
        { id: '2', title: 'AI Art', price: 30000, orders_count: 5 },
      ];

      mockSupabase.limit.mockResolvedValue({ data: mockServices, error: null });

      const request = new NextRequest('http://localhost:3000/api/search/services?q=AI');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.services).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('services');
    });

    it('should handle database error', async () => {
      mockSupabase.limit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/search/services?q=test');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Search failed');
    });

    it('should set cache headers on successful response', async () => {
      mockSupabase.limit.mockResolvedValue({ data: [], error: null });

      const request = new NextRequest('http://localhost:3000/api/search/services?q=test');

      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toContain('s-maxage=30');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.limit.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/search/services?q=test');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
