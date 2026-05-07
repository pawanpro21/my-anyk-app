import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from './assets/anyk-logo.png';

const slidesData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1623091410901-00e2d268901f?auto=format&fit=crop&q=80&w=1600",
    leftText: "Write Your Own\nCode",
    rightText: "Workwear\nStyled by You",
    buttonText: "SHOP NOW"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1583391733958-620ed75f0108?auto=format&fit=crop&q=80&w=1600",
    leftText: "Celebrate\nTradition",
    rightText: "Festive Collection\n2026",
    buttonText: "EXPLORE"
  }
];

export default function Header({cartCount }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <>
      <div className="anyk-header">
        
        {/* Top Notification Bar */}
        <div className="anyk-notification">
          <marquee><span>💥💥OFFER ZONE: BUY 1 GET 2 FREE LIMITED TIME DEAL FOR NEW USERS</span></marquee>
        </div>

        {/* Main Premium Header */}
        <div className="premium-header-container">
          
          {/* Left: Image Logo */}
          <div className="anyk-logo-area"> <Link to="/">
            {/* 2. Aur yahan wo imported image lag jayegi */}
            <img 
              src={logoImg} 
              alt="Anyk Originals" 
              className="premium-image-logo" 
            /></Link>
          </div>
          {/* Center: Premium Navigation Menu (Only 3 Items) */}
          <nav>
            <ul className="premium-nav-list">
              <Link to="/mens" style={{ textDecoration: 'none' }}>
              <li className="premium-nav-item">Men's Collections</li></Link>
              <Link to="/coming-soon" style={{ textDecoration: 'none' }}>
              <li className="premium-nav-item">Women's Collections</li></Link>
              <Link to="/coming-soon" style={{ textDecoration: 'none' }}>
              <li className="premium-nav-item">Kids Collections</li></Link>
            </ul>
          </nav>

          {/* Right: Search Bar & Icons */}
          <div className="premium-right-section">
            <div className="premium-search">
              <input type="text" placeholder="Search products..." />
              <Search size={18} className="premium-search-icon" />
            </div>
            
            <div className="premium-icons">
              <Link to="/login" style={{ color: 'inherit' }}>
                <button className="icon-btn">
                  <User size={22} strokeWidth={1.5} />
                </button>
              </Link>
              <button className="icon-btn">
                <Heart size={22} strokeWidth={1.5} />
              </button>
              <button className="icon-btn">
                <ShoppingCart size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Hero Carousel Banner (Remains Unchanged) */}
        {location.pathname === '/' && (
        <div className="anyk-carousel-container">
          <button className="anyk-carousel-arrow prev" onClick={prevSlide}>
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>

          <div 
            className="anyk-carousel-track" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slidesData.map((slide) => (
              <div 
                key={slide.id} 
                className="anyk-slide" 
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="anyk-slide-left">
                  <h2 className="anyk-slide-title-left">{slide.leftText}</h2>
                </div>
                <div className="anyk-slide-right">
                  <h3 className="anyk-slide-title-right">{slide.rightText}</h3>
                  <button className="anyk-slide-button">{slide.buttonText}</button>
                </div>
              </div>
            ))}
          </div>

          <button className="anyk-carousel-arrow next" onClick={nextSlide}>
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        </div> )}
      </div>
      </>
      )}
    
