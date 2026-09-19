import { Pointer, BadgeCheck, Lightbulb } from 'lucide-react';

/**
 * "nextplease — người bạn đồng hành lý tưởng" (upzi-style): a centred heading
 * over three tilted sticky-note cards, each a folded-corner paper with a soft
 * blob and a line icon, a title and a short description. Emerald palette.
 */

const INK = '#0f2e2b';
const MUTED = '#5b7772';
const EMERALD = '#10b981';

const CARDS = [
  {
    img: '/companion/simple.png',
    icon: <Pointer size={70} strokeWidth={2} color="#f4715f" />,
    title: 'Đơn giản',
    desc: 'Tạo hồ sơ, thêm proof — xong. Không rối rắm.',
    tint: '#ffe9e4', blob: '#ffd2c8', fold: '#ffc4b8', rotate: -5,
  },
  {
    img: '/companion/trust.png',
    icon: <BadgeCheck size={70} strokeWidth={2} color="#7c3aed" />,
    title: 'Đáng tin cậy',
    desc: 'Mọi RS, EXP, NP đều minh bạch qua event log — không tự khai.',
    tint: '#ece7fb', blob: '#ddd2f7', fold: '#cfc0f3', rotate: 4,
  },
  {
    img: '/companion/smart.png',
    icon: <Lightbulb size={70} strokeWidth={2} color="#f59e0b" />,
    title: 'Thông minh',
    desc: 'Gợi ý đúng việc làm & Quest hợp gu bạn — dựa trên proof thật.',
    tint: '#fff0d9', blob: '#ffdfae', fold: '#ffd390', rotate: -3,
  },
];

function PaperNote({ tint, blob, fold }) {
  return (
    <svg className="np-comp-svg" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="80" cy="130" rx="46" ry="9" fill="rgba(15,46,43,0.06)" />
      {/* paper with a folded bottom-left corner */}
      <path d="M42 20 H110 Q124 20 124 34 V110 Q124 124 110 124 H60 L28 92 V34 Q28 20 42 20 Z" fill={tint} />
      {/* the turned-up flap */}
      <path d="M28 92 L60 124 H32 Q28 124 28 120 Z" fill={fold} />
      {/* soft blob behind the icon */}
      <ellipse cx="78" cy="66" rx="30" ry="27" fill={blob} />
    </svg>
  );
}

export function IdealCompanion() {
  return (
    <div className="np-comp">
      <style>{`
        .np-comp-head { text-align: center; font-size: clamp(1.9rem, 3.9vw, 2.8rem); font-weight: 800; letter-spacing: -0.02em; color: ${INK}; margin: 0 auto 56px; max-width: 34rem; line-height: 1.2; }
        .np-comp-head b { color: ${EMERALD}; font-weight: 800; }
        .np-comp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; }
        @media (max-width: 820px) { .np-comp-grid { grid-template-columns: 1fr; max-width: 24rem; margin: 0 auto; } }
        .np-comp-card { text-align: center; padding: 8px; }
        .np-comp-art { position: relative; width: 236px; height: 236px; max-width: 100%; margin: 0 auto 18px; transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); will-change: transform; }
        .np-comp-svg { width: 100%; height: 100%; display: block; }
        .np-comp-ic { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transform: translate(6px, -13px); }
        .np-comp-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; border-radius: 24px; }
        .np-comp-card:hover .np-comp-art { transform: rotate(0deg) translateY(-6px) scale(1.03); }
        .np-comp-title { font-size: 1.45rem; font-weight: 800; color: ${INK}; margin: 0 0 10px; }
        .np-comp-desc { font-size: 1.06rem; color: ${MUTED}; line-height: 1.6; margin: 0 auto; max-width: 20rem; }
        @media (prefers-reduced-motion: reduce) { .np-comp-art { transition: none; } }
      `}</style>

      <h2 className="np-comp-head"><b>nextplease</b> — người bạn đồng hành lý tưởng</h2>

      <div className="np-comp-grid">
        {CARDS.map(({ img, icon, title, desc, tint, blob, fold, rotate }) => (
          <div className="np-comp-card" key={title}>
            <div className="np-comp-art" style={{ transform: `rotate(${rotate}deg)` }}>
              {/* Recreated note (fallback) — real illustration overlays it when present. */}
              <PaperNote tint={tint} blob={blob} fold={fold} />
              <span className="np-comp-ic">{icon}</span>
              <img
                className="np-comp-img"
                src={img}
                alt=""
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <h3 className="np-comp-title">{title}</h3>
            <p className="np-comp-desc">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
