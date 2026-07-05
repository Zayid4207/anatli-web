import React, { useState } from 'react';
import { useTranslation } from '../translations';
import Logo from '../Logo';
export default function SignupScreen({ apiUrl, onBack, onSuccess }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('customer');
  const [coveredDistricts, setCoveredDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [lang, setLang] = useState('ar');
  const t = useTranslation(lang);
 const [housePhoto, setHousePhoto] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    password: '',
    confirm_password: '',
    district: '',
    address: '',
    bank_phone: '',
    bank_type: 'bankily'
  });
 
  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
 
  const handleStep1 = () => {
    if (!form.full_name || !form.phone || !form.password || !form.confirm_password) {
      setError(t.fillAllFields); return;
    }
    if (form.password !== form.confirm_password) {
      setError(t.passwordMismatch); return;
    }
    if (form.phone.length < 8) {
      setError(t.phoneInvalid); return;
    }
    setError('');
    setStep(2);
  };
 const handleStep2 = () => {
    if (role === 'customer') {
      if (!form.district || !form.address) {
        setError(lang === 'ar' ? 'يرجى تحديد المقاطعة والعنوان' : 'Veuillez choisir la commune et l\'adresse'); return;
      }
    }
    if (role === 'provider') {
      if (!form.bank_phone) {
        setError(lang === 'ar' ? 'يرجى إدخال رقم الهاتف البنكي' : 'Veuillez entrer le numéro bancaire'); return;
      }
      if (coveredDistricts.length === 0) {
        setError(lang === 'ar' ? 'يرجى اختيار مقاطعة واحدة على الأقل' : 'Veuillez choisir au moins une commune'); return;
      }
    }
    setError('');
    handleSignup();
  };
  const handleSignup = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', form.full_name);
      formData.append('phone', form.phone);
      formData.append('password', form.password);
      formData.append('user_role', role);

      if (role === 'customer') {
        formData.append('district', form.district || '');
        formData.append('address', form.address || '');
        if (housePhoto) formData.append('house_photo', housePhoto);
      }

      if (role === 'provider') {
        formData.append('bank_phone', form.bank_phone || '');
        formData.append('bank_type', form.bank_type || '');
        formData.append('covered_districts', coveredDistricts.join(','));
      }

      const res = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert(lang === 'ar'
          ? '🎉 تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.'
          : '🎉 Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        onSuccess();
      } else {
        setError(data.error || t.error);
      }
    } catch (err) {
      setError(t.serverError);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async () => {
    if (!otpCode) { setError(lang === 'ar' ? 'يرجى إدخال الرمز' : 'Veuillez entrer le code'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        alert(t.accountCreated);
        onSuccess();
      } else {
        setError(data.error || lang === 'ar' ? 'الرمز غير صحيح' : 'Code incorrect');
      }
    } catch (err) {
      setError(t.serverError);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 
      {/* زر اللغة */}
      <button
        onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
        style={{
          position: 'fixed', top: '15px', left: '15px',
          padding: '6px 14px', borderRadius: '10px',
          border: '1px solid #006400', background: '#fff',
          color: '#006400', fontWeight: 'bold', cursor: 'pointer',
          zIndex: 1000
        }}
      >
        {lang === 'ar' ? 'FR' : 'AR'}
      </button>
 
      <div style={s.card}>
 
        {/* الرأسية */}
       {/* الرأسية */}
        <div style={s.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Logo size="md" theme="dark" />
          </div>
          <h2 style={s.title}>{t.createAccount}</h2>
          <div style={s.steps}>
            {[1,2].map(n => (
              <div key={n} style={{ ...s.stepDot, backgroundColor: step >= n ? '#006400' : '#ddd' }} />
            ))}
          </div>
        </div>
 
        {/* الخطوة 1 */}
        {step === 1 && (
          <div style={s.form}>
            <p style={s.stepTitle}>{t.basicInfo}</p>
 
            <div style={s.roleRow}>
              <div
                style={{ ...s.roleCard, borderColor: role === 'customer' ? '#006400' : '#ddd', backgroundColor: role === 'customer' ? '#f0fff0' : '#fff' }}
                onClick={() => setRole('customer')}
              >
                <span style={{ fontSize: '2rem' }}>🏠</span>
                <span style={s.roleLabel}>{t.iAmCustomer}</span>
                <span style={s.roleDesc}>{t.customerDesc}</span>
              </div>
              <div
                style={{ ...s.roleCard, borderColor: role === 'provider' ? '#006400' : '#ddd', backgroundColor: role === 'provider' ? '#f0fff0' : '#fff' }}
                onClick={() => setRole('provider')}
              >
                <span style={{ fontSize: '2rem' }}>🔧</span>
                <span style={s.roleLabel}>{t.iAmProvider}</span>
                <span style={s.roleDesc}>{t.providerDesc}</span>
              </div>
            </div>
 
            <input style={s.input} placeholder={t.enterName} value={form.full_name} onChange={e => update('full_name', e.target.value)} />
            <input style={s.input} placeholder={t.phone} type="text" value={form.phone} onChange={e => update('phone', e.target.value)} />
            <input style={s.input} placeholder={t.password} type="password" value={form.password} onChange={e => update('password', e.target.value)} />
            <input style={s.input} placeholder={t.confirmPassword} type="password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} />
 
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btnPrimary} onClick={handleStep1}>{t.next}</button>
            <button style={s.backLink} onClick={onBack}>{t.haveAccount}</button>
          </div>
        )}
 
        {/* الخطوة 2 */}
       {step === 2 && (
     <div style={s.form}>
      {role === 'customer' ? (
      <>
        <p style={s.stepTitle}>{t.locationInfo}</p>
        <p style={s.stepDesc}>{t.locationDesc}</p>

        <label style={s.label}>{t.district}</label>
        <select style={s.input} value={form.district} onChange={e => update('district', e.target.value)}>
          <option value="">{t.chooseDistrict}</option>
          {t.districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <label style={s.label}>{t.address}</label>
        <textarea
          style={{ ...s.input, height: '80px', resize: 'none' }}
          placeholder={t.addressPlaceholder}
          value={form.address}
          onChange={e => update('address', e.target.value)}
        />
        {/* صورة واجهة المنزل */}
<label style={{
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: '8px', padding: '20px',
  border: `2px dashed ${housePhoto ? '#28a745' : '#006400'}`,
  borderRadius: '14px', cursor: 'pointer',
  backgroundColor: housePhoto ? '#f0fff0' : '#fafffe'
}}>
  <input
    type="file" accept="image/*" style={{ display: 'none' }}
    onChange={e => {
      const file = e.target.files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        alert(lang === 'ar' ? 'حجم الصورة كبير جداً' : 'Image trop grande');
        return;
      }
      setHousePhoto(file);
    }}
  />
  <span style={{ fontSize: '2rem' }}>{housePhoto ? '✅' : '🏠'}</span>
  <div style={{ textAlign: 'center' }}>
    <p style={{ margin: 0, fontWeight: 'bold', color: housePhoto ? '#28a745' : '#006400', fontSize: '0.9rem' }}>
      {housePhoto
        ? housePhoto.name.substring(0, 25) + '...'
        : (lang === 'ar' ? 'صورة واجهة منزلك' : 'Photo de votre maison')}
    </p>
    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#888' }}>
      {lang === 'ar'
        ? 'ارفع صورة للواجهة الخارجية — تساعد الفني على إيجادك'
        : 'Photo de la façade — aide le technicien à vous trouver'}
    </p>
  </div>
</label>
      </>
    ) : (
      <>
        <p style={s.stepTitle}>{t.paymentInfo}</p>
        <p style={s.stepDesc}>{t.paymentDesc}</p>

        <label style={s.label}>{t.bankType}</label>
        <div style={s.bankRow}>
          {[
            { key: 'bankily', label: lang === 'ar' ? 'بنكيلي' : 'Bankily' },
            { key: 'sadad', label: lang === 'ar' ? 'سداد' : 'Sadad' },
            { key: 'masrivi', label: lang === 'ar' ? 'مصرفي' : 'Masrivi' }
          ].map(b => (
            <div
              key={b.key}
              style={{ ...s.bankCard, borderColor: form.bank_type === b.key ? '#006400' : '#ddd', backgroundColor: form.bank_type === b.key ? '#f0fff0' : '#fff' }}
              onClick={() => update('bank_type', b.key)}
            >
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{b.label}</span>
            </div>
          ))}
        </div>

        <label style={s.label}>{t.bankPhone}</label>
        <input style={s.input} placeholder={t.bankPhonePlaceholder} value={form.bank_phone} onChange={e => update('bank_phone', e.target.value)} />

        {/* اختيار المقاطعات */}
        <label style={s.label}>
          {lang === 'ar' ? 'المقاطعات التي تغطيها' : 'Communes que vous couvrez'}
        </label>
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '-8px', marginBottom: '5px' }}>
          {lang === 'ar' ? 'اختر كل المقاطعات التي يمكنك العمل فيها' : 'Sélectionnez les communes où vous pouvez travailler'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {t.districts.map((district, i) => {
            const isSelected = coveredDistricts.includes(district);
            return (
              <div
                key={i}
                onClick={() => {
                  if (isSelected) {
                    setCoveredDistricts(prev => prev.filter(d => d !== district));
                  } else {
                    setCoveredDistricts(prev => [...prev, district]);
                  }
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `2px solid ${isSelected ? '#006400' : '#ddd'}`,
                  backgroundColor: isSelected ? '#f0fff0' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#006400' : '#555',
                  textAlign: 'center'
                }}
              >
                {isSelected ? '✓ ' : ''}{district}
              </div>
            );
          })}
        </div>

        {/* زر تحديد الكل */}
        <button
          type="button"
          onClick={() => {
            if (coveredDistricts.length === t.districts.length) {
              setCoveredDistricts([]);
            } else {
              setCoveredDistricts([...t.districts]);
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            background: 'none',
            border: '1px dashed #006400',
            borderRadius: '8px',
            color: '#006400',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          {coveredDistricts.length === t.districts.length
            ? (lang === 'ar' ? 'إلغاء تحديد الكل' : 'Tout désélectionner')
            : (lang === 'ar' ? 'تحديد كل المقاطعات' : 'Sélectionner tout')}
        </button>
      </>
    )}

    {error && <p style={s.error}>{error}</p>}
    <button style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleStep2} disabled={loading}>
      {loading ? (lang === 'ar' ? 'جاري التسجيل...' : 'Inscription...') : t.createBtn}
    </button>
    <button style={s.backLink} onClick={() => { setStep(1); setError(''); }}>{t.back}</button>
  </div>
)}
 
 
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
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '30px 25px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 40px rgba(0,100,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px'
  },
  logoIcon: {
    fontSize: '2.5rem'
  },
  title: {
    margin: '8px 0',
    color: '#006400',
    fontSize: '1.5rem',
    fontWeight: '900'
  },
  steps: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '10px'
  },
  stepDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    textAlign: 'center'
  },
  stepDesc: {
    fontSize: '0.85rem',
    color: '#888',
    margin: 0,
    textAlign: 'center',
    lineHeight: '1.5'
  },
  roleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  roleCard: {
    border: '2px solid',
    borderRadius: '16px',
    padding: '15px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  roleLabel: {
    fontWeight: 'bold',
    color: '#006400',
    fontSize: '1rem'
  },
  roleDesc: {
    fontSize: '0.7rem',
    color: '#888',
    textAlign: 'center'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#444',
    marginBottom: '2px'
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
  bankRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  bankCard: {
    border: '2px solid',
    borderRadius: '12px',
    padding: '12px 5px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
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
  backLink: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textAlign: 'center'
  }
};
