import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/check-email/route';

// Mock Supabase
const mockSupabase = {
  rpc: vi.fn(),
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

describe('Check Email API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/check-email', () => {
    it('should return 400 if email is missing', async () => {
      const request = new Request('http://localhost:3000/api/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email is required');
    });

    it('should return available true when email does not exist', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const request = new Request('http://localhost:3000/api/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'new@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_email_exists', {
        check_email: 'new@example.com',
      });
    });

    it('should return available false when email already exists', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const request = new Request('http://localhost:3000/api/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'existing@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
    });

    it('should handle RPC error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      });

      const request = new Request('http://localhost:3000/api/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check email');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Unexpected'));

      const request = new Request('http://localhost:3000/api/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check email');
    });
  });
});
