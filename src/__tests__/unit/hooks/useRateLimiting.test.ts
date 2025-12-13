import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimiting } from '@/hooks/useRateLimiting';

describe('useRateLimiting', () => {
  const defaultConfig = {
    MAX_ATTEMPTS: 3,
    LOCKOUT_DURATION: 60000, // 1 minute
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with 0 attempts', () => {
      const { result } = renderHook(() => useRateLimiting(defaultConfig));

      expect(result.current.attempts).toBe(0);
      expect(result.current.lockoutUntil).toBeNull();
      expect(result.current.isLockedOut).toBe(false);
      expect(result.current.remainingSeconds).toBe(0);
    });
  });

  describe('incrementAttempts', () => {
    it('should increment attempts count', () => {
      const { result } = renderHook(() => useRateLimiting(defaultConfig));

      act(() => {
        result.current.incrementAttempts();
      });

      expect(result.current.attempts).toBe(1);
    });

    it('should increment attempts multiple times sequentially', () => {
      const { result } = renderHook(() => useRateLimiting(defaultConfig));

      act(() => {
        result.current.incrementAttempts();
      });
      act(() => {
        result.current.incrementAttempts();
      });

      expect(result.current.attempts).toBe(2);
      expect(result.current.isLockedOut).toBe(false);
    });

    it('should lock out after max attempts', () => {
      const { result } = renderHook(() => useRateLimiting(defaultConfig));

      act(() => {
        result.current.incrementAttempts();
      });
      act(() => {
        result.current.incrementAttempts();
      });
      act(() => {
        result.current.incrementAttempts();
      });

      expect(result.current.attempts).toBe(3);
      expect(result.current.isLockedOut).toBe(true);
    });
  });

  describe('resetAttempts', () => {
    it('should reset attempts to zero', () => {
      const { result } = renderHook(() => useRateLimiting(defaultConfig));

      act(() => {
        result.current.incrementAttempts();
      });
      act(() => {
        result.current.incrementAttempts();
      });

      expect(result.current.attempts).toBe(2);

      act(() => {
        result.current.resetAttempts();
      });

      expect(result.current.attempts).toBe(0);
      expect(result.current.lockoutUntil).toBeNull();
      expect(result.current.isLockedOut).toBe(false);
    });
  });

  describe('remainingSeconds', () => {
    it('should return 0 when not locked out', () => {
      const { result } = renderHook(() => useRateLimiting(defaultConfig));

      expect(result.current.remainingSeconds).toBe(0);
    });
  });
});
