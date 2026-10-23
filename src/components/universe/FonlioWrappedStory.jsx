import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Sparkles, Award, Zap, ShieldCheck, Share2, Download, Copy, Check, ArrowRight } from 'lucide-react';
import { UserAvatar } from '../UserAvatar.jsx';

export function FonlioWrappedStory({
  candidate = null,
  experiences = [],
  onClose = () => {},
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const SLIDE_DURATION = 6000;

  // Cosmic Archetype calculation
  const archetype = useMemo(() => {
    let techCount = 0;
    let bizCount = 0;
    let creativeCount = 0;
    let leadCount = 0;

    experiences.forEach((exp) => {
      const cat = String(exp.category || '').toUpperCase();
      const role = String(exp.roleLevel || exp.title || '').toUpperCase();
      if (cat.includes('TECH') || cat.includes('DEV') || cat.includes('CODE')) techCount++;
      if (cat.includes('BIZ') || cat.includes('MARKETING')) bizCount++;
      if (cat.includes('DESIGN') || cat.includes('MEDIA') || cat.includes('SÁNG TẠO')) creativeCount++;
      if (role.includes('LEAD') || role.includes('TRƯỞNG')) leadCount++;
    });

    if (leadCount >= 2 || leadCount > experiences.length * 0.35) {
      return {
        title: 'NGỌN LỬA DẪN ĐƯỜNG',
        subtitle: 'The Catalyst Leader',
        desc: 'Bạn sinh ra để kết nối nguồn năng lượng, dẫn dắt đồng đội và biến ý tưởng thành hiện thực.',
        accent: '#b9ff00',
      };
    }
    if (techCount >= bizCount && techCount >= creativeCount && techCount > 0) {
      return {
        title: 'KIẾN TRÚC SƯ HỆ THỐNG',
        subtitle: 'The Master Architect',
        desc: 'Tư duy logic sắc bén, đào sâu bản chất và luôn xây dựng những giải pháp bền bỉ.',
        accent: '#2dd4bf',
      };
    }
    if (creativeCount >= techCount && creativeCount >= bizCount && creativeCount > 0) {
      return {
        title: 'NHÀ SÁNG TẠO VÔ TẬN',
        subtitle: 'The Visionary Creator',
        desc: 'Bạn nhìn thấy những góc nhìn độc bản mà người khác bỏ qua, thổi hồn vào từng sản phẩm.',
        accent: '#f472b6',
      };
    }
    return {
      title: 'NHÀ THÁM HIỂM TOÀN NĂNG',
      subtitle: 'The Cosmic Explorer',
      desc: 'Không ngừng học hỏi, sẵn sàng dấn thân và từng ngày mở rộng biên giới tri thức.',
      accent: '#9b7cff',
    };
  }, [experiences]);

  const brightestStar = useMemo(() => {
    if (!experiences.length) return null;
    return [...experiences].sort((a, b) => (b.expReward || 0) - (a.expReward || 0))[0];
  }, [experiences]);

  const topSkills = useMemo(() => {
    if (candidate?.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0) {
      return candidate.skills.slice(0, 5);
    }
    return ['Giải quyết vấn đề', 'Làm việc nhóm', 'Tư duy phản biện', 'Tự học', 'Giao tiếp'];
  }, [candidate]);

  const totalSlides = 6;

  useEffect(() => {
    if (isPaused) return undefined;
    const interval = 50;
    const step = (interval / SLIDE_DURATION) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < totalSlides - 1) {
            setCurrentSlide((s) => s + 1);
            return 0;
          }
          setIsPaused(true);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentSlide, isPaused, totalSlides]);

  function goToSlide(idx) {
    if (idx >= 0 && idx < totalSlides) {
      setCurrentSlide(idx);
      setProgress(0);
      setIsPaused(false);
    }
  }

  function handleNext() {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    } else {
      setIsPaused(true);
    }
  }

  function handlePrev() {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentSlide, isPaused, onClose]);

  const displayName = candidate?.name || 'Bạn';

  function handleCopyShare() {
    const url = window.location.origin + `/p/${candidate?.publicSlug || ''}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#090808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes npWrappedPop {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes npGlowLime {
          0% { filter: drop-shadow(0 0 16px rgba(185, 255, 0, 0.45)) drop-shadow(0 0 32px rgba(255, 107, 74, 0.3)); }
          50% { filter: drop-shadow(0 0 38px rgba(185, 255, 0, 0.85)) drop-shadow(0 0 50px rgba(255, 107, 74, 0.5)); }
          100% { filter: drop-shadow(0 0 16px rgba(185, 255, 0, 0.45)) drop-shadow(0 0 32px rgba(255, 107, 74, 0.3)); }
        }
        @keyframes npLaserBeam {
          0%, 40% { transform: translateX(-100%) rotate(25deg); }
          75%, 100% { transform: translateX(300%) rotate(25deg); }
        }
        .np-wrapped-inner {
          animation: npWrappedPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Universe Multi-Orb Cosmic Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 18% 18%, rgba(255, 107, 74, 0.28) 0%, transparent 48%),
            radial-gradient(circle at 82% 25%, rgba(155, 124, 255, 0.32) 0%, transparent 52%),
            radial-gradient(circle at 50% 88%, rgba(185, 255, 0, 0.18) 0%, transparent 58%),
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 60%),
            #0a0808
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Noise Texture Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Story Container (Mobile 9:16 aspect ratio box) */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          maxHeight: '840px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          background: 'rgba(18, 16, 16, 0.92)',
          backdropFilter: 'blur(40px) saturate(190%)',
          WebkitBackdropFilter: 'blur(40px) saturate(190%)',
          border: '1px solid rgba(245, 231, 223, 0.18)',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 32px 90px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(245, 231, 223, 0.12) inset, 0 0 50px rgba(185, 255, 0, 0.14)',
        }}
      >
        {/* Story Segment Progress Bars */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            insetInline: '18px',
            display: 'flex',
            gap: '6px',
            zIndex: 30,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, idx) => {
            const isFinished = idx < currentSlide;
            const isCurrent = idx === currentSlide;
            const widthPct = isFinished ? 100 : isCurrent ? progress : 0;
            return (
              <div
                key={idx}
                onClick={() => goToSlide(idx)}
                style={{
                  flex: 1,
                  height: '3.5px',
                  background: 'rgba(245, 231, 223, 0.18)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    background: '#b9ff00',
                    boxShadow: '0 0 12px #b9ff00',
                    transition: isCurrent ? 'width 0.05s linear' : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Bar */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            insetInline: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar src={candidate?.avatarUrl} name={displayName} size={32} />
              <div
                style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '50%',
                  border: '1.5px solid #b9ff00',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f5e7df', lineHeight: 1.2 }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#b9ff00', fontWeight: 800, letterSpacing: '0.06em' }}>
                FONLIO WRAPPED ✦ 2026
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              style={{
                background: 'rgba(245, 231, 223, 0.08)',
                border: '1px solid rgba(245, 231, 223, 0.16)',
                color: '#f5e7df',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(245, 231, 223, 0.08)',
                border: '1px solid rgba(245, 231, 223, 0.16)',
                color: '#f5e7df',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Left & Right Tap Area for Story Navigation */}
        <div
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: 0,
            top: '70px',
            bottom: '70px',
            width: '35%',
            zIndex: 20,
            cursor: 'pointer',
          }}
        />
        <div
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: 0,
            top: '70px',
            bottom: '70px',
            width: '35%',
            zIndex: 20,
            cursor: 'pointer',
          }}
        />

        {/* Slide Content Body */}
        <div
          key={currentSlide}
          className="np-wrapped-inner"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '70px 32px 32px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 15,
          }}
        >
          {/* SLIDE 0: Welcome / Opening */}
          {currentSlide === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '104px',
                  height: '104px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #b9ff00 0%, #ff6b4a 60%, #9b7cff 100%)',
                  animation: 'npGlowLime 2.6s infinite ease-in-out',
                  marginBottom: '6px',
                }}
              />
              <span
                style={{
                  fontSize: '0.76rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#b9ff00',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  background: 'rgba(185, 255, 0, 0.1)',
                  border: '1px solid rgba(185, 255, 0, 0.3)',
                }}
              >
                HÀNH TRÌNH THỰC CHIẾN • LIVING PROOF
              </span>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: '#f5e7df',
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: '-0.03em',
                }}
              >
                Mỗi dự án là một vì sao thắp sáng.
              </h1>
              <p style={{ color: 'rgba(245, 231, 223, 0.72)', fontSize: '0.96rem', lineHeight: 1.65, maxWidth: '340px', margin: 0 }}>
                Chào <strong style={{ color: '#f5e7df' }}>{displayName}</strong>, hãy cùng chiêm ngưỡng những bước tiến thực chiến mà bạn đã tôi luyện suốt thời gian qua.
              </p>
              <div
                style={{
                  fontSize: '0.84rem',
                  color: '#121111',
                  fontWeight: 800,
                  marginTop: '10px',
                  padding: '10px 22px',
                  borderRadius: '999px',
                  background: '#b9ff00',
                  boxShadow: '0 10px 26px -4px rgba(185, 255, 0, 0.55)',
                  cursor: 'pointer',
                }}
              >
                Khám phá ngay ✦
              </div>
            </div>
          )}

          {/* SLIDE 1: Key Numbers */}
          {currentSlide === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9b7cff',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  background: 'rgba(155, 124, 255, 0.12)',
                  border: '1px solid rgba(155, 124, 255, 0.3)',
                }}
              >
                DẤU ẤN VŨ TRỤ
              </span>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#f5e7df',
                  margin: 0,
                  letterSpacing: '-0.025em',
                }}
              >
                Bạn đã tôi luyện
              </h2>

              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
                  fontSize: '5.6rem',
                  fontWeight: 900,
                  color: '#b9ff00',
                  lineHeight: 1,
                  textShadow: '0 0 45px rgba(185, 255, 0, 0.65)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.04em',
                }}
              >
                {experiences.length}
              </div>
              <span style={{ fontSize: '1.05rem', color: '#f5e7df', fontWeight: 700 }}>
                Ký ức &amp; Cột mốc thực chiến
              </span>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  width: '100%',
                  marginTop: '8px',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '20px',
                    background: 'rgba(28, 25, 25, 0.75)',
                    border: '1px solid rgba(245, 231, 223, 0.14)',
                    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(245, 231, 223, 0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Kinh nghiệm tích lũy
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff6b4a', marginTop: '6px' }}>
                    {(candidate?.totalExp || 850).toLocaleString()} EXP
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '20px',
                    background: 'rgba(28, 25, 25, 0.75)',
                    border: '1px solid rgba(245, 231, 223, 0.14)',
                    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(245, 231, 223, 0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Điểm tín nhiệm RS
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b9ff00', marginTop: '6px' }}>
                    {candidate?.reputationScore || 75}/100
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Brightest Star */}
          {currentSlide === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#ff6b4a',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  background: 'rgba(255, 107, 74, 0.12)',
                  border: '1px solid rgba(255, 107, 74, 0.3)',
                }}
              >
                DỰ ÁN SÁNG GIÁ NHẤT
              </span>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: '#f5e7df',
                  margin: 0,
                  letterSpacing: '-0.025em',
                }}
              >
                Dấu ấn bứt phá của bạn
              </h2>

              {brightestStar ? (
                <div
                  style={{
                    width: '100%',
                    padding: '24px 22px',
                    borderRadius: '24px',
                    background: 'radial-gradient(circle at 50% 0%, rgba(255, 107, 74, 0.18) 0%, rgba(24, 21, 21, 0.95) 85%)',
                    border: '1px solid rgba(255, 107, 74, 0.35)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 107, 74, 0.18)',
                    marginTop: '6px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#f5e7df',
                      marginBottom: '6px',
                    }}
                  >
                    {brightestStar.title}
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#9b7cff', fontWeight: 700, marginBottom: '14px' }}>
                    {brightestStar.organization}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'rgba(245, 231, 223, 0.75)', lineHeight: 1.65, margin: '0 0 18px' }}>
                    {brightestStar.detail ? brightestStar.detail.slice(0, 150) + '...' : 'Một cột mốc kiên cường và đầy nhiệt huyết.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: 'rgba(255, 107, 74, 0.18)',
                        border: '1px solid rgba(255, 107, 74, 0.35)',
                        color: '#ff6b4a',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}
                    >
                      ✦ +{brightestStar.expReward || 450} EXP
                    </span>
                    {brightestStar.verified && (
                      <span
                        style={{
                          padding: '6px 14px',
                          borderRadius: '999px',
                          background: 'rgba(16, 185, 129, 0.18)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: '#10b981',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                        }}
                      >
                        ✓ Bảo chứng Living Proof
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'rgba(245, 231, 223, 0.5)' }}>Đang chờ đợi vì sao đầu tiên...</div>
              )}
            </div>
          )}

          {/* SLIDE 3: Top Skills Constellation */}
          {currentSlide === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9b7cff',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  background: 'rgba(155, 124, 255, 0.12)',
                  border: '1px solid rgba(155, 124, 255, 0.3)',
                }}
              >
                VŨ KHÍ THỰC CHIẾN
              </span>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#f5e7df',
                  margin: 0,
                  letterSpacing: '-0.025em',
                }}
              >
                Chòm sao năng lực
              </h2>

              <p style={{ color: 'rgba(245, 231, 223, 0.7)', fontSize: '0.94rem', maxWidth: '320px', margin: 0 }}>
                Những kỹ năng vững chắc nhất bạn đã rèn luyện qua từng kỳ đồ án và dự án thực.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                {topSkills.map((sk, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '11px 20px',
                      borderRadius: '16px',
                      background: 'rgba(155, 124, 255, 0.12)',
                      border: '1px solid rgba(155, 124, 255, 0.32)',
                      color: '#f5e7df',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      boxShadow: '0 6px 20px rgba(155, 124, 255, 0.1)',
                    }}
                  >
                    ✦ {sk}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 4: Cosmic Archetype */}
          {currentSlide === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: archetype.accent,
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  background: `${archetype.accent}18`,
                  border: `1px solid ${archetype.accent}44`,
                }}
              >
                BẢN SẮC CỦA BẠN
              </span>

              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, sans-serif",
                  fontSize: '2.15rem',
                  fontWeight: 900,
                  color: '#f5e7df',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  textShadow: `0 0 35px ${archetype.accent}88`,
                }}
              >
                {archetype.title}
              </div>

              <div
                style={{
                  fontSize: '0.95rem',
                  color: archetype.accent,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                }}
              >
                [{archetype.subtitle}]
              </div>

              <div
                style={{
                  width: '78px',
                  height: '78px',
                  borderRadius: '50%',
                  border: `2px dashed ${archetype.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '8px 0',
                  boxShadow: `0 0 30px ${archetype.accent}44`,
                }}
              >
                <Sparkles size={34} style={{ color: archetype.accent }} />
              </div>

              <p
                style={{
                  color: 'rgba(245, 231, 223, 0.78)',
                  fontSize: '0.96rem',
                  lineHeight: 1.7,
                  maxWidth: '330px',
                  margin: 0,
                }}
              >
                {archetype.desc}
              </p>
            </div>
          )}

          {/* SLIDE 5: Luxury Shareable Genesis Card */}
          {currentSlide === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#b9ff00',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '999px',
                  background: 'rgba(185, 255, 0, 0.12)',
                  border: '1px solid rgba(185, 255, 0, 0.35)',
                }}
              >
                THẺ BẢO CHỨNG GENESIS
              </span>

              {/* Graphic Card */}
              <div
                id="np-shareable-card"
                style={{
                  width: '100%',
                  padding: '24px 20px',
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #221f1f 0%, #131111 100%)',
                  border: '1px solid rgba(185, 255, 0, 0.45)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(185, 255, 0, 0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Holographic light streak */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(ellipse at 30% 20%, rgba(185, 255, 0, 0.12) 0%, transparent 60%)',
                    pointerEvents: 'none',
                  }}
                />

                <UserAvatar src={candidate?.avatarUrl} name={displayName} size={58} />

                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f5e7df', letterSpacing: '-0.01em' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: archetype.accent, fontWeight: 800, marginTop: '2px' }}>
                    {archetype.title}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    width: '100%',
                    background: 'rgba(32, 28, 28, 0.8)',
                    padding: '12px',
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 231, 223, 0.1)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245, 231, 223, 0.55)', fontWeight: 700 }}>Dự án</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#b9ff00' }}>
                      {experiences.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245, 231, 223, 0.55)', fontWeight: 700 }}>Điểm RS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2dd4bf' }}>
                      {candidate?.reputationScore || 75}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245, 231, 223, 0.55)', fontWeight: 700 }}>Cấp độ</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ff6b4a' }}>
                      Lv.{candidate?.currentLevel || 1}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.76rem', color: 'rgba(245, 231, 223, 0.5)', fontWeight: 600 }}>
                  fonlio.online/p/{candidate?.publicSlug || 'profile'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleCopyShare}
                  style={{
                    flex: 1,
                    padding: '13px 16px',
                    borderRadius: '14px',
                    background: copied ? '#10b981' : '#b9ff00',
                    color: '#121111',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 6px 20px rgba(185, 255, 0, 0.35)',
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Đã sao chép link!' : 'Chia sẻ hành trình'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '13px 18px',
                    borderRadius: '14px',
                    background: 'rgba(245, 231, 223, 0.08)',
                    color: '#f5e7df',
                    border: '1px solid rgba(245, 231, 223, 0.18)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  Vào 3D
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid rgba(245, 231, 223, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            fontSize: '0.82rem',
            color: 'rgba(245, 231, 223, 0.6)',
            fontWeight: 600,
          }}
        >
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={handlePrev}
            style={{
              background: 'none',
              border: 'none',
              color: currentSlide === 0 ? 'rgba(245, 231, 223, 0.2)' : '#f5e7df',
              cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={16} /> Trước
          </button>

          <span>
            {currentSlide + 1} / {totalSlides}
          </span>

          <button
            type="button"
            onClick={handleNext}
            style={{
              background: 'none',
              border: 'none',
              color: currentSlide === totalSlides - 1 ? '#b9ff00' : '#f5e7df',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: currentSlide === totalSlides - 1 ? 800 : 600,
            }}
          >
            {currentSlide === totalSlides - 1 ? 'Hoàn tất' : 'Tiếp'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
