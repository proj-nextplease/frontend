import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const INK = 'var(--lp-ink)';
const MUTED = 'var(--lp-muted)';
const RED = 'var(--lp-red)';
const LINE = 'var(--lp-line)';
const INNER = { width: 'min(820px, calc(100% - 40px))', margin: '0 auto' };

/**
 * Shared layout for legal/policy pages (Terms, Privacy).
 * `sections` = [{ id, h, p: [paragraph | { list: [item] }] }]. Theme-aware via --lp-* tokens.
 */
export function LegalPageLayout({ eyebrow, title, updated, intro, sections }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: 'var(--lp-bg)', color: INK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100dvh', overflowX: 'clip', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", paddingBottom: '64px' }}>

      {/* Nav */}
      <div style={{ ...INNER, width: 'min(1180px, calc(100% - 40px))', paddingTop: '22px' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '14px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em', color: INK }}>nextplease</span>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', color: RED }}>:</span>
          </Link>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.94rem', fontWeight: '600', color: MUTED, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
        </nav>
      </div>

      <article style={{ ...INNER, paddingTop: 'clamp(24px, 5vw, 56px)' }}>
        <p style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase', color: RED, margin: '0 0 12px' }}>{eyebrow}</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', fontWeight: '800', letterSpacing: '-0.035em', lineHeight: 1.05, color: INK, margin: '0 0 12px' }}>{title}</h1>
        <p style={{ fontSize: '0.9rem', color: MUTED, margin: '0 0 28px' }}>Cập nhật lần cuối: {updated}</p>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: MUTED, margin: '0 0 16px' }}>{intro}</p>

        {/* Table of contents */}
        <nav style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: '18px 0', margin: '24px 0 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 24px' }}>
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} style={{ fontSize: '0.92rem', color: MUTED, textDecoration: 'none', display: 'flex', gap: '8px' }}>
              <span style={{ color: RED, fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
              {s.h}
            </a>
          ))}
        </nav>

        {sections.map((s, i) => (
          <section key={s.id} id={s.id} style={{ scrollMarginTop: '24px', marginBottom: '34px' }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', fontWeight: '800', letterSpacing: '-0.02em', color: INK, margin: '0 0 12px' }}>
              <span style={{ color: RED, marginRight: '10px', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
              {s.h}
            </h2>
            {s.p.map((block, bi) => (
              typeof block === 'string'
                ? <p key={bi} style={{ fontSize: '1rem', lineHeight: 1.75, color: MUTED, margin: '0 0 12px' }}>{block}</p>
                : (
                  <ul key={bi} style={{ margin: '0 0 12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {block.list.map((item, li) => (
                      <li key={li} style={{ fontSize: '1rem', lineHeight: 1.7, color: MUTED }}>{item}</li>
                    ))}
                  </ul>
                )
            ))}
          </section>
        ))}

        <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: '24px', marginTop: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/terms" style={{ fontSize: '0.92rem', color: RED, fontWeight: '700', textDecoration: 'none' }}>Điều khoản dịch vụ</Link>
          <Link to="/privacy" style={{ fontSize: '0.92rem', color: RED, fontWeight: '700', textDecoration: 'none' }}>Chính sách bảo mật</Link>
          <Link to="/" style={{ fontSize: '0.92rem', color: MUTED, fontWeight: '600', textDecoration: 'none' }}>Trang chủ</Link>
        </div>
      </article>
    </div>
  );
}
