import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Check, X } from 'lucide-react';

/* Wellfound-faithful palette (fixed light) */
const INK = '#1d1320';
const MUTED = '#6e6470';
const RED = '#e5533f';
const PLUM = '#1e1320';
const PINK = '#fdeeeb';
const PINK_CARD = '#fbf3f1';
const GREEN_SOFT = '#e3f3ea';
const CREAM_SOFT = '#fbf1d6';
const BLUE_SOFT = '#eceffb';
const LINE = '#ece6e2';
const WHITE = '#ffffff';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

/* Two-tone glyphs */
function Svg({ children }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
const GLYPHS = {
  people: (<Svg><circle cx="9.5" cy="8" r="3" stroke={INK} strokeWidth="1.8" /><path d="M3.8 19c0-3.1 2.6-5 5.7-5s5.7 1.9 5.7 5" stroke={INK} strokeWidth="1.8" /><circle cx="18" cy="9.5" r="2.4" stroke={RED} strokeWidth="1.8" /></Svg>),
  badge: (<Svg><path d="M12 3l7 2.5v5c0 4.2-3 7.8-7 9-4-1.2-7-4.8-7-9v-5z" stroke={INK} strokeWidth="1.8" /><path d="M9 12l2 2 4-4" stroke={RED} strokeWidth="1.8" /></Svg>),
  post: (<Svg><rect x="3.5" y="4.5" width="17" height="4" rx="1.2" stroke={INK} strokeWidth="1.8" /><rect x="3.5" y="11.5" width="5.5" height="8" rx="1.2" stroke={RED} strokeWidth="1.8" /><line x1="12" y1="12.5" x2="20.5" y2="12.5" stroke={INK} strokeWidth="1.8" /><line x1="12" y1="16" x2="20.5" y2="16" stroke={INK} strokeWidth="1.8" /><line x1="12" y1="19.5" x2="20.5" y2="19.5" stroke={INK} strokeWidth="1.8" /></Svg>),
  filter: (<Svg><path d="M4 5h16l-6.2 7.2V18l-3.6 2v-7.8z" stroke={INK} strokeWidth="1.8" /><circle cx="18" cy="6.4" r="2.3" fill={RED} /></Svg>),
};

const stats = [
  { value: 2400, suffix: '+', label: 'ứng viên đã xác minh' },
  { value: 95, suffix: '%', label: 'proof được kiểm chứng' },
  { value: 1200, suffix: '+', label: 'tin & Quest đã đăng' },
];

const partners = [
  { id: 'vng', name: 'VNG', color: '#F4731C' },
  { id: 'shopee', name: 'Shopee', slug: 'shopee' },
  { id: 'momo', name: 'MoMo', color: '#A50064' },
  { id: 'grab', name: 'Grab', slug: 'grab' },
  { id: 'tiki', name: 'Tiki', color: '#1A94FF' },
  { id: 'zalo', name: 'Zalo', slug: 'zalo' },
  { id: 'viettel', name: 'Viettel', color: '#EE0033' },
  { id: 'fpt', name: 'FPT', fpt: true },
  { id: 'google', name: 'Google', slug: 'google' },
  { id: 'figma', name: 'Figma', slug: 'figma' },
  { id: 'spotify', name: 'Spotify', slug: 'spotify' },
  { id: 'notion', name: 'Notion', slug: 'notion' },
];

const WORDMARK = { fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', whiteSpace: 'nowrap' };

function LogoItem(p) {
  const [failed, setFailed] = useState(false);
  if (p.fpt) {
    return <span style={WORDMARK}><span style={{ color: '#F37021' }}>F</span><span style={{ color: '#00A651' }}>P</span><span style={{ color: '#0066B3' }}>T</span></span>;
  }
  if (p.slug) {
    if (failed) return <span style={{ ...WORDMARK, color: '#4a434f' }}>{p.name}</span>;
    return <img src={`https://cdn.simpleicons.org/${p.slug}`} alt={p.name} onError={() => setFailed(true)} style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />;
  }
  return <span style={{ ...WORDMARK, color: p.color }}>{p.name}</span>;
}

const testimonials = [
  { quote: 'Hồ sơ có proof giúp chúng tôi sàng lọc nhanh và tự tin hơn nhiều so với CV thường.', name: 'Thu Hà', role: 'HR · Doanh nghiệp công nghệ' },
  { quote: 'Đăng Quest cho sự kiện CLB cực nhanh, ứng viên chất lượng và nhiệt tình.', name: 'Quốc Bảo', role: 'Chủ nhiệm CLB' },
  { quote: 'Tính năng đánh giá và thưởng giúp giữ quan hệ tốt với ứng viên giỏi.', name: 'Lan Phương', role: 'Talent Acquisition' },
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

function PointRow({ icon, title, desc, dark }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.1)' : PINK, color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: '800', color: dark ? WHITE : INK, fontSize: '1.02rem', marginBottom: '3px' }}>{title}</div>
        <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.55, color: dark ? 'rgba(255,255,255,0.6)' : MUTED }}>{desc}</p>
      </div>
    </div>
  );
}

