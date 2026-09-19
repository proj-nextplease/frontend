import { Link } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext.jsx';
import { getStoredToken } from '../../lib/authStorage.js';

/**
 * Shared marketing footer (nextplease) — brand blurb + product / trust columns
 * and a bottom legal row. Kept identical across the landing pages.
 */

const EMERALD = '#10b981';
const INK = '#0f2e2b';
const MUTED = '#5b7772';
const LINE = '#e2efe9';
const WHITE = '#ffffff';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

export function SiteFooter() {
  const { openLoginModal } = useAuthModal();

  const handlePortfolioClick = (e) => {
    if (!getStoredToken()) {
      e.preventDefault();
      openLoginModal('candidate');
    }
  };

  return (
    <footer style={{ background: WHITE, borderTop: `1px solid ${LINE}` }}>
      <div className="np-footer-grid" style={{ ...INNER, padding: '48px 20px 40px', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '24px' }}>
        <style>{`@media (max-width: 720px) { .np-footer-grid { grid-template-columns: 1fr 1fr !important; } .np-footer-grid > :first-child { grid-column: 1 / -1; } }`}</style>
        <div>
          <strong style={{ fontSize: '1.35rem', color: '#059669', fontFamily: "'Fredoka', 'Baloo 2', cursive, sans-serif", fontWeight: 700, letterSpacing: '-0.01em' }}>nextplease<span style={{ color: '#f59e0b', fontWeight: 800 }}>:</span></strong>
          <p style={{ fontSize: '0.9rem', color: MUTED, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '24rem' }}>
            Nền tảng reputation passport giúp sinh viên biến proof thật thành cơ hội nghề nghiệp đáng tin.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: INK, marginBottom: '4px' }}>Sản phẩm</span>
          <Link to="/jobs" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Việc làm</Link>
          <Link to="/portfolio" onClick={handlePortfolioClick} style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Tạo portfolio</Link>
          <Link to="/businesses" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Nhà tuyển dụng & CLB</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: INK, marginBottom: '4px' }}>Niềm tin hệ thống</span>
          <span style={{ fontSize: '0.9rem', color: MUTED }}>Verified Proof of Work</span>
          <span style={{ fontSize: '0.9rem', color: MUTED }}>Backend-owned RS / EXP / NP</span>
          <span style={{ fontSize: '0.9rem', color: MUTED }}>Audit-ready workflows</span>
        </div>
        <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${LINE}`, marginTop: '20px', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: MUTED }}>© 2026 next please</span>
          <div style={{ display: 'flex', gap: '18px' }}>
            <Link to="/terms" style={{ fontSize: '0.86rem', color: MUTED, textDecoration: 'none' }}>Điều khoản</Link>
            <Link to="/privacy" style={{ fontSize: '0.86rem', color: MUTED, textDecoration: 'none' }}>Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
