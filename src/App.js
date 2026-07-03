import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './LandingPage';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CustomerScreen from './screens/CustomerScreen';
import ProviderScreen from './screens/ProviderScreen';
import AdminScreen from './screens/AdminScreen';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const API_URL = 'https://anatli-server-production.up.railway.app';

const firebaseConfig = {
  apiKey: "AIzaSyC1oNPF1cNNmQA57gK1XJX6Ljo-De3Ph-8",
  authDomain: "anatli-466c7.firebaseapp.com",
  projectId: "anatli-466c7",
  storageBucket: "anatli-466c7.firebasestorage.app",
  messagingSenderId: "1013365864559",
  appId: "1:1013365864559:web:a052273bfba80cc506f59a"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('landing');
  const hasSyncedToken = useRef(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('hfx_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {}
    }
    setLoading(false);

    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('hfx_user');
    });
  }, []);

  // إعداد الإشعارات
  useEffect(() => {
    if (!user || !user.id || hasSyncedToken.current) return;

    const setupNotifications = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          const fcmToken = await getToken(messaging, {
            vapidKey: 'BMBDZUEh0rQ-ie5wqUWxEjh_OlfR8svQd_NAABdjcDpTG_fqlP_YZsQcW_9P8aPrXQ_eyT9CNGuwyaP3H3ph1_A',
            serviceWorkerRegistration: registration
          });

          if (fcmToken) {
            const token = localStorage.getItem('userToken');
            if (!token) return;

            await fetch(`${API_URL}/update-fcm-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ userId: user.id, fcmToken })
            });

            hasSyncedToken.current = true;
            console.log('✅ تم ربط الإشعارات بنجاح');
          }
        }
      } catch (err) {
        console.error('❌ خطأ في إعداد الإشعارات:', err);
      }
    };

    setupNotifications();

    const unsubscribe = onMessage(messaging, (payload) => {
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('hfx_user', JSON.stringify(userData));
    hasSyncedToken.current = false;
  };

  const handleLogout = () => {
    localStorage.removeItem('hfx_user');
    localStorage.removeItem('userToken');
    setUser(null);
    setCurrentView('landing');
    hasSyncedToken.current = false;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f4f7f6'
      }}>
        <h3 style={{ color: '#006400' }}>جاري التحميل...</h3>
      </div>
    );
  }

  if (user) {
    const role = user.user_role || user.role;
    if (role === 'admin') return <AdminScreen user={user} apiUrl={API_URL} onLogout={handleLogout} />;
    if (role === 'customer') return <CustomerScreen user={user} apiUrl={API_URL} onLogout={handleLogout} />;
    if (role === 'provider') return <ProviderScreen user={user} apiUrl={API_URL} onLogout={handleLogout} />;
  }

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLoginClick={() => setCurrentView('login')}
        onRegisterClick={() => setCurrentView('signup')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupScreen
        apiUrl={API_URL}
        onBack={() => setCurrentView('login')}
        onSuccess={() => setCurrentView('login')}
      />
    );
  }

  return (
    <LoginScreen
      apiUrl={API_URL}
      onLoginSuccess={handleLoginSuccess}
      onSignupClick={() => setCurrentView('signup')}
      onBackToLanding={() => setCurrentView('landing')}
    />
  );
}

export default App;