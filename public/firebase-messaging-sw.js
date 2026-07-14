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
    const data = payload.data || {};

    // إشعار مكالمة — نبنيه يدويًا بأزرار قبول/رفض
    if (data.type === 'call') {
        self.registration.showNotification('📞 مكالمة واردة', {
            body: `${data.customerName} يتصل بك الآن`,
            icon: '/icon-notif.png',
            badge: '/icon-notif.png',
            vibrate: [300, 100, 300, 100, 300],
            tag: 'incoming-call',
            renotify: true,
            requireInteraction: true,
            actions: [
                { action: 'accept-call', title: '✅ قبول' },
                { action: 'decline-call', title: '❌ رفض' }
            ],
            data: { type: 'call', channelName: data.channelName, customerName: data.customerName }
        });
        return;
    }

    // باقي الإشعارات العادية — بدون تغيير
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
        data: { url: 'https://sarm-mr.com' }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const data = event.notification.data || {};

    // نقرة على إشعار مكالمة — مرر channelName والإجراء (قبول/رفض) للتطبيق
    if (data.type === 'call' && data.channelName) {
        const action = event.action === 'decline-call' ? 'decline' : 'accept';
        const urlToOpen = `https://sarm-mr.com/?call=${data.channelName}&callAction=${action}`;

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
                for (let client of windowClients) {
                    if ('focus' in client) {
                        client.postMessage({ type: 'CALL_ACTION', channelName: data.channelName, action });
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
        return;
    }

    // النقرة على إشعار عادي — بدون تغيير
    const urlToOpen = event.notification.data?.url || 'https://sarm-mr.com';
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