/* Recruiter dashboard / candidate row */
function CandRow({ initials, name, role, status, statusColor, rs, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
      <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.12)' : PINK, color: dark ? WHITE : RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.78rem', flexShrink: 0 }}>{initials}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '700', fontSize: '0.86rem', color: dark ? WHITE : INK }}>{name}</div>
        <div style={{ fontSize: '0.74rem', color: dark ? 'rgba(255,255,255,0.55)' : MUTED }}>{role}</div>
      </div>
      {status && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: statusColor || RED, background: `${statusColor || RED}1a`, borderRadius: '7px', padding: '3px 8px' }}>{status}</span>}
      {rs && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: dark ? WHITE : INK, background: dark ? 'rgba(255,255,255,0.1)' : PINK, borderRadius: '7px', padding: '3px 8px' }}>{rs}</span>}
    </div>
  );
}

function MediaPanel({ bg, children }) {
  return (
    <div style={{ background: bg, borderRadius: '24px', padding: 'clamp(28px, 4vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: WHITE, borderRadius: '18px', boxShadow: '0 18px 44px rgba(30,19,32,0.10)', padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

function FeatureSection({ reverse, eyebrow, title, body, points, cta, media }) {
  const copy = (
    <div>
      <p style={{ ...EYEBROW, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.8rem' }}>{eyebrow}</p>
      <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.3rem)', fontWeight: '800', lineHeight: 1.02, letterSpacing: '-0.04em', color: INK, margin: '0 0 18px', maxWidth: '20rem' }}>{title}</h2>
      <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: MUTED, margin: '0 0 24px', maxWidth: '26rem' }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '26px' }}>
        {points.map((p) => <PointRow key={p.title} {...p} />)}
      </div>
      <Link to={cta.to} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: RED, fontWeight: '800', fontSize: '1.02rem', textDecoration: 'none' }}>
        {cta.label} <ArrowRight size={20} />
      </Link>
    </div>
  );
  return (
    <Reveal>
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', padding: '28px 0' }}>
        {reverse ? <>{copy}{media}</> : <>{media}{copy}</>}
      </section>
    </Reveal>
  );
}

const cvBad = ['Tự khai, khó kiểm chứng', 'Không đo được uy tín thực', 'Dễ phóng đại thành tích', 'Mất thời gian phỏng vấn lọc'];
const cvGood = ['Minh chứng đã được xác thực', 'RS & EXP đo lường rõ ràng', 'Đánh giá từ tổ chức thật', 'Lọc nhanh theo proof + kỹ năng'];

