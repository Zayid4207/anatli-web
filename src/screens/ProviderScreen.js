import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../translations';
import Logo from '../Logo';
 
// رقم الإدارة الذي يظهر للفني (غيّره إذا أردت رقماً آخر)
const ADMIN_PHONE = '42072952';
export default function ProviderScreen({ user, apiUrl, onLogout }) {
  const [lang, setLang] = useState('ar');
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('jobs');
  const [salaryMonths, setSalaryMonths] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [jobDetail, setJobDetail] = useState(null); // صفحة تفاصيل المهمة
  const [loading, setLoading] = useState(false);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [userData, setUserData] = useState(user);
  const [showPass, setShowPass] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
 
  // ===== تشغيل الرسالة الصوتية بشكل واتساب =====
  const [voiceIsPlaying, setVoiceIsPlaying] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const voiceAudioRef = useRef(null);
 
  const token = localStorage.getItem('userToken');
  
  // حالة صرف الراتب (بدون المبلغ)
  const fetchSalary = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/provider/salary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setSalaryMonths(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);

  useEffect(() => {
    if (activeTab === 'salary') fetchSalary();
  }, [activeTab, fetchSalary]);
 
  useEffect(() => {
    fetchMyJobs();
    fetchMe();
        const interval = setInterval(() => {
      if (document.hidden) return;
      fetchMyJobs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
 
  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/provider/my-jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyJobs(data);
        // إذا كانت صفحة تفاصيل مهمة مفتوحة، حدّث بياناتها أيضاً
        setJobDetail(prev => {
          if (!prev) return prev;
          const updated = data.find(j => j.id === prev.id);
          return updated || prev;
        });
      }
    } catch (err) {}
  }, [apiUrl, token, user.id]);
 
  // تحديث بياناتي (التوفر والتخصص) من السيرفر
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (err) {}
  }, [apiUrl, token, user.id]);
 
  // ===== دوال تشغيل الصوت بشكل واتساب =====
  const formatVoiceDuration = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
 
  const toggleVoicePlayback = () => {
    const audio = voiceAudioRef.current;
    if (!audio) return;
    if (voiceIsPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };
 
  const resetVoicePlayerState = () => {
    setVoiceIsPlaying(false);
    setVoiceProgress(0);
    setVoiceDuration(0);
  };
 
  // الانتقال للمرحلة التالية: انطلقت ← بدأت العمل ← أنهيت المهمة
  const handleAdvance = async (job) => {
    if (job.status === 'in_progress') {
      const ok = window.confirm(
        lang === 'ar' ? 'هل أنهيت هذه المهمة فعلاً؟' : 'Avez-vous vraiment terminé cette mission ?'
      );
      if (!ok) return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/provider/requests/${job.id}/advance`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === 'completed') {
          alert(t.jobCompleted);
          setJobDetail(null);
          resetVoicePlayerState();
        } else {
          setJobDetail(prev => (prev ? { ...prev, status: data.status } : prev));
        }
        fetchMyJobs();
      } else {
        alert(data.error || t.error);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setLoading(false);
    }
  };
 
  // تغيير كلمة المرور — بدون أي شروط على الطول
  const handleChangePassword = async () => {
    if (!passForm.current || !passForm.next) {
      alert(lang === 'ar' ? 'يرجى تعبئة كل الحقول' : 'Veuillez remplir tous les champs');
      return;
    }
    if (passForm.next !== passForm.confirm) {
      alert(lang === 'ar' ? 'كلمتا المرور الجديدتان غير متطابقتين' : 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch(`${apiUrl}/me/password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: passForm.current, new_password: passForm.next })
      });
      const data = await res.json();
      if (res.ok) {
        alert(lang === 'ar' ? '✅ تم تغيير كلمة المرور' : '✅ Mot de passe modifié');
        setPassForm({ current: '', next: '', confirm: '' });
        setShowPass(false);
      } else {
        alert(data.error || t.error);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setPassLoading(false);
    }
  };
 
  // الاعتذار عن مهمة معيّنة — تعود للإدارة لتعيّنها لفني آخر
  const handleUnassign = async (requestId) => {
    const confirm = window.confirm(
      lang === 'ar'
        ? 'هل أنت متأكد أنك لن تتمكن من تنفيذ هذه المهمة؟ ستعود للإدارة لتعيّنها لفني آخر.'
        : 'Voulez-vous vraiment renoncer à cette mission ? Elle sera renvoyée à l\'administration pour être réassignée.'
    );
    if (!confirm) return;
    setUnassignLoading(true);
    try {
      const res = await fetch(`${apiUrl}/provider/requests/${requestId}/unassign`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(lang === 'ar' ? '✅ تم الاعتذار عن المهمة، وأُبلغت الإدارة' : '✅ Mission renvoyée, l\'administration a été notifiée');
        setJobDetail(null);
        resetVoicePlayerState();
        fetchMyJobs();
      } else {
        alert(data.error || t.error);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setUnassignLoading(false);
    }
  };
 
  const getStatusStyle = (status) => {
    const map = {
      assigned: { bg: '#fff3cd', color: '#856404' },
      on_the_way: { bg: '#d1ecf1', color: '#0c5460' },
      in_progress: { bg: '#ffe0b2', color: '#a35200' },
      completed: { bg: '#e2e3e5', color: '#383d41' }
    };
    return map[status] || { bg: '#f8f9fa', color: '#333' };
  };
 
  const STEPS = ['assigned', 'on_the_way', 'in_progress', 'completed'];
  const statusLabel = (st) => {
    const ar = { assigned: 'جديدة', on_the_way: 'في الطريق', in_progress: 'قيد العمل', completed: 'منتهية' };
    const fr = { assigned: 'Nouvelle', on_the_way: 'En route', in_progress: 'En cours', completed: 'Terminée' };
    return (lang === 'ar' ? ar : fr)[st] || st;
  };
 
  const activeJobs = myJobs.filter(j => j.status !== 'completed');
  const doneJobs = myJobs.filter(j => j.status === 'completed');
 
  const specialtyLabel = (key) => {
    if (key === 'plumber') return lang === 'ar' ? 'سباك' : 'Plombier';
    if (key === 'electrician') return lang === 'ar' ? 'كهربائي' : 'Électricien';
    return key;
  };
  const mySpecialties = (userData?.specialties ? String(userData.specialties).split(',') : [])
    .map(specialtyLabel).join(' / ');
 
  const renderStepper = (status) => {
    const idx = STEPS.indexOf(status);
    const labelsAr = ['تم التعيين', 'في الطريق', 'بدأ العمل', 'تم الإنهاء'];
    const labelsFr = ['Assignée', 'En route', 'Au travail', 'Terminée'];
    const labels = lang === 'ar' ? labelsAr : labelsFr;
    return (
      <div style={s.stepper}>
        {STEPS.map((st, i) => {
          const reached = i <= idx;
          const current = i === idx && status !== 'completed';
          return (
            <React.Fragment key={st}>
              {i > 0 && (
                <div style={{ ...s.stepLine, backgroundColor: i <= idx ? '#006400' : '#e0e0e0' }} />
              )}
              <div style={s.stepItem}>
                <div style={{
                  ...s.stepDot,
                  backgroundColor: reached ? '#006400' : '#e0e0e0',
                  color: reached ? '#fff' : '#999',
                  boxShadow: current ? '0 0 0 4px rgba(0,100,0,0.2)' : 'none'
                }}>
                  {i < idx || status === 'completed' ? '✓' : i + 1}
                </div>
                <span style={{ ...s.stepLabel, color: reached ? '#006400' : '#aaa', fontWeight: current ? 'bold' : 'normal' }}>
                  {labels[i]}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };
 
  const renderJobCard = (job) => {
    const st = getStatusStyle(job.status);
    return (
      <div key={job.id} style={s.requestCard} onClick={() => setJobDetail(job)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            {lang === 'ar' ? 'مهمة رقم' : 'Mission #'} {job.id}
          </span>
          <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>
            {statusLabel(job.status)}
          </span>
        </div>
 
        <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#666' }}>
          👤 {job.customer_name}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
          📍 {job.district}
        </p>
 
        {job.service_type && (
          <p style={{ margin: '5px 0 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#006400' }}>
            🔧 {job.service_type}
          </p>
        )}
 
        <p style={s.cardDate}>
          {new Date(job.assigned_at || job.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
        </p>
 
        {job.status === 'completed' && (
          <button
            style={{
              marginTop: '8px', padding: '6px 12px', background: 'none',
              border: '1px solid #dc3545', color: '#dc3545', borderRadius: '8px',
              fontSize: '0.8rem', cursor: 'pointer', width: '100%'
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
  };
 
  // ===================================================================
  // صفحة تفاصيل المهمة (بيانات الزبون) — صفحة كاملة منفصلة، مش مودال
  // ===================================================================
  if (jobDetail) {
    return (
      <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <main style={s.main}>
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <button style={s.backBtn} onClick={() => { setJobDetail(null); resetVoicePlayerState(); }}>
                {lang === 'ar' ? '→ رجوع' : '← Retour'}
              </button>
              <span style={s.modalBadge}>
                {lang === 'ar' ? 'مهمة رقم' : 'Mission #'} {jobDetail.id}
              </span>
            </div>
 
            {renderStepper(jobDetail.status)}
 
            {/* الصورة المرفقة مع الطلب */}
            {jobDetail.image_url && (
              <img
                src={jobDetail.image_url}
                alt="problem"
                style={s.modalImg}
                onClick={() => window.open(jobDetail.image_url, '_blank')}
              />
            )}
 
            {/* الوصف الصوتي — فقاعة بشكل واتساب */}
            {jobDetail.voice_note_url && (
              <div style={s.voiceBox}>
                <p style={s.voiceLabel}>🎙 {t.playVoice}</p>
                <div style={s.waBubble}>
                  <button style={s.waPlayBtn} onClick={toggleVoicePlayback}>
                    {voiceIsPlaying ? '⏸' : '▶️'}
                  </button>
                  <div style={s.waWaveTrack}>
                    <div style={{ ...s.waWaveFill, width: `${voiceProgress}%` }} />
                  </div>
                  <span style={s.waDuration}>
                    {formatVoiceDuration(voiceDuration)}
                  </span>
                  <audio
                    ref={voiceAudioRef}
                    src={jobDetail.voice_note_url}
                    onPlay={() => setVoiceIsPlaying(true)}
                    onPause={() => setVoiceIsPlaying(false)}
                    onEnded={() => { setVoiceIsPlaying(false); setVoiceProgress(0); }}
                    onLoadedMetadata={e => setVoiceDuration(e.target.duration)}
                    onTimeUpdate={e => setVoiceProgress((e.target.currentTime / e.target.duration) * 100 || 0)}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            )}
 
            {/* نوع الخدمة المطلوبة */}
            {jobDetail.service_type && (
              <div style={{ ...s.infoBox, backgroundColor: '#e8f5e9', border: '1px solid #006400' }}>
                <p style={{ ...s.infoLabel, color: '#006400', fontWeight: 'bold' }}>
                  {lang === 'ar' ? '🔧 نوع المشكلة:' : '🔧 Type de problème:'}
                </p>
                <p style={{ ...s.infoValue, fontWeight: 'bold', fontSize: '1rem' }}>
                  {jobDetail.service_type}
                </p>
              </div>
            )}
 
            {/* الوصف النصي */}
            {jobDetail.description && (
              <div style={s.infoBox}>
                <p style={s.infoLabel}>
                  {lang === 'ar' ? '📝 الوصف:' : '📝 Description:'}
                </p>
                <p style={s.infoValue}>{jobDetail.description}</p>
              </div>
            )}
 
            {/* بيانات الزبون */}
            <div style={{ ...s.infoBox, backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
              <p style={{ ...s.infoLabel, color: '#155724', fontWeight: 'bold' }}>
                {lang === 'ar' ? '👤 بيانات الزبون:' : '👤 Informations client:'}
              </p>
              <p style={s.infoValue}>{jobDetail.customer_name}</p>
              <a href={`tel:${jobDetail.customer_phone}`} style={s.callBtn}>
                📞 {jobDetail.customer_phone}
              </a>
              <p style={{ ...s.infoValue, marginTop: '8px' }}>
                📍 {jobDetail.district} — {jobDetail.address}
              </p>
 
              {/* صورة منزل الزبون */}
              {jobDetail.house_photo_url && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ ...s.infoLabel, marginBottom: '6px' }}>
                    🏠 {lang === 'ar' ? 'واجهة منزل الزبون:' : 'Façade de la maison:'}
                  </p>
                  <img
                    src={jobDetail.house_photo_url}
                    alt="house"
                    style={{
                      width: '100%', borderRadius: '12px',
                      maxHeight: '180px', objectFit: 'cover',
                      cursor: 'pointer', border: '2px solid #006400'
                    }}
                    onClick={() => window.open(jobDetail.house_photo_url, '_blank')}
                  />
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#888', textAlign: 'center' }}>
                    {lang === 'ar' ? '⚠️ تأكد من تطابق الواجهة قبل الدخول' : '⚠️ Vérifiez la façade avant d\'entrer'}
                  </p>
                </div>
              )}
 
              {/* زر الانطلاق بالملاحة */}
              {jobDetail.latitude && jobDetail.longitude && (
                <button
                  style={s.navBtnMap}
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${jobDetail.latitude},${jobDetail.longitude}&travelmode=driving`,
                      '_blank'
                    );
                  }}
                >
                  🗺️ {lang === 'ar' ? 'انطلق للزبون — ملاحة صوتية' : 'Naviguer vers le client'}
                </button>
              )}
            </div>
 
            {/* أزرار الإجراء — تتغير حسب مرحلة المهمة */}
            {jobDetail.status !== 'completed' ? (
              <>
                {(() => {
                  const cfg = {
                    assigned: { ar: '🚗 انطلقت إلى الزبون', fr: '🚗 Je pars chez le client', bg: '#1a73e8' },
                    on_the_way: { ar: '🔧 بدأت العمل', fr: '🔧 J\'ai commencé le travail', bg: '#ff8f00' },
                    in_progress: { ar: '✅ أنهيت المهمة', fr: '✅ J\'ai terminé la mission', bg: '#006400' }
                  }[jobDetail.status];
                  if (!cfg) return null;
                  return (
                    <button
                      style={{ ...s.btnAction, backgroundColor: cfg.bg, opacity: loading ? 0.7 : 1 }}
                      onClick={() => handleAdvance(jobDetail)}
                      disabled={loading}
                    >
                      {loading ? '...' : (lang === 'ar' ? cfg.ar : cfg.fr)}
                    </button>
                  );
                })()}
 
                {/* الاعتذار — ممكن فقط قبل بدء العمل */}
                {jobDetail.status !== 'in_progress' && (
                  <>
                    <button
                      style={{ ...s.btnUnassign, width: '100%', opacity: unassignLoading ? 0.7 : 1, marginTop: '10px' }}
                      onClick={() => handleUnassign(jobDetail.id)}
                      disabled={unassignLoading}
                    >
                      {unassignLoading
                        ? '...'
                        : (lang === 'ar' ? '⚠️ أعتذر عن المهمة' : '⚠️ Renoncer à la mission')}
                    </button>
                    <p style={s.unassignHint}>
                      {lang === 'ar'
                        ? 'سيعود الطلب للإدارة لتعيّنه لفني آخر، وسيتم إشعارها'
                        : 'La demande sera renvoyée à l\'administration pour être réassignée'}
                    </p>
                  </>
                )}
              </>
            ) : (
              <div style={{ ...s.completedBadge, marginTop: '10px' }}>
                ✅ {lang === 'ar' ? 'تم إنهاء هذه المهمة' : 'Mission terminée'}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
 
  return (
    <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 
      <main style={s.main}>
 
        {/* ===== مهامي (الجارية) ===== */}
        {activeTab === 'jobs' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <Logo size="sm" theme="dark" />
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <h2 style={s.screenTitle}>{t.myJobs}</h2>
              <p style={s.screenSub}>
                {lang === 'ar' ? `${activeJobs.length} مهمة جارية` : `${activeJobs.length} mission(s) en cours`}
              </p>
            </div>
 
            {activeJobs.length === 0 ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize: '3rem' }}>📭</span>
                <p style={{ color: '#888' }}>
                  {lang === 'ar' ? 'لا توجد مهام جارية. ستصلك المهام من الإدارة.' : 'Aucune mission en cours. L\'administration vous en assignera.'}
                </p>
              </div>
            ) : (
              activeJobs.map(renderJobCard)
            )}
          </div>
        )}
 
        {/* ===== المهام المنجزة ===== */}
        {activeTab === 'history' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <h2 style={s.screenTitle}>{lang === 'ar' ? 'المهام المنجزة' : 'Missions terminées'}</h2>
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>
 
            {doneJobs.length === 0 ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize: '3rem' }}>📋</span>
                <p style={{ color: '#888' }}>
                  {lang === 'ar' ? 'لا توجد مهام منجزة بعد' : 'Aucune mission terminée'}
                </p>
              </div>
            ) : (
              doneJobs.map(renderJobCard)
            )}
          </div>
        )}
                {/* ===== الراتب ===== */}
        {activeTab === 'salary' && (
          <div style={s.screen}>
            <div style={s.screenHeader}>
              <h2 style={s.screenTitle}>{lang === 'ar' ? 'راتبي' : 'Mon salaire'}</h2>
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
            </div>

            {salaryMonths.map(m => {
              const [y, mo] = m.month.split('-').map(Number);
              const monthName = new Date(y, mo - 1, 1).toLocaleDateString(
                lang === 'ar' ? 'ar-EG' : 'fr-FR', { month: 'long', year: 'numeric' }
              );
              return (
                <div
                  key={m.month}
                  style={{
                    ...s.requestCard,
                    cursor: 'default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: m.is_paid ? '1.5px solid #2e7d32' : '1.5px solid #ffc107',
                    backgroundColor: m.is_paid ? '#f1f8f2' : '#fffdf5'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{monthName}</p>
                    {m.is_paid && m.paid_at && (
                      <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#888' }}>
                        {lang === 'ar' ? 'صُرف في' : 'Payé le'} {new Date(m.paid_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 12px', borderRadius: '20px',
                    backgroundColor: m.is_paid ? '#2e7d32' : '#ffc107', color: m.is_paid ? '#fff' : '#333'
                  }}>
                    {m.is_paid
                      ? (lang === 'ar' ? '✅ تم الصرف' : '✅ Payé')
                      : (lang === 'ar' ? '⏳ لم يُصرف بعد' : '⏳ Pas encore payé')}
                  </span>
                </div>
              );
            })}

            <a href={`tel:+222${ADMIN_PHONE}`} style={s.adminCallBtn}>
              📞 {lang === 'ar' ? 'اتصل بالإدارة' : 'Appeler l\'administration'}
            </a>
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
                <span style={s.infoLabel}>{lang === 'ar' ? 'التخصص:' : 'Spécialité:'}</span>
                <span style={{ fontWeight: 'bold', color: '#006400' }}>
                  {mySpecialties || '-'}
                </span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>
                  {lang === 'ar' ? 'المهام المنجزة:' : 'Missions effectuées:'}
                </span>
                <span style={{ fontWeight: 'bold', color: '#006400' }}>
                  {doneJobs.length}
                </span>
              </div>
            </div>
 
            {/* الاتصال بالإدارة */}
            <a href={`tel:+222${ADMIN_PHONE}`} style={s.adminCallBtn}>
              📞 {lang === 'ar' ? 'اتصل بالإدارة' : 'Appeler l\'administration'}
            </a>
 
            {/* تغيير كلمة المرور */}
            <button style={s.btnOutline} onClick={() => setShowPass(!showPass)}>
              🔒 {showPass
                ? (lang === 'ar' ? 'إغلاق' : 'Fermer')
                : (lang === 'ar' ? 'تغيير كلمة المرور' : 'Changer le mot de passe')}
            </button>
 
            {showPass && (
              <div style={s.passBox}>
                <input
                  style={s.passInput}
                  type="password"
                  placeholder={lang === 'ar' ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}
                  value={passForm.current}
                  onChange={e => setPassForm({ ...passForm, current: e.target.value })}
                />
                <input
                  style={s.passInput}
                  type="password"
                  placeholder={lang === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                  value={passForm.next}
                  onChange={e => setPassForm({ ...passForm, next: e.target.value })}
                />
                <input
                  style={s.passInput}
                  type="password"
                  placeholder={lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirmer le nouveau mot de passe'}
                  value={passForm.confirm}
                  onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                />
                <button
                  style={{ ...s.btnSuccess, width: '100%', opacity: passLoading ? 0.7 : 1 }}
                  onClick={handleChangePassword}
                  disabled={passLoading}
                >
                  {passLoading ? '...' : (lang === 'ar' ? 'حفظ' : 'Enregistrer')}
                </button>
              </div>
            )}
 
            <button style={s.logoutBtn} onClick={onLogout}>{t.logout}</button>
          </div>
        )}
 
      </main>
 
      {/* شريط التنقل */}
      <nav style={s.bottomNav}>
        {[
          { id: 'jobs', label: t.myJobs, badge: activeJobs.length },
          { id: 'history', label: lang === 'ar' ? 'المنجزة' : 'Terminées', badge: 0 },
          { id: 'salary', label: lang === 'ar' ? 'راتبي' : 'Salaire', badge: 0 },
          { id: 'profile', label: t.myAccount, badge: 0 }
        ].map(tab => (
          <button
            key={tab.id}
            style={{ ...(activeTab === tab.id ? s.navActive : s.navBtn), position: 'relative' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.badge > 0 && <span style={s.navBadge}>{tab.badge}</span>}
            <NavIcon name={tab.id} />
            <span style={{ fontSize: '0.7rem' }}>{tab.label}</span>
          </button>
        ))}
      </nav>
 
    </div>
  );
}
const NavIcon = ({ name }) => {
  const p = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'jobs') return (<svg {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>);
  if (name === 'history') return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16 9.8" /></svg>);
  if (name === 'salary') return (<svg {...p}><rect x="3" y="6.5" width="18" height="11" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 10v.01M17.5 14v.01" /></svg>);
  return (<svg {...p}><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 20c.8-3.6 3.7-5.6 7.2-5.6s6.4 2 7.2 5.6" /></svg>);
};
 
const s = {
  container: {
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
    paddingBottom: 'calc(95px + env(safe-area-inset-bottom))'
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
  backBtn: {
    padding: '6px 14px',
    borderRadius: '10px',
    border: '1.5px solid #006400',
    background: '#fff',
    color: '#006400',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem'
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
  cardDate: {
    margin: '5px 0 0',
    fontSize: '0.75rem',
    color: '#999'
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
  // المودال (فقط للطلبات المتاحة قبل القبول)
  modalBadge: {
    background: '#e8f5e9',
    color: '#006400',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
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
  navBtnMap: {
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
  btnUnassign: {
    padding: '13px',
    backgroundColor: '#fff',
    color: '#b8860b',
    border: '1.5px solid #ffc107',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  unassignHint: {
    margin: '8px 0 0',
    fontSize: '0.75rem',
    color: '#999',
    textAlign: 'center',
    lineHeight: '1.4'
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
    height: 'calc(66px + env(safe-area-inset-bottom))',
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxSizing: 'border-box',
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
  stepper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: '#fff',
    borderRadius: '16px',
    padding: '16px 8px 12px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '62px'
  },
  stepDot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  },
  stepLine: {
    flex: 1,
    height: '3px',
    marginTop: '14px',
    borderRadius: '2px',
    minWidth: '10px'
  },
  stepLabel: {
    fontSize: '0.68rem',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  btnAction: {
    width: '100%',
    padding: '17px',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 'bold',
    fontSize: '1.05rem',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
  },
  adminCallBtn: {
    display: 'block',
    textAlign: 'center',
    textDecoration: 'none',
    padding: '14px',
    marginBottom: '12px',
    backgroundColor: '#e8f5e9',
    color: '#006400',
    border: '1.5px solid #006400',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  btnOutline: {
    width: '100%',
    padding: '13px',
    marginBottom: '12px',
    background: '#fff',
    color: '#333',
    border: '1.5px solid #ddd',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  passBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#fff',
    borderRadius: '14px',
    padding: '15px',
    marginBottom: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  passInput: {
    padding: '13px 15px',
    borderRadius: '12px',
    border: '1.5px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#fafafa',
    width: '100%',
    boxSizing: 'border-box'
  },
  navBadge: {
    position: 'absolute',
    top: '0',
    right: '30%',
    backgroundColor: '#dc3545',
    color: '#fff',
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
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
  },
  // ===== فقاعة تشغيل صوتي بشكل واتساب =====
  waBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: '#dcf8c6',
    borderRadius: '30px'
  },
  waPlayBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#006400',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    flexShrink: 0
  },
  waWaveTrack: {
    flex: 1,
    height: '4px',
    backgroundColor: 'rgba(0,100,0,0.25)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  waWaveFill: {
    height: '100%',
    backgroundColor: '#006400',
    borderRadius: '2px'
  },
  waDuration: {
    fontSize: '0.75rem',
    color: '#333',
    fontWeight: 'bold',
    minWidth: '38px',
    textAlign: 'center'
  }
};