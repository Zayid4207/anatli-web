import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CustomerScreen from './screens/CustomerScreen';
import ProviderScreen from './screens/ProviderScreen';
import AdminScreen from './screens/AdminScreen';

const API_URL = 'https://anatli-server-production.up.railway.app';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('landing');

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

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('hfx_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('hfx_user');
    setUser(null);
    setCurrentView('landing');
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

  // --- المستخدم مسجل الدخول ---
  if (user) {
    const role = user.user_role || user.role;
    if (role === 'admin') return <AdminScreen user={user} apiUrl={API_URL} onLogout={handleLogout} />;
    if (role === 'customer') return <CustomerScreen user={user} apiUrl={API_URL} onLogout={handleLogout} />;
    if (role === 'provider') return <ProviderScreen user={user} apiUrl={API_URL} onLogout={handleLogout} />;
  }

  // --- الزوار ---
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