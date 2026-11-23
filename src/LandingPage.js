import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import TermsScreen from './screens/TermsScreen';
import APP_CONFIG from './config';
 
export default function LandingPage({ onLoginClick, onRegisterClick }) {
  const [showTerms, setShowTerms] = useState(false);
  const [lang, setLang] = useState('ar');
  const [scrolled, setScrolled] = useState(false);
  const [activeService, setActiveService] = useState(0);
 
  const services = ['🔧', '💧', '⚡', '❄️', '🌀', '📺', '🚪', '🧊'];
 
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService(prev => (prev + 1) % services.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);
 
  const content = {
    ar: {
      appName: APP_CONFIG.name,
      appSub: APP_CONFIG.taglineAr,
      hero: 'بيتك في أيدٍ أمينة',
      heroSub: 'اتصل مرة واحدة، ونرسل لك فنّيًا من فريقنا',
      heroDesc: 'سعر ثابت • بلا مساومة • بلا مفاجآت',
      heroMeta: 'اشتراك لفصل كامل (4 أشهر) • سباكة • كهرباء • تكييف وأكثر',
      login: 'دخول',
      register: 'اشترك الآن',
      painBadge: 'SOLUTION · الحل',
      painTitle: 'تعبت من البحث عن حرفي؟',
      pains: [
        {
          icon: '🕒',
          problem: 'حرفي يتأخر أو لا يرد',
          solution: 'طلبك يصل إلى الإدارة، فتعيّن لك فنّيًا من فريقنا وتتابع الطلب حتى يُنجز'
        },
        {
          icon: '💸',
          problem: 'مساومة وفواتير مفاجئة',
          solution: 'اشتراك بسعر ثابت تعرفه قبل أن تبدأ، فلا مساومة ولا مفاجآت'
        },
        {
          icon: '⭐',
          problem: 'لا أحد تسأله عن جودة العمل',
          solution: 'فنّيونا موظفون ومتابَعون، وتقيّم الفنّي بعد كل زيارة'
        }
      ],
      howTitle: 'كيف يعمل؟',
      step1Title: 'اشترك', step1Desc: 'اختر باقتك لمدة 4 أشهر',
      step2Title: 'اطلب', step2Desc: 'صورة أو وصف صوتي للمشكلة',
      step3Title: 'الفني يصلك', step3Desc: 'تتابع مراحله: في الطريق • بدأ العمل • انتهى',
      packagesTitle: 'باقات الصيانة',
      packagesSub: 'ادفع مرة واحدة لفصل كامل — الأسعار بالأوقية الجديدة (MRU)',
      perMonth: 'شهر',
      forMonths: 'لمدة 4 أشهر (فصل كامل)',
      visitsWord: 'زيارة',
      visitsNote: 'رصيد للمدة كلها، تستخدمه متى شئت',
      perVisit: 'للزيارة',
      included: 'الخدمات المشمولة',
      labourOnly: 'الخدمة تشمل اليد العاملة فقط — قطع الغيار على عاتق الزبون',
      downloadPdf: '📄 تحميل تفاصيل الباقة',
      whyTitle: 'لماذا دارفكس؟',
      why1: 'فنيون موظفون ومتابَعون', why2: 'طلب واحد والإدارة تتولى الباقي',
      why3: 'سعر ثابت، بلا مساومة', why4: 'تقيّم الفني بعد كل زيارة',
      joinNow: 'ابدأ الآن',
      footer: 'جميع الحقوق محفوظة', city: 'نواكشوط، موريتانيا',
      servicesTitle: 'خدماتنا',
      ctaTitle: 'جاهز لتستريح من هموم بيتك؟',
      ctaDesc: 'اشترك اليوم، ودع فريق دارفكس يهتم بالباقي',
    },
    fr: {
      appName: APP_CONFIG.nameFr,
      appSub: APP_CONFIG.taglineFr,
      hero: 'Votre maison entre de bonnes mains',
      heroSub: 'Un seul appel, et nous envoyons un technicien de notre équipe',
      heroDesc: 'Prix fixe • Sans marchandage • Sans mauvaise surprise',
      heroMeta: 'Abonnement pour une saison (4 mois) • Plomberie • Électricité • Climatisation et plus',
      login: 'Connexion',
      register: "S'abonner",
      painBadge: 'SOLUTION',
      painTitle: 'Fatigué de chercher un artisan ?',
      pains: [
        {
          icon: '🕒',
          problem: 'Un artisan en retard ou injoignable',
          solution: "Votre demande arrive à l'administration, qui vous affecte un technicien de notre équipe et suit la demande jusqu'au bout"
        },
        {
          icon: '💸',
          problem: 'Marchandage et factures surprises',
          solution: 'Un abonnement à prix fixe, connu avant de commencer : pas de marchandage, pas de surprise'
        },
        {
          icon: '⭐',
          problem: 'Personne à qui demander des comptes',
          solution: 'Nos techniciens sont salariés et suivis, et vous les notez après chaque visite'
        }
      ],
      howTitle: 'Comment ça marche ?',
      step1Title: "S'abonner", step1Desc: 'Choisissez votre forfait pour 4 mois',
      step2Title: 'Demander', step2Desc: 'Photo ou note vocale',
      step3Title: 'Le technicien arrive', step3Desc: 'Suivez chaque étape : en route • au travail • terminé',
      packagesTitle: "Forfaits d'entretien",
      packagesSub: 'Un seul paiement pour une saison — prix en nouvelle ouguiya (MRU)',
      perMonth: 'mois',
      forMonths: 'pour 4 mois (une saison)',
      visitsWord: 'visites',
      visitsNote: 'Solde pour toute la durée, à utiliser quand vous voulez',
      perVisit: 'visite',
      included: 'Services inclus',
      labourOnly: "Main d'œuvre uniquement — pièces à la charge du client",
      downloadPdf: '📄 Télécharger les détails',
      whyTitle: 'Pourquoi Darfix ?',
      why1: 'Techniciens salariés et suivis', why2: "Une seule demande, nous nous occupons du reste",
      why3: 'Prix fixe, sans marchandage', why4: 'Vous notez le technicien après chaque visite',
      joinNow: 'Commencer',
      footer: 'Tous droits réservés', city: 'Nouakchott, Mauritanie',
      servicesTitle: 'Nos services',
      ctaTitle: 'Prêt à vous reposer des soucis de votre maison ?',
      ctaDesc: "Abonnez-vous aujourd'hui et laissez l'équipe Darfix s'occuper du reste",
    }
  };
 
  // ===== الباقات (السعر شهري بالأوقية الجديدة MRU) =====
  const MONTHS = 4;
  const money = (n) => Number(n).toLocaleString('en-US');
  const ITEMS = {
    elec:   { ar: '⚡ إصلاح انقطاع الكهرباء والتمديدات', fr: '⚡ Pannes électriques et câblage' },
    lights: { ar: '💡 إصلاح الأضواء والمفاتيح', fr: '💡 Éclairage et interrupteurs' },
    stab:   { ar: '🔌 إصلاح Stabilisateur', fr: '🔌 Stabilisateur' },
    ac:     { ar: '❄️ إصلاح المكيف', fr: '❄️ Climatisation' },
    fan:    { ar: '🌀 إصلاح Ventilateur', fr: '🌀 Ventilateur' },
    pipes:  { ar: '🔧 إصلاح التيو', fr: '🔧 Tuyaux' },
    taps:   { ar: '🚿 إصلاح الرباين ورباين الدوش والمطبخ', fr: '🚿 Robinets (douche et cuisine)' },
    basin:  { ar: '💧 إصلاح تسرب Lavabo', fr: '💧 Fuite de lavabo' },
    pump:   { ar: '⚙️ إصلاح مضخة المياه', fr: '⚙️ Pompe à eau' },
    surp:   { ar: '🔩 إصلاح السبرسير', fr: '🔩 Surpresseur' },
    fridge: { ar: '🧊 إصلاح الثلاجة', fr: '🧊 Réfrigérateur' },
    heater: { ar: '🌡️ إصلاح مسخن المياه', fr: '🌡️ Chauffe-eau' },
    tv:     { ar: '📺 إصلاح التلفاز', fr: '📺 Télévision' },
    locks:  { ar: '🚪 إصلاح مفاتيح الأبواب', fr: '🚪 Serrures de porte' },
    prio:   { ar: '⚡ أولوية قصوى في الاستجابة', fr: '⚡ Priorité maximale' }
  };
  const PACKAGES = [
    {
      name: { ar: 'راحة البال', fr: 'Tranquillité' }, monthly: 800, visits: 24,
      color: '#fff8e1', border: '#f59e0b', icon: '🥇',
      badge: { ar: '🏆 الأوفر قيمة', fr: '🏆 Meilleur rapport qualité-prix' },
      items: ['elec','lights','stab','ac','fan','pipes','taps','basin','pump','surp','fridge','heater','tv','locks','prio']
    },
    {
      name: { ar: 'البيت المعمور', fr: 'Maison Prospère' }, monthly: 700, visits: 12,
      color: '#f7f8fa', border: '#9aa5b1', icon: '🥈', badge: null,
      items: ['elec','lights','stab','ac','fan','pipes','taps','basin','surp','fridge','heater','locks']
    },
    {
      name: { ar: 'السلامة', fr: 'Sécurité' }, monthly: 400, visits: 8,
      color: '#f0fff4', border: '#22c55e', icon: '🥉',
      badge: { ar: '✅ للبداية', fr: '✅ Pour commencer' },
      items: ['elec','lights','taps','basin','surp','locks']
    }
  ];
  const buildPackages = (l) => PACKAGES.map(p => {
    const total = p.monthly * MONTHS;
    return {
      name: p.name[l], monthly: p.monthly, total, visits: p.visits,
      perVisit: Math.round(total / p.visits),
      color: p.color, border: p.border, icon: p.icon,
      badge: p.badge ? p.badge[l] : '',
      items: p.items.map(k => ITEMS[k][l])
    };
  });
 
  const c = { ...content[lang], packages: buildPackages(lang) };
 
  // فصل الإيموجي عن النص العربي لتفادي خلل ترتيب الحروف عند التصدير كصورة
  const splitIcon = (str) => {
    const match = str.match(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]+)\s*(.*)$/u);
    if (match) return { icon: match[1], text: match[2] };
    return { icon: '', text: str };
  };
 
  const generatePdf = async (pkg) => {
    const items = pkg.items || [];
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;left:-9999px;top:0;width:620px;background:#e5e7eb;padding:20px;font-family:'Tajawal',Arial,sans-serif;direction:rtl;`;
 
    const itemsHtml = items.map((item, idx) => {
      const { icon, text } = splitIcon(item);
      return `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:9px 10px;background:${idx % 2 === 0 ? '#f7f7f8' : 'transparent'};border-radius:8px;">
          <span style="color:${pkg.border};font-weight:900;flex-shrink:0;font-size:14px;">✓</span>
          <span style="flex-shrink:0;font-size:14px;">${icon}</span>
          <span dir="rtl" style="unicode-bidi:isolate;flex:1;line-height:1.45;font-size:13.5px;color:#2c2c2c;">${text}</span>
        </div>
      `;
    }).join('');
 
    div.innerHTML = `
      <div style="width:100%;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.12);">
 
        <div style="background:linear-gradient(135deg, ${pkg.border} 0%, ${pkg.border}dd 100%);padding:34px 40px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.08);"></div>
          <div style="position:absolute;bottom:-70px;left:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
 
          <div style="display:flex;align-items:center;justify-content:space-between;position:relative;">
            <div style="display:flex;align-items:center;gap:12px;">
              <svg width="52" height="52" viewBox="0 0 64 64" style="flex-shrink:0;"><rect width="64" height="64" rx="15" fill="#ffc107"/><path d="M10 33 L32 14 L54 33" fill="none" stroke="#00843D" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 34 L32 21 L47 34 V49 a2 2 0 0 1 -2 2 H19 a2 2 0 0 1 -2 -2 Z" fill="#00843D"/><line x1="24" y1="46" x2="37" y2="33" stroke="#fff" stroke-width="4.2" stroke-linecap="round"/><circle cx="40" cy="30" r="5.6" fill="none" stroke="#fff" stroke-width="4.2"/><line x1="40" y1="30" x2="46.5" y2="23.5" stroke="#00843D" stroke-width="5.5"/></svg>
              <div style="text-align:left;">
                <div style="font-size:24px;font-weight:900;line-height:1;"><span style="color:#fff;">Dar</span><span style="color:#ffc107;">fix</span></div>
                <div dir="rtl" style="unicode-bidi:isolate;font-size:9.5px;color:rgba(255,255,255,0.9);margin-top:4px;">صيانة المنازل بالاشتراك</div>
              </div>
            </div>
            <div style="font-size:44px;line-height:1;">${pkg.icon}</div>
          </div>
 
          <div style="text-align:center;margin-top:26px;position:relative;">
            <div dir="rtl" style="unicode-bidi:isolate;font-size:26px;font-weight:900;color:#fff;margin-bottom:10px;">${pkg.name}</div>
            <div style="display:inline-block;background:rgba(0,0,0,0.18);padding:7px 22px;border-radius:20px;">
              <span style="font-size:16px;font-weight:bold;color:#fff;">${money(pkg.total)} MRU</span>
              <span dir="rtl" style="unicode-bidi:isolate;font-size:12px;color:rgba(255,255,255,0.85);"> / 4 أشهر</span>
            </div>
            <div dir="rtl" style="unicode-bidi:isolate;font-size:12px;color:rgba(255,255,255,0.9);margin-top:10px;">${pkg.visits} زيارة · ${money(pkg.perVisit)} MRU للزيارة الواحدة</div>
          </div>
        </div>
 
        <div style="padding:30px 36px;">
          <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:18px;">
            <span style="font-size:15px;">✨</span>
            <span dir="rtl" style="unicode-bidi:isolate;font-size:15px;font-weight:900;color:${pkg.border};">ما تشمله هذه الباقة</span>
          </div>
 
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;">
            ${itemsHtml}
          </div>
 
          <div style="display:flex;align-items:center;gap:8px;justify-content:center;background:#fff8e1;border:1px solid #ffc10766;border-radius:12px;padding:12px 16px;margin-top:20px;">
            <span style="font-size:14px;">⚠️</span>
            <span dir="rtl" style="unicode-bidi:isolate;font-size:12px;color:#8a6d00;line-height:1.5;text-align:center;">
              <strong>الخدمة تشمل اليد العاملة فقط</strong> — قطع الغيار على عاتق الزبون
            </span>
          </div>
        </div>
 
        <div style="background:${pkg.border}14;padding:22px 36px;text-align:center;border-top:1px solid #eee;">
          <div dir="rtl" style="unicode-bidi:isolate;font-size:13.5px;font-weight:900;color:#1a1a1a;margin-bottom:8px;">
            للاشتراك الآن تواصل معنا
          </div>
          <div style="display:flex;justify-content:center;gap:22px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:13px;">📞</span>
              <span style="font-size:13px;font-weight:bold;color:#333;" dir="ltr">${APP_CONFIG.phone}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:13px;">💬</span>
              <span style="font-size:13px;font-weight:bold;color:#25D366;">WhatsApp</span>
            </div>
          </div>
          <div dir="rtl" style="unicode-bidi:isolate;font-size:10.5px;color:#999;margin-top:10px;">نواكشوط، موريتانيا</div>
        </div>
 
      </div>
    `;
    document.body.appendChild(div);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: '#e5e7eb' });
      const link = document.createElement('a');
      link.download = `Darfix-${pkg.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      document.body.removeChild(div);
    }
  };
 if (showTerms) {
  return (
    <TermsScreen
      lang={lang}
      readOnly={true}
      onAccept={() => setShowTerms(false)}
      onDecline={() => setShowTerms(false)}
    />
  );
}
 
  return (
    <div style={{ fontFamily: "'Tajawal', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr', color: '#2c2c2c', overflowX: 'hidden' }}>
 
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
 
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 480px) {
          .hfx-hero-title { font-size: 1.9rem !important; }
          .hfx-hero-desc { font-size: 0.85rem !important; }
          .hfx-hero-btns { flex-direction: column !important; }
          .hfx-btn-hero { width: 100% !important; text-align: center !important; }
          .hfx-steps { grid-template-columns: 1fr !important; }
          .hfx-pain-grid { grid-template-columns: 1fr !important; }
          .hfx-pkg-grid { grid-template-columns: 1fr !important; }
          .hfx-why-grid { grid-template-columns: 1fr 1fr !important; }
          .hfx-services-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .hfx-nav-btns { display: none !important; }
        }
      `}</style>
 
      {/* ===== NAV ===== */}
      <nav style={{
        backgroundColor: scrolled ? 'rgba(0,100,0,0.97)' : '#006400',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 15px rgba(0,100,0,0.3)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
          <Logo size="sm" theme="light" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={{
              padding: '5px 12px', borderRadius: '8px',
              border: '1.5px solid rgba(255,255,255,0.5)',
              background: 'transparent', color: '#fff',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem'
            }}>
              {lang === 'ar' ? 'FR' : 'AR'}
            </button>
            <button className="hfx-nav-btns" onClick={onLoginClick} style={{
              padding: '7px 16px', borderRadius: '8px',
              border: '1.5px solid rgba(255,255,255,0.5)',
              background: 'transparent', color: '#fff',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem'
            }}>
              {c.login}
            </button>
            <button className="hfx-nav-btns" onClick={onRegisterClick} style={{
              padding: '7px 16px', borderRadius: '8px',
              border: 'none', background: '#ffc107',
              color: '#333', fontWeight: 'bold',
              cursor: 'pointer', fontSize: '0.85rem'
            }}>
              {c.register}
            </button>
          </div>
        </div>
        {/* السطر الثاني على الهاتف */}
        <div style={{
          display: 'flex', gap: '8px', padding: '0 15px 10px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }} className="hfx-mobile-btns">
          <style>{`.hfx-mobile-btns { display: none; } @media (max-width: 480px) { .hfx-mobile-btns { display: flex !important; } }`}</style>
          <button onClick={onLoginClick} style={{
            flex: 1, padding: '9px', borderRadius: '10px',
            border: '1.5px solid rgba(255,255,255,0.6)',
            background: 'transparent', color: '#fff',
            fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
          }}>
            {c.login}
          </button>
          <button onClick={onRegisterClick} style={{
            flex: 1, padding: '9px', borderRadius: '10px',
            border: 'none', background: '#ffc107',
            color: '#333', fontWeight: 'bold',
            cursor: 'pointer', fontSize: '0.9rem'
          }}>
            {c.register}
          </button>
        </div>
      </nav>
 
      {/* ===== HERO ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #004d00 0%, #006400 40%, #228B22 100%)',
        minHeight: '85vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden', paddingBottom: '80px'
      }}>
        {/* دوائر خلفية */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: '-150px', right: '-150px' }} />
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: '-80px', left: '-80px' }} />
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,193,7,0.05)', top: '30%', left: '10%' }} />
        </div>
 
        {/* أيقونات الخدمات الطافية */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {services.map((icon, i) => (
            <div key={i} style={{
              position: 'absolute',
              fontSize: i === activeService ? '2.5rem' : '1.5rem',
              opacity: i === activeService ? 0.3 : 0.08,
              transition: 'all 1s ease',
              top: `${10 + (i * 11) % 70}%`,
              left: i % 2 === 0 ? `${5 + i * 6}%` : 'auto',
              right: i % 2 !== 0 ? `${5 + i * 6}%` : 'auto',
            }}>
              {icon}
            </div>
          ))}
        </div>
 
        <div style={{ textAlign: 'center', padding: '30px 20px', position: 'relative', zIndex: 2, width: '100%', maxWidth: '650px' }}>
          {/* شارة المدينة */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)',
            color: '#ffc107', padding: '5px 16px', borderRadius: '30px',
            fontSize: '0.8rem', marginBottom: '20px'
          }}>
            📍 {c.city}
          </div>
 
          {/* العنوان الرئيسي */}
          <h1 className="hfx-hero-title" style={{
            fontSize: '2.8rem', color: '#fff', fontWeight: '900',
            lineHeight: 1.15, marginBottom: '12px',
            textShadow: '0 2px 20px rgba(0,0,0,0.2)'
          }}>
            {c.hero}
          </h1>
 
          {/* العنوان الفرعي */}
          <p style={{
            fontSize: '1.1rem', color: '#ffc107', fontWeight: '700',
            marginBottom: '10px', letterSpacing: '0.5px', lineHeight: 1.5
          }}>
            {c.heroSub}
          </p>
 
          {/* الوعد المختصر */}
          <p className="hfx-hero-desc" style={{
            fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)',
            marginBottom: '8px', letterSpacing: '1px', fontWeight: '700'
          }}>
            {c.heroDesc}
          </p>
 
          {/* وصف الخدمات */}
          <p style={{
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)',
            marginBottom: '30px', lineHeight: 1.6
          }}>
            {c.heroMeta}
          </p>
 
          {/* الأزرار */}
          <div className="hfx-hero-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="hfx-btn-hero" onClick={onRegisterClick} style={{
              padding: '14px 30px', backgroundColor: '#ffc107', color: '#333',
              border: 'none', borderRadius: '14px', fontWeight: 'bold',
              fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(255,193,7,0.35)'
            }}>
              🔧 {c.joinNow}
            </button>
            <button className="hfx-btn-hero" onClick={onLoginClick} style={{
              padding: '14px 30px', backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: '14px', fontWeight: 'bold',
              fontSize: '1rem', cursor: 'pointer'
            }}>
              {c.login}
            </button>
          </div>
        </div>
 
        {/* موجة الأسفل */}
        <svg viewBox="0 0 1440 70" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px', width: '100%' }} preserveAspectRatio="none">
          <path d="M0,70 C360,0 1080,0 1440,70 L1440,70 L0,70 Z" fill="#ffffff" />
        </svg>
      </section>
 
      {/* ===== شريط الخدمات ===== */}
      <section style={{ backgroundColor: '#fff', padding: '30px 20px' }}>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '20px', letterSpacing: '1px' }}>
          {c.servicesTitle}
        </p>
        <div className="hfx-services-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '10px', maxWidth: '700px', margin: '0 auto'
        }}>
          {[
            { icon: '⚡', label: lang === 'ar' ? 'كهرباء' : 'Électricité' },
            { icon: '💧', label: lang === 'ar' ? 'سباكة' : 'Plomberie' },
            { icon: '❄️', label: lang === 'ar' ? 'تكييف' : 'Clim' },
            { icon: '🔧', label: lang === 'ar' ? 'صيانة' : 'Maintenance' },
            { icon: '🌀', label: lang === 'ar' ? 'مروحة' : 'Ventilo' },
            { icon: '📺', label: lang === 'ar' ? 'تلفاز' : 'TV' },
            { icon: '🚪', label: lang === 'ar' ? 'أبواب' : 'Portes' },
            { icon: '🧊', label: lang === 'ar' ? 'ثلاجة' : 'Frigo' }
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '12px 5px',
              borderRadius: '14px', background: '#f8f9fa',
              border: '1px solid #eee'
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: '600' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
 
      {/* ===== المشكلة والحل ===== */}
      <section style={{ padding: '50px 20px', backgroundColor: '#fffdf5', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#fff3cd', color: '#8a6d00', padding: '4px 16px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '12px' }}>
          {c.painBadge}
        </div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: '900', marginBottom: '35px', color: '#2c2c2c' }}>
          {c.painTitle}
        </h2>
 
        <div className="hfx-pain-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px', maxWidth: '850px', margin: '0 auto'
        }}>
          {c.pains.map((p, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '20px', padding: '22px 18px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #eee',
              display: 'flex', flexDirection: 'column', gap: '10px',
              textAlign: lang === 'ar' ? 'right' : 'left'
            }}>
              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{p.icon}</div>
              <p style={{ margin: 0, fontWeight: '900', fontSize: '0.98rem', color: '#b45309', lineHeight: 1.4 }}>
                {p.problem}
              </p>
              <div style={{ height: '1px', background: '#eee' }} />
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#2c2c2c', lineHeight: 1.7, fontWeight: '600' }}>
                ✅ {p.solution}
              </p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ===== كيف يعمل ===== */}
      <section style={{ padding: '50px 20px', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#e8f5e9', color: '#006400', padding: '4px 16px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '12px' }}>
          HOW IT WORKS
        </div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: '900', marginBottom: '40px', color: '#2c2c2c' }}>
          {c.howTitle}
        </h2>
 
        <div className="hfx-steps" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px', maxWidth: '750px', margin: '0 auto',
          position: 'relative'
        }}>
          {/* خط الربط — يظهر فقط على الكومبيوتر */}
          <div style={{
            position: 'absolute', top: '40px', left: '20%', right: '20%',
            height: '2px', background: 'linear-gradient(90deg, #ffc107, #006400)',
            zIndex: 0, opacity: 0.3
          }} />
 
          {[
            { num: '١', title: c.step1Title, desc: c.step1Desc, icon: '💳', color: '#ffc107' },
            { num: '٢', title: c.step2Title, desc: c.step2Desc, icon: '📱', color: '#3b82f6' },
            { num: '٣', title: c.step3Title, desc: c.step3Desc, icon: '🔧', color: '#006400' }
          ].map((step, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '20px', padding: '25px 15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #eee',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              position: 'relative', zIndex: 1
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: step.color, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', boxShadow: `0 4px 15px ${step.color}44`
              }}>
                {step.icon}
              </div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: '#2c2c2c', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '0.9rem'
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', margin: 0 }}>{step.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#777', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ===== الباقات ===== */}
      <section style={{ padding: '50px 20px', backgroundColor: '#fff', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#e8f5e9', color: '#006400', padding: '4px 16px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '12px' }}>
          PACKAGES · الباقات
        </div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: '900', marginBottom: '40px', color: '#2c2c2c' }}>
          {c.packagesTitle}
        </h2>
        <p style={{ margin: '-28px 0 34px', color: '#777', fontSize: '0.9rem' }}>{c.packagesSub}</p>
 
        <div className="hfx-pkg-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px', maxWidth: '950px', margin: '0 auto'
        }}>
          {c.packages.map((pkg, i) => {
            const isTarget = i === 0;
            const isDecoy = i === 1;
            return (
            <div key={i} style={{
              border: `${isTarget ? 3 : 2}px solid ${pkg.border}`, borderRadius: '24px',
              backgroundColor: pkg.color, position: 'relative',
              marginTop: '18px',
              boxShadow: isTarget ? `0 10px 32px ${pkg.border}55` : '0 6px 25px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column',
              textAlign: lang === 'ar' ? 'right' : 'left'
            }}>
              {/* شارة */}
              {pkg.badge && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: pkg.border, color: '#fff', padding: '5px 18px',
                  borderRadius: '20px', fontSize: '0.78rem', fontWeight: 'bold',
                  whiteSpace: 'nowrap', boxShadow: `0 4px 12px ${pkg.border}55`
                }}>
                  {pkg.badge}
                </div>
              )}
 
              {/* الاسم والسعر الإجمالي */}
              <div style={{ padding: '26px 20px 16px', borderBottom: `2px solid ${pkg.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '2.3rem' }}>{pkg.icon}</span>
                  <p style={{ margin: 0, fontWeight: '900', fontSize: '1.25rem', color: pkg.border }}>{pkg.name}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#222', lineHeight: 1 }}>{money(pkg.total)}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>MRU</span>
                  <span style={{ fontSize: '0.82rem', color: '#777' }}>· {c.forMonths}</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#888' }}>
                  {money(pkg.monthly)} MRU / {c.perMonth}
                </p>
              </div>
 
              {/* الزيارات وسعر الزيارة */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
                padding: '14px 20px', borderBottom: `1px dashed ${pkg.border}`,
                backgroundColor: isTarget ? '#e8f5e9' : 'transparent'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#333' }}>
                    🛠️ {pkg.visits} {c.visitsWord}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#888' }}>{c.visitsNote}</p>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{
                    fontSize: isTarget ? '1.8rem' : '1.05rem', fontWeight: '900',
                    color: isTarget ? '#1b8a3a' : '#999', lineHeight: 1
                  }}>
                    {money(pkg.perVisit)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isTarget ? '#1b8a3a' : '#aaa', marginTop: '3px' }}>
                    MRU / {c.perVisit}
                  </div>
                </div>
              </div>
 
              {/* الخدمات المشمولة */}
              <div style={{ padding: '16px 20px', flex: 1 }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.82rem', fontWeight: 'bold', color: '#555' }}>{c.included}</p>
                {pkg.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '9px' }}>
                    <span style={{ color: pkg.border, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: '14px', padding: '10px', background: 'rgba(0,0,0,0.04)',
                  borderRadius: '10px', fontSize: '0.75rem', color: '#777',
                  textAlign: 'center', borderTop: `1px dashed ${pkg.border}`
                }}>
                  ⚠️ {c.labourOnly}
                </div>
              </div>
 
              {/* الأزرار */}
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={onRegisterClick} style={{
                  padding: isTarget ? '15px' : '13px',
                  backgroundColor: isDecoy ? '#fff' : pkg.border,
                  color: isDecoy ? pkg.border : '#fff',
                  border: isDecoy ? `1.5px solid ${pkg.border}` : 'none',
                  borderRadius: '12px', fontWeight: 'bold',
                  fontSize: isTarget ? '1.05rem' : '0.95rem', cursor: 'pointer'
                }}>
                  {c.register}
                </button>
                <button onClick={() => generatePdf(pkg)} style={{
                  padding: '11px', backgroundColor: 'transparent',
                  border: `2px solid ${pkg.border}`, borderRadius: '12px',
                  fontWeight: 'bold', fontSize: '0.85rem', color: pkg.border, cursor: 'pointer'
                }}>
                  {c.downloadPdf}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </section>
 
      {/* ===== لماذا نحن ===== */}
      <section style={{ padding: '50px 20px', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#e8f5e9', color: '#006400', padding: '4px 16px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', marginBottom: '12px' }}>
          WHY US · لماذا نحن
        </div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: '900', marginBottom: '35px', color: '#2c2c2c' }}>
          {c.whyTitle}
        </h2>
 
        <div className="hfx-why-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px', maxWidth: '800px', margin: '0 auto'
        }}>
          {[
            { icon: '🛡️', text: c.why1, bg: '#e8f5e9', color: '#006400' },
            { icon: '📞', text: c.why2, bg: '#fff3e0', color: '#f59e0b' },
            { icon: '💰', text: c.why3, bg: '#e3f2fd', color: '#3b82f6' },
            { icon: '⭐', text: c.why4, bg: '#f3e5f5', color: '#9c27b0' }
          ].map((w, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '20px', padding: '22px 15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #eee',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                backgroundColor: w.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.7rem'
              }}>
                {w.icon}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#444', fontWeight: '700', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
                {w.text}
              </p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ===== CTA ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #004d00 0%, #006400 50%, #228B22 100%)',
        padding: '60px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: '#fff', top: '-100px', right: '-100px' }} />
        </div>
        <h2 style={{ fontSize: '2rem', color: '#fff', fontWeight: '900', marginBottom: '10px', position: 'relative', lineHeight: 1.3 }}>
          {c.ctaTitle}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '28px', position: 'relative' }}>
          {c.ctaDesc}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <button onClick={onRegisterClick} style={{
            padding: '14px 30px', backgroundColor: '#ffc107', color: '#333',
            border: 'none', borderRadius: '14px', fontWeight: 'bold',
            fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(255,193,7,0.35)'
          }}>
            🔧 {c.joinNow}
          </button>
          <button onClick={onLoginClick} style={{
            padding: '14px 30px', backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: '14px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
          }}>
            {c.login}
          </button>
        </div>
      </section>
 
      {/* ===== FOOTER ===== */}
      <footer style={{ backgroundColor: '#1a1a1a', padding: '30px 20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '15px' }}>
          <Logo size="sm" theme="light" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <a href={`https://wa.me/${APP_CONFIG.whatsapp}`} target="_blank" rel="noreferrer" style={{
            color: '#25D366', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold'
          }}>
            💬 WhatsApp
          </a>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <a href={`tel:${APP_CONFIG.phone}`} style={{
            color: '#ffc107', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold'
          }}>
            📞 {APP_CONFIG.phone}
          </a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: '4px 0' }}>{c.city}</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: '4px 0' }}>
          © 2026 Darfix · {c.footer}
        </p>
        <button
  onClick={() => setShowTerms(true)}
  style={{
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginTop: '6px',
    fontFamily: "'Tajawal', sans-serif"
  }}
>
  {lang === 'ar' ? '📄 الشروط والأحكام' : '📄 Conditions d\'utilisation'}
</button>
      </footer>
 
    </div>
  );
}
