import React, { useState, useEffect } from 'react';
import { Search, Wand2, Filter, X, ArrowUpDown, ShoppingBag, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from './services/api';

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const jsonToSearchText = (value) => {
  if (!value) return "";

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    if (Array.isArray(parsed)) {
      return parsed.map(jsonToSearchText).join(" ");
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.values(parsed).map(jsonToSearchText).join(" ");
    }

    return String(parsed);
  } catch {
    return String(value);
  }
};

const getSearchAliases = (query) => {
  const q = normalizeText(query);

  const aliases = {
    "round shape": "round neck round shape round t shirt round tshirt round-neck",
    "round neck": "round neck round shape round t shirt round tshirt round-neck",
    "v shape": "v neck v shape v-neck vneck t shirt tshirt",
    "v neck": "v neck v shape v-neck vneck t shirt tshirt",
    "collar": "collar polo polo neck solid collar",
    "collar polo": "polo collar polo neck solid collar",
    "polo": "polo collar polo neck solid collar",
    "tshirt": "t shirt tshirt tee",
    "t shirt": "t shirt tshirt tee",
    "tee": "t shirt tshirt tee"
  };

  return normalizeText(`${q} ${aliases[q] || ""}`);
};

const submenuSearchMap = {
  "round shape": ["round shape", "round neck"],
  "round neck": ["round shape", "round neck"],
  "v shape": ["v shape", "v neck"],
  "v neck": ["v shape", "v neck"],
  "collar polo": ["collar polo", "polo neck", "solid collar"],
  "polo": ["collar polo", "polo neck", "solid collar"],
};

const matchesSubmenuQuery = (product, rawQuery) => {
  const query = normalizeText(rawQuery);
  const strictKeys = submenuSearchMap[query];

  if (!strictKeys) return null;

  const haystack = normalizeText(`
    ${product.submenu || ""}
    ${product.search_keywords || ""}
    ${product.specsText || ""}
    ${product.name || ""}
  `);

  return strictKeys.some((phrase) => haystack.includes(phrase));
};

const isUserLoggedIn = () => {
  return Boolean(sessionStorage.getItem('auth_user'));
};

