import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, House, BriefcaseBusiness, MessagesSquare, FileText, Menu, X, Building2,
  Compass, WalletCards, ChevronDown, LogOut,
} from 'lucide-react';
import { useAuthModal } from '../../context/AuthModalContext.jsx';
import { logout } from '../../api/httpClient.js';
import { UserAvatar } from '../UserAvatar.jsx';
import { clearMyProfileCache, useMyProfile } from '../../lib/useMyProfile.js';
import { resetSavedJobs } from '../../lib/savedJobs.js';
import { supabase } from '../../services/supabaseClient.js';

/**
 * Thanh điều hướng dùng chung (nextplease) — thanh nổi kiểu Handshake.
 *
 * Hiệu ứng khi cuộn (đo trực tiếp từ joinhandshake.com):
 *   - Thanh KHÔNG bao giờ ẩn đi; nó luôn nổi cách mép trên 24px.
 *   - Vừa rời khỏi đỉnh trang, thanh **co lại** từ trọn bề ngang về 1024px,
 *     nền mờ dần thành trắng đục, và chữ đổi từ trắng sang đen.
 *   - Cùng lúc đó **logo chữ biến thành logo vuông**: chữ "nextplease:" thu
 *     width về 0 + scale(0), ô vuông thương hiệu nở từ scale(0) lên 40px.
 *   - Hai nút phải cũng đảo màu: "Đăng nhập" viền theo màu chữ hiện tại, nút
 *     chính từ emerald-trên-nền-tối sang đen-chữ-trắng.
 * Tất cả chạy cùng một nhịp ~420ms, nên nhìn như một khối co lại chứ không
 * phải vài thứ rời rạc đổi cùng lúc.
 *
 * Prop `overlay`: trang có hero nền tối (trang chủ) truyền `overlay` để thanh
 * trong suốt + chữ trắng khi ở đỉnh và nằm đè lên hero. Các trang nền sáng để
 * mặc định — thanh luôn đặc, chỉ còn hiệu ứng co lại khi cuộn.
 *
 * Prop `pinned={false}`: thanh cuộn trôi theo trang thay vì bám mép trên. Dùng
 * cho trang có thanh công cụ riêng cần bám (ví dụ bộ lọc ở /jobs) — hai thanh
 * cùng dính thì chồng lên nhau và ăn mất một phần ba màn hình. Khi đó hiệu ứng
 * co-lại-khi-cuộn cũng tắt luôn: thanh đã trôi khỏi màn hình rồi thì không có
 * gì để co, mà vẫn chạy thì tốn một listener scroll vô ích.
 */

const EMERALD = '#10b981';
const TEAL = '#0d9488';
const INK = '#0b0f0e';
const ON_LIGHT = '#252630';   // màu chữ khi thanh đã đặc
const LINE = '#e2efe9';
const MINT = '#e7f7f0';
const MUTED = '#5b7772';

/* Bề ngang thanh sau khi co lại — Handshake dùng đúng 64rem. */
const CONDENSED_WIDTH = 1024;
/* Khoảng cách thanh chừa hai bên khi chưa cuộn. */
const SHELL_GUTTER = 48;

