import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Clock, Eye, EyeOff, GraduationCap,
  LockKeyhole, Mail, ShieldCheck, UserRound,
} from 'lucide-react';
import {
  requestCandidateRegistrationOtp,
  verifyCandidateRegistrationOtp,
} from '../api/candidateRegistrationApi.js';
import { loginCandidate } from '../api/authApi.js';
import { supabase } from '../services/supabaseClient.js';
import { AuthBrandPanel } from '../components/AuthBrandPanel.jsx';

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

const initialForm = { displayName: '', email: '', studentEmail: '', password: '', confirmPassword: '' };

const registrationFields = [
  { key: 'displayName', label: 'Tên hiển thị', icon: UserRound },
  { key: 'email', label: 'Email đăng nhập', icon: Mail },
  { key: 'studentEmail', label: 'Email sinh viên', icon: GraduationCap },
  { key: 'password', label: 'Mật khẩu', icon: LockKeyhole },
  { key: 'confirmPassword', label: 'Nhập lại mật khẩu', icon: ShieldCheck },
];

const stepLabels = ['Thông tin', 'Xác thực', 'Hoàn tất'];
const candidateRegisterDraftKey = 'nextplease:candidate-register-draft';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_COOLDOWN_SECONDS = 60;

const FIELD = {
  width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px',
  border: `1.5px solid ${LINE}`, background: WHITE, color: INK,
  fontSize: '0.98rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
};


function fieldBorder(state) {
  if (state === 'valid') return '#16a34a';
  if (state === 'invalid') return '#dc2626';
  return LINE;
}
function statusStyle(type) {
  const m = {
    error: { bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.25)', color: '#dc2626' },
    success: { bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.25)', color: '#16a34a' },
    warning: { bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.25)', color: '#b45309' },
    loading: { bg: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.2)', color: '#2563eb' },
  };
  return m[type] || m.loading;
}
function isPasswordValid(password) {
  return password.length >= 6 && password.length <= 25 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}
function readCandidateRegisterDraft() {
  if (typeof window === 'undefined') return initialForm;
  try {
    const draft = window.sessionStorage.getItem(candidateRegisterDraftKey);
    return draft ? { ...initialForm, ...JSON.parse(draft) } : initialForm;
  } catch { return initialForm; }
}

