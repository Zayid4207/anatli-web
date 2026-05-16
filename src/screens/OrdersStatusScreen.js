import React, { useState, useEffect } from 'react';

export default function OrdersStatusScreen({ user, apiUrl, lang, onLogout, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false); // للتحكم في مسار التقييم المنفصل
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [user.id, user.user_role, apiUrl, token]);

  const fetchOrders = () => {
    const endpoint = user.user_role === 'provider'
      ? `${apiUrl}/api/provider/my-orders/${user.id}`
      : `${apiUrl}/api/customer/orders/${user.id}`;

    fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleBulkDelete = async () => {
    const confirmMsg = lang === 'ar'
      ? `هل أنت متأكد من حذف ${selectedOrderIds.length} طلبات؟`
      : `Confirmer la suppression de ${selectedOrderIds.length} commandes ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`${apiUrl}/api/orders/bulk-delete?lang=${lang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
        body: JSON.stringify({ orderIds: selectedOrderIds })
      });

      const data = await response.json();

      if (data.success) {
        setOrders(orders.filter(o => !selectedOrderIds.includes(o.id)));
        setSelectedOrderIds([]);
        setIsSelectionMode(false);
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert(lang === 'ar' ? "فشل الحذف الجماعي" : "Échec de la suppression groupée");
    }
  };

  const handleDeleteOrder = (orderId, e) => {
    if (e) e.stopPropagation();

    const confirmMsg = lang === 'ar'
      ? "هل أنت متأكد من حذف هذا الطلب؟"
      : "Confirmes-tu la suppression de cette commande ?";

    if (!window.confirm(confirmMsg)) return;

    fetch(`${apiUrl}/api/orders/${orderId}?lang=${lang}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(orders.filter(o => o.id !== orderId));
          setSelectedOrder(null);
          setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
          alert(data.message);
        } else {
          alert(data.error);
        }
      })
      .catch(err => {
        console.error("Delete Error:", err);
        alert(lang === 'ar' ? "خطأ في الاتصال بالسيرفر" : "Erreur de connexion");
      });
  };


  const toggleSelectOrder = (orderId, e) => {
    if (e) e.stopPropagation();
    setSelectedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleCall = (phoneNumber, e) => {
    if (e) e.stopPropagation();
    const finalPhone = phoneNumber || selectedOrder?.phone;
    if (finalPhone) {
      window.location.href = `tel:${finalPhone}`;
    } else {
      alert(lang === 'ar' ? "رقم الهاتف غير متوفر حالياً" : "Numéro non disponible");
    }
  };

  const submitReview = async () => {
    try {
      const response = await fetch(`${apiUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          provider_id: selectedOrder.provider_id,
          rating: rating,
          comment: comment
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(lang === 'ar' ? "تم التقييم بنجاح" : "Évaluation réussie");
        setShowReviewForm(false);
        // تحديث الطلب محلياً ليعرف أنه قُيّم
        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, has_review: true } : o));
        setSelectedOrder(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error submitting review");
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': lang === 'ar' ? 'قيد المراجعة ⏳' : 'En attente ⏳',
      'active': lang === 'ar' ? 'جاري البحث 🔍' : 'Recherche 🔍',
      'accepted': lang === 'ar' ? 'تم القبول ✅' : 'Acceptée ✅',
      'in_progress': lang === 'ar' ? 'قيد التنفيذ 🛠️' : 'En cours 🛠️',
      'completed': lang === 'ar' ? 'تم التنفيذ ✨' : 'Terminée ✨',
      'waiting_admin': lang === 'ar' ? 'في انتظار المسؤول 🛡️' : 'Attente Admin 🛡️',
    };
    return statusMap[status] || status;
  };

  const canDelete = (order) => {
    const status = order.request_status || order.status;
    if (user.user_role === 'provider') return status !== 'in_progress';
    return ['pending', 'active', 'completed', 'waiting_admin'].includes(status);
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</p>;

  return (
    <div style={orderStyles.container}>

      {orders.length > 0 && (
        <div style={orderStyles.toolbar}>
          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedOrderIds([]);
            }}
            style={isSelectionMode ? orderStyles.cancelBtn : orderStyles.selectBtn}
          >
            {isSelectionMode
              ? (lang === 'ar' ? "إلغاء" : "Annuler")
              : (lang === 'ar' ? "تحديد" : "Sélectionner")}
          </button>

          {isSelectionMode && selectedOrderIds.length > 0 && (
            <button onClick={handleBulkDelete} style={orderStyles.bulkDeleteBtn}>
              {lang === 'ar' ? `حذف (${selectedOrderIds.length})` : `Supprimer (${selectedOrderIds.length})`}
            </button>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
          {lang === 'ar' ? 'لا توجد طلبات' : 'Aucune commande'}
        </p>
      ) : (
        orders.map(order => {
          const isSelected = selectedOrderIds.includes(order.id);
          const currentStatus = order.request_status || order.status;

          return (
            <div
              key={order.id}
              style={{
                ...orderStyles.orderCard,
                border: isSelected ? '2px solid #28a745' : '1px solid #eee',
                backgroundColor: isSelected ? '#fafffa' : '#fff',
                opacity: (isSelectionMode && !canDelete(order) && !isSelected) ? 0.6 : 1
              }}
              onClick={() => {
                if (isSelectionMode) {
                  if (canDelete(order)) toggleSelectOrder(order.id);
                } else {
                  setSelectedOrder(order);
                  setShowReviewForm(false); // تصفير الحالة عند فتح طلب جديد
                }
              }}
            >
              <div style={orderStyles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isSelectionMode && canDelete(order) && (
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      border: '2px solid #28a745', background: isSelected ? '#28a745' : 'transparent',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff'
                    }}>
                      {isSelected && "✓"}
                    </div>
                  )}
                  <span style={orderStyles.serviceType}>{order.service_type}</span>
                </div>
                <span style={orderStyles.statusBadge}>{getStatusText(currentStatus)}</span>
              </div>

              <p style={orderStyles.desc}>{order.description?.substring(0, 65)}...</p>

              <div style={orderStyles.footer}>
                <div style={orderStyles.actionGroup}>
                  {!isSelectionMode && (
                    <button
                      onClick={(e) => handleCall(user.user_role === 'customer' ? order.phone : order.phone, e)}
                      style={orderStyles.contactBtn}
                    >
                      📞 {lang === 'ar' ? 'اتصال' : 'Appeler'}
                    </button>
                  )}

                  {canDelete(order) && !isSelectionMode && (
                    <button
                      onClick={(e) => handleDeleteOrder(order.id, e)}
                      style={orderStyles.deleteIconBtn}
                    >
                      {lang === 'ar' ? 'حذف' : 'Supprimer'}
                    </button>
                  )}
                </div>
                <small style={{ color: '#999' }}>{new Date(order.created_at).toLocaleDateString()}</small>
              </div>
            </div>
          );
        })
      )}

      {selectedOrder && (
        <div style={orderStyles.modalOverlay} onClick={() => { setSelectedOrder(null); setShowReviewForm(false); }}>
          <div style={orderStyles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={orderStyles.modalHeader}>
              <h3 style={{ margin: 0, color: '#006400' }}>
                {showReviewForm ? (lang === 'ar' ? 'تقييم الخدمة' : 'Évaluer') : selectedOrder.service_type}
              </h3>
              <button style={orderStyles.closeBtn} onClick={() => { setSelectedOrder(null); setShowReviewForm(false); }}>✕</button>
            </div>

            <div style={orderStyles.modalBody}>
              {/* المسار الأول: واجهة التقييم المستقلة */}
              {showReviewForm ? (
                <div style={orderStyles.fullReviewView}>
                   <button onClick={() => setShowReviewForm(false)} style={orderStyles.backBtn}>
                    {lang === 'ar' ? '← العودة للتفاصيل' : '← Retour'}
                   </button>
                   <div style={orderStyles.reviewBox}>
                    <h2 style={{ textAlign: 'center', color: '#225422', marginBottom: '20px' }}>{lang === 'ar' ? 'كيف كانت تجربتك؟' : 'Votre expérience ?'}</h2>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} onClick={() => setRating(star)} style={{ fontSize: '2.5rem', cursor: 'pointer', color: star <= rating ? '#ffc107' : '#ccc' }}>★</span>
                      ))}
                    </div>
                    <textarea
                      placeholder={lang === 'ar' ? 'اكتب رأيك هنا بوضوح...' : 'Votre commentaire...'}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={orderStyles.reviewTextAreaLarge}
                    />
                    <button onClick={submitReview} style={orderStyles.reviewSubmitBtnLarge}>
                      {lang === 'ar' ? 'إرسال التقييم النهائي' : 'Envoyer l\'évaluation'}
                    </button>
                  </div>
                </div>
              ) : (
                /* المسار الثاني: واجهة تفاصيل الطلب الأصلية */
                <>
                  {selectedOrder.image_url ? (
                    <img src={`${apiUrl}${selectedOrder.image_url}`} alt="Order" style={orderStyles.orderImg} />
                  ) : (
                    <div style={orderStyles.noImg}>{lang === 'ar' ? 'لا توجد صورة' : 'Pas d\'image'}</div>
                  )}

                  <div style={orderStyles.infoSection}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{lang === 'ar' ? 'الوصف الكامل:' : 'Description:'}</label>
                    <p style={{ margin: '0 0 15px 0' }}>{selectedOrder.description}</p>
                    <div style={orderStyles.metaGrid}>
                      <div><strong>{lang === 'ar' ? 'الحالة:' : 'Statut:'}</strong> {getStatusText(selectedOrder.request_status || selectedOrder.status)}</div>
                      <div><strong>{lang === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* زر التقييم يظهر فقط إذا لم يتم التقييم مسبقاً */}
                  {user.user_role === 'customer' && 
                   (selectedOrder.request_status === 'completed' || selectedOrder.status === 'completed') && 
                   !selectedOrder.has_review && (
                    <button 
                      onClick={() => setShowReviewForm(true)} 
                      style={orderStyles.goToReviewBtn}
                    >
                      ⭐ {lang === 'ar' ? 'قيم جودة الخدمة' : 'Évaluer le service'}
                    </button>
                  )}

                  <div style={orderStyles.modalActionRow}>
                    <button
                      onClick={(e) => handleCall(user.user_role === 'customer' ? selectedOrder.provider_phone : selectedOrder.customer_phone, e)}
                      style={orderStyles.modalCallBtn}
                    >
                      📞 {lang === 'ar' ? 'اتصال الآن' : 'Appeler'}
                    </button>

                    {canDelete(selectedOrder) && (
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder.id)}
                        style={orderStyles.modalDeleteBtn}
                      >
                        {lang === 'ar' ? 'حذف' : 'Supprimer'}
                      </button>
                    )}
                  </div>
{!isSelectionMode && (
  <button
    onClick={() => {
      const reason = prompt(lang === 'ar' ? "ما هي مشكلتك مع هذا الطلب؟" : "Quel هو le problème avec cette commande ?");
      if (reason) {
        fetch(`${apiUrl}/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
          body: JSON.stringify({ reported_user_id: selectedOrder.provider_id, order_id: selectedOrder.id, reason: reason })
        }).then(() => alert(lang === 'ar' ? "تم إبلاغ الإدارة، سنراجع الأمر فوراً" : "Signalé à l'admin"));
      }
    }}
    style={orderStyles.reportLink} // تأكد من تغيير الاسم هنا إلى reportBtn
  >
    <span>⚠️</span>
    {lang === 'ar' ? 'الإبلاغ عن مشكلة في هذا الطلب' : 'Signaler un problème'}
  </button>
)}

                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const orderStyles = {
  container: { display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', maxHeight: '85vh', overflowY: 'auto', paddingBottom: '100px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  selectBtn: { padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #006400', color: '#006400', background: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #666', color: '#666', background: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  bulkDeleteBtn: { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#dc3545', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },

  orderCard: { background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid #eee' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  serviceType: { fontWeight: 'bold', color: '#006400', fontSize: '1.05rem' },
  statusBadge: { fontSize: '0.7rem', padding: '5px 12px', borderRadius: '20px', backgroundColor: '#f0f0f0', fontWeight: '700' },
  desc: { fontSize: '0.9rem', color: '#444', margin: '12px 0', textAlign: 'right', lineHeight: '1.4' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8f8f8', paddingTop: '12px' },
  actionGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  contactBtn: { padding: '7px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  deleteIconBtn: { background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '1rem', color: '#c53030' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '15px', backdropFilter: 'blur(3px)' },
  modalContent: { background: '#fff', width: '100%', maxWidth: '450px', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  modalHeader: { padding: '18px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc' },
  closeBtn: { border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' },
  modalBody: { padding: '20px', overflowY: 'auto', maxHeight: '80vh' },
  orderImg: { width: '100%', borderRadius: '12px', marginBottom: '15px', objectFit: 'cover', maxHeight: '200px', background: '#f4f4f4' },
  noImg: { width: '100%', height: '120px', background: '#f0f0f0', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#aaa', border: '1px dashed #ccc', marginBottom: '15px' },
  infoSection: { textAlign: 'right', direction: 'rtl' },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', fontSize: '0.85rem', color: '#777', padding: '10px', background: '#f9f9f9', borderRadius: '8px' },

  // التنسيقات الجديدة للمسار المنفصل
  goToReviewBtn: { width: '100%', marginTop: '15px', padding: '12px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', color: '#856404', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' },
  fullReviewView: { textAlign: 'right', direction: 'rtl' },
  backBtn: { background: 'none', border: 'none', color: '#006400', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' },
  reviewBox: { padding: '10px' },
  reviewTextAreaLarge: { width: '100%', borderRadius: '12px', border: '1px solid #ddd', padding: '12px', minHeight: '120px', marginBottom: '20px', fontSize: '1rem' },
  reviewSubmitBtnLarge: { width: '100%', padding: '15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' },

  modalActionRow: { display: 'flex', gap: '10px', marginTop: '20px' },
  modalCallBtn: { flex: 2, padding: '14px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  modalDeleteBtn: { flex: 1, padding: '14px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
// استبدل reportLink بهذا التنسيق الجديد في قسم orderStyles
reportLink: {
  marginTop: '26px',        // مسافة كافية لتبتعد عن الأزرار التي فوقها
  padding: '14px',          // ليصبح حجم الزر مريحاً للضغط (مثل زر اتصال)
  backgroundColor: '#fff',  // خلفية بيضاء ليكون هادئاً
  color: '#d9534f',         // لون النص أحمر تحذيري
  border: '1.5px solid #d9534f', // إطار أحمر واضح
  borderRadius: '12px',     // زوايا دائرية متناسقة مع بقية الأزرار
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  width: '100%',            // يأخذ العرض الكامل لمنع التداخل
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px'
},
};