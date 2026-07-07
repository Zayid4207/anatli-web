import React, { useState, useEffect } from 'react';
 
export default function Logo({ size = 'md', theme = 'light' }) {
  const [isArabic, setIsArabic] = useState(true);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setIsArabic(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
 
  const sizes = {
    sm: { box: 32, abbr: '0.8rem', sub: '0.5rem', gap: 8 },
    md: { box: 44, abbr: '1rem', sub: '0.6rem', gap: 10 },
    lg: { box: 58, abbr: '1.25rem', sub: '0.72rem', gap: 12 },
    xl: { box: 75, abbr: '1.55rem', sub: '0.9rem', gap: 16 }
  };
 
  const s = sizes[size] || sizes.md;
  const isLight = theme === 'light';
  const textColor = isLight ? '#fff' : '#006400';
  const subColor = isLight ? 'rgba(255,255,255,0.75)' : 'rgba(0,100,0,0.65)';
  const dividerColor = isLight ? 'rgba(255,255,255,0.3)' : 'rgba(0,100,0,0.2)';
 
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: s.gap,
      direction: 'ltr'
    }}>
      {/* الأيقونة — منزل بألوان العلم الموريتاني */}
      <div style={{
        width: s.box,
        height: s.box,
        backgroundColor: '#ffc107',
        borderRadius: s.box * 0.2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 3px 10px rgba(255,193,7,0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* سقف — أخضر (العلم الموريتاني) */}
        <div style={{
          width: 0, height: 0,
          borderLeft: `${s.box * 0.38}px solid transparent`,
          borderRight: `${s.box * 0.38}px solid transparent`,
          borderBottom: `${s.box * 0.3}px solid #00843D`,
          position: 'absolute',
          top: s.box * 0.1
        }} />
        {/* جسم — أخضر (العلم الموريتاني) */}
        <div style={{
          position: 'absolute',
          bottom: s.box * 0.1,
          width: s.box * 0.5,
          height: s.box * 0.36,
          backgroundColor: '#00843D',
          borderRadius: '2px 2px 0 0'
        }} />
        {/* باب — أحمر (العلم الموريتاني) */}
        <div style={{
          position: 'absolute',
          bottom: s.box * 0.1,
          width: s.box * 0.16,
          height: s.box * 0.2,
          backgroundColor: '#D21034',
          borderRadius: '2px 2px 0 0'
        }} />
      </div>
 
      {/* النص المتبادل */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: size === 'xl' ? '160px' : size === 'lg' ? '130px' : '110px'
      }}>
        {/* الاختصار */}
        <div style={{
          fontSize: s.abbr,
          fontWeight: '900',
          color: '#ffc107',
          letterSpacing: isArabic ? '4px' : '3px',
          lineHeight: 1,
          fontFamily: isArabic ? "'Tajawal', sans-serif" : 'Georgia, serif',
          direction: isArabic ? 'rtl' : 'ltr',
          transition: 'all 0.5s ease',
          opacity: 1
        }}>
          {isArabic ? 'خ.ت.ا.م' : 'S.A.R.M'}
        </div>
 
        {/* خط فاصل */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: dividerColor,
          margin: '2px 0'
        }} />
 
        {/* الوصف */}
        <div style={{
          fontSize: s.sub,
          color: subColor,
          lineHeight: 1.3,
          fontFamily: "'Tajawal', sans-serif",
          direction: isArabic ? 'rtl' : 'ltr',
          transition: 'all 0.5s ease'
        }}>
          {isArabic
            ? 'خدمة تأمين إصلاح المنازل'
            : "Service d'assurance de réparation de maison"}
        </div>
      </div>
    </div>
  );
}
 