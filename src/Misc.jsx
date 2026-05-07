import React from 'react';
// 1. YAHAN LINK IMPORT KARNA ZAROORI HAI
import { Link } from 'react-router-dom';

export default function Misc() {
  // 1. Men's Categories Data
  const mensCategories = [
    {
      id: 1,
      title: "Printed round neck tshirt",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "V-Shape Tshirts",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Collar SOLID T shirts",
      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // 2. Women's Categories Data 
  const womensCategories = [
    {
      id: 1,
      title: "Printed Tshirt",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Ethnic Wear",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Polo Tshirt",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // 3. Kids' Categories Data 
  const kidsCategories = [
    {
      id: 1,
      title: "V Shape Tshirt",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Round Neck Tshirt",
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Collar T Shirt",
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <>
      {/* ================= MEN SECTION ================= */}
      <section className="mens-section">
        <h2 className="mens-header-title">Men</h2>
        
        <div className="mens-grid">
          {mensCategories.map((item) => (
            // 2. Link ko sabse bahar lagaya hai aur className directly isko diya hai
            <Link to="/mens" key={`men-${item.id}`} className="mens-card" style={{ textDecoration: 'none' }}>
              <img src={item.image} alt={item.title} />
              <div className="mens-card-overlay"></div>
              <h3 className="mens-card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= WOMEN SECTION ================= */}
      <section className="mens-section">
        <h2 className="mens-header-title">Women</h2>
        <div className="mens-grid">
          {womensCategories.map((item) => (
            <Link to="/coming-soon" key={`women-${item.id}`} className="mens-card" style={{ textDecoration: 'none' }}>
              <img src={item.image} alt={item.title} />
              <div className="mens-card-overlay"></div>
              <h3 className="mens-card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= KIDS SECTION ================= */}
      <section className="mens-section">
        <h2 className="mens-header-title">Kids</h2>
        <div className="mens-grid">
          {kidsCategories.map((item) => (
            <Link to="/coming-soon" key={`kids-${item.id}`} className="mens-card" style={{ textDecoration: 'none' }}>
              <img src={item.image} alt={item.title} />
              <div className="mens-card-overlay"></div>
              <h3 className="mens-card-title">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}