import React from 'react';

/**
 * Mạng lưới Đối tác Học thuật & CLB Sinh viên tinh hoa
 *
 * Thay thế cho dải logo doanh nghiệp có nguy cơ vi phạm bản quyền:
 * - 100% Vector SVG sắc nét, không dùng ảnh ngoài tránh lỗi 404 và vấn đề bản quyền.
 * - Thể hiện mạng lưới 50+ trường Đại học (FPT, RMIT, Bách Khoa, NEU, FTU, VNU, UEH, TDTU...)
 *   và các CLB sinh viên hàng đầu (GDSC, CLB Khởi nghiệp, CLB AI, F-Code, F-Media, Debate Society...).
 * - Hai hàng chuyển động ngược chiều với hiệu ứng kính mờ (glassmorphism) neon,
 *   tự động pause khi hover để người dùng dễ đọc.
 */

const INSTITUTIONS_ROW_A = [
  {
    id: 'fptu',
    shortName: 'Đại học FPT',
    category: 'Trường Đại học',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.32)',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2C8 6 6 9 6 13a6 6 0 0 0 12 0c0-4-3-7-6-11z" fill="#f97316" />
        <path d="M12 7c-2 2.5-3 4-3 6a3 3 0 0 0 6 0c0-2-1.5-3.5-3-6z" fill="#fdba74" />
      </svg>
    ),
  },
  {
    id: 'gdsc',
    shortName: 'GDSC Vietnam',
    category: 'Google Dev Student Club',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.35)',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M8.5 7L3.5 12l5 5" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5 7l5 5-5 5" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="8.5" r="1.8" fill="#f59e0b" />
        <circle cx="12" cy="15.5" r="1.8" fill="#10b981" />
      </svg>
    ),
  },
  {
    id: 'hcmut',
    shortName: 'ĐH Bách Khoa',
    category: 'Đại học Kỹ thuật',
    color: '#0284c7',
    glow: 'rgba(2, 132, 199, 0.32)',
    bg: 'rgba(2, 132, 199, 0.12)',
    border: 'rgba(2, 132, 199, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="8" stroke="#0284c7" strokeWidth="2.2" strokeDasharray="3 2" />
        <circle cx="12" cy="12" r="3.5" fill="#0284c7" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'sec',
    shortName: 'SEC Startup Club',
    category: 'CLB Khởi nghiệp Sinh viên',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.32)',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2.5c2.5 2 4.5 5.5 4.5 9.5 0 2-.5 3.5-1.5 4.5l-3-1.5-3 1.5c-1-1-1.5-2.5-1.5-4.5 0-4 2-7.5 4.5-9.5z" fill="#10b981" />
        <path d="M9 16.5l-3 3.5h3v2l3-3.5M15 16.5l3 3.5h-3v2l-3-3.5" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="9" r="1.8" fill="#fbbf24" />
      </svg>
    ),
  },
  {
    id: 'rmit',
    shortName: 'ĐH RMIT',
    category: 'Đại học Quốc tế',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.32)',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M4 6h7l5 6-5 6H4l5-6-5-6z" fill="#ef4444" />
        <circle cx="17.5" cy="12" r="2.5" fill="#f59e0b" />
      </svg>
    ),
  },
  {
    id: 'ai_hub',
    shortName: 'AI & Data Hub',
    category: 'CLB Trí tuệ Nhân tạo',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.32)',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="6" cy="12" r="2.4" fill="#8b5cf6" />
        <circle cx="18" cy="7" r="2.4" fill="#a78bfa" />
        <circle cx="18" cy="17" r="2.4" fill="#a78bfa" />
        <circle cx="12" cy="12" r="2" fill="#c4b5fd" />
        <path d="M8.5 12h7M8 10.5l8-4M8 13.5l8 4" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'neu',
    shortName: 'ĐH Kinh tế Quốc dân',
    category: 'Kinh tế & Quản trị',
    color: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.32)',
    bg: 'rgba(37, 99, 235, 0.12)',
    border: 'rgba(37, 99, 235, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M5 20h14M7 20V10M12 20V6M17 20V10M4 6h16l-8-4-8 4z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="4" r="2" fill="#f59e0b" />
      </svg>
    ),
  },
  {
    id: 'fcode',
    shortName: 'F-Code Society',
    category: 'CLB Lập trình & Thuật toán',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.32)',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="3" y="4" width="18" height="16" rx="3" stroke="#06b6d4" strokeWidth="2" />
        <path d="M7 9l3 3-3 3M13 15h4" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const INSTITUTIONS_ROW_B = [
  {
    id: 'ftu',
    shortName: 'ĐH Ngoại Thương',
    category: 'Thương mại & Tài chính',
    color: '#dc2626',
    glow: 'rgba(220, 38, 38, 0.32)',
    bg: 'rgba(220, 38, 38, 0.12)',
    border: 'rgba(220, 38, 38, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="8" stroke="#dc2626" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="4" ry="8" stroke="#dc2626" strokeWidth="1.6" />
        <path d="M4 12h16" stroke="#dc2626" strokeWidth="1.6" />
        <path d="M3 7.5l9 4.5 9-4.5" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'fmedia',
    shortName: 'F-Media Club',
    category: 'CLB Truyền thông & Số',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.32)',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="8" stroke="#f43f5e" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.5" stroke="#fda4af" strokeWidth="2" />
        <path d="M12 4l3 5M19 8.5l-1 5.5M17 19l-5-2M8 18l-1.5-5.5M5.5 10l5 1" stroke="#f43f5e" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'vnu',
    shortName: 'ĐHQG (VNU)',
    category: 'Đại học Quốc gia',
    color: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.32)',
    bg: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(14, 165, 233, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 18V6c-2.5-1.5-6-1.5-8 0v12c2-1.5 5.5-1.5 8 0zm0 0c2.5-1.5 6-1.5 8 0V6c-2-1.5-5.5-1.5-8 0v12z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="3" r="1.5" fill="#38bdf8" />
      </svg>
    ),
  },
  {
    id: 'debate',
    shortName: 'Debate Society',
    category: 'CLB Tranh biện & Kỹ năng',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.32)',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" fill="#f59e0b" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'ueh',
    shortName: 'ĐH UEH',
    category: 'Đại học Đổi mới',
    color: '#0d9488',
    glow: 'rgba(13, 148, 136, 0.32)',
    bg: 'rgba(13, 148, 136, 0.12)',
    border: 'rgba(13, 148, 136, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2l8 6-8 14L4 8l8-6z" stroke="#0d9488" strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 8l8 5 8-5M12 13v9" stroke="#14b8a6" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'fintech',
    shortName: 'Fintech Hub',
    category: 'CLB Fintech & Web3',
    color: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.32)',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2l7 4v6l-7 4-7-4V6l7-4z" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 6l3 4h-2.5l1.5 4-4-5h2.5L12 6z" fill="#818cf8" />
      </svg>
    ),
  },
  {
    id: 'tdtu',
    shortName: 'ĐH Tôn Đức Thắng',
    category: 'Đại học Nghiên cứu',
    color: '#1d4ed8',
    glow: 'rgba(29, 78, 216, 0.32)',
    bg: 'rgba(29, 78, 216, 0.12)',
    border: 'rgba(29, 78, 216, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" stroke="#1d4ed8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 8l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L12 8z" fill="#f59e0b" />
      </svg>
    ),
  },
  {
    id: 'design_guild',
    shortName: 'Design Guild',
    category: 'Cộng đồng Sáng tạo UI/UX',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.32)',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.35)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2l4 7-4 13-4-13 4-7z" stroke="#ec4899" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="1.8" fill="#f472b6" />
        <path d="M5 9h14" stroke="#f472b6" strokeWidth="1.6" strokeDasharray="2 2" />
        <circle cx="5" cy="9" r="1.5" fill="#ec4899" />
        <circle cx="19" cy="9" r="1.5" fill="#ec4899" />
      </svg>
    ),
  },
];

