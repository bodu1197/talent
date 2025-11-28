import { describe, it, expect } from 'vitest';
import { getErrorMessage, isError } from '@/lib/error';

describe('error utilities', () => {
  describe('getErrorMessage', () => {
    it('should return message from Error instance', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return string directly if error is a string', () => {
      expect(getErrorMessage('String error message')).toBe('String error message');
    });

    it('should return message from object with message property', () => {
      const errorLike = { message: 'Object error message' };
      expect(getErrorMessage(errorLike)).toBe('Object error message');
    });

    it('should return default message for null', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
    });

    it('should return default message for undefined', () => {
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
    });

    it('should return default message for number', () => {
      expect(getErrorMessage(42)).toBe('An unknown error occurred');
    });

    it('should return default message for object without message', () => {
      expect(getErrorMessage({ code: 500 })).toBe('An unknown error occurred');
    });

    it('should convert non-string message to string', () => {
      const errorLike = { message: 123 };
      expect(getErrorMessage(errorLike)).toBe('123');
    });
  });

  describe('isError', () => {
    it('should return true for Error instance', () => {
      const error = new Error('Test');
      expect(isError(error)).toBe(true);
    });

    it('should return true for TypeError', () => {
      const error = new TypeError('Type error');
      expect(isError(error)).toBe(true);
    });

    it('should return true for custom Error subclass', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      const error = new CustomError('Custom');
      expect(isError(error)).toBe(true);
    });

    it('should return false for string', () => {
      expect(isError('error string')).toBe(false);
    });

    it('should return false for object with message', () => {
      expect(isError({ message: 'error' })).toBe(false);
    });

    it('should return false for null', () => {
      expect(isError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isError(undefined)).toBe(false);
    });

    it('should return false for number', () => {
      expect(isError(42)).toBe(false);
    });
  });
});
