import React, { useState, useEffect, useCallback } from 'react'; 
import OrdersStatusScreen from './OrdersStatusScreen';

export default function ProviderScreen({ user: initialUser, apiUrl, onLogout,  targetOrderId,token }) {
  // الحفاظ على حالة المستخدم محلياً لتحديثها عند تفعيل الاشتراك
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ phone: user?.phone, password: '' });
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState([]); 
  const [lang, setLang] = useState('ar');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [subFile, setSubFile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);
  const [subStep, setSubStep] = useState(1);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionPending, setSubscriptionPending] = useState(user?.subscription_pending || false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [freeOrdersLeft, setFreeOrdersLeft] = useState(5);
  // --- وظيفة جلب بيانات المستخدم المحدثة من السيرفر ---
 const fetchUserData = useCallback(async () => {
    // تنظيف صارم لـ ID من أي زوائد مثل :1
    const rawId = user?.id ? String(user.id) : null;
    if (!rawId) return;
    
    const cleanId = rawId.split(':')[0].replace(/[^0-9]/g, ''); // يأخذ الأرقام فقط

    try {
        // داخل دالة fetchUserData، استبدل الـ fetch بهذا:
const response = await fetch(`${apiUrl}/users/${cleanId}`, {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`, // نظام التوكن
        'Content-Type': 'application/json'
    }
});
        if (!response.ok) return; // إذا لم يجد المستخدم لا يكمل

        const freshData = await response.json();
        if (freshData) {
            setUser(freshData);
            setIsSubscribed(!!freshData.is_premium);
            if (freshData.subscription_end_date) {
                setExpiryDate(new Date(freshData.subscription_end_date));
            }
        }
    } catch (error) {
        console.error("خطأ في جلب بيانات المستخدم المحدثة:", error);
    }
}, [user?.id, apiUrl, token]);

  const t = {
    ar: {
      home1:'الطلبات المتاحة الان ' ,
      refuser:'رفض',
      reservedForYou: ' الطلب محجوز لك حالياً للتفاوض',
      accept: ' حجز للتفاوض', 
      confirmAgreement: ' تم الاتفاق وبدء العمل',
      cancelNegotiation: ' لم نتفق (إعادة الطلب)',
      end: ' إنهاء الطلب المكتمل',
      feat1: ' استقبال طلبات غير محدودة',
      feat2: ' ظهور في مقدمة قائمة الحرفيين',
      feat3: ' شارة "حرفي موثوق" على ملفك',
      feat4: ' دعم فني مخصص للشركاء',
      feat5: ' إحصائيات شهرية لأدائك',
      choosePay: 'اختر وسيلة الدفع المناسبة',
      uploadClick: 'اضغط لرفع صورة التحويل',
      editBtn: ' تعديل البيانات', 
      saveBtn: 'حفظ التغييرات', 
      cancelBtn: 'إلغاء',
      fullNameLabel: 'الاسم الكامل:', 
      phoneLabel: 'رقم هاتف الزبون:', 
      newPhoneLabel: 'رقم الهاتف الجديد',
      passLabel: 'كلمة المرور:', 
      newPassLabel: 'كلمة المرور الجديدة (اختياري)',
      passPlaceholder: 'اتركها فارغة إذا لا تريد التغيير',
      fullNameImmutable: 'الاسم الكامل (لا يمكن تغييره)',
      successUpdate: ' تم تحديث بياناتك بنجاح. سيتم تسجيل خروجك لتطبيق التغييرات.',
      home: 'الرئيسية', chat: 'طلباتي', sub: 'الاشتراك', profile: 'حسابي',
      subText: 'الاشتراك المميز: 300 MRU / شهرياً',
      sendSub: 'إرسال الإثبات للإدارة', uploadHint: '  إرفاق صورة إثبات الدفع',
      bankily: 'بنكيلي', sedad: 'سداد', masrivi: 'مصرفي',
      transferTo: 'التحويل للرقم:', noOrders: 'لا توجد طلبات جديدة حالياً',
      logout: 'تسجيل الخروج',
      statusAvailable: 'الحالة: متاح الآن', statusBusy: 'الحالة: مشغول حالياً',
      orderType: 'نوع الطلب:',
      descLabel: 'وصف المشكلة:',
      callCustomer: 'اتصال بالزبون',
      'سباكة': 'Plomberie', 'كهرباء': 'Électricité', 'تكييف': 'Climatisation',
      'صيانة': 'Maintenance', 'تنظيف': 'Nettoyage', 'بناء':'Construction'
    },
    fr: {
      home1:'Les commandes disponibles',
      refuser:'Refuser',
      reservedForYou: ' Cette commande vous est réservée pour négociation',
      accept: ' Reserver pour négocier',
       confirmAgreement: ' Accord conclu',
      cancelNegotiation: ' Aucun accord',
      end: ' Terminer la mission',
      editBtn: ' Modifier les données', 
      saveBtn: 'Enregistrer', 
      cancelBtn: 'Annuler',
      fullNameLabel: 'Nom Complet:', 
      phoneLabel: 'Tél du Client:',
      newPhoneLabel: 'Nouveau téléphone', 
      passLabel: 'Mot de passe:',
      newPassLabel: 'Nouveau mot de passe (optionnel)',
      passPlaceholder: 'Laisser vide pour ne pas changer',
      fullNameImmutable: 'Nom complet (non modifiable)',
      successUpdate: ' Profil mis à jour. Déconnexion en cours...',
      home: 'Accueil', chat: 'Mes commandes', sub: 'Abonnement', profile: 'Profil',
      subText: 'Premium: 300 MRU / mois',
      sendSub: 'Envoyer la preuve', uploadHint: ' Joindre la preuve du paiement',
      bankily: 'Bankily', sedad: 'Sedad', masrivi: 'Masrivi',
      transferTo: 'Transfert au numéro :', noOrders: 'Aucune commande pour le moment',
      logout: 'Déconnexion',
      statusAvailable: 'Statut: En ligne', statusBusy: 'Statut: Hors ligne',
      orderType: 'Type de commande:',
      descLabel: 'Description du problème:',
      callCustomer: 'Appeler le client',
      'سباكة': 'Plomberie', 'كهرباء': 'Électricité', 'تكييف': 'Climatisation',
      'صيانة': 'Maintenance', 'تنظيف': 'Nettoyage', 'بناء':'Construction'
    }
  }[lang];
const fetchOrders = useCallback(async () => {
    if (!isAvailable) {
        setOrders([]); 
        return;
    }

    if (!user?.id) return;

    try {
        const cleanId = String(user.id).split(':')[0].replace(/[^0-9]/g, '');
        
        // --- التعديل الجوهري هنا ---
        // نستخدم دائماً القيمة المخزنة في اليوزر (service_type) لأنها تكون موحدة (cleaning, plumbing, etc.)
        let myRawSpecialty = user?.service_type || user?.specialty;

        // داخل دالة fetchOrders ابحث عن سطر الـ url وحدثه:
let url = `${apiUrl}/orders?provider_id=${cleanId}&is_available=${isAvailable}`;
        
        if (myRawSpecialty) {
            // نرسل القيمة الخام للسيرفر لضمان المطابقة
            url += `&service_type=${encodeURIComponent(String(myRawSpecialty).toLowerCase().trim())}`;
        }
// ابحث عن سطر الـ fetch داخل fetchOrders وحدثه هكذا:
const response = await fetch(url, {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        'Content-Type': 'application/json'
    }
});

// إضافة فحص انتهاء الصلاحية:
if (response.status === 401) {
    onLogout(); // إذا انتهى التوكن، اخرج فوراً للأمان
    return;
}
        
        const data = await response.json();

        if (response.ok) {
            // التعديل الذكي لاستقبال بيانات السيرفر الجديدة
            if (data && data.orders) {
                setOrders(data.orders);
                setIsSubscribed(data.isSubscribed);
                setFreeOrdersLeft(data.freeOrdersLeft);
            } else {
                setOrders(Array.isArray(data) ? data : []);
            }
        }
        
    } catch (error) {
        console.error("DEBUG: فشل الاتصال بالسيرفر:", error);
    }
}, [apiUrl, user?.service_type, user?.specialty, user?.id, isAvailable, token]);

// --- أضف هذا الجزء هنا ---
useEffect(() => {
  let interval;
  // التحديث يعمل فقط إذا كان الحرفي "متاح" وفي "واجهة الرئيسية"
  if (isAvailable && activeTab === 'home') {
    fetchOrders(); // جلب فوري عند الدخول
    
    interval = setInterval(() => {
      console.log("🔄 جاري التحديث التلقائي للطلبات...");
      fetchOrders();
    }, 10000); // تحديث كل 10 ثوانٍ
  }

  return () => clearInterval(interval); // تنظيف المؤقت عند مغادرة الصفحة أو إغلاق التطبيق
}, [isAvailable, activeTab, fetchOrders]);
// -----------------------
// --- أضف هذا الجزء لفتح الطلب القادم من الإشعار ---
useEffect(() => {
  if (targetOrderId && orders.length > 0) {
    const orderToOpen = orders.find(o => String(o.id) === String(targetOrderId));
    if (orderToOpen) {
      setSelectedOrder(orderToOpen);
    }
  }
}, [targetOrderId, orders]);
// -----------------------------------------------
const updateOrderStatus = async (id, newStatus) => {
  // 1. التحقق من وجود المعرفات المطلوبة
  const currentUserId = user?.id || initialUser?.id;
  if (!currentUserId || !id) {
    console.error("❌ معرف المستخدم أو معرف الطلب مفقود");
    alert(lang === 'ar' ? "فشل تحديد الهوية، يرجى إعادة تسجيل الدخول" : "Erreur d'identité");
    return;
  }

  try {
    // 2. تنظيف الـ ID بشكل صارم
    const cleanId = String(currentUserId).split(':')[0].replace(/[^0-9]/g, '');
    const token = localStorage.getItem('userToken');

    console.log(`🔄 إرسال تحديث للطلب ${id} بالحالة الجديدة: ${newStatus}`);

    const response = await fetch(`${apiUrl}/orders/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        status: newStatus, 
        provider_id: cleanId 
      })
    });

    const result = await response.json();

    if (response.ok) {
      // 3. التحديث في حالة النجاح فقط
      console.log("✅ تم التحديث بنجاح في السيرفر");
      setSelectedOrder(null);
      fetchOrders(); // تحديث القائمة فوراً ليختفي الطلب أو تتغير حالته
      
      if (newStatus === 'negotiating') {
         alert(lang === 'ar' ? " تم حجز الطلب للتفاوض، يمكنك الآن الاتصال بالزبون" : " Commande réservée");
      }
    } else {
      // إظهار سبب الرفض القادم من السيرفر (مثلاً: استنفدت المحاولات المجانية)
      console.error("⚠️ فشل التحديث:", result.error);
      alert(lang === 'ar' ? `⚠️ ${result.error || 'فشل تنفيذ الإجراء'}` : `⚠️ ${result.error}`);
    }
  } catch (error) {
    console.error("❌ خطأ في الاتصال:", error);
    alert(lang === 'ar' ? "❌ خطأ في الاتصال بالسيرفر" : "❌ Erreur de connexion");
  }
};
const ignoreOrder = async (orderId) => {
  try {
    const cleanId = String(user.id).split(':')[0];
    const response = await fetch(`${apiUrl}/orders/${orderId}/ignore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
      body: JSON.stringify({ provider_id: cleanId })
    });
        if (response.ok) {
      setSelectedOrder(null);
      fetchOrders(); 
    }
  } catch (error) {
    console.error("Error ignoring order:", error);
  }
};

  const getDaysLeft = () => {
    if (!expiryDate) return 0;
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
// التعديل المطلوب في دالة toggleAvailability داخل ملف مقدم الخدمة
const toggleAvailability = async () => {
  const newStatus = !isAvailable;
  try {
   const response = await fetch(`${apiUrl}/users/${user.id}/availability`, {
    method: 'PUT',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}` // تأمين تغيير الحالة
    },
    body: JSON.stringify({ is_available: newStatus })
});
    if (response.ok) {
      setIsAvailable(newStatus);
      // --- إضافة هذا السطر لمسح القائمة فوراً ---
      if (!newStatus) { setOrders([]); } 
    } else {
      alert('فشل تحديث الحالة في السيرفر');
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

  const handleSubSubmit = async () => {
    // 1. التحقق من المدخلات الأساسية
    if (!subFile || !paymentMethod) {
        alert(lang === 'ar' ? 'يرجى اختيار وسيلة دفع وإرفاق صورة الإثبات' : 'Veuillez choisir un mode de paiement et joindre une preuve');
        return;
    }

    setLoading(true);

    try {
        // 2. تنظيف الـ ID لضمان مطابقته لنوع البيانات في قاعدة البيانات (Integer)
        const cleanUserId = String(user.id).split(':')[0].replace(/[^0-9]/g, '');

        // 3. بناء الـ FormData لرفع الصورة والبيانات
        const formData = new FormData();
        formData.append('user_id', cleanUserId);
        formData.append('user_role', 'provider'); // بما أننا في تطبيق مقدم الخدمة
        formData.append('transaction_id', `SUB-P-${Date.now()}`);
        formData.append('proof_image', subFile);
        // 4. تنفيذ طلب الـ POST
        const response = await fetch(`${apiUrl}/api/subscriptions/submit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                // ملاحظة: عند استخدام FormData، لا تضع 'Content-Type': 'application/json'
                // المتصفح/التطبيق سيقوم بوضع Content-Type المناسب مع الـ Boundary تلقائياً
            },
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            // 5. في حال النجاح: تصفير المدخلات وإعادة المستخدم للواجهة الرئيسية
            alert(lang === 'ar' ? ' تم إرسال إثبات الدفع بنجاح. يرجى انتظار تفعيل الإدارة.' : 'Preuve envoyée avec succès. Veuillez attendre la validation.');
            setSubscriptionPending(true); // <--- أضف هذا السطر هنا لتحديث الواجهة فوراً
            setSubFile(null);
            setSubStep(1); // العودة للخطوة الأولى في شاشة الاشتراك
            setActiveTab('home'); // العودة للرئيسية
        } else {
            alert(lang === 'ar' ? `❌ فشل الإرسال: ${result.error || 'خطأ غير معروف'}` : `❌ Échec: ${result.error || 'Erreur'}`);
        }
    } catch (error) {
        console.error("خطأ في رفع الاشتراك:", error);
        alert(lang === 'ar' ? '❌ خطأ في الاتصال بالسيرفر' : '❌ Erreur de connexion au serveur');
    } finally {
        setLoading(false);
    }
};
  

  const translateService = (serviceName) => {
    return t[serviceName] || serviceName;
  };
    useEffect(() => {
  if (user && isAvailable) { // أضفنا شرط التوفر هنا
    fetchOrders();
  } else if (!isAvailable) {
    setOrders([]); // تصفير القائمة إذا دخل وهو غير متاح
  }
  
  setIsSubscribed(!!user?.is_premium);
  if (user?.subscription_end_date) {
    setExpiryDate(new Date(user.subscription_end_date));
  }
}, [user, isAvailable, fetchOrders]); // أضفنا التوفر والـ

  return (
    <div style={{ ...styles.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* نافذة تفاصيل الطلب */}
      {selectedOrder && (
        <div style={styles.detailsOverlay}>
          <div style={styles.detailsCard}>
            <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}>✕</button>
            <div style={styles.modalHeaderSection}>
                <span style={styles.serviceBadge}>🏷️ {t.orderType} {translateService(selectedOrder.service_type)}</span>
                <h3 style={styles.modalTitle}>{selectedOrder.customer_name || 'زبون'}</h3>
            </div>
            <div style={styles.imageSection}>
              {(() => {
                const rawPath = selectedOrder.image_url || selectedOrder.image || selectedOrder.problem_image;
                const baseHost = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
                const fullImageUrl = rawPath ? (rawPath.startsWith('http') ? rawPath : `${baseHost}/${rawPath.replace(/^\//, '')}`) : null;
                return fullImageUrl ? (
                  <img src={fullImageUrl} alt="Order" style={styles.problemImg} onClick={() => window.open(fullImageUrl, '_blank')} />
                ) : (
                  <div style={styles.noImagePlaceholder}>📷 لا توجد صورة مرفقة</div>
                );
              })()}
            </div>
            <div style={styles.modalBodyContent}>
              <div style={styles.infoRowM}>
                <span style={styles.infoLabelM}>📞 {t.phoneLabel}</span>
                {(() => {
                  const phone = selectedOrder.customer_phone || selectedOrder.phone;
                  return phone ? <a href={`tel:${phone}`} style={styles.phoneLink}>{phone}</a> : <span style={{color: '#e74c3c', fontSize: '0.85rem'}}>جاري جلب الرقم...</span>;
                })()}
              </div>
              <div style={styles.descriptionBoxM}>
                <span style={styles.infoLabelM}>📝 {t.descLabel}</span>
                <p style={styles.modalDescText}>{selectedOrder.description || selectedOrder.issue_description || 'لا يوجد وصف'}</p>
              </div>
<div style={{ 
  marginTop: '15px', 
  background: '#e3f2fd', 
  padding: '12px', 
  borderRadius: '15px', 
  border: '1px solid #2196f3',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
}}>
  <span style={{ ...styles.infoLabelM, color: '#1976d2' }}>{lang === 'ar'? 'موقع الزبون:' : 'Lieu de client:'}</span>
  <p style={{ margin: 0, fontWeight: 'bold', color: '#0d47a1', fontSize: '1rem' }}>
    {selectedOrder.location || (lang === 'ar' ? 'لم يتم تحديد موقع' : 'Non spécifié')}
  </p>
</div>

</div>
 <div style={styles.actionRowM}>
  {(() => {
    const currentStatus = (selectedOrder.request_status || selectedOrder.status || 'pending').toLowerCase();
    
    // الحالة 1: طلب جديد
    if (currentStatus === 'pending' || currentStatus === 'active') {
      return (
        <>
          <button style={{ ...styles.confirmActionBtn, backgroundColor: '#e74c3c', flex: 1 }} onClick={() => ignoreOrder(selectedOrder.id)}>{t.refuser}</button>
          <button style={{ ...styles.confirmActionBtn, flex: 2 }} onClick={() => updateOrderStatus(selectedOrder.id, 'negotiating')}>{t.accept}</button>
        </>
      );
    } 
    // الحالة 2: قيد التفاوض (الميزة الجديدة)
    else if (currentStatus === 'negotiating') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <p style={{ textAlign: 'center', color: '#2980b9', fontSize: '0.85rem', fontWeight: 'bold' }}>{t.reservedForYou}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ ...styles.confirmActionBtn, backgroundColor: '#e67e22', flex: 1 }} onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}>{t.cancelNegotiation}</button>
            <button style={{ ...styles.confirmActionBtn, backgroundColor: '#27ae60', flex: 1 }} onClick={() => updateOrderStatus(selectedOrder.id, 'in_progress')}>{t.confirmAgreement}</button>
          </div>
        </div>
      );
    }
    // الحالة 3: تم الاتفاق وبدء العمل
    else if (currentStatus === 'in_progress') {
      return <button style={{ ...styles.confirmActionBtn, backgroundColor: '#2c3e50', width: '100%' }} onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}>{t.end}</button>;
    } 
    else {
      return <button disabled style={{ ...styles.confirmActionBtn, backgroundColor: '#95a5a6', width: '100%' }}> مكتمل</button>;
    }
  })()}
