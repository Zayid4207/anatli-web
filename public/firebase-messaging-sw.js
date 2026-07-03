importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC1oNPF1cNNmQA57gK1XJX6Ljo-De3Ph-8",
    authDomain: "anatli-466c7.firebaseapp.com",
    projectId: "anatli-466c7",
    storageBucket: "anatli-466c7.firebasestorage.app",
    messagingSenderId: "1013365864559",
    appId: "1:1013365864559:web:a052273bfba80cc506f59a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || "إشعار جديد";
    const notificationOptions = {
        body: payload.notification?.body || "",
        icon: '/icon-notif.png',
        badge: '/icon-notif.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'homefix-notification',
        renotify: true,
        requireInteraction: true,
        actions: [{ action: 'open', title: 'فتح التطبيق' }],
        data: { url: 'https://leplombiermr.com' }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || 'https://leplombiermr.com';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});