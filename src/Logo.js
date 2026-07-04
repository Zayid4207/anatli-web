import React from 'react';

export default function Logo({ size = 'md', theme = 'light' }) {
  const sizes = {
    sm: { icon: 28, title: '0.85rem', sub: '0.5rem', gap: 8 },
    md: { icon: 42, title: '1.1rem', sub: '0.6rem', gap: 10 },
    lg: { icon: 60, title: '1.5rem', sub: '0.75rem', gap: 14 },
    xl: { icon: 90, title: '2rem', sub: '0.9rem', gap: 18 }
  };

  const s = sizes[size] || sizes.md;
  const isLight = theme === 'light';
  const textColor = isLight ? '#fff' : '#006400';
  const subColor = isLight ? 'rgba(255,255,255,0.75)' : 'rgba(0,100,0,0.65)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: s.gap,
      direction: 'rtl'
    }}>
      {/* الأيقونة */}
      <div style={{
        width: s.icon,
        height: s.icon,
        backgroundColor: '#ffc107',
        borderRadius: s.icon * 0.22,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 3px 10px rgba(255,193,7,0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* خط أفقي */}
        <div style={{
          position: 'absolute',
          width: '65%',
          height: s.icon * 0.07,
          backgroundColor: '#333',
          borderRadius: 99,
          top: '30%'
        }} />
        {/* خط عمودي */}
        <div style={{
          position: 'absolute',
          width: s.icon * 0.07,
          height: '65%',
          backgroundColor: '#333',
          borderRadius: 99,
          top: '17%'
        }} />
        {/* منزل صغير */}
        <div style={{
          position: 'absolute',
          bottom: '12%',
          width: '45%',
          height: '35%',
          backgroundColor: '#333',
          borderRadius: '3px 3px 0 0'
        }} />
        {/* سقف المنزل */}
        <div style={{
          position: 'absolute',
          bottom: '42%',
          width: 0,
          height: 0,
          borderLeft: `${s.icon * 0.28}px solid transparent`,
          borderRight: `${s.icon * 0.28}px solid transparent`,
          borderBottom: `${s.icon * 0.18}px solid #333`
        }} />
      </div>

      {/* النص */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{
          fontSize: s.title,
          fontWeight: '900',
          color: textColor,
          lineHeight: 1.1,
          letterSpacing: '0.02em',
          fontFamily: "'Tajawal', sans-serif"
        }}>
          الشركة الموريتانية
        </div>
        <div style={{
          fontSize: s.sub,
          color: subColor,
          lineHeight: 1.2,
          fontFamily: "'Tajawal', sans-serif",
          letterSpacing: '0.03em'
        }}>
          لتأمين إصلاح المنازل
        </div>
      </div>
    </div>
  );
}