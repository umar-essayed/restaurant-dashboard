import { useState, useEffect } from 'react';
import '../login.css';
import authService from '../services/auth.service';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [toast, setToast] = useState({ message: '', type: 'error', visible: false });
  const [shakeTarget, setShakeTarget] = useState(null); // 'email', 'password', or 'button'

  // We append dynamic styles if they aren't there yet
  useEffect(() => {
    if (!document.getElementById('login-dynamic-styles')) {
      const style = document.createElement('style');
      style.id = 'login-dynamic-styles';
      style.innerHTML = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        .shake-anim { animation: shake 0.45s ease; }
        
        .spinner {
          display: inline-block;
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          color: #fff;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease, transform 0.35s ease;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .toast--error {
          background: rgba(220, 50, 50, 0.85);
          box-shadow: 0 4px 20px rgba(220, 50, 50, 0.3);
        }
        .toast--success {
          background: rgba(34, 160, 80, 0.85);
          box-shadow: 0 4px 20px rgba(34, 160, 80, 0.3);
        }
        .toast--visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const triggerShake = (target) => {
    setShakeTarget(target);
    setTimeout(() => setShakeTarget(null), 450);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      triggerShake('button');
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      triggerShake('email');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const userData = await authService.login(email, password);
      
      // Check if user is actually a vendor
      if (userData.user.role !== 'VENDOR' && userData.user.role !== 'SUPERADMIN' && userData.user.role !== 'ADMIN') {
        authService.logout();
        showToast('Access denied. This account is not a vendor.', 'error');
        setIsLoading(false);
        return;
      }

      showToast('Welcome back! Redirecting…', 'success');
      setTimeout(() => {
        onLoginSuccess(userData.user);
      }, 1000);
    } catch (err) {
      triggerShake('button');
      const errorMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };




  // We add a wrapper to ensure the login CSS styles only affect this component as much as possible,
  // but since login.css resets some globals, it might bleed. Let's rely on the classes.
  return (
    <div className="login-wrapper">
      <div className="bg-overlay"></div>

      <main className="login-container">
        <div className="logo-card">
          <img src="/assets/logo.png" alt="Zpeed Logo" className="logo-img"/>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <h1>Login as a Vendor</h1>
            <p className="subtitle">Login to your account</p>
          </div>

          <form id="loginForm" autoComplete="off" noValidate onSubmit={handleSubmit}>
            <div className={`input-group ${shakeTarget === 'email' ? 'shake-anim' : ''}`}>
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3"/>
                  <polyline points="22,7 12,13 2,7"/>
                </svg>
              </span>
              <input 
                type="email" 
                id="emailInput" 
                placeholder="Email Address" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className={`input-group ${shakeTarget === 'password' ? 'shake-anim' : ''}`}>
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                  <circle cx="12" cy="16" r="1"/>
                </svg>
              </span>
              <input 
                type={isPasswordVisible ? "text" : "password"} 
                id="passwordInput" 
                placeholder="Password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="toggle-password" 
                aria-label="Toggle password visibility"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {!isPasswordVisible ? (
                  <svg className="eye-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M14.12 14.12a3 3 0 11-4.24-4.24"/>
                  </svg>
                ) : (
                  <svg className="eye-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="forgot-row">
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              className={`btn-login ${shakeTarget === 'button' ? 'shake-anim' : ''}`}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.8 : 1 }}
            >
              {isLoading ? <span className="spinner"></span> : <span>Log In</span>}
            </button>


          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-buttons">
            <button className="social-btn" aria-label="Login with Google">
              <svg width="22" height="22" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            </button>
            <button className="social-btn" aria-label="Login with Phone">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`toast toast--${toast.type} ${toast.visible ? 'toast--visible' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}
