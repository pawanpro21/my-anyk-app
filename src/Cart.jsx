import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Trash2, CheckCircle2, ChevronLeft, Plus, X, Pencil } from 'lucide-react';
import api from "./services/api";
import Swal from 'sweetalert2';
import { API_URL } from "./config/api";

const toSeoSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function Cart() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [cartItems, setCartItems] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [userId, setUserId] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('bag');

  const [paymentMode, setPaymentMode] = useState('COD');
  const [showScanner, setShowScanner] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [address, setAddress] = useState({
    name: '', mobile: '', pincode: '', houseNo: '', streetAddress: '', locality: '', area: '', city: '', state: ''
  });

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

  const getCleanProductId = (itemOrId) => {
    const rawId = typeof itemOrId === 'object'
      ? itemOrId.product_id || itemOrId.id || itemOrId.productId || itemOrId._id
      : itemOrId;

    return String(rawId || '').replace('db-', '');
  };

  const getImageUrl = (rawImage) => {
    if (!rawImage) return '';
    if (rawImage.startsWith('http')) return rawImage;
    return `${API_URL}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;
  };

  const normalizeCartItem = (item) => {
    const productId = getCleanProductId(item);
    const imageUrl = getImageUrl(item.image || item.image_url);

    return {
      ...item,
      id: productId,
      product_id: productId,
      name: item.name || item.title || 'Product',
      title: item.title || item.name || 'Product',
      image: imageUrl,
      image_url: imageUrl,
      priceNum: Number(item.priceNum ?? item.price) || 0,
      discount: Number(item.discount) || 0,
      selectedSize: item.selectedSize || item.size || 'M',
      quantity: Number(item.quantity) || 1
    };
  };

  const fetchBackendCart = async () => {
    const res = await api.get('/api/cart');
    const items = Array.isArray(res.data) ? res.data : [];
    const normalized = items.map(normalizeCartItem);
    setCartItems(normalized);
    return normalized;
  };

  const clearBackendCart = async () => {
    try {
      await api.delete('/api/cart/clear');
    } catch (err) {
      console.error('Cart clear error:', err);
    }
  };


  // ─── Load user + cart ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadCart = async () => {
      const currentUser = getSessionUser();
      if (!currentUser) {
        Swal.fire({
          title: 'Login Required',
          text: 'Please Login first to access your bag.',
          icon: 'info',
          confirmButtonColor: 'maroon'
        }).then(() => navigate('/login'));
        setCartItems([]);
        return;
      }

      try {
        setUserId(currentUser.id);
        setAddress(prev => ({ ...prev, name: currentUser.name, mobile: currentUser.mobile || '' }));
        fetchAddresses(currentUser.id);
        await fetchBackendCart();
      } catch (err) {
        console.error('Cart fetch error:', err.response?.data || err.message || err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          Swal.fire({
            title: 'Login Required',
            text: 'Please Login first to access your bag.',
            icon: 'info',
            confirmButtonColor: 'maroon'
          }).then(() => navigate('/login'));
        }
        setCartItems([]);
      }
    };

    loadCart();
  }, [navigate]);

  // ─── Fetch active coupons ───────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/api/coupons`)
      .then(res => {
        const active = (res.data.coupons || [])
          .map(c => ({
            id: c.id,
            code: c.code,
            value: c.discount_value,
            min: c.min_cart_value,
            desc: c.description || `${c.discount_value}% OFF on ₹${c.min_cart_value}+`
          }));
        setAvailableCoupons(active);
      })
      .catch(() => {});
  }, []);

  // ─── Backend cart refresh on tab focus ─────────────────────────────────────
  useEffect(() => {
    const syncCart = async () => {
      try {
        await fetchBackendCart();
      } catch (err) {
        console.error('Cart refresh error:', err);
      }
    };
    window.addEventListener('focus', syncCart);
    return () => window.removeEventListener('focus', syncCart);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ─── Scroll on step change ──────────────────────────────────────────────────
  useEffect(() => {
    if (checkoutStep === 'address' || checkoutStep === 'payment') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [checkoutStep]);

  // ─── Load Razorpay script ───────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const fetchAddresses = async (uid) => {
    try {
      const res = await api.get(`/api/address/${uid}`);
      if (res.data.success) {
        setSavedAddresses(res.data.addresses);
        if (res.data.addresses.length > 0) setSelectedAddressId(res.data.addresses[0].id);
        else setShowAddressForm(true);
      }
    } catch (err) { console.error("Error fetching addresses", err); }
  };

  // ─── Price Calculations ─────────────────────────────────────────────────────
  const totalMRP = Math.round(
    cartItems.reduce((sum, item) => sum + ((Number(item.priceNum) || 0) * (Number(item.quantity) || 1)), 0)
  );
  const totalDiscount = Math.round(
    cartItems.reduce((sum, item) => {
      const price = Number(item.priceNum) || 0;
      const disc  = Number(item.discount)  || 0;
      const qty   = Number(item.quantity)  || 1;
      return sum + (disc > 0 ? (price * disc / 100) * qty : 0);
    }, 0)
  );
  const discountedPrice   = Math.round(totalMRP - totalDiscount);
  const couponDiscountVal = appliedCoupon ? Math.round((discountedPrice * Number(appliedCoupon.value)) / 100) : 0;
  const totalAmount       = Math.round(discountedPrice - couponDiscountVal);

  // ✅ FIX 2: Shipping — discounted+coupon amount ke baad check karo (249+ free)
  const deliveryFee  = cartItems.length === 0 ? 0 : totalAmount >= 249 ? 0 : 49;
  const finalPayable = Math.round(totalAmount + deliveryFee);

  // ─── Remove item ────────────────────────────────────────────────────────────
  const removeItem = (targetId) => {
    const cleanTargetId = getCleanProductId(targetId);
    const productToRemove = cartItems.find(item => getCleanProductId(item) === cleanTargetId);
    Swal.fire({
      title: 'REMOVE ITEM?',
      text: "Are you sure you want to remove this item from your bag?",
      icon: 'warning',
      showCancelButton: false,
      showDenyButton: true,
      confirmButtonColor: 'maroon',
      denyButtonColor: '#535766',
      confirmButtonText: 'Yes, remove it!',
      denyButtonText: 'Move to Wishlist',
      allowOutsideClick: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/cart/remove/${encodeURIComponent(cleanTargetId)}`);
          const updated = await fetchBackendCart();
          if (updated.length === 0) removeCoupon();
          Swal.fire({ title: 'Removed!', icon: 'success', timer: 1000, showConfirmButton: false });
        } catch (err) {
          Swal.fire({ title: 'Remove Failed', text: err.response?.data?.message || 'Item could not be removed.', icon: 'error' });
        }
      } else if (result.isDenied) {
        try {
          if (productToRemove) await api.post('/api/wishlist/add', { product_id: cleanTargetId });
          await api.delete(`/api/cart/remove/${encodeURIComponent(cleanTargetId)}`);
          const updated = await fetchBackendCart();
          if (updated.length === 0) removeCoupon();
          Swal.fire({ title: 'Moved to Wishlist! ✨', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (err) {
          Swal.fire({ title: 'Move Failed', text: err.response?.data?.message || 'Item could not be moved.', icon: 'error' });
        }
      }
    });
  };

  // ✅ FIX 3: Remove coupon function
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // ─── Apply coupon ────────────────────────────────────────────────────────────
  const handleApplyCoupon = async (coupon) => {
    if (Number(discountedPrice) < Number(coupon.min)) {
      setCouponError(`Add ₹${coupon.min - discountedPrice} more to apply this code.`);
      return;
    }
    try {
      const response = await api.post(`/api/validate-coupon`, {
        code: coupon.code,
        cartValue: Math.round(discountedPrice),
        userId
      });
      if (response.data.success) {
        const couponData = {
          id:    response.data.couponId,
          code:  coupon.code,
          value: coupon.value
        };
        setAppliedCoupon(couponData);
        setCouponError('');
        Swal.fire({ title: '🎉 Coupon Applied!', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || "Coupon invalid or expired");
      setAppliedCoupon(null);
    }
  };

  const goToProductPage = (item) => {
    const targetId = item.product_id || item.id || item.productId || item._id;
    if (!targetId) return;
    const title = item.title || item.name || "product";
    navigate(`/product/${targetId}/${toSeoSlug(title)}`, { state: { product: item } });
    window.scrollTo(0, 0);
  };

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const startEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddress({
      name: addr.full_name || '',
      mobile: addr.mobile_number || '',
      pincode: addr.pincode || '',
      houseNo: addr.house_no || '',
      streetAddress: addr.street_address || '',
      locality: addr.locality || '',
      area: addr.area_colony || '',
      city: addr.city || '',
      state: addr.state || ''
    });
    setShowAddressForm(true);
  };

  const saveNewAddress = async () => {
    const { pincode, houseNo, city, state, mobile, name } = address;
    if (!pincode || !houseNo || !city || !state || !mobile || !name) {
      Swal.fire({ title: 'Missing Details', icon: 'warning', confirmButtonColor: 'maroon' });
      return;
    }
    try {
      const payload = { 
        userId, 
        fullName: name, 
        mobile, 
        pincode, 
        houseNo, 
        streetAddress: address.streetAddress,
        locality: address.locality,
        area: address.area, 
        city, 
        state 
      };
      const res = editingAddressId
        ? await api.put(`/api/address/${editingAddressId}`, payload)
        : await api.post(`/api/address/add`, payload);

      if (res.data.success) {
        await fetchAddresses(userId);
        setSelectedAddressId(editingAddressId || res.data.addressId);
        setEditingAddressId(null);
        setShowAddressForm(false);
        setCheckoutStep('payment');
      }
    } catch { Swal.fire({ title: 'Error', text: 'Address could not be saved', icon: 'error' }); }
  };

  const getFormattedCartItems = () => {
    return cartItems.map(item => {
      const price = Number(item.priceNum) || 0;
      const disc  = Number(item.discount)  || 0;
      const singleItemFinalPrice = disc > 0
        ? Math.round(price - (price * disc / 100))
        : Math.round(price);
      const rawId = item.product_id || item.id || '';
      const cleanProductId = String(rawId).replace('db-', '');
      return {
        product_id:   Number(cleanProductId) || cleanProductId,
        price:        singleItemFinalPrice,
        selectedSize: item.selectedSize || item.size || 'M',
        quantity:     Number(item.quantity) || 1
      };
    });
  };

  const processOrder = async (refId = null) => {
    Swal.fire({
      title: 'Confirm Order?',
      text: `Payable: ₹${finalPayable} via ${paymentMode}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'maroon',
      cancelButtonColor: '#535766',
      confirmButtonText: 'Confirm'
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const formattedCartItems = getFormattedCartItems();
      try {
        const res = await api.post(`/api/place-order`, {
          userId,
          cartItems: formattedCartItems,
          totalAmount: finalPayable,
          couponId: appliedCoupon?.id || null,
          addressId: selectedAddressId,
          paymentMode,
          transactionId: refId || null
        });
        if (res.data.success) {
          Swal.fire({
            title: 'Order Placed! 🎉',
            text: `Thank you for shopping with Anyk. Order ID: ${res.data.order_id || ''}`,
            icon: 'success',
            confirmButtonColor: 'maroon'
          });
          await clearBackendCart();
          setCartItems([]);
          setAppliedCoupon(null);
          navigate('/orders');
        }
      } catch (err) {
        Swal.fire({
          title: 'Order Failed',
          text: err.response?.data?.message || 'Order could not be placed.',
          icon: 'error',
          confirmButtonColor: 'maroon'
        });
      }
    });
  };

  const handleRazorpayPayment = async () => {
    try {
      const { data } = await api.post(`/api/razorpay/create-order`, {
        cartItems: getFormattedCartItems(),
        couponId: appliedCoupon?.id || null
      });
      if (!data.success) { Swal.fire({ title: 'Error', text: 'Razorpay order could not be created.', icon: 'error' }); return; }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Anyk Originals',
        description: 'Order Payment',
        order_id: data.razorpay_order_id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(`/api/razorpay/verify-payment`, {
              razorpay_order_id:  response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature
            });
            if (verifyRes.data.success) {
              const res = await api.post(`/api/place-order`, {
                userId,
                cartItems: getFormattedCartItems(),
                totalAmount: finalPayable,
                couponId: appliedCoupon?.id || null,
                addressId: selectedAddressId,
                paymentMode: 'Razorpay',
                transactionId: response.razorpay_payment_id
              });
              if (res.data.success) {
                Swal.fire({ title: 'Order Placed! 🎉', text: `Order ID: ${res.data.order_id || ''}`, icon: 'success', confirmButtonColor: 'maroon' });
                await clearBackendCart();
                setCartItems([]); setAppliedCoupon(null);
                navigate('/orders');
              }
            } else { Swal.fire({ title: 'Payment Failed', text: 'Signature not verified.', icon: 'error' }); }
          } catch (err) { Swal.fire({ title: 'Verification Error', text: err.response?.data?.message || 'Payment not verified.', icon: 'error' }); }
        },
        prefill: { name: address.name || '', contact: address.mobile || '' },
        theme: { color: 'maroon' },
        modal: { ondismiss: () => Swal.fire({ title: 'Payment Cancelled', icon: 'info', confirmButtonColor: 'maroon' }) }
      };

      if (!window.Razorpay) { Swal.fire({ title: 'Error', text: 'Razorpay script not loaded.', icon: 'error' }); return; }
      new window.Razorpay(options).open();
    } catch (err) { Swal.fire({ title: 'Error', text: 'Razorpay payment failed.', icon: 'error' }); }
  };

  const handleFinalOrder = async () => {
    if (!selectedAddressId) { Swal.fire({ title: 'Select Address', icon: 'warning', confirmButtonColor: 'maroon' }); return; }
    if (paymentMode === 'Online') setShowScanner(true);
    else if (paymentMode === 'Razorpay') await handleRazorpayPayment();
    else processOrder();
  };

  const inputStyle = { padding: '12px', border: '1px solid #d4d5d9', borderRadius: '4px', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
  const payBtnColor = paymentMode === 'Razorpay' ? '#3395FF' : paymentMode === 'Online' ? '#03a685' : 'maroon';
  const payBtnLabel = paymentMode === 'Razorpay' ? 'PAY WITH RAZORPAY' : paymentMode === 'Online' ? 'PAY & CONFIRM' : 'CONFIRM ORDER';

  return (
    <div style={{ maxWidth: '1100px', margin: isMobile ? '18px auto 24px' : '40px auto', padding: isMobile ? '0 12px' : '0 20px', fontFamily: "'Inter', sans-serif" }}>

      {/* UPI SCANNER MODAL */}
      {showScanner && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '90%', position: 'relative' }}>
            <X size={24} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer' }} onClick={() => setShowScanner(false)} />
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Secure Payment</h2>
            <p style={{ color: '#535766', marginBottom: '15px' }}>Amount: <strong style={{ color: 'maroon', fontSize: '22px' }}>₹{finalPayable}</strong></p>
            <div style={{ padding: '15px', border: '1px solid #eee', display: 'inline-block', borderRadius: '8px', marginBottom: '15px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=anykoriginals@okicici%26pn=ANYK_ORIGINALS%26am=${finalPayable}%26cu=INR`} alt="QR" style={{ width: '180px' }} />
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#535766' }}>ENTER 12-DIGIT TRANSACTION ID (UTR)*</label>
              <input type="text" placeholder="Ex: 4123XXXXXXXX" maxLength="12" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, textAlign: 'center', marginTop: '5px', border: '1px solid maroon' }} />
            </div>
            <button disabled={utrNumber.length < 12} onClick={() => { setShowScanner(false); processOrder(utrNumber); }}
              style={{ width: '100%', padding: '15px', backgroundColor: utrNumber.length === 12 ? '#03a685' : '#ccc', color: 'white', border: 'none', fontWeight: '700', borderRadius: '4px', cursor: utrNumber.length === 12 ? 'pointer' : 'not-allowed' }}>
              PAID - CONFIRM ORDER
            </button>
          </div>
        </div>
      )}

      {/* STEP INDICATOR */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '10px' : '20px', marginBottom: isMobile ? '20px' : '40px', fontSize: isMobile ? '11px' : '14px', fontWeight: '600' }}>
        <span style={{ color: checkoutStep === 'bag' ? 'maroon' : '#03a685' }}>BAG</span>
        <div style={{ width: isMobile ? '20px' : '50px', height: '1px', backgroundColor: '#eaeaec' }} />
        <span style={{ color: checkoutStep === 'address' ? 'maroon' : checkoutStep === 'payment' ? '#03a685' : '#ccc' }}>ADDRESS</span>
        <div style={{ width: isMobile ? '20px' : '50px', height: '1px', backgroundColor: '#eaeaec' }} />
        <span style={{ color: checkoutStep === 'payment' ? 'maroon' : '#ccc' }}>PAYMENT</span>
      </div>

      {/* EMPTY BAG */}
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#f5f5f6', width: '90px', height: '90px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <ShoppingBag size={40} color="#94969f" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#282c3f', margin: '0 0 10px 0' }}>Your Bag is Empty!</h3>
          <p style={{ color: '#7e818c', fontSize: '14px', maxWidth: '350px', margin: '0 0 30px 0', lineHeight: '1.5' }}>Aisa lagta hai aapne abhi tak koi item add nahi kiya.</p>
          <button onClick={() => navigate('/')} style={{ backgroundColor: 'maroon', color: 'white', padding: '14px 30px', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>START FILLING YOUR BAG</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: isMobile ? '16px' : '40px' }}>

          {/* LEFT PANEL */}
          <div style={{ textAlign: 'left' }}>

            {/* BAG STEP */}
            {checkoutStep === 'bag' && (
              <>
                <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '700', marginBottom: isMobile ? '14px' : '20px' }}>MY BAG ({cartItems.length} Items)</h2>
                {cartItems.map((item, rowIdx) => (
                  <div key={`cart-${item.product_id || item.id}-${rowIdx}`} style={{ border: '1px solid #eaeaec', padding: isMobile ? '12px' : '15px', display: 'flex', gap: isMobile ? '12px' : '20px', marginBottom: '15px', position: 'relative' }}>
                    <img src={item.image} alt="" style={{ width: isMobile ? '88px' : '100px', height: isMobile ? '112px' : '130px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ textAlign: 'left', minWidth: 0, flex: 1, paddingRight: isMobile ? '22px' : '28px' }}>
                      <button type="button" onClick={() => goToProductPage(item)} style={{ fontSize: isMobile ? '13px' : '16px', lineHeight: '1.3', padding: 0, border: 'none', background: 'none', color: '#282c3f', fontWeight: '700', cursor: 'pointer', textAlign: 'left', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>{item.name}</button>
                      <p style={{ color: '#94969f', fontSize: '13px', margin: '5px 0' }}>Size: {item.selectedSize || 'M'}</p>
                      <p style={{ color: '#282c3f', fontSize: '13px', margin: '2px 0', fontWeight: '600' }}>Qty: {item.quantity || 1}</p>
                      <span style={{ fontWeight: '700' }}>
                        ₹{item.discount > 0
                          ? Math.round((Number(item.priceNum) * (1 - Number(item.discount) / 100)) * (Number(item.quantity) || 1))
                          : Math.round(Number(item.priceNum) * (Number(item.quantity) || 1))}
                      </span>
                    </div>
                    <Trash2 size={18} style={{ position: 'absolute', right: isMobile ? '10px' : '15px', top: isMobile ? '10px' : '14px', cursor: 'pointer', opacity: 0.5 }} onClick={() => removeItem(item.product_id || item.id)} />
                  </div>
                ))}
              </>
            )}

            {/* ADDRESS STEP */}
            {checkoutStep === 'address' && (
              <div style={{ border: '1px solid #eaeaec', padding: '25px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }} onClick={() => setCheckoutStep('bag')}>
                  <ChevronLeft size={20} /> <span style={{ fontWeight: '700' }}>Select Delivery Address</span>
                </div>
                {!showAddressForm && savedAddresses.map(addr => (
                  <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} style={{ border: selectedAddressId === addr.id ? '2px solid maroon' : '1px solid #eaeaec', padding: '15px', borderRadius: '4px', marginBottom: '15px', cursor: 'pointer', position: 'relative', textAlign: 'left' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startEditAddress(addr); }}
                      style={{ position: 'absolute', right: selectedAddressId === addr.id ? '42px' : '12px', top: '10px', border: '1px solid #d4d5d9', background: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#282c3f' }}
                    >
                      <Pencil size={12} /> EDIT
                    </button>
                    {selectedAddressId === addr.id && <CheckCircle2 size={18} color="maroon" style={{ position: 'absolute', right: '15px' }} />}
                    <h4 style={{ margin: '0 0 5px 0' }}>{addr.full_name}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#535766' }}>{addr.house_no}, {addr.street_address && `${addr.street_address}, `}{addr.locality || addr.area_colony}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#535766' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '13px', fontWeight: '600' }}>Mobile: {addr.mobile_number}</p>
                  </div>
                ))}
                {showAddressForm ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                    <input style={inputStyle} name="name" placeholder="Full Name*" value={address.name} onChange={handleAddressChange} />
                    <input style={inputStyle} name="mobile" placeholder="Mobile*" value={address.mobile} onChange={handleAddressChange} />
                    <input style={{ ...inputStyle, gridColumn: isMobile ? 'span 1' : 'span 2' }} name="houseNo" placeholder="House No / Building Name*" value={address.houseNo} onChange={handleAddressChange} />
                    <input style={{ ...inputStyle, gridColumn: isMobile ? 'span 1' : 'span 2' }} name="streetAddress" placeholder="Street Address / Road Name" value={address.streetAddress} onChange={handleAddressChange} />
                    <input style={inputStyle} name="locality" placeholder="Locality / Area" value={address.locality} onChange={handleAddressChange} />
                    <input style={inputStyle} name="area" placeholder="Landmark (Optional)" value={address.area} onChange={handleAddressChange} />
                    <input style={inputStyle} name="city" placeholder="City*" value={address.city} onChange={handleAddressChange} />
                    <input style={inputStyle} name="state" placeholder="State*" value={address.state} onChange={handleAddressChange} />
                    <input style={inputStyle} name="pincode" placeholder="Pincode*" value={address.pincode} onChange={handleAddressChange} />
                    <button onClick={saveNewAddress} style={{ gridColumn: isMobile ? 'span 1' : 'span 2', padding: '15px', backgroundColor: 'maroon', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                      {editingAddressId ? 'UPDATE ADDRESS' : 'ADD ADDRESS'}
                    </button>
                    {editingAddressId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setShowAddressForm(false);
                          setAddress({ name: '', mobile: '', pincode: '', houseNo: '', streetAddress: '', locality: '', area: '', city: '', state: '' });
                        }}
                        style={{ gridColumn: isMobile ? 'span 1' : 'span 2', padding: '12px', backgroundColor: '#fff', color: '#535766', border: '1px solid #d4d5d9', fontWeight: '700', cursor: 'pointer' }}
                      >
                        CANCEL EDIT
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setShowAddressForm(true)} style={{ width: '100%', padding: '12px', border: '1px dashed maroon', color: 'maroon', background: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Plus size={18} /> ADD NEW ADDRESS
                  </button>
                )}
              </div>
            )}

            {/* PAYMENT STEP */}
            {checkoutStep === 'payment' && (
              <div style={{ border: '1px solid #eaeaec', padding: '25px', borderRadius: '4px' }}>
                <h3 style={{ marginBottom: '10px' }}>Payment Method</h3>
                <div style={{ padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #ffcccc', borderRadius: '4px', fontSize: '13px', color: '#c62828', fontWeight: '600', marginBottom: '20px' }}>
                  🔄 Payment options coming soon!
                </div>
                {[
                  { mode: 'COD',      label: 'Cash on Delivery (COD)',    sub: 'Pay at doorstep',                          color: 'maroon',  bg: '#fff5f5' },
                  { mode: 'Online',   label: 'UPI QR Scanner',            sub: 'Scan QR code and enter UTR manually',       color: '#03a685', bg: '#f0f9f7' },
                  { mode: 'Razorpay', label: 'Pay via Razorpay',          sub: 'UPI, Cards, Net Banking — Instant & Secure', color: '#3395FF', bg: '#f0f5ff' },
                ].map(opt => (
                  <div key={opt.mode}
                    style={{ padding: '20px', border: '1px solid #eaeaec', backgroundColor: 'white', borderRadius: '4px', display: 'flex', gap: '15px', cursor: 'not-allowed', marginBottom: '15px', opacity: 0.6, pointerEvents: 'none' }}>
                    <input type="radio" checked={false} readOnly style={{ accentColor: opt.color }} />
                    <div style={{ textAlign: 'left' }}>
                      <strong>{opt.label}</strong>
                      <p style={{ fontSize: '12px', margin: '2px 0 0 0', color: '#535766' }}>{opt.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>

            {/* COUPON SECTION */}
            {checkoutStep === 'bag' && (
              <div style={{ border: '1px solid #eaeaec', padding: '20px', borderRadius: '4px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#535766', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Tag size={16} /> APPLY COUPON
                </p>

                {/* ✅ FIX 3: Applied coupon banner with REMOVE button */}
                {appliedCoupon && (
                  <div style={{ padding: '12px 16px', background: '#f0f9f7', border: '1.5px solid #03a685', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#03a685" />
                      <div>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#282c3f' }}>{appliedCoupon.code}</span>
                        <p style={{ margin: 0, fontSize: '11px', color: '#03a685', fontWeight: '600' }}>-₹{couponDiscountVal} discount applied!</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{ background: 'none', border: '1px solid #f44336', color: '#f44336', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <X size={12} /> REMOVE
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {availableCoupons.map(cp => (
                    <div key={cp.code} onClick={() => handleApplyCoupon(cp)}
                      style={{ padding: '12px', border: appliedCoupon?.code === cp.code ? '1.5px solid #03a685' : '1px dashed #d4d5d9', borderRadius: '4px', backgroundColor: appliedCoupon?.code === cp.code ? '#f0f9f7' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', opacity: appliedCoupon && appliedCoupon.code !== cp.code ? 0.5 : 1 }}>
                      <div>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{cp.code}</span>
                        <p style={{ fontSize: '11px', color: '#7e818c', margin: 0 }}>{cp.desc}</p>
                      </div>
                      {appliedCoupon?.code === cp.code && <CheckCircle2 size={18} color="#03a685" />}
                    </div>
                  ))}
                  {couponError && <p style={{ color: 'maroon', fontSize: '13px', margin: '12px 0 0 0' }}>{couponError}</p>}
                </div>
              </div>
            )}

            {/* PRICE DETAILS */}
            <div style={{ border: '1px solid #eaeaec', padding: '20px', borderRadius: '4px' }}>
              <h4 style={{ fontSize: '12px', color: '#7e818c', marginBottom: '15px', marginTop: 0 }}>PRICE DETAILS</h4>
              <div style={priceRowStyle}><span>Total MRP</span><span>₹{totalMRP}</span></div>
              <div style={priceRowStyle}><span>Bag Discount</span><span style={{ color: '#03a685' }}>-₹{totalDiscount}</span></div>
              <div style={priceRowStyle}>
                <span>Coupon Discount</span>
                <span style={{ color: couponDiscountVal > 0 ? '#03a685' : '#94969f' }}>
                  {couponDiscountVal > 0 ? `-₹${couponDiscountVal}` : '—'}
                </span>
              </div>
              <div style={priceRowStyle}>
                <span>Shipping Fee</span>
                <span style={{ color: deliveryFee === 0 ? '#03a685' : '#282c3f' }}>
                  {deliveryFee === 0
                    ? <span>FREE <span style={{ fontSize: '11px', color: '#03a685' }}>(₹249+ par free)</span></span>
                    : `₹${deliveryFee}`}
                </span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eaeaec', margin: '15px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px' }}>
                <span>Total Amount</span><span>₹{finalPayable}</span>
              </div>

              {checkoutStep === 'bag'     && <button onClick={() => setCheckoutStep('address')}  style={{ ...actionBtnStyle, backgroundColor: 'maroon'      }}>PLACE ORDER</button>}
              {checkoutStep === 'address' && !showAddressForm && <button onClick={() => setCheckoutStep('payment')} style={{ ...actionBtnStyle, backgroundColor: 'maroon' }}>CONTINUE</button>}
              {checkoutStep === 'payment' && <button disabled onClick={handleFinalOrder} style={{ ...actionBtnStyle, backgroundColor: '#ccc', cursor: 'not-allowed', opacity: 0.6 }}>{payBtnLabel}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const priceRowStyle   = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' };
const actionBtnStyle  = { width: '100%', padding: '15px', color: 'white', border: 'none', fontWeight: '700', marginTop: '20px', cursor: 'pointer', borderRadius: '4px' };
