import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './Header'; 
import Misc from './Misc'; 
import Footer from './Footer';
import './App.css';
import ScrollToTopButton from './ScrollToTopButton';
import ProtectedRoute from "./ProtectedRoute";

const MensCollection = lazy(() => import('./MensCollection'));
const ComingSoon = lazy(() => import('./ComingSoon'));
const Login = lazy(() => import('./Login'));
const ProductDetails = lazy(() => import('./ProductDetails'));
const Cart = lazy(() => import('./Cart'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const Wishlist = lazy(() => import('./Wishlist'));
const YourOrders = lazy(() => import('./YourOrders'));

function upsertMetaByName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function SEOManager() {
  const location = useLocation();

  useEffect(() => {
    const origin = window.location.origin;
    const canonical = `${origin}${location.pathname}`;

    const metaConfig = {
      '/': {
        title: 'Anyk Originals | Premium Fashion for Men, Women & Kids',
        description: 'Shop stylish t-shirts and essentials by Anyk Originals. Discover premium quality, best sellers, trending drops, and value deals.'
      },
      '/mens': {
        title: "Men's Collection | Anyk Originals",
        description: "Explore Anyk Originals men's collection: round neck, V-neck, and polo styles with premium fabrics and trend-first designs."
      },
      '/cart': {
        title: 'Your Bag | Anyk Originals',
        description: 'Review your selected items, apply offers, and checkout securely with Anyk Originals.'
      },
      '/wishlist': {
        title: 'Wishlist | Anyk Originals',
        description: 'Your saved favorites at Anyk Originals. Move products to bag anytime.'
      },
      '/orders': {
        title: 'Your Orders | Anyk Originals',
        description: 'Track your orders, shipment progress, and return/exchange requests in one place.'
      },
      '/login': {
        title: 'Login | Anyk Originals',
        description: 'Sign in to manage your bag, wishlist, orders, and account details on Anyk Originals.'
      }
    };

    const pageMeta = metaConfig[location.pathname] || {
      title: 'Anyk Originals',
      description: 'Premium fashion essentials by Anyk Originals.'
    };
    const privateNoIndexRoutes = ['/login', '/cart', '/wishlist', '/orders', '/admin'];
    const robotsContent = privateNoIndexRoutes.includes(location.pathname)
      ? 'noindex,nofollow,noarchive'
      : 'index,follow,max-image-preview:large';

    document.title = pageMeta.title;
    upsertMetaByName('description', pageMeta.description);
    upsertMetaByName('robots', robotsContent);
    upsertMetaByProperty('og:title', pageMeta.title);
    upsertMetaByProperty('og:description', pageMeta.description);
    upsertMetaByProperty('og:type', 'website');
    upsertMetaByProperty('og:url', canonical);
    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', pageMeta.title);
    upsertMetaByName('twitter:description', pageMeta.description);
    upsertCanonical(canonical);

    const existingOrgSchema = document.getElementById('schema-anyk-org');
    if (existingOrgSchema) existingOrgSchema.remove();
    const orgSchema = document.createElement('script');
    orgSchema.type = 'application/ld+json';
    orgSchema.id = 'schema-anyk-org';
    orgSchema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Anyk Originals',
      url: origin,
      sameAs: [
        'https://facebook.com',
        'https://instagram.com',
        'https://x.com',
        'https://linkedin.com',
        'https://youtube.com'
      ]
    });
    document.head.appendChild(orgSchema);

    const existingSiteSchema = document.getElementById('schema-anyk-site');
    if (existingSiteSchema) existingSiteSchema.remove();
    const siteSchema = document.createElement('script');
    siteSchema.type = 'application/ld+json';
    siteSchema.id = 'schema-anyk-site';
    siteSchema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Anyk Originals',
      url: origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/mens?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    });
    document.head.appendChild(siteSchema);
  }, [location.pathname]);

  return null;
}

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function Home() {
  return (
    <>
      <Misc />
      <main className="anyk-about-section">
        <h2>Welcome to Anyk Originals Family</h2>
        <p>
          anykoriginals.com is a modern fashion brand dedicated to offering stylish and comfortable apparel for men, women, and kids. The brand focuses on everyday fashion essentials, including round neck printed t-shirts, V-neck styles, and polo t-shirts with solid collars. Designed to combine quality, affordability, and trend-driven designs, Anyk aims to deliver versatile clothing that suits every age group and occasion. Whether it's casual wear or statement pieces, Anyk brings together comfort, style, and individuality in every product.
        </p>
      </main>
    </>
  );
}

function RouteLoader() {
  return (
    <div className="anyk-route-loader" aria-live="polite">
      Loading...
    </div>
  );
}

export default function App() {
  // 1. YAHAN CART STATE BANAYI HAI (Shuruwat mein 0 items hain)
  const [cartCount, setCartCount] = useState(0);

  // 2. YEH FUNCTION CART MEIN ITEM ADD KAREGA
  const handleAddToCart = () => {
    setCartCount(prevCount => prevCount + 1);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SEOManager />
        
        {/* 3. Header ko cartCount bhej rahe hain taaki wo number dikha sake */}
        <Header cartCount={cartCount} />
        <ScrollToTopOnRouteChange />
        
        <div style={{ flex: 1 }}>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* 4. MensCollection ko addToCart function bhej rahe hain */}
              <Route path="/mens" element={<MensCollection addToCart={handleAddToCart} />} />
              
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/login" element={<Login />} />
              
              <Route path="/product/:id" element={<ProductDetails addToCart={handleAddToCart} />} />
              
              {/* YAHAN FIX KIYA GAYA HAI: Cart route ko properly format kiya hai */}
              <Route path="/cart" element={<ProtectedRoute><Cart /> </ProtectedRoute>}/>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/wishlist" element={<ProtectedRoute> <Wishlist /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><YourOrders /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </div>

        <Footer />
        <ScrollToTopButton />
      </div>
    </BrowserRouter>
  );
}