function PartnerCard({ item }) {
  return (
    <div
      className="np-partner-card"
      style={{
        '--partner-color': item.color,
        '--partner-glow': item.glow,
        '--partner-bg': item.bg,
        '--partner-border': item.border,
      }}
    >
      <div className="np-partner-icon-wrap" aria-hidden="true">
        {item.icon}
      </div>
      <div className="np-partner-meta">
        <span className="np-partner-title">{item.shortName}</span>
        <span className="np-partner-category">{item.category}</span>
      </div>
    </div>
  );
}

function MarqueeRow({ variant, items }) {
  // Lặp lại 4 lần để chu kỳ trượt translateX -50% luôn phủ kín các màn hình siêu rộng (4K, UltraWide)
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className={`np-partner-marquee np-partner-marquee-${variant}`}>
      <div className="np-partner-track">
        {loop.map((item, idx) => (
          <PartnerCard key={`${variant}-${item.id}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function PartnerLogos({ onDark = false, colorLogos = false, showHeading = true } = {}) {
  return (
    <div className={`np-partner-ecosystem${onDark ? ' np-dark-mode' : ' np-light-mode'}`}>
      <style>{`
        .np-partner-ecosystem {
          position: relative;
          width: 100%;
          padding: 10px 0 20px;
        }

        .np-partner-header {
          text-align: center;
          margin: 0 auto 36px;
          max-width: 780px;
          padding: 0 16px;
        }

        .np-partner-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .np-partner-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          animation: npDotPulse 2s ease-in-out infinite;
        }

        @keyframes npDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .np-partner-head {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: clamp(1.6rem, 3.4vw, 2.3rem);
          font-weight: 850;
          letter-spacing: -0.025em;
          line-height: 1.25;
          margin: 0 0 12px;
        }

        .np-partner-sub {
          font-size: clamp(0.95rem, 1.6vw, 1.05rem);
          line-height: 1.6;
          margin: 0 auto;
          max-width: 620px;
          opacity: 0.85;
        }

        /* ── THEMING FOR LIGHT & DARK ── */
        .np-light-mode .np-partner-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.22);
        }
        .np-light-mode .np-partner-dot { background: #10b981; }
        .np-light-mode .np-partner-head { color: #0f2e2b; }
        .np-light-mode .np-partner-head b { color: #10b981; }
        .np-light-mode .np-partner-sub { color: #4b5563; }

        .np-dark-mode .np-partner-badge {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.25);
          box-shadow: 0 0 18px rgba(16, 185, 129, 0.2);
        }
        .np-dark-mode .np-partner-dot { background: #34d399; }
        .np-dark-mode .np-partner-head { color: #f8fafc; }
        .np-dark-mode .np-partner-head b {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .np-dark-mode .np-partner-sub { color: #94a3b8; }

        /* ── MARQUEE CONTAINER ── */
        .np-partner-marquee {
          position: relative;
          overflow: hidden;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
          padding: 6px 0;
        }

        .np-partner-marquee + .np-partner-marquee {
          margin-top: 14px;
        }

        .np-partner-track {
          display: flex;
          width: max-content;
          align-items: center;
        }

        /* Hover pauses smoothly so users can interact and view */
        .np-partner-marquee:hover .np-partner-track {
          animation-play-state: paused;
        }

        /* Smooth continuous scroll (60s and 68s for asynchronous organic motion) */
        .np-partner-marquee-a .np-partner-track {
          animation: npTrackLeft 60s linear infinite;
        }
        .np-partner-marquee-b .np-partner-track {
          animation: npTrackRight 68s linear infinite;
        }

        @keyframes npTrackLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes npTrackRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        /* ── PARTNER CARD CHIP ── */
        .np-partner-card {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          height: 58px;
          padding: 0 22px 0 12px;
          margin-right: 20px;
          border-radius: 9999px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          user-select: none;
        }

        .np-partner-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--partner-bg);
          border: 1px solid var(--partner-border);
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .np-partner-meta {
          display: flex;
          flex-direction: column;
          justify-content: center;
          line-height: 1.25;
        }

        .np-partner-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 750;
          font-size: 0.94rem;
          letter-spacing: -0.015em;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .np-partner-category {
          font-size: 0.67rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--partner-color);
          white-space: nowrap;
          opacity: 0.9;
        }

        /* Light Card Styles */
        .np-light-mode .np-partner-card {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 0 3px 12px -2px rgba(15, 23, 42, 0.05);
        }
        .np-light-mode .np-partner-card:hover {
          background: #ffffff;
          border-color: var(--partner-color);
          box-shadow: 0 0 22px -3px var(--partner-glow), 0 8px 20px -4px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
        }
        .np-light-mode .np-partner-card:hover .np-partner-icon-wrap {
          transform: scale(1.08);
        }
        .np-light-mode .np-partner-title {
          color: #0f2e2b;
        }

        /* Dark Card Styles */
        .np-dark-mode .np-partner-card {
          background: rgba(17, 24, 39, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.45);
        }
        .np-dark-mode .np-partner-card:hover {
          background: rgba(26, 35, 54, 0.92);
          border-color: var(--partner-color);
          box-shadow: 0 0 26px -3px var(--partner-glow), 0 8px 24px -4px rgba(0, 0, 0, 0.6);
          transform: translateY(-2px);
        }
        .np-dark-mode .np-partner-card:hover .np-partner-icon-wrap {
          transform: scale(1.08);
        }
        .np-dark-mode .np-partner-title {
          color: #f8fafc;
        }

        @media (max-width: 768px) {
          .np-partner-card {
            height: 52px;
            padding: 0 16px 0 10px;
            margin-right: 14px;
          }
          .np-partner-icon-wrap {
            width: 32px;
            height: 32px;
          }
          .np-partner-icon-wrap svg {
            width: 18px;
            height: 18px;
          }
          .np-partner-title {
            font-size: 0.86rem;
          }
          .np-partner-category {
            font-size: 0.62rem;
          }
          .np-partner-marquee + .np-partner-marquee {
            margin-top: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .np-partner-track {
            animation: none !important;
          }
        }
      `}</style>

      {showHeading && (
        <div className="np-partner-header">
          <div className="np-partner-badge">
            <span className="np-partner-dot" />
            ✦ MẠNG LƯỚI ĐỐI TÁC HỌC THUẬT &amp; SINH VIÊN ✦
          </div>
          <h2 className="np-partner-head">
            Hội tụ thành viên từ <b>50+ CLB sinh viên</b> &amp; <b>Trường Đại học</b> uy tín
          </h2>
          <p className="np-partner-sub">
            Cùng sinh viên chinh phục Quest thực tế, tích lũy điểm uy tín Reputation Score và khẳng định năng lực trước nhà tuyển dụng.
          </p>
        </div>
      )}

      <MarqueeRow variant="a" items={INSTITUTIONS_ROW_A} />
      <MarqueeRow variant="b" items={INSTITUTIONS_ROW_B} />
    </div>
  );
}
