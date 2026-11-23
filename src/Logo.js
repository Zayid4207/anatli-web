import React, { useState, useEffect } from 'react';

// شعار دارفكس — أيقونة منزل بمفتاح إصلاح + اسم يتبدل بين العربية والفرنسية
export default function Logo({ size = 'md', theme = 'light', stacked = false }) {
  const [isArabic, setIsArabic] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsArabic(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sizes = {
    sm: { box: 34, name: '1.15rem', sub: '0.5rem', gap: 9 },
    md: { box: 46, name: '1.5rem', sub: '0.6rem', gap: 11 },
    lg: { box: 60, name: '1.9rem', sub: '0.72rem', gap: 13 },
    xl: { box: 78, name: '2.4rem', sub: '0.9rem', gap: 16 }
  };

  const s = sizes[size] || sizes.md;
  const isLight = theme === 'light';
  const darColor = isLight ? '#ffffff' : '#006400';
  const fixColor = isLight ? '#ffc107' : '#d99a00';
  const subColor = isLight ? 'rgba(255,255,255,0.78)' : 'rgba(0,100,0,0.7)';
  const dividerColor = isLight ? 'rgba(255,255,255,0.3)' : 'rgba(0,100,0,0.2)';

  return (
    <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', alignItems: 'center', gap: stacked ? s.gap + 10 : s.gap, direction: 'ltr' }}>
      {/* الأيقونة: منزل أخضر ومفتاح إصلاح */}
      <svg
         width={stacked ? s.box * 1.7 : s.box}
        height={stacked ? s.box * 1.7 : s.box}
        viewBox="0 0 64 64"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 8px rgba(255,193,7,0.35))' }}
        aria-label="Darfix"
      >
        <rect width="64" height="64" rx="15" fill="#ffc107" />
        <path d="M10 33 L32 14 L54 33" fill="none" stroke="#00843D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 34 L32 21 L47 34 V49 a2 2 0 0 1 -2 2 H19 a2 2 0 0 1 -2 -2 Z" fill="#00843D" />
        {/* مفتاح الإصلاح */}
        <line x1="24" y1="46" x2="37" y2="33" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
        <circle cx="40" cy="30" r="5.6" fill="none" stroke="#fff" strokeWidth="4.2" />
        <line x1="40" y1="30" x2="46.5" y2="23.5" stroke="#00843D" strokeWidth="5.5" strokeLinecap="butt" />
      </svg>

      {/* النص المتبدل */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: stacked ? 'center' : 'stretch',
        minWidth: stacked ? 0 : (size === 'xl' ? '190px' : size === 'lg' ? '150px' : '120px')
      }}>
        <div style={{
          fontSize: s.name,
          fontWeight: '900',
          lineHeight: 1.05,
          letterSpacing: isArabic ? '0' : '0.5px',
          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Poppins', 'Segoe UI', sans-serif",
          direction: isArabic ? 'rtl' : 'ltr',
          textAlign: 'left'
        }}>
          {isArabic ? (
            <>
              <span style={{ color: darColor }}>دار</span>
              <span style={{ color: fixColor }}>فكس</span>
            </>
          ) : (
            <>
              <span style={{ color: darColor }}>Dar</span>
              <span style={{ color: fixColor }}>fix</span>
            </>
          )}
        </div>

        <div style={{ width: '100%', height: '1px', backgroundColor: dividerColor, margin: '2px 0' }} />

        <div style={{
          fontSize: s.sub,
          color: subColor,
          lineHeight: 1.3,
          fontFamily: "'Tajawal', sans-serif",
          direction: isArabic ? 'rtl' : 'ltr',
          textAlign: 'left'
        }}>
          {isArabic ? 'صيانة المنازل بالاشتراك' : "Entretien de la maison par abonnement"}
        </div>
      </div>
    </div>
  );
}
