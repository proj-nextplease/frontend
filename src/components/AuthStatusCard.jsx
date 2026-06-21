import { AlertCircle, CheckCircle2, Clock, Loader2, X } from 'lucide-react';

const INK = '#101828';
const BLUE = '#2563eb';

const CONFIG = {
  success: { accent: '#16a34a', bg: 'rgba(22,163,74,0.07)', border: 'rgba(22,163,74,0.28)', title: 'Thành công', Icon: CheckCircle2 },
  error: { accent: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.28)', title: 'Đã xảy ra lỗi', Icon: AlertCircle },
  warning: { accent: '#b45309', bg: 'rgba(217,119,6,0.07)', border: 'rgba(217,119,6,0.28)', title: 'Lưu ý', Icon: Clock },
  loading: { accent: BLUE, bg: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.22)', title: 'Đang xử lý', Icon: Loader2 },
};

/**
 * Polished auth status card with a left accent bar, icon, title + message,
 * entrance animation and an optional dismiss button. `titles` is a per-type
 * heading map ({ success, error, warning, loading }); `title` overrides for
 * all types. Pass `onClose` to render a dismiss button.
 */
export function AuthStatusCard({ status, title, titles, onClose, style }) {
  if (!status?.message) return null;
  const cfg = CONFIG[status.type];
  if (!cfg) return null;
  const { Icon } = cfg;
  const heading = title || titles?.[status.type] || cfg.title;
  const dismissible = typeof onClose === 'function' && status.type !== 'loading';

  return (
    <div
      key={`${status.type}-${status.message}`}
      role={status.type === 'error' ? 'alert' : 'status'}
      style={{
        position: 'relative',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '14px 16px 14px 18px',
        borderRadius: '12px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        overflow: 'hidden',
        animation: 'npStatusIn 0.32s cubic-bezier(0.22,1,0.36,1) both',
        ...style,
      }}
    >
      <style>{`
        @keyframes npStatusIn { from { opacity:0; transform: translateY(-8px) scale(0.985); } to { opacity:1; transform:none; } }
        @keyframes npStatusSpin { to { transform: rotate(360deg); } }
        .np-status-spin { animation: npStatusSpin 0.8s linear infinite; }
      `}</style>

      {/* left accent bar */}
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: cfg.accent }} />

      <span style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%', background: `${cfg.accent}1a`, color: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} className={status.type === 'loading' ? 'np-status-spin' : undefined} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: cfg.accent, marginBottom: '2px' }}>{heading}</div>
        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: INK, wordBreak: 'break-word' }}>{status.message}</p>
      </div>

      {dismissible ? (
        <button type="button" aria-label="Đóng thông báo" onClick={onClose}
          style={{ flexShrink: 0, background: 'none', border: 'none', color: cfg.accent, cursor: 'pointer', display: 'flex', padding: '2px', opacity: 0.7 }}>
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
