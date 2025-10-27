importScripts('/firebase-app-compat.js');
importScripts('/firebase-messaging-compat.js');

let cacheVersion = null;

// Fetch the version sent from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_VERSION') {
        cacheVersion = event.data.version;
    }
});

// Service Worker installation event
self.addEventListener('install', (event) => {
    const version = cacheVersion || 'v1'; // Fallback to 'v1' if no version set
    const CACHE_NAME = `firebase-auth-cache-${version}`;
    const AUTH_URL = '/firebase-auth.json';

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(AUTH_URL);
        })
    );
});

// Fetch event: Serve cached Firebase configuration or fetch it if not available
self.addEventListener('fetch', (event) => {
    const version = cacheVersion || 'v1'; // Fallback to 'v1' if no version set
    const CACHE_NAME = `firebase-auth-cache-${version}`;
    const AUTH_URL = '/firebase-auth.json';

    if (event.request.url.includes(AUTH_URL)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return (
                    cachedResponse ||
                    fetch(event.request).then((response) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, response.clone());
                            return response;
                        });
                    })
                );
            })
        );
    }
});

// Firebase initialization with background message handler
fetch('/firebase-auth.json')
    .then((response) => response.json())
    .then((firebaseConfig) => {
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            // Check if there are active clients
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
                if (clients.length > 0) {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'NEW_NOTIFICATION',
                            payload,
                        });
                    });
                } else {
                    self.registration.showNotification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: '/new_favicon.png'
                    });
                }
            });
        });

    })
    .catch((error) => {
        console.error('Failed to load Firebase configuration:', error);
    });

// Activation event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [`firebase-auth-cache-${cacheVersion || 'v1'}`];
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );

    // Claim any clients immediately
    event.waitUntil(self.clients.claim());
});
