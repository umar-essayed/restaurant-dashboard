import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';
import '../login.css';
import authService from '../services/auth.service';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage } = useLanguage();
  const isArabic = language === 'ar';
  
  const [toast, setToast] = useState({ message: '', type: 'error', visible: false });
  const [shakeTarget, setShakeTarget] = useState(null); // 'email', 'password', or 'button'

  // We append dynamic styles if they aren't there yet
  useEffect(() => {
    if (!document.getElementById('login-dynamic-styles')) {
      const style = document.createElement('style');
      style.id = 'login-dynamic-styles';
      style.innerHTML = `
        .card-header-new {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 36px;
          width: 100%;
        }
        .card-header-new.ar {
          direction: rtl;
          text-align: right;
        }
        .card-header-new.en {
          direction: ltr;
          text-align: left;
        }
        .logo-icon-new {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }
        .title-new {
          font-family: 'Cairo', sans-serif;
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          margin: 0;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }
        .subtitle-new {
          font-family: 'Cairo', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin: 2px 0 0 0;
        }
        
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
          font-family: 'Cairo', sans-serif;
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
    <div className="login-wrapper" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="bg-overlay"></div>

      <button 
        onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
        className="lang-btn"
      >
        <Languages size={18} />
        <span>{isArabic ? 'English' : 'العربية'}</span>
      </button>

      <main className="login-container">
        <div className="glass-card">
          <div className={`card-header-new ${isArabic ? 'ar' : 'en'}`}>
            <div className="logo-section">
              <img src="/assets/icon.png" alt="Zpeed Logo" className="logo-icon-new" />
            </div>
            <div className="text-section">
              <h1 className="title-new">{isArabic ? 'مرحباً بعودتك' : 'Welcome Back'}</h1>
              <p className="subtitle-new">{isArabic ? 'سجل دخولك لمتابعة لوحة التحكم' : 'Log in to access your dashboard'}</p>
            </div>
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
                placeholder={isArabic ? 'البريد الإلكتروني' : 'Email Address'} 
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
                placeholder={isArabic ? 'كلمة المرور' : 'Password'} 
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

            <div className={`forgot-row ${isArabic ? 'justify-start' : 'justify-end'}`}>
              <a href="#" className="forgot-link">{isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}</a>
            </div>

            <button 
              type="submit" 
              className={`btn-login ${shakeTarget === 'button' ? 'shake-anim' : ''}`}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.8 : 1, fontFamily: 'Cairo' }}
            >
              {isLoading ? <span className="spinner"></span> : <span>{isArabic ? 'تسجيل الدخول' : 'Log In'}</span>}
            </button>


          </form>

        </div>
      </main>

      {/* Toast Notification */}
      <div className={`toast toast--${toast.type} ${toast.visible ? 'toast--visible' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}
