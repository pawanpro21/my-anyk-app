import React from 'react';
import { Link } from 'react-router-dom';

// 1. Men's Images Import
import menz1 from './assets/menz1.png';
import menz4 from './assets/menz4.png';
import menz5 from './assets/menz5.png';

// 2. Women's Images Import
import women1 from './assets/women1.png';
import women2 from './assets/women2.png';
import women4 from './assets/women4.png';

// 3. Kids' Images Import
import kidz1 from './assets/kidz1.png';
import kidz4 from './assets/kidz4.png';
import kidz5 from './assets/kidz5.png';

export default function Misc() {
  
  // ================= MEN'S DATA =================
  const mensCategories = [
    {
      id: 1,
      title: "Printed Round Shape T-shirts",
      image: menz1 
    },
    {
      id: 2,
      title: "V-Shape Printed T-shirts",
      image: menz4 
    },
    {
      id: 3,
      title: "Collar Solid Polo T-shirts",
      image: menz5 
    }
  ];

  // ================= WOMEN'S DATA =================
  const womensCategories = [
    {
      id: 1,
      title: "Printed Round Shape T-shirts",
      image: women1 
    },
    {
      id: 2,
      title: "V-Shape Printed T-Shirts",
      image: women2 
    },
    {
      id: 3,
      title: "Collar Solid Polo T-shirts",
      image: women4 
    }
  ];

  // ================= KIDS' DATA =================
  const kidsCategories = [
    {
      id: 1,
      title: "Printed Round Shape T-shirts",
      image: kidz1 
    },
    {
      id: 2,
      title: "V-Shape Printed T-shirts",
      image: kidz4 
    },
    {
      id: 3,
      title: "Collar Solid Polo T-Shirts",
      image: kidz5 
    }
  ];

  return (
    <>
      {/* ================= MEN SECTION ================= */}
      <section className="mens-section">
        <h2 className="mens-header-title">Men's Collection</h2>
        
        <div className="mens-grid">
          {mensCategories.map((item) => (
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
        <h2 className="mens-header-title">Women's Collection</h2>
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
        <h2 className="mens-header-title">Kid's Collection</h2>
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