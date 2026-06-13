import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';

const socialProviders = [
  { provider: 'google', label: 'Google', mark: 'G' },
  { provider: 'facebook', label: 'Facebook', mark: 'f' },
  { provider: 'apple', label: 'Apple', mark: '' },
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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPasswordValid(password) {
  return (
    password.length >= 6 &&
    password.length <= 25 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

export function CandidateRegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [focusedField, setFocusedField] = useState('displayName');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Đang chuẩn bị tài khoản ứng viên...' });

    const invalidField = registrationFields.find((field) => getFieldState(field.key) !== 'valid');

    if (invalidField) {
      setFocusedField(invalidField.key);
      setStatus({
        type: 'error',
        message: `Kiểm tra lại ${invalidField.label.toLowerCase()} trước khi tạo tài khoản nhé.`,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Mật khẩu nhập lại chưa khớp. Kiểm tra lại giúp mình nhé.' });
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus({
        type: 'success',
        message: 'Đã lưu mô phỏng thông tin đăng ký. Khi auth sẵn sàng, luồng này sẽ tạo tài khoản thật.',
      });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          display_name: formData.displayName,
          student_email: formData.studentEmail,
          role_intent: 'candidate_free',
        },
        emailRedirectTo: `${window.location.origin}/portfolio`,
      },
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
      return;
    }

    setStatus({
      type: 'success',
      message: 'Tài khoản đã được tạo. Kiểm tra email để xác nhận rồi tiếp tục dựng Portfolio 3D.',
    });
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
          <h1>Đăng ký tài khoản theo cách nhẹ nhàng hơn.</h1>
          <p>
            Điền những thông tin cốt lõi từ schema: tài khoản, email sinh viên và
            mật khẩu. Sau bước này, bạn sẽ tiếp tục dựng Portfolio 3D.
          </p>
          <div className="register-trust-row">
            <span>
              <ShieldCheck size={16} />
              Backend xác thực role và trust data
            </span>
            <span>
              <BadgeCheck size={16} />
              Frontend chỉ thu thập onboarding data
            </span>
          </div>
        </div>
      </section>

      <section className="register-workspace">
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

        <form className="register-form-panel" onSubmit={handleSubmit}>
          <div className="register-form-header">
            <Sparkles size={22} />
            <div>
              <p className="eyebrow">Candidate account</p>
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
            <button className="button primary-button" disabled={status.type === 'loading'} type="submit">
              Tạo tài khoản & mở Portfolio
              <ArrowRight size={18} />
            </button>
            <Link className="text-link" to="/login">
              Tôi đã có tài khoản
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
