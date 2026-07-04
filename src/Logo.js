import React from 'react';

export default function Logo({ size = 'md', theme = 'light' }) {
  const sizes = {
    sm: { box: 32, abbr: '0.7rem', title: '0.75rem', sub: '0.5rem', gap: 8 },
    md: { box: 44, abbr: '0.9rem', title: '0.95rem', sub: '0.6rem', gap: 10 },
    lg: { box: 58, abbr: '1.1rem', title: '1.2rem', sub: '0.7rem', gap: 12 },
    xl: { box: 75, abbr: '1.3rem', title: '1.5rem', sub: '0.85rem', gap: 16 }
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
      {/* الأيقونة */}
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
        {/* سقف المنزل */}
        <div style={{
          width: 0, height: 0,
          borderLeft: `${s.box * 0.38}px solid transparent`,
          borderRight: `${s.box * 0.38}px solid transparent`,
          borderBottom: `${s.box * 0.32}px solid #333`,
          position: 'absolute',
          top: s.box * 0.1
        }} />
        {/* جسم المنزل */}
        <div style={{
          position: 'absolute',
          bottom: s.box * 0.1,
          width: s.box * 0.52,
          height: s.box * 0.38,
          backgroundColor: '#333',
          borderRadius: '2px 2px 0 0'
        }} />
        {/* باب المنزل */}
        <div style={{
          position: 'absolute',
          bottom: s.box * 0.1,
          width: s.box * 0.18,
          height: s.box * 0.22,
          backgroundColor: '#ffc107',
          borderRadius: '2px 2px 0 0'
        }} />
      </div>

      {/* النص */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* الاختصار */}
        <div style={{
          fontSize: s.abbr,
          fontWeight: '900',
          color: '#ffc107',
          letterSpacing: '3px',
          lineHeight: 1,
          fontFamily: 'Georgia, serif'
        }}>
          S.M.A.M
        </div>

        {/* خط فاصل */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: dividerColor,
          margin: '3px 0'
        }} />

        {/* الاسم الكامل */}
        <div style={{
          fontSize: s.title,
          fontWeight: '700',
          color: textColor,
          lineHeight: 1.2,
          fontFamily: "'Tajawal', sans-serif"
        }}>
          Sté Mauritanienne
        </div>
        <div style={{
          fontSize: s.sub,
          color: subColor,
          lineHeight: 1,
          fontFamily: "'Tajawal', sans-serif",
          letterSpacing: '0.02em'
        }}>
          d'Assurance de Maintenance
        </div>
      </div>
    </div>
  );
}