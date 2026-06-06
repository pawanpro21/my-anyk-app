import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import Swal from 'sweetalert2';
import api from './services/api';
import { API_URL } from './config/api';

const toSeoSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCleanProductId = (item) => String(item?.product_id || item?.id || '').replace('db-', '');

  const getImageUrl = (rawImage) => {
    if (!rawImage) return '';
    if (rawImage.startsWith('http')) return rawImage;
    return `${API_URL}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;
  };

  const normalizeWishlistItem = (item) => {
    const productId = getCleanProductId(item);
    const image = getImageUrl(item.image || item.image_url);

    return {
      ...item,
      id: productId,
      product_id: productId,
      name: item.name || item.title || 'Product',
      image,
      priceNum: Number(item.priceNum ?? item.price) || 0,
      discount: Number(item.discount) || 0
    };
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/api/wishlist');
      const items = res.data?.wishlist || [];
      setWishlistItems(items.map(normalizeWishlistItem));
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      Swal.fire({
        title: 'Wishlist Error',
        text: err.response?.data?.message || 'Could not load wishlist.',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (id) => {
    try {
      await api.delete(`/api/wishlist/remove/${encodeURIComponent(id)}`);
      setWishlistItems(prev => prev.filter(item => getCleanProductId(item) !== String(id)));
    } catch (err) {
      Swal.fire({
        title: 'Remove Failed',
        text: err.response?.data?.message || 'Could not remove item.',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    }
  };

  const moveToBag = async (product) => {
    try {
      await api.post('/api/wishlist/move-to-cart', {
        product_id: getCleanProductId(product),
        quantity: 1,
        size: 'M'
      });
      setWishlistItems(prev => prev.filter(item => getCleanProductId(item) !== getCleanProductId(product)));
      Swal.fire({
        title: 'Moved to Bag!',
        text: '✅ Item successfully moved to your bag.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'center'
      });
    } catch (err) {
      Swal.fire({
        title: 'Move Failed',
        text: err.response?.data?.message || 'Could not move item to bag.',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 20px' }}>Loading wishlist...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '30px' }}>
        My Wishlist <span style={{ fontWeight: '400', color: '#94969f' }}>({wishlistItems.length} items)</span>
      </h2>

      {wishlistItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '30px' }}>
          {wishlistItems.map((item) => (
            <div key={item.id} style={{ border: '1px solid #eaeaec', position: 'relative', transition: 'box-shadow 0.3s' }}>
              <div
                onClick={() => {
                  Swal.fire({
                    title: 'Remove from Wishlist?',
                    text: 'Do you want to remove this item?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: 'maroon',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, remove it!'
                  }).then((result) => {
                    if (result.isConfirmed) removeFromWishlist(item.id);
                  });
                }}
                style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '4px', cursor: 'pointer', zIndex: 2 }}
              >
                <X size={18} color="#535766" />
              </div>

              <img
                src={item.image}
                alt=""
                style={{ width: '100%', height: '280px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${item.id}/${toSeoSlug(item.name || item.title || 'product')}`, { state: { product: item } })}
              />

              <div style={{ padding: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#282c3f', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>₹{Math.round(item.priceNum - (item.priceNum * (item.discount || 0) / 100))}</span>
                  {item.discount > 0 && (
                    <span style={{ textDecoration: 'line-through', color: '#94969f', fontSize: '12px', marginLeft: '8px' }}>₹{item.priceNum}</span>
                  )}
                </div>

                <button
                  onClick={() => moveToBag(item)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#fff', border: '1px solid #eaeaec', color: 'maroon', fontWeight: '700', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}
                >
                  Move to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Heart size={60} color="#d4d5d9" style={{ marginBottom: '20px' }} />
          <h3 style={{ color: '#282c3f' }}>Your Wishlist is Empty</h3>
          <p style={{ color: '#7e818c', marginBottom: '25px' }}>Save items that you like in your wishlist.</p>
          <button onClick={() => navigate('/')} style={{ padding: '12px 40px', backgroundColor: 'maroon', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>START SHOPPING</button>
        </div>
      )}
    </div>
  );
}
