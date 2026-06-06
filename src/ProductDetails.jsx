import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from "./services/api";
import { Star, Truck, Wand2, ShoppingBag, ShieldCheck, RefreshCcw, ArrowLeft, X, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from "./config/api";

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

export default function ProductDetails({ addToCart, updateCartCount }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const navProduct = location.state?.product;

  const [product, setProduct] = useState(navProduct || null);
  const [allImages, setAllImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(''); // 🟢 Default Empty Form State Lock
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  
  // 🟢 NEW STATES FOR QUANTITY & UNIT CONTROL
  const [quantity, setQuantity] = useState(1);
  const [sizeUnit, setSizeUnit] = useState('inches'); // 'inches' or 'cms'

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

 

  // --- Zoom Magnifier Logic ---
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center center' });
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.2)' });
  };
  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });
  };

  // --- Smart Data Fetching ---
  useEffect(() => {
    const currentId = id || navProduct?.id;
    if (!currentId || !String(currentId).startsWith('db-')) {
      if (navProduct) setMainImage(navProduct.image);
      setProduct(navProduct);
      setSelectedSize('');
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setLoading(false);
      return;
    }

    const actualDbId = String(currentId).replace('db-', '');
    api.get(`/api/products/${actualDbId}`)
      .then((res) => {
        const dbProduct = res.data;
        setProduct({
          ...navProduct,
          ...dbProduct,
          id: `db-${dbProduct.id}`,
          name: dbProduct.title,
          priceNum: dbProduct.price,
          image: `${API_URL}${dbProduct.image_url}`,
          specifications: dbProduct.specifications,
          search_keywords: dbProduct.search_keywords
        });

        if (dbProduct.all_images && dbProduct.all_images.length > 0) {
          const imagesArray = dbProduct.all_images.map(img => `${API_URL}${img.image_url}`);
          setAllImages(imagesArray);
          setMainImage(imagesArray[0]);
        } else {
          setMainImage(`${API_URL}${dbProduct.image_url}`);
          setAllImages([`${API_URL}${dbProduct.image_url}`]);
        }

        setSelectedSize('');
        setQuantity(1);
        window.scrollTo({ top: 0, behavior: 'auto' });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend Error Fetching Details:", err);
        setLoading(false);
      });
  }, [id, navProduct]);

  useEffect(() => {
    if (product) {
      setSelectedSize('');
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [product]);

  // Similar Products Fetching Engine
  useEffect(() => {
    if (product) {
      api.get(`/api/products`)
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) return;

          const currentIdStr = String(product.id).replace('db-', '');
          const currentCat = (product.category || "mens").toLowerCase();
          const currentPrice = Number(product.priceNum || product.price || 0);

          let matches = res.data.filter(item => {
            if (String(item.id) === currentIdStr) return false; 
            const itemCat = (item.category || "mens").toLowerCase();
            const catMatch = itemCat === currentCat;
            const itemPrice = Number(item.price || 0);
            const priceMatch = Math.abs(itemPrice - currentPrice) <= 400; 

            return catMatch || priceMatch;
          });

          let uniqueMatches = [...new Map(matches.map(item => [item.id, item])).values()];

          if (uniqueMatches.length < 4) {
            const fallbackPool = res.data.filter(item => 
              String(item.id) !== currentIdStr && 
              !uniqueMatches.some(m => String(m.id) === String(item.id))
            );
            const randomBackupShuffled = fallbackPool.sort(() => 0.5 - Math.random());
            const spaceNeededCount = 4 - uniqueMatches.length;
            const appendSliceList = randomBackupShuffled.slice(0, spaceNeededCount);
            uniqueMatches = [...uniqueMatches, ...appendSliceList];
          }

          const finalFourGrid = uniqueMatches.sort(() => 0.5 - Math.random()).slice(0, 4);
          setSimilarProducts(finalFourGrid);
        })
        .catch(err => console.error("Error tracking similar elements array output map:", err));
    }
  }, [product]);

  // Fetch Reviews
  useEffect(() => {
    if (product) {
      const actualDbId = String(product.id).replace('db-', '');
      api.get(`/api/reviews/${actualDbId}`)
        .then((res) => {
          if (res.data.success) {
            const fetchedReviews = res.data.reviews;
            setReviews(fetchedReviews);
            const storedUser = getSessionUser();
            if (storedUser) {
              const existingReview = fetchedReviews.some((rev) => {
                const reviewerId = rev.userId || rev.user_id || rev.user?.id || '';
                return reviewerId && String(reviewerId) === String(storedUser.id);
              });
              setHasReviewed(existingReview);
            }
          }
        })
        .catch(err => console.error("Database Reviews Fetch Error:", err));
    }
  }, [product]);

  const getCleanProductId = (product) => {
    return String(product?.product_id || product?.id || '').replace('db-', '');
  };

  const saveCartToBackend = async (product, targetQuantity, selectedSizeValue) => {
    const productId = getCleanProductId(product);
    if (!productId) throw new Error('Product ID missing');

    const payload = {
      product_id: productId,
      quantity: targetQuantity,
      size: selectedSizeValue
    };

    let existingBackendCart = [];
    try {
      const cartRes = await api.get('/api/cart');
      existingBackendCart = Array.isArray(cartRes.data) ? cartRes.data : [];
    } catch (err) {
      console.error('Cart check failed:', err.response?.data || err.message || err);
    }

    const alreadyInCart = existingBackendCart.some(item => String(item.product_id) === productId);

    if (alreadyInCart) {
      await api.put('/api/cart/update', payload);
    } else {
      await api.post('/api/cart/add', payload);
    }
  };

  // 🟢 DYNAMIC EXPLICIT LOGIC: MULTIPLE QUANTITY & MANDATORY SIZE CHECK
  const handleAddToBag = async () => {
    if (!getSessionUser()) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please Login First to Access Your Bag.',
        icon: 'info',
        confirmButtonColor: 'maroon'
      }).then(() => navigate('/login'));
      return; 
    }

    // 🟢 CRITICAL LOCK ROUTE: User size check confirmation loop trigger
    if (!selectedSize || selectedSize.trim() === '') {
      Swal.fire({
        title: 'Select Size',
        text: '⚠️ Please select a size first before adding item to your bag!',
        icon: 'warning',
        confirmButtonColor: 'maroon'
      });
      return;
    }

    try {
      await saveCartToBackend(product, quantity, selectedSize);
      setIsAdded(true);
      Swal.fire({ title: 'Success!', text: '✅ Product synced to your bag!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error('Backend cart add failed:', err.response?.data || err.message || err);
      Swal.fire({
        title: 'Cart Error',
        text: err.response?.data?.message || 'Item could not be added to backend cart.',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
      return;
    }

    if (addToCart) addToCart(); 
    if (updateCartCount) updateCartCount();
    
    navigate('/cart'); 
  };

  const handleQuantityDelta = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      return next < 1 ? 1 : next;
    });
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryMsg(`Delivery available by ${new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toDateString()}`);
    } else {
      setDeliveryMsg('Please enter a valid 6-digit pincode');
    }
  };

  const handleSimilarClick = (simProduct) => {
    const formatProduct = {
      ...simProduct,
      id: `db-${simProduct.id}`,
      name: simProduct.title,
      priceNum: simProduct.price,
      image: `${API_URL}${simProduct.image_url}`
    };
    navigate(`/product/db-${simProduct.id}`, { state: { product: formatProduct } });
    window.scrollTo(0, 0); 
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const storedUser = getSessionUser();
    
    if (!storedUser) {
      Swal.fire({ title: 'Auth Missing', text: 'Login is require for this product review.', icon: 'warning', confirmButtonColor: 'maroon' });
      return;
    }
    if (hasReviewed) {
      Swal.fire({ title: 'Already Reviewed', text: 'You already reviewed this product.', icon: 'info', confirmButtonColor: 'maroon' });
      return;
    }
    if (!newComment.trim()) {
      Swal.fire({ title: 'Empty Review', text: 'Blank review is not allowed.', icon: 'info' });
      return;
    }

    const actualDbId = String(product.id).replace('db-', '');

    try {
      const response = await api.post(`/api/reviews/add`, {
        productId: actualDbId,
        userId: storedUser.id,
        rating: newRating,
        comment: newComment.trim()
      });

      if (response.data.success) {
        const customReview = {
          id: response.data.reviewId || Date.now(),
          name: storedUser.name || "Anonymous User",
          rating: newRating,
          comment: newComment.trim(),
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          verified: true
        };

        setReviews([customReview, ...reviews]);
        setNewComment('');
        setNewRating(5);
        setHasReviewed(true);
        Swal.fire({ title: 'Thank You! 🎉', text: 'Your review has been submitted successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      console.error("Review system save error:", err);
      Swal.fire({ title: 'Failed', text: 'Sorry please try gain later.', icon: 'error' });
    }
  };

  const renderSpecs = () => {
    if (!String(product.id).startsWith('db-')) {
      const dummySpecs = {
        "Sleeve Length": "Half Sleeves", "Fit": "Regular Fit",
        "Pattern": "Solid", "Neck": "Round Neck", "Fabric": "100% Cotton"
      };
      return (
        <div className="specs-grid">
          {Object.entries(dummySpecs).map(([key, value], i) => (
            <div className="spec-item" key={i}>
              <span className="spec-label" style={{ textTransform: 'capitalize' }}>{key}</span>
              <span className="spec-value">{value}</span>
            </div>
          ))}
        </div>
      );
    }
    const specs = product.specifications;
    if (!specs || specs === "null" || (typeof specs === 'string' && specs.trim() === "") || (typeof specs === 'object' && Object.keys(specs).length === 0)) {
      return <div style={{ padding: '15px 0', color: '#7e818c', fontSize: '14px', textAlign: 'left' }}>Detailed specifications are not available for this product.</div>;
    }
    let parsedSpecs = {};
    try { parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs; } catch(e) { return <div>Invalid Format</div>; }
    return (
      <div className="specs-grid">
        {Object.entries(parsedSpecs).map(([key, value], index) => (
          <div className="spec-item" key={index}>
            <span className="spec-label" style={{ textTransform: 'capitalize' }}>{key}</span>
            <span className="spec-value">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ padding: '100px 20px', textAlign: 'center' }}><h2>Loading Details...</h2></div>;
  if (!product) return <div style={{ padding: '100px 20px', textAlign: 'center' }}><h2>Product not found</h2></div>;

  const originalPrice = product.priceNum;
  const discountedPrice = product.discount > 0 
    ? Math.round(originalPrice - (originalPrice * product.discount / 100)) 
    : originalPrice;

  return (
    <div className="pdp-container">
      <div className="pdp-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '25px', color: '#535766', flexWrap: 'wrap', textAlign: 'left' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span> 
        <span>/</span>
        <span onClick={() => navigate(`/${product.category?.toLowerCase() || 'mens'}`)} style={{ cursor: 'pointer' }}>{product.category || 'men'}</span>
        <span>/</span>
        <span style={{ fontWeight: 'bold', color: '#282c3f' }}>{product.name}</span>
      </div>

      <div className="pdp-layout">
        <div className="pdp-image-section" style={{ display: 'flex', gap: '15px' }}>
          {allImages.length > 1 && (
            <div className="pdp-thumbnails" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allImages.map((img, i) => (
                <img key={i} src={img} alt="thumbnail" style={{ width: '60px', height: '80px', objectFit: 'cover', cursor: 'pointer', borderRadius: '4px', border: mainImage === img ? '2px solid maroon' : '1px solid #eaeaec' }} onClick={() => setMainImage(img)} />
              ))}
            </div>
          )}
          <div className="pdp-main-image-container" style={{ flex: 1, overflow: 'hidden', borderRadius: '4px', cursor: 'crosshair', position: 'relative' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <img src={mainImage} alt={product.name} className="pdp-main-image" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.1s ease-out', ...zoomStyle }} />
          </div>
        </div>

        <div className="pdp-info-section" style={{ textAlign: 'left' }}>
          <h1 className="pdp-title">{product.name}</h1>
          
          <div className="pdp-rating-box">
            {reviews.length > 0 ? (
              <>
                <span>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>{" "}
                <Star size={14} fill="#14958f" color="#14958f" /> 
                <span className="rating-divider">|</span> 
                <span>{reviews.length} {reviews.length === 1 ? 'Rating' : 'Ratings'}</span>
              </>
            ) : (
              <>
                <span style={{ color: '#94969f' }}>No Ratings Yet</span>
                <span className="rating-divider">|</span>
                <span style={{ color: '#94969f' }}>0 Reviews</span>
              </>
            )}
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

          {/* Size Section */}
          <div className="pdp-size-section" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#282c3f' }}>SELECT SIZE</h4>
              <span onClick={() => setShowSizeChart(true)} style={{ color: 'maroon', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.5px' }}>SIZE CHART</span>
            </div>
            <div className="pdp-sizes">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button key={size} className={`pdp-size-btn ${selectedSize === size ? 'selected' : ''}`} onClick={() => setSelectedSize(size)}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 🟢 NEW QUANTITY SELECTOR MECHANISM ATTACHED (MensCollection Standard) */}
          <div className="pdp-quantity-section" style={{ marginTop: '25px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 'bold', color: '#282c3f' }}>QUANTITY</h4>
            <div className="quantity-selector" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <button type="button" onClick={() => handleQuantityDelta(-1)} style={{ padding: '5px 15px', fontWeight: 'bold' }}>-</button>
              <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '15px', fontWeight: '700' }}>{quantity}</span>
              <button type="button" onClick={() => handleQuantityDelta(1)} style={{ padding: '5px 15px', fontWeight: 'bold' }}>+</button>
            </div>
          </div>

          <div className="pdp-action-buttons" style={{ marginTop: '25px' }}>
            <button className="pdp-add-bag-btn" onClick={handleAddToBag} style={{ backgroundColor: isAdded ? '#2ecc71' : 'maroon', fontWeight: '700' }}>
              <ShoppingBag size={20} /> {isAdded ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
            </button>
            <button
  className="pdp-wishlist-btn"
  onClick={async () => {

    // Login Check
    if (!getSessionUser()) {

      Swal.fire({
        title: 'Login Required',
        text: 'Please login first to use wishlist.',
        icon: 'info',
        confirmButtonColor: 'maroon'
      }).then(() => {
        navigate('/login');
      });

      return;
    }

    try {
      const res = await api.post('/api/wishlist/add', { product_id: getCleanProductId(product) });
      Swal.fire({
        title: res.data.alreadyExists ? 'Already Added' : 'Success!',
        text: res.data.alreadyExists ? 'This product is already in your wishlist.' : '✨ Product added to wishlist!',
        icon: res.data.alreadyExists ? 'info' : 'success',
        confirmButtonColor: 'maroon'
      }).then(() => navigate('/wishlist'));
    } catch (err) {
      Swal.fire({
        title: 'Wishlist Error',
        text: err.response?.data?.message || 'Could not add item to wishlist.',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    }

  }}
  style={{ fontWeight: '700' }}
>
  <Wand2 size={20} /> WISHLIST
</button>
          </div>

          <div className="pdp-divider"></div>

          <div className="pdp-delivery-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>DELIVERY OPTIONS <Truck size={20} /></h4>
            <div className="pincode-box">
              <input
                type="text"
                placeholder="Enter pincode"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              />
              <button onClick={checkDelivery}>Check</button>
            </div>
            {deliveryMsg && <p className="delivery-msg">{deliveryMsg}</p>}
            <p className="delivery-hint">Please enter PIN code to check delivery time & Pay on Delivery Availability</p>
            <ul className="delivery-features">
              <li><ShieldCheck size={18} /> 100% Original Products</li>
              <li><RefreshCcw size={18} /> Easy 14 days returns</li>
              <li><Truck size={18} /> Pay on delivery might be available</li>
            </ul>
          </div>

          <div className="pdp-divider"></div>
          <div className="details-section">
            <h3 className="section-heading">Specifications</h3>
            {renderSpecs()}
          </div>

          <div className="pdp-extra-info" style={{ marginTop: '25px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '5px solid maroon' }}>
            <h4 style={{ fontSize: '15px', color: '#282c3f', marginBottom: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Important Information:</h4>
            <ul style={{ fontSize: '13px', color: '#535766', lineHeight: '1.8', margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
              <li>This product is eligible for 14-day easy returns and exchanges.</li>
              <li>Please keep the tags intact and ensure the product is unused for a hassle-free return process.</li>
              <li>Pay on Delivery is subject to pincode serviceability by our courier partners.</li>
              <li>Order confirmation will be sent shortly after placement.</li>
            </ul>
          </div>
        </div> 
      </div>

      {/* Similar Products Block */}
      {similarProducts.length > 0 && (
        <div className="pdp-similar-section" style={{ marginTop: '60px', borderTop: '1px solid #eaeaec', paddingTop: '30px' }}>
          <h3 className="pdp-similar-title" style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '25px', textAlign: 'left' }}>SIMILAR PRODUCTS</h3>
          <div className="pdp-similar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '25px', paddingBottom: '20px' }}>
            {similarProducts.map(item => (
              <div className="pdp-similar-card" key={item.id} style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => handleSimilarClick(item)}>
                <img className="pdp-similar-image" src={`${API_URL}${item.image_url}`} alt={item.title} style={{ width: '100%', height: '280px', borderRadius: '6px', objectFit: 'cover' }} />
                <h4 className="pdp-similar-name" style={{ margin: '10px 0', fontSize: '15px', color: '#282c3f' }}>{item.title}</h4>
                <div className="pdp-similar-price" style={{ fontWeight: 'bold', color: '#282c3f' }}>₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ratings and Reviews Tab */}
      <div className="pdp-reviews-section" style={{ marginTop: '70px', borderTop: '1px solid #eaeaec', paddingTop: '40px', textAlign: 'left' }}>
        <h3 className="pdp-reviews-title" style={{ fontSize: '22px', fontWeight: '800', color: '#282c3f', marginBottom: '30px', letterSpacing: '0.5px' }}>RATINGS & REVIEWS</h3>
        
        <div className="pdp-reviews-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '50px', alignItems: 'start' }}>
          <div className="pdp-review-summary" style={{ border: '1px solid #eaeaec', padding: '30px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '48px', fontWeight: '800', color: '#282c3f' }}>
                {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
              </span>
              <Star size={28} fill="maroon" color="maroon" style={{ transform: 'translateY(-4px)' }} />
            </div>
            <p style={{ color: '#535766', fontSize: '14px', fontWeight: '600', margin: '0 0 25px 0' }}>{reviews.length} Verified Customers rated this product</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[5, 4, 3, 2, 1].map((count) => {
                const countMatching = reviews.filter(r => r.rating === count).length;
                const percentage = reviews.length > 0 ? Math.round((countMatching / reviews.length) * 100) : 0;
                const barColors = ['#14958f', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c'];
                
                return (
                  <div key={count} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', color: '#535766' }}>
                    <span style={{ width: '10px' }}>{count}</span>
                    <Star size={12} fill="#7e818c" color="#7e818c" />
                    <div style={{ flex: 1, height: '6px', background: '#eaeaec', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: barColors[5 - count] }} />
                    </div>
                    <span style={{ width: '35px', color: '#94969f', textAlign: 'right' }}>{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pdp-review-content" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <form className="pdp-review-form" onSubmit={handleReviewSubmit} style={{ border: '1px dashed maroon', padding: '20px', borderRadius: '6px', backgroundColor: '#fff5f5' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: 'maroon', fontWeight: '700' }}>Share Your Experience</h4>
              <div className="pdp-review-stars" style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    size={22} 
                    style={{ cursor: 'pointer' }}
                    fill={(hoverRating || newRating) >= star ? "#ffc107" : "none"}
                    color={(hoverRating || newRating) >= star ? "#ffc107" : "#d4d5d9"}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(star)}
                  />
                ))}
              </div>
              <div className="pdp-review-input-row" style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Write an honest review about fit, fabric or design..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ flex: 1, padding: '12px', border: '1px solid #d4d5d9', borderRadius: '4px', outline: 'none', fontSize: '14px' }}
                  disabled={hasReviewed}
                />
                <button type="submit" disabled={hasReviewed} style={{ backgroundColor: hasReviewed ? '#aaa' : 'maroon', color: 'white', border: 'none', padding: '0 25px', borderRadius: '4px', fontWeight: '700', cursor: hasReviewed ? 'not-allowed' : 'pointer', fontSize: '13px' }}>{hasReviewed ? 'REVIEW SUBMITTED' : 'SUBMIT'}</button>
              </div>
            </form>

            <div className="pdp-review-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div className="pdp-review-item" key={rev.id} style={{ borderBottom: '1px solid #eaeaec', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: rev.rating >= 4 ? '#14958f' : '#f1c40f', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                        {rev.rating} <Star size={10} fill="white" color="white" />
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: '#282c3f' }}>{rev.name}</span>
                      {rev.verified && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#03a685', fontWeight: '600' }}>
                          <CheckCircle size={12} fill="#03a685" color="white" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#535766', fontSize: '14px', margin: '0 0 8px 0', lineHeight: '1.5' }}>{rev.comment}</p>
                    <span style={{ color: '#94969f', fontSize: '12px' }}>Posted on {rev.date}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94969f', fontSize: '14px' }}>Be the first one to review this product!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 MYNTRA STANDARD DUAL-UNIT (INCHES/CMS) SIZE CHART MODAL */}
      {showSizeChart && (
        <div className="size-chart-overlay" onClick={() => setShowSizeChart(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="size-chart-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div className="size-chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eaeaec', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px' }}>Size Chart</h3>
              <button className="close-chart" onClick={() => setShowSizeChart(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#282c3f' }}><X size={24} /></button>
            </div>
            
            {/* Myntra Switch Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #f5f5f6' }}>
              <button type="button" onClick={() => setSizeUnit('inches')} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: sizeUnit === 'inches' ? 'maroon' : '#535766', borderBottom: sizeUnit === 'inches' ? '3px solid maroon' : '3px solid transparent', position: 'relative', top: '2px' }}>IN</button>
              <button type="button" onClick={() => setSizeUnit('cms')} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: sizeUnit === 'cms' ? 'maroon' : '#535766', borderBottom: sizeUnit === 'cms' ? '3px solid maroon' : '3px solid transparent', position: 'relative', top: '2px' }}>CM</button>
            </div>

            <div className="size-chart-body">
              <table className="size-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f6', fontWeight: '700', color: '#535766' }}>
                    <th style={{ padding: '10px', border: '1px solid #eaeaec' }}>Size</th>
                    <th style={{ padding: '10px', border: '1px solid #eaeaec' }}>Chest</th>
                    <th style={{ padding: '10px', border: '1px solid #eaeaec' }}>Waist</th>
                    <th style={{ padding: '10px', border: '1px solid #eaeaec' }}>Length</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeUnit === 'inches' ? (
                    <>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>S</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>38 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>34 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>27 in</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>M</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>40 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>36 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>28 in</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>L</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>42 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>38 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>29 in</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>XL</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>44 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>40 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>30 in</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>XXL</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>46 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>42 in</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>31 in</td></tr>
                    </>
                  ) : (
                    <>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>S</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>96.5 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>86.4 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>68.6 cm</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>M</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>101.6 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>91.4 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>71.1 cm</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>L</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>106.7 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>96.5 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>73.7 cm</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>XL</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>111.8 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>101.6 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>76.2 cm</td></tr>
                      <tr><td style={{ padding: '10px', border: '1px solid #eaeaec', fontWeight: '700' }}>XXL</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>116.8 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>106.7 cm</td><td style={{ padding: '10px', border: '1px solid #eaeaec' }}>78.7 cm</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
