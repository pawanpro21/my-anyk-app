import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Wand2, ShoppingBag, Menu, X, ChevronDown, Package, Heart, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from "./services/api";
import Fuse from 'fuse.js';
import { motion } from 'framer-motion';
import logoImg from './assets/anyk-logo.png';
import { API_URL } from "./config/api";

// ─── Popular keyword bank ───────────────────────────────────────
const popularKeywords = [
  "Round Neck T-Shirt", "Regular Fit T-Shirt", "Polo Neck T-Shirt",
  "Printed Men's Shirt", "Plain Cotton Shirt", "Oversized T-Shirt",
  "Slim Fit Denim", "White Casual Shirt", "Black Formal Trouser",
  "V-Neck T-Shirt", "Checked Shirt", "Full Sleeve T-Shirt"
];

const flattenToSearchText = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(flattenToSearchText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(flattenToSearchText).join(' ');
  return String(value);
};

export default function Header({ cartCount }) {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // 🟢 DYNAMIC NOTIFICATION STATE
  const [notificationText, setNotificationText] = useState(
    'Hurry! Limited Time Deals for New Users'
  );
  const [isScrolled, setIsScrolled] = useState(false);

  // 🟢 DYNAMIC BANNERS
  const [slidesData, setSlidesData] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // 🟢 DYNAMIC NOTIFICATION FETCH
  useEffect(() => {
    api.get(`/api/settings/notification_text`)
      .then(res => {
        if (res.data && res.data.value) {
          setNotificationText(res.data.value);
        }
      })
      .catch(err => console.error("Notification fetch error:", err));
  }, []);

  // Nav ka submenus data
// Nav ka submenus data
const navMenus = [
  {
    label: "MEN'S WEAR",
    path: "/mens",
    activeKey: "/mens",
    submenu: [
      { label: "Round Shape T-Shirt", path: "/mens?search=Round Shape" },
      { label: "V-Shape T-Shirt",     path: "/coming-soon?search=V-Shape" },
      { label: "Solid Collar Polo",   path: "/coming-soon?search=Collar Polo" },
    ]
  },
  {
    label: "WOMEN'S WEAR",
    path: "/coming-soon?category=women",
    activeKey: "women",
    submenu: [
      { label: "Round Shape T-Shirt", path: "/coming-soon?category=women" },
      { label: "V-Shape T-Shirt",     path: "/coming-soon?category=women" },
      { label: "Solid Collar Polo",   path: "/coming-soon?category=women" },
    ]
  },
  {
    label: "KID'S WEAR",
    path: "/coming-soon?category=kids",
    activeKey: "kids",
    submenu: [
      { label: "Round Shape T-Shirt", path: "/coming-soon?category=kids" },
      { label: "V-Shape T-Shirt",     path: "/coming-soon?category=kids" },
      { label: "Solid Collar Polo",   path: "/coming-soon?category=kids" },
    ]
  },
];
  // 🟢 FETCH DYNAMIC BANNERS
  useEffect(() => {
  api.get(`/api/banners/active`)
    .then(res => {

      console.log("Banner API Response:", res.data);

      if (res.data?.banners && Array.isArray(res.data.banners)) {
        setSlidesData(res.data.banners);
      }

    })
    .catch(err => console.error("Banner fetch error:", err));
    }, []);
 useEffect(() => {

  const header =
    document.querySelector(".sticky-header-wrapper");

  const handleScroll = () => {

    if(window.scrollY > 20){

      header?.classList.add("scrolled");

    }else{

      header?.classList.remove("scrolled");
    }
  };
  window.addEventListener(
    "scroll",
    handleScroll,
    { passive:true }
  );

  return () =>
    window.removeEventListener(
      "scroll",
      handleScroll
    );

}, []);
  // Read user from the current browser session. The backend still protects private APIs.
  useEffect(() => {
    const storedUser = sessionStorage.getItem('auth_user');

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      sessionStorage.removeItem('auth_user');
      setUser(null);
    }
  }, [location]);

  // ── Fetch all DB products once ──────────────────────────────────
  useEffect(() => {

    api.get(`/api/products`)
      .then(res => setAllProducts(res.data || []))
      .catch(err => console.error("Search fetch error:", err));

  }, []);

  // ── Build Fuse search bank ──────────────────────────────────────
  const fuseBank = useMemo(() => {

    const kwItems = popularKeywords.map(kw => ({
      type: 'keyword',
      title: kw,
      specsText: '',
      searchKw: kw.toLowerCase(),
    }));

    const productItems = allProducts.map(p => {

      let specsText = '';

      if (p.specifications) {
        try {

          const parsed = typeof p.specifications === 'string'
            ? JSON.parse(p.specifications)
            : p.specifications;

          specsText = flattenToSearchText(parsed);

        } catch {
          specsText = String(p.specifications);
        }
      }

      return {
        type: 'product',
        id: p.id,
        title: p.title || '',
        color: p.color || '',
        category: p.category || '',
        price: p.price,
        discount: p.discount,
        image_url: p.image_url || '',
        specsText,
        searchKw: p.search_keywords || '',
        submenu: p.submenu || '',
        type: p.type || '',
        gender: p.gender || '',
        fabric: p.fabric || '',
      };
    });

    return [...kwItems, ...productItems];

  }, [allProducts]);

  const fuse = useMemo(() => new Fuse(fuseBank, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'specsText', weight: 0.25 },
      { name: 'searchKw', weight: 0.15 },
      { name: 'color', weight: 0.1 },
      { name: 'category', weight: 0.08 },
      { name: 'submenu', weight: 0.08 },
      { name: 'type', weight: 0.07 },
      { name: 'gender', weight: 0.05 },
      { name: 'fabric', weight: 0.05 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: true,
  }), [fuseBank]);

  const handleSearchChange = (e) => {

    const query = e.target.value;
    setSearchInput(query);

    if (!query.trim()) {
      setSuggestions([]);
      setKeywordSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const trimmed = query.trim();
    const results = fuse.search(trimmed);

    let kwMatches = results
      .filter(r => r.item.type === 'keyword')
      .slice(0, 4)
      .map(r => r.item.title);

    let prodMatches = results
      .filter(r => r.item.type === 'product')
      .slice(0, 5)
      .map(r => r.item);

    // Fallback for short or weak queries (e.g. single-letter "c")
    if (prodMatches.length === 0 && trimmed.length >= 1) {
      const q = trimmed.toLowerCase();
      prodMatches = allProducts
        .filter((p) => {
          const blob = [
            p.title,
            p.category,
            p.submenu,
            p.search_keywords,
            p.color,
            typeof p.specifications === 'string' ? p.specifications : JSON.stringify(p.specifications || {}),
          ]
            .join(' ')
            .toLowerCase();
          return blob.includes(q);
        })
        .slice(0, 5)
        .map((p) => {
          let specsText = '';
          if (p.specifications) {
            try {
              specsText = flattenToSearchText(
                typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications
              );
            } catch {
              specsText = String(p.specifications);
            }
          }
          return {
            type: 'product',
            id: p.id,
            title: p.title || '',
            color: p.color || '',
            category: p.category || '',
            price: p.price,
            discount: p.discount,
            image_url: p.image_url || '',
            specsText,
            searchKw: p.search_keywords || '',
            submenu: p.submenu || '',
            typeName: p.type || '',
            gender: p.gender || '',
            fabric: p.fabric || '',
          };
        });
    }

    if (kwMatches.length === 0 && trimmed.length >= 1) {
      const q = trimmed.toLowerCase();
      kwMatches = popularKeywords
        .filter((kw) => kw.toLowerCase().includes(q))
        .slice(0, 4);
    }

    setKeywordSuggestions(kwMatches);
    setSuggestions(prodMatches);

    setShowDropdown(
      kwMatches.length > 0 || prodMatches.length > 0
    );
  };

  const handleSuggestionClick = (item) => {

    setSearchInput('');
    setShowDropdown(false);
    setIsSearchExpanded(false);

    const rawImg = item.image_url || '';

    const imgFull = rawImg.startsWith('http')
      ? rawImg
      : `${API_URL}${rawImg.startsWith('/') ? rawImg : `/${rawImg}`}`;

    const formattedProduct = {
      ...item,
      id: `db-${item.id}`,
      name: item.title,
      priceNum: item.price,
      image: imgFull,
    };

    navigate(`/product/db-${item.id}`, {
      state: { product: formattedProduct }
    });
  };

  const handleKeywordClick = (keyword) => {

    setSearchInput(keyword);
    setShowDropdown(false);
    setIsSearchExpanded(false);

    navigate(`/mens?search=${encodeURIComponent(keyword)}`);
  };

  const handleSearch = (e) => {

    if (e.key === 'Enter' || e.type === 'click') {

      const q = searchInput.trim();

      setShowDropdown(false);
      setIsSearchExpanded(false);

      navigate(
        q
          ? `/mens?search=${encodeURIComponent(q)}`
          : '/mens'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch (err) {
      console.error("Logout error:", err);
    }
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setUser(null);
    setIsProfileOpen(false);

    navigate('/login');
  };

  const submitMobileHeaderSearch = () => {
    const q = searchInput.trim();
    navigate(q ? `/mens?search=${encodeURIComponent(q)}` : '/mens');
    setSearchInput('');
    setSuggestions([]);
    setKeywordSuggestions([]);
    setShowDropdown(false);
  };

  const handleMobileHeaderSearch = (e) => {
    if (e.key === 'Enter' || e.key === 'Go' || e.keyCode === 13) {
      e.preventDefault();
      submitMobileHeaderSearch();
    }
  };

  const handleMobileHeaderSearchSubmit = (e) => {
    e.preventDefault();
    submitMobileHeaderSearch();
  };

  // 🟢 AUTO SLIDER
  useEffect(() => {

    const id = setInterval(() => {

      setCurrentSlide(prev =>
        slidesData.length > 0
          ? (prev === slidesData.length - 1 ? 0 : prev + 1)
          : 0
      );

    }, 4000);

    return () => clearInterval(id);

  }, [slidesData]);

  const tooltipStyle = {
    position: 'absolute',
    top: '38px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#282c3f',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    zIndex: 1010,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    pointerEvents: 'none',
  };

  const renderDropdown = (isMobile = false) => (

    <div
      className="myntra-search-dropdown"
      style={{
        position: isMobile ? 'absolute' : 'absolute',
        top: isMobile ? 'calc(100% + 6px)' : '45px',
        left: isMobile ? 0 : 'auto',
        right: isMobile ? 'auto' : 0,
        width: isMobile ? '100%' : '320px',
        zIndex: 1005,
        background: '#fff',
        border: '1px solid #eaeaec',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '6px 8px 0'
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowDropdown(false);
            setSuggestions([]);
            setKeywordSuggestions([]);
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#6b6f80',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
          aria-label="Close suggestions"
        >
          <X size={16} />
        </button>
      </div>

      {keywordSuggestions.length > 0 && (

        <div>

          <div
            style={{
              padding: '8px 14px 4px',
              fontSize: '10px',
              fontWeight: '800',
              color: '#94969f',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Suggestions
          </div>

          {keywordSuggestions.map((kw, idx) => (

            <div
              key={`kw-${idx}`}
              onMouseDown={() => handleKeywordClick(kw)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 14px',
                cursor: 'pointer'
              }}
              onMouseEnter={e =>
                e.currentTarget.style.background = '#f5f5f6'
              }
              onMouseLeave={e =>
                e.currentTarget.style.background = 'transparent'
              }
            >

              <Search size={13} color="#a0a2ab" />

              <span
                style={{
                  fontSize: '13px',
                  color: '#282c3f',
                  fontWeight: '500'
                }}
              >
                {kw}
              </span>

            </div>

          ))}

        </div>

      )}

      {suggestions.length > 0 && (

        <div
          style={{
            borderTop: keywordSuggestions.length > 0
              ? '1px solid #f5f5f6'
              : 'none'
          }}
        >

          <div
            style={{
              padding: '8px 14px 4px',
              fontSize: '10px',
              fontWeight: '800',
              color: '#94969f',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Products
          </div>

          {suggestions.map((item) => {

            const rawImg = item.image_url || '';

            const imgSrc = rawImg.startsWith('http')
              ? rawImg
              : `${API_URL}${rawImg.startsWith('/') ? rawImg : `/${rawImg}`}`;

            const discounted = item.discount > 0
              ? Math.round(
                item.price - (item.price * item.discount / 100)
              )
              : item.price;

            return (

              <div
                key={item.id}
                onMouseDown={() => handleSuggestionClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 14px',
                  cursor: 'pointer'
                }}
                onMouseEnter={e =>
                  e.currentTarget.style.background = '#f5f5f6'
                }
                onMouseLeave={e =>
                  e.currentTarget.style.background = 'transparent'
                }
              >

                <img
                  src={imgSrc}
                  alt={item.title}
                  style={{
                    width: '38px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #eaeaec'
                  }}
                  onError={e => e.target.style.display = 'none'}
                />

                <div style={{ flex: 1, minWidth: 0 }}>

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#282c3f',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: '#535766',
                      marginTop: '2px'
                    }}
                  >

                    ₹{discounted}

                    {item.discount > 0 && (

                      <span
                        style={{
                          color: '#03a685',
                          marginLeft: '6px',
                          fontWeight: '700'
                        }}
                      >
                        {item.discount}% OFF
                      </span>

                    )}

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}

      {keywordSuggestions.length === 0 && suggestions.length === 0 && (

        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#94969f',
            fontSize: '13px'
          }}
        >

          <Search
            size={24}
            color="#d4d5d9"
            style={{
              display: 'block',
              margin: '0 auto 8px'
            }}
          />

          No results for "{searchInput}"

        </div>

      )}

    </div>

  );

  return (
    <>

     <div className={`sticky-header-wrapper ${isScrolled ? 'scrolled' : ''}`}>

        {/* 🟢 DYNAMIC NOTIFICATION */}
        <div className="anyk-notification hide-on-mobile">

          <div className="animated-offer-text">

            <span className="offer-highlight">
              Offer Zone:
            </span>

            {notificationText}

          </div>

        </div>

        <div className="premium-header-container">

          <div className="anyk-logo-area header-logo">

            <Link to="/">

              <img
                src={logoImg}
                alt="Anyk Originals"
                className="premium-image-logo logo-img"
              />

            </Link>

          </div>

          <form className="mobile-inline-search-wrap" onSubmit={handleMobileHeaderSearchSubmit}>
            <div className="mobile-inline-search">
              <Search size={16} color="#6b6f80" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={handleMobileHeaderSearch}
                onFocus={() => {
                  if (searchInput.trim()) setShowDropdown(true);
                }}
              />
              <button
                type="submit"
                className="mobile-inline-search-submit"
                aria-label="Search"
              >
                Go
              </button>
            </div>
            {showDropdown && searchInput.trim() && (
              <div className="mobile-inline-search-dropdown">
                {renderDropdown(true)}
              </div>
            )}
          </form>

   <nav className="desktop-nav">

  <ul
    className="premium-nav-list"
    style={{
      listStyle: 'none',
      display: 'flex',
      gap: '8px',
      margin: 0,
      padding: 0
    }}
  >

    {navMenus.map((menu) => {

      // ✅ CURRENT URL
      const currentUrl =
        location.pathname + location.search;

      // ✅ ACTIVE TAB FIX
      const isActive =
        currentUrl.includes(menu.activeKey);

      return (

        <li
          key={menu.label}
          style={{ position: 'relative' }}
          onMouseEnter={() => setActiveMenu(menu.label)}
          onMouseLeave={() => setActiveMenu(null)}
        >

          <Link
            to={menu.path}
            className="nav-box-link"
            style={{ textDecoration: 'none' }}
          >

            <div
              className="nav-box-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',

                color: isActive
                  ? 'maroon'
                  : '#282c3f',

                backgroundColor: isActive
                  ? '#fdf2f2'
                  : '#fff',

                fontWeight: isActive
                  ? '800'
                  : '700',

                transition: 'all .25s ease'
              }}
            >

              {menu.label}

              <span
                style={{
                  fontSize: '10px',
                  transition: 'transform 0.2s',
                  transform:
                    activeMenu === menu.label
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                  display: 'inline-block'
                }}
              >
                ▾
              </span>

            </div>

          </Link>

          {/* Dropdown */}
          {activeMenu === menu.label && (

            <ul
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                background: 'white',
                border: '1px solid #eaeaec',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: '210px',
                zIndex: 9999,
                padding: '8px 0',
                marginTop: '-2px',
                listStyle: 'none',
              }}
            >

              {menu.submenu.map((item) => (

                <li key={item.label}>

                  <Link
                    to={item.path}
                    onClick={() => setActiveMenu(null)}
                    style={{
                      display: 'block',
                      padding: '10px 20px',
                      fontSize: '13px',
                      color: '#282c3f',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fdf2f2';
                      e.currentTarget.style.color = 'maroon';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#282c3f';
                    }}
                  >

                    {item.label}

                  </Link>

                </li>

              ))}

            </ul>

          )}

        </li>

      );

    })}

  </ul>

</nav>

          <div className="premium-right-section">

            <div
              className="premium-search desktop-search"
              onMouseEnter={() => setIsSearchExpanded(true)}
              onMouseLeave={() => {

                if (!searchInput.trim()) {
                  setIsSearchExpanded(false);
                  setShowDropdown(false);
                }

              }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >

              <motion.div
                initial={false}
                animate={{
                  width: isSearchExpanded ? '280px' : '40px',
                  backgroundColor: isSearchExpanded ? '#f5f5f6' : 'transparent',
                  border: isSearchExpanded
                    ? '1px solid #d4d5d9'
                    : 'none'
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '20px',
                  padding: isSearchExpanded ? '5px 15px' : '0px',
                  height: '40px',
                  overflow: 'hidden'
                }}
              >

                <Search
                  size={22}
                  style={{
                    cursor: 'pointer',
                    minWidth: '22px'
                  }}
                  onClick={handleSearch}
                />

                <input
                  type="text"
                  placeholder="Search products, specs..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearch}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    marginLeft: '10px',
                    fontSize: '13px',
                    display: isSearchExpanded ? 'block' : 'none',
                    color: '#282c3f'
                  }}
                />

                {isSearchExpanded && searchInput && (

                  <X
                    size={16}
                    style={{
                      cursor: 'pointer',
                      opacity: 0.5,
                      flexShrink: 0
                    }}
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions([]);
                      setKeywordSuggestions([]);
                      setShowDropdown(false);
                    }}
                  />

                )}

              </motion.div>

              {isSearchExpanded && showDropdown && renderDropdown()}

            </div>

            <div
              className="premium-icons desktop-icons"
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}
            >

              <div
                style={{
                  position: 'relative',
                  display: 'inline-block'
                }}
                onMouseEnter={() => setActiveTooltip('profile')}
                onMouseLeave={() => setActiveTooltip(null)}
              >

                {user ? (

                  <div
                    className="profile-dropdown-container"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >

                    <button className="icon-btn profile-trigger">

                      <User size={22} />

                      <span className="user-firstname">
                        {user.name.split(' ')[0]}
                      </span>

                      <ChevronDown size={14} />

                    </button>

                    {isProfileOpen && (

                      <div className="profile-dropdown-menu">

                        <div className="dropdown-user-info">

                          <p className="welcome-txt">
                            Hello, {user.name}
                          </p>

                          <p className="user-email">
                            {user.email || user.mobile}
                          </p>

                        </div>

                        <div className="divider"></div>

                        <Link
                          to="/orders"
                          className="dropdown-item"
                          style={{ textDecoration: 'none' }}
                        >

                          <Package size={18} />

                          Your Orders

                        </Link>

                        <Link
                          to="/wishlist"
                          className="dropdown-item"
                          style={{ textDecoration: 'none' }}
                        >

                          <Heart size={18} />

                          Your Wishlist

                        </Link>

                        <div className="divider"></div>

                        <button
                          onClick={handleLogout}
                          className="dropdown-item logout-link"
                        >

                          <LogOut size={18} />

                          Logout

                        </button>

                      </div>

                    )}

                  </div>

                ) : (

                  <Link
                    to="/login"
                    style={{
                      color: 'inherit',
                      display: 'flex',
                      textDecoration: 'none'
                    }}
                  >

                    <button className="icon-btn">

                      <User size={22} />

                    </button>

                  </Link>

                )}

                {activeTooltip === 'profile' && !isProfileOpen && (
                  <div style={tooltipStyle}>
                    Profile
                  </div>
                )}

              </div>

              <div
                style={{
                  position: 'relative',
                  display: 'inline-block'
                }}
                onMouseEnter={() => setActiveTooltip('wishlist')}
                onMouseLeave={() => setActiveTooltip(null)}
              >

                <Link
                  to="/wishlist"
                  style={{
                    color: 'inherit',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                >

                  <button className="icon-btn">

                    <Wand2 size={22} />

                  </button>

                </Link>

                {activeTooltip === 'wishlist' && (
                  <div style={tooltipStyle}>
                    Wishlist
                  </div>
                )}

              </div>

              <div
                style={{
                  position: 'relative',
                  display: 'inline-block'
                }}
                onMouseEnter={() => setActiveTooltip('bag')}
                onMouseLeave={() => setActiveTooltip(null)}
              >

                <Link
                  to="/cart"
                  style={{
                    color: 'inherit',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                >

                  <button className="icon-btn">

                    <ShoppingBag size={22} />

                    {cartCount > 0 && (
                      <span className="cart-badge">
                        {cartCount}
                      </span>
                    )}

                  </button>

                </Link>

                {activeTooltip === 'bag' && (
                  <div style={tooltipStyle}>
                    Bag
                  </div>
                )}

              </div>

            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >

              <Menu size={28} color="#282c3f" />

            </button>

          </div>

        </div>

      </div>

      {isMobileMenuOpen && (

        <div
          className="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

      )}

      <div
        className={`mobile-side-menu ${isMobileMenuOpen ? 'open' : ''}`}
      >

        <div className="mobile-menu-header">

          <img
            src={logoImg}
            alt="Anyk"
            style={{ height: '30px' }}
          />

          <button
            className="close-menu-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >

            <X size={28} />

          </button>

        </div>

        <div className="mobile-menu-content">

          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f5f5f6'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f5f5f6',
                padding: '9px 14px',
                borderRadius: '8px'
              }}
            >

              <Search size={16} color="#94969f" />

              <input
                type="text"
                placeholder="Search products..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '14px',
                  width: '100%',
                  color: '#282c3f'
                }}
                onKeyDown={(e) => {

                  if (e.key === 'Enter' && e.target.value.trim()) {

                    setIsMobileMenuOpen(false);

                    navigate(
                      `/mens?search=${encodeURIComponent(e.target.value.trim())}`
                    );

                  }

                }}
              />

            </div>

          </div>

          <ul
            className="mobile-nav-list"
            style={{ listStyle: 'none' }}
          >

            <li>

              <Link
                to="/mens"
                style={{ textDecoration: 'none' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                MEN'S Wear
              </Link>

            </li>

            <li>

              <Link
                to="/coming-soon?category=women"
                style={{ textDecoration: 'none' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                WOMEN'S Wear
              </Link>

            </li>

            <li>

              <Link
                to="/coming-soon?category=kids"
                style={{ textDecoration: 'none' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                KID'S Wear
              </Link>

            </li>

          </ul>

          <div className="mobile-menu-divider"></div>

          <div className="mobile-action-links">

            {user ? (

              <div className="mobile-user-box">

                <p>
                  Welcome, <b>{user.name}</b>
                </p>

                <Link
                  to="/orders"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >

                  <Package size={22} />

                  Orders

                </Link>

                <button
                  onClick={handleLogout}
                  className="mobile-logout-btn"
                >

                  <LogOut size={22} />

                  Logout

                </button>

              </div>

            ) : (

              <Link
                to="/login"
                style={{ textDecoration: 'none' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >

                <User size={22} />

                Login / Profile

              </Link>

            )}

            <Link
              to="/cart"
              style={{ textDecoration: 'none' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >

              <ShoppingBag size={22} />

              Bag {cartCount > 0 && `(${cartCount})`}

            </Link>

            <Link
              to="/wishlist"
              style={{ textDecoration: 'none' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >

              <Heart size={22} />

              Wishlist

            </Link>

          </div>

        </div>

      </div>

      {/* 🟢 DYNAMIC BANNER CAROUSEL */}
      {location.pathname === '/' && slidesData.length > 0 && (

        <div className="anyk-carousel-container">

          <div
            className="anyk-carousel-track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`
            }}
          >

            {slidesData.map((banner, index) => {

             const bannerImg = banner.image_url?.startsWith('http')
            ? banner.image_url
            : `${API_URL}/${banner.image_url.replace(/^\/+/, '')}`;

              return (

                <Link
                  to={banner.redirect_link || "/mens"}
                  key={banner.id || index}
                  className="anyk-slide"
                  style={{
                    backgroundImage: `url(${bannerImg})`
                  }}
                ></Link>

              );
            })}

          </div>

        </div>

      )}

    </>
  );
}
