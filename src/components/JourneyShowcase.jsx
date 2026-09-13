import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Crown, Zap, Briefcase, CheckCircle2, MapPin, Star } from 'lucide-react';

/**
 * "Cứ đi từng bước nhỏ" showcase — three square feature cards (upzi-style), each
 * with a rich mini-UI mockup (reputation passport / gamification / job match) on
 * a vivid pastel card with organic blobs, and title + description below.
 */

const TEAL = '#0d9488';
const EMERALD = '#10b981';
const INK = '#0f2e2b';
const MUTED = '#5b7772';
const LINE = '#e6efeb';
const AMBER = '#d97706';
const VIOLET = '#7c3aed';

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver((e) => setShown(e[0].isIntersecting), { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : 'translateY(30px)',
      transition: `opacity 0.7s ease-out ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>{children}</div>
  );
}

const cardBox = {
  background: '#fff', borderRadius: '18px', boxShadow: '0 18px 40px rgba(6,40,36,0.14)',
  border: '1px solid #eef3f0',
};
const chip = (bg, color) => ({
  display: 'inline-flex', alignItems: 'center', gap: '5px', background: bg, color,
  fontSize: '0.76rem', fontWeight: 800, padding: '5px 11px', borderRadius: '999px', whiteSpace: 'nowrap',
});
const mockWrap = { position: 'relative', width: '90%', maxWidth: '330px' };

function Column({ bg, shapes = [], mockup, title, desc, delay }) {
  return (
    <Reveal delay={delay}>
      <div style={{ textAlign: 'center' }}>
        <div className="np-lift" style={{
          position: 'relative', aspectRatio: '1 / 1', borderRadius: '40px', background: bg,
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 46px rgba(6,40,36,0.12)',
        }}>
          {shapes.map((s, i) => <span key={i} style={{ position: 'absolute', ...s }} />)}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>{mockup}</div>
        </div>
        <h3 style={{ margin: '24px 0 8px', fontSize: '1.24rem', fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ margin: '0 auto', maxWidth: '20rem', fontSize: '0.95rem', color: MUTED, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </Reveal>
  );
}

/* ── Mockup 1 — reputation passport ── */
function PassportMock() {
  return (
    <div style={mockWrap}>
      <div style={{ ...cardBox, position: 'absolute', left: '22px', right: '-16px', top: '20px', bottom: '-16px', transform: 'rotate(5deg)', opacity: 0.5 }} />
      <div style={{ ...cardBox, position: 'relative', padding: '22px', transform: 'rotate(-3deg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: `linear-gradient(135deg,${EMERALD},${TEAL})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.98rem', flexShrink: 0 }}>MA</span>
          <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: INK }}>Minh Anh</span>
              <span style={{ ...chip('#e7f7f0', TEAL), flexShrink: 0 }}><ShieldCheck size={12} /> Xác minh</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: MUTED, whiteSpace: 'nowrap', marginTop: '2px' }}>FPTU HCM</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '9px', margin: '18px 0' }}>
          {[['72', 'RS', TEAL], ['5', 'Level', AMBER], ['1.2k', 'EXP', VIOLET]].map(([v, l, c]) => (
            <div key={l} style={{ flex: 1, textAlign: 'center', background: '#f6faf8', borderRadius: '12px', padding: '13px 0' }}>
              <div style={{ fontSize: '1.14rem', fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: '0.7rem', color: MUTED, fontWeight: 700 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {['React', 'Figma', 'Content'].map((s) => (
            <span key={s} style={chip('#eef6f2', INK)}><CheckCircle2 size={11} color={EMERALD} /> {s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mockup 2 — gamification ── */
function LevelMock() {
  return (
    <div style={mockWrap}>
      <div style={{ ...cardBox, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '44px', height: '44px', borderRadius: '13px', background: '#fff3d6', color: AMBER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown size={23} /></span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', color: MUTED, fontWeight: 700 }}>Cấp độ</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: INK, lineHeight: 1 }}>Level 5</div>
            </div>
          </div>
          <span style={chip('#fff0e0', AMBER)}>🔥 7 ngày</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: MUTED, fontWeight: 700, margin: '20px 0 7px' }}>
          <span>EXP</span><span>640 / 900</span>
        </div>
        <div style={{ height: '13px', borderRadius: '999px', background: '#eef3f0', overflow: 'hidden' }}>
          <div style={{ width: '71%', height: '100%', borderRadius: '999px', background: `linear-gradient(90deg,${EMERALD},${TEAL})` }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <span style={chip('#e7f7f0', TEAL)}><ShieldCheck size={12} /> RS +5</span>
          <span style={chip('#f0eafe', VIOLET)}><Zap size={12} /> +300 EXP</span>
        </div>
      </div>
      <span style={{ position: 'absolute', right: '-12px', bottom: '-18px', transform: 'rotate(-6deg)', background: `linear-gradient(135deg,${EMERALD},${TEAL})`, color: '#fff', fontSize: '0.8rem', fontWeight: 800, padding: '8px 15px', borderRadius: '999px', boxShadow: '0 10px 20px rgba(13,148,136,0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <Star size={13} fill="#fff" /> Lên cấp!
      </span>
    </div>
  );
}

/* ── Mockup 3 — job match ── */
function MatchMock() {
  return (
    <div style={mockWrap}>
      <div style={{ ...cardBox, padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: INK }}>Gợi ý cho bạn</span>
          <span style={chip('#e7f7f0', TEAL)}><Star size={11} fill={TEAL} /> Phù hợp 95%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px', borderRadius: '14px', border: `1px solid ${LINE}`, background: '#f9fdfb' }}>
          <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e7f7f0', color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Briefcase size={21} /></span>
          <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: INK }}>Thực tập Marketing số</div>
            <div style={{ fontSize: '0.76rem', color: MUTED, display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '3px' }}>
              <span style={{ color: AMBER, fontWeight: 700 }}>3 – 5 triệu</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> TP.HCM</span>
            </div>
          </div>
        </div>
        <button type="button" style={{ marginTop: '14px', width: '100%', border: 'none', background: `linear-gradient(135deg,${EMERALD},${TEAL})`, color: '#fff', fontWeight: 800, fontSize: '0.92rem', padding: '12px 0', borderRadius: '12px', cursor: 'default' }}>Ứng tuyển ngay</button>
      </div>
      <span style={{ position: 'absolute', left: '-12px', bottom: '-18px', transform: 'rotate(-5deg)', background: '#fff', color: TEAL, fontSize: '0.78rem', fontWeight: 800, padding: '8px 14px', borderRadius: '999px', boxShadow: '0 10px 20px rgba(6,40,36,0.18)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <CheckCircle2 size={13} color={EMERALD} /> RS đủ điều kiện
      </span>
    </div>
  );
}

export function JourneyShowcase() {
  return (
    <div className="np-grid-3" style={{ marginTop: '48px', gap: '40px', alignItems: 'start' }}>
      <Column
        delay={0}
        bg="linear-gradient(150deg,#8fe3c0,#bff0dc)"
        shapes={[
          { width: '260px', height: '260px', borderRadius: '46% 54% 52% 48%', background: 'rgba(255,255,255,0.5)', top: '-90px', right: '-70px' },
          { width: '210px', height: '210px', borderRadius: '52% 48% 45% 55%', background: 'rgba(6,120,90,0.16)', bottom: '-80px', left: '-60px' },
          { width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', bottom: '40px', right: '-40px' },
        ]}
        mockup={<PassportMock />}
        title="Hiểu năng lực của bạn"
        desc="Thay CV tự khai bằng hồ sơ năng lực có kiểm chứng — mỗi kỹ năng gắn với proof thật."
      />
      <Column
        delay={120}
        bg="linear-gradient(150deg,#ffd98a,#ffe9ac)"
        shapes={[
          { width: '260px', height: '260px', borderRadius: '50% 50% 48% 52%', background: 'rgba(255,255,255,0.48)', top: '-90px', left: '-70px' },
          { width: '210px', height: '210px', borderRadius: '55% 45% 50% 50%', background: 'rgba(217,119,6,0.15)', bottom: '-80px', right: '-60px' },
          { width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.38)', top: '50px', right: '-45px' },
        ]}
        mockup={<LevelMock />}
        title="Tích luỹ uy tín"
        desc="Hoàn thành việc làm & Quest để tích EXP, lên Level và tăng điểm uy tín (RS) thật sự."
      />
      <Column
        delay={240}
        bg="linear-gradient(150deg,#a9c8ff,#cfe2ff)"
        shapes={[
          { width: '260px', height: '260px', borderRadius: '48% 52% 50% 50%', background: 'rgba(255,255,255,0.5)', top: '-90px', right: '-70px' },
          { width: '210px', height: '210px', borderRadius: '50% 50% 55% 45%', background: 'rgba(37,99,235,0.14)', bottom: '-80px', left: '-60px' },
          { width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', bottom: '30px', left: '-40px' },
        ]}
        mockup={<MatchMock />}
        title="Nhận cơ hội phù hợp"
        desc="Một hồ sơ duy nhất mở khoá việc làm và Quest CLB đúng với năng lực của bạn."
      />
    </div>
  );
}
