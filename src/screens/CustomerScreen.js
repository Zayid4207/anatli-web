import React, { useState } from 'react';
import OrdersStatusScreen from './OrdersStatusScreen'; // تأكد أن المسار صحيح
export default function CustomerScreen({ user, apiUrl, onLogout, token }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    password: '' 
  });
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState('ar');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [subStep, setSubStep] = useState(1);
 // --- الجزئية المحدثة ---
const [freeRequestsUsed, setFreeRequestsUsed] = useState(user?.free_requests_used || 0);
const [isSubscribed, setIsSubscribed] = useState(user?.is_subscribed || false);
const [subscriptionPending, setSubscriptionPending] = useState(user?.subscription_pending || false);
const [expiryDate, setExpiryDate] = useState(user?.subscription_end_date ? new Date(user.subscription_end_date) : null);
// -----------------------
  const [orderData, setOrderData] = useState({
    type: '',
    desc: '',
    image: null,
    location: '',
    payMethod: 'bankily',
    payProof: null
  });

  // تحديث حالة الاشتراك من بيانات المستخدم القادمة من السيرفر
 
  const translations = {
    ar: {
      subStatus: 'أنت مشترك في الباقة الذهبية',
      subStatusDesc: 'هذا الطلب مجاني وسيتم تفعيله فوراً.',
      autoSend: 'إرسال وتفعيل تلقائي',
      editTitle: 'تعديل الحساب',
      fullNameLabel: 'الاسم الكامل:',
      fullNameImmutable: 'الاسم الكامل (لا يمكن تغييره)',
      phoneLabel: 'رقم الهاتف:',
      newPhoneLabel: 'رقم الهاتف الجديد',
      passLabel: 'كلمة المرور:',
      newPassLabel: 'كلمة المرور الجديدة (اختياري)',
      passPlaceholder: 'اتركها فارغة إذا لا تريد التغيير',
      saveBtn: 'حفظ التغييرات',
      cancelBtn: 'إلغاء',
      editBtn: ' تعديل البيانات',
      successUpdate: ' تم تحديث بياناتك بنجاح. سيتم تسجيل خروجك لتطبيق التغييرات.',
      errorUpdate: ' فشل التحديث: ',
      serverError: 'تعذر الاتصال بالسيرفر',
      phoneRequired: 'رقم الهاتف مطلوب',
      logout: 'تسجيل الخروج',
      version: 'الإصدار 1.0.0',
      daysRemaining: 'متبقي على نهاية اشتراكك:',
      day: 'يوم',
      expired: 'انتهى اشتراكك، يرجى التجديد',
      subscribe: 'الاشتراك',
      subTitle: 'باقة التوفير الذهبية 🌟',
      subPrice: '150 MRU / شهرياً',
      subFeatures: [
        ' عدم دفع رسوم الطلب نهائياً',
        ' الطلب في أي وقت ومن أي مكان',
        ' وصول طلبك مباشرة لمقدمي الخدمة'
      ],
      subNow: 'اشترك الآن',
      subPaymentTitle: 'تفعيل الاشتراك المميز',
      subNote: 'رسوم الاشتراك: 150 MRU - يرجى التحويل للرقم: 42072952',
      selectPayTitle: 'اختر وسيلة الدفع المناسبة:',
      payError: 'يرجى اختيار وسيلة الدفع وإرفاق صورة الإثبات!',
      serviceLabel: 'الخدمة',
      descPlaceholder: 'اشرح المشكلة هنا بالتفصيل...',
      requiredError: 'يرجى كتابة وصف وإرفاق صورة للمتابعة!',
      home: 'الرئيسية', messages: 'طلباتي', profile: 'حسابي', phone: 'رقم الهاتف',
      search: 'ابحث عن خدمة...', newOrder: 'طلب خدمة جديد',
      next: 'التالي', back: 'رجوع', send: 'إرسال الطلب النهائي',
      step1: 'اختر نوع الخدمة', step2: 'وصف المشكلة وصورة', step3: 'الدفع وتأكيد الطلب',
      payNote: 'رسوم الطلب هي 40 MRU - يرجى التحويل للرقم: 42072952',
      uploadImg: 'إرفاق صورة المشكلة', uploadProof: 'إرفاق إثبات الدفع (لقطة شاشة)',
      success: 'تم إرسال طلبك بنجاح! سيتم مراجعته وتفعيله فوراً.',
      services: {
        plumbing: 'سباكة', electricity: 'كهرباء', cleaning: 'تنظيف',
        maintenance: 'صيانة', cooling: 'تكييف', building: 'بناء'
      },
      payMethods: { bankily: 'بنكيلي', sadad: 'السداد', masrivi: 'مصرفي' }
    },
    fr: {
      subStatus: 'Vous êtes abonné au Pack Gold',
      subStatusDesc: 'Cette demande est gratuite et sera activée immédiatement.',
      autoSend: 'Envoyer et Activer Automatiquement',
      editTitle: 'Modifier le compte',
      fullNameLabel: 'Nom Complet:',
      fullNameImmutable: 'Nom Complet (non modifiable)',
      phoneLabel: 'Téléphone:',
      newPhoneLabel: 'Nouveau numéro de téléphone',
      passLabel: 'Mot de passe:',
      newPassLabel: 'Nouveau mot de passe (optionnel)',
      passPlaceholder: 'Laisser vide pour ne pas changer',
      saveBtn: 'Enregistrer',
      cancelBtn: 'Annuler',
      editBtn: 'Modifier les données',
      successUpdate: ' Profil mis à jour. Vous allez être déconnecté pour appliquer les changements.',
      errorUpdate: ' Échec de la mise à jour: ',
      serverError: 'Impossible de contacter le serveur',
      phoneRequired: 'Le numéro de téléphone est requis',
      logout: 'Déconnexion',
      version: 'Version 1.0.0',
      daysRemaining: 'Il reste pour votre abonnement :',
      day: 'Jour',
      expired: 'Abonnement expiré, veuillez renouveler',
      subscribe: 'S\'abonner',
      subTitle: 'Forfait Économique Or 🌟',
      subPrice: '150 MRU / Mois',
      subFeatures: [
        ' Zéro frais de commande',
        ' Commander partout et à tout moment',
        ' Accès direct aux prestataires'
      ],
      subNow: 'S\'abonner maintenant',
      subPaymentTitle: 'Activer l\'abonnement Premium',
      subNote: 'Frais: 150 MRU - Transfert vers: 42072952',
      selectPayTitle: 'Choisir la méthode de paiement :',
      payError: 'Veuillez choisir une méthode et joindre la preuve !',
      serviceLabel: 'Service',
      descPlaceholder: 'Décrivez le problème ici en detail...',
      requiredError: 'Veuillez écrire une description et joindre une image !',
      home: 'Accueil', messages: 'Mes commandes', profile: 'Profil', phone: 'Téléphone',
      search: 'Chercher une service .....', newOrder: 'Nouvelle commande',
      next: 'Suivant', back: 'Retour', send: 'Envoyer la commande',
      step1: 'Type de service', step2: 'Description & Image', step3: 'Paiement & Confirmation',
      payNote: 'Frais: 40 MRU - Transférer au: 42072952',
      uploadImg: 'Image du problème', uploadProof: 'Preuve de paiement',
      success: 'Commande envoyée avec succès!',
      services: {
        plumbing: 'Plomberie', electricity: 'Électricité', cleaning: 'Nettoyage',
        maintenance: 'Maintenance', cooling: 'Climatisation', building: 'Construction'
      },
      payMethods: { bankily: 'Bankily', sadad: 'Sadad', masrivi: 'Masrivi' }
    }
  };

  const t = translations[lang];

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'fr' : 'ar');
  };

  const getDaysLeft = () => {
    if (!expiryDate) return 0;
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
// --- الجزئية المحدثة ---
// --- الجزئية المصححة بالكامل لتحديث البيانات كل 10 ثوان ---

// 1. دالة التحديث (يجب أن تكون خارج useEffect ليتم استدعاؤها في أي مكان)
const refreshUserData = async () => {
  if (!user?.id) return; // تأكد من وجود مستخدم
  try {
   const res = await fetch(`${apiUrl}/users/${user.id}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('userToken')}` // إرسال التوكن للسيرفر
  }
});
    if (res.ok) {
      const updatedUser = await res.json();
      // تحديث الواجهة فوراً بالبيانات الجديدة
      setSubscriptionPending(!!updatedUser.subscription_pending);
      setIsSubscribed(!!updatedUser.is_subscribed);
      setFreeRequestsUsed(updatedUser.free_requests_used || 0);
      if (updatedUser.subscription_end_date) {
        setExpiryDate(new Date(updatedUser.subscription_end_date));
      }
      console.log("🔄 التحديث الدوري ناجح: ", updatedUser.free_requests_used);
    }
  } catch (err) {
    console.log("خطأ في تحديث البيانات:", err);
  }
};

