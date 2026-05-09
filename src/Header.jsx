import React, { useState, useEffect } from 'react';
import { Search, User, Wand2, ShoppingBag } from 'lucide-react'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from './assets/anyk-logo.png';
import banner1 from './assets/Banner1.png';
import banner2 from './assets/Banner2.png';
import banner3 from './assets/Banner3.png';

const slidesData = [banner1, banner2, banner3];

export default function Header({ cartCount }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchInput.trim()) {
        navigate(`/mens?search=${searchInput.trim()}`);
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
      {/* ================= 1. YEH HISSA HAMESHA TOP PAR STICK RAHEGA ================= */}
      <div className="sticky-header-wrapper">
        
        <div className="anyk-notification">
          <marquee><span>💥💥OFFER ZONE: BUY 1 GET 2 FREE LIMITED TIME DEAL FOR NEW USERS</span></marquee>
        </div>

        <div className="premium-header-container">
          
          <div className="anyk-logo-area"> 
            <Link to="/">
              <img src={logoImg} alt="Anyk Originals" className="premium-image-logo" />
            </Link>
          </div>
          
          <nav>
            <ul className="premium-nav-list" style={{ display: 'flex', gap: '15px', listStyle: 'none', padding: 0 }}>
              <Link to="/mens" style={{ textDecoration: 'none' }}>
                <li className="nav-box-item">MEN'S Wear</li>
              </Link>
              <Link to="/coming-soon" style={{ textDecoration: 'none' }}>
                <li className="nav-box-item">WOMEN'S Wear</li>
              </Link>
              <Link to="/coming-soon" style={{ textDecoration: 'none' }}>
                <li className="nav-box-item">KID'S Wear</li>
              </Link>
            </ul>
          </nav>

          <div className="premium-right-section">
            
            <div className="premium-search hide-on-mobile">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
              />
              <Search size={18} className="premium-search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
            </div>
            
            <div className="premium-icons">
              {/* Profile - Hidden on mobile */}
              <Link to="/login" className="hide-on-mobile" style={{ color: 'inherit', display: 'flex' }}>
                <button className="icon-btn tooltip-wrapper">
                  <User size={22} strokeWidth={1.5} />
                  <span className="tooltip-text">Profile</span>
                </button>
              </Link>

              {/* Wishlist - Always visible & sticky on mobile */}
              <Link to="/login" style={{ color: 'inherit', display: 'flex' }}>
                <button className="icon-btn tooltip-wrapper">
                  <Wand2 size={22} strokeWidth={1.5} />
                  <span className="tooltip-text">Wishlist</span>
                </button>
              </Link>

              {/* Bag - Hidden on mobile (Moved to bottom bar) */}
              <Link to="/cart" className="hide-on-mobile" style={{ color: 'inherit', display: 'flex' }}>
                <button className="icon-btn tooltip-wrapper">
                  <ShoppingBag size={22} strokeWidth={1.5} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  <span className="tooltip-text">Bag</span>
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ================= 2. CAROUSEL BANNER KO STICKY SE BAHAR NIKALA ================= */}
      {location.pathname === '/' && (
        <div className="anyk-carousel-container" style={{ position: 'relative' }}>
          <div className="anyk-carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slidesData.map((slideImg, index) => (
              <Link to="/mens" key={index} className="anyk-slide" style={{ backgroundImage: `url(${slideImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', display: 'block', textDecoration: 'none' }}></Link>
            ))}
          </div>
          <div className="carousel-dots">
            {slidesData.map((_, index) => (
              <span key={index} className={`dot ${currentSlide === index ? 'active' : ''}`} onClick={() => setCurrentSlide(index)}></span>
            ))}
          </div>
        </div> 
      )}
    </>
  );
}