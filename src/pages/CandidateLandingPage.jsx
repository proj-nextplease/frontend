import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Quote, Sparkles, Plus, ChevronRight,
  Wallet, ShieldCheck, TrendingUp, MousePointerClick, Target,
} from 'lucide-react';

/* Wellfound palette, theme-aware via CSS variables (see --lp-* in index.css). */
const INK = 'var(--lp-ink)';
const MUTED = 'var(--lp-muted)';
const RED = 'var(--lp-red)';
const PLUM = 'var(--lp-plum)';
const PINK = 'var(--lp-pink)';
const PINK_CARD = 'var(--lp-pink-card)';
const GREEN_SOFT = 'var(--lp-green-soft)';
const CREAM_SOFT = 'var(--lp-cream-soft)';
const BLUE_SOFT = 'var(--lp-blue-soft)';
const LINE = 'var(--lp-line)';
const WHITE = '#ffffff';            /* literal white, for text/elements on dark fills */
const SURFACE = 'var(--lp-surface)'; /* page & card backgrounds that flip with the theme */

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

/* Two-tone illustrative glyphs (Wellfound-style): plum base + red accent */
function Svg({ children }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
/* stroke/fill via `style` so CSS-variable colors resolve on SVG. */
const sInk = { stroke: INK };
const sRed = { stroke: RED };
const fRed = { fill: RED };
const hollow = { fill: 'var(--lp-surface)' };
const GLYPHS = {
  click: (
    <Svg>
      <path d="M6 4.2v12l3-2.6 1.9 4.2 2.1-1-1.9-4.1H15z" style={sInk} strokeWidth="1.8" />
      <path d="M17 6l1.7-1.7M18.6 11H21M17 16l1.7 1.7" style={sRed} strokeWidth="1.8" />
    </Svg>
  ),
  sliders: (
    <Svg>
      <line x1="4" y1="8" x2="20" y2="8" style={sInk} strokeWidth="1.8" />
      <line x1="4" y1="16" x2="20" y2="16" style={sInk} strokeWidth="1.8" />
      <circle cx="9" cy="8" r="2.6" style={{ ...hollow, stroke: 'var(--lp-red)' }} strokeWidth="1.8" />
      <circle cx="15" cy="16" r="2.6" style={{ ...hollow, stroke: 'var(--lp-ink)' }} strokeWidth="1.8" />
    </Svg>
  ),
  tag: (
    <Svg>
      <rect x="4" y="5" width="16" height="14" rx="2.6" style={sInk} strokeWidth="1.8" />
      <path d="M12 8.4v7.2M13.9 10.1c-.6-.8-3.8-1-3.8.9 0 1.9 3.8 1 3.8 3 0 1.9-3.2 1.7-3.8.9" style={sRed} strokeWidth="1.6" />
    </Svg>
  ),
  filter: (
    <Svg>
      <path d="M4 5h16l-6.2 7.2V18l-3.6 2v-7.8z" style={sInk} strokeWidth="1.8" />
      <circle cx="18" cy="6.4" r="2.3" style={fRed} />
    </Svg>
  ),
  star: (
    <Svg>
      <path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.6l-4.6 1.7.9-5.1-3.8-3.7 5.2-.8z" style={sInk} strokeWidth="1.8" />
      <circle cx="12" cy="11" r="1.7" style={fRed} />
    </Svg>
  ),
  people: (
    <Svg>
      <circle cx="9.5" cy="8" r="3" style={sInk} strokeWidth="1.8" />
      <path d="M3.8 19c0-3.1 2.6-5 5.7-5s5.7 1.9 5.7 5" style={sInk} strokeWidth="1.8" />
      <circle cx="18" cy="9.5" r="2.4" style={sRed} strokeWidth="1.8" />
    </Svg>
  ),
  send: (
    <Svg>
      <path d="M21 4L3.5 11l6 2.3L12 20l3.2-5.7z" style={sInk} strokeWidth="1.8" />
      <path d="M21 4l-11.5 9.3" style={sRed} strokeWidth="1.8" />
    </Svg>
  ),
};

const steps = [
  { title: 'Tạo hồ sơ', desc: 'Thêm kỹ năng, mong muốn và thông tin của bạn, chỉ vài phút.' },
  { title: 'Gom proof thật', desc: 'Hoạt động, chứng chỉ và kinh nghiệm được tổ chức xác minh.' },
  { title: 'Ứng tuyển một chạm', desc: 'Nộp mọi việc làm & Quest CLB chỉ với một click duy nhất.' },
];

const partners = [
  // Brand Việt, wordmark màu thương hiệu
  { id: 'vng', name: 'VNG', color: '#F4731C' },
  { id: 'shopee', name: 'Shopee', slug: 'shopee' },
  { id: 'momo', name: 'MoMo', color: '#A50064' },
  { id: 'grab', name: 'Grab', slug: 'grab' },
  { id: 'tiki', name: 'Tiki', color: '#1A94FF' },
  { id: 'zalo', name: 'Zalo', slug: 'zalo' },
  { id: 'viettel', name: 'Viettel', color: '#EE0033' },
  { id: 'fpt', name: 'FPT', fpt: true },
  // Brand quốc tế, logo chính hãng (Simple Icons)
  { id: 'google', name: 'Google', slug: 'google' },
  { id: 'figma', name: 'Figma', slug: 'figma' },
  { id: 'spotify', name: 'Spotify', slug: 'spotify' },
  { id: 'notion', name: 'Notion', slug: 'notion' },
];

const WORDMARK = { fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', whiteSpace: 'nowrap' };

function LogoItem(p) {
  const [failed, setFailed] = useState(false);
  if (p.fpt) {
    return (
      <span style={WORDMARK}>
        <span style={{ color: '#F37021' }}>F</span>
        <span style={{ color: '#00A651' }}>P</span>
        <span style={{ color: '#0066B3' }}>T</span>
      </span>
    );
  }
  if (p.slug) {
    if (failed) return <span style={{ ...WORDMARK, color: 'var(--lp-muted)' }}>{p.name}</span>;
    return (
      <img src={`https://cdn.simpleicons.org/${p.slug}`} alt={p.name} onError={() => setFailed(true)} style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
    );
  }
  return <span style={{ ...WORDMARK, color: p.color }}>{p.name}</span>;
}

const testimonials = [
  { quote: 'Mình apply một chạm, hồ sơ proof giúp được nhận phỏng vấn nhanh hơn hẳn.', name: 'Minh Anh', role: 'Sinh viên Marketing' },
  { quote: 'EXP và Level làm mình có động lực tham gia hoạt động hơn, như chơi game vậy.', name: 'Hoàng Nam', role: 'Sinh viên CNTT' },
  { quote: 'Một hồ sơ duy nhất dùng cho cả việc làm lẫn Quest CLB, rất tiện.', name: 'phat280405', role: 'Ứng viên · FPTU HCM' },
];

const faqs = [
  {
    icon: Wallet,
    q: 'Tạo hồ sơ có mất phí không?',
    a: 'Hoàn toàn miễn phí. Bạn tạo hồ sơ, gom proof và ứng tuyển không tốn bất kỳ chi phí nào.',
    highlight: 'Miễn phí 100%',
  },
  {
    icon: ShieldCheck,
    q: 'Proof được xác minh như thế nào?',
    a: 'Mọi minh chứng (hoạt động, chứng chỉ, kinh nghiệm) được tổ chức liên quan duyệt; điểm RS và EXP do hệ thống kiểm soát, không tự khai.',
    highlight: 'Xác minh bởi tổ chức',
  },
  {
    icon: TrendingUp,
    q: 'RS, EXP và Level là gì?',
    a: 'Đó là chỉ số uy tín và kinh nghiệm tích luỹ qua hoạt động thật. Hồ sơ uy tín cao được nhà tuyển dụng ưu tiên hiển thị.',
    highlight: 'Uy tín hiển thị nổi bật',
  },
  {
    icon: MousePointerClick,
    q: 'Tôi có thể ứng tuyển ngay khi vừa tạo hồ sơ?',
    a: 'Có. Sau khi hoàn thiện thông tin cơ bản, bạn ứng tuyển mọi việc làm và Quest CLB chỉ với một chạm.',
    highlight: 'Ứng tuyển một chạm',
  },
  {
    icon: Target,
    q: 'Quest CLB là gì?',
    a: 'Quest là nhiệm vụ và hoạt động do câu lạc bộ, tổ chức đăng tải. Hoàn thành Quest giúp bạn tích EXP, mở rộng proof và kết nối với cộng đồng.',
    highlight: 'Tích EXP qua hoạt động',
  },
];

function FaqSection() {
  const [active, setActive] = useState(null);   // null = đóng, hỏi tràn full width
  const [last, setLast] = useState(0);          // giữ nội dung khi đang đóng để animate mượt
  const open = active !== null;
  const cur = faqs[last];
  const Icon = cur.icon;

  const toggle = (i) => {
    if (i === active) { setActive(null); return; }
    setActive(i);
    setLast(i);
  };

  return (
    <div className="np-faq" style={{ display: 'flex', gap: open ? '20px' : '0', alignItems: 'flex-start', transition: 'gap 0.4s ease' }}>
      {/* LEFT, question list: full-width grid khi đóng, 1 cột khi mở */}
      <div
        className="np-faq-q"
        style={{
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px',
        }}
      >
        {faqs.map((f, i) => {
          const on = i === active;
          return (
            <button
              key={f.q}
              onClick={() => toggle(i)}
              aria-expanded={on}
              className="np-card"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px',
                padding: '18px 20px', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', font: 'inherit',
                background: on ? PINK : SURFACE, border: `1.5px solid ${on ? RED : LINE}`,
              }}
            >
              <span style={{ fontWeight: '700', color: on ? RED : INK, fontSize: '1rem' }}>{f.q}</span>
              <ChevronRight size={20} color={on ? RED : MUTED} style={{ flexShrink: 0, transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)', transform: on ? 'rotate(90deg)' : 'none' }} />
            </button>
          );
        })}
      </div>

      {/* RIGHT, answer panel: collapse khi đóng, slide + fade khi mở */}
      <div
        className="np-faq-a"
        style={{
          flexGrow: 0, flexShrink: 0,
          flexBasis: open ? 'clamp(320px, 42%, 520px)' : '0px',
          maxHeight: open ? '1200px' : '0px',
          opacity: open ? 1 : 0,
          transform: open ? 'none' : 'translateX(24px)',
          overflow: 'hidden',
          position: 'sticky', top: '90px',
          background: PLUM, borderRadius: '24px',
          padding: open ? 'clamp(26px, 3vw, 40px)' : '0 clamp(26px, 3vw, 40px)',
          transition: 'flex-basis 0.45s cubic-bezier(0.22,1,0.36,1), max-height 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1), padding 0.45s ease',
        }}
      >
        <div key={last} className="np-in" style={{ animationDuration: '0.45s', minWidth: 'clamp(280px, 38vw, 460px)' }}>
          <span style={{ display: 'inline-flex', width: '56px', height: '56px', borderRadius: '16px', background: RED, color: WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Icon size={26} />
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: WHITE, margin: '0 0 14px', lineHeight: 1.2 }}>{cur.q}</h3>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: '0 0 22px' }}>{cur.a}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '700', color: WHITE, background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '8px 16px' }}>
            <Sparkles size={14} /> {cur.highlight}
          </span>
        </div>
      </div>
    </div>
  );
}

