import React, { useState, useEffect } from 'react';
import { ArrowUp, House } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  if (!isVisible && isHomePage) return null;

  const commonBtnStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: 'maroon',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease-in-out',
    fontSize: '20px'
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {!isHomePage && (
        <button
          onClick={() => navigate('/')}
          aria-label="Go to homepage"
          style={commonBtnStyle}
        >
          <House size={22} />
        </button>
      )}

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Scroll to top"
          style={commonBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#8B0000';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'maroon';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