export function SiteHeader({ overlay = false, pinned = true }) {
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
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Bề ngang khả dụng của thanh, đo bằng ResizeObserver.
     Phải là số px thật thì `width` mới nội suy mượt được khi co lại —
     nếu để `100%` → `1024px` thì trình duyệt không nội suy, thanh sẽ giật một
     nhịp. Đây cũng đúng là cách trang mẫu làm (họ ghi width bằng JS). */
  const shellRef = useRef(null);
  const [shellWidth, setShellWidth] = useState(() => (
    typeof window === 'undefined' ? CONDENSED_WIDTH : Math.max(0, window.innerWidth - SHELL_GUTTER)
  ));

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return undefined;
    // ResizeObserver bắn một lần ngay khi observe, nên không cần đo thủ công.
    const observer = new ResizeObserver(() => setShellWidth(el.getBoundingClientRect().width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pinned) return undefined;
    // Ngưỡng 8px: trang mẫu đổi trạng thái ngay khi rời khỏi đỉnh, không chờ.
    function onScroll() { setScrolled(window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pinned]);

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

  // Đóng menu khi bấm ra ngoài.
  useEffect(() => {
    function onPointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);

    /* THỨ TỰ Ở ĐÂY QUAN TRỌNG: dọn sạch và RỜI TRANG TRƯỚC, gọi logout() sau.
       Bản trước `await logout()` rồi mới navigate('/'), và người dùng luôn bị
       ném về /candidate/login chứ không về trang chủ. Lý do: signOut() của
       Supabase phát sự kiện SIGNED_OUT ngay trong lúc await, mà
       ProtectedDashboardRoute có listener onAuthStateChange — nó setSession(null),
       render lại, gặp `if (!session)` và trả về <Navigate to="/candidate/login"
       replace />. Chuyển hướng đó xảy ra TRƯỚC khi khối finally kịp chạy, và
       nó gỡ luôn cả header này khỏi cây, nên navigate('/') không còn tác dụng.

       Guard đó đúng với việc nó sinh ra để làm: chặn người CHƯA đăng nhập đi
       vào dashboard. Nhưng người vừa bấm Đăng xuất không phải hạng đó — họ có
       chủ đích và có đích đến riêng. Rời trang trước thì dashboard gỡ bỏ,
       listener huỷ đăng ký, và guard không bao giờ chạy. */
    clearMyProfileCache();
    // Kho "việc đã lưu" là bộ nhớ trong module, sống qua cả lần đăng xuất.
    // Không dọn thì tài khoản đăng nhập sau sẽ thấy tim của tài khoản trước.
    resetSavedJobs();
    setSessionSignedIn(false);
    navigate('/');

    /* GIỮ TOKEN cho tới khi logout() chạy xong. logout() gọi POST /auth/logout
       để thu hồi phiên phía server và ghi audit log — xoá token trước thì
       request đó đi tay không, server trả 401, và bản ghi thu hồi không bao
       giờ được tạo. Token được dọn ngay sau đó: logout() tự clearStoredAuth()
       trong finally, và listener onAuthStateChange ở httpClient cũng dọn khi
       nhận SIGNED_OUT. */
    logout().catch(() => { /* logout() đã tự nuốt lỗi và dọn local state */ });
  }

  const closeMobile = () => setMobileOpen(false);

  const displayName = portfolio?.name?.trim() || 'Ứng viên';

  const homeActive = pathname === '/';
  const jobsActive = pathname === '/jobs';
  const discussionActive = pathname === '/thao-luan';
  const portfolioActive = pathname === '/tao-portfolio';
  const myAreaActive = pathname.startsWith('/candidates/dashboard');

  /* Ba trạng thái dẫn xuất — tất cả hiệu ứng đều treo vào hai biến này. */
  const onDark = overlay && !scrolled;   // chữ trắng, nền trong suốt
  const condensed = scrolled;            // đã co lại + logo thành ô vuông

  const pillWidth = condensed ? Math.min(CONDENSED_WIDTH, shellWidth) : shellWidth;

  return (
    <>
      <div
        className="nph-shell"
        data-mode={onDark ? 'ondark' : 'onlight'}
        data-pinned={pinned ? 'true' : 'false'}
      >
        <style>{`
          /* ── Vỏ cố định ──
             Không dùng sticky: thanh phải nổi tách khỏi mép trên và đè lên hero
             nền tối, nên nó là một lớp fixed riêng. pointer-events chỉ bật lại ở
             chính viên thuốc để phần trống hai bên không chặn click vào trang. */
          .nph-shell {
            position: fixed; inset-inline: 0; top: clamp(12px, 1.8vw, 24px);
            z-index: 100; display: flex; justify-content: center;
            pointer-events: none;
            transition: top 300ms ease-in-out;
          }
          /* Không ghim: thanh trôi theo trang. Cần phần tử cha có position để
             neo — trang dùng chế độ này phải tự đặt position: relative. */
          .nph-shell[data-pinned="false"] { position: absolute; }
          .nph-shell-inner {
            position: relative; display: flex; flex-direction: column; align-items: center;
            width: calc(100% - ${SHELL_GUTTER}px); max-width: 1440px;
          }

          /* ── Viên thuốc điều hướng ──
             width do JS đặt bằng px nên co lại mượt; nền và màu chữ chạy cùng
             một nhịp để cả khối cảm giác như một chuyển động duy nhất. */
          .nph-pill {
            pointer-events: auto; box-sizing: border-box;
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            height: 56px; padding: 0 8px; border-radius: 16px;
            border: 1px solid transparent;
            transition: width 420ms cubic-bezier(0.22,1,0.36,1),
                        background-color 420ms ease,
                        border-color 420ms ease,
                        box-shadow 420ms ease,
                        color 260ms ease;
          }
          .nph-shell[data-mode="ondark"] .nph-pill {
            background-color: rgba(255,255,255,0); color: #fff;
          }
          .nph-shell[data-mode="onlight"] .nph-pill {
            background-color: #fff; color: ${ON_LIGHT};
            border-color: rgba(11,15,14,0.07);
            box-shadow: 0 10px 30px rgba(11,15,14,0.10);
          }

          /* ── Logo biến hình ──
             Hai lớp chồng nhau trong một ô có width co giãn: chữ thu về 0 rồi
             ô vuông nở ra. Cùng đường cong với viên thuốc nên hai chuyển động
             khớp nhau. */
          .nph-brand { pointer-events: auto; display: inline-flex; align-items: center; flex: none; margin-left: 8px; text-decoration: none; }
          .nph-brand-swap { position: relative; display: block; height: 40px; transition: width 420ms cubic-bezier(0.22,1,0.36,1); }
          .nph-brand-layer {
            position: absolute; left: 0; top: 0; height: 40px;
            display: flex; align-items: center; transform-origin: left center; white-space: nowrap;
            transition: opacity 260ms ease, transform 420ms cubic-bezier(0.22,1,0.36,1);
          }
          .nph-brand-word { font-family: 'Fredoka', 'Baloo 2', cursive, sans-serif; font-size: 1.62rem; letter-spacing: -0.01em; }
          .nph-brand-word i { font-style: normal; font-weight: 700; color: #059669; }
          .nph-shell[data-mode="ondark"] .nph-brand-word i { color: ${EMERALD}; }
          .nph-brand-word b { font-style: normal; font-weight: 800; color: #f59e0b; }
          .nph-brand-mark {
            width: 40px; height: 40px; border-radius: 12px; background: ${EMERALD};
            align-items: center; justify-content: center;
            font-family: 'Fredoka', 'Baloo 2', cursive, sans-serif; font-size: 1.35rem; font-weight: 700;
            color: ${INK}; line-height: 1;
          }

          /* ── Liên kết điều hướng ──
             14px / weight 500, bo 8px, hover là một mảng nền mờ theo màu chữ
             hiện tại — giống hệt trang mẫu, không còn gạch chân trượt. */
          .nph-navlinks { display: flex; align-items: center; gap: 2px; }
          .nph-navlink {
            display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
            font-size: 0.875rem; font-weight: 500; text-decoration: none; color: inherit;
            padding: 10px 16px; border-radius: 8px;
            transition: background-color 300ms ease, color 260ms ease;
          }
          .nph-shell[data-mode="ondark"] .nph-navlink:hover { background-color: rgba(255,255,255,0.14); }
          .nph-shell[data-mode="onlight"] .nph-navlink:hover { background-color: rgba(11,15,14,0.06); }
          .nph-navlink.active { font-weight: 700; }
          .nph-shell[data-mode="ondark"] .nph-navlink.active { background-color: rgba(255,255,255,0.16); }
          .nph-shell[data-mode="onlight"] .nph-navlink.active { background-color: ${MINT}; color: ${TEAL}; }

          .nph-actions { display: flex; align-items: center; gap: 8px; flex: none; }
          /* Vạch ngăn dùng currentColor nên tự đổi theo trạng thái sáng/tối
             của thanh, không phải khai báo hai lần. */
          .nph-actions-sep { width: 1px; height: 20px; flex: none; background: currentColor; opacity: 0.2; margin: 0 4px; }

          /* ── Hai nút bên phải ── */
          .nph-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            height: 40px; padding: 0 16px; border-radius: 8px; cursor: pointer;
            font-family: inherit; font-size: 0.875rem; font-weight: 500; white-space: nowrap;
            text-decoration: none; border: 1px solid transparent;
            transition: background-color 300ms ease, color 260ms ease, border-color 300ms ease;
          }
          .nph-btn-ghost { background: transparent; border-color: currentColor; color: inherit; }
          .nph-shell[data-mode="ondark"] .nph-btn-ghost:hover { background-color: rgba(255,255,255,0.14); }
          .nph-shell[data-mode="onlight"] .nph-btn-ghost:hover { background-color: rgba(11,15,14,0.06); }
          .nph-shell[data-mode="ondark"] .nph-btn-solid { background-color: ${EMERALD}; color: ${INK}; }
          .nph-shell[data-mode="ondark"] .nph-btn-solid:hover { background-color: #34d399; }
          .nph-shell[data-mode="onlight"] .nph-btn-solid { background-color: ${ON_LIGHT}; color: #fff; }
          .nph-shell[data-mode="onlight"] .nph-btn-solid:hover { background-color: ${INK}; }

          /* Dưới 1140px giấu nav + link nhà tuyển dụng, nhường chỗ cho nút ☰. */
          @media (max-width: 1139px) {
            .nph-navlinks, .nph-nav-recruiter, .nph-actions-sep { display: none !important; }
          }
          /* Trên điện thoại chỉ còn logo + nút ☰ (đúng như trang mẫu): logo chữ
             172px cộng nút chính là tràn khỏi viên thuốc rộng ~327px. Lối đăng
             nhập/đăng ký vẫn còn nguyên trong ngăn ☰ bên dưới. */
          @media (max-width: 639px) {
            .nph-btn-solid { display: none !important; }
            .nph-brand-word { font-size: 1.4rem; }
          }

          /* ── Menu tài khoản ── */
          .nph-acct { position: relative; }
          .nph-acct-btn { display: inline-flex; align-items: center; gap: 6px; padding: 3px 6px 3px 3px; border: 1px solid transparent; border-radius: 999px; background: transparent; color: inherit; cursor: pointer; transition: background-color 0.18s ease; }
          .nph-shell[data-mode="ondark"] .nph-acct-btn:hover, .nph-shell[data-mode="ondark"] .nph-acct-btn[aria-expanded="true"] { background-color: rgba(255,255,255,0.14); }
          .nph-shell[data-mode="onlight"] .nph-acct-btn:hover, .nph-shell[data-mode="onlight"] .nph-acct-btn[aria-expanded="true"] { background-color: rgba(11,15,14,0.06); }
          .nph-acct-caret { transition: transform 0.22s ease; opacity: 0.7; }
          .nph-acct-btn[aria-expanded="true"] .nph-acct-caret { transform: rotate(180deg); }

          .nph-menu { position: absolute; top: calc(100% + 12px); right: 0; min-width: 260px; padding: 8px; background: #fff; color: ${ON_LIGHT}; border: 1px solid ${LINE}; border-radius: 16px; box-shadow: 0 18px 44px rgba(15,46,43,0.18); animation: nphMenuIn 0.18s cubic-bezier(0.22,1,0.36,1); }
          @keyframes nphMenuIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
          .nph-menu-head { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px 12px; }
          .nph-menu-name { font-size: 0.95rem; font-weight: 800; }
          .nph-menu-sub { font-size: 0.8rem; color: ${MUTED}; }
          .nph-menu-np { display: inline-flex; align-items: center; gap: 5px; margin-top: 5px; padding: 3px 9px; border-radius: 999px; background: ${MINT}; color: ${TEAL}; font-size: 0.78rem; font-weight: 800; width: fit-content; }
          .nph-menu-sep { height: 1px; margin: 4px 6px; background: ${LINE}; }
          .nph-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: none; border-radius: 10px; background: transparent; color: inherit; font-family: inherit; font-size: 0.9rem; font-weight: 600; text-align: left; text-decoration: none; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
          .nph-menu-item:hover { background: ${MINT}; color: ${TEAL}; }
          .nph-menu-item.danger { color: #b91c1c; }
          .nph-menu-item.danger:hover { background: #fef2f2; color: #b91c1c; }

          /* ── Nút ☰ và ngăn di động ── */
          .nph-burger { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: none; border-radius: 8px; border: 1px solid currentColor; background: transparent; color: inherit; cursor: pointer; transition: background-color 0.2s ease; }
          .nph-shell[data-mode="ondark"] .nph-burger:hover { background-color: rgba(255,255,255,0.14); }
          .nph-shell[data-mode="onlight"] .nph-burger:hover { background-color: rgba(11,15,14,0.06); }
          @media (min-width: 1140px) { .nph-burger { display: none; } }

          .nph-sheet {
            pointer-events: auto; width: 100%; margin-top: 10px; padding: 10px;
            background: #fff; color: ${ON_LIGHT}; border: 1px solid ${LINE}; border-radius: 16px;
            box-shadow: 0 22px 50px rgba(11,15,14,0.18);
            animation: nphSheetIn 0.26s cubic-bezier(0.22,1,0.36,1) both;
          }
          @keyframes nphSheetIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
          .nph-sheet-inner { display: grid; gap: 2px; }
          .nph-sheet-link { display: flex; align-items: center; gap: 11px; padding: 13px 14px; border-radius: 12px; font-size: 1rem; font-weight: 600; color: inherit; text-decoration: none; }
          .nph-sheet-link:hover, .nph-sheet-link.active { background: ${MINT}; color: ${TEAL}; }
          .nph-sheet-sep { height: 1px; margin: 8px 6px; background: ${LINE}; }
          .nph-sheet-cta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; padding: 14px; border-radius: 12px; border: none; background: ${ON_LIGHT}; color: #fff; font-family: inherit; font-size: 1rem; font-weight: 700; cursor: pointer; }
          @media (min-width: 1140px) { .nph-sheet { display: none; } }

          /* Chỗ trống thay cho thanh trên các trang không dùng chế độ đè. */
          .nph-spacer { height: calc(56px + clamp(12px, 1.8vw, 24px) + 16px); }

          @media (prefers-reduced-motion: reduce) {
            .nph-shell, .nph-pill, .nph-brand-swap, .nph-brand-layer, .nph-navlink, .nph-btn { transition: none !important; }
            .nph-sheet, .nph-menu { animation: none !important; }
          }
        `}</style>

        <div className="nph-shell-inner" ref={shellRef}>
          <div className="nph-pill" style={{ width: `${pillWidth}px` }}>
            {/* Logo: chữ ⇄ ô vuông. Hai lớp luôn ở trong DOM để crossfade được;
                ô bọc co width nên phần còn lại của thanh trượt theo mượt. */}
            <Link to="/" className="nph-brand" aria-label="nextplease — về trang chủ">
              <span className="nph-brand-swap" style={{ width: condensed ? '40px' : '172px' }}>
                <span
                  className="nph-brand-layer nph-brand-word"
                  aria-hidden={condensed}
                  style={{ opacity: condensed ? 0 : 1, transform: condensed ? 'scale(0)' : 'none' }}
                >
                  <i>nextplease</i><b>:</b>
                </span>
                <span
                  className="nph-brand-layer nph-brand-mark"
                  aria-hidden={!condensed}
                  style={{ display: 'flex', opacity: condensed ? 1 : 0, transform: condensed ? 'none' : 'scale(0)' }}
                >
                  n<b style={{ color: INK }}>:</b>
                </span>
              </span>
            </Link>

            <div className="nph-navlinks">
              <Link to="/" className={`nph-navlink${homeActive ? ' active' : ''}`}>Trang chủ</Link>
              <Link to="/jobs" className={`nph-navlink${jobsActive ? ' active' : ''}`}>Việc làm</Link>
              <Link to="/thao-luan" className={`nph-navlink${discussionActive ? ' active' : ''}`}>Thảo luận</Link>
              {/* Mục thứ tư đổi nhãn theo trạng thái đăng nhập: "Tạo portfolio"
                  là lời mời cho người chưa có, người đã đăng nhập thì cần lối
                  vào khu vực của mình. KHÔNG thêm mục thứ năm — dưới 1140px cả
                  thanh nav đã bị ẩn, thêm nữa sẽ đẩy ngưỡng đó lên cao hơn. */}
              {signedIn ? (
                <Link to="/candidates/dashboard/overview" className={`nph-navlink${myAreaActive ? ' active' : ''}`}>
                  Khu vực của tôi
                </Link>
              ) : (
                <Link to="/tao-portfolio" className={`nph-navlink${portfolioActive ? ' active' : ''}`}>
                  Tạo portfolio
                </Link>
              )}
            </div>

            <div className="nph-actions">
              {/* Lối sang phía doanh nghiệp không thuộc nhóm nav của ứng viên —
                  nó là "đổi vai", nên đứng tách hẳn sang cụm bên phải cạnh chỗ
                  đăng nhập, ngăn với nav bằng một vạch mảnh. */}
              <Link to="/businesses" target="_blank" rel="noopener noreferrer" className="nph-navlink nph-nav-recruiter">
                Nhà tuyển dụng
              </Link>
              <span className="nph-actions-sep" aria-hidden="true" />
              <button
                type="button"
                className="nph-burger"
                aria-expanded={mobileOpen}
                aria-controls="nph-mobile-sheet"
                aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? <X size={19} /> : <Menu size={19} />}
              </button>

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
                    <UserAvatar src={portfolio?.avatarUrl} name={displayName} size={32} />
                    <ChevronDown size={15} className="nph-acct-caret" />
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
                      <button type="button" role="menuitem" className="nph-menu-item danger" onClick={handleLogout}>
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" className="nph-btn nph-btn-solid" onClick={() => openLoginModal('candidate')}>
                  Đăng nhập
                </button>
              )}
            </div>
          </div>

          {mobileOpen && (
            <div className="nph-sheet" id="nph-mobile-sheet">
              <div className="nph-sheet-inner">
                <Link to="/" onClick={closeMobile} className={`nph-sheet-link${homeActive ? ' active' : ''}`}>
                  <House size={19} /> Trang chủ
                </Link>
                <Link to="/jobs" onClick={closeMobile} className={`nph-sheet-link${jobsActive ? ' active' : ''}`}>
                  <BriefcaseBusiness size={19} /> Việc làm
                </Link>
                <Link to="/thao-luan" onClick={closeMobile} className={`nph-sheet-link${discussionActive ? ' active' : ''}`}>
                  <MessagesSquare size={19} /> Thảo luận
                </Link>
                {signedIn ? (
                  <Link to="/candidates/dashboard/overview" onClick={closeMobile} className={`nph-sheet-link${myAreaActive ? ' active' : ''}`}>
                    <Compass size={19} /> Khu vực của tôi
                  </Link>
                ) : (
                  <Link to="/tao-portfolio" onClick={closeMobile} className={`nph-sheet-link${portfolioActive ? ' active' : ''}`}>
                    <FileText size={19} /> Tạo portfolio
                  </Link>
                )}

                <div className="nph-sheet-sep" />

                <Link to="/businesses" target="_blank" rel="noopener noreferrer" onClick={closeMobile} className="nph-sheet-link">
                  <Building2 size={19} /> Dành cho nhà tuyển dụng
                </Link>

                {!signedIn && (
                  <button
                    type="button"
                    className="nph-sheet-cta"
                    onClick={() => { closeMobile(); openLoginModal('candidate'); }}
                  >
                    Đăng nhập <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thanh là lớp fixed nên không chiếm chỗ; trang nền sáng cần một khoảng
          trống thay thế, còn trang có chế độ đè thì hero tự chui xuống dưới. */}
      {!overlay && <div className="nph-spacer" aria-hidden="true" />}
    </>
  );
}
