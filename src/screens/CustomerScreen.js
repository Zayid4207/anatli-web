import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../translations';
 
export default function CustomerScreen({ user, apiUrl, onLogout }) {
  const [lang, setLang] = useState('ar');
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(user);
 
  // بيانات الطلب الجديد
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [subStep, setSubStep] = useState(1);
  const [image, setImage] = useState(null);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState(1);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
 
  // بيانات الاشتراك
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [subProof, setSubProof] = useState(null);
 
  const token = localStorage.getItem('userToken');
 
  useEffect(() => {
    fetchUserData();
    fetchRequests();
    fetchPackages();
    const interval = setInterval(() => {
      fetchRequests();
      fetchUserData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);
 
  const fetchUserData = async () => {
    try {
      const res = await fetch(`${apiUrl}/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUserData(await res.json());
    } catch (err) {}
  };
 
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${apiUrl}/customer/requests/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRequests(await res.json());
    } catch (err) {}
  };
 
  const fetchPackages = async () => {
    try {
      const res = await fetch(`${apiUrl}/packages`);
      if (res.ok) setPackages(await res.json());
    } catch (err) {}
  };
 
  // --- تسجيل الصوت ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/mp4'
        });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(100);
      setIsRecording(true);

    } catch (err) {
      alert(lang === 'ar'
        ? 'يرجى السماح بالوصول للميكروفون'
        : 'Veuillez autoriser le microphone');
    }
};
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const getLocation = () => {
  setLocationLoading(true);
  setLocationError('');
  navigator.geolocation.getCurrentPosition(
    pos => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      setLocationLoading(false);
    },
    err => {
      setLocationError(lang === 'ar'
        ? 'فشل تحديد موقعك، يرجى السماح بالوصول للموقع'
        : 'Impossible de localiser, veuillez autoriser la géolocalisation');
      setLocationLoading(false);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
};
 
  // --- إرسال الطلب ---
  const handleSendRequest = async () => {
    if (!image && !voiceBlob) {
      alert(lang === 'ar' ? 'يرجى إرفاق صورة أو وصف صوتي' : 'Veuillez joindre une photo ou un message vocal');
      return;
    }
     if (!location) {
    alert(lang === 'ar' ? 'يرجى تحديد موقعك أولاً' : 'Veuillez d\'abord localiser votre position');
    return;
  }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      formData.append('customer_id', user.id);
      if (description) formData.append('description', description);
      if (image) formData.append('image', image);
      if (voiceBlob) formData.append('voice_note', voiceBlob, 'voice.webm');
 
      const res = await fetch(`${apiUrl}/requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(t.requestSent + '\n' + t.requestSentDesc);
        setImage(null);
        setVoiceBlob(null);
        setVoiceUrl(null);
        setDescription('');
        setStep(1);
        setActiveTab('requests');
        fetchRequests();
      } else if (data.error === 'subscription_required') {
        alert(lang === 'ar' ? 'يجب الاشتراك أولاً لإرسال الطلبات' : 'Vous devez vous abonner d\'abord');
        setActiveTab('subscription');
      } else {
        alert(data.error || t.error);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setLoading(false);
    }
  };
 
 const handleSubscriptionRequest = async () => {
    if (!selectedPackage) {
        alert(lang === 'ar' ? 'يرجى اختيار الباقة' : 'Veuillez choisir un forfait');
        return;
    }
    if (!subProof) {
        alert(lang === 'ar' ? 'يرجى إرفاق صورة إثبات الدفع' : 'Veuillez joindre la preuve de paiement');
        return;
    }
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('package_id', selectedPackage);
        formData.append('proof_image', subProof);

        const res = await fetch(`${apiUrl}/subscription/request`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (res.ok) {
            alert(lang === 'ar' ? 'تم إرسال طلب الاشتراك، سيتم تفعيله قريباً' : 'Demande envoyée, activation prochaine');
            fetchUserData();
            setSubStep(1);
            setActiveTab('home');
            setSubProof(null);
            setSelectedPackage(null);
        } else {
            const data = await res.json();
            alert(data.error || t.error);
        }
    } catch (err) {
        alert(t.serverError);
    } finally {
        setLoading(false);
    }
};
 
  // --- الإبلاغ عن مشكلة ---
  const handleReport = async (orderId) => {
    const reason = prompt(lang === 'ar' ? 'اشرح المشكلة:' : 'Décrivez le problème:');
    if (!reason) return;
    try {
      await fetch(`${apiUrl}/reports`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, reason })
      });
      alert(t.reportSent);
    } catch (err) {}
  };
 
  const getDaysLeft = () => {
    if (!userData?.subscription_end_date) return 0;
    const diff = new Date(userData.subscription_end_date) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
 
  const isSubscribed = userData?.package_id && getDaysLeft() > 0;
 
  const getStatusStyle = (status) => {
    const map = {
      pending_admin: { bg: '#fff3cd', color: '#856404' },
      quoted: { bg: '#d1ecf1', color: '#0c5460' },
      assigned: { bg: '#d4edda', color: '#155724' },
      completed: { bg: '#e2e3e5', color: '#383d41' }
    };
    return map[status] || { bg: '#f8f9fa', color: '#333' };
  };
 
  return (
    <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 
      {/* المحتوى الرئيسي */}
      <main style={s.main}>
 
        {/* ===== الرئيسية ===== */}
        {activeTab === 'home' && (
          <div style={s.screen}>
            {/* الرأسية */}
            <div style={s.homeHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem', opacity: 0.85 }}>{t.welcomeBack}</p>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}>{userData?.full_name}</h2>
                </div>
                <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                  {lang === 'ar' ? 'FR' : 'AR'}
                </button>
              </div>
 
              {/* رمز العميل */}
              <div style={s.clientCodeBox}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.clientCode}</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '2px' }}>
                  {userData?.client_code || '---'}
                </span>
              </div>
            </div>
 
            {/* حالة الاشتراك */}
            {isSubscribed ? (
              <div style={s.subActiveCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#155724' }}>{t.currentPackage}</p>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#155724' }}>
                      {userData?.package_name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#006400' }}>{getDaysLeft()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>
                      {lang === 'ar' ? 'يوم متبقي' : 'jours restants'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={s.subWarningCard} onClick={() => setActiveTab('subscription')}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
                    {userData?.subscription_pending
                      ? t.subscriptionPending
                      : t.subscriptionExpired}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#856404' }}>
                    {userData?.subscription_pending
                      ? t.subscriptionPendingDesc
                      : (lang === 'ar' ? 'اضغط هنا للاشتراك' : 'Appuyez pour s\'abonner')}
                  </p>
                </div>
              </div>
            )}
 
            {/* زر الطلب */}
            <button
              style={{ ...s.requestBtn, opacity: isSubscribed ? 1 : 0.6 }}
              onClick={() => {
                if (!isSubscribed) {
                  alert(lang === 'ar' ? 'يجب الاشتراك أولاً' : 'Abonnement requis');
                  setActiveTab('subscription');
                  return;
                }
                setActiveTab('newRequest');
                setStep(1);
              }}
            >
              <span style={{ fontSize: '2rem' }}>🔧</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{t.requestNow}</span>
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {lang === 'ar' ? 'اطلب فنياً الآن' : 'Demander un technicien'}
              </span>
            </button>
 
            {/* آخر الطلبات */}
            {requests.length > 0 && (
              <div>
                <h3 style={s.sectionTitle}>
                  {lang === 'ar' ? 'آخر طلباتك' : 'Vos dernières demandes'}
                </h3>
                {requests.slice(0, 3).map(r => {
                  const st = getStatusStyle(r.status);
                  return (
                    <div key={r.id} style={s.requestCard} onClick={() => { setSelectedRequest(r); setActiveTab('requestDetail'); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>
                          {lang === 'ar' ? 'طلب رقم' : 'Demande #'} {r.id}
                        </span>
                        <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>
                          {t[`status_${r.status}`] || r.status}
                        </span>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#666' }}>
                        {new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
 
        {/* ===== طلب جديد ===== */}
        {activeTab === 'newRequest' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <button style={s.backBtn} onClick={() => setActiveTab('home')}>
                {lang === 'ar' ? '← رجوع' : '← Retour'}
              </button>
              <h2 style={s.screenTitle}>{t.newRequest}</h2>
            </div>
 
            <div style={s.form}>
              {/* صورة المشكلة */}
              <label style={s.uploadLabel}>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => setImage(e.target.files[0])} />
                <span style={{ fontSize: '2rem' }}>{image ? '✅' : '📷'}</span>
                <span style={{ fontWeight: 'bold', color: '#006400' }}>
                  {image ? image.name.substring(0, 25) + '...' : t.uploadImage}
                </span>
              </label>
 
              {/* الوصف الصوتي */}
              <div style={s.voiceBox}>
                {!voiceUrl ? (
                  <button
                    style={{ ...s.voiceBtn, backgroundColor: isRecording ? '#dc3545' : '#006400' }}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{isRecording ? '⏹' : '🎙'}</span>
                    <span>{isRecording ? t.stopRecording : t.recordVoice}</span>
                  </button>
                ) : (
                  <div style={s.voicePlayBox}>
                    <span style={{ color: '#006400', fontWeight: 'bold' }}>{t.voiceRecorded}</span>
                    <audio controls src={voiceUrl} style={{ width: '100%', marginTop: '8px' }} />
                    <button style={s.reRecordBtn} onClick={() => { setVoiceBlob(null); setVoiceUrl(null); }}>
                      {t.reRecord}
                    </button>
                  </div>
                )}
              </div>
 
              {/* وصف نصي اختياري */}
              <textarea
                style={s.textarea}
                placeholder={t.descPlaceholder}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              {/* تحديد الموقع */}
        <div style={{
               border: `2px solid ${location ? '#28a745' : '#dc3545'}`,
                   borderRadius: '14px',
                      padding: '15px',
               backgroundColor: location ? '#f0fff0' : '#fff5f5',
              textAlign: 'center'
                                  }}>
                   {location ? (
                     <div>
      <p style={{ margin: 0, color: '#28a745', fontWeight: 'bold', fontSize: '1rem' }}>
        ✅ {lang === 'ar' ? 'تم تحديد موقعك بنجاح' : 'Position localisée avec succès'}
      </p>
      <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#888' }}>
        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
      </p>
      <button
        style={{ marginTop: '8px', background: 'none', border: '1px solid #28a745', color: '#28a745', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}
        onClick={() => { setLocation(null); }}
      >
        {lang === 'ar' ? 'إعادة التحديد' : 'Relocaliser'}
      </button>
    </div>
  ) : (
    <div>
      <p style={{ margin: '0 0 10px', color: '#dc3545', fontWeight: 'bold', fontSize: '0.95rem' }}>
        📍 {lang === 'ar' ? 'تحديد موقعك مطلوب' : 'Localisation requise'}
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#888' }}>
        {lang === 'ar'
          ? 'نحتاج موقعك لإرشاد الفني إليك بدقة'
          : 'Nous avons besoin de votre position pour guider le technicien'}
      </p>
      {locationError && (
        <p style={{ color: '#dc3545', fontSize: '0.8rem', margin: '0 0 10px' }}>{locationError}</p>
      )}
      <button
        style={{
          padding: '12px 20px',
          backgroundColor: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.95rem',
          cursor: locationLoading ? 'not-allowed' : 'pointer',
          opacity: locationLoading ? 0.7 : 1
        }}
        onClick={getLocation}
        disabled={locationLoading}
      >
        {locationLoading
          ? (lang === 'ar' ? '⏳ جاري التحديد...' : '⏳ Localisation...')
          : (lang === 'ar' ? '📍 تحديد موقعي الآن' : '📍 Me localiser maintenant')}
      </button>
    </div>
  )}
</div>
 
              <button
                style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onClick={handleSendRequest}
                disabled={loading}
              >
                {loading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Envoi...') : t.sendRequest}
              </button>
            </div>
          </div>
        )}
 
        {/* ===== طلباتي ===== */}
        {activeTab === 'requests' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <h2 style={s.screenTitle}>{t.myRequests}</h2>
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtnSm}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>
 
            {requests.length === 0 ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize: '3rem' }}>📋</span>
                <p style={{ color: '#888' }}>{t.noRequests}</p>
              </div>
            ) : (
              requests.map(r => {
                const st = getStatusStyle(r.status);
                return (
                  <div key={r.id} style={s.requestCard}
                    onClick={() => { setSelectedRequest(r); setActiveTab('requestDetail'); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>
                        {lang === 'ar' ? 'طلب رقم' : 'Demande #'} {r.id}
                      </span>
                      <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>
                        {t[`status_${r.status}`] || r.status}
                      </span>
                    </div>
                    {r.description && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#666' }}>
                        {r.description.substring(0, 60)}...
                      </p>
                    )}
                    <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#999' }}>
                      {new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                    </p>
                    {r.status === 'completed' && (
  <button
    style={{
      marginTop: '8px',
      padding: '6px 12px',
      background: 'none',
      border: '1px solid #dc3545',
      color: '#dc3545',
      borderRadius: '8px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      width: '100%'
    }}
    onClick={async (e) => {
      e.stopPropagation();
      if (!window.confirm(lang === 'ar' ? 'هل تريد حذف هذا الطلب؟' : 'Supprimer cette demande ?')) return;
      try {
        const res = await fetch(`${apiUrl}/requests/${r.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchRequests();
      } catch (err) {}
    }}
  >
    🗑️ {lang === 'ar' ? 'حذف الطلب' : 'Supprimer'}
  </button>
)}
                  </div>
                );
              })
            )}
          </div>
        )}
 
        {/* ===== تفاصيل الطلب ===== */}
        {activeTab === 'requestDetail' && selectedRequest && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <button style={s.backBtn} onClick={() => setActiveTab('requests')}>
                {lang === 'ar' ? '← رجوع' : '← Retour'}
              </button>
              <h2 style={s.screenTitle}>
                {lang === 'ar' ? 'تفاصيل الطلب' : 'Détails de la demande'}
              </h2>
            </div>
 
            {/* الحالة */}
            {(() => {
              const st = getStatusStyle(selectedRequest.status);
              return (
                <div style={{ ...s.statusBigBox, backgroundColor: st.bg, borderColor: st.color }}>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: st.color }}>
                    {t[`status_${selectedRequest.status}`]}
                  </p>
                </div>
              );
            })()}
 
            {/* الصورة */}
            {selectedRequest.image_url && (
              <img
                src={selectedRequest.image_url}
                alt="problem"
                style={{ width: '100%', borderRadius: '16px', marginBottom: '15px', maxHeight: '200px', objectFit: 'cover' }}
              />
            )}
 
            {/* الوصف الصوتي */}
            {selectedRequest.voice_note_url && (
              <div style={s.voicePlayBox}>
                <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#333' }}>
                  {lang === 'ar' ? '🎙 الوصف الصوتي:' : '🎙 Note vocale:'}
                </p>
                <audio controls src={selectedRequest.voice_note_url} style={{ width: '100%' }} />
              </div>
            )}
 
            {/* الوصف النصي */}
            {selectedRequest.description && (
              <div style={s.infoBox}>
                <p style={s.infoLabel}>{lang === 'ar' ? 'الوصف:' : 'Description:'}</p>
                <p style={s.infoValue}>{selectedRequest.description}</p>
              </div>
            )}
            {/* بيانات الفني */}
            {selectedRequest.provider_name && (
              <div style={s.infoBox}>
                <p style={s.infoLabel}>{lang === 'ar' ? 'الفني المسؤول:' : 'Technicien:'}</p>
                <p style={s.infoValue}>{selectedRequest.provider_name}</p>
                {selectedRequest.provider_phone && (
                  <a href={`tel:${selectedRequest.provider_phone}`} style={s.callBtn}>
                    📞 {selectedRequest.provider_phone}
                  </a>
                )}
              </div>
            )}
 
            {/* التاريخ */}
            <div style={s.infoBox}>
              <p style={s.infoLabel}>{lang === 'ar' ? 'تاريخ الطلب:' : 'Date:'}</p>
              <p style={s.infoValue}>
                {new Date(selectedRequest.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
              </p>
            </div>
 
            {/* زر الإبلاغ */}
            <button style={s.reportBtn} onClick={() => handleReport(selectedRequest.id)}>
              ⚠️ {t.reportProblem}
            </button>
          </div>
        )}
 
        {/* ===== الاشتراك ===== */}
                {activeTab === 'subscription' && (
          <div style={{ ...s.screen, paddingBottom: '100px' }}>
 
            {/* ===== إذا كان مشتركاً بالفعل ===== */}
            {isSubscribed ? (
              <div style={{
                background: 'linear-gradient(135deg, #006400 0%, #228B22 100%)',
                borderRadius: '24px',
                padding: '30px 20px',
                textAlign: 'center',
                color: '#fff',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '4rem' }}>✅</span>
                <h2 style={{ margin: '15px 0 5px', color: '#fff', fontSize: '1.5rem' }}>
                  {lang === 'ar' ? 'اشتراكك فعال' : 'Abonnement actif'}
                </h2>
                <p style={{ margin: '0 0 15px', opacity: 0.9, fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {userData?.package_name}
                </p>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontSize: '3rem', fontWeight: '900' }}>{getDaysLeft()}</div>
                  <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>
                    {lang === 'ar' ? 'يوم متبقي' : 'jours restants'}
                  </div>
                </div>
                <p style={{ margin: 0, opacity: 0.75, fontSize: '0.85rem' }}>
                  {t.expiresOn}: {new Date(userData?.subscription_end_date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                </p>
              </div>
 
            ) : userData?.subscription_pending ? (
              /* ===== شاشة الانتظار ===== */
              <div style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '30px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #ffc107'
              }}>
                <span style={{ fontSize: '4rem' }}>⏳</span>
                <h2 style={{ color: '#856404', margin: '15px 0 5px', fontSize: '1.3rem' }}>
                  {lang === 'ar' ? 'طلبك قيد المراجعة' : 'Demande en cours de traitement'}
                </h2>
 
                {userData?.package_name && (
                  <div style={{
                    background: '#fff3cd',
                    borderRadius: '14px',
                    padding: '15px',
                    margin: '15px 0',
                    border: '1px solid #ffc107'
                  }}>
                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#856404' }}>
                      {lang === 'ar' ? 'الباقة المطلوبة:' : 'Forfait demandé:'}
                    </p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: '#856404' }}>
                      {userData.package_name}
                    </p>
                  </div>
                )}
 
                <p style={{ color: '#888', lineHeight: '1.7', fontSize: '0.9rem', margin: '0 0 20px' }}>
                  {lang === 'ar'
                    ? 'تم استلام إثبات دفعك بنجاح. ستقوم الإدارة بمراجعته وتفعيل اشتراكك في أقرب وقت.'
                    : 'Votre preuve de paiement a été reçue. L\'administration va l\'examiner et activer votre abonnement prochainement.'}
                </p>
 
                <div style={{
                  background: '#f0fff0',
                  border: '1px dashed #006400',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  color: '#006400',
                  marginBottom: '20px'
                }}>
                  🔔 {lang === 'ar' ? 'سيصلك إشعار فور التفعيل' : 'Vous serez notifié dès l\'activation'}
                </div>
 
                <button
                  style={{ ...s.btnPrimary, backgroundColor: '#ffc107', color: '#333' }}
                  onClick={() => setActiveTab('home')}
                >
                  {lang === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
                </button>
              </div>
 
            ) : subStep === 1 ? (
              /* ===== الخطوة 1: اختيار الباقة ===== */
              <div>
                <div style={s.screenHeader}>
                  <h2 style={s.screenTitle}>
                    {lang === 'ar' ? 'اختر باقتك' : 'Choisissez votre forfait'}
                  </h2>
                  <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtnSm}>
                    {lang === 'ar' ? 'FR' : 'AR'}
                  </button>
                </div>
 
                {/* بطاقات الباقات — من قاعدة البيانات */}
                {packages.map(pkg => {
                  const styles = {
                    3: { color: '#fff8e1', border: '#f59e0b', icon: '🥇', badge: lang === 'ar' ? '⭐ الأكثر شمولاً' : '⭐ Le plus complet' },
                    2: { color: '#f0f4ff', border: '#3b82f6', icon: '🥈', badge: lang === 'ar' ? '🔥 الأكثر طلباً' : '🔥 Le plus demandé' },
                    1: { color: '#f0fff4', border: '#22c55e', icon: '🥉', badge: lang === 'ar' ? '✅ للبداية' : '✅ Pour commencer' }
                  };
                  const ps = styles[pkg.id] || { color: '#f5f5f5', border: '#999', icon: '📦', badge: '' };
                  const items = pkg.coverage_items ? pkg.coverage_items.split('|') : [];
 
                  return (
                    <div key={pkg.id} style={{
                      border: `2px solid ${ps.border}`,
                      borderRadius: '20px',
                      marginBottom: '20px',
                      marginTop: '18px',
                      overflow: 'visible',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                      backgroundColor: ps.color,
                      position: 'relative'
                    }}>
 
                      {/* شارة مميزة */}
                      <div style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: ps.border,
                        color: '#fff',
                        padding: '5px 18px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: `0 3px 10px ${ps.border}66`
                      }}>
                        {ps.badge}
                      </div>
 
                      {/* رأسية الباقة */}
                      <div style={{
                        padding: '20px',
                        paddingTop: '28px',
                        borderBottom: `2px solid ${ps.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '2.5rem' }}>{ps.icon}</span>
                          <div>
                            <p style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem', color: ps.border }}>
                              {pkg.name}
                            </p>
                            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#666' }}>
                              {lang === 'ar' ? '∞ طلبات غير محدودة' : '∞ Demandes illimitées'}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: ps.border, lineHeight: 1 }}>
                            {pkg.price}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>
                            MRU/{lang === 'ar' ? 'شهر' : 'mois'}
                          </div>
                        </div>
                      </div>
 
                      {/* قائمة التغطية */}
                      <div style={{ padding: '15px 20px' }}>
                        {items.map((item, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            marginBottom: '8px'
                          }}>
                            <span style={{ color: ps.border, fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>✓</span>
                            <span style={{ fontSize: '0.88rem', color: '#444', lineHeight: '1.5' }}>{item}</span>
                          </div>
                        ))}
 
                        {/* تنبيه اليد العاملة */}
                        <div style={{
                          marginTop: '12px',
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.04)',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          color: '#777',
                          textAlign: 'center',
                          borderTop: `1px dashed ${ps.border}`
                        }}>
                          ⚠️ {lang === 'ar'
                            ? 'تأمين اليد العاملة فقط — قطع الغيار على عاتق الزبون'
                            : 'Main d\'œuvre uniquement — pièces à la charge du client'}
                        </div>
                      </div>
 
                      {/* زر الاختيار */}
                      <div style={{ padding: '0 20px 20px' }}>
                        <button
                          style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: ps.border,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedPackage(pkg.id);
                            setSubStep(2);
                          }}
                        >
                          {lang === 'ar' ? 'اختر هذه الباقة ←' : 'Choisir ce forfait →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
 
            ) : subStep === 2 ? (
              /* ===== الخطوة 2: تفاصيل الدفع ===== */
              <div>
                <div style={s.screenHeader}>
                  <button style={s.backBtn} onClick={() => { setSubStep(1); setSubProof(null); }}>
                    {lang === 'ar' ? '← رجوع' : '← Retour'}
                  </button>
                  <h2 style={s.screenTitle}>
                    {lang === 'ar' ? 'تفاصيل الدفع' : 'Détails du paiement'}
                  </h2>
                </div>
 
                {/* ملخص الباقة المختارة */}
                {(() => {
                  const selectedPkg = packages.find(p => p.id === selectedPackage);
                  const pkgStyles = {
                    3: { border: '#f59e0b', icon: '🥇' },
                    2: { border: '#3b82f6', icon: '🥈' },
                    1: { border: '#22c55e', icon: '🥉' }
                  };
                  const ps = pkgStyles[selectedPackage] || { border: '#006400', icon: '📦' };
                  return (
                    <div style={{
                      background: `linear-gradient(135deg, ${ps.border} 0%, ${ps.border}cc 100%)`,
                      borderRadius: '16px',
                      padding: '18px 20px',
                      color: '#fff',
                      marginBottom: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '2rem' }}>{ps.icon}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85 }}>
                            {lang === 'ar' ? 'الباقة المختارة' : 'Forfait sélectionné'}
                          </p>
                          <p style={{ margin: '4px 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {selectedPkg?.name || '-'}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>
                          {selectedPkg?.price || '-'}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>MRU</div>
                      </div>
                    </div>
                  );
                })()}
 
                {/* أرقام التحويل */}
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '15px'
                }}>
                  <p style={{ margin: '0 0 14px', fontWeight: 'bold', color: '#856404', fontSize: '0.95rem', textAlign: 'center' }}>
                    {lang === 'ar' ? '💳 حوّل المبلغ عبر أحد هذه الأرقام:' : '💳 Transférez via l\'un de ces numéros:'}
                  </p>
 
                  {[
                    { name: lang === 'ar' ? 'بنكيلي' : 'Bankily', num: '42072952', emoji: '📱' },
                    { name: lang === 'ar' ? 'سداد' : 'Sadad', num: '42072952', emoji: '📱' },
                    { name: lang === 'ar' ? 'مصرفي' : 'Masrivi', num: '42072952', emoji: '📱' }
                  ].map((b, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#fff',
                      padding: '12px 15px',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>{b.emoji} {b.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '900', color: '#006400', fontSize: '1.15rem', letterSpacing: '1px' }}>
                          {b.num}
                        </span>
                        <button
                          onClick={() => {
                            try {
                              if (navigator.clipboard && window.isSecureContext) {
                                navigator.clipboard.writeText(b.num);
                              } else {
                                const el = document.createElement('textarea');
                                el.value = b.num;
                                el.style.position = 'fixed';
                                el.style.opacity = '0';
                                document.body.appendChild(el);
                                el.focus();
                                el.select();
                                document.execCommand('copy');
                                document.body.removeChild(el);
                              }
                              alert(lang === 'ar' ? '✅ تم نسخ الرقم' : '✅ Numéro copié');
                            } catch (err) {
                              alert(lang === 'ar' ? `الرقم: ${b.num}` : `Numéro: ${b.num}`);
                            }
                          }}
                          style={{
                            padding: '4px 10px',
                            background: '#006400',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          {lang === 'ar' ? 'نسخ' : 'Copier'}
                        </button>
                      </div>
                    </div>
                  ))}
 
                  <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: '#856404', textAlign: 'center', fontStyle: 'italic' }}>
                    💡 {lang === 'ar'
                      ? 'بعد إتمام التحويل، ارفع صورة الإثبات أدناه'
                      : 'Après le transfert, joignez la preuve ci-dessous'}
                  </p>
                </div>
 
                {/* رفع إثبات الدفع */}
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '25px 20px',
                  border: `2px dashed ${subProof ? '#28a745' : '#006400'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  backgroundColor: subProof ? '#f0fff0' : '#fafffe',
                  marginBottom: '15px',
                  minHeight: '120px'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file && file.size > 5 * 1024 * 1024) {
                        alert(lang === 'ar' ? 'حجم الصورة كبير جداً (أقل من 5MB)' : 'Image trop grande (max 5MB)');
                        return;
                      }
                      setSubProof(file);
                    }}
                  />
                  <span style={{ fontSize: '2.5rem' }}>{subProof ? '✅' : '📁'}</span>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: subProof ? '#28a745' : '#006400', fontSize: '1rem' }}>
                      {subProof
                        ? subProof.name.substring(0, 30) + '...'
                        : (lang === 'ar' ? 'إرفاق صورة إثبات الدفع' : 'Joindre la preuve de paiement')}
                    </p>
                    {!subProof && (
                      <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#888' }}>
                        {lang === 'ar' ? 'اضغط هنا لرفع لقطة الشاشة' : 'Appuyez pour télécharger'}
                      </p>
                    )}
                  </div>
                </label>
 
                {/* زر الإرسال */}
                <button
                  style={{
                    ...s.btnPrimary,
                    opacity: (loading || !subProof) ? 0.5 : 1,
                    fontSize: '1.05rem',
                    padding: '16px'
                  }}
                  onClick={handleSubscriptionRequest}
                  disabled={loading || !subProof}
                >
                  {loading
                    ? (lang === 'ar' ? '⏳ جاري الإرسال...' : '⏳ Envoi...')
                    : (lang === 'ar' ? '🚀 إرسال طلب الاشتراك' : '🚀 Envoyer la demande')}
                </button>
              </div>
            ) : null}
          </div>
        )}


        {/* ===== حسابي ===== */}
        {activeTab === 'profile' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <h2 style={s.screenTitle}>{t.myAccount}</h2>
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtnSm}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>
 
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={s.avatar}>👤</div>
              <h3 style={{ margin: '10px 0 5px', color: '#333' }}>{userData?.full_name}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{userData?.phone}</p>
            </div>
 
            <div style={s.infoCard}>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>{t.clientCode}</span>
                <span style={{ ...s.infoValue, fontWeight: 'bold', letterSpacing: '2px', color: '#006400' }}>
                  {userData?.client_code}
                </span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>{t.district}</span>
                <span style={s.infoValue}>{userData?.district || '-'}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>{t.address}</span>
                <span style={s.infoValue}>{userData?.address || '-'}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>{t.currentPackage}</span>
                <span style={s.infoValue}>{userData?.package_name || '-'}</span>
              </div>
            </div>
 
            <button style={s.logoutBtn} onClick={onLogout}>{t.logout}</button>
          </div>
        )}
 
      </main>
 
      {/* شريط التنقل السفلي */}
      <nav style={s.bottomNav}>
        {[
          { id: 'home', icon: '🏠', label: t.home },
          { id: 'requests', icon: '📋', label: t.myRequests },
          { id: 'subscription', icon: '💳', label: t.subscription },
          { id: 'profile', icon: '👤', label: t.myAccount }
        ].map(tab => (
          <button
            key={tab.id}
            style={activeTab === tab.id || (activeTab === 'newRequest' && tab.id === 'home') || (activeTab === 'requestDetail' && tab.id === 'requests')
              ? s.navActive : s.navBtn}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ fontSize: '1.4rem' }}>{tab.icon}</span>
            <span style={{ fontSize: '0.7rem' }}>{tab.label}</span>
          </button>
        ))}
      </nav>
 
    </div>
  );
}
 
const s = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f7fa',
    overflow: 'hidden',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '80px'
  },
  screen: {
    padding: '15px',
    maxWidth: '500px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  homeHeader: {
    background: 'linear-gradient(135deg, #006400 0%, #228B22 100%)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '15px',
    color: '#fff'
  },
  langBtn: {
    padding: '5px 12px',
    borderRadius: '10px',
    border: '1.5px solid rgba(255,255,255,0.6)',
    background: 'transparent',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  langBtnSm: {
    padding: '5px 12px',
    borderRadius: '10px',
    border: '1.5px solid #006400',
    background: '#fff',
    color: '#006400',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  clientCodeBox: {
    marginTop: '15px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff'
  },
  subActiveCard: {
    background: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '15px'
  },
  subWarningCard: {
    background: '#fff3cd',
    border: '1px solid #ffeeba',
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  requestBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #006400 0%, #228B22 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0 8px 25px rgba(0,100,0,0.25)'
  },
  sectionTitle: {
    color: '#333',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  requestCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '15px',
    marginBottom: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    border: '1px solid #f0f0f0'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  statusBigBox: {
    border: '2px solid',
    borderRadius: '14px',
    padding: '15px',
    textAlign: 'center',
    marginBottom: '15px'
  },
  screenHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  screenTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#006400',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '18px',
    border: '2px dashed #006400',
    borderRadius: '14px',
    cursor: 'pointer',
    background: '#f9fff9'
  },
  voiceBox: {
    borderRadius: '14px',
    overflow: 'hidden'
  },
  voiceBtn: {
    width: '100%',
    padding: '18px',
    border: 'none',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  voicePlayBox: {
    background: '#f0fff0',
    border: '1px solid #c3e6cb',
    borderRadius: '14px',
    padding: '15px'
  },
  reRecordBtn: {
    background: 'none',
    border: '1px solid #006400',
    color: '#006400',
    borderRadius: '8px',
    padding: '6px 12px',
    cursor: 'pointer',
    marginTop: '8px',
    fontSize: '0.85rem'
  },
  textarea: {
    width: '100%',
    padding: '13px',
    borderRadius: '12px',
    border: '1.5px solid #ddd',
    fontSize: '0.95rem',
    resize: 'none',
    height: '90px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fafafa'
  },
  btnPrimary: {
    padding: '15px',
    backgroundColor: '#006400',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '50px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  infoBox: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '12px 15px',
    marginBottom: '10px'
  },
  infoCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    marginBottom: '20px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 10px',
    borderBottom: '1px solid #f5f5f5'
  },
  infoLabel: {
    color: '#888',
    fontSize: '0.85rem',
    margin: 0
  },
  infoValue: {
    color: '#333',
    fontSize: '0.9rem',
    margin: 0
  },
  callBtn: {
    display: 'block',
    marginTop: '8px',
    color: '#006400',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '1rem'
  },
  reportBtn: {
    width: '100%',
    padding: '12px',
    background: '#fff',
    border: '1.5px solid #dc3545',
    color: '#dc3545',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  packageCard: {
    border: '2px solid',
    borderRadius: '14px',
    padding: '15px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: '0.2s'
  },
  pendingBox: {
    textAlign: 'center',
    padding: '30px 20px',
    background: '#fffbf0',
    border: '2px solid #ffc107',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  notifHint: {
    background: '#fff',
    border: '1px dashed #ffc107',
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    color: '#856404'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#e8f5e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    margin: '0 auto'
  },
  logoutBtn: {
    width: '100%',
    padding: '13px',
    background: 'none',
    border: '1.5px solid #dc3545',
    color: '#dc3545',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    height: '70px',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 -2px 15px rgba(0,0,0,0.08)',
    zIndex: 1000,
    borderTop: '1px solid #eee'
  },
  navBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    cursor: 'pointer',
    color: '#aaa',
    padding: '5px 0'
  },
  navActive: {
    flex: 1,
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    cursor: 'pointer',
    color: '#006400',
    fontWeight: 'bold',
    padding: '5px 0'
  }
};
 