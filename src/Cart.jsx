import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product; // Jo product add kiya tha, wo yahan aayega

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', color: '#282c3f', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShoppingBag size={28} color="maroon" /> PLACE ORDER
      </h2>

      {product ? (
        <div style={{ display: 'flex', border: '1px solid #eaeaec', borderRadius: '8px', padding: '20px', gap: '20px', backgroundColor: '#fff' }}>
          <img src={product.image} alt={product.name} style={{ width: '120px', borderRadius: '4px' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#282c3f' }}>{product.name}</h3>
            <p style={{ color: '#535766', margin: '0 0 5px 0' }}>Sold by: ANYK ORIGINALS</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ₹{product.discount > 0 ? Math.round(product.priceNum - (product.priceNum * product.discount / 100)) : product.priceNum}
              </span>
              {product.discount > 0 && <span style={{ textDecoration: 'line-through', color: '#94969f' }}>₹{product.priceNum}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f7f6f4', borderRadius: '8px' }}>
          <ShoppingBag size={40} color="#bfc0c6" style={{ marginBottom: '10px' }} />
          <h3>Your Bag is Empty</h3>
        </div>
      )}

      <div style={{ marginTop: '30px', borderTop: '1px solid #eaeaec', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#535766', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ShieldCheck size={18} color="#2ecc71" /> Safe and Secure Payments
        </p>
        <button 
          style={{ backgroundColor: 'maroon', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          onClick={() => alert("Redirecting to Payment Gateway...")}
        >
          PROCEED TO PAYMENT <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}