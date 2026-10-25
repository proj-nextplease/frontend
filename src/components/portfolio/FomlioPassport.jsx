import { useState, useEffect, useMemo, useId } from 'react';
import {
  BadgeCheck,
  Clock3,
  ExternalLink,
  Award,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Layers,
  Smartphone,
  Monitor,
  Code2,
  Lightbulb,
  Compass,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { resolveTheme } from '../../constants/portfolioThemes.js';
import { PortfolioMascot } from '../PortfolioMascot.jsx';
import { FilePreviewModal } from '../FilePreviewModal.jsx';
import { PurpleAuraFigmaTemplate } from './PurpleAuraFigmaTemplate.jsx';
import { NhoNeonFigmaTemplate } from './NhoNeonFigmaTemplate.jsx';
import { ComNeonFigmaTemplate } from './ComNeonFigmaTemplate.jsx';
import '../../styles/fomlioTheme.css';

function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0-.01-3.34 1.67 1.67 0 0 0 .01 3.34M7.86 18.5V10.13H5.07V18.5h2.79Z" />
    </svg>
  );
}

/**
 * 3D Faceted Yellow-Lime Star component exactly matching Figma node 9-126
 */
export function FigmaStar3D({ size = 36, rotate = 0, style, className }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `star-face-${uid}`;
  const shadowId = `star-shadow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`fom-star-3d ${className || ''}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--fom-star-light, #fffbeb)" />
          <stop offset="40%" stopColor="var(--fom-star-mid, #fef08a)" />
          <stop offset="100%" stopColor="var(--fom-star-main, #facc15)" />
        </linearGradient>
        <linearGradient id={shadowId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--fom-star-shadow-start, #ca8a04)" />
          <stop offset="100%" stopColor="var(--fom-star-shadow-end, #581c87)" />
        </linearGradient>
      </defs>
      {/* 3D Extrusion Side Silhouette for Depth */}
      <path
        d="M 50,7 L 62,35 L 92,38 L 70,57 L 77,87 L 50,72 L 23,87 L 30,57 L 8,38 L 38,35 Z"
        fill={`url(#${shadowId})`}
        transform="translate(3.5, 6)"
        opacity="0.88"
      />
      {/* Main Front Star */}
      <path
        d="M 50,7 L 62,35 L 92,38 L 70,57 L 77,87 L 50,72 L 23,87 L 30,57 L 8,38 L 38,35 Z"
        fill={`url(#${gradientId})`}
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Subtle Bevel Facets */}
      <path d="M 50,7 L 50,52 L 62,35 Z" fill="#ffffff" opacity="0.45" />
      <path d="M 92,38 L 50,52 L 70,57 Z" fill="var(--fom-star-facet-dark, #ca8a04)" opacity="0.32" />
      <path d="M 77,87 L 50,52 L 50,72 Z" fill="var(--fom-star-facet-deep, #78350f)" opacity="0.3" />
      <path d="M 23,87 L 50,52 L 30,57 Z" fill="var(--fom-star-facet-light, #fde047)" opacity="0.25" />
      <path d="M 8,38 L 50,52 L 38,35 Z" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}

/**
 * 4-Point Sparkle Cross
 */
export function FigmaSparkle({ size = 18, color = '#ffffff', style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={`fom-sparkle ${className || ''}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
}

/**
 * Rotating Circular "DOWNLOAD CV" Badge with Lime Center Button
 */
export function DownloadCvBadge({ resumeUrl, onClick, size = 120, className }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const badgeId = `cv-badge-${uid}`;

  const content = (
    <div className={`fom-download-badge-box ${className || ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" width={size} height={size} className="fom-download-badge-svg">
        <defs>
          <path
            id={badgeId}
            d="M 80, 80 m -56, 0 a 56,56 0 1,1 112,0 a 56,56 0 1,1 -112,0"
          />
        </defs>
        {/* Dark Plum Translucent Disc */}
        <circle cx="80" cy="80" r="74" fill="rgba(19, 9, 36, 0.88)" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.5" />
        {/* Rotating Text Along Circle */}
        <g className="fom-download-badge-rotor">
          <text
            fill="#ffffff"
            fontSize="10.8"
            fontWeight="700"
            letterSpacing="2.8"
            className="fom-download-text"
          >
            <textPath href={`#${badgeId}`} startOffset="0%">
              DOWNLOAD CV • DOWNLOAD CV •
            </textPath>
          </text>
        </g>
        {/* Center Neon Disc */}
        <circle cx="80" cy="80" r="27" fill="var(--fom-brand)" className="fom-download-center-disc" />
        {/* Download Arrow Icon */}
        <g transform="translate(80, 80)">
          <path
            d="M -5,-6 L 5,-6 M 0,-6 L 0,5 M -5,1 L 0,5 L 5,1 M -7,9 L 7,9"
            stroke="#130924"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );

  if (resumeUrl) {
    return (
      <a
        href={resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        aria-label="Tải CV của ứng viên"
        className="fom-download-badge-link"
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="fom-download-badge-button"
      aria-label="Tải CV của ứng viên"
      onClick={onClick}
    >
      {content}
    </button>
  );
}

/**
 * Signature White Marquee Ticker with Neon Lime Borders & Purple Text
 */
export function SignatureMarquee({ items, className, reverse = false }) {
  const defaultItems = [
    'Thiết kế giao diện',
    'Thiết kế đồ họa',
    'Marketing',
    'Phân tích tài chính',
    'Thiết kế giao diện',
    'Thiết kế website',
    'Marketing',
    'Phân tích tài chính',
  ];
  const displayItems = Array.isArray(items) && items.length >= 3 ? items : defaultItems;

  return (
    <div className={`fom-marquee-bar ${className || ''}`} aria-label="Lĩnh vực chuyên môn">
      <div className={`fom-marquee-track ${reverse ? 'reverse' : ''}`}>
        {[0, 1].map((copyIndex) => (
          <div className="fom-marquee-group" key={copyIndex} aria-hidden={copyIndex === 1}>
            {displayItems.map((item, idx) => (
              <span className="fom-marquee-chunk" key={`${copyIndex}-${idx}`}>
                <span className="fom-marquee-label">{item}</span>
                <span className="fom-marquee-bullet">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Device Browser Mockup Frame with Cyan Glow & Top Controls
 */
function ProjectBrowserMockup({ project, index, onZoom }) {
  const shot = Array.isArray(project.proofImages) && project.proofImages[0] ? project.proofImages[0] : null;

  return (
    <div className="fom-mockup-frame">
      <div className="fom-mockup-window">
        {/* Browser Top Controls */}
        <div className="fom-mockup-header">
          <div className="fom-mockup-dots">
            <span className="fom-dot red" />
            <span className="fom-dot yellow" />
            <span className="fom-dot green" />
          </div>
          <div className="fom-mockup-address">
            <span className="fom-mockup-lock">🔒</span>
            <span className="fom-mockup-url">nextplease.me/projects/case-{index + 1}</span>
          </div>
          <div className="fom-mockup-actions">
            <span className="fom-mockup-share">✦</span>
          </div>
        </div>

        {/* Browser Canvas */}
        <div className="fom-mockup-viewport">
          {shot ? (
            <button
              type="button"
              className="fom-mockup-img-btn"
              onClick={() => onZoom(shot, project.title || `Dự án ${index + 1}`)}
              title="Nhấn để phóng to ảnh minh chứng"
            >
              <img src={shot} alt={project.title || 'Dự án'} className="fom-mockup-img" />
              <div className="fom-mockup-hover-overlay">
                <ExternalLink size={20} />
                <span>Xem kích thước đầy đủ</span>
              </div>
            </button>
          ) : (
            <div className="fom-mockup-fallback-screen">
              <div className="fom-mockup-screen-hero">
                <span className="fom-mockup-screen-tag">Featured Project</span>
                <h4 className="fom-mockup-screen-title">{project.title || `Dự án ${index + 1}`}</h4>
                <p className="fom-mockup-screen-org">{project.organization || 'Hồ sơ năng lực chuyên môn'}</p>
              </div>
              <div className="fom-mockup-screen-widgets">
                <div className="fom-mockup-screen-widget">
                  <span className="fom-widget-icon">⚡</span>
                  <div>
                    <strong>UX Flow & Layout</strong>
                    <p>Chuẩn hóa trải nghiệm người dùng</p>
                  </div>
                </div>
                <div className="fom-mockup-screen-widget">
                  <span className="fom-widget-icon">✦</span>
                  <div>
                    <strong>Chỉ số & Kết quả</strong>
                    <p>Tối ưu hóa hiệu suất chuyển đổi</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 6 Default / Dynamic Skills matching the 3x2 grid of Figma
 */
const DEFAULT_SERVICES = [
  {
    icon: Layers,
    title: 'Thiết kế UI/UX',
    desc: 'Xây dựng trải nghiệm trực quan, wireframe, prototype và hệ thống Design System hoàn chỉnh trên Figma.',
  },
  {
    icon: Smartphone,
    title: 'Ứng dụng Di động',
    desc: 'Thiết kế giao diện ứng dụng chuẩn iOS & Android, tối ưu hóa tương tác cảm ứng và hành vi người dùng.',
  },
  {
    icon: Monitor,
    title: 'Thiết kế Website',
    desc: 'Landing page hiện đại, cổng thông tin và web application chuẩn Responsive trên mọi kích thước màn hình.',
  },
  {
    icon: Code2,
    title: 'Lập trình Frontend',
    desc: 'Chuyển hóa giao diện sang mã nguồn sạch React, Vue hoặc HTML/CSS với hiệu năng cao và chuẩn SEO.',
  },
  {
    icon: Lightbulb,
    title: 'Chiến lược Sáng tạo',
    desc: 'Định hình bản sắc thương hiệu, thông điệp truyền thông và kế hoạch nội dung sáng tạo đa kênh.',
  },
  {
    icon: Compass,
    title: 'Nghiên cứu Người dùng',
    desc: 'User persona, khảo sát hành vi, thử nghiệm A/B test và phân tích dữ liệu để cải thiện trải nghiệm số.',
  },
];

/**
 * Fallback Realistic Project Showcase Data when user hasn't added projects
 */
const FALLBACK_PROJECTS = [
  {
    id: 'exp-1',
    title: 'Thiết kế Nền tảng E-Commerce Thời trang Thể thao',
    role: 'Lead UI/UX Designer',
    organization: 'Dự án Thương mại Điện tử',
    startDate: '10/2023',
    endDate: '04/2024',
    description:
      'Mô tả về dự án: Nghiên cứu hành vi mua sắm trực tuyến, tái cấu trúc luồng checkout 3 bước, xây dựng hệ thống design system với hơn 200 components và tối ưu tỷ lệ chuyển đổi đơn hàng tăng 38%.',
    verified: true,
  },
  {
    id: 'exp-2',
    title: 'Ứng dụng Quản lý Tài chính & Đầu tư Cá nhân',
    role: 'Product Designer',
    organization: 'FinTech Innovation Lab',
    startDate: '05/2023',
    endDate: '09/2023',
    description:
      'Mô tả về dự án: Thiết kế giao diện theo dõi danh mục đầu tư theo thời gian thực, bảng phân tích dòng tiền trực quan bằng biểu đồ tương tác, mang lại sự tin cậy và tiện lợi tối đa cho người dùng trẻ.',
    verified: true,
  },
  {
    id: 'exp-3',
    title: 'Hệ thống Quản lý Đào tạo & Khóa học Trực tuyến',
    role: 'UI Designer & Prototyper',
    organization: 'EdTech Platform',
    startDate: '01/2023',
    endDate: '05/2023',
    description:
      'Mô tả về dự án: Xây dựng cổng học tập số kết hợp lộ trình tương tác theo gamification, tích hợp hệ thống bài tập và nộp bài với giao diện thân thiện, hiện đại.',
    verified: false,
  },
  {
    id: 'exp-4',
    title: 'Cổng Dịch vụ Số & Đặt lịch Y tế Trực tuyến',
    role: 'UX Researcher & Designer',
    organization: 'HealthTech Innovation Hub',
    startDate: '08/2022',
    endDate: '12/2022',
    description:
      'Mô tả về dự án: Tối ưu quy trình đặt lịch khám bệnh thông minh qua 3 chạm, tích hợp hệ thống hồ sơ bệnh án điện tử trực quan giúp giảm 45% thời gian chờ đợi.',
    verified: true,
  },
  {
    id: 'exp-5',
    title: 'Ứng dụng Đặt xe & Giao đồ ăn Tiết kiệm Xanh',
    role: 'Lead Mobile Designer',
    organization: 'Green Mobility Platform',
    startDate: '03/2022',
    endDate: '07/2022',
    description:
      'Mô tả về dự án: Thiết kế giao diện điều hướng thời gian thực theo bản đồ số tương tác, tối ưu hóa trải nghiệm đặt món đa điểm chạm với hệ sinh thái điểm thưởng phong phú.',
    verified: true,
  },
  {
    id: 'exp-6',
    title: 'Nền tảng Mạng Xã hội Học tập & Phát triển Sự nghiệp',
    role: 'Product Designer & Brand Lead',
    organization: 'GenZ Career Network',
    startDate: '09/2021',
    endDate: '02/2022',
    description:
      'Mô tả về dự án: Kiến tạo không gian kết nối sinh viên và cố vấn nghề nghiệp thông qua hệ thống quest thử thách và bảng danh dự năng lực chuẩn hóa.',
    verified: true,
  },
];

/**
 * 6 Signature neon border styles for the 2x3 overview grid (Figma Node 10-132)
 */
const GALLERY_BORDER_COLORS = [
  { border: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)', tag: 'cyan' },
  { border: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', tag: 'magenta' },
  { border: '#fb7185', glow: 'rgba(251, 113, 133, 0.4)', tag: 'rose' },
  { border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', tag: 'blue' },
  { border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', tag: 'teal' },
  { border: '#bef264', glow: 'rgba(190, 242, 100, 0.4)', tag: 'lime' },
];

/**
 * Main FomlioPassport Component (Theme Cốm Neon)
 * Faithful recreation of Figma node 9-126 ("Portfolio Landing Page 1")
 */
export function FomlioPassport({ profile = {}, isDraft = false }) {
  const currentThemeId = resolveTheme(profile.selectedTheme).id;
  if (currentThemeId === 'PURPLE_AURA') {
    return <PurpleAuraFigmaTemplate profile={profile} isDraft={isDraft} />;
  }
  if (currentThemeId === 'NHO_NEON') {
    return <NhoNeonFigmaTemplate profile={profile} isDraft={isDraft} />;
  }
  return <ComNeonFigmaTemplate profile={profile} isDraft={isDraft} />;

  const [preview, setPreview] = useState(null);
  const [activeSection, setActiveSection] = useState('fom-top');

  const skills = useMemo(
    () => (Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills : []),
    [profile.skills]
  );
  const experiences = useMemo(
    () => (Array.isArray(profile.experiences) && profile.experiences.length > 0 ? profile.experiences : []),
    [profile.experiences]
  );
  const credentials = (Array.isArray(profile.credentials) ? profile.credentials : []).filter((c) => c.name?.trim());
  const avatar = profile.avatar && Object.keys(profile.avatar).length > 0 ? profile.avatar : { gender: 'female' };

  // Personal Info with Figma fallbacks
  const name = profile.name || 'Trâm Nguyễn';
  const major = profile.major || profile.headline || 'Digital Marketing';
  const school = profile.school || 'Đại học FPT';
  const location = profile.location || 'Thành phố Hồ Chí Minh';
  const headline = profile.headline || 'Digital Market-er & UI/UX Designer';
  const bio =
    profile.bio ||
    'Mình là một người đam mê sáng tạo, luôn hướng tới việc kết hợp giữa tư duy phân tích thị trường và trải nghiệm người dùng tinh tế để mang lại giá trị thực tế cho từng dự án.';

  const verifiedCount = experiences.filter((e) => e.verified).length;
  const verifiedPct = experiences.length ? Math.round((verifiedCount / experiences.length) * 100) : 100;

  // Projects to display in the Portfolio showcase (use actual user experiences, fallback to rich mocks if few)
  const displayProjects = useMemo(() => {
    if (experiences.length > 0) {
      return experiences;
    }
    return FALLBACK_PROJECTS;
  }, [experiences]);

  // Project aura color themes (cycling vibrant gradients matching Figma)
  const PROJECT_THEMES = [
    'fom-aura-purple', // Project 1: Purple / Magenta
    'fom-aura-plum',   // Project 2: Rose / Plum
    'fom-aura-amber',  // Project 3: Amber / Peach
    'fom-aura-olive',  // Project 4: Olive / Gold
    'fom-aura-lime',   // Project 5+: Chartreuse / Lime
  ];

  // Services / Skills (use user's skills if present, mapping to cards)
  const displayServices = useMemo(() => {
    if (skills.length >= 6) {
      return skills.slice(0, 6).map((skillName, i) => {
        const IconComponent = DEFAULT_SERVICES[i % DEFAULT_SERVICES.length].icon;
        return {
          icon: IconComponent,
          title: skillName,
          desc: DEFAULT_SERVICES[i % DEFAULT_SERVICES.length].desc,
        };
      });
    }
    return DEFAULT_SERVICES;
  }, [skills]);

  // Contact info
  const email = profile.socialLinks?.email || 'tram.nguyen@fpt.edu.vn';
  const phone = profile.socialLinks?.phone || '0909 123 456';
  const linkedin = profile.socialLinks?.linkedin;
  const resumeUrl = profile.resumeUrl;

  const contactHref = email
    ? (email.startsWith('mailto:') ? email : `mailto:${email}`)
    : (linkedin ? `https://linkedin.com/in/${linkedin}` : '#fom-contact');

  // Track active section when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['fom-top', 'fom-about', 'fom-activities', 'fom-services', 'fom-portfolio', 'fom-contact'];
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadCv = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      const contactEl = document.getElementById('fom-contact');
      if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fom-page" data-fom-theme={resolveTheme(profile.selectedTheme).id}>
      {/* Dynamic Ambient Radiant Glows */}
      <div className="fom-bg-auras" aria-hidden="true">
        <div className="fom-aura fom-aura-top-purple" />
        <div className="fom-aura fom-aura-hero-lime" />
        <div className="fom-aura fom-aura-mid-violet" />
        <div className="fom-aura fom-aura-bottom-lime" />
      </div>

      <div className="fom-shell">
        {/* ── 1. FLOATING PILL NAVBAR ────────────────────────────────────────── */}
        <header className="fom-header-wrap">
          <div className="fom-brand-name">
            <span className="fom-brand-dot">✦</span>
            <span className="fom-brand-title">{name}</span>
          </div>

          <nav className="fom-floating-navbar" aria-label="Thanh điều hướng chính">
            <a
              href="#fom-top"
              className={`fom-nav-pill ${activeSection === 'fom-top' ? 'active' : ''}`}
            >
              TRANG CHỦ
            </a>
            <a
              href="#fom-portfolio"
              className={`fom-nav-pill ${activeSection === 'fom-portfolio' ? 'active' : ''}`}
            >
              PORTFOLIO
            </a>
            <a
              href="#fom-services"
              className={`fom-nav-pill ${activeSection === 'fom-services' ? 'active' : ''}`}
            >
              DỊCH VỤ
            </a>
            <a
              href="#fom-about"
              className={`fom-nav-pill ${activeSection === 'fom-about' || activeSection === 'fom-activities' ? 'active' : ''}`}
            >
              VỀ CHÚNG TÔI
            </a>
            <a
              href="#fom-contact"
              className={`fom-nav-pill ${activeSection === 'fom-contact' ? 'active' : ''}`}
            >
              LIÊN HỆ
            </a>
          </nav>

          <a href={contactHref} className="fom-hire-btn">
            TUYỂN TÔI
          </a>
        </header>

        {/* ── 2. HERO SECTION ──────────────────────────────────────────────── */}
        <section className="fom-hero-section" id="fom-top">
          {/* Floating 3D Stars around Hero */}
          <FigmaStar3D size={52} rotate={-24} className="fom-hero-star s1" />
          <FigmaStar3D size={38} rotate={32} className="fom-hero-star s2" />
          <FigmaStar3D size={26} rotate={-15} className="fom-hero-star s3" />
          <FigmaStar3D size={44} rotate={20} className="fom-hero-star s4" />
          <FigmaSparkle size={22} className="fom-hero-sparkle sp1" />
          <FigmaSparkle size={16} className="fom-hero-sparkle sp2" />
          <FigmaSparkle size={18} className="fom-hero-sparkle sp3" />

          {/* Left: Glowing Circular Portrait */}
          <div className="fom-hero-portrait-col">
            <div className="fom-portrait-halo-ring">
              {/* Wavy Doodle Contour Lines */}
              <svg
                viewBox="0 0 400 400"
                className="fom-portrait-doodles"
                fill="none"
                stroke="rgba(255, 255, 255, 0.72)"
                strokeWidth="2.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M 40,240 C 90,160 110,130 150,150 C 190,170 210,240 260,210 C 300,180 320,130 360,160" />
                <path d="M 60,270 C 110,190 130,160 170,180 C 210,200 230,270 280,240 C 320,210 340,160 380,190" />
                <path d="M 20,210 C 70,130 90,100 130,120 C 170,140 190,210 240,180 C 280,150 300,100 340,130" />
              </svg>

              {/* Candidate Image / Mascot */}
              <div className="fom-portrait-img-box">
                {avatar.portraitUrl ? (
                  <img
                    src={avatar.portraitUrl}
                    alt={`Ảnh chân dung của ${name}`}
                    className="fom-portrait-img"
                  />
                ) : (
                  <div className="fom-portrait-mascot-wrap">
                    <PortfolioMascot avatar={avatar} size={280} />
                  </div>
                )}
              </div>

              {/* Anchored Rotating Download CV Badge */}
              <div className="fom-hero-cv-badge">
                <DownloadCvBadge resumeUrl={resumeUrl} onClick={handleDownloadCv} size={132} />
              </div>
            </div>
          </div>

          {/* Right: Intro Copy & CTAs */}
          <div className="fom-hero-copy-col">
            <div className="fom-pill-tag">
              <span className="fom-pill-tag-dot" />
              <span>{isDraft ? 'Bản xem trước hồ sơ' : 'Kinh nghiệm làm việc'}</span>
            </div>

            <h1 className="fom-hero-heading">
              Xin chào! Mình là <span className="fom-text-highlight">{name}</span>, hiện là sinh viên chuyên ngành{' '}
              <span className="fom-text-highlight">{major}</span> tại {school}
            </h1>

            <p className="fom-hero-lede">{bio}</p>

            <div className="fom-hero-btn-row">
              <a href="#fom-portfolio" className="fom-btn-solid-white">
                Hãy cùng tìm hiểu portfolio của mình!
              </a>
              <a href="#fom-activities" className="fom-btn-glass-ghost">
                Công việc của tôi
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* ── 3. SIGNATURE MARQUEE TICKERS (Divider 1) ────────────────────── */}
      <div className="fom-marquee-stack">
        <SignatureMarquee items={skills} />
        <SignatureMarquee items={skills} className="fom-marquee-bar-secondary" reverse />
      </div>

      <div className="fom-shell">
        {/* ── 4. ABOUT SECTION ("VỀ MÌNH") ─────────────────────────────────── */}
        <section className="fom-about-section" id="fom-about">
          <div className="fom-about-copy">
            <div className="fom-pill-tag purple">
              <span>VỀ MÌNH</span>
            </div>

            <h2 className="fom-about-heading">
              Mình hiện là {headline} và đang làm việc tự do tại {location}
            </h2>

            <p className="fom-about-desc">
              {bio ||
                'Nội dung văn bản, miêu tả công việc, kinh nghiệm làm việc và những thành tích thực tế đạt được trong suốt quá trình học tập và làm việc.'}
            </p>

            <div className="fom-about-actions">
              <a href={contactHref} className="fom-btn-solid-white">
                Đăng hồ sơ công việc của bạn tại đây
              </a>
            </div>
          </div>

          {/* Right: 45-deg Rotated Glass Diamond with CV Badge & Stars */}
          <div className="fom-about-visual">
            <FigmaStar3D size={48} rotate={18} className="fom-about-star s1" />
            <FigmaStar3D size={32} rotate={-28} className="fom-about-star s2" />
            <FigmaSparkle size={20} className="fom-about-sparkle sp1" />
            <FigmaSparkle size={16} className="fom-about-sparkle sp2" />

            <div className="fom-diamond-outer">
              <div className="fom-diamond-glow" />
              <div className="fom-diamond-content">
                <div className="fom-diamond-cv-badge">
                  <DownloadCvBadge resumeUrl={resumeUrl} onClick={handleDownloadCv} size={130} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. ACTIVITIES & STATS SECTION ("★ Kinh nghiệm hoạt động") ──────── */}
        <section className="fom-activities-section" id="fom-activities">
          <div className="fom-section-header left">
            <div className="fom-section-title-with-star">
              <span className="fom-star-icon">★</span>
              <h2 className="fom-section-h2">Kinh nghiệm hoạt động</h2>
            </div>
          </div>

          <div className="fom-activities-layout">
            {/* Left: 2-Column Milestones Grid (Học vấn, Dự án 1..5) */}
            <div className="fom-milestones-grid">
              {/* Item 1: Học vấn */}
              <div className="fom-milestone-card">
                <h4 className="fom-milestone-tag">Học vấn</h4>
                <h5 className="fom-milestone-title">{school}</h5>
                <p className="fom-milestone-meta">
                  Chuyên ngành: {major} · 2021 - 2025
                </p>
                <p className="fom-milestone-desc">
                  Tập trung nghiên cứu chuyên sâu về xây dựng thương hiệu, sáng tạo nội dung số và tối ưu hóa chuyển đổi.
                </p>
              </div>

              {/* Items 2+: Projects */}
              {displayProjects.slice(0, 5).map((exp, idx) => (
                <div className="fom-milestone-card" key={exp.id || idx}>
                  <h4 className="fom-milestone-tag">Dự án {idx + 1}</h4>
                  <h5 className="fom-milestone-title">{exp.title || 'Dự án thực tế'}</h5>
                  <p className="fom-milestone-meta">
                    {exp.role || 'Thành viên dự án'} · {exp.startDate || '10/2023'}
                    {exp.endDate ? ` - ${exp.endDate}` : ' - Hiện tại'}
                  </p>
                  <p className="fom-milestone-desc">
                    {exp.description || 'Tham gia xây dựng giải pháp, triển khai thực thi và tối ưu kết quả đo lường.'}
                  </p>
                </div>
              ))}
            </div>

            {/* Right: 3 Big Glass Stat Cards in Figma Node 10-132 */}
            <div className="fom-stats-column">
              <div className="fom-stat-card">
                <div className="fom-stat-number">
                  {Math.max(experiences.length || 0, 10)}
                  <span className="fom-stat-plus">+</span>
                </div>
                <div className="fom-stat-label">Dự án đã hoàn thành</div>
              </div>

              <div className="fom-stat-card">
                <div className="fom-stat-number">
                  5.0
                  <span className="fom-stat-plus">★</span>
                </div>
                <div className="fom-stat-label">Chỉ số tin cậy &amp; Đánh giá</div>
              </div>

              <div className="fom-stat-card">
                <div className="fom-stat-number">
                  {verifiedPct || 97}
                  <span className="fom-stat-plus">%</span>
                </div>
                <div className="fom-stat-label">Tỷ lệ hoàn thành &amp; Phản hồi tốt</div>
              </div>

              <div className="fom-stats-star-wrap">
                <FigmaStar3D size={58} rotate={18} className="fom-stats-star-large" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. SERVICES / SKILLS SECTION ("★ DỊCH VỤ CỦA TÔI") ──────────────── */}
        <section className="fom-services-section" id="fom-services">
          <div className="fom-section-header center">
            <div className="fom-pill-tag purple">
              <span>★ DỊCH VỤ CỦA TÔI</span>
            </div>
            <h2 className="fom-section-h2 large">Kỹ năng của mình</h2>
          </div>

          <div className="fom-services-grid">
            {displayServices.map((service, idx) => {
              const IconComp = service.icon;
              return (
                <div className="fom-service-card" key={idx}>
                  <div className="fom-service-icon-box">
                    <IconComp size={36} strokeWidth={1.8} />
                  </div>
                  <h3 className="fom-service-title">{service.title}</h3>
                  <p className="fom-service-desc">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 7. PORTFOLIO SHOWCASE SECTION ("PORTFOLIO") ────────────────────── */}
        <section className="fom-portfolio-intro-section" id="fom-portfolio">
          <div className="fom-section-header center">
            <div className="fom-pill-tag purple">
              <span>PORTFOLIO</span>
            </div>
            <h2 className="fom-section-h2 large">
              Đây là những dự án thuộc về chuyên ngành của mình
            </h2>
          </div>

          {/* 6-Card Overview Gallery Grid exactly matching Figma Node 10-132 */}
          <div className="fom-portfolio-gallery-grid">
            <FigmaStar3D size={42} rotate={-18} className="fom-gallery-star g1" />
            <FigmaSparkle size={20} className="fom-gallery-sparkle gsp1" />
            <FigmaSparkle size={16} className="fom-gallery-sparkle gsp2" />

            {displayProjects.slice(0, 6).map((project, idx) => {
              const borderStyle = GALLERY_BORDER_COLORS[idx % GALLERY_BORDER_COLORS.length];
              const shot = Array.isArray(project.proofImages) && project.proofImages[0] ? project.proofImages[0] : null;

              return (
                <a
                  key={project.id || idx}
                  href={`#fom-project-${idx + 1}`}
                  className={`fom-gallery-card fom-gallery-${borderStyle.tag}`}
                  style={{
                    borderColor: borderStyle.border,
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px ${borderStyle.glow}`,
                  }}
                  title={`Xem chi tiết Dự án ${idx + 1}: ${project.title}`}
                >
                  <div className="fom-gallery-card-preview">
                    {shot ? (
                      <img src={shot} alt={project.title} className="fom-gallery-img" />
                    ) : (
                      <div className="fom-gallery-mockup-screen">
                        <div className="fom-gallery-mockup-header">
                          <span className="fom-dot red" />
                          <span className="fom-dot yellow" />
                          <span className="fom-dot green" />
                          <span className="fom-gallery-url">nextplease.me/case-{idx + 1}</span>
                        </div>
                        <div className="fom-gallery-screen-body">
                          <span className="fom-gallery-screen-badge">PROJECT {idx + 1}</span>
                          <h4 className="fom-gallery-screen-name">{project.title}</h4>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="fom-gallery-card-footer">
                    <div className="fom-gallery-card-meta">
                      <span className="fom-gallery-card-tag">Dự án {idx + 1}</span>
                      <h4 className="fom-gallery-card-title">{project.title}</h4>
                      <p className="fom-gallery-card-role">{project.role || project.organization}</p>
                    </div>
                    <div className="fom-gallery-arrow-disc" style={{ background: borderStyle.border }}>
                      <ArrowRight size={18} color="#130924" strokeWidth={2.5} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </div>

      {/* Signature Marquee Divider before deep projects */}
      <div className="fom-marquee-stack gallery-divider">
        <SignatureMarquee items={skills} />
      </div>

      {/* ── 8. DEEP PROJECT SHOWCASES (WITH MARQUEE DIVIDERS) ──────────────── */}
      <div className="fom-project-showcases">
        {displayProjects.map((project, idx) => {
          const auraClass = PROJECT_THEMES[idx % PROJECT_THEMES.length];
          return (
            <div key={project.id || idx} className="fom-showcase-wrapper" id={`fom-project-${idx + 1}`}>
              <div className={`fom-showcase-container ${auraClass}`}>
                <div className="fom-shell">
                  <div className="fom-showcase-inner">
                    {/* Floating Stars around project */}
                    <FigmaStar3D size={44} rotate={-16} className="fom-project-star p-s1" />
                    <FigmaStar3D size={28} rotate={25} className="fom-project-star p-s2" />

                    {/* Top Row: Info Copy + Browser Mockup */}
                    <div className="fom-project-hero-row">
                      <div className="fom-project-copy-side">
                        <div className="fom-pill-tag purple">
                          <span>PORTFOLIO</span>
                        </div>
                        <h3 className="fom-project-num-title">Dự án {idx + 1}</h3>
                        <h4 className="fom-project-sub-title">{project.title}</h4>
                        <p className="fom-project-main-desc">
                          {project.description ||
                            'Mô tả về dự án: Thiết kế và triển khai giải pháp sáng tạo, mang đến giao diện trực quan và trải nghiệm người dùng mượt mà, đạt hiệu quả tối ưu trong từng mục tiêu chiến dịch.'}
                        </p>
                      </div>

                      <div className="fom-project-mockup-side">
                        <ProjectBrowserMockup project={project} index={idx} onZoom={(src, title) => setPreview({ src, fileName: title })} />
                      </div>
                    </div>

                    {/* Bottom Row: 3 Glass Info Cards */}
                    <div className="fom-project-info-cards-row">
                      <div className="fom-project-info-card">
                        <h5 className="fom-info-card-title">Vị trí trong dự án</h5>
                        <p className="fom-info-card-text">
                          {project.role || project.organization || 'Thành viên cốt lõi / UI-UX'}
                        </p>
                      </div>

                      <div className="fom-project-info-card">
                        <h5 className="fom-info-card-title">Thời gian thực hiện</h5>
                        <p className="fom-info-card-text">
                          {project.startDate || '10/2023'}
                          {project.endDate ? ` - ${project.endDate}` : ' - Hiện tại'}
                        </p>
                      </div>

                      <div className="fom-project-info-card">
                        <h5 className="fom-info-card-title">Lượt tương tác</h5>
                        <p className="fom-info-card-text">
                          {project.verified ? (
                            <span className="fom-verified-badge-inline">
                              <BadgeCheck size={16} /> Đã xác thực
                            </span>
                          ) : (
                            'Nội dung của bạn tại đây nha!'
                          )}
                        </p>
                        {project.proofLink && (
                          <a
                            href={/^https?:/.test(project.proofLink) ? project.proofLink : `https://${project.proofLink}`}
                            target="_blank"
                            rel="noreferrer"
                            className="fom-proof-link"
                          >
                            Xem minh chứng <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Marquee Ticker between each project */}
              <SignatureMarquee items={skills} />
            </div>
          );
        })}
      </div>

      {/* ── 9. CREDENTIALS / BẰNG CẤP NẾU CÓ ───────────────────────────────── */}
      {credentials.length > 0 && (
        <div className="fom-shell">
          <section className="fom-credentials-section">
            <div className="fom-section-header center">
              <div className="fom-pill-tag purple">
                <span>CHỨNG CHỈ</span>
              </div>
              <h2 className="fom-section-h2 large">Bằng cấp &amp; Chứng nhận</h2>
            </div>

            <div className="fom-credentials-grid">
              {credentials.map((cred, i) => (
                <div className="fom-credential-card" key={cred.id || i}>
                  <div className="fom-credential-icon">
                    <Award size={36} />
                  </div>
                  <h4 className="fom-credential-name">{cred.name}</h4>
                  <p className="fom-credential-meta">
                    {cred.issuer || 'Tổ chức cấp'}
                    {cred.issuedAt ? ` · ${cred.issuedAt}` : ''}
                  </p>
                  {cred.fileData && (
                    <button
                      type="button"
                      className="fom-btn-glass-ghost sm"
                      onClick={() => setPreview({ src: cred.fileData, fileName: cred.name })}
                    >
                      Xem file chứng nhận
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── 10. CONTACT & FOOTER SECTION ("LIÊN HỆ") ───────────────────────── */}
      <div className="fom-shell">
        <footer className="fom-contact-section" id="fom-contact">
          <div className="fom-contact-layout">
            {/* Left Column: Contact Copy & Actions */}
            <div className="fom-contact-left-col">
              <div className="fom-pill-tag purple">
                <span>LIÊN HỆ</span>
              </div>
              <h2 className="fom-contact-h2">
                Hãy cùng kết nối và tạo nên những dự án tuyệt vời!
              </h2>
              <p className="fom-contact-subtitle">
                Sẵn sàng trao đổi về cơ hội làm việc, dự án freelance hoặc hợp tác phát triển sản phẩm.
              </p>

              <div className="fom-contact-channels">
                {email && (
                  <a href={`mailto:${email}`} className="fom-contact-pill">
                    <Mail size={18} />
                    <span>{email}</span>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="fom-contact-pill">
                    <Phone size={18} />
                    <span>{phone}</span>
                  </a>
                )}
                {linkedin && (
                  <a
                    href={`https://linkedin.com/in/${linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="fom-contact-pill"
                  >
                    <LinkedInIcon size={18} />
                    <span>LinkedIn</span>
                  </a>
                )}
                <button
                  type="button"
                  className="fom-contact-pill cv-btn"
                  onClick={handleDownloadCv}
                >
                  <span>Tải CV của mình</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: Glowing Portrait matching Hero (Figma Node 10-132) */}
            <div className="fom-contact-right-col">
              <div className="fom-footer-portrait-box">
                <FigmaStar3D size={44} rotate={20} className="fom-footer-star f-s1" />
                <FigmaStar3D size={28} rotate={-16} className="fom-footer-star f-s2" />
                <FigmaSparkle size={18} className="fom-footer-sparkle f-sp1" />

                <div className="fom-footer-halo-ring">
                  {/* Wavy Doodle Contour Lines */}
                  <svg
                    viewBox="0 0 400 400"
                    className="fom-portrait-doodles"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.72)"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M 40,240 C 90,160 110,130 150,150 C 190,170 210,240 260,210 C 300,180 320,130 360,160" />
                    <path d="M 60,270 C 110,190 130,160 170,180 C 210,200 230,270 280,240 C 320,210 340,160 380,190" />
                    <path d="M 20,210 C 70,130 90,100 130,120 C 170,140 190,210 240,180 C 280,150 300,100 340,130" />
                  </svg>

                  <div className="fom-footer-img-box">
                    {avatar.portraitUrl ? (
                      <img
                        src={avatar.portraitUrl}
                        alt={`Ảnh của ${name}`}
                        className="fom-footer-portrait-img"
                      />
                    ) : (
                      <div className="fom-footer-mascot-wrap">
                        <PortfolioMascot avatar={avatar} size={220} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature "THANKS FOR WATCHING!" Banner (Figma Node 10-132) */}
          <div className="fom-thanks-banner-wrap">
            <FigmaStar3D size={44} rotate={-18} className="fom-thanks-star t1" />
            <FigmaStar3D size={32} rotate={22} className="fom-thanks-star t2" />
            <FigmaSparkle size={20} className="fom-thanks-sparkle tsp1" />
            <FigmaSparkle size={16} className="fom-thanks-sparkle tsp2" />

            <div className="fom-thanks-banner">
              <h3 className="fom-thanks-text">THANKS FOR WATCHING!</h3>
            </div>
          </div>

          <div className="fom-bottom-legal">
            <p>© {new Date().getFullYear()} {name} · Thiết kế Portfolio Tím Aura Neon · fonlio</p>
          </div>
        </footer>
      </div>

      {/* Image / Proof Zoom Modal */}
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
