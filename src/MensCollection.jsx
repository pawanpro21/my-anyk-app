import React, { useState } from 'react';
import { Search } from 'lucide-react';

// 1. IMPORTING ALL 15 IMAGES FROM ASSETS
import men1 from './assets/Men1.png';
import men2 from './assets/Men2.png';
import men3 from './assets/Men3.png';
import men4 from './assets/Men4.png';
import men5 from './assets/Men5.png';
import men6 from './assets/Men6.png';
import men7 from './assets/Men7.png';
import men8 from './assets/Men8.png';
import men9 from './assets/Men9.png';
import men10 from './assets/Men10.png';
import men11 from './assets/Men11.png';
import men12 from './assets/Men12.png';
import men13 from './assets/Men13.png';
import men14 from './assets/Men14.png';
import men15 from './assets/Men15.png';

export default function MensCollection({ addToCart }) {
  const [priceRange, setPriceRange] = useState(10100);

  // 15 Products List
  const products = [
    { id: 1, name: "Solid Polo T-Shirt", price: "₹999", image: men1 },
    { id: 2, name: "Printed Round Neck", price: "₹699", image: men2 },
    { id: 3, name: "V-Neck Casual Tee", price: "₹799", image: men3 },
    { id: 4, name: "Classic White Collar", price: "₹1199", image: men4 },
    { id: 5, name: "Striped Cotton Shirt", price: "₹1299", image: men5 },
    { id: 6, name: "Slim Fit Chinos", price: "₹1499", image: men6 },
    { id: 7, name: "Denim Jacket", price: "₹2499", image: men7 },
    { id: 8, name: "Basic Black Tee", price: "₹499", image: men8 },
    { id: 9, name: "Olive Cargo Pants", price: "₹1799", image: men9 },
    { id: 10, name: "Formal Blue Shirt", price: "₹1199", image: men10 },
    { id: 11, name: "Graphic Print Tee", price: "₹599", image: men11 },
    { id: 12, name: "Winter Hoodie", price: "₹1999", image: men12 },
    { id: 13, name: "Track Pants", price: "₹899", image: men13 },
    { id: 14, name: "Checked Flannel", price: "₹1399", image: men14 },
    { id: 15, name: "Sports Vest", price: "₹399", image: men15 },
  ];

  return (
    <div className="plp-container">
      <h1 className="plp-title">Men's Collection</h1>
      
      <div className="plp-layout">
        
        {/* Left Sidebar Filters (Premium Myntra Style) */}
        <aside className="plp-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', marginBottom: '20px', borderBottom: '1px solid #eaeaec' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#282c3f', margin: 0, letterSpacing: '1px' }}>FILTERS</h3>
            <span style={{ color: 'maroon', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>CLEAR ALL</span>
          </div>
          {/* PRICE FILTER */}
          <div className="plp-filter-section">
            <h4 className="plp-filter-title">PRICE</h4>
            <div className="range-slider-container">
              <input 
                type="range" 
                min="100" 
                max="10100" 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
                className="plp-range-slider"
              />
              <div className="plp-price-text">
                ₹100 - ₹{priceRange}+
              </div>
            </div>
          </div>

          {/* COLOR FILTER */}
          <div className="plp-filter-section">
            <div className="plp-filter-title">
              COLOR
              <div className="search-icon-btn">
                <Search size={14} color="#555" />
              </div>
            </div>
            
            <div className="color-list">
              <label className="filter-label"><input type="checkbox" /> <span className="color-circle" style={{backgroundColor: '#2b2e3d'}}></span> Black <span className="color-count"></span></label>
              <label className="filter-label"><input type="checkbox" /> <span className="color-circle" style={{backgroundColor: '#ffffff', border: '1px solid #e0e0e0'}}></span> White <span className="color-count"></span></label>
              <label className="filter-label"><input type="checkbox" /> <span className="color-circle" style={{backgroundColor: '#0a6ecc'}}></span> Blue <span className="color-count"></span></label>
              <label className="filter-label"><input type="checkbox" /> <span className="color-circle" style={{backgroundColor: '#353b60'}}></span> Navy Blue <span className="color-count"></span></label>
              <label className="filter-label"><input type="checkbox" /> <span className="color-circle" style={{backgroundColor: '#52a352'}}></span> Green <span className="color-count"></span></label>
              <label className="filter-label"><input type="checkbox" /> <span className="color-circle" style={{backgroundColor: '#9e9e9e'}}></span> Grey <span className="color-count"></span></label>
              <label className="filter-label"><input type="checkbox" /> <span className="color-circle" style={{backgroundColor: '#c44242'}}></span> Red <span className="color-count"></span></label>
            </div>
          </div>

          {/* DISCOUNT RANGE FILTER */}
          <div className="plp-filter-section" style={{borderBottom: 'none'}}>
            <h4 className="plp-filter-title">DISCOUNT RANGE</h4>
            <div className="discount-list">
              <label className="filter-label"><input type="radio" name="discount" /> 10% and above</label>
              <label className="filter-label"><input type="radio" name="discount" /> 20% and above</label>
              <label className="filter-label"><input type="radio" name="discount" /> 30% and above</label>
            </div>
          </div>

        </aside>

        {/* Right Product Grid */}
        <main className="plp-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="price">{product.price}</p>
                {/* Naya Size aur Quantity Selector */}
                {/* Updated Size aur Quantity Selector */}
                <div className="product-options">
                  {/* Size Dropdown: selected hata kar defaultValue lagaya */}
                  <select className="option-select" defaultValue="">
                    <option value="" disabled>Size</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>

                  {/* Quantity Dropdown */}
                  <select className="option-select" defaultValue="1">
                    <option value="1">Qty: 1</option>
                    <option value="2">Qty: 2</option>
                    <option value="3">Qty: 3</option>
                    <option value="4">Qty: 4</option>
                  </select>
                </div>

                {/* Updated Button jo onClick par addToCart call karega */}
                <button className="add-to-cart-btn" onClick={addToCart}>
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </main>
        
      </div>
    </div>
  );
}