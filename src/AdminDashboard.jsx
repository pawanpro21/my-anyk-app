import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from "./services/api";
import {
  Trash2, Edit, Plus, X, Lock, LogOut, Upload, Bell, Image, Tag,
  ShoppingBag, Package, RefreshCw, ChevronDown, ToggleLeft, ToggleRight,
  Save, AlertCircle, Check, Edit3, Search, RotateCcw, CheckCircle, XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

import { API_URL } from "./config/api";

const SUBMENU_OPTIONS = [
  { label: "Round Shape T-Shirt", value: "Round Shape" },
  { label: "V-Shape T-Shirt", value: "V-Shape" },
  { label: "Solid Collar Polo", value: "Collar Polo" }
];

const SORT_LABEL_OPTIONS = [
  { label: "None", value: "" },
  { label: "Price Drop", value: "Price Drop" },
  { label: "New Edition", value: "New Edition" }
];

const isVideoFile = (rawUrl = '') => /\.(mp4|webm|ogg)(\?.*)?$/i.test(rawUrl);

// ─────────────────────────────────────────────
// GLOBAL SEARCH BAR COMPONENT
// ─────────────────────────────────────────────
function GlobalSearchBar({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
      setOpen(true);
    } catch { setResults(null); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (tab, label) => {
    setOpen(false);
    setQuery(label);
    setTimeout(() => { setQuery(''); setResults(null); }, 800);
    onNavigate(tab);
  };

  const totalCount = results
    ? (results.products?.length || 0) + (results.orders?.length || 0) + (results.coupons?.length || 0)
    : 0;

  const typeColors = { product: '#282c3f', order: '#2196f3', coupon: '#03a685' };
  const typeBg = { product: '#f5f5f6', order: '#e3f2fd', coupon: '#e8f5e9' };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '320px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f6', border: '1.5px solid', borderColor: open ? 'maroon' : '#eaeaec', borderRadius: '8px', padding: '8px 14px', transition: 'border-color 0.2s' }}>
        {loading ? <RefreshCw size={15} color="#94969f" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} /> : <Search size={15} color="#94969f" style={{ flexShrink: 0 }} />}
        <input type="text" value={query} onChange={handleInput} onFocus={() => results && setOpen(true)} placeholder="Search products, orders, coupons..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#282c3f', width: '100%' }} />
        {query && <button onClick={() => { setQuery(''); setResults(null); setOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94969f' }}><X size={14} /></button>}
      </div>

      {open && results && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', border: '1px solid #eaeaec', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 3000, maxHeight: '420px', overflowY: 'auto' }}>
          {totalCount === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94969f', fontSize: '13px' }}>
              <Search size={28} color="#d4d5d9" style={{ display: 'block', margin: '0 auto 8px' }} />
              No results found for "{query}"
            </div>
          ) : (
            <>
              {results.products?.length > 0 && (
                <div>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: '800', color: '#94969f', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f5f5f6' }}>Products ({results.products.length})</div>
                  {results.products.map(p => (
                    <div key={p.id} onClick={() => handleSelect('products', p.title)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {p.image_url ? <img src={p.image_url.startsWith('http') ? p.image_url : `${API_URL}${p.image_url}`} alt="" style={{ width: '36px', height: '46px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid #eaeaec' }} /> : <div style={{ width: '36px', height: '46px', background: '#f5f5f6', borderRadius: '4px', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#282c3f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                        <div style={{ fontSize: '11px', color: '#94969f', marginTop: '2px' }}>₹{p.price} {p.discount > 0 && <span style={{ color: '#03a685' }}>· {p.discount}% OFF</span>} · ID: {p.id}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', background: typeBg.product, color: typeColors.product, padding: '2px 8px', borderRadius: '20px', flexShrink: 0 }}>Product</span>
                    </div>
                  ))}
                </div>
              )}
              {results.orders?.length > 0 && (
                <div style={{ borderTop: results.products?.length > 0 ? '1px solid #f5f5f6' : 'none' }}>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: '800', color: '#94969f', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f5f5f6' }}>Orders ({results.orders.length})</div>
                  {results.orders.map(o => (
                    <div key={o.order_id} onClick={() => handleSelect('orders', `Order #${o.order_id}`)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: '36px', height: '36px', background: '#e3f2fd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={16} color="#2196f3" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#282c3f' }}>Order #{o.order_id} · {o.customer_name || 'Customer'}</div>
                        <div style={{ fontSize: '11px', color: '#94969f', marginTop: '2px' }}>₹{o.total_amount} · {o.order_status} · {o.mobile || ''}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', background: typeBg.order, color: typeColors.order, padding: '2px 8px', borderRadius: '20px', flexShrink: 0 }}>Order</span>
                    </div>
                  ))}
                </div>
              )}
              {results.coupons?.length > 0 && (
                <div style={{ borderTop: (results.products?.length > 0 || results.orders?.length > 0) ? '1px solid #f5f5f6' : 'none' }}>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: '800', color: '#94969f', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f5f5f6' }}>Coupons ({results.coupons.length})</div>
                  {results.coupons.map(c => (
                    <div key={c.id} onClick={() => handleSelect('coupons', c.code)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: '36px', height: '36px', background: '#e8f5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Tag size={16} color="#03a685" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#282c3f' }}>{c.code}</div>
                        <div style={{ fontSize: '11px', color: '#94969f', marginTop: '2px' }}>{c.discount_value}% OFF · Min ₹{c.min_cart_value} · {c.status === 1 ? '✅ Active' : '⭕ Inactive'}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', background: typeBg.coupon, color: typeColors.coupon, padding: '2px 8px', borderRadius: '20px', flexShrink: 0 }}>Coupon</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding: '8px 14px', borderTop: '1px solid #f5f5f6', background: '#fafafa', borderRadius: '0 0 10px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94969f' }}>{totalCount} result{totalCount !== 1 ? 's' : ''} found</span>
              </div>
            </>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: ADD PRODUCT
// ─────────────────────────────────────────────
function AddProductTab({ onBack }) {
  const [formData, setFormData] = useState({
    title: '', category: 'Men', submenu: 'Round Shape', price: '', discount: '', color: '', size: '',
    stock_label: 'In Stock', sort_label: '', specifications: '', search_keywords: ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) { alert("Maximum 6 images allowed!"); return; }
    setImages([...images, ...files]);
    setPreviews([...previews, ...files.map(f => URL.createObjectURL(f))]);
  };
  const removeImage = (i) => { setImages(images.filter((_, idx) => idx !== i)); setPreviews(previews.filter((_, idx) => idx !== i)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (images.length === 0) { alert("⚠️ Please upload at least one image!"); setLoading(false); return; }
    let finalSpecs = formData.specifications.trim() || '{}';
    try { JSON.parse(finalSpecs); } catch { alert('⚠️ Invalid JSON in Specifications!'); setLoading(false); return; }
    let mappedCategory = (formData.category || 'Men').toLowerCase();
    if (mappedCategory === 'men') mappedCategory = 'mens';
    if (mappedCategory === 'women') mappedCategory = 'womens';
    
    const data = new FormData();
    data.append('title', formData.title.trim()); data.append('category', mappedCategory);
    data.append('price', formData.price || 0); data.append('discount', formData.discount || 0);
    const keywords = [formData.search_keywords, formData.submenu, formData.sort_label, formData.stock_label].filter(Boolean).join(', ');
    data.append('color', formData.color.trim() || 'White'); data.append('size', formData.size.trim() || 'M');
    data.append('submenu', formData.submenu);
    data.append('stock_label', formData.stock_label);
    data.append('sort_label', formData.sort_label);
    data.append('specifications', finalSpecs); data.append('search_keywords', keywords.trim());
    images.forEach(img => data.append('images', img));

    try {
      const res = await api.post(`/api/admin/add-product`, data);
      if (res.data.success) { Swal.fire('Success', 'Product Added Successfully!', 'success'); onBack(); }
    } catch (err) { alert(err.response?.data?.message || "Error adding product"); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="add-product-form">
      <div className="form-grid">
        <div className="form-group"><label>Product Title</label><input type="text" name="title" onChange={handleChange} required placeholder="e.g. Blue Slim Fit Shirt" /></div>
        <div className="form-group"><label>Category</label><select name="category" onChange={handleChange} value={formData.category}><option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option></select></div>
        <div className="form-group"><label>Header Submenu</label><select name="submenu" onChange={handleChange} value={formData.submenu}>{SUBMENU_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
        <div className="form-group"><label>Sort/Marketing Label</label><select name="sort_label" onChange={handleChange} value={formData.sort_label}>{SORT_LABEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
        <div className="form-group"><label>Stock / Product Badge</label><select name="stock_label" onChange={handleChange} value={formData.stock_label}><option value="">None</option>{STOCK_QUICK_PICKS.map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}</select></div>
        <div className="form-group"><label>Price (₹)</label><input type="number" name="price" onChange={handleChange} required /></div>
        <div className="form-group"><label>Discount (%)</label><input type="number" name="discount" onChange={handleChange} placeholder="0" /></div>
        <div className="form-group"><label>Color</label><input type="text" name="color" onChange={handleChange} placeholder="e.g. Blue" /></div>
        <div className="form-group"><label>Sizes (Comma separated)</label><input type="text" name="size" onChange={handleChange} placeholder="S, M, L, XL" /></div>
      </div>
      <div className="form-group"><label>Specifications (JSON Format)</label><textarea name="specifications" onChange={handleChange} rows="4" className="specs-textarea" placeholder='{"Fabric": "Cotton", "Pattern": "Solid"}' style={{ fontFamily: 'monospace' }}></textarea></div>
      <div className="form-group"><label>Hidden Search Keywords (SEO)</label><input type="text" name="search_keywords" onChange={handleChange} placeholder="e.g. gym wear, summer shirt, casual" /></div>
      <div className="image-upload-section" style={{ marginTop: '25px', marginBottom: '25px' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', border: '2px dashed #ff3f6c', color: 'maroon', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
          <Upload size={20} /> Select Images (Up to 6)
          <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
        </label>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: 'relative', width: '80px', height: '105px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #d4d5d9' }}>
              <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer' }}><X size={12} /></button>
            </div>
          ))}
        </div>
      </div>
      <button type="submit" disabled={loading} style={{ backgroundColor: 'maroon', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
        {loading ? "SAVING PRODUCT ASSETS..." : "UPLOAD PRODUCT TO CATALOG"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// TAB: NOTIFICATION MANAGER
// ─────────────────────────────────────────────
function NotificationTab() {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/api/admin/settings/notification_text`)
      .then(res => { if (res.data.value) setText(res.data.value); }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post(`${API_URL}/api/admin/settings`, { key: 'notification_text', value: text });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch { alert("Save failed!"); } finally { setSaving(false); }
  };

  return (
    <div style={tabContentStyle}>
      <SectionHeader icon={<Bell size={18} />} title="Header Notification Bar" subtitle="Update the promotional text displayed at the top of the store" />
      <div style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '8px', padding: '24px' }}>
        <label style={labelStyle}>Notification Text</label>
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Offer Zone: Hurry! Limited Time Deals for New Users" style={inputStyle} maxLength={150} />
        <div style={{ marginTop: '20px', background: '#282c3f', color: 'white', padding: '10px 20px', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>
          <span style={{ color: '#ff3f6c', marginRight: '6px' }}>Preview:</span>{text || 'Offer Zone: Hurry! Limited Time Deals for New Users'}
        </div>
        <SaveButton saving={saving} saved={saved} onClick={save} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: BANNER CAROUSEL MANAGER
// ─────────────────────────────────────────────
function BannerTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = () => {
    api.get(`/api/admin/banners`).then(res => setBanners(res.data.banners || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchBanners(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (banners.length + files.length > 5) { alert("Maximum 5 banners allowed!"); return; }
    setUploading(true);
    const fd = new FormData(); files.forEach(f => fd.append('banners', f));
    try { await api.post(`${API_URL}/api/admin/banners/upload`, fd); fetchBanners(); }
    catch { alert("Upload failed!"); } finally { setUploading(false); }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try { await api.delete(`/api/admin/banners/${id}`); fetchBanners(); } catch { alert("Delete failed!"); }
  };

  const toggleBanner = async (id, active) => {
    try { await api.put(`/api/admin/banners/${id}/toggle`, { active: !active }); fetchBanners(); } catch { alert("Toggle failed!"); }
  };

  return (
    <div style={tabContentStyle}>
      <SectionHeader icon={<Image size={18} />} title="Carousel Banner Manager" subtitle="Manage sliding banners on the home page (max 5)" />
      <div style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '8px', padding: '24px' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: '2px dashed #ff3f6c', color: 'maroon', cursor: 'pointer', fontWeight: 'bold', borderRadius: '6px', marginBottom: '24px' }}>
          <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload New Banner(s)'}
          <input type="file" multiple accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
        </label>
        {loading ? <p style={{ color: '#94969f' }}>Loading banners...</p> : banners.length === 0 ? <div style={emptyState}><Image size={40} color="#d4d5d9" /><p>No banners uploaded yet.</p></div> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {banners.map((banner, idx) => (
              <div key={banner.id} style={{ position: 'relative', width: '220px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${banner.active ? '#03a685' : '#eaeaec'}`, opacity: banner.active ? 1 : 0.55 }}>
                <img src={`${API_URL}${banner.image_url}`} alt={`Banner ${idx + 1}`} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '10px 12px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: banner.active ? '#03a685' : '#94969f' }}>{banner.active ? '● Active' : '○ Inactive'}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => toggleBanner(banner.id, banner.active)} style={{ background: 'none', border: '1px solid #d4d5d9', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', color: banner.active ? '#03a685' : '#94969f', fontSize: '11px', fontWeight: '700' }}>{banner.active ? 'Hide' : 'Show'}</button>
                    <button onClick={() => deleteBanner(banner.id)} style={{ background: 'none', border: '1px solid #ffcdd2', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', color: 'maroon' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: COLLECTION IMAGE MANAGER
// ─────────────────────────────────────────────
function PromoBannerTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('Summer AO Edition Live Now');
  const [redirectLink, setRedirectLink] = useState('/mens');

  const fetchPromoBanners = () => {
    setLoading(true);
    api.get('/api/admin/promo-banners')
      .then(res => setBanners(res.data.banners || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPromoBanners(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('banner', file);
    fd.append('title', title || 'Summer AO Edition Live Now');
    fd.append('redirect_link', redirectLink || '/mens');

    try {
      await api.post(`${API_URL}/api/admin/promo-banners/upload`, fd);
      fetchPromoBanners();
      Swal.fire({ title: 'Uploaded!', text: 'Promo banner is live now.', icon: 'success', timer: 1300, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: 'Upload Failed', text: err.response?.data?.message || 'Could not upload promo banner.', icon: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleBanner = async (id, active) => {
    try {
      await api.put(`/api/admin/promo-banners/${id}/toggle`, { active: !active });
      fetchPromoBanners();
    } catch (err) {
      Swal.fire({ title: 'Update Failed', text: err.response?.data?.message || 'Could not update promo banner.', icon: 'error' });
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this promo banner?')) return;
    try {
      await api.delete(`/api/admin/promo-banners/${id}`);
      fetchPromoBanners();
    } catch (err) {
      Swal.fire({ title: 'Delete Failed', text: err.response?.data?.message || 'Could not delete promo banner.', icon: 'error' });
    }
  };

  return (
    <div style={tabContentStyle}>
      <SectionHeader icon={<Image size={18} />} title="Promo Banner Manager" subtitle="Manage the animated strip shown above Men, Women and Kids collection sections" />
      <div style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '8px', padding: '24px', marginBottom: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>Banner Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Summer AO Edition Live Now" />
          </div>
          <div>
            <label style={labelStyle}>Redirect Link</label>
            <input value={redirectLink} onChange={e => setRedirectLink(e.target.value)} style={inputStyle} placeholder="/mens" />
          </div>
        </div>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: '2px dashed #ff3f6c', color: 'maroon', cursor: 'pointer', fontWeight: 'bold', borderRadius: '6px' }}>
          <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Promo Video / GIF / Banner'}
          <input type="file" accept="image/*,video/mp4,video/webm,video/ogg,.gif,.mp4,.webm,.ogg" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </div>

      {loading ? <p style={{ color: '#94969f' }}>Loading promo banners...</p> : banners.length === 0 ? (
        <div style={emptyState}><Image size={40} color="#d4d5d9" /><p>No promo banner uploaded yet. A default animated banner will show on the site.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {banners.map((banner) => {
            const imgSrc = banner.image_url?.startsWith('http') ? banner.image_url : `${API_URL}${banner.image_url}`;
            return (
              <div key={banner.id} style={{ background: '#fff', border: `2px solid ${banner.active ? '#03a685' : '#eaeaec'}`, borderRadius: '8px', overflow: 'hidden', opacity: banner.active ? 1 : 0.6 }}>
                {isVideoFile(imgSrc) ? (
                  <video src={imgSrc} style={{ width: '100%', height: '140px', objectFit: 'contain', background: 'transparent', display: 'block' }} autoPlay muted loop playsInline />
                ) : (
                  <img src={imgSrc} alt={banner.title || 'Promo banner'} style={{ width: '100%', height: '140px', objectFit: 'contain', background: 'transparent', display: 'block' }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', padding: '12px 14px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#282c3f' }}>{banner.title || 'Promo Banner'}</div>
                    <div style={{ fontSize: '12px', color: '#7e818c', marginTop: '4px' }}>Link: {banner.redirect_link || '/mens'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: banner.active ? '#03a685' : '#94969f' }}>{banner.active ? 'Active' : 'Inactive'}</span>
                    <button onClick={() => toggleBanner(banner.id, banner.active)} style={{ background: 'none', border: '1px solid #d4d5d9', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', color: banner.active ? '#03a685' : '#94969f', fontSize: '12px', fontWeight: 800 }}>{banner.active ? 'Hide' : 'Show'}</button>
                    <button onClick={() => deleteBanner(banner.id)} style={{ background: 'none', border: '1px solid #ffcdd2', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', color: 'maroon' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CollectionTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');

  const fetchCollections = () => {
    setLoading(true);
    api.get('/api/admin/collections')
      .then(res => setItems(res.data.collections || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCollections(); }, []);

  const updateField = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const saveItem = async (item, file) => {
    const key = `${item.section}-${item.slot}`;
    setSavingKey(key);
    const fd = new FormData();
    fd.append('title', item.title || '');
    fd.append('search_key', item.search_key || '');
    if (file) fd.append('image', file);

    try {
      await api.put(`/api/admin/collections/${item.section}/${item.slot}`, fd);
      fetchCollections();
      Swal.fire({ title: 'Saved!', text: 'Collection image updated.', icon: 'success', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: 'Save Failed', text: err.response?.data?.message || 'Could not update collection.', icon: 'error' });
    } finally {
      setSavingKey('');
    }
  };

  const grouped = ['men', 'women', 'kids'].map(section => ({
    section,
    label: section === 'men' ? "Men's Collection" : section === 'women' ? "Women's Collection" : "Kid's Collection",
    items: items.filter(item => item.section === section)
  }));

  return (
    <div style={tabContentStyle}>
      <SectionHeader icon={<Image size={18} />} title="Collection Image Manager" subtitle="Manage Men, Women and Kids collection tiles shown on the home page" />
      {loading ? <p style={{ color: '#94969f' }}>Loading collections...</p> : grouped.map(group => (
        <div key={group.section} style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 14px 0', color: '#282c3f' }}>{group.label}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {group.items.map(item => {
              const key = `${item.section}-${item.slot}`;
              const imgSrc = item.image_url ? `${API_URL}${item.image_url}` : '';
              return (
                <div key={item.id} style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '8px', padding: '16px' }}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }} />
                  ) : (
                    <div style={{ height: '150px', borderRadius: '6px', background: '#f5f5f6', color: '#94969f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>Using default image</div>
                  )}
                  <label style={labelStyle}>Title</label>
                  <input value={item.title || ''} onChange={e => updateField(item.id, 'title', e.target.value)} style={inputStyle} />
                  <label style={{ ...labelStyle, marginTop: '10px' }}>Search Key</label>
                  <input value={item.search_key || ''} onChange={e => updateField(item.id, 'search_key', e.target.value)} style={inputStyle} />
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '9px 14px', border: '1.5px dashed maroon', color: 'maroon', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                    <Upload size={15} /> Choose Image
                    <input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && saveItem(item, e.target.files[0])} />
                  </label>
                  <button onClick={() => saveItem(item)} disabled={savingKey === key} style={{ marginLeft: '10px', padding: '9px 14px', border: 'none', borderRadius: '6px', background: 'maroon', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                    {savingKey === key ? 'Saving...' : 'Save Text'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: COUPON MANAGER
// ─────────────────────────────────────────────
function CouponTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', value: '', min: '', desc: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCoupons = () => { api.get(`/api/admin/coupons`).then(res => setCoupons(res.data.coupons || [])).finally(() => setLoading(false)); };
  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.value || !form.min) { alert("Code, value, and minimum amount required!"); return; }
    setSaving(true);
    try {
      if (editId) { await api.put(`/api/admin/coupons/${editId}`, form); setEditId(null); }
      else { await api.post(`/api/admin/coupons`, form); }
      setForm({ code: '', value: '', min: '', desc: '' }); fetchCoupons();
    } catch (err) { alert(err.response?.data?.message || "Save failed!"); } finally { setSaving(false); }
  };

  const toggleCoupon = async (id, status) => { try { await api.put(`/api/admin/coupons/${id}/toggle`, { status: status === 1 ? 0 : 1 }); fetchCoupons(); } catch { alert("Toggle failed!"); } };
  const deleteCoupon = async (id) => { if (!window.confirm("Are you sure you want to delete this coupon?")) return; try { await api.delete(`/api/admin/coupons/${id}`); fetchCoupons(); } catch { alert("Delete failed!"); } };
  const startEdit = (c) => { setForm({ code: c.code, value: c.discount_value, min: c.min_cart_value, desc: c.description || '' }); setEditId(c.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div style={tabContentStyle}>
      <SectionHeader icon={<Tag size={18} />} title="Coupon Manager" subtitle="Manage discount coupons available for customers" />
      <div style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#282c3f' }}>{editId ? '✏️ Edit Coupon' : '➕ Add New Coupon'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '12px', alignItems: 'end' }}>
          <div><label style={labelStyle}>Coupon Code *</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ANYK10" style={inputStyle} /></div>
          <div><label style={labelStyle}>Discount % *</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="10" style={inputStyle} /></div>
          <div><label style={labelStyle}>Min Cart Value (₹) *</label><input type="number" value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} placeholder="399" style={inputStyle} /></div>
          <div><label style={labelStyle}>Description</label><input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="10% OFF on ₹399+" style={inputStyle} /></div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} disabled={saving} style={{ ...actionBtn, background: 'maroon' }}>{saving ? 'Saving...' : editId ? 'Update Coupon' : 'Add Coupon'}</button>
          {editId && <button onClick={() => { setEditId(null); setForm({ code: '', value: '', min: '', desc: '' }); }} style={{ ...actionBtn, background: '#535766' }}>Cancel</button>}
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? <p style={{ padding: '20px', color: '#94969f' }}>Loading coupons...</p> : coupons.length === 0 ? <div style={emptyState}><Tag size={36} color="#d4d5d9" /><p>No coupons available.</p></div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead><tr style={{ background: '#f5f5f6', textAlign: 'left' }}>{['Code', 'Discount', 'Min Value', 'Description', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#535766', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} style={{ borderTop: '1px solid #f5f5f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700', color: '#282c3f' }}>{c.code}</td>
                  <td style={{ padding: '12px 16px', color: '#03a685', fontWeight: '700' }}>{c.discount_value}%</td>
                  <td style={{ padding: '12px 16px' }}>₹{c.min_cart_value}</td>
                  <td style={{ padding: '12px 16px', color: '#535766', fontSize: '13px' }}>{c.description || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: c.status === 1 ? '#e8f5e9' : '#fce4ec', color: c.status === 1 ? '#03a685' : 'maroon' }}>{c.status === 1 ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(c)} style={iconBtn}><Edit3 size={14} /></button>
                      <button onClick={() => toggleCoupon(c.id, c.status)} style={{ ...iconBtn, color: c.status === 1 ? '#94969f' : '#03a685' }}>{c.status === 1 ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</button>
                      <button onClick={() => deleteCoupon(c.id)} style={{ ...iconBtn, color: 'maroon' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: ORDER MONITOR
// ─────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [newCount, setNewCount] = useState(0);

  const statusList = ['All', 'Placed', 'Shipped', 'Delivered', 'Cancelled'];
  const statusColors = { Placed: '#2196f3', Shipped: '#ff9800', Delivered: '#03a685', Cancelled: '#f44336' };

  const fetchOrders = () => {
    api.get(`/api/admin/all-orders`).then(res => {
      const data = res.data.orders || [];
      setOrders(data); setNewCount(data.filter(o => o.order_status === 'Placed').length);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, order_status: newStatus } : o));
      setNewCount(prev => orders.filter(o => (o.order_id === orderId ? newStatus : o.order_status) === 'Placed').length);
    } catch { alert("Status update failed!"); } finally { setUpdatingId(null); }
  };

  const filtered = filter === 'All' ? orders : orders.filter(o => o.order_status === filter);

  return (
    <div style={tabContentStyle}>
      <SectionHeader icon={<Package size={18} />} title="Order Monitor" subtitle="Monitor all customer orders and update delivery status" badge={newCount > 0 ? `${newCount} New` : null} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statusList.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1.5px solid', borderColor: filter === s ? 'maroon' : '#d4d5d9', background: filter === s ? 'maroon' : 'white', color: filter === s ? 'white' : '#535766', transition: 'all 0.15s' }}>
            {s} {s === 'Placed' && newCount > 0 && <span style={{ marginLeft: '6px', background: '#ff3f6c', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>{newCount}</span>}
          </button>
        ))}
        <button onClick={fetchOrders} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1.5px solid #d4d5d9', background: 'white', color: '#535766', display: 'flex', alignItems: 'center', gap: '5px' }}><RefreshCw size={13} /> Refresh</button>
      </div>
      {loading ? <p style={{ color: '#94969f' }}>Loading orders...</p> : filtered.length === 0 ? <div style={emptyState}><ShoppingBag size={40} color="#d4d5d9" /><p>No orders found for this filter.</p></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(order => (
            <div key={order.order_id} style={{ background: '#fff', border: order.order_status === 'Placed' ? '2px solid #ff3f6c' : '1px solid #eaeaec', borderRadius: '8px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '14px', color: '#282c3f' }}>#{order.order_id}</span>
                  {order.order_status === 'Placed' && <span style={{ background: '#ff3f6c', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>NEW</span>}
                </div>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#535766' }}>👤 {order.customer_name || 'Customer'} &nbsp;|&nbsp; 📱 {order.mobile || '—'}</p>
                <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#7e818c' }}>
                  📍 {[order.house_no, order.area_colony, order.city, order.state, order.pincode].filter(Boolean).join(', ') || 'Address not available'}
                </p>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#535766' }}>💰 ₹{order.total_amount} &nbsp;|&nbsp; {order.payment_mode} &nbsp;|&nbsp; {order.items_count || 0} item(s)</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94969f' }}>🕒 {new Date(order.order_date).toLocaleString('en-IN')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#fff', background: statusColors[order.order_status] || '#ccc' }}>{order.order_status}</span>
                {order.order_status !== 'Cancelled' && (
                  <div style={{ position: 'relative' }}>
                    <select value={order.order_status} disabled={updatingId === order.order_id} onChange={e => updateStatus(order.order_id, e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid #282c3f', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: '#282c3f', background: 'white', cursor: 'pointer', outline: 'none', appearance: 'none', paddingRight: '30px', minWidth: '140px' }}>
                      <option value="Placed">📦 Placed</option><option value="Shipped">🚚 Shipped</option><option value="Delivered">✅ Delivered</option><option value="Cancelled">❌ Cancelled</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#282c3f' }} />
                  </div>
                )}
                {updatingId === order.order_id && <span style={{ fontSize: '12px', color: '#94969f' }}>Updating...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🟢 ─────────────────────────────────────────────
// NEW TAB: RETURNS & EXCHANGES (ACTION REQUESTS)
// ─────────────────────────────────────────────
function ActionsTab() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = () => {
    setLoading(true);
    api.get(`/api/admin/order-actions`)
      .then(res => setActions(res.data.actions || []))
      .catch(() => Swal.fire('Error', 'Could not fetch action requests.', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchActions(); }, []);

  const updateActionStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/order-actions/${id}/status`, { status });
      fetchActions();
      Swal.fire('Updated', `Request marked as ${status}.`, 'success');
    } catch {
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  };

  const parseBankDetails = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  return (
    <div style={tabContentStyle}>
      <SectionHeader icon={<RotateCcw size={18} />} title="Returns & Exchanges" subtitle="Manage customer requests for order returns and exchanges" />
      <div style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: '#f5f5f6', borderBottom: '1px solid #eaeaec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#535766' }}>All Requests ({actions.length})</span>
          <button onClick={fetchActions} style={iconBtn}><RefreshCw size={14} /> Refresh</button>
        </div>
        
        {loading ? <p style={{ padding: '20px', color: '#94969f' }}>Loading requests...</p> : actions.length === 0 ? <div style={emptyState}><RotateCcw size={36} color="#d4d5d9" /><p>No return or exchange requests right now.</p></div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#fafafa', textAlign: 'left', borderBottom: '1px solid #eaeaec' }}>
                <th style={{ padding: '12px 16px', color: '#535766' }}>Action ID / Order</th>
                <th style={{ padding: '12px 16px', color: '#535766' }}>Customer</th>
                <th style={{ padding: '12px 16px', color: '#535766' }}>Product & Type</th>
                <th style={{ padding: '12px 16px', color: '#535766' }}>Reason & Details</th>
                <th style={{ padding: '12px 16px', color: '#535766' }}>Status</th>
                <th style={{ padding: '12px 16px', color: '#535766', textAlign: 'right' }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((act) => {
                const isExchange = act.action_type === 'Exchange';
                const bank = parseBankDetails(act.bank_details);
                return (
                  <tr key={act.id} style={{ borderBottom: '1px solid #f5f5f6' }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontWeight: '800', color: '#282c3f', display: 'block' }}>#ACT-{act.id}</span>
                      <span style={{ color: '#03a685', fontSize: '11px', fontWeight: '700' }}>Ord: #{act.order_id}</span>
                    </td>
                    <td style={{ padding: '16px', color: '#535766' }}>
                      <span style={{ display: 'block', fontWeight: '600', color: '#282c3f' }}>{act.customer_name}</span>
                      <span style={{ fontSize: '11px' }}>{act.mobile}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {act.image_url && <img src={act.image_url.startsWith('http') ? act.image_url : `${API_URL}${act.image_url}`} alt="Product" style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <div>
                          <span style={{ display: 'block', fontWeight: '600', color: '#282c3f', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{act.title}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', background: isExchange ? '#e3f2fd' : '#fce4ec', color: isExchange ? '#0d47a1' : 'maroon' }}>{act.action_type.toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#535766', fontSize: '12px', maxWidth: '200px' }}>
                      <span style={{ display: 'block', fontWeight: '700', color: '#282c3f', marginBottom: '4px' }}>{act.reason}</span>
                      {isExchange ? (
                        <span>Requested Size: <strong>{act.requested_size}</strong></span>
                      ) : bank ? (
                        <div style={{ background: '#f5f5f6', padding: '6px', borderRadius: '4px', fontSize: '11px' }}>
                          <div>A/C: {bank.accountNumber}</div>
                          <div>IFSC: {bank.ifsc}</div>
                          <div>Bank: {bank.bank}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: act.status === 'Pending' ? '#fff8e1' : act.status === 'Approved' ? '#e8f5e9' : '#ffebee', color: act.status === 'Pending' ? '#f57f17' : act.status === 'Approved' ? '#03a685' : '#c62828' }}>
                        {act.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {act.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button onClick={() => updateActionStatus(act.id, 'Approved')} style={{ background: '#03a685', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Approve</button>
                          <button onClick={() => updateActionStatus(act.id, 'Rejected')} style={{ background: 'maroon', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Reject</button>
                        </div>
                      ) : <span style={{ color: '#94969f', fontSize: '11px', fontWeight: '600' }}>Updated</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, badge }) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: '#fce4ec', padding: '8px', borderRadius: '8px', color: 'maroon' }}>{icon}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#282c3f' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#7e818c' }}>{subtitle}</p>
        </div>
      </div>
      {badge && <span style={{ background: '#ff3f6c', color: 'white', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>{badge}</span>}
    </div>
  );
}

function SaveButton({ saving, saved, onClick }) {
  return (
    <button onClick={onClick} disabled={saving} style={{ ...actionBtn, background: saved ? '#03a685' : 'maroon', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
    </button>
  );
}

// ─────────────────────────────────────────────
// TABS CONFIG
// ─────────────────────────────────────────────
const TABS = [
  { id: 'products', label: 'Products', icon: <Package size={16} /> },
  { id: 'add', label: '+ Add Product', icon: <Plus size={16} /> },
  { id: 'notification', label: 'Notification', icon: <Bell size={16} /> },
  { id: 'banners', label: 'Banners', icon: <Image size={16} /> },
  { id: 'promo', label: 'Promo Banner', icon: <Image size={16} /> },
  { id: 'collections', label: 'Collections', icon: <Image size={16} /> },
  { id: 'coupons', label: 'Coupons', icon: <Tag size={16} /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
  { id: 'actions', label: 'Returns/Exchanges', icon: <RotateCcw size={16} /> } // 🟢 NEW TAB
];

const STOCK_QUICK_PICKS = [
  { label: 'Only 1 Left!', bg: '#fff3e0', color: '#e65100', border: '#ffe0b2' },
  { label: 'Only 2 Left!', bg: '#fff3e0', color: '#e65100', border: '#ffe0b2' },
  { label: 'Only 3 Left!', bg: '#fff3e0', color: '#e65100', border: '#ffe0b2' },
  { label: 'Only 5 Left!', bg: '#fff8e1', color: '#f57f17', border: '#ffecb3' },
  { label: 'In Stock',     bg: '#e8f5e9', color: '#03a685', border: '#c8e6c9' },
  { label: 'Out of Stock', bg: '#fce4ec', color: 'maroon',  border: '#f9c6d0' },
  { label: 'Best Seller',  bg: '#e3f2fd', color: '#0d47a1', border: '#bbdefb' },
  { label: 'Trending',     bg: '#fbe9e7', color: '#d84315', border: '#ffccbc' }
];

// ─────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', title: '', price: '', discount: '', submenu: '', search_keywords: '', sort_label: '', specifications: '' });
  const [editCurrentImageUrl, setEditCurrentImageUrl] = useState('');
  const [editExistingImageCount, setEditExistingImageCount] = useState(0);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const [editStockLabel, setEditStockLabel] = useState('');
  const [stockSaving, setStockSaving] = useState(false);

  const getStoredUser = () => {
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

  // 🟢 STRICT ADMIN SECURITY CHECK
  useEffect(() => {
    const storedUser = getStoredUser();
    if (String(storedUser?.role || '').trim().toLowerCase() === 'admin') {
      setIsAdminLoggedIn(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdminLoggedIn) fetchProducts(); }, [isAdminLoggedIn]);

  useEffect(() => {
    if (!isAdminLoggedIn) return;
    const check = () => {
      api.get(`/api/admin/new-orders-count`)
        .then(res => setNewOrderCount(res.data.count || 0))
        .catch(() => {});
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  const handleAdminLogin = async (e) => {
    e.preventDefault(); setAuthError('');
    try {
      const res = await api.post(`/api/login`, { identifier: email.trim(), password });
      const { token, user } = res.data;
      // 🟢 ONLY PROCEED IF ROLE IS ADMIN
      if (String(user?.role || '').trim().toLowerCase() === 'admin') {
        if (token) sessionStorage.setItem('auth_token', token);
        if (user) sessionStorage.setItem('auth_user', JSON.stringify(user));
        setIsAdminLoggedIn(true);
        Swal.fire({ title: 'Welcome Admin! 👑', text: 'Secure Dashboard Session Initialized.', icon: 'success', timer: 1500, showConfirmButton: false });
      } else { 
        setAuthError("🚫 Access Denied! You do not have Admin privileges."); 
      }
    } catch (error) { setAuthError("Invalid Admin Credentials or Password!"); }
  };

  const handleAdminLogout = async () => {
    try { await api.post('/api/logout'); } catch {}
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setIsAdminLoggedIn(false); setProducts([]); setActiveTab('products');
  };

  const fetchProducts = () => {
    setLoading(true);
    api.get(`/api/products`)
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : [];
        setProducts(raw.map(item => {
          if (item.image_url && !item.image_url.startsWith('/')) item.image_url = `/${item.image_url}`;
          return item;
        }));
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  const handleDelete = (id, title) => {
    Swal.fire({ title: 'Are you sure?', text: `Delete "${title}" permanently?`, icon: 'warning', showCancelButton: true, confirmButtonColor: 'maroon', cancelButtonColor: '#7e818c', confirmButtonText: 'Yes, Delete it!' })
      .then(result => {
        if (result.isConfirmed) {
          const cleanId = String(id).replace('db-', '');
          api.delete(`/api/admin/delete-product/${cleanId}`)
            .then(() => { Swal.fire('Deleted!', 'Product removed successfully.', 'success'); setProducts(prev => prev.filter(p => p.id !== id)); })
            .catch(() => { setProducts(prev => prev.filter(p => p.id !== id)); Swal.fire('Updated', 'Product removed from list.', 'success'); });
        }
      });
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const existingCount = editExistingImageCount || (editCurrentImageUrl ? 1 : 0);
    if (existingCount + editImageFiles.length + files.length > 6) { Swal.fire('Limit reached', 'Maximum 6 images allowed.', 'warning'); return; }
    setEditImageFiles(prev => [...prev, ...files]);
    setEditImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const openEditModal = async (product) => {
    let specsString = '';
    if (product.specifications) {
      specsString = typeof product.specifications === 'string'
        ? product.specifications
        : JSON.stringify(product.specifications, null, 2);
    }
    const imgUrl = product.image_url
      ? (product.image_url.startsWith('http') ? product.image_url : `${API_URL}${product.image_url.startsWith('/') ? product.image_url : `/${product.image_url}`}`)
      : '';

    setEditForm({
      id: product.id,
      title: product.title,
      price: product.priceNum || product.price,
      discount: product.discount || 0,
      submenu: product.submenu || '',
      search_keywords: product.search_keywords || '',
      sort_label: product.sort_label || '',
      specifications: specsString
    });
    setEditCurrentImageUrl(imgUrl);
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditExistingImageCount(0);
    setEditStockLabel(''); 
    setIsEditModalOpen(true);

    try {
      const res = await api.get(`/api/products/${product.id}`);
      const count = Array.isArray(res.data?.all_images) && res.data.all_images.length > 0
        ? res.data.all_images.length
        : (product.image_url ? 1 : 0);
      setEditExistingImageCount(count);
    } catch { setEditExistingImageCount(product.image_url ? 1 : 0); }

    try {
      const cleanId = String(product.id).replace('db-', '');
      const stockRes = await api.get(`/api/admin/product-stock/${cleanId}`);
      setEditStockLabel(stockRes.data.stock_label || '');
    } catch { setEditStockLabel(''); }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    let specsString = editForm.specifications.trim();
    if (specsString !== '') {
      try { JSON.parse(specsString); }
      catch { Swal.fire('Format Error', '⚠️ Invalid JSON in Specifications!', 'error'); return; }
    }
    const cleanId = String(editForm.id).replace('db-', '');
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('price', editForm.price);
    formData.append('discount', editForm.discount);
    formData.append('submenu', editForm.submenu || '');
    formData.append('search_keywords', [editForm.search_keywords, editForm.submenu, editForm.sort_label, editStockLabel].filter(Boolean).join(', '));
    formData.append('sort_label', editForm.sort_label || '');
    formData.append('specifications', specsString);
    editImageFiles.forEach(f => formData.append('images', f));

    try {
      await api.put(`/api/admin/edit-product/${cleanId}`, formData);

      setStockSaving(true);
      await api.put(`/api/admin/product-stock/${cleanId}`, { stock_label: editStockLabel });
      setStockSaving(false);

      Swal.fire('Success', '✅ Product updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      setStockSaving(false);
      Swal.fire('Save Failed', err.response?.data?.message || 'Unable to save changes.', 'error');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', backgroundColor: '#f5f5f6' }}>
        {/* 🟢 HIDE GLOBAL HEADER ON ADMIN LOGIN PAGE */}
        <style>{`.sticky-header-wrapper, .anyk-notification { display: none !important; } body { background-color: #f5f5f6; }`}</style>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
          <div style={{ background: '#282c3f', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto' }}>
            <Lock size={24} color="white" />
          </div>
          <h2 style={{ marginBottom: '20px', color: '#282c3f', fontWeight: '800' }}>Admin Secure Portal</h2>
          {authError && (
            <div style={{ color: 'maroon', fontSize: '13px', marginBottom: '15px', background: '#fdf2f2', padding: '10px', borderRadius: '4px', borderLeft: '4px solid maroon', fontWeight: '600' }}>
              {authError}
            </div>
          )}
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#535766', marginBottom: '5px', display: 'block', fontWeight: '700' }}>Admin Registered Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d4d5d9', boxSizing: 'border-box' }} placeholder="admin@anyk.com" />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#535766', marginBottom: '5px', display: 'block', fontWeight: '700' }}>Security Key Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d4d5d9', boxSizing: 'border-box' }} placeholder="••••••••" />
            </div>
            <button type="submit" style={{ background: '#ff3f6c', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', letterSpacing: '0.5px' }}>
              ACCESS CONTROL AREA
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', fontFamily: "'Inter', sans-serif" }}>
      {/* 🟢 HIDE GLOBAL HEADER ON ADMIN DASHBOARD */}
      <style>{`.sticky-header-wrapper, .anyk-notification { display: none !important; }`}</style>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #f5f5f6', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: '#282c3f' }}>Admin Control Panel</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#7e818c' }}>Manage catalog, banners, coupons, and orders.</p>
        </div>

        <GlobalSearchBar onNavigate={(tab) => setActiveTab(tab)} />

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {newOrderCount > 0 && (
            <div onClick={() => setActiveTab('orders')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff5f5', border: '1.5px solid #ff3f6c', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer' }}>
              <AlertCircle size={16} color="#ff3f6c" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'maroon' }}>{newOrderCount} New Order{newOrderCount > 1 ? 's' : ''}!</span>
            </div>
          )}
          <button onClick={handleAdminLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#282c3f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '2px solid #f5f5f6', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', borderBottom: activeTab === tab.id ? '3px solid maroon' : '3px solid transparent', color: activeTab === tab.id ? 'maroon' : '#535766', background: 'none', transition: 'all 0.15s', position: 'relative', top: '2px' }}>
            {tab.icon}
            {tab.label}
            {tab.id === 'orders' && newOrderCount > 0 && (
              <span style={{ background: '#ff3f6c', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: '800' }}>{newOrderCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB ROUTING ── */}
      {activeTab === 'products' && (
        <div>
          {loading ? <p style={{ color: '#94969f' }}>Loading products...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eaeaec', backgroundColor: '#f9f9f9' }}>
                  {['Image View', 'Product Details', 'Market Price', 'Active Discount', 'Labels', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#535766', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(item => {
                  const imgUrl = item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`) : '';
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eaeaec' }}>
                      <td style={{ padding: '15px' }}>
                        {imgUrl && <img src={imgUrl} alt={item.title} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px' }} />}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <strong style={{ color: '#282c3f', fontSize: '15px' }}>{item.title}</strong><br />
                        <span style={{ fontSize: '12px', color: '#94969f', fontWeight: '600' }}>ID: {item.id}</span>
                        {item.submenu && <><br /><span style={{ fontSize: '12px', color: 'maroon', fontWeight: '700' }}>Submenu: {item.submenu}</span></>}
                      </td>
                      <td style={{ padding: '15px', fontWeight: '700', color: '#282c3f' }}>₹{item.price || item.priceNum}</td>
                      <td style={{ padding: '15px', fontWeight: '700', color: item.discount > 0 ? '#03a685' : '#535766' }}>
                        {item.discount > 0 ? `${item.discount}% OFF` : '-'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {item.stock_label ? (
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                            background: item.stock_label === 'Out of Stock' ? '#fce4ec' : item.stock_label === 'In Stock' ? '#e8f5e9' : item.stock_label === 'Best Seller' ? '#e3f2fd' : item.stock_label === 'Trending' ? '#fbe9e7' : '#fff3e0',
                            color: item.stock_label === 'Out of Stock' ? 'maroon' : item.stock_label === 'In Stock' ? '#03a685' : item.stock_label === 'Best Seller' ? '#0d47a1' : item.stock_label === 'Trending' ? '#d84315' : '#e65100'
                          }}>
                            {item.stock_label === 'Best Seller' ? '🏆 ' : item.stock_label === 'Trending' ? '🔥 ' : ''}{item.stock_label}
                          </span>
                        ) : <span style={{ color: '#d4d5d9', fontSize: '13px' }}>—</span>}
                        {item.sort_label && (
                          <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '700', color: '#535766' }}>Sort: {item.sort_label}</div>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => openEditModal(item)} style={{ marginRight: '10px', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d4d5d9', backgroundColor: 'white', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id, item.title)} style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', border: '1px solid maroon', backgroundColor: '#fff5f5', color: 'maroon', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94969f', fontWeight: '600' }}>No products found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === 'add' && <AddProductTab onBack={() => { setActiveTab('products'); fetchProducts(); }} />}
      {activeTab === 'notification' && <NotificationTab />}
      {activeTab === 'banners' && <BannerTab />}
      {activeTab === 'promo' && <PromoBannerTab />}
      {activeTab === 'collections' && <CollectionTab />}
      {activeTab === 'coupons' && <CouponTab />}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'actions' && <ActionsTab />}

      {/* ── EDIT MODAL ── */}
      {isEditModalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setIsEditModalOpen(false); }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '480px', textAlign: 'left', boxShadow: '0 18px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eaeaec', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontWeight: '800' }}>Edit Product Context</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#282c3f', fontWeight: '700' }}>
                <X size={18} /> Close
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Product Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Price (₹)</label>
                  <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Discount (%)</label>
                  <input type="number" value={editForm.discount} onChange={e => setEditForm({ ...editForm, discount: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Header Submenu</label>
                  <select value={editForm.submenu || ''} onChange={e => setEditForm({ ...editForm, submenu: e.target.value })} style={inputStyle}>
                    <option value="">None</option>
                    {SUBMENU_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Sort/Marketing Label</label>
                  <select value={editForm.sort_label || ''} onChange={e => setEditForm({ ...editForm, sort_label: e.target.value })} style={inputStyle}>
                    {SORT_LABEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Hidden Search Keywords</label>
                <input type="text" value={editForm.search_keywords || ''} onChange={e => setEditForm({ ...editForm, search_keywords: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Specifications (JSON)</label>
                <textarea rows="4" value={editForm.specifications} onChange={e => setEditForm({ ...editForm, specifications: e.target.value })}
                  placeholder='{"Fabric": "100% Cotton"}' style={{ ...inputStyle, fontFamily: 'monospace' }} />
              </div>

              <div style={{ background: '#fafafa', border: '1.5px solid #eaeaec', borderRadius: '8px', padding: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: '#282c3f' }}>
                  <span>🏷️</span> Stock Labels & Store Highlights
                </label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {STOCK_QUICK_PICKS.map(({ label, bg, color, border }) => {
                    const isSelected = editStockLabel === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setEditStockLabel(isSelected ? '' : label)}
                        style={{
                          padding: '6px 13px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          border: `1.5px solid ${isSelected ? color : '#d4d5d9'}`,
                          background: isSelected ? bg : 'white',
                          color: isSelected ? color : '#535766',
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? `0 0 0 2px ${border}` : 'none'
                        }}
                      >
                        {label === 'In Stock' ? '✅ ' : label === 'Out of Stock' ? '⭕ ' : label === 'Best Seller' ? '🏆 ' : label === 'Trending' ? '🔥 ' : '⚡ '}{label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={editStockLabel}
                  onChange={e => setEditStockLabel(e.target.value)}
                  placeholder="Ya custom text: e.g. New Launch, Limited Edition..."
                  style={{ ...inputStyle, fontSize: '13px' }}
                  maxLength={60}
                />

                {editStockLabel && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94969f', fontWeight: '600' }}>Live Preview:</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '800',
                      background: editStockLabel === 'Out of Stock' ? '#fce4ec' : editStockLabel === 'In Stock' ? '#e8f5e9' : editStockLabel === 'Best Seller' ? '#e3f2fd' : editStockLabel === 'Trending' ? '#fbe9e7' : '#fff3e0',
                      color: editStockLabel === 'Out of Stock' ? 'maroon' : editStockLabel === 'In Stock' ? '#03a685' : editStockLabel === 'Best Seller' ? '#0d47a1' : editStockLabel === 'Trending' ? '#d84315' : '#e65100',
                      border: '1px solid',
                      borderColor: editStockLabel === 'Out of Stock' ? '#f9c6d0' : editStockLabel === 'In Stock' ? '#c8e6c9' : editStockLabel === 'Best Seller' ? '#bbdefb' : editStockLabel === 'Trending' ? '#ffccbc' : '#ffe0b2'
                    }}>
                      {editStockLabel === 'Out of Stock' ? '⭕ ' : editStockLabel === 'In Stock' ? '✅ ' : editStockLabel === 'Best Seller' ? '🏆 ' : editStockLabel === 'Trending' ? '🔥 ' : ''}{editStockLabel}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Upload New Images (optional, max 6 total)</label>
                <div style={{ fontSize: '12px', color: '#7e818c', marginBottom: '6px' }}>Existing: {editExistingImageCount} | Space left: {Math.max(0, 6 - editExistingImageCount)}</div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '6px', border: '1px dashed #d4d5d9', cursor: 'pointer', color: '#282c3f', backgroundColor: '#fafafa' }}>
                  <Upload size={16} />
                  <span>{editImageFiles.length > 0 ? `${editImageFiles.length} image(s) selected` : 'Choose images'}</span>
                  <input type="file" accept="image/*" multiple onChange={handleEditImageChange} hidden />
                </label>
                {editCurrentImageUrl && editImageFiles.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <img src={editCurrentImageUrl} alt="Current" style={{ width: '80px', height: '95px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d4d5d9' }} />
                    <span style={{ color: '#7e818c', fontSize: '12px' }}>Current primary image</span>
                  </div>
                )}
                {editImagePreviews.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                    {editImagePreviews.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '95px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d4d5d9' }}>
                        <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button"
                          onClick={() => { setEditImageFiles(prev => prev.filter((_, i) => i !== idx)); setEditImagePreviews(prev => prev.filter((_, i) => i !== idx)); }}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={stockSaving}
                style={{ backgroundColor: 'maroon', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                {stockSaving ? 'Saving...' : 'SAVE PRODUCT CATALOG ASSETS'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const tabContentStyle = { animation: 'fadeIn 0.2s ease' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#535766', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d4d5d9', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#282c3f' };
const actionBtn = { color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const iconBtn = { background: 'none', border: '1px solid #eaeaec', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', color: '#535766', display: 'flex', alignItems: 'center' };
const emptyState = { padding: '40px', textAlign: 'center', color: '#94969f', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' };
