import { useState, useMemo } from 'react';

export interface RateLimitConfig {
  MAX_ATTEMPTS: number;
  LOCKOUT_DURATION: number;
}

export interface UseRateLimitingReturn {
  attempts: number;
  lockoutUntil: number | null;
  isLockedOut: boolean;
  remainingSeconds: number;
  incrementAttempts: () => void;
  resetAttempts: () => void;
}

/**
 * Rate Limiting 훅
 * @param config - Rate limit 설정 (MAX_ATTEMPTS, LOCKOUT_DURATION)
 * @returns Rate limiting 상태 및 제어 함수들
 */
export function useRateLimiting(config: RateLimitConfig): UseRateLimitingReturn {
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // 현재 잠금 상태 확인
  const isLockedOut = useMemo(() => {
    return lockoutUntil !== null && Date.now() < lockoutUntil;
  }, [lockoutUntil]);

  // 남은 잠금 시간 (초)
  const remainingSeconds = useMemo(() => {
    if (!lockoutUntil || Date.now() >= lockoutUntil) {
      return 0;
    }
    return Math.ceil((lockoutUntil - Date.now()) / 1000);
  }, [lockoutUntil]);

  /**
   * 시도 횟수 증가 및 잠금 처리
   */
  const incrementAttempts = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // 최대 시도 횟수 초과 시 잠금
    if (newAttempts >= config.MAX_ATTEMPTS) {
      setLockoutUntil(Date.now() + config.LOCKOUT_DURATION);
    }
  };

  /**
   * 시도 횟수 및 잠금 초기화
   */
  const resetAttempts = () => {
    setAttempts(0);
    setLockoutUntil(null);
  };

  return {
    attempts,
    lockoutUntil,
    isLockedOut,
    remainingSeconds,
    incrementAttempts,
    resetAttempts,
  };
}
