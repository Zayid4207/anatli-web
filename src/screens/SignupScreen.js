import React, { useState } from 'react';
import { useTranslation } from '../translations';
import Logo from '../Logo';
import TermsScreen from './TermsScreen';
export default function SignupScreen({ apiUrl, onBack, onSuccess }) {
  const [showTerms, setShowTerms] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('ar');
  const t = useTranslation(lang);
 const [housePhoto, setHousePhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationChoice, setLocationChoice] = useState(null); // null | 'yes' | 'no'
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    password: '',
    confirm_password: '',
    district: '',
    address: ''
  });
 
  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
 
  const getLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      err => {
        setLocationError(lang === 'ar'
          ? 'فشل تحديد موقعك، يرجى السماح بالوصول للموقع'
          : 'Impossible de localiser, veuillez autoriser la géolocalisation');
        setLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };
 
    const handleStep1 = () => {
    if (!form.full_name || !form.phone || !form.password || !form.confirm_password) {
      setError(t.fillAllFields); return;
    }
    if (form.password !== form.confirm_password) {
      setError(t.passwordMismatch); return;
    }
    const phoneDigits = form.phone.replace(/\s+/g, '').replace(/\+/g, '').replace(/^00/, '');
    if (!/^(222)?[234][0-9]{7}$/.test(phoneDigits)) {
      setError(t.phoneInvalid); return;
    }
   setError('');
setStep(2);
  };
 
  const handleStep2 = () => {
    if (!form.district) {
      setError(lang === 'ar' ? 'يرجى تحديد المقاطعة' : 'Veuillez choisir la commune'); return;
    }
    setError('');
    setShowTerms(true);
  };
 
  const handleSignup = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', form.full_name);
      formData.append('phone', form.phone);
      formData.append('password', form.password);
      formData.append('user_role', 'customer');
      formData.append('district', form.district || '');
      formData.append('address', form.address || '');
      if (housePhoto) formData.append('house_photo', housePhoto);
      if (location) {
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
      }
 
      const res = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        body: formData
      });
 
      const data = await res.json();
      if (res.ok) {
        try { localStorage.setItem('hfx_last_phone', form.phone); } catch (e) {}
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
 if (showTerms) {
  return (
    <TermsScreen
      lang={lang}
      onAccept={() => { setShowTerms(false); handleSignup(); }}
      onDecline={() => { setShowTerms(false); }}
    />
  );
}
  return (
    <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 
      {/* زر اللغة */}
      <button
        onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
        style={{
          position: 'absolute', top: '15px', left: '15px',
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
 
 
            <input style={s.input} placeholder={t.enterName} value={form.full_name} onChange={e => update('full_name', e.target.value)} />
             <input style={s.input} placeholder={t.phone} type="tel" inputMode="tel" autoComplete="tel" name="phone" value={form.phone} onChange={e => update('phone', e.target.value)} />
            <input style={s.input} placeholder={t.password} type="password" autoComplete="new-password" name="new-password" value={form.password} onChange={e => update('password', e.target.value)} />
            <input style={s.input} placeholder={t.confirmPassword} type="password" autoComplete="new-password" name="confirm-password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} />
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btnPrimary} onClick={handleStep1}>{t.next}</button>
            <button style={s.backLink} onClick={onBack}>{t.haveAccount}</button>
          </div>
        )}
 
        {/* الخطوة 2 */}
        {step === 2 && (
          <div style={s.form}>
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
        <label style={{ ...s.rowBox, flexDirection: 'row', alignItems: 'center', cursor: 'pointer', borderColor: housePhoto ? '#28a745' : '#cfe3cf', backgroundColor: housePhoto ? '#f0fff0' : '#f7fbf7' }}>
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
          <div style={{ ...s.iconCircle, color: housePhoto ? '#28a745' : '#006400' }}>
            <Ico name={housePhoto ? 'check' : 'camera'} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...s.boxTitle, color: housePhoto ? '#28a745' : '#006400' }}>
              {housePhoto
                ? (housePhoto.name.length > 22 ? housePhoto.name.slice(0, 22) + '…' : housePhoto.name)
                : (lang === 'ar' ? 'صورة واجهة منزلك' : 'Photo de votre maison')}
            </p>
            <p style={s.boxDesc}>
              {lang === 'ar'
                ? 'تساعد الفني على إيجادك — اضغط للاختيار'
                : 'Aide le technicien à vous trouver — appuyez pour choisir'}
            </p>
          </div>
        </label>
         {/* موقع المنزل */}
        {(() => {
          const located = locationChoice === 'yes' && location;
          const failed = locationChoice === 'yes' && !location && !locationLoading;
          let title, desc = '';
          if (locationChoice === null) {
            title = lang === 'ar' ? 'هل أنت في المنزل الآن؟' : 'Êtes-vous chez vous maintenant ?';
            desc = lang === 'ar' ? 'يساعدنا هذا في تحديد موقع منزلك بدقة للفنيين' : 'Cela nous aide à localiser précisément votre domicile';
          } else if (located) {
            title = lang === 'ar' ? 'تم تحديد موقع منزلك بنجاح' : 'Position localisée avec succès';
          } else if (locationChoice === 'yes') {
            title = locationLoading
              ? (lang === 'ar' ? 'جاري تحديد الموقع...' : 'Localisation en cours...')
              : (lang === 'ar' ? 'تعذّر تحديد الموقع' : 'Localisation impossible');
            desc = locationError || '';
          } else {
            title = lang === 'ar' ? 'تم تخطي تحديد الموقع' : 'Localisation ignorée';
            desc = lang === 'ar' ? 'يمكنك تحديده لاحقاً من صفحة "حسابي"' : 'Vous pourrez la définir plus tard depuis "Mon compte"';
          }
          return (
            <div style={{ ...s.rowBox, borderColor: located ? '#28a745' : '#cfe3cf', backgroundColor: located ? '#f0fff0' : '#f7fbf7' }}>
              <div style={s.rowTop}>
                <div style={{ ...s.iconCircle, color: located ? '#28a745' : '#006400' }}>
                  <Ico name={located ? 'check' : 'pin'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...s.boxTitle, color: located ? '#28a745' : '#006400' }}>{title}</p>
                  {desc && <p style={{ ...s.boxDesc, color: failed ? '#dc3545' : '#888' }}>{desc}</p>}
                </div>
              </div>

              {locationChoice === null && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" style={s.btnSm} onClick={() => { setLocationChoice('yes'); getLocation(); }}>
                    {lang === 'ar' ? 'نعم، أنا بالمنزل' : 'Oui'}
                  </button>
                  <button type="button" style={s.btnSmOutline} onClick={() => setLocationChoice('no')}>
                    {lang === 'ar' ? 'لا، لست الآن' : 'Non'}
                  </button>
                </div>
              )}
              {located && (
                <div style={{ display: 'flex' }}>
                  <button type="button" style={s.btnSmOutline} onClick={() => { setLocation(null); getLocation(); }}>
                    {lang === 'ar' ? 'إعادة التحديد' : 'Relocaliser'}
                  </button>
                </div>
              )}
              {locationChoice === 'yes' && !location && (
                <div style={{ display: 'flex' }}>
                  <button type="button" style={{ ...s.btnSm, opacity: locationLoading ? 0.6 : 1 }} onClick={getLocation} disabled={locationLoading}>
                    {locationLoading ? '...' : (lang === 'ar' ? 'حاول مرة أخرى' : 'Réessayer')}
                  </button>
                </div>
              )}
              {locationChoice === 'no' && (
                <div style={{ display: 'flex' }}>
                  <button type="button" style={s.btnSmOutline} onClick={() => setLocationChoice(null)}>
                    {lang === 'ar' ? 'رجوع' : 'Retour'}
                  </button>
                </div>
              )}
            </div>
          );
        })()}
 
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
const Ico = ({ name, size = 22 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'camera') return (<svg {...p}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></svg>);
  if (name === 'pin') return (<svg {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>);
  return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16 9.8" /></svg>);
};
 
const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f0',
    padding: '64px 20px 24px',
    position: 'relative',
    boxSizing: 'border-box'
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
  },
    rowBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '14px',
    border: '1.5px solid #cfe3cf',
    borderRadius: '14px',
    backgroundColor: '#f7fbf7'
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#e6f2e6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  boxTitle: {
    margin: 0,
    fontWeight: 'bold',
    fontSize: '0.92rem',
    color: '#006400',
    textAlign: 'start'
  },
  boxDesc: {
    margin: '3px 0 0',
    fontSize: '0.76rem',
    color: '#888',
    lineHeight: '1.5',
    textAlign: 'start'
  },
  btnSm: {
    flex: 1,
    padding: '11px',
    backgroundColor: '#006400',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '0.88rem',
    cursor: 'pointer'
  },
  btnSmOutline: {
    flex: 1,
    padding: '11px',
    backgroundColor: '#fff',
    color: '#006400',
    border: '1.5px solid #006400',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '0.88rem',
    cursor: 'pointer'
  },
};
 
