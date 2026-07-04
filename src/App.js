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
 
  // PWA Install
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
 
  // Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);
 
  // Android PWA Install
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBtn(true);
    });
  }, []);
 
  // iOS Guide
  useEffect(() => {
    if (isIOS && !isInStandaloneMode) {
      const timer = setTimeout(() => setShowIOSGuide(true), 4000);
      return () => clearTimeout(timer);
    }
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
          <div style={{
            width: 0, height: 0,
            borderLeft: '42px solid transparent',
            borderRight: '42px solid transparent',
            borderBottom: '34px solid #333',
            position: 'absolute', top: '12px'
          }} />
          <div style={{
            position: 'absolute', bottom: '12px',
            width: '56px', height: '40px',
            backgroundColor: '#333', borderRadius: '3px 3px 0 0'
          }} />
          <div style={{
            position: 'absolute', bottom: '12px',
            width: '18px', height: '24px',
            backgroundColor: '#ffc107', borderRadius: '3px 3px 0 0'
          }} />
          <div style={{
            position: 'absolute', bottom: '30px', right: '22px',
            width: '12px', height: '12px',
            backgroundColor: '#ffc107', borderRadius: '2px'
          }} />
          <div style={{
            position: 'absolute', bottom: '30px', left: '22px',
            width: '12px', height: '12px',
            backgroundColor: '#ffc107', borderRadius: '2px'
          }} />
        </div>
 
        <div style={{
          fontSize: '2.2rem', fontWeight: '900',
          color: '#ffc107', letterSpacing: '8px',
          fontFamily: 'Georgia, serif', marginBottom: '8px'
        }}>
          S.M.A.M
        </div>
 
        <div style={{
          width: '60px', height: '2px',
          backgroundColor: 'rgba(255,193,7,0.4)',
          marginBottom: '12px'
        }} />
 
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
          fontFamily: "'Tajawal', sans-serif", marginBottom: '4px'
        }}>
          لتأمين إصلاح المنازل
        </div>
 
        <div style={{
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Georgia, serif', letterSpacing: '1px', marginTop: '4px'
        }}>
          Sté Mauritanienne d'Assurance de Maintenance
        </div>
 
        <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
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
 
  return (
    <>
      {/* زر تثبيت Android */}
      {showInstallBtn && !user && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 9998,
          direction: 'rtl'
        }}>
          <button
            onClick={async () => {
              if (installPrompt) {
                await installPrompt.prompt();
                setShowInstallBtn(false);
              }
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#006400',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,100,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📲 ثبّت التطبيق
          </button>
        </div>
      )}
 
      {/* دليل iOS */}
      {showIOSGuide && !user && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '15px', right: '15px',
          background: '#fff', borderRadius: '20px',
          padding: '20px', zIndex: 9998,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          direction: 'rtl'
        }}>
          <button
            onClick={() => setShowIOSGuide(false)}
            style={{
              position: 'absolute', top: '12px', left: '12px',
              background: 'none', border: 'none',
              fontSize: '1.2rem', cursor: 'pointer', color: '#888'
            }}
          >✕</button>
          <h3 style={{ margin: '0 0 15px', color: '#006400', fontSize: '1rem' }}>
            📲 ثبّت التطبيق على هاتفك
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>1️⃣</span>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.5 }}>
              اضغط على زر المشاركة <strong>⬆️</strong> في أسفل المتصفح
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>2️⃣</span>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.5 }}>
              اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong>
            </p>
          </div>
        </div>
      )}
 
      {/* المحتوى الرئيسي */}
      {(() => {
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
      })()}
    </>
  );
}
 
export default App;
 