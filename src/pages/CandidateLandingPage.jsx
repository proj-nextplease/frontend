import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, ShieldCheck, Star, Quote, Sparkles,
} from 'lucide-react';

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

/* Two-tone illustrative glyphs (Wellfound-style): plum base + red accent */
function Svg({ children }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
const GLYPHS = {
  click: (
    <Svg>
      <path d="M6 4.2v12l3-2.6 1.9 4.2 2.1-1-1.9-4.1H15z" stroke={INK} strokeWidth="1.8" />
      <path d="M17 6l1.7-1.7M18.6 11H21M17 16l1.7 1.7" stroke={RED} strokeWidth="1.8" />
    </Svg>
  ),
  sliders: (
    <Svg>
      <line x1="4" y1="8" x2="20" y2="8" stroke={INK} strokeWidth="1.8" />
      <line x1="4" y1="16" x2="20" y2="16" stroke={INK} strokeWidth="1.8" />
      <circle cx="9" cy="8" r="2.6" fill={WHITE} stroke={RED} strokeWidth="1.8" />
      <circle cx="15" cy="16" r="2.6" fill={WHITE} stroke={INK} strokeWidth="1.8" />
    </Svg>
  ),
  tag: (
    <Svg>
      <rect x="4" y="5" width="16" height="14" rx="2.6" stroke={INK} strokeWidth="1.8" />
      <path d="M12 8.4v7.2M13.9 10.1c-.6-.8-3.8-1-3.8.9 0 1.9 3.8 1 3.8 3 0 1.9-3.2 1.7-3.8.9" stroke={RED} strokeWidth="1.6" />
    </Svg>
  ),
  filter: (
    <Svg>
      <path d="M4 5h16l-6.2 7.2V18l-3.6 2v-7.8z" stroke={INK} strokeWidth="1.8" />
      <circle cx="18" cy="6.4" r="2.3" fill={RED} />
    </Svg>
  ),
  star: (
    <Svg>
      <path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.6l-4.6 1.7.9-5.1-3.8-3.7 5.2-.8z" stroke={INK} strokeWidth="1.8" />
      <circle cx="12" cy="11" r="1.7" fill={RED} />
    </Svg>
  ),
  people: (
    <Svg>
      <circle cx="9.5" cy="8" r="3" stroke={INK} strokeWidth="1.8" />
      <path d="M3.8 19c0-3.1 2.6-5 5.7-5s5.7 1.9 5.7 5" stroke={INK} strokeWidth="1.8" />
      <circle cx="18" cy="9.5" r="2.4" stroke={RED} strokeWidth="1.8" />
    </Svg>
  ),
  send: (
    <Svg>
      <path d="M21 4L3.5 11l6 2.3L12 20l3.2-5.7z" stroke={INK} strokeWidth="1.8" />
      <path d="M21 4l-11.5 9.3" stroke={RED} strokeWidth="1.8" />
    </Svg>
  ),
};

const stats = [
  { value: 2400, suffix: '+', label: 'ứng viên đang xây hồ sơ' },
  { value: 12000, suffix: '+', label: 'proof đã được xác minh' },
  { value: 1200, suffix: '+', label: 'cơ hội & Quest đang mở' },
];

const partners = [
  // Brand Việt — wordmark màu thương hiệu
  { id: 'vng', name: 'VNG', color: '#F4731C' },
  { id: 'shopee', name: 'Shopee', slug: 'shopee' },
  { id: 'momo', name: 'MoMo', color: '#A50064' },
  { id: 'grab', name: 'Grab', slug: 'grab' },
  { id: 'tiki', name: 'Tiki', color: '#1A94FF' },
  { id: 'zalo', name: 'Zalo', slug: 'zalo' },
  { id: 'viettel', name: 'Viettel', color: '#EE0033' },
  { id: 'fpt', name: 'FPT', fpt: true },
  // Brand quốc tế — logo chính hãng (Simple Icons)
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
    if (failed) return <span style={{ ...WORDMARK, color: '#4a434f' }}>{p.name}</span>;
    return (
      <img src={`https://cdn.simpleicons.org/${p.slug}`} alt={p.name} onError={() => setFailed(true)} style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
    );
  }
  return <span style={{ ...WORDMARK, color: p.color }}>{p.name}</span>;
}

