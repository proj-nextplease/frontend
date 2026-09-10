import { useEffect, useMemo, useRef, useState } from 'react';
import { TrendingUp, Zap, Star, Sparkles } from 'lucide-react';

/**
 * Dependency-free confetti + reward celebration overlay and an animated CountUp.
 *
 * Drives the gamification "juice" layer: when a candidate levels up, claims an
 * EXP reward, or gains NP, a short full-screen burst fires. Purely presentational
 * and non-blocking (pointer-events: none) so it never gets in the way of a flow.
 */

const CONFETTI_COLORS = ['#f59e0b', '#2563eb', '#16a34a', '#ec4899', '#7c3aed', '#fb923c', '#4ade80'];

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// Deterministic pseudo-random in [0,1) from an index + salt. Pure (no Math.random),
// so confetti can be built during render without tripping the hooks purity rule
// while still looking scattered.
function seeded(i, salt) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function Confetti({ count = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: seeded(i, 1) * 100,
        delay: seeded(i, 2) * 0.25,
        duration: 1.7 + seeded(i, 3) * 1.5,
        rotate: seeded(i, 4) * 720 - 360,
        color: CONFETTI_COLORS[Math.floor(seeded(i, 5) * CONFETTI_COLORS.length)],
        size: 6 + seeded(i, 6) * 8,
        drift: (seeded(i, 7) - 0.5) * 260,
        round: seeded(i, 8) > 0.7,
      })),
    [count],
  );

  return (
    <div className="np-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * (p.round ? 1 : 0.5)}px`,
            background: p.color,
            borderRadius: p.round ? '50%' : '1px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--np-drift': `${p.drift}px`,
            '--np-rot': `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}

const KIND_THEME = {
  levelup: { color: '#f59e0b', ring: 'rgba(245,158,11,0.18)', Icon: TrendingUp },
  exp: { color: '#7c3aed', ring: 'rgba(124,58,237,0.18)', Icon: Zap },
  np: { color: '#16a34a', ring: 'rgba(22,163,74,0.18)', Icon: Star },
  default: { color: '#2563eb', ring: 'rgba(37,99,235,0.18)', Icon: Sparkles },
};

/**
 * Renders a celebration when `celebration` is a non-null object, then calls
 * `onDone` after `celebration.duration` (default 2800ms).
 * celebration = { kind: 'levelup'|'exp'|'np', title, subtitle?, duration? }
 */
export function CelebrationLayer({ celebration, onDone }) {
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!celebration) return undefined;
    const t = setTimeout(onDone, celebration.duration ?? (reduced ? 1600 : 2800));
    return () => clearTimeout(t);
  }, [celebration, onDone, reduced]);

  if (!celebration) return null;
  const theme = KIND_THEME[celebration.kind] || KIND_THEME.default;
  const Icon = theme.Icon;

  return (
    <div className="np-celebrate-root" role="status" aria-live="polite">
      {!reduced && <Confetti />}
      <div className="np-celebrate-card" style={{ borderColor: `${theme.color}55` }}>
        <span className="np-celebrate-ring" style={{ background: theme.ring, color: theme.color }}>
          <Icon size={30} />
        </span>
        <div className="np-celebrate-title" style={{ color: theme.color }}>{celebration.title}</div>
        {celebration.subtitle && <div className="np-celebrate-sub">{celebration.subtitle}</div>}
      </div>

      <style>{`
        .np-celebrate-root {
          position: fixed; inset: 0; z-index: 100000;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .np-confetti { position: absolute; inset: 0; overflow: hidden; }
        .np-confetti > span {
          position: absolute; top: -24px; display: block;
          animation-name: npConfettiFall; animation-timing-function: cubic-bezier(.3,.6,.5,1);
          animation-iteration-count: 1; animation-fill-mode: forwards;
        }
        @keyframes npConfettiFall {
          0%   { transform: translateY(-24px) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(104vh) translateX(var(--np-drift)) rotate(var(--np-rot)); opacity: 0.85; }
        }
        .np-celebrate-card {
          position: relative;
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
          padding: 26px 34px; border-radius: 22px;
          background: var(--card-bg, #fff); border: 1.5px solid;
          box-shadow: 0 24px 60px rgba(15,23,42,0.28), 0 4px 12px rgba(15,23,42,0.12);
          animation: npCelebratePop 0.5s cubic-bezier(.2,1.3,.5,1) both;
        }
        @keyframes npCelebratePop {
          0%   { transform: scale(0.6) translateY(14px); opacity: 0; }
          60%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .np-celebrate-ring {
          display: inline-flex; align-items: center; justify-content: center;
          width: 62px; height: 62px; border-radius: 50%;
          animation: npCelebrateRing 1.4s ease-in-out infinite;
        }
        @keyframes npCelebrateRing { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .np-celebrate-title { font-size: 1.7rem; font-weight: 900; letter-spacing: -0.01em; line-height: 1.1; }
        .np-celebrate-sub { font-size: 0.9rem; font-weight: 600; color: var(--muted, #64748b); max-width: 260px; }
        @media (prefers-reduced-motion: reduce) {
          .np-celebrate-card { animation: none; }
          .np-celebrate-ring { animation: none; }
        }
      `}</style>
    </div>
  );
}

/**
 * Smoothly counts from the previous value to the new one when `value` changes.
 * A decrease jumps instantly (avoids awkward down-ticks on data swaps / spends),
 * unless `animateDown` is set.
 */
export function CountUp({ value, duration = 750, animateDown = false, format = (n) => Math.round(n).toLocaleString('vi-VN') }) {
  const numeric = Number(value) || 0;
  const [display, setDisplay] = useState(numeric);
  const fromRef = useRef(numeric);
  const rafRef = useRef();

  useEffect(() => {
    const from = fromRef.current;
    const to = numeric;
    if (from === to || (to < from && !animateDown)) {
      fromRef.current = to;
      setDisplay(to);
      return undefined;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [numeric, duration, animateDown]);

  return <>{format(display)}</>;
}
