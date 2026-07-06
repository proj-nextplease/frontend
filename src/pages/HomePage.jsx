import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Search, Quote } from 'lucide-react';
import { Button } from '../components/astryx/Button.jsx';

/* Wellfound palette, now theme-aware via CSS variables (see --lp-* in index.css). */
const INK = 'var(--lp-ink)';
const MUTED = 'var(--lp-muted)';
const RED = 'var(--lp-red)';
const PLUM = 'var(--lp-plum)';
const PINK = 'var(--lp-pink)';
const PINK_CARD = 'var(--lp-pink-card)';
const CREAM = 'var(--lp-cream)';
const MAUVE = 'var(--lp-mauve)';
const LINE = 'var(--lp-line)';
const WHITE = '#ffffff';          /* literal white, for text/elements that sit on dark fills */
const SURFACE = 'var(--lp-surface)'; /* page & card backgrounds that flip with the theme */

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

const stats = [
  { value: 2418, suffix: '+', label: 'ứng viên sinh viên' },
  { value: 186, suffix: '+', label: 'doanh nghiệp & CLB' },
  { value: 96, suffix: '%', label: 'proof được xác minh' },
];

/* Pills spread across the FULL viewport width (l = % of screen). */
const heroPills = [
  { label: 'Marketing', t: '20%', l: '6%', d: 0.06, faded: false },
  { label: 'Thiết kế', t: '34%', l: '2%', d: 0.04, faded: true },
  { label: 'Nội dung', t: '12%', l: '22%', d: 0.05, faded: true },
  { label: 'Tài chính', t: '64%', l: '5%', d: 0.07, faded: false },
  { label: 'Hà Nội', t: '78%', l: '15%', d: 0.05, faded: false },
  { label: 'Data', t: '48%', l: '12%', d: 0.05, faded: true },
  { label: 'Cyber Security', t: '30%', l: '17%', d: 0.06, faded: false },
  { label: 'Lập trình', t: '16%', l: '74%', d: 0.06, faded: false },
  { label: 'UI/UX', t: '10%', l: '88%', d: 0.04, faded: false },
  { label: 'Remote', t: '34%', l: '93%', d: 0.05, faded: true },
  { label: 'Sự kiện', t: '54%', l: '88%', d: 0.07, faded: false },
  { label: 'Freelance', t: '74%', l: '82%', d: 0.05, faded: false },
  { label: 'Thực tập', t: '80%', l: '60%', d: 0.06, faded: false },
  { label: 'TP. HCM', t: '70%', l: '47%', d: 0.04, faded: true },
  { label: 'Nhân sự', t: '20%', l: '55%', d: 0.05, faded: true },
  { label: 'Đà Nẵng', t: '42%', l: '85%', d: 0.04, faded: true },
  { label: 'Web3', t: '14%', l: '40%', d: 0.05, faded: true },
];

