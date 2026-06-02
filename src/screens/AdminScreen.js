import React, { useState, useEffect } from 'react';

const AdminScreen = ({ apiUrl, user, onLogout,  }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const [reports, setReports] = useState([]); // لتخزين الشكاوى الجلبة من السيرفر
  const [allOrders, setAllOrders] = useState([]);
const [ordersFilter, setOrdersFilter] = useState('all');

  const getImageUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('data:image')) return url;
    if (!url.startsWith('http')) {
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      return `${apiUrl}/${cleanUrl}`;
    }
    return url;
  };
  const fetchAllOrders = async (status = 'all') => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        };
        const res = await fetch(`${apiUrl}/api/admin/all-orders?status=${status}`, { headers });
        if (res.ok) {
            const data = await res.json();
            setAllOrders(data || []);
        }
    } catch (err) {
        console.error("خطأ في جلب كل الطلبات:", err);
    }
};

  const fetchAdminData = async () => {
    try {
      const headers = { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}` // إضافة التوكن في الرأس
      };
      const resRequests = await fetch(`${apiUrl}/api/admin/pending-orders`, { headers });
      const contentType = resRequests.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const requestsData = await resRequests.json();
       const onlyPending = requestsData.filter(req => req.status === 'waiting_admin');
        setPendingRequests(onlyPending);
      }

      const resSubs = await fetch(`${apiUrl}/api/admin/subscriptions`, { headers });
      if (resSubs.ok) {
        const subsData = await resSubs.json();
        setSubscriptions(subsData || []);
      }
      // 4. جلب الشكاوى والتقارير الجديدة
      const resReports = await fetch(`${apiUrl}/api/admin/reports`, { headers });
      if (resReports.ok) {
        const reportsData = await resReports.json();
        setReports(reportsData || []); // سيقوم بتخزين الشكاوى في الحالة التي أضفناها
      }
// 3. التحديث المطلوب هنا: جلب كل المستخدمين من المسار الصحيح ووضعهم في الحالة
      const resUsers = await fetch(`${apiUrl}/api/admin/unverified-users`, { headers });
      if (resUsers.ok) {
        const usersData = await resUsers.json();
        setAllUsers(usersData || []); // هنا سيتم تخزين الجميع (المفعل وغير المفعل)
      }

    } catch (err) {
      console.error("خطأ في جلب بيانات الإدارة:", err);
    }
  };
      

  useEffect(() => {
    fetchAdminData();
  }, []);
 const handleVerifyUser = async (userId) => {
  if (!window.confirm("هل تريد تفعيل هذا المستخدم؟")) return;
  try {
    const res = await fetch(`${apiUrl}/api/admin/verify-user/${userId}`, { method: 'PUT' ,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}`,'Content-Type': 'application/json' }});
    if (res.ok) {
      // تحديث الحالة محلياً فوراً
      setAllUsers(allUsers.map(u => u.id === userId ? { ...u, is_verified: true } : u));
      alert("✅ تم التفعيل بنجاح");
    }
  } catch (err) { alert("خطأ في التفعيل"); }
};

  const handleOrderAction = async (id, action) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/order-action/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${localStorage.getItem('userToken')}`},
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setPendingRequests(pendingRequests.filter(r => r.id !== id));
        alert(action === 'approve' ? "✅ تم نشر الطلب بنجاح" : "🗑️ تم حذف الطلب");
      }
    } catch (err) { alert("فشل في معالجة الطلب"); }
  };

  const handleVerifySub = async (subId, userId, role, action) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/verify-sub`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,'Authorization':`Bearer ${localStorage.getItem('userToken')}` },
        body: JSON.stringify({ subId, userId, role, action })
      });
      if (res.ok) {
        setSubscriptions(subscriptions.filter(s => s.id !== subId));
        alert(action === 'accept' ? "✅ تم تفعيل الاشتراك بنجاح" : "❌ تم رفض الإثبات");
      }
    } catch (err) { alert("خطأ في تحديث الاشتراك"); }
  };
