import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';
import { AuthStatusCard } from '../components/AuthStatusCard.jsx';

const INK = '#101828';
const MUTED = '#5b6472';
const NAVY = '#0d1b33';
const NAVY2 = '#13284c';
const RED = '#ef4444';
const LINE = '#e3e8ef';
const WHITE = '#ffffff';

const FIELD = {
  width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px',
  border: `1.5px solid ${LINE}`, background: WHITE, color: INK,
  fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};

const adminFeatures = [
  'Duyệt hồ sơ Doanh nghiệp & CLB',
  'Kiểm duyệt tin tuyển dụng & Quest',
  'Quản lý hàng đợi xác thực minh chứng',
  'Giám sát & vận hành toàn hệ thống',
];

function AdminBrandPanel() {
  return (
    <div className="np-auth-brand" style={{ position: 'relative', overflow: 'hidden', background: `radial-gradient(120% 90% at 80% 0%, ${NAVY2} 0%, ${NAVY} 55%)`, color: '#eaf0fb', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%', animation: 'npBrandInR 0.7s cubic-bezier(0.22,1,0.36,1) both' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)`, backgroundSize: '46px 46px', opacity: 0.3, maskImage: 'radial-gradient(120% 80% at 50% 20%, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(120% 80% at 50% 20%, #000 30%, transparent 75%)', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '-12%', right: '-10%', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.26), transparent 68%)', zIndex: 0 }} />

      {/* chrome */}
      <div style={{ position: 'absolute', top: 'clamp(34px, 4vw, 52px)', left: 'clamp(36px, 3.5vw, 54px)', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff' }}>next please</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: RED }}>:</span>
        </span>
        <span style={{ fontSize: '0.66rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: RED, border: `1px solid rgba(239,68,68,0.5)`, borderRadius: '6px', padding: '3px 7px' }}>Admin</span>
      </div>

      {/* center */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(40px, 4vw, 64px)', maxWidth: '520px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '15px', background: 'rgba(239,68,68,0.16)', color: RED, border: '1px solid rgba(239,68,68,0.4)', marginBottom: '20px' }}>
          <ShieldAlert size={26} />
        </span>
        <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: RED, margin: '0 0 14px' }}>Cổng vận hành nội bộ</p>
        <h1 style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.4rem)', fontWeight: '800', lineHeight: 1.18, letterSpacing: '-0.025em', color: '#fff', margin: '0 0 28px' }}>
          Trung tâm quản trị <span style={{ color: RED }}>next please</span>.
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {adminFeatures.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: 'rgba(239,68,68,0.16)', color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.4)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12l4 4 8-8" stroke={RED} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span style={{ fontSize: '0.98rem', fontWeight: '600', color: '#eaf0fb' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isSupabaseConfigured = Boolean(supabase);

  const [alreadyAdmin, setAlreadyAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkCurrentSession() {
      if (localStorage.getItem('nextplease:admin-bypass')) {
        localStorage.removeItem('nextplease:admin-bypass');
      }
      if (import.meta.env.DEV && sessionStorage.getItem('nextplease:admin-bypass') === 'true') {
        if (isMounted) { setAlreadyAdmin(true); setChecking(false); }
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
        console.error('Lỗi khi kiểm tra admin session:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    }
    checkCurrentSession();
    return () => { isMounted = false; };
  }, [isSupabaseConfigured]);

  if (checking) {
    return (
      <div className="route-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '1rem', fontWeight: '600', color: MUTED }}>
        Đang kiểm tra phiên làm việc...
      </div>
    );
  }

  if (alreadyAdmin) {
    return <Navigate to="/nextplease-admin-portal/b2b-reviews" replace />;
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
      if (!import.meta.env.DEV) {
        setStatus({ type: 'error', message: 'Hệ thống xác thực chưa được cấu hình. Vui lòng liên hệ quản trị.' });
        return;
      }
      setStatus({ type: 'success', message: 'Đăng nhập Admin giả lập thành công (Dev mode).' });
      sessionStorage.setItem('nextplease:admin-bypass', 'true');
      navigate('/nextplease-admin-portal/b2b-reviews');
      return;
    }

    try {
      const response = await loginCandidate(loginData.email, loginData.password);
      const roles = response.user?.roles || [];
      if (!roles.includes('admin')) {
        setStatus({ type: 'error', message: 'Tài khoản này không có quyền truy cập trang quản trị.' });
        return;
      }
      if (response.accessToken) {
        sessionStorage.setItem('nextplease:access_token', response.accessToken);
      }
      if (response.user) {
        sessionStorage.setItem('nextplease:current_user', JSON.stringify(response.user));
      }
      if (supabase && response.accessToken && response.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: response.accessToken,
          refresh_token: response.refreshToken,
        });
        if (error) console.warn('Supabase setSession warning (non-blocking):', error.message);
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
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', background: WHITE, color: INK, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInR { from { opacity:0; transform: translateX(48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @keyframes npSpin { to { transform: rotate(360deg); } }
        .np-spin { animation: npSpin 0.8s linear infinite; }
        .np-adminf:focus { border-color:${NAVY} !important; box-shadow:0 0 0 3px rgba(239,68,68,0.14); }
        @media (max-width: 900px){ .np-auth{ grid-template-columns: 1fr !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      {/* LEFT — form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '13px', background: 'rgba(220,38,38,0.1)', color: '#dc2626', marginBottom: '18px' }}>
            <ShieldCheck size={24} />
          </span>
          <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#dc2626', margin: '0 0 10px' }}>System Administration Portal</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 8px' }}>Đăng nhập Admin</h2>
          <p style={{ fontSize: '0.98rem', color: MUTED, margin: '0 0 28px' }}>Cổng quản trị bảo mật — dùng thông tin do hệ thống cấp.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><Mail size={18} /></span>
              <input className="np-adminf" name="email" type="email" value={loginData.email} onChange={updateField} placeholder="Email admin" style={FIELD} />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><LockKeyhole size={18} /></span>
              <input className="np-adminf" name="password" type={showPassword ? 'text' : 'password'} value={loginData.password} onChange={updateField} placeholder="Mật khẩu bảo mật" style={{ ...FIELD, paddingRight: '44px' }} />
              <button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((c) => !c)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' }}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <AuthStatusCard status={status} title={status.type === 'error' ? 'Không thể đăng nhập' : undefined} onClose={() => setStatus({ type: 'idle', message: '' })} style={{ marginBottom: '18px' }} />

          <button type="submit" disabled={status.type === 'loading'}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '10px', background: NAVY, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: status.type === 'loading' ? 'default' : 'pointer', opacity: status.type === 'loading' ? 0.7 : 1 }}>
            {status.type === 'loading' ? 'Đang đăng nhập...' : 'Vào cổng quản trị'} <ArrowRight size={18} />
          </button>
        </form>
      </div>

      {/* RIGHT — brand panel */}
      <AdminBrandPanel />
    </div>
  );
}
