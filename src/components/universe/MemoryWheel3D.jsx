import { useState, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  Building,
  Calendar,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { MemorySpotlightModal } from './MemorySpotlightModal.jsx';

export function MemoryWheel3D({
  experiences = [],
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeIndex, setActiveIndex] = useState(0);
  const [spotlightExp, setSpotlightExp] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartIdx = useRef(0);

  // Filtered list
  const filtered = useMemo(() => {
    if (!experiences.length) return [];
    if (activeFilter === 'ALL') return experiences;
    if (activeFilter === 'VERIFIED') return experiences.filter((e) => e.verified);
    const filterKey = activeFilter.toUpperCase();
    return experiences.filter((e) => {
      const c = String(e.category || '').toUpperCase();
      return c.includes(filterKey);
    });
  }, [experiences, activeFilter]);

  // Clamp active index during render
  const safeActiveIndex = filtered.length > 0 ? Math.min(activeIndex, filtered.length - 1) : 0;
  if (safeActiveIndex !== activeIndex && filtered.length > 0) {
    setActiveIndex(safeActiveIndex);
  }

  const currentExp = filtered[safeActiveIndex] || filtered[0] || null;

  function handlePrev() {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    setActiveIndex((prev) => Math.min(filtered.length - 1, prev + 1));
  }

  // Pointer drag controls for the wheel
  function handlePointerDown(e) {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartIdx.current = activeIndex;
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    const step = Math.round(deltaX / -90);
    const targetIdx = Math.max(0, Math.min(filtered.length - 1, dragStartIdx.current + step));
    if (targetIdx !== activeIndex) {
      setActiveIndex(targetIdx);
    }
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  // Spotlight steppers
  function handleSpotlightPrev() {
    if (activeIndex > 0) {
      const nextIdx = activeIndex - 1;
      setActiveIndex(nextIdx);
      setSpotlightExp(filtered[nextIdx]);
    }
  }

  function handleSpotlightNext() {
    if (activeIndex < filtered.length - 1) {
      const nextIdx = activeIndex + 1;
      setActiveIndex(nextIdx);
      setSpotlightExp(filtered[nextIdx]);
    }
  }

  if (!filtered.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#f5e7df' }}>
        <p style={{ fontSize: '16px', opacity: 0.7 }}>Chưa có trải nghiệm nào trong danh mục này.</p>
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          style={{
            padding: '8px 20px',
            borderRadius: '999px',
            backgroundColor: '#b9ff00',
            color: '#0e2b24',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Xem tất cả trải nghiệm
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '820px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        userSelect: 'none',
        paddingTop: '20px',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <style>{`
        /* Wheel Container styling matching .toolkit__wheel */
        .fonlio-wheel-stage {
          position: relative;
          width: 100%;
          height: 520px;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justifyContent: center;
          touch-action: pan-y;
        }

        .fonlio-wheel-deck {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 240%;
          max-width: 2600px;
          height: 1400px;
          border-radius: 50%;
          border: 1px dashed rgba(255, 255, 255, 0.12);
          pointer-events: none;
        }

        .fonlio-wheel-card-slot {
          position: absolute;
          top: 0;
          left: 50%;
          transform-origin: 50% 700px;
          pointer-events: auto;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.35s ease;
        }

        .fonlio-wheel-card {
          width: clamp(230px, 20vw, 290px);
          aspect-ratio: 3 / 4.2;
          border-radius: 20px;
          background: rgba(12, 38, 31, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7),
                      0 0 0 1px rgba(255, 255, 255, 0.12) inset;
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: 22px 20px 18px;
          transform: translateY(-50%);
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.28s ease,
                      border-color 0.28s ease,
                      background-color 0.28s ease;
          position: relative;
          overflow: hidden;
          color: '#f5e7df';
        }

        .fonlio-wheel-card:hover {
          transform: translateY(-58%) scale(1.06);
          border-color: #b9ff00;
          box-shadow: 0 30px 70px -10px rgba(0, 0, 0, 0.9),
                      0 0 30px rgba(185, 255, 0, 0.35),
                      0 0 0 1px rgba(185, 255, 0, 0.4) inset;
          background: rgba(16, 48, 39, 0.98);
        }

        .fonlio-wheel-card.is-active-card {
          border-color: #b9ff00;
          box-shadow: 0 25px 65px -10px rgba(0, 0, 0, 0.9),
                      0 0 35px rgba(185, 255, 0, 0.4),
                      0 0 0 1.5px rgba(185, 255, 0, 0.7) inset;
          background: rgba(15, 45, 37, 0.98);
        }

        .fonlio-wheel-card.is-active-card::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(185, 255, 0, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        @keyframes fonlioShineRay {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }

        .fonlio-active-ray {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%);
          transform: rotate(45deg);
        }
      `}</style>

      {/* ── 1. Category Filter Pills ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          zIndex: 10,
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          style={{
            padding: '7px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: activeFilter === 'ALL' ? '#b9ff00' : 'rgba(255, 255, 255, 0.18)',
            backgroundColor: activeFilter === 'ALL' ? '#b9ff00' : 'rgba(255, 255, 255, 0.08)',
            color: activeFilter === 'ALL' ? '#0e2b24' : '#f5e7df',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Tất cả ({experiences.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('VERIFIED')}
          style={{
            padding: '7px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: activeFilter === 'VERIFIED' ? '#2dd4bf' : 'rgba(255, 255, 255, 0.18)',
            backgroundColor: activeFilter === 'VERIFIED' ? '#2dd4bf' : 'rgba(255, 255, 255, 0.08)',
            color: activeFilter === 'VERIFIED' ? '#0e2b24' : '#f5e7df',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <ShieldCheck size={14} />
          Đã bảo chứng ({experiences.filter((e) => e.verified).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('CÔNG NGHỆ')}
          style={{
            padding: '7px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: activeFilter === 'CÔNG NGHỆ' ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
            backgroundColor: activeFilter === 'CÔNG NGHỆ' ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
            color: activeFilter === 'CÔNG NGHỆ' ? '#121111' : '#f5e7df',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Công nghệ & Kỹ thuật
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('SÁNG TẠO')}
          style={{
            padding: '7px 18px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: activeFilter === 'SÁNG TẠO' ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
            backgroundColor: activeFilter === 'SÁNG TẠO' ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
            color: activeFilter === 'SÁNG TẠO' ? '#121111' : '#f5e7df',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Sáng tạo & Media
        </button>
      </div>

      {/* ── 2. The Grand Wheel Stage (Matching .toolkit__wheel) ── */}
      <div className="fonlio-wheel-stage" onPointerDown={handlePointerDown}>
        <div className="fonlio-wheel-deck">
          {filtered.map((exp, idx) => {
            const offset = idx - activeIndex;
            const stepDeg = 9.5; // Degree angle per slot
            const angle = offset * stepDeg;
            const isVisible = Math.abs(offset) <= 5;
            const isActive = offset === 0;

            if (!isVisible) return null;

            return (
              <div
                key={exp.id || idx}
                className="fonlio-wheel-card-slot"
                style={{
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                  zIndex: 50 - Math.abs(offset),
                  opacity: Math.max(0.2, 1 - Math.abs(offset) * 0.18),
                }}
              >
                <div
                  className={`fonlio-wheel-card ${isActive ? 'is-active-card' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isActive) {
                      setActiveIndex(idx);
                    } else {
                      setSpotlightExp(exp);
                    }
                  }}
                  title="Bấm để mở chi tiết & phản tư"
                >
                  {/* Active ray effect */}
                  {isActive && <div className="fonlio-active-ray" />}

                  {/* Card Top: Category & Badge */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: isActive ? '#b9ff00' : '#2dd4bf',
                        }}
                      >
                        {exp.category}
                      </span>
                      {exp.verified && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            color: '#b9ff00',
                          }}
                        >
                          <ShieldCheck size={13} />
                          BẢO CHỨNG
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(245, 231, 223, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px',
                      }}
                    >
                      <Building size={13} style={{ color: '#2dd4bf' }} />
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.organization}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                        fontSize: '16.5px',
                        fontWeight: 900,
                        color: '#ffffff',
                        lineHeight: 1.3,
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {exp.title}
                    </h4>

                    <div style={{ fontSize: '12px', color: 'rgba(245, 231, 223, 0.8)', fontWeight: 600 }}>
                      {exp.roleLevel}
                    </div>
                  </div>

                  {/* Card Bottom: Rewards & Action */}
                  <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#b9ff00', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={14} />
                        +{exp.expReward || 300} EXP
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Sparkles size={13} />
                        +{exp.rsReward || 5} RS
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{
                        width: '100%',
                        height: '34px',
                        borderRadius: '999px',
                        backgroundColor: isActive ? '#b9ff00' : 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: isActive ? '#0e2b24' : '#f5e7df',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Eye size={13} />
                      <span>{isActive ? 'Xem chi tiết & Lật thẻ' : 'Chọn thẻ này'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Wheel Navigation & Controls ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          zIndex: 20,
          marginTop: '-30px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={handlePrev}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              color: activeIndex > 0 ? '#f5e7df' : 'rgba(245, 231, 223, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: activeIndex > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(16px)',
            }}
            onMouseEnter={(e) => {
              if (activeIndex > 0) {
                e.currentTarget.style.backgroundColor = '#b9ff00';
                e.currentTarget.style.color = '#0e2b24';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = activeIndex > 0 ? '#f5e7df' : 'rgba(245, 231, 223, 0.25)';
            }}
            title="Ký ức trước (←)"
          >
            <ChevronLeft size={22} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#b9ff00', letterSpacing: '0.08em' }}>
              {String(activeIndex + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}
            </span>
            <div style={{ fontSize: '12px', color: 'rgba(245, 231, 223, 0.65)', marginTop: '2px' }}>
              Kéo chuột hoặc bấm mũi tên để xoay bánh xe
            </div>
          </div>

          <button
            type="button"
            disabled={activeIndex === filtered.length - 1}
            onClick={handleNext}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              color: activeIndex < filtered.length - 1 ? '#f5e7df' : 'rgba(245, 231, 223, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: activeIndex < filtered.length - 1 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(16px)',
            }}
            onMouseEnter={(e) => {
              if (activeIndex < filtered.length - 1) {
                e.currentTarget.style.backgroundColor = '#b9ff00';
                e.currentTarget.style.color = '#0e2b24';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = activeIndex < filtered.length - 1 ? '#f5e7df' : 'rgba(245, 231, 223, 0.25)';
            }}
            title="Ký ức tiếp theo (→)"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Quick Open Spotlight button */}
        {currentExp && (
          <button
            type="button"
            onClick={() => setSpotlightExp(currentExp)}
            style={{
              padding: '10px 22px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b9ff00';
              e.currentTarget.style.color = '#0e2b24';
              e.currentTarget.style.borderColor = '#b9ff00';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            <Eye size={15} />
            <span>Phóng to thẻ "{currentExp.title}" &amp; Lật 3D</span>
          </button>
        )}
      </div>

      {/* ── 4. Spotlight Modal for Card Inspection ── */}
      {spotlightExp && (
        <MemorySpotlightModal
          experience={spotlightExp}
          currentIndex={activeIndex}
          totalCount={filtered.length}
          onClose={() => setSpotlightExp(null)}
          onPrev={handleSpotlightPrev}
          onNext={handleSpotlightNext}
          hasPrev={activeIndex > 0}
          hasNext={activeIndex < filtered.length - 1}
        />
      )}
    </div>
  );
}
