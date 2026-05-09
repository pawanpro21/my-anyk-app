import React, { useState, useEffect } from 'react';
import { Search, User, Wand2, ShoppingBag, Menu, X } from 'lucide-react'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from './assets/anyk-logo.png';
import banner1 from './assets/Banner1.png';
import banner2 from './assets/Banner2.png';
import banner3 from './assets/Banner3.png';

const slidesData = [banner1, banner2, banner3];

export default function Header({ cartCount }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [showMobileSearch, setShowMobileSearch] = useState(false); 
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchInput.trim()) {
        navigate(`/mens?search=${searchInput.trim()}`);
        setShowMobileSearch(false);
      } else {
        navigate('/mens');
      }
    }
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <>
      <div className="sticky-header-wrapper">
        
        <div className="anyk-notification hide-on-mobile">
          <marquee><span>💥💥OFFER ZONE: BUY 1 GET 2 FREE LIMITED TIME DEAL FOR NEW USERS</span></marquee>
        </div>

        {/* 1. YAHAN INLINE FLEXBOX LAGAYA HAI TAAKI KOI CSS ISEY TOD NA SAKE */}
        <div className="premium-header-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 15px', boxSizing: 'border-box' }}>
          
          {/* LOGO */}
          <div className="anyk-logo-area" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}> 
            <Link to="/">
              {/* Logo height set kar di hai taaki bada ho kar layout na tode */}
              <img src={logoImg} alt="Anyk Originals" className="premium-image-logo" style={{ maxHeight: '35px', width: 'auto' }} />
            </Link>
          </div>
          
          {/* DESKTOP NAV */}
          <nav className="desktop-nav">
            <ul className="premium-nav-list" style={{ display: 'flex', gap: '15px', listStyle: 'none', padding: 0 }}>
              <Link to="/mens" style={{ textDecoration: 'none' }}><li className="nav-box-item">MEN'S Wear</li></Link>
              <Link to="/coming-soon" style={{ textDecoration: 'none' }}><li className="nav-box-item">WOMEN'S Wear</li></Link>
              <Link to="/coming-soon" style={{ textDecoration: 'none' }}><li className="nav-box-item">KID'S Wear</li></Link>
            </ul>
          </nav>

          {/* 2. RIGHT SECTION: INLINE FLEXBOX TAAKI ICONS EK LINE MEIN RAHEN */}
          <div className="premium-right-section" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
            
            <div className="premium-search desktop-search">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
              />
              <Search size={18} className="premium-search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
            </div>

            {/* Mobile Search Icon */}
            <button className="mobile-search-toggle-btn" onClick={() => setShowMobileSearch(!showMobileSearch)} style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <Search size={24} color="#282c3f" />
            </button>
            
            {/* Desktop Icons */}
            <div className="premium-icons desktop-icons">
              <Link to="/login" style={{ color: 'inherit', display: 'flex' }}><button className="icon-btn"><User size={22} /></button></Link>
              <Link to="/login" style={{ color: 'inherit', display: 'flex' }}><button className="icon-btn"><Wand2 size={22} /></button></Link>
              <Link to="/cart" style={{ color: 'inherit', display: 'flex' }}>
                <button className="icon-btn">
                  <ShoppingBag size={22} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <Menu size={28} color="#282c3f" />
            </button>

          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {showMobileSearch && (
          <div className="mobile-search-dropdown" style={{ display: 'flex', width: '100%', padding: '10px 15px', backgroundColor: '#fff', borderTop: '1px solid #eee', boxSizing: 'border-box' }}>
            <input 
              type="text" 
              placeholder="Search Anyk Originals..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearch}
              autoFocus
              style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: 'none', background: '#f0f0f5', outline: 'none' }}
            />
            <button onClick={handleSearch} style={{ marginLeft: '10px', padding: '0 15px', background: '#282c3f', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Search</button>
          </div>
        )}
      </div>

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      {isMobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <div className={`mobile-side-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img src={logoImg} alt="Anyk" style={{ height: '30px' }} />
          <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}><X size={28} /></button>
        </div>
        <div className="mobile-menu-content">
          <ul className="mobile-nav-list">
            <li><Link to="/mens" onClick={() => setIsMobileMenuOpen(false)}>MEN'S Wear</Link></li>
            <li><Link to="/coming-soon" onClick={() => setIsMobileMenuOpen(false)}>WOMEN'S Wear</Link></li>
            <li><Link to="/coming-soon" onClick={() => setIsMobileMenuOpen(false)}>KID'S Wear</Link></li>
          </ul>
          <div className="mobile-menu-divider"></div>
          <div className="mobile-action-links">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><User size={22} /> Profile</Link>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Wand2 size={22} /> Wishlist</Link>
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}><ShoppingBag size={22} /> Bag {cartCount > 0 && `(${cartCount})`}</Link>
          </div>
        </div>
      </div>

      {/* Hero Carousel */}
      {location.pathname === '/' && (
        <div className="anyk-carousel-container" style={{ position: 'relative' }}>
          <div className="anyk-carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slidesData.map((slideImg, index) => (
              <Link to="/mens" key={index} className="anyk-slide" style={{ backgroundImage: `url(${slideImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', display: 'block', textDecoration: 'none' }}></Link>
            ))}
          </div>
        </div> 
      )}
    </>
  );
}