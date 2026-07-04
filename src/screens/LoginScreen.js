import React, { useState } from 'react';
import APP_CONFIG from '../config';
import Logo from '../Logo';
export default function LoginScreen({ apiUrl, onLoginSuccess, onSignupClick, onBackToLanding }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) { setError('يرجى ملء جميع الحقول'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userToken', data.token);
        onLoginSuccess({ ...data.user, token: data.token });
      } else {
        setError(data.error || 'خطأ في تسجيل الدخول');
      }
    } catch (err) {
      setError('فشل الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

 const handleWhatsApp = () => {
    window.open(`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent('أريد الاستفسار عن خدمة ' + APP_CONFIG.taglineAr)}`, '_blank');
};
  return (
    <div style={s.container}>
      <div style={s.card}>

        {/* الشعار */}
       <Logo size="xl" theme="dark" />

        {/* الحقول */}
        <div style={s.field}>
          <label style={s.label}>رقم الهاتف</label>
          <input
            style={s.input}
            type="text"
            placeholder="أدخل رقم هاتفك"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>كلمة المرور</label>
          <input
            style={s.input}
            type="password"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p style={s.error}>{error}</p>}

        {/* زر الدخول */}
        <button
          style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
        </button>

        {/* زر إنشاء حساب */}
        <button style={s.btnOutline} onClick={onSignupClick}>
          إنشاء حساب جديد
        </button>

        {/* زر واتساب */}
        <button style={s.btnWhatsapp} onClick={handleWhatsApp}>
          <span>💬</span> تواصل مع الدعم
        </button>

        {/* رجوع للرئيسية */}
        <button style={s.backLink} onClick={onBackToLanding}>
          ← العودة للصفحة الرئيسية
        </button>

      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f0',
    padding: '20px',
    direction: 'rtl'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '35px 25px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 40px rgba(0,100,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: '10px'
  },
  logoIcon: {
    fontSize: '3rem',
    marginBottom: '8px'
  },
  logoText: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '900',
    color: '#006400'
  },
  logoSub: {
    margin: '5px 0 0 0',
    color: '#888',
    fontSize: '0.9rem'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#444'
  },
  input: {
    padding: '13px 15px',
    borderRadius: '12px',
    border: '1.5px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    textAlign: 'right',
    backgroundColor: '#fafafa'
  },
  error: {
    color: '#e53e3e',
    fontSize: '0.85rem',
    textAlign: 'center',
    margin: 0
  },
  btnPrimary: {
    padding: '14px',
    backgroundColor: '#006400',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnOutline: {
    padding: '13px',
    backgroundColor: '#fff',
    color: '#006400',
    border: '2px solid #006400',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnWhatsapp: {
    padding: '12px',
    backgroundColor: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textAlign: 'center'
  }
};