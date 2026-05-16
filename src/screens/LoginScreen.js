import React, { useState } from 'react';

// التعديل 1: إضافة onPrivacyClick في الـ Props
const LoginScreen = ({ onSignupClick, onLoginSuccess, onPrivacyClick }) => {
  const [phone, setPhone] = useState(localStorage.getItem('remembered_phone') || '');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('ar'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const content = {
    ar: { 
      contact:'تواصل مع الدعم الفني ',
      signupBtn:'أنشئ حساباً جديداً',
      title: 'تسجيل الدخول', 
      phone: 'رقم الهاتف', 
      pass: 'كلمة المرور', 
      btn: 'دخول', 
      signupLink: 'ليس لديك حساب؟ أنشئ حساباً جديداً هنا',
      privacy: 'سياسة الخصوصية', // التعديل 2: إضافة الترجمة العربية
      authError: 'رقم الهاتف أو كلمة المرور غير صحيحة',
      connError: 'فشل الاتصال بالسيرفر. تأكد من تشغيل الـ Backend'
    },
    fr: {
      contact :'Contactez le support technique', 
      signupBtn:'Créer un compte', 
      title: 'Connexion', 
      phone: 'Téléphone', 
      pass: 'Mot de passe', 
      btn: 'Entrer', 
      signupLink: "N'avez-vous pas de compte ? Créez-en un ici",
      privacy: 'Politique de confidentialité', // التعديل 2: إضافة الترجمة الفرنسية
      authError: 'Identifiants incorrects',
      connError: 'Erreur de connexion au serveur'
    }
  };
const handleContactUs = () => {
    const adminPhone = "22242072952"; 
    const message = lang === 'ar' 
        ? "السلام عليكم، أريد الاستفسار عن تطبيق أنعتلي" 
        : "Bonjour, je souhaite me renseigner sur l'application ANATLI";
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://anatli-server.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      const data = await response.json();

      if (response.ok) {
        // --- التعديل المطلوب لحفظ التوكن في الواجهة ---
        localStorage.setItem('userToken', data.token); // حفظ مفتاح الأمان
        localStorage.setItem('userData', JSON.stringify(data.user)); // حفظ بيانات المستخدم
        localStorage.setItem('remembered_phone', phone); // تذكر الرقم للمرة القادمة
        onLoginSuccess(data.user);
      } else {
        setError(data.error || content[lang].authError);
      }
    } catch (err) {
      setError(content[lang].connError);
      console.error("Login Connection Error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = () => {
    const adminPhone = "22242072952"; // ضع هنا رقم الواتساب الخاص بإدارة أنعتلي
    const message = lang === 'ar' 
        ? `السلام عليكم، لقد نسيت كلمة المرور الخاصة بحسابي المرتبط بهذا الرقم: ${phone}`
        : `Bonjour, j'ai oublié mon mot de passe pour mon compte lié à ce numéro: ${phone}`;
    
    // فتح رابط واتساب
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
};

  return (
    <div style={styles.container}>
      <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={styles.langBtn}>
        {lang === 'ar' ? 'Français' : 'العربية'}
      </button>

      <div style={styles.card}>
        <h1 style={styles.logo}>ANATLI</h1>
        <h2 style={styles.title}>{content[lang].title}</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{content[lang].phone}</label>
            <input 
              type="text" 
              placeholder={content[lang].phone} 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              style={styles.input} 
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{content[lang].pass}</label>
            <input 
              type="password" 
              placeholder={content[lang].pass} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={styles.input} 
              required
              />
               <button 
              type="button" 
               onClick={handleForgotPassword} 
             style={styles.forgotPassBtn}
>
           {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
             </button>
          </div>
          
          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (lang === 'ar' ? 'جاري التحقق...' : 'Vérification...') : content[lang].btn}
          </button>

       {/* الفاصل بين الأزرار */}
          <div style={styles.divider}>
            <span style={styles.dividerText}>{content[lang].noAccount}</span>
          </div>

          {/* زر إنشاء حساب جديد المعدل */}
          <button type="button" onClick={onSignupClick} style={styles.signupButton}>
            {content[lang].signupBtn}
          </button>
          {/* زر واتساب الجديد */}
          <button type="button" onClick={handleContactUs} style={styles.whatsappBtn}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
              alt="WhatsApp" 
              style={styles.whatsappIcon} 
            />
            {content[lang].contact}
          </button>

          {/* التعديل 3: إضافة زر سياسة الخصوصية */}
         <button 
         type="button" 
         onClick={onPrivacyClick} 
        style={styles.privacyLink} // استخدام الستايل الجديد هنا
>
            {content[lang].privacy}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  // ... جميع الستايلات القديمة تبقى كما هي، فقط سنضيف ستايل الزر الجديد ...
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#f4f7f6', direction: 'rtl', position: 'relative', padding: '20px', boxSizing: 'border-box' },
  card: { background: '#fff', padding: '30px 20px', borderRadius: '25px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,100,0,0.08)', border: '1px solid #eef2f1', boxSizing: 'border-box' },
  logo: { color: '#006400', marginBottom: '8px', fontSize: '2.2rem', fontWeight: 'bold', letterSpacing: '1px' },
  title: { fontSize: '1.1rem', color: '#666', marginBottom: '25px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'right' },
  label: { fontSize: '0.9rem', color: '#006400', fontWeight: '600', marginRight: '5px' },
  input: { padding: '14px', borderRadius: '12px', border: '1px solid #ddd', textAlign: 'right', outline: 'none', backgroundColor: '#f9f9f9', fontSize: '1rem', width: '100%', boxSizing: 'border-box' },
  button: { padding: '14px', backgroundColor: '#006400', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' },
  langBtn: { position: 'absolute', top: '15px', right: '15px', padding: '6px 14px', cursor: 'pointer', border: '1px solid #006400', borderRadius: '8px', background: '#fff', fontSize: '0.85rem' },
  linkBtn: { background: 'none', border: 'none', color: '#006400', cursor: 'pointer', textDecoration: 'underline', marginTop: '5px', fontSize: '0.9rem', padding: '10px' },
  errorText: { color: '#d9534f', fontSize: '0.85rem', textAlign: 'right' },
  
  // ستايل زر الخصوصية الجديد
 // ستايل رابط الخصوصية الجديد والأنيق
  privacyLink: {
    background: 'none',
    border: 'none',
    color: '#006400', // نفس لون هوية التطبيق الأخضر
    cursor: 'pointer',
    textDecoration: 'none', // بدون خط تحته في البداية
    fontSize: '0.85rem', // حجم أنسب للقراءة
    marginTop: '15px', // مسافة جيدة عن الزر العلوي
    padding: '5px',
    transition: 'all 0.3s ease', // تأثير ناعم
    fontWeight: '500',
    opacity: 0.8 // شفافية بسيطة لجعل التركيز على الأزرار الأساسية
  },
  forgotPassBtn: {
    background: 'none',
    border: 'none',
    color: '#d9534f', // لون أحمر هادئ للتنبيه
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginTop: '10px',
    textAlign: 'center',
    fontWeight: '500',
    textDecoration: 'none'
  },
  signupButton: { 
    padding: '12px', 
    backgroundColor: '#fff', 
    color: '#006400', 
    border: '2px solid #006400', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: '1rem',
    transition: '0.3s'
  },
  whatsappBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: '#25D366', // لون واتساب الرسمي
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    marginTop: '10px',
    transition: '0.3s',
  },
  whatsappIcon: {
    width: '20px',
    height: '20px',
  },
};

export default LoginScreen;