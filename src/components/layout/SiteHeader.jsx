import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, House, BriefcaseBusiness, MessagesSquare, FileText, FileSignature,
  Compass, Bookmark, ClipboardCheck, WalletCards, ChevronDown, LogOut,
} from 'lucide-react';
import { Button } from '../astryx/Button.jsx';
import { useAuthModal } from '../../context/AuthModalContext.jsx';
import { getStoredToken } from '../../lib/authStorage.js';
import { logout } from '../../api/httpClient.js';
import { UserAvatar } from '../UserAvatar.jsx';
import { clearMyProfileCache, useMyProfile } from '../../lib/useMyProfile.js';
import { supabase } from '../../services/supabaseClient.js';

/**
 * Shared emerald header (nextplease). Sticky white bar with centred nav +
 * recruiter link — identical across the landing pages so the chrome stays
 * consistent (Trang chủ / Việc làm / Thảo luận / Tạo portfolio).
 *
 * Đây là vỏ duy nhất cho cả khách vãng lai lẫn người đã đăng nhập: nav giữ
 * nguyên, chỉ góc phải đổi giữa nút "Đăng nhập" và menu tài khoản. Nhờ vậy
 * đăng nhập xong vẫn ở lại đúng trang đang xem thay vì bị đá vào dashboard.
 */

const TEAL = '#0d9488';
const EMERALD = '#10b981';
const INK = '#0f2e2b';
const LINE = '#e2efe9';
const MINT = '#e7f7f0';
const MUTED = '#5b7772';

const INNER = { width: 'min(1400px, calc(100% - 40px))', margin: '0 auto' };

