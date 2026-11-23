import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../translations';
import Logo from '../Logo';
export default function CustomerScreen({ user, apiUrl, onLogout }) {
  const [lang, setLang] = useState('ar');
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(user);
  const [myRatings, setMyRatings] = useState({});
  const [visits, setVisits] = useState(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [profileLocationLoading, setProfileLocationLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  // بيانات الطلب الجديد
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [subStep, setSubStep] = useState(1);
  const [image, setImage] = useState(null);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState(1);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
 
  // بيانات الاشتراك
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [subProof, setSubProof] = useState(null);
 
  // ===== الاتصال الصوتي (Agora) =====
  const [callState, setCallState] = useState('idle'); // idle, calling, connected
  const [callChannel, setCallChannel] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const agoraClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const callPollRef = useRef(null);
  const callTimerRef = useRef(null);
  const ringElapsedRef = useRef(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const token = localStorage.getItem('userToken');
 
  // ===== ساعات العمل (8 صباحًا حتى 11 مساءً) =====
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // تحديث كل دقيقة
    return () => clearInterval(timer);
  }, []);
  const currentHour = now.getHours();
  const isWorkingNow = currentHour >= 8 && currentHour < 23;
 
  useEffect(() => {
    fetchUserData();
    fetchRequests();
    fetchMyRatings();
    fetchVisits();
    fetchPackages();
       const interval = setInterval(() => {
      if (document.hidden) return;
      fetchRequests();
      fetchVisits();
      fetchUserData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
 
  // تنظيف الاتصال عند إغلاق الصفحة
  // تنظيف الاتصال عند إغلاق الصفحة
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);
 
  // رنة الاتصال + تذكير صوتي بعد 10 ثوان
  useEffect(() => {
    if (callState === 'calling') {
      playRingTone();
      speechTimeoutRef.current = setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(
            lang === 'ar'
              ? 'لا تقطع المكالمة، سترد الإدارة الآن'
              : 'Ne raccrochez pas, l\'administration va répondre bientôt'
          );
          utterance.lang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
          window.speechSynthesis.speak(utterance);
        } catch (err) {}
      }, 10000);
    } else {
      stopRingTone();
      if (speechTimeoutRef.current) { clearTimeout(speechTimeoutRef.current); speechTimeoutRef.current = null; }
      try { window.speechSynthesis.cancel(); } catch (err) {}
    }
    return () => {
      if (speechTimeoutRef.current) { clearTimeout(speechTimeoutRef.current); speechTimeoutRef.current = null; }
    };
  }, [callState, lang]);
 
  const fetchUserData = async () => {
    try {
      const res = await fetch(`${apiUrl}/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUserData(await res.json());
    } catch (err) {}
  };
 
  const saveMyLocation = () => {
    setProfileLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const res = await fetch(`${apiUrl}/users/${user.id}/location`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          });
          if (res.ok) {
            alert(lang === 'ar' ? '✅ تم حفظ موقع منزلك بنجاح' : '✅ Position enregistrée');
            fetchUserData();
          }
        } catch (err) {
          alert(t.serverError);
        } finally {
          setProfileLocationLoading(false);
        }
      },
      err => {
        alert(lang === 'ar' ? 'فشل تحديد موقعك، يرجى السماح بالوصول للموقع' : 'Échec de localisation');
        setProfileLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };
 
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${apiUrl}/customer/requests/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRequests(await res.json());
    } catch (err) {}
  };
 
  // رصيد الزيارات
  const fetchVisits = async () => {
    try {
      const res = await fetch(`${apiUrl}/customers/${user.id}/visits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setVisits(await res.json());
    } catch (err) {}
  };

  // تقييماتي السابقة { رقم الطلب: عدد النجوم }
  const fetchMyRatings = async () => {
    try {
      const res = await fetch(`${apiUrl}/ratings/mine`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const rows = await res.json();
        const map = {};
        rows.forEach(r => { map[r.request_id] = r.stars; });
        setMyRatings(map);
      }
    } catch (err) {}
  };
  // تغيير كلمة المرور
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
  const handleSubmitRating = async () => {
    if (!ratingStars) {
      alert(lang === 'ar' ? 'اختر عدد النجوم أولاً' : 'Choisissez d\'abord le nombre d\'étoiles');
      return;
    }
    setRatingLoading(true);
    try {
      const res = await fetch(`${apiUrl}/requests/${selectedRequest.id}/rating`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: ratingStars, comment: ratingComment })
      });
      const data = await res.json();
      if (res.ok) {
        setMyRatings(prev => ({ ...prev, [selectedRequest.id]: ratingStars }));
        setRatingStars(0);
        setRatingComment('');
      } else {
        alert(data.error || t.error);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setRatingLoading(false);
    }
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
    if (!serviceType) {
      alert(lang === 'ar' ? 'يرجى تحديد نوع المشكلة' : 'Veuillez choisir le type de problème');
      return;
    }
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
      formData.append('service_type', serviceType);
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
        setServiceType('');
        setStep(1);
        setActiveTab('requests');
        fetchRequests();
        fetchVisits();
      } else if (data.error === 'open_request_exists') {
        alert(lang === 'ar'
          ? 'لديك طلب قيد التنفيذ. انتظر حتى ينتهي ثم أرسل طلباً جديداً.'
          : 'Vous avez déjà une demande en cours. Attendez qu\'elle soit terminée avant d\'en envoyer une nouvelle.');
      } else if (data.error === 'visits_exhausted') {
        alert(lang === 'ar'
          ? 'انتهى رصيد زياراتك. تواصل مع الإدارة لتجديد اشتراكك أو ترقيته.'
          : 'Votre solde de visites est épuisé. Contactez l\'administration pour renouveler ou changer de forfait.');
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
 
  // ===== منطق الاتصال الصوتي =====
  const formatCallDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
 
  const playRingTone = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const beep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 425;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => { try { osc.stop(); } catch (err) {} }, 1200);
      };
      beep();
      ringIntervalRef.current = setInterval(beep, 3000);
    } catch (err) {}
  };
 
  const stopRingTone = () => {
    if (ringIntervalRef.current) { clearInterval(ringIntervalRef.current); ringIntervalRef.current = null; }
  };
 
  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };
 
  const cleanupCall = async () => {
    stopRingTone();
    setIsMuted(false);
    if (callPollRef.current) { clearInterval(callPollRef.current); callPollRef.current = null; }
    if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
    if (localAudioTrackRef.current) {
      try { localAudioTrackRef.current.stop(); localAudioTrackRef.current.close(); } catch (err) {}
      localAudioTrackRef.current = null;
    }
    if (agoraClientRef.current) {
      try { await agoraClientRef.current.leave(); } catch (err) {}
      agoraClientRef.current = null;
    }
  };
 
  const endCall = async (silent) => {
    const channel = callChannel;
    await cleanupCall();
    setCallState('idle');
    setCallDuration(0);
    setCallChannel(null);
    ringElapsedRef.current = 0;
    if (channel) {
      try {
        await fetch(`${apiUrl}/calls/${channel}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {}
    }
    if (!silent) return;
  };
 
 const startCall = async () => {
    if (callState !== 'idle') return; // منع بدء مكالمة ثانية أثناء وجود مكالمة شغالة
    if (!isSubscribed) {
      alert(lang === 'ar' ? 'يجب الاشتراك أولاً' : 'Abonnement requis');
      setActiveTab('subscription');
      return;
    }
    setCallState('calling');
    ringElapsedRef.current = 0;
    try {
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      const startRes = await fetch(`${apiUrl}/calls/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const startData = await startRes.json();
      if (!startRes.ok) {
        alert(startData.error || t.serverError);
        setCallState('idle');
        return;
      }
      const channelName = startData.channelName;
      setCallChannel(channelName);
 
      const tokenRes = await fetch(`${apiUrl}/agora/token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        alert(tokenData.error || t.serverError);
        setCallState('idle');
        return;
      }
 
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;
 
      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'audio') remoteUser.audioTrack.play();
      });
 
      await client.join(tokenData.appId, channelName, tokenData.token, tokenData.uid);
      const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
  AEC: true, // إلغاء الصدى
  ANS: true, // إلغاء الضجيج
  AGC: true, // ضبط مستوى الصوت تلقائيًا
  encoderConfig: 'high_quality' // جودة صوت أعلى بكثير من الإعداد الافتراضي (128kbps بدل 18kbps) — تقارب مكالمات واتساب
});
      localAudioTrackRef.current = micTrack;
      await client.publish([micTrack]);
 
      // استطلاع دوري لمعرفة هل ردت الإدارة
      callPollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${apiUrl}/calls/${channelName}/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) return;
          const data = await res.json();
          if (data.status === 'answered') {
            clearInterval(callPollRef.current);
            callPollRef.current = null;
            setCallState('connected');
            callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
          } else if (data.status === 'ended') {
            clearInterval(callPollRef.current);
            callPollRef.current = null;
            await cleanupCall();
            setCallState('idle');
            setCallChannel(null);
            alert(lang === 'ar' ? 'أنهت الإدارة المكالمة' : 'L\'administration a raccroché');
          } else {
            ringElapsedRef.current += 2;
            if (ringElapsedRef.current >= 45) {
              clearInterval(callPollRef.current);
              callPollRef.current = null;
              endCall();
              alert(lang === 'ar'
                ? 'لم يتمكن أحد من الرد الآن، يرجى المحاولة لاحقاً'
                : 'Personne n\'a répondu, veuillez réessayer plus tard');
            }
          }
        } catch (err) {}
      }, 2000);
 
    } catch (err) {
      alert(lang === 'ar'
        ? 'يرجى السماح بالوصول للميكروفون'
        : 'Veuillez autoriser le microphone');
      await cleanupCall();
      setCallState('idle');
      setCallChannel(null);
    }
  };
 
  const getDaysLeft = () => {
    if (!userData?.subscription_end_date) return 0;
    const diff = new Date(userData.subscription_end_date) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
 
  const visitsExhausted = !!(visits && visits.total != null && visits.used >= visits.total);
  const isSubscribed = userData?.package_id && getDaysLeft() > 0 && !visitsExhausted;
 
  const getStatusStyle = (status) => {
    const map = {
      pending_admin: { bg: '#fff3cd', color: '#856404' },
      assigned: { bg: '#d4edda', color: '#155724' },
      on_the_way: { bg: '#d1ecf1', color: '#0c5460' },
      in_progress: { bg: '#ffe0b2', color: '#a35200' },
      completed: { bg: '#e2e3e5', color: '#383d41' }
    };
    return map[status] || { bg: '#f8f9fa', color: '#333' };
  };

  // ترجمة أسماء الباقات وخدماتها عند التبديل للفرنسية (القيم الأصلية في القاعدة تبقى بالعربية)
  const PKG_FR = {
    'السلامة': 'Sécurité',
    'البيت المعمور': 'Maison Prospère',
    'راحة البال': 'Tranquillité'
  };
  const ITEM_FR = {
    'إصلاح انقطاع الكهرباء ومشاكل التمديدات': 'Réparation de coupure d\'électricité et problèmes de câblage',
    'إصلاح الأضواء والمفاتيح': 'Réparation des lampes et interrupteurs',
    'إصلاح Stabilisateur': 'Réparation du stabilisateur',
    'إصلاح المكيف': 'Réparation de la climatisation',
        'إصلاح المروحة': 'Réparation du ventilateur',
    'إصلاح التيو': 'Réparation des tuyaux',
    'إصلاح الرباين ورباين الدوش والمطبخ': 'Réparation des robinets (douche et cuisine)',
    'إصلاح تسرب Lavabo': 'Réparation de fuite de lavabo',
    'إصلاح مضخة المياه': 'Réparation de la pompe à eau',
    'إصلاح السبرسير': 'Réparation du surpresseur',
    'إصلاح الثلاجة': 'Réparation du réfrigérateur',
    'إصلاح مسخن المياه': 'Réparation du chauffage de eau',
    'إصلاح التلفاز': 'Réparation de la télévision',
    'إصلاح مفاتيح الأبواب': 'Réparation des serrures de porte',
    'أولوية قصوى في الاستجابة': 'Priorité maximale de réponse'
  };
  const pkgName = (name) => (lang === 'fr' && PKG_FR[name]) ? PKG_FR[name] : name;
  const itemText = (item) => {
    const k = String(item).trim();
    return (lang === 'fr' && ITEM_FR[k]) ? ITEM_FR[k] : k;
  };

  const statusLabel = (status) => {
    const ar = {
      pending_admin: 'قيد المراجعة',
      assigned: 'تم تعيين فني',
      on_the_way: 'الفني في الطريق إليك',
      in_progress: 'الفني يعمل الآن',
      completed: 'تم إنجاز الطلب'
    };
    const fr = {
      pending_admin: 'En cours de traitement',
      assigned: 'Technicien assigné',
      on_the_way: 'Le technicien est en route',
      in_progress: 'Intervention en cours',
      completed: 'Mission terminée'
    };
    return (lang === 'ar' ? ar : fr)[status] || status;
  };

  // مراحل الطلب بعد التعيين
  const TRACK_STEPS = ['assigned', 'on_the_way', 'in_progress', 'completed'];
  const renderTracker = (status) => {
    const idx = TRACK_STEPS.indexOf(status);
    if (idx === -1) return null;
    const labels = lang === 'ar'
      ? ['تم التعيين', 'في الطريق', 'بدأ العمل', 'تم الإنجاز']
      : ['Assigné', 'En route', 'Au travail', 'Terminé'];
    return (
      <div style={s.tracker}>
        {TRACK_STEPS.map((st, i) => {
          const reached = i <= idx;
          const current = i === idx && status !== 'completed';
          return (
            <React.Fragment key={st}>
              {i > 0 && <div style={{ ...s.trackLine, backgroundColor: i <= idx ? '#006400' : '#e0e0e0' }} />}
              <div style={s.trackItem}>
                <div style={{
                  ...s.trackDot,
                  backgroundColor: reached ? '#006400' : '#e0e0e0',
                  color: reached ? '#fff' : '#999',
                  boxShadow: current ? '0 0 0 4px rgba(0,100,0,0.2)' : 'none'
                }}>
                  {i < idx || status === 'completed' ? '✓' : i + 1}
                </div>
                <span style={{ ...s.trackLabel, color: reached ? '#006400' : '#aaa', fontWeight: current ? 'bold' : 'normal' }}>
                  {labels[i]}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const fmtTime = (ts) => ts
    ? new Date(ts).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;
 
  return (
    <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 
       {/* ===== شاشة المكالمة ===== */}
      {callState !== 'idle' && (
        <div style={s.callOverlay}>
          <div style={s.callCard}>
            <div style={s.callAvatar}>📞</div>
            <p style={s.callName}>
              {lang === 'ar' ? 'الإدارة' : 'Administration'}
            </p>
            <p style={s.callStatus}>
              {callState === 'calling'
                ? (lang === 'ar' ? 'جاري الاتصال...' : 'Appel en cours...')
                : formatCallDuration(callDuration)}
            </p>
            {callState === 'calling' && (
              <div style={s.pulseDot} />
            )}
 
            <div style={s.callControlsRow}>
              <div style={s.circleBtnWrap}>
                <button
                  style={isMuted ? s.muteCircleBtnActive : s.muteCircleBtn}
                  onClick={toggleMute}
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
                <span style={s.controlLabel}>
                  {isMuted ? (lang === 'ar' ? 'إلغاء الكتم' : 'Activer') : (lang === 'ar' ? 'كتم' : 'Muet')}
                </span>
              </div>
 
              <div style={s.circleBtnWrap}>
                <button style={s.endCallCircleBtn} onClick={() => endCall()}>
                  📵
                </button>
                <span style={s.controlLabel}>
                  {lang === 'ar' ? 'إنهاء' : 'Terminer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
     
 
      {/* المحتوى الرئيسي */}
      <main style={s.main}>
 
        {/* ===== الرئيسية ===== */}
        {activeTab === 'home' && (
          <div style={s.screen}>
            {/* الرأسية */}
            <div style={s.homeHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo size="sm" theme="light" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
                       {lang === 'ar' ? 'FR' : 'AR'}
                  </button>
              </div>
                           </div>
                      {/* اسم الزبون تحت الشعار */}
                 <div style={{ marginTop: '12px' }}>
                             <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{t.welcomeBack}</p>
                       <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{userData?.full_name}</h2>
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
                      {pkgName(userData?.package_name)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#006400' }}>{getDaysLeft()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>
                      {lang === 'ar' ? 'يوم متبقي' : 'jours restants'}
                    </div>
                  </div>
                </div>

                {/* عدّاد الزيارات */}
                {visits && visits.total != null && (() => {
                  const left = visits.remaining;
                  const pct = Math.min(100, Math.round((visits.used / visits.total) * 100));
                  const col = left <= 0 ? '#dc3545' : (left <= 2 ? '#e65100' : '#006400');
                  return (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #9ccc9c' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#155724' }}>
                          🛠️ {lang === 'ar' ? 'رصيد الزيارات' : 'Solde de visites'}
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: '900', color: col }}>
                          {lang === 'ar' ? `تبقّى ${left} من ${visits.total}` : `Reste ${left} sur ${visits.total}`}
                        </span>
                      </div>
                      <div style={{ height: '10px', borderRadius: '6px', background: '#c8e6c9', overflow: 'hidden', direction: 'ltr' }}>
                        <div style={{ width: `${100 - pct}%`, height: '100%', background: col, borderRadius: '6px', transition: 'width 0.4s ease' }} />
                      </div>
                      {left <= 2 && (
                        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: col, fontWeight: 'bold' }}>
                          {left <= 0
                            ? (lang === 'ar' ? 'انتهى رصيدك — تواصل مع الإدارة للتجديد أو الترقية' : 'Solde épuisé — contactez l\'administration')
                            : (lang === 'ar' ? 'رصيدك على وشك النفاد' : 'Votre solde est bientôt épuisé')}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div style={s.subWarningCard} onClick={() => setActiveTab('subscription')}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
                    {userData?.subscription_pending
                      ? t.subscriptionPending
                      : (userData?.package_id
                          ? (visitsExhausted
                              ? (lang === 'ar' ? 'استنفدت جميع زياراتك' : 'Vous avez utilisé toutes vos visites')
                              : t.subscriptionExpired)
                          : (lang === 'ar' ? 'لم تشترك في أي باقة بعد' : 'Vous n\'avez pas encore d\'abonnement'))}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#856404' }}>
                    {userData?.subscription_pending
                      ? t.subscriptionPendingDesc
                      : (userData?.package_id
                          ? (lang === 'ar' ? 'اضغط هنا لتجديد اشتراكك' : 'Appuyez pour renouveler')
                          : (lang === 'ar' ? 'اضغط هنا لاختيار باقتك' : 'Appuyez pour choisir un forfait'))}
                  </p>
                </div>
              </div>
            )}
 
            {/* زر الاتصال بالإدارة */}
            <button
              style={{ ...s.requestBtn, opacity: isSubscribed ? 1 : 0.6 }}
              onClick={startCall}
            >
              <span style={{ fontSize: '2rem' }}>📞</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {lang === 'ar' ? 'اتصل بالإدارة' : 'Appeler l\'administration'}
              </span>
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {lang === 'ar' ? 'اطلب الخدمة مباشرة بصوتك' : 'Demander le service directement'}
              </span>
            </button>
 
            {/* مؤشر ساعات العمل — معلوماتي فقط، لا يمنع الاتصال */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginBottom: '20px', marginTop: '-10px',
              fontSize: '0.8rem', color: isWorkingNow ? '#006400' : '#888',
              flexWrap: 'wrap', textAlign: 'center'
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: isWorkingNow ? '#28a745' : '#dc3545',
                display: 'inline-block', flexShrink: 0
              }} />
              <span>
                {isWorkingNow
                  ? (lang === 'ar' ? 'نحن متاحون الآن' : 'Nous sommes disponibles')
                  : (lang === 'ar' ? 'خارج أوقات العمل حاليًا' : 'Actuellement fermé')}
                {' · '}
                {lang === 'ar' ? 'ساعات العمل: 8 صباحًا – 11 مساءً' : 'Horaires : 8h – 23h'}
              </span>
            </div>
 
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
                          {statusLabel(r.status)}
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
              {/* نوع المشكلة — إجباري */}
              <div>
                <label style={s.fieldLabel}>
                  {lang === 'ar' ? '🔧 نوع المشكلة *' : '🔧 Type de problème *'}
                </label>
                <select
                  style={s.selectInput}
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                >
                  <option value="">
                    {lang === 'ar' ? '-- اختر نوع المشكلة --' : '-- Choisir le type --'}
                  </option>
                  {(() => {
                    const myPackage = packages.find(p => p.id === userData?.package_id);
                    const items = myPackage?.coverage_items
                      ? myPackage.coverage_items
                          .split('|')
                          .filter(item => item.trim() !== 'أولوية قصوى في الاستجابة')
                      : [];
                    return items.map((item, i) => (
                      <option key={i} value={item.trim()}>{itemText(item)}</option>
                    ));
                  })()}
                </select>
              </div>
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
                        {statusLabel(r.status)}
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
                    {r.status === 'completed' && r.provider_name && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: myRatings[r.id] ? '#f5a623' : '#006400', fontWeight: 'bold' }}>
                        {myRatings[r.id]
                          ? '★'.repeat(myRatings[r.id]) + '☆'.repeat(5 - myRatings[r.id])
                          : (lang === 'ar' ? '⭐ قيّم الفني' : '⭐ Notez le technicien')}
                      </p>
                    )}
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
                    {statusLabel(selectedRequest.status)}
                  </p>
                </div>
              );
            })()}
 
            {/* مراحل الطلب */}
            {renderTracker(selectedRequest.status)}

            {/* أوقات المراحل */}
            {(selectedRequest.on_the_way_at || selectedRequest.started_at || selectedRequest.completed_at) && (
              <div style={s.infoBox}>
                {selectedRequest.on_the_way_at && (
                  <p style={s.timeRow}>🚗 {lang === 'ar' ? 'انطلق الفني' : 'Départ du technicien'}: <b>{fmtTime(selectedRequest.on_the_way_at)}</b></p>
                )}
                {selectedRequest.started_at && (
                  <p style={s.timeRow}>🔧 {lang === 'ar' ? 'بدأ العمل' : 'Début du travail'}: <b>{fmtTime(selectedRequest.started_at)}</b></p>
                )}
                {selectedRequest.completed_at && (
                  <p style={s.timeRow}>✅ {lang === 'ar' ? 'تم الإنجاز' : 'Terminé'}: <b>{fmtTime(selectedRequest.completed_at)}</b></p>
                )}
              </div>
            )}

            {/* الصورة */}
            {selectedRequest.image_url && (
              <img
                src={selectedRequest.image_url}
                alt="problem"
                style={{ width: '100%', borderRadius: '16px', marginBottom: '15px', maxHeight: '200px', objectFit: 'cover' }}
              />
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
 
            {/* تقييم الفني بعد انتهاء المهمة */}
            {selectedRequest.status === 'completed' && selectedRequest.provider_name && (
              <div style={s.ratingBox}>
                {myRatings[selectedRequest.id] ? (
                  <>
                    <p style={s.ratingTitle}>
                      {lang === 'ar' ? 'شكراً لتقييمك 🌟' : 'Merci pour votre avis 🌟'}
                    </p>
                    <div style={s.starsRow}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} style={{ ...s.star, color: n <= myRatings[selectedRequest.id] ? '#f5a623' : '#ddd', cursor: 'default' }}>★</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p style={s.ratingTitle}>
                      {lang === 'ar' ? 'كيف كانت خدمة الفني؟' : 'Comment était le service ?'}
                    </p>
                    <div style={s.starsRow}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span
                          key={n}
                          style={{ ...s.star, color: n <= ratingStars ? '#f5a623' : '#ddd' }}
                          onClick={() => setRatingStars(n)}
                        >★</span>
                      ))}
                    </div>
                    <textarea
                      style={{ ...s.textarea, height: '70px', marginTop: '10px' }}
                      placeholder={lang === 'ar' ? 'تعليق (اختياري)' : 'Commentaire (facultatif)'}
                      value={ratingComment}
                      onChange={e => setRatingComment(e.target.value)}
                    />
                    <button
                      style={{ ...s.btnPrimary, marginTop: '10px', opacity: ratingLoading ? 0.7 : 1 }}
                      onClick={handleSubmitRating}
                      disabled={ratingLoading}
                    >
                      {ratingLoading ? '...' : (lang === 'ar' ? 'إرسال التقييم' : 'Envoyer l\'avis')}
                    </button>
                  </>
                )}
              </div>
            )}

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
                  {pkgName(userData?.package_name)}
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
                      {pkgName(userData.package_name)}
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
{(() => {
  const money = n => Number(n).toLocaleString('en-US');
  const cur = 'MRU';
  const sorted = [...packages].sort((a, b) => b.price - a.price);
  const target = sorted[0];   // الباقة الأعلى = المستهدفة
  const neighbor = sorted[1]; // الباقة المجاورة لها (للمقارنة)

  const packageStyles = {
    'راحة البال': { color: '#fff8e1', border: '#f59e0b', icon: '🥇' },
    'البيت المعمور': { color: '#f7f8fa', border: '#9aa5b1', icon: '🥈' },
    'السلامة': { color: '#f0fff4', border: '#22c55e', icon: '🥉' }
  };

  const parseItems = (coverage) => {
    if (Array.isArray(coverage)) return coverage;
    if (typeof coverage === 'string') {
      const value = coverage.trim();
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return value.split('|').map(i => i.trim()).filter(Boolean);
    }
    return [];
  };

  return sorted.map(pkg => {
    const isTarget = target && pkg.id === target.id;
    const isDecoy = neighbor && pkg.id === neighbor.id;
    const ps = packageStyles[pkg.name] || { color: '#f5f5f5', border: '#999', icon: '📦' };
    const months = pkg.duration_months || 4;
    const total = pkg.price * months;
    const visits = pkg.visits_total;
    const perVisit = visits ? Math.round(total / visits) : null;
    const items = parseItems(pkg.coverage_items);
    const badge = isTarget
      ? (lang === 'ar' ? '🏆 الأوفر قيمة' : '🏆 Meilleur rapport qualité-prix')
      : (!isDecoy ? (lang === 'ar' ? '✅ للبداية' : '✅ Pour commencer') : '');

    return (
      <div
        key={pkg.id}
        style={{
          border: `${isTarget ? 3 : 2}px solid ${ps.border}`,
          borderRadius: '20px',
          marginBottom: '22px',
          marginTop: '18px',
          boxShadow: isTarget ? `0 8px 26px ${ps.border}55` : '0 3px 12px rgba(0,0,0,0.06)',
          backgroundColor: ps.color,
          position: 'relative',
          opacity: isDecoy ? 0.95 : 1
        }}
      >
        {badge && (
          <div style={{
            position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: ps.border, color: '#fff', padding: '5px 18px', borderRadius: '20px',
            fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap',
            boxShadow: `0 3px 10px ${ps.border}66`
          }}>
            {badge}
          </div>
        )}

        {/* الاسم والسعر الإجمالي */}
        <div style={{ padding: '24px 20px 14px', borderBottom: `2px solid ${ps.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2.2rem' }}>{ps.icon}</span>
            <p style={{ margin: 0, fontWeight: '900', fontSize: '1.25rem', color: ps.border }}>{pkgName(pkg.name)}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: '900', color: '#222', lineHeight: 1 }}>{money(total)}</span>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{cur}</span>
            <span style={{ fontSize: '0.85rem', color: '#777' }}>
              {lang === 'ar' ? `· لمدة ${months} أشهر (فصل كامل)` : `· pour ${months} mois (une saison)`}
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#888' }}>
            {money(pkg.price)} {cur} / {lang === 'ar' ? 'شهر' : 'mois'}
          </p>
        </div>

        {/* الزيارات وسعر الزيارة */}
        {visits ? (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', gap: '10px',
            backgroundColor: isTarget ? '#e8f5e9' : 'transparent',
            borderBottom: `1px dashed ${ps.border}`
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#333' }}>
                🛠️ {visits} {lang === 'ar' ? 'زيارة' : 'visites'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#888' }}>
                {lang === 'ar' ? 'رصيد للمدة كلها، تستخدمه متى شئت' : 'Solde pour toute la durée'}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: isTarget ? '1.7rem' : '1.05rem',
                fontWeight: '900',
                color: isTarget ? '#1b8a3a' : '#999',
                lineHeight: 1
              }}>
                {money(perVisit)}
              </div>
              <div style={{ fontSize: '0.72rem', color: isTarget ? '#1b8a3a' : '#aaa', marginTop: '3px' }}>
                {cur} / {lang === 'ar' ? 'للزيارة' : 'visite'}
              </div>
            </div>
          </div>
        ) : null}

        {/* الخدمات المشمولة */}
        <div style={{ padding: '15px 20px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>
            {lang === 'ar' ? 'الخدمات المشمولة' : 'Services inclus'}
          </p>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: ps.border, fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: '0.88rem', color: '#444', lineHeight: '1.5' }}>{itemText(item)}</span>
            </div>
          ))}
          {items.length === 0 && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#777', textAlign: 'center' }}>
              {lang === 'ar' ? 'لا توجد تفاصيل متاحة لهذه الباقة حالياً.' : 'Aucun détail disponible pour le moment.'}
            </p>
          )}

          <div style={{
            marginTop: '12px', padding: '10px 12px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px',
            fontSize: '0.78rem', color: '#777', textAlign: 'center', borderTop: `1px dashed ${ps.border}`
          }}>
            ⚠️ {lang === 'ar'
              ? 'الخدمة تشمل اليد العاملة فقط — قطع الغيار على عاتق الزبون'
              : "Main d'œuvre uniquement — pièces à la charge du client"}
          </div>
        </div>

        {/* زر الاختيار */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            style={{
              width: '100%', padding: isTarget ? '16px' : '13px',
              backgroundColor: isDecoy ? '#fff' : ps.border,
              color: isDecoy ? ps.border : '#fff',
              border: isDecoy ? `1.5px solid ${ps.border}` : 'none',
              borderRadius: '12px', fontWeight: 'bold',
              fontSize: isTarget ? '1.1rem' : '1rem', cursor: 'pointer'
            }}
            onClick={() => { setSelectedPackage(pkg.id); setSubStep(2); }}
          >
            {lang === 'ar' ? 'اختر هذه الباقة ←' : 'Choisir ce forfait →'}
          </button>
        </div>
      </div>
    );
  });
})()}
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
                    'راحة البال': { border: '#f59e0b', icon: '🥇' },
                    'البيت المعمور': { border: '#6b7785', icon: '🥈' },
                    'السلامة': { border: '#22c55e', icon: '🥉' }
                  };
                  const ps = pkgStyles[selectedPkg?.name] || { border: '#006400', icon: '📦' };
                  const months = selectedPkg?.duration_months || 4;
                  const total = selectedPkg ? selectedPkg.price * months : null;
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
                            {pkgName(selectedPkg?.name) || '-'}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.7rem', fontWeight: '900' }}>
                          {total ? total.toLocaleString('en-US') : '-'}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          {lang === 'ar' ? `MRU · ${months} أشهر` : `MRU · ${months} mois`}
                        </div>
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
                <span style={s.infoValue}>{pkgName(userData?.package_name) || '-'}</span>
              </div>
            </div>
 
            {/* موقع المنزل */}
            <div style={{
              ...s.infoBox,
              backgroundColor: userData?.last_latitude ? '#f0fff0' : '#fffbf0',
              border: `1.5px solid ${userData?.last_latitude ? '#28a745' : '#ffc107'}`,
              marginBottom: '20px'
            }}>
              <p style={{ ...s.infoLabel, fontWeight: 'bold', marginBottom: '8px' }}>
                📍 {lang === 'ar' ? 'موقع المنزل' : 'Position du domicile'}
              </p>
              {userData?.last_latitude ? (
                <p style={{ margin: '0 0 8px', color: '#28a745', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  ✅ {lang === 'ar' ? 'محدد' : 'Défini'}
                  {userData?.location_updated_at && (
                    <span style={{ fontWeight: 'normal', color: '#888' }}>
                      {' '}({new Date(userData.location_updated_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')})
                    </span>
                  )}
                </p>
              ) : (
                <p style={{ margin: '0 0 8px', color: '#856404', fontSize: '0.85rem' }}>
                  ⚠️ {lang === 'ar' ? 'لم تحدد موقع منزلك بعد' : 'Position non définie'}
                </p>
              )}
              <button
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#006400',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: profileLocationLoading ? 'not-allowed' : 'pointer',
                  width: '100%'
                }}
                onClick={saveMyLocation}
                disabled={profileLocationLoading}
              >
                {profileLocationLoading
                  ? (lang === 'ar' ? '⏳ جاري التحديد...' : '⏳ Localisation...')
                  : (userData?.last_latitude
                      ? (lang === 'ar' ? '📍 تحديث الموقع' : '📍 Mettre à jour')
                      : (lang === 'ar' ? '📍 تحديد موقع المنزل الآن' : '📍 Définir maintenant'))}
              </button>
            </div>
 
                      {/* تغيير كلمة المرور */}
            <button
              style={{ ...s.logoutBtn, color: '#006400', borderColor: '#006400', marginBottom: '10px' }}
              onClick={() => setShowPass(!showPass)}
            >
              🔒 {showPass
                ? (lang === 'ar' ? 'إغلاق' : 'Fermer')
                : (lang === 'ar' ? 'تغيير كلمة المرور' : 'Changer le mot de passe')}
            </button>

            {showPass && (
              <div style={{ ...s.infoBox, marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'current', ar: 'كلمة المرور الحالية', fr: 'Mot de passe actuel' },
                  { key: 'next', ar: 'كلمة المرور الجديدة', fr: 'Nouveau mot de passe' },
                  { key: 'confirm', ar: 'تأكيد كلمة المرور الجديدة', fr: 'Confirmer le nouveau mot de passe' }
                ].map(f => (
                  <input
                    key={f.key}
                    type="password"
                    placeholder={lang === 'ar' ? f.ar : f.fr}
                    value={passForm[f.key]}
                    onChange={e => setPassForm({ ...passForm, [f.key]: e.target.value })}
                    style={{
                      padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #ddd',
                      fontSize: '1rem', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff'
                    }}
                  />
                ))}
                <button
                  style={{
                    padding: '12px', backgroundColor: '#006400', color: '#fff', border: 'none',
                    borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%',
                    opacity: passLoading ? 0.7 : 1
                  }}
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
 
      {/* شريط التنقل السفلي */}
      <nav style={s.bottomNav}>
        {[
          { id: 'home', label: t.home },
          { id: 'requests', label: t.myRequests },
          { id: 'subscription', label: t.subscription },
          { id: 'profile', label: t.myAccount }
        ].map(tab => (
          <button
            key={tab.id}
            style={activeTab === tab.id || (activeTab === 'newRequest' && tab.id === 'home') || (activeTab === 'requestDetail' && tab.id === 'requests')
              ? s.navActive : s.navBtn}
            onClick={() => setActiveTab(tab.id)}
          >
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
  if (name === 'home') return (<svg {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></svg>);
  if (name === 'requests') return (<svg {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M8.5 10h7M8.5 14h7M8.5 18h4" /></svg>);
  if (name === 'subscription') return (<svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><path d="M7 15h4" /></svg>);
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
  ratingBox: {
    background: '#fffaf0',
    border: '1.5px solid #f5a623',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    textAlign: 'center'
  },
  ratingTitle: {
    margin: '0 0 8px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1rem'
  },
  starsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    direction: 'ltr'
  },
  star: {
    fontSize: '2.6rem',
    lineHeight: 1,
    cursor: 'pointer',
    userSelect: 'none'
  },
  tracker: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: '#fff',
    borderRadius: '16px',
    padding: '16px 8px 12px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  trackItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '62px'
  },
  trackDot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  trackLine: {
    flex: 1,
    height: '3px',
    marginTop: '14px',
    borderRadius: '2px',
    minWidth: '10px'
  },
  trackLabel: {
    fontSize: '0.68rem',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  timeRow: {
    margin: '4px 0',
    fontSize: '0.85rem',
    color: '#555'
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
  selectInput: {
    width: '100%',
    padding: '13px',
    borderRadius: '12px',
    border: '1.5px solid #ddd',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fafafa',
    color: '#333'
  },
  fieldLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#444',
    marginBottom: '6px',
    display: 'block'
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
  // ===== شاشة المكالمة =====
  callOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,20,0,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000
  },
  callCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '30px'
  },
  callAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#006400',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    marginBottom: '10px'
  },
  callName: {
    color: '#fff',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: 0
  },
  callStatus: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '1rem',
    margin: 0
  },
  pulseDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ffc107',
    marginTop: '5px',
    animationName: 'pulse',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate'
  },
  callControlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '40px'
  },
  circleBtnWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  muteCircleBtn: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  muteCircleBtnActive: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#fff',
    color: '#dc3545',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  endCallCircleBtn: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: '1.8rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(220,53,69,0.5)'
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.75rem'
  }
};