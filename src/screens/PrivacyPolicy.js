import React, { useState } from 'react';

const PrivacyPolicy = ({ onBack }) => {
    const [lang, setLang] = useState('ar');

    const content = {
        ar: {
            title: "سياسة الخصوصية لـ ANATLI",
            back: "العودة",
            sections: [
                { t: "1. البيانات التي نجمعها", c: "نجمع رقم الهاتف ،وصف الطلبات، الصور المرفقة، والموقع الجغرافي لتوفير الخدمة." },
                { t: "2. كيف نستخدم بياناتك", c: "نشارك تفاصيل طلبك مع المزودين المسجلين فقط لتقديم عروضهم لك." },
                { t: "3. حماية البيانات", c: "نستخدم تقنيات تشفير آمنة لحماية بياناتك، ونقوم بمسح الجلسات فور  تسجيل الخروج." },
                { t: "4. الدفع", c: "صور إيصالات التحويل (مثل بنكيلي) تُستخدم فقط للتحقق من جدية الطلبات ودفع الرسوم." }
            ]
        },
        fr: {
            title: "Politique de Confidentialité - ANATLI",
            back: "Retour",
            sections: [
                { t: "1. Données collectées", c: "Nous collectons le numéro de téléphone, les descriptions, les photos, et la localisation." },
                { t: "2. Utilisation", c: "Vos détails sont partagés uniquement avec les prestataires pour  faciliter la réalisation de  service." },
                { t: "3. Sécurité", c: "Vos données sont cryptées et les sessions sont supprimées après chaque  déconnexion." },
                { t: "4. Paiement", c: "Les preuves de transfert (ex: Bankily) servent uniquement à valider vos commandes." }
            ]
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={styles.langBtn}>
                    {lang === 'ar' ? 'Français' : 'العربية'}
                </button>
                <button onClick={onBack} style={styles.backBtn}>{content[lang].back}</button>
            </div>
            
            <div style={styles.card}>
                <h1 style={styles.title}>{content[lang].title}</h1>
                <div style={{ textAlign: lang === 'ar' ? 'right' : 'left', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                    {content[lang].sections.map((sec, i) => (
                        <div key={i} style={styles.section}>
                            <h3 style={styles.secTitle}>{sec.t}</h3>
                            <p style={styles.secContent}>{sec.c}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
const styles = {
    // الحاوية الرئيسية مع تدرج لوني ناعم يجمع بين الأبيض وألوان الهوية الفاتحة
    container: { 
        padding: '40px 20px', 
        background: 'linear-gradient(135deg, #f0f9f4 0%, #ffffff 50%, #e8f5ed 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
    },
    // الهيدر العلوي متباعد بشكل متناسق مع عرض الكرت
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        width: '100%',
        maxWidth: '850px'
    },
    // كرت المحتوى بتصميم زجاجي ناعم وظلال عميقة
    card: { 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)', // تأثير غبش خلف الكرت لزيادة الفخامة
        padding: '50px 40px', 
        borderRadius: '30px', 
        boxShadow: '0 20px 50px rgba(0, 100, 0, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        width: '100%',
        maxWidth: '850px',
        boxSizing: 'border-box'
    },
    // العنوان الرئيسي بلمسة ذهبية/خضراء وخط سفلي أنيق
    title: { 
        color: '#006400', 
        textAlign: 'center', 
        marginBottom: '45px', 
        fontSize: '2.2rem',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        borderBottom: '2px solid #eef2f1',
        paddingBottom: '20px'
    },
    // الأقسام متباعدة مع فواصل ناعمة جداً
    section: { 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #f8faf9'
    },
    // عناوين الفقرات بلون الهوية وخط عريض
    secTitle: { 
        color: '#006400', 
        fontSize: '1.25rem', 
        marginBottom: '12px',
        fontWeight: '700',
        display: 'block'
    },
    // نصوص السياسة بتباعد أسطر مريح جداً للعين
    secContent: { 
        color: '#4a4a4a', 
        lineHeight: '1.9', 
        fontSize: '1.05rem',
        margin: '0',
        textAlign: 'justify' // محاذاة النص ليعطي شكلاً رسمياً
    },
    // زر تبديل اللغة بتصميم حدود ناعمة
    langBtn: { 
        padding: '10px 20px', 
        borderRadius: '12px', 
        border: '1px solid #006400', 
        background: '#fff', 
        color: '#006400',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
    },
    // زر العودة بلون أخضر غامق وظل مرتفع
    backBtn: { 
        padding: '10px 25px', 
        borderRadius: '12px', 
        border: 'none', 
        background: '#006400', 
        color: '#fff', 
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        boxShadow: '0 6px 15px rgba(0,100,0,0.18)'
    }
};
export default PrivacyPolicy;