const handleToggleBan = async (userId, currentStatus) => {
  const actionText = currentStatus ? "رفع الحظر عن" : "حظر";
  if (!window.confirm(`⚠️ هل أنت متأكد من ${actionText} هذا المستخدم؟`)) return;

  try {
    const res = await fetch(`${apiUrl}/api/admin/ban/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('userToken')}` 
      },
      body: JSON.stringify({ is_banned: !currentStatus }) // هنا المفتاح: نرسل عكس الحالة الحالية
    });

    if (res.ok) {
      alert(`✅ تم ${actionText} المستخدم بنجاح`);
      fetchAdminData(); // تحديث القائمة فوراً
    }
  } catch (err) { 
    alert("خطأ في العملية"); 
  }
};
const handleIgnoreReport = async (reportId) => {
  if (!window.confirm("هل أنت متأكد من تجاهل هذه الشكوى؟ سيتم اعتبارها منتهية.")) return;
  try {
    const res = await fetch(`${apiUrl}/api/admin/reports/${reportId}`, {
      method: 'DELETE', // أو PUT حسب تفضيلك في السيرفر
      headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
    });
    if (res.ok) {
      // تحديث الحالة محلياً لحذف الشكوى من القائمة أمامك فوراً
      setReports(reports.filter(r => r.id !== reportId));
      alert("✅ تم تجاهل الشكوى بنجاح");
    }
  } catch (err) {
    alert("خطأ في الاتصال بالسيرفر");
  }
};
const handleResetPassword = async (userId, userPhone) => {
  const newPassword = window.prompt(`أدخل كلمة المرور الجديدة للمستخدم صاحب الرقم: ${userPhone}`);
  
  if (!newPassword || newPassword.length < 6) {
    alert("❌ يجب أن تكون كلمة المرور 6 أحرف على الأقل");
    return;
  }

  try {
    // 1. أضفنا /api/ للمسار ليتطابق مع السيرفر الذي أرسلته (app.post('/api/admin/...'))
    const res = await fetch(`${apiUrl}/api/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${localStorage.getItem('userToken')}`},
      body: JSON.stringify({ 
        phone: userPhone, 
        newPassword: newPassword // نرسلها باسم newPassword لتطابق السيرفر المصلح
      })
    });

    if (res.ok) {
      alert("✅ تم تغيير كلمة المرور بنجاح وسيصل إشعار للمستخدم");
    } else {
      const data = await res.json();
      alert(`❌ فشل التغيير: ${data.error}`);
    }
  } catch (err) {
    console.error("Connection Error:", err);
    alert("❌ خطأ في الاتصال بالسيرفر: تأكد من تشغيل السيرفر ومن صحة الرابط");
  }
};
  return (
    <div style={styles.adminContainer}>
      {/* النافذة المنبثقة المحسنة لعرض الصور */}
      {selectedImage && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          {/* زر إغلاق علوي عائم */}
          <button style={styles.topCloseBtn} onClick={() => setSelectedImage(null)}>✕</button>
          
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img 
              src={getImageUrl(selectedImage)} 
              style={styles.fullImg} 
              alt="Preview" 
            />
            {/* زر إغلاق سفلي واضح */}
            <button style={styles.bottomCloseBtn} onClick={() => setSelectedImage(null)}>
              إغلاق المعاينة ↩️
            </button>
          </div>
        </div>
      )}

      <header style={styles.adminHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button onClick={onLogout} style={styles.logoutBtn}>تسجيل الخروج 🚪</button>
          <h1 style={{ margin: 0, color: '#006400', fontSize: '22px' }}>لوحة التحكم 🛡️ ANATLI</h1>
          <div style={{ width: '100px' }}></div> 
        </div>
        
        <div style={styles.tabBar}>
          <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? styles.activeTabBtn : styles.tabBtn}>
            📝 طلبات الخدمات ({pendingRequests.length})
          </button>
          <button onClick={() => setActiveTab('subs')} style={activeTab === 'subs' ? styles.activeTabBtn : styles.tabBtn}>
            💳 مراجعة الدفع ({subscriptions.length})
          </button>
          <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? styles.activeTabBtn : styles.tabBtn}>
            👥 المستخدمين
          </button>
          <button onClick={() => setActiveTab('reports')} style={activeTab === 'reports' ? styles.activeTabBtn : styles.tabBtn}>
            🚩 الشكاوى ({reports.length})
          </button>
          <button 
             onClick={() => { setActiveTab('allOrders'); fetchAllOrders('all'); }} 
           style={activeTab === 'allOrders' ? styles.activeTabBtn : styles.tabBtn}
>
    📊 متابعة الطلبات
