import { useState, useCallback } from 'react';

/**
 * 여러 로딩 상태를 관리하는 훅
 *
 * 사용 예시:
 * ```typescript
 * const { states, setLoading, withLoading } = useLoadingStates({
 *   loading: false,
 *   uploading: false,
 *   deleting: false
 * })
 *
 * // 방법 1: 수동으로 상태 변경
 * setLoading('uploading', true)
 * await uploadFile()
 * setLoading('uploading', false)
 *
 * // 방법 2: 자동으로 상태 관리
 * await withLoading('uploading', async () => {
 *   await uploadFile()
 * })
 * ```
 */
export function useLoadingStates<T extends Record<string, boolean>>(initialStates: T) {
  const [states, setStates] = useState<T>(initialStates);

  /**
   * 특정 로딩 상태 변경
   */
  const setLoading = useCallback((key: keyof T, value: boolean) => {
    setStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * 함수 실행 중 자동으로 로딩 상태 관리
   */
  const withLoading = useCallback(
    async <R>(key: keyof T, fn: () => Promise<R>): Promise<R> => {
      setLoading(key, true);
      try {
        return await fn();
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading]
  );

  /**
   * 모든 상태 초기화
   */
  const resetAll = useCallback(() => {
    setStates(initialStates);
  }, [initialStates]);

  /**
   * 특정 상태만 초기화
   */
  const reset = useCallback(
    (key: keyof T) => {
      setStates((prev) => ({ ...prev, [key]: initialStates[key] }));
    },
    [initialStates]
  );

  return {
    states,
    setLoading,
    withLoading,
    resetAll,
    reset,
  };
}
