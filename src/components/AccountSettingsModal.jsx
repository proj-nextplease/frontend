import { useEffect, useState } from 'react';
import { X, User, Lock, Bell, ShieldAlert, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  getAccountSettings,
  updateDisplayName,
  updateNotificationPreferences,
  changePassword,
  deactivateAccount,
} from '../api/accountApi.js';

const SECTIONS = [
  { key: 'BASIC', label: 'Thông tin cơ bản', icon: User },
  { key: 'PASSWORD', label: 'Đổi mật khẩu', icon: Lock },
  { key: 'NOTIFICATIONS', label: 'Thông báo', icon: Bell },
  { key: 'DANGER', label: 'Khu vực nguy hiểm', icon: ShieldAlert },
];

function StatusBanner({ status }) {
  if (!status?.message) return null;
  const isError = status.type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '11px 14px', borderRadius: '12px', marginBottom: '16px',
      background: isError ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
      color: isError ? '#ef4444' : '#16a34a',
      fontSize: '0.86rem', fontWeight: '600',
    }}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {status.message}
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: '12px',
  border: '1px solid var(--c-line)', background: 'var(--c-surface)', color: 'var(--c-ink)',
  fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none',
};

const DISPLAY_NAME_PATTERN = /^(?=.*\p{L})[\p{L} .'-]+$/u;

function validateDisplayName(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Tên hiển thị không được để trống.';
  if (trimmed.length < 2 || trimmed.length > 50) return 'Tên hiển thị phải từ 2 đến 50 ký tự.';
  if (!DISPLAY_NAME_PATTERN.test(trimmed)) {
    return 'Tên hiển thị chỉ được chứa chữ cái, khoảng trắng và các ký tự . \' -, không chứa số hoặc ký tự đặc biệt khác.';
  }
  return null;
}

const saveButtonStyle = {
  border: 'none', borderRadius: '999px', padding: '11px 22px', fontWeight: '700',
  fontSize: '0.88rem', cursor: 'pointer', background: 'var(--c-red)', color: '#fff',
  display: 'inline-flex', alignItems: 'center', gap: '8px',
};

export function AccountSettingsModal({ onClose, currentDisplayName, currentEmail }) {
  const [activeSection, setActiveSection] = useState('BASIC');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(currentEmail || '');

  // Basic info
  const [displayName, setDisplayName] = useState(currentDisplayName || '');
  const [basicStatus, setBasicStatus] = useState({ type: 'idle', message: '' });
  const [savingBasic, setSavingBasic] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: 'idle', message: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [notifStatus, setNotifStatus] = useState({ type: 'idle', message: '' });
  const [savingNotif, setSavingNotif] = useState(false);

  // Danger zone
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [dangerStatus, setDangerStatus] = useState({ type: 'idle', message: '' });
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getAccountSettings()
      .then((data) => {
        if (!isMounted) return;
        setDisplayName(data.displayName || '');
        setEmail(data.email || '');
        setEmailEnabled(data.emailNotificationsEnabled);
        setPushEnabled(data.pushNotificationsEnabled);
        setInAppEnabled(data.inAppNotificationsEnabled);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  async function handleSaveBasic() {
    setBasicStatus({ type: 'idle', message: '' });
    const nameError = validateDisplayName(displayName);
    if (nameError) {
      setBasicStatus({ type: 'error', message: nameError });
      return;
    }
    setSavingBasic(true);
    try {
      await updateDisplayName(displayName);
      setBasicStatus({ type: 'success', message: 'Đã lưu tên hiển thị.' });
    } catch (error) {
      setBasicStatus({ type: 'error', message: error.message || 'Không thể lưu.' });
    } finally {
      setSavingBasic(false);
    }
  }

  async function handleSavePassword() {
    setPasswordStatus({ type: 'idle', message: '' });
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Mật khẩu mới nhập lại không khớp.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Mật khẩu mới cần tối thiểu 6 ký tự.' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(email, currentPassword, newPassword);
      setPasswordStatus({ type: 'success', message: 'Đã đổi mật khẩu thành công.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message || 'Không thể đổi mật khẩu.' });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSaveNotifications() {
    setSavingNotif(true);
    setNotifStatus({ type: 'idle', message: '' });
    try {
      await updateNotificationPreferences({ emailEnabled, pushEnabled, inAppEnabled });
      setNotifStatus({ type: 'success', message: 'Đã lưu tùy chọn thông báo.' });
    } catch (error) {
      setNotifStatus({ type: 'error', message: error.message || 'Không thể lưu.' });
    } finally {
      setSavingNotif(false);
    }
  }

  async function handleDeactivate() {
    setDangerStatus({ type: 'idle', message: '' });
    if (!deactivatePassword) {
      setDangerStatus({ type: 'error', message: 'Vui lòng nhập mật khẩu để xác nhận.' });
      return;
    }
    if (!confirmDeactivate) {
      setDangerStatus({ type: 'error', message: 'Vui lòng tick xác nhận bên dưới.' });
      return;
    }
    setDeactivating(true);
    try {
      await deactivateAccount(deactivatePassword);
      setDangerStatus({ type: 'success', message: 'Tài khoản đã được vô hiệu hóa. Đang đăng xuất...' });
      setTimeout(() => { window.location.href = '/'; }, 1800);
    } catch (error) {
      setDangerStatus({ type: 'error', message: error.message || 'Không thể vô hiệu hóa tài khoản.' });
      setDeactivating(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(29,19,32,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        animation: 'npSettingsOverlayIn 0.18s ease both',
      }}
    >
      <style>{`
        /* Scoped copy of the candidate portal's CSS custom properties, WITHOUT
           .candidate-portal-layout's own display:block + min-height:100vh —
           reusing that class name here (previous version) forced this modal
           to stretch to full viewport height, fighting the inline
           max-height:86vh and leaving a huge dead area below short sections
           (2026-07-06 feedback: "quá xấu"). */
        .np-settings-modal {
          --c-red: #e5533f; --c-red-soft: #fdeeeb; --c-ink: #1d1320; --c-muted: #6e6470;
          --c-line: #ece6e2; --c-line-strong: #ddd4cf; --c-surface: #ffffff;
          --c-surface-soft: #faf7f5; --c-disabled: #f3ede9;
        }
        /* Dark-mode values, copied from .candidate-portal-layout's own dark
           override — that override never applied here since this component
           doesn't use that class name anymore (see note above), so the modal
           was stuck light-only regardless of the site's theme toggle
           (2026-07-06 feedback: "theme đang tối mà sao nó vẫn sáng"). */
        :root[data-theme='dark'] .np-settings-modal {
          --c-red: #ff6f59; --c-red-soft: rgba(255, 111, 89, 0.16); --c-ink: #f2edef;
          --c-muted: #a69da2; --c-line: rgba(255, 255, 255, 0.12); --c-line-strong: rgba(255, 255, 255, 0.2);
          --c-surface: #181b21; --c-surface-soft: #14161b; --c-disabled: #23262d;
        }
        @keyframes npSettingsOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes npSettingsCardIn { from { opacity: 0; transform: translateY(18px) scale(0.96); } to { opacity: 1; transform: none; } }
        @keyframes npSettingsSpin { to { transform: rotate(360deg); } }
        @keyframes npSettingsSectionIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .np-settings-spin { animation: npSettingsSpin 0.8s linear infinite; }
        .np-settings-section { animation: npSettingsSectionIn 0.22s cubic-bezier(0.22,1,0.36,1) both; }
        .np-settings-close-btn { transition: background-color 160ms ease, transform 160ms ease; }
        .np-settings-close-btn:hover { background: var(--c-line) !important; transform: rotate(90deg); }
        .np-settings-nav-item { position: relative; display: flex; align-items: center; gap: 10px; width: 100%; border: none; background: none; text-align: left; padding: 11px 14px; border-radius: 12px; font-size: 0.88rem; font-weight: 600; color: var(--c-muted); cursor: pointer; transition: background-color 180ms ease, color 180ms ease, transform 180ms ease; }
        .np-settings-nav-item:hover { background: var(--c-disabled); transform: translateX(2px); }
        .np-settings-nav-item.active { background: var(--c-red-soft); color: var(--c-red); }
        .np-settings-nav-item.active::before { content: ''; position: absolute; left: -10px; top: 50%; transform: translateY(-50%); width: 4px; height: 18px; border-radius: 4px; background: var(--c-red); }
        .np-settings-input { transition: border-color 160ms ease, box-shadow 160ms ease; }
        .np-settings-input:focus { border-color: var(--c-red) !important; box-shadow: 0 0 0 3px rgba(229,83,63,0.14); }
        .np-settings-save-btn { transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease; }
        .np-settings-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(229,83,63,0.28); }
        .np-settings-save-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
        .np-settings-save-btn:disabled { opacity: 0.7; cursor: default; }
        .np-settings-switch { position: relative; width: 40px; height: 22px; border-radius: 999px; border: none; cursor: pointer; transition: background-color 200ms ease; flex-shrink: 0; }
        .np-settings-switch-knob { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      <div
        className="np-settings-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(760px, 100%)', height: '600px', maxHeight: '86vh', background: 'var(--c-surface)',
          borderRadius: '22px', boxShadow: '0 30px 70px rgba(29,19,32,0.28)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'npSettingsCardIn 0.24s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--c-line)', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--c-ink)' }}>Cài đặt tài khoản</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="np-settings-close-btn"
            style={{ border: 'none', background: 'var(--c-disabled)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--c-ink)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <nav style={{ width: '190px', flexShrink: 0, borderRight: '1px solid var(--c-line)', padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  type="button"
                  className={`np-settings-nav-item ${activeSection === section.key ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.key)}
                  style={section.key === 'DANGER' && activeSection !== 'DANGER' ? { color: '#ef4444' } : undefined}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </nav>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--c-muted)', gap: '10px' }}>
                <Loader2 size={18} className="np-settings-spin" /> Đang tải cài đặt...
              </div>
            ) : (
              <>
                {activeSection === 'BASIC' && (
                  <div className="np-settings-section" key={activeSection}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.02rem', fontWeight: '800', color: 'var(--c-ink)' }}>Thông tin cơ bản</h3>
                    <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'var(--c-muted)' }}>Xem và cập nhật tên hiển thị của bạn trên hệ thống.</p>
                    <StatusBanner status={basicStatus} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--c-ink)' }}>Tên hiển thị</span>
                        <input className="np-settings-input" style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
                        <span style={{ fontSize: '0.76rem', color: 'var(--c-muted)' }}>
                          2-50 ký tự, chỉ chữ cái và khoảng trắng (không chứa số). {displayName.trim().length}/50
                        </span>
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--c-ink)' }}>Email</span>
                        <input className="np-settings-input" style={{ ...inputStyle, color: 'var(--c-muted)', cursor: 'not-allowed' }} value={email} readOnly title="Email gắn với tài khoản đăng nhập, liên hệ hỗ trợ nếu cần đổi." />
                      </label>
                      <div>
                        <button type="button" className="np-settings-save-btn" style={saveButtonStyle} onClick={handleSaveBasic} disabled={savingBasic}>
                          {savingBasic && <Loader2 size={14} className="np-settings-spin" />}
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'PASSWORD' && (
                  <div className="np-settings-section" key={activeSection}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.02rem', fontWeight: '800', color: 'var(--c-ink)' }}>Đổi mật khẩu</h3>
                    <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'var(--c-muted)' }}>Cập nhật mật khẩu để bảo mật tài khoản của bạn.</p>
                    <StatusBanner status={passwordStatus} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--c-ink)' }}>Mật khẩu hiện tại</span>
                        <input className="np-settings-input" style={inputStyle} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--c-ink)' }}>Mật khẩu mới</span>
                        <div style={{ position: 'relative' }}>
                          <input
                            className="np-settings-input"
                            style={{ ...inputStyle, paddingRight: '42px' }}
                            type={showPw ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setNewPasswordFocused(true)}
                            onBlur={() => setNewPasswordFocused(false)}
                            autoComplete="new-password"
                          />
                          <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--c-muted)', cursor: 'pointer', display: 'flex' }}>
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {(newPasswordFocused || newPassword) && (
                          <div style={{ background: 'var(--c-red-soft)', borderRadius: '12px', padding: '12px 14px' }}>
                            <p style={{ margin: '0 0 6px', fontSize: '0.78rem', fontWeight: '800', color: 'var(--c-ink)' }}>Yêu cầu mật khẩu</p>
                            {[
                              { ok: newPassword.length >= 6 && newPassword.length <= 25, text: 'Từ 6 đến 25 ký tự' },
                              { ok: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) && /\d/.test(newPassword), text: 'Có chữ hoa, chữ thường và số' },
                            ].map((r) => (
                              <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '2px', color: !newPassword ? 'var(--c-muted)' : r.ok ? '#16a34a' : '#dc2626', fontWeight: !newPassword ? '500' : '600' }}>
                                <span>{!newPassword ? '•' : r.ok ? '✓' : '✗'}</span>{r.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--c-ink)' }}>Xác nhận mật khẩu mới</span>
                        <input className="np-settings-input" style={inputStyle} type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                      </label>
                      <div>
                        <button type="button" className="np-settings-save-btn" style={saveButtonStyle} onClick={handleSavePassword} disabled={savingPassword}>
                          {savingPassword && <Loader2 size={14} className="np-settings-spin" />}
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'NOTIFICATIONS' && (
                  <div className="np-settings-section" key={activeSection}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.02rem', fontWeight: '800', color: 'var(--c-ink)' }}>Tùy chọn thông báo</h3>
                    <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'var(--c-muted)' }}>Chọn cách bạn muốn nhận thông báo từ nextplease.</p>
                    <StatusBanner status={notifStatus} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {[
                        { label: 'Thông báo qua Email', desc: 'Cơ hội mới, minh chứng được duyệt, cập nhật Quest.', value: emailEnabled, setValue: setEmailEnabled },
                        { label: 'Thông báo đẩy (Push)', desc: 'Nhận cảnh báo tức thời trên trình duyệt.', value: pushEnabled, setValue: setPushEnabled },
                        { label: 'Thông báo trong ứng dụng', desc: 'Hiện trong chuông thông báo trên thanh Dock.', value: inAppEnabled, setValue: setInAppEnabled },
                      ].map((item) => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--c-ink)' }}>{item.label}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginTop: '2px' }}>{item.desc}</div>
                          </div>
                          <button
                            type="button"
                            className="np-settings-switch"
                            onClick={() => item.setValue((v) => !v)}
                            aria-pressed={item.value}
                            aria-label={item.label}
                            style={{ background: item.value ? 'var(--c-red)' : 'var(--c-line-strong)' }}
                          >
                            <span className="np-settings-switch-knob" style={{ transform: item.value ? 'translateX(18px)' : 'translateX(0)' }} />
                          </button>
                        </div>
                      ))}
                      <div>
                        <button type="button" className="np-settings-save-btn" style={saveButtonStyle} onClick={handleSaveNotifications} disabled={savingNotif}>
                          {savingNotif && <Loader2 size={14} className="np-settings-spin" />}
                          Lưu tùy chọn
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'DANGER' && (
                  <div className="np-settings-section" key={activeSection}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.02rem', fontWeight: '800', color: '#ef4444' }}>Khu vực nguy hiểm</h3>
                    <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'var(--c-muted)' }}>Vô hiệu hóa tài khoản sẽ khóa đăng nhập ngay lập tức. Portfolio và lịch sử hoạt động của bạn được giữ nguyên — liên hệ hỗ trợ nếu muốn kích hoạt lại.</p>
                    <StatusBanner status={dangerStatus} />
                    <div style={{ border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--c-ink)' }}>Nhập mật khẩu để xác nhận</span>
                        <input className="np-settings-input" style={inputStyle} type="password" value={deactivatePassword} onChange={(e) => setDeactivatePassword(e.target.value)} autoComplete="current-password" />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: 'var(--c-ink)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={confirmDeactivate} onChange={(e) => setConfirmDeactivate(e.target.checked)} style={{ marginTop: '3px' }} />
                        Tôi hiểu rằng tài khoản của tôi sẽ bị khóa đăng nhập ngay lập tức.
                      </label>
                      <div>
                        <button
                          type="button"
                          className="np-settings-save-btn"
                          style={{ ...saveButtonStyle, background: '#ef4444' }}
                          onClick={handleDeactivate}
                          disabled={deactivating}
                        >
                          {deactivating && <Loader2 size={14} className="np-settings-spin" />}
                          Vô hiệu hóa tài khoản
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
