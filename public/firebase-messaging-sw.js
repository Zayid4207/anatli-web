importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// إعدادات مشروع Firebase الخاص بك (استبدل القيم بالقيم الخاصة بمشروعك)
firebase.initializeApp({
   apiKey: "AIzaSyC1oNPF1cNNmQA57gK1XJX6Ljo-De3Ph-8",
  authDomain: "anatli-466c7.firebaseapp.com",
  projectId: "anatli-466c7",
  storageBucket: "anatli-466c7.firebasestorage.app",
  messagingSenderId: "1013365864559",
  appId: "1:1013365864559:web:a052273bfba80cc506f59a",
});

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية (عند إغلاق التطبيق)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] تم استلام إشعار في الخلفية: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'icon.png.png' // أيقونة تطبيقك
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});