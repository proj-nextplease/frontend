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

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Đang kiểm tra tài khoản đối tác...' });

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setStatus({ type: 'error', message: 'Nhập email và mật khẩu trước nhé.' });
      return;
    }

    const pendingInvite = sessionStorage.getItem('nextplease:pending_invite');

    if (!isSupabaseConfigured) {
      setStatus({ type: 'success', message: 'Đăng nhập mô phỏng thành công. Đang mở dashboard...' });
      navigate(pendingInvite ? `/business/accept-invite?token=${pendingInvite}` : '/businesses/dashboard');
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

      // Check user roles, redirect admin to admin reviews, else to businesses dashboard.
      // If the user arrived via an invitation link, return them to the accept page.
      if (response.user?.roles?.includes('admin')) {
        navigate('/nextplease-admin-portal/b2b-reviews');
      } else if (pendingInvite) {
        navigate(`/business/accept-invite?token=${pendingInvite}`);
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