</div>
          </div>
        </div>
      )}

      <main style={styles.mainContent}>
        {activeTab === 'home' && (
          <div style={styles.viewContainer}>
            <div style={{
      padding: '15px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#1a237e', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
            🏠
          </div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1a237e', fontWeight: 'bold' }}>{t.home}</h2>
        </div>
        <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={{ ...styles.langBtn, margin: 0, padding: '5px 12px' }}>
          {lang === 'ar' ? 'FR' : 'AR'}
        </button>
      </div></div>
            <div style={styles.statusToolbar}>
              <span style={styles.statusLabel}>{isAvailable ? t.statusAvailable : t.statusBusy}</span>
              <div onClick={toggleAvailability} style={{ ...styles.toggleContainer, background: isAvailable ? 'linear-gradient(45deg, #27ae60, #2ecc71)' : 'linear-gradient(45deg, #e74c3c, #c0392b)' }}>
                <div style={{ ...styles.toggleCircle, transform: isAvailable ? (lang === 'ar' ? 'translateX(-44px)' : 'translateX(44px)') : 'translateX(0)' }} />
              </div>
            </div>
            <header style={styles.header}>
              <h2 style={styles.viewTitle}>{t.home1}</h2>
            </header>
           {/* 1. نتحقق أولاً: هل انتهت الفترة المجانية (0 محاولة متبقية) وهو غير مشترك فعلياً؟ */}
{(freeOrdersLeft === 0 && !isSubscribed) ? (
  <div style={{
    textAlign: 'center',
    padding: '30px 15px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    margin: '20px auto',
    width: '90%',
    border: '1px solid #ffcccb',
    backgroundColor: '#fffaf0'
  }}>
    <span style={{ fontSize: '3rem' }}>⚠️</span>
    <h3 style={{ color: '#d32f2f', margin: '10px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
      {lang === 'ar' ? 'انتهت الفترة المجانية المتاحة لك' : 'Période gratuite expirée'}
    </h3>
    <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
      {lang === 'ar' 
        ? 'لقد استهلكت محاولاتك المجانية (5 طلبات). يرجى الاشتراك في الباقة الشهرية لتتمكن من استقبال طلبات الزبائن الجديدة والاستمرار في العمل.' 
        : 'Vous avez épuisé vos essais gratuits (5 commandes). Veuillez vous abonner pour recevoir de nouvelles commandes.'}
    </p>
    <button 
      onClick={() => setActiveTab('sub')} 
      style={{
        ...styles.primaryBtn,
        backgroundColor: '#1a237e',
        borderRadius: '12px',
        fontSize: '1rem',
        cursor: 'pointer'
      }}
    >
      {lang === 'ar' ? '💳 اشترك الآن وتصفح الطلبات' : "💳 S'abonner maintenant" }
    </button>
  </div>
) : (!Array.isArray(orders) || orders.length === 0) ? (
  
  <p style={styles.emptyText}>{t.noOrders}</p>
) : (
  
  orders.map(order => (
                <div key={order.id} style={styles.orderCard} onClick={() => setSelectedOrder(order)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{fontSize: '1.1rem'}}>👤 {order.customer_name || 'زبون'}</strong>
                  <span style={{
                     ...styles.statusDot, 
                     backgroundColor: 
                order.status === 'negotiating' ? '#3498db' : // أزرق للتفاوض
               (order.request_status === 'in_progress' || order.status === 'in_progress') ? '#f39c12' : 
                (order.request_status === 'completed' || order.status === 'completed') ? '#95a5a6' : '#27ae60'
                  }} />
                  </div>
                  <div style={{marginTop: '5px', color: '#006400', fontSize: '0.85rem', fontWeight: 'bold'}}>🛠️ {order.service_type}</div>
                  <p style={styles.orderDesc}>{order.description?.substring(0, 45)}...</p>
                </div>
              ))
            )
             
        }     
         </div>
        )} 
         
{activeTab === 'chat' && (
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
      
{activeTab === 'sub' && (
  <div style={styles.viewContainer}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
    
    {/* الرأسية الجديدة للاشتراك */}
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
        width: '45px', height: '45px', borderRadius: '12px',
        backgroundColor: '#fbc02d', // لون ذهبي للاشتراك
        display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.4rem',
        boxShadow: '0 4px 12px rgba(251, 192, 45, 0.3)'
      }}>
        💳
      </div> </div> </div>
    <header style={styles.header}>
      <h2 style={styles.viewTitle}>{lang === 'ar' ? ' الاشتراك  الشهري ' : 'Abonnement Mensuel'}</h2>
    </header>

    <div style={styles.scrollableArea}>
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
        ? 'تم استلام إثبات دفعك بنجاح، وسيتم تفعيل اشتراكك من قبل الإدارة قريباً. شكراً لصبرك!' 
        : 'Votre preuve de paiement a bien été reçue. Votre abonnement sera activé prochainement par l\'administration.'}
    </p>
    <div style={{
      background: '#fff',
      border: '1px dashed #f0a500',
      borderRadius: '12px',
      padding: '10px 20px',
      fontSize: '0.85rem',
      color: '#b8860b'
    }}>
      {lang === 'ar' ? '🔔 ستصلك إشعار فور التفعيل' : '🔔 Vous serez notifié dès l\'activation'}
    </div>
    <button onClick={() => setActiveTab('home')} style={{ ...styles.primaryBtn, width: '100%', backgroundColor: '#f0a500' }}>
      {lang === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
    </button>
  </div>
) : isSubscribed && expiryDate &&getDaysLeft() > 0 ? (
        // واجهة المشترك الحالي (تم تحسين مظهرها)
        <div style={{...styles.subCard, borderColor: '#1a237e', borderTopWidth: '8px', borderTopStyle: 'solid', borderRadius: '25px'}}>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '4rem' }}>💎</span>
            <h3 style={{ color: '#1a237e', margin: '10px 0' }}>{lang === 'ar' ? 'اشتراكك مفعل بنجاح' : 'Abonnement Actif'}</h3>
          </div>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #3949ab)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', boxShadow: '0 4px 15px rgba(26,35,126,0.3)' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{getDaysLeft()}</span>
            <span style={{ fontSize: '0.8rem' }}>{lang === 'ar' ? 'يوم متبقي' : 'Jours'}</span>
          </div>
          <div style={{ background: '#f0f2f5', padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
              {lang === 'ar' ? 'تاريخ الانتهاء:' : 'Expire le :'} <strong>{expiryDate.toLocaleDateString()}</strong>
            </p>
          </div>
          <button onClick={() => setActiveTab('home')} style={{...styles.primaryBtn, backgroundColor: '#1a237e', marginTop: '20px', borderRadius: '12px'}}>{t.home}</button>
        </div>
      ) : (
        <div style={{...styles.subCard, borderRadius: '25px', padding: '25px'}}>
          {subStep === 1 ? (
            <>
              {/* قسم السعر والمميزات المحدثة */}
              <div style={{...styles.priceTag, fontSize: '1.8rem', background: '#e8eaf6', color: '#1a237e', padding: '15px', borderRadius: '15px'}}>
                300 MRU <span style={{fontSize: '1rem', color: '#666'}}>/ {lang === 'ar' ? 'شهرياً' : 'Mois'}</span>
              </div>
              
              <div style={{ textAlign: 'right', margin: '25px 0', padding: '0 10px' }}>
                <div style={styles.featureLine}><span>{lang === 'ar' ? 'استقبال طلبات غير محدودة' :'Commandes illimitées'}</span></div>
                <div style={styles.featureLine}><span>{lang === 'ar' ?  'أولوية الظهور في البحث' : 'Priorité d\'affichage'}</span></div>
                <div style={styles.featureLine}><span>{lang === 'ar' ?  'شارة توثيق الحساب (برو)' : 'Badge de vérification'}</span></div>
                <div style={styles.featureLine}><span>{lang === 'ar' ?  'دعم فني مباشر مع الإدارة' : 'Support technique VIP'}</span></div>
                <div style={styles.featureLine}><span>{lang === 'ar' ?  'تقارير أداء شهرية لعملك' : 'Rapports mensuels'}</span></div>
              </div>

              <button 
                style={{ ...styles.primaryBtn, backgroundColor: '#1a237e', borderRadius: '15px', height: '55px', fontSize: '1.1rem' }} 
                onClick={() => setSubStep(2)}>
                {lang === 'ar' ? 'اشترك الان' : 'Abonnez maintenant'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{textAlign: 'center', background: '#fff9c4', padding: '10px', borderRadius: '10px', border: '1px solid #fbc02d'}}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{t.transferTo}</p>
                <strong style={{fontSize: '1.4rem', color: '#d32f2f'}}>42072952</strong>
              </div>

              {/* أزرار الدفع بشكل شبكة أنيقة */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['bankily', 'sedad', 'masrivi'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setPaymentMethod(m)} 
                    style={{ 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '15px 5px', borderRadius: '12px', border: '2px solid', 
                      borderColor: paymentMethod === m ? '#1a237e' : '#eee',
                      backgroundColor: paymentMethod === m ? '#e8eaf6' : '#fff',
                      transition: '0.3s'
                    }}>
                    <span style={{fontSize: '1.2rem'}}>{m === 'bankily' ? '📱' : m === 'sedad' ? '📱' : '📱'}</span>
                    <span style={{fontSize: '0.75rem', fontWeight: 'bold'}}>{t[m]}</span>
                  </button>
                ))}
              </div>

              {/* منطقة رفع الصورة محسنة */}
              <input type="file" id="fileSub" hidden onChange={(e) => setSubFile(e.target.files[0])} />
              <label htmlFor="fileSub" style={{
                ...styles.uploadLabel,
                border: '2px dashed #1a237e',
                backgroundColor: subFile ? '#f0f4f8' : '#f8f9fa',
                padding: '25px',
                borderRadius: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}>
                <span style={{fontSize: '1.5rem'}}>{subFile ? '' : ''}</span>
                <span style={{marginTop: '5px', fontSize: '0.85rem', color: '#1a237e', fontWeight: 'bold'}}>
                  {subFile ? subFile.name : (lang === 'ar' ? 'إرفاق صورة التحويل' : t.uploadHint)}
                </span>
              </label>

              <button 
                onClick={handleSubSubmit} 
                style={{...styles.primaryBtn, backgroundColor: '#1a237e', borderRadius: '12px', height: '50px'}} 
                disabled={loading}>
                {loading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Envoi...') : t.sendSub}
              </button>

              <button onClick={() => setSubStep(1)} style={{...styles.backLink, color: '#666', fontSize: '0.9rem'}}>
                {lang === 'ar' ? 'رجوع' : 'Retour'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
   {activeTab === 'profile' && (
  <div style={styles.viewContainer}>
    <div style={styles.profileHeader}>
      <div style={styles.avatarLarge}>👤</div>
      <h2 style={styles.userName}>
        {isEditing ? (lang === 'ar' ? 'تعديل الحساب' : 'Modifier le compte') : (user?.full_name || t.profile)}
      </h2>
    </div>

    {!isEditing ? (
      <>
        <div style={styles.menuSection}>
          <div style={styles.displayItem}>
            <span style={styles.infoLabel}>{lang === 'ar' ? 'الاسم الكامل:' : 'Nom Complet:'}</span>
            <span style={styles.infoValue}>{user?.full_name}</span>
          </div>
          <div style={styles.displayItem}>
            <span style={styles.infoLabel}>{lang === 'ar' ? 'رقم الهاتف:' : 'Téléphone:'}</span>
            <span style={styles.infoValue}>{user?.phone}</span>
          </div>
          <div style={styles.displayItem}>
            <span style={styles.infoLabel}>{t.passLabel}</span>
            <span style={styles.infoValue}>********</span>
          </div>
        </div>
        <button style={styles.primaryEditBtn} onClick={() => {
          // تحديث editData بالبيانات الحالية قبل بدء التعديل
          setEditData({ phone: user?.phone, password: '' });
          setIsEditing(true);
        }}>{t.editBtn}</button>
        <button onClick={() => onLogout()} style={styles.logoutSimpleBtn}>{t.logout}</button>
      </>
    ) : (
      <div style={styles.editForm}>
        <div style={styles.inputGroup}>
          <label style={styles.fieldLabel}>{t.fullNameImmutable}</label>
          {/* الاسم يبقى للقراءة فقط كما هو في منطق تطبيقك */}
          <input style={{...styles.profileInput, backgroundColor: '#f0f0f0'}} value={user?.full_name} readOnly />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.fieldLabel}>{t.newPhoneLabel}</label>
          <input 
            style={styles.profileInput} 
            value={editData.phone} 
            onChange={(e) => setEditData({...editData, phone: e.target.value})} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.fieldLabel}>{t.newPassLabel}</label>
          <input 
            type="password" 
            style={styles.profileInput} 
            placeholder={t.passPlaceholder} 
            value={editData.password} // إضافة الـ value لضمان التحكم بالمدخل
            onChange={(e) => setEditData({...editData, password: e.target.value})} 
          />
        </div>

        <div style={styles.actionButtons}>
          <button 
            style={styles.saveBtn} 
            onClick={async () => {
              try {
                // تنظيف ID المستخدم لضمان توافقه مع السيرفر
                const cleanId = String(user.id).split(':')[0].replace(/[^0-9]/g, '');
                
                const res = await fetch(`${apiUrl}/update-profile`, { 
                  method: 'PUT', 
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}` 
                  }, 
                  body: JSON.stringify({ 
                    userId: cleanId, // إرسال المعرف النظيف
                    phone: editData.phone, 
                    password: editData.password 
                  }) 
                });

                if(res.ok) { 
                  alert(t.successUpdate); 
                  // نخرج المستخدم ليعيد تسجيل الدخول بالبيانات الجديدة (لضمان تحديث التوكن)
                  onLogout(); 
                } else {
                  const err = await res.json();
                  alert(lang === 'ar' ? `فشل التحديث: ${err.error}` : `Échec: ${err.error}`);
                }
              } catch (error) {
                alert(lang === 'ar' ? "خطأ في الاتصال" : "Erreur de connexion");
              }
            }}
          >
            {t.saveBtn}
          </button>
          
          <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>{t.cancelBtn}</button>
        </div>
      </div>
    )}
  </div>
)}
        
      </main>

      <nav style={styles.bottomNav}>
        {[{ id: 'home', icon: '🏠', label: t.home }, { id: 'chat', icon: '📋', label: t.chat }, { id: 'sub', icon: '💳', label: t.sub }, { id: 'profile', icon: '👤', label: t.profile }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={activeTab === tab.id ? styles.activeNav : styles.navBtn}>
            <span>{tab.icon}</span>
            <span style={styles.navLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  container: { height: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  mainContent: { flex: 1, paddingBottom: '85px', overflowY: 'auto' },
  viewContainer: { padding: '20px' },
  statusToolbar: { width: '95%', margin: '10px auto', backgroundColor: '#fff', padding: '12px 15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  statusLabel: { fontWeight: 'bold', color: '#333', fontSize: '0.9rem' },
  toggleContainer: { width: '82px', height: '36px', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 4px', cursor: 'pointer', position: 'relative', transition: '0.3s' },
  toggleCircle: { width: '30px', height: '30px', background: '#fff', borderRadius: '50%', transition: '0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  viewTitle: { fontSize: '1.4rem', color: '#333', fontWeight: 'bold' },
  langBtn: { padding: '6px 12px', borderRadius: '15px', border: '1px solid #006400', background: '#fff', color: '#006400', fontWeight: 'bold' },
  orderCard: { background: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', boxShadow: '0 3px 12px rgba(0,0,0,0.06)', cursor: 'pointer', border: '1px solid #f0f0f0' },
  statusDot: { width: '12px', height: '12px', borderRadius: '50%' },
  orderDesc: { color: '#666', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.4' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: '50px' },
  detailsOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' },
  detailsCard: { background: '#fff', width: '100%', maxWidth: '420px', borderRadius: '28px', padding: '25px', position: 'relative' },
  closeBtn: { position: 'absolute', top: '15px', left: '15px', border: 'none', background: '#f5f5f5', borderRadius: '50%', width: '35px', height: '35px' },
  modalHeaderSection: { textAlign: 'center', marginBottom: '15px' },
  serviceBadge: { background: '#e8f5e9', color: '#006400', padding: '6px 16px', borderRadius: '12px', fontSize: '0.85rem' },
  modalTitle: { fontSize: '1.4rem', margin: '0' },
  imageSection: { width: '100%', height: '200px', background: '#f9f9f9', borderRadius: '20px', overflow: 'hidden', margin: '15px 0' },
  problemImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noImagePlaceholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBodyContent: { textAlign: 'right' },
  infoRowM: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  infoLabelM: { fontWeight: 'bold', color: '#7f8c8d' },
  phoneLink: { color: '#006400', fontWeight: 'bold' },
  descriptionBoxM: { background: '#f8f9fa', padding: '15px', borderRadius: '15px' },
  modalDescText: { margin: '8px 0 0 0', color: '#444' },
  actionRowM: { display: 'flex', gap: '10px', marginTop: '25px' },
  chatActionBtn: { flex: 1, padding: '14px', borderRadius: '15px', border: '1px solid #ddd' },
  confirmActionBtn: { flex: 2, padding: '14px', borderRadius: '15px', border: 'none', background: '#006400', color: '#fff', fontWeight: 'bold' },
  bottomNav: { position: 'fixed', bottom: 0, width: '100%', height: '75px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 -2px 15px rgba(0,0,0,0.08)', zIndex: 1000 },
  navBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', border: 'none', background: 'none', color: '#bbb' },
  activeNav: { display: 'flex', flexDirection: 'column', alignItems: 'center', border: 'none', background: 'none', color: '#006400', fontWeight: 'bold' },
  navLabel: { fontSize: '0.75rem' },
  primaryBtn: { width: '100%', padding: '15px', borderRadius: '12px', background: '#006400', color: '#fff', border: 'none', fontWeight: 'bold' },
  subCard: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  priceTag: { background: '#e8f5e9', color: '#006400', padding: '10px', borderRadius: '10px', textAlign: 'center', fontWeight: 'bold' },
  paymentGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '15px 0' },
  payBtn: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px' },
  uploadLabel: { display: 'block', padding: '15px', border: '2px dashed #ccc', borderRadius: '12px', textAlign: 'center' },
  profileHeader: { textAlign: 'center', marginBottom: '20px' },
  avatarLarge: { fontSize: '50px', background: '#fff', width: '90px', height: '90px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  userName: { fontSize: '1.3rem', color: '#333', fontWeight: 'bold' },
  menuSection: { background: '#fff', borderRadius: '15px', padding: '5px', marginBottom: '20px' },
  displayItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #f9f9f9' },
  infoLabel: { color: '#7f8c8d' },
  infoValue: { fontWeight: '600' },
  primaryEditBtn: { width: '100%', background: '#006400', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', marginBottom: '10px' },
  logoutSimpleBtn: { width: '100%', background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '12px', borderRadius: '12px' },
  editForm: { background: '#fff', padding: '20px', borderRadius: '15px' },
  inputGroup: { marginBottom: '15px' },
  fieldLabel: { display: 'block', marginBottom: '5px' },
  profileInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
  actionButtons: { display: 'flex', gap: '10px' },
  saveBtn: { flex: 2, background: '#27ae60', color: '#fff', border: 'none', padding: '12px' },
  cancelBtn: { flex: 1, background: '#eee', color: '#333', border: 'none', padding: '12px' },
  backLink: { background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer' },
  scrollableArea: { maxHeight: '70vh', overflowY: 'auto' },
  //  هذ متعلق بجمال الاشتراك 
  
};