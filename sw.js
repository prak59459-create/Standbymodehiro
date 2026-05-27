// StandBy Service Worker v2
// 省電力設計: アプリシェルのみキャッシュ、fetch 処理を最小化

const CACHE_NAME = 'standby-v2';
const CACHE_URLS = ['./', './index.html', './manifest.json'];

// Install: アプリシェルをキャッシュ（オフライン起動を保証）
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: 旧バージョンのキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: アプリシェルはキャッシュ優先、その他はネットワークのみ
self.addEventListener('fetch', event => {
  const { url } = event.request;

  // アプリシェル（index.html / manifest.json）: キャッシュ優先
  if (
    url.endsWith('/') ||
    url.includes('index.html') ||
    url.includes('manifest.json')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
    );
    return;
  }

  // 天気 API・アイコン等: ネットワークのみ
  // （天気は JS 側で localStorage キャッシュ済み、SW は介在しない）
});