/* Two-tone illustrative glyphs (Wellfound-style): plum base + red accent */
function Svg({ children }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
/* stroke/fill via `style` so the CSS-variable colors resolve on SVG (var() is ignored in presentation attributes). */
const sInk = { stroke: INK };
const sRed = { stroke: RED };
const fRed = { fill: RED };
const GLYPHS = {
  badge: (
    <Svg>
      <path d="M12 3l7 2.5v5c0 4.2-3 7.8-7 9-4-1.2-7-4.8-7-9v-5z" style={sInk} strokeWidth="1.8" />
      <path d="M9 12l2 2 4-4" style={sRed} strokeWidth="1.8" />
    </Svg>
  ),
  trophy: (
    <Svg>
      <path d="M7 4h10v3.2a5 5 0 0 1-10 0z" style={sInk} strokeWidth="1.8" />
      <path d="M7 5H4.8a2.2 2.2 0 0 0 2.4 2.4M17 5h2.2a2.2 2.2 0 0 1-2.4 2.4" style={sInk} strokeWidth="1.8" />
      <path d="M12 12.2v3.3" style={sInk} strokeWidth="1.8" />
      <path d="M8.6 20h6.8l-1.1-3.6H9.7z" style={sRed} strokeWidth="1.8" />
    </Svg>
  ),
  apply: (
    <Svg>
      <path d="M6 4.2v12l3-2.6 1.9 4.2 2.1-1-1.9-4.1H15z" style={sInk} strokeWidth="1.8" />
      <path d="M17 6l1.7-1.7M18.6 11H21M17 16l1.7 1.7" style={sRed} strokeWidth="1.8" />
    </Svg>
  ),
  people: (
    <Svg>
      <circle cx="9.5" cy="8" r="3" style={sInk} strokeWidth="1.8" />
      <path d="M3.8 19c0-3.1 2.6-5 5.7-5s5.7 1.9 5.7 5" style={sInk} strokeWidth="1.8" />
      <circle cx="18" cy="9.5" r="2.4" style={sRed} strokeWidth="1.8" />
    </Svg>
  ),
  post: (
    <Svg>
      <rect x="3.5" y="4.5" width="17" height="4" rx="1.2" style={sInk} strokeWidth="1.8" />
      <rect x="3.5" y="11.5" width="5.5" height="8" rx="1.2" style={sRed} strokeWidth="1.8" />
      <line x1="12" y1="12.5" x2="20.5" y2="12.5" style={sInk} strokeWidth="1.8" />
      <line x1="12" y1="16" x2="20.5" y2="16" style={sInk} strokeWidth="1.8" />
      <line x1="12" y1="19.5" x2="20.5" y2="19.5" style={sInk} strokeWidth="1.8" />
    </Svg>
  ),
  star: (
    <Svg>
      <path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.6l-4.6 1.7.9-5.1-3.8-3.7 5.2-.8z" style={sInk} strokeWidth="1.8" />
      <circle cx="12" cy="11" r="1.7" style={fRed} />
    </Svg>
  ),
};

const seekerPoints = [
  { icon: GLYPHS.badge, text: 'Hồ sơ năng lực có kiểm chứng, thay CV tự khai bằng proof thật.' },
  { icon: GLYPHS.trophy, text: 'Tích EXP, lên Level, tăng uy tín (RS) qua từng hoạt động.' },
  { icon: GLYPHS.apply, text: 'Ứng tuyển việc làm và tham gia Quest CLB chỉ với một hồ sơ.' },
];

const hirerPoints = [
  { icon: GLYPHS.people, text: 'Tiếp cận nguồn sinh viên trẻ, sàng lọc theo proof và RS thật.' },
  { icon: GLYPHS.post, text: 'Đăng tin, đăng Quest và quản lý ứng viên trong một nơi.' },
  { icon: GLYPHS.star, text: 'Đánh giá và trao thưởng ứng viên sau khi hoàn thành công việc.' },
];

const proofFlow = [
  { step: '1', title: 'Tạo hồ sơ', desc: 'Thêm kỹ năng, hoạt động và trải nghiệm.' },
  { step: '2', title: 'Được xác nhận', desc: 'Tổ chức duyệt minh chứng công việc của bạn.' },
  { step: '3', title: 'Nhận cơ hội', desc: 'EXP và RS mở khóa việc làm phù hợp.' },
];

const testimonials = [
  { quote: 'Chúng tôi lọc ứng viên trẻ dựa trên bằng chứng công việc thật thay vì CV tự khai.', name: 'Hiring Partner', role: 'Doanh nghiệp tuyển dụng' },
  { quote: 'Sinh viên nhìn thấy lộ trình rõ ràng: proof, level, quest rồi tới cơ hội tiếp theo.', name: 'Campus Organizer', role: 'CLB / Tổ chức' },
  { quote: 'Một hồ sơ duy nhất, đi đâu cũng được công nhận. Mình thấy nỗ lực được ghi nhận.', name: 'phat280405', role: 'Ứng viên · FPTU HCM' },
];

function AnimatedStatNumber({ value, suffix, run }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!run) { setDisplay(0); return undefined; }
    const duration = 1400;
    const startedAt = performance.now();
    let frameId;
    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, run]);
  return <>{display.toLocaleString('vi-VN')}{suffix}</>;
}

