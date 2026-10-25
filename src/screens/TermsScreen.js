import React, { useState } from 'react';
 
export default function TermsScreen({ onAccept, onDecline, lang: initialLang = 'ar' }) {
  const [lang, setLang] = useState(initialLang);
  const [checked, setChecked] = useState(false);
 
  const content = {
    ar: {
      title: 'شروط الخدمة',
      subtitle: 'يرجى قراءة الشروط والموافقة عليها للمتابعة',
      sections: [
        {
          icon: '🔧',
          title: 'حدود التغطية',
          items: [
            'التغطية تشمل اليد العاملة فقط — قطع الغيار على عاتق المشترك كاملاً.',
            'في حال وجود أكثر من عطل، يُرتب الزبون الأولوية وتُعالج الأعطال تباعاً حسب الطلبات.',
            'الخدمة تُقدم داخل مدينة نواكشوط فقط.',
          ]
        },
        {
          icon: '📋',
          title: 'شروط الطلب',
          items: [
            'يجب وصف المشكلة بدقة عند الطلب — أي معلومة مضللة تُلغي الطلب.',
            'في حال تكرار نفس العطل خلال 30 يوماً من تاريخ إصلاحه، تتكفل الشركة بإعادة الإصلاح مجاناً كضمان على جودة عملنا.',
            'الطلبات المُلغاة بعد إرسال الفني تُحتسب من رصيد الطلبات.',
          ]
        },
        {
          icon: '🚫',
          title: 'ما لا تشمله الخدمة',
          items: [
            'الأضرار الناتجة عن كوارث طبيعية أو حرائق.',
            'الأعطال الناتجة عن سوء الاستخدام المتعمد.',
            'أعمال البناء والتشطيب الجديدة.',
            'الأجهزة التي تجاوزت مدة صلاحيتها الطبيعية.',
          ]
        },
        {
          icon: '💳',
          title: 'الاشتراك والدفع',
          items: [
            'الاشتراك شخصي لا يُنقل لشخص آخر أو عقار آخر.',
            'لا يحق استرداد رسوم الاشتراك بعد التفعيل.',
            'انتهاء الاشتراك يوقف الخدمة فوراً.',
            'إثبات الدفع المزور يؤدي لحظر الحساب نهائياً.',
          ]
        },
        {
          icon: '⚖️',
          title: 'المسؤولية',
          items: [
            'الشركة غير مسؤولة عن أضرار جانبية تنتج أثناء التدخل خارج نطاق الطلب.',
            'في حال عدم الرضا عن الخدمة يُرفع الأمر للإدارة خلال 24 ساعة من إتمام الطلب.',
            'التقييم الكاذب أو الشكوى الكيدية تؤدي لتعليق الحساب.',
          ]
        },
        {
          icon: '🔒',
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
      lastUpdated: 'آخر تحديث: أكتوبر 2026',
      company: 'S.A.R.M · خدمة تأمين إصلاح المنازل · نواكشوط، موريتانيا',
    },
    fr: {
      title: 'Conditions d\'utilisation',
      subtitle: 'Veuillez lire et accepter les conditions pour continuer',
      sections: [
        {
          icon: '🔧',
          title: 'Limites de couverture',
          items: [
            'La couverture inclut uniquement la main-d\'œuvre — les pièces détachées sont à la charge de l\'abonné.',
            'En cas de plusieurs pannes, l\'abonné définit ses priorités et les interventions sont planifiées en conséquence.',
            'Le service est disponible uniquement à Nouakchott.',
          ]
        },
        {
          icon: '📋',
          title: 'Conditions de demande',
          items: [
            'La panne doit être décrite avec précision — toute information trompeuse entraîne l\'annulation de la demande.',
            'Si la même panne se reproduit dans les 30 jours suivant la réparation, la société s\'engage à refaire l\'intervention gratuitement, en garantie de la qualité de notre travail.',
            'Les demandes annulées après l\'envoi du technicien sont décomptées du solde de demandes.',
          ]
        },
        {
          icon: '🚫',
          title: 'Exclusions de couverture',
          items: [
            'Les dommages causés par des catastrophes naturelles ou des incendies.',
            'Les pannes résultant d\'une mauvaise utilisation intentionnelle.',
            'Les travaux de construction et de finition neufs.',
            'Les appareils ayant dépassé leur durée de vie normale.',
          ]
        },
        {
          icon: '💳',
          title: 'Abonnement et paiement',
          items: [
            'L\'abonnement est personnel et non transférable à une autre personne ou propriété.',
            'Les frais d\'abonnement ne sont pas remboursables après activation.',
            'L\'expiration de l\'abonnement suspend le service immédiatement.',
            'Une preuve de paiement falsifiée entraîne la suspension définitive du compte.',
          ]
        },
        {
          icon: '⚖️',
          title: 'Responsabilité',
          items: [
            'La société n\'est pas responsable des dommages collatéraux survenus en dehors du périmètre de la demande.',
            'Tout mécontentement doit être signalé à l\'administration dans les 24 heures suivant la fin de l\'intervention.',
            'Un faux avis ou une plainte malveillante entraîne la suspension du compte.',
          ]
        },
        {
          icon: '🔒',
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
      lastUpdated: 'Dernière mise à jour : Octobre 2026',
      company: 'S.A.R.M · Assurance réparation domicile · Nouakchott, Mauritanie',
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
        padding: '30px 20px 40px',
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
        <div style={{
          width: '60px', height: '60px', borderRadius: '16px',
          backgroundColor: '#ffc107',
          margin: '0 auto 15px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
        }}>
          🏠
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
        padding: '20px 16px 120px',
      }}>
 
        {c.sections.map((section, i) => (
          <div key={i} style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #eef0f3',
          }}>
            {/* رأس القسم */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#fafbfc',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
              <h3 style={{
                margin: 0, fontSize: '0.95rem',
                fontWeight: '800', color: '#1a1a1a'
              }}>
                {section.title}
              </h3>
            </div>
 
            {/* البنود */}
            <div style={{ padding: '12px 18px' }}>
              {section.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: j < section.items.length - 1 ? '1px solid #f5f5f5' : 'none',
                }}>
                  <span style={{
                    color: '#006400', fontWeight: 'bold',
                    flexShrink: 0, marginTop: '2px', fontSize: '0.85rem'
                  }}>✓</span>
                  <p style={{
                    margin: 0, fontSize: '0.85rem',
                    color: '#444', lineHeight: 1.6
                  }}>
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
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #eee',
        padding: '14px 20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 100,
        maxWidth: '620px',
        margin: '0 auto',
      }}>
 
        {/* خانة الموافقة */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '12px', cursor: 'pointer',
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
            {c.acceptBtn} {checked ? '✓' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
