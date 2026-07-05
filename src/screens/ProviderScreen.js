import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../translations';
 import Logo from '../Logo';
export default function ProviderScreen({ user, apiUrl, onLogout }) {
  const [lang, setLang] = useState('ar');
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('home');
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [earnings, setEarnings] = useState({ earnings: [], total_pending: 0, total_paid: 0 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(user);
 
  const token = localStorage.getItem('userToken');
 
  useEffect(() => {
    fetchAvailableRequests();
    fetchMyJobs();
    fetchEarnings();
    const interval = setInterval(() => {
      fetchAvailableRequests();
      fetchMyJobs();
    }, 15000);
    return () => clearInterval(interval);
  }, []);
 
  const fetchAvailableRequests = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/provider/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAvailableRequests(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);
 
  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/provider/my-requests/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMyJobs(await res.json());
    } catch (err) {}
  }, [apiUrl, token, user.id]);
 
  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/provider/earnings/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setEarnings(await res.json());
    } catch (err) {}
  }, [apiUrl, token, user.id]);
 
  // قبول طلب
  const handleAccept = async (requestId) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/provider/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider_id: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert(lang === 'ar' ? '✅ تم قبول المهمة بنجاح' : '✅ Mission acceptée');
        setSelectedRequest(null);
        fetchAvailableRequests();
        fetchMyJobs();
        setActiveTab('jobs');
      } else {
        alert(data.error || t.error);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setLoading(false);
    }
  };
 
  // إنهاء مهمة
  const handleComplete = async (requestId) => {
    const confirm = window.confirm(
      lang === 'ar' ? 'هل أنهيت هذه المهمة فعلاً؟' : 'Avez-vous vraiment terminé cette mission ?'
    );
    if (!confirm) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/provider/requests/${requestId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider_id: user.id })
      });
      if (res.ok) {
        alert(t.jobCompleted);
        fetchMyJobs();
        fetchEarnings();
        setSelectedRequest(null);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setLoading(false);
    }
  };
 
  const getStatusStyle = (status) => {
    const map = {
      quoted: { bg: '#d1ecf1', color: '#0c5460' },
      assigned: { bg: '#d4edda', color: '#155724' },
      completed: { bg: '#e2e3e5', color: '#383d41' }
    };
    return map[status] || { bg: '#f8f9fa', color: '#333' };
  };
 
  return (
    <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 
      {/* نافذة تفاصيل الطلب */}
      {selectedRequest && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={s.closeBtn} onClick={() => setSelectedRequest(null)}>✕</button>
 
            {/* رأسية المودال */}
            <div style={s.modalHeader}>
              <span style={s.modalBadge}>
                {lang === 'ar' ? 'طلب رقم' : 'Demande #'} {selectedRequest.id}
              </span>
              <div style={{ ...s.priceBig, display: selectedRequest.quoted_price ? 'block' : 'none' }}>
                {selectedRequest.quoted_price} MRU
              </div>
            </div>
 
            {/* الصورة */}
            {selectedRequest.image_url && (
              <img
                src={selectedRequest.image_url}
                alt="problem"
                style={s.modalImg}
                onClick={() => window.open(selectedRequest.image_url, '_blank')}
              />
            )}
 
            {/* الوصف الصوتي */}
            {selectedRequest.voice_note_url && (
              <div style={s.voiceBox}>
                <p style={s.voiceLabel}>🎙 {t.playVoice}</p>
                <audio controls src={selectedRequest.voice_note_url} style={{ width: '100%' }} />
              </div>
            )}
 
            {/* الوصف النصي */}
            {selectedRequest.description && (
              <div style={s.infoBox}>
                <p style={s.infoLabel}>
                  {lang === 'ar' ? '📝 الوصف:' : '📝 Description:'}
                </p>
                <p style={s.infoValue}>{selectedRequest.description}</p>
              </div>
            )}
 
            {/* بيانات الزبون — تظهر فقط بعد القبول */}
            {selectedRequest.status === 'assigned' || selectedRequest.status === 'completed' ? (
              <div style={{ ...s.infoBox, backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
                <p style={{ ...s.infoLabel, color: '#155724', fontWeight: 'bold' }}>
                  {lang === 'ar' ? '👤 بيانات الزبون:' : '👤 Informations client:'}
                </p>
                <p style={s.infoValue}>{selectedRequest.customer_name}</p>
                <a href={`tel:${selectedRequest.customer_phone}`} style={s.callBtn}>
                  📞 {selectedRequest.customer_phone}
                </a>
                <p style={{ ...s.infoValue, marginTop: '8px' }}>
                  📍 {selectedRequest.district} — {selectedRequest.address}
                </p>
                {/* زر الانطلاق بالملاحة */}
{selectedRequest.latitude && selectedRequest.longitude && (
  <button
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      marginTop: '12px',
      padding: '14px',
      backgroundColor: '#1a73e8',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '1rem',
      cursor: 'pointer'
    }}
    onClick={() => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${selectedRequest.latitude},${selectedRequest.longitude}&travelmode=driving`,
        '_blank'
      );
    }}
  >
    🗺️ {lang === 'ar' ? 'انطلق للزبون — ملاحة صوتية' : 'Naviguer vers le client'}
  </button>
)}
              </div>
            ) : (
              <div style={s.infoBox}>
                <p style={s.infoLabel}>
                  {lang === 'ar' ? '📍 المقاطعة:' : '📍 Commune:'}
                </p>
                <p style={s.infoValue}>{selectedRequest.district}</p>
              </div>
            )}
 
            {/* أزرار الإجراء */}
            <div style={s.modalActions}>
              {/* طلب متاح — قبول أو تجاهل */}
              {selectedRequest.status === 'quoted' && (
  <>
    <button
      style={{ ...s.btnDanger, flex: 1 }}
      onClick={async () => {
        try {
          await fetch(`${apiUrl}/provider/requests/${selectedRequest.id}/ignore`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ provider_id: user.id })
          });
        } catch (err) {}
        setAvailableRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
        setSelectedRequest(null);
      }}
    >
      {t.ignoreRequest}
    </button>
                  <button
                    style={{ ...s.btnSuccess, flex: 2, opacity: loading ? 0.7 : 1 }}
                    onClick={() => handleAccept(selectedRequest.id)}
                    disabled={loading}
                  >
                    {loading ? '...' : t.acceptRequest}
                  </button>
                </>
              )}
 
              {/* مهمة مقبولة — إنهاء */}
              {selectedRequest.status === 'assigned' && (
                <button
                  style={{ ...s.btnSuccess, width: '100%', opacity: loading ? 0.7 : 1 }}
                  onClick={() => handleComplete(selectedRequest.id)}
                  disabled={loading}
                >
                  {loading ? '...' : t.completeJob}
                </button>
              )}
 
              {/* مهمة منتهية */}
              {selectedRequest.status === 'completed' && (
                <div style={s.completedBadge}>
                  ✅ {lang === 'ar' ? 'تم إنهاء هذه المهمة' : 'Mission terminée'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
 
      <main style={s.main}>
 
        {/* ===== الطلبات المتاحة ===== */}
        {activeTab === 'home' && (
          <div style={s.screen}>
           <div style={s.screenHeader}>
  <Logo size="sm" theme="dark" />
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
      {lang === 'ar' ? 'FR' : 'AR'}
    </button>
  </div>
</div>
<div style={{ marginBottom: '15px' }}>
  <h2 style={s.screenTitle}>{t.availableRequests}</h2>
  <p style={s.screenSub}>{lang === 'ar' ? `${availableRequests.length} طلب متاح` : `${availableRequests.length} demande(s)`}</p>
</div>
 
            {availableRequests.length === 0 ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize: '3rem' }}>📭</span>
                <p style={{ color: '#888' }}>{t.noAvailableRequests}</p>
              </div>
            ) : (
              availableRequests.map(req => (
                <div
                  key={req.id}
                  style={s.requestCard}
                  onClick={() => setSelectedRequest(req)}
                >
                  <div style={s.cardTop}>
                    <div style={s.cardPrice}>
                      {req.quoted_price} MRU
                    </div>
                    <span style={s.cardDistrict}>📍 {req.district}</span>
                  </div>
 
                  {/* أيقونات المحتوى */}
                  <div style={s.cardIcons}>
                    {req.image_url && <span style={s.contentIcon}>📷</span>}
                    {req.voice_note_url && <span style={s.contentIcon}>🎙</span>}
                    {req.description && <span style={s.contentIcon}>📝</span>}
                  </div>
 
                  {req.description && (
                    <p style={s.cardDesc}>{req.description.substring(0, 60)}...</p>
                  )}
 
                  <p style={s.cardDate}>
                    {new Date(req.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                  </p>
 
                  <div style={s.cardFooter}>
                    <span style={s.tapHint}>
                      {lang === 'ar' ? 'اضغط لرؤية التفاصيل' : 'Appuyer pour voir les détails'}
                    </span>
                    <span style={{ color: '#006400', fontWeight: 'bold' }}>←</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
 
        {/* ===== مهامي ===== */}
        {activeTab === 'jobs' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <h2 style={s.screenTitle}>{t.myJobs}</h2>
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>
 
            {myJobs.length === 0 ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize: '3rem' }}>📋</span>
                <p style={{ color: '#888' }}>
                  {lang === 'ar' ? 'لا توجد مهام بعد' : 'Aucune mission pour le moment'}
                </p>
              </div>
            ) : (
              myJobs.map(job => {
                const st = getStatusStyle(job.status);
                return (
                  <div
                    key={job.id}
                    style={s.requestCard}
                    onClick={() => setSelectedRequest(job)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>
                        {lang === 'ar' ? 'مهمة رقم' : 'Mission #'} {job.id}
                      </span>
                      <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>
                        {t[`status_${job.status}`] || job.status}
                      </span>
                    </div>
 
                    <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#666' }}>
                      📍 {job.district}
                    </p>
 
                    {job.quoted_price && (
                      <p style={{ margin: '5px 0 0', fontWeight: 'bold', color: '#006400' }}>
                        {job.quoted_price} MRU
                      </p>
                    )}
 
                    <p style={s.cardDate}>
                      {new Date(job.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                    </p>
                    {job.status === 'completed' && (
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
      if (!window.confirm(lang === 'ar' ? 'هل تريد حذف هذه المهمة؟' : 'Supprimer cette mission ?')) return;
      try {
        const res = await fetch(`${apiUrl}/requests/${job.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchMyJobs();
      } catch (err) {}
    }}
  >
    🗑️ {lang === 'ar' ? 'حذف المهمة' : 'Supprimer'}
  </button>
)}
                  </div>
                );
              })
            )}
          </div>
        )}
 
        {/* ===== مستحقاتي ===== */}
        {activeTab === 'earnings' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <h2 style={s.screenTitle}>{t.earnings}</h2>
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>
 
            {/* ملخص المستحقات */}
            <div style={s.earningsSummary}>
              <div style={s.earningsCard}>
                <p style={s.earningsLabel}>{t.totalPending}</p>
                <p style={{ ...s.earningsAmount, color: '#856404' }}>
                  {earnings.total_pending} MRU
                </p>
              </div>
              <div style={{ ...s.earningsCard, backgroundColor: '#d4edda' }}>
                <p style={s.earningsLabel}>{t.totalPaid}</p>
                <p style={{ ...s.earningsAmount, color: '#155724' }}>
                  {earnings.total_paid} MRU
                </p>
              </div>
            </div>
 
            {/* معلومات الحساب البنكي */}
            <div style={s.bankInfoBox}>
              <p style={s.sectionTitle}>{t.bankInfo}</p>
              <div style={s.bankRow}>
                <span style={s.infoLabel}>
                  {lang === 'ar' ? 'نوع الحساب:' : 'Type:'}
                </span>
                <span style={{ fontWeight: 'bold', color: '#333', textTransform: 'capitalize' }}>
                  {userData?.bank_type || '-'}
                </span>
              </div>
              <div style={s.bankRow}>
                <span style={s.infoLabel}>
                  {lang === 'ar' ? 'رقم الهاتف:' : 'Numéro:'}
                </span>
                <span style={{ fontWeight: 'bold', color: '#006400', fontSize: '1.1rem' }}>
                  {userData?.bank_phone || '-'}
                </span>
              </div>
            </div>
 
            {/* تفاصيل المستحقات */}
            <p style={s.sectionTitle}>
              {lang === 'ar' ? 'تفاصيل المهام' : 'Détail des missions'}
            </p>
 
            {earnings.earnings.length === 0 ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize: '2rem' }}>💰</span>
                <p style={{ color: '#888' }}>
                  {lang === 'ar' ? 'لا توجد مستحقات بعد' : 'Aucun revenu pour le moment'}
                </p>
              </div>
            ) : (
              earnings.earnings.map(e => (
                <div key={e.id} style={s.earningItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#333', fontSize: '0.9rem' }}>
                      {lang === 'ar' ? 'مهمة رقم' : 'Mission #'} {e.request_id}
                    </span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: e.status === 'paid' ? '#d4edda' : '#fff3cd',
                      color: e.status === 'paid' ? '#155724' : '#856404'
                    }}>
                      {e.status === 'paid' ? t.paid : t.pendingPayment}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ color: '#888', fontSize: '0.8rem' }}>
                      📍 {e.district}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#006400', fontSize: '1.1rem' }}>
                      {e.amount} MRU
                    </span>
                  </div>
                  {e.paid_at && (
                    <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: '#999' }}>
                      {lang === 'ar' ? 'تم الدفع:' : 'Payé le:'} {new Date(e.paid_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
 
        {/* ===== حسابي ===== */}
        {activeTab === 'profile' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <h2 style={s.screenTitle}>{t.myAccount}</h2>
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>
 
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={s.avatar}>👷</div>
              <h3 style={{ margin: '10px 0 5px', color: '#333' }}>{userData?.full_name}</h3>
              <p style={{ margin: 0, color: '#888' }}>{userData?.phone}</p>
            </div>
 
            <div style={s.infoCard}>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>{t.bankInfo}</span>
                <span style={{ fontWeight: 'bold', color: '#006400', textTransform: 'capitalize' }}>
                  {userData?.bank_type || '-'}
                </span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>
                  {lang === 'ar' ? 'رقم الحساب:' : 'Numéro bancaire:'}
                </span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  {userData?.bank_phone || '-'}
                </span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>
                  {lang === 'ar' ? 'المهام المنجزة:' : 'Missions effectuées:'}
                </span>
                <span style={{ fontWeight: 'bold', color: '#006400' }}>
                  {myJobs.filter(j => j.status === 'completed').length}
                </span>
              </div>
            </div>
 
            <button style={s.logoutBtn} onClick={onLogout}>{t.logout}</button>
          </div>
        )}
 
      </main>
 
      {/* شريط التنقل */}
      <nav style={s.bottomNav}>
        {[
          { id: 'home', icon: '🏠', label: t.availableRequests.split(' ')[0] },
          { id: 'jobs', icon: '🔧', label: t.myJobs },
          { id: 'earnings', icon: '💰', label: t.earnings },
          { id: 'profile', icon: '👤', label: t.myAccount }
        ].map(tab => (
          <button
            key={tab.id}
            style={activeTab === tab.id ? s.navActive : s.navBtn}
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
  screenSub: {
    margin: '3px 0 0',
    fontSize: '0.8rem',
    color: '#888'
  },
  langBtn: {
    padding: '5px 12px',
    borderRadius: '10px',
    border: '1.5px solid #006400',
    background: '#fff',
    color: '#006400',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  requestCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    border: '1px solid #f0f0f0'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  cardPrice: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#006400'
  },
  cardDistrict: {
    fontSize: '0.85rem',
    color: '#555',
    background: '#f0f4f0',
    padding: '4px 10px',
    borderRadius: '20px'
  },
  cardIcons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px'
  },
  contentIcon: {
    fontSize: '1.2rem',
    background: '#f5f5f5',
    padding: '4px 8px',
    borderRadius: '8px'
  },
  cardDesc: {
    margin: '0 0 8px',
    fontSize: '0.85rem',
    color: '#666',
    lineHeight: '1.4'
  },
  cardDate: {
    margin: '5px 0 0',
    fontSize: '0.75rem',
    color: '#999'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #f5f5f5'
  },
  tapHint: {
    fontSize: '0.8rem',
    color: '#aaa'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '50px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  // المودال
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    padding: '20px'
  },
  modal: {
    background: '#fff',
    width: '100%',
    maxWidth: '430px',
    borderRadius: '24px',
    padding: '25px',
    position: 'relative',
    maxHeight: '85vh',
    overflowY: 'auto'
  },
  closeBtn: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  modalHeader: {
    textAlign: 'center',
    marginBottom: '15px',
    paddingTop: '10px'
  },
  modalBadge: {
    background: '#e8f5e9',
    color: '#006400',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  priceBig: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#006400',
    marginTop: '10px'
  },
  modalImg: {
    width: '100%',
    borderRadius: '16px',
    marginBottom: '15px',
    maxHeight: '200px',
    objectFit: 'cover',
    cursor: 'pointer'
  },
  voiceBox: {
    background: '#f0fff0',
    border: '1px solid #c3e6cb',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '12px'
  },
  voiceLabel: {
    margin: '0 0 8px',
    fontWeight: 'bold',
    color: '#006400',
    fontSize: '0.9rem'
  },
  infoBox: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '12px 15px',
    marginBottom: '10px'
  },
  infoLabel: {
    color: '#888',
    fontSize: '0.85rem',
    margin: '0 0 4px'
  },
  infoValue: {
    color: '#333',
    fontSize: '0.95rem',
    margin: 0,
    lineHeight: '1.5'
  },
  callBtn: {
    display: 'inline-block',
    marginTop: '8px',
    color: '#006400',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '1.1rem'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  btnSuccess: {
    padding: '14px',
    backgroundColor: '#006400',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  btnDanger: {
    padding: '14px',
    backgroundColor: '#fff',
    color: '#dc3545',
    border: '1.5px solid #dc3545',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  completedBadge: {
    width: '100%',
    textAlign: 'center',
    padding: '14px',
    background: '#e2e3e5',
    borderRadius: '12px',
    color: '#383d41',
    fontWeight: 'bold'
  },
  // المستحقات
  earningsSummary: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px'
  },
  earningsCard: {
    background: '#fff3cd',
    borderRadius: '14px',
    padding: '15px',
    textAlign: 'center'
  },
  earningsLabel: {
    margin: '0 0 8px',
    fontSize: '0.8rem',
    color: '#555'
  },
  earningsAmount: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  bankInfoBox: {
    background: '#fff',
    borderRadius: '14px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  bankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px'
  },
  earningItem: {
    background: '#fff',
    borderRadius: '12px',
    padding: '12px 15px',
    marginBottom: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
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