// 2. تفعيل المؤقت الدوري (هذا هو المحرك)
React.useEffect(() => {
  // تحديث أولي عند فتح الشاشة
  refreshUserData();

  // ضبط المؤقت للعمل كل 10 ثوان
  const interval = setInterval(() => {
    refreshUserData();
  }, 10000);

  // تنظيف المؤقت عند إغلاق التطبيق أو الشاشة
  return () => clearInterval(interval);
}, [user?.id]); // سيعيد التشغيل إذا تغير المستخدم

// --------------------------------------------------------


// -----------------------

  const handleFinalSubmit = async () => {
    // 1. التحقق من الأهلية (مشترك أو لديه طلبات مجانية)
    const hasFreeTrial = freeRequestsUsed < 3;
    const skipPayment = isSubscribed || hasFreeTrial;

   // 2. منع الإرسال إذا لم يرفق إثبات الدفع
if (!skipPayment && !orderData.payProof) {
  alert(t.requiredError);
  return;
}

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('customer_id', user.id);
      formData.append('service_type', orderData.type);
      formData.append('description', orderData.desc);
      formData.append('image', orderData.image);
      formData.append('location', orderData.location); // 👈 أضف هذا السط
      // 3. تحديد منطق الدفع والحالة
      if (isSubscribed) {
        formData.append('payment_method', 'subscription');
        formData.append('amount', 0);
        formData.append('status', 'active');
      } else if (hasFreeTrial) {
        formData.append('payment_method', 'free_trial');
        formData.append('amount', 0);
        formData.append('status', 'active');
      } else {
        formData.append('payment_method', orderData.payMethod);
        formData.append('amount', 40);
        formData.append('status', 'pending');
        if (orderData.payProof) {
          formData.append('payment_proof', orderData.payProof);
        }
      }

      // 4. إرسال الطلب للسيرفر
     const res = await fetch(`${apiUrl}/api/admin/pending-orders-new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}` // إرسال التوكن هنا أيضاً
        },
        body: formData,
      });
      if (res.ok) {
        // تحديث البيانات في الخلفية فوراً قبل إغلاق النافذة
        await refreshUserData();
        // 5. إظهار رسالة النجاح المناسبة
        if (isSubscribed) {
          alert("تم تفعيل طلبكم وإرساله للمزودين (اشتراك ذهبي)!");
        } else if (hasFreeTrial) {
          // استخدام الرقم المحدث من السيرفر أو الحساب المحلي المباشر
          const remaining = 2 - freeRequestsUsed;
          alert(`🎁 تم إرسال طلبك مجاناً! متبقي لديك ${remaining > 0 ? remaining : 0} طلبات مجانية.`);
        } else {
          alert(t.success);
        }

        // 6. إعادة ضبط الواجهة والرجوع للرئيسية
        setActiveTab('home');
        setStep(1);
        setOrderData({ type: '', desc: '', image: null, payMethod: 'bankily', payProof: null });
      } else {
        const errorData = await res.json();
        alert("فشل إرسال الطلب: " + (errorData.error || "خطأ غير معروف"));
      }
    } catch (err) {
      alert("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

const handleSubscriptionSubmit = async () => {
    // 1. التحقق من وجود وسيلة الدفع وصورة الإثبات
    if (orderData.payMethod && orderData.payProof) {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('user_id', user.id);
            formData.append('user_role', 'customer');
            formData.append('transaction_id', "TRX-" + Date.now());
            formData.append('proof_image', orderData.payProof);

            // 2. إرسال طلب الاشتراك للسيرفر
            const res = await fetch(`${apiUrl}/api/subscriptions/submit`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: formData,
            });

            if (res.ok) {
                // 3. تحديث البيانات فوراً من السيرفر
                // نقوم بهذه الخطوة للتأكد من أن أي تغيير في حالة المستخدم يظهر فوراً
                setSubscriptionPending(true);
                const userRes = await fetch(`${apiUrl}/api/users/${user.id}`,{headers: {
                  'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }});
                if (userRes.ok) {
                    const updatedUser = await userRes.json();
                    
                    // تحديث الحالات المحلية الموحدة
                    setIsSubscribed(!!updatedUser.is_subscribed);
                    setFreeRequestsUsed(updatedUser.free_requests_used || 0);
                    if (updatedUser.subscription_end_date) {
                        setExpiryDate(new Date(updatedUser.subscription_end_date));
                    }
                }

                alert(lang === 'ar' 
                    ? 'تم إرسال إثبات الدفع بنجاح! سيتم تفعيل طلبكم الان .' 
                    : ' Preuve de paiement envoyée ! Votre commande sera activé bientot .');

                // 4. العودة للرئيسية وتصفير البيانات الحساسة
                setActiveTab('home');
                setOrderData(prev => ({ 
                    ...prev, 
                    payProof: null,
                    payMethod: 'bankily' // إعادة التعيين للقيمة الافتراضية
                }));
            } else {
                const data = await res.json();
                alert(data.error || (lang === 'ar' ? "حدث خطأ في السيرفر" : "Erreur serveur"));
            }
        } catch (err) {
            console.error("Subscription Submit Error:", err);
            alert(lang === 'ar' ? "خطأ في الاتصال بالسيرفر" : "Erreur de connexion");
        } finally {
            setLoading(false);
        }
    } else {
        alert(lang === 'ar' 
            ? "يرجى اختيار وسيلة الدفع ورفع صورة الإثبات" 
            : "Veuillez choisirl'outil de paiment et télécharger la preuve.");
    }
};
  return (
    <div style={{ ...styles.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 <main style={styles.viewContainer}>

        {/* 1. الصفحة الرئيسية */}
       {activeTab === 'home' && (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
    {/* الرأسية الجديدة للرئيسية */}
    <div style={{
      padding: '15px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#006400', fontWeight: '900', letterSpacing: '1px' }}>ANATLI</h2>
        <button onClick={toggleLanguage} style={{ ...styles.langBtn, margin: 0, padding: '5px 12px' }}>
          {lang === 'ar' ? 'FR' : 'AR'}
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder={t.search}
          style={{ ...styles.searchInput, flex: 1, margin: 0 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button style={{ ...styles.newOrderBtn, margin: 0, width: 'auto', padding: '0 15px' }} onClick={() => { setStep(1); setActiveTab('new_order'); }}>
          ➕
        </button>
      </div>
    </div>
 
            <div style={styles.scrollableArea}>
              <div style={styles.servicesGrid}>
                {[
                  { id: 'plumbing', icon: '🚰' },
                  { id: 'electricity', icon: '⚡' },
                  { id: 'cleaning', icon: '🧹' },
                  { id: 'maintenance', icon: '🛠️' },
                  { id: 'cooling', icon: '❄️' },
                  { id: 'building', icon: '🏗️' }
                ].filter(s =>
                  t.services[s.id].toLowerCase().includes(searchQuery.toLowerCase())
                ).map((s) => (
                  <div key={s.id} style={styles.serviceItem} onClick={() => { setOrderData({ ...orderData, type: s.id }); setStep(2); setActiveTab('new_order'); }}>
                    <span style={styles.serviceIcon}>{s.icon}</span>
                    <span style={styles.serviceName}>{t.services[s.id]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. واجهة طلب خدمة جديد */}
        {activeTab === 'new_order' && (
          <div style={styles.scrollableArea}>
            <h3 style={styles.newOrderViewTitle}>{t[`step${step}`]}</h3>

            {step === 1 && (
              <div style={styles.newOrderCardGrid}>
                {Object.keys(t.services).map(key => {
                  const icons = { plumbing: '🚰', electricity: '⚡', maintenance: '🔧', building: '🏗️', cleaning: '🧹', cooling: '❄️' };
                  return (
                    <div key={key} style={styles.newOrderServiceCard} onClick={() => { setOrderData({ ...orderData, type: key }); setStep(2); }}>
                      <span style={styles.newOrderCardIcon}>{icons[key] || '🛠️'}</span>
                      <p style={styles.newOrderCardName}>{t.services[key]}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 2 && (
  <div style={styles.stepContent}>
    {/* شارة نوع الخدمة المختارة */}
    <div style={styles.infoBadge}>{t.serviceLabel}: <b>{t.services[orderData.type] || orderData.type}</b></div>
    
    {/* 1. حقل وصف المشكلة */}
    <textarea
      placeholder={t.descPlaceholder}
      style={styles.enhancedTextarea}
      value={orderData.desc}
      onChange={(e) => setOrderData(prev => ({ ...prev, desc: e.target.value }))}
    />

    {/* 2. الحقل الجديد: العنوان والمكان (تمت إضافته بأسلوب يتناسب مع التصميم) */}
    <textarea
      placeholder={lang === 'ar' ? "اكتب موقعك الدقيق هنا (الحي، المنزل، الطابق...)" : "Adresse précise (Quartier, Maison, Étage...)"}
      style={{
        ...styles.enhancedTextarea, 
        height: '80px', 
        marginTop: '10px', 
        borderColor: orderData.location ? '#28a745' : '#006400',
        borderWidth: '2px'
      }}
      value={orderData.location}
      onChange={(e) => setOrderData(prev => ({ ...prev, location: e.target.value }))}
    />

    {/* 3. إرفاق صورة المشكلة */}
    <label style={{ ...styles.fileLabel, borderColor: orderData.image ? '#28a745' : '#006400', backgroundColor: orderData.image ? '#f0fff0' : '#fff', marginTop: '10px' }}>
      <span>{orderData.image ? '' :  ''}</span>
      {orderData.image ? (orderData.image.name.substring(0, 20) + "...") : t.uploadImg}
      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) setOrderData(prev => ({ ...prev, image: file })); }} />
    </label>

    {/* 4. زر الانتقال للمرحلة التالية مع تحديث شرط التحقق ليشمل الموقع */}
    <button style={styles.primaryBtn} onClick={() => setStep(3)}>
      {t.next}
    </button>
  </div>
)}
{step === 3 && (
  <div style={styles.stepContent}>
    {/* التحقق: نعتمد هنا على الحالة المحلية freeRequestsUsed التي يتم تحديثها فورياً */}
    {(isSubscribed || freeRequestsUsed < 3) ? (
      <div style={{ ...styles.feeBanner, backgroundColor: '#f0fff0', borderColor: '#006400' }}>
        <span style={{ fontSize: '1.5rem' }}>{isSubscribed ? '🌟' : '🎁'}</span>
        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#006400' }}>
            {isSubscribed ? t.subStatus : (lang === 'ar' ? "هدايا البداية من أنعتلي" : "Cadeau de bienvenue")}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#006400' }}>
            {isSubscribed
              ? t.subStatusDesc
              : (lang === 'ar'
                ? `لديك ${3 - freeRequestsUsed} طلبات مجانية متبقية.` 
                : `Il vous reste ${3 - freeRequestsUsed} demandes gratuites.`)}
          </p>
        </div>
      </div>
    ) : (
      /* تظهر هذه الواجهة فقط للزبون غير المشترك الذي استهلك محاولاته الـ 3 */
      <>
        <div style={styles.feeBanner}>
          <span style={{ fontSize: '1.5rem' }}></span>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>{t.payNote.split('-')[0]}</p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>{t.payNote.split('-')[1]}</p>
          </div>
        </div>

        <p style={styles.sectionLabel}>{t.selectPayTitle}</p>

        <div style={styles.payButtonsGrid}>
          {Object.keys(t.payMethods).map((method) => (
            <button
              key={method}
              onClick={() => setOrderData({ ...orderData, payMethod: method })}
              style={{
                ...styles.payOptionBtn,
                borderColor: orderData.payMethod === method ? '#006400' : '#ddd',
                backgroundColor: orderData.payMethod === method ? '#f0fff0' : '#fff'
              }}
            >
              {method === 'bankily' && '📱'} {method === 'sadad' && '📱'} {method === 'masrivi' && '📱'}
              <span>{t.payMethods[method]}</span>
            </button>
          ))}
        </div>

        <label style={{
          ...styles.fileLabel,
          borderColor: orderData.payProof ? '#28a745' : '#006400',
          backgroundColor: orderData.payProof ? '#f0fff0' : '#fff'
        }}>
          <span>{orderData.payProof ? '' : ''}</span>
          {orderData.payProof ? orderData.payProof.name.substring(0, 20) : t.uploadProof}
          <input
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => setOrderData({ ...orderData, payProof: e.target.files[0] })}
          />
        </label>
      </>
    )}

    {/* زر الإرسال النهائي: نستخدم أيضاً الحالة المحلية هنا لتحديد النص الظاهر */}
    <button
      style={styles.primaryBtn}
      disabled={loading}
      onClick={handleFinalSubmit}
    >
      {loading ? '...' : (isSubscribed || freeRequestsUsed < 3) ? `🚀 ${t.autoSend}` : `🚀 ${t.send}`}
    </button>
  </div>
)}
                

            {/* زر الرجوع يظهر أسفل جميع المراحل */}
            <button
              onClick={() => step === 1 ? setActiveTab('home') : setStep(step - 1)}
              style={styles.backLink}
            >
              {t.back}
            </button>
          </div>
        )}

        {/* 3. واجهة الاشتراك */}
        {activeTab === 'sub' && (

          <div style={styles.scrollableArea}>
            <h3 style={styles.newOrderViewTitle}>{t.subscribe}</h3>
            {subscriptionPending && !isSubscribed ? (
  // واجهة "قيد المعالجة"
  <div style={{
    padding: '30px 20px',
    border: '2px solid #f0a500',
    backgroundColor: '#fffbf0',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    textAlign: 'center'
  }}>
    <span style={{ fontSize: '3rem' }}>⏳</span>
    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#b8860b' }}>
      {lang === 'ar' ? 'طلبك قيد المعالجة' : 'Demande en cours de traitement'}
    </p>
    <p style={{ margin: 0, fontSize: '0.9rem', color: '#888', lineHeight: '1.6' }}>
      {lang === 'ar' 
        ? 'تم استلام إثبات دفعك بنجاح، وسيتم تفعيل اشتراكك من قبل الإدارة  الان .  شكراً لصبرك!' 
        : 'Votre preuve de paiement a bien été reçue. Votre abonnement sera activé bientot par l\'administration.'}
    </p>
    <div style={{
      background: '#fff',
      border: '1px dashed #f0a500',
      borderRadius: '12px',
      padding: '10px 20px',
      fontSize: '0.85rem',
      color: '#b8860b'
    }}>
      {lang === 'ar' ? '🔔 سيصلك إشعار فور التفعيل' : '🔔 Vous serez notifié dès l\'activation'}
    </div>
    <button onClick={() => setActiveTab('home')} style={{ ...styles.primaryBtn, width: '100%', backgroundColor: '#f0a500' }}>
      {lang === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
    </button>
  </div>
) : isSubscribed && getDaysLeft() > 0 ? (
              <div style={{
                ...styles.countdownContainer,
                flexDirection: 'column',
                padding: '30px 20px',
                gap: '15px',
                border: '2px solid #006400',
                backgroundColor: '#f0fff0',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2.5rem' }}>🌟</span>
                  <p style={{ margin: '10px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#006400' }}>{t.subPaymentTitle}</p>
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>{t.daysRemaining}</p>
                </div>

                <div style={{ ...styles.daysCircle, width: '90px', height: '90px', boxShadow: '0 4px 12px rgba(0,100,0,0.15)', borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#006400' }}>{getDaysLeft()}</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>{t.day}</span>
                </div>

                <div style={{ textAlign: 'center', background: '#fff', padding: '10px', borderRadius: '12px', width: '100%', border: '1px dashed #006400' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#444' }}>
                    {lang === 'ar' ? 'اشتراكك ينتهي بتاريخ:' : 'Expire le :'} <br />
                    <b>{expiryDate?.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}</b>
                  </p>
                </div>
                <button onClick={() => setActiveTab('home')} style={{ ...styles.primaryBtn, width: '100%', marginTop: '10px' }}>{t.home}</button>
              </div>
            ) : (
              <>
                {isSubscribed && getDaysLeft() <= 0 && (
                  <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #ef9a9a' }}>
                    ⚠️ {t.expired}
                  </div>
                )}

                {subStep === 1 && (
                  <div style={{ ...styles.subCard, background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #eee' }}>
                    <h2 style={{ color: '#006400', margin: '0 0 5px 0', textAlign: 'center' }}>{t.subTitle}</h2>
                    <div style={{ ...styles.priceTag, textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>{t.subPrice}</div>
                    <div style={styles.featuresList}>
                      {t.subFeatures.map((f, i) => <p key={i} style={{ ...styles.featureItem, margin: '8px 0' }}>✔️ {f}</p>)}
                    </div>
                    <button style={{ ...styles.primaryBtn, width: '100%' }} onClick={() => setSubStep(2)}>✨ {t.subNow}</button>
                    <button onClick={() => setActiveTab('home')} style={styles.backLink}>{t.back}</button>
                  </div>
                )}

                {subStep === 2 && (
                  <div style={styles.stepContent}>
                    <div style={{ ...styles.feeBanner, backgroundColor: '#e8f5e9', borderColor: '#2e7d32' }}>
                      <span style={{ fontSize: '1.8rem' }}>💰</span>
                      <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#1b5e20' }}>{t.subPaymentTitle}</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#1b5e20' }}>{t.subNote}</p>
                      </div>
                    </div>

                    <div style={styles.payButtonsGrid}>
                      {Object.keys(t.payMethods).map((m) => (
                        <button key={m} onClick={() => setOrderData({ ...orderData, payMethod: m })}
                          style={{ ...styles.payOptionBtn, borderColor: orderData.payMethod === m ? '#006400' : '#ddd', backgroundColor: orderData.payMethod === m ? '#f0fff0' : '#fff' }}>
                          <span>{m === 'bankily' ? '📱' : m === 'sadad' ? '📱' : '📱'}</span>
                          <span style={{ fontSize: '0.8rem' }}>{t.payMethods[m]}</span>
                        </button>
                      ))}
                    </div>

                    <label style={{ ...styles.fileLabel, borderColor: orderData.payProof ? '#28a745' : '#006400', backgroundColor: orderData.payProof ? '#f0fff0' : '#fff' }}>
                      <span>{orderData.payProof ? '' : ''}</span>
                      {orderData.payProof ? orderData.payProof.name.substring(0, 20) : t.uploadProof}
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => setOrderData({ ...orderData, payProof: e.target.files[0] })} />
                    </label>

                    <button style={styles.primaryBtn} disabled={loading} onClick={handleSubscriptionSubmit}>
                      {loading ? '...' : `🚀 ${t.send}`}
                    </button>
                    <button onClick={() => setSubStep(1)} style={styles.backLink}>{t.back}</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 4. شاشة الملف الشخصي */}
        {activeTab === 'profile' && (
          <div style={styles.profileContainer}>
            <div style={styles.profileHeader}>
              <div style={styles.avatarLarge}>👤</div>
              <h2 style={styles.userName}>{isEditing ? t.editTitle : (user?.full_name || t.profileTitle)}</h2>
            </div>

            {!isEditing ? (
              /* --- وضع العرض (View Mode) --- */
              <>
                <div style={styles.menuSection}>
                  <div style={styles.displayItem}>
                    <span style={styles.infoLabel}>{t.fullNameLabel}</span>
                    <span style={styles.infoValue}>{user?.full_name || '...'}</span>
                  </div>
                  <div style={styles.displayItem}>
                    <span style={styles.infoLabel}>{t.phoneLabel}</span>
                    <span style={styles.infoValue}>{user?.phone}</span>
                  </div>
                  <div style={styles.displayItem}>
                    <span style={styles.infoLabel}>{t.passLabel}</span>
                    <span style={styles.infoValue}>********</span>
                  </div>
                </div>

                <button style={styles.primaryEditBtn} onClick={() => {
                  setEditData({ full_name: user?.full_name, phone: user?.phone, password: '' });
                  setIsEditing(true);
                }}>
                  {t.editBtn}
                </button>

                <button onClick={() => onLogout()} style={styles.logoutSimpleBtn}>
              {t.logout}
                </button>
              </>
            ) : (
              /* --- وضع التعديل (Edit Mode) --- */
              <div style={styles.editForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>{t.fullNameImmutable}</label>
                  <input
                    style={{ ...styles.profileInput, backgroundColor: '#f0f0f0', color: '#888' }}
                    value={user?.full_name}
                    readOnly
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>{t.newPhoneLabel}</label>
                  <input
                    style={styles.profileInput}
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>{t.newPassLabel}</label>
                  <input
                    type="password"
                    style={styles.profileInput}
                    placeholder={t.passPlaceholder}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  />
                </div>

                <div style={styles.actionButtons}>
                  <button style={styles.saveBtn} onClick={async () => {
                    if (!editData.phone) { alert(t.phoneRequired); return; }
                    try {
                      const response = await fetch(`${apiUrl}/update-profile`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' ,
                         'Authorization': `Bearer ${localStorage.getItem('userToken')}`},
                        body: JSON.stringify({
                          userId: user.id,
                          phone: editData.phone,
                          password: editData.password
                        }),
                      });

                      const data = await response.json();
                      if (response.ok) {
                        alert(t.successUpdate); // الرسالة مترجمة الآن
                        onLogout();
                      } else {
                        alert(t.errorUpdate + (data.error || "Error"));
                      }
                    } catch (err) {
                      alert(t.serverError);
                    }
                  }}>{t.saveBtn}</button>

                  <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>{t.cancelBtn}</button>
                </div>
              </div>
            )}

            <div style={styles.appVersion}>{t.version}</div>
          </div>
        )}


        {/* 5. شاشة حالة الطلبات (بدلاً من المراسلات) */}
        {activeTab === 'messages' && (
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
            
            {/* ترويسة "طلباتي" المحدثة */}
            <div style={{
              padding: '20px 15px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '12px',
                backgroundColor: '#1a237e',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)'
              }}>
                📋
              </div>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.4rem', 
                  color: '#1a237e', 
                  fontWeight: 'bold',
                  fontFamily: 'Tajawal, sans-serif' // إذا كنت تستخدم خط تجوال، وإلا سيعمل الخط الافتراضي
                }}>
                  {lang === 'ar' ? 'طلباتي' : 'Mes Commandes'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                  {lang === 'ar' ? 'إدارة ومتابعة أعمالك الحالية' : 'Gérez vos missions en cours'}
                </p>
              </div>
            </div>
        
            {/* شاشة الحالات */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <OrdersStatusScreen user={user} apiUrl={apiUrl} lang={lang} />
            </div>
            
          </div>
        )}
      </main>

      {/* الشريط السفلي */}
      <div style={styles.bottomNav}>
        <button style={activeTab === 'profile' ? styles.activeNav : styles.navBtn} onClick={() => setActiveTab('profile')}>
          <span style={styles.navIcon}>👤</span>
          <span style={{fontSize: '0.75rem'}}>{t.profile}</span>
        </button>

        <button style={activeTab === 'messages' ? styles.activeNav : styles.navBtn} onClick={() => setActiveTab('messages')}>
          <span style={styles.navIcon}>📋</span>
          <span style={{fontSize: '0.75rem'}}>{t.messages}</span>
        </button>

        <button style={activeTab === 'sub' ? styles.activeNav : styles.navBtn} onClick={() => setActiveTab('sub')}>
          <span style={styles.navIcon}>💳</span>
          <span style={{fontSize: '0.75rem'}}>{t.subscribe}</span>
        </button>

        <button style={activeTab === 'home' ? styles.activeNav : styles.navBtn} onClick={() => setActiveTab('home')}>
          <span style={styles.navIcon}>🏠</span>
          <span style={{fontSize: '0.75rem'}}>{t.home}</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    flexDirection: 'column', 
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
    overflow: 'hidden', 
    position: 'fixed', 
    top: 0, 
    left: 0 
  },
  viewContainer: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '10px 15px', 
    maxWidth: '500px', 
    margin: '0 auto', 
    width: '100%', 
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '10px 5px',
    minHeight: '60px'
  },
  viewTitle: { fontSize: '1.6rem', color: '#006400', fontWeight: 'bold' },
  langBtn: { padding: '6px 12px', borderRadius: '10px', border: '1px solid #006400', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.85rem' },
  searchBox: { display: 'flex', gap: '8px', marginBottom: '15px' },
  searchInput: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.9rem' },
  newOrderBtn: { padding: '8px 12px', backgroundColor: '#006400', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  scrollableArea: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '90px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  servicesGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '12px',
    padding: '5px'
  },
  serviceItem: { 
    padding: '20px 10px', 
    background: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: '20px', 
    textAlign: 'center', 
    boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  serviceIcon: { fontSize: '2.2rem', display: 'block', marginBottom: '8px' },
  serviceName: { fontSize: '0.9rem', fontWeight: 'bold', color: '#333' },
  newOrderCardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '5px' },
  newOrderServiceCard: { background: '#fff', borderRadius: '18px', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #eee' },
  newOrderCardIcon: { fontSize: '2.2rem', marginBottom: '8px' },
  newOrderCardName: { fontSize: '0.9rem', fontWeight: 'bold', color: '#006400' },
  newOrderViewTitle: { fontSize: '1.3rem', textAlign: 'center', marginBottom: '15px', color: '#333', fontWeight: 'bold' },
  stepContent: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoBadge: { background: '#e6f4ea', color: '#006400', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '0.9rem' },
  enhancedTextarea: { width: '100%', height: '120px', padding: '12px', borderRadius: '15px', border: '2px solid #e0e0e0', resize: 'none', boxSizing: 'border-box' },
  fileLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: '#fff', border: '2px dashed #006400', borderRadius: '12px', color: '#006400', fontWeight: 'bold', fontSize: '0.9rem' },
  primaryBtn: { padding: '14px', backgroundColor: '#006400', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem' },
  feeBanner: { background: '#fff3cd', border: '1px solid #ffeeba', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' },
  sectionLabel: { fontSize: '0.95rem', fontWeight: 'bold', color: '#333', textAlign: 'center' },
  payButtonsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  payOptionBtn: { padding: '12px 5px', borderRadius: '12px', border: '2px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem' },
  backLink: { background: 'none', border: 'none', color: '#666', textDecoration: 'underline', width: '100%', padding: '8px', fontSize: '0.9rem' },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 -4px 15px rgba(0,0,0,0.08)',
    zIndex: 1000,
    padding: '0 5px',
    borderTop: '1px solid #eee'
  },
  navBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    opacity: 0.5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    cursor: 'pointer',
    padding: '5px 0',
    minWidth: 0
  },
  activeNav: {
    flex: 1,
    background: 'none',
    border: 'none',
    opacity: 1,
    color: '#006400',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    cursor: 'pointer',
    padding: '5px 0',
    minWidth: 0
  },
  navIcon: { fontSize: '1.4rem', marginBottom: '2px' }, 
  // هذ منعلق بحساب الزبون 
profileContainer: { 
    padding: '15px', 
    direction: 'rtl' 
  },
  
  // الجزء العلوي (الصورة والاسم)
  profileHeader: { 
    textAlign: 'center', 
    marginBottom: '20px' 
  },
  avatarLarge: { 
    width: '70px', 
    height: '70px', 
    borderRadius: '50%', 
    backgroundColor: '#eee', 
    margin: '0 auto 10px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontSize: '2.2rem' 
  },
  userName: { 
    fontSize: '1.2rem', 
    color: '#333', 
    fontWeight: 'bold' 
  },

  // عرض البيانات (Display Mode)
  menuSection: { 
    backgroundColor: '#fff', 
    borderRadius: '15px', 
    padding: '8px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
    marginBottom: '15px' 
  },
  displayItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px 10px', 
    borderBottom: '1px solid #f5f5f5' 
  },
  infoLabel: { 
    color: '#888', 
    fontSize: '0.85rem' 
  },
  infoValue: { 
    color: '#333', 
    fontWeight: 'bold', 
    fontSize: '0.9rem' 
  },

  // أزرار التحكم الأساسية
  primaryEditBtn: { 
    width: '100%', 
    padding: '14px', 
    borderRadius: '12px', 
    backgroundColor: '#006400', 
    color: '#fff', 
    border: 'none', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginBottom: '10px' 
  },
  logoutSimpleBtn: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '12px', 
    backgroundColor: 'transparent', 
    color: '#ff4d4d', 
    border: '1px solid #ff4d4d', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
  },

  // نموذج التعديل (Edit Mode)
  editForm: { 
    width: '100%', 
    backgroundColor: '#fff', 
    padding: '15px', 
    borderRadius: '15px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
    boxSizing: 'border-box' 
  },
  inputGroup: { 
    marginBottom: '12px', 
    textAlign: 'right' 
  },
  fieldLabel: { 
    display: 'block', 
    marginBottom: '5px', 
    fontSize: '0.8rem', 
    color: '#666', 
    marginRight: '5px' 
  },
  profileInput: { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '10px', 
    border: '1px solid #ddd', 
    outline: 'none', 
    fontSize: '0.95rem', 
    boxSizing: 'border-box' 
  },

  // أزرار حفظ وإلغاء التعديل
  actionButtons: { 
    display: 'flex', 
    gap: '8px', 
    marginTop: '15px' 
  },
  saveBtn: { 
    flex: 2, 
    padding: '12px', 
    borderRadius: '10px', 
    backgroundColor: '#27ae60', 
    color: '#fff', 
    border: 'none', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  cancelBtn: { 
    flex: 1, 
    padding: '12px', 
    borderRadius: '10px', 
    backgroundColor: '#eee', 
    color: '#333', 
    border: 'none', 
    cursor: 'pointer' 
  },
  
  // إضافات أسفل الصفحة
  appVersion: { 
    textAlign: 'center', 
    marginTop: '15px', 
    color: '#ccc', 
    fontSize: '0.7rem' 
  }

  // هنا ينتهي 
};