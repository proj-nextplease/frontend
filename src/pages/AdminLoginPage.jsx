import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('email');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isSupabaseConfigured = Boolean(supabase);

  // If already logged in as admin, bypass and go to reviews directly
  const [alreadyAdmin, setAlreadyAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkCurrentSession() {
      // Clean up old localStorage bypass
      if (localStorage.getItem('nextplease:admin-bypass')) {
        localStorage.removeItem('nextplease:admin-bypass');
      }

      // Dev bypass check via sessionStorage
      if (sessionStorage.getItem('nextplease:admin-bypass') === 'true') {
        if (isMounted) {
          setAlreadyAdmin(true);
          setChecking(false);
        }
        return;
      }
      if (!isSupabaseConfigured) {
        if (isMounted) setChecking(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          const token = session.access_token;
          const parts = token.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            const roles = payload.app_metadata?.roles || [];
            if (roles.includes('admin')) {
              setAlreadyAdmin(true);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra admin session:", err);
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    }
    checkCurrentSession();
    return () => {
      isMounted = false;
    };
  }, [isSupabaseConfigured]);

  if (checking) {
    return (
      <div className="route-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--muted)',
        background: 'var(--bg)',
      }}>
        Đang kiểm tra phiên làm việc...
      </div>
    );
  }

  if (alreadyAdmin) {
    return <Navigate to="/nextplease-admin-portal/b2b-reviews" replace />;
  }

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
    setStatus({ type: 'loading', message: 'Đang kiểm tra quyền quản trị viên...' });

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus({ type: 'success', message: 'Đăng nhập Admin giả lập thành công (Dev mode).' });
      sessionStorage.setItem('nextplease:admin-bypass', 'true');
      navigate('/nextplease-admin-portal/b2b-reviews');
      return;
    }

    try {
      const response = await loginCandidate(loginData.email, loginData.password);

      // Verify role
      const roles = response.user?.roles || [];
      if (!roles.includes('admin')) {
        setStatus({ type: 'error', message: 'Tài khoản này không có quyền truy cập trang quản trị.' });
        return;
      }

      // Save access token to sessionStorage for httpClient
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

      navigate('/nextplease-admin-portal/b2b-reviews');
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
      className="candidate-login-page interactive-stage admin-login-container"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cursor-spotlight" aria-hidden="true" />

      <section className="candidate-login-shell">
        <div className="candidate-login-copy" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(15,23,42,0.05) 100%)' }}>
          <h1 style={{ background: 'linear-gradient(to right, #dc2626, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NextPlease Portal Administration.
          </h1>
          <p>
            Cổng quản trị bảo mật dành riêng cho Đội ngũ vận hành hệ thống nextplease. 
            Vui lòng sử dụng thông tin đăng nhập do quản trị hệ thống cấp.
          </p>
          
          <div className="candidate-login-highlights">
            <span>
              <ShieldCheck size={18} style={{ color: '#dc2626' }} />
              Xác thực cấp cao
            </span>
            <span>
              <Sparkles size={18} style={{ color: '#f97316' }} />
              Quyền hạn vận hành
            </span>
          </div>
        </div>

        <form className="candidate-login-panel" onSubmit={handleSubmit}>
          <div className="register-form-header">
            <ShieldCheck size={26} style={{ color: '#dc2626' }} />
            <div>
              <p className="eyebrow" style={{ color: '#dc2626' }}>System Administration Portal</p>
              <h2>Đăng nhập Admin</h2>
            </div>
          </div>

          <div className="register-divider" style={{ margin: '16px 0 24px' }}>
            <span>Nhập thông tin xác thực quản trị viên</span>
          </div>

          <div className="register-form-grid" style={{ gap: '16px' }}>
            <label className={focusedField === 'email' ? 'active' : ''} style={{ border: focusedField === 'email' ? '1px solid #dc2626' : '1px solid var(--border)' }}>
              <Mail size={18} style={{ color: focusedField === 'email' ? '#dc2626' : 'var(--primary)' }} />
              <input
                name="email"
                required
                onChange={updateField}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                placeholder="Email admin"
                type="email"
                value={loginData.email}
              />
            </label>
            <label className={focusedField === 'password' ? 'active' : ''} style={{ border: focusedField === 'password' ? '1px solid #dc2626' : '1px solid var(--border)' }}>
              <LockKeyhole size={18} style={{ color: focusedField === 'password' ? '#dc2626' : 'var(--primary)' }} />
              <input
                name="password"
                required
                onChange={updateField}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                placeholder="Mật khẩu bảo mật"
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

          {status.message ? (
            <div className={`register-status ${status.type}`} style={{ marginTop: '20px' }}>
              <AlertCircle size={18} />
              <p>{status.message}</p>
            </div>
          ) : null}

          <div className="register-action-row" style={{ marginTop: '28px' }}>
            <button 
              className="button primary-button" 
              disabled={status.type === 'loading'} 
              type="submit" 
              style={{ 
                background: 'linear-gradient(135deg, #dc2626, #f97316)', 
                borderColor: 'transparent',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              Vào cổng quản trị
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
