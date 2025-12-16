import { vi } from 'vitest';

/**
 * 공통 Logger Mock
 * 모든 테스트에서 재사용 가능한 로거 목업
 */

export const createMockLogger = () => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
});

/**
 * Logger 모킹
 * @example
 * ```ts
 * import { mockLogger } from '@/__tests__/mocks/logger';
 *
 * const logger = mockLogger();
 * // 테스트 실행 후
 * expect(logger.error).toHaveBeenCalledWith('Error message');
 * ```
 */
export const mockLogger = () => {
  const logger = createMockLogger();

  vi.mock('@/lib/logger', () => ({
    logger,
  }));

  return logger;
};