</button>
        </div>
      </header>

      <div style={styles.contentSection}>
        {activeTab === 'orders' && (
          <div style={styles.listSection}>
            {pendingRequests.length === 0 ? <p style={styles.emptyMsg}>لا توجد طلبات جديدة بانتظار المراجعة</p> : 
              pendingRequests.map(req => (
                <div key={req.id} style={styles.adminCard}>
                  <div style={styles.cardHeader}>
                    <span style={styles.badge}>{req.service_type}</span>
                    <small>{new Date(req.created_at).toLocaleDateString()}</small>
                  </div>
                  <p><strong>الوصف:</strong> {req.description}</p>

                  {/* إضافة حقل الموقع الجديد بشكل بارز للآدمين */}
<p style={{ 
  marginBottom: '15px', 
  padding: '10px', 
  backgroundColor: '#fff9c4', 
  borderRadius: '8px', 
  border: '1px solid #fbc02d',
  color: '#333' 
}}>
  <strong>📍 الموقع:</strong> {req.location || "لم يتم تحديد موقع"}
</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    {req.image_url ? (
                      <button 
                        onClick={() => setSelectedImage(req.image_url)} 
                        style={{...styles.viewImgBtn, flex: 1, backgroundColor: '#e3f2fd', borderColor: '#2196f3'}}>
                        👁️ معاينة صورة المشكلة
                      </button>
                    ) : <span style={{fontSize: '11px', color: '#999'}}>بدون صورة مشكلة</span>}

                    {req.payment_proof ? (
                      <button 
                        onClick={() => setSelectedImage(req.payment_proof)} 
                        style={{...styles.viewImgBtn, flex: 1, backgroundColor: '#e8f5e9', borderColor: '#4caf50'}}>
                        💰 معاينة إثبات الدفع
                      </button>
                    ) : <span style={{fontSize: '11px', color: '#999'}}>بدون إثبات دفع</span>}
                  </div>

                  <div style={styles.cardActions}>
                    <button onClick={() => handleOrderAction(req.id, 'approve')} style={styles.activateBtn}>نشر الطلب ✅</button>
                    <button onClick={() => handleOrderAction(req.id, 'reject')} style={styles.deleteBtn}>حذف 🗑️</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'subs' && (
          <div style={styles.listSection}>
            {subscriptions.length === 0 ? <p style={styles.emptyMsg}>لا توجد اشتراكات بانتظار التأكيد</p> : 
              subscriptions.map(sub => (
                <div key={sub.id} style={styles.adminCard}>
                  <div style={styles.cardHeader}>
                    <span style={{...styles.badge, backgroundColor: sub.user_role === 'provider' ? '#e3f2fd' : '#f3e5f5', color: '#333'}}>
                      {sub.user_role === 'provider' ? '🛠️ اشتراك مزود' : '👤 اشتراك زبون'}
                    </span>
                    <strong>{sub.full_name}</strong>
                  </div>
                  <p>رقم العملية: {sub.transaction_id}</p>
                  
                  {sub.proof_url || sub.image_url ? (
                    <button onClick={() => setSelectedImage(sub.proof_url || sub.image_url)} style={styles.viewImgBtn}>👁️ معاينة إثبات الدفع</button>
                  ) : <p style={{color: 'red', fontSize: '12px'}}>لا يوجد ملف إثبات!</p>}

                  <div style={styles.cardActions}>
                    <button onClick={() => handleVerifySub(sub.id, sub.user_id, sub.user_role, 'accept')} style={styles.activateBtn}>تفعيل 💰</button>
                    <button onClick={() => handleVerifySub(sub.id, sub.user_id, sub.user_role, 'reject')} style={styles.deleteBtn}>رفض ❌</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

{activeTab === 'users' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.userTable}>
              <thead>
                <tr style={{ background: '#eee' }}>
                  <th>الاسم</th><th>الهاتف</th><th>النوع</th><th>المميزات</th><th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{u.full_name}</td>
                    <td>{u.phone}</td>
                    <td>{u.user_role === 'provider' ? 'مقدم خدمة' : 'زبون'}</td>
                    <td>{u.is_premium || u.is_subscribed ? '✅ مفعل' : '❌ عادي'}</td>
                    {/* ابحث عن هذه الخلية وحدث ما بداخلها */}
<td>
  {u.is_verified ? (
    <span style={{color: 'green', fontWeight: 'bold'}}>مفعل ✅</span>
  ) : (
    <button 
      onClick={() => handleVerifyUser(u.id)} 
      style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
    >
      تفعيل الآن 🔓
    </button>
  )}
</td>
   <td><button onClick={() => handleResetPassword(u.id, u.phone)}
                                    style={styles.keyBtn}
                                    title="تغيير كلمة المرور"
                                >
                                    🔑</button>
                                    
   </td>
   {/* داخل الـ Map الخاص بـ allUsers */}
<button 
  onClick={() => handleToggleBan(u.id, u.is_banned)} 
  style={{
    ...styles.keyBtn, 
    backgroundColor: u.is_banned ? '#27ae60' : '#c0392b', // أخضر إذا كان محظوراً (لفك الحظر)، أحمر للحظر
    marginRight: '5px'
  }} 
  title={u.is_banned ? "فك الحظر" : "حظر المستخدم"}
>
  {u.is_banned ? "🔓" : "🚫"}
</button>
 </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'reports' && (
          <div style={styles.listSection}>
            {reports.length === 0 ? <p style={styles.emptyMsg}>لا توجد شكاوى حالياً</p> : 
              reports.map(report => (
                <div key={report.id} style={{...styles.adminCard, borderRight: '5px solid #e74c3c'}}>
                  <div style={styles.cardHeader}>
                    <strong>شكوى بخصوص الطلب #{report.order_id}</strong>
                    <small>{new Date(report.created_at).toLocaleString('ar-EG')}</small>
                  </div>
                  <p><strong>المُشتكي:</strong> {report.reporter_name} (رقم: {report.reporter_phone})</p>
                  <p><strong>المُشتكى عليه:</strong> <span style={{color: '#d32f2f'}}>{report.reported_name}</span></p>
                  <div style={{ backgroundColor: '#fff5f5', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                    <strong>سبب الشكوى:</strong> {report.reason}
                  </div>
                  <div style={styles.cardActions}>
<button 
  onClick={() => handleToggleBan(report.reported_user_id, report.is_banned)} 
  style={{
    ...styles.deleteBtn, 
    backgroundColor: report.is_banned ? '#27ae60' : '#e74c3c'
  }}
>
  {report.is_banned ? "رفع الحظر عن المستخدم 🔓" : "حظر المُشتكى عليه 🚫"}
</button>
<button 
  onClick={() => handleIgnoreReport(report.id)} 
  style={{...styles.activateBtn, backgroundColor: '#7f8c8d'}}
>
  تجاهل 👁️
</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
{activeTab === 'allOrders' && (
    <div style={styles.listSection}>

        {/* شريط الفلترة */}
        <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap', 
            marginBottom: '15px',
            justifyContent: 'center'
        }}>
            {[
                { value: 'all',           label: '📋 الكل' },
                { value: 'pending',       label: '🟡 بانتظار فني' },
                { value: 'negotiating',   label: '🔵 تفاوض' },
                { value: 'in_progress',   label: '🟠 قيد التنفيذ' },
                { value: 'completed',     label: '🟢 مكتمل' },
                { value: 'waiting_admin', label: '🔴 بانتظار الإدارة' },
            ].map(f => (
                <button
                    key={f.value}
                    onClick={() => { 
                        setOrdersFilter(f.value); 
                        fetchAllOrders(f.value); 
                    }}
                    style={{
                        padding: '7px 13px',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        backgroundColor: ordersFilter === f.value ? '#006400' : '#eee',
                        color: ordersFilter === f.value ? '#fff' : '#333',
                    }}
                >
                    {f.label}
                </button>
            ))}
        </div>

        {/* عداد النتائج */}
        <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', margin: '0 0 10px' }}>
            إجمالي النتائج: <strong>{allOrders.length}</strong> طلب
        </p>

        {/* قائمة الطلبات */}
        {allOrders.length === 0 ? (
            <p style={styles.emptyMsg}>لا توجد طلبات في هذه الفئة</p>
        ) : (
            allOrders.map(order => {

                // تحديد لون ونص الحالة
                const statusConfig = {
                    pending:       { color: '#f39c12', bg: '#fff8e1', label: '🟡 بانتظار فني' },
                    negotiating:   { color: '#2980b9', bg: '#e3f2fd', label: '🔵 جاري التفاوض' },
                    in_progress:   { color: '#e67e22', bg: '#fff3e0', label: '🟠 قيد التنفيذ' },
                    completed:     { color: '#27ae60', bg: '#e8f5e9', label: '🟢 مكتمل' },
                    waiting_admin: { color: '#e74c3c', bg: '#ffebee', label: '🔴 بانتظار الإدارة' },
                };
                const s = statusConfig[order.request_status] || { color: '#888', bg: '#f5f5f5', label: order.request_status };

                return (
                    <div key={order.id} style={{
                        ...styles.adminCard,
                        borderRight: `5px solid ${s.color}`,
                    }}>
                        {/* رأس البطاقة: رقم الطلب + الحالة */}
                        <div style={styles.cardHeader}>
                            <span style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                                طلب رقم #{order.id}
                            </span>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: s.bg,
                                color: s.color,
                            }}>
                                {s.label}
                            </span>
                        </div>

                        {/* نوع الخدمة والتاريخ */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={styles.badge}>{order.service_type}</span>
                            <small style={{ color: '#999' }}>
                                {new Date(order.created_at).toLocaleDateString('ar-EG')}
                            </small>
                        </div>

                        {/* بيانات الزبون */}
                        <div style={{ 
                            backgroundColor: '#f9f9f9', 
                            padding: '10px', 
                            borderRadius: '8px', 
                            marginBottom: '8px' 
                        }}>
                            <p style={{ margin: '0 0 4px', fontSize: '13px' }}>
                                <strong>👤 الزبون:</strong> {order.customer_name}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                                <strong>📞</strong> {order.customer_phone}
                            </p>
                        </div>

                        {/* بيانات مقدم الخدمة */}
                        <div style={{ 
                            backgroundColor: order.provider_name ? '#e8f5e9' : '#fff3e0', 
                            padding: '10px', 
                            borderRadius: '8px', 
                            marginBottom: '8px' 
                        }}>
                            <p style={{ margin: '0 0 4px', fontSize: '13px' }}>
                                <strong>🛠️ مقدم الخدمة:</strong>{' '}
                                {order.provider_name 
                                    ? order.provider_name 
                                    : <span style={{ color: '#e67e22' }}>لم يُقبل الطلب بعد</span>
                                }
                            </p>
                            {order.provider_phone && (
                                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                                    <strong>📞</strong> {order.provider_phone}
                                </p>
                            )}
                        </div>

                        {/* الوصف */}
                        <p style={{ 
                            fontSize: '13px', 
                            color: '#555', 
                            margin: '8px 0',
                            backgroundColor: '#fafafa',
                            padding: '8px',
                            borderRadius: '8px'
                        }}>
                            <strong>📝 الوصف:</strong> {order.description}
                        </p>

                        {/* الموقع */}
                        {order.location && (
                            <p style={{ 
                                fontSize: '13px', 
                                color: '#333', 
                                margin: '8px 0',
                                backgroundColor: '#fff9c4',
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid #fbc02d'
                            }}>
                                <strong>📍 الموقع:</strong> {order.location}
                            </p>
                        )}

                        {/* وسيلة الدفع */}
                        <p style={{ fontSize: '12px', color: '#888', margin: '5px 0 0' }}>
                            <strong>💳 الدفع:</strong> {order.payment_method || 'غير محدد'}
                        </p>
                    </div>
                );
            })
        )}
    </div>
)}

      </div>
    </div>
  );
};

const styles = {
  adminContainer: { padding: '20px', direction: 'rtl', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' },
  adminHeader: { marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  logoutBtn: { padding: '8px 15px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  tabBar: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' },
  tabBtn: { padding: '10px 15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: '#f9f9f9', fontWeight: 'bold' },
  activeTabBtn: { padding: '10px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#006400', color: '#fff', fontWeight: 'bold' },
  listSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  adminCard: { background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' },
  badge: { padding: '4px 8px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' },
  cardActions: { display: 'flex', gap: '10px', marginTop: '15px' },
  activateBtn: { flex: 1, background: '#27ae60', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  deleteBtn: { flex: 1, background: '#e74c3c', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  viewImgBtn: { width: '100%', background: '#f9f9f9', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  emptyMsg: { textAlign: 'center', color: '#888', marginTop: '30px' },
  userTable: { width: '100%', textAlign: 'right', borderCollapse: 'collapse', backgroundColor: '#fff' },
  blockBtn: { background: '#eee', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' },
  
  // تنسيقات الـ Modal الجديدة
  modalOverlay: { 
    position: 'fixed', 
    top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.95)', 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 5000 
  },
  modalContent: { 
    position: 'relative', 
    width: '95%', 
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  fullImg: { 
    width: '100%', 
    maxHeight: '75vh', 
    objectFit: 'contain', 
    borderRadius: '10px', 
    boxShadow: '0 0 30px rgba(255,255,255,0.1)' 
  },
  topCloseBtn: { 
    position: 'absolute', 
    top: '20px', 
    right: '20px', 
    color: '#fff', 
    background: '#e74c3c', 
    border: 'none', 
    width: '45px', 
    height: '45px', 
    borderRadius: '50%', 
    cursor: 'pointer', 
    fontSize: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  },
  bottomCloseBtn: {
    marginTop: '20px',
    padding: '12px 30px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '0 4px 15px rgba(231,76,60,0.4)'
  },
  keyBtn: {
    background: '#f39c12', 
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease'
},
};

export default AdminScreen;