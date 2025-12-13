import { describe, it, expect } from 'vitest';
import { getErrorMessage, isError } from '@/lib/error';

describe('Error utilities', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should return string error as is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error' };
      expect(getErrorMessage(error)).toBe('Object error');
    });

    it('should return default message for unknown error', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
    });
  });

  describe('isError', () => {
    it('should return true for Error objects', () => {
      expect(isError(new Error())).toBe(true);
      expect(isError(new TypeError())).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('error')).toBe(false);
      expect(isError({ message: 'error' })).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });
});
