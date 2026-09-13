/**
 * Reusable decorative section background. `variant` picks the colour palette,
 * `pattern` picks the motif — so every section can share the palette system yet
 * show a distinct decoration. Drop <WaveBg .../> as the first child of a
 * position:relative section, pair it with WAVE_BASE[variant] as the section
 * background, and keep the section's content in a position:relative / z-index:1
 * wrapper so it sits on top.
 */

const VARIANTS = {
  emerald: { a: 'rgba(255,255,255,0.06)', b: 'rgba(4,50,44,0.16)', glow: 'rgba(250,204,21,0.16)' },
  teal:    { a: 'rgba(255,255,255,0.07)', b: 'rgba(3,45,40,0.20)', glow: 'rgba(94,234,212,0.16)' },
  mint:    { a: 'rgba(255,255,255,0.6)',  b: 'rgba(13,148,136,0.09)', glow: 'rgba(16,185,129,0.12)' },
  mint2:   { a: 'rgba(255,255,255,0.75)', b: 'rgba(13,148,136,0.07)', glow: 'rgba(16,185,129,0.08)' },
  snow:    { a: 'rgba(15,118,110,0.04)',  b: 'rgba(13,148,136,0.055)', glow: 'rgba(16,185,129,0.05)' },
};

/* Section base gradients that pair with each palette. */
export const WAVE_BASE = {
  emerald: 'linear-gradient(158deg, #0f766e 0%, #0d9488 52%, #115e59 100%)',
  teal:    'linear-gradient(160deg, #0b5f58 0%, #0e857a 55%, #0a4f48 100%)',
  mint:    'linear-gradient(160deg, #eafaf3 0%, #d6f3e6 100%)',
  mint2:   'linear-gradient(165deg, #f3faf6 0%, #e6f6ef 100%)',
  snow:    'linear-gradient(170deg, #ffffff 0%, #f2f9f5 100%)',
};

const VB = { viewBox: '0 0 1200 460', preserveAspectRatio: 'xMidYMid slice', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' }, fill: 'none' };

function Pattern({ pattern, v }) {
  switch (pattern) {
    // three slim flowing ribbons
    case 'waves2':
      return (
        <svg {...VB} strokeLinecap="round">
          <path d="M-100 90 C 250 -10, 480 200, 820 90 S 1300 -20, 1520 120" stroke={v.a} strokeWidth="82" />
          <path d="M-100 250 C 260 150, 540 360, 900 240 S 1320 130, 1520 260" stroke={v.b} strokeWidth="72" />
          <path d="M-100 410 C 300 320, 560 500, 940 390 S 1340 310, 1520 430" stroke={v.a} strokeWidth="64" />
        </svg>
      );
    // stacked wavy "hills" rising from the bottom (topographic layers)
    case 'layers':
      return (
        <svg {...VB}>
          <path d="M0 300 C 300 250, 520 350, 820 300 S 1200 250, 1200 300 L1200 460 L0 460 Z" fill={v.a} />
          <path d="M0 356 C 280 314, 560 406, 880 356 S 1200 320, 1200 356 L1200 460 L0 460 Z" fill={v.b} />
          <path d="M0 408 C 320 376, 600 452, 920 408 S 1200 388, 1200 408 L1200 460 L0 460 Z" fill={v.a} />
        </svg>
      );
    // thin parallel wavy contour lines (topographic map)
    case 'contour':
      return (
        <svg {...VB}>
          {[30, 95, 160, 225, 290, 355, 420].map((y, i) => (
            <path
              key={y}
              d={`M-40 ${y} C 240 ${y - 34}, 420 ${y + 34}, 760 ${y} S 1240 ${y - 30}, 1440 ${y + 18}`}
              stroke={i % 2 ? v.a : v.b}
              strokeWidth={i % 2 ? 2.4 : 3}
            />
          ))}
        </svg>
      );
    // concentric ripple rings from the corners
    case 'ripple':
      return (
        <svg {...VB}>
          {[80, 175, 275, 385, 505].map((r) => <circle key={r} cx="1140" cy="440" r={r} stroke={v.b} strokeWidth="2.6" />)}
          {[70, 155, 250].map((r) => <circle key={`a${r}`} cx="40" cy="30" r={r} stroke={v.a} strokeWidth="2.6" />)}
        </svg>
      );
    // two big flowing ribbons
    case 'waves':
    default:
      return (
        <svg {...VB} strokeLinecap="round">
          <path d="M-120 350 C 220 200, 420 470, 760 320 S 1260 150, 1440 280" stroke={v.a} strokeWidth="130" />
          <path d="M-80 110 C 300 -40, 540 230, 940 70 S 1320 -60, 1520 130" stroke={v.b} strokeWidth="110" />
        </svg>
      );
  }
}

export function WaveBg({ variant = 'emerald', pattern = 'waves' }) {
  const v = VARIANTS[variant] || VARIANTS.emerald;
  const showGlow = pattern === 'waves' || pattern === 'waves2' || pattern === 'layers';
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Pattern pattern={pattern} v={v} />
      {showGlow && (
        <div style={{ position: 'absolute', top: '-90px', right: '-70px', width: '340px', height: '340px', borderRadius: '50%', background: v.glow, filter: 'blur(24px)' }} />
      )}
    </div>
  );
}
