// 돌파구 Service Worker
// 오프라인 캐시 및 빠른 로딩을 위한 PWA

const CACHE_NAME = 'dolpagu-v1';

// 캐시할 파일들 (홈페이지 필수 리소스)
const STATIC_ASSETS = ['/', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png'];

// 설치 시 정적 파일 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 시 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 가로채기 (Network First 전략)
self.addEventListener('fetch', (event) => {
  // API 요청은 캐시하지 않음
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/rest/') ||
    event.request.url.includes('supabase')
  ) {
    return;
  }

  // GET 요청만 캐시
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 성공적인 응답을 캐시에 저장
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 반환
        return caches.match(event.request);
      })
  );
});