const testimonials = [
  { quote: 'Mình apply một chạm, hồ sơ proof giúp được nhận phỏng vấn nhanh hơn hẳn.', name: 'Minh Anh', role: 'Sinh viên Marketing' },
  { quote: 'EXP và Level làm mình có động lực tham gia hoạt động hơn — như chơi game vậy.', name: 'Hoàng Nam', role: 'Sinh viên CNTT' },
  { quote: 'Một hồ sơ duy nhất dùng cho cả việc làm lẫn Quest CLB, rất tiện.', name: 'phat280405', role: 'Ứng viên · FPTU HCM' },
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
      <Link to={cta.to} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', borderRadius: '999px', background: INK, color: WHITE, fontWeight: '700', fontSize: '0.94rem', textDecoration: 'none' }}>
        {cta.label} <ArrowRight size={18} />
      </Link>
    </div>
  );
  return (
    <Reveal>
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', padding: '20px 0' }}>
        {reverse ? <>{copy}{media}</> : <>{media}{copy}</>}
      </section>
    </Reveal>
  );
}

/* Flat "media" mocks (thay cho 3D render trả phí của Wellfound) */
function MediaPanel({ bg, children }) {
  return (
    <div style={{ background: bg, borderRadius: '24px', padding: 'clamp(28px, 4vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
      <div style={{ width: '100%', maxWidth: '360px', background: WHITE, borderRadius: '18px', boxShadow: '0 16px 40px rgba(30,19,32,0.10)', padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

export function CandidateLandingPage() {
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
            <Link to="/candidate/login" style={{ fontSize: '0.96rem', fontWeight: '600', color: INK, textDecoration: 'none' }}>Đăng nhập</Link>
          </div>
        </nav>
      </div>

      {/* HERO — centered */}
      <div style={{ ...INNER }}>
        <section style={{ textAlign: 'center', padding: 'clamp(48px, 9vw, 110px) 0 clamp(36px, 6vw, 72px)', maxWidth: '46rem', margin: '0 auto' }}>
          <p style={{ ...EYEBROW }}>Dành cho ứng viên sinh viên</p>
          <h1 style={{ fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', fontWeight: '800', lineHeight: 1.02, letterSpacing: '-0.045em', color: INK, margin: '0 0 22px' }}>
            Hồ sơ của bạn<span style={{ color: RED }}>.</span><br />Cơ hội của bạn<span style={{ color: RED }}>.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.55, color: MUTED, margin: '0 auto 30px', maxWidth: '34rem' }}>
            Tạo hồ sơ nêu bật kỹ năng và mong muốn của bạn, gom proof thật — rồi ứng tuyển mọi cơ hội chỉ với một chạm.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/candidate/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', background: INK, color: WHITE, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
              Tạo hồ sơ <ArrowRight size={18} />
            </Link>
            <Link to="/candidate/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', background: WHITE, color: INK, border: `1.5px solid ${INK}`, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
              Tôi đã có tài khoản
            </Link>
          </div>
        </section>
      </div>

      {/* Lower content */}
      <div style={{ ...INNER, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* STATS — white with dividers */}
        <section ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', padding: 'clamp(24px, 4vw, 48px) 0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          {stats.map((item, i) => (
            <div key={item.label} style={{ textAlign: 'center', borderLeft: i === 0 ? 'none' : `1px solid ${LINE}` }}>
              <div style={{ fontSize: 'clamp(2.6rem, 6vw, 4rem)', fontWeight: '800', color: INK, lineHeight: 1, letterSpacing: '-0.04em' }}>
                <AnimatedStatNumber value={item.value} suffix={item.suffix} run={statsRun} />
              </div>
              <div style={{ fontSize: '0.92rem', color: MUTED, fontWeight: '600', marginTop: '12px' }}>{item.label}</div>
            </div>
          ))}
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

        {/* FEATURE 1 — media left, copy right */}
        <FeatureSection
          eyebrow="Ứng tuyển một chạm"
          title="Hồ sơ nổi bật, ứng tuyển chỉ với một click"
          points={[
            { icon: GLYPHS.click, title: 'Ứng tuyển một chạm', desc: 'Không cần cover letter — hồ sơ của bạn là tất cả. Một click là xong.' },
            { icon: GLYPHS.sliders, title: 'Đặt mong muốn của bạn', desc: 'Nêu rõ kỳ vọng (thù lao, lĩnh vực, hình thức) ngay từ đầu.' },
          ]}
          cta={{ label: 'Tạo hồ sơ miễn phí', to: '/candidate/register' }}
          media={(
            <MediaPanel bg={GREEN_SOFT}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: INK, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>PT</span>
                <div><div style={{ fontWeight: '800', fontSize: '0.94rem' }}>phat280405</div><div style={{ fontSize: '0.78rem', color: MUTED }}>FPTU HCM</div></div>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '700', color: '#1f7a4d', background: '#e6f4ec', padding: '3px 9px', borderRadius: '999px' }}><ShieldCheck size={12} />Verified</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {['Figma', 'React', 'Sự kiện'].map((s) => <span key={s} style={{ fontSize: '0.74rem', fontWeight: '600', color: INK, background: PINK, borderRadius: '8px', padding: '4px 10px' }}>{s}</span>)}
              </div>
              <div style={{ background: INK, color: WHITE, borderRadius: '12px', padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '0.9rem' }}>Ứng tuyển 1 chạm</div>
            </MediaPanel>
          )}
        />

        {/* FEATURE 2 — copy left, media right */}
        <FeatureSection
          reverse
          eyebrow="Mọi thông tin, ngay từ đầu"
          title="Biết rõ cơ hội trước khi ứng tuyển"
          points={[
            { icon: GLYPHS.tag, title: 'Minh bạch thù lao', desc: 'Xem mức thù lao và quyền lợi trước khi nộp — không đoán mò.' },
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
                  <span style={{ fontWeight: '800', color: '#1f7a4d', fontSize: '0.88rem' }}>3.000.000đ</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: INK, background: PINK, borderRadius: '8px', padding: '3px 9px' }}>RS 60+</span>
                </div>
              </div>
            </MediaPanel>
          )}
        />

        {/* FEATURE 3 — media left, copy right */}
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
              <div style={{ background: INK, color: WHITE, borderRadius: '12px', padding: '10px 12px', fontSize: '0.84rem', marginLeft: 'auto', marginBottom: '12px', maxWidth: '70%' }}>Cảm ơn anh/chị ạ!</div>
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
            <span style={{ display: 'inline-flex', width: '54px', height: '54px', borderRadius: '16px', background: RED, color: WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}><BadgeCheck size={26} /></span>
            <h2 style={{ ...H2, color: WHITE, marginBottom: '10px' }}>Sẵn sàng tìm bước tiếp theo?</h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', margin: '0 auto 26px', maxWidth: '32rem' }}>Tạo hồ sơ ứng viên miễn phí và bắt đầu biến trải nghiệm thành cơ hội thật.</p>
            <Link to="/candidate/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 30px', borderRadius: '999px', background: WHITE, color: INK, fontWeight: '700', fontSize: '0.98rem', textDecoration: 'none' }}>
              Tạo hồ sơ miễn phí <ArrowRight size={18} />
            </Link>
          </section>
        </Reveal>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${LINE}`, marginTop: '12px', paddingTop: '28px', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '24px' }}>
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
        </footer>
      </div>
    </div>
  );
}
