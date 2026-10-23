import { useState, useRef } from 'react';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  Building,
  Calendar,
  RotateCw,
  ExternalLink,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export function TactileMemoryCard3D({
  experience = null,
  currentIndex = 0,
  totalCount = 1,
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

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 14;
    const rotateY = ((x - centerX) / centerX) * 16;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.28,
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <style>{`
        .fonlio-card-3d-perspective {
          perspective: 1600px;
          width: 100%;
          aspect-ratio: 3 / 4.2;
          max-height: 560px;
        }

        .fonlio-card-3d-flipper {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fonlio-card-3d-flipper.is-flipped {
          transform: rotateY(180deg);
        }

        .fonlio-card-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.8),
                      0 0 0 1px rgba(255, 255, 255, 0.22) inset,
                      0 12px 30px rgba(185, 255, 0, 0.15);
        }

        .fonlio-card-face--back {
          transform: rotateY(180deg);
        }

        @keyframes fonlioShimmerHolo {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .fonlio-holo-border {
          background: linear-gradient(135deg, rgba(185, 255, 0, 0.4), rgba(45, 212, 191, 0.4), rgba(255, 107, 74, 0.3), rgba(185, 255, 0, 0.4));
          background-size: 300% 300%;
          animation: fonlioShimmerHolo 6s ease infinite;
        }
      `}</style>

      {/* 3D Card Container */}
      <div
        className="fonlio-card-3d-perspective"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
      >
        <div
          className={`fonlio-card-3d-flipper ${isFlipped ? 'is-flipped' : ''}`}
          style={{
            transform: isFlipped
              ? `rotateY(180deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
              : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {/* ══════════════════════════════════════════════════════════════
              MẶT TRƯỚC (FRONT FACE) - HOLOGRAPHIC SPECIMEN PROOF PASS
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="fonlio-card-face fonlio-holo-border"
            style={{
              padding: '2px', // Thin border wrap
              backgroundColor: 'rgba(12, 38, 31, 0.96)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '22px',
                backgroundColor: 'rgba(10, 34, 28, 0.96)',
                backdropFilter: 'blur(36px) saturate(190%)',
                WebkitBackdropFilter: 'blur(36px) saturate(190%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '26px 26px 20px',
                position: 'relative',
                overflow: 'hidden',
                color: '#f5e7df',
              }}
            >
              {/* Dynamic Glare Reflection Overlay */}
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

              {/* Watermark Logo Stamp */}
              <div
                style={{
                  position: 'absolute',
                  right: '-20px',
                  bottom: '-20px',
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

              {/* Card Top: Category & Verified Stamp */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontSize: '11px',
                    fontWeight: 700,
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

                {isVerified && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(185, 255, 0, 0.16)',
                      border: '1px solid rgba(185, 255, 0, 0.5)',
                      color: '#b9ff00',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>LIVING PROOF</span>
                  </div>
                )}
              </div>

              {/* Card Center: Visual Badge & Title */}
              <div style={{ position: 'relative', zIndex: 2, marginBlock: 'auto' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                    color: 'rgba(245, 231, 223, 0.8)',
                    fontSize: '13px',
                  }}
                >
                  <Building size={15} style={{ color: '#2dd4bf' }} />
                  <span style={{ fontWeight: 600 }}>{experience.organization || 'Dự án độc lập'}</span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    fontSize: 'clamp(21px, 2.8vw, 26px)',
                    fontWeight: 900,
                    lineHeight: 1.25,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    margin: '0 0 12px 0',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {experience.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12.5px',
                    color: 'rgba(245, 231, 223, 0.85)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Award size={14} style={{ color: '#b9ff00' }} />
                    <span style={{ fontWeight: 600 }}>{experience.roleLevel || 'Thành viên'}</span>
                  </div>
                  <span style={{ opacity: 0.35 }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} />
                    <span>
                      {experience.startDate} {experience.endDate ? `— ${experience.endDate}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Rewards & Flip Trigger */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(245, 231, 223, 0.65)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Điểm kinh nghiệm
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#b9ff00', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={14} />
                      +{experience.expReward || 300} EXP
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(245, 231, 223, 0.65)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Chỉ số Uy tín
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <Sparkles size={14} />
                      +{experience.rsReward || 5} RS
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '11px',
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#f5e7df',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b9ff00';
                    e.currentTarget.style.color = '#0e2b24';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
                    e.currentTarget.style.color = '#f5e7df';
                  }}
                >
                  <RotateCw size={14} />
                  <span>Lật thẻ xem phản tư & minh chứng ↻</span>
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              MẶT SAU (BACK FACE) - LIVING PROOF DOSSIER & REFLECTIONS
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="fonlio-card-face fonlio-card-face--back fonlio-holo-border"
            style={{
              padding: '2px',
              backgroundColor: 'rgba(12, 38, 31, 0.98)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '22px',
                backgroundColor: 'rgba(8, 28, 23, 0.98)',
                backdropFilter: 'blur(36px) saturate(190%)',
                WebkitBackdropFilter: 'blur(36px) saturate(190%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px 24px 18px',
                position: 'relative',
                color: '#f5e7df',
                overflowY: 'auto',
              }}
            >
              {/* Back Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b9ff00' }}>
                  HÀNH TRÌNH & PHẢN TƯ
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(245, 231, 223, 0.5)' }}>
                  {String(currentIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
                </span>
              </div>

              {/* Story Narrative Box */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '13.5px',
                    lineHeight: 1.65,
                    color: 'rgba(245, 231, 223, 0.92)',
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
                          width: '70px',
                          height: '52px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Back Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {experience.proofUrl && (
                  <a
                    href={experience.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#b9ff00',
                      color: '#0e2b24',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Mở sản phẩm / bằng chứng gốc</span>
                    <ArrowUpRight size={15} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  style={{
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f5e7df',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCw size={14} />
                  <span>Lật lại mặt trước ↺</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Navigation under 3D Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginTop: '18px',
        }}
      >
        <button
          type="button"
          disabled={!hasPrev}
          onClick={onPrev}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: hasPrev ? '#f5e7df' : 'rgba(245, 231, 223, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasPrev ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
          title="Ký ức trước"
        >
          <ChevronLeft size={18} />
        </button>

        <span style={{ fontSize: '13px', fontWeight: 700, color: '#b9ff00', letterSpacing: '0.04em' }}>
          {String(currentIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
        </span>

        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: hasNext ? '#f5e7df' : 'rgba(245, 231, 223, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasNext ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
          title="Ký ức kế tiếp"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
