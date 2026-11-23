import React, { useState } from 'react';
import Logo from '../Logo';
 const TIcon = ({ name }) => {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'tool') return (<svg {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>);
  if (name === 'clipboard') return (<svg {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M8.5 10h7M8.5 14h7M8.5 18h4" /></svg>);
  if (name === 'calendar') return (<svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>);
  if (name === 'ban') return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="m5.7 5.7 12.6 12.6" /></svg>);
  if (name === 'card') return (<svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><path d="M7 15h4" /></svg>);
  if (name === 'scale') return (<svg {...p}><path d="M12 4v16M7 20h10" /><path d="M5 7h14" /><path d="m5 7-3 7a3.5 3.5 0 0 0 6 0L5 7zM19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7z" /></svg>);
  return (<svg {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>);
};
const SECTION_ICONS = ['tool', 'clipboard', 'calendar', 'ban', 'card', 'scale', 'lock'];
export default function TermsScreen({ onAccept, onDecline, lang: initialLang = 'ar', readOnly = false }) {
  const [lang, setLang] = useState(initialLang);
  const [checked, setChecked] = useState(false);
 
  const content = {
    ar: {
      title: 'شروط الخدمة',
      subtitle: 'يرجى قراءة الشروط والموافقة عليها للمتابعة',
      sections: [
        {
          title: 'نطاق الخدمة',
          items: [
            'الخدمة تشمل اليد العاملة فقط — قطع الغيار على عاتق المشترك كاملاً.',
            'في حال وجود أكثر من عطل، يُرتب الزبون الأولوية وتُعالج الأعطال تباعاً حسب الطلبات.',
            'الخدمة تُقدم داخل مدينة نواكشوط فقط.',
            'ساعات العمل من 8 صباحاً حتى 11 مساءً.',
          ]
        },
        {
          title: 'شروط الطلب',
          items: [
            'يجب وصف المشكلة بدقة عند الطلب — أي معلومة مضللة تُلغي الطلب.',
            'تُعيّن الإدارة الفني المناسب لكل طلب.',
            'يُسمح بطلب واحد مفتوح لكل مشترك في الوقت نفسه، ويُقدَّم الطلب التالي بعد اكتمال السابق.',
            'في حال تكرار نفس العطل بعد إصلاحه، تدرس الإدارة الحالة وتقرر ما تراه مناسباً.',
            'الطلبات المُلغاة بعد إرسال الفني تُحتسب من رصيد الزيارات.',
          ]
        },
        {
          title: 'الزيارات ومدة الاشتراك',
          items: [
            'مدة الاشتراك أربعة أشهر، ويتضمن رصيداً محدداً من الزيارات حسب الباقة، يستخدمه المشترك متى شاء خلال المدة.',
            'يُحتسب كل طلب خدمة زيارة واحدة من الرصيد.',
            'ينتهي الاشتراك بانتهاء المدة أو باستنفاد رصيد الزيارات، أيهما أسبق.',
          ]
        },
        {
          title: 'ما لا تشمله الخدمة',
          items: [
            'الأضرار الناتجة عن كوارث طبيعية أو حرائق.',
            'الأعطال الناتجة عن سوء الاستخدام المتعمد.',
            'أعمال البناء والتشطيب الجديدة.',
            'الأجهزة التي تجاوزت مدة صلاحيتها الطبيعية.',
          ]
        },
        {
          title: 'الاشتراك والدفع',
          items: [
            'الاشتراك الشخصي لا يُنقل ولا يستفاد منه لشخص آخر أو عقار آخر.',
            'لا يحق استرداد رسوم الاشتراك بعد التفعيل.',
            'انتهاء الاشتراك يوقف الخدمة فوراً.',
            'إثبات الدفع المزور يؤدي لحظر الحساب نهائياً.',
          ]
        },
        {
          title: 'المسؤولية',
          items: [
            'الشركة غير مسؤولة عن أضرار جانبية تنتج أثناء التدخل خارج نطاق الطلب.',
            'في حال عدم الرضا عن الخدمة يُرفع الأمر للإدارة خلال 24 ساعة من إتمام الطلب.',
            'التقييم الكاذب أو الشكوى الكيدية تؤدي لتعليق الحساب.',
          ]
        },
        {
          title: 'الخصوصية والبيانات',
          items: [
            'بيانات المشترك لن تُشارك مع أي طرف ثالث.',
            'رقم الهاتف يُستخدم فقط للتواصل المتعلق بالخدمة.',
            'يحق للشركة تعليق أو حذف أي حساب يخالف هذه الشروط.',
          ]
        },
      ],
      checkLabel: 'قرأت الشروط والأحكام وأوافق عليها',
      acceptBtn: 'قبول والمتابعة',
      declineBtn: 'رفض',
      lastUpdated: 'آخر تحديث: نوفمبر 2026',
      company: 'دارفكس · صيانة المنازل بالاشتراك · نواكشوط، موريتانيا',
    },
    fr: {
      title: 'Conditions d\'utilisation',
      subtitle: 'Veuillez lire et accepter les conditions pour continuer',
      sections: [
        {
          title: 'Périmètre du service',
          items: [
            'Le service inclut uniquement la main-d\'œuvre — les pièces détachées sont à la charge de l\'abonné.',
            'En cas de plusieurs pannes, l\'abonné définit ses priorités et les interventions sont planifiées en conséquence.',
            'Le service est disponible uniquement à Nouakchott.',
            'Horaires de service : de 8 h à 23 h.',
          ]
        },
        {
          title: 'Conditions de demande',
          items: [
            'La panne doit être décrite avec précision — toute information trompeuse entraîne l\'annulation de la demande.',
            'L\'administration affecte le technicien adapté à chaque demande.',
            'Une seule demande ouverte à la fois par abonné ; la suivante peut être faite une fois la précédente terminée.',
            'Si la même panne se reproduit après sa réparation, l\'administration étudie la situation et décide de la suite à donner.',            'Les demandes annulées après l\'envoi du technicien sont décomptées du solde de visites.',
          ]
        },
        {
          title: 'Visites et durée de l\'abonnement',
          items: [
            'L\'abonnement dure quatre mois et comprend un solde de visites défini par le forfait, utilisable à tout moment pendant cette durée.',
            'Chaque demande de service compte pour une visite du solde.',
            'L\'abonnement prend fin à l\'expiration de la durée ou à l\'épuisement du solde de visites, selon la première éventualité.',
          ]
        },
        {
          title: 'Ce que le service ne comprend pas',
          items: [
            'Les dommages causés par des catastrophes naturelles ou des incendies.',
            'Les pannes résultant d\'une mauvaise utilisation intentionnelle.',
            'Les travaux de construction et de finition neufs.',
            'Les appareils ayant dépassé leur durée de vie normale.',
          ]
        },
        {
          title: 'Abonnement et paiement',
          items: [
            'L\'abonnement est personnel et non transférable à une autre personne ou propriété.',
            'Les frais d\'abonnement ne sont pas remboursables après activation.',
            'L\'expiration de l\'abonnement suspend le service immédiatement.',
            'Une preuve de paiement falsifiée entraîne la suspension définitive du compte.',
          ]
        },
        {
          title: 'Responsabilité',
          items: [
            'La société n\'est pas responsable des dommages collatéraux survenus en dehors du périmètre de la demande.',
            'Tout mécontentement doit être signalé à l\'administration dans les 24 heures suivant la fin de l\'intervention.',
            'Un faux avis ou une plainte malveillante entraîne la suspension du compte.',
          ]
        },
        {
          title: 'Confidentialité et données',
          items: [
            'Les données de l\'abonné ne seront pas partagées avec des tiers.',
            'Le numéro de téléphone est utilisé uniquement pour les communications liées au service.',
            'La société se réserve le droit de suspendre ou supprimer tout compte ne respectant pas ces conditions.',
          ]
        },
      ],
      checkLabel: 'J\'ai lu et j\'accepte les conditions d\'utilisation',
      acceptBtn: 'Accepter et continuer',
      declineBtn: 'Refuser',
      lastUpdated: 'Dernière mise à jour : Novembre 2026',
      company: 'Darfix · Entretien de la maison par abonnement · Nouakchott, Mauritanie',
    }
  };
 
  const c = content[lang];
 
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      fontFamily: "'Tajawal', Arial, sans-serif",
      direction: lang === 'ar' ? 'rtl' : 'ltr',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
 
      {/* الرأسية */}
      <div style={{
        background: 'linear-gradient(135deg, #004d00 0%, #006400 100%)',
        padding: '26px 20px 30px',
        borderRadius: '0 0 26px 26px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* دائرة خلفية */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
          top: '-100px', right: '-80px', pointerEvents: 'none'
        }} />
 
        {/* زر اللغة */}
        <div style={{ position: 'absolute', top: '15px', left: lang === 'ar' ? '15px' : 'auto', right: lang === 'fr' ? '15px' : 'auto' }}>
          <button
            onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
            style={{
              padding: '5px 14px', borderRadius: '20px',
              border: '1.5px solid rgba(255,255,255,0.5)',
              background: 'transparent', color: '#fff',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            {lang === 'ar' ? 'FR' : 'AR'}
          </button>
        </div>
 
        {/* الشعار */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Logo size="md" theme="light" />
        </div>
 
        <h1 style={{
          color: '#fff', fontSize: '1.6rem', fontWeight: '900',
          margin: '0 0 8px', letterSpacing: '0.5px'
        }}>
          {c.title}
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem',
          margin: 0, lineHeight: 1.5
        }}>
          {c.subtitle}
        </p>
      </div>
 
      {/* المحتوى */}
      <div style={{
        maxWidth: '620px', margin: '0 auto',
        padding: `20px 16px ${readOnly ? '40px' : 'calc(185px + env(safe-area-inset-bottom))'}`,
      }}>
 
              {c.sections.map((section, i) => (
          <div key={i} style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            marginBottom: '12px',
            padding: '16px 16px 6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #eef0f3',
          }}>
            {/* رأس القسم */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                backgroundColor: '#e6f2e6', color: '#006400',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <TIcon name={SECTION_ICONS[i]} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1a1a1a' }}>
                {section.title}
              </h3>
            </div>

            {/* البنود */}
            <div>
              {section.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '9px 0',
                  borderTop: j === 0 ? 'none' : '1px solid #f3f3f3',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: '#228B22', flexShrink: 0, marginTop: '10px'
                  }} />
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#444', lineHeight: 1.7 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
 
        {/* آخر تحديث */}
        <p style={{
          textAlign: 'center', color: '#aaa',
          fontSize: '0.75rem', margin: '16px 0 0'
        }}>
          {c.lastUpdated} · {c.company}
        </p>
      </div>
 
      {/* شريط القبول الثابت في الأسفل */}
     {!readOnly && (
  <div style={{
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTop: '1px solid #eee',
    padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    zIndex: 100,
    maxWidth: '620px',
    margin: '0 auto',
  }}>
    
 
 
        {/* خانة الموافقة */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '10px', cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#006400', cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.4 }}>
            {c.checkLabel}
          </span>
        </label>
 
        {/* الأزرار */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onDecline}
            style={{
              flex: 1, padding: '12px',
              borderRadius: '12px',
              border: '1.5px solid #ddd',
              background: '#fff', color: '#888',
              fontWeight: 'bold', fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {c.declineBtn}
          </button>
          <button
            onClick={() => checked && onAccept()}
            style={{
              flex: 2, padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: checked
                ? 'linear-gradient(135deg, #006400, #228B22)'
                : '#e0e0e0',
              color: checked ? '#fff' : '#aaa',
              fontWeight: 'bold', fontSize: '0.9rem',
              cursor: checked ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: checked ? '0 4px 15px rgba(0,100,0,0.25)' : 'none',
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
           {c.acceptBtn}
          </button>
        </div>
      </div>
       
)}
    </div>
  );
}