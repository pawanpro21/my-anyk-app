import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, User, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import api from './services/api';

export default function Login() {
  const [view, setView] = useState('login'); // login, signup, signupOtp, forgot, reset
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    otp: '',
    newPassword: ''
  });

  const getRedirectPath = (role) => {
    const redirectParam = new URLSearchParams(location.search).get('redirect');
    const requestedPath = location.state?.from?.pathname || redirectParam;
    const normalizedRole = String(role || '').trim().toLowerCase();

    if (normalizedRole === 'admin') return '/admin';
    if (requestedPath && requestedPath !== '/login' && !requestedPath.startsWith('/login')) {
      return requestedPath;
    }
    return '/';
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem('auth_user');

    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      navigate(getRedirectPath(user?.role), { replace: true });
    } catch {
      sessionStorage.removeItem('auth_user');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  // 1. SIGNUP - OTP SEND
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/signup', {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });

      Swal.fire({
        title: 'OTP Sent!',
        text: 'OTP has been sent to your email.',
        icon: 'success',
        confirmButtonColor: 'maroon'
      });

      setView('signupOtp');

    } catch (err) {
      Swal.fire({
        title: 'Signup Failed',
        text: err.response?.data?.message || 'Signup failed',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGNUP OTP VERIFY
  const handleSignupOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/verify-signup-otp', {
        email: formData.email,
        otp: formData.otp
      });

      Swal.fire({
        title: 'Account Verified!',
        text: 'You can now login.',
        icon: 'success',
        confirmButtonColor: 'maroon'
      });

      setFormData({
        ...formData,
        otp: '',
        password: ''
      });

      setView('login');

    } catch (err) {
      Swal.fire({
        title: 'OTP Verification Failed',
        text: err.response?.data?.message || 'Invalid or expired OTP',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGIN
 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');

    const loginRes = await api.post('/api/login', {
      identifier: formData.email,
      password: formData.password
    });

    if (loginRes.data?.token) {
      sessionStorage.setItem('auth_token', loginRes.data.token);
    }

    if (loginRes.data?.user) {
      sessionStorage.setItem('auth_user', JSON.stringify(loginRes.data.user));
    }

    const userRole = loginRes.data?.user?.role;
    const redirectTo = getRedirectPath(userRole);

    Swal.fire({
      title: 'Welcome Back!',
      text: 'Login successful!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      position: 'center'
    });
    navigate(redirectTo, { replace: true });

  } catch (err) {
    Swal.fire({
      title: 'Login Error',
      text: err.response?.data?.message || err.message || 'Login failed.',
      icon: 'error',
      confirmButtonColor: 'maroon'
    });
  } finally {
    setLoading(false);
  }
};

  // 4. FORGOT PASSWORD
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/forgot-password', {
        email: formData.email
      });

      Swal.fire({
        title: 'OTP Sent!',
        text: 'OTP sent to your email!',
        icon: 'info',
        confirmButtonColor: 'maroon'
      });

      setView('reset');

    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'User not found with this email',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. RESET PASSWORD
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      Swal.fire({
        title: 'Password Updated!',
        text: 'Password changed successfully! Please login.',
        icon: 'success',
        confirmButtonColor: 'maroon'
      });

      setView('login');

    } catch (err) {
      Swal.fire({
        title: 'Reset Failed',
        text: err.response?.data?.message || 'Invalid OTP or error resetting password',
        icon: 'error',
        confirmButtonColor: 'maroon'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <div className="auth-header">
          <h2 className="auth-title">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'signupOtp' && 'Verify Email'}
            {view === 'forgot' && 'Reset Password'}
            {view === 'reset' && 'Set New Password'}
          </h2>

          <p className="auth-subtitle">
            Anyk Originals - Quality is our Identity
          </p>
        </div>

        {view === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">

            <div className="input-group">
              <label className="auth-label">
                <Mail size={16} /> Email or Mobile
              </label>

              <input
                type="text"
                name="email"
                className="auth-input"
                placeholder="Enter email or mobile number "
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="auth-label">
                <Lock size={16} /> Password
              </label>

              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <span
              onClick={() => setView('forgot')}
              className="link-text"
            >
              Forgot Password?
            </span>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Processing...' : 'LOGIN'}
            </button>

            <p className="toggle-text">
              New here?{' '}
              <span
                onClick={() => setView('signup')}
                className="toggle-link"
              >
                Sign up
              </span>
            </p>

          </form>
        )}

        {view === 'signup' && (
          <form onSubmit={handleSignup} className="auth-form">

            <div className="input-group">
              <label className="auth-label">
                <User size={16} /> Full Name
              </label>

              <input
                type="text"
                name="name"
                className="auth-input"
                placeholder="Enter Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="auth-label">
                <Mail size={16} /> Email Address
              </label>

              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="care@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="auth-label">
                <Phone size={16} /> Mobile Number
              </label>

              <input
                type="text"
                name="mobile"
                className="auth-input"
                placeholder="Enter Mobile No."
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="auth-label">
                <Lock size={16} /> Set Password
              </label>

              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder="Create strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Sending OTP...' : 'SIGN UP'}
            </button>

            <p className="toggle-text">
              Already have an account?{' '}
              <span
                onClick={() => setView('login')}
                className="toggle-link"
              >
                Login
              </span>
            </p>

          </form>
        )}

        {view === 'signupOtp' && (
          <form onSubmit={handleSignupOtpVerify} className="auth-form">

            <div className="input-group">
              <label className="auth-label">
                <RefreshCw size={16} /> Enter Signup OTP
              </label>

              <input
                type="text"
                name="otp"
                className="auth-input"
                placeholder="Enter OTP sent to your email"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Verifying...' : 'VERIFY OTP'}
            </button>

            <p className="toggle-text">
              Wrong email?{' '}
              <span
                onClick={() => setView('signup')}
                className="toggle-link"
              >
                Back to Signup
              </span>
            </p>

          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="auth-form">

            <div className="input-group">
              <label className="auth-label">
                <Mail size={16} /> Registered Email
              </label>

              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Sending...' : 'SEND OTP'}
            </button>

            <p
              onClick={() => setView('login')}
              className="toggle-link"
              style={{
                textAlign: 'center',
                display: 'block',
                marginTop: '15px'
              }}
            >
              Back to Login
            </p>

          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handleReset} className="auth-form">

            <div className="input-group">
              <label className="auth-label">
                <RefreshCw size={16} /> Enter OTP
              </label>

              <input
                type="text"
                name="otp"
                className="auth-input"
                placeholder="Check your email"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="auth-label">
                <Lock size={16} /> New Password
              </label>

              <input
                type="password"
                name="newPassword"
                className="auth-input"
                placeholder="Set new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Updating...' : 'UPDATE PASSWORD'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
