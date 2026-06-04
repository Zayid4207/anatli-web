import React, { useState } from 'react';

const SignupScreen = ({ onBack, apiUrl }) => {
  const [step, setStep] = useState(1); 
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [serviceType, setServiceType] = useState('');
  const [lang, setLang] = useState('ar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // توليد كود عشوائي للتحقق يظهر للمستخدم ليرسله عبر الواتساب
  const [verificationCode] = useState(Math.floor(1000 + Math.random() * 9000).toString());

  // --- جديد: state الخاص بـ OTP ---
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const services = [
    { id: 'plumbing', ar: 'سباكة', fr: 'Plomberie', icon: '🚰' },
    { id: 'electricity', ar: 'كهرباء', fr: 'Électricité', icon: '⚡' },
    { id: 'maintenance', ar: 'صيانة', fr: 'Maintenance', icon: '🛠️' },
    { id: 'cleaning', ar: 'تنظيف', fr: 'Nettoyage', icon: '🧹' },
    { id: 'air_conditioning', ar: 'تكييف', fr: 'Climatisation', icon: '❄️' },
    { id: 'construction', ar: 'بناء', fr: 'Construction', icon: '🏗️' },
  ];

  const content = {
    ar: {
      title: 'انضم إلى أنعتلي', subtitle: 'أنشئ حسابك وابدأ الاستخدام الآن',
      name: 'الاسم الكامل', phone: 'رقم الهاتف (مثلاً +222...)',
      pass: 'كلمة المرور', confirmPass: 'تأكيد كلمة المرور',
      roleLabel: 'كيف ستستخدم التطبيق؟', customer: 'أنا زبون',
      customerDesc: 'أبحث عن خدمات', provider: 'مقدم خدمة',
      providerDesc: 'أريد تقديم خدماتي', serviceLabel: 'ما هو تخصصك المهني؟',
      btn:'إنشاء وتفعيل الحساب ', next :'التالي', prev:'رجوع',
      back: 'لديك حساب؟ سجل دخولك', success: 'تم تسجيل بياناتك! يرجى إرسال رسالة الواتساب الآن لتفعيل حسابك.',
      errorMatch: 'كلمات المرور غير متطابقة', 
      errorFields: 'يرجى ملء جميع الحقول', errorService: 'يرجى اختيار نوع الخدمة',
      whatsappNote: 'سيتم فتح واتساب لإرسال كود التفعيل: '
    },
    fr: {
      title: 'Rejoindre ANATLI', subtitle: 'Créez votre compte et commencez',
      name: 'Nom Complet', phone: 'Téléphone (ex: +222...)',
      pass: 'Mot de passe', confirmPass: 'Confirmer',
      roleLabel: 'Comment utiliser l\'app ?', customer: 'Client',
      customerDesc: 'Je cherche des services', provider: 'Prestataire',
      providerDesc: 'Je propose mes services', serviceLabel: 'Quelle est votre spécialité ?',
      btn: 'S\'inscrire et valider le compte', next: 'Suivant', prev: 'Retour',
      back: 'Déjà inscrit? Connexion', success: 'Inscription réussie! Envoyez le message WhatsApp pour activer.',
      errorMatch: 'Mots de passe non identiques', 
      errorFields: 'Veuillez remplir tous les champs', errorService: 'Veuillez choisir un service',
      whatsappNote: 'WhatsApp va s\'ouvrir avec le code: '
    }
  };

  const c = content[lang];

  const handleNextStep = () => {
    if (!fullName || !phone || !password || !confirmPassword) {
      setError(c.errorFields); return;
    }
    if (password !== confirmPassword) {
      setError(c.errorMatch); return;
    }
    setError(null);
    setStep(2);
  };

  // --- جديد: إرسال OTP ---
  // 1. الدالة الأولى: إرسال البيانات للسيرفر لإنشاء الحساب وتوليد الـ OTP
  const handleSignupAndSendOtp = async () => {
    if (role === 'provider' && !serviceType) {
      setError(c.errorService); return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const cleanedPhone = phone.trim().replace(/\s+/g, '');
      
      const response = await fetch('https://anatli-server-production.up.railway.app/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone: cleanedPhone,
          password: password,
          role: role,
          service_type: role === 'provider' ? serviceType : null
        }),
      });

      const data = await response.json();
if (response.ok) {
        // توليد رمز OTP وإرساله للسيرفر
        const otpRes = await fetch('https://anatli-server-production.up.railway.app/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanedPhone }),
        });
        const otpData = await otpRes.json();

        if (otpRes.ok) {
          // فتح واتساب برسالة تحتوي الرمز
          const message = `أنعتلي - رمز التحقق الخاص بي: ${otpData.otp}`;
          const whatsappUrl = `https://wa.me/22242072952?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          setStep(4);
        } else {
          setError(otpData.error || "فشل توليد رمز التحقق");
        }
      } else {
        setError(data.error || "خطأ في السيرفر أثناء التسجيل");
      }
     
    } catch (err) {
      console.error("Signup Error:", err);
      setError("فشل الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  // 2. الدالة الثانية: التحقق من كود الـ OTP المدخل وتفعيل الحساب نهائياً
  const handleVerifyOtp = async () => {
    if (!otpCode) { 
      setError(lang === 'ar' ? "يرجى إدخال الرمز" : "Veuillez entrer le code"); 
      return; 
    }
    
    setLoading(true);
    setError(null);

    try {
      const cleanedPhone = phone.trim().replace(/\s+/g, '');

      const response = await fetch('https://anatli-server-production.up.railway.app/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanedPhone,
          code: otpCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(lang === 'ar' ? "🎉 تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول." : "🎉 Votre compte a été activé avec succès!");
        onBack(); 
      } else {
        setError(data.error || "الرمز غير صحيح أو انتهت صلاحيته");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      setError("فشل الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={styles.langBtn}>
        {lang === 'ar' ? 'FR' : 'AR'}
      </button>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>ANATLI</h1>
          <p style={styles.subtitle}>{c.subtitle}</p>
        </div>

        <div style={styles.form}>
          {step === 1 && (
            <div style={styles.fadeAnim}>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>👤</span>
                <input type="text" placeholder={c.name} value={fullName} onChange={(e) => setFullName(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>📞</span>
                <input type="text" placeholder={c.phone} value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>🔒</span>
                <input type="password" placeholder={c.pass} value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>🔄</span>
                <input type="password" placeholder={c.confirmPass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={styles.input} />
              </div>
              {error && <p style={styles.errorText}>{error}</p>}
              <button onClick={handleNextStep} style={styles.button}>{c.next}</button>
            </div>
          )}

          {step === 2 && (
            <div style={styles.fadeAnim}>
              <p style={styles.roleTitle}>{c.roleLabel}</p>
              <div style={styles.roleContainer}>
                <div 
                  onClick={() => setRole('customer')}
                  style={{...styles.roleCard, borderColor: role === 'customer' ? '#006400' : '#eee', backgroundColor: role === 'customer' ? '#f0fff0' : '#fff'}}
                >
                  <span style={styles.roleIcon}>🛍️</span>
                  <span style={styles.roleName}>{c.customer}</span>
                  <span style={styles.roleDesc}>{c.customerDesc}</span>
                </div>
                <div 
                  onClick={() => setRole('provider')}
                  style={{...styles.roleCard, borderColor: role === 'provider' ? '#006400' : '#eee', backgroundColor: role === 'provider' ? '#f0fff0' : '#fff'}}
                >
                  <span style={styles.roleIcon}>🛠️</span>
                  <span style={styles.roleName}>{c.provider}</span>
                  <span style={styles.roleDesc}>{c.providerDesc}</span>
                </div>
              </div>
              <div style={styles.buttonGroup}>
                <button onClick={() => setStep(1)} style={styles.secondaryButton}>{c.prev}</button>
                <button 
                  onClick={() => role === 'provider' ? setStep(3) : handleSignupAndSendOtp()}
                  disabled={loading}
                  style={styles.button}
                >
                  {loading ? '...' : (role === 'customer' ? c.next : c.next)}
                </button>
              </div>
              {error && <p style={styles.errorText}>{error}</p>}
            </div>
          )}

          {step === 3 && (
            <div style={styles.fadeAnim}>
              <p style={styles.roleTitle}>{c.serviceLabel}</p>
              <div style={styles.servicesGrid}>
                {services.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => setServiceType(s.id)}
                    style={{
                      ...styles.serviceBox,
                      borderColor: serviceType === s.id ? '#006400' : '#eee',
                      backgroundColor: serviceType === s.id ? '#f0fff0' : '#fff'
                    }}
                  >
                    <span style={{fontSize: '1.5rem'}}>{s.icon}</span>
                    <span style={{fontSize: '0.85rem', fontWeight: 'bold', marginTop: '5px'}}>{lang === 'ar' ? s.ar : s.fr}</span>
                  </div>
                ))}
              </div>
              <div style={styles.buttonGroup}>
                <button onClick={() => setStep(2)} style={styles.secondaryButton}>{c.prev}</button>
                <button onClick={handleSignupAndSendOtp} disabled={loading} style={styles.button}>
                  {loading ? '...' : c.next}
                </button>
              </div>
              {error && <p style={styles.errorText}>{error}</p>}
            </div>
          )}

          {/* --- جديد: Step 4 — إدخال رمز OTP --- */}
          {step === 4 && (
            <div style={styles.fadeAnim}>
              <p style={styles.roleTitle}>
                {lang === 'ar' ? '📱 أدخل رمز التحقق الذي وصلك على هاتفك' : '📱 Entrez le code reçu par SMS'}
              </p>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>🔑</span>
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'الرمز المكون من 6 أرقام' : 'Code à 6 chiffres'}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{...styles.input, textAlign: 'center', letterSpacing: '5px', fontSize: '1.3rem'}}
                  maxLength={6}
                />
              </div>
              {error && <p style={styles.errorText}>{error}</p>}
              <div style={styles.buttonGroup}>
                <button onClick={() => setStep(role === 'provider' ? 3 : 2)} style={styles.secondaryButton}>
                  {lang === 'ar' ? 'رجوع' : 'Retour'}
                </button>
                <button onClick={handleVerifyOtp} disabled={loading} style={styles.button}>
                  {loading ? '...' : (lang === 'ar' ? 'تفعيل الحساب ✅' : 'Activer ✅')}
                </button>
              </div>
            </div>
          )}
          
          <button type="button" onClick={onBack} style={styles.linkBtn}>{c.back}</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6', direction: 'rtl', padding: '20px' },
  langBtn: { position: 'absolute', top: '20px', right: '20px', padding: '8px 12px', borderRadius: '10px', border: 'none', background: '#006400', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' },
  card: { background: '#fff', padding: '30px 25px', borderRadius: '35px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' },
  logo: { color: '#006400', fontSize: '2.2rem', fontWeight: '900', margin: '0' },
  subtitle: { color: '#777', fontSize: '0.9rem', marginBottom: '25px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: '15px', padding: '0 15px', border: '1px solid #f0f0f0', marginBottom: '10px' },
  icon: { fontSize: '1.1rem', marginLeft: '10px' },
  input: { flex: 1, padding: '14px 0', border: 'none', background: 'none', outline: 'none', fontSize: '0.95rem', textAlign: 'right', color: '#333' },
  roleTitle: { textAlign: 'right', fontSize: '0.9rem', color: '#444', fontWeight: 'bold', margin: '10px 5px 10px 0' },
  roleContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
  roleCard: { flex: 1, padding: '15px 10px', borderRadius: '20px', border: '2px solid', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  roleIcon: { fontSize: '1.8rem', marginBottom: '5px' },
  roleName: { fontSize: '0.9rem', fontWeight: 'bold', color: '#006400' },
  roleDesc: { fontSize: '0.7rem', color: '#888', textAlign: 'center' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  button: { flex: 2, padding: '16px', backgroundColor: '#006400', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(0,100,0,0.2)' },
  secondaryButton: { flex: 1, padding: '16px', backgroundColor: '#f0f0f0', color: '#444', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '15px' },
  serviceBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', borderRadius: '18px', border: '2px solid', cursor: 'pointer', transition: '0.2s' },
  linkBtn: { background: 'none', border: 'none', color: '#006400', cursor: 'pointer', marginTop: '15px', fontSize: '0.9rem', fontWeight: '600' },
  errorText: { color: '#e74c3c', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' },
  fadeAnim: { animation: 'fadeIn 0.5s ease' }
};

export default SignupScreen;
