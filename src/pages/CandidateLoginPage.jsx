import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { AuthBrandPanel } from '../components/AuthBrandPanel.jsx';
import { AuthStatusCard } from '../components/AuthStatusCard.jsx';

const INK = '#1d1320';
const MUTED = '#6e6470';
const RED = '#e5533f';
const PLUM = '#1e1320';
const PINK = '#fdeeeb';
const LINE = '#ece6e2';
const WHITE = '#ffffff';

const socialProviders = [
  { provider: 'google', label: 'Google', mark: 'G' },
  { provider: 'facebook', label: 'Facebook', mark: 'f' },
  {
    provider: 'github',
    label: 'GitHub',
    mark: (
      <svg aria-hidden="true" viewBox="0 0 16 16" width="15" height="15" fill="currentColor" style={{ verticalAlign: 'middle' }}>
        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82a7.48 7.48 0 0 0-4 0c-1.53-1.04-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.9.01.64.01 1.11.01 1.25 0 .21-.15.47-.55.38A8.014 8.014 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
      </svg>
    ),
  },
];

const FIELD = {
  width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px',
  border: `1.5px solid ${LINE}`, background: WHITE, color: INK,
  fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};


export function CandidateLoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isSupabaseConfigured = Boolean(supabase);

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
      options: { redirectTo: `${window.location.origin}/candidates/dashboard` },
    });
    if (error) setStatus({ type: 'error', message: error.message });
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
      // Persist token in sessionStorage so httpClient interceptor picks it up
      // immediately – avoids race with Supabase SDK session refresh.
      if (response.accessToken) {
        sessionStorage.setItem('nextplease:access_token', response.accessToken);
      }
      const { error } = await supabase.auth.setSession({
        access_token: response.accessToken,
        refresh_token: response.refreshToken,
      });
      if (error) {
        setStatus({ type: 'error', message: error.message || 'Không thể thiết lập phiên đăng nhập.' });
        return;
      }
      try {
        const portfolio = await getMyPortfolio();
        if (portfolio && portfolio.onboardingCompleted) navigate('/candidates/dashboard');
        else navigate('/portfolio');
      } catch (err) {
        console.error('Không thể kiểm tra trạng thái onboarding:', err);
        navigate('/portfolio');
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || error.message || 'Đăng nhập thất bại.' });
    }
  }

  return (
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.12fr) minmax(0, 0.88fr)', background: WHITE, color: INK, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInR { from { opacity:0; transform: translateX(48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @keyframes npFloat { 0%{transform:translateY(-7px)} 100%{transform:translateY(9px)} }
        @media (max-width: 900px){ .np-auth{ grid-template-columns: 1fr !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      {/* LEFT — form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: '410px' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase', color: RED, margin: '0 0 10px' }}>Đăng nhập ứng viên</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 8px' }}>Chào mừng trở lại</h2>
          <p style={{ fontSize: '0.98rem', color: MUTED, margin: '0 0 26px' }}>Đăng nhập để tiếp tục với hồ sơ của bạn.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {socialProviders.map((item) => (
              <button key={item.provider} type="button" onClick={() => handleSocialLogin(item.provider)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '12px', border: `1.5px solid ${LINE}`, background: WHITE, color: INK, fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
                <span style={{ display: 'flex', fontWeight: '800' }}>{item.mark}</span>{item.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 20px' }}>
            <div style={{ flex: 1, height: '1px', background: LINE }} />
            <span style={{ fontSize: '0.82rem', color: MUTED, fontWeight: '600' }}>hoặc dùng email</span>
            <div style={{ flex: 1, height: '1px', background: LINE }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><Mail size={18} /></span>
              <input name="email" type="email" value={loginData.email} onChange={updateField} placeholder="Email đăng nhập" style={FIELD} />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><LockKeyhole size={18} /></span>
              <input name="password" type={showPassword ? 'text' : 'password'} value={loginData.password} onChange={updateField} placeholder="Mật khẩu" style={{ ...FIELD, paddingRight: '44px' }} />
              <button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((c) => !c)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' }}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: MUTED, cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberPassword} onChange={(e) => setRememberPassword(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: RED, cursor: 'pointer' }} />
              Ghi nhớ đăng nhập
            </label>
            <button type="button" onClick={() => setStatus({ type: 'warning', message: 'Luồng quên mật khẩu sẽ nối với backend/auth provider ở bước tiếp theo.' })}
              style={{ background: 'none', border: 'none', color: RED, fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>Quên mật khẩu?</button>
          </div>

          <AuthStatusCard
            status={status}
            title={status.type === 'error' ? 'Không thể đăng nhập' : undefined}
            onClose={() => setStatus({ type: 'idle', message: '' })}
            style={{ marginBottom: '18px' }}
          />

          <button type="submit" disabled={status.type === 'loading'}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '999px', background: INK, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: 'pointer' }}>
            {status.type === 'loading' ? 'Đang đăng nhập...' : 'Đăng nhập'} <ArrowRight size={18} />
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.92rem', color: MUTED, margin: '22px 0 0' }}>
            Chưa có tài khoản? <Link to="/candidate/register" style={{ color: RED, fontWeight: '700', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>
        </form>
      </div>

      {/* RIGHT — brand panel */}
      <AuthBrandPanel animation="npBrandInR" headline="Tiếp tục hành trình của bạn" subcopy="Đăng nhập để quay lại với hồ sơ năng lực có kiểm chứng của bạn." />
    </div>
  );
}
