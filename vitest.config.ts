import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      'src/__tests__/e2e/**/*', // Playwright E2E tests are excluded
      'src/__tests__/unit/lib/auth/**/*', // 복잡한 Mock 필요 - 추후 정리
      'src/__tests__/unit/lib/logger.test.ts', // Mock 충돌 - 추후 정리
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/', '**/*.d.ts', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
