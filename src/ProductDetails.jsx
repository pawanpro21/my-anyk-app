import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// 1. Yahan 'Heart' hata kar 'Wand2' add kiya gaya hai
import { Star, Truck, Wand2, ShoppingBag, ShieldCheck, RefreshCcw, ArrowLeft } from 'lucide-react';

// Similar products dikhane ke liye kuch images import ki hain
import men1 from './assets/Men1.png';
import men2 from './assets/Men2.png';
import men3 from './assets/Men3.png';
import men4 from './assets/Men4.png';

export default function ProductDetails({ addToCart }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const product = location.state?.product;

  const [selectedSize, setSelectedSize] = useState('M');
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // ================= SIMILAR PRODUCTS DATA =================
  const similarProducts = [
    { id: 1, name: "White Round Shape T-Shirt", priceNum: 999, discount: 15, image: men1 },
    { id: 2, name: "Printed Round Shape T-shirt", priceNum: 699, discount: 5, image: men2 },
    { id: 3, name: "Round Shape Anyk Originals T-shirt", priceNum: 799, discount: 25, image: men3 },
    { id: 4, name: "Classic Round Shape T-shirt", priceNum: 1199, discount: 10, image: men4 },
  ];

  if (!product) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/mens')} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>Go Back to Shopping</button>
      </div>
    );
  }

  const originalPrice = product.priceNum;
  const discountedPrice = product.discount > 0 
    ? Math.round(originalPrice - (originalPrice * product.discount / 100)) 
    : originalPrice;

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryMsg(`Delivery available by ${new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toDateString()}`);
    } else {
      setDeliveryMsg('Please enter a valid 6-digit pincode');
    }
  };

 const handleAddToBag = () => {
    addToCart();
    // Turant "Place Order" page pe navigate karo aur product data sath bhejo
    navigate('/cart', { state: { product } }); 
  };

  // Jab koi similar product par click kare toh naya product khule
  const handleSimilarClick = (simProduct) => {
    navigate(`/product/${simProduct.id}`, { state: { product: simProduct } });
    window.scrollTo(0, 0); // Page ko wapas upar scroll kar dega
  };

  return (
    <div className="pdp-container">
      {/* Back Button & Breadcrumb */}
      <div className="pdp-breadcrumb">
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={16} /> Back</button>
        <span>Home / Men / Clothing / <span style={{ fontWeight: 'bold' }}>{product.name}</span></span>
      </div>

      <div className="pdp-layout">
        {/* ================= LEFT: PRODUCT IMAGE ================= */}
        <div className="pdp-image-section">
          <img src={product.image} alt={product.name} className="pdp-main-image" />
        </div>

        {/* ================= RIGHT: PRODUCT INFO ================= */}
        <div className="pdp-info-section">
          <h1 className="pdp-brand">ANYK ORIGINALS</h1>
          <h2 className="pdp-title">{product.name}</h2>
          
          <div className="pdp-rating-box">
            <span>4.2</span> <Star size={14} fill="#14958f" color="#14958f" /> 
            <span className="rating-divider">|</span> 
            <span>1.2k Ratings</span>
          </div>

          <div className="pdp-divider"></div>

          <div className="pdp-price-row">
            <span className="pdp-final-price">₹{discountedPrice}</span>
            {product.discount > 0 && (
              <>
                <span className="pdp-mrp">MRP <span style={{textDecoration: 'line-through'}}>₹{originalPrice}</span></span>
                <span className="pdp-discount">({product.discount}% OFF)</span>
              </>
            )}
          </div>
          <p className="tax-text">inclusive of all taxes</p>

          <div className="pdp-size-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>SELECT SIZE</h4>
              <span style={{ color: 'maroon', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>SIZE CHART</span>
            </div>
            <div className="pdp-sizes">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button 
                  key={size} 
                  className={`pdp-size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="pdp-action-buttons">
            <button className="pdp-add-bag-btn" onClick={handleAddToBag} style={{ backgroundColor: isAdded ? '#2ecc71' : 'maroon' }}>
              <ShoppingBag size={20} /> {isAdded ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
            </button>
            
            {/* 2. YAHAN WISHLIST ICON CHANGE KIYA GAYA HAI (Wand2) */}
            <button className="pdp-wishlist-btn" onClick={() => alert('✨ Item saved to your Wishlist! You can view it from the top menu.')}>
           <Wand2 size={20} /> WISHLIST
           </button>
          </div>

          <div className="pdp-divider"></div>

          <div className="pdp-delivery-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              DELIVERY OPTIONS <Truck size={20} />
            </h4>
            <div className="pincode-box">
              <input type="number" placeholder="Enter pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              <button onClick={checkDelivery}>Check</button>
            </div>
            {deliveryMsg && <p className="delivery-msg">{deliveryMsg}</p>}
            <p className="delivery-hint">Please enter PIN code to check delivery time & Pay on Delivery Availability</p>
            
            <ul className="delivery-features">
              <li><ShieldCheck size={18} color="#535766" /> 100% Original Products</li>
              <li><RefreshCcw size={18} color="#535766" /> Pay on delivery might be available</li>
              <li><Truck size={18} color="#535766" /> Easy 14 days returns and exchanges</li>
            </ul>
          </div>

          <div className="pdp-divider"></div>

          <div className="pdp-details-section">
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>PRODUCT DETAILS</h4>
            <p style={{ color: '#535766', lineHeight: '1.6' }}>
              Elevate your everyday style with this premium quality apparel from Anyk Originals. Designed for comfort and crafted with precision, this piece offers a perfect blend of modern aesthetics and classic charm.
            </p>
            <div style={{ marginTop: '15px' }}>
              <strong style={{ display: 'block', marginBottom: '5px' }}>Size & Fit</strong>
              <span style={{ color: '#535766' }}>Regular Fit<br/>The model (height 6') is wearing a size M</span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <strong style={{ display: 'block', marginBottom: '5px' }}>Material & Care</strong>
              <span style={{ color: '#535766' }}>100% Premium Cotton<br/>Machine Wash Cold</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. NEW: SIMILAR PRODUCTS SECTION ================= */}
      <div style={{ marginTop: '60px', borderTop: '1px solid #eaeaec', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#282c3f', marginBottom: '25px', letterSpacing: '1px' }}>
          SIMILAR PRODUCTS
        </h3>
        
        <div style={{ display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '20px' }}>
          {similarProducts.map(item => {
            const finalPrc = item.discount > 0 ? Math.round(item.priceNum - (item.priceNum * item.discount / 100)) : item.priceNum;
            
            return (
              <div 
                key={item.id} 
                style={{ minWidth: '220px', cursor: 'pointer', transition: 'transform 0.3s' }}
                onClick={() => handleSimilarClick(item)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '6px', objectFit: 'cover' }} />
                <h4 style={{ fontSize: '15px', color: '#535766', margin: '12px 0 6px 0', fontWeight: 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', color: '#282c3f', fontSize: '16px' }}>₹{finalPrc}</span>
                  {item.discount > 0 && (
                    <span style={{ textDecoration: 'line-through', color: '#94969f', fontSize: '13px' }}>₹{item.priceNum}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}