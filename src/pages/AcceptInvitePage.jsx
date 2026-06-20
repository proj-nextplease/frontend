import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { acceptCompanyInvitation, previewInvitation, registerInvitation } from '../api/b2bApi.js';

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
        sessionStorage.setItem('nextplease:access_token', result.accessToken);
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

  return (
    <section className="candidate-login-page interactive-stage">
      <section className="candidate-login-shell" style={{ justifyContent: 'center' }}>
        <form className="candidate-login-panel" onSubmit={phase === 'set-password' || phase === 'submitting' ? handleSetPassword : (e) => e.preventDefault()} style={{ maxWidth: 520 }}>
          <div className="register-form-header">
            <ShieldCheck size={22} style={{ color: '#ff7a1a' }} />
            <div>
              <p className="eyebrow">Lời mời tham gia tổ chức</p>
              <h2>{preview?.companyName ? `Tham gia ${preview.companyName}` : 'Chấp nhận lời mời đối tác'}</h2>
            </div>
          </div>

          {phase === 'checking' && <p style={{ color: 'var(--muted)' }}>Đang kiểm tra lời mời...</p>}
          {phase === 'accepting' && <p style={{ color: 'var(--muted)' }}>Đang gắn tài khoản của bạn vào tổ chức...</p>}

          {(phase === 'set-password' || phase === 'submitting') && (
            <>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Đây là lần đầu, hãy đặt mật khẩu cho tài khoản <strong>{preview?.invitedEmail}</strong>.
                Những lần sau bạn chỉ cần đăng nhập bằng email + mật khẩu này.
              </p>
              <div className="register-form-grid" style={{ marginTop: 12 }}>
                <label>
                  <Mail size={18} />
                  <input type="email" value={preview?.invitedEmail || ''} readOnly disabled />
                </label>
                <label>
                  <LockKeyhole size={18} />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="password-visibility-button" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </label>
                <label>
                  <ShieldCheck size={18} />
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
              </div>
              {message && (
                <div className="register-status error" style={{ marginTop: 12 }}>
                  <AlertCircle size={18} /><p>{message}</p>
                </div>
              )}
              <div className="register-action-row" style={{ marginTop: 16 }}>
                <button type="submit" className="button primary-button" disabled={phase === 'submitting'} style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
                  {phase === 'submitting' ? 'Đang tạo tài khoản...' : 'Đặt mật khẩu & tham gia'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {phase === 'need-login' && (
            <>
              <div className="register-status" style={{ background: 'rgba(37,99,235,0.08)' }}>
                <LogIn size={18} />
                <p>Email này đã có tài khoản. Vui lòng đăng nhập bằng đúng email được mời để tiếp tục.</p>
              </div>
              <div className="register-action-row" style={{ marginTop: 16 }}>
                <Link className="button primary-button" to="/business/login" style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
                  Đăng nhập để tiếp tục
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          )}

          {phase === 'done' && (
            <>
              <div className="register-status success">
                <CheckCircle2 size={18} /><p>{message}</p>
              </div>
              <div className="register-action-row" style={{ marginTop: 16 }}>
                <button type="button" className="button primary-button" onClick={() => navigate('/businesses/dashboard')} style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
                  Vào trang tổ chức
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {phase === 'error' && (
            <>
              <div className="register-status error">
                <AlertCircle size={18} /><p>{message}</p>
              </div>
              <div className="register-action-row" style={{ marginTop: 16 }}>
                <Link className="text-link" to="/business/login">Về trang đăng nhập đối tác</Link>
              </div>
            </>
          )}
        </form>
      </section>
    </section>
  );
}
