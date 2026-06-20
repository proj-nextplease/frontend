import { Link } from 'react-router-dom';

const INK = '#1d1320';
const RED = '#e5533f';
const PLUM = '#1e1320';
const WHITE = '#ffffff';

const skills = ['Figma', 'React', 'Sự kiện'];

/**
 * Dense, premium auth side panel: pinned chrome (back + wordmark) at top,
 * a centered focal card cluster (profile + floating rating/verified cards + glow),
 * and a short testimonial at the bottom. `animation` is a keyframe name the
 * host page defines (npBrandInL / npBrandInR); `npFloat` must also exist there.
 */
export function AuthBrandPanel({ animation, headline, subcopy }) {
  return (
    <div className="np-auth-brand" style={{ position: 'relative', overflow: 'hidden', background: PLUM, color: WHITE, padding: 'clamp(40px, 4vw, 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: `${animation} 0.7s cubic-bezier(0.22,1,0.36,1) both` }}>
      {/* soft focal glow */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '30%', left: '8%', width: '460px', height: '460px', background: 'radial-gradient(circle, rgba(229,83,63,0.20), transparent 62%)', filter: 'blur(24px)', zIndex: 0, pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '-10%', right: '-8%', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* top chrome */}
      <div style={{ position: 'absolute', top: 'clamp(34px, 4vw, 52px)', left: 'clamp(40px, 4vw, 60px)', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '26px' }}>
        <Link to="/candidates" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', fontWeight: '600', textDecoration: 'none' }}>← Trang ứng viên</Link>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', color: WHITE }}>next please</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: RED }}>:</span>
        </Link>
      </div>

      {/* center composition */}
      <div style={{ position: 'relative', zIndex: 3, maxWidth: '30rem' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: '0 0 14px' }}>Reputation passport</p>
        <h1 style={{ fontSize: 'clamp(1.9rem, 2.7vw, 2.8rem)', fontWeight: '800', lineHeight: 1.04, letterSpacing: '-0.035em', margin: '0 0 16px' }}>
          {headline}<span style={{ color: RED }}>.</span>
        </h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0 0 40px', maxWidth: '23rem' }}>{subcopy}</p>

        {/* card cluster */}
        <div style={{ position: 'relative', width: '300px' }}>
          {/* floating: verified pill */}
          <div style={{ position: 'absolute', left: '-22px', top: '-18px', zIndex: 4, background: WHITE, color: INK, borderRadius: '999px', padding: '8px 14px', boxShadow: '0 14px 30px rgba(0,0,0,0.3)', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap', animation: 'npFloat 4.6s ease-in-out 0.2s infinite alternate' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke={WHITE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            Proof đã xác minh
          </div>

          {/* main profile card */}
          <div style={{ position: 'relative', zIndex: 3, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: RED, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem' }}>PT</span>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem' }}>phat280405</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>Tech Lead · FPTU HCM</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {[{ n: '82', l: 'RS' }, { n: '5', l: 'Level' }, { n: '1.2k', l: 'EXP' }].map((t) => (
                <div key={t.l} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '11px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: WHITE, lineHeight: 1 }}>{t.n}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: '4px' }}>{t.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {skills.map((s) => (
                <span key={s} style={{ fontSize: '0.74rem', fontWeight: '600', color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px 10px' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* floating: rating card */}
          <div style={{ position: 'absolute', right: '-34px', bottom: '-30px', zIndex: 4, background: WHITE, color: INK, borderRadius: '16px', padding: '13px 16px', boxShadow: '0 18px 38px rgba(0,0,0,0.32)', animation: 'npFloat 4s ease-in-out 0s infinite alternate' }}>
            <div style={{ display: 'flex', gap: '2px', marginBottom: '5px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} width="16" height="16" viewBox="0 0 24 24" fill={RED} aria-hidden="true"><path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.6l-4.6 1.7.9-5.1-3.8-3.7 5.2-.8z" /></svg>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: INK }}>Đánh giá 5 sao · <span style={{ color: '#1f7a4d' }}>+2.000 NP</span></div>
          </div>
        </div>
      </div>

      {/* footer testimonial */}
      <div style={{ position: 'absolute', bottom: 'clamp(30px, 3vw, 46px)', left: 'clamp(40px, 4vw, 60px)', right: 'clamp(40px, 4vw, 60px)', zIndex: 5 }}>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.62)', margin: '0 0 8px', fontStyle: 'italic', maxWidth: '24rem' }}>
          “Một hồ sơ duy nhất, đi đâu cũng được công nhận.”
        </p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Minh Anh · Sinh viên Marketing</p>
      </div>
    </div>
  );
}