const getProductSizeOptions = (dbItem = {}) => {
  const raw = String(dbItem.size || dbItem.sizes || '').trim();
  if (raw) {
    const parsed = raw
      .split(/[,\s/|]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (parsed.length > 0) return [...new Set(parsed)];
  }
  return ['S', 'M', 'L', 'XL'];
};

export default function MensCollection({ addToCart, updateCartCount }) {
  const [priceRange, setPriceRange] = useState(10100);
  const [discountFilter, setDiscountFilter] = useState(0);
  const [selectedColors, setSelectedColors] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const [ctaStateByProduct, setCtaStateByProduct] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('');
  const [mobileViewMode, setMobileViewMode] = useState('2');
  const [allProducts, setAllProducts] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const savedQuantities = {};

    setQuantities(savedQuantities);

    api.get('/api/products')
      .then((res) => {
        const fetchedProducts = (res.data || []).map(dbItem => {
          const uniqueId = `db-${dbItem.product_id || dbItem.id}`;

          if (!savedQuantities[uniqueId]) savedQuantities[uniqueId] = 1;

          const specsText = jsonToSearchText(dbItem.specifications);

          const searchText = normalizeText(`
            ${dbItem.title || ""}
            ${dbItem.color || ""}
            ${dbItem.category || ""}
            ${dbItem.submenu || ""}
            ${dbItem.type || ""}
            ${dbItem.gender || ""}
            ${dbItem.fabric || ""}
            ${specsText}
            ${dbItem.search_keywords || ""}
          `);

          const rawImg = dbItem.image_url || '';
          const baseURL = import.meta.env.VITE_API_URL;

          const imgFull = rawImg.startsWith('http')
            ? rawImg
            : `${baseURL}${rawImg.startsWith('/') ? rawImg : `/${rawImg}`}`;

          return {
            id: uniqueId,
            product_id: dbItem.product_id || dbItem.id,
            name: dbItem.title,
            color: dbItem.color || 'White',
            priceNum: Number(dbItem.price) || 0,
            discount: Number(dbItem.discount) || 0,
            image: imgFull,
            specsText,
            searchText,
            specifications: dbItem.specifications,
            search_keywords: dbItem.search_keywords || '',
            submenu: dbItem.submenu || '',
            sort_label: dbItem.sort_label || '',
            stock_label: dbItem.stock_label || null,
            sizeOptions: getProductSizeOptions(dbItem)
          };
        });

        setQuantities(prev => ({ ...savedQuantities, ...prev }));
        setAllProducts(fetchedProducts);

      })
      .catch((err) => console.error("Error fetching live products:", err));
  }, [updateCartCount]);

  const getCleanProductId = (product) => {
    return String(product?.product_id || product?.id || '').replace('db-', '');
  };

  const saveCartToBackend = async (product, targetQuantity, selectedSize = 'M') => {
    const productId = getCleanProductId(product);
    if (!productId) throw new Error('Product ID missing');

    const payload = {
      product_id: productId,
      quantity: targetQuantity,
      size: selectedSize
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

  const handleAddToCartClick = async (product) => {
    const currentCtaState = ctaStateByProduct[product.id] || 'default';
    if (currentCtaState === 'go-to-bag') {
      navigate('/cart');
      return;
    }

    if (!isUserLoggedIn()) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login first to add items to your bag.',
        icon: 'info',
        confirmButtonColor: 'maroon'
      }).then(() => navigate('/login'));

      return;
    }

    if (product.stock_label === 'Out of Stock') {
      Swal.fire({
        title: 'Out of Stock',
        text: 'This product is not available',
        icon: 'warning',
        confirmButtonColor: 'maroon'
      });

      return;
    }

    const selectedSize = selectedSizes[product.id];
    if (!selectedSize) {
      Swal.fire({
        title: 'Select Size',
        text: 'Please select a size before adding to bag.',
        icon: 'info',
        confirmButtonColor: 'maroon'
      });
      return;
    }

    const targetQuantity = Number(quantities[product.id]) || 1;

    try {
      await saveCartToBackend(product, targetQuantity, selectedSize);
      Swal.fire({
        title: 'Added to Your Bag!',
        text: `✅ ${targetQuantity} item(s) synced to your checkout bag!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
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

    setAddedItems(prev => ({
      ...prev,
      [product.id]: true
    }));

    setCtaStateByProduct(prev => ({
      ...prev,
      [product.id]: 'added'
    }));

    setTimeout(() => {
      setCtaStateByProduct(prev => {
        if (prev[product.id] !== 'added') return prev;
        return {
          ...prev,
          [product.id]: 'go-to-bag'
        };
      });
    }, 1200);
  };

  const handleAddToWishlist = async (product) => {
    if (!isUserLoggedIn()) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login first to use wishlist.',
        icon: 'info',
        confirmButtonColor: 'maroon'
      }).then(() => navigate('/login'));
      return;
    }

    try {
      const res = await api.post('/api/wishlist/add', { product_id: getCleanProductId(product) });
      Swal.fire({
        title: res.data.alreadyExists ? 'Already Saved' : '💖 Saved!',
        text: res.data.alreadyExists ? 'ℹ️ Item is already in Wishlist.' : 'Added to Wishlist!',
        icon: res.data.alreadyExists ? 'info' : 'success',
        timer: res.data.alreadyExists ? undefined : 1500,
        showConfirmButton: res.data.alreadyExists,
        confirmButtonColor: 'maroon'
      });
    } catch (err) {
      Swal.fire({ title: 'Wishlist Error', text: err.response?.data?.message || 'Could not save item.', icon: 'error' });
    }
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => {
      const current = Number(prev[productId]) || 1;
      const finalQty = Math.max(1, current + delta);

      return {
        ...prev,
        [productId]: finalQty
      };
    });
  };

  const clearFilters = () => {
    setPriceRange(10100);
    setDiscountFilter(0);
    setSelectedColors([]);
    setSortOrder('');

    if (searchQuery) {
      navigate('/mens', { replace: true });
    }
  };

  const filteredProducts = allProducts.filter((product) => {
    if (searchQuery) {
      const strictSubmenuMatch = matchesSubmenuQuery(product, searchQuery);
      if (strictSubmenuMatch !== null) {
        return strictSubmenuMatch;
      }

      const queryText = getSearchAliases(searchQuery);
      const words = queryText.split(" ").filter(Boolean);

      return words.some(word =>
        product.searchText.includes(word)
      );
    }

    const finalPrice = product.discount > 0
      ? Math.round(product.priceNum - (product.priceNum * product.discount / 100))
      : product.priceNum;

    const isPriceValid = finalPrice <= priceRange;
    const isDiscountValid = product.discount >= discountFilter;
    const isColorValid = selectedColors.length === 0 || selectedColors.includes(product.color);

    return isPriceValid && isDiscountValid && isColorValid;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount > 0
      ? Math.round(a.priceNum - (a.priceNum * a.discount / 100))
      : a.priceNum;

    const priceB = b.discount > 0
      ? Math.round(b.priceNum - (b.priceNum * b.discount / 100))
      : b.priceNum;

    if (sortOrder === 'low-to-high') return priceA - priceB;
    if (sortOrder === 'high-to-low') return priceB - priceA;
    if (sortOrder === 'best-seller') return (b.stock_label === 'Best Seller') - (a.stock_label === 'Best Seller');
    if (sortOrder === 'trending') return (b.stock_label === 'Trending') - (a.stock_label === 'Trending');
    if (sortOrder === 'price-drop') return (b.sort_label === 'Price Drop') - (a.sort_label === 'Price Drop');
    if (sortOrder === 'new-edition') return (b.sort_label === 'New Edition') - (a.sort_label === 'New Edition');

    return 0;
  });

  return (
    <div className="plp-container">
      <div className="plp-header-row">
        <h1 className="plp-title">Men's Collection</h1>
        {searchQuery && (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    }}
  >
    <p
      style={{
        fontSize: '16px',
        color: '#282c3f',
        margin: 0,
        lineHeight: '1.4',
        fontWeight: '500'
      }}
    >
      Showing results for:{' '}
      <strong>"{searchQuery}"</strong>

      <span
        style={{
          fontSize: '13px',
          fontWeight: '400',
          color: '#94969f',
          marginLeft: '6px'
        }}
      >
        ({sortedProducts.length})
      </span>
    </p>

    <button
      onClick={clearFilters}
      style={{
        fontSize: '12px',
        fontWeight: '700',
        color: 'white',
        background: 'maroon',
        border: 'none',
        borderRadius: '20px',
        padding: '5px 14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        height: 'fit-content'
      }}
    >
      ✕ Clear
    </button>
  </div>
)}

        <div className="plp-header-actions">
          <div className="sort-wrapper">
            <ArrowUpDown size={16} />

            <select
              className="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">SORT: Recommended</option>
              <option value="best-seller">Best Seller</option>
              <option value="trending">Trending</option>
              <option value="price-drop">Price Drop</option>
              <option value="new-edition">New Edition</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>

          <button
            className="filter-toggle-btn"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter size={16} /> FILTER
          </button>
        </div>
      </div>

      <div className="plp-layout">
        {isFilterOpen && (
          <div
            className="filter-backdrop"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        <aside className={`plp-sidebar ${isFilterOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3>FILTERS</h3>

            <X
              size={24}
              className="close-filter"
              onClick={() => setIsFilterOpen(false)}
            />
          </div>

          <div className="plp-filter-section">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 className="plp-filter-title">PRICE</h4>

              <span
                onClick={clearFilters}
                className="clear-all-text"
                style={{ cursor: 'pointer' }}
              >
                CLEAR ALL
              </span>
            </div>

            <div className="range-slider-container">
              <input
                type="range"
                min="100"
                max="10100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="plp-range-slider"
              />

              <div className="plp-price-text">
                Under ₹{priceRange === 10100 ? 'Any' : priceRange}
              </div>
            </div>
          </div>

          <div className="plp-filter-section">
            <div className="plp-filter-title">COLOR</div>

            <div className="color-list">
              {["Black", "White", "Blue", "Red", "Green"].map(color => (
                <label key={color} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color)}
                    onChange={() => handleColorToggle(color)}
                  />

                  <span
                    className="color-circle"
                    style={{
                      backgroundColor: color === 'Black'
                        ? '#2b2e3d'
                        : color.toLowerCase()
                    }}
                  />

                  {color}
                </label>
              ))}
            </div>
          </div>

          <div
            className="plp-filter-section"
            style={{ borderBottom: 'none' }}
          >
            <h4 className="plp-filter-title">DISCOUNT</h4>

            <div className="discount-list">
              {[
                { label: '10% & above', value: 10 },
                { label: '20% & above', value: 20 },
                { label: '30% & above', value: 30 },
              ].map(opt => (
                <label key={opt.value} className="filter-label">
                  <input
                    type="radio"
                    name="discount"
                    checked={discountFilter === opt.value}
                    onChange={() => setDiscountFilter(opt.value)}
                  />

                  {opt.label}
                </label>
              ))}

              {discountFilter > 0 && (
                <label className="filter-label">
                  <input
                    type="radio"
                    name="discount"
                    checked={discountFilter === 0}
                    onChange={() => setDiscountFilter(0)}
                  />

                  Show All
                </label>
              )}
            </div>
          </div>

          <button
            className="apply-filter-btn"
            onClick={() => setIsFilterOpen(false)}
          >
            APPLY FILTERS
          </button>
        </aside>

        <main className={`plp-grid ${mobileViewMode === '1' ? 'mobile-grid-1' : 'mobile-grid-2'}`}>
          <div className="mobile-sort-chips" aria-label="Sort products">
            <button
              type="button"
              className={`mobile-sort-chip ${mobileViewMode === '1' ? 'active' : ''}`}
              onClick={() => setMobileViewMode(prev => (prev === '1' ? '2' : '1'))}
            >
              1-UP
            </button>
            {[
              { label: 'Recommended', value: '' },
              { label: 'Best Seller', value: 'best-seller' },
              { label: 'Trending', value: 'trending' },
              { label: 'New Edition', value: 'new-edition' },
              { label: 'Price Drop', value: 'price-drop' },
              { label: 'Low Price', value: 'low-to-high' }
            ].map(option => (
              <button
                key={option.value || 'recommended'}
                type="button"
                className={`mobile-sort-chip ${sortOrder === option.value ? 'active' : ''}`}
                onClick={() => setSortOrder(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {sortedProducts.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '80px 20px',
              minHeight: '340px'
            }}>
              <Search
                size={60}
                color="#d4d5d9"
                style={{ marginBottom: '20px' }}
              />

              <h3 style={{
                color: '#282c3f',
                marginBottom: '8px',
                fontSize: '18px'
              }}>
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : 'No products match your filters.'}
              </h3>

              <p style={{
                color: '#7e818c',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {searchQuery
                  ? 'Try a different keyword.'
                  : 'Try clearing your filters.'}
              </p>

              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 28px',
                  backgroundColor: 'maroon',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px'
                }}
              >
                {searchQuery ? 'Browse All Products' : 'Clear All Filters'}
              </button>
            </div>
          ) : (
            sortedProducts.map(product => {
              const originalPrice = product.priceNum;

              const discountedPrice = product.discount > 0
                ? Math.round(originalPrice - (originalPrice * product.discount / 100))
                : originalPrice;

              const isAdded = addedItems[product.id];
              const ctaState = ctaStateByProduct[product.id] || (isAdded ? 'added' : 'default');
              const isOutOfStock = product.stock_label === 'Out of Stock';
              const displayLabel = product.sort_label || product.stock_label;

              return (
                <div
                  key={product.id}
                  className="product-card-custom"
                >
                  <div
                    className="product-image-container"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'auto' });
                      navigate(`/product/${product.id}`, { state: { product } });
                    }}
                    style={{ position: 'relative' }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        cursor: 'pointer',
                        opacity: isOutOfStock ? 0.55 : 1
                      }}
                    />

                    <button
                      type="button"
                      className="wishlist-icon-overlay"
                      title="Add to wishlist"
                      aria-label="Add to wishlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWishlist(product);
                      }}
                    >
                      <Wand2 size={18} color="#282c3f" />
                    </button>

                    {product.discount > 0 && (
                      <div className="discount-badge-overlay">
                        {product.discount}% OFF
                      </div>
                    )}

                    {isOutOfStock && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.25)',
                        borderRadius: '4px',
                        pointerEvents: 'none'
                      }}>
                        <span style={{
                          background: 'maroon',
                          color: 'white',
                          fontWeight: '800',
                          fontSize: '12px',
                          padding: '5px 14px',
                          borderRadius: '4px'
                        }}>
                          OUT OF STOCK
                        </span>
                      </div>
                    )}

                    {displayLabel && displayLabel.trim() !== '' && (
                      <div className="image-bottom-label-wrap">
                        <span
                          className={`image-bottom-label ${
                            displayLabel === 'Out of Stock'
                              ? 'badge-outofstock'
                              : displayLabel === 'In Stock'
                              ? 'badge-instock'
                              : displayLabel === 'Best Seller'
                              ? 'badge-bestseller'
                              : displayLabel === 'Trending'
                              ? 'badge-trending'
                              : 'badge-urgency'
                          }`}
                        >
                          {displayLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="product-info-custom">
                    <div className="product-details-top">
                      <h4>{product.name}</h4>

                      <div className="pdp-price-row">
                        <span className="final-price">
                          ₹{discountedPrice}
                        </span>

                        {product.discount > 0 && (
                          <span className="cut-price">
                            ₹{originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="product-controls-mid">
                      <div className="quantity-selector">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={isOutOfStock}
                        >
                          -
                        </button>

                        <span>{quantities[product.id] || 1}</span>

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          disabled={isOutOfStock}
                        >
                          +
                        </button>
                      </div>

                      <div className="product-size-note">
                        <label htmlFor={`size-${product.id}`} style={{ marginRight: '6px' }}>Size:</label>
                        <select
                          id={`size-${product.id}`}
                          className="product-size-select"
                          value={selectedSizes[product.id] || ''}
                          onChange={(e) =>
                            setSelectedSizes((prev) => ({
                              ...prev,
                              [product.id]: e.target.value
                            }))
                          }
                        >
                          <option value="">Select</option>
                          {(product.sizeOptions || ['S', 'M', 'L', 'XL']).map((sz) => (
                            <option key={sz} value={sz}>
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="stock-badge-container-fixed">
                        {displayLabel && displayLabel.trim() !== '' ? (
                          <span className={`stock-dynamic-badge ${
                            displayLabel === 'Out of Stock'
                              ? 'badge-outofstock'
                              : displayLabel === 'In Stock'
                              ? 'badge-instock'
                              : displayLabel === 'Best Seller'
                              ? 'badge-bestseller'
                              : displayLabel === 'Trending'
                              ? 'badge-trending'
                              : 'badge-urgency'
                          }`}>
                            {displayLabel === 'Out of Stock'
                              ? '⭕'
                              : displayLabel === 'In Stock'
                              ? '✅'
                              : displayLabel === 'Best Seller'
                              ? '🏆'
                              : displayLabel === 'Trending'
                              ? '🔥'
                              : displayLabel === 'Price Drop'
                              ? '💸'
                              : displayLabel === 'New Edition'
                              ? '✨'
                              : '⚡'} {displayLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      className="add-to-cart-btn"
                      style={{
                        backgroundColor: isOutOfStock
                          ? '#d4d5d9'
                          : ctaState === 'go-to-bag'
                          ? '#1f2937'
                          : isAdded
                          ? '#2ecc71'
                          : '',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => handleAddToCartClick(product)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock
                        ? 'OUT OF STOCK'
                        : ctaState === 'go-to-bag'
                        ? 'GO TO BAG'
                        : isAdded
                        ? 'ADDED ✓'
                        : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      <div className="mobile-action-bar">
        <button
          className="action-item"
          onClick={() => {
            const isLoggedIn = Boolean(sessionStorage.getItem('auth_user'));
            navigate(isLoggedIn ? '/orders' : '/login');
          }}
        >
          <User size={20} />
          <span>PROFILE</span>
        </button>

        <div className="action-divider" />

        <button
          className="action-item"
          onClick={() => navigate('/wishlist')}
        >
          <Wand2 size={20} />
          <span>WISHLIST</span>
        </button>

        <div className="action-divider" />

        <button
          className="action-item"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter size={20} />
          <span>FILTER</span>
        </button>

        <div className="action-divider" />

        <button
          className="action-item"
          onClick={() => navigate('/cart')}
        >
          <ShoppingBag size={20} />
          <span>BAG</span>
        </button>
      </div>
    </div>
  );
}
