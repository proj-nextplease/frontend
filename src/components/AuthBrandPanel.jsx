import { useState } from 'react';
import { Link } from 'react-router-dom';

const INK = 'var(--lp-ink)';
const MUTED = 'var(--lp-muted)';
const RED = 'var(--lp-red)';
const BG = 'var(--lp-pink-card)';
const CIRCLE = 'var(--lp-pink)';

const features = [
  'Dựng hồ sơ & tích proof hoàn toàn miễn phí',
  'Tích EXP, lên Level qua từng hoạt động',
  'Ứng tuyển một chạm tới mọi cơ hội',
  'Được tổ chức xác nhận & đánh giá thật',
];

const partners = [
  { name: 'VNG', vn: true },
  { name: 'Shopee', slug: 'shopee' },
  { name: 'MoMo', vn: true },
  { name: 'Grab', slug: 'grab' },
  { name: 'Tiki', vn: true },
  { name: 'Zalo', slug: 'zalo' },
  { name: 'Google', slug: 'google' },
  { name: 'Figma', slug: 'figma' },
  { name: 'Viettel', vn: true },
  { name: 'Spotify', slug: 'spotify' },
];

function CheckBadge() {
  return (
    <span style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%', background: RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12l4 4 8-8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

function Logo({ p }) {
  const [failed, setFailed] = useState(false);
  if (p.vn || failed) {
    return <span style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--lp-muted)', whiteSpace: 'nowrap' }}>{p.name}</span>;
  }
  return <img src={`https://cdn.simpleicons.org/${p.slug}/6b6470`} alt={p.name} onError={() => setFailed(true)} style={{ height: '26px', width: 'auto', objectFit: 'contain', opacity: 0.9 }} />;
}

/**
 * Auth side panel (Wellfound-style): soft tinted canvas with a rounded accent
 * headline band, a checklist of value props over faint decorative circles,
 * and an auto-scrolling "trusted by" logo marquee. `animation` is a keyframe
 * name the host page defines.
 */
export function AuthBrandPanel({ animation }) {
  return (
    <div className="np-auth-brand" style={{ position: 'relative', overflow: 'hidden', background: BG, color: INK, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%', animation: `${animation} 0.7s cubic-bezier(0.22,1,0.36,1) both` }}>
      <style>{`
        @keyframes npAuthMq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .np-auth-mq { animation: npAuthMq 26s linear infinite; }
        .np-auth-mq:hover { animation-play-state: paused; }
        .np-auth-mq-group { display: flex; align-items: center; flex-shrink: 0; }
        .np-auth-mq-group > * { margin-right: 44px; }
      `}</style>

      {/* decorative circles */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '-7%', right: '-5%', width: '260px', height: '260px', borderRadius: '50%', background: CIRCLE, opacity: 0.7, zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '6%', left: '-6%', width: '240px', height: '240px', borderRadius: '50%', background: CIRCLE, opacity: 0.5, zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '20%', right: '8%', width: '180px', height: '180px', borderRadius: '50%', background: CIRCLE, opacity: 0.4, zIndex: 0 }} />

      {/* chrome — pinned top */}
      <div style={{ position: 'absolute', top: 'clamp(34px, 4vw, 52px)', left: 'clamp(36px, 3.5vw, 54px)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '22px' }}>
        <Link to="/candidates" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: MUTED, fontSize: '0.88rem', fontWeight: '600', textDecoration: 'none' }}>← Trang ứng viên</Link>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', color: INK }}>next please</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: RED }}>:</span>
        </Link>
      </div>

      {/* CENTER — band + checklist */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(36px, 3.5vw, 54px)' }}>
        <div style={{ background: RED, borderRadius: '24px', padding: 'clamp(20px, 2.2vw, 30px) clamp(22px, 2.4vw, 38px)', textAlign: 'center', marginBottom: '32px', boxShadow: '0 18px 44px rgba(229,83,63,0.22)' }}>
          <h1 style={{ fontSize: 'clamp(1.35rem, 1.85vw, 1.85rem)', fontWeight: '800', lineHeight: 1.25, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
            Công cụ <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>MIỄN PHÍ</span> để dựng hồ sơ năng lực của bạn!
          </h1>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                <CheckBadge />
                <span style={{ fontSize: '1.02rem', fontWeight: '700', color: INK }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* marquee — pinned bottom */}
      <div style={{ position: 'absolute', bottom: 'clamp(30px, 3vw, 44px)', left: 0, right: 0, zIndex: 2 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.04em', color: RED, margin: '0 0 20px', textAlign: 'center' }}>Được tin dùng bởi:</p>
        <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
          <div className="np-auth-mq" style={{ display: 'flex', width: 'max-content' }}>
            <div className="np-auth-mq-group">{partners.map((p) => <Logo key={`a-${p.name}`} p={p} />)}</div>
            <div className="np-auth-mq-group" aria-hidden="true">{partners.map((p) => <Logo key={`b-${p.name}`} p={p} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
