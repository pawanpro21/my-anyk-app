import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Header'; 
import Misc from './Misc'; 
import Footer from './Footer';
import MensCollection from './MensCollection';
import ComingSoon from './ComingSoon';
import Login from './Login';
import './App.css';
import ProductDetails from './ProductDetails';
import Cart from './Cart';

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
        
        {/* 3. Header ko cartCount bhej rahe hain taaki wo number dikha sake */}
        <Header cartCount={cartCount} />
        
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* 4. MensCollection ko addToCart function bhej rahe hain */}
            <Route path="/mens" element={<MensCollection addToCart={handleAddToCart} />} />
            
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/product/:id" element={<ProductDetails addToCart={handleAddToCart} />} />
            
            {/* YAHAN FIX KIYA GAYA HAI: Cart route ko properly format kiya hai */}
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}