import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../translations';
 
export default function AdminScreen({ user, apiUrl, onLogout }) {
  const [lang, setLang] = useState('ar');
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('pending');
  const [subscriptions, setSubscriptions] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  // البيانات
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // البحث برمز العميل
  const [clientCode, setClientCode] = useState('');
  const [clientResult, setClientResult] = useState(null);
  const [clientError, setClientError] = useState('');
 
  // التسعير
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
 
  // فلتر الطلبات
  const [statusFilter, setStatusFilter] = useState('all');
 
  // إنشاء طلب لزبون متصل
  const [callCode, setCallCode] = useState('');
  const [callCustomer, setCallCustomer] = useState(null);
  const [callSearchError, setCallSearchError] = useState('');
  const [callServiceType, setCallServiceType] = useState('');
  const [callPrice, setCallPrice] = useState('');
  const [callDescription, setCallDescription] = useState('');
  const [callCreateLoading, setCallCreateLoading] = useState(false);
  const [callVoiceBlob, setCallVoiceBlob] = useState(null);
  const [callVoiceUrl, setCallVoiceUrl] = useState(null);
  const [callIsRecording, setCallIsRecording] = useState(false);
  const [callRecordSeconds, setCallRecordSeconds] = useState(0);
  const [callIsPlaying, setCallIsPlaying] = useState(false);
  const [callPlaybackProgress, setCallPlaybackProgress] = useState(0);
  const [callPlaybackDuration, setCallPlaybackDuration] = useState(0);
  const callMediaRecorderRef = useRef(null);
  const callChunksRef = useRef([]);
  const callRecordTimerRef = useRef(null);
  const callAudioRef = useRef(null);
 
  // ===== المكالمات الواردة (Agora) =====
  const [incomingCall, setIncomingCall] = useState(null); // { channelName, customerName }
  const [callState, setCallState] = useState('idle'); // idle, ringing, connected
  const [callDuration, setCallDuration] = useState(0);
  const agoraClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const callTimerRef = useRef(null);
 const incomingPollRef = useRef(null);
  const callStateRef = useRef('idle');
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);
 
  useEffect(() => { callStateRef.current = callState; }, [callState]);
 
  const token = localStorage.getItem('userToken');
 
  useEffect(() => {
    fetchPendingRequests();
    fetchAllRequests();
    fetchUsers();
    fetchEarnings();
    fetchSubscriptions();
    const interval = setInterval(() => {
      fetchPendingRequests();
      fetchAllRequests();
      fetchSubscriptions();
    }, 20000);
    return () => clearInterval(interval);
  }, []);
 
 
  // استطلاع المكالمات الواردة كل 3 ثوان
  useEffect(() => {
    incomingPollRef.current = setInterval(async () => {
      if (callStateRef.current !== 'idle') return;
      try {
        const res = await fetch(`${apiUrl}/calls/incoming`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.call) {
            setIncomingCall(data.call);
            setCallState('ringing');
          }
        }
      } catch (err) {}
    }, 3000);
    return () => clearInterval(incomingPollRef.current);
  }, []);
 // تنظيف عند إغلاق الصفحة
  useEffect(() => {
    return () => {
      cleanupAgora();
    };
  }, []);
  // معالجة إشعارات المكالمة — سواء جاءت من نقرة إشعار (التطبيق كان مغلق) أو أثناء التطبيق مفتوح
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callParam = params.get('call');
    const actionParam = params.get('callAction');
    if (callParam) {
      handleNotificationCallAction(callParam, actionParam || 'accept');
      window.history.replaceState({}, '', window.location.pathname);
    }

    const handleSWMessage = (event) => {
      if (event.data?.type === 'CALL_ACTION') {
        handleNotificationCallAction(event.data.channelName, event.data.action);
      }
    };
    const handleForegroundPush = (event) => {
      const data = event.detail || {};
      if (data.channelName) {
        handleNotificationCallAction(data.channelName, 'accept');
      }
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }
    window.addEventListener('incoming-call-push', handleForegroundPush);

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
      window.removeEventListener('incoming-call-push', handleForegroundPush);
    };
  }, []);

  const handleNotificationCallAction = async (channelName, action) => {
    if (action === 'decline') {
      try {
        await fetch(`${apiUrl}/calls/${channelName}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {}
      return;
    }
    // قبول: تأكد من وجود المكالمة فعليًا ثم اقبلها مباشرة
    try {
      const res = await fetch(`${apiUrl}/calls/incoming`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.call && data.call.channelName === channelName) {
          setIncomingCall(data.call);
          setCallState('ringing');
          acceptCall(data.call);
        }
      }
    } catch (err) {}
  };
 
  // رنة المكالمة الواردة
  useEffect(() => {
    if (callState === 'ringing') {
      playRingTone();
    } else {
      stopRingTone();
    }
  }, [callState]);
 
  const fetchPendingRequests = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/requests/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPendingRequests(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);
 
  const fetchAllRequests = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/requests/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAllRequests(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);
 
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);
 
  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setSubscriptions(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);
 
  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setEarnings(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);
  const fetchCallLogs = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/calls`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCallLogs(await res.json());
    } catch (err) {}
  }, [apiUrl, token]);
   useEffect(() => {
    if (activeTab === 'callLogs') fetchCallLogs();
  }, [activeTab, fetchCallLogs]);
  const deleteCallLog = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل تريد حذف سجل هذه المكالمة؟' : 'Supprimer cet appel ?')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/calls/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCallLogs();
    } catch (err) {}
  };

  const deleteAllCallLogs = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل تريد حذف كل سجل المكالمات؟ هذا الإجراء لا يمكن التراجع عنه' : 'Supprimer tout l\'historique ? Action irréversible')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/calls`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCallLogs();
    } catch (err) {}
  };
  // تسعير الطلب ونشره
  const handleQuote = async (requestId) => {
    if (!price || isNaN(price) || parseInt(price) <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال سعر صحيح' : 'Veuillez entrer un prix valide');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/requests/${requestId}/quote`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoted_price: parseInt(price) })
      });
      if (res.ok) {
        alert(lang === 'ar' ? '✅ تم نشر الطلب للفنيين' : '✅ Demande publiée aux techniciens');
        setPrice('');
        setSelectedRequest(null);
        fetchPendingRequests();
        fetchAllRequests();
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setLoading(false);
    }
  };
 
  // رفض وحذف طلب
  const handleReject = async (requestId) => {
    if (!window.confirm(lang === 'ar' ? 'هل تريد حذف هذا الطلب؟' : 'Voulez-vous supprimer cette demande ?')) return;
    try {
      await fetch(`${apiUrl}/admin/requests/${requestId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedRequest(null);
      fetchPendingRequests();
      fetchAllRequests();
    } catch (err) {}
  };
 
  // تفعيل مستخدم
  const handleVerify = async (userId) => {
    try {
      await fetch(`${apiUrl}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {}
  };
 
  // حظر/رفع حظر
  const handleBan = async (userId, isBanned) => {
    try {
      await fetch(`${apiUrl}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_banned: !isBanned })
      });
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {}
  };
 
  // تفعيل اشتراك زبون
  const handleSubscribe = async (userId, packageId) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/users/${userId}/subscribe`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId })
      });
      if (res.ok) {
        alert(lang === 'ar' ? '✅ تم تفعيل الاشتراك' : '✅ Abonnement activé');
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setLoading(false);
    }
  };
 
  // قبول/رفض طلب اشتراك
  const handleSubAction = async (subId, action, userId, packageId) => {
    try {
      const res = await fetch(`${apiUrl}/admin/subscriptions/${subId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_id: userId, package_id: packageId })
      });
      if (res.ok) {
        if (action === 'approve') {
          alert(lang === 'ar' ? '✅ تم تفعيل الاشتراك بنجاح' : '✅ Abonnement activé');
        } else {
          alert(lang === 'ar' ? 'تم رفض طلب الاشتراك' : 'Demande rejetée');
        }
        fetchSubscriptions();
        fetchUsers();
      }
    } catch (err) {
      alert(t.serverError);
    }
  };
 
  // صرف مستحقات فني
  const handlePay = async (earningId) => {
    try {
      await fetch(`${apiUrl}/admin/earnings/${earningId}/pay`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(lang === 'ar' ? '✅ تم تسجيل الدفع' : '✅ Paiement enregistré');
      fetchEarnings();
    } catch (err) {}
  };
  // البحث برمز العميل
  const handleClientSearch = async () => {
    if (!clientCode.trim()) return;
    setClientError('');
    setClientResult(null);
    try {
      const res = await fetch(`${apiUrl}/admin/client/${clientCode.trim()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClientResult(data);
      } else {
        setClientError(t.clientNotFound);
      }
    } catch (err) {
      setClientError(t.serverError);
    }
  };
 
  // البحث عن زبون لإنشاء طلب له مباشرة (تبويب مستقل)
  const handleCallClientSearch = async () => {
    if (!callCode.trim()) return;
    setCallSearchError('');
    setCallCustomer(null);
    setCallServiceType('');
    try {
      const res = await fetch(`${apiUrl}/admin/client/${callCode.trim()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCallCustomer(data.user);
      } else {
        setCallSearchError(t.clientNotFound);
      }
    } catch (err) {
      setCallSearchError(t.serverError);
    }
  };
 
  // نشر الطلب مباشرة للفنيين
   const handleCreateForCustomer = async () => {
    if (!callServiceType) {
      alert(lang === 'ar' ? 'يرجى اختيار نوع المشكلة' : 'Veuillez choisir le type de problème');
      return;
    }
    if (!callPrice || isNaN(callPrice) || parseInt(callPrice) <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال سعر صحيح' : 'Veuillez entrer un prix valide');
      return;
    }
    setCallCreateLoading(true);
    try {
      const formData = new FormData();
      formData.append('client_code', callCustomer.client_code);
      formData.append('service_type', callServiceType);
      formData.append('quoted_price', parseInt(callPrice));
      if (callDescription) formData.append('description', callDescription);
      if (callVoiceBlob) formData.append('voice_note', callVoiceBlob, 'voice.webm');

      const res = await fetch(`${apiUrl}/admin/requests/create-for-customer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(lang === 'ar' ? '✅ تم إنشاء الطلب ونشره للفنيين' : '✅ Demande créée et publiée');
        setCallCode('');
        setCallCustomer(null);
        setCallServiceType('');
        setCallPrice('');
        setCallDescription('');
        discardCallVoice();
        fetchAllRequests();
      } else {
        alert(data.error || t.error);
      }
    } catch (err) {
      alert(t.serverError);
    } finally {
      setCallCreateLoading(false);
    }
  };
  const formatVoiceTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCallRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      callChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      callMediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) callChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(callChunksRef.current, { type: mimeType || 'audio/mp4' });
        setCallVoiceBlob(blob);
        setCallVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(100);
      setCallIsRecording(true);
      setCallRecordSeconds(0);
      callRecordTimerRef.current = setInterval(() => setCallRecordSeconds(s => s + 1), 1000);
    } catch (err) {
      alert(lang === 'ar' ? 'يرجى السماح بالوصول للميكروفون' : 'Veuillez autoriser le microphone');
    }
  };

  const stopCallRecording = () => {
    if (callMediaRecorderRef.current) callMediaRecorderRef.current.stop();
    setCallIsRecording(false);
    if (callRecordTimerRef.current) { clearInterval(callRecordTimerRef.current); callRecordTimerRef.current = null; }
  };

  const discardCallVoice = () => {
    setCallVoiceBlob(null);
    setCallVoiceUrl(null);
    setCallIsPlaying(false);
    setCallPlaybackProgress(0);
    setCallPlaybackDuration(0);
  };

  const toggleCallVoicePlayback = () => {
    const audio = callAudioRef.current;
    if (!audio) return;
    if (callIsPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
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
        osc.frequency.value = 480;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => { try { osc.stop(); } catch (err) {} }, 800);
      };
      beep();
      ringIntervalRef.current = setInterval(beep, 1500);
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
 
  const cleanupAgora = async () => {
    stopRingTone();
    setIsMuted(false);
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
 
  const acceptCall = async (callOverride) => {
    const call = callOverride || incomingCall;
    if (!call) return;
    try {
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      await fetch(`${apiUrl}/calls/${call.channelName}/answer`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const tokenRes = await fetch(`${apiUrl}/agora/token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName: call.channelName })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        alert(tokenData.error || t.serverError);
        declineCall();
        return;
      }

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'audio') remoteUser.audioTrack.play();
      });

      await client.join(tokenData.appId, call.channelName, tokenData.token, tokenData.uid);
       const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
  AEC: true,
  ANS: true,
  AGC: true
});
      localAudioTrackRef.current = micTrack;
      await client.publish([micTrack]);

      setCallState('connected');
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } catch (err) {
      alert(lang === 'ar' ? 'يرجى السماح بالوصول للميكروفون' : 'Veuillez autoriser le microphone');
      declineCall();
    }
  };
 
  const declineCall = async () => {
    if (incomingCall) {
      try {
        await fetch(`${apiUrl}/calls/${incomingCall.channelName}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {}
    }
    setIncomingCall(null);
    setCallState('idle');
  };
 
  const endActiveCall = async () => {
    if (incomingCall) {
      try {
        await fetch(`${apiUrl}/calls/${incomingCall.channelName}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {}
    }
    await cleanupAgora();
    setIncomingCall(null);
    setCallState('idle');
    setCallDuration(0);
  };
 
  const getStatusStyle = (status) => {
    const map = {
      pending_admin: { bg: '#fff3cd', color: '#856404' },
      quoted: { bg: '#d1ecf1', color: '#0c5460' },
      assigned: { bg: '#d4edda', color: '#155724' },
      completed: { bg: '#e2e3e5', color: '#383d41' }
    };
    return map[status] || { bg: '#f8f9fa', color: '#333' };
  };
 
  const filteredRequests = statusFilter === 'all'
    ? allRequests
    : allRequests.filter(r => r.status === statusFilter);
 
  const customers = users.filter(u => u.user_role === 'customer');
  const providers = users.filter(u => u.user_role === 'provider');
 
  return (
    <div style={{ ...s.container, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
 
      {/* ===== بانر مكالمة واردة ===== */}
      {callState === 'ringing' && incomingCall && (
        <div style={s.callOverlay}>
          <div style={s.callCard}>
            <div style={s.callAvatarRing}>📞</div>
            <p style={s.callName}>
              {lang === 'ar' ? 'مكالمة واردة من' : 'Appel entrant de'}
            </p>
            <p style={s.callCustomerName}>{incomingCall.customerName}</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
              <button style={s.declineBtn} onClick={declineCall}>
                ✕ {lang === 'ar' ? 'رفض' : 'Refuser'}
              </button>
              <button style={s.acceptBtn} onClick={() => acceptCall()}>
                📞 {lang === 'ar' ? 'قبول' : 'Accepter'}
              </button>
            </div>
          </div>
        </div>
      )}
 
     {/* ===== شاشة المكالمة النشطة ===== */}
      {callState === 'connected' && incomingCall && (
        <div style={s.callOverlay}>
          <div style={s.callCard}>
            <div style={s.callAvatar}>📞</div>
            <p style={s.callName}>{incomingCall.customerName}</p>
            <p style={s.callStatus}>{formatCallDuration(callDuration)}</p>
 
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
                <button style={s.endCallCircleBtn} onClick={endActiveCall}>
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
 
      {/* مودال تفاصيل الطلب */}
      {selectedRequest && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={s.closeBtn} onClick={() => { setSelectedRequest(null); setPrice(''); }}>✕</button>
 
            <h3 style={s.modalTitle}>
              {lang === 'ar' ? 'طلب رقم' : 'Demande #'} {selectedRequest.id}
            </h3>
 
            {/* نوع الخدمة المطلوبة */}
            {selectedRequest.service_type && (
              <div style={{ ...s.infoBox, backgroundColor: '#e8eaf6', border: '1px solid #1a237e' }}>
                <p style={{ ...s.infoLabel, color: '#1a237e', fontWeight: 'bold' }}>
                  {lang === 'ar' ? '🔧 نوع المشكلة:' : '🔧 Type de problème:'}
                </p>
                <p style={{ ...s.infoValue, fontWeight: 'bold', fontSize: '1rem' }}>
                  {selectedRequest.service_type}
                </p>
              </div>
            )}
 
            {/* بيانات الزبون */}
            <div style={s.infoBox}>
              <p style={s.infoLabel}>{lang === 'ar' ? '👤 الزبون:' : '👤 Client:'}</p>
              <p style={s.infoValue}>{selectedRequest.customer_name}</p>
              <p style={s.infoValue}>📞 {selectedRequest.customer_phone}</p>
              <p style={s.infoValue}>🏷️ {selectedRequest.client_code}</p>
              <p style={s.infoValue}>📍 {selectedRequest.district} — {selectedRequest.address}</p>
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
                <p style={s.voiceLabel}>🎙 {lang === 'ar' ? 'الوصف الصوتي:' : 'Note vocale:'}</p>
                <audio controls src={selectedRequest.voice_note_url} style={{ width: '100%' }} />
              </div>
            )}
 
            {/* الوصف النصي */}
            {selectedRequest.description && (
              <div style={s.infoBox}>
                <p style={s.infoLabel}>{lang === 'ar' ? '📝 الوصف:' : '📝 Description:'}</p>
                <p style={s.infoValue}>{selectedRequest.description}</p>
              </div>
            )}
 
            {/* بيانات الفني إذا كان مسنداً */}
            {selectedRequest.provider_name && (
              <div style={{ ...s.infoBox, backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
                <p style={{ ...s.infoLabel, color: '#155724' }}>
                  {lang === 'ar' ? '👷 الفني المسؤول:' : '👷 Technicien:'}
                </p>
                <p style={s.infoValue}>{selectedRequest.provider_name}</p>
                <a href={`tel:${selectedRequest.provider_phone}`} style={s.callBtn}>
                  📞 {selectedRequest.provider_phone}
                </a>
              </div>
            )}
 
            {/* حالة الطلب */}
            {(() => {
              const st = getStatusStyle(selectedRequest.status);
              return (
                <div style={{ ...s.statusBox, backgroundColor: st.bg, borderColor: st.color }}>
                  {t[`status_${selectedRequest.status}`]}
                </div>
              );
            })()}
 
            {/* السعر المحدد */}
            {selectedRequest.quoted_price && (
              <div style={s.priceBox}>
                {lang === 'ar' ? 'السعر:' : 'Prix:'} <strong>{selectedRequest.quoted_price} MRU</strong>
              </div>
            )}
 
            {/* تسعير الطلب — فقط للطلبات الواردة */}
            {selectedRequest.status === 'pending_admin' && (
              <div style={s.quoteSection}>
                <p style={s.sectionLabel}>{t.setPrice}</p>
                <input
                  style={s.priceInput}
                  type="number"
                  placeholder={t.pricePlaceholder}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    style={{ ...s.btnDanger, flex: 1 }}
                    onClick={() => handleReject(selectedRequest.id)}
                  >
                    {t.rejectRequest}
                  </button>
                  <button
                    style={{ ...s.btnSuccess, flex: 2, opacity: loading ? 0.7 : 1 }}
                    onClick={() => handleQuote(selectedRequest.id)}
                    disabled={loading}
                  >
                    {loading ? '...' : t.publishRequest}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
 
      {/* مودال تفاصيل المستخدم */}
      {selectedUser && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <button style={s.closeBtn} onClick={() => setSelectedUser(null)}>✕</button>
 
            <h3 style={s.modalTitle}>{selectedUser.full_name}</h3>
 
            <div style={s.infoBox}>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>{t.phone}:</span>
                <span style={s.infoValue}>{selectedUser.phone}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>{lang === 'ar' ? 'الدور:' : 'Rôle:'}</span>
                <span style={s.infoValue}>{selectedUser.user_role}</span>
              </div>
              {selectedUser.district && (
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>{t.district}:</span>
                  <span style={s.infoValue}>{selectedUser.district}</span>
                </div>
              )}
              {selectedUser.bank_type && (
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>{t.bankType}:</span>
                  <span style={s.infoValue}>{selectedUser.bank_type} — {selectedUser.bank_phone}</span>
                </div>
              )}
            </div>
 
            {/* تفعيل اشتراك الزبون */}
            {selectedUser.user_role === 'customer' && (
              <div style={s.subSection}>
                <p style={s.sectionLabel}>{t.activateSubscription}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 1, label: lang === 'ar' ? 'الأساسية — 1100' : 'Essentiel — 1100' },
                    { id: 2, label: lang === 'ar' ? 'المتوسطة — 1300' : 'Standard — 1300' },
                    { id: 3, label: lang === 'ar' ? 'الشاملة — 1500' : 'Intégral — 1500' }
                  ].map(pkg => (
                    <button
                      key={pkg.id}
                      style={{ ...s.pkgBtn, opacity: loading ? 0.7 : 1 }}
                      onClick={() => handleSubscribe(selectedUser.id, pkg.id)}
                      disabled={loading}
                    >
                      {pkg.label} MRU
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            {/* أزرار الإجراء */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {!selectedUser.is_verified && (
                <button
                  style={{ ...s.btnSuccess, flex: 1 }}
                  onClick={() => { handleVerify(selectedUser.id); setSelectedUser(null); }}
                >
                  {t.activateUser}
                </button>
              )}
              <button
                style={{
                  ...s.btnDanger,
                  flex: 1,
                  color: selectedUser.is_banned ? '#006400' : '#dc3545',
                  borderColor: selectedUser.is_banned ? '#006400' : '#dc3545'
                }}
                onClick={() => handleBan(selectedUser.id, selectedUser.is_banned)}
              >
                {selectedUser.is_banned ? t.unbanUser : t.banUser}
              </button>
            </div>
          </div>
        </div>
      )}
 
      <main style={s.main}>
 
        {/* ===== رأسية الإدارة ===== */}
        <div style={s.adminHeader}>
          <div>
            <h2 style={s.headerTitle}>{t.dashboard}</h2>
            <p style={s.headerSub}>
              {lang === 'ar' ? `مرحباً ${user?.full_name}` : `Bienvenue ${user?.full_name}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} style={s.langBtn}>
              {lang === 'ar' ? 'FR' : 'AR'}
            </button>
            <button onClick={onLogout} style={s.logoutBtn}>
              {lang === 'ar' ? 'خروج' : 'Exit'}
            </button>
          </div>
        </div>
 
        {/* إحصائيات سريعة */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statNum}>{pendingRequests.length}</span>
            <span style={s.statLabel}>{lang === 'ar' ? 'طلبات واردة' : 'En attente'}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{allRequests.filter(r => r.status === 'assigned').length}</span>
            <span style={s.statLabel}>{lang === 'ar' ? 'قيد التنفيذ' : 'En cours'}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{allRequests.filter(r => r.status === 'completed').length}</span>
            <span style={s.statLabel}>{lang === 'ar' ? 'منتهية' : 'Terminées'}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{subscriptions.length}</span>
            <span style={s.statLabel}>{lang === 'ar' ? 'اشتراكات' : 'Abonnements'}</span>
          </div>
        </div>
 
        <div style={s.screen}>
 
          {/* ===== التبويبات — شبكة بطاقات ===== */}
          <div style={s.menuGrid}>
            {[
              { id: 'pending', icon: '📥', label: lang === 'ar' ? 'الواردة' : 'Reçues', color: '#fff3cd', border: '#ffc107', count: pendingRequests.length },
              { id: 'all', icon: '📋', label: lang === 'ar' ? 'كل الطلبات' : 'Tout', color: '#d1ecf1', border: '#17a2b8', count: null },
              { id: 'users', icon: '👥', label: lang === 'ar' ? 'المستخدمون' : 'Utilisateurs', color: '#d4edda', border: '#28a745', count: users.length },
              { id: 'earnings', icon: '💰', label: lang === 'ar' ? 'المستحقات' : 'Revenus', color: '#e8f5e9', border: '#006400', count: earnings.length },
              { id: 'subscriptions', icon: '💳', label: lang === 'ar' ? 'الاشتراكات' : 'Abonnements', color: '#fce4ec', border: '#e91e63', count: subscriptions.length },
              { id: 'search', icon: '🔍', label: lang === 'ar' ? 'بحث بالرمز' : 'Recherche', color: '#e8eaf6', border: '#1a237e', count: null },
              { id: 'createForCustomer', icon: '🆕', label: lang === 'ar' ? 'طلب لزبون' : 'Nouvelle demande', color: '#e0f7fa', border: '#00838f', count: null },
              { id: 'callLogs', icon: '📋', label: lang === 'ar' ? 'سجل المكالمات' : 'Historique appels', color: '#fff0f0', border: '#c62828', count: callLogs.filter(c => c.status === 'missed').length || null },
            ].map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...s.menuCard,
                  backgroundColor: activeTab === tab.id ? tab.border : tab.color,
                  borderColor: tab.border,
                  transform: activeTab === tab.id ? 'scale(0.97)' : 'scale(1)'
                }}
              >
                {tab.count > 0 && (
                  <div style={s.menuBadge}>{tab.count}</div>
                )}
                <span style={{ fontSize: '2rem', marginBottom: '8px' }}>{tab.icon}</span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: activeTab === tab.id ? '#fff' : '#333',
                  textAlign: 'center'
                }}>
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
 
          {/* ===== الطلبات الواردة ===== */}
          {activeTab === 'pending' && (
            <div>
              {pendingRequests.length === 0 ? (
                <div style={s.emptyBox}>
                  <span style={{ fontSize: '3rem' }}>📭</span>
                  <p style={{ color: '#888' }}>
                    {lang === 'ar' ? 'لا توجد طلبات واردة' : 'Aucune demande reçue'}
                  </p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} style={s.requestCard} onClick={() => setSelectedRequest(req)}>
                    <div style={s.cardTop}>
                      <span style={s.cardId}>#{req.id}</span>
                      <span style={s.pendingBadge}>
                        {lang === 'ar' ? '⏳ قيد المراجعة' : '⏳ En attente'}
                      </span>
                    </div>
                    <p style={s.cardInfo}>👤 {req.customer_name} — 🏷️ {req.client_code}</p>
                    <p style={s.cardInfo}>📍 {req.district}</p>
                    {req.service_type && (
                      <p style={{ ...s.cardInfo, color: '#1a237e', fontWeight: 'bold' }}>
                        🔧 {req.service_type}
                      </p>
                    )}
                    <div style={s.cardIcons}>
                      {req.image_url && <span style={s.contentIcon}>📷</span>}
                      {req.voice_note_url && <span style={s.contentIcon}>🎙</span>}
                      {req.description && <span style={s.contentIcon}>📝</span>}
                    </div>
                    <p style={s.cardDate}>
                      {new Date(req.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
 
          {/* ===== كل الطلبات ===== */}
          {activeTab === 'all' && (
            <div>
              <div style={s.filterRow}>
                {['all', 'pending_admin', 'quoted', 'assigned', 'completed'].map(st => (
                  <button
                    key={st}
                    style={{
                      ...s.filterBtn,
                      backgroundColor: statusFilter === st ? '#006400' : '#f0f0f0',
                      color: statusFilter === st ? '#fff' : '#333'
                    }}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st === 'all' ? (lang === 'ar' ? 'الكل' : 'Tout') : t[`status_${st}`] || st}
                  </button>
                ))}
              </div>
 
              {filteredRequests.length === 0 ? (
                <div style={s.emptyBox}>
                  <p style={{ color: '#888' }}>{lang === 'ar' ? 'لا توجد طلبات' : 'Aucune demande'}</p>
                </div>
              ) : (
                filteredRequests.map(req => {
                  const st = getStatusStyle(req.status);
                  return (
                    <div key={req.id} style={s.requestCard} onClick={() => setSelectedRequest(req)}>
                      <div style={s.cardTop}>
                        <span style={s.cardId}>#{req.id}</span>
                        <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>
                          {t[`status_${req.status}`]}
                        </span>
                      </div>
                      <p style={s.cardInfo}>👤 {req.customer_name}</p>
                      <p style={s.cardInfo}>📍 {req.district}</p>
                      {req.service_type && (
                        <p style={{ ...s.cardInfo, color: '#1a237e', fontWeight: 'bold' }}>
                          🔧 {req.service_type}
                        </p>
                      )}
                      {req.provider_name && (
                        <p style={{ ...s.cardInfo, color: '#006400' }}>👷 {req.provider_name}</p>
                      )}
                      {req.quoted_price && (
                        <p style={{ ...s.cardInfo, fontWeight: 'bold', color: '#006400' }}>
                          💰 {req.quoted_price} MRU
                        </p>
                      )}
                      <p style={s.cardDate}>
                        {new Date(req.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
 
          {/* ===== المستخدمون ===== */}
          {activeTab === 'users' && (
            <div>
              <h3 style={s.sectionTitle}>
                {lang === 'ar' ? `👥 الزبائن (${customers.length})` : `👥 Clients (${customers.length})`}
              </h3>
              {customers.map(u => (
                <div key={u.id} style={s.userCard} onClick={() => setSelectedUser(u)}>
                  <div style={s.cardTop}>
                    <span style={s.cardName}>{u.full_name}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {!u.is_verified && (
                        <span style={s.unverifiedBadge}>
                          {lang === 'ar' ? 'غير مفعل' : 'Non activé'}
                        </span>
                      )}
                      {u.is_banned && (
                        <span style={s.bannedBadge}>
                          {lang === 'ar' ? 'محظور' : 'Banni'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={s.cardInfo}>📞 {u.phone}</p>
                  {u.district && <p style={s.cardInfo}>📍 {u.district}</p>}
                </div>
              ))}
 
              <h3 style={{ ...s.sectionTitle, marginTop: '20px' }}>
                {lang === 'ar' ? `🔧 الفنيون (${providers.length})` : `🔧 Techniciens (${providers.length})`}
              </h3>
              {providers.map(u => (
                <div key={u.id} style={s.userCard} onClick={() => setSelectedUser(u)}>
                  <div style={s.cardTop}>
                    <span style={s.cardName}>{u.full_name}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {!u.is_verified && (
                        <span style={s.unverifiedBadge}>
                          {lang === 'ar' ? 'غير مفعل' : 'Non activé'}
                        </span>
                      )}
                      {u.is_banned && (
                        <span style={s.bannedBadge}>
                          {lang === 'ar' ? 'محظور' : 'Banni'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={s.cardInfo}>📞 {u.phone}</p>
                </div>
              ))}
            </div>
          )}
 
          {/* ===== المستحقات ===== */}
          {activeTab === 'earnings' && (
            <div>
              {earnings.length === 0 ? (
                <div style={s.emptyBox}>
                  <span style={{ fontSize: '3rem' }}>💰</span>
                  <p style={{ color: '#888' }}>
                    {lang === 'ar' ? 'لا توجد مستحقات معلقة' : 'Aucun paiement en attente'}
                  </p>
                </div>
              ) : (
                earnings.map(e => (
                  <div key={e.id} style={s.earningCard}>
                    <div style={s.cardTop}>
                      <span style={s.cardName}>{e.provider_name}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#006400' }}>
                        {e.amount} MRU
                      </span>
                    </div>
                    <div style={s.bankDetail}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: '#333' }}>
                        📱 {e.bank_type}
                      </span>
                      <span style={{ color: '#006400', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {e.bank_phone}
                      </span>
                    </div>
                    <p style={s.cardInfo}>
                      {lang === 'ar' ? 'مهمة رقم:' : 'Mission #'} {e.request_id}
                    </p>
                    <p style={s.cardDate}>
                      {new Date(e.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                    </p>
                    <button style={s.payBtn} onClick={() => handlePay(e.id)}>
                      {t.markAsPaid}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
 
          {/* ===== الاشتراكات ===== */}
          {activeTab === 'subscriptions' && (
            <div>
              {subscriptions.length === 0 ? (
                <div style={s.emptyBox}>
                  <span style={{ fontSize: '3rem' }}>💳</span>
                  <p style={{ color: '#888' }}>
                    {lang === 'ar' ? 'لا توجد طلبات اشتراك معلقة' : 'Aucune demande d\'abonnement'}
                  </p>
                </div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} style={s.earningCard}>
                    {/* رأسية البطاقة */}
                    <div style={s.cardTop}>
                      <span style={s.cardName}>{sub.full_name}</span>
                      <span style={{ ...s.statusBadge, backgroundColor: '#fce4ec', color: '#c62828' }}>
                        {sub.package_name}
                      </span>
                    </div>
 
                    {/* بيانات الزبون */}
                    <p style={s.cardInfo}>📞 {sub.phone}</p>
                    {sub.client_code && <p style={s.cardInfo}>🏷️ {sub.client_code}</p>}
                    <p style={{ ...s.cardInfo, fontWeight: 'bold', color: '#e91e63' }}>
                      💰 {sub.package_price} MRU
                    </p>
 
                    {/* صورة إثبات الدفع */}
                    {sub.proof_url && (
                      <div style={{ margin: '10px 0' }}>
                        <p style={{ ...s.infoLabel, marginBottom: '6px' }}>
                          {lang === 'ar' ? '🖼️ إثبات الدفع (اضغط للتكبير):' : '🖼️ Preuve de paiement:'}
                        </p>
                        <img
                          src={sub.proof_url}
                          alt="proof"
                          style={{
                            width: '100%',
                            borderRadius: '12px',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: '2px solid #e91e63'
                          }}
                          onClick={() => window.open(sub.proof_url, '_blank')}
                        />
                      </div>
                    )}
 
                    <p style={s.cardDate}>
                      {new Date(sub.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                    </p>
 
                    {/* أزرار القبول والرفض */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button
                        style={{ ...s.btnDanger, flex: 1 }}
                        onClick={() => handleSubAction(sub.id, 'reject', sub.user_id, sub.package_id)}
                      >
                        {lang === 'ar' ? 'رفض' : 'Rejeter'}
                      </button>
                      <button
                        style={{ ...s.btnSuccess, flex: 2 }}
                        onClick={() => handleSubAction(sub.id, 'approve', sub.user_id, sub.package_id)}
                      >
                        {lang === 'ar' ? '✅ تفعيل الاشتراك' : '✅ Activer'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
 
          {/* ===== البحث برمز العميل ===== */}
          {activeTab === 'search' && (
            <div>
              <p style={s.sectionTitle}>{t.searchByCode}</p>
 
              <div style={s.searchRow}>
                <input
                  style={s.searchInput}
                  placeholder={t.enterClientCode}
                  value={clientCode}
                  onChange={e => setClientCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleClientSearch()}
                />
                <button style={s.searchBtn} onClick={handleClientSearch}>
                  {t.search}
                </button>
              </div>
 
              {clientError && <p style={s.errorText}>{clientError}</p>}
 
              {clientResult && (
                <div>
                  <div style={s.clientCard}>
                    <div style={s.cardTop}>
                      <span style={s.cardName}>{clientResult.user.full_name}</span>
                      <span style={s.clientCodeBadge}>{clientResult.user.client_code}</span>
                    </div>
                    <p style={s.cardInfo}>📞 {clientResult.user.phone}</p>
                    <p style={s.cardInfo}>📍 {clientResult.user.district}</p>
                    <p style={s.cardInfo}>📦 {clientResult.user.package_name || '-'}</p>
                    {clientResult.user.subscription_end_date && (
                      <p style={s.cardInfo}>
                        📅 {t.expiresOn}: {new Date(clientResult.user.subscription_end_date).toLocaleDateString()}
                      </p>
                    )}
                    <div style={s.monthStat}>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#006400' }}>
                        {clientResult.total_this_month}
                      </span>
                      <span style={{ color: '#555', fontSize: '0.9rem' }}>
                        {t.requestsThisMonth}
                      </span>
                    </div>
                  </div>
 
                  {clientResult.requests.length > 0 && (
                    <>
                      <p style={{ ...s.sectionTitle, marginTop: '15px' }}>
                        {lang === 'ar' ? 'طلبات هذا الشهر:' : 'Demandes ce mois:'}
                      </p>
                      {clientResult.requests.map(req => {
                        const st = getStatusStyle(req.status);
                        return (
                          <div key={req.id} style={s.requestCard}>
                            <div style={s.cardTop}>
                              <span style={s.cardId}>#{req.id}</span>
                              <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>
                                {t[`status_${req.status}`]}
                              </span>
                            </div>
                            {req.quoted_price && (
                              <p style={{ ...s.cardInfo, color: '#006400', fontWeight: 'bold' }}>
                                💰 {req.quoted_price} MRU
                              </p>
                            )}
                            <p style={s.cardDate}>
                              {new Date(req.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                            </p>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {/* ===== إنشاء طلب لزبون متصل ===== */}
          {activeTab === 'createForCustomer' && (
            <div>
              <p style={s.sectionTitle}>
                {lang === 'ar' ? '📞 إنشاء طلب لزبون اتصل بك' : '📞 Créer une demande pour un client'}
              </p>
 
              <div style={s.searchRow}>
                <input
                  style={s.searchInput}
                  placeholder={t.enterClientCode}
                  value={callCode}
                  onChange={e => setCallCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleCallClientSearch()}
                />
                <button style={s.searchBtn} onClick={handleCallClientSearch}>
                  {t.search}
                </button>
              </div>
 
              {callSearchError && <p style={s.errorText}>{callSearchError}</p>}
 
              {callCustomer && (
                <div style={s.clientCard}>
                  <div style={s.cardTop}>
                    <span style={s.cardName}>{callCustomer.full_name}</span>
                    <span style={s.clientCodeBadge}>{callCustomer.client_code}</span>
                  </div>
                  <p style={s.cardInfo}>📞 {callCustomer.phone}</p>
                  <p style={s.cardInfo}>📍 {callCustomer.district} — {callCustomer.address}</p>
                  <p style={s.cardInfo}>📦 {callCustomer.package_name || '-'}</p>
 
                  {callCustomer.last_latitude && callCustomer.last_longitude ? (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ ...s.cardInfo, color: '#006400', fontWeight: 'bold' }}>
                        ✅ {lang === 'ar' ? 'يوجد موقع GPS محدد لهذا الزبون' : 'Position GPS disponible'}
                        {callCustomer.location_updated_at && (
                          <span style={{ fontWeight: 'normal', color: '#888' }}>
                            {' '}({new Date(callCustomer.location_updated_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'fr-FR')})
                          </span>
                        )}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${callCustomer.last_latitude},${callCustomer.last_longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: '#1a237e' }}
                      >
                        🗺️ {lang === 'ar' ? 'عرض الموقع على الخريطة' : 'Voir sur la carte'}
                      </a>
                    </div>
                  ) : (
                    <p style={{ ...s.errorText, marginTop: '8px' }}>
                      ⚠️ {lang === 'ar' ? 'لا يوجد موقع GPS محدد لهذا الزبون بعد' : 'Aucune position GPS enregistrée'}
                    </p>
                  )}
 
                  {!(callCustomer.package_id && callCustomer.subscription_end_date && new Date(callCustomer.subscription_end_date) > new Date()) ? (
                    <p style={{ ...s.errorText, marginTop: '10px' }}>
                      {lang === 'ar' ? '⚠️ اشتراك هذا الزبون غير فعال حالياً' : '⚠️ Abonnement inactif'}
                    </p>
                  ) : (
                    <div style={{ marginTop: '15px' }}>
                      <p style={s.sectionLabel}>
                        {lang === 'ar' ? '🔧 نوع المشكلة' : '🔧 Type de problème'}
                      </p>
                      <select
                        style={s.priceInput}
                        value={callServiceType}
                        onChange={e => setCallServiceType(e.target.value)}
                      >
                        <option value="">
                          {lang === 'ar' ? '-- اختر نوع المشكلة --' : '-- Choisir --'}
                        </option>
                        {(callCustomer.coverage_items ? callCustomer.coverage_items.split('|') : [])
                          .filter(item => item.trim() !== 'أولوية قصوى في الاستجابة')
                          .map((item, i) => (
                            <option key={i} value={item.trim()}>{item.trim()}</option>
                          ))}
                      </select>
 
                      <p style={{ ...s.sectionLabel, marginTop: '12px' }}>{t.setPrice}</p>
                      <input
                        style={s.priceInput}
                        type="number"
                        placeholder={t.pricePlaceholder}
                        value={callPrice}
                        onChange={e => setCallPrice(e.target.value)}
                      />
 
                      <p style={{ ...s.sectionLabel, marginTop: '12px' }}>
                        {lang === 'ar' ? 'ملاحظة (اختياري)' : 'Note (optionnel)'}
                      </p>
                      <textarea
                        style={{ ...s.priceInput, textAlign: 'right', height: '70px', resize: 'none' }}
                        value={callDescription}
                        onChange={e => setCallDescription(e.target.value)}
                      />

                      <p style={{ ...s.sectionLabel, marginTop: '12px' }}>
                        {lang === 'ar' ? '🎙 رسالة صوتية (اختياري)' : '🎙 Message vocal (optionnel)'}
                      </p>

                      {!callVoiceUrl ? (
                        callIsRecording ? (
                          <div style={s.waRecordingBar}>
                            <span style={s.waRecDot} />
                            <span style={s.waRecTimer}>{formatVoiceTime(callRecordSeconds)}</span>
                            <span style={{ flex: 1 }} />
                            <button style={s.waStopBtn} onClick={stopCallRecording}>⏹</button>
                          </div>
                        ) : (
                          <button style={s.waMicBtn} onClick={startCallRecording}>
                            🎙️ {lang === 'ar' ? 'اضغط لتسجيل رسالة صوتية' : 'Appuyer pour enregistrer'}
                          </button>
                        )
                      ) : (
                        <div style={s.waBubble}>
                          <button style={s.waPlayBtn} onClick={toggleCallVoicePlayback}>
                            {callIsPlaying ? '⏸' : '▶️'}
                          </button>
                          <div style={s.waWaveTrack}>
                            <div style={{ ...s.waWaveFill, width: `${callPlaybackProgress}%` }} />
                          </div>
                          <span style={s.waDuration}>
                            {formatVoiceTime(callPlaybackDuration || 0)}
                          </span>
                          <button style={s.waDeleteBtn} onClick={discardCallVoice}>🗑️</button>
                          <audio
                            ref={callAudioRef}
                            src={callVoiceUrl}
                            onPlay={() => setCallIsPlaying(true)}
                            onPause={() => setCallIsPlaying(false)}
                            onEnded={() => { setCallIsPlaying(false); setCallPlaybackProgress(0); }}
                            onLoadedMetadata={e => setCallPlaybackDuration(e.target.duration)}
                            onTimeUpdate={e => setCallPlaybackProgress((e.target.currentTime / e.target.duration) * 100 || 0)}
                            style={{ display: 'none' }}
                          />
                        </div>
                      )}

                      <button
                        style={{ ...s.btnSuccess, width: '100%', marginTop: '15px', opacity: callCreateLoading ? 0.7 : 1 }}
                        onClick={handleCreateForCustomer}
                        disabled={callCreateLoading}
                      >
                        {callCreateLoading
                          ? '...'
                          : (lang === 'ar' ? '🚀 نشر الطلب للفنيين' : '🚀 Publier aux techniciens')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* ===== سجل المكالمات ===== */}
          {activeTab === 'callLogs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ ...s.sectionTitle, margin: 0 }}>
                  {lang === 'ar' ? '📋 سجل المكالمات' : '📋 Historique des appels'}
                </p>
                {callLogs.length > 0 && (
                  <button
                    style={{ ...s.btnDanger, padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={deleteAllCallLogs}
                  >
                    🗑️ {lang === 'ar' ? 'حذف الكل' : 'Tout supprimer'}
                  </button>
                )}
              </div>

              {callLogs.length === 0 ? (
                <div style={s.emptyBox}>
                  <span style={{ fontSize: '3rem' }}>📭</span>
                  <p style={{ color: '#888' }}>
                    {lang === 'ar' ? 'لا توجد مكالمات بعد' : 'Aucun appel pour le moment'}
                  </p>
                </div>
              ) : (
                callLogs.map(call => {
                  const isMissed = call.status === 'missed';
                  return (
                    <div
                      key={call.id}
                      style={{
                        ...s.requestCard,
                        backgroundColor: isMissed ? '#fff5f5' : '#fff',
                        border: isMissed ? '1.5px solid #dc3545' : '1px solid #f0f0f0',
                        cursor: 'default'
                      }}
                    >
                      <div style={s.cardTop}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>
                          {call.customer_name}
                        </span>
                        <span style={{
                          ...s.statusBadge,
                          backgroundColor: isMissed ? '#f8d7da' : '#d4edda',
                          color: isMissed ? '#721c24' : '#155724'
                        }}>
                          {isMissed
                            ? (lang === 'ar' ? '🔴 فائتة' : '🔴 Manqué')
                            : (lang === 'ar' ? '🟢 تم الرد' : '🟢 Répondu')}
                        </span>
                      </div>

                      {call.client_code && (
                        <p style={{ margin: '6px 0 0' }}>
                          <span style={s.clientCodeBadge}>{call.client_code}</span>
                        </p>
                      )}

                      {call.customer_phone && (
                        <p style={s.cardInfo}>📞 {call.customer_phone}</p>
                      )}

                    <p style={s.cardDate}>
                        {new Date(call.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'fr-FR')}
                      </p>
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
                        onClick={() => deleteCallLog(call.id)}
                      >
                        🗑️ {lang === 'ar' ? 'حذف' : 'Supprimer'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
 
        </div>
      </main>
    </div>
  );
}
 
const s = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa'
  },
  main: {
    paddingBottom: '30px'
  },
  adminHeader: {
    background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  headerSub: {
    margin: '4px 0 0',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)'
  },
  langBtn: {
    padding: '5px 12px',
    borderRadius: '10px',
    border: '1.5px solid rgba(255,255,255,0.5)',
    background: 'transparent',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  logoutBtn: {
    padding: '5px 12px',
    borderRadius: '10px',
    border: '1.5px solid rgba(255,0,0,0.5)',
    background: 'transparent',
    color: '#ffcdd2',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1px',
    backgroundColor: '#e0e0e0',
    borderBottom: '1px solid #e0e0e0'
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '15px 10px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statNum: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    color: '#1a237e'
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#888'
  },
  screen: {
    padding: '15px',
    maxWidth: '700px',
    margin: '0 auto'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '25px'
  },
  menuCard: {
    border: '2px solid',
    borderRadius: '16px',
    padding: '20px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    minHeight: '90px',
    transition: 'all 0.2s ease',
    boxShadow: '0 3px 10px rgba(0,0,0,0.07)'
  },
  menuBadge: {
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    backgroundColor: '#dc3545',
    color: '#fff',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(220,53,69,0.4)'
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
  userCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '15px',
    marginBottom: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    border: '1px solid #f0f0f0'
  },
  earningCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '15px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0'
  },
  clientCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '2px solid #1a237e'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  cardId: {
    fontWeight: 'bold',
    color: '#1a237e',
    fontSize: '1rem'
  },
  cardName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1rem'
  },
  cardInfo: {
    margin: '4px 0',
    fontSize: '0.85rem',
    color: '#555'
  },
  cardDate: {
    margin: '5px 0 0',
    fontSize: '0.75rem',
    color: '#999'
  },
  cardIcons: {
    display: 'flex',
    gap: '6px',
    margin: '8px 0'
  },
  contentIcon: {
    fontSize: '1rem',
    background: '#f5f5f5',
    padding: '3px 8px',
    borderRadius: '8px'
  },
  pendingBadge: {
    background: '#fff3cd',
    color: '#856404',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  unverifiedBadge: {
    background: '#fff3cd',
    color: '#856404',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem'
  },
  bannedBadge: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem'
  },
  clientCodeBadge: {
    background: '#e8eaf6',
    color: '#1a237e',
    padding: '3px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    letterSpacing: '1px'
  },
  monthStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f0f4ff',
    borderRadius: '12px',
    padding: '12px',
    marginTop: '12px'
  },
  filterRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '15px',
    overflowX: 'auto',
    paddingBottom: '5px'
  },
  filterBtn: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    fontWeight: 'bold'
  },
  bankDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f0f4f0',
    borderRadius: '10px',
    padding: '10px 12px',
    margin: '8px 0'
  },
  payBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#006400',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1.5px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    textAlign: 'right',
    letterSpacing: '2px',
    fontWeight: 'bold'
  },
  searchBtn: {
    padding: '12px 20px',
    backgroundColor: '#1a237e',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px'
  },
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
    maxWidth: '480px',
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
  modalTitle: {
    textAlign: 'center',
    color: '#1a237e',
    marginTop: '5px',
    marginBottom: '15px'
  },
  modalImg: {
    width: '100%',
    borderRadius: '14px',
    marginBottom: '12px',
    maxHeight: '220px',
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
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  infoLabel: {
    color: '#888',
    fontSize: '0.85rem',
    margin: '0 0 4px'
  },
  infoValue: {
    color: '#333',
    fontSize: '0.9rem',
    margin: '2px 0'
  },
  callBtn: {
    display: 'inline-block',
    color: '#006400',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '1rem',
    marginTop: '5px'
  },
  statusBox: {
    border: '2px solid',
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  priceBox: {
    background: '#e8f5e9',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    color: '#155724',
    marginBottom: '10px'
  },
  quoteSection: {
    background: '#f8f9fa',
    borderRadius: '14px',
    padding: '15px',
    marginTop: '10px'
  },
  sectionLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    fontSize: '0.95rem'
  },
  priceInput: {
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: '1.5px solid #ddd',
    fontSize: '1.1rem',
    textAlign: 'center',
    fontWeight: 'bold',
    outline: 'none',
    boxSizing: 'border-box'
  },
  btnSuccess: {
    padding: '13px',
    backgroundColor: '#006400',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  btnDanger: {
    padding: '13px',
    backgroundColor: '#fff',
    color: '#dc3545',
    border: '1.5px solid #dc3545',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  subSection: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '15px'
  },
  pkgBtn: {
    padding: '10px 14px',
    backgroundColor: '#1a237e',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  // ===== المكالمات =====
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
    backgroundColor: '#1a237e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    marginBottom: '10px'
  },
  callAvatarRing: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    marginBottom: '10px',
    animationName: 'pulse',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate'
  },
  callName: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '1rem',
    margin: 0
  },
  callCustomerName: {
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0
  },
  callStatus: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '1rem',
    margin: 0
  },
  acceptBtn: {
    padding: '16px 30px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(40,167,69,0.4)'
  },
  declineBtn: {
    padding: '16px 30px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(220,53,69,0.4)'
  },
 endCallBtn: {
    marginTop: '30px',
    padding: '16px 40px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(220,53,69,0.4)'
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
  // ===== تسجيل صوتي بشكل واتساب =====
  waMicBtn: {
    width: '100%',
    padding: '14px',
    background: '#f0fff0',
    border: '2px dashed #006400',
    borderRadius: '30px',
    color: '#006400',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  waRecordingBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#fff0f0',
    border: '1.5px solid #dc3545',
    borderRadius: '30px'
  },
  waRecDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#dc3545',
    animationName: 'pulse',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate'
  },
  waRecTimer: {
    fontWeight: 'bold',
    color: '#dc3545',
    fontSize: '0.95rem'
  },
  waStopBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer'
  },
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
  },
  waDeleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    flexShrink: 0
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.75rem'
  }
};