const EYEBROW = { fontSize: '0.84rem', fontWeight: '800', letterSpacing: '-0.01em', color: INK, margin: '0 0 14px' };
const H2 = { fontSize: 'clamp(1.9rem, 3.6vw, 2.9rem)', fontWeight: '800', lineHeight: 1.05, letterSpacing: '-0.03em', color: INK, margin: 0 };

function FeatureRow({ icon, text, chipBg, chipColor }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%', background: chipBg, color: chipColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.55, color: INK, paddingTop: '10px' }}>{text}</p>
    </div>
  );
}

/* Scroll-reveal: fade + slide up when scrolled into view (Wellfound-style). */
function Reveal({ children, delay = 0, y = 32, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver((entries) => {
      setShown(entries[0].isIntersecting); // toggle both directions → animates on scroll up & down
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function HomePage() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const [statsRun, setStatsRun] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  /* Sticky nav: gain a backdrop blur + shadow once the user scrolls past the top. */
  useEffect(() => {
    function onScroll() { setNavScrolled(window.scrollY > 12); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Smooth animation engine: organic drift + lerped mouse parallax + scroll parallax. */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    // Respect users who prefer reduced motion: skip parallax + drift entirely.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const anchors = Array.from(hero.querySelectorAll('.np-anchor'));
    const items = anchors.map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth) || 0.04,
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.35,
      ampX: 6 + Math.random() * 12,
      ampY: 6 + Math.random() * 12,
    }));

    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    let scrollY = window.scrollY;

    function onMove(e) {
      const r = hero.getBoundingClientRect();
      targetX = e.clientX - (r.left + r.width / 2);
      targetY = e.clientY - (r.top + r.height / 2);
    }
    function onLeave() { targetX = 0; targetY = 0; }
    function onScroll() { scrollY = window.scrollY; }

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    const start = performance.now();
    let raf;
    function tick(now) {
      const t = (now - start) / 1000;
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      for (const it of items) {
        const driftX = Math.sin(t * it.speed + it.phase) * it.ampX;
        const driftY = Math.cos(t * it.speed * 0.85 + it.phase) * it.ampY;
        const px = curX * it.depth * 1.6;
        const py = curY * it.depth * 1.6;
        const sp = -scrollY * it.depth * 2.2; // scroll parallax (pills drift up at different speeds as you scroll)
        it.el.style.transform = `translate3d(${(driftX + px).toFixed(2)}px, ${(driftY + py + sp).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* Count-up stats when scrolled into view. */
  useEffect(() => {
    const node = statsRef.current;
    if (!node) return undefined;
    const obs = new IntersectionObserver((entries) => {
      setStatsRun(entries[0].isIntersecting); // re-count whenever it re-enters view
    }, { threshold: 0.4 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: 'var(--lp-bg)', color: INK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', overflowX: 'clip', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", paddingBottom: '48px' }}>

      {/* Global interaction + responsive styles for nav, CTAs and hero */}
      <style>{`
        .np-navlink { position: relative; font-size: 0.96rem; font-weight: 600; color: ${INK}; text-decoration: none; padding: 4px 0; transition: color 0.2s ease; }
        .np-navlink::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 2px; width: 100%; background: ${RED}; transform: scaleX(0); transform-origin: left; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1); }
        .np-navlink:hover { color: ${RED}; }
        .np-navlink:hover::after { transform: scaleX(1); }
        .np-cta { transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, background-color 0.2s ease, color 0.2s ease; will-change: transform; }
        .np-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(30,19,32,0.18); }
        .np-cta:active { transform: translateY(0) scale(0.98); box-shadow: 0 6px 14px rgba(30,19,32,0.14); }
        .np-cta-ghost:hover { background: ${PINK}; border-color: ${RED}; color: ${RED}; }
        :focus-visible { outline: 2px solid ${RED}; outline-offset: 3px; border-radius: 8px; }
        .np-nav-cta { display: none; }
        @media (min-width: 760px) { .np-nav-cta { display: inline-flex; } }
        @media (max-width: 759px) { .np-navlinks { display: none !important; } }
        .np-lift { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease; will-change: transform; }
        .np-lift:hover { transform: scale(1.035); box-shadow: 0 26px 50px rgba(30,19,32,0.16); }
        @media (prefers-reduced-motion: reduce) { .np-lift { transition: none; } .np-lift:hover { transform: none; } }
        @keyframes npHeroIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        .np-hero-in { animation: npHeroIn 0.8s cubic-bezier(0.22,1,0.36,1) both; }
        @media (max-width: 680px) { .np-anchor { display: none !important; } }
        @media (prefers-reduced-motion: reduce) {
          .np-hero-in { animation: none; }
          .np-pill, .np-cta, .np-navlink::after { transition: none !important; }
        }
      `}</style>

      {/* 0. NAV, sticky, blur-on-scroll, Wellfound-style */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, width: '100%',
        background: navScrolled ? 'var(--lp-nav-bg)' : 'transparent',
        backdropFilter: navScrolled ? 'saturate(180%) blur(12px)' : 'none',
        WebkitBackdropFilter: navScrolled ? 'saturate(180%) blur(12px)' : 'none',
        borderBottom: `1px solid ${navScrolled ? LINE : 'transparent'}`,
        boxShadow: navScrolled ? '0 6px 24px rgba(30,19,32,0.06)' : 'none',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{ ...INNER }}>
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em', color: INK }}>nextplease</span>
              <span style={{ fontSize: '1.45rem', fontWeight: '800', color: RED }}>:</span>
            </Link>
            <div className="np-navlinks" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <Link to="/candidates" className="np-navlink">Ứng viên</Link>
              <Link to="/businesses" className="np-navlink">Doanh nghiệp & CLB</Link>
              <a href="#about" className="np-navlink">Về chúng tôi</a>
            </div>
            <Button
              className="np-nav-cta"
              label="Đăng nhập"
              href="/candidate/login"
              variant="primary"
              size="sm"
              endContent={<ArrowRight size={15} />}
            />
          </nav>
        </div>
      </div>

      {/* 1. HERO, full-bleed floating pills */}
      <section
        ref={heroRef}
        style={{ position: 'relative', overflow: 'hidden', width: '100%', minHeight: 'clamp(540px, 74vh, 720px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <style>{`
          .np-anchor { position: absolute; will-change: transform; }
          .np-anchor:hover { z-index: 30; }
          .np-pill { display: inline-block; background: var(--lp-pill-bg); border: 1px solid var(--lp-pill-border); border-radius: 14px; padding: 11px 18px; font-weight: 700; font-size: clamp(0.8rem,1.3vw,1.02rem); color: var(--lp-ink); box-shadow: 0 14px 30px var(--lp-pill-shadow); white-space: nowrap; cursor: pointer; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), color 0.45s ease, background-color 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease; }
          .np-pill.faded { color: var(--lp-muted); border-color: var(--lp-pill-border); box-shadow: 0 6px 16px var(--lp-pill-shadow); opacity: 0.8; }
          .np-pill:hover, .np-pill.faded:hover { transform: scale(1.22); color: var(--lp-red); background: var(--lp-pink); border-color: var(--lp-red-soft); box-shadow: 0 24px 48px rgba(229,83,63,0.20); opacity: 1; }
        `}</style>

        {heroPills.map((p) => (
          <span key={p.label} className="np-anchor" data-depth={p.d} style={{ top: p.t, left: p.l, zIndex: p.faded ? 1 : 2 }}>
            <span className={`np-pill${p.faded ? ' faded' : ''}`}>{p.label}</span>
          </span>
        ))}

        <div className="np-hero-in" style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 22px)', padding: '0 16px' }}>
          <span style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.04em', color: INK, whiteSpace: 'nowrap' }}>
            nextplease<span style={{ color: RED }}>:</span>
          </span>
          <span style={{ border: `2px dashed ${RED}`, borderRadius: '18px', padding: 'clamp(6px,1.2vw,12px) clamp(16px,2.5vw,34px)', background: 'transparent' }}>
            <span style={{ fontSize: 'clamp(2rem, 6vw, 4.4rem)', fontWeight: '800', letterSpacing: '-0.045em', color: INK, lineHeight: 1 }}>Tìm bước tiếp theo</span>
          </span>
        </div>

        <p className="np-hero-in" style={{ position: 'relative', zIndex: 5, marginTop: '26px', fontSize: '1.06rem', color: MUTED, textAlign: 'center', maxWidth: '30rem', padding: '0 16px', animationDelay: '0.12s' }}>
          Một hồ sơ năng lực có kiểm chứng, cho cả ứng viên và nhà tuyển dụng.
        </p>

        <div className="np-hero-in" style={{ position: 'relative', zIndex: 5, display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.24s' }}>
          <Button
            label="Tôi là ứng viên"
            href="/candidates"
            variant="primary"
            endContent={<ArrowRight size={18} />}
          />
          <Button
            label="Tôi tuyển dụng"
            href="/businesses"
            variant="secondary"
            endContent={<ArrowRight size={18} />}
          />
        </div>
      </section>

      {/* Lower content, centered column */}
      <div style={{ ...INNER, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 2. STATS, white with dividers */}
        <section ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', padding: 'clamp(24px, 4vw, 48px) 0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          {stats.map((item, i) => (
            <div key={item.label} style={{ textAlign: 'center', borderLeft: i === 0 ? 'none' : `1px solid ${LINE}` }}>
              <div style={{ fontSize: 'clamp(2.6rem, 6vw, 4rem)', fontWeight: '800', color: INK, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedStatNumber value={item.value} suffix={item.suffix} run={statsRun} />
              </div>
              <div style={{ fontSize: '0.92rem', color: MUTED, fontWeight: '600', marginTop: '12px' }}>{item.label}</div>
            </div>
          ))}
        </section>

        {/* 3. SPLIT */}
        <section id="about" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', scrollMarginTop: '24px' }}>
          <Reveal style={{ height: '100%' }}>
            <div style={{ height: '100%', background: SURFACE, border: `1px solid ${LINE}`, borderRadius: '24px', padding: 'clamp(26px, 3vw, 40px)', boxSizing: 'border-box' }}>
              <p style={EYEBROW}>Bạn là sinh viên?</p>
              <h2 style={{ ...H2, marginBottom: '26px' }}>Vì sao ứng viên chọn chúng tôi</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {seekerPoints.map((p) => <FeatureRow key={p.text} icon={p.icon} text={p.text} chipBg={PINK} chipColor={RED} />)}
              </div>
              <Link to="/candidates" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '26px', color: RED, fontWeight: '700', fontSize: '0.94rem', textDecoration: 'none' }}>
                Khám phá <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120} style={{ height: '100%' }}>
            <div style={{ height: '100%', background: PINK, borderRadius: '24px', padding: 'clamp(26px, 3vw, 40px)', boxSizing: 'border-box' }}>
              <p style={EYEBROW}>Bạn tuyển dụng?</p>
              <h2 style={{ ...H2, marginBottom: '26px' }}>Vì sao tổ chức tin chúng tôi</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {hirerPoints.map((p) => <FeatureRow key={p.text} icon={p.icon} text={p.text} chipBg={SURFACE} chipColor={INK} />)}
              </div>
              <Link to="/businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '26px', color: INK, fontWeight: '700', fontSize: '0.94rem', textDecoration: 'none' }}>
                Tuyển ngay <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </section>

        {/* 4. SPOTLIGHT */}
        <Reveal>
          <section style={{ background: PLUM, borderRadius: '24px', padding: 'clamp(30px, 4vw, 52px)', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: '36px', alignItems: 'center' }}>
            <div>
              <p style={{ ...EYEBROW, color: 'rgba(255,255,255,0.55)' }}>Proof of work</p>
              <h2 style={{ ...H2, color: WHITE, marginBottom: '14px' }}>Proof thật dẫn đường cho cơ hội thật</h2>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                Mọi thay đổi về RS, EXP và NP đều do hệ thống kiểm soát qua event log, minh bạch, có thể kiểm chứng, không tự khai.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {proofFlow.map((f) => (
                <div key={f.step} style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 18px' }}>
                  <span style={{ flexShrink: 0, width: '38px', height: '38px', borderRadius: '50%', background: RED, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{f.step}</span>
                  <div>
                    <div style={{ fontWeight: '700', color: WHITE, fontSize: '0.98rem' }}>{f.title}</div>
                    <div style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.6)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* 5. TESTIMONIALS */}
        <section style={{ padding: '8px 0' }}>
          <Reveal>
            <p style={EYEBROW}>Từ cộng đồng</p>
            <h2 style={{ ...H2, marginBottom: '26px' }}>Tín hiệu từ hệ sinh thái</h2>
          </Reveal>
          <div className="np-bento-quotes">
            {testimonials.map((t, i) => {
              const featured = i === 0;
              return (
                <Reveal key={t.quote} delay={i * 130} style={{ height: '100%', ...(featured ? { gridRow: 'span 2' } : {}) }}>
                  <div className="np-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: featured ? PLUM : PINK_CARD, borderRadius: '20px', padding: featured ? 'clamp(28px, 3vw, 40px)' : '26px', boxSizing: 'border-box' }}>
                    <span style={{ display: 'inline-flex', width: featured ? '52px' : '42px', height: featured ? '52px' : '42px', borderRadius: '50%', background: featured ? 'rgba(255,255,255,0.1)' : PINK, color: RED, alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Quote size={featured ? 26 : 20} />
                    </span>
                    <p style={{ fontSize: featured ? 'clamp(1.1rem, 1.6vw, 1.5rem)' : '0.98rem', lineHeight: 1.55, color: featured ? '#fff' : INK, margin: '0 0 18px', fontWeight: featured ? '600' : '400' }}>{t.quote}</p>
                    <div style={{ fontSize: '0.82rem', color: featured ? 'rgba(255,255,255,0.6)' : MUTED, marginTop: 'auto' }}>{t.role}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Reveal style={{ height: '100%' }}>
            <div className="np-lift" style={{ height: '100%', background: CREAM, borderRadius: '24px', padding: 'clamp(30px, 3.5vw, 44px)', boxSizing: 'border-box' }}>
              <GraduationCap size={28} color={INK} />
              <h2 style={{ ...H2, margin: '18px 0 10px' }}>Sẵn sàng xây hồ sơ?</h2>
              <p style={{ fontSize: '1rem', color: 'var(--lp-cream-ink)', margin: '0 0 22px' }}>Tạo tài khoản ứng viên miễn phí và bắt đầu tích lũy uy tín.</p>
              <Button
                label="Tạo hồ sơ miễn phí"
                href="/candidate/register"
                variant="primary"
                endContent={<ArrowRight size={18} />}
              />
            </div>
          </Reveal>
          <Reveal delay={120} style={{ height: '100%' }}>
            <div className="np-lift" style={{ height: '100%', background: MAUVE, borderRadius: '24px', padding: 'clamp(30px, 3.5vw, 44px)', boxSizing: 'border-box' }}>
              <Search size={28} color={WHITE} />
              <h2 style={{ ...H2, color: WHITE, margin: '18px 0 10px' }}>Cần tuyển tài năng trẻ?</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 22px' }}>Đăng tin, đăng Quest và tiếp cận ứng viên đã được xác minh.</p>
              <Button
                label="Đăng tin tuyển dụng"
                href="/business/register"
                variant="secondary"
                style={{ background: WHITE, color: MAUVE, border: 'none' }}
                endContent={<ArrowRight size={18} />}
              />
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${LINE}`, marginTop: '12px', paddingTop: '28px', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '24px' }}>
          <div>
            <strong style={{ fontSize: '1.2rem', color: INK }}>next please<span style={{ color: RED }}>:</span></strong>
            <p style={{ fontSize: '0.9rem', color: MUTED, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '24rem' }}>
              Nền tảng reputation passport giúp sinh viên biến proof thật thành cơ hội nghề nghiệp đáng tin.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: INK, marginBottom: '4px' }}>Sản phẩm</span>
            <Link to="/candidates" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Ứng viên</Link>
            <Link to="/businesses" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Doanh nghiệp & CLB</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: INK, marginBottom: '4px' }}>Niềm tin hệ thống</span>
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
        </footer>
      </div>
    </div>
  );
}
