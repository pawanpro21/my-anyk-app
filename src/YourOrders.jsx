import React, { useState, useEffect } from 'react';
import api from "./services/api";
import { Truck, CheckCircle, ShoppingBag, ChevronDown, ChevronUp, X, RefreshCcw, RotateCcw, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_URL } from "./config/api";

export default function YourOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderActions, setOrderActions] = useState({});

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState('');
  const [requestedSize, setRequestedSize] = useState('M');
  const [bankDetails, setBankDetails] = useState({ accountHolder: '', accountNumber: '', ifsc: '', bank: '' });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const getSessionUser = () => {
    const storedUser = sessionStorage.getItem('auth_user');
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      return null;
    }
  };
  
  useEffect(() => {
    const loadOrders = async () => {
      const user = getSessionUser();
      if (!user) {
        navigate('/login');
        return;
      }

      api.get(`/api/orders`)
        .then(res => {
          setOrders(res.data.orders || []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Orders fetch error:", err);
          setLoading(false);
        });

      api.get(`/api/orders/actions`)
        .then(res => {
          const actionMap = {};
          (res.data.actions || []).forEach(a => { actionMap[a.order_id] = a; });
          setOrderActions(actionMap);
        })
        .catch(err => {
          console.error("Actions fetch error (non-critical):", err);
        });
    };

    loadOrders();
  }, [navigate]);

  const toggleDetails = (orderId) =>
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);

  const isWithin14Days = (orderDate) => {
    const placed = new Date(orderDate);
    const now = new Date();
    const diffDays = Math.floor((now - placed) / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  const handleCancelOrder = (orderId) => {
    Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'maroon',
      cancelButtonColor: '#535766',
      confirmButtonText: 'Yes, Cancel it',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.put(`/api/orders/cancel/${orderId}`);
          if (res.data.success) {
            setOrders(prev => prev.map(o =>
              o.order_id === orderId ? { ...o, order_status: 'Cancelled' } : o
            ));
            Swal.fire({ title: 'Order Cancelled!', icon: 'success', timer: 1500, showConfirmButton: false });
          }
        } catch (err) {
          Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Cancellation failed.', icon: 'error', confirmButtonColor: 'maroon' });
        }
      }
    });
  };

  const openActionModal = (order, item, type) => {
    if (!isWithin14Days(order.order_date)) {
      Swal.fire({
        title: 'Return/Exchange Window Closed',
        html: `<p style="color:#535766;font-size:14px;">Return/Exchange is only possible within <strong>14 days</strong> of delivery.<br/><br/>The return window for this order has <strong>expired</strong>.</p>`,
        icon: 'warning',
        confirmButtonColor: 'maroon',
        confirmButtonText: 'Okay'
      });
      return;
    }
    setSelectedOrder(order);
    setSelectedItem(item);
    setActionType(type);
    setReason('');
    setRequestedSize('M');
    setBankDetails({ accountHolder: '', accountNumber: '', ifsc: '', bank: '' });
    setShowActionModal(true);
  };

  const handleActionSubmit = async () => {
    if (!reason.trim()) {
      Swal.fire({ title: 'Reason Required', text: 'Please select a reason.', icon: 'warning', confirmButtonColor: 'maroon' });
      return;
    }
    if (actionType === 'Return') {
      const { accountHolder, accountNumber, ifsc, bank } = bankDetails;
      if (!accountHolder || !accountNumber || !ifsc || !bank) {
        Swal.fire({ title: 'Bank Details Required', text: 'Please provide complete bank details for the refund.', icon: 'warning', confirmButtonColor: 'maroon' });
        return;
      }
    }
    const user = getSessionUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/api/orders/action`, {
        orderId: selectedOrder.order_id,
        userId: user.id,
        productId: selectedItem?.product_id,
        actionType,
        reason,
        requestedSize: actionType === 'Exchange' ? requestedSize : null,
        bankDetails: actionType === 'Return' ? bankDetails : null
      });
      if (res.data.success) {
        setShowActionModal(false);
        Swal.fire({
          title: `${actionType} Request Submitted! ✅`,
          text: `Your ${actionType} request has been successfully registered. We will contact you within 2-3 business days.`,
          icon: 'success',
          confirmButtonColor: 'maroon'
        });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.response?.data?.error || 'Request submission failed.', icon: 'error', confirmButtonColor: 'maroon' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading your orders...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '30px', color: '#282c3f' }}>Track Your Orders</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '1px solid #eaeaec', borderRadius: '8px' }}>
          <ShoppingBag size={50} color="#bfc0c6" style={{ marginBottom: '15px' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: '#7e818c' }}>Looks like you haven't ordered anything yet.</p>
          <button onClick={() => navigate('/mens')} style={shopBtn}>SHOP NOW</button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} style={orderCard}>

            {/* Header */}
            <div style={orderHeader}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#7e818c' }}>ORDER ID: #{order.order_id}</p>
                <p style={{ margin: '5px 0 0 0', fontWeight: '600' }}>
                  Placed on {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div style={statusBadge(order.order_status)}>{order.order_status}</div>
            </div>

            {/* Action Request Tracking Badge */}
            {orderActions[order.order_id] && (
              <div style={{ padding: '12px 20px', backgroundColor: '#fff8e1', fontSize: '12px', fontWeight: '700', color: '#f57f17', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #ffe0b2' }}>
                <Clock size={14} /> {orderActions[order.order_id].action_type} Request Status: <span style={{ textTransform: 'uppercase' }}>{orderActions[order.order_id].status || 'Pending'}</span>
              </div>
            )}

            {/* Tracking Bar */}
            <div style={trackingContainer}>
              <div style={stepStyle(true)}><CheckCircle size={16} /><span>Placed</span></div>
              <div style={lineStyle(order.order_status === 'Shipped' || order.order_status === 'Delivered')}></div>
              <div style={stepStyle(order.order_status === 'Shipped' || order.order_status === 'Delivered')}>
                <Truck size={16} /><span>Shipped</span>
              </div>
              <div style={lineStyle(order.order_status === 'Delivered')}></div>
              <div style={stepStyle(order.order_status === 'Delivered')}>
                <CheckCircle size={16} /><span>Delivered</span>
              </div>
            </div>

            {/* Summary + Action Buttons */}
            <div style={{ padding: '20px', borderTop: '1px solid #f5f5f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#fff' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#282c3f' }}>Total: <strong>₹{order.total_amount}</strong></p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94969f' }}>Payment: {order.payment_mode}</p>
                {order.items?.length > 0 && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94969f' }}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {order.order_status === 'Placed' && (
                  <button
                    onClick={() => handleCancelOrder(order.order_id)}
                    style={{ padding: '8px 14px', backgroundColor: '#fff5f5', border: '1.5px solid maroon', color: 'maroon', borderRadius: '4px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <XCircle size={15} /> CANCEL ORDER
                  </button>
                )}

                {order.order_status === 'Delivered' && !orderActions[order.order_id] && (
                  <>
                    <button
                      onClick={() => openActionModal(order, order.items?.[0], 'Exchange')}
                      style={{ padding: '8px 14px', backgroundColor: '#f0f9f7', border: '1.5px solid #03a685', color: '#03a685', borderRadius: '4px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCcw size={15} /> EXCHANGE
                    </button>
                    <button
                      onClick={() => openActionModal(order, order.items?.[0], 'Return')}
                      style={{ padding: '8px 14px', backgroundColor: '#f5f5f6', border: '1.5px solid #535766', color: '#535766', borderRadius: '4px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RotateCcw size={15} /> RETURN
                    </button>
                  </>
                )}

                <button
                  onClick={() => toggleDetails(order.order_id)}
                  style={{ ...detailBtn, color: '#282c3f', fontWeight: '600', minWidth: '120px' }}
                >
                  {expandedOrderId === order.order_id ? 'Hide Details' : 'View Details'}
                  {expandedOrderId === order.order_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Collapsible Details */}
            {expandedOrderId === order.order_id && (
              <div style={{ padding: '20px', backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                {order.items?.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'maroon', fontWeight: '700' }}>Ordered Items:</h4>
                    {order.items.map((item, idx) => (
                      <div key={`${order.order_id}-item-${idx}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #eaeaec' }}>
                        {item.image_url && (
                          <img
                            src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url}
                            alt={item.title}
                            style={{ width: '55px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px', color: '#282c3f' }}>{item.title}</p>
                          <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#94969f' }}>Size: {item.size} | Qty: {item.quantity}</p>
                          <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#282c3f' }}>₹{item.price}</p>
                        </div>

                        {order.order_status === 'Delivered' && !orderActions[order.order_id] && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button onClick={() => openActionModal(order, item, 'Exchange')} style={{ padding: '5px 10px', fontSize: '11px', fontWeight: '700', border: '1px solid #03a685', color: '#03a685', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                              Exchange
                            </button>
                            <button onClick={() => openActionModal(order, item, 'Return')} style={{ padding: '5px 10px', fontSize: '11px', fontWeight: '700', border: '1px solid #535766', color: '#535766', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                              Return
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'maroon', fontWeight: '700' }}>Shipping Address:</h4>
                <div style={{ fontSize: '13px', color: '#535766', lineHeight: '1.8' }}>
                  <p style={{ margin: 0 }}><strong>Name:</strong> {order.full_name}</p>
                  <p style={{ margin: 0 }}>
                    <strong>Address:</strong> {[order.house_no, order.area_colony].filter(Boolean).join(', ') || '—'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Location:</strong> {[order.city, order.state, order.pincode].filter(Boolean).join(', ') || '—'}
                  </p>
                  <p style={{ margin: 0 }}><strong>Contact:</strong> {order.mobile_number}</p>
                  <p style={{ margin: '10px 0 0 0', color: '#03a685', fontWeight: '600' }}>Current Status: {order.order_status}</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}

{/* EXCHANGE / RETURN MODAL */}
{showActionModal && (
  <div style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh', 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    zIndex: 99999, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '20px'
  }}>
    <div style={{ 
      background: '#fff', 
      borderRadius: '12px', 
      width: '100%', 
      maxWidth: '450px', 
      maxHeight: '85vh', 
      overflowY: 'auto', 
      padding: '25px', 
      position: 'relative',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>{actionType === 'Exchange' ? '🔄 Exchange Request' : '↩️ Return Request'}</h3>
        <X size={22} onClick={() => setShowActionModal(false)} style={{ cursor: 'pointer' }} />
      </div>

      {/* Form Fields... */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Reason for {actionType} *</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} style={inputStyle}>
          <option value="">-- Select Reason --</option>
          <option value="Size issue">Size Issue</option>
          <option value="Wrong item received">Wrong Item Received</option>
          <option value="Damaged product">Damaged Product</option>
          <option value="Quality not as expected">Quality Not as Expected</option>
          <option value="Changed my mind">Changed My Mind</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {actionType === 'Exchange' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Requested New Size *</label>
          <select value={requestedSize} onChange={(e) => setRequestedSize(e.target.value)} style={inputStyle}>
            {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {actionType === 'Return' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #ddd' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700' }}>💳 Refund Bank Details</p>
            <input placeholder="Account Holder Name" value={bankDetails.accountHolder} onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })} style={{ ...inputStyle, marginBottom: '8px' }} />
            <input placeholder="Account Number" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} style={{ ...inputStyle, marginBottom: '8px' }} />
            <input placeholder="IFSC Code" value={bankDetails.ifsc} onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })} style={{ ...inputStyle, marginBottom: '8px' }} />
            <input placeholder="Bank Name" value={bankDetails.bank} onChange={(e) => setBankDetails({ ...bankDetails, bank: e.target.value })} style={inputStyle} />
          </div>
        </div>
      )}

      <button onClick={handleActionSubmit} disabled={submitting} style={{ width: '100%', padding: '14px', backgroundColor: 'maroon', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
        {submitting ? 'Submitting...' : `SUBMIT ${actionType.toUpperCase()} REQUEST`}
      </button>
    </div>
  </div>
      )}
    </div>
  );
}

const orderCard = { border: '1px solid #eaeaec', borderRadius: '8px', marginBottom: '25px', overflow: 'hidden', backgroundColor: '#fff' };
const orderHeader = { padding: '15px 20px', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const trackingContainer = { padding: '30px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const shopBtn = { marginTop: '20px', padding: '12px 30px', backgroundColor: 'maroon', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' };
const detailBtn = { background: 'none', border: '1px solid #d4d5d9', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#535766', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d4d5d9', borderRadius: '4px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', color: '#282c3f', backgroundColor: '#fff' };

const lineStyle = (active) => ({ flex: 1, height: '2px', backgroundColor: active ? '#03a685' : '#eaeaec', margin: '0 10px' });
const stepStyle = (active) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: active ? '#03a685' : '#94969f', fontSize: '12px', fontWeight: '600' });
const statusBadge = (status) => {
  const colors = { Placed: '#2196f3', Shipped: '#ff9800', Delivered: '#03a685', Cancelled: '#f44336' };
  return { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#fff', backgroundColor: colors[status] || '#ccc', textTransform: 'uppercase' };
};
