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
      accent: '#b9ff00',
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
        background: '#0d0c0c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      }}
    >
      <style>{`
        @keyframes npWrappedPop {
          0% { transform: scale(0.94); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes npGlowLime {
          0% { filter: drop-shadow(0 0 16px rgba(185, 255, 0, 0.45)); }
          50% { filter: drop-shadow(0 0 36px rgba(185, 255, 0, 0.85)); }
          100% { filter: drop-shadow(0 0 16px rgba(185, 255, 0, 0.45)); }
        }
        .np-wrapped-inner {
          animation: npWrappedPop 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, #134e43 0%, #0d3830 50%, #061f1a 100%)',
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
          background: 'rgba(11, 38, 31, 0.96)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 45px rgba(185, 255, 0, 0.2)',
        }}
      >
        {/* Story Segment Bars */}
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
                  background: 'rgba(245, 231, 223, 0.2)',
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
                    boxShadow: '0 0 10px #b9ff00',
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
            <UserAvatar src={candidate?.avatarUrl} name={displayName} size={30} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f5e7df', lineHeight: 1.2 }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#b9ff00', fontWeight: 700, letterSpacing: '0.04em' }}>
                FONLIO WRAPPED
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              style={{
                background: 'rgba(245, 231, 223, 0.08)',
                border: '1px solid rgba(245, 231, 223, 0.12)',
                color: '#f5e7df',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(245, 231, 223, 0.08)',
                border: '1px solid rgba(245, 231, 223, 0.12)',
                color: '#f5e7df',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
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
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #b9ff00 0%, #2dd4bf 70%, transparent 100%)',
                  animation: 'npGlowLime 2.6s infinite ease-in-out',
                  marginBottom: '10px',
                }}
              />
              <span
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#b9ff00',
                  fontWeight: 800,
                }}
              >
                HÀNH TRÌNH CỦA BẠN
              </span>
              <h1
                style={{
                  fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif",
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.25,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Mỗi dự án là một vì sao thắp sáng.
              </h1>
              <p style={{ color: '#d6d3d1', fontSize: '0.98rem', lineHeight: 1.65, maxWidth: '340px' }}>
                Chào {displayName}, hãy cùng chiêm ngưỡng những bước tiến thực chiến mà bạn đã bền bỉ tôi luyện suốt thời gian qua.
              </p>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#141313',
                  fontWeight: 800,
                  marginTop: '14px',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  background: '#b9ff00',
                  boxShadow: '0 0 20px rgba(185, 255, 0, 0.4)',
                }}
              >
                Chạm để bắt đầu ✦
              </div>
            </div>
          )}

          {/* SLIDE 1: Key Numbers */}
          {currentSlide === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#2dd4bf',
                  fontWeight: 800,
                }}
              >
                DẤU ẤN VŨ TRỤ
              </span>
              <h2
                style={{
                  fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif",
                  fontSize: '1.9rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Bạn đã hoàn thành
              </h2>

              <div
                style={{
                  fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif",
                  fontSize: '5.2rem',
                  fontWeight: 900,
                  color: '#b9ff00',
                  lineHeight: 1,
                  textShadow: '0 0 40px rgba(185, 255, 0, 0.65)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {experiences.length}
              </div>
              <span style={{ fontSize: '1.1rem', color: '#f5e7df', fontWeight: 800 }}>
                Ký ức & Cột mốc thực chiến
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
                    borderRadius: '18px',
                    background: 'rgba(35, 33, 33, 0.7)',
                    border: '1px solid rgba(245, 231, 223, 0.12)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#78716c', fontWeight: 700, textTransform: 'uppercase' }}>
                    Kinh nghiệm tích lũy
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
                    {(candidate?.totalExp || 850).toLocaleString()} EXP
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'rgba(35, 33, 33, 0.7)',
                    border: '1px solid rgba(245, 231, 223, 0.12)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#78716c', fontWeight: 700, textTransform: 'uppercase' }}>
                    Điểm tín nhiệm RS
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#b9ff00', marginTop: '4px' }}>
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
                  fontSize: '0.78rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#f59e0b',
                  fontWeight: 800,
                }}
              >
                DỰ ÁN SÁNG GIÁ NHẤT
              </span>
              <h2
                style={{
                  fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif",
                  fontSize: '1.85rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
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
                    background: 'radial-gradient(circle at 50% 0%, rgba(185, 255, 0, 0.15) 0%, rgba(28, 25, 25, 0.95) 80%)',
                    border: '1px solid rgba(185, 255, 0, 0.35)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(185, 255, 0, 0.15)',
                    marginTop: '6px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif",
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: '#fff',
                      marginBottom: '6px',
                    }}
                  >
                    {brightestStar.title}
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#2dd4bf', fontWeight: 700, marginBottom: '14px' }}>
                    {brightestStar.organization}
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#a8a29e', lineHeight: 1.65, margin: '0 0 16px' }}>
                    {brightestStar.detail ? brightestStar.detail.slice(0, 150) + '...' : 'Một cột mốc kiên cường và đầy nhiệt huyết.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: '999px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}
                    >
                      ✦ +{brightestStar.expReward || 450} EXP
                    </span>
                    {brightestStar.verified && (
                      <span
                        style={{
                          padding: '5px 12px',
                          borderRadius: '999px',
                          background: 'rgba(185, 255, 0, 0.2)',
                          color: '#b9ff00',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                        }}
                      >
                        Bảo chứng Living Proof
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#a8a29e' }}>Đang chờ đợi vì sao đầu tiên...</div>
              )}
            </div>
          )}

          {/* SLIDE 3: Top Skills Constellation */}
          {currentSlide === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#2dd4bf',
                  fontWeight: 800,
                }}
              >
                VŨ KHÍ THỰC CHIẾN
              </span>
              <h2
                style={{
                  fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif",
                  fontSize: '1.85rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Chòm sao năng lực
              </h2>

              <p style={{ color: '#a8a29e', fontSize: '0.92rem', maxWidth: '300px' }}>
                Những kỹ năng vững chắc nhất bạn đã rèn luyện qua từng kỳ đồ án và dự án thực.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                {topSkills.map((sk, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '11px 20px',
                      borderRadius: '16px',
                      background: 'rgba(45, 212, 191, 0.12)',
                      border: '1px solid rgba(45, 212, 191, 0.35)',
                      color: '#f5e7df',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxShadow: '0 6px 20px rgba(45, 212, 191, 0.1)',
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
                  fontSize: '0.78rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: archetype.accent,
                  fontWeight: 800,
                }}
              >
                BẢN SẮC CỦA BẠN
              </span>

              <div
                style={{
                  fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif",
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  textShadow: `0 0 30px ${archetype.accent}77`,
                }}
              >
                {archetype.title}
              </div>

              <div
                style={{
                  fontSize: '1rem',
                  color: archetype.accent,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                }}
              >
                [{archetype.subtitle}]
              </div>

              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  border: `2px dashed ${archetype.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '8px 0',
                }}
              >
                <Sparkles size={34} style={{ color: archetype.accent }} />
              </div>

              <p
                style={{
                  color: '#d6d3d1',
                  fontSize: '0.96rem',
                  lineHeight: 1.7,
                  maxWidth: '320px',
                }}
              >
                {archetype.desc}
              </p>
            </div>
          )}

          {/* SLIDE 5: Luxury Shareable Genesis Card (Styled like Fonlio's VIP Card) */}
          {currentSlide === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#b9ff00',
                  fontWeight: 800,
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
                  background: 'linear-gradient(145deg, #242222 0%, #171515 100%)',
                  border: '1px solid rgba(185, 255, 0, 0.45)',
                  boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(185, 255, 0, 0.25)',
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
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>
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
                    background: 'rgba(35, 33, 33, 0.7)',
                    padding: '12px',
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 231, 223, 0.08)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#78716c', fontWeight: 700 }}>Dự án</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b9ff00' }}>
                      {experiences.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#78716c', fontWeight: 700 }}>Điểm RS</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2dd4bf' }}>
                      {candidate?.reputationScore || 75}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#78716c', fontWeight: 700 }}>Cấp độ</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f59e0b' }}>
                      Lv.{candidate?.currentLevel || 1}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#78716c', fontWeight: 600 }}>
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
                    color: '#141313',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 18px rgba(185, 255, 0, 0.35)',
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
                    border: '1px solid rgba(245, 231, 223, 0.16)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
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
            borderTop: '1px solid rgba(245, 231, 223, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            fontSize: '0.82rem',
            color: '#78716c',
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
              color: currentSlide === 0 ? '#44403c' : '#d6d3d1',
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
              color: currentSlide === totalSlides - 1 ? '#b9ff00' : '#d6d3d1',
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
