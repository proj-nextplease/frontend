import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import {
  requestCandidateRegistrationOtp,
  verifyCandidateRegistrationOtp,
} from '../api/candidateRegistrationApi.js';
import { loginCandidate } from '../api/authApi.js';
import { supabase } from '../services/supabaseClient.js';

const socialProviders = [
  { provider: 'google', label: 'Google', mark: 'G' },
  { provider: 'facebook', label: 'Facebook', mark: 'f' },
  { provider: 'apple', label: 'Apple', mark: '' },
];

const initialForm = {
  displayName: '',
  email: '',
  studentEmail: '',
  password: '',
  confirmPassword: '',
};

const registrationFields = [
  { key: 'displayName', label: 'Tên hiển thị', icon: UserRound },
  { key: 'email', label: 'Email đăng nhập', icon: Mail },
  { key: 'studentEmail', label: 'Email sinh viên', icon: GraduationCap },
  { key: 'password', label: 'Mật khẩu', icon: LockKeyhole },
  { key: 'confirmPassword', label: 'Nhập lại mật khẩu', icon: ShieldCheck },
];

const onboardingSteps = ['Trở thành ứng viên', 'Xác thực ứng viên', 'Bạn đã là ứng viên'];
const candidateRegisterDraftKey = 'nextplease:candidate-register-draft';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Minimum seconds between OTP requests (matches backend cooldown). */
const OTP_COOLDOWN_SECONDS = 60;

