import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';
import { setRemember, setStoredToken, clearStoredAuth, rememberLastEmail, getLastEmail } from '../lib/authStorage.js';
import { BusinessAuthPanel } from '../components/BusinessAuthPanel.jsx';
import { AuthStatusCard } from '../components/AuthStatusCard.jsx';

const INK = 'var(--ink)';
const MUTED = 'var(--muted)';
const BLUE = 'var(--primary)';
const NAVY = 'var(--lp-btn-bg)';
const LINE = 'var(--line)';
const WHITE = '#ffffff';
const SURFACE = 'var(--surface)';
const BTN_TEXT = 'var(--lp-btn-text)';

const FIELD = {
  width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px',
  border: `1.5px solid ${LINE}`, background: SURFACE, color: INK,
  fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};

export function BusinessLoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: getLastEmail(), password: '' });
  // Business: opt-in (default off) — more sensitive than a consumer account.
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isSupabaseConfigured = Boolean(supabase);

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
      setRemember(keepSignedIn);
      const response = await loginCandidate(loginData.email, loginData.password);
      rememberLastEmail(loginData.email);

      if (response.accessToken) {
        setStoredToken(response.accessToken);
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

      if (response.user?.roles?.includes('admin')) {
        navigate('/nextplease-admin-portal/b2b-reviews');
      } else if (pendingInvite) {
        navigate(`/business/accept-invite?token=${pendingInvite}`);
      } else {
        navigate('/businesses/dashboard');
      }
    } catch (error) {
      clearStoredAuth();
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại.',
      });
    }
  }

  return (
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100dvh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', background: 'var(--bg)', color: INK, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInR { from { opacity:0; transform: translateX(48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @keyframes npSpin { to { transform: rotate(360deg); } }
        .np-spin { animation: npSpin 0.8s linear infinite; }
        .np-bizf:focus { border-color:${NAVY} !important; box-shadow:0 0 0 3px rgba(13,27,51,0.1); }
        @media (max-width: 900px){ .np-auth{ grid-template-columns: 1fr !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      {/* LEFT — form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: '420px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: BLUE, margin: '0 0 10px' }}>Cổng đối tác · Recruiter Portal</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 8px' }}>Đăng nhập đối tác</h2>
          <p style={{ fontSize: '0.98rem', color: MUTED, margin: '0 0 28px' }}>Truy cập trang quản trị tuyển dụng của tổ chức bạn.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><Mail size={18} /></span>
              <input className="np-bizf" name="email" type="email" autoComplete="username" value={loginData.email} onChange={updateField} placeholder="Email đăng nhập" style={FIELD} />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><LockKeyhole size={18} /></span>
              <input className="np-bizf" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={loginData.password} onChange={updateField} placeholder="Mật khẩu" style={{ ...FIELD, paddingRight: '44px' }} />
              <button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((c) => !c)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' }}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: MUTED, cursor: 'pointer' }}>
              <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: BLUE, cursor: 'pointer' }} />
              Giữ đăng nhập
            </label>
            <button type="button" onClick={() => navigate('/forgot-password?role=business')}
              style={{ background: 'none', border: 'none', color: BLUE, fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>Quên mật khẩu?</button>
          </div>

          <AuthStatusCard
            status={status}
            title={status.type === 'error' ? 'Không thể đăng nhập' : undefined}
            onClose={() => setStatus({ type: 'idle', message: '' })}
            style={{ marginBottom: '18px' }}
          />

          <button type="submit" disabled={status.type === 'loading'}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '10px', background: NAVY, color: BTN_TEXT, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: status.type === 'loading' ? 'default' : 'pointer', opacity: status.type === 'loading' ? 0.7 : 1 }}>
            {status.type === 'loading' ? 'Đang đăng nhập...' : 'Vào trang đối tác'} <ArrowRight size={18} />
          </button>

          <div style={{ marginTop: '22px', padding: '14px 16px', borderRadius: '12px', background: 'var(--surface-soft)', border: `1px solid ${LINE}`, fontSize: '0.84rem', lineHeight: 1.55, color: MUTED }}>
            <strong style={{ color: INK }}>Được mời vào tổ chức?</strong> Hãy đăng nhập tại đây để tham gia — không cần đăng ký mới.
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.92rem', color: MUTED, margin: '20px 0 0' }}>
            Chưa có tài khoản đối tác? <Link to="/business/register" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>
        </form>
      </div>

      {/* RIGHT — brand panel */}
      <BusinessAuthPanel animation="npBrandInR" />
    </div>
  );
}
