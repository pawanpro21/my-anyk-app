import React from 'react';
import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '50vh', backgroundColor: '#fdfdfd' }}>
      <h2 style={{ fontSize: '40px', color: '#8b2525', fontFamily: 'Georgia, serif', marginBottom: '20px' }}>Coming Soon</h2>
      <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>
        We are working hard to bring this amazing collection to you. <br/> Keep shopping with our other collections!
      </p>
      <Link to="/" style={{ 
        padding: '14px 36px', 
        backgroundColor: '#8b2525', 
        color: '#fff', 
        textDecoration: 'none', 
        fontWeight: 'bold', 
        letterSpacing: '1px',
        textTransform: 'uppercase' 
      }}>
        Back to Home
      </Link>
    </div>
  );
}