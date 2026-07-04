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
  const [showSplash, setShowSplash] = useState(true);
  const hasSyncedToken = useRef(false);
 
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);
 
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
 
  // ===== Splash Screen =====
  if (showSplash) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #006400 0%, #1a5c1a 50%, #006400 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, direction: 'rtl'
      }}>
        {/* الأيقونة */}
        <div style={{
          width: '110px', height: '110px',
          backgroundColor: '#ffc107',
          borderRadius: '28px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 15px 40px rgba(255,193,7,0.4)',
          marginBottom: '25px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* سقف المنزل */}
          <div style={{
            width: 0, height: 0,
            borderLeft: '42px solid transparent',
            borderRight: '42px solid transparent',
            borderBottom: '34px solid #333',
            position: 'absolute', top: '12px'
          }} />
          {/* جسم المنزل */}
          <div style={{
            position: 'absolute', bottom: '12px',
            width: '56px', height: '40px',
            backgroundColor: '#333', borderRadius: '3px 3px 0 0'
          }} />
          {/* باب */}
          <div style={{
            position: 'absolute', bottom: '12px',
            width: '18px', height: '24px',
            backgroundColor: '#ffc107', borderRadius: '3px 3px 0 0'
          }} />
          {/* نافذة يمين */}
          <div style={{
            position: 'absolute', bottom: '30px', right: '22px',
            width: '12px', height: '12px',
            backgroundColor: '#ffc107', borderRadius: '2px'
          }} />
          {/* نافذة يسار */}
          <div style={{
            position: 'absolute', bottom: '30px', left: '22px',
            width: '12px', height: '12px',
            backgroundColor: '#ffc107', borderRadius: '2px'
          }} />
        </div>
 
        {/* الاختصار */}
        <div style={{
          fontSize: '2.2rem', fontWeight: '900',
          color: '#ffc107', letterSpacing: '8px',
          fontFamily: 'Georgia, serif',
          marginBottom: '8px'
        }}>
          S.M.A.M
        </div>
 
        {/* خط فاصل */}
        <div style={{
          width: '60px', height: '2px',
          backgroundColor: 'rgba(255,193,7,0.4)',
          marginBottom: '12px'
        }} />
 
        {/* الاسم بالعربية */}
        <div style={{
          fontSize: '1rem', fontWeight: '700',
          color: '#fff', textAlign: 'center',
          lineHeight: 1.6, fontFamily: "'Tajawal', sans-serif",
          opacity: 0.9
        }}>
          الشركة الموريتانية
        </div>
        <div style={{
          fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)',
          fontFamily: "'Tajawal', sans-serif",
          marginBottom: '4px'
        }}>
          لتأمين إصلاح المنازل
        </div>
 
        {/* الاسم بالفرنسية */}
        <div style={{
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Georgia, serif', letterSpacing: '1px',
          marginTop: '4px'
        }}>
          Sté Mauritanienne d'Assurance de Maintenance
        </div>
 
        {/* نقاط التحميل */}
        <div style={{
          display: 'flex', gap: '8px', marginTop: '40px'
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              backgroundColor: i === 0 ? '#ffc107' : 'rgba(255,255,255,0.3)',
              animationName: 'pulse',
              animationDuration: `${0.8 + i * 0.2}s`,
              animationIterationCount: 'infinite',
              animationDirection: 'alternate'
            }} />
          ))}
        </div>
 
        <style>{`
          @keyframes pulse {
            from { opacity: 0.3; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }
 
  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#006400'
      }}>
        <h3 style={{ color: '#ffc107' }}>...</h3>
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
 