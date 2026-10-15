import { useRef, useState } from 'react';
import { ShieldCheck, Sparkles, Zap, Award } from 'lucide-react';
import { BrandWordmark } from './BrandWordmark.jsx';
import { EMERALD, NEON_RGB } from '../styles/neonPalette.js';

/**
 * HoloVIPCard
 * - Interactive 3D Holographic Founding Member Pass.
 * - Dynamic 3D tilt tracking with specular rainbow holographic shimmer.
 * - Layered depth (chip at translateZ(30px), text at translateZ(24px)).
 * - Gold/Emerald metallic circuit details, security guilloche watermark.
 */
export function HoloVIPCard({
  name = 'BẠN (EARLY ADOPTER)',
  code = '#FL-2026-VIP',
  tier = 'TOP 10 VIP FOUNDER',
  role = 'FOUNDING MEMBER',
  className = '',
  style = {},
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState(
    'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -16;
    const rotateY = ((x - centerX) / centerX) * 18;

    setTransform(
      `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`
    );

    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.85,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const displayName = (name && name.trim()) ? name.trim().toUpperCase() : 'FONLIO FOUNDING MEMBER';
  const displayCode = (code && code.trim()) ? code.trim() : '#FL-2026-VIP';

  return (
    <div
      className={`holo-card-container ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth: 440,
        margin: '0 auto',
        userSelect: 'none',
        ...style,
      }}
    >
      <style>{`
        .holo-card-container {
          perspective: 1200px;
        }
        .holo-card-inner {
          position: relative;
          aspect-ratio: 1.62 / 1;
          width: 100%;
          border-radius: 24px;
          background: linear-gradient(135deg, #0e141c 0%, #06090d 50%, #0a1118 100%);
          border: 1.5px solid rgba(185, 255, 0, 0.45);
          box-shadow:
            0 24px 60px -12px rgba(0, 0, 0, 0.95),
            0 0 35px rgba(${NEON_RGB}, 0.22),
            inset 0 1px 1px rgba(255, 255, 255, 0.2);
          transform-style: preserve-3d;
          transition: transform 0.16s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease;
          overflow: hidden;
          padding: clamp(18px, 3.8vw, 26px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* ── Guilloche Security Wave Background ── */
        .holo-card-bg-mesh {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 50% 50%, transparent 20%, rgba(185, 255, 0, 0.25) 21%, transparent 22%),
            radial-gradient(circle at 50% 50%, transparent 40%, rgba(45, 212, 191, 0.2) 41%, transparent 42%),
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(185, 255, 0, 0.15) 61%, transparent 62%);
          background-size: 80px 80px, 120px 120px, 160px 160px;
        }

        /* ── Holographic Rainbow Sheen Foil ── */
        .holo-foil-shimmer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          mix-blend-mode: screen;
          transition: opacity 0.3s ease-out;
          z-index: 8;
        }

        /* ── Dynamic Specular Glare ── */
        .holo-specular-glare {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          mix-blend-mode: overlay;
          transition: opacity 0.25s ease-out;
          z-index: 9;
        }

        /* ── Metallic Microchip ── */
        .holo-chip {
          width: 44px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #fef08a 0%, #ca8a04 50%, #eab308 100%);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6);
          position: relative;
          overflow: hidden;
          transform: translateZ(32px);
          flex: none;
        }
        .holo-chip-line-1 {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0, 0, 0, 0.35);
        }
        .holo-chip-line-2 {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(0, 0, 0, 0.35);
        }
        .holo-chip-core {
          position: absolute;
          inset: 6px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.3);
          background: rgba(254, 240, 138, 0.4);
        }

        /* ── Layered Z-axis Details ── */
        .holo-z-high { transform: translateZ(30px); }
        .holo-z-mid  { transform: translateZ(22px); }
        .holo-z-low  { transform: translateZ(12px); }

        .holo-watermark-logo {
          position: absolute;
          right: -25px;
          bottom: -35px;
          width: 190px;
          height: 190px;
          opacity: 0.08;
          pointer-events: none;
          transform: translateZ(6px);
        }

        .holo-chip-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .holo-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(185, 255, 0, 0.14);
          border: 1px solid rgba(185, 255, 0, 0.4);
          color: ${EMERALD};
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 0 14px rgba(${NEON_RGB}, 0.25);
        }

        .holo-card-num {
          font-family: 'Space Mono', 'Courier New', monospace;
          font-size: clamp(1rem, 2.2vw, 1.25rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #f1f5f9;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 0 10px rgba(185, 255, 0, 0.35);
          margin: 12px 0 6px;
        }

        .holo-holder-meta {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;
        }
        .holo-holder-name {
          font-size: clamp(0.85rem, 1.8vw, 1.02rem);
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          max-width: 22ch;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .holo-holder-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }

        .holo-seal {
          display: flex;
          align-items: center;
          gap: 6px;
          color: ${EMERALD};
          font-size: 0.72rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div
        ref={cardRef}
        className="holo-card-inner"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform }}
        aria-label="Thẻ VIP Early Access Fonlio 3D"
      >
        {/* Background Mesh */}
        <div className="holo-card-bg-mesh" aria-hidden="true" />

        {/* 3D Holographic Rainbow Sheen */}
        <div
          className="holo-foil-shimmer"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.7) 0%, rgba(185,255,0,0.38) 18%, rgba(45,212,191,0.3) 38%, rgba(168,85,247,0.32) 58%, rgba(244,63,94,0.2) 78%, transparent 100%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Specular White Glare */}
        <div
          className="holo-specular-glare"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 60%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Watermark Fonlio Seal */}
        <div className="holo-watermark-logo" aria-hidden="true">
          <BrandWordmark size="180px" />
        </div>

        {/* Top Row: Wordmark & VIP Badge */}
        <div className="holo-chip-row holo-z-high">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandWordmark size="32px" glow />
          </div>
          <span className="holo-pill-badge">
            <Sparkles size={12} /> {tier}
          </span>
        </div>

        {/* Middle: Metallic Chip & NFC Sensor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBlock: 'auto' }} className="holo-z-high">
          <div className="holo-chip">
            <div className="holo-chip-line-1" />
            <div className="holo-chip-line-2" />
            <div className="holo-chip-core" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>
              <Zap size={13} color="#f59e0b" />
              <span style={{ letterSpacing: '0.08em', fontWeight: 600 }}>NFC GENESIS CHIP</span>
            </div>
            <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
              ENCRYPTED PROOF OF WORK PASS
            </div>
          </div>
        </div>

        {/* Bottom Area: Serial & Name */}
        <div className="holo-z-mid" style={{ width: '100%' }}>
          <div className="holo-card-num">{displayCode}</div>
          <div className="holo-holder-meta">
            <div>
              <span className="holo-holder-label">{role || 'FOUNDING MEMBER'}</span>
              <div className="holo-holder-name">{displayName}</div>
            </div>

            <div className="holo-seal holo-z-high">
              <ShieldCheck size={14} />
              <span>VERIFIED</span>
              <Award size={14} color="#f59e0b" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
