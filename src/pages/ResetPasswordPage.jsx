import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldAlert } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { completePasswordReset } from '../api/authApi.js';
import { AuthBrandPanel } from '../components/AuthBrandPanel.jsx';
import { BusinessAuthPanel } from '../components/BusinessAuthPanel.jsx';
import { AuthStatusCard } from '../components/AuthStatusCard.jsx';

const WHITE = '#ffffff';

const THEMES = {
  candidate: {
    accent: '#e5533f', ink: '#1d1320', muted: '#6e6470', line: '#ece6e2',
    submitBg: '#1d1320', radius: '12px', btnRadius: '999px', loginPath: '/candidate/login',
  },
  business: {
    accent: '#2563eb', ink: '#101828', muted: '#5b6472', line: '#e3e8ef',
    submitBg: '#0d1b33', radius: '10px', btnRadius: '10px', loginPath: '/business/login',
  },
};

function isPasswordValid(password) {
  return (
    password.length >= 6 &&
    password.length <= 25 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

function PasswordRule({ ok, label, muted, accent }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: ok ? accent : muted, fontWeight: ok ? 700 : 500 }}>
      <CheckCircle2 size={13} /> {label}
    </span>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') === 'business' ? 'business' : 'candidate';
  const t = THEMES[role];

  // 'checking' | 'ready' | 'invalid' | 'submitting' | 'done'
  const [phase, setPhase] = useState(supabase ? 'checking' : 'invalid');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const FIELD = {
    width: '100%', padding: '14px 14px 14px 44px', borderRadius: t.radius,
    border: `1.5px solid ${t.line}`, background: WHITE, color: t.ink,
    fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
  };

  useEffect(() => {
    if (!supabase) return undefined;
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || session) setPhase('ready');
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setPhase((current) => (current === 'checking' ? (data.session ? 'ready' : 'invalid') : current));
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isPasswordValid(password)) {
      setStatus({ type: 'error', message: 'Mật khẩu 6–25 ký tự, gồm chữ hoa, chữ thường và số.' });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Mật khẩu nhập lại không khớp.' });
      return;
    }
    setPhase('submitting');
    setStatus({ type: 'loading', message: 'Đang đặt lại mật khẩu...' });
    try {
      await completePasswordReset(password);
      setPhase('done');
      setStatus({ type: 'idle', message: '' });
      setTimeout(() => navigate(t.loginPath), 2400);
    } catch (error) {
      setPhase('ready');
      setStatus({ type: 'error', message: error.message || 'Không thể đặt lại mật khẩu.' });
    }
  }

  function leftContent() {
    if (phase === 'checking') {
      return (
        <div style={{ textAlign: 'center', color: t.muted }}>
          <Loader2 size={30} style={{ animation: 'npSpin 1s linear infinite', color: t.accent }} />
          <style>{`@keyframes npSpin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '14px', fontWeight: 600 }}>Đang xác thực link đặt lại...</p>
        </div>
      );
    }

    if (phase === 'invalid') {
      return (
        <div>
          <span style={{ display: 'inline-flex', width: '54px', height: '54px', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', background: '#fdecec', color: '#d92d20', marginBottom: '18px' }}>
            <ShieldAlert size={26} />
          </span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: t.ink, margin: '0 0 10px' }}>Link không hợp lệ</h2>
          <p style={{ fontSize: '0.98rem', color: t.muted, margin: '0 0 26px', lineHeight: 1.6 }}>Link đặt lại mật khẩu đã hết hạn hoặc đã được dùng. Vui lòng yêu cầu gửi lại.</p>
          <button type="button" onClick={() => navigate(`/forgot-password?role=${role}`)}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: t.btnRadius, background: t.submitBg, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: 'pointer' }}>
            Gửi lại yêu cầu <ArrowRight size={18} />
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.92rem', color: t.muted, margin: '22px 0 0' }}>
            <Link to={t.loginPath} style={{ color: t.accent, fontWeight: '700', textDecoration: 'none' }}>Quay lại đăng nhập</Link>
          </p>
        </div>
      );
    }

    if (phase === 'done') {
      return (
        <div>
          <span style={{ display: 'inline-flex', width: '54px', height: '54px', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', background: `${t.accent}15`, color: t.accent, marginBottom: '18px' }}>
            <CheckCircle2 size={28} />
          </span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: t.ink, margin: '0 0 10px' }}>Đổi mật khẩu thành công</h2>
          <p style={{ fontSize: '0.98rem', color: t.muted, margin: 0, lineHeight: 1.6 }}>Mật khẩu của bạn đã được cập nhật. Đang chuyển tới trang đăng nhập...</p>
        </div>
      );
    }

    // ready | submitting
    return (
      <form onSubmit={handleSubmit} noValidate>
        <p style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase', color: t.accent, margin: '0 0 10px' }}>Khôi phục tài khoản</p>
        <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: '800', letterSpacing: '-0.03em', color: t.ink, margin: '0 0 8px' }}>Tạo mật khẩu mới</h2>
        <p style={{ fontSize: '0.98rem', color: t.muted, margin: '0 0 22px', lineHeight: 1.6 }}>Chọn một mật khẩu mạnh mà bạn chưa từng dùng ở nơi khác.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '12px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: t.muted, display: 'flex' }}><LockKeyhole size={18} /></span>
            <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu mới" style={{ ...FIELD, paddingRight: '44px' }} autoFocus />
            <button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((c) => !c)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t.muted, cursor: 'pointer', display: 'flex' }}>
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: t.muted, display: 'flex' }}><LockKeyhole size={18} /></span>
            <input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" style={{ ...FIELD, paddingRight: '44px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: '18px' }}>
          <PasswordRule ok={password.length >= 6 && password.length <= 25} label="6–25 ký tự" muted={t.muted} accent={t.accent} />
          <PasswordRule ok={/[a-z]/.test(password) && /[A-Z]/.test(password)} label="Chữ hoa & thường" muted={t.muted} accent={t.accent} />
          <PasswordRule ok={/\d/.test(password)} label="Có chữ số" muted={t.muted} accent={t.accent} />
        </div>

        <AuthStatusCard
          status={status}
          title={status.type === 'error' ? 'Không thể đặt lại' : undefined}
          onClose={() => setStatus({ type: 'idle', message: '' })}
          style={{ marginBottom: '18px' }}
        />

        <button type="submit" disabled={phase === 'submitting'}
          style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: t.btnRadius, background: t.submitBg, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: phase === 'submitting' ? 'default' : 'pointer', opacity: phase === 'submitting' ? 0.7 : 1 }}>
          {phase === 'submitting' ? 'Đang lưu...' : 'Đặt lại mật khẩu'} <ArrowRight size={18} />
        </button>
      </form>
    );
  }

  return (
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.12fr) minmax(0, 0.88fr)', background: WHITE, color: t.ink, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInR { from { opacity:0; transform: translateX(48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @media (max-width: 900px){ .np-auth{ grid-template-columns: 1fr !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <div style={{ width: '100%', maxWidth: '410px' }}>{leftContent()}</div>
      </div>

      {role === 'business'
        ? <BusinessAuthPanel animation="npBrandInR" />
        : <AuthBrandPanel animation="npBrandInR" />}
    </div>
  );
}
