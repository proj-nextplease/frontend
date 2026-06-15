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
  UserRoundCheck,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';
import { getMyPortfolio } from '../api/portfolioApi.js';

const socialProviders = [
  { provider: 'google', label: 'Google', mark: 'G' },
  { provider: 'facebook', label: 'Facebook', mark: 'f' },
  { provider: 'github', label: 'GitHub', mark: 'GH' },
];

export function CandidateLoginPage() {
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
      navigate('/candidates/dashboard');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/candidates/dashboard`,
      },
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Đang kiểm tra tài khoản ứng viên...' });

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setStatus({ type: 'error', message: 'Nhập email và mật khẩu ứng viên trước nhé.' });
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus({ type: 'success', message: 'Đăng nhập mô phỏng thành công. Đang mở Candidate Hub...' });
      navigate('/candidates/dashboard');
      return;
    }

    try {
      const response = await loginCandidate(loginData.email, loginData.password);

      const { error } = await supabase.auth.setSession({
        access_token: response.accessToken,
        refresh_token: response.refreshToken,
      });

      if (error) {
        setStatus({ type: 'error', message: error.message || 'Không thể thiết lập phiên đăng nhập.' });
        return;
      }

      // Check onboarding completed status to decide navigation path
      try {
        const portfolio = await getMyPortfolio();
        if (portfolio && portfolio.onboardingCompleted) {
          navigate('/candidates/dashboard');
        } else {
          navigate('/portfolio');
        }
      } catch (err) {
        console.error('Không thể kiểm tra trạng thái onboarding:', err);
        // Fallback to portfolio page to complete onboarding
        navigate('/portfolio');
      }
    } catch (error) {
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
        <div className="candidate-login-copy">
          <Link className="portfolio-back-link" to="/candidates">
            Quay lại trang ứng viên
          </Link>
          <h1>Tiếp tục nắm bắt cơ hội của bạn.</h1>
          
          <div className="candidate-login-highlights">
            <span>
              <UserRoundCheck size={18} />
              Hồ sơ ứng viên
            </span>
            <span>
              <ShieldCheck size={18} />
              Proof-ready
            </span>
            <span>
              <Sparkles size={18} />
              Portfolio 3D
            </span>
          </div>
        </div>

        <form className="candidate-login-panel" onSubmit={handleSubmit}>
          <div className="register-form-header">
            <Sparkles size={22} />
            <div>
              <p className="eyebrow">Candidate login</p>
              <h2>Đăng nhập ứng viên</h2>
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
            <span>hoặc đăng nhập bằng email ứng viên</span>
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
              <span>Ghi nhớ mật khẩu</span>
            </label>
            <button
              className="text-link ghost-link-button"
              onClick={() =>
                setStatus({
                  type: 'warning',
                  message: 'Luồng quên mật khẩu sẽ nối với backend/auth provider ở bước tiếp theo.',
                })
              }
              type="button"
            >
              Quên mật khẩu
            </button>
          </div>

          {status.message ? (
            <div className={`register-status ${status.type}`}>
              <AlertCircle size={18} />
              <p>{status.message}</p>
            </div>
          ) : null}

          <div className="register-action-row">
            <button className="button primary-button" disabled={status.type === 'loading'} type="submit">
              Nắm bắt cơ hội
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="candidate-register-prompt">
            <span>Bạn chưa là ứng viên?</span>
            <Link to="/candidate/register">Hãy bắt đầu trở thành ứng viên</Link>
          </div>
        </form>
      </section>
    </section>
  );
}
