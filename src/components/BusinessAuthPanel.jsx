import { useState } from 'react';
import { Link } from 'react-router-dom';

const NAVY = '#0d1b33';
const NAVY2 = '#13284c';
const BLUE = '#3b82f6';
const BLUE_SOFT = 'rgba(59,130,246,0.16)';
const LIGHT = '#eaf0fb';
const MUTED = '#9aa8c2';
const LINE = 'rgba(255,255,255,0.12)';

const features = [
  'Đăng tin tuyển dụng & Quest, tiếp cận ứng viên đã xác thực',
  'Sàng lọc bằng proof thật thay vì CV tự khai',
  'Quản trị đội ngũ, phân quyền & mời đồng đội',
  'Đánh giá ứng viên và trao thưởng minh bạch',
];

const metrics = [
  { value: '500+', label: 'Tổ chức tin dùng' },
  { value: '12k+', label: 'Hồ sơ có proof' },
  { value: '24h', label: 'Duyệt hồ sơ' },
];

const partners = [
  { name: 'VNG', vn: true },
  { name: 'Shopee', slug: 'shopee' },
  { name: 'MoMo', vn: true },
  { name: 'Grab', slug: 'grab' },
  { name: 'FPT', vn: true },
  { name: 'Tiki', vn: true },
  { name: 'Google', slug: 'google' },
  { name: 'Viettel', vn: true },
];

function CheckBadge() {
  return (
    <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: BLUE_SOFT, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(59,130,246,0.4)` }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12l4 4 8-8" stroke={BLUE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

function Logo({ p }) {
  const [failed, setFailed] = useState(false);
  if (p.vn || failed) {
    return <span style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#aebbd4', whiteSpace: 'nowrap' }}>{p.name}</span>;
  }
  return <img src={`https://cdn.simpleicons.org/${p.slug}/aebbd4`} alt={p.name} onError={() => setFailed(true)} style={{ height: '24px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />;
}

/**
 * Professional B2B auth side panel: deep navy canvas, subtle grid + glow,
 * value-prop checklist, trust metrics and an auto-scrolling partner marquee.
 * `animation` is a keyframe name defined by the host page.
 */
export function BusinessAuthPanel({ animation }) {
  return (
    <div
      className="np-auth-brand"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(120% 90% at 80% 0%, ${NAVY2} 0%, ${NAVY} 55%)`,
        color: LIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100%',
        animation: `${animation} 0.7s cubic-bezier(0.22,1,0.36,1) both`,
      }}
    >
      <style>{`
        @keyframes npBizMq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .np-biz-mq { animation: npBizMq 28s linear infinite; }
        .np-biz-mq:hover { animation-play-state: paused; }
        .np-biz-mq-group { display: flex; align-items: center; flex-shrink: 0; }
        .np-biz-mq-group > * { margin-right: 44px; }
      `}</style>

      {/* subtle grid + glow */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`, backgroundSize: '46px 46px', opacity: 0.35, maskImage: 'radial-gradient(120% 80% at 50% 20%, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(120% 80% at 50% 20%, #000 30%, transparent 75%)', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '-12%', right: '-10%', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.28), transparent 68%)', zIndex: 0 }} />

      {/* chrome — pinned top */}
      <div style={{ position: 'absolute', top: 'clamp(34px, 4vw, 52px)', left: 'clamp(36px, 3.5vw, 54px)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>
        <Link to="/businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: MUTED, fontSize: '0.88rem', fontWeight: '600', textDecoration: 'none' }}>← Trang đối tác</Link>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff' }}>next please</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: BLUE }}>:</span>
          </span>
          <span style={{ fontSize: '0.66rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE, border: `1px solid rgba(59,130,246,0.45)`, borderRadius: '6px', padding: '3px 7px' }}>For Business</span>
        </Link>
      </div>

      {/* CENTER — headline + checklist (căn giữa) */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(40px, 4vw, 64px)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: BLUE, margin: '0 0 16px' }}>Nền tảng tuyển dụng dựa trên năng lực</p>
        <h1 style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.5rem)', fontWeight: '800', lineHeight: 1.18, letterSpacing: '-0.025em', color: '#fff', margin: '0 0 30px', maxWidth: '460px' }}>
          Tuyển đúng người qua <span style={{ color: BLUE }}>proof thật</span>, không chỉ CV.
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '36px', textAlign: 'left' }}>
          {features.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <CheckBadge />
              <span style={{ fontSize: '0.98rem', fontWeight: '600', color: LIGHT }}>{f}</span>
            </div>
          ))}
        </div>

        {/* metrics */}
        <div style={{ display: 'inline-flex', gap: 'clamp(24px, 2.4vw, 40px)', paddingTop: '26px', borderTop: `1px solid ${LINE}` }}>
          {metrics.map((m) => (
            <div key={m.label}>
              <div style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: MUTED, marginTop: '6px' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* marquee — pinned bottom */}
      <div style={{ position: 'absolute', bottom: 'clamp(28px, 3vw, 42px)', left: 0, right: 0, zIndex: 2 }}>
        <p style={{ fontSize: '0.76rem', fontWeight: '800', letterSpacing: '0.05em', color: MUTED, margin: '0 0 18px', textAlign: 'center', textTransform: 'uppercase' }}>Được tin dùng bởi đội ngũ tuyển dụng tại:</p>
        <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
          <div className="np-biz-mq" style={{ display: 'flex', width: 'max-content' }}>
            <div className="np-biz-mq-group">{partners.map((p) => <Logo key={`a-${p.name}`} p={p} />)}</div>
            <div className="np-biz-mq-group" aria-hidden="true">{partners.map((p) => <Logo key={`b-${p.name}`} p={p} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