export function CandidateRegisterPage() {
  const [formData, setFormData] = useState(readCandidateRegisterDraft);
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState('displayName');
  const [otpCode, setOtpCode] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const otpInputRefs = useRef([]);
  const lastSubmittedOtpRef = useRef('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);
  const passwordVal = formData.password || '';
  const isPasswordEmpty = passwordVal.length === 0;
  const isLengthValid = passwordVal.length >= 6 && passwordVal.length <= 25;
  const isComplexityValid = /[a-z]/.test(passwordVal) && /[A-Z]/.test(passwordVal) && /\d/.test(passwordVal);

  useEffect(() => {
    try {
      const safeDraft = { displayName: formData.displayName, email: formData.email, studentEmail: formData.studentEmail };
      window.sessionStorage.setItem(candidateRegisterDraftKey, JSON.stringify(safeDraft));
    } catch { /* draft persistence is best-effort */ }
  }, [formData]);

  useEffect(() => () => { if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current); }, []);

  useEffect(() => {
    if (currentStep === 2) setTimeout(() => { otpInputRefs.current[0]?.focus(); }, 50);
  }, [currentStep]);

  function startCooldownTimer() {
    setOtpCooldown(OTP_COOLDOWN_SECONDS);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownTimerRef.current); cooldownTimerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function updateOtpDigit(index, event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 6).split('');
    const nextOtp = otpCode.padEnd(6, ' ').split('');
    if (digits.length > 1) {
      digits.forEach((digit, digitIndex) => { if (index + digitIndex < 6) nextOtp[index + digitIndex] = digit; });
      setOtpCode(nextOtp.join('').slice(0, 6));
      otpInputRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    nextOtp[index] = digits[0] || ' ';
    setOtpCode(nextOtp.join('').slice(0, 6));
    if (digits[0] && index < 5) otpInputRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === 'Backspace' && !otpCode[index]?.trim() && index > 0) otpInputRefs.current[index - 1]?.focus();
  }

  function getFieldState(fieldKey) {
    const value = formData[fieldKey].trim();
    if (!value) return 'empty';
    if (fieldKey === 'email' || fieldKey === 'studentEmail') return emailPattern.test(value) ? 'valid' : 'invalid';
    if (fieldKey === 'password') return isPasswordValid(formData.password) ? 'valid' : 'invalid';
    if (fieldKey === 'confirmPassword') return formData.confirmPassword === formData.password ? 'valid' : 'invalid';
    return 'valid';
  }

  function getFieldValidationErrorMessage(fieldKey) {
    const value = formData[fieldKey].trim();
    const fieldName = registrationFields.find((f) => f.key === fieldKey)?.label || '';
    if (!value) return `${fieldName} không được để trống.`;
    if (fieldKey === 'email') return emailPattern.test(value) ? '' : 'Email đăng nhập không đúng định dạng.';
    if (fieldKey === 'studentEmail') return emailPattern.test(value) ? '' : 'Email sinh viên không đúng định dạng.';
    if (fieldKey === 'password') return isPasswordValid(formData.password) ? '' : 'Mật khẩu phải từ 6-25 ký tự, bao gồm chữ hoa, chữ thường và chữ số.';
    if (fieldKey === 'confirmPassword') return formData.confirmPassword === formData.password ? '' : 'Mật khẩu nhập lại không khớp với mật khẩu đã nhập.';
    return '';
  }

  async function handleSocialRegister(provider) {
    setStatus({ type: 'loading', message: `Đang mở đăng ký bằng ${provider}...` });
    if (!isSupabaseConfigured) {
      setStatus({ type: 'warning', message: 'Supabase env chưa được cấu hình. UI đã sẵn sàng, chỉ cần bật OAuth provider sau.' });
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/portfolio` } });
    if (error) setStatus({ type: 'error', message: error.message });
  }

  async function moveToOtpStep() {
    if (otpCooldown > 0) {
      setStatus({ type: 'warning', message: `Vui lòng đợi ${otpCooldown} giây trước khi yêu cầu mã OTP mới.` });
      return;
    }
    setStatus({ type: 'loading', message: 'Đang chuẩn bị bước xác thực ứng viên...' });
    const invalidField = registrationFields.find((field) => getFieldState(field.key) !== 'valid');
    if (invalidField) {
      setFocusedField(invalidField.key);
      const errorMsg = getFieldValidationErrorMessage(invalidField.key);
      setStatus({ type: 'error', message: errorMsg || `Kiểm tra lại ${invalidField.label.toLowerCase()} trước khi tạo tài khoản nhé.` });
      return;
    }
    try {
      const otpResponse = await requestCandidateRegistrationOtp({
        email: formData.email, password: formData.password, displayName: formData.displayName, studentEmail: formData.studentEmail,
      });
      setRegistrationId(otpResponse.registrationId);
      setOtpCode('');
      setCurrentStep(2);
      startCooldownTimer();
      setStatus({
        type: 'success',
        message: otpResponse.devOtp
          ? `Mã OTP dev là ${otpResponse.devOtp}. Khi bật production, mã sẽ được gửi qua email ${otpResponse.email}.`
          : 'Kiểm tra hộp thư chính hoặc Spam nếu chưa thấy email trong vài giây.',
      });
    } catch (error) {
      const serverMessage = error?.response?.data?.message || error.message || '';
      if (error?.response?.status === 429) {
        startCooldownTimer();
        setStatus({ type: 'warning', message: serverMessage || 'Bạn đã gửi yêu cầu OTP quá nhanh. Vui lòng đợi rồi thử lại.' });
        return;
      }
      setStatus({ type: 'error', message: serverMessage || 'Không thể gửi mã OTP đăng ký ứng viên.' });
    }
  }

  async function completeCandidateRegistration(codeToVerify) {
    const code = typeof codeToVerify === 'string' ? codeToVerify : otpCode.replace(/\s/g, '');
    setStatus({ type: 'loading', message: 'Đang xác thực mã OTP và tạo tài khoản ứng viên...' });
    if (!/^\d{6}$/.test(code)) {
      setStatus({ type: 'error', message: 'Nhập đủ mã OTP 6 số đã gửi qua email đăng nhập nhé.' });
      return;
    }
    if (!registrationId) {
      setStatus({ type: 'error', message: 'Thiếu mã phiên đăng ký. Quay lại bước 1 để nhận OTP mới nhé.' });
      return;
    }
    try {
      await verifyCandidateRegistrationOtp({ registrationId, otp: code, password: formData.password });
      try {
        const loginData = await loginCandidate(formData.email, formData.password);
        if (loginData && loginData.accessToken) {
          await supabase.auth.setSession({ access_token: loginData.accessToken, refresh_token: loginData.refreshToken });
        }
      } catch (loginError) {
        console.error('Tự động đăng nhập sau đăng ký thất bại:', loginError);
      }
      setCurrentStep(3);
      window.sessionStorage.removeItem(candidateRegisterDraftKey);
      setStatus({ type: 'success', message: 'Xác thực hoàn tất. Bạn có thể bắt đầu dựng Portfolio 3D ngay bây giờ.' });
    } catch (error) {
      setStatus({ type: 'error', message: error?.response?.data?.message || error.message || 'Không thể xác thực OTP ứng viên.' });
    }
  }

  useEffect(() => {
    const sanitized = otpCode.replace(/\s/g, '');
    if (sanitized.length < 6) lastSubmittedOtpRef.current = '';
    if (/^\d{6}$/.test(sanitized) && sanitized !== lastSubmittedOtpRef.current && currentStep === 2) {
      lastSubmittedOtpRef.current = sanitized;
      completeCandidateRegistration(sanitized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode, currentStep]);

  function returnToInfoStep() {
    setCurrentStep(1);
    setOtpCode('');
    setRegistrationId('');
    setStatus({ type: 'idle', message: '' });
  }

  function handlePanelSubmit(event) {
    event.preventDefault();
    if (currentStep === 1) moveToOtpStep();
  }

  const st = statusStyle(status.type);

  function renderInput(key, placeholder, type, showState) {
    const Icon = registrationFields.find((f) => f.key === key).icon;
    const state = getFieldState(key);
    const isPw = key === 'password';
    const isConfirm = key === 'confirmPassword';
    const vis = isPw ? showPassword : isConfirm ? showConfirmPassword : false;
    const inputType = (isPw || isConfirm) ? (vis ? 'text' : 'password') : type;
    return (
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex' }}><Icon size={18} /></span>
        <input
          name={key}
          type={inputType}
          value={formData[key]}
          onChange={updateField}
          onFocus={() => { setFocusedField(key); if (isPw) setShowPasswordGuide(true); }}
          onBlur={() => { if (isPw) setShowPasswordGuide(false); }}
          onPaste={(isPw || isConfirm) ? (e) => e.preventDefault() : undefined}
          onCopy={(isPw || isConfirm) ? (e) => e.preventDefault() : undefined}
          onCut={(isPw || isConfirm) ? (e) => e.preventDefault() : undefined}
          placeholder={placeholder}
          style={{ ...FIELD, paddingRight: (isPw || isConfirm) ? '44px' : '14px', borderColor: showState ? fieldBorder(state) : LINE }}
        />
        {(isPw || isConfirm) && (
          <button type="button" aria-label={vis ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onClick={() => { if (isPw) { const n = !showPassword; setShowPassword(n); setShowPasswordGuide(n); } else setShowConfirmPassword((c) => !c); }}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' }}>
            {vis ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="np-auth" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 0.88fr) minmax(0, 1.12fr)', background: WHITE, color: INK, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes npBrandInL { from { opacity:0; transform: translateX(-48px);} to { opacity:1; transform:none; } }
        @keyframes npFormIn { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform:none; } }
        @keyframes npFloat { 0%{transform:translateY(-7px)} 100%{transform:translateY(9px)} }
        @media (max-width: 900px){ .np-auth{ grid-template-columns: 1fr !important; } .np-auth-brand{ display:none !important; } }
      `}</style>

      {/* LEFT — brand panel */}
      <AuthBrandPanel animation="npBrandInL" headline="Bắt đầu hồ sơ của bạn" subcopy="Tạo tài khoản ứng viên miễn phí và biến trải nghiệm thành cơ hội." />

      {/* RIGHT — form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 5vw, 56px)', animation: 'npFormIn 0.6s ease-out 0.08s both' }}>
        <form onSubmit={handlePanelSubmit} style={{ width: '100%', maxWidth: '440px' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const state = n < currentStep ? 'done' : n === currentStep ? 'current' : 'pending';
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < 2 ? 1 : 'none' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.78rem', flexShrink: 0, background: state === 'pending' ? '#f0ece9' : state === 'done' ? '#16a34a' : INK, color: state === 'pending' ? MUTED : WHITE }}>
                    {state === 'done' ? <CheckCircle2 size={16} /> : n}
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: state === 'current' ? '800' : '600', color: state === 'pending' ? MUTED : INK, whiteSpace: 'nowrap' }}>{label}</span>
                  {i < 2 && <span style={{ flex: 1, height: '1.5px', background: n < currentStep ? '#16a34a' : LINE, marginLeft: '4px' }} />}
                </div>
              );
            })}
          </div>

          {/* STEP 1 — info */}
          {currentStep === 1 && (
            <>
              <p style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase', color: RED, margin: '0 0 8px' }}>Bắt đầu làm ứng viên</p>
              <h2 style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 22px' }}>Tạo tài khoản ứng viên</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {socialProviders.map((item) => (
                  <button key={item.provider} type="button" onClick={() => handleSocialRegister(item.provider)}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '12px', border: `1.5px solid ${LINE}`, background: WHITE, color: INK, fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <span style={{ display: 'flex', fontWeight: '800' }}>{item.mark}</span>{item.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 20px' }}>
                <div style={{ flex: 1, height: '1px', background: LINE }} />
                <span style={{ fontSize: '0.82rem', color: MUTED, fontWeight: '600' }}>hoặc điền thông tin</span>
                <div style={{ flex: 1, height: '1px', background: LINE }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {renderInput('displayName', 'Tên hiển thị của bạn', 'text', false)}
                {renderInput('email', 'Email đăng nhập', 'email', true)}
                {renderInput('studentEmail', 'Email sinh viên để xác thực sau', 'email', true)}
                {renderInput('password', 'Mật khẩu', 'password', true)}
                {renderInput('confirmPassword', 'Nhập lại mật khẩu', 'password', true)}
              </div>

              {(showPasswordGuide || focusedField === 'password') && (
                <div style={{ marginTop: '12px', background: PINK, borderRadius: '12px', padding: '14px 16px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: '800', color: INK }}>Yêu cầu mật khẩu</p>
                  {[
                    { ok: isLengthValid, text: 'Từ 6 đến 25 ký tự' },
                    { ok: isComplexityValid, text: 'Có chữ hoa, chữ thường và số' },
                  ].map((r) => (
                    <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', marginBottom: '4px', color: isPasswordEmpty ? MUTED : r.ok ? '#16a34a' : '#dc2626', fontWeight: isPasswordEmpty ? '500' : '600' }}>
                      <span>{isPasswordEmpty ? '•' : r.ok ? '✓' : '✗'}</span>{r.text}
                    </div>
                  ))}
                </div>
              )}

              {status.message ? (
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: st.bg, border: `1px solid ${st.border}`, color: st.color, fontSize: '0.9rem', fontWeight: '600' }}>{status.message}</div>
              ) : null}

              <button type="submit" disabled={status.type === 'loading' || otpCooldown > 0}
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', borderRadius: '999px', background: INK, color: WHITE, fontWeight: '700', fontSize: '0.98rem', border: 'none', cursor: 'pointer', marginTop: '20px' }}>
                {otpCooldown > 0 ? <><Clock size={18} /> Đợi {otpCooldown}s</> : <>Xác thực tài khoản <ArrowRight size={18} /></>}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.92rem', color: MUTED, margin: '22px 0 0' }}>
                Đã có tài khoản? <Link to="/candidate/login" style={{ color: RED, fontWeight: '700', textDecoration: 'none' }}>Đăng nhập</Link>
              </p>
            </>
          )}

          {/* STEP 2 — OTP */}
          {currentStep === 2 && (
            <>
              <p style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase', color: RED, margin: '0 0 8px' }}>Xác thực ứng viên</p>
              <h2 style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 10px' }}>Nhập mã OTP 6 số</h2>
              <p style={{ fontSize: '0.96rem', color: MUTED, margin: '0 0 24px' }}>
                Đã gửi mã đến <strong style={{ color: INK }}>{formData.email || 'email đăng nhập của bạn'}</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    aria-label={`Số OTP thứ ${index + 1}`}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => updateOtpDigit(index, event)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    value={otpCode[index]?.trim() || ''}
                    style={{ width: '100%', aspectRatio: '1', textAlign: 'center', fontSize: '1.4rem', fontWeight: '800', color: INK, border: `1.5px solid ${otpCode[index]?.trim() ? INK : LINE}`, borderRadius: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                ))}
              </div>

              {status.message ? (
                <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: st.bg, border: `1px solid ${st.border}`, color: st.color, fontSize: '0.9rem', fontWeight: '600', marginBottom: '18px' }}>{status.message}</div>
              ) : null}

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button type="button" disabled={status.type === 'loading' || otpCooldown > 0} onClick={moveToOtpStep}
                  style={{ background: 'none', border: 'none', color: RED, fontWeight: '700', fontSize: '0.92rem', cursor: otpCooldown > 0 ? 'not-allowed' : 'pointer', opacity: otpCooldown > 0 ? 0.6 : 1 }}>
                  {otpCooldown > 0 ? `Gửi lại mã (${otpCooldown}s)` : 'Gửi lại mã OTP'}
                </button>
                <button type="button" onClick={returnToInfoStep} style={{ background: 'none', border: 'none', color: MUTED, fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer' }}>Chỉnh lại thông tin</button>
              </div>
            </>
          )}

          {/* STEP 3 — complete */}
          {currentStep === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '50%', background: '#e6f4ec', color: '#16a34a', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><CheckCircle2 size={36} /></span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: INK, margin: '0 0 10px' }}>Bạn đã là ứng viên!</h2>
              <p style={{ fontSize: '1rem', color: MUTED, lineHeight: 1.6, margin: '0 auto 26px', maxWidth: '28rem' }}>
                Tài khoản đã được xác thực. Tiếp theo, hãy dựng Portfolio để kể câu chuyện kỹ năng của bạn.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/portfolio" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', background: INK, color: WHITE, fontWeight: '700', fontSize: '0.96rem', textDecoration: 'none' }}>
                  Dựng Portfolio ngay <ArrowRight size={18} />
                </Link>
                <Link to="/candidates" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 24px', borderRadius: '999px', border: `1.5px solid ${INK}`, color: INK, fontWeight: '700', fontSize: '0.96rem', textDecoration: 'none' }}>
                  Về trang ứng viên
                </Link>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
