import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, MailCheck } from 'lucide-react';
import { requestPasswordReset } from '../api/authApi.js';
import { AuthBrandPanel } from '../components/AuthBrandPanel.jsx';
import { BusinessAuthPanel } from '../components/BusinessAuthPanel.jsx';
import { AuthStatusCard } from '../components/AuthStatusCard.jsx';

const WHITE = '#ffffff';

const THEMES = {
  candidate: {
    accent: '#e5533f', ink: '#1d1320', muted: '#6e6470', line: '#ece6e2',
    submitBg: '#1d1320', radius: '12px', btnRadius: '999px',
    loginPath: '/candidate/login', kicker: 'Đăng nhập ứng viên',
  },
  business: {
    accent: '#2563eb', ink: '#101828', muted: '#5b6472', line: '#e3e8ef',
    submitBg: '#0d1b33', radius: '10px', btnRadius: '10px',
    loginPath: '/business/login', kicker: 'Đăng nhập đối tác',
  },
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') === 'business' ? 'business' : 'candidate';
  const t = THEMES[role];

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [sent, setSent] = useState(false);

  const FIELD = {
    width: '100%', padding: '14px 14px 14px 44px', borderRadius: t.radius,
    border: `1.5px solid ${t.line}`, background: WHITE, color: t.ink,
    fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập email.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Đang gửi yêu cầu...' });
    try {
      await requestPasswordReset(email, role);
      setSent(true);
      setStatus({ type: 'idle', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Không thể gửi yêu cầu. Thử lại sau.' });
    }
  }

  return (
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.12fr) minmax(0, 0.88fr)', background: WHITE, color: t.ink, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInR { from { opacity:0; transform: translateX(48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @media (max-width: 900px){ .np-auth{ grid-template-columns: 1fr !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      {/* LEFT — form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <div style={{ width: '100%', maxWidth: '410px' }}>
          <button type="button" onClick={() => navigate(t.loginPath)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: t.muted, fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer', padding: 0, marginBottom: '24px' }}>
            <ArrowLeft size={16} /> {t.kicker}
          </button>

          {sent ? (
            <div>
              <span style={{ display: 'inline-flex', width: '54px', height: '54px', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', background: `${t.accent}15`, color: t.accent, marginBottom: '18px' }}>
                <MailCheck size={26} />
              </span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: t.ink, margin: '0 0 10px' }}>Kiểm tra hộp thư</h2>
              <p style={{ fontSize: '0.98rem', color: t.muted, margin: '0 0 8px', lineHeight: 1.6 }}>
                Nếu <strong style={{ color: t.ink }}>{email}</strong> có tài khoản, chúng tôi đã gửi một link đặt lại mật khẩu.
              </p>
              <p style={{ fontSize: '0.92rem', color: t.muted, margin: '0 0 26px', lineHeight: 1.6 }}>
                Không thấy email? Kiểm tra mục <strong style={{ color: t.ink }}>Spam/Quảng cáo</strong>, hoặc thử gửi lại sau ít phút.
              </p>
              <button type="button" onClick={() => { setSent(false); setStatus({ type: 'idle', message: '' }); }}
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: t.btnRadius, background: WHITE, color: t.ink, fontWeight: '700', fontSize: '0.98rem', border: `1.5px solid ${t.line}`, cursor: 'pointer' }}>
                Gửi lại với email khác
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.92rem', color: t.muted, margin: '22px 0 0' }}>
                <Link to={t.loginPath} style={{ color: t.accent, fontWeight: '700', textDecoration: 'none' }}>Quay lại đăng nhập</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase', color: t.accent, margin: '0 0 10px' }}>Khôi phục tài khoản</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: '800', letterSpacing: '-0.03em', color: t.ink, margin: '0 0 8px' }}>Quên mật khẩu?</h2>
              <p style={{ fontSize: '0.98rem', color: t.muted, margin: '0 0 26px', lineHeight: 1.6 }}>Đừng lo — nhập email tài khoản, chúng tôi sẽ gửi link để bạn đặt lại mật khẩu.</p>

              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: t.muted, display: 'flex' }}><Mail size={18} /></span>
                <input name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email đăng nhập" style={FIELD} autoFocus />
              </div>

              <AuthStatusCard
                status={status}
                title={status.type === 'error' ? 'Có lỗi xảy ra' : undefined}
                onClose={() => setStatus({ type: 'idle', message: '' })}
                style={{ marginBottom: '18px' }}
              />

              <button type="submit" disabled={status.type === 'loading'}
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: t.btnRadius, background: t.submitBg, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: status.type === 'loading' ? 'default' : 'pointer', opacity: status.type === 'loading' ? 0.7 : 1 }}>
                {status.type === 'loading' ? 'Đang gửi...' : 'Gửi link đặt lại'} <ArrowRight size={18} />
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.92rem', color: t.muted, margin: '22px 0 0' }}>
                Nhớ ra mật khẩu rồi? <Link to={t.loginPath} style={{ color: t.accent, fontWeight: '700', textDecoration: 'none' }}>Đăng nhập</Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT — brand panel theo role */}
      {role === 'business'
        ? <BusinessAuthPanel animation="npBrandInR" />
        : <AuthBrandPanel animation="npBrandInR" />}
    </div>
  );
}
