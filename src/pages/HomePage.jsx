import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Users, Megaphone, Star,
  GraduationCap, Search, Quote,
} from 'lucide-react';
import { Button } from '../components/astryx/Button.jsx';
import { EnvelopeArt } from '../components/EnvelopeArt.jsx';
import { JourneyShowcase } from '../components/JourneyShowcase.jsx';
import { OpportunityClaw } from '../components/OpportunityClaw.jsx';
import { IdealCompanion } from '../components/IdealCompanion.jsx';
import { PartnerLogos } from '../components/PartnerLogos.jsx';
import { WaveBg, WAVE_BASE } from '../components/WaveBg.jsx';
import { prefetchJobs } from '../api/jobsCache.js';
import { Mascot } from 'page-mascot';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';

/* ── Emerald / xanh ngọc palette (Gen-Z, single light look) ── */
const TEAL = '#0d9488';        // deep teal — logo accent, stat numbers, primary links
const EMERALD = '#10b981';     // brand accent — underlines, headline accent, badges
const INK = '#0f2e2b';
const MUTED = '#5b7772';
const LINE = '#e2efe9';
const MINT = '#e7f7f0';        // pastel section / badge background
const YELLOW = '#facc15';      // warm accent on dark bands
const WHITE = '#ffffff';
const HERO_GRAD = 'linear-gradient(158deg, #0f766e 0%, #0d9488 52%, #115e59 100%)';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };
const BAND = (extra = {}) => ({ ...INNER, padding: 'clamp(54px, 8vw, 92px) 20px', ...extra });

const TYPE_PHRASES = [
  'Không biết bắt đầu từ đâu?',
  'Chưa có gì chứng minh năng lực?',
  'Muốn cơ hội nhưng thiếu proof?',
];

const testimonials = [
  { quote: 'Chúng tôi lọc ứng viên trẻ dựa trên bằng chứng công việc thật thay vì CV tự khai.', name: 'Hiring Partner', role: 'Doanh nghiệp tuyển dụng' },
  { quote: 'Sinh viên nhìn thấy lộ trình rõ ràng: proof, level, quest rồi tới cơ hội tiếp theo.', name: 'Campus Organizer', role: 'CLB / Tổ chức' },
  { quote: 'Một hồ sơ duy nhất, đi đâu cũng được công nhận. Mình thấy nỗ lực được ghi nhận.', name: 'phat280405', role: 'Ứng viên · FPTU HCM' },
];

function Heading({ line1, line2, align = 'left' }) {
  return (
    <h2 style={{
      fontSize: 'clamp(1.9rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.08,
      letterSpacing: '-0.03em', margin: 0, textAlign: align, color: INK,
    }}>
      {line1}<br /><span style={{ color: EMERALD }}>{line2}</span>
    </h2>
  );
}

function Badge({ children, onDark = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      background: onDark ? 'rgba(255,255,255,0.14)' : MINT,
      color: onDark ? '#eafff7' : TEAL,
      border: `1px solid ${onDark ? 'rgba(255,255,255,0.22)' : '#cdeee2'}`,
      borderRadius: '999px', padding: '7px 15px', fontSize: '0.8rem', fontWeight: 800,
    }}>{children}</span>
  );
}

