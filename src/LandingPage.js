import React, { useState } from 'react';
 import APP_CONFIG from '../config';
 import Logo from './Logo';
export default function LandingPage({ onLoginClick, onRegisterClick }) {
  const [lang, setLang] = useState('ar');
 
  const content = {
    ar: {
      appName: APP_CONFIG.name,
      appSub: APP_CONFIG.taglineAr,
      hero: 'منزلك في أمان دائم',
      heroDesc: 'اشترك واستمتع بطلبات غير محدودة — سباكة، كهرباء، صيانة وأكثر.',
      login: 'دخول',
      register: 'اشترك',
      howTitle: 'كيف يعمل؟',
      step1Title: 'اشترك', step1Desc: 'اختر باقتك الشهرية',
      step2Title: 'اطلب', step2Desc: 'صورة أو وصف صوتي للمشكلة',
      step3Title: 'الفني يصلك', step3Desc: 'في أقرب وقت ممكن',
      packagesTitle: 'باقاتنا الشهرية',
      unlimited: 'طلبات غير محدودة',
      perMonth: 'شهرياً',
      downloadPdf: '📄 تحميل تفاصيل الباقة',
      whyTitle: 'لماذا HomeFix؟',
      why1: 'فنيون موثوقون', why2: 'استجابة سريعة',
      why3: 'طلبات غير محدودة', why4: 'تغطية شاملة',
      joinNow: 'ابدأ الآن', joinProvider: 'انضم كفني',
      footer: 'جميع الحقوق محفوظة', city: 'نواكشوط، موريتانيا',
      packages: [
        {
          name: 'راحة البال', price: 1500, color: '#fff8e1', border: '#f59e0b', icon: '🥇', badge: 'الأكثر شمولاً',
          items: ['⚡ إصلاح انقطاع الكهرباء والتمديدات','💡 إصلاح وتركيب الأضواء والمفاتيح','🔌 تركيب Stabilisateur','❄️ إصلاح وتركيب المكيف','🌀 إصلاح وتركيب الريحة','🔧 إصلاح وتركيب التيو','🚿 إصلاح وتركيب الرباين ورباين الدوش والمطبخ','💧 إصلاح تسرب Lavabo','⚙️ إصلاح مضخة المياه','🔩 إصلاح السبرسير','🧊 إصلاح الثلاجة','🌡️ إصلاح وتركيب مسخن المياه','📺 إصلاح التلفاز','🚪 إصلاح وتركيب مفاتيح الأبواب','⚡ أولوية قصوى في الاستجابة']
        },
        {
          name: 'البيت المعمور', price: 1300, color: '#f0f4ff', border: '#3b82f6', icon: '🥈', badge: 'الأكثر طلباً',
          items: ['⚡ إصلاح انقطاع الكهرباء والتمديدات','💡 إصلاح وتركيب الأضواء والمفاتيح','🔌 تركيب Stabilisateur','❄️ إصلاح وتركيب المكيف','🌀 إصلاح وتركيب الريحة','🔧 إصلاح وتركيب التيو','🚿 إصلاح وتركيب الرباين ورباين الدوش والمطبخ','💧 إصلاح تسرب Lavabo','🔩 إصلاح السبرسير','🧊 إصلاح الثلاجة','🌡️ إصلاح وتركيب مسخن المياه']
        },
        {
          name: 'السلامة', price: 1100, color: '#f0fff4', border: '#22c55e', icon: '🥉', badge: 'للبداية',
          items: ['⚡ إصلاح انقطاع الكهرباء والتمديدات','💡 إصلاح وتركيب الأضواء والمفاتيح','🚿 إصلاح وتركيب الرباين ورباين الدوش والمطبخ','💧 إصلاح تسرب Lavabo','🔩 إصلاح السبرسير','🚪 إصلاح وتركيب مفاتيح الأبواب']
        }
      ]
    },
    fr: {
      appName: APP_CONFIG.nameFr,
      appSub: APP_CONFIG.taglineFr,
      hero: 'Votre maison toujours en sécurité',
      heroDesc: 'Abonnez-vous et profitez de demandes illimitées — plomberie, électricité, maintenance et plus.',
      login: 'Connexion',
      register: "S'abonner",
      howTitle: 'Comment ça marche ?',
      step1Title: "S'abonner", step1Desc: 'Choisissez votre forfait mensuel',
      step2Title: 'Demander', step2Desc: 'Photo ou note vocale du problème',
      step3Title: 'Le technicien arrive', step3Desc: 'Dans les plus brefs délais',
      packagesTitle: 'Nos forfaits mensuels',
      unlimited: 'Demandes illimitées',
      perMonth: 'par mois',
      downloadPdf: '📄 Télécharger les détails',
      whyTitle: 'Pourquoi HomeFix ?',
      why1: 'Techniciens vérifiés', why2: 'Réponse rapide',
      why3: 'Demandes illimitées', why4: 'Couverture complète',
      joinNow: 'Commencer', joinProvider: 'Rejoindre comme technicien',
      footer: 'Tous droits réservés', city: 'Nouakchott, Mauritanie',
      packages: [
        {
          name: 'Rāħat el bāl', price: 1500, color: '#fff8e1', border: '#f59e0b', icon: '🥇', badge: 'Le plus complet',
          items: ['⚡ Pannes électriques et câblage','💡 Éclairage et interrupteurs','🔌 Installation Stabilisateur','❄️ Climatisation','🌀 Ventilateur','🔧 Tuyaux','🚿 Robinets douche et cuisine','💧 Fuite lavabo','⚙️ Pompe à eau','🔩 Compresseur','🧊 Réfrigérateur','🌡️ Chauffe-eau','📺 Télévision','🚪 Serrures et portes','⚡ Priorité maximale']
        },
        {
          name: 'El beit el maâmour', price: 1300, color: '#f0f4ff', border: '#3b82f6', icon: '🥈', badge: 'Le plus demandé',
          items: ['⚡ Pannes électriques et câblage','💡 Éclairage et interrupteurs','🔌 Installation Stabilisateur','❄️ Climatisation','🌀 Ventilateur','🔧 Tuyaux','🚿 Robinets douche et cuisine','💧 Fuite lavabo','🔩 Compresseur','🧊 Réfrigérateur','🌡️ Chauffe-eau']
        },
        {
          name: 'Es-salāma', price: 1100, color: '#f0fff4', border: '#22c55e', icon: '🥉', badge: 'Pour commencer',
          items: ['⚡ Pannes électriques et câblage','💡 Éclairage et interrupteurs','🚿 Robinets douche et cuisine','💧 Fuite lavabo','🔩 Compresseur','🚪 Serrures et portes']
        }
      ]
    }
  };
 
  const c = content[lang];
 
  const generatePdf = async (pkg) => {
    const items = pkg.items || [];
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;left:-9999px;top:0;width:390px;background:white;font-family:Arial,sans-serif;direction:rtl;`;
    div.innerHTML = `
      <div style="background:${pkg.border};padding:30px 20px;text-align:center;color:white;">
        <div style="font-size:24px;font-weight:900;margin-bottom:8px;">🏠 ${APP_CONFIG.name}</div>
        <div style="font-size:18px;font-weight:bold;margin-bottom:5px;">${pkg.icon} ${pkg.name}</div>
        <div style="font-size:15px;opacity:0.9;">${pkg.price} MRU / شهرياً</div>
      </div>
      <div style="padding:20px;">
        <div style="font-size:15px;font-weight:bold;color:${pkg.border};border-bottom:2px solid ${pkg.border};padding-bottom:8px;margin-bottom:15px;">ما تشمله هذه الباقة</div>
        ${items.map(item => `<div style="display:flex;gap:10px;margin-bottom:10px;font-size:13px;"><span style="color:${pkg.border};font-weight:bold;">✓</span><span>${item}</span></div>`).join('')}
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px;margin-top:20px;font-size:12px;color:#856404;text-align:center;">
          ⚠️ <strong>اليد العاملة فقط</strong> — قطع الغيار على عاتق الزبون
        </div>
      </div>
      <div style="background:#2c2c2c;color:white;text-align:center;padding:15px;font-size:11px;">${APP_CONFIG.name} — نواكشوط، موريتانيا</div>
    `;
    document.body.appendChild(div);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `HomeFix-${pkg.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      document.body.removeChild(div);
    }
  };
 
  return (
    <div style={{ fontFamily: "'Tajawal', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr', color: '#2c2c2c', overflowX: 'hidden' }}>
 
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
 
      {/* ===== CSS للهاتف ===== */}
      <style>{`
        @media (max-width: 480px) {
          .hfx-nav { padding: 10px 15px !important; }
          .hfx-logo-sub { display: none !important; }
          .hfx-hero { min-height: 70vh !important; padding-bottom: 60px !important; }
          .hfx-hero-content { padding: 20px 15px !important; }
          .hfx-hero-title { font-size: 1.8rem !important; }
          .hfx-hero-desc { font-size: 0.9rem !important; margin-bottom: 20px !important; }
          .hfx-hero-btns { flex-direction: column !important; width: 100% !important; padding: 0 15px !important; }
          .hfx-btn-hero { width: 100% !important; text-align: center !important; }
          .hfx-section { padding: 30px 15px !important; }
          .hfx-steps { grid-template-columns: 1fr !important; gap: 10px !important; }
          .hfx-step-card { flex-direction: row !important; padding: 15px !important; text-align: right !important; gap: 12px !important; align-items: center !important; }
          .hfx-step-icon { font-size: 1.8rem !important; }
          .hfx-step-num { width: 32px !important; height: 32px !important; font-size: 0.9rem !important; flex-shrink: 0 !important; }
          .hfx-pkg-grid { grid-template-columns: 1fr !important; padding: 0 5px !important; }
          .hfx-why-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .hfx-why-card { padding: 15px 10px !important; }
          .hfx-cta { padding: 40px 15px !important; }
          .hfx-cta-btns { flex-direction: column !important; width: 100% !important; }
          .hfx-section-title { font-size: 1.4rem !important; margin-bottom: 20px !important; }
        }
      `}</style>
 
      {/* ===== NAV ===== */}
      <nav className="hfx-nav" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', backgroundColor: '#006400', position: 'sticky',
        top: 0, zIndex: 100, boxShadow: '0 2px 15px rgba(0,100,0,0.3)'
      }}>
        {/* الشعار */}
       <Logo size="md" theme="light" />
        {/* الأزرار */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={{ padding: '5px 10px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
            {lang === 'ar' ? 'FR' : 'AR'}
          </button>
          <button onClick={onLoginClick} style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
            {c.login}
          </button>
          <button onClick={onRegisterClick} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#ffc107', color: '#333', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
            {c.register}
          </button>
        </div>
      </nav>
 
      {/* ===== HERO ===== */}
      <section className="hfx-hero" style={{
        background: 'linear-gradient(135deg, #006400 0%, #228B22 100%)',
        minHeight: '75vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden', paddingBottom: '70px'
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.06 }}>
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: '#fff', top: '-100px', right: '-100px' }} />
          <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', backgroundColor: '#fff', bottom: '-50px', left: '-50px' }} />
        </div>
 
        <div className="hfx-hero-content" style={{ textAlign: 'center', padding: '30px 20px', position: 'relative', zIndex: 2, width: '100%', maxWidth: '600px', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,193,7,0.2)', border: '1px solid rgba(255,193,7,0.4)', color: '#ffc107', padding: '5px 15px', borderRadius: '30px', fontSize: '0.8rem', marginBottom: '15px' }}>
            📍 {c.city}
          </div>
 
          <h1 className="hfx-hero-title" style={{ fontSize: '2.2rem', color: '#fff', fontWeight: '900', lineHeight: 1.2, marginBottom: '12px' }}>
            {c.hero}
          </h1>
 
          <p className="hfx-hero-desc" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '25px', maxWidth: '450px', margin: '0 auto 25px' }}>
            {c.heroDesc}
          </p>
 
          <div className="hfx-hero-btns" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 10px' }}>
            <button className="hfx-btn-hero" onClick={onRegisterClick} style={{ padding: '13px 24px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              🔧 {c.joinNow}
            </button>
            <button className="hfx-btn-hero" onClick={onRegisterClick} style={{ padding: '13px 24px', backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              👷 {c.joinProvider}
            </button>
          </div>
        </div>
 
        <svg viewBox="0 0 1440 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', width: '100%' }} preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </section>
 
      {/* ===== كيف يعمل ===== */}
      <section className="hfx-section" style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#fff' }}>
        <div style={{ display: 'inline-block', background: '#e8f5e9', color: '#006400', padding: '4px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '10px' }}>
          HOW IT WORKS
        </div>
        <h2 className="hfx-section-title" style={{ fontSize: '1.6rem', color: '#2c2c2c', fontWeight: '900', marginBottom: '25px' }}>
          {c.howTitle}
        </h2>
 
        <div className="hfx-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '700px', margin: '0 auto' }}>
          {[
            { num: '١', title: c.step1Title, desc: c.step1Desc, icon: '💳' },
            { num: '٢', title: c.step2Title, desc: c.step2Desc, icon: '📱' },
            { num: '٣', title: c.step3Title, desc: c.step3Desc, icon: '🔧' }
          ].map((step, i) => (
            <div key={i} className="hfx-step-card" style={{ background: '#f8f9fa', borderRadius: '16px', padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1px solid #eee' }}>
              <span className="hfx-step-icon" style={{ fontSize: '2rem' }}>{step.icon}</span>
              <div className="hfx-step-num" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#006400', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', margin: 0 }}>{step.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#777', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ===== الباقات ===== */}
      <section className="hfx-section" style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ display: 'inline-block', background: '#e8f5e9', color: '#006400', padding: '4px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '10px' }}>
          PACKAGES · الباقات
        </div>
        <h2 className="hfx-section-title" style={{ fontSize: '1.6rem', color: '#2c2c2c', fontWeight: '900', marginBottom: '25px' }}>
          {c.packagesTitle}
        </h2>
 
        <div className="hfx-pkg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '950px', margin: '0 auto', padding: '0 5px' }}>
          {c.packages.map((pkg, i) => (
            <div key={i} style={{ border: `2px solid ${pkg.border}`, borderRadius: '20px', backgroundColor: pkg.color, position: 'relative', marginTop: '18px', boxShadow: '0 4px 15px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' }}>
 
              {/* شارة */}
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', backgroundColor: pkg.border, color: '#fff', padding: '4px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {pkg.badge}
              </div>
 
              {/* رأسية */}
              <div style={{ padding: '20px', paddingTop: '28px', borderBottom: `2px solid ${pkg.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2.2rem' }}>{pkg.icon}</span>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: '900', fontSize: '1.1rem', color: pkg.border }}>{pkg.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#666' }}>∞ {c.unlimited}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: pkg.border, lineHeight: 1 }}>{pkg.price}</div>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>MRU/{c.perMonth}</div>
                </div>
              </div>
 
              {/* التغطية */}
              <div style={{ padding: '15px 18px', flex: 1 }}>
                {pkg.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: pkg.border, fontWeight: 'bold', flexShrink: 0, fontSize: '0.9rem' }}>✓</span>
                    <span style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(0,0,0,0.04)', borderRadius: '8px', fontSize: '0.75rem', color: '#777', textAlign: 'center', borderTop: `1px dashed ${pkg.border}` }}>
                  ⚠️ اليد العاملة فقط · Main d'œuvre uniquement
                </div>
              </div>
 
              {/* الأزرار */}
              <div style={{ padding: '15px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={onRegisterClick} style={{ padding: '12px', backgroundColor: pkg.border, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}>
                  {c.register}
                </button>
                <button onClick={() => generatePdf(pkg)} style={{ padding: '10px', backgroundColor: 'transparent', border: `2px solid ${pkg.border}`, borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem', color: pkg.border, cursor: 'pointer' }}>
                  {c.downloadPdf}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* ===== لماذا نحن ===== */}
      <section className="hfx-section" style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#fff' }}>
        <div style={{ display: 'inline-block', background: '#e8f5e9', color: '#006400', padding: '4px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '10px' }}>
          WHY US · لماذا نحن
        </div>
        <h2 className="hfx-section-title" style={{ fontSize: '1.6rem', color: '#2c2c2c', fontWeight: '900', marginBottom: '25px' }}>
          {c.whyTitle}
        </h2>
 
        <div className="hfx-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '700px', margin: '0 auto' }}>
          {[
            { icon: '🛡️', text: c.why1, bg: '#e8f5e9' },
            { icon: '⚡', text: c.why2, bg: '#fff3e0' },
            { icon: '∞', text: c.why3, bg: '#e3f2fd' },
            { icon: '🏠', text: c.why4, bg: '#f3e5f5' }
          ].map((w, i) => (
            <div key={i} className="hfx-why-card" style={{ background: '#fff', borderRadius: '16px', padding: '20px 15px', boxShadow: '0 3px 10px rgba(0,0,0,0.06)', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: w.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                {w.icon}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#444', fontWeight: '600', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>{w.text}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ===== CTA ===== */}
      <section className="hfx-cta" style={{ background: 'linear-gradient(135deg, #006400 0%, #228B22 100%)', padding: '50px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: '900', marginBottom: '10px' }}>
          {lang === 'ar' ? 'هل أنت مستعد؟' : 'Prêt à commencer ?'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '25px' }}>
          {lang === 'ar' ? 'انضم الآن واحمِ منزلك مع HomeFix' : 'Rejoignez HomeFix et protégez votre maison'}
        </p>
        <div className="hfx-cta-btns" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onRegisterClick} style={{ padding: '13px 24px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            🔧 {c.joinNow}
          </button>
          <button onClick={onRegisterClick} style={{ padding: '13px 24px', backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            👷 {c.joinProvider}
          </button>
        </div>
      </section>
 
      {/* ===== FOOTER ===== */}
      <footer style={{ backgroundColor: '#1a1a1a', padding: '25px 20px', textAlign: 'center' }}>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>🏠 {c.appName}</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: '4px 0' }}>{c.city}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: '4px 0' }}>© 2026 {c.appName} · {c.footer}</p>
      </footer>
 
    </div>
  );
}