export function SiteHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { openLoginModal } = useAuthModal();

  // Hồ sơ dùng chung (cache theo phiên) — cùng nguồn với ô soạn bài Thảo Luận.
  const { profile: portfolio, signedIn: hasToken } = useMyProfile();
  const [sessionSignedIn, setSessionSignedIn] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Trước khi Supabase trả lời thì tin vào token đang lưu, để avatar không nháy.
  const signedIn = sessionSignedIn ?? hasToken;
  const menuRef = useRef(null);

  const handlePortfolioClick = (e) => {
    if (!getStoredToken()) {
      e.preventDefault();
      openLoginModal('candidate');
    }
  };

  // Theo dõi phiên Supabase để menu tắt ngay khi phiên hết hạn ở tab khác.
  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSessionSignedIn(Boolean(data.session));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setSessionSignedIn(Boolean(session));
      if (!session) clearMyProfileCache();
    });

    return () => { alive = false; subscription?.unsubscribe(); };
  }, []);

  // Đóng menu khi bấm ra ngoài hoặc chuyển trang.
  useEffect(() => {
    function onPointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logout();
    } finally {
      clearMyProfileCache();
      setSessionSignedIn(false);
      navigate('/');
    }
  }

  const closeMenu = () => setMenuOpen(false);

  const displayName = portfolio?.name?.trim() || 'Ứng viên';
  const portfolioPath = portfolio?.onboardingCompleted ? '/portfolio/edit' : '/portfolio';

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const homeActive = pathname === '/';
  const jobsActive = pathname === '/jobs';
  const discussionActive = pathname === '/thao-luan';
  const cvActive = pathname === '/tao-cv';

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
        .nph-brand { display: inline-flex; align-items: baseline; text-decoration: none; justify-self: start; font-family: 'Fredoka', 'Baloo 2', cursive, sans-serif; transition: opacity 0.15s ease, transform 0.15s ease; }
        .nph-brand:hover { opacity: 0.88; transform: scale(1.02); }
        .nph-navlinks { display: flex; align-items: center; gap: 26px; justify-self: center; }
        .nph-actions { display: flex; align-items: center; gap: 20px; justify-self: end; }
        .nph-nav-cta { display: none; }
        @media (min-width: 760px) { .nph-nav-cta { display: inline-flex; } }

        /* Menu tài khoản */
        .nph-acct { position: relative; }
        .nph-acct-btn { display: inline-flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px; border: 1px solid transparent; border-radius: 999px; background: transparent; cursor: pointer; transition: background 0.18s ease, border-color 0.18s ease; }
        .nph-acct-btn:hover, .nph-acct-btn[aria-expanded="true"] { background: ${MINT}; border-color: ${LINE}; }
        .nph-acct-caret { color: ${MUTED}; transition: transform 0.22s ease; }
        .nph-acct-btn[aria-expanded="true"] .nph-acct-caret { transform: rotate(180deg); }

        .nph-menu { position: absolute; top: calc(100% + 10px); right: 0; min-width: 260px; padding: 8px; background: #fff; border: 1px solid ${LINE}; border-radius: 16px; box-shadow: 0 18px 44px rgba(15,46,43,0.16); animation: nphMenuIn 0.16s ease-out; }
        @keyframes nphMenuIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .nph-menu-head { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px 12px; }
        .nph-menu-name { font-size: 0.95rem; font-weight: 800; color: ${INK}; }
        .nph-menu-sub { font-size: 0.8rem; color: ${MUTED}; }
        .nph-menu-np { display: inline-flex; align-items: center; gap: 5px; margin-top: 5px; padding: 3px 9px; border-radius: 999px; background: ${MINT}; color: ${TEAL}; font-size: 0.78rem; font-weight: 800; width: fit-content; }
        .nph-menu-sep { height: 1px; margin: 4px 6px; background: ${LINE}; }
        .nph-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: none; border-radius: 10px; background: transparent; color: ${INK}; font-size: 0.9rem; font-weight: 600; text-align: left; text-decoration: none; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
        .nph-menu-item:hover { background: ${MINT}; color: ${TEAL}; }
        .nph-menu-item.danger { color: #b91c1c; }
        .nph-menu-item.danger:hover { background: #fef2f2; color: #b91c1c; }
        @media (max-width: 1139px) {
          .nph-nav { grid-template-columns: auto 1fr; }
          .nph-navlinks, .nph-nav-recruiter { display: none !important; }
        }
      `}</style>
      <div style={{ ...INNER }}>
        <nav className="nph-nav">
          <Link to="/" className="nph-brand">
            <span style={{ fontSize: '1.65rem', fontWeight: '700', letterSpacing: '-0.01em', color: '#059669', fontFamily: "'Fredoka', 'Baloo 2', cursive, sans-serif" }}>nextplease</span>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: '#f59e0b', fontFamily: "'Fredoka', 'Baloo 2', cursive, sans-serif" }}>:</span>
          </Link>
          <div className="nph-navlinks">
            <Link to="/" className={`nph-navlink${homeActive ? ' active' : ''}`}><House size={17} /> Trang chủ</Link>
            <Link to="/jobs" className={`nph-navlink${jobsActive ? ' active' : ''}`}><BriefcaseBusiness size={17} /> Việc làm</Link>
            <Link to="/thao-luan" className={`nph-navlink${discussionActive ? ' active' : ''}`}><MessagesSquare size={17} /> Thảo luận</Link>
            <Link to="/portfolio" className="nph-navlink" onClick={handlePortfolioClick}><FileText size={17} /> Tạo portfolio</Link>
            <Link to="/tao-cv" className={`nph-navlink${cvActive ? ' active' : ''}`}><FileSignature size={17} /> Tạo CV</Link>
          </div>
          <div className="nph-actions">
            <Link to="/businesses" target="_blank" rel="noopener noreferrer" className="nph-navlink nph-nav-recruiter">Dành cho nhà tuyển dụng</Link>
            {signedIn ? (
              <div className="nph-acct" ref={menuRef}>
                <button
                  type="button"
                  className="nph-acct-btn"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Menu tài khoản"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <UserAvatar src={portfolio?.avatarUrl} name={displayName} size={34} />
                  <ChevronDown size={16} className="nph-acct-caret" />
                </button>

                {menuOpen && (
                  <div className="nph-menu" role="menu">
                    <div className="nph-menu-head">
                      <span className="nph-menu-name">{displayName}</span>
                      <span className="nph-menu-sub">{portfolio?.school || 'Chưa cập nhật trường học'}</span>
                      <span className="nph-menu-np">
                        <WalletCards size={13} />
                        {(portfolio?.npBalance ?? 0).toLocaleString('vi-VN')} NP
                      </span>
                    </div>
                    <div className="nph-menu-sep" />

                    <Link className="nph-menu-item" role="menuitem" onClick={closeMenu} to="/candidates/dashboard/overview">
                      <Compass size={16} /> Khu vực của tôi
                    </Link>
                    <Link className="nph-menu-item" role="menuitem" onClick={closeMenu} to={portfolioPath}>
                      <FileText size={16} /> Portfolio của tôi
                    </Link>
                    <Link className="nph-menu-item" role="menuitem" onClick={closeMenu} to="/candidates/dashboard/opportunities?saved=1">
                      <Bookmark size={16} /> Việc đã lưu
                    </Link>
                    <Link className="nph-menu-item" role="menuitem" onClick={closeMenu} to="/candidates/dashboard/my_applications">
                      <ClipboardCheck size={16} /> Việc đã nộp
                    </Link>

                    <div className="nph-menu-sep" />
                    <button type="button" role="menuitem" className="nph-menu-item danger" onClick={handleLogout}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                className="nph-nav-cta"
                label="Đăng nhập"
                clickAction={() => openLoginModal('candidate')}
                variant="primary"
                size="sm"
                style={{ background: TEAL, border: 'none', fontWeight: 800, cursor: 'pointer' }}
                endContent={<ArrowRight size={15} />}
              />
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
