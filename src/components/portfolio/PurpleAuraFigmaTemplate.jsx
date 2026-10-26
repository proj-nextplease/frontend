import React, { useState, useMemo, useId } from 'react';
import {
  ExternalLink,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sparkles,
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
 * Circular Rotating Badge around Photo ("TẢI ẢNH LÊN ĐÂY NHA" in Figma)
 */
function CircularSpinBadge({ resumeUrl, onClick, size = 164 }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const pathId = `pa-badge-circle-${uid}`;

  return (
    <div
      className="pa-spin-badge-box"
      style={{ width: size, height: size }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={resumeUrl ? 'Tải CV ứng viên' : 'Hồ sơ năng lực'}
    >
      <svg viewBox="0 0 164 164" width={size} height={size} className="pa-spin-badge-svg">
        <defs>
          <path
            id={pathId}
            d="M 82, 82 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0"
          />
        </defs>

        {/* Outer glass disc (Ellipse 3) */}
        <circle
          cx="82"
          cy="82"
          r="78"
          fill="rgba(0, 0, 0, 0.12)"
          stroke="#3F016B"
          strokeWidth="2"
        />

        {/* Circular Rotating Text (Group 46) */}
        <g className="pa-spin-rotor">
          <text
            fill="#3F016B"
            fontSize="10.1"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            letterSpacing="3"
          >
            <textPath href={`#${pathId}`} startOffset="0%">
              TẢI ẢNH LÊN ĐÂY NHA • TẢI ẢNH LÊN ĐÂY NHA •
            </textPath>
          </text>
        </g>

        {/* Inner solid white circle (Ellipse 4) */}
        <circle cx="82" cy="82" r="42" fill="#FFFFFF" />

        {/* Upload / Download Arrow Icon */}
        <g transform="translate(82, 82)">
          <path
            d="M 0,-12 L 0,8 M -8,0 L 0,8 L 8,0 M -12,12 L 12,12"
            stroke="#000000"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

const FALLBACK_PROJECTS = [
  {
    id: 'exp-1',
    title: 'Dự án 1',
    name: 'Adidas Website UI Design',
    role: 'UX/UI Lead & Product Designer',
    time: '4 tháng · 2024',
    interactions: '35.000+ Lượt tương tác',
    description:
      'Mô tả về dự án: Nghiên cứu hành vi người dùng, tái cấu trúc luồng checkout 3 bước, xây dựng hệ thống design system với hơn 200 components chuẩn mực và tối ưu tỷ lệ chuyển đổi đơn hàng tăng 38%.',
    verified: true,
  },
  {
    id: 'exp-2',
    title: 'Dự án 2',
    name: 'Ứng dụng Quản lý Tài chính & Đầu tư Cá nhân',
    role: 'Senior Product Designer',
    time: '6 tháng · 2023',
    interactions: '50.000+ Người dùng tích cực',
    description:
      'Mô tả về dự án: Thiết kế giao diện theo dõi danh mục đầu tư theo thời gian thực, bảng phân tích dòng tiền trực quan bằng biểu đồ tương tác, mang lại sự tin cậy và tiện lợi tối đa cho người dùng trẻ.',
    verified: true,
  },
  {
    id: 'exp-3',
    title: 'Dự án 3',
    name: 'Cổng Học tập Trực tuyến Gamified EdTech',
    role: 'UI Designer & Brand Specialist',
    time: '3 tháng · 2023',
    interactions: '22.000+ Học viên hoàn thành',
    description:
      'Mô tả về dự án: Xây dựng cổng học tập số kết hợp lộ trình tương tác theo gamification, tích hợp hệ thống bài tập và nộp bài với giao diện thân thiện, hiện đại.',
    verified: true,
  },
  {
    id: 'exp-4',
    title: 'Dự án 4',
    name: 'Cổng Dịch vụ Số & Đặt lịch Y tế Trực tuyến',
    role: 'UX Researcher & Interaction Designer',
    time: '5 tháng · 2022',
    interactions: '40.000+ Lượt đặt lịch khám',
    description:
      'Mô tả về dự án: Tối ưu quy trình đặt lịch khám bệnh thông minh qua 3 chạm, tích hợp hệ thống hồ sơ bệnh án điện tử trực quan giúp giảm 45% thời gian chờ đợi.',
    verified: true,
  },
  {
    id: 'exp-5',
    title: 'Dự án 5',
    name: 'Ứng dụng Đặt xe & Giao đồ ăn Tiết kiệm Xanh',
    role: 'Lead Mobile Experience Designer',
    time: '4 tháng · 2022',
    interactions: '80.000+ Lượt chuyến xe xanh',
    description:
      'Mô tả về dự án: Thiết kế giao diện điều hướng thời gian thực theo bản đồ số tương tác, tối ưu hóa trải nghiệm đặt món đa điểm chạm với hệ sinh thái điểm thưởng phong phú.',
    verified: true,
  },
  {
    id: 'exp-6',
    title: 'Dự án 6',
    name: 'Nền tảng Mạng Xã hội Học tập & Phát triển Sự nghiệp',
    role: 'Product Designer & Brand Lead',
    time: '6 tháng · 2021',
    interactions: '18.000+ Thành viên kết nối',
    description:
      'Mô tả về dự án: Kiến tạo không gian kết nối sinh viên và cố vấn nghề nghiệp thông qua hệ thống quest thử thách và bảng danh dự năng lực chuẩn hóa.',
    verified: true,
  },
];

export function PurpleAuraFigmaTemplate({ profile = {} }) {
  const [preview, setPreview] = useState(null);
  const [activeSection] = useState('hero');

  // Candidate Data & Figma Fallbacks
  const name = profile.name || 'Trâm Nguyễn';
  const major = profile.major || profile.headline || 'Digital Marketing';
  const school = profile.school || 'Đại học FPT';
  const location = profile.location || 'Thành phố Hồ Chí Minh';
  const headline = profile.headline || 'Digital Market-er';
  const bio =
    profile.bio ||
    'Mình hiện là Digital Market-er và đang làm việc tự do tại Thành phố Hồ Chí Minh. Đam mê kết hợp tư duy phân tích thị trường với trải nghiệm người dùng tinh tế để tạo nên những sản phẩm số đột phá.';

  const skills = useMemo(() => {
    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
      return profile.skills;
    }
    return [
      'Thiết kế giao diện',
      'Thiết kế đồ họa',
      'Marketing',
      'Phân tích tài chính',
      'Thiết kế website',
      'Nghiên cứu người dùng',
    ];
  }, [profile.skills]);

  const experiences = useMemo(() => {
    if (Array.isArray(profile.experiences) && profile.experiences.length > 0) {
      return profile.experiences;
    }
    return FALLBACK_PROJECTS;
  }, [profile.experiences]);

  const avatar = profile.avatar && Object.keys(profile.avatar).length > 0 ? profile.avatar : { gender: 'female' };
  const email = profile.socialLinks?.email || 'tram.nguyen@fpt.edu.vn';
  const phone = profile.socialLinks?.phone || '0909 123 456';
  const linkedin = profile.socialLinks?.linkedin;
  const resumeUrl = profile.resumeUrl;

  const contactHref = email
    ? (email.startsWith('mailto:') ? email : `mailto:${email}`)
    : (linkedin ? `https://linkedin.com/in/${linkedin}` : '#contact');

  const handleDownloadCv = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

        .pa-mockup-inner {
          width: 100%;
          height: 100%;
          border: 2px solid #FFFFFF;
          border-radius: 36px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.1));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
          text-align: center;
        }

        .pa-mockup-tag {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 6px 14px;
          border-radius: 50px;
          background: #FFFFFF;
          color: #3F016B;
          margin-bottom: 16px;
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
        <p className="pa-hero-sub-text">Công việc của tôi</p>
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
              {avatar.portraitUrl ? (
                <img
                  src={avatar.portraitUrl}
                  alt={`Chân dung ${name}`}
                  className="pa-photo-img"
                />
              ) : (
                <div className="pa-photo-mascot">
                  <PortfolioMascot avatar={avatar} size={380} />
                </div>
              )}
            </div>

            <CircularSpinBadge resumeUrl={resumeUrl} onClick={handleDownloadCv} size={164} />
          </div>

          {/* Right: Content (Frame 35 & Hero Content) */}
          <div className="pa-about-copy-col">
            <div className="pa-badge-ve-minh">
              <span>VỀ MÌNH</span>
            </div>

            <h2 className="pa-about-headline">
              Mình hiện là {headline} và đang làm việc tự do tại {location}
            </h2>

            <p className="pa-about-bio-text">{bio}</p>

            <a href={contactHref} className="pa-about-action-btn">
              Đăng hồ sơ công việc của bạn tại đây
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
          <div className="pa-matrix-card">
            <h3 className="pa-matrix-heading">Học vấn</h3>
            <p className="pa-matrix-meta">
              <b>{school}</b> · Chuyên ngành: {major} · 2021 - 2025
            </p>
          </div>

          {/* Items 2..11: Projects Matrix (Group 59 & 60) */}
          {experiences.slice(0, 7).map((exp, idx) => (
            <div className="pa-matrix-card" key={exp.id || idx}>
              <h3 className="pa-matrix-heading">Dự án {idx + 1}</h3>
              <p className="pa-matrix-meta">
                <b>{exp.role || 'Thành viên dự án'}</b> · {exp.startDate || '10/2023'}
                {exp.endDate ? ` - ${exp.endDate}` : ' - Hiện tại'}
                <br />
                {exp.title || 'Mô tả dự án'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. KỸ NĂNG CHUYÊN MÔN (Frame 66) ── */}
      <section className="pa-skills-band" id="skills">
        <h2 className="pa-section-h2-title">Kỹ năng Chuyên Môn</h2>

        <div className="pa-skills-cards-row">
          {/* Card 1: UX/UI (White) */}
          <div className="pa-skill-pill-card white">
            <div className="pa-skill-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <h3 className="pa-skill-title">UX/UI</h3>
            <p className="pa-skill-body">
              Figma, Design System, Wireframing, Prototyping, Usability Testing, Information Architecture, User Journey Mapping.
            </p>
          </div>

          {/* Card 2: TECH (Lavender) */}
          <div className="pa-skill-pill-card lavender">
            <div className="pa-skill-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h3 className="pa-skill-title">TECH</h3>
            <p className="pa-skill-body">
              Frontend Development, React, JavaScript / TypeScript, Responsive Layouts, RESTful API, Performance Optimization.
            </p>
          </div>

          {/* Card 3: MARKETING (White) */}
          <div className="pa-skill-pill-card white">
            <div className="pa-skill-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </div>
            <h3 className="pa-skill-title">MARKETING</h3>
            <p className="pa-skill-body">
              Digital Marketing, Content Strategy, Brand Growth, SEO/SEM Optimization, Social Media Ads, Data Analytics.
            </p>
          </div>
        </div>
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

      {experiences.slice(0, 6).map((exp, idx) => {
        const isOdd = idx % 2 === 0;
        return (
          <div key={exp.id || idx}>
            <div className={`pa-project-block ${isOdd ? 'odd' : 'even'}`}>
              <div className="pa-project-content-wrap">
                {/* Top Row: Description on Left, Mockup on Right */}
                <div className="pa-project-top-row">
                  <div>
                    <h3 className="pa-project-cursive-head">Dự án {idx + 1}</h3>
                    <h4 className="pa-project-title-real">{exp.name || exp.title}</h4>
                    <p className="pa-project-desc">
                      {exp.description ||
                        'Mô tả về dự án: Nghiên cứu hành vi người dùng, tối ưu luồng chuyển đổi, xây dựng hệ thống design system chuẩn mực và đo lường kết quả thực chiến vượt trội.'}
                    </p>
                  </div>

                  {/* Mockup Frame (580x443, radius 50px, border 2px solid white) */}
                  <div className="pa-mockup-frame">
                    <div className="pa-mockup-inner">
                      <span className="pa-mockup-tag">
                        {exp.role || 'Dự án thực tế'}
                      </span>
                      <h5 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, margin: '0 0 10px', color: '#141414' }}>
                        {exp.name || exp.title}
                      </h5>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#4b5563', margin: 0, maxWidth: 360 }}>
                        {exp.organization ? `Tổ chức: ${exp.organization}` : 'NextPlease Verified Proof-of-Work'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: 3 Stat / Experience Glass Cards (Frame 55) */}
                <div className="pa-project-stats-row">
                  <div className="pa-stat-card-glass">
                    <h4 className="pa-stat-glass-title">Vị trí trong dự án</h4>
                    <p className="pa-stat-glass-sub">{exp.role || 'UX/UI Lead & Product Designer'}</p>
                  </div>

                  <div className="pa-stat-card-glass">
                    <h4 className="pa-stat-glass-title">Thời gian thực hiện</h4>
                    <p className="pa-stat-glass-sub">{exp.time || exp.startDate || '4 tháng'}</p>
                  </div>

                  <div className="pa-stat-card-glass">
                    <h4 className="pa-stat-glass-title">Lượt tương tác</h4>
                    <p className="pa-stat-glass-sub">{exp.interactions || '35.000+ Lượt tương tác'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Separating Angled Ribbon between projects */}
            <AngledRoleRibbon
              bgBottom={isOdd ? '#C31DFF' : '#EB80B0'}
              bgTop={isOdd ? '#F0E1FF' : '#FFE1F8'}
              rotate={isOdd ? '-0.48deg' : '-0.32deg'}
              skills={skills}
            />
          </div>
        );
      })}

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
          {linkedin && (
            <a
              href={`https://linkedin.com/in/${linkedin}`}
              target="_blank"
              rel="noreferrer"
              className="pa-channel-pill"
            >
              <LinkedInIcon size={18} />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </footer>

      {/* File Preview Modal */}
      {preview && <FilePreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
