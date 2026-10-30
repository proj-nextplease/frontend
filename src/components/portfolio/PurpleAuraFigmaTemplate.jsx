import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
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
 * Double-layer Angled Role Ribbon (Role / Frame 45 in Figma 10-132)
 * Stream of cursive roles in 'Licorice' 44px
 */
function AngledRoleRibbon({
  bgBottom = '#A780EB',
  bgTop = '#F0E1FF',
  rotate = '-0.01deg',
  skills = [],
}) {
  const roleList = useMemo(() => {
    if (skills && skills.length > 0) {
      return skills;
    }
    return [
      'thiết kế giao diện',
      'thiết kế đồ họa',
      'marketing',
      'phân tích tài chính',
      'thiết kế website',
      'nghiên cứu người dùng',
      'quản trị thương hiệu',
      'sáng tạo nội dung',
    ];
  }, [skills]);

  // Repeat for continuous infinite flow
  const loop = [...roleList, ...roleList, ...roleList, ...roleList];

  return (
    <div
      className="pa-ribbon-wrapper"
      style={{
        transform: `rotate(${rotate})`,
        filter: 'drop-shadow(13px 7px 6.3px rgba(0, 1, 81, 0.22))',
      }}
    >
      <div className="pa-ribbon-bg-bottom" style={{ background: bgBottom }} />
      <div className="pa-ribbon-bg-top" style={{ background: bgTop }}>
        <div className="pa-ribbon-track">
          {loop.map((item, idx) => (
            <span key={`${item}-${idx}`} className="pa-ribbon-item">
              <span className="pa-ribbon-text">{item.toLowerCase()}</span>
              <span className="pa-ribbon-dot">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Category code to Vietnamese readable label mapping
 */
const CATEGORY_LABELS = {
  CLUB_SMALL: 'Câu lạc bộ Khoa / Trường',
  CLUB_LEADER: 'Ban Chủ nhiệm CLB',
  BUSINESS_INTERN: 'Thực tập sinh doanh nghiệp',
  BUSINESS_OFFICIAL: 'Nhân viên chính thức',
  FREELANCE: 'Dự án tự do / Freelance',
  ACADEMIC_RESEARCH: 'Nghiên cứu khoa học',
  COMPETITION: 'Cuộc thi học thuật & ĐMST',
  VOLUNTEER: 'Hoạt động tình nguyện',
  COMMUNITY_PROJECT: 'Dự án cộng đồng',
};

/**
 * Tự động trích xuất ảnh thumbnail từ Google Drive link (ảnh, PDF, tài liệu)
 */
function getGoogleDriveThumbnail(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  }
  return null;
}

function isDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\.(png|jpe?g|webp|svg|gif)($|\?)/i.test(url) ||
         /(cloudinary\.com|imgur\.com|unsplash\.com|supabase\.co\/storage)/i.test(url);
}

function getProofLinkPlatform(url) {
  if (!url || typeof url !== 'string') return null;
  const lower = url.toLowerCase();
  if (lower.includes('drive.google.com')) return { label: 'Google Drive', icon: '📁' };
  if (lower.includes('github.com')) return { label: 'GitHub Repo', icon: '🐙' };
  if (lower.includes('figma.com')) return { label: 'Figma Design', icon: '🎨' };
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return { label: 'Sự kiện Fanpage', icon: '📢' };
  if (lower.includes('behance.net')) return { label: 'Behance', icon: '💎' };
  return { label: 'Tài liệu / Trang dự án', icon: '🌐' };
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
  if (exp.proofLink) {
    const driveThumb = getGoogleDriveThumbnail(exp.proofLink);
    if (driveThumb) return driveThumb;
    if (isDirectImageUrl(exp.proofLink)) return exp.proofLink;
  }
  return null;
}

/**
 * Thẻ chứng nhận & minh chứng dự án cao cấp (dành cho dự án có link hoặc tài liệu)
 */
function PurpleAuraProjectMockup({ exp = {}, index = 0, isDark = false }) {
  const title = exp.title || exp.projectName || exp.name || `Dự án ${index + 1}`;
  const org = exp.organization || exp.role || exp.position || 'fonlio Verified Experience';
  const categoryLabel = CATEGORY_LABELS[exp.category] || exp.category || 'Kinh nghiệm thực chiến';
  const platform = getProofLinkPlatform(exp.proofLink);
  const displayUrl = exp.proofLink
    ? exp.proofLink.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : `fonlio.me/project-${index + 1}`;

  return (
    <div className={`pa-project-mockup-screen${isDark ? ' dark' : ' light'}`}>
      <div className="pa-mockup-browser-bar">
        <div className="pa-mockup-dots">
          <span className="pa-mockup-dot red" />
          <span className="pa-mockup-dot yellow" />
          <span className="pa-mockup-dot green" />
        </div>
        <span className="pa-mockup-url" title={displayUrl}>{displayUrl}</span>
        {platform && (
          <span className="pa-mockup-platform-tag">
            {platform.icon} {platform.label}
          </span>
        )}
      </div>

      <div className="pa-mockup-screen-body">
        <div className="pa-mockup-cert-seal">
          <ShieldCheck size={28} className="pa-seal-icon" />
          <div className="pa-mockup-badge">
            <Sparkles size={12} />
            <span>DỰ ÁN THỰC CHIẾN #{index + 1}</span>
          </div>
        </div>

        <h4 className="pa-mockup-title">{title}</h4>
        <p className="pa-mockup-org">
          <CheckCircle2 size={14} style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '4px', color: '#10b981' }} />
          {org}
        </p>

        <div className="pa-mockup-chip-row">
          <span className="pa-mockup-chip">✦ {categoryLabel}</span>
          <span className="pa-mockup-chip rewards">+{exp.expReward || 500} EXP · +{exp.rsReward || 5} RS</span>
          {exp.verified && <span className="pa-mockup-chip verified">✦ Đã xác thực</span>}
        </div>

        {exp.proofLink ? (
          <div className="pa-mockup-action-wrap" onClick={(e) => e.stopPropagation()}>
            <a
              href={exp.proofLink}
              target="_blank"
              rel="noopener noreferrer"
              className="pa-mockup-btn"
              title="Mở tài liệu minh chứng trong tab mới"
            >
              <FileText size={14} />
              <span>Xem tài liệu minh chứng</span>
              <ExternalLink size={13} />
            </a>
          </div>
        ) : (
          <div className="pa-mockup-verified-note">
            <Sparkles size={12} />
            <span>Bảo chứng năng lực số Fonlio</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PurpleAuraProjectVisual({ exp, idx, isOdd, expTitle, shot }) {
  const [imgError, setImgError] = useState(false);

  if (shot && !imgError) {
    return (
      <img
        src={shot}
        alt={expTitle}
        className="pa-project-img"
        onError={() => setImgError(true)}
      />
    );
  }

  return <PurpleAuraProjectMockup exp={exp} index={idx} isDark={!isOdd} />;
}

export function PurpleAuraFigmaTemplate({ profile = {} }) {
  const [preview, setPreview] = useState(null);
  const [activeSection] = useState('hero');

  // Candidate Data (Bám sát 100% dữ liệu thật của ứng viên)
  const name = profile.name?.trim() || 'Ứng viên fonlio';
  const roleTitle = profile.headline?.trim() || profile.title?.trim() || '';
  const major = profile.major?.trim() || '';
  const school = profile.school?.trim() || '';
  const location = profile.location?.trim() || '';
  const bio = profile.bio?.trim() || '';
  const birthYear = profile.birthYear || '';
  const email = profile.socialLinks?.email || profile.email || '';
  const phone = profile.socialLinks?.phone || profile.phone || '';
  const website = profile.socialLinks?.website || profile.website || profile.portfolioUrl || '';

  const portraitSrc =
    profile.avatar?.portraitUrl ||
    profile.avatarUrl ||
    (typeof profile.avatar === 'string' && profile.avatar.startsWith('http') ? profile.avatar : null) ||
    profile.avatar?.url ||
    null;

  const avatar =
    profile.avatar && typeof profile.avatar === 'object' && Object.keys(profile.avatar).length > 0
      ? profile.avatar
      : { gender: 'female' };

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

  const skills = useMemo(() => {
    return (Array.isArray(profile.skills) ? profile.skills : []).filter(
      (s) => typeof s === 'string' && s.trim().length > 0
    );
  }, [profile.skills]);

  const experiences = useMemo(() => {
    return (Array.isArray(profile.experiences) ? profile.experiences : []).filter(
      (e) =>
        e &&
        (e.verified === true || e.verificationStatus === 'APPROVED') &&
        (e.title?.trim() ||
          e.projectName?.trim() ||
          e.name?.trim() ||
          e.role?.trim() ||
          e.position?.trim() ||
          e.organization?.trim() ||
          e.description?.trim() ||
          e.detail?.trim())
    );
  }, [profile.experiences]);

  const credentials = useMemo(() => {
    return (Array.isArray(profile.credentials) ? profile.credentials : []).filter(
      (c) => c && (c.name?.trim() || c.title?.trim())
    );
  }, [profile.credentials]);

  const contactHref = email
    ? (email.startsWith('mailto:') ? email : `mailto:${email}`)
    : (phone ? `tel:${phone}` : '#contact');

  return (
    <div className="pa-figma-page">
      <style>{`
        /* ── FIGMA NODE 10-132: "PORTFOLIO LANDING PAGE 3" CSS ── */
        .pa-figma-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #FFFFFF;
          color: #141414;
          font-family: 'DM Sans', system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* ── SECTION 1: TOP HERO (Rectangle 43: #D29FFF) ── */
        .pa-hero-band {
          position: relative;
          width: 100%;
          min-height: 1042px;
          background: #D29FFF;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 54px 24px 100px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Floating Header Navbar (Frame 33 & Hire Me in Figma) */
        .pa-navbar-row {
          width: min(1180px, 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          z-index: 10;
        }

        .pa-navbar-pill-box {
          display: flex;
          flex-direction: row;
          align-items: center;
          height: 44px;
          padding: 3px 6px;
          background: rgba(163, 249, 250, 0.2);
          border: 1px solid #141414;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 50px;
          box-sizing: border-box;
          gap: 4px;
        }

        .pa-nav-btn {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: clamp(13px, 1.2vw, 18px);
          line-height: 1;
          text-transform: uppercase;
          text-decoration: none;
          padding: 8px 18px;
          border-radius: 50px;
          color: #141414;
          transition: all 0.2s ease;
          white-space: nowrap;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .pa-nav-btn.active, .pa-nav-btn:hover {
          background: #141414;
          border: 0.5px solid #141414;
          box-shadow: 0px 1px 3.5px rgba(255, 255, 255, 0.25);
          color: #DFCCFF;
        }

        .pa-hire-btn {
          height: 44px;
          padding: 0 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #141414;
          border-radius: 50px;
          color: #DFCCFF;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: clamp(14px, 1.2vw, 18px);
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
          cursor: pointer;
        }

        .pa-hire-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }

        /* Hero Center Title: "PORTFOLIO" + Cursive Name overlay */
        .pa-hero-titles-wrap {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 180px auto 70px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pa-hero-bg-word {
          font-family: 'League Spartan', sans-serif;
          font-style: normal;
          font-weight: 800;
          font-size: clamp(80px, 14vw, 200px);
          line-height: 0.92;
          letter-spacing: -0.02em;
          text-align: center;
          color: #FFFFFF;
          margin: 0;
          user-select: none;
        }

        .pa-hero-cursive-name {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Licorice', cursive;
          font-style: normal;
          font-weight: 400;
          font-size: clamp(68px, 10vw, 140px);
          line-height: 1;
          text-align: center;
          color: #000000;
          margin: 0;
          pointer-events: none;
          transform: rotate(-2deg);
        }

        /* Hero Bottom CTA Capsule (Frame 23: #A26DFF) */
        .pa-hero-cta-capsule {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 44px;
          background: #A26DFF;
          border-radius: 50px;
          box-shadow: 0 6px 28px rgba(162, 109, 255, 0.55);
          text-decoration: none;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          margin-bottom: 24px;
        }

        .pa-hero-cta-capsule:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 36px rgba(162, 109, 255, 0.7);
        }

        .pa-hero-cta-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-style: normal;
          font-weight: 700;
          font-size: clamp(20px, 2.5vw, 36px);
          line-height: 1.2;
          color: #FFFFFF;
          text-align: center;
        }

        .pa-hero-sub-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-style: normal;
          font-weight: 700;
          font-size: clamp(20px, 2.2vw, 30px);
          line-height: 1.2;
          color: #3F016B;
          text-align: center;
          margin: 0;
        }

        /* ── ANGLED ROLE RIBBONS ── */
        .pa-ribbon-wrapper {
          position: relative;
          width: 104vw;
          margin-left: -2vw;
          margin-top: -24px;
          margin-bottom: -24px;
          z-index: 20;
          overflow: hidden;
        }

        .pa-ribbon-bg-bottom {
          position: absolute;
          inset: 0;
          height: 84px;
          transform: matrix(1, 0.01, -0.02, 1, 0, 0);
        }

        .pa-ribbon-bg-top {
          position: relative;
          width: 100%;
          height: 64px;
          display: flex;
          align-items: center;
          overflow: hidden;
          margin-top: 10px;
        }

        .pa-ribbon-track {
          display: flex;
          width: max-content;
          align-items: center;
          animation: paMarquee 45s linear infinite;
        }

        .pa-ribbon-wrapper:hover .pa-ribbon-track {
          animation-play-state: paused;
        }

        @keyframes paMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .pa-ribbon-item {
          display: inline-flex;
          align-items: center;
          gap: 24px;
          padding: 0 20px;
          white-space: nowrap;
        }

        .pa-ribbon-text {
          font-family: 'Licorice', cursive;
          font-style: normal;
          font-weight: 400;
          font-size: clamp(34px, 3.2vw, 48px);
          line-height: 1;
          color: #000000;
          text-transform: lowercase;
        }

        .pa-ribbon-dot {
          font-size: 16px;
          color: #7B3AEC;
        }

        /* ── SECTION 2: VỀ MÌNH (Rectangle 44: sunset pastel aura) ── */
        .pa-about-band {
          position: relative;
          width: 100%;
          min-height: 945px;
          background: linear-gradient(184.09deg, #E1B0E5 -23.92%, #FFE5D1 52.46%, #C47AF8 131.83%);
          padding: 120px 24px 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .pa-about-container {
          width: min(1200px, 100%);
          display: grid;
          grid-template-columns: 552px 1fr;
          gap: 60px;
          align-items: center;
        }

        /* Left: Photo Frame (552x552) */
        .pa-photo-frame-wrap {
          position: relative;
          width: 100%;
          max-width: 552px;
          aspect-ratio: 1 / 1;
        }

        .pa-photo-frame {
          position: absolute;
          inset: 0;
          background: #D29FFF;
          border-radius: 36px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(123, 58, 236, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pa-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pa-photo-mascot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        /* Overlaid Circular Rotor Badge */
        .pa-spin-badge-box {
          position: absolute;
          bottom: -24px;
          right: -24px;
          cursor: pointer;
          user-select: none;
          transition: transform 0.3s ease;
          z-index: 15;
        }

        .pa-spin-badge-box:hover {
          transform: scale(1.08) rotate(6deg);
        }

        .pa-spin-rotor {
          transform-origin: 82px 82px;
          animation: paRotate 18s linear infinite;
        }

        @keyframes paRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Right: About Content */
        .pa-about-copy-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 28px;
          text-align: right;
        }

        .pa-badge-ve-minh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 24px;
          background: rgba(210, 159, 255, 0.48);
          border: 4px solid #FFFFFF;
          border-radius: 50px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 600;
          font-size: clamp(20px, 2vw, 32px);
          line-height: 1;
          text-transform: uppercase;
          color: #7B3AEC;
        }

        .pa-about-headline {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 400;
          font-size: clamp(28px, 3.4vw, 55px);
          line-height: 1.2;
          color: #7B3AEC;
          margin: 0;
          text-align: right;
        }

        .pa-about-bio-text {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: clamp(16px, 1.6vw, 24px);
          line-height: 1.45;
          color: #7B3AEC;
          margin: 0;
          text-align: right;
          max-width: 520px;
        }

        .pa-about-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 34px;
          background: #7B3AEC;
          border-radius: 50px;
          filter: drop-shadow(0px 4px 4px rgba(123, 58, 236, 0.79));
          text-decoration: none;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: clamp(16px, 1.5vw, 24px);
          color: #FFFFFF;
          transition: transform 0.2s ease, filter 0.2s ease;
        }

        .pa-about-action-btn:hover {
          transform: translateY(-2px);
          filter: drop-shadow(0px 6px 12px rgba(123, 58, 236, 0.9));
        }

        /* ── SECTION 3: KINH NGHIỆM HOẠT ĐỘNG (Rectangle 45 & 46) ── */
        .pa-activities-band {
          position: relative;
          width: 100%;
          background: linear-gradient(182.88deg, #E1B0E5 -4.73%, #FFE5D1 53.69%, #C47AF8 114.4%);
          padding: 100px 24px 120px;
          box-sizing: border-box;
        }

        .pa-section-h2-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 400;
          font-size: clamp(40px, 5.2vw, 80px);
          line-height: 1.2;
          text-align: center;
          text-transform: capitalize;
          color: #7B3AEC;
          margin: 0 auto 60px;
        }

        /* 4-column matrix (Group 59 & 60) */
        .pa-matrix-grid {
          width: min(1200px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .pa-matrix-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pa-matrix-heading {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 400;
          font-size: clamp(28px, 2.8vw, 44px);
          line-height: 1.2;
          color: #5F0082;
          margin: 0;
        }

        .pa-matrix-meta {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 22px;
          color: #7B3AEC;
          margin: 0;
        }

        /* ── SECTION 4: KỸ NĂNG CHUYÊN MÔN (Frame 66) ── */
        .pa-skills-band {
          position: relative;
          width: 100%;
          background: #E0BDFF;
          padding: 100px 24px 120px;
          box-sizing: border-box;
        }

        .pa-skills-cards-row {
          width: min(1200px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .pa-skill-pill-card {
          border-radius: 85px;
          padding: 44px 32px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid #FFFFFF;
          box-shadow: 0 12px 32px rgba(123, 58, 236, 0.12);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .pa-skill-pill-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(123, 58, 236, 0.22);
        }

        .pa-skill-pill-card.white { background: #FFFFFF; }
        .pa-skill-pill-card.lavender { background: #D1B6FF; }

        .pa-skill-icon-wrap {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2D007C;
        }

        .pa-skill-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 500;
          font-size: 32px;
          line-height: 40px;
          color: #2D007C;
          margin: 0;
        }

        .pa-skill-body {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 22px;
          color: #2D007C;
          margin: 0;
        }

        /* ── SECTION 5: PORTFOLIO SHOWCASE (Giant cursive title & alternating rows) ── */
        .pa-portfolio-intro-band {
          position: relative;
          width: 100%;
          background: #FFD7FE;
          padding: 70px 24px 40px;
          text-align: center;
        }

        .pa-portfolio-giant-cursive {
          font-family: 'Licorice', cursive;
          font-style: normal;
          font-weight: 400;
          font-size: clamp(140px, 20vw, 300px);
          line-height: 0.9;
          text-transform: capitalize;
          color: #FF00D0;
          margin: 0;
          user-select: none;
        }

        /* Project Block Alternations */
        .pa-project-block {
          position: relative;
          width: 100%;
          padding: 100px 24px 120px;
          box-sizing: border-box;
        }

        .pa-project-block.odd { background: #E0BDFF; }
        .pa-project-block.even { background: #FFD7FE; }

        .pa-project-content-wrap {
          width: min(1200px, 100%);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .pa-project-top-row {
          display: grid;
          grid-template-columns: 1fr 580px;
          gap: 48px;
          align-items: center;
        }

        .pa-project-cursive-head {
          font-family: 'Licorice', cursive;
          font-style: normal;
          font-weight: 400;
          font-size: clamp(90px, 11vw, 180px);
          line-height: 0.95;
          margin: 0 0 16px;
        }

        .pa-project-block.odd .pa-project-cursive-head { color: #3F016B; }
        .pa-project-block.even .pa-project-cursive-head { color: #E000B7; }

        .pa-project-title-real {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: clamp(22px, 2.2vw, 30px);
          margin: 0 0 14px;
        }

        .pa-project-block.odd .pa-project-title-real { color: #3F016B; }
        .pa-project-block.even .pa-project-title-real { color: #E6008A; }

        .pa-project-desc {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 400;
          font-size: clamp(16px, 1.4vw, 20px);
          line-height: 27px;
          margin: 0;
        }

        .pa-project-block.odd .pa-project-desc { color: #3F016B; }
        .pa-project-block.even .pa-project-desc { color: #E6008A; }

        /* Mockup Frame (580x443, radius 50px, border 2px solid white) */
        .pa-mockup-frame {
          width: 100%;
          max-width: 580px;
          height: 443px;
          background: rgba(217, 217, 217, 0.08);
          border: 2px solid #FFFFFF;
          border-radius: 50px;
          padding: 24px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .pa-project-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 36px;
          border: 2px solid #FFFFFF;
          transition: transform 0.3s ease;
        }

        .pa-project-img:hover {
          transform: scale(1.02);
        }

        .pa-project-mockup-screen {
          width: 100%;
          height: 100%;
          border: 2px solid #FFFFFF;
          border-radius: 36px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .pa-project-mockup-screen.dark {
          background: linear-gradient(135deg, rgba(63, 1, 107, 0.25), rgba(167, 128, 235, 0.2));
        }

        .pa-project-mockup-screen.light {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(240, 225, 255, 0.35));
        }

        .pa-mockup-browser-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.3);
        }

        .pa-mockup-dots {
          display: flex;
          gap: 6px;
        }

        .pa-mockup-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .pa-mockup-dot.red { background: #FF5F56; }
        .pa-mockup-dot.yellow { background: #FFBD2E; }
        .pa-mockup-dot.green { background: #27C93F; }

        .pa-mockup-url {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #3F016B;
          opacity: 0.75;
          letter-spacing: 0.5px;
        }

        .pa-mockup-screen-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          gap: 10px;
        }

        .pa-mockup-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: #3F016B;
          color: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .pa-mockup-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700;
          font-size: clamp(18px, 2.2vw, 24px);
          color: #2D007C;
          margin: 0;
          line-height: 1.3;
          max-width: 420px;
        }

        .pa-mockup-org {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #4B127D;
          margin: 0;
          font-weight: 500;
        }

        .pa-mockup-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 6px;
        }

        .pa-mockup-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(63, 1, 107, 0.2);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #3F016B;
        }

        .pa-mockup-chip.verified {
          background: rgba(99, 255, 56, 0.25);
          border-color: rgba(99, 255, 56, 0.6);
          color: #0b6800;
        }

        .pa-mockup-chip.rewards {
          background: rgba(203, 247, 72, 0.25);
          border-color: rgba(203, 247, 72, 0.7);
          color: #2b5700;
          font-weight: 700;
        }

        .pa-mockup-platform-tag {
          margin-left: auto;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #7B3AEC;
          background: rgba(123, 58, 236, 0.12);
          padding: 2px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .pa-mockup-cert-seal {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pa-seal-icon {
          color: #10b981;
          filter: drop-shadow(0 2px 6px rgba(16, 185, 129, 0.35));
        }

        .pa-mockup-action-wrap {
          margin-top: 10px;
          z-index: 2;
        }

        .pa-mockup-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: #7B3AEC;
          color: #FFFFFF !important;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(123, 58, 236, 0.35);
          transition: all 0.2s ease;
        }

        .pa-mockup-btn:hover {
          background: #6428d0;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(123, 58, 236, 0.5);
        }

        .pa-mockup-verified-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #4B127D;
          opacity: 0.8;
          margin-top: 4px;
        }

        /* 3 Stat / Experience Pill Cards (Frame 55) */
        .pa-project-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 31px;
        }

        .pa-stat-card-glass {
          border-radius: 24px;
          padding: 30px 24px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-sizing: border-box;
          transition: transform 0.2s ease;
        }

        .pa-stat-card-glass:hover {
          transform: translateY(-3px);
        }

        .pa-project-block.odd .pa-stat-card-glass {
          background: rgba(212, 153, 255, 0.36);
          border: 1px solid #7B3AEC;
        }

        .pa-project-block.even .pa-stat-card-glass {
          background: rgba(255, 153, 194, 0.36);
          border: 1px solid #620067;
        }

        .pa-stat-glass-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-style: normal;
          font-weight: 500;
          font-size: clamp(22px, 2.2vw, 32px);
          line-height: 40px;
          margin: 0;
        }

        .pa-project-block.odd .pa-stat-glass-title { color: #C31DFF; }
        .pa-project-block.even .pa-stat-glass-title { color: #FF00D0; }

        .pa-stat-glass-sub {
          font-family: 'DM Sans', sans-serif;
          font-style: normal;
          font-weight: 400;
          font-size: 16px;
          line-height: 21px;
          margin: 0;
        }

        .pa-project-block.odd .pa-stat-glass-sub { color: #C31DFF; }
        .pa-project-block.even .pa-stat-glass-sub { color: #FF00D0; }

        /* ── FOOTER & THANKS BANNER ── */
        .pa-footer-band {
          position: relative;
          width: 100%;
          background: #D29FFF;
          padding: 100px 24px 80px;
          text-align: center;
          box-sizing: border-box;
        }

        .pa-thanks-banner {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 60px;
          border-radius: 80px;
          background: #7B3AEC;
          box-shadow: 0 16px 48px rgba(123, 58, 236, 0.45);
          margin-bottom: 36px;
        }

        .pa-thanks-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 4.5vw, 56px);
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .pa-thanks-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(16px, 1.6vw, 22px);
          color: #DFCCFF;
          margin: 0;
        }

        .pa-contact-channels {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .pa-channel-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: #141414;
          border-radius: 50px;
          color: #DFCCFF;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 16px;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .pa-channel-pill:hover {
          transform: translateY(-2px);
          color: #FFFFFF;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .pa-about-container {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          .pa-about-copy-col {
            align-items: center;
            text-align: center;
          }
          .pa-about-headline, .pa-about-bio-text {
            text-align: center;
          }
          .pa-matrix-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .pa-skills-cards-row {
            grid-template-columns: 1fr;
          }
          .pa-project-top-row {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          .pa-project-stats-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .pa-navbar-row {
            flex-direction: column;
          }
          .pa-navbar-pill-box {
            flex-wrap: wrap;
            height: auto;
            border-radius: 24px;
            justify-content: center;
          }
          .pa-matrix-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── 1. TOP HERO SECTION (Rectangle 43: #D29FFF) ── */}
      <section className="pa-hero-band" id="hero">
        {/* Floating Navbar */}
        <header className="pa-navbar-row">
          <div className="pa-navbar-pill-box">
            <a href="#hero" className={`pa-nav-btn ${activeSection === 'hero' ? 'active' : ''}`}>
              TRANG CHỦ
            </a>
            <a href="#portfolio" className="pa-nav-btn">
              Portfolio
            </a>
            <a href="#skills" className="pa-nav-btn">
              DỊCH VỤ
            </a>
            <a href="#about" className="pa-nav-btn">
              VỀ TÔI
            </a>
            <a href="#contact" className="pa-nav-btn">
              LIÊN HỆ
            </a>
          </div>

          <a href={contactHref} className="pa-hire-btn">
            TUYỂN TÔI!
          </a>
        </header>

        {/* Center Giant Word + Cursive Name Overlay */}
        <div className="pa-hero-titles-wrap">
          <h1 className="pa-hero-bg-word">PORTFOLIO</h1>
          <p className="pa-hero-cursive-name">{name}</p>
        </div>

        {/* Bottom CTA Capsule (Frame 23: #A26DFF) */}
        <a href="#portfolio" className="pa-hero-cta-capsule">
          <span className="pa-hero-cta-text">Hãy cùng tìm hiểu portfolio của mình!</span>
        </a>

        {/* Subtitle (Frame 53: #3F016B) */}
        <p className="pa-hero-sub-text">{roleTitle || 'Công việc của tôi'}</p>
      </section>

      {/* ── ANGLED RIBBON 1 (Role at top: 983px) ── */}
      <AngledRoleRibbon
        bgBottom="#A780EB"
        bgTop="#F0E1FF"
        rotate="-0.01deg"
        skills={skills}
      />

      {/* ── 2. ABOUT / VỀ MÌNH (Rectangle 44: sunset pastel aura) ── */}
      <section className="pa-about-band" id="about">
        <div className="pa-about-container">
          {/* Left: Photo Frame & Circular Rotor Badge */}
          <div className="pa-photo-frame-wrap">
            <div className="pa-photo-frame">
              {portraitSrc ? (
                <img
                  src={portraitSrc}
                  alt={`Chân dung ${name}`}
                  className="pa-photo-img"
                />
              ) : (
                <div className="pa-photo-mascot">
                  <PortfolioMascot avatar={avatar} size={380} />
                </div>
              )}
            </div>
          </div>

          {/* Right: Content (Frame 35 & Hero Content) */}
          <div className="pa-about-copy-col">
            <div className="pa-badge-ve-minh">
              <span>VỀ MÌNH</span>
            </div>

            <h2 className="pa-about-headline">
              {roleTitle
                ? `Mình hiện là ${roleTitle}${location ? ` và đang làm việc tại ${location}` : ''}`
                : `Xin chào, mình là ${name}!`}
            </h2>

            <p className="pa-about-bio-text">
              {bio || 'Ứng viên năng động luôn sẵn sàng cống hiến và phát triển kỹ năng thực chiến trong các dự án.'}
            </p>

            <a href="#portfolio" className="pa-about-action-btn">
              Xem các dự án của mình
            </a>
          </div>
        </div>
      </section>

      {/* ── ANGLED RIBBON 2 (Role at top: 1945px / 2235px) ── */}
      <AngledRoleRibbon
        bgBottom="#C31DFF"
        bgTop="#F0E1FF"
        rotate="-0.01deg"
        skills={skills}
      />

      {/* ── 3. KINH NGHIỆM HOẠT ĐỘNG (Rectangle 45 & 46) ── */}
      <section className="pa-activities-band" id="activities">
        <h2 className="pa-section-h2-title">Kinh nghiệm hoạt động</h2>

        <div className="pa-matrix-grid">
          {/* Item 1: Học vấn */}
          {(school || major) && (
            <div className="pa-matrix-card">
              <h3 className="pa-matrix-heading">Học vấn</h3>
              <p className="pa-matrix-meta">
                <b>{school || 'Đại học'}</b>
                {major ? ` · Chuyên ngành: ${major}` : ''}
                {birthYear ? ` · Năm sinh: ${birthYear}` : ''}
              </p>
            </div>
          )}

          {/* Items: Projects Matrix from candidate experiences */}
          {experiences.length > 0 &&
            experiences.slice(0, 6).map((exp, idx) => {
              const timeStr = `${exp.startDate || exp.startedAt || ''}${
                exp.endDate || exp.endedAt ? ' - ' + (exp.endDate || exp.endedAt) : (exp.startDate || exp.startedAt) ? ' - Hiện tại' : ''
              }`;
              const itemTitle = exp.title || exp.projectName || exp.name || `Dự án ${idx + 1}`;
              const itemRole = exp.role || exp.roleLevel || exp.position || exp.organization || 'Thành viên thực hiện';
              const itemDesc = exp.description || exp.detail || (exp.organization ? `Hoạt động tại ${exp.organization}` : 'Kinh nghiệm thực chiến');

              return (
                <div className="pa-matrix-card" key={exp.id || idx}>
                  <h3 className="pa-matrix-heading">{itemTitle}</h3>
                  <p className="pa-matrix-meta">
                    <b>{itemRole}</b>
                    {timeStr ? ` · ${timeStr}` : ''}
                    {exp.verified && ' ✦ Đã xác thực'}
                    <br />
                    {itemDesc}
                  </p>
                </div>
              );
            })}

          {/* Items: Credentials Matrix if available */}
          {credentials.length > 0 &&
            credentials.slice(0, 3).map((c, idx) => (
              <div className="pa-matrix-card" key={c.id || `cred-${idx}`}>
                <h3 className="pa-matrix-heading">{c.name || c.title || `Chứng chỉ ${idx + 1}`}</h3>
                <p className="pa-matrix-meta">
                  <b>{c.issuer || 'Đơn vị chứng thực'}</b>
                  {c.issuedAt ? ` · ${c.issuedAt}` : ''}
                  {' ✦ Chứng chỉ'}
                </p>
              </div>
            ))}

          {!school && !major && experiences.length === 0 && credentials.length === 0 && (
            <div className="pa-empty-box" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#3F016B', background: 'rgba(255,255,255,0.4)', borderRadius: '24px' }}>
              Chưa có kinh nghiệm hoạt động nào được thêm. Bạn có thể cập nhật tại bảng soạn hồ sơ.
            </div>
          )}
        </div>
      </section>

      {/* ── 4. KỸ NĂNG CHUYÊN MÔN (Frame 66) ── */}
      <section className="pa-skills-band" id="skills">
        <h2 className="pa-section-h2-title">Kỹ năng Chuyên Môn</h2>

        {skills.length > 0 ? (
          <div className="pa-skills-cards-row">
            {skills.map((skillName, idx) => {
              const isLavender = idx % 2 === 1;
              return (
                <div key={idx} className={`pa-skill-pill-card ${isLavender ? 'lavender' : 'white'}`}>
                  <div className="pa-skill-icon-wrap">
                    <Sparkles size={36} color="#3F016B" />
                  </div>
                  <h3 className="pa-skill-title">{skillName}</h3>
                  <p className="pa-skill-body">
                    Năng lực chuyên môn được tôi luyện và ứng dụng hiệu quả trong các dự án thực tế của {name}.
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pa-empty-box" style={{ textAlign: 'center', padding: '40px', color: '#3F016B', background: 'rgba(255,255,255,0.4)', borderRadius: '24px', maxWidth: '600px', margin: '0 auto' }}>
            Chưa có kỹ năng nào được cập nhật. Bạn có thể thêm kỹ năng tại bảng soạn hồ sơ.
          </div>
        )}
      </section>

      {/* ── ANGLED RIBBON 3 (Role at top: 3809px, angle: 3.34deg) ── */}
      <AngledRoleRibbon
        bgBottom="#C31DFF"
        bgTop="#F0E1FF"
        rotate="3.34deg"
        skills={skills}
      />

      {/* ── 5. PORTFOLIO SHOWCASE (Giant cursive title & alternating project blocks) ── */}
      <section className="pa-portfolio-intro-band" id="portfolio">
        <h2 className="pa-portfolio-giant-cursive">Portfolio</h2>
      </section>

      {experiences.length > 0 ? (
        experiences.map((exp, idx) => {
          const isOdd = idx % 2 === 0;
          const shot = getProjectImageUrl(exp);
          const timeStr = `${exp.startDate || exp.startedAt || ''}${
            exp.endDate || exp.endedAt ? ' - ' + (exp.endDate || exp.endedAt) : (exp.startDate || exp.startedAt) ? ' - Hiện tại' : ''
          }`;
          const expTitle = exp.title || exp.projectName || exp.name || `Dự án ${idx + 1}`;
          const expDesc =
            exp.description ||
            exp.detail ||
            (exp.organization
              ? `Dự án thực tế tại ${exp.organization} với các nhiệm vụ được ứng viên trực tiếp đảm nhận.`
              : 'Dự án thực tế ghi nhận năng lực chuyên môn và kết quả hoàn thành của ứng viên.');
          const expRole = exp.role || exp.roleLevel || exp.position || 'Thành viên thực hiện';

          return (
            <div key={exp.id || idx}>
              <div className={`pa-project-block ${isOdd ? 'odd' : 'even'}`}>
                <div className="pa-project-content-wrap">
                  {/* Top Row: Description on Left, Mockup on Right */}
                  <div className="pa-project-top-row">
                    <div>
                      <h3 className="pa-project-cursive-head">Dự án {idx + 1}</h3>
                      <h4 className="pa-project-title-real">{expTitle}</h4>
                      <p className="pa-project-desc">{expDesc}</p>
                    </div>

                    {/* Mockup Frame (580x443, radius 50px, border 2px solid white) */}
                    <div
                      className="pa-mockup-frame"
                      onClick={() => {
                        if (shot) {
                          setPreview({
                            src: shot,
                            fileName: expTitle,
                          });
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      title={shot ? 'Xem phóng to ảnh dự án' : expTitle}
                      style={{ cursor: shot ? 'pointer' : 'default' }}
                    >
                      <PurpleAuraProjectVisual
                        exp={exp}
                        idx={idx}
                        isOdd={isOdd}
                        expTitle={expTitle}
                        shot={shot}
                      />
                    </div>
                  </div>

                  {/* Bottom Row: 3 Stat / Experience Glass Cards (Frame 55) */}
                  <div className="pa-project-stats-row">
                    <div className="pa-stat-card-glass">
                      <h4 className="pa-stat-glass-title">Vị trí trong dự án</h4>
                      <p className="pa-stat-glass-sub">{expRole}</p>
                    </div>

                    <div className="pa-stat-card-glass">
                      <h4 className="pa-stat-glass-title">Thời gian thực hiện</h4>
                      <p className="pa-stat-glass-sub">{timeStr || 'Đang cập nhật'}</p>
                    </div>

                    <div className="pa-stat-card-glass">
                      <h4 className="pa-stat-glass-title">Đơn vị / Xác thực</h4>
                      <p className="pa-stat-glass-sub">
                        {exp.organization ? (
                          <>
                            {exp.organization}
                            {exp.verified && ' (✦ Đã xác thực)'}
                          </>
                        ) : exp.verified ? (
                          'fonlio Verified ✦'
                        ) : (
                          'Dự án thực tế'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separating Angled Ribbon between projects */}
              {idx < experiences.length - 1 && (
                <AngledRoleRibbon
                  bgBottom={isOdd ? '#C31DFF' : '#EB80B0'}
                  bgTop={isOdd ? '#F0E1FF' : '#FFE1F8'}
                  rotate={isOdd ? '-0.48deg' : '-0.32deg'}
                  skills={skills}
                />
              )}
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#3F016B' }}>
          Chưa có dự án nào được thêm. Bạn có thể thêm dự án tại bảng soạn hồ sơ.
        </div>
      )}

      {/* ── 6. FOOTER & THANKS BANNER ── */}
      <footer className="pa-footer-band" id="contact">
        <div className="pa-thanks-banner">
          <h2 className="pa-thanks-title">THANKS FOR WATCHING!</h2>
          <p className="pa-thanks-sub">Hãy kết nối để cùng tạo ra những sản phẩm tuyệt vời.</p>
        </div>

        <div className="pa-contact-channels">
          {email && (
            <a href={`mailto:${email}`} className="pa-channel-pill">
              <Mail size={18} />
              <span>{email}</span>
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="pa-channel-pill">
              <Phone size={18} />
              <span>{phone}</span>
            </a>
          )}
          {socialLinks.map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="pa-channel-pill"
            >
              <ExternalLink size={16} />
              <span>{s.name}</span>
            </a>
          ))}
        </div>
      </footer>

      {/* File Preview Modal */}
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