function Reveal({ children, delay = 0, x = 0, y = 30, dur = 0.8, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver((entries) => setShown(entries[0].isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      ...style,
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : `translate(${x}px, ${y}px)`,
      transition: `opacity ${dur * 0.9}s ease-out ${delay}ms, transform ${dur}s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>{children}</div>
  );
}

export function HomePage() {
  const [typed, setTyped] = useState('');

  /* Warm up the jobs list so the /jobs page shows instantly. */
  useEffect(() => { prefetchJobs().catch(() => {}); }, []);

  /* Cycling typewriter headline. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyped(TYPE_PHRASES[0]);
      return undefined;
    }
    let phrase = 0, char = 0, deleting = false, timer;
    function step() {
      const full = TYPE_PHRASES[phrase];
      if (!deleting) {
        char += 1;
        setTyped(full.slice(0, char));
        if (char === full.length) { deleting = true; timer = setTimeout(step, 1700); return; }
        timer = setTimeout(step, 68);
      } else {
        char -= 1;
        setTyped(full.slice(0, char));
        if (char === 0) { deleting = false; phrase = (phrase + 1) % TYPE_PHRASES.length; timer = setTimeout(step, 320); return; }
        timer = setTimeout(step, 34);
      }
    }
    timer = setTimeout(step, 700);
    return () => clearTimeout(timer);
  }, []);


  return (
    <div style={{ background: WHITE, color: INK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', overflowX: 'clip', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      <style>{`
        .np-navlink { position: relative; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 0.95rem; font-weight: 600; color: ${INK}; text-decoration: none; padding: 4px 0; transition: color 0.2s ease; }
        .np-navlink::after { content: ''; position: absolute; left: 0; bottom: -2px; height: 2px; width: 100%; background: ${EMERALD}; transform: scaleX(0); transform-origin: left; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1); }
        .np-navlink:hover { color: ${TEAL}; }
        .np-navlink:hover::after { transform: scaleX(1); }
        .np-navlink.active { background: ${MINT}; color: ${TEAL}; border-radius: 999px; padding: 7px 14px; font-weight: 800; }
        .np-navlink.active::after { display: none; }
        :focus-visible { outline: 2px solid ${EMERALD}; outline-offset: 3px; border-radius: 8px; }
        .np-nav-cta { display: none; }
        @media (min-width: 760px) { .np-nav-cta { display: inline-flex; } }
        @media (max-width: 899px) { .np-navlinks, .np-nav-recruiter { display: none !important; } }
        .np-lift { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease; will-change: transform; }
        .np-lift:hover { transform: translateY(-6px); box-shadow: 0 30px 60px rgba(13,148,136,0.18); }
        .np-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .np-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: center; }
        @media (max-width: 820px) { .np-grid-3 { grid-template-columns: 1fr; } .np-grid-2 { grid-template-columns: 1fr; } }

        /* ── Linh vật neo góc dưới-trái ── */
        .np-mascot-dock { position: fixed; left: 24px; bottom: 20px; z-index: 1100;
                          filter: drop-shadow(0 12px 24px rgba(4,47,42,0.22)); }
        /* Màn hình hẹp: ẩn hẳn. Một khối 180px cố định chiếm gần nửa bề ngang
           điện thoại, mà ở đó nó cũng không bám con trỏ được. */
        @media (max-width: 1100px) { .np-mascot-dock { display: none; } }

        /* ── Hero typewriter cursor ── */
        .np-hero-cursor { display: inline-block; width: 3px; height: 1em; background: ${YELLOW}; margin-left: 4px; vertical-align: -2px; animation: npBlink 1s steps(1) infinite; }
        @keyframes npBlink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .np-hero-cursor { animation: none; } }
      `}</style>

      {/* Linh vật của trang — neo cố định ở góc dưới-trái nên cuộn tới đâu nó
          theo tới đó. Góc dưới-phải đã có nút đổi sáng/tối (z-index 1200), nên
          mascot nằm bên trái và thấp hơn một bậc để không tranh chỗ.
          Nhìn theo con trỏ, nháy mắt khi bị bấm; thư viện tự tắt phần bám con
          trỏ khi không có chuột và tôn trọng prefers-reduced-motion. */}
      <div className="np-mascot-dock">
        <Mascot
          directions="/mascots/frog-directions.webp"
          reactions="/mascots/frog-reactions.webp"
          size={180}
          label="Linh vật nextplease"
        />
      </div>

      {/* 0. HEADER — shared emerald marketing bar */}
      <SiteHeader />

      {/* 1. HERO — emerald wave band with the envelope animation */}
      <section style={{ background: WAVE_BASE.emerald, width: '100%', position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="emerald" pattern="waves" />
        <div style={{ ...INNER, position: 'relative', zIndex: 1, padding: 'clamp(48px, 6vw, 80px) 20px 0px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#fff', margin: 0, minHeight: '2.3em' }}>
            {typed}<span className="np-hero-cursor" />
          </h1>

          {/* Envelope + paper plane scene */}
          <EnvelopeArt />

        </div>
      </section>

      {/* 2. JOURNEY */}
      <section style={{ background: WAVE_BASE.snow, position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="snow" pattern="contour" />
        <div style={{ ...BAND(), position: 'relative', zIndex: 1 }}>
          <Reveal>
            <Heading line1="Cứ đi từng bước nhỏ." line2="nextplease đi cùng bạn." />
            <p style={{ marginTop: '16px', fontSize: '1.04rem', color: MUTED, maxWidth: '38rem', lineHeight: 1.6 }}>
              Từ hồ sơ đầu tiên đến cơ hội thật — mỗi hoạt động của bạn đều được ghi nhận và biến thành uy tín.
            </p>
          </Reveal>
          <JourneyShowcase />
        </div>
      </section>

      {/* 4. PROOF → OPPORTUNITY — playful claw band */}
      <section style={{ background: WAVE_BASE.mint, position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="mint" pattern="layers" />
        <div style={{ ...BAND(), position: 'relative', zIndex: 1 }}>
          <div className="np-grid-2" style={{ alignItems: 'center' }}>
            <Reveal x={-140} y={0} dur={1.4}>
              <div>
                <div style={{ marginTop: 0 }}>
                  <Heading line1="Proof thật." line2="Cơ hội thật." />
                </div>
                <p style={{ marginTop: '16px', fontSize: '1.04rem', color: MUTED, maxWidth: '30rem', lineHeight: 1.6 }}>
                  Làm thật, được ghi nhận, gặp đúng cơ hội.
                </p>
              </div>
            </Reveal>
            <Reveal x={140} y={0} dur={1.4}>
              <OpportunityClaw />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. IDEAL COMPANION — upzi-style paper-note features */}
      <section style={{ background: WAVE_BASE.mint2, position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="mint2" pattern="ripple" />
        <div style={{ ...BAND(), position: 'relative', zIndex: 1 }}>
          <Reveal>
            <IdealCompanion />
          </Reveal>
        </div>
      </section>

      {/* 6b. PARTNER LOGOS — employers hiring marquee */}
      <section style={{ background: WAVE_BASE.snow, position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="snow" pattern="contour" />
        <div style={{ ...BAND(), position: 'relative', zIndex: 1 }}>
          <Reveal>
            <PartnerLogos />
          </Reveal>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section id="thao-luan" style={{ background: WAVE_BASE.mint, position: 'relative', overflow: 'hidden', scrollMarginTop: '80px' }}>
        <WaveBg variant="mint" pattern="layers" />
        <div style={{ ...BAND(), position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Badge><Quote size={14} /> Cộng đồng</Badge>
              <div style={{ marginTop: '16px' }}>
                <Heading line1="nextplease trong mắt" line2="sinh viên & nhà tuyển dụng." align="center" />
              </div>
            </div>
          </Reveal>
          <div className="np-grid-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.quote} delay={i * 120} style={{ height: '100%' }}>
                <div className="np-lift" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', border: `1px solid ${LINE}`, borderRadius: '22px', padding: '30px', boxShadow: '0 10px 30px rgba(13,148,136,0.05)', boxSizing: 'border-box' }}>
                  <span style={{ display: 'inline-flex', width: '46px', height: '46px', borderRadius: '14px', background: MINT, color: TEAL, alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}><Quote size={22} /></span>
                  <p style={{ fontSize: '1rem', lineHeight: 1.6, color: INK, margin: '0 0 20px', fontWeight: 500 }}>{t.quote}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontWeight: 800, color: INK, fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.84rem', color: MUTED }}>{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA — full-bleed emerald band with flowing decor */}
      <section style={{ background: WAVE_BASE.teal, position: 'relative', overflow: 'hidden' }}>
        <WaveBg variant="teal" pattern="waves2" />
        <div style={{ ...BAND({ padding: 'clamp(72px, 10vw, 128px) 20px' }), position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em', color: '#fff', margin: '0 auto', maxWidth: '20rem' }}>
              Đọc tới đây rồi,<br /><span style={{ color: YELLOW }}>không lẽ không thử?</span>
            </h2>
            <p style={{ margin: '20px auto 0', fontSize: '1.12rem', color: 'rgba(255,255,255,0.86)', lineHeight: 1.6, maxWidth: '34rem' }}>
              Bạn sẽ không còn phải tự xoay xở một mình trên hành trình tìm việc — tạo hồ sơ miễn phí và để proof dẫn đường.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '36px', flexWrap: 'wrap' }}>
              <Button label="Tạo hồ sơ miễn phí" href="/candidate/register" variant="secondary" size="lg" style={{ background: '#fff', color: TEAL, border: 'none', fontWeight: 800 }} endContent={<GraduationCap size={18} />} />
              <Button label="Tôi cần tuyển người" href="/business/register" variant="secondary" size="lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.45)', fontWeight: 800 }} endContent={<Search size={18} />} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  );
}
