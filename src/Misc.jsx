import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './services/api';
import { API_URL } from './config/api';

export default function Misc() {
  const [remoteCollections, setRemoteCollections] = useState([]);
  const [promoBanner, setPromoBanner] = useState(null);

  const isVideoFile = (rawUrl = '') => /\.(mp4|webm|ogg)(\?.*)?$/i.test(rawUrl);

  const getImageUrl = (rawImage, fallback) => {
    if (!rawImage) return fallback;
    if (rawImage.startsWith('http')) return rawImage;
    return `${API_URL}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;
  };

  useEffect(() => {
    api.get('/api/collections')
      .then(res => setRemoteCollections(res.data.collections || []))
      .catch(err => console.error('Collection images fetch error:', err));

    api.get('/api/promo-banner/active')
      .then(res => setPromoBanner(res.data.banner || null))
      .catch(err => console.error('Promo banner fetch error:', err));
  }, []);

  const mergeCollections = (section, fallbackItems) => {
    return fallbackItems.map((item) => {
      const remote = remoteCollections.find(c => c.section === section && Number(c.slot) === item.id);
      return {
        ...item,
        title: remote?.title || item.title,
        searchKey: remote?.search_key || item.searchKey,
        image: getImageUrl(remote?.image_url, '')
      };
    });
  };

  const mensCategories = mergeCollections('men', [
    { id: 1, title: "Printed Round Shape T-shirts", image: '',  searchKey: "Round Shape"  },
    { id: 2, title: "V-Shape Printed T-shirts",     image: '',  searchKey: "V-Shape"      },
    { id: 3, title: "Collar Solid Polo T-shirts",   image: '',  searchKey: "Collar Polo"  }
  ]);

  const womensCategories = mergeCollections('women', [
    { id: 1, title: "Printed Round Shape T-shirts", image: '', searchKey: "Round Shape"  },
    { id: 2, title: "V-Shape Printed T-Shirts",     image: '', searchKey: "V-Shape"      },
    { id: 3, title: "Collar Solid Polo T-shirts",   image: '', searchKey: "Collar Polo"  }
  ]);

  const kidsCategories = mergeCollections('kids', [
    { id: 1, title: "Printed Round Shape T-shirts", image: '',  searchKey: "Round Shape"  },
    { id: 2, title: "V-Shape Printed T-shirts",     image: '',  searchKey: "V-Shape"      },
    { id: 3, title: "Collar Solid Polo T-Shirts",   image: '',  searchKey: "Collar Polo"  }
  ]);

  return (
    <>
      <section className="ao-promo-banner-section">
        {promoBanner?.image_url ? (
          <Link to={promoBanner.redirect_link || '/mens'} className="ao-promo-banner-link">
            {isVideoFile(promoBanner.image_url) ? (
              <video
                src={getImageUrl(promoBanner.image_url, '')}
                className="ao-promo-banner-image"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={getImageUrl(promoBanner.image_url, '')}
                alt={promoBanner.title || 'Summer AO Edition Live Now'}
                className="ao-promo-banner-image"
                loading="eager"
                decoding="async"
              />
            )}
          </Link>
        ) : (
          <Link to="/mens" className="ao-promo-fallback">
            <div className="ao-promo-marquee">
              <span>SUMMER AO EDITION LIVE NOW</span>
              <span>SUMMER AO EDITION LIVE NOW</span>
              <span>SUMMER AO EDITION LIVE NOW</span>
            </div>
          </Link>
        )}
      </section>

      {/* MEN */}
      <section className="mens-section">
        <h2 className="mens-header-title">Men's Collection</h2>
        <div className="mens-grid">
          {mensCategories.map((item) => (
            <Link
              to={`/mens?search=${encodeURIComponent(item.searchKey)}`}
              key={`men-${item.id}`}
              className="mens-card"
              style={{ textDecoration: 'none' }}
            >
              {item.image ? (
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f7' }} />
              )}
              <div className="mens-card-overlay"></div>
              <h3 className="mens-card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* WOMEN */}
      <section className="mens-section">
        <h2 className="mens-header-title">Women's Collection</h2>
        <div className="mens-grid">
          {womensCategories.map((item) => (
            <Link
              to={`/coming-soon`}
              key={`women-${item.id}`}
              className="mens-card"
              style={{ textDecoration: 'none' }}
            >
              {item.image ? (
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f7' }} />
              )}
              <div className="mens-card-overlay"></div>
              <h3 className="mens-card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* KIDS */}
      <section className="mens-section">
        <h2 className="mens-header-title">Kid's Collection</h2>
        <div className="mens-grid">
          {kidsCategories.map((item) => (
            <Link
              to={`/coming-soon`}
              key={`kids-${item.id}`}
              className="mens-card"
              style={{ textDecoration: 'none' }}
            >
              {item.image ? (
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f7' }} />
              )}
              <div className="mens-card-overlay"></div>
              <h3 className="mens-card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
