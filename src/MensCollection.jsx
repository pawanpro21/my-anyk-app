import React, { useState } from 'react';
// ArrowUpDown icon add kiya hai Sorting ke liye
import { Search, Wand2, Filter, X, ArrowUpDown } from 'lucide-react'; 
import { useLocation, useNavigate } from 'react-router-dom';

import men1 from './assets/men1.png';
import men2 from './assets/men2.png';
import men3 from './assets/men3.png';
import men4 from './assets/men4.png';
import men5 from './assets/men5.png';
import men16 from './assets/men16.png'; 
import men17 from './assets/men17.png';
import men18 from './assets/men18.png';
import men19 from './assets/men19.png';
import men20 from './assets/men20.png';
import men21 from './assets/men21.png';
import men22 from './assets/men22.png';
import menz5 from './assets/menz5.png';
import menz1 from './assets/menz1.png';

export default function MensCollection({ addToCart }) {
  const [priceRange, setPriceRange] = useState(10100);
  const [discountFilter, setDiscountFilter] = useState(0);
  const [selectedColors, setSelectedColors] = useState([]); 
  const [addedItems, setAddedItems] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 1. Naya state Sorting ke liye ('low-to-high' ya 'high-to-low')
  const [sortOrder, setSortOrder] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const products = [
    { id: 1, name: "White Round Shape T-Shirt", color: "White", priceNum: 999, discount: 15, image: men1 },
    { id: 2, name: "Printed Round Shape T-shirt", color: "White", priceNum: 699, discount: 5, image: men2 },
    { id: 3, name: "Round Shape Anyk Originals T-shirt", color: "Black", priceNum: 799, discount: 25, image: men3 },
    { id: 4, name: "Classic Round Shape T-shirt", color: "Black", priceNum: 1199, discount: 10, image: men4 },
    { id: 5, name: "Round Shape Cotton T-Shirt", color: "White", priceNum: 1299, discount: 35, image: men5 },
    { id: 6, name: "Round Shape Anyk Originals T-shirt", color: "Black", priceNum: 1499, discount: 0, image: men16 },
    { id: 17, name: "Cotton Anyk Origoinals Printed T-shirt", color: "Blue", priceNum: 1599, discount: 20, image: men17 },
    { id: 18, name: "Round Shape Anyk Originals T-shirt", color: "Black", priceNum: 649, discount: 10, image: men18 },
    { id: 19, name: " Printed V-Shape Anyk Originals T-shirt", color: "Black", priceNum: 1899, discount: 5, image: men19 },
    { id: 20, name: "Solid Collar Polo Polo T-shirt", color: "Green", priceNum: 899, discount: 15, image: men20 },
    { id: 21, name: "Printed Collar Polo Polo T-shirt", color: "Red", priceNum: 599, discount: 0, image: men21 },
    { id: 22, name: "Collar Solid Polo T-shirt", color: "Blue", priceNum: 1299, discount: 25, image: men22 },
    { id: 23, name: "Collar Solid Polo T-shirt", color: "Blue", priceNum: 1299, discount: 25, image: menz5 },
    { id: 24, name: "Cotton Round Shape Printed T-shirt", color: "Blue", priceNum: 1299, discount: 25, image: menz1 },
  ];

  const handleAddToCartClick = (productId) => {
    addToCart();
    setAddedItems(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => { setAddedItems(prev => ({ ...prev, [productId]: false })); }, 2000);
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) return prev.filter(c => c !== color);
      return [...prev, color];
    });
  };

  const clearFilters = () => {
    setPriceRange(10100);
    setDiscountFilter(0);
    setSelectedColors([]); 
    const radios = document.getElementsByName('discount');
    for(let i=0; i<radios.length; i++) { radios[i].checked = false; }
  };

  // Pehle Filter karenge
  const filteredProducts = products.filter((product) => {
    const finalPrice = product.discount > 0 
      ? Math.round(product.priceNum - (product.priceNum * product.discount / 100))
      : product.priceNum;

    const isPriceValid = finalPrice <= priceRange;
    const isDiscountValid = product.discount >= discountFilter;
    const isColorValid = selectedColors.length === 0 || selectedColors.includes(product.color);
    const isSearchValid = searchQuery === '' || 
                          product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.color.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isPriceValid && isDiscountValid && isColorValid && isSearchValid;
  });

  // 2. Phir Filtered Products ko Sort karenge FINAL PRICE ke basis pe
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount > 0 ? Math.round(a.priceNum - (a.priceNum * a.discount / 100)) : a.priceNum;
    const priceB = b.discount > 0 ? Math.round(b.priceNum - (b.priceNum * b.discount / 100)) : b.priceNum;

    if (sortOrder === 'low-to-high') return priceA - priceB;
    if (sortOrder === 'high-to-low') return priceB - priceA;
    return 0; // Default (Recommended)
  });

  return (
    <div className="plp-container">
      
      <div className="plp-header-row">
        <h1 className="plp-title">Men's Collection</h1>
        
        {/* 3. Sort aur Filter Buttons ka Wrapper */}
        <div className="plp-header-actions">
          
          <div className="sort-wrapper">
            <ArrowUpDown size={16} />
            <select 
              className="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">SORT: Recommended</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>

          <button className="filter-toggle-btn" onClick={() => setIsFilterOpen(true)}>
            <Filter size={16} /> FILTER
          </button>
          
        </div>
      </div>
      
      <div className="plp-layout">
        
        {isFilterOpen && <div className="filter-backdrop" onClick={() => setIsFilterOpen(false)}></div>}

        <aside className={`plp-sidebar ${isFilterOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3>FILTERS</h3>
            <X size={24} className="close-filter" onClick={() => setIsFilterOpen(false)} />
          </div>

          <div className="plp-filter-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="plp-filter-title">PRICE</h4>
              <span onClick={clearFilters} className="clear-all-text">CLEAR ALL</span>
            </div>
            <div className="range-slider-container">
              <input type="range" min="100" max="3000" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="plp-range-slider"/>
              <div className="plp-price-text">Under ₹{priceRange}</div>
            </div>
          </div>

          <div className="plp-filter-section">
            <div className="plp-filter-title">COLOR</div>
            <div className="color-list">
              {["Black", "White", "Blue", "Red", "Green"].map(color => (
                <label key={color} className="filter-label">
                  <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => handleColorToggle(color)} /> 
                  <span className="color-circle" style={{backgroundColor: color === 'Black' ? '#2b2e3d' : color.toLowerCase()}}></span> {color}
                </label>
              ))}
            </div>
          </div>

          <div className="plp-filter-section" style={{borderBottom: 'none'}}>
            <h4 className="plp-filter-title">DISCOUNT</h4>
            <div className="discount-list">
              <label className="filter-label"><input type="radio" name="discount" onChange={() => setDiscountFilter(10)} /> 10% & above</label>
              <label className="filter-label"><input type="radio" name="discount" onChange={() => setDiscountFilter(20)} /> 20% & above</label>
              <label className="filter-label"><input type="radio" name="discount" onChange={() => setDiscountFilter(30)} /> 30% & above</label>
            </div>
          </div>

          <button className="apply-filter-btn" onClick={() => setIsFilterOpen(false)}>APPLY FILTERS</button>
        </aside>

        <main className="plp-grid">
          {searchQuery && (
            <div className="search-query-chip">
              Showing results for: <strong>"{searchQuery}"</strong>
            </div>
          )}

          {/* 4. Yahan ab `sortedProducts` map hoga filteredProducts ki jagah */}
          {sortedProducts.length === 0 ? (
            <div className="no-results">No products match your filters.</div>
          ) : (
            sortedProducts.map(product => {
              const originalPrice = product.priceNum;
              const discountedPrice = product.discount > 0 
                ? Math.round(originalPrice - (originalPrice * product.discount / 100))
                : originalPrice;
              const isAdded = addedItems[product.id];

              return (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} onClick={() => navigate(`/product/${product.id}`, { state: { product } })} />
                    <div className="wishlist-icon-overlay" onClick={(e) => { e.stopPropagation(); alert('Added!'); }}>
                      <Wand2 size={18} />
                    </div>
                    {product.discount > 0 && <div className="discount-badge-overlay">{product.discount}% OFF</div>}
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <div className="pdp-price-row">
                      <span className="final-price">₹{discountedPrice}</span>
                      {product.discount > 0 && <span className="cut-price">₹{originalPrice}</span>}
                    </div>
                    <button 
                      className="add-to-cart-btn" 
                      style={{ backgroundColor: isAdded ? '#2ecc71' : '' }}
                      onClick={() => handleAddToCartClick(product.id)}
                    >
                      {isAdded ? 'ADDED ✓' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}