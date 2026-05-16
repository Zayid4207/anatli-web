import React from 'react';

const SplashScreen = () => {
  return (
    <div style={styles.container}>
      {/* 1. الكارت المحيط بالشعار لإعطاء عمق ووضوح */}
      <div style={styles.card}>
        <img 
          src={require('../assets/logo.png.png')} 
          alt="ANATLI Logo" 
          style={styles.logo} 
        />
      </div>

      {/* 2. النصوص الترحيبية باللغتين العربية والإنجليزية بتصميم متناسق */}
      <div style={styles.textWrapper}>
        <h1 style={styles.arabicWelcome}>مرحباً بك في أنعتلي</h1>
        <h2 style={styles.englishWelcome}>Bienvenue sur ANATLI</h2>
        
        <div style={styles.divider}></div>
        
        <p style={styles.marketingText}>
          خدماتك المنزلية بلمسة زر
          <br />
          <span style={styles.englishSub}>Services à domicile faciles</span>
        </p>
      </div>

      {/* 3. مؤشر التحميل */}
      <div style={styles.loader}></div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f4f7f6', 
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '15px', 
    borderRadius: '35px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.12)', 
    marginBottom: '25px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid rgba(0,100,0,0.05)',
  },
  logo: {
    width: '280px', // تكبير الصورة لتكون مقروءة وواضحة
    height: 'auto',
    display: 'block',
  },
  textWrapper: {
    textAlign: 'center',
    paddingHorizontal: '20px',
  },
  arabicWelcome: {
    color: '#006400',
    fontSize: '2.2rem', // حجم متناسق غير ضخم
    fontWeight: '800',
    margin: 0,
  },
  englishWelcome: {
    color: '#006400',
    fontSize: '1.4rem',
    fontWeight: '600',
    margin: '5px 0 0 0',
    opacity: 0.8,
  },
  divider: {
    height: '2px',
    width: '60px',
    backgroundColor: '#006400',
    margin: '15px auto',
    borderRadius: '2px',
    opacity: 0.3,
  },
  marketingText: {
    color: '#444',
    fontSize: '1.2rem',
    fontWeight: '500',
    lineHeight: '1.6',
  },
  englishSub: {
    fontSize: '1rem',
    color: '#777',
    fontStyle: 'italic',
  },
  loader: {
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #006400',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    animation: 'spin 1s linear infinite',
    marginTop: '40px'
  }
};

// كود حركة الدوران
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
  document.head.appendChild(styleSheet);
}

export default SplashScreen;