import { useEffect } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Award,
  Zap,
  Calendar,
  Building,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export function MemoryDetailDrawer({
  experience = null,
  allExperiences = [],
  onClose = () => {},
  onSelectExperience = () => {},
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!experience) return null;

  const currentIndex = allExperiences.findIndex(
    (item) => item.id === experience.id || item.title === experience.title
  );
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allExperiences.length - 1;

  const prevItem = hasPrev ? allExperiences[currentIndex - 1] : null;
  const nextItem = hasNext ? allExperiences[currentIndex + 1] : null;

  const isVerified = Boolean(experience.verified);
  const proofImages = Array.isArray(experience.proofImages) ? experience.proofImages : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(6, 26, 21, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        animation: 'fonlioFadeIn 0.25s ease forwards',
        fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes fonlioSlideDrawer {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fonlioFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fonlioPulseDot {
          from { transform: scale(1); opacity: 0.8; }
          to { transform: scale(2.6); opacity: 0; }
        }
        .fonlio-detail-panel {
          animation: fonlioSlideDrawer 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .fonlio-detail-panel::-webkit-scrollbar {
          width: 5px;
        }
        .fonlio-detail-panel::-webkit-scrollbar-thumb {
          background: rgba(245, 231, 223, 0.2);
          border-radius: 999px;
        }
      `}</style>

      <div
        className="fonlio-detail-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'rgba(11, 38, 31, 0.95)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '-24px 0 70px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          color: '#f5e7df',
          position: 'relative',
        }}
      >
        {/* Sticky Header Navigation */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'rgba(11, 38, 31, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '16px 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Stepper Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => prevItem && onSelectExperience(prevItem)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: hasPrev ? '#f5e7df' : 'rgba(245, 231, 223, 0.3)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
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
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => nextItem && onSelectExperience(nextItem)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: hasNext ? '#f5e7df' : 'rgba(245, 231, 223, 0.3)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
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
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(245, 231, 223, 0.65)',
                marginLeft: '6px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {currentIndex >= 0
                ? `${String(currentIndex + 1).padStart(2, '0')} / ${String(allExperiences.length).padStart(2, '0')}`
                : 'Bảo chứng'}
            </span>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#f5e7df',
              borderRadius: '999px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            <span>Đóng</span>
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px 28px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Eyebrow & Category Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#b9ff00',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#b9ff00',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    backgroundColor: 'inherit',
                    animation: 'fonlioPulseDot 2s infinite',
                  }}
                />
              </span>
              <span>{experience.category || 'Ký ức Fonlio'}</span>
            </div>

            {/* Verified Badge */}
            {isVerified ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(185, 255, 0, 0.15)',
                  border: '1px solid rgba(185, 255, 0, 0.45)',
                  color: '#b9ff00',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={14} />
                <span>Bảo chứng sống (Living Proof)</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: 'rgba(245, 231, 223, 0.65)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <span>Tự khai báo</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h2
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: 'clamp(22px, 3.2vw, 28px)',
                fontWeight: 900,
                lineHeight: 1.25,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {experience.title}
            </h2>
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '14px',
                fontSize: '13.5px',
                color: 'rgba(245, 231, 223, 0.85)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={15} style={{ color: '#2dd4bf' }} />
                <span style={{ fontWeight: 600 }}>{experience.organization || 'Tổ chức / Dự án'}</span>
              </div>
              <span style={{ opacity: 0.4 }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={15} style={{ color: '#b9ff00' }} />
                <span>{experience.roleLevel || 'Thành viên'}</span>
              </div>
              <span style={{ opacity: 0.4 }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} style={{ color: '#f5e7df' }} />
                <span>
                  {experience.startDate || 'Bắt đầu'}
                  {experience.endDate ? ` — ${experience.endDate}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Reward Metrics Pill Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(245, 231, 223, 0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Điểm kinh nghiệm
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#b9ff00', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={16} />
                +{experience.expReward || 300} EXP
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(245, 231, 223, 0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Chỉ số Uy tín (RS)
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#2dd4bf', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={16} />
                +{experience.rsReward || 5} RS
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(245, 231, 223, 0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Độ tin cậy
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: isVerified ? '#b9ff00' : '#f5e7df', marginTop: '4px' }}>
                {isVerified ? 'Đã xác thực' : 'Đang chờ'}
              </div>
            </div>
          </div>

          {/* Story & Detail Content (Netlify Content Inspiration) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#f5e7df',
                margin: 0,
              }}
            >
              Hành trình & Bài học
            </h3>
            <div
              style={{
                padding: '18px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '14.5px',
                lineHeight: 1.7,
                color: 'rgba(245, 231, 223, 0.92)',
                whiteSpace: 'pre-line',
              }}
            >
              {experience.detail ||
                'Chưa có mô tả chi tiết cho trải nghiệm này. Ứng viên có thể bổ sung minh chứng sống và phản tư cá nhân trong trang Portfolio.'}
            </div>
          </div>

          {/* Living Proof Showcase / Evidence */}
          {proofImages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3
                style={{
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#f5e7df',
                  margin: 0,
                }}
              >
                Hình ảnh minh chứng ({proofImages.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                {proofImages.map((src, i) => (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      aspectRatio: '4/3',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <img
                      src={src}
                      alt={`Minh chứng ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Living Proof Action CTA */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <a
              href={experience.proofUrl || '#'}
              target="_blank"
              rel="noreferrer"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#b9ff00',
                color: '#0e2b24',
                fontSize: '14px',
                fontWeight: 800,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(185, 255, 0, 0.35)',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#121111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = '#b9ff00';
                e.currentTarget.style.color = '#0e2b24';
              }}
            >
              <span>Xem minh chứng sản phẩm gốc</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
