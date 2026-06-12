import React, { useState, useEffect, useRef } from 'react'; 
import LandingPage from './LandingPage'; // أو حسب مكان حفظ الملف لديك
import LoginScreen from './screens/LoginScreen'; 
import AdminScreen from './screens/AdminScreen';
import CustomerScreen from './screens/CustomerScreen';
import ProviderScreen from './screens/ProviderScreen';
import SignupScreen from './screens/SignupScreen';
import OrdersStatusScreen from './screens/OrdersStatusScreen';
import PrivacyPolicy from './screens/PrivacyPolicy';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyC1oNPF1cNNmQA57gK1XJX6Ljo-De3Ph-8",
  authDomain: "anatli-466c7.firebaseapp.com",
  projectId: "anatli-466c7",
  storageBucket: "anatli-466c7.firebasestorage.app",
  messagingSenderId: "1013365864559",
  appId: "1:1013365864559:web:a052273bfba80cc506f59a",
  measurementId: "G-BYPHQEQGR8"
};

function App() {
    const firebaseApp = initializeApp(firebaseConfig);
    const messaging = getMessaging(firebaseApp);
    const [token, setToken] = useState(null); 
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [initialOrderId, setInitialOrderId] = useState(null);
    const [user, setUser] = useState(null); 
    const [userRole, setUserRole] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [showSignup, setShowSignup] = useState(false);
    const [currentView, setCurrentView] = useState('landing'); // إدارة التنقل للزوار الجدد

    // --- إضافة PWA Install Banner ---
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

        if (isInStandaloneMode) return; // مثبت بالفعل، لا تظهر الشريط

        if (ios) {
            setIsIOS(true);
            setShowInstallBanner(true);
        }

        // Android
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBanner(true);
        });
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                setDeferredPrompt(null);
                setShowInstallBanner(false);
            });
        }
    };
    // --- نهاية إضافة PWA Install Banner ---
    
    const hasSyncedToken = useRef(false);
    // أضف https:// في بداية الرابط ليعمل بالشكل الصحيح مع المتصفح
   const API_URL = 'https://thomas.proxy.rlwy.net:40911';
   
    
    // 1. منطق الشاشة الترحيبية (5 ثوانٍ) + استعادة المستخدم
    useEffect(() => {
        // مؤقت الشاشة الترحيبية
      

        // استعادة بيانات المستخدم والتوكن
        const savedUser = localStorage.getItem('anatli_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setUserRole(parsedUser.role || parsedUser.user_role);
                if (parsedUser.token) {
                    setToken(parsedUser.token);
                }
            } catch (e) {
                console.error("Error parsing saved user:", e);
            }
        }

        // التقاط رقم الطلب من الرابط
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        if (orderId) setInitialOrderId(orderId);

        setLoading(false);

        // منطق فرض تسجيل الدخول عند إغلاق الموقع
        const handleExit = () => {
            const savedUserForExit = localStorage.getItem('anatli_user');
            if (savedUserForExit) {
                try {
                    const parsedUser = JSON.parse(savedUserForExit);
                    if (parsedUser.phone) {
                        localStorage.setItem('remembered_phone', parsedUser.phone);
                    }
                } catch (e) {}
            }
            localStorage.removeItem('anatli_user');
        };

        window.addEventListener('beforeunload', handleExit);
        return () => {
        
            window.removeEventListener('beforeunload', handleExit);
        };
    }, []);

    // 2. منطق الإشعارات وتحديث التوكن
   useEffect(() => {
    if (!user || !user.id || hasSyncedToken.current) return;
const requestNotificationPermission = async () => {
    try {
        // 1. تسجيل ملف الـ Service Worker يدوياً للتأكد من أن Vercel تقرأه كملف برمجي صحيح
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ تم تسجيل Service Worker بنجاح بالنطاق:', registration.scope);

        // 2. طلب الإذن من المتصفح لاستقبال الإشعارات
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // 3. جلب التوكن مع تمرير التسجيل الصريح (serviceWorkerRegistration)
            const currentFcmToken = await getToken(messaging, { 
                vapidKey: 'BMBDZUEh0rQ-ie5wqUWxEjh_OlfR8svQd_NAABdjcDpTG_fqlP_YZsQcW_9P8aPrXQ_eyT9CNGuwyaP3H3ph1_A'.trim(),
                serviceWorkerRegistration: registration // الربط المباشر هنا لحل مشكلة Vercel
            });

            if (currentFcmToken) {
                console.log("🔥 التوكن الجديد المستخرج من Firebase هو:", currentFcmToken);
                const savedUserData = localStorage.getItem('anatli_user');
                let currentToken = token;
                
                if (savedUserData) {
                    try { currentToken = JSON.parse(savedUserData).token; } catch(e) {}
                }

                if (!currentToken) return;

                // إرسال التوكن الجديد إلى السيرفر لحفظه
                await fetch(`${API_URL}/update-fcm-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({ userId: user.id, fcmToken: currentFcmToken })
                });

                hasSyncedToken.current = true;
                console.log("✅ تم ربط المتصفح بنجاح بـ Firebase Messaging");
            } else {
                console.log('❌ فشل جلب توكن الـ FCM للمتصفح.');
            }
        } else {
            console.log('❌ تم رفض إذن الإشعارات من قبل المستخدم.');
        }
    } catch (err) {
        console.error('❌ خطأ أثناء إعداد Firebase إشعارات:', err);
    }
};
    
    requestNotificationPermission();

    // الاستماع للإشعارات الفورية عندما يكون التطبيق مفتوحاً في الواجهة (Foreground)
    const unsubscribe = onMessage(messaging, (payload) => {
        console.log('📱 إشعار فوري وصل والتطبيق مفتوح: ', payload);
        alert(`${payload.notification.title}\n${payload.notification.body}`);
    });

    return () => unsubscribe();
}, [user, token, API_URL]);

    const handleLogout = () => {
        if (window.plugins?.OneSignal) {
            window.plugins.OneSignal.logout();
        }
        localStorage.removeItem('anatli_user');
        hasSyncedToken.current = false;
        setUser(null);
        setUserRole(null);
        setToken(null);
        setCurrentView('landing'); // نعود بالعميل إلى الواجهة التعريفية عند الخروج
    };

    const handleLoginSuccess = (userData) => {
        const role = userData.role || userData.user_role;
        setUserRole(role);
        setUser(userData);
        if (userData.token) setToken(userData.token);
        localStorage.setItem('anatli_user', JSON.stringify(userData));
    };

    // --- منطق العرض (العرض المشروط) ---

    // أولاً: إذا كان التحميل الأولي لم ينتهِ
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <h3 style={{ color: '#2563eb' }}>جار تحميل موقع :Le Plombier</h3>
            </div>
        );
    }

    // ثالثاً: الواجهة الرئيسية للتطبيق
    return (
        <div className="App">
            {/* --- شريط تثبيت PWA --- */}
            {showInstallBanner && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    backgroundColor: '#2563eb', color: 'white',
                    padding: '12px 16px', textAlign: 'center',
                    zIndex: 9999, fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}>
                    {isIOS ? (
                        <span>📲 لتثبيت التطبيق: اضغط ⬆️ ثم "إضافة إلى الشاشة الرئيسية"</span>
                    ) : (
                        <span onClick={handleInstallClick} style={{ cursor: 'pointer' }}>
                            📲 ثبّت تطبيق Le plombier على هاتفك - اضغط هنا!
                        </span>
                    )}
                    <button onClick={() => setShowInstallBanner(false)} style={{
                        background: 'none', border: '1px solid white',
                        color: 'white', borderRadius: '4px',
                        padding: '2px 8px', cursor: 'pointer'
                    }}>✕</button>
                </div>
            )}
            {/* --- نهاية شريط تثبيت PWA --- */}
            
            {showPrivacy ? (
                <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
            ) : (
                <>
                    {!user ? (
                        /* الفلترة الذكية للزوار غير المسجلين */
                        currentView === 'landing' ? (
                            <LandingPage 
                                onLoginClick={() => setCurrentView('login')} 
                                onRegisterClick={() => {
                                    setCurrentView('login');
                                    setShowSignup(true);
                                }}
                            />
                        ) : showSignup ? (
                            <SignupScreen onBack={() => setShowSignup(false)} apiUrl={API_URL} />
                        ) : (
                            <LoginScreen 
                                onSignupClick={() => setShowSignup(true)} 
                                onLoginSuccess={handleLoginSuccess}
                                apiUrl={API_URL}
                                onPrivacyClick={() => setShowPrivacy(true)}
                                onBackToLanding={() => setCurrentView('landing')} // للعودة إذا رغب العميل
                            />
                        )
                    ) : (
                        <>
                            {userRole === 'admin' && <AdminScreen user={user} token={token} apiUrl={API_URL} onLogout={handleLogout} />}
                            {userRole === 'customer' && <CustomerScreen user={user} token={token} apiUrl={API_URL} onLogout={handleLogout} />}
                            {userRole === 'provider' && <ProviderScreen user={user} token={token} apiUrl={API_URL} onLogout={handleLogout} targetOrderId={initialOrderId} />}

                            {!userRole && (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <p>عذراً، لم يتم تحديد صلاحيات لحسابك.</p>
                                    <button onClick={handleLogout} style={styles.logoutBtn}>العودة لتسجيل الدخول</button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

const styles = {
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
    logoutBtn: { padding: '8px 15px', backgroundColor: '#d9534f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default App;