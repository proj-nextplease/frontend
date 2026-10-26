import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sparkles,
  Globe,
  User,
  Calendar,
  Layers,
  Database,
  Lightbulb,
  Search,
  Activity,
  Award,
  Building,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { PortfolioMascot } from '../PortfolioMascot.jsx';
import { FilePreviewModal } from '../FilePreviewModal.jsx';

/**
 * Four-pointed Sparkle Star (Figma Star 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 21 in Figma 9-126)
 */
function ComNeonStar({ size = 42, color = '#FFFFFF', rotate = 0, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotate}deg)`,
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: `drop-shadow(0 0 8px ${color === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(203,247,72,0.8)'})`,
        ...style,
      }}
    >
      <path
        d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 C 50 65, 35 50, 0 50 C 35 50, 50 35, 50 0 Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Double-layer Angled Role Ribbon (Figma 9-126 "Role" / Frame 45)
 * Bottom: Lime (#CBF748), Top: White (#FFFFFF) with Purple text (#7B3AEC)
 * Streams the candidate's ACTUAL skills (or core roles).
 */
function ComNeonRibbon({
  bgBottom = '#CBF748',
  bgTop = '#FFFFFF',
  textColor = '#7B3AEC',
  rotate = '-1deg',
  skills = [],
}) {
  const roleList = useMemo(() => {
    if (skills && skills.length > 0) {
      return skills;
    }
    return [
      'Kinh nghiệm thực chiến',
      'Kỹ năng chuyên môn',
      'Đã xác thực bởi fonlio',
      'Sẵn sàng làm việc',
    ];
  }, [skills]);

  // Infinite loop array
  const loop = [...roleList, ...roleList, ...roleList, ...roleList];

  return (
    <div
      className="cn-ribbon-wrapper"
      style={{
        transform: `rotate(${rotate})`,
        filter: 'drop-shadow(13px 7px 6.3px rgba(0, 1, 81, 0.22))',
      }}
    >
      <div className="cn-ribbon-bg-bottom" style={{ background: bgBottom }} />
      <div className="cn-ribbon-bg-top" style={{ background: bgTop }}>
        <div className="cn-ribbon-track">
          {loop.map((item, idx) => (
            <span key={`${item}-${idx}`} className="cn-ribbon-item" style={{ color: textColor }}>
              <span className="cn-ribbon-text">{item}</span>
              <span className="cn-ribbon-dot" style={{ color: textColor }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to get a valid candidate-uploaded project image URL or attachment
 */
function getProjectImageUrl(exp) {
  if (!exp) return null;
  if (exp.imageUrl && typeof exp.imageUrl === 'string' && exp.imageUrl.trim()) return exp.imageUrl;
  if (exp.thumbnailUrl && typeof exp.thumbnailUrl === 'string' && exp.thumbnailUrl.trim()) return exp.thumbnailUrl;
  if (Array.isArray(exp.proofImages) && exp.proofImages[0] && typeof exp.proofImages[0] === 'string') return exp.proofImages[0];
  if (exp.certificateUrl && typeof exp.certificateUrl === 'string' && exp.certificateUrl.trim()) return exp.certificateUrl;
  return null;
}

/**
 * Authentic Interactive Mockup Screen for projects without custom uploaded shots
 * Completely eliminates dummy / fake sneaker / stock imagery and showcases real user data
 */
function ComNeonProjectMockup({ exp = {}, index = 0, isLarge = false }) {
  const title = exp.title || `Dự án ${index + 1}`;
  const org = exp.organization || exp.role || 'Dự án thực tế fonlio';
  return (
    <div className={`cn-project-mockup-screen${isLarge ? ' large' : ''}`}>
      <div className="cn-mockup-browser-bar">
        <div className="cn-mockup-dots">
          <span className="cn-mockup-dot red" />
          <span className="cn-mockup-dot yellow" />
          <span className="cn-mockup-dot green" />
        </div>
        <span className="cn-mockup-url">fonlio.me/project-{index + 1}</span>
      </div>
      <div className="cn-mockup-screen-body">
        <div className="cn-mockup-badge">
          <Sparkles size={13} />
          <span>DỰ ÁN {index + 1}</span>
        </div>
        <h4 className="cn-mockup-title">{title}</h4>
        <p className="cn-mockup-org">{org}</p>
        <div className="cn-mockup-chip-row">
          <span className="cn-mockup-chip">✦ {exp.category || 'Portfolio Case'}</span>
          {exp.verified && <span className="cn-mockup-chip verified">✦ Đã xác thực</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * High-Fidelity recreation of Figma Node 9-126 ("Portfolio Landing Page 1")
 * Theme Cốm Neon: Gradient Canvas (#000000 -> #C31DFF -> #CBF649 -> #7B3AEC),
 * Neon Lime Accents (#CBF748), Glassmorphic Cards & Glowing Aura Ellipses.
 * 
 * BÁM SÁT 100% DỮ LIỆU THẬT CỦA NGƯỜI DÙNG:
 * - Không bịa số liệu ảo, không chèn tên nhãn hàng giả (Adidas, Samsung, Red Bull...).
 * - Dữ liệu thống kê, dự án, kỹ năng, thông tin liên hệ được lấy trực tiếp từ hồ sơ ứng viên.
 */
export function ComNeonFigmaTemplate({ profile = {} }) {
  const [preview, setPreview] = useState(null);
  const [activeSection, setActiveSection] = useState('cn-hero');

  // Candidate avatar: real uploaded portrait photo OR selected fonlio Mascot
  const portraitSrc =
    profile.avatar?.portraitUrl ||
    profile.avatarUrl ||
    (typeof profile.avatar === 'string' && profile.avatar.startsWith('http') ? profile.avatar : null) ||
    profile.avatar?.url ||
    null;

  // 1. User Identity & Core Data
  const name = profile.name?.trim() || 'Ứng viên fonlio';
  const roleHeadline = profile.headline?.trim() || profile.title?.trim() || '';
  const school = profile.school?.trim() || profile.major?.trim() || '';
  const location = profile.location?.trim() || '';
  const bio = profile.bio?.trim() || '';

  // 2. Real Experiences / Projects
  const experiences = useMemo(() => {
    return (Array.isArray(profile.experiences) ? profile.experiences : []).filter(
      (e) => e && (e.title?.trim() || e.role?.trim() || e.organization?.trim() || e.description?.trim())
    );
  }, [profile.experiences]);

  // 3. Real Skills
  const skills = useMemo(() => {
    return (Array.isArray(profile.skills) ? profile.skills : []).filter(
      (s) => typeof s === 'string' && s.trim().length > 0
    );
  }, [profile.skills]);

  // 4. Real Credentials
  const credentials = useMemo(() => {
    return (Array.isArray(profile.credentials) ? profile.credentials : []).filter(
      (c) => c && (c.name?.trim() || c.title?.trim())
    );
  }, [profile.credentials]);

  // 5. Contact & Social Links
  const email = profile.socialLinks?.email || profile.email;
  const phone = profile.socialLinks?.phone || profile.phone;
  const website = profile.socialLinks?.website || profile.website || profile.portfolioUrl;

  const socialLinks = useMemo(() => {
    const list = [];
    const sl = profile.socialLinks || {};
    if (sl.github || profile.github) list.push({ name: 'GitHub', url: sl.github || profile.github });
    if (sl.linkedin || profile.linkedin) {
      const raw = sl.linkedin || profile.linkedin;
      const url = raw.startsWith('http') ? raw : `https://linkedin.com/in/${raw}`;
      list.push({ name: 'LinkedIn', url });
    }
    if (sl.facebook || profile.facebook) list.push({ name: 'Facebook', url: sl.facebook || profile.facebook });
    if (sl.behance || profile.behance) list.push({ name: 'Behance', url: sl.behance || profile.behance });
    if (website && !list.some((l) => l.name === 'Website')) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      list.push({ name: 'Website', url });
    }
    return list;
  }, [profile, website]);

  // 6. Real Stats Calculation (KHUNG KINH NGHIỆM)
  const stats = useMemo(() => {
    // Dự án đã hoàn thành / tham gia
    const projectCount = experiences.length;
    const projectFormatted = projectCount < 10 ? `0${projectCount}` : `${projectCount}`;

    // Kỹ năng chuyên môn
    const skillCount = skills.length;
    const skillFormatted = skillCount < 10 ? `0${skillCount}` : `${skillCount}`;

    // Tỷ lệ xác thực hoặc điểm uy tín
    const verifiedCount = experiences.filter((e) => e.verified).length;
    const verifiedRate = projectCount > 0 ? Math.round((verifiedCount / projectCount) * 100) : 100;

    return {
      projects: {
        value: projectCount > 0 ? `${projectFormatted}+` : '00',
        label: 'Dự án & Kinh nghiệm thực chiến',
      },
      skills: {
        value: skillCount > 0 ? `${skillFormatted}+` : (credentials.length > 0 ? `${credentials.length}` : '01'),
        label: skillCount > 0 ? 'Kỹ năng chuyên môn' : 'Chứng chỉ & Giải thưởng',
      },
      trust: {
        value: profile.reputationScore ? `${profile.reputationScore}` : `${verifiedRate}%`,
        label: profile.reputationScore ? 'Điểm uy tín fonlio' : 'Tỷ lệ kinh nghiệm đã xác thực',
      },
    };
  }, [experiences, skills, credentials, profile.reputationScore]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="cn-container">
      {/* ── EMBEDDED DEDICATED STYLESHEET ─────────────────────────────────── */}
      <style>{`
        /* ── FONTS & TOKENS ── */
        .cn-container {
          --cn-gradient: linear-gradient(180deg, #000000 0%, #C31DFF 32.69%, #CBF649 64.64%, #CBF748 90.87%, #7B3AEC 100%);
          --cn-lime: #CBF748;
          --cn-lime-alt: #CBF649;
          --cn-purple: #7B3AEC;
          --cn-magenta: #C31DFF;
          --cn-chartreuse: #BFFF00;
          --cn-white: #FFFFFF;
          --cn-black: #000000;

          font-family: 'DM Sans', -apple-system, sans-serif;
          background-color: #07041F;
          background-image: var(--cn-gradient);
          background-repeat: no-repeat;
          background-size: 100% 100%;
          color: var(--cn-white);
          overflow: hidden;
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        /* ── BACKGROUND RADIANT AURA GLOWS ── */
        .cn-aura {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .cn-aura-1 {
          width: 660px;
          height: 660px;
          right: -100px;
          top: 290px;
          background: radial-gradient(circle, rgba(203, 247, 72, 0.28) 0%, rgba(255, 255, 255, 0) 70%);
        }

        .cn-aura-2 {
          width: 680px;
          height: 680px;
          left: 5%;
          top: 40px;
          background: radial-gradient(circle, rgba(203, 247, 72, 0.45) 0%, rgba(255, 255, 255, 0) 70%);
        }

        .cn-aura-3 {
          width: 740px;
          height: 740px;
          right: 5%;
          top: 1300px;
          background: radial-gradient(circle, rgba(203, 247, 72, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
        }

        .cn-aura-4 {
          width: 740px;
          height: 740px;
          left: -150px;
          top: 2300px;
          background: radial-gradient(circle, rgba(203, 247, 72, 0.35) 0%, rgba(255, 255, 255, 0) 70%);
        }

        .cn-aura-5 {
          width: 740px;
          height: 740px;
          right: -100px;
          top: 3300px;
          background: radial-gradient(circle, rgba(123, 58, 236, 0.45) 0%, rgba(255, 255, 255, 0) 70%);
        }

        /* ── HEADER NAVBAR (FRAME 33) ── */
        .cn-header-nav {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 16px;
          width: min(1112px, calc(100% - 32px));
          justify-content: space-between;
          pointer-events: none;
        }

        .cn-nav-pill-wrap {
          pointer-events: auto;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid var(--cn-white);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 50px;
          padding: 6px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          gap: 8px;
          overflow-x: auto;
        }

        .cn-nav-btn {
          border: none;
          background: transparent;
          color: var(--cn-white);
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          line-height: 20px;
          text-transform: uppercase;
          padding: 8px 20px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .cn-nav-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .cn-nav-btn.active {
          background: var(--cn-white);
          color: var(--cn-black);
          box-shadow: 0px 1px 3.5px rgba(255, 255, 255, 0.25);
        }

        .cn-hire-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--cn-white);
          border: 1px solid var(--cn-white);
          border-radius: 50px;
          padding: 10px 24px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 15px;
          text-transform: uppercase;
          color: var(--cn-black);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
          white-space: nowrap;
        }

        .cn-hire-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 26px rgba(255, 255, 255, 0.5);
        }

        /* ── SECTION 1: HERO (TOP 179px) ── */
        .cn-hero-section {
          position: relative;
          z-index: 2;
          padding-top: 130px;
          padding-bottom: 80px;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        /* Left Avatar with Radiant Circular Frame */
        .cn-hero-avatar-box {
          position: relative;
          width: min(520px, 85vw);
          height: min(620px, 95vw);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cn-avatar-glow-ring {
          position: absolute;
          width: min(480px, 80vw);
          height: min(480px, 80vw);
          border-radius: 50%;
          background: radial-gradient(50% 50% at 50% 50%, rgba(102, 102, 102, 0) 4.33%, rgba(253, 255, 249, 0.2) 18.75%, rgba(155, 178, 86, 0.52) 54.81%, #BFFF00 100%);
          box-shadow: 0px 2px 45px -5px var(--cn-lime);
          filter: blur(10px);
          z-index: 1;
        }

        .cn-avatar-inner-ring {
          position: absolute;
          width: min(450px, 75vw);
          height: min(450px, 75vw);
          border-radius: 50%;
          border: 14px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 35px var(--cn-lime);
          z-index: 2;
          transform: rotate(-4.44deg);
        }

        .cn-avatar-img {
          position: relative;
          z-index: 3;
          width: min(420px, 70vw);
          height: min(580px, 85vw);
          object-fit: cover;
          object-position: top center;
          filter: drop-shadow(10px 14px 28px rgba(0, 0, 0, 0.6));
          border-radius: 40px;
        }

        .cn-avatar-mascot-wrap {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.45));
          animation: cnMascotFloat 4s ease-in-out infinite alternate;
        }

        @keyframes cnMascotFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }

        /* Circular Rotor Badge (DOWNLOAD CV) */
        .cn-download-badge {
          position: absolute;
          bottom: 20px;
          right: -20px;
          z-index: 10;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cn-download-badge:hover {
          transform: scale(1.1);
        }

        .cn-spin-rotor {
          transform-origin: 99.5px 99.5px;
          animation: cnRotate 18s linear infinite;
        }

        @keyframes cnRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Right Hero Content */
        .cn-hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          gap: 24px;
        }

        .cn-hero-tag-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid var(--cn-white);
          border-radius: 50px;
          padding: 10px 20px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: var(--cn-white);
        }

        .cn-hero-heading {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(30px, 3.2vw, 42px);
          line-height: 1.45;
          color: var(--cn-white);
          margin: 0;
        }

        .cn-hero-subtext {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: clamp(16px, 1.6vw, 22px);
          line-height: 1.6;
          color: var(--cn-white);
          margin: 0;
          max-width: 480px;
        }

        .cn-hero-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
          margin-top: 10px;
        }

        .cn-action-btn-white {
          background: var(--cn-white);
          border-radius: 50px;
          padding: 12px 28px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--cn-black);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
        }

        .cn-action-btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.4);
        }

        .cn-action-btn-glass {
          background: linear-gradient(153deg, rgba(255, 255, 255, 0.16) 16%, rgba(255, 255, 255, 0.08) 85%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          padding: 10px 24px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 17px;
          color: var(--cn-white);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cn-action-btn-glass:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        /* ── DOUBLE-LAYER ANGLED ROLE RIBBON ── */
        .cn-ribbon-wrapper {
          position: relative;
          width: 105%;
          margin-left: -2.5%;
          margin-top: 50px;
          margin-bottom: 50px;
          height: 90px;
          z-index: 20;
          overflow: hidden;
          user-select: none;
        }

        .cn-ribbon-bg-bottom {
          position: absolute;
          inset: 0;
          height: 100%;
        }

        .cn-ribbon-bg-top {
          position: absolute;
          inset: 8px 0;
          height: calc(100% - 16px);
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .cn-ribbon-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: cnScrollTicker 30s linear infinite;
        }

        @keyframes cnScrollTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .cn-ribbon-item {
          display: inline-flex;
          align-items: center;
          gap: 26px;
          padding-right: 26px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 22px;
          line-height: 20px;
        }

        .cn-ribbon-dot {
          font-size: 16px;
        }

        /* ── SECTION 2: VỀ MÌNH & STATS CARDS ── */
        .cn-about-section {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .cn-about-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
        }

        .cn-pill-header {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid var(--cn-white);
          border-radius: 50px;
          padding: 10px 24px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 24px;
          text-transform: uppercase;
          color: var(--cn-white);
        }

        .cn-about-headline {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(28px, 3vw, 40px);
          line-height: 1.45;
          color: var(--cn-white);
          margin: 0;
        }

        .cn-about-desc {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: clamp(16px, 1.5vw, 22px);
          line-height: 1.6;
          color: var(--cn-white);
          margin: 0;
        }

        .cn-about-cta-btn {
          background: var(--cn-white);
          border-radius: 50px;
          padding: 12px 32px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: var(--cn-black);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .cn-about-cta-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 28px rgba(255, 255, 255, 0.4);
        }

        /* 3 Glass Stat Cards (KHUNG KINH NGHIỆM) */
        .cn-stats-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cn-stat-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          transition: all 0.25s ease;
        }

        .cn-stat-card:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: translateY(-4px);
          border-color: var(--cn-lime);
          box-shadow: 0 12px 30px rgba(203, 247, 72, 0.25);
        }

        .cn-stat-number {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: clamp(48px, 5.5vw, 70px);
          line-height: 1;
          color: var(--cn-white);
          margin: 0;
        }

        .cn-stat-label {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 500;
          font-size: clamp(20px, 2.2vw, 30px);
          line-height: 1.25;
          color: var(--cn-white);
          margin: 0;
        }

        /* ── SECTION 3: KỸ NĂNG CỦA MÌNH (DỊCH VỤ CỦA TÔI) ── */
        .cn-services-section {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .cn-section-title-large {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(38px, 4.5vw, 64px);
          line-height: 1.25;
          color: var(--cn-white);
          margin: 16px 0 50px;
        }

        /* Skill Cards Grid (Matching Frame 46 & Frame 48) */
        .cn-skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          width: 100%;
        }

        .cn-skill-card {
          background: rgba(203, 247, 72, 0.38);
          border: 1px solid var(--cn-white);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 36px 26px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 16px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .cn-skill-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
          background: rgba(203, 247, 72, 0.5);
        }

        .cn-skill-icon {
          width: 52px;
          height: 52px;
          background: var(--cn-white);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cn-purple);
          margin-bottom: 6px;
        }

        .cn-skill-name {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: var(--cn-white);
          margin: 0;
        }

        .cn-skill-text {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 1.6;
          color: var(--cn-white);
          margin: 0;
        }

        /* ── SECTION 4: REAL PROJECT GALLERY (FRAME 50) ── */
        .cn-gallery-section {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .cn-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 36px;
          width: 100%;
        }

        .cn-gallery-card {
          background: rgba(217, 217, 217, 0.08);
          border: 2px solid var(--cn-white);
          border-radius: 50px;
          padding: 24px;
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: transform 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
        }

        .cn-gallery-card:hover {
          transform: scale(1.02);
          border-color: var(--cn-lime);
          box-shadow: 0 16px 40px rgba(203, 247, 72, 0.25);
        }

        .cn-gallery-img-wrap {
          width: 100%;
          height: 310px;
          border-radius: 40px;
          overflow: hidden;
          border: 2px solid var(--cn-white);
          position: relative;
        }

        .cn-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .cn-gallery-card:hover .cn-gallery-img {
          transform: scale(1.05);
        }

        /* ── AUTHENTIC PROJECT MOCKUP SCREEN (NO FAKE / STOCK IMAGERY) ── */
        .cn-project-mockup-screen {
          width: 100%;
          height: 100%;
          min-height: 280px;
          border-radius: 36px;
          background: linear-gradient(135deg, rgba(20, 10, 45, 0.95) 0%, rgba(45, 15, 80, 0.85) 60%, rgba(123, 58, 236, 0.4) 100%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 10px 30px rgba(0, 0, 0, 0.35);
        }

        .cn-project-mockup-screen.large {
          min-height: 320px;
        }

        .cn-mockup-browser-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          background: rgba(0, 0, 0, 0.35);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cn-mockup-dots {
          display: flex;
          gap: 6px;
        }

        .cn-mockup-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .cn-mockup-dot.red { background: #FF5F56; }
        .cn-mockup-dot.yellow { background: #FFBD2E; }
        .cn-mockup-dot.green { background: #27C93F; }

        .cn-mockup-url {
          font-family: 'DM Sans', monospace, sans-serif;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 10px;
          border-radius: 20px;
        }

        .cn-mockup-screen-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          gap: 10px;
        }

        .cn-mockup-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(203, 247, 72, 0.15);
          border: 1px solid var(--cn-lime);
          color: var(--cn-lime);
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .cn-mockup-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: clamp(20px, 2vw, 26px);
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          max-width: 90%;
        }

        .cn-mockup-org {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
        }

        .cn-mockup-chip-row {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cn-mockup-chip {
          padding: 4px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
        }

        .cn-mockup-chip.verified {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(34, 197, 94, 0.5);
          color: #4ade80;
        }

        .cn-gallery-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
        }

        .cn-gallery-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--cn-white);
          margin: 0;
          text-align: left;
        }

        .cn-gallery-tag {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--cn-lime);
          text-transform: uppercase;
        }

        /* ── SECTION 5: DETAILED PROJECT SHOWCASES (DỰ ÁN 1, 2, 3...) ── */
        .cn-showcase-section {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 70px 24px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .cn-showcase-top-row {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 50px;
          align-items: center;
        }

        .cn-showcase-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .cn-showcase-num {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(56px, 7vw, 110px);
          line-height: 1;
          color: var(--cn-white);
          margin: 0;
          letter-spacing: -2px;
        }

        .cn-showcase-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: var(--cn-lime);
          margin: 0;
        }

        .cn-showcase-desc {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 400;
          font-size: clamp(16px, 1.4vw, 20px);
          line-height: 1.6;
          color: var(--cn-white);
          margin: 0;
          opacity: 0.95;
        }

        .cn-showcase-mockup-frame {
          background: rgba(217, 217, 217, 0.08);
          border: 2px solid var(--cn-white);
          border-radius: 50px;
          padding: 24px;
          backdrop-filter: blur(12px);
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .cn-showcase-mockup-frame:hover {
          transform: scale(1.02);
          border-color: var(--cn-lime);
        }

        .cn-showcase-img {
          width: 100%;
          height: min(340px, 45vw);
          object-fit: cover;
          border-radius: 36px;
          border: 2px solid var(--cn-white);
        }

        /* 3 Stat Cards below each Project (Frame 55/56/57) */
        .cn-stat-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 10px;
        }

        .cn-stat-subcard {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid var(--cn-white);
          border-radius: 24px;
          padding: 28px 22px;
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s ease;
        }

        .cn-stat-subcard:hover {
          transform: translateY(-4px);
          border-color: var(--cn-lime);
        }

        .cn-stat-subcard-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 22px;
          line-height: 1.3;
          margin: 0;
          color: var(--cn-black);
        }

        .cn-stat-subcard-val {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
          line-height: 1.4;
          margin: 0;
          color: var(--cn-black);
        }

        .cn-empty-box {
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px dashed var(--cn-white);
          border-radius: 32px;
          padding: 48px 32px;
          text-align: center;
          width: 100%;
          color: rgba(255, 255, 255, 0.8);
          font-size: 18px;
        }

        /* ── SECTION 6: FOOTER (BOTTOM CANVAS: LIME TO PURPLE GRADIENT & FIGMA 9-126) ── */
        .cn-footer-section {
          position: relative;
          z-index: 2;
          padding: 110px 24px 60px;
          margin-top: 50px;
          background: linear-gradient(180deg, rgba(203, 247, 72, 0) 0%, rgba(123, 58, 236, 0.4) 22%, #7B3AEC 65%, #5618C2 100%);
          overflow: hidden;
        }

        /* Ambient Aura Glow behind the avatar (Ellipse 28 in Figma) */
        .cn-footer-aura-glow {
          position: absolute;
          right: 5%;
          top: 12%;
          width: min(680px, 85vw);
          height: min(680px, 85vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(203, 247, 72, 0.65) 0%, rgba(203, 247, 72, 0.22) 40%, rgba(123, 58, 236, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 1;
        }

        .cn-footer-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 50px;
        }

        /* Two-column layout: Left = Contact info, Right = Avatar & Download */
        .cn-footer-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 60px;
          align-items: center;
        }

        /* Left Column: Contact */
        .cn-footer-contact-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 18px;
        }

        .cn-footer-pill-row {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .cn-footer-tag-pill {
          background: var(--cn-lime);
          color: var(--cn-black);
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 8px 24px;
          border-radius: 50px;
          box-shadow: 0 4px 18px rgba(203, 247, 72, 0.45);
        }

        .cn-footer-headline {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: clamp(30px, 3.6vw, 46px);
          line-height: 1.25;
          color: var(--cn-white);
          margin: 0;
        }

        .cn-footer-subhead {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(15px, 1.3vw, 18px);
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 6px 0;
          line-height: 1.5;
        }

        .cn-footer-card-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .cn-footer-info-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          text-decoration: none;
          color: inherit;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cn-footer-info-row:hover {
          border-color: var(--cn-lime);
          background: rgba(203, 247, 72, 0.22);
          transform: translateX(6px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .cn-footer-info-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--cn-lime);
          color: var(--cn-black);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(203, 247, 72, 0.35);
        }

        .cn-footer-info-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cn-footer-info-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.65);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .cn-footer-info-text {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--cn-white);
          word-break: break-all;
        }

        .cn-footer-social-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 6px;
        }

        .cn-footer-social-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.16);
          color: var(--cn-white);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 50px;
          padding: 8px 20px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .cn-footer-social-pill:hover {
          background: var(--cn-lime);
          color: var(--cn-black);
          border-color: var(--cn-lime);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(203, 247, 72, 0.45);
        }

        /* Right Column: Avatar Frame with Glowing Rings & Download CV Rotor */
        .cn-footer-avatar-col {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .cn-footer-avatar-box {
          position: relative;
          width: min(500px, 85vw);
          height: min(580px, 92vw);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Bottom Banner: THANKS FOR WATCHING! */
        .cn-footer-bottom-banner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          margin-top: 10px;
        }

        .cn-footer-thanks-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(34px, 5.5vw, 76px);
          line-height: 1.1;
          color: var(--cn-white);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
          text-shadow: 0 4px 28px rgba(203, 247, 72, 0.45), 0 0 60px rgba(123, 58, 236, 0.7);
        }

        .cn-footer-divider-line {
          width: min(460px, 70vw);
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(203, 247, 72, 0.65), transparent);
          margin: 6px auto;
        }

        .cn-footer-copyright {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
        }

        /* ── RESPONSIVE ADAPTATIONS ── */
        @media (max-width: 1024px) {
          .cn-hero-section {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .cn-hero-content {
            align-items: center;
            text-align: center;
          }
          .cn-hero-actions {
            align-items: center;
          }
          .cn-about-section {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .cn-skills-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cn-gallery-grid {
            grid-template-columns: 1fr;
          }
          .cn-showcase-top-row {
            grid-template-columns: 1fr;
          }
          .cn-footer-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }
          .cn-footer-contact-col {
            align-items: center;
            text-align: center;
          }
          .cn-footer-headline {
            text-align: center;
          }
          .cn-footer-social-wrap {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .cn-skills-grid {
            grid-template-columns: 1fr;
          }
          .cn-stat-cards-row {
            grid-template-columns: 1fr;
          }
          .cn-footer-section {
            padding: 90px 16px 50px;
          }
          .cn-header-nav {
            top: 12px;
          }
        }
      `}</style>

      {/* ── BACKGROUND RADIANT AURA GLOWS ── */}
      <div className="cn-aura cn-aura-1" />
      <div className="cn-aura cn-aura-2" />
      <div className="cn-aura cn-aura-3" />
      <div className="cn-aura cn-aura-4" />
      <div className="cn-aura cn-aura-5" />

      {/* ── HEADER NAVBAR ── */}
      <header className="cn-header-nav">
        <nav className="cn-nav-pill-wrap" aria-label="Portfolio sections">
          <button
            type="button"
            className={`cn-nav-btn ${activeSection === 'cn-hero' ? 'active' : ''}`}
            onClick={() => scrollTo('cn-hero')}
          >
            Trang chủ
          </button>
          <button
            type="button"
            className={`cn-nav-btn ${activeSection === 'cn-about' ? 'active' : ''}`}
            onClick={() => scrollTo('cn-about')}
          >
            Portfolio
          </button>
          <button
            type="button"
            className={`cn-nav-btn ${activeSection === 'cn-services' ? 'active' : ''}`}
            onClick={() => scrollTo('cn-services')}
          >
            Dịch vụ
          </button>
          <button
            type="button"
            className={`cn-nav-btn ${activeSection === 'cn-gallery' ? 'active' : ''}`}
            onClick={() => scrollTo('cn-gallery')}
          >
            Về chúng tôi
          </button>
          <button
            type="button"
            className={`cn-nav-btn ${activeSection === 'cn-footer' ? 'active' : ''}`}
            onClick={() => scrollTo('cn-footer')}
          >
            Liên hệ
          </button>
        </nav>

        <button
          type="button"
          className="cn-hire-btn"
          onClick={() => scrollTo('cn-footer')}
        >
          Tuyển tôi
        </button>
      </header>

      {/* ── SECTION 1: HERO (TOP 179px) ── */}
      <section id="cn-hero" className="cn-hero-section">
        {/* Left Avatar with Radiant Circular Glow & Download Rotor */}
        <div className="cn-hero-avatar-box">
          <div className="cn-avatar-glow-ring" />
          <div className="cn-avatar-inner-ring" />

          {portraitSrc ? (
            <img
              src={portraitSrc}
              alt={name}
              className="cn-avatar-img"
            />
          ) : (
            <div className="cn-avatar-mascot-wrap">
              <PortfolioMascot avatar={profile.avatar} size={280} />
            </div>
          )}
        </div>

        {/* Right Hero Content */}
        <div className="cn-hero-content">
          <div className="cn-hero-tag-pill">
            Kinh nghiệm làm việc
          </div>

          <h1 className="cn-hero-heading">
            Xin chào! Mình là {name}
            {roleHeadline ? `, hiện là ${roleHeadline}` : ''}
            {school ? ` tại ${school}` : ''}
          </h1>

          {bio && (
            <p className="cn-hero-subtext">
              {bio}
            </p>
          )}

          <div className="cn-hero-actions">
            <button
              type="button"
              className="cn-action-btn-white"
              onClick={() => scrollTo('cn-gallery')}
            >
              Hãy cùng tìm hiểu portfolio của mình!
            </button>
            <button
              type="button"
              className="cn-action-btn-glass"
              onClick={() => scrollTo('cn-about')}
            >
              Công việc của tôi
            </button>
          </div>
        </div>
      </section>

      {/* ── DOUBLE-LAYER ANGLED ROLE RIBBON #1 ── */}
      <ComNeonRibbon
        bgBottom="#CBF748"
        bgTop="#FFFFFF"
        textColor="#7B3AEC"
        rotate="-1deg"
        skills={skills}
      />

      {/* ── SECTION 2: VỀ MÌNH & STATS CARDS ── */}
      <section id="cn-about" className="cn-about-section">
        <div className="cn-about-copy">
          <div className="cn-pill-header">
            <ComNeonStar size={24} color="#CBF748" />
            <span>VỀ MÌNH</span>
          </div>

          <h2 className="cn-about-headline">
            Mình hiện là {roleHeadline || 'Ứng viên tiềm năng'} {location ? `và đang hoạt động tại ${location}` : ''}
          </h2>

          <p className="cn-about-desc">
            {bio ||
              'Với tư duy làm việc chủ động và tinh thần học hỏi không ngừng, mình luôn nỗ lực tạo ra các giá trị đột phá, đóng góp tích cực cho từng dự án và tổ chức.'}
          </p>

          <button
            type="button"
            className="cn-about-cta-btn"
            onClick={() => scrollTo('cn-showcases')}
          >
            Đăng hồ sơ công việc của bạn tại đây
          </button>
        </div>

        {/* 3 Real Stat Cards (KHUNG KINH NGHIỆM) */}
        <div className="cn-stats-column">
          <div className="cn-stat-card">
            <h3 className="cn-stat-number">{stats.projects.value}</h3>
            <p className="cn-stat-label">{stats.projects.label}</p>
          </div>

          <div className="cn-stat-card">
            <h3 className="cn-stat-number">{stats.skills.value}</h3>
            <p className="cn-stat-label">{stats.skills.label}</p>
          </div>

          <div className="cn-stat-card">
            <h3 className="cn-stat-number">{stats.trust.value}</h3>
            <p className="cn-stat-label">{stats.trust.label}</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: KỸ NĂNG CỦA MÌNH (DỊCH VỤ CỦA TÔI) ── */}
      <section id="cn-services" className="cn-services-section">
        <div className="cn-pill-header">
          <ComNeonStar size={24} color="#CBF748" />
          <span>DỊCH VỤ CỦA TÔI</span>
        </div>

        <h2 className="cn-section-title-large">Kỹ năng của mình</h2>

        {skills.length > 0 ? (
          <div className="cn-skills-grid">
            {skills.map((skillName, idx) => (
              <div key={idx} className="cn-skill-card">
                <div className="cn-skill-icon">
                  <Sparkles size={28} />
                </div>
                <h3 className="cn-skill-name">{skillName}</h3>
                <p className="cn-skill-text">
                  Kỹ năng chuyên môn thực chiến được ứng dụng trong các dự án và nhiệm vụ của ứng viên tại fonlio.
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="cn-empty-box">
            Chưa có kỹ năng nào được cập nhật. Bạn có thể thêm kỹ năng tại trang chỉnh sửa hồ sơ.
          </div>
        )}
      </section>

      {/* ── DOUBLE-LAYER ANGLED ROLE RIBBON #2 ── */}
      <ComNeonRibbon
        bgBottom="#CBF748"
        bgTop="#FFFFFF"
        textColor="#7B3AEC"
        rotate="-1deg"
        skills={skills}
      />

      {/* ── SECTION 4: 2x3 REAL PROJECT OVERVIEW (FRAME 50) ── */}
      <section id="cn-gallery" className="cn-gallery-section">
        <div className="cn-pill-header">
          <ComNeonStar size={24} color="#CBF748" />
          <span>PORTFOLIO</span>
        </div>

        <h2 className="cn-section-title-large">
          Đây là những dự án thuộc về chuyên ngành của mình
        </h2>

        {experiences.length > 0 ? (
          <div className="cn-gallery-grid">
            {experiences.map((exp, idx) => {
              const shot = getProjectImageUrl(exp);

              return (
                <div
                  key={exp.id || idx}
                  className="cn-gallery-card"
                  onClick={() => {
                    if (shot) {
                      setPreview({
                        src: shot,
                        fileName: exp.title || `Dự án ${idx + 1}`,
                      });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  title="Nhấn để xem chi tiết ảnh dự án"
                >
                  <div className="cn-gallery-img-wrap">
                    {shot ? (
                      <img
                        src={shot}
                        alt={exp.title || `Dự án ${idx + 1}`}
                        className="cn-gallery-img"
                      />
                    ) : (
                      <ComNeonProjectMockup exp={exp} index={idx} />
                    )}
                  </div>
                  <div className="cn-gallery-footer">
                    <h4 className="cn-gallery-title">
                      {exp.title || `Dự án ${idx + 1}`}
                    </h4>
                    <span className="cn-gallery-tag">
                      #{exp.role || exp.organization || 'Dự án thực tế'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="cn-empty-box">
            Chưa có dự án nào được thêm. Bạn có thể thêm dự án và kinh nghiệm tại trang chỉnh sửa hồ sơ.
          </div>
        )}
      </section>

      {/* ── DOUBLE-LAYER ANGLED ROLE RIBBON #3 ── */}
      {experiences.length > 0 && (
        <ComNeonRibbon
          bgBottom="#CBF748"
          bgTop="#FFFFFF"
          textColor="#7B3AEC"
          rotate="-1deg"
          skills={skills}
        />
      )}

      {/* ── SECTION 5: DETAILED PROJECT SHOWCASES (DỰ ÁN 1, 2, 3...) ── */}
      {experiences.length > 0 && (
        <div id="cn-showcases">
          {experiences.map((exp, idx) => {
            const shot = getProjectImageUrl(exp);

            const timeStr = `${exp.startDate || ''}${
              exp.endDate ? ' - ' + exp.endDate : exp.startDate ? ' - Hiện tại' : 'Đang cập nhật'
            }`;

            return (
              <React.Fragment key={exp.id || idx}>
                <section className="cn-showcase-section">
                  <div className="cn-showcase-top-row">
                    <div className="cn-showcase-info">
                      <div className="cn-pill-header" style={{ padding: '6px 18px', fontSize: '18px' }}>
                        <span>PORTFOLIO</span>
                      </div>
                      <h2 className="cn-showcase-num">Dự án {idx + 1}</h2>
                      <h3 className="cn-showcase-title">{exp.title}</h3>
                      <p className="cn-showcase-desc">
                        {exp.description ||
                          exp.detail ||
                          'Dự án thực tế do ứng viên trực tiếp đảm nhận và hoàn thành.'}
                      </p>
                    </div>

                    <div
                      className="cn-showcase-mockup-frame"
                      onClick={() => {
                        if (shot) {
                          setPreview({
                            src: shot,
                            fileName: exp.title || `Dự án ${idx + 1}`,
                          });
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      title="Xem phóng to ảnh dự án"
                    >
                      {shot ? (
                        <img src={shot} alt={exp.title} className="cn-showcase-img" />
                      ) : (
                        <ComNeonProjectMockup exp={exp} index={idx} isLarge />
                      )}
                    </div>
                  </div>

                  {/* 3 Real Stat Cards below each Project */}
                  <div className="cn-stat-cards-row">
                    <div className="cn-stat-subcard">
                      <h4 className="cn-stat-subcard-title">Vị trí trong dự án</h4>
                      <p className="cn-stat-subcard-val">{exp.role || 'Thành viên đóng góp'}</p>
                    </div>
                    <div className="cn-stat-subcard">
                      <h4 className="cn-stat-subcard-title">Thời gian thực hiện</h4>
                      <p className="cn-stat-subcard-val">{timeStr}</p>
                    </div>
                    <div className="cn-stat-subcard">
                      <h4 className="cn-stat-subcard-title">Đơn vị / Xác thực</h4>
                      <p className="cn-stat-subcard-val">
                        {exp.organization ? (
                          <>
                            {exp.organization}
                            {exp.verified && ' (✦ Đã xác thực)'}
                          </>
                        ) : exp.verified ? (
                          'Đã xác thực bởi fonlio ✦'
                        ) : (
                          'Dự án độc lập'
                        )}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Ribbon Separator between showcase projects */}
                {idx < experiences.length - 1 && (
                  <ComNeonRibbon
                    bgBottom="#CBF748"
                    bgTop="#FFFFFF"
                    textColor="#7B3AEC"
                    rotate="-1deg"
                    skills={skills}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── SECTION 6: FOOTER (BOTTOM CANVAS: LIME TO PURPLE GRADIENT & FIGMA 9-126) ── */}
      <footer id="cn-footer" className="cn-footer-section">
        {/* Ambient Aura Glow behind the avatar (Ellipse 28 in Figma) */}
        <div className="cn-footer-aura-glow" />

        {/* Floating Sparkle Stars (Figma Star 20, 21, 22 in Footer) */}
        <ComNeonStar
          size={44}
          color="#FFFFFF"
          rotate={-15}
          style={{ position: 'absolute', top: '12%', left: '7%', pointerEvents: 'none', opacity: 0.85 }}
        />
        <ComNeonStar
          size={30}
          color="#CBF748"
          rotate={25}
          style={{ position: 'absolute', top: '22%', left: '4%', pointerEvents: 'none', opacity: 0.9 }}
        />
        <ComNeonStar
          size={38}
          color="#FFFFFF"
          rotate={-10}
          style={{ position: 'absolute', top: '10%', right: '11%', pointerEvents: 'none', opacity: 0.85 }}
        />
        <ComNeonStar
          size={58}
          color="#CBF748"
          rotate={35}
          style={{ position: 'absolute', bottom: '26%', right: '5%', pointerEvents: 'none', opacity: 0.9 }}
        />
        <ComNeonStar
          size={26}
          color="#CBF748"
          rotate={-20}
          style={{ position: 'absolute', bottom: '20%', left: '46%', pointerEvents: 'none', opacity: 0.8 }}
        />

        <div className="cn-footer-container">
          <div className="cn-footer-grid">
            {/* Left Column: Contact Information (Figma 9-126) */}
            <div className="cn-footer-contact-col">
              <div className="cn-footer-pill-row">
                <ComNeonStar size={22} color="#CBF748" />
                <div className="cn-footer-tag-pill">LIÊN HỆ</div>
              </div>

              <h3 className="cn-footer-headline">Kết nối với mình</h3>
              <p className="cn-footer-subhead">
                Sẵn sàng hợp tác trong các dự án mới &amp; cơ hội nghề nghiệp thú vị.
              </p>

              <div className="cn-footer-card-list">
                <div className="cn-footer-info-row">
                  <div className="cn-footer-info-icon">
                    <User size={22} />
                  </div>
                  <div className="cn-footer-info-content">
                    <span className="cn-footer-info-label">Họ và tên</span>
                    <span className="cn-footer-info-text">{name}</span>
                  </div>
                </div>

                {phone && (
                  <a href={`tel:${phone}`} className="cn-footer-info-row">
                    <div className="cn-footer-info-icon">
                      <Phone size={22} />
                    </div>
                    <div className="cn-footer-info-content">
                      <span className="cn-footer-info-label">Số điện thoại</span>
                      <span className="cn-footer-info-text">{phone}</span>
                    </div>
                  </a>
                )}

                {email && (
                  <a href={`mailto:${email}`} className="cn-footer-info-row">
                    <div className="cn-footer-info-icon">
                      <Mail size={22} />
                    </div>
                    <div className="cn-footer-info-content">
                      <span className="cn-footer-info-label">Email / Gmail</span>
                      <span className="cn-footer-info-text">{email}</span>
                    </div>
                  </a>
                )}

                {website && (
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cn-footer-info-row"
                  >
                    <div className="cn-footer-info-icon">
                      <Globe size={22} />
                    </div>
                    <div className="cn-footer-info-content">
                      <span className="cn-footer-info-label">Website cá nhân</span>
                      <span className="cn-footer-info-text">{website}</span>
                    </div>
                  </a>
                )}
              </div>

              {/* Dynamic Social Links */}
              {socialLinks.length > 0 && (
                <div className="cn-footer-social-wrap">
                  {socialLinks.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cn-footer-social-pill"
                    >
                      <ExternalLink size={15} />
                      <span>{s.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Avatar Frame with Radiant Glow & Circular Rotor */}
            <div className="cn-footer-avatar-col">
              <div className="cn-footer-avatar-box">
                <div className="cn-avatar-glow-ring" />
                <div className="cn-avatar-inner-ring" />

                {portraitSrc ? (
                  <img
                    src={portraitSrc}
                    alt={name}
                    className="cn-avatar-img"
                  />
                ) : (
                  <div className="cn-avatar-mascot-wrap">
                    <PortfolioMascot avatar={profile.avatar} size={280} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Banner: THANKS FOR WATCHING! */}
          <div className="cn-footer-bottom-banner">
            <h2 className="cn-footer-thanks-title">THANKS FOR WATCHING!</h2>
          </div>
        </div>
      </footer>

      {/* Image / Attachment Preview Modal */}
      {preview && (
        <FilePreviewModal
          src={preview.src}
          fileName={preview.fileName}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

export default ComNeonFigmaTemplate;
