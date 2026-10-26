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
  Share2,
  Calendar,
  User,
  Activity,
  Award,
} from 'lucide-react';
import { PortfolioMascot } from '../PortfolioMascot.jsx';
import { FilePreviewModal } from '../FilePreviewModal.jsx';

function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0-.01-3.34 1.67 1.67 0 0 0 .01 3.34M7.86 18.5V10.13H5.07V18.5h2.79Z" />
    </svg>
  );
}

/**
 * Four-pointed Sparkle Star (Figma Star 29, 30, 31, 32, 41, etc.)
 */
function NeonStar({ size = 48, color = '#CBF748', rotate = 0, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotate}deg)`,
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: `drop-shadow(0 0 12px ${color}88)`,
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
 * Double-layer Angled Role Ribbon (Figma 10-129 "Role" & "SIDE BAR")
 * Alternating neon green/cyan backgrounds with bold uppercase Poppins 900 ticker
 */
function NhoNeonRibbon({
  bgBottom = '#63FF38',
  bgTop = '#CBF748',
  textColor = '#000000',
  rotate = '-1.37deg',
  skills = [],
}) {
  const roleList = useMemo(() => {
    if (skills && skills.length > 0) {
      return skills;
    }
    return [
      'THIẾT KẾ GIAO DIỆN',
      'THIẾT KẾ ĐỒ HỌA',
      'MARKETING',
      'PHÂN TÍCH TÀI CHÍNH',
      'THIẾT KẾ WEBSITE',
      'NGHIÊN CỨU NGƯỜI DÙNG',
      'QUẢN TRỊ THƯƠNG HIỆU',
      'SÁNG TẠO NỘI DUNG',
    ];
  }, [skills]);

  // Infinite loop array
  const loop = [...roleList, ...roleList, ...roleList, ...roleList];

  return (
    <div
      className="nn-ribbon-wrapper"
      style={{
        transform: `rotate(${rotate})`,
        filter: 'drop-shadow(13px 7px 6.3px rgba(0, 1, 81, 0.22))',
      }}
    >
      <div className="nn-ribbon-bg-bottom" style={{ background: bgBottom }} />
      <div className="nn-ribbon-bg-top" style={{ background: bgTop }}>
        <div className="nn-ribbon-track">
          {loop.map((item, idx) => (
            <span key={`${item}-${idx}`} className="nn-ribbon-item" style={{ color: textColor }}>
              <span className="nn-ribbon-text">{item.toUpperCase()}</span>
              <span className="nn-ribbon-dot" style={{ color: textColor }}>✦</span>
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
 * Matching Nho Neon (Figma 10-129) styling with Cyberpunk dot bar and verified badges
 */
function NhoNeonProjectMockup({ exp = {}, index = 0, isDark = false }) {
  const title = exp.title || `Dự án ${index + 1}`;
  const org = exp.organization || exp.role || 'Dự án thực tế fonlio';
  return (
    <div className={`nn-project-mockup-screen${isDark ? ' dark' : ' light'}`}>
      <div className="nn-mockup-browser-bar">
        <div className="nn-mockup-dots">
          <span className="nn-mockup-dot red" />
          <span className="nn-mockup-dot yellow" />
          <span className="nn-mockup-dot green" />
        </div>
        <span className="nn-mockup-url">fonlio.me/project-{index + 1}</span>
      </div>
      <div className="nn-mockup-screen-body">
        <div className="nn-mockup-badge">
          <Sparkles size={13} />
          <span>DỰ ÁN {index + 1}</span>
        </div>
        <h4 className="nn-mockup-title">{title}</h4>
        <p className="nn-mockup-org">{org}</p>
        <div className="nn-mockup-chip-row">
          <span className="nn-mockup-chip">✦ {exp.category || 'Portfolio Case'}</span>
          {exp.verified && <span className="nn-mockup-chip verified">✦ Đã xác thực</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * High-Fidelity recreation of Figma Node 10-129 ("Portfolio Landing Page 2")
 * Theme Nho Neon: Electric Blue (#250CF1), Neon Lime (#CBF748), Stark White (#FFFFFF), Deep Midnight (#07041F)
 * 
 * BÁM SÁT 100% DỮ LIỆU THẬT CỦA NGƯỜI DÙNG:
 * - Không bịa số liệu ảo, không chèn tên nhãn hàng giả (Adidas, Fintech...).
 * - Dữ liệu thống kê, dự án, kỹ năng, thông tin liên hệ được lấy trực tiếp từ hồ sơ ứng viên.
 */
export function NhoNeonFigmaTemplate({ profile = {} }) {
  const [preview, setPreview] = useState(null);
  const [activeSection, setActiveSection] = useState('nn-hero');

  // Candidate avatar: portrait photo or Mascot fallback
  const portraitSrc =
    profile.avatar?.portraitUrl ||
    profile.avatarUrl ||
    (typeof profile.avatar === 'string' && profile.avatar.startsWith('http') ? profile.avatar : null) ||
    profile.avatar?.url ||
    null;

  // 1. User Identity & Core Data
  const name = profile.name?.trim() || 'Ứng viên fonlio';
  const birthYear = profile.birthYear || '';
  const roleTitle = profile.headline?.trim() || profile.title?.trim() || '';
  const bio = profile.bio?.trim() || '';
  const location = profile.location?.trim() || '';
  const school = profile.school?.trim() || profile.major?.trim() || '';
  const email = profile.socialLinks?.email || profile.email || '';
  const phone = profile.socialLinks?.phone || profile.phone || '';
  const website = profile.socialLinks?.website || profile.website || profile.portfolioUrl || '';

  // 2. Real Social Links (Only those the candidate actually provided)
  const socialLinks = useMemo(() => {
    const links = [];
    const sl = profile.socialLinks || {};
    if (sl.github || profile.github) links.push({ name: 'GitHub', url: sl.github || profile.github });
    if (sl.linkedin || profile.linkedin) {
      const raw = sl.linkedin || profile.linkedin;
      const url = raw.startsWith('http') ? raw : `https://linkedin.com/in/${raw}`;
      links.push({ name: 'LinkedIn', url });
    }
    if (sl.facebook || profile.facebook) links.push({ name: 'Facebook', url: sl.facebook || profile.facebook });
    if (sl.behance || profile.behance) links.push({ name: 'Behance', url: sl.behance || profile.behance });
    if (website && !links.some((l) => l.name === 'Website')) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      links.push({ name: 'Website', url });
    }
    return links;
  }, [profile, website]);

  // 3. Real Skills
  const skills = useMemo(() => {
    return (Array.isArray(profile.skills) ? profile.skills : []).filter(
      (s) => typeof s === 'string' && s.trim().length > 0
    );
  }, [profile.skills]);

  // 4. Real Experiences & Projects
  const experiences = useMemo(() => {
    return (Array.isArray(profile.experiences) ? profile.experiences : []).filter(
      (e) => e && (e.title?.trim() || e.role?.trim() || e.organization?.trim() || e.description?.trim())
    );
  }, [profile.experiences]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="nn-container">
      {/* ── EMBEDDED DEDICATED STYLESHEET ─────────────────────────────────── */}
      <style>{`
        /* ── FONTS & TOKENS ── */
        .nn-container {
          --nn-blue: #250CF1;
          --nn-lime: #CBF748;
          --nn-green: #63FF38;
          --nn-chartreuse: #BFFF00;
          --nn-cyan: #00FFE8;
          --nn-midnight: #07041F;
          --nn-white: #FFFFFF;
          --nn-black: #000000;

          font-family: 'DM Sans', -apple-system, sans-serif;
          background-color: var(--nn-white);
          color: var(--nn-black);
          overflow-x: clip;
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        /* ── HEADER NAVBAR ── */
        .nn-header-nav {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 16px;
          width: min(1140px, calc(100% - 32px));
          justify-content: space-between;
          pointer-events: none;
        }

        .nn-nav-pill-wrap {
          pointer-events: auto;
          display: flex;
          align-items: center;
          background: rgba(155, 178, 86, 0.45);
          border: 1.5px solid var(--nn-lime);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 18px;
          padding: 5px;
          box-shadow: 0 8px 32px rgba(37, 12, 241, 0.25);
          gap: 6px;
          overflow-x: auto;
        }

        .nn-nav-btn {
          border: none;
          background: transparent;
          color: var(--nn-lime);
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          line-height: 20px;
          text-transform: uppercase;
          padding: 8px 18px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nn-nav-btn:hover {
          color: var(--nn-white);
          background: rgba(203, 247, 72, 0.15);
        }

        .nn-nav-btn.active {
          background: var(--nn-lime);
          color: var(--nn-blue);
          box-shadow: 0px 1px 4px rgba(255, 255, 255, 0.35);
        }

        .nn-hire-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--nn-lime);
          border: 1.5px solid var(--nn-lime);
          border-radius: 18px;
          padding: 10px 24px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 15px;
          text-transform: uppercase;
          color: var(--nn-blue);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          box-shadow: 0 4px 18px rgba(203, 247, 72, 0.4);
          white-space: nowrap;
        }

        .nn-hire-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 24px rgba(203, 247, 72, 0.6);
        }

        /* ── SECTION 1: HERO (RECTANGLE 18: #250CF1) ── */
        .nn-hero-section {
          position: relative;
          background-color: var(--nn-blue);
          min-height: 1050px;
          padding-top: 120px;
          padding-bottom: 80px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        /* Ambient floating circles */
        .nn-hero-orb {
          position: absolute;
          border-radius: 50%;
          background: var(--nn-chartreuse);
          pointer-events: none;
          z-index: 1;
        }

        .nn-hero-orb-1 {
          width: 168px;
          height: 168px;
          left: 5%;
          top: 15%;
          filter: drop-shadow(0 0 24px rgba(191, 255, 0, 0.5));
        }

        .nn-hero-orb-2 {
          width: 80px;
          height: 80px;
          left: 12%;
          top: 25%;
          filter: drop-shadow(0 0 16px rgba(191, 255, 0, 0.4));
        }

        .nn-hero-orb-3 {
          width: 168px;
          height: 168px;
          right: 6%;
          top: 45%;
          filter: drop-shadow(0 0 24px rgba(191, 255, 0, 0.5));
        }

        .nn-hero-orb-4 {
          width: 80px;
          height: 80px;
          right: 12%;
          top: 42%;
        }

        /* Giant Slackey Typography Stack */
        .nn-slackey-stack {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: -180px;
          width: 100%;
        }

        .nn-slackey-line {
          font-family: 'Slackey', cursive, sans-serif;
          font-weight: 400;
          color: var(--nn-white);
          text-transform: uppercase;
          line-height: 0.95;
          letter-spacing: -2px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
          user-select: none;
        }

        .nn-slackey-portfolio {
          font-size: clamp(64px, 9.5vw, 165px);
        }

        .nn-slackey-name {
          font-size: clamp(56px, 8.8vw, 155px);
          color: #FFFFFF;
        }

        .nn-slackey-year {
          font-size: clamp(56px, 8.8vw, 155px);
          color: #FFFFFF;
        }

        /* Hero Image Container with Cutout and Badges */
        .nn-hero-stage {
          position: relative;
          z-index: 4;
          width: min(1000px, 92vw);
          min-height: 580px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 40px;
        }

        .nn-hero-portrait-frame {
          position: relative;
          width: min(520px, 75vw);
          height: min(650px, 85vw);
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(9px 12px 24px rgba(0, 0, 0, 0.45));
        }

        .nn-hero-portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          border-radius: 40px;
          border: 4px solid var(--nn-lime);
          box-shadow: 0 0 35px rgba(203, 247, 72, 0.4);
        }

        /* Floating Cyber Dashed Badges */
        .nn-cyber-badge {
          position: absolute;
          background: var(--nn-lime);
          border: 5px dashed var(--nn-black);
          box-shadow: 5px 7px 8px rgba(0, 0, 0, 0.25);
          border-radius: 66px;
          padding: 16px 36px;
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          color: var(--nn-black);
          text-transform: uppercase;
          z-index: 10;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nn-cyber-badge:hover {
          filter: brightness(1.08);
          transform: scale(1.06) !important;
        }

        .nn-badge-1 {
          right: 2%;
          top: 12%;
          transform: rotate(6.08deg);
          font-size: clamp(18px, 2.2vw, 36px);
        }

        .nn-badge-2 {
          left: 2%;
          bottom: 14%;
          transform: rotate(-6.99deg);
          font-size: clamp(16px, 1.8vw, 30px);
        }

        .nn-badge-3 {
          right: 5%;
          bottom: 22%;
          transform: rotate(6.52deg);
          font-size: clamp(16px, 1.8vw, 30px);
        }

        /* ── DOUBLE-LAYER ANGLED ROLE RIBBON ── */
        .nn-ribbon-wrapper {
          position: relative;
          width: 105%;
          margin-left: -2.5%;
          margin-top: 40px;
          margin-bottom: 40px;
          height: 90px;
          z-index: 20;
          overflow: hidden;
          user-select: none;
        }

        .nn-ribbon-bg-bottom {
          position: absolute;
          inset: 0;
          height: 100%;
          transform: matrix(1, -0.01, 0, 1, 0, 0);
        }

        .nn-ribbon-bg-top {
          position: absolute;
          inset: 8px 0;
          height: calc(100% - 16px);
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .nn-ribbon-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: nnScrollTicker 35s linear infinite;
        }

        @keyframes nnScrollTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .nn-ribbon-item {
          display: inline-flex;
          align-items: center;
          gap: 28px;
          padding-right: 28px;
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: 22px;
          line-height: 20px;
          text-transform: uppercase;
        }

        .nn-ribbon-dot {
          font-size: 18px;
        }

        /* ── SECTION 2: VỀ MÌNH (#FFFFFF) ── */
        .nn-about-section {
          background-color: var(--nn-white);
          padding: 80px 24px 120px;
          position: relative;
        }

        .nn-about-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Header Badge "VỀ MÌNH" (Rectangle 30) */
        .nn-about-badge-banner {
          background: var(--nn-lime);
          border: 9px dashed var(--nn-black);
          border-radius: 100px;
          padding: 24px 72px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
          margin-bottom: 80px;
          text-align: center;
          transform: rotate(-0.5deg);
        }

        .nn-about-badge-text {
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          font-size: clamp(52px, 7.5vw, 120px);
          line-height: 1.1;
          color: var(--nn-blue);
          text-shadow: 4px 6px 0px var(--nn-black);
          letter-spacing: 2px;
          margin: 0;
        }

        /* 2-Column Grid */
        .nn-about-grid {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 60px;
          align-items: center;
          width: 100%;
        }

        /* Speech bubbles stack */
        .nn-speech-bubbles {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: flex-start;
        }

        .nn-bubble {
          background: var(--nn-blue);
          border: 5px dashed var(--nn-lime);
          border-radius: 70px;
          box-shadow: 6px 8px 12px rgba(0, 0, 0, 0.16);
          padding: 20px 44px;
          color: var(--nn-lime);
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          transition: transform 0.25s ease;
        }

        .nn-bubble:hover {
          transform: scale(1.05) !important;
        }

        .nn-bubble-1 {
          font-size: clamp(32px, 4.5vw, 68px);
          transform: rotate(-6.99deg);
        }

        .nn-bubble-2 {
          font-size: clamp(24px, 2.5vw, 36px);
          transform: rotate(18.5deg);
          align-self: center;
        }

        .nn-bubble-3 {
          font-size: clamp(22px, 2.2vw, 32px);
          transform: rotate(-12.2deg);
        }

        /* About Copy */
        .nn-about-copy {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .nn-about-headline {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(26px, 2.8vw, 40px);
          line-height: 1.4;
          color: var(--nn-blue);
          margin: 0;
        }

        .nn-about-body {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: clamp(16px, 1.4vw, 22px);
          line-height: 1.6;
          color: var(--nn-black);
          margin: 0;
        }

        .nn-about-cta-label {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 500;
          font-size: clamp(18px, 1.8vw, 28px);
          color: var(--nn-black);
          margin-top: 10px;
        }

        .nn-about-btn {
          align-self: flex-start;
          background: var(--nn-lime);
          border: 3px dashed var(--nn-black);
          box-shadow: 4px 6px 8px rgba(37, 12, 241, 0.2);
          border-radius: 25px;
          padding: 14px 42px;
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          font-size: clamp(20px, 2vw, 30px);
          color: var(--nn-black);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nn-about-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 6px 10px 14px rgba(37, 12, 241, 0.35);
        }

        /* ── SECTION 3: KINH NGHIỆM HOẠT ĐỘNG (GRADIENT #250CF1 -> #07041F) ── */
        .nn-exp-section {
          background: linear-gradient(180deg, var(--nn-blue) 0%, var(--nn-midnight) 100%);
          padding: 100px 24px 120px;
          position: relative;
          color: var(--nn-white);
        }

        .nn-exp-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .nn-section-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 60px;
        }

        .nn-exp-title {
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          font-size: clamp(32px, 3.8vw, 48px);
          line-height: 1.2;
          color: var(--nn-lime);
          margin: 0;
          letter-spacing: 1px;
        }

        /* 3-Column Milestone Matrix */
        .nn-milestone-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 36px;
        }

        .nn-milestone-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(203, 247, 72, 0.3);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(10px);
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nn-milestone-card:hover {
          transform: translateY(-4px);
          border-color: var(--nn-lime);
          background: rgba(203, 247, 72, 0.1);
          box-shadow: 0 10px 24px rgba(203, 247, 72, 0.2);
        }

        .nn-milestone-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: var(--nn-lime);
          margin: 0;
        }

        .nn-milestone-role {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: var(--nn-white);
          margin: 0;
        }

        .nn-milestone-time {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--nn-cyan);
          margin: 0;
        }

        .nn-milestone-desc {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }

        /* ── SECTION 4: KỸ NĂNG CHUYÊN MÔN ── */
        .nn-skills-section {
          padding-top: 60px;
          padding-bottom: 40px;
        }

        .nn-skills-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 60px;
          text-align: center;
        }

        .nn-skills-title {
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          font-size: clamp(32px, 3.8vw, 48px);
          color: var(--nn-white);
          margin: 0;
          letter-spacing: 1px;
        }

        .nn-skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .nn-skill-box {
          border-radius: 24px;
          padding: 36px 28px;
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1.5px solid var(--nn-white);
        }

        .nn-skill-box:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
        }

        .nn-skill-icon-wrap {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }

        .nn-skill-cat-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 26px;
          line-height: 1.2;
          margin: 0;
        }

        .nn-skill-desc {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        /* ── SECTION 5: ALTERNATING PROJECTS (BLUE & WHITE) ── */
        .nn-project-block {
          padding: 90px 24px;
          position: relative;
          overflow: hidden;
        }

        .nn-project-blue {
          background-color: var(--nn-blue);
          color: var(--nn-white);
        }

        .nn-project-white {
          background-color: var(--nn-white);
          color: var(--nn-blue);
        }

        .nn-project-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .nn-project-top-row {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 50px;
          align-items: center;
        }

        .nn-project-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .nn-project-number {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: clamp(52px, 6.8vw, 100px);
          line-height: 1;
          margin: 0;
          letter-spacing: -2px;
        }

        .nn-project-name {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 26px;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .nn-project-desc {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 400;
          font-size: clamp(16px, 1.3vw, 20px);
          line-height: 1.6;
          margin: 0;
          opacity: 0.95;
        }

        .nn-project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
        }

        .nn-project-tag {
          padding: 6px 16px;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
        }

        .nn-project-blue .nn-project-tag {
          background: rgba(255, 255, 255, 0.15);
          color: var(--nn-lime);
          border: 1px solid var(--nn-lime);
        }

        .nn-project-white .nn-project-tag {
          background: rgba(37, 12, 241, 0.08);
          color: var(--nn-blue);
          border: 1px solid var(--nn-blue);
        }

        /* Mockup Display Frame (Rectangle 14 & 12) */
        .nn-project-mockup-frame {
          position: relative;
          border-radius: 46px;
          padding: 24px;
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }

        .nn-project-blue .nn-project-mockup-frame {
          background: rgba(217, 217, 217, 0.08);
          border: 2px solid var(--nn-white);
        }

        .nn-project-white .nn-project-mockup-frame {
          background: rgba(217, 217, 217, 0.08);
          border: 2px solid var(--nn-blue);
        }

        .nn-project-mockup-frame:hover {
          transform: scale(1.02);
        }

        .nn-project-img {
          width: 100%;
          height: min(340px, 45vw);
          object-fit: cover;
          border-radius: 36px;
        }

        .nn-project-blue .nn-project-img {
          border: 2px solid var(--nn-white);
        }

        .nn-project-white .nn-project-img {
          border: 2px solid var(--nn-blue);
        }

        /* ── AUTHENTIC PROJECT MOCKUP SCREEN (NO FAKE / STOCK IMAGERY) ── */
        .nn-project-mockup-screen {
          width: 100%;
          height: 100%;
          min-height: 290px;
          border-radius: 36px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .nn-project-mockup-screen.light {
          background: linear-gradient(135deg, #15089c 0%, #250CF1 55%, #3e26f8 100%);
          border: 2px solid rgba(255, 255, 255, 0.4);
          color: #FFFFFF;
          box-shadow: 0 16px 36px rgba(37, 12, 241, 0.35);
        }

        .nn-project-mockup-screen.dark {
          background: linear-gradient(135deg, #07041F 0%, #15089c 60%, #250CF1 100%);
          border: 2px solid var(--nn-lime);
          color: #FFFFFF;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
        }

        .nn-mockup-browser-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .nn-mockup-dots {
          display: flex;
          gap: 6px;
        }

        .nn-mockup-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .nn-mockup-dot.red { background: #FF5F56; }
        .nn-mockup-dot.yellow { background: #FFBD2E; }
        .nn-mockup-dot.green { background: #27C93F; }

        .nn-mockup-url {
          font-family: 'DM Sans', monospace, sans-serif;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 10px;
          border-radius: 20px;
        }

        .nn-mockup-screen-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          gap: 10px;
        }

        .nn-mockup-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(203, 247, 72, 0.18);
          border: 1px solid var(--nn-lime);
          color: var(--nn-lime);
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .nn-mockup-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: clamp(20px, 2.2vw, 28px);
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          max-width: 90%;
        }

        .nn-mockup-org {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .nn-mockup-chip-row {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .nn-mockup-chip {
          padding: 4px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
        }

        .nn-mockup-chip.verified {
          background: rgba(99, 255, 56, 0.2);
          border-color: rgba(99, 255, 56, 0.6);
          color: var(--nn-green);
        }

        .nn-empty-box {
          background: rgba(255, 255, 255, 0.06);
          border: 2px dashed rgba(255, 255, 255, 0.25);
          border-radius: 24px;
          padding: 48px 24px;
          text-align: center;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          margin: 24px auto;
          max-width: 700px;
        }

        /* 3 Glass Stat Cards (Frame 55) */
        .nn-stat-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 10px;
        }

        .nn-stat-card {
          border-radius: 24px;
          padding: 26px 22px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          backdrop-filter: blur(12px);
          transition: all 0.2s ease;
        }

        .nn-stat-card:hover {
          transform: translateY(-4px);
        }

        .nn-project-blue .nn-stat-card {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid var(--nn-white);
        }

        .nn-project-white .nn-stat-card {
          background: rgba(255, 255, 255, 0.2);
          border: 1.5px solid var(--nn-blue);
        }

        .nn-stat-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: 22px;
          line-height: 1.3;
          margin: 0;
          color: var(--nn-black);
        }

        .nn-stat-value {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
          line-height: 1.4;
          margin: 0;
          color: var(--nn-black);
          opacity: 0.9;
        }

        /* ── SECTION 6: FOOTER (RECTANGLE 42: GRADIENT #250CF1 -> #07041F) ── */
        /* Crossing Ribbons at the transition into the footer (Figma Role ribbons at top: 15841px & 15958px) */
        .nn-footer-crossing-ribbons {
          position: relative;
          width: 100%;
          margin-top: 40px;
          margin-bottom: 20px;
          z-index: 10;
        }

        .nn-footer-crossing-ribbons .nn-ribbon-wrapper:nth-child(2) {
          margin-top: -55px;
        }

        .nn-footer-section {
          background: linear-gradient(180deg, #250CF1 0%, #07041F 100%);
          padding: 80px 24px 90px;
          position: relative;
          overflow: hidden;
          color: #FFFFFF;
          text-align: center;
        }

        /* Ambient Teal Aura (Ellipse 40 in Figma: 1278px x 1278px, rotate -27.56deg) */
        .nn-footer-aura {
          position: absolute;
          width: min(1200px, 92vw);
          height: min(1200px, 92vw);
          left: 50%;
          top: 38%;
          transform: translate(-50%, -38%) rotate(-27.56deg);
          background: linear-gradient(207.56deg, rgba(106, 204, 195, 0.35) 15.01%, rgba(53, 102, 98, 0.35) 64.2%);
          filter: blur(14px);
          pointer-events: none;
          border-radius: 50%;
          z-index: 1;
        }

        /* Organic Neon Lime Bubble on Left (Ellipse 36 & 38 in Figma) */
        .nn-footer-bubble-left {
          position: absolute;
          left: -40px;
          top: 140px;
          width: 320px;
          height: 320px;
          pointer-events: none;
          z-index: 2;
        }

        .nn-bubble-orb-left-main {
          position: absolute;
          width: 246px;
          height: 245px;
          left: 50px;
          top: 0;
          background: #BFFF00;
          border-radius: 50%;
          filter: drop-shadow(0 0 24px rgba(191, 255, 0, 0.45));
        }

        .nn-bubble-orb-left-sub {
          position: absolute;
          width: 116px;
          height: 116px;
          left: 215px;
          top: 120px;
          background: #BFFF00;
          border-radius: 50%;
          transform: rotate(30deg);
          filter: drop-shadow(0 0 16px rgba(191, 255, 0, 0.4));
        }

        /* Top-Right Neon Lime Sparkle Stars (Star 41 & 42 in Figma) */
        .nn-footer-stars-right {
          position: absolute;
          right: 40px;
          top: 110px;
          width: 280px;
          height: 220px;
          pointer-events: none;
          z-index: 2;
        }

        /* Organic Neon Lime Bubble on Bottom-Right (Ellipse 37 & 39 in Figma) */
        .nn-footer-bubble-right {
          position: absolute;
          right: -30px;
          bottom: 120px;
          width: 320px;
          height: 320px;
          pointer-events: none;
          z-index: 2;
        }

        .nn-bubble-orb-right-main {
          position: absolute;
          width: 234px;
          height: 233px;
          right: 50px;
          bottom: 0;
          background: #BFFF00;
          border-radius: 50%;
          filter: drop-shadow(0 0 24px rgba(191, 255, 0, 0.45));
        }

        .nn-bubble-orb-right-sub {
          position: absolute;
          width: 110px;
          height: 110px;
          right: 210px;
          bottom: 100px;
          background: #BFFF00;
          border-radius: 50%;
          transform: rotate(-35deg);
          filter: drop-shadow(0 0 16px rgba(191, 255, 0, 0.4));
        }

        .nn-footer-inner {
          position: relative;
          z-index: 5;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
        }

        /* Footer Slackey Stack (Group 58 in Figma: THANKS / FOR / WATCHING!) */
        .nn-footer-slackey {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          margin-top: 10px;
        }

        .nn-footer-slackey-line {
          font-family: 'Slackey', cursive, sans-serif;
          font-weight: 400;
          color: #FFFFFF;
          text-transform: uppercase;
          line-height: 0.92;
          letter-spacing: -2px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        }

        .nn-footer-thanks {
          font-size: clamp(64px, 10vw, 165px);
        }

        .nn-footer-for {
          font-size: clamp(56px, 9vw, 155px);
        }

        .nn-footer-watching {
          font-size: clamp(56px, 9vw, 155px);
        }

        /* Contact Section (Figma LIÊN HỆ & Centered Noto Sans Contact Rows) */
        .nn-contact-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 820px;
          margin-top: 10px;
        }

        .nn-contact-heading {
          font-family: 'Poppins', sans-serif;
          font-style: normal;
          font-weight: 600;
          font-size: clamp(38px, 4.8vw, 64px);
          line-height: 1.2;
          text-align: center;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .nn-contact-lines {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-family: 'Noto Sans', sans-serif;
          font-style: normal;
          font-weight: 600;
          font-size: clamp(16px, 1.8vw, 24px);
          line-height: 1.45;
          text-align: center;
          color: #FFFFFF;
        }

        .nn-contact-line {
          color: #FFFFFF;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          transition: all 0.2s ease;
          padding: 4px 14px;
          border-radius: 10px;
        }

        .nn-contact-link:hover {
          color: #CBF748;
          background: rgba(203, 247, 72, 0.12);
          transform: translateY(-2px);
        }

        .nn-contact-label {
          color: #CBF748;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .nn-contact-value {
          color: #FFFFFF;
          font-weight: 500;
        }

        .nn-social-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          margin-top: 14px;
        }

        .nn-social-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #CBF748;
          color: #250CF1;
          border: 2px solid #CBF748;
          border-radius: 999px;
          padding: 10px 24px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(203, 247, 72, 0.35);
        }

        .nn-social-pill:hover {
          background: #FFFFFF;
          border-color: #FFFFFF;
          color: #250CF1;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
        }

        .nn-footer-cv-action {
          margin-top: 8px;
        }

        .nn-footer-cv-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          color: #CBF748;
          border: 2px dashed #CBF748;
          border-radius: 999px;
          padding: 10px 26px;
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nn-footer-cv-btn:hover {
          background: #CBF748;
          color: #000000;
          border-style: solid;
          transform: translateY(-2px);
        }

        .nn-footer-copyright {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-top: 24px;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── RESPONSIVE ADAPTATIONS ── */
        @media (max-width: 1024px) {
          .nn-about-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .nn-speech-bubbles {
            align-items: center;
          }
          .nn-milestone-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .nn-skills-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .nn-project-top-row {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .nn-milestone-grid {
            grid-template-columns: 1fr;
          }
          .nn-skills-grid {
            grid-template-columns: 1fr;
          }
          .nn-stat-cards-row {
            grid-template-columns: 1fr;
          }
          .nn-contact-card {
            padding: 32px 20px;
          }
          .nn-about-badge-banner {
            padding: 16px 36px;
          }
          .nn-header-nav {
            top: 12px;
          }
          .nn-hire-btn {
            padding: 8px 16px;
            font-size: 13px;
          }
          .nn-footer-bubble-left,
          .nn-footer-bubble-right,
          .nn-footer-stars-right {
            opacity: 0.3;
            transform: scale(0.6);
          }
        }
      `}</style>

      {/* ── HEADER NAVBAR ── */}
      <header className="nn-header-nav">
        <nav className="nn-nav-pill-wrap" aria-label="Portfolio sections">
          <button
            type="button"
            className={`nn-nav-btn ${activeSection === 'nn-hero' ? 'active' : ''}`}
            onClick={() => scrollTo('nn-hero')}
          >
            Trang chủ
          </button>
          <button
            type="button"
            className={`nn-nav-btn ${activeSection === 'nn-about' ? 'active' : ''}`}
            onClick={() => scrollTo('nn-about')}
          >
            Portfolio
          </button>
          <button
            type="button"
            className={`nn-nav-btn ${activeSection === 'nn-exp' ? 'active' : ''}`}
            onClick={() => scrollTo('nn-exp')}
          >
            Dịch vụ
          </button>
          <button
            type="button"
            className={`nn-nav-btn ${activeSection === 'nn-skills' ? 'active' : ''}`}
            onClick={() => scrollTo('nn-skills')}
          >
            Về chúng tôi
          </button>
          <button
            type="button"
            className={`nn-nav-btn ${activeSection === 'nn-footer' ? 'active' : ''}`}
            onClick={() => scrollTo('nn-footer')}
          >
            Liên hệ
          </button>
        </nav>

        <button
          type="button"
          className="nn-hire-btn"
          onClick={() => scrollTo('nn-footer')}
        >
          Tuyển tôi
        </button>
      </header>

      {/* ── SECTION 1: HERO (RECTANGLE 18: #250CF1) ── */}
      <section id="nn-hero" className="nn-hero-section">
        {/* Ambient neon orbs */}
        <div className="nn-hero-orb nn-hero-orb-1" />
        <div className="nn-hero-orb nn-hero-orb-2" />
        <div className="nn-hero-orb nn-hero-orb-3" />
        <div className="nn-hero-orb nn-hero-orb-4" />

        {/* Massive Typography Stack in 'Slackey' */}
        <div className="nn-slackey-stack">
          <div className="nn-slackey-line nn-slackey-portfolio">PORTFOLIO</div>
          <div className="nn-slackey-line nn-slackey-name">{name.toUpperCase()}</div>
          <div className="nn-slackey-line nn-slackey-year">{birthYear || school || 'FONLIO'}</div>
        </div>

        {/* Hero Image & Floating Cyber Badges */}
        <div className="nn-hero-stage">
          {/* Badge 1: Top-Right (Rectangle 21 in Figma) */}
          <div
            className="nn-cyber-badge nn-badge-1"
            onClick={() => scrollTo('nn-skills')}
            title="Kỹ năng chuyên môn"
          >
            {skills[0] || 'KỸ NĂNG'}
          </div>

          {/* Portrait Photo */}
          <div className="nn-hero-portrait-frame">
            {portraitSrc ? (
              <img
                src={portraitSrc}
                alt={name}
                className="nn-hero-portrait-img"
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <PortfolioMascot avatar={profile.avatar} size={260} />
              </div>
            )}
          </div>

          {/* Badge 2: Bottom-Left (Rectangle 22 in Figma) */}
          <div
            className="nn-cyber-badge nn-badge-2"
            onClick={() => scrollTo('nn-about')}
            title="Về mình"
          >
            VỀ MÌNH
          </div>

          {/* Badge 3: Mid-Right (Rectangle 23 in Figma) */}
          <div
            className="nn-cyber-badge nn-badge-3"
            onClick={() => scrollTo('nn-exp')}
            title="Kinh nghiệm thực chiến"
          >
            KINH NGHIỆM
          </div>
        </div>
      </section>

      {/* ── DOUBLE-LAYER ANGLED ROLE RIBBON #1 ── */}
      <NhoNeonRibbon
        bgBottom="#63FF38"
        bgTop="#CBF748"
        textColor="#000000"
        rotate="-1.37deg"
        skills={skills}
      />

      {/* ── SECTION 2: VỀ MÌNH (RECTANGLE 19: #FFFFFF) ── */}
      <section id="nn-about" className="nn-about-section">
        <div className="nn-about-inner">
          {/* Giant Header Badge (Rectangle 30 in Figma) */}
          <div className="nn-about-badge-banner">
            <h2 className="nn-about-badge-text">VỀ MÌNH</h2>
          </div>

          {/* 2-Column Content Layout */}
          <div className="nn-about-grid">
            {/* Left Column: Cyber Speech Bubbles (Deep Blue #250CF1 with Neon Lime Dashed Border) */}
            <div className="nn-speech-bubbles">
              <div className="nn-bubble nn-bubble-1">
                Mình là....
              </div>
              <div className="nn-bubble nn-bubble-2">
                {profile.nickname || roleTitle || name}
              </div>
              <div className="nn-bubble nn-bubble-3">
                {birthYear || school || location || 'VIỆT NAM'}
              </div>
            </div>

            {/* Right Column: Bio Copy & CTA */}
            <div className="nn-about-copy">
              <h3 className="nn-about-headline">
                {name}{roleTitle ? ` — ${roleTitle}` : ''}{location ? ` tại ${location}` : ''}
              </h3>
              <p className="nn-about-body">
                {bio || 'Ứng viên năng động luôn sẵn sàng cống hiến và phát triển kỹ năng thực chiến trong các dự án.'}
              </p>
              <div className="nn-about-cta-label">
                Bấm tại đây để xem các dự án của mình!
              </div>
              <button
                type="button"
                className="nn-about-btn"
                onClick={() => scrollTo('nn-projects-start')}
              >
                XEM DỰ ÁN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: KINH NGHIỆM HOẠT ĐỘNG (RECTANGLE 20: GRADIENT BLUE -> MIDNIGHT) ── */}
      <section id="nn-exp" className="nn-exp-section">
        <div className="nn-exp-inner">
          {/* Section Header with Neon Star (Star 29 in Figma) */}
          <div className="nn-section-header">
            <NeonStar size={54} color="#CBF748" rotate={12} />
            <h2 className="nn-exp-title">KINH NGHIỆM HOẠT ĐỘNG</h2>
          </div>

          {/* 3-Column Milestone Matrix (Matching Figma 10-129 exactly) */}
          {experiences.length > 0 ? (
            <div className="nn-milestone-grid">
              {experiences.map((exp, idx) => {
                const timeStr = `${exp.startDate || ''}${
                  exp.endDate ? ' - ' + exp.endDate : exp.startDate ? ' - Hiện tại' : ''
                }`;
                return (
                  <div key={exp.id || idx} className="nn-milestone-card">
                    <h4 className="nn-milestone-title">{exp.title || `Kinh nghiệm ${idx + 1}`}</h4>
                    <p className="nn-milestone-role">
                      {exp.role || exp.organization || 'Thành viên thực hiện'}
                      {exp.verified && ' ✦ Đã xác thực'}
                    </p>
                    {timeStr && <p className="nn-milestone-time">{timeStr}</p>}
                    <p className="nn-milestone-desc">
                      {exp.description || exp.detail || (exp.organization ? `Hoạt động tại ${exp.organization}` : 'Kinh nghiệm thực chiến của ứng viên.')}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="nn-empty-box">
              Chưa có kinh nghiệm hoạt động nào được thêm. Bạn có thể cập nhật tại bảng soạn hồ sơ.
            </div>
          )}

          {/* ── SECTION 4: KỸ NĂNG CHUYÊN MÔN ── */}
          <div id="nn-skills" className="nn-skills-section">
            <div className="nn-skills-header">
              <NeonStar size={42} color="#CBF748" rotate={37} />
              <h2 className="nn-skills-title">KỸ NĂNG CHUYÊN MÔN</h2>
              <NeonStar size={42} color="#CBF748" rotate={-45} />
            </div>

            {/* 2 Rows of 3 Cards or Dynamic Cards from Candidate Skills */}
            {skills.length > 0 ? (
              <div className="nn-skills-grid">
                {skills.map((skillName, idx) => {
                  const isLime = idx % 2 === 1;
                  const bg = isLime ? '#CBF748' : '#FFFFFF';
                  const textColor = isLime ? '#000000' : '#250CF1';
                  const iconBg = isLime ? '#000000' : '#250CF1';
                  const iconColor = '#CBF748';

                  return (
                    <div
                      key={idx}
                      className="nn-skill-box"
                      style={{
                        backgroundColor: bg,
                        color: textColor,
                      }}
                    >
                      <div
                        className="nn-skill-icon-wrap"
                        style={{ backgroundColor: iconBg }}
                      >
                        <Sparkles size={28} color={iconColor} />
                      </div>
                      <h4 className="nn-skill-cat-title" style={{ color: textColor }}>
                        {skillName}
                      </h4>
                      <p className="nn-skill-desc" style={{ color: textColor }}>
                        Kỹ năng chuyên môn thực chiến được ứng dụng trong các dự án và nhiệm vụ của ứng viên tại fonlio.
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="nn-empty-box">
                Chưa có kỹ năng nào được cập nhật. Bạn có thể thêm kỹ năng tại bảng soạn hồ sơ.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DOUBLE-LAYER ANGLED ROLE RIBBON #2 (CROSSING DIVIDER) ── */}
      <NhoNeonRibbon
        bgBottom="#00FFE8"
        bgTop="#250CF1"
        textColor="#CBF748"
        rotate="0.78deg"
        skills={skills}
      />

      {/* ── SECTION 5: ALTERNATING PORTFOLIO PROJECTS ── */}
      <div id="nn-projects-start">
        {experiences.length > 0 ? (
          experiences.map((exp, idx) => {
            const isOdd = idx % 2 === 0; // 0, 2, 4 -> Dự án 1, 3, 5 (Blue background)
            const themeClass = isOdd ? 'nn-project-blue' : 'nn-project-white';
            const shot = getProjectImageUrl(exp);
            const timeStr = `${exp.startDate || ''}${
              exp.endDate ? ' - ' + exp.endDate : exp.startDate ? ' - Hiện tại' : 'Đang cập nhật'
            }`;

            return (
              <React.Fragment key={exp.id || idx}>
                <section className={`nn-project-block ${themeClass}`}>
                  <div className="nn-project-inner">
                    {/* Top Row: Number, Description, and Mockup Frame */}
                    <div className="nn-project-top-row">
                      <div className="nn-project-info">
                        <h2 className="nn-project-number">Dự án {idx + 1}</h2>
                        <h3 className="nn-project-name">{exp.title || `Dự án ${idx + 1}`}</h3>
                        <p className="nn-project-desc">
                          {exp.description ||
                            exp.detail ||
                            'Dự án định hình kinh nghiệm thực chiến do ứng viên trực tiếp đảm nhận và hoàn thành.'}
                        </p>
                        <div className="nn-project-tags">
                          <span className="nn-project-tag">
                            #{exp.role || exp.organization || 'Dự án thực tế'}
                          </span>
                          {exp.category && (
                            <span className="nn-project-tag">#{exp.category}</span>
                          )}
                          {exp.verified && (
                            <span className="nn-project-tag" style={{ color: '#CBF748' }}>
                              #ĐãXácThực
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mockup Frame (Rectangle 14 & 12 in Figma) */}
                      <div
                        className="nn-project-mockup-frame"
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
                          <img
                            src={shot}
                            alt={exp.title || `Dự án ${idx + 1}`}
                            className="nn-project-img"
                          />
                        ) : (
                          <NhoNeonProjectMockup exp={exp} index={idx} isDark={!isOdd} />
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: 3 Glass Stat Cards (Frame 55 in Figma) */}
                    <div className="nn-stat-cards-row">
                      <div className="nn-stat-card">
                        <h4 className="nn-stat-title">Vị trí trong dự án</h4>
                        <p className="nn-stat-value">{exp.role || 'Thành viên đóng góp'}</p>
                      </div>
                      <div className="nn-stat-card">
                        <h4 className="nn-stat-title">Thời gian thực hiện</h4>
                        <p className="nn-stat-value">{timeStr}</p>
                      </div>
                      <div className="nn-stat-card">
                        <h4 className="nn-stat-title">Đơn vị / Xác thực</h4>
                        <p className="nn-stat-value">
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
                  </div>
                </section>

                {/* Angled Ribbon Separator between projects (matching Figma SIDE BAR) */}
                {idx < experiences.length - 1 && (
                  <NhoNeonRibbon
                    bgBottom={isOdd ? '#63FF38' : '#00FFE8'}
                    bgTop={isOdd ? '#CBF748' : '#250CF1'}
                    textColor={isOdd ? '#000000' : '#CBF748'}
                    rotate={isOdd ? '-1.37deg' : '0.78deg'}
                    skills={skills}
                  />
                )}
              </React.Fragment>
            );
          })
        ) : (
          <div className="nn-empty-box" style={{ margin: '60px auto' }}>
            Chưa có dự án nào được thêm. Bạn có thể thêm dự án tại bảng soạn hồ sơ.
          </div>
        )}
      </div>

      {/* Crossing Ribbons at entrance of Footer (Figma 10-129 top: 15841px & 15958px) */}
      <div className="nn-footer-crossing-ribbons" aria-hidden="true">
        <NhoNeonRibbon
          bgBottom="#00FFE8"
          bgTop="#250CF1"
          textColor="#CBF748"
          rotate="0.78deg"
          skills={skills}
        />
        <NhoNeonRibbon
          bgBottom="#00FFE8"
          bgTop="#250CF1"
          textColor="#CBF748"
          rotate="-1.37deg"
          skills={skills}
        />
      </div>

      {/* ── SECTION 6: FOOTER (RECTANGLE 42: GRADIENT BLUE -> MIDNIGHT) ── */}
      <footer id="nn-footer" className="nn-footer-section">
        {/* Ambient Teal Aura (Ellipse 40 in Figma) */}
        <div className="nn-footer-aura" aria-hidden="true" />

        {/* Organic Neon Lime Bubble on Left (Ellipse 36 & 38 in Figma) */}
        <div className="nn-footer-bubble-left" aria-hidden="true">
          <div className="nn-bubble-orb-left-main" />
          <div className="nn-bubble-orb-left-sub" />
        </div>

        {/* Top-Right Neon Lime Sparkle Stars (Star 41 & 42 in Figma) */}
        <div className="nn-footer-stars-right" aria-hidden="true">
          <NeonStar
            size={145}
            color="#CBF748"
            rotate={118.57}
            style={{ position: 'absolute', right: '40px', top: '20px' }}
          />
          <NeonStar
            size={82}
            color="#CBF748"
            rotate={118.57}
            style={{ position: 'absolute', right: '165px', top: '55px' }}
          />
        </div>

        {/* Organic Neon Lime Bubble on Bottom-Right (Ellipse 37 & 39 in Figma) */}
        <div className="nn-footer-bubble-right" aria-hidden="true">
          <div className="nn-bubble-orb-right-main" />
          <div className="nn-bubble-orb-right-sub" />
        </div>

        <div className="nn-footer-inner">
          {/* Giant Slackey Stack in Footer (Group 58 in Figma: THANKS / FOR / WATCHING!) */}
          <div className="nn-footer-slackey">
            <div className="nn-footer-slackey-line nn-footer-thanks">THANKS</div>
            <div className="nn-footer-slackey-line nn-footer-for">FOR</div>
            <div className="nn-footer-slackey-line nn-footer-watching">WATCHING!</div>
          </div>

          {/* Contact Section: LIÊN HỆ with Clean Centered Noto Sans Contact Info */}
          <div className="nn-contact-section">
            <h3 className="nn-contact-heading">LIÊN HỆ</h3>

            <div className="nn-contact-lines">
              <div className="nn-contact-line">
                <span className="nn-contact-label">HỌ VÀ TÊN:</span>{' '}
                <span className="nn-contact-value">{name}</span>
              </div>

              {phone && (
                <a href={`tel:${phone}`} className="nn-contact-line nn-contact-link">
                  <span className="nn-contact-label">SỐ ĐIỆN THOẠI:</span>{' '}
                  <span className="nn-contact-value">{phone}</span>
                </a>
              )}

              {email && (
                <a href={`mailto:${email}`} className="nn-contact-line nn-contact-link">
                  <span className="nn-contact-label">EMAIL/GMAIL:</span>{' '}
                  <span className="nn-contact-value">{email}</span>
                </a>
              )}

              {website && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nn-contact-line nn-contact-link"
                >
                  <span className="nn-contact-label">WEBSITE:</span>{' '}
                  <span className="nn-contact-value">{website}</span>
                </a>
              )}
            </div>

            {/* Social Buttons */}
            {socialLinks.length > 0 && (
              <div className="nn-social-pills">
                {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nn-social-pill"
                  >
                    <ExternalLink size={16} />
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            )}
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

export default NhoNeonFigmaTemplate;
