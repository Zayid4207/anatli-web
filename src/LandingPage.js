import React from 'react';

export default function LandingPage({ onLoginClick, onRegisterClick }) {
  // مصفوفة الخدمات لتسهيل إدارتها داخل React
  // ميزة إشعار الآيفون: التحكم في ظهور النافذة المنبثقة
  const [showIosBanner, setShowIosBanner] = React.useState(false);

  React.useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true;
    const isBannerDismissed = sessionStorage.getItem('iosBannerDismissed');

    if (isIos && !isStandalone && !isBannerDismissed) {
      setShowIosBanner(true);
    }
  }, []);

  const closeIosBanner = () => {
    setShowIosBanner(false);
    sessionStorage.setItem('iosBannerDismissed', 'true');
  };
  const services = [
    { name: 'سباكة', fr: 'Plomberie', icon: 'ti-droplet', bg: '#E1F5EE', color: '#0F6E56' },
    { name: 'كهرباء', fr: 'Électricité', icon: 'ti-bolt', bg: '#FAEEDA', color: '#BA7517' },
    { name: 'تنظيف', fr: 'Nettoyage', icon: 'ti-sparkles', bg: '#E6F1FB', color: '#185FA5' },
    { name: 'صيانة منزلية', fr: 'Maintenance', icon: 'ti-tool', bg: '#FCEBEB', color: '#A32D2D' },
    { name: 'تكييف', fr: 'Climatisation', icon: 'ti-wind', bg: '#EAF3DE', color: '#3B6D11' },
    { name: 'بناء', fr: 'Construction', icon: 'ti-building', bg: '#FAEEDA', color: '#BA7517' },
  ];

  return (
    <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", background: '#fff', color: '#2C2C2A' }}>
      
      {/* استدعاء خطوط Google والأيقونات بشكل آمن متوافق مع نظام كاباسيتور والويب */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      {/* حقن التنسيقات (Styles) لضمان ثبات المظهر تماماً كما أرسلته */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --primary: #0F6E56; --primary-light: #1D9E75; --primary-pale: #E1F5EE;
          --accent: #EF9F27; --accent-dark: #BA7517;
          --dark: #2C2C2A; --mid: #5F5E5A; --light: #F1EFE8; --white: #fff;
        }
        .hero { background: var(--primary); position: relative; overflow: hidden; min-height: 100vh; display: flex; flex-direction: column; }
        .hero-circles { position: absolute; inset: 0; overflow: hidden; opacity: .06; pointer-events: none; }
        .hero-circles span { position: absolute; border-radius: 50%; background: #fff; }
        nav { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 3rem; position: relative; z-index: 2; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-box { width: 46px; height: 46px; background: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .logo-box i { font-size: 24px; color: var(--dark); }
        .logo-name { font-family: 'Playfair Display', serif; font-size: 24px; color: #fff; font-weight: 700; line-height: 1; }
        .logo-tagline { font-size: 11px; color: rgba(255,255,255,.55); letter-spacing: 2px; text-transform: uppercase; margin-top: 3px; }
        .nav-links { display: flex; gap: 10px; }
        .btn-ghost { padding: 9px 22px; border: 1.5px solid rgba(255,255,255,.4); border-radius: 9px; background: transparent; color: #fff; font-family: 'Tajawal', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: .2s; }
        .btn-ghost:hover { background: rgba(255,255,255,.1); }
        .btn-yellow { padding: 9px 22px; border: none; border-radius: 9px; background: var(--accent); color: var(--dark); font-family: 'Tajawal', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: .2s; }
        .btn-yellow:hover { background: #f0a830; }
        .hero-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 3rem 2rem 5rem; position: relative; z-index: 2; }
        .pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(239,159,39,.15); border: 1px solid rgba(239,159,39,.35); color: var(--accent); padding: 7px 18px; border-radius: 30px; font-size: 13px; font-weight: 500; margin-bottom: 1.8rem; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.6rem, 6vw, 4.8rem); color: #fff; line-height: 1.1; max-width: 720px; margin-bottom: 1rem; }
        .hero-title em { color: var(--accent); font-style: normal; }
        .hero-fr { font-size: 16px; color: rgba(255,255,255,.5); font-style: italic; margin-bottom: .8rem; }
        .hero-desc { font-size: 17px; color: rgba(255,255,255,.75); max-width: 500px; line-height: 1.85; margin-bottom: 2.5rem; }
        .cta-row { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
        .btn-big { padding: 15px 36px; border-radius: 11px; font-family: 'Tajawal', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; border: none; transition: .2s; }
        .btn-big-yellow { background: var(--accent); color: var(--dark); }
        .btn-big-yellow:hover { background: #f0a830; transform: translateY(-2px); }
        .btn-big-white { background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.3); color: #fff; }
        .btn-big-white:hover { background: rgba(255,255,255,.2); }
        .hero-stats { display: flex; gap: 4rem; padding-top: 2.5rem; margin-top: 3rem; border-top: 1px solid rgba(255,255,255,.15); }
        .stat .n { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; color: #fff; }
        .stat .l { font-size: 13px; color: rgba(255,255,255,.55); margin-top: 2px; }
        .wave { display: block; margin-top: -1px; }
        .services { padding: 5rem 3rem; text-align: center; }
        .tag { display: inline-block; background: var(--primary-pale); color: var(--primary); padding: 5px 16px; border-radius: 20px; font-size: 11px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; margin-bottom: 1rem; }
        .sec-title { font-family: 'Playfair Display', serif; font-size: clamp(1.9rem, 4vw, 2.8rem); color: var(--dark); margin-bottom: .5rem; }
        .sec-title span { color: var(--primary); }
        .sec-sub { font-size: 15px; color: var(--mid); max-width: 480px; margin: 0 auto; line-height: 1.8; }
        .srv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 16px; margin-top: 3rem; }
        .srv-card { background: #fff; border: 1px solid #eae9e2; border-radius: 18px; padding: 2rem 1.2rem; text-align: center; cursor: pointer; transition: .25s; }
        .srv-card:hover { border-color: var(--primary-light); transform: translateY(-5px); box-shadow: 0 14px 36px rgba(15,110,86,.1); }
        .srv-icon { width: 62px; height: 62px; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.1rem; font-size: 28px; }
        .srv-ar { font-size: 17px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
        .srv-fr { font-size: 12px; color: var(--mid); letter-spacing: .5px; }
        .how { background: var(--light); padding: 5rem 3rem; text-align: center; }
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3.5rem; position: relative; }
        .steps::before { content: ''; position: absolute; top: 38px; right: calc(16.6% + 32px); left: calc(16.6% + 32px); height: 2px; background: repeating-linear-gradient(to left, var(--primary-light) 0, var(--primary-light) 8px, transparent 8px, transparent 16px); z-index: 0; }
        .step { text-align: center; position: relative; z-index: 1; }
        .step-num { width: 64px; height: 64px; border-radius: 50%; background: #fff; border: 3px solid var(--primary-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 900; color: var(--primary); }
        .step.active .step-num { background: var(--primary); color: #fff; border-color: var(--primary); }
        .step-t { font-size: 17px; font-weight: 700; color: var(--dark); margin-bottom: .4rem; }
        .step-d { font-size: 14px; color: var(--mid); line-height: 1.75; }
        .step-df { font-size: 12px; color: #aaa; font-style: italic; margin-top: 4px; }
        .why { padding: 5rem 3rem; }
        .why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-top: 3rem; }
        .why-card { background: #fff; border: 1px solid #eae9e2; border-radius: 16px; padding: 1.8rem; display: flex; gap: 1.1rem; align-items: flex-start; }
        .why-icon { width: 50px; height: 50px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 24px; }
        .why-t { font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 5px; }
        .why-d { font-size: 14px; color: var(--mid); line-height: 1.75; }
        .cta-sec { background: var(--primary); padding: 5rem 3rem; text-align: center; position: relative; overflow: hidden; }
        .cta-sec::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,.04); }
        .cta-sec::after { content: ''; position: absolute; bottom: -60px; left: -60px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.04); }
        .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem); color: #fff; margin-bottom: .8rem; position: relative; z-index: 1; }
        .cta-sub { font-size: 16px; color: rgba(255,255,255,.7); margin-bottom: 2.5rem; position: relative; z-index: 1; line-height: 1.8; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
        footer { background: var(--dark); padding: 2.5rem 3rem; text-align: center; }
        .footer-logo { font-family: 'Playfair Display', serif; font-size: 20px; color: #fff; margin-bottom: .5rem; }
        .footer-sub { font-size: 13px; color: rgba(255,255,255,.4); line-height: 1.8; }
        .footer-sub span { color: var(--accent); }
        @media(max-width:768px){
          nav { padding: 1.2rem 1.5rem; }
          .services, .how, .why, .cta-sec { padding: 4rem 1.5rem; }
          .steps { grid-template-columns: 1fr; }
          .steps::before { display: none; }
          .hero-stats { gap: 2rem; }
          footer { padding: 2rem 1.5rem; }
        
  nav {
    flex-direction: column;
    gap: 15px;
    padding: 1rem !important;
    text-align: center;
  }
  .nav-links {
    width: 100%;
    justify-content: center;
  }
  .btn-ghost, .btn-yellow {
    flex: 1; 
    text-align: center;
    font-size: 13px;
    padding: 10px 14px;
  }

  
  .hero {
    min-height: auto; 
    padding-bottom: 3rem;
  }
  .hero-body {
    padding: 2rem 1rem 3rem !important;
  }
  .hero-title {
    font-size: 1.8rem !important; 
    line-height: 1.3;
  }
  .hero-desc {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 2rem;
  }
  .cta-row {
    flex-direction: column; 
    width: 100%;
    gap: 10px;
  }
  .btn-big {
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
  }

  
  .hero-stats {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr); 
    gap: 1.5rem !important;
    width: 100%;
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
  .stat .n {
    font-size: 1.6rem;
  }

  
  .srv-grid {
    grid-template-columns: repeat(2, 1fr) !important; 
    gap: 12px;
    margin-top: 2rem;
  }
  .srv-card {
    padding: 1.2rem 0.8rem;
  }
  .srv-icon {
    width: 50px;
    height: 50px;
    font-size: 22px;
    margin-bottom: 0.8rem;
  }
  .srv-ar {
    font-size: 15px;
  }

  
  .steps {
    gap: 1.5rem !important;
  }
  .step-num {
    width: 50px;
    height: 50px;
    font-size: 18px;
    margin-bottom: 0.8rem;
  }

  
  .why-grid {
    grid-template-columns: 1fr !important; 
    gap: 12px;
  }
  .why-card {
    padding: 1.2rem;
    gap: 0.8rem;
  }
        }
      `}</style>

      {/* HERO SECTION */}
      <div className="hero">
        <div className="hero-circles">
          <span style={{ width: '500px', height: '500px', top: '-100px', right: '-100px' }}></span>
          <span style={{ width: '300px', height: '300px', bottom: '-50px', left: '-50px' }}></span>
          <span style={{ width: '200px', height: '200px', top: '40%', left: '40%' }}></span>
        </div>

        <nav>
          <div className="logo">
            <div className="logo-box"><i className="ti ti-tool"></i></div>
            <div>
              <div className="logo-name">Le Plombier</div>
              <div className="logo-tagline">خدمات منزلية · Services à domicile</div>
            </div>
          </div>
          <div className="nav-links">
            {/* ربط زر تسجيل الدخول بوظيفة تسجيل الدخول من الأجزاء الأخرى للمشروع */}
            <button className="btn-ghost" onClick={onLoginClick}>تسجيل الدخول</button>
            {/* ربط زر ابدأ الآن بوظيفة التسجيل والبدء */}
            <button className="btn-yellow" onClick={onRegisterClick}>ابدأ الآن</button>
          </div>
        </nav>

        <div className="hero-body">
          <div className="pill"><i className="ti ti-map-pin" style={{ fontSize: '14px' }}></i> نواكشوط، موريتانيا</div>
          <h1 className="hero-title">
            خدمات منزلية موثوقة<br />
            <em>في متناول يدك</em>
          </h1>
          <p className="hero-fr">Des artisans qualifiés, disponibles rapidement</p>
          <p className="hero-desc">نربطك بأفضل الحرفيين المعتمدين — سباكة، كهرباء، تنظيف وأكثر، بضغطة واحدة وبدون تعقيد.</p>
          <div className="cta-row">
            {/* توجيه العميل لبدء الخدمة أو التسجيل عبر النقر */}
            <button className="btn-big btn-big-yellow" onClick={onRegisterClick}>🔧 اطلب خدمة الآن</button>
            <button className="btn-big btn-big-white" onClick={onRegisterClick}>👷 أنا حرفي — انضم</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="n">+200</div><div className="l">حرفي معتمد</div></div>
            <div className="stat"><div className="n">+500</div><div className="l">طلب منجز</div></div>
            <div className="stat"><div className="n">6</div><div className="l">خدمات متاحة</div></div>
            <div className="stat"><div className="n">⭐ 4.8</div><div className="l">متوسط التقييم</div></div>
          </div>
        </div>

        <svg className="wave" viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ height: '70px', display: 'block' }}>
          <path d="M0,70 C360,0 1080,0 1440,70 L1440,70 L0,70 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* SERVICES SECTION */}
      <section className="services">
        <div className="tag">SERVICES · الخدمات</div>
        <h2 className="sec-title"><span>?Vous-attendez Quoi</span></h2>
        <p className="sec-sub">حرفيون متخصصون في 6 مجالات، جاهزون لحل مشاكلك بسرعة وااحترافية.</p>
        <div className="srv-grid">
          {services.map((srv, index) => (
            <div key={index} className="srv-card" onClick={onRegisterClick}>
              <div className="srv-icon" style={{ background: srv.bg }}>
                <i className={`ti ${srv.icon}`} style={{ color: srv.color }}></i>
              </div>
              <div className="srv-ar">{srv.name}</div>
              <div className="srv-fr">{srv.fr}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how">
        <div className="tag">COMMENT ÇA MARCHE · كيف يعمل</div>
        <h2 className="sec-title">ثلاث خطوات <span>بسيطة</span></h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">١</div>
            <div className="step-t">سجّل حسابك</div>
            <div className="step-d">أنشئ حسابك كزبون أو كحرفي خلال دقيقة واحدة</div>
            <div className="step-df">Créez votre compte en 1 minute</div>
          </div>
          <div className="step active">
            <div className="step-num">٢</div>
            <div className="step-t">اطلب الخدمة</div>
            <div className="step-d">حدد نوع الخدمة وموقعك واشرح المشكلة ببساطة</div>
            <div className="step-df">Décrivez votre besoin</div>
          </div>
          <div className="step">
            <div className="step-num">٣</div>
            <div className="step-t">انتظر الحرفي</div>
            <div className="step-d">سيصلك حرفي متخصص في أقرب وقت ممكن</div>
            <div className="step-df">Un artisan arrive chez vous</div>
          </div>
        </div>
      </section>

      {/* WHY US SECTION */}
      <section className="why">
        <div style={{ textAlign: 'center' }}>
          <div className="tag">POURQUOI NOUS · لماذا نحن</div>
          <h2 className="sec-title">مزايا <span>تميّزنا</span></h2>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon" style={{ background: '#E1F5EE' }}><i className="ti ti-shield-check" style={{ color: '#0F6E56' }}></i></div>
            <div><div className="why-t">حرفيون موثوقون</div><div className="why-d">كل حرفي يمر بعملية تحقق قبل الانضمام — Artisans vérifiés</div></div>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: '#FAEEDA' }}><i className="ti ti-clock" style={{ color: '#BA7517' }}></i></div>
            <div><div className="why-t">استجابة سريعة</div><div className="why-d">نربطك بأقرب حرفي متاح في أسرع وقت — Réponse rapide</div></div>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: '#E6F1FB' }}><i className="ti ti-star" style={{ color: '#185FA5' }}></i></div>
            <div><div className="why-t">تقييمات حقيقية</div><div className="why-d">اختر حرفيك بناءً على تقييمات الزبائن — Avis authentiques</div></div>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: '#FCEBEB' }}><i className="ti ti-device-mobile" style={{ color: '#A32D2D' }}></i></div>
            <div><div className="why-t">سهل الاستخدام</div><div className="why-d">واجهة بسيطة تعمل على كل الأجهزة — Interface simple</div></div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-sec">
        <h2 className="cta-title">هل أنت مستعد؟</h2>
        <p className="cta-sub">
          انضم إلى مئات المستخدمين الذين يثقون في Le Plombier<br />
          <span style={{ fontStyle: 'italic', fontSize: '14px' }}>Rejoignez nos utilisateurs satisfaits dès aujourd'hui</span>
        </p>
        <div className="cta-btns">
          <button className="btn-big btn-big-yellow" onClick={onRegisterClick}>🔧 اطلب خدمة الآن</button>
          <button className="btn-big btn-big-white" onClick={onRegisterClick}>👷 انضم كحرفي</button>
        </div>
      </section>
      {/* نافذة تثبيت الموقع للآيفون */}
      {showIosBanner && (
        <div id="ios-install-banner" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '16px', padding: '16px', zIndex: 9999, direction: 'rtl', border: '1px solid #e5e5ea' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#EF9F27', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2C2C2A' }}>
                <i className="ti ti-tool" style={{ fontSize: '24px' }}></i>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#1c1c1e', fontWeight: '600' }}>تثبيت تطبيق Le Plombier</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#8e8e93' }}>قم بإضافته للشاشة الرئيسية للوصول السريع</p>
              </div>
            </div>
            <button onClick={closeIosBanner} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#8e8e93', cursor: 'pointer', padding: '0 4px' }}>&times;</button>
          </div>
          
          <hr style={{ border: 0, borderTop: '1px solid #e5e5ea', margin: '12px 0' }} />
          
          <div style={{ fontSize: '14px', color: '#3a3a3c', lineHeight: '1.5', textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
              <span style={{ backgroundColor: '#f2f2f7', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '12px', fontWeight: 'bold' }}>١</span>
              <span>اضغط على زر"مشاركة" ⬆️ في أسفل المتصفح <img src="https://developer.apple.com/design/human-interface-guidelines/images/images-guide/icons/share_large_2x.png" width="16" style={{ verticalAlign: 'middle', margin: '0 4px' }} alt="share" /></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#f2f2f7', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '12px', fontWeight: 'bold' }}>٢</span>
              <span>اختر **"إضافة إلى الشاشة الرئيسية"** من القائمة.</span>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Le Plombier</div>
        <div className="footer-sub">
          نواكشوط، موريتانيا · Nouakchott, Mauritanie<br />
          © 2026 <span>Le Plombier</span> · Tous droits réservés · جميع الحقوق محفوظة
        </div>
      </footer>

    </div>
  );
}