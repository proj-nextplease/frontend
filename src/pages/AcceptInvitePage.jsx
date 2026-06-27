import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { acceptCompanyInvitation, previewInvitation, registerInvitation } from '../api/b2bApi.js';
import { setStoredToken } from '../lib/authStorage.js';
import { BusinessAuthPanel } from '../components/BusinessAuthPanel.jsx';
import { AuthStatusCard } from '../components/AuthStatusCard.jsx';

const INK = '#101828';
const MUTED = '#5b6472';
const BLUE = '#2563eb';
const NAVY = '#0d1b33';
const LINE = '#e3e8ef';
const WHITE = '#ffffff';

const FIELD = {
  width: '100%', padding: '14px 14px 14px 44px', borderRadius: '10px',
  border: `1.5px solid ${LINE}`, background: WHITE, color: INK,
  fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
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

export function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // phase: 'checking' | 'set-password' | 'need-login' | 'accepting' | 'submitting' | 'done' | 'error'
  const [phase, setPhase] = useState('checking');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!token) {
        if (isMounted) { setPhase('error'); setMessage('Liên kết lời mời không hợp lệ hoặc thiếu mã.'); }
        return;
      }

      let info;
      try {
        info = await previewInvitation(token);
      } catch (err) {
        if (isMounted) { setPhase('error'); setMessage(err.message || 'Lời mời không tồn tại hoặc đã hết hạn.'); }
        return;
      }
      if (!isMounted) return;
      setPreview(info);

      // Brand-new invitee → set a password to create their account.
      if (info.isNewUser) {
        setPhase('set-password');
        return;
      }

      // Existing account → must be logged in (with the invited email) to accept.
      let hasSession = !supabase;
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          hasSession = Boolean(session);
        } catch { hasSession = false; }
      }

      if (!hasSession) {
        sessionStorage.setItem('nextplease:pending_invite', token);
        if (isMounted) setPhase('need-login');
        return;
      }

      if (isMounted) setPhase('accepting');
      try {
        await acceptCompanyInvitation(token);
        sessionStorage.removeItem('nextplease:pending_invite');
        if (isMounted) { setPhase('done'); setMessage('Bạn đã tham gia tổ chức thành công!'); }
      } catch (err) {
        if (isMounted) { setPhase('error'); setMessage(err.message || 'Không thể chấp nhận lời mời.'); }
      }
    }

    run();
    return () => { isMounted = false; };
  }, [token]);

  async function handleSetPassword(event) {
    event.preventDefault();
    if (!isPasswordValid(password)) {
      setMessage('Mật khẩu phải từ 6-25 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Mật khẩu nhập lại không khớp.');
      return;
    }
    setMessage('');
    setPhase('submitting');
    try {
      const result = await registerInvitation(token, password);
      if (result?.accessToken) {
        setStoredToken(result.accessToken);
      }
      if (supabase && result?.accessToken && result?.refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
          });
        } catch (err) {
          console.warn('Supabase setSession warning (non-blocking):', err.message);
        }
      }
      sessionStorage.removeItem('nextplease:pending_invite');
      navigate('/businesses/dashboard');
    } catch (err) {
      setPhase('set-password');
      setMessage(err.message || 'Không thể tạo tài khoản từ lời mời.');
    }
  }

  const heading = preview?.companyName ? `Tham gia ${preview.companyName}` : 'Chấp nhận lời mời';

  function renderContent() {
    if (phase === 'checking' || phase === 'accepting') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
          <span style={{ width: '52px', height: '52px', borderRadius: '15px', background: '#f1f4f9', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Loader2 size={26} className="np-spin" />
          </span>
          <p style={{ margin: 0, fontSize: '0.96rem', color: MUTED }}>
            {phase === 'checking' ? 'Đang kiểm tra lời mời...' : 'Đang gắn tài khoản của bạn vào tổ chức...'}
          </p>
        </div>
      );
    }

    if (phase === 'set-password' || phase === 'submitting') {
      return (
        <form onSubmit={handleSetPassword}>
          <p style={{ fontSize: '0.95rem', color: MUTED, lineHeight: 1.6, margin: '0 0 22px' }}>
            Đây là lần đầu, hãy đặt mật khẩu cho tài khoản <strong style={{ color: INK }}>{preview?.invitedEmail}</strong>. Những lần sau bạn chỉ cần đăng nhập bằng email + mật khẩu này.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><Mail size={18} /></span>
              <input type="email" value={preview?.invitedEmail || ''} readOnly disabled style={{ ...FIELD, background: '#f7f9fc', color: MUTED, cursor: 'not-allowed' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><LockKeyhole size={18} /></span>
              <input className="np-bizf" name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...FIELD, paddingRight: '44px' }} />
              <button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((s) => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' }}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><ShieldCheck size={18} /></span>
              <input className="np-bizf" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...FIELD, paddingRight: '44px' }} />
            </div>
          </div>

          <AuthStatusCard status={{ type: 'error', message }} title="Chưa thể tham gia" onClose={() => setMessage('')} style={{ marginTop: '16px' }} />

          <button type="submit" disabled={phase === 'submitting'}
            style={{ width: '100%', marginTop: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '10px', background: NAVY, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: phase === 'submitting' ? 'default' : 'pointer', opacity: phase === 'submitting' ? 0.7 : 1 }}>
            {phase === 'submitting' ? 'Đang tạo tài khoản...' : 'Đặt mật khẩu & tham gia'} <ArrowRight size={18} />
          </button>
        </form>
      );
    }

    if (phase === 'need-login') {
      return (
        <>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', borderRadius: '12px', background: 'var(--p-blue-soft, #eef3fb)', border: `1px solid rgba(37,99,235,0.2)`, marginBottom: '18px' }}>
            <span style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%', background: `${BLUE}1a`, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogIn size={18} /></span>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', color: BLUE, marginBottom: '2px' }}>Cần đăng nhập</div>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: INK }}>Email này đã có tài khoản. Vui lòng đăng nhập bằng đúng email được mời để tiếp tục.</p>
            </div>
          </div>
          <Link to="/business/login" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '10px', background: NAVY, color: WHITE, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none', boxSizing: 'border-box' }}>
            Đăng nhập để tiếp tục <ArrowRight size={18} />
          </Link>
        </>
      );
    }

    if (phase === 'done') {
      return (
        <>
          <AuthStatusCard status={{ type: 'success', message }} title="Tham gia thành công" style={{ marginBottom: '18px' }} />
          <button type="button" onClick={() => navigate('/businesses/dashboard')}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '10px', background: NAVY, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: 'pointer' }}>
            Vào trang tổ chức <ArrowRight size={18} />
          </button>
        </>
      );
    }

    // error
    return (
      <>
        <AuthStatusCard status={{ type: 'error', message }} title="Lời mời không hợp lệ" style={{ marginBottom: '18px' }} />
        <Link to="/business/login" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none', fontSize: '0.92rem' }}>← Về trang đăng nhập đối tác</Link>
      </>
    );
  }

  return (
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', background: WHITE, color: INK, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInR { from { opacity:0; transform: translateX(48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @keyframes npSpin { to { transform: rotate(360deg); } }
        .np-spin { animation: npSpin 0.8s linear infinite; }
        .np-bizf:focus { border-color:${NAVY} !important; box-shadow:0 0 0 3px rgba(13,27,51,0.1); }
        @media (max-width: 900px){ .np-auth{ grid-template-columns: 1fr !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      {/* LEFT — invite card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '13px', background: 'rgba(37,99,235,0.1)', color: BLUE, marginBottom: '18px' }}>
            <ShieldCheck size={24} />
          </span>
          <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: BLUE, margin: '0 0 8px' }}>Lời mời tham gia tổ chức</p>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 24px', lineHeight: 1.15 }}>{heading}</h2>
          {renderContent()}
        </div>
      </div>

      {/* RIGHT — brand panel */}
      <BusinessAuthPanel animation="npBrandInR" />
    </div>
  );
}
