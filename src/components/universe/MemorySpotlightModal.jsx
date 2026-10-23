import { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCw,
  ShieldCheck,
  Zap,
  Sparkles,
  Building,
  Calendar,
  Award,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export function MemorySpotlightModal({
  experience = null,
  currentIndex = 0,
  totalCount = 1,
  onClose = () => {},
  onPrev = () => {},
  onNext = () => {},
  hasPrev = false,
  hasNext = false,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef(null);

  // Reset flip when experience changes
  const expKey = experience?.id ?? experience?.title;
  const [prevExpKey, setPrevExpKey] = useState(expKey);
  if (expKey !== prevExpKey) {
    setPrevExpKey(expKey);
    setIsFlipped(false);
    setTilt({ x: 0, y: 0 });
  }

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 16;
    const rotateY = ((x - centerX) / centerX) * 18;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  }

  if (!experience) return null;

  const isVerified = Boolean(experience.verified);
  const proofImages = Array.isArray(experience.proofImages) ? experience.proofImages : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 20, 16, 0.88)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fonlioFadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fonlioFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fonlioSpotlightScale {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .fonlio-spotlight-perspective {
          perspective: 1800px;
          width: 100%;
          max-width: 460px;
          aspect-ratio: 3 / 4.3;
          max-height: 590px;
          position: relative;
          user-select: none;
          animation: fonlioSpotlightScale 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .fonlio-spotlight-flipper {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .fonlio-spotlight-flipper.is-flipped {
          transform: rotateY(180deg);
        }
        .fonlio-spotlight-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 26px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          box-shadow: 0 40px 90px -20px rgba(0, 0, 0, 0.9),
                      0 0 0 1px rgba(255, 255, 255, 0.22) inset,
                      0 20px 40px rgba(185, 255, 0, 0.18);
        }
        .fonlio-spotlight-face--back {
          transform: rotateY(180deg);
        }
        .fonlio-shimmer-border {
          background: linear-gradient(135deg, rgba(185, 255, 0, 0.5), rgba(45, 212, 191, 0.5), rgba(255, 107, 74, 0.35), rgba(185, 255, 0, 0.5));
          background-size: 300% 300%;
          animation: fonlioShimmerHolo 6s ease infinite;
        }
        @keyframes fonlioShimmerHolo {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '28px',
          right: '32px',
          zIndex: 100,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.24)',
          color: '#f5e7df',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#b9ff00';
          e.currentTarget.style.color = '#0e2b24';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.color = '#f5e7df';
        }}
        title="Đóng chi tiết (ESC)"
      >
        <X size={20} />
      </button>

      {/* Left/Right Fast Steppers */}
      <button
        type="button"
        disabled={!hasPrev}
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        style={{
          position: 'absolute',
          left: '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: hasPrev ? '#f5e7df' : 'rgba(245, 231, 223, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: hasPrev ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (hasPrev) e.currentTarget.style.backgroundColor = 'rgba(185, 255, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        title="Ký ức trước"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        disabled={!hasNext}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        style={{
          position: 'absolute',
          right: '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: hasNext ? '#f5e7df' : 'rgba(245, 231, 223, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: hasNext ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (hasNext) e.currentTarget.style.backgroundColor = 'rgba(185, 255, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        title="Ký ức tiếp theo"
      >
        <ChevronRight size={24} />
      </button>

      {/* Main 3D Flippable Card */}
      <div
        className="fonlio-spotlight-perspective"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
      >
        <div
          className={`fonlio-spotlight-flipper ${isFlipped ? 'is-flipped' : ''}`}
          style={{
            transform: isFlipped
              ? `rotateY(180deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
              : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {/* ═══════════════ FRONT FACE ═══════════════ */}
          <div className="fonlio-spotlight-face fonlio-shimmer-border" style={{ padding: '2px' }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                backgroundColor: 'rgba(10, 34, 28, 0.98)',
                backdropFilter: 'blur(36px) saturate(190%)',
                WebkitBackdropFilter: 'blur(36px) saturate(190%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px 28px 22px',
                position: 'relative',
                overflow: 'hidden',
                color: '#f5e7df',
              }}
            >
              {/* Dynamic Glare Reflection */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 60%)`,
                  pointerEvents: 'none',
                  zIndex: 10,
                  transition: 'opacity 0.25s ease',
                }}
              />

              {/* Watermark Logo */}
              <div
                style={{
                  position: 'absolute',
                  right: '-18px',
                  bottom: '-24px',
                  fontSize: '110px',
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 900,
                  color: 'rgba(255, 255, 255, 0.03)',
                  pointerEvents: 'none',
                  lineHeight: 1,
                }}
              >
                fonlio
              </div>

              {/* Card Top: Category & Living Proof */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: isVerified ? '#b9ff00' : '#2dd4bf',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: isVerified ? '#b9ff00' : '#2dd4bf',
                    }}
                  />
                  <span>{experience.category || 'Ký ức'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isVerified && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 11px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(185, 255, 0, 0.18)',
                        border: '1px solid rgba(185, 255, 0, 0.55)',
                        color: '#b9ff00',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      <ShieldCheck size={14} />
                      <span>LIVING PROOF</span>
                    </div>
                  )}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(245, 231, 223, 0.55)' }}>
                    {String(currentIndex + 1).padStart(2, '0')}/{String(totalCount).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Card Center: Organization & Title */}
              <div style={{ zIndex: 2, marginBlock: 'auto' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                    color: 'rgba(245, 231, 223, 0.85)',
                    fontSize: '13.5px',
                  }}
                >
                  <Building size={16} style={{ color: '#2dd4bf' }} />
                  <span style={{ fontWeight: 600 }}>{experience.organization || 'Dự án độc lập'}</span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    fontSize: 'clamp(22px, 2.6vw, 28px)',
                    fontWeight: 900,
                    lineHeight: 1.25,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    margin: '0 0 14px 0',
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {experience.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    color: 'rgba(245, 231, 223, 0.85)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={15} style={{ color: '#b9ff00' }} />
                    <span style={{ fontWeight: 700 }}>{experience.roleLevel || 'Thành viên'}</span>
                  </div>
                  <span style={{ opacity: 0.35 }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} />
                    <span>
                      {experience.startDate} {experience.endDate ? `— ${experience.endDate}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Bottom: EXP & Flip Button */}
              <div style={{ zIndex: 2 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(245, 231, 223, 0.65)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Điểm kinh nghiệm
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#b9ff00', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={15} />
                      +{experience.expReward || 300} EXP
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(245, 231, 223, 0.65)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Chỉ số Uy tín
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <Sparkles size={15} />
                      +{experience.rsReward || 5} RS
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#b9ff00',
                    border: 'none',
                    color: '#0e2b24',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(185, 255, 0, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#121111';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#b9ff00';
                    e.currentTarget.style.color = '#0e2b24';
                  }}
                >
                  <RotateCw size={15} />
                  <span>Lật thẻ xem phản tư & minh chứng ↻</span>
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════ BACK FACE ═══════════════ */}
          <div className="fonlio-spotlight-face fonlio-spotlight-face--back fonlio-shimmer-border" style={{ padding: '2px' }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                backgroundColor: 'rgba(8, 28, 23, 0.98)',
                backdropFilter: 'blur(36px) saturate(190%)',
                WebkitBackdropFilter: 'blur(36px) saturate(190%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '26px 26px 20px',
                color: '#f5e7df',
                overflowY: 'auto',
              }}
            >
              {/* Back Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b9ff00' }}>
                  HÀNH TRÌNH & PHẢN TƯ THỰC CHIẾN
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(245, 231, 223, 0.5)' }}>
                  {String(currentIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
                </span>
              </div>

              {/* Story Narrative Box */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '13.5px',
                    lineHeight: 1.7,
                    color: 'rgba(245, 231, 223, 0.95)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {experience.detail ||
                    'Ký ức này ghi lại cột mốc trưởng thành thực tế của sinh viên, bao gồm các bài học kinh nghiệm và kết quả chuyển hóa năng lực.'}
                </div>

                {proofImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {proofImages.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Minh chứng"
                        style={{
                          width: '76px',
                          height: '56px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Back Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {experience.proofUrl && (
                  <a
                    href={experience.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#b9ff00',
                      color: '#0e2b24',
                      fontSize: '13px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 16px rgba(185, 255, 0, 0.3)',
                    }}
                  >
                    <span>Mở sản phẩm / bằng chứng gốc</span>
                    <ArrowUpRight size={16} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  style={{
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: '#f5e7df',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <RotateCw size={15} />
                  <span>Lật lại mặt trước ↺</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