export function BusinessLandingPage() {
  const statsRef = useRef(null);
  const [statsRun, setStatsRun] = useState(false);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return undefined;
    const obs = new IntersectionObserver((entries) => { setStatsRun(entries[0].isIntersecting); }, { threshold: 0.4 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: WHITE, color: INK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', overflowX: 'clip', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", paddingBottom: '48px' }}>

      {/* NAV */}
      <div style={{ ...INNER, paddingTop: '22px' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '14px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em', color: INK }}>nextplease</span>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', color: RED }}>:</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <Link to="/" style={{ fontSize: '0.96rem', fontWeight: '600', color: INK, textDecoration: 'none' }}>Trang chủ</Link>
            {/* <Link to="/candidates" style={{ fontSize: '0.96rem', fontWeight: '600', color: INK, textDecoration: 'none' }}>Ứng viên</Link> */}
            <Link to="/business/login" style={{ fontSize: '0.96rem', fontWeight: '600', color: INK, textDecoration: 'none' }}>Đăng nhập</Link>
          </div>
        </nav>
      </div>

      {/* HERO — 2 columns: copy left + recruiter dashboard mock right */}
      <div style={{ ...INNER }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', gap: '48px', alignItems: 'center', padding: 'clamp(28px, 5vw, 76px) 0 clamp(20px, 3vw, 40px)' }}>
          <div>
            <p style={{ ...EYEBROW, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.8rem' }}>Cho doanh nghiệp & câu lạc bộ</p>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5.2vw, 4rem)', fontWeight: '800', lineHeight: 1.0, letterSpacing: '-0.045em', color: INK, margin: '0 0 20px' }}>
              Tuyển đúng người<span style={{ color: RED }}>.</span> Qua proof thật<span style={{ color: RED }}>.</span>
            </h1>
            <p style={{ fontSize: '1.12rem', lineHeight: 1.55, color: MUTED, margin: '0 0 26px', maxWidth: '32rem' }}>
              Tiếp cận sinh viên đã kiểm chứng, đăng tin & Quest trong vài phút và quản lý toàn bộ ứng viên ngay trên một bảng điều khiển.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/business/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', background: INK, color: WHITE, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
                Đăng tin tuyển dụng <ArrowRight size={18} />
              </Link>
              <Link to="/business/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', background: WHITE, color: INK, border: `1.5px solid ${INK}`, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
                Tôi đã là đối tác
              </Link>
            </div>
          </div>

          {/* Hero visual — job post card + floating notification */}
          <div style={{ position: 'relative', padding: '8px 0' }}>
            <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: '24px', padding: '24px', boxShadow: '0 22px 56px rgba(30,19,32,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: RED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tin tuyển dụng</span>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1f7a4d', background: '#e6f4ec', borderRadius: '999px', padding: '4px 10px' }}>Đang mở</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: INK, lineHeight: 1.15, marginBottom: '6px' }}>Thực tập Thiết kế UI/UX</div>
              <div style={{ fontSize: '0.84rem', color: MUTED, marginBottom: '16px' }}>Campus Tech · TP. HCM · Remote</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {['Thực tập', 'Figma', 'RS 60+'].map((s) => <span key={s} style={{ fontSize: '0.74rem', fontWeight: '700', color: RED, background: PINK, borderRadius: '999px', padding: '5px 12px' }}>{s}</span>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: `1px solid ${LINE}` }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: MUTED, fontWeight: '600' }}>Thù lao</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1f7a4d' }}>3.000.000đ</div>
                </div>
                <span style={{ background: INK, color: WHITE, borderRadius: '999px', padding: '10px 20px', fontWeight: '700', fontSize: '0.86rem' }}>Đăng tin</span>
              </div>
            </div>
            {/* Floating applicant notification */}
            <div style={{ position: 'absolute', left: '-18px', bottom: '-22px', background: WHITE, border: `1px solid ${LINE}`, borderRadius: '14px', boxShadow: '0 16px 36px rgba(30,19,32,0.14)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '230px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: PINK, color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.78rem', flexShrink: 0 }}>MA</span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: INK }}>Minh Anh vừa ứng tuyển</div>
                <div style={{ fontSize: '0.72rem', color: MUTED }}>Proof đã xác minh · RS 76</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* STATS on white (recruit style) */}
      <div style={{ ...INNER }}>
        <section ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', padding: 'clamp(24px, 4vw, 52px) 0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          {stats.map((item, i) => (
            <div key={item.label} style={{ textAlign: 'center', borderLeft: i === 0 ? 'none' : `1px solid ${LINE}` }}>
              <div style={{ fontSize: 'clamp(2.6rem, 6vw, 4rem)', fontWeight: '800', color: INK, lineHeight: 1, letterSpacing: '-0.04em' }}>
                <AnimatedStatNumber value={item.value} suffix={item.suffix} run={statsRun} />
              </div>
              <div style={{ fontSize: '0.92rem', color: MUTED, fontWeight: '600', marginTop: '12px' }}>{item.label}</div>
            </div>
          ))}
        </section>
      </div>

      {/* Lower content */}
      <div style={{ ...INNER, display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '24px' }}>

        {/* PARTNER MARQUEE */}
        <section style={{ padding: '14px 0 4px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.86rem', fontWeight: '700', color: MUTED, marginBottom: '24px' }}>Được tin dùng bởi các tổ chức & doanh nghiệp</p>
          <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
            <div className="np-marquee" style={{ display: 'flex', width: 'max-content' }}>
              <div className="np-mq-group">{partners.map((p) => <LogoItem key={`a-${p.id}`} {...p} />)}</div>
              <div className="np-mq-group" aria-hidden="true">{partners.map((p) => <LogoItem key={`b-${p.id}`} {...p} />)}</div>
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

        {/* BENTO — capabilities grid (B2B layout, khác candidate) */}
        <section style={{ padding: '36px 0 12px' }}>
          <Reveal>
            <div style={{ marginBottom: '28px', maxWidth: '34rem' }}>
              <p style={{ ...EYEBROW, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.8rem' }}>Tất cả trong một</p>
              <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.3rem)', fontWeight: '800', lineHeight: 1.02, letterSpacing: '-0.04em', color: INK, margin: 0 }}>Mọi thứ bạn cần để tuyển dụng</h2>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'minmax(160px, auto)', gap: '16px' }}>
              {/* Big card — dashboard */}
              <div style={{ gridColumn: 'span 2', gridRow: 'span 2', background: WHITE, border: `1px solid ${LINE}`, borderRadius: '22px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: INK }}>Bảng điều khiển ứng viên</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1f7a4d', background: '#e6f4ec', borderRadius: '999px', padding: '4px 10px' }}>Đang mở</span>
                </div>
                <p style={{ fontSize: '0.94rem', color: MUTED, margin: '0 0 16px', lineHeight: 1.55 }}>Quản lý tin đăng, ứng viên và trạng thái — tất cả ở một nơi.</p>
                <div style={{ marginTop: 'auto', background: PINK_CARD, borderRadius: '14px', padding: '8px 14px' }}>
                  <CandRow initials="PT" name="phat280405" role="Tech Lead · FPTU" status="Vào vòng" statusColor="#d97706" rs="RS 82" />
                  <div style={{ borderTop: `1px solid ${LINE}` }} />
                  <CandRow initials="MA" name="Minh Anh" role="Marketing · UEH" status="Đã nộp" statusColor="#6366f1" rs="RS 76" />
                </div>
              </div>

              {/* Wide card */}
              <div style={{ gridColumn: 'span 2', background: GREEN_SOFT, borderRadius: '22px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: WHITE, color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>{GLYPHS.post}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: INK, margin: '0 0 6px' }}>Đăng tin & Quest trong vài phút</h3>
                <p style={{ fontSize: '0.94rem', color: MUTED, margin: 0, lineHeight: 1.55 }}>Tạo Job hoặc Quest CLB chỉ với vài thao tác, không rườm rà.</p>
              </div>

              {/* Small card 1 */}
              <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: '22px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: PINK, color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>{GLYPHS.filter}</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: INK, margin: '0 0 4px' }}>Lọc theo proof & RS</h3>
                <p style={{ fontSize: '0.88rem', color: MUTED, margin: 0, lineHeight: 1.5 }}>Tìm đúng người theo minh chứng đã xác thực.</p>
              </div>

              {/* Small card 2 */}
              <div style={{ background: PLUM, borderRadius: '22px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.6l-4.6 1.7.9-5.1-3.8-3.7 5.2-.8z" stroke={WHITE} strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="11" r="1.7" fill={RED} /></svg>
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: WHITE, margin: '0 0 4px' }}>Đánh giá & thưởng</h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>Ứng viên 5 sao nhận thưởng NP.</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* DARK SPOTLIGHT — sàng lọc bằng proof (Autopilot-style) */}
        <Reveal>
          <section style={{ background: PLUM, borderRadius: '24px', padding: 'clamp(32px, 5vw, 60px)', display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: '44px', alignItems: 'center' }}>
            <div>
              <p style={{ ...EYEBROW, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.8rem' }}>Sàng lọc thông minh</p>
              <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.3rem)', fontWeight: '800', lineHeight: 1.02, letterSpacing: '-0.04em', color: WHITE, margin: '0 0 16px' }}>Sàng lọc bằng proof, không bằng cảm tính</h2>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', margin: '0 0 26px' }}>
                Mỗi ứng viên đi kèm minh chứng đã xác thực, điểm uy tín (RS) và đánh giá thật — bạn quyết định nhanh và chắc chắn hơn.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <PointRow dark icon={GLYPHS.people} title="Hồ sơ thật, proof thật" desc="Không CV phóng đại — mọi thành tích đều kiểm chứng được." />
                <PointRow dark icon={GLYPHS.badge} title="Xếp hạng theo uy tín" desc="Lọc theo RS, kỹ năng và minh chứng để tìm đúng người." />
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>Ứng viên đề xuất</div>
              <CandRow dark initials="PT" name="phat280405" role="Tech Lead · FPTU" rs="RS 82" />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <CandRow dark initials="MA" name="Minh Anh" role="Marketing · UEH" rs="RS 76" />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <CandRow dark initials="HN" name="Hoàng Nam" role="Designer · RMIT" rs="RS 71" />
            </div>
          </section>
        </Reveal>

        {/* COMPARISON — CV vs Proof */}
        <section style={{ padding: '24px 0 12px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <p style={{ ...EYEBROW, color: INK }}>Vì sao chọn nextplease</p>
              <h2 style={{ ...H2, margin: '0 auto', maxWidth: '30rem' }}>Hồ sơ có proof, không phải CV tự khai</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Reveal style={{ height: '100%' }}>
              <div style={{ height: '100%', background: WHITE, border: `1px solid ${LINE}`, borderRadius: '24px', padding: 'clamp(26px, 3vw, 38px)', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: MUTED, marginBottom: '20px' }}>CV truyền thống</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cvBad.map((t) => (
                    <div key={t} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#f0eeec', color: '#9b948f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></span>
                      <span style={{ fontSize: '0.96rem', color: MUTED }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} style={{ height: '100%' }}>
              <div style={{ height: '100%', background: PINK, border: `2px solid ${RED}`, borderRadius: '24px', padding: 'clamp(26px, 3vw, 38px)', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: INK, marginBottom: '20px' }}>Hồ sơ có proof <span style={{ color: RED }}>(nextplease)</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cvGood.map((t) => (
                    <div key={t} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%', background: RED, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={15} /></span>
                      <span style={{ fontSize: '0.96rem', color: INK, fontWeight: '600' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* QUOTES */}
        <section style={{ padding: '20px 0' }}>
          <Reveal>
            <p style={{ ...EYEBROW, color: INK }}>Từ đối tác</p>
            <h2 style={{ ...H2, marginBottom: '26px' }}>Doanh nghiệp & CLB nói gì</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 130} style={{ height: '100%' }}>
                <div style={{ height: '100%', background: PINK_CARD, borderRadius: '20px', padding: '26px', boxSizing: 'border-box' }}>
                  <span style={{ display: 'inline-flex', width: '42px', height: '42px', borderRadius: '50%', background: PINK, color: RED, alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Quote size={20} /></span>
                  <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: INK, margin: '0 0 18px' }}>{t.quote}</p>
                  <div style={{ fontWeight: '700', color: INK, fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.82rem', color: MUTED }}>{t.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <Reveal>
          <section style={{ background: PLUM, borderRadius: '24px', padding: 'clamp(36px, 5vw, 60px)', textAlign: 'center' }}>
            <h2 style={{ ...H2, color: WHITE, marginBottom: '10px' }}>Sẵn sàng tuyển nhân tài thực chất?</h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', margin: '0 auto 26px', maxWidth: '34rem' }}>Tạo tài khoản đối tác, đăng tin và tiếp cận ứng viên đã được xác minh ngay hôm nay.</p>
            <Link to="/business/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 30px', borderRadius: '999px', background: WHITE, color: INK, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
              Đăng tin tuyển dụng <ArrowRight size={18} />
            </Link>
          </section>
        </Reveal>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${LINE}`, marginTop: '12px', paddingTop: '28px', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '24px' }}>
          <div>
            <strong style={{ fontSize: '1.2rem', color: INK }}>next please<span style={{ color: RED }}>:</span></strong>
            <p style={{ fontSize: '0.9rem', color: MUTED, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '24rem' }}>
              Cổng kết nối doanh nghiệp & CLB với sinh viên tài năng qua Verified Proof of Work.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: INK, marginBottom: '4px' }}>Đối tác</span>
            <Link to="/business/register" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Đăng ký đối tác</Link>
            <Link to="/business/login" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Đăng nhập</Link>
            <Link to="/" style={{ fontSize: '0.9rem', color: MUTED, textDecoration: 'none' }}>Về trang chủ</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: INK, marginBottom: '4px' }}>Giải pháp</span>
            <span style={{ fontSize: '0.9rem', color: MUTED }}>Lọc hồ sơ qua proof</span>
            <span style={{ fontSize: '0.9rem', color: MUTED }}>Quản trị tuyển dụng & Quest</span>
            <span style={{ fontSize: '0.9rem', color: MUTED }}>Đánh giá & thưởng ứng viên</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