function Reveal({ children, delay = 0, y = 32, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver((entries) => { setShown(entries[0].isIntersecting); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ ...style, opacity: shown ? 1 : 0, transform: shown ? 'none' : `translateY(${y}px)`, transition: `opacity 0.7s ease-out ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

const EYEBROW = { fontSize: '0.84rem', fontWeight: '800', letterSpacing: '-0.01em', color: RED, margin: '0 0 14px' };
const H2 = { fontSize: 'clamp(1.8rem, 3.4vw, 2.7rem)', fontWeight: '800', lineHeight: 1.08, letterSpacing: '-0.03em', color: INK, margin: 0 };

function PointRow({ icon, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%', background: PINK, color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: '800', color: INK, fontSize: '1.02rem', marginBottom: '3px' }}>{title}</div>
        <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.55, color: MUTED }}>{desc}</p>
      </div>
    </div>
  );
}

function FeatureSection({ reverse, eyebrow, title, points, cta, media }) {
  const copy = (
    <div>
      <p style={EYEBROW}>{eyebrow}</p>
      <h2 style={{ ...H2, marginBottom: '26px', maxWidth: '26rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
        {points.map((p) => <PointRow key={p.title} {...p} />)}
      </div>
      <Link to={cta.to} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', borderRadius: '999px', background: 'var(--lp-btn-bg)', color: 'var(--lp-btn-text)', fontWeight: '700', fontSize: '0.94rem', textDecoration: 'none' }}>
        {cta.label} <ArrowRight size={18} />
      </Link>
    </div>
  );
  return (
    <Reveal>
      <section className="np-feature" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', padding: '20px 0' }}>
        {reverse ? <>{copy}{media}</> : <>{media}{copy}</>}
      </section>
    </Reveal>
  );
}

/* Flat "media" mocks (thay cho 3D render trả phí của Wellfound) */
function MediaPanel({ bg, children }) {
  return (
    <div className="np-card" style={{ background: bg, borderRadius: '24px', padding: 'clamp(28px, 4vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
      <div style={{ width: '100%', maxWidth: '360px', background: SURFACE, borderRadius: '18px', boxShadow: '0 16px 40px rgba(30,19,32,0.10)', padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

export function CandidateLandingPage() {
  return (
    <div style={{ background: 'var(--lp-bg)', color: INK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', overflowX: 'clip', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", paddingBottom: '48px' }}>

      {/* Global interaction + entrance styles */}
      <style>{`
        .np-navlink { position: relative; text-decoration: none; transition: color 0.2s ease; }
        .np-navlink::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 2px; width: 100%; background: ${RED}; transform: scaleX(0); transform-origin: left; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1); }
        .np-navlink:hover { color: ${RED}; }
        .np-navlink:hover::after { transform: scaleX(1); }
        .np-cta { transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; will-change: transform; }
        .np-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(30,19,32,0.18); }
        .np-cta:active { transform: translateY(0) scale(0.98); box-shadow: 0 6px 14px rgba(30,19,32,0.14); }
        .np-cta-ghost:hover { background: ${PINK}; border-color: ${RED}; color: ${RED}; }
        .np-card { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, border-color 0.25s ease; will-change: transform; }
        .np-card:hover { transform: translateY(-6px); box-shadow: 0 26px 50px rgba(30,19,32,0.14); }
        :focus-visible { outline: 2px solid ${RED}; outline-offset: 3px; border-radius: 8px; }
        @keyframes npFadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        .np-in { animation: npFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both; }
        @media (max-width: 760px) {
          .np-feature { grid-template-columns: 1fr !important; gap: 28px !important; }
          .np-grid-3 { grid-template-columns: 1fr !important; }
          .np-footer-grid { grid-template-columns: 1fr !important; }
          .np-faq { flex-direction: column !important; gap: 16px !important; }
          .np-faq-q { grid-template-columns: 1fr !important; }
          .np-faq-a { flex-basis: auto !important; width: 100%; position: static !important; transform: none !important; }
          .np-faq-a > div { min-width: 0 !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .np-in { animation: none; }
          .np-cta, .np-card, .np-navlink::after { transition: none !important; }
          .np-card:hover, .np-cta:hover { transform: none; }
        }
      `}</style>

      {/* NAV */}
      <div style={{ ...INNER, paddingTop: '22px' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '14px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em', color: INK }}>nextplease</span>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', color: RED }}>:</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <Link to="/" className="np-navlink" style={{ fontSize: '0.96rem', fontWeight: '600', color: INK }}>Trang chủ</Link>
            <Link to="/candidate/login" className="np-navlink" style={{ fontSize: '0.96rem', fontWeight: '600', color: INK }}>Đăng nhập</Link>
          </div>
        </nav>
      </div>

      {/* HERO, centered */}
      <div style={{ ...INNER }}>
        <section style={{ textAlign: 'center', padding: 'clamp(48px, 9vw, 110px) 0 clamp(36px, 6vw, 72px)', maxWidth: '46rem', margin: '0 auto' }}>
          <p className="np-in" style={{ ...EYEBROW }}>Dành cho ứng viên sinh viên</p>
          <h1 className="np-in" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', fontWeight: '800', lineHeight: 1.02, letterSpacing: '-0.045em', color: INK, margin: '0 0 22px', animationDelay: '0.08s' }}>
            Hồ sơ của bạn<span style={{ color: RED }}>.</span><br />Cơ hội của bạn<span style={{ color: RED }}>.</span>
          </h1>
          <p className="np-in" style={{ fontSize: '1.15rem', lineHeight: 1.55, color: MUTED, margin: '0 auto 30px', maxWidth: '34rem', animationDelay: '0.16s' }}>
            Tạo hồ sơ nêu bật kỹ năng và mong muốn của bạn, gom proof thật, rồi ứng tuyển mọi cơ hội chỉ với một chạm.
          </p>
          <div className="np-in" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.24s' }}>
            <Link to="/candidate/register" className="np-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', background: 'var(--lp-btn-bg)', color: 'var(--lp-btn-text)', fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
              Tạo hồ sơ <ArrowRight size={18} />
            </Link>
            <Link to="/candidate/login" className="np-cta np-cta-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', background: SURFACE, color: INK, border: `1.5px solid ${INK}`, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
              Tôi đã có tài khoản
            </Link>
          </div>
        </section>
      </div>

      {/* Lower content */}
      <div style={{ ...INNER, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* STEPS, 3 bước bắt đầu */}
        <section style={{ padding: 'clamp(28px, 4vw, 52px) 0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          <Reveal>
            <p style={{ ...EYEBROW, textAlign: 'center' }}>Bắt đầu trong 3 bước</p>
            <h2 style={{ ...H2, textAlign: 'center', marginBottom: '32px' }}>Từ hồ sơ trống đến cơ hội thật</h2>
          </Reveal>
          <div className="np-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 120} style={{ height: '100%' }}>
                <div className="np-card" style={{ height: '100%', background: SURFACE, border: `1px solid ${LINE}`, borderRadius: '20px', padding: '26px', boxSizing: 'border-box' }}>
                  <span style={{ display: 'inline-flex', width: '40px', height: '40px', borderRadius: '12px', background: PINK, color: RED, alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.05rem', marginBottom: '16px' }}>{i + 1}</span>
                  <div style={{ fontWeight: '800', color: INK, fontSize: '1.08rem', marginBottom: '6px' }}>{s.title}</div>
                  <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.55, color: MUTED }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PARTNER MARQUEE */}
        <section style={{ padding: '14px 0 4px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.86rem', fontWeight: '700', color: MUTED, marginBottom: '24px' }}>Tổ chức & doanh nghiệp đã tuyển dụng qua nextplease</p>
          <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
            <div className="np-marquee" style={{ display: 'flex', width: 'max-content' }}>
              <div className="np-mq-group">
                {partners.map((p) => <LogoItem key={`a-${p.id}`} {...p} />)}
              </div>
              <div className="np-mq-group" aria-hidden="true">
                {partners.map((p) => <LogoItem key={`b-${p.id}`} {...p} />)}
              </div>
            </div>
          </div>
          <style>{`
            @keyframes npMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            .np-marquee { animation: npMarquee 34s linear infinite; }
            .np-marquee:hover { animation-play-state: paused; }
            .np-mq-group { display: flex; align-items: center; flex-shrink: 0; }
            .np-mq-group > * { margin-right: 64px; }
          `}</style>
        </section>

        {/* FEATURE 1, media left, copy right */}
        <FeatureSection
          eyebrow="Ứng tuyển một chạm"
          title="Hồ sơ nổi bật, ứng tuyển chỉ với một click"
          points={[
            { icon: GLYPHS.click, title: 'Ứng tuyển một chạm', desc: 'Không cần cover letter, hồ sơ của bạn là tất cả. Một click là xong.' },
            { icon: GLYPHS.sliders, title: 'Đặt mong muốn của bạn', desc: 'Nêu rõ kỳ vọng (thù lao, lĩnh vực, hình thức) ngay từ đầu.' },
          ]}
          cta={{ label: 'Tạo hồ sơ miễn phí', to: '/candidate/register' }}
          media={(
            <MediaPanel bg={GREEN_SOFT}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: LINE, border: `1.5px dashed ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
                  <Plus size={18} />
                </span>
                <div>
                  <div style={{ height: '10px', width: '120px', borderRadius: '6px', background: LINE, marginBottom: '7px' }} />
                  <div style={{ height: '8px', width: '74px', borderRadius: '6px', background: LINE }} />
                </div>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '700', color: MUTED, background: LINE, padding: '3px 9px', borderRadius: '999px' }}>Chưa khai báo</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '600', color: MUTED, background: LINE, border: `1px dashed ${LINE}`, borderRadius: '8px', padding: '4px 12px' }}>+ Thêm kỹ năng</span>
                <span style={{ height: '24px', width: '52px', borderRadius: '8px', background: LINE }} />
                <span style={{ height: '24px', width: '40px', borderRadius: '8px', background: LINE }} />
              </div>
              <div style={{ background: LINE, color: MUTED, borderRadius: '12px', padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '0.9rem', border: `1px dashed ${LINE}` }}>Hoàn thiện hồ sơ để bắt đầu</div>
            </MediaPanel>
          )}
        />

        {/* FEATURE 2, copy left, media right */}
        <FeatureSection
          reverse
          eyebrow="Mọi thông tin, ngay từ đầu"
          title="Biết rõ cơ hội trước khi ứng tuyển"
          points={[
            { icon: GLYPHS.tag, title: 'Minh bạch thù lao', desc: 'Xem mức thù lao và quyền lợi trước khi nộp, không đoán mò.' },
            { icon: GLYPHS.filter, title: 'Tìm kiếm cá nhân hoá', desc: 'Bộ lọc theo RS, kỹ năng, hình thức giúp tìm đúng cơ hội.' },
            { icon: GLYPHS.star, title: 'Vai trò & Quest độc đáo', desc: 'Khám phá việc làm và Quest CLB từ các tổ chức năng động.' },
          ]}
          cta={{ label: 'Khám phá cơ hội', to: '/candidates' }}
          media={(
            <MediaPanel bg={CREAM_SOFT}>
              <div style={{ border: `1px solid ${LINE}`, borderRadius: '10px', padding: '9px 12px', fontSize: '0.84rem', color: MUTED, marginBottom: '12px' }}>Tìm cơ hội…</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {['Remote', 'Thực tập', 'RS 60+'].map((s) => <span key={s} style={{ fontSize: '0.74rem', fontWeight: '700', color: RED, background: PINK, borderRadius: '999px', padding: '4px 12px' }}>{s}</span>)}
              </div>
              <div style={{ border: `1px solid ${LINE}`, borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>Thực tập Thiết kế UI/UX</div>
                <div style={{ fontSize: '0.78rem', color: MUTED, margin: '2px 0 8px' }}>Campus Tech · TP. HCM</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', color: 'var(--success)', fontSize: '0.88rem' }}>3.000.000đ</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: INK, background: PINK, borderRadius: '8px', padding: '3px 9px' }}>RS 60+</span>
                </div>
              </div>
            </MediaPanel>
          )}
        />

        {/* FEATURE 3, media left, copy right */}
        <FeatureSection
          eyebrow="Kết nối & nổi bật"
          title="Được tổ chức chú ý tới bạn"
          points={[
            { icon: GLYPHS.people, title: 'Kết nối trực tiếp', desc: 'Nhà tuyển dụng và CLB chủ động mời bạn dựa trên proof thật.' },
            { icon: GLYPHS.send, title: 'Được đề xuất nổi bật', desc: 'Hồ sơ uy tín cao được ưu tiên hiển thị với nhà tuyển dụng.' },
          ]}
          cta={{ label: 'Bắt đầu ngay', to: '/candidate/register' }}
          media={(
            <MediaPanel bg={BLUE_SOFT}>
              <div style={{ background: PINK_CARD, borderRadius: '12px', padding: '10px 12px', fontSize: '0.84rem', color: INK, marginBottom: '10px', maxWidth: '85%' }}>Hồ sơ của bạn rất ấn tượng! Mời bạn ứng tuyển nhé.</div>
              <div style={{ background: 'var(--lp-btn-bg)', color: 'var(--lp-btn-text)', borderRadius: '12px', padding: '10px 12px', fontSize: '0.84rem', marginLeft: 'auto', marginBottom: '12px', maxWidth: '70%' }}>Cảm ơn anh/chị ạ!</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: '700', color: RED, background: PINK, borderRadius: '999px', padding: '5px 12px' }}><Sparkles size={13} /> Được đề xuất nổi bật</span>
            </MediaPanel>
          )}
        />

        {/* QUOTES */}
        <section style={{ padding: '20px 0' }}>
          <Reveal>
            <p style={{ ...EYEBROW, color: INK }}>Từ cộng đồng</p>
            <h2 style={{ ...H2, marginBottom: '26px' }}>Ứng viên nói gì về nextplease</h2>
          </Reveal>
          <div className="np-bento-quotes">
            {testimonials.map((t, i) => {
              const featured = i === 0;
              return (
                <Reveal key={t.quote} delay={i * 130} style={{ height: '100%', ...(featured ? { gridRow: 'span 2' } : {}) }}>
                  <div className="np-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: featured ? PLUM : PINK_CARD, borderRadius: '20px', padding: featured ? 'clamp(28px, 3vw, 40px)' : '26px', boxSizing: 'border-box' }}>
                    <span style={{ display: 'inline-flex', width: featured ? '52px' : '42px', height: featured ? '52px' : '42px', borderRadius: '50%', background: featured ? 'rgba(255,255,255,0.1)' : PINK, color: RED, alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Quote size={featured ? 26 : 20} /></span>
                    <p style={{ fontSize: featured ? 'clamp(1.1rem, 1.6vw, 1.5rem)' : '0.98rem', lineHeight: 1.55, color: featured ? '#fff' : INK, margin: 0, fontWeight: featured ? '600' : '400' }}>{t.quote}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '20px 0' }}>
          <Reveal>
            <p style={{ ...EYEBROW, color: INK }}>Giải đáp nhanh</p>
            <h2 style={{ ...H2, marginBottom: '26px' }}>Câu hỏi thường gặp</h2>
          </Reveal>
          <Reveal>
            <FaqSection />
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer className="np-footer-grid" style={{ borderTop: `1px solid ${LINE}`, marginTop: '12px', paddingTop: '28px', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '24px' }}>
          <div>
            <strong style={{ fontSize: '1.2rem', color: INK }}>next please<span style={{ color: RED }}>:</span></strong>
            <p style={{ fontSize: '0.9rem', color: MUTED, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '24rem' }}>
              Không gian dành cho ứng viên biến hoạt động thật, kỹ năng và minh chứng thành hồ sơ uy tín, sẵn sàng cho cơ hội mới.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: INK, marginBottom: '4px' }}>Ứng viên</span>
            <Link to="/candidate/register" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Tạo hồ sơ</Link>
            <Link to="/candidate/login" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Đăng nhập</Link>
            <Link to="/" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Về trang chủ</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: INK, marginBottom: '4px' }}>Hồ sơ uy tín</span>
            <span style={{ fontSize: '0.9rem', color: MUTED }}>Portfolio cá nhân</span>
            <span style={{ fontSize: '0.9rem', color: MUTED }}>Proof, chứng chỉ, kinh nghiệm</span>
            <span style={{ fontSize: '0.9rem', color: MUTED }}>Backend xác thực RS / EXP</span>
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
