import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, House, BriefcaseBusiness, MessagesSquare, FileText } from 'lucide-react';
import { Button } from '../astryx/Button.jsx';

/**
 * Shared emerald marketing header (nextplease). Sticky white bar with centred
 * nav + recruiter link + login CTA — identical across the landing pages so the
 * chrome stays consistent (Trang chủ / Việc làm / Thảo luận / Tạo portfolio).
 */

const TEAL = '#0d9488';
const EMERALD = '#10b981';
const INK = '#0f2e2b';
const LINE = '#e2efe9';
const MINT = '#e7f7f0';

const INNER = { width: 'min(1400px, calc(100% - 40px))', margin: '0 auto' };

export function SiteHeader() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const homeActive = pathname === '/';
  const jobsActive = pathname === '/jobs';

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100, width: '100%',
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)',
      borderBottom: `1px solid ${LINE}`,
      boxShadow: scrolled ? '0 6px 24px rgba(13,148,136,0.08)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      <style>{`
        .nph-navlink { position: relative; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 0.95rem; font-weight: 600; color: ${INK}; text-decoration: none; padding: 4px 0; transition: color 0.2s ease; }
        .nph-navlink::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 2px; width: 100%; background: ${EMERALD}; transform: scaleX(0); transform-origin: left; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1); }
        .nph-navlink:hover { color: ${TEAL}; }
        .nph-navlink:hover::after { transform: scaleX(1); }
        .nph-navlink.active { background: ${MINT}; color: ${TEAL}; border-radius: 999px; padding: 7px 14px; font-weight: 800; }
        .nph-navlink.active::after { display: none; }
        .nph-nav { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; height: 68px; }
        .nph-brand { display: inline-flex; align-items: baseline; text-decoration: none; justify-self: start; }
        .nph-navlinks { display: flex; align-items: center; gap: 26px; justify-self: center; }
        .nph-actions { display: flex; align-items: center; gap: 20px; justify-self: end; }
        .nph-nav-cta { display: none; }
        @media (min-width: 760px) { .nph-nav-cta { display: inline-flex; } }
        @media (max-width: 1139px) {
          .nph-nav { grid-template-columns: auto 1fr; }
          .nph-navlinks, .nph-nav-recruiter { display: none !important; }
        }
      `}</style>
      <div style={{ ...INNER }}>
        <nav className="nph-nav">
          <Link to="/" className="nph-brand">
            <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em', color: INK }}>nextplease</span>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', color: EMERALD }}>:</span>
          </Link>
          <div className="nph-navlinks">
            <Link to="/" className={`nph-navlink${homeActive ? ' active' : ''}`}><House size={17} /> Trang chủ</Link>
            <Link to="/jobs" className={`nph-navlink${jobsActive ? ' active' : ''}`}><BriefcaseBusiness size={17} /> Việc làm</Link>
            <Link to="/#thao-luan" className="nph-navlink"><MessagesSquare size={17} /> Thảo luận</Link>
            <Link to="/portfolio" className="nph-navlink"><FileText size={17} /> Tạo portfolio</Link>
          </div>
          <div className="nph-actions">
            <Link to="/businesses" className="nph-navlink nph-nav-recruiter">Dành cho nhà tuyển dụng</Link>
            <Button className="nph-nav-cta" label="Đăng nhập" href="/candidate/login" variant="primary" size="sm" style={{ background: TEAL, border: 'none', fontWeight: 800 }} endContent={<ArrowRight size={15} />} />
          </div>
        </nav>
      </div>
    </div>
  );
}
