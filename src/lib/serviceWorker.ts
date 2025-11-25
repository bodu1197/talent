import { logger } from '@/lib/logger';

export function registerServiceWorker() {
  if (typeof globalThis !== 'undefined' && 'serviceWorker' in navigator) {
    globalThis.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered:', { scope: registration.scope });
        })
        .catch((error) => {
          logger.error('Service Worker registration failed:', error);
        });
    });
  }
}
