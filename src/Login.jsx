import React, { useState } from 'react';

export default function Login() {
  // Yeh state check karegi ki user Login page par hai ya Sign Up page par
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">{isLogin ? 'Welcome to Anyk Family' : 'Create an Account'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Login to access your Anyk Originals account.' 
            : 'Sign up quickly using your mobile number or email.'}
        </p>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          
          {/* Sign Up ke time Name ka field dikhayenge */}
          {!isLogin && (
            <div className="auth-input-group">
              <label>Full Name</label>
              <input type="text" placeholder="Pawan Srivastav" required />
            </div>
          )}

          <div className="auth-input-group">
            <label>Mobile Number / Email</label>
            <input type="text" placeholder="+917011493689 or pksri21@gmail.com" required />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          {isLogin && <span className="auth-forgot-password">Forgot Password?</span>}

          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'LOGIN' : 'SIGN UP'}
          </button>
        </form>

        <div className="auth-toggle-section">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="auth-toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up here' : 'Login here'}
          </span>
        </div>
      </div>
    </div>
  );
}