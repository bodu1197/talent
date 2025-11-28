import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { ApiError, handleApiError, withErrorHandling } from '@/lib/api/error-handler';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ApiError', () => {
    it('should create error with message and default status', () => {
      const error = new ApiError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApiError');
    });

    it('should create error with custom status code', () => {
      const error = new ApiError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create error with custom code', () => {
      const error = new ApiError('Validation error', 400, 'VALIDATION_ERROR');

      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('handleApiError', () => {
    it('should handle ApiError correctly', async () => {
      const error = new ApiError('Custom error', 400, 'CUSTOM_CODE');
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Custom error');
      expect(data.code).toBe('CUSTOM_CODE');
    });

    it('should handle generic Error with message', async () => {
      const error = new Error('Generic error');
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Generic error');
    });

    it('should handle object errors with message property', async () => {
      const error = { message: 'Supabase error' };
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Supabase error');
    });

    it('should handle unknown errors', async () => {
      const error = 'String error';
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });

    it('should handle null/undefined errors', async () => {
      const response = handleApiError(null);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류가 발생했습니다');
    });
  });

  describe('withErrorHandling', () => {
    it('should pass through successful responses', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrappedHandler = withErrorHandling(handler);

      const response = await wrappedHandler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should catch and handle ApiError', async () => {
      const handler = vi.fn().mockRejectedValue(new ApiError('Handler error', 400));
      const wrappedHandler = withErrorHandling(handler);

      const response = await wrappedHandler();
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Handler error');
    });

    it('should catch and handle generic errors', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Unexpected error'));
      const wrappedHandler = withErrorHandling(handler);

      const response = await wrappedHandler();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Unexpected error');
    });

    it('should pass arguments to handler', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrappedHandler = withErrorHandling(handler);

      await wrappedHandler('arg1', 'arg2', 123);

      expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });
  });
});
