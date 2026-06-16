import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  BriefcaseBusiness,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';

const socialProviders = [
  { provider: 'google', label: 'Google', mark: 'G' },
  { provider: 'facebook', label: 'Facebook', mark: 'f' },
  {
    provider: 'github',
    label: 'GitHub',
    mark: (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        version="1.1"
        width="14"
        height="14"
        fill="currentColor"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      >
        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82a7.48 7.48 0 0 0-4 0c-1.53-1.04-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9.01.64.01 1.11.01 1.25 0 .21-.15.47-.55.38A8.014 8.014 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
      </svg>
    ),
  },
];

export function BusinessLoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('email');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isSupabaseConfigured = Boolean(supabase);

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - bounds.top}px`);
    event.currentTarget.style.setProperty('--cursor-opacity', '1');
  }

  function handlePointerLeave(event) {
    event.currentTarget.style.setProperty('--cursor-opacity', '0');
  }

  function updateField(event) {
    const { name, value } = event.target;
    setLoginData((current) => ({ ...current, [name]: value }));
  }

  async function handleSocialLogin(provider) {
    setStatus({ type: 'loading', message: `Đang mở đăng nhập bằng ${provider}...` });

    if (!isSupabaseConfigured) {
      navigate('/businesses/dashboard');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/businesses/dashboard`,
      },
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Đang kiểm tra tài khoản đối tác...' });

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setStatus({ type: 'error', message: 'Nhập email và mật khẩu trước nhé.' });
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus({ type: 'success', message: 'Đăng nhập mô phỏng thành công. Đang mở dashboard...' });
      navigate('/businesses/dashboard');
      return;
    }

    try {
      const response = await loginCandidate(loginData.email, loginData.password);

      // Save access token to sessionStorage as fallback for httpClient
      if (response.accessToken) {
        sessionStorage.setItem('nextplease:access_token', response.accessToken);
      }

      if (supabase && response.accessToken && response.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: response.accessToken,
          refresh_token: response.refreshToken,
        });

        if (error) {
          console.warn('Supabase setSession warning (non-blocking):', error.message);
        }
      }

      // Check user roles, redirect admin to admin reviews, else to businesses dashboard
      if (response.user?.roles?.includes('admin')) {
        navigate('/nextplease-admin-portal/b2b-reviews');
      } else {
        navigate('/businesses/dashboard');
      }
    } catch (error) {
      sessionStorage.removeItem('nextplease:access_token');
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại.',
      });
    }
  }

  return (
    <section
      className="candidate-login-page interactive-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cursor-spotlight" aria-hidden="true" />

      <section className="candidate-login-shell">
        <div className="candidate-login-copy" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(255,122,26,0.05) 100%)' }}>
          <Link className="portfolio-back-link" to="/businesses">
            Quay về trang đối tác
          </Link>
          <h1 style={{ background: 'linear-gradient(to right, #2563eb, #ff7a1a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Kết nối với thế hệ tài năng thực tế.
          </h1>
          
          <div className="candidate-login-highlights">
            <span>
              <BriefcaseBusiness size={18} />
              Quản trị tuyển dụng
            </span>
            <span>
              <ShieldCheck size={18} />
              Verified proof
            </span>
            <span>
              <Sparkles size={18} />
              Quest & Job Hub
            </span>
          </div>
        </div>

        <form className="candidate-login-panel" onSubmit={handleSubmit}>
          <div className="register-form-header">
            <Sparkles size={22} style={{ color: '#ff7a1a' }} />
            <div>
              <p className="eyebrow">Recruiter & Organizer Portal</p>
              <h2>Đăng nhập đối tác</h2>
            </div>
          </div>

          <div className="social-register-grid">
            {socialProviders.map((item) => (
              <button
                className="social-register-button"
                key={item.provider}
                onClick={() => handleSocialLogin(item.provider)}
                type="button"
              >
                <span>{item.mark}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="register-divider">
            <span>hoặc đăng nhập bằng tài khoản đối tác</span>
          </div>

          <div className="register-form-grid">
            <label className={focusedField === 'email' ? 'active' : ''}>
              <Mail size={18} />
              <input
                name="email"
                onChange={updateField}
                onFocus={() => setFocusedField('email')}
                placeholder="Email đăng nhập"
                type="email"
                value={loginData.email}
              />
            </label>
            <label className={focusedField === 'password' ? 'active' : ''}>
              <LockKeyhole size={18} />
              <input
                name="password"
                onChange={updateField}
                onFocus={() => setFocusedField('password')}
                placeholder="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
              />
              <button
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="password-visibility-button"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </label>
          </div>

          <div className="candidate-login-options">
            <label className="remember-password-option">
              <input
                checked={rememberPassword}
                onChange={(event) => setRememberPassword(event.target.checked)}
                type="checkbox"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          {status.message ? (
            <div className={`register-status ${status.type}`}>
              <AlertCircle size={18} />
              <p>{status.message}</p>
            </div>
          ) : null}

          <div className="register-action-row">
            <button className="button primary-button" disabled={status.type === 'loading'} type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
              Vào trang đối tác
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="candidate-register-prompt">
            <span>Bạn chưa có tài khoản đối tác?</span>
            <Link to="/business/register" style={{ color: '#ff7a1a' }}>Hãy bắt đầu đăng ký ngay</Link>
          </div>
        </form>
      </section>
    </section>
  );
}