function isPasswordValid(password) {
  return (
    password.length >= 6 &&
    password.length <= 25 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

function readCandidateRegisterDraft() {
  if (typeof window === 'undefined') {
    return initialForm;
  }

  try {
    const draft = window.sessionStorage.getItem(candidateRegisterDraftKey);
    return draft ? { ...initialForm, ...JSON.parse(draft) } : initialForm;
  } catch {
    return initialForm;
  }
}

export function CandidateRegisterPage() {
  const [formData, setFormData] = useState(readCandidateRegisterDraft);
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState('displayName');
  const [otpCode, setOtpCode] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const otpInputRefs = useRef([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);
  /** Countdown seconds remaining before user can request OTP again. */
  const [otpCooldown, setOtpCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    try {
      // Never persist password to sessionStorage
      const { password, confirmPassword, ...safeDraft } = formData;
      window.sessionStorage.setItem(candidateRegisterDraftKey, JSON.stringify(safeDraft));
    } catch {
      // Draft persistence is a UX helper; the form should still work if storage is unavailable.
    }
  }, [formData]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  function startCooldownTimer() {
    setOtpCooldown(OTP_COOLDOWN_SECONDS);

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function updateOtpDigit(index, event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 6).split('');
    const nextOtp = otpCode.padEnd(6, ' ').split('');

    if (digits.length > 1) {
      digits.forEach((digit, digitIndex) => {
        if (index + digitIndex < 6) {
          nextOtp[index + digitIndex] = digit;
        }
      });
      setOtpCode(nextOtp.join('').slice(0, 6));
      otpInputRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }

    nextOtp[index] = digits[0] || ' ';
    setOtpCode(nextOtp.join('').slice(0, 6));

    if (digits[0] && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === 'Backspace' && !otpCode[index]?.trim() && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }

  function getFieldState(fieldKey) {
    const value = formData[fieldKey].trim();

    if (!value) {
      return 'empty';
    }

    if (fieldKey === 'email' || fieldKey === 'studentEmail') {
      return emailPattern.test(value) ? 'valid' : 'invalid';
    }

    if (fieldKey === 'password') {
      return isPasswordValid(formData.password) ? 'valid' : 'invalid';
    }

    if (fieldKey === 'confirmPassword') {
      return formData.confirmPassword === formData.password ? 'valid' : 'invalid';
    }

    return 'valid';
  }

  function getFieldClass(fieldKey) {
    const fieldState = getFieldState(fieldKey);
    return [
      focusedField === fieldKey ? 'active' : '',
      fieldState === 'valid' ? 'valid' : '',
      fieldState === 'invalid' ? 'invalid' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  async function handleSocialRegister(provider) {
    setStatus({ type: 'loading', message: `Đang mở đăng ký bằng ${provider}...` });

    if (!isSupabaseConfigured) {
      setStatus({
        type: 'warning',
        message: 'Supabase env chưa được cấu hình. UI đã sẵn sàng, chỉ cần bật OAuth provider sau.',
      });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/portfolio`,
      },
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function moveToOtpStep() {
    // Prevent spamming while cooldown is active
    if (otpCooldown > 0) {
      setStatus({
        type: 'warning',
        message: `Vui lòng đợi ${otpCooldown} giây trước khi yêu cầu mã OTP mới.`,
      });
      return;
    }

    setStatus({ type: 'loading', message: 'Đang chuẩn bị bước xác thực ứng viên...' });

    const invalidField = registrationFields.find((field) => getFieldState(field.key) !== 'valid');

    if (invalidField) {
      setFocusedField(invalidField.key);
      setStatus({
        type: 'error',
        message: `Kiểm tra lại ${invalidField.label.toLowerCase()} trước khi tạo tài khoản nhé.`,
      });
      return;
    }

    try {
      // Send registration request directly to backend (no Supabase signUp needed)
      const otpResponse = await requestCandidateRegistrationOtp({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        studentEmail: formData.studentEmail,
      });

      setRegistrationId(otpResponse.registrationId);
      setCurrentStep(2);
      startCooldownTimer();
      setStatus({
        type: 'success',
        message: otpResponse.devOtp
          ? `Mã OTP dev là ${otpResponse.devOtp}. Production sẽ gửi mã này qua email ${otpResponse.email}.`
          : `Mã OTP 6 số đã được gửi tới ${otpResponse.email}. Nhập mã để hoàn tất xác thực ứng viên.`,
      });
    } catch (error) {
      const serverMessage = error?.response?.data?.message || error.message || '';

      // Handle rate limit from backend
      if (error?.response?.status === 429) {
        startCooldownTimer();
        setStatus({
          type: 'warning',
          message: serverMessage || 'Bạn đã gửi yêu cầu OTP quá nhanh. Vui lòng đợi rồi thử lại.',
        });
        return;
      }

      setStatus({
        type: 'error',
        message: serverMessage || 'Không thể gửi mã OTP đăng ký ứng viên.',
      });
    }
  }

  async function completeCandidateRegistration() {
    setStatus({ type: 'loading', message: 'Đang xác thực mã OTP và tạo tài khoản ứng viên...' });

    const sanitizedOtpCode = otpCode.replace(/\s/g, '');

    if (!/^\d{6}$/.test(sanitizedOtpCode)) {
      setStatus({ type: 'error', message: 'Nhập đủ mã OTP 6 số đã gửi qua email đăng nhập nhé.' });
      return;
    }

    if (!registrationId) {
      setStatus({ type: 'error', message: 'Thiếu mã phiên đăng ký. Quay lại bước 1 để nhận OTP mới nhé.' });
      return;
    }

    try {
      await verifyCandidateRegistrationOtp({
        registrationId,
        otp: sanitizedOtpCode,
        password: formData.password,
      });

      // Automatically log the user in to establish client-side session
      try {
        const loginData = await loginCandidate(formData.email, formData.password);
        if (loginData && loginData.accessToken) {
          await supabase.auth.setSession({
            access_token: loginData.accessToken,
            refresh_token: loginData.refreshToken,
          });
        }
      } catch (loginError) {
        console.error('Tự động đăng nhập sau đăng ký thất bại:', loginError);
      }

      setCurrentStep(3);
      window.sessionStorage.removeItem(candidateRegisterDraftKey);
      setStatus({
        type: 'success',
        message: 'Đã xác thực OTP thành công. Tài khoản ứng viên đã được tạo và tự động đăng nhập.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.response?.data?.message || error.message || 'Không thể xác thực OTP ứng viên.',
      });
    }
  }

  function returnToInfoStep() {
    setCurrentStep(1);
    setOtpCode('');
    setRegistrationId('');
    setStatus({ type: 'idle', message: '' });
  }

  function handlePanelSubmit(event) {
    event.preventDefault();

    if (currentStep === 1) {
      moveToOtpStep();
    }
  }

  return (
    <section
      className="candidate-register-page interactive-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cursor-spotlight" aria-hidden="true" />

      <section className="register-hero">
        <div className="register-hero-copy">
          <Link className="portfolio-back-link" to="/candidates">
            Quay lại trang ứng viên
          </Link>
          <p className="eyebrow">Bắt đầu làm ứng viên</p>
          <h1>Tạo tài khoản ứng viên theo cách nhẹ nhàng hơn.</h1>
        </div>
      </section>

      <section className="candidate-onboarding-stepper" aria-label="Candidate onboarding steps">
        {onboardingSteps.map((step, index) => {
          const stepNumber = index + 1;
          const stepState =
            stepNumber < currentStep ? 'completed' : stepNumber === currentStep ? 'current' : 'pending';

          return (
            <div className={`candidate-step ${stepState}`} key={step}>
              <span className="candidate-step-dot">
                {stepNumber < currentStep ? <CheckCircle2 size={24} /> : stepNumber}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </section>

      <section className={`register-workspace step-${currentStep}`}>
        {currentStep === 1 ? (
          <aside className="register-field-rail" aria-label="Registration progress">
            <div className="field-rail-line" aria-hidden="true" />
            {registrationFields.map((field, index) => {
              const Icon = field.icon;
              const fieldState = getFieldState(field.key);
              const isActive = focusedField === field.key;
              return (
                <article
                  className={`field-rail-item ${isActive ? 'active' : ''} ${fieldState}`}
                  key={field.key}
                >
                  <span className="field-rail-dot">{index + 1}</span>
                  <Icon size={22} />
                  <div>
                    <strong>{field.label}</strong>
                    <p>
                      {fieldState === 'valid'
                        ? 'Đã có dữ liệu'
                        : fieldState === 'invalid'
                          ? 'Cần kiểm tra lại'
                          : 'Đang chờ nhập'}
                    </p>
                  </div>
                </article>
              );
            })}
          </aside>
        ) : null}

        <form className="register-form-panel" onSubmit={handlePanelSubmit}>
          {currentStep === 1 ? (
            <>
          <div className="register-form-header">
            <Sparkles size={22} />
            <div>
              <p className="eyebrow">Bắt đầu làm ứng viên</p>
              <h2>Tạo tài khoản ứng viên</h2>
            </div>
          </div>

          <div className="social-register-grid">
            {socialProviders.map((item) => (
              <button
                className="social-register-button"
                key={item.provider}
                onClick={() => handleSocialRegister(item.provider)}
                type="button"
              >
                <span>{item.mark}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="register-divider">
            <span>hoặc điền nhanh thông tin ứng viên</span>
          </div>

          <div className="register-form-grid">
            <label className={getFieldClass('displayName')}>
              <UserRound size={18} />
              <input
                name="displayName"
                onChange={updateField}
                onFocus={() => setFocusedField('displayName')}
                placeholder="Tên hiển thị của bạn"
                type="text"
                value={formData.displayName}
              />
            </label>
            <label className={getFieldClass('email')}>
              <Mail size={18} />
              <input
                name="email"
                onChange={updateField}
                onFocus={() => setFocusedField('email')}
                placeholder="Email đăng nhập"
                type="email"
                value={formData.email}
              />
            </label>
            <label className={getFieldClass('studentEmail')}>
              <GraduationCap size={18} />
              <input
                name="studentEmail"
                onChange={updateField}
                onFocus={() => setFocusedField('studentEmail')}
                placeholder="Email sinh viên để xác thực sau"
                type="email"
                value={formData.studentEmail}
              />
            </label>
            <label className={getFieldClass('password')}>
              <LockKeyhole size={18} />
              <input
                name="password"
                onChange={updateField}
                onFocus={() => setFocusedField('password')}
                placeholder="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
              />
              <button
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="password-visibility-button"
                onClick={() => {
                  const nextValue = !showPassword;
                  setShowPassword(nextValue);
                  setShowPasswordGuide(nextValue);
                }}
                type="button"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </label>
            <label className={getFieldClass('confirmPassword')}>
              <ShieldCheck size={18} />
              <input
                name="confirmPassword"
                onChange={updateField}
                onFocus={() => setFocusedField('confirmPassword')}
                placeholder="Nhập lại mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
              />
              <button
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu nhập lại' : 'Hiện mật khẩu nhập lại'}
                className="password-visibility-button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                type="button"
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </label>
          </div>

          {showPasswordGuide ? (
            <div className="password-guide">
              <p>Hướng dẫn tạo mật khẩu</p>
              <ul>
                <li>Mật khẩu từ 6 đến 25 ký tự</li>
                <li>Bao gồm chữ hoa, chữ thường và ký tự số</li>
              </ul>
            </div>
          ) : null}

          {status.message ? (
            <div className={`register-status ${status.type}`}>
              <AlertCircle size={18} />
              <p>{status.message}</p>
            </div>
          ) : null}

          <div className="register-action-row">
            <button
              className="button primary-button"
              disabled={status.type === 'loading' || otpCooldown > 0}
              type="submit"
            >
              {otpCooldown > 0 ? (
                <>
                  <Clock size={18} />
                  Đợi {otpCooldown}s
                </>
              ) : (
                <>
                  Xác thực tài khoản
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <Link className="text-link" to="/candidate/login">
              Tôi đã có tài khoản
            </Link>
          </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <div className="otp-step-panel">
              <div className="register-form-header">
                <Mail size={22} />
                <div>
                  <p className="eyebrow">Xác thực ứng viên</p>
                  <h2>Nhập mã OTP 6 số</h2>
                </div>
              </div>
              <p className="otp-step-copy">
                Nhập mã OTP 6 số đã gửi đến <strong>{formData.email || 'email đăng nhập của bạn'}</strong>
              </p>
              <div
                className={`otp-code-field ${
                  otpCode.replace(/\s/g, '').length === 6
                    ? 'valid'
                    : otpCode.replace(/\s/g, '').length
                      ? 'active'
                      : ''
                }`}
              >
                <div className="otp-digit-grid" aria-label="Mã OTP 6 số">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      aria-label={`Số OTP thứ ${index + 1}`}
                      className="otp-digit-input"
                      inputMode="numeric"
                      key={index}
                      maxLength={1}
                      onChange={(event) => updateOtpDigit(index, event)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      ref={(element) => {
                        otpInputRefs.current[index] = element;
                      }}
                      type="text"
                      value={otpCode[index]?.trim() || ''}
                    />
                  ))}
                </div>
              </div>
              {status.message ? (
                <div className={`register-status ${status.type}`}>
                  <AlertCircle size={18} />
                  <p>{status.message}</p>
                </div>
              ) : null}
              <div className="register-action-row">
                <button
                  className="button primary-button"
                  disabled={status.type === 'loading'}
                  onClick={completeCandidateRegistration}
                  type="button"
                >
                  Tôi đã sẵn sàng
                  <ArrowRight size={18} />
                </button>
                <button className="text-link ghost-link-button" onClick={returnToInfoStep} type="button">
                  Tôi cần chỉnh thông tin
                </button>
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="candidate-complete-panel">
              <div className="candidate-complete-icon">
                <CheckCircle2 size={42} />
              </div>
              <p className="eyebrow">Bạn đã là ứng viên</p>
              <h2>Sẵn sàng dựng Portfolio 3D của bạn.</h2>
              <p>
                Tài khoản ứng viên đã đi qua bước xác thực. Tiếp theo, bạn có thể kể câu chuyện kỹ năng,
                thêm chứng chỉ và dựng nhân vật Portfolio của mình.
              </p>
              {status.message ? (
                <div className={`register-status ${status.type}`}>
                  <AlertCircle size={18} />
                  <p>{status.message}</p>
                </div>
              ) : null}
              <div className="register-action-row complete-actions">
                <Link className="button primary-button" to="/portfolio">
                  Khám phá ngay Portfolio
                  <ArrowRight size={18} />
                </Link>
                <Link className="text-link" to="/candidates">
                  Trở về trang ứng viên
                </Link>
              </div>
            </div>
          ) : null}
        </form>
      </section>
    </section>
  );
}
