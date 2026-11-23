import React, { useState } from 'react';
import APP_CONFIG from '../config';
import Logo from '../Logo';
export default function LoginScreen({ apiUrl, onLoginSuccess, onSignupClick, onBackToLanding }) {
  // آخر رقم هاتف سجّل به المستخدم (يُحفظ في الجهاز)
  const [phone, setPhone] = useState(() => {
    try { return localStorage.getItem('hfx_last_phone') || ''; } catch (e) { return ''; }
  });
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
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
        try { localStorage.setItem('hfx_last_phone', phone); } catch (e) {}
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
    window.open(`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent('أريد الاستفسار عن خدمة ' + APP_CONFIG.name)}`, '_blank');
};

  const handleForgot = () => {
    const msg = 'نسيت كلمة المرور في ' + APP_CONFIG.name + (phone ? '\nرقم هاتفي: ' + phone : '');
    window.open(`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };
  return (
    <div style={s.container}>
      <div style={s.card}>

        {/* الشعار */}
       <Logo size="lg" theme="dark" />

        {/* الحقول + زر الدخول (داخل نموذج ليعمل زر Enter وحفظ كلمة المرور في المتصفح) */}
        <form
          style={s.form}
          onSubmit={e => { e.preventDefault(); handleLogin(); }}
        >
          <div style={s.field}>
            <label style={s.label}>رقم الهاتف</label>
            <input
              style={s.input}
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="username"
              placeholder="أدخل رقم هاتفك"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>كلمة المرور</label>
            <div style={s.passWrap}>
              <input
                style={{ ...s.input, paddingLeft: '48px' }}
                type={showPass ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          {/* زر الدخول */}
          <button
            type="submit"
            style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
               </form>

        {/* نسيت كلمة المرور */}
        <button type="button" style={s.forgotLink} onClick={handleForgot}>
          نسيت كلمة المرور؟
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
    alignItems: 'center',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    width: '100%'
  },
  passWrap: {
    position: 'relative',
    width: '100%'
  },
  eyeBtn: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '6px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%'
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
    backgroundColor: '#fafafa',
    width: '100%',
    boxSizing: 'border-box'
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
    cursor: 'pointer',
    width: '100%'
  },
  btnOutline: {
    padding: '13px',
    backgroundColor: '#fff',
    color: '#006400',
    border: '2px solid #006400',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
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
    gap: '8px',
    width: '100%'
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    color: '#006400',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'underline',
    padding: 0
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