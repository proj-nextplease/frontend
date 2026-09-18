import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';
import { setRemember, setStoredToken, rememberLastEmail, getLastEmail } from '../lib/authStorage.js';

export function LoginModal({ isOpen, role = 'candidate', onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [currentRole] = useState(role);
  const [email, setEmail] = useState(getLastEmail() || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSupabaseConfigured = Boolean(supabase);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  async function handleSocialLogin(provider = 'google') {
    setLoading(true);
    setErrorMsg('');
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setLoading(false);
        onClose();
        navigate(currentRole === 'business' ? '/businesses/dashboard' : '/candidates/dashboard');
      }, 600);
      return;
    }
    const redirectPath = currentRole === 'business' ? '/businesses/dashboard' : '/candidates/dashboard';
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setLoading(false);
        onClose();
        navigate(currentRole === 'business' ? '/businesses/dashboard' : '/candidates/dashboard');
      }, 500);
      return;
    }

    try {
      setRemember(keepSignedIn);
      const response = await loginCandidate(email, password);
      rememberLastEmail(email);

      if (response.accessToken) {
        setStoredToken(response.accessToken);
      }

      if (supabase) {
        await supabase.auth.setSession({
          access_token: response.accessToken,
          refresh_token: response.refreshToken || '',
        });
      }

      onClose();
      navigate(currentRole === 'business' ? '/businesses/dashboard' : '/candidates/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="np-auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        .np-auth-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(4, 47, 46, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: npAuthFadeIn 0.25s ease-out both;
        }

        @keyframes npAuthFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .np-auth-modal-card {
          position: relative;
          width: 100%;
          max-width: 880px;
          min-height: 520px;
          background: #ffffff;
          border-radius: 40px;
          box-shadow: 0 25px 60px -15px rgba(2, 44, 40, 0.4);
          display: flex;
          padding: 16px;
          gap: 24px;
          animation: npAuthZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
          overflow: hidden;
        }

        @keyframes npAuthZoomIn {
          0% { opacity: 0; transform: scale(0.93) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .np-auth-close-btn {
          position: absolute;
          top: 22px;
          right: 22px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          color: #0f766e;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }
        .np-auth-close-btn:hover {
          background: #ccfbf1;
          color: #042f2e;
          transform: rotate(90deg);
        }

        /* ── Left Video Cover ── */
        .np-auth-left-cover {
          display: none;
          width: 48%;
          background: #042f2e;
          border-radius: 30px;
          position: relative;
          overflow: hidden;
          padding: 0;
          box-sizing: border-box;
          border: 1px solid rgba(94, 234, 212, 0.22);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        @media (min-width: 820px) {
          .np-auth-left-cover { display: flex; }
        }
        .np-auth-cover-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 30px;
        }

        /* ── Right Form Column ── */
        .np-auth-right-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 16px 20px 16px 12px;
        }
        @media (max-width: 819px) {
          .np-auth-right-content { padding: 24px 12px; }
        }

        .np-auth-input-wrap {
          position: relative;
          margin-bottom: 12px;
        }
        .np-auth-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #5b7772;
          pointer-events: none;
          display: flex;
        }
        .np-auth-input {
          width: 100%;
          height: 52px;
          background: #f8fafc;
          border: 1.5px solid #e2efe9;
          border-radius: 16px;
          padding: 0 16px 0 48px;
          font-size: 0.98rem;
          color: #0f2e2b;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .np-auth-input:focus {
          background: #ffffff;
          border-color: #0d9488;
          box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.14);
        }

        .np-auth-social-btn {
          height: 48px;
          background: #ffffff;
          border: 1.5px solid #e2efe9;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f2e2b;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .np-auth-social-btn:hover {
          background: #f0fdf4;
          border-color: #a7f3d0;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(13, 148, 136, 0.08);
        }

        .np-auth-submit-btn {
          width: 100%;
          height: 52px;
          background: linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0f766e 100%);
          color: #ffffff;
          border: none;
          border-radius: 16px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s ease;
          font-family: inherit;
          margin-top: 8px;
        }
        .np-auth-submit-btn:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 148, 136, 0.35);
        }
        .np-auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="np-auth-modal-card">
        {/* Close button */}
        <button type="button" className="np-auth-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* ── Left Video Cover ── */}
        <div className="np-auth-left-cover">
          <video
            src="/video-2.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="np-auth-cover-video"
          />
        </div>

        {/* ── Right Column: Form Panel ── */}
        <div className="np-auth-right-content">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.65rem', fontWeight: 800, color: '#0f2e2b', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Nhập email để tiếp tục
            </h2>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#5b7772', lineHeight: 1.5 }}>
              Đăng nhập hoặc xác thực tài khoản nextplease để tiếp tục.
            </p>
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.88rem', fontWeight: 600, marginBottom: '14px', lineHeight: 1.4 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Email Input */}
            <div className="np-auth-input-wrap">
              <span className="np-auth-input-icon"><Mail size={19} /></span>
              <input
                ref={inputRef}
                type="email"
                name="email"
                className="np-auth-input"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="np-auth-input-wrap" style={{ position: 'relative' }}>
              <span className="np-auth-input-icon"><Lock size={19} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="np-auth-input"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5b7772', cursor: 'pointer', display: 'flex', padding: 0 }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot password & Remember checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 16px', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5b7772', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  style={{ accentColor: '#0d9488', cursor: 'pointer' }}
                />
                Ghi nhớ đăng nhập
              </label>
              <Link
                to="/candidate/forgot-password"
                onClick={onClose}
                style={{ color: '#0d9488', fontWeight: 700, textDecoration: 'none' }}
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="np-auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Tiếp tục</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0 14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2efe9' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#5b7772' }}>Hoặc tiếp tục với</span>
              <div style={{ flex: 1, height: '1px', background: '#e2efe9' }} />
            </div>

            {/* Social Login 3-Column Grid (Google, Facebook, GitHub) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Google Button */}
              <button
                type="button"
                className="np-auth-social-btn"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                title="Tiếp tục với Google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" fill="#4285F4" />
                  <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z" fill="#34A853" />
                  <path d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.27C.46 8.19 0 10.04 0 12s.46 3.81 1.27 5.43l4.01-3.14z" fill="#FBBC05" />
                  <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.57l4.01 3.14c.95-2.83 3.6-4.96 6.72-4.96z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                className="np-auth-social-btn"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                title="Tiếp tục với Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                className="np-auth-social-btn"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                title="Tiếp tục với GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#0f2e2b">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82a7.48 7.48 0 0 0-4 0c-1.53-1.04-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9.01.64.01 1.11.01 1.25 0 .21-.15.47-.55.38A8.014 8.014 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
