import React, { useState, useEffect, useRef } from 'react'; 
import LandingPage from './LandingPage'; // أو حسب مكان حفظ الملف لديك
import LoginScreen from './screens/LoginScreen'; 
import AdminScreen from './screens/AdminScreen';
import CustomerScreen from './screens/CustomerScreen';
import ProviderScreen from './screens/ProviderScreen';
import SignupScreen from './screens/SignupScreen';
import OrdersStatusScreen from './screens/OrdersStatusScreen';
import PrivacyPolicy from './screens/PrivacyPolicy';

function App() {
    const OneSignal = window.plugins?.OneSignal;
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
    const API_URL = 'https://anatli-server-production.up.railway.app';
    
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
   // 2. منطق الإشعارات وتحديث التوكن بالسيرفر بعد الإصلاح
    useEffect(() => {
        if (!user || !user.id || hasSyncedToken.current) return;

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OS) => {
            try {
                await OS.init({
                    appId: "2b3b3f1e-eb5b-4154-bf69-cf9e44297fa9",
                    notifyButton: { enable: false },
                    allowLocalhostAsSecureOrigin: true,
                });

                await OS.login(user.id.toString());
                await OS.Notifications.requestPermission();

                const saveToken = async (id) => {
                    if (!id || hasSyncedToken.current) return;
                    
                    // جلب التوكن الصحيح لفك حظر صلاحيات السيرفر
                    const currentToken = token || JSON.parse(localStorage.getItem('anatli_user'))?.token;

                    await fetch(`${API_URL}/update-fcm-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`,
                        },
                        body: JSON.stringify({ userId: user.id, fcmToken: id })
                    });
                    hasSyncedToken.current = true;
                    console.log("✅ تم ربط الجهاز بنجاح");
                };

                // فحص آمن فوري لقراءة المعرف دون انهيار المتصفح
                const subId = OS.User?.pushSubscription?.id;
                if (subId) await saveToken(subId);

                // فحص متأخر آمن يحمي التطبيق من التوقف المفاجئ
                setTimeout(async () => {
                    const delayedSubId = OS.User?.pushSubscription?.id;
                    if (delayedSubId) {
                        await saveToken(delayedSubId);
                    }
                }, 3000);
            
            } catch (err) {
                console.error('❌ OneSignal Error:', err);
            }
        });
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