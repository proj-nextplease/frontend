import { useState, useMemo } from 'react';
import {
  Search,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Eye,
  Building,
  Zap,
} from 'lucide-react';

export function MemoryListModal({
  experiences = [],
  onClose = () => {},
  onSelectExperience = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = useMemo(() => {
    const set = new Set();
    experiences.forEach((exp) => {
      if (exp.category) set.add(exp.category);
    });
    return Array.from(set);
  }, [experiences]);

  const filteredList = useMemo(() => {
    return experiences.filter((exp) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        (selectedCategory === 'VERIFIED' && exp.verified) ||
        exp.category === selectedCategory;

      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = (exp.title || '').toLowerCase().includes(q);
      const orgMatch = (exp.organization || '').toLowerCase().includes(q);
      const detailMatch = (exp.detail || '').toLowerCase().includes(q);
      return titleMatch || orgMatch || detailMatch;
    });
  }, [experiences, selectedCategory, searchQuery]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(6, 26, 21, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fonlioFadeIn 0.25s ease forwards',
        fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes fonlioFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .fonlio-modal-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .fonlio-modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(245, 231, 223, 0.2);
          border-radius: 999px;
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '88vh',
          backgroundColor: 'rgba(11, 38, 31, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f5e7df',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '26px 32px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#b9ff00',
                }}
              >
                KHO LƯU TRỮ HÀNH TRÌNH
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(185, 255, 0, 0.15)',
                  border: '1px solid rgba(185, 255, 0, 0.35)',
                  color: '#b9ff00',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {experiences.length} ký ức
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: '24px',
                fontWeight: 900,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Kho Ký Ức & Bảo Chứng Năng Lực
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#f5e7df',
              borderRadius: '999px',
              padding: '8px 16px',
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

        {/* Search & Filter Toolbar */}
        <div
          style={{
            padding: '18px 32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Search Input (Fonlio Input style) */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(245, 231, 223, 0.5)',
              }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề dự án, tổ chức, hoặc kỹ năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '8px 14px 8px 42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: "'Be Vietnam Pro', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#b9ff00';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
            />
          </div>

          {/* Filter Pills (Fonlio Pills style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selectedCategory === 'ALL' ? '#b9ff00' : 'rgba(255, 255, 255, 0.15)',
                backgroundColor: selectedCategory === 'ALL' ? '#b9ff00' : 'rgba(255, 255, 255, 0.06)',
                color: selectedCategory === 'ALL' ? '#0e2b24' : '#f5e7df',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Tất cả ({experiences.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('VERIFIED')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selectedCategory === 'VERIFIED' ? '#2dd4bf' : 'rgba(255, 255, 255, 0.15)',
                backgroundColor: selectedCategory === 'VERIFIED' ? '#2dd4bf' : 'rgba(255, 255, 255, 0.06)',
                color: selectedCategory === 'VERIFIED' ? '#0e2b24' : '#f5e7df',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              <ShieldCheck size={14} />
              Đã bảo chứng ({experiences.filter((e) => e.verified).length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
                  backgroundColor: selectedCategory === cat ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                  color: selectedCategory === cat ? '#121111' : '#f5e7df',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List */}
        <div
          className="fonlio-modal-scroll"
          style={{
            padding: '24px 32px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {filteredList.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: 'rgba(245, 231, 223, 0.6)',
                fontSize: '14px',
              }}
            >
              Không tìm thấy ký ức nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredList.map((exp) => (
              <div
                key={exp.id || exp.title}
                style={{
                  padding: '18px 22px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  onSelectExperience(exp);
                  onClose();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(185, 255, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#b9ff00',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {exp.category}
                    </span>
                    {exp.verified && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: '#2dd4bf',
                          backgroundColor: 'rgba(45, 212, 191, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        <ShieldCheck size={12} />
                        Bảo chứng
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Be Vietnam Pro', sans-serif",
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 6px 0',
                    }}
                  >
                    {exp.title}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '12.5px',
                      color: 'rgba(245, 231, 223, 0.7)',
                    }}
                  >
                    <span>{exp.organization}</span>
                    <span>•</span>
                    <span>{exp.roleLevel}</span>
                    <span>•</span>
                    <span>
                      {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#b9ff00' }}>
                      +{exp.expReward || 300} EXP
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#2dd4bf', fontWeight: 600 }}>
                      +{exp.rsReward || 5} RS
                    </div>
                  </div>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f5e7df',
                    }}
                  >
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
