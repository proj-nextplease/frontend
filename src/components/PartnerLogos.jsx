/**
 * "Nhiều nhà tuyển dụng đang tìm tân binh giỏi" — a heading over an infinite
 * horizontal marquee of employer logo chips (upzi-style). Real brand logos are
 * trademarks, so this ships neutral placeholder names; drop licensed logo files
 * into /public/companies (1.png … 8.png) to have them auto-replace the text.
 */

const INK = '#0f2e2b';
const EMERALD = '#10b981';

/* Original geometric marks — invented brands, no real trademarks. */
const svgProps = { className: 'np-logo-mark', viewBox: '0 0 24 24', width: 26, height: 26, 'aria-hidden': true };
const MARKS = {
  aurora: (<svg {...svgProps}><path d="M4 18a8 8 0 0 1 16 0" stroke="#0d9488" strokeWidth="2.4" fill="none" strokeLinecap="round" /><circle cx="12" cy="18" r="2.4" fill="#0d9488" /></svg>),
  nova: (<svg {...svgProps}><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="#4f46e5" /></svg>),
  leaf: (<svg {...svgProps}><path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill="#16a34a" /></svg>),
  vertex: (<svg {...svgProps}><path d="M12 4l8 15H4z" fill="#ea580c" /></svg>),
  lumina: (<svg {...svgProps}><circle cx="12" cy="12" r="9" fill="none" stroke="#0284c7" strokeWidth="2.2" /><circle cx="12" cy="12" r="3" fill="#0284c7" /></svg>),
  orbit: (<svg {...svgProps}><ellipse cx="12" cy="12" rx="10" ry="4.4" fill="none" stroke="#7c3aed" strokeWidth="2.2" transform="rotate(-28 12 12)" /><circle cx="12" cy="12" r="2.8" fill="#7c3aed" /></svg>),
  pulse: (<svg {...svgProps}><path d="M2 12h5l2-5 4 10 2-5h7" stroke="#e11d48" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  summit: (<svg {...svgProps}><path d="M2 19l7-11 4 6 3-4 6 9z" fill="#d97706" /></svg>),
};

const MARK_LIST = [MARKS.aurora, MARKS.nova, MARKS.leaf, MARKS.vertex, MARKS.lumina, MARKS.orbit, MARKS.pulse, MARKS.summit];

// Real employer logos: drop files into /public/companies with these names.
// A geometric placeholder mark shows until each file exists.
const PARTNERS = [
  { name: 'Daikin', img: '/companies/daikin.png' },
  { name: 'FPT IS', img: '/companies/fpt-is.png' },
  { name: 'FPT Software', img: '/companies/fpt-software.png' },
  { name: 'Home Credit', img: '/companies/homecredit.png' },
  { name: 'Maersk', img: '/companies/maersk.png' },
  { name: 'MB Bank', img: '/companies/mbbank.png' },
  { name: 'Techcombank', img: '/companies/techcombank.png' },
  { name: 'Thaco Auto', img: '/companies/thaco-auto.png' },
  { name: 'Viettel AI', img: '/companies/viettel-ai.png' },
  { name: 'Vingroup', img: '/companies/vingroup.png' },
  { name: 'Vinamilk', img: '/companies/vinamilk.png' },
].map((p, i) => ({ ...p, mark: MARK_LIST[i % MARK_LIST.length] }));

function LogoChip({ name, mark, img }) {
  return (
    <div className="np-logo-chip">
      <span className="np-logo-lockup">
        {mark}
        <span className="np-logo-name">{name}</span>
      </span>
      <img
        className="np-logo-img"
        src={img}
        alt={name}
        onLoad={(e) => { const lk = e.currentTarget.previousElementSibling; if (lk) lk.style.display = 'none'; }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}

export function PartnerLogos() {
  // Four copies so one loop-unit (translateX -50% = two copies) is always wider
  // than the viewport — no empty gap at the seam on wide screens.
  const loop = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];
  return (
    <div className="np-partners">
      <style>{`
        .np-partners-head { text-align: center; font-size: clamp(1.5rem, 3.2vw, 2.2rem); font-weight: 800; letter-spacing: -0.02em; color: ${INK}; line-height: 1.25; margin: 0 auto 40px; max-width: 34rem; }
        .np-partners-head b { color: ${EMERALD}; font-weight: 800; }
        .np-marquee { position: relative; overflow: hidden;
          width: 100vw; margin-left: calc(50% - 50vw);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
        .np-marquee-track { display: flex; width: max-content; animation: npMarquee 25s linear infinite; }
        @keyframes npMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .np-logo-chip { flex: 0 0 auto; position: relative; height: 76px; min-width: 172px; padding: 0 20px; margin-right: 34px;
          background: transparent; border: 0; box-shadow: none;
          display: flex; align-items: center; justify-content: center; }
        .np-logo-lockup { display: inline-flex; align-items: center; gap: 10px; }
        .np-logo-mark { flex-shrink: 0; display: block; }
        .np-logo-name { font-weight: 800; color: ${INK}; font-size: 1.06rem; letter-spacing: -0.02em; white-space: nowrap; }
        .np-logo-img { position: absolute; inset: 12px 20px; width: calc(100% - 40px); height: calc(100% - 24px); object-fit: contain; }
        @media (prefers-reduced-motion: reduce) { .np-marquee-track { animation: none; } }
      `}</style>

      <h2 className="np-partners-head">
        Rất nhiều nhà tuyển dụng đang tìm<br />
        <b>“tân binh”</b> giỏi — như chính bạn.
      </h2>

      <div className="np-marquee">
        <div className="np-marquee-track">
          {loop.map((p, i) => <LogoChip key={`${p.name}-${i}`} name={p.name} mark={p.mark} img={p.img} />)}
        </div>
      </div>
    </div>
  );
}
