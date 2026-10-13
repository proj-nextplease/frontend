import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, BadgeCheck, ChevronDown,
  Copy, ShieldCheck, Sparkles, Star,
  Trophy, Users, Zap, RefreshCw, Menu, X, Phone, Mail, MapPin,
  MailCheck, Award, Eye, CreditCard, CheckCheck, Clock,
} from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { NeonBloom } from '../components/NeonBloom.jsx';
import { PartnerLogos } from '../components/PartnerLogos.jsx';
import { BrandWordmark } from '../components/BrandWordmark.jsx';
import { EnvelopeArt } from '../components/EnvelopeArt.jsx';
import { Waitlist3DScene } from '../components/Waitlist3DScene.jsx';
import { HoloVIPCard } from '../components/HoloVIPCard.jsx';
import { getWaitlistCount, joinWaitlist } from '../api/waitlistApi.js';

/* Bảng màu neon chuẩn dùng chung theo HomePage & neonPalette.js */
import {
  INK, SURFACE, SURFACE_HI, HAIRLINE,
  EMERALD, EMERALD_BRIGHT, NEON_RGB, TEAL_ACCENT,
  ON_DARK, MUTED, GLOW_SM, GLOW_MD, GLOW_LG,
} from '../styles/neonPalette.js';

/* ──────────────────────────────────────────────────────────────────────────
   DỮ LIỆU CỐT LÕI CHO TRANG WAITLIST HỌC HỎI TỪ FIGMA COMMUNITY & SAAS ELITE
   ────────────────────────────────────────────────────────────────────────── */

const LAUNCH_TARGET = new Date('2026-11-15T00:00:00Z').getTime();

const QUICK_ROLES = [
  { id: 'student', label: 'Sinh viên năng nổ', specialization: 'Đang khám phá định hướng', stage: 'Sinh viên năm 1 – 2' },
  { id: 'design', label: 'Design / Creative', specialization: 'Design / UI/UX / Video Creative', stage: 'Sinh viên năm 3 – 4' },
  { id: 'marketing', label: 'Marketing / PR', specialization: 'Marketing / Truyền thông / PR', stage: 'Sinh viên năm 3 – 4' },
  { id: 'tech', label: 'Lập trình / Tech', specialization: 'Công nghệ thông tin / Lập trình', stage: 'Mới tốt nghiệp / Đang tìm việc' },
  { id: 'club', label: 'Quản lý CLB / Event', specialization: 'Sự kiện / Quản lý CLB / Activation', stage: 'Sinh viên năm 1 – 2' },
];

const COMPARISONS = [
  {
    feature: 'Cách tiếp cận năng lực',
    traditional: 'Tự khai kỹ năng 5 sao trong CV giấy, thiếu cơ chế xác minh.',
    fonlio: 'Đính kèm sản phẩm thực tế và tỷ lệ đóng góp minh bạch từng dự án.',
  },
  {
    feature: 'Lưu trữ & Hệ thống',
    traditional: 'File nằm rải rác trong Drive, Canva, link bài Facebook thất lạc.',
    fonlio: 'Gom toàn bộ vào một Living Vault với đường link duy nhất fonlio.me/@ban.',
  },
  {
    feature: 'Độ tin cậy với Recruiter',
    traditional: 'Nhà tuyển dụng chỉ lướt 6 giây và luôn hoài nghi chữ tự viết.',
    fonlio: 'Verified Proof of Work: Mentor, Leader trực tiếp đóng dấu bảo chứng.',
  },
  {
    feature: 'Đánh giá làm việc nhóm',
    traditional: 'Cả nhóm chung tên báo cáo, không rõ ai gánh team ai hỗ trợ.',
    fonlio: 'Phân tách vai trò rõ ràng: Trưởng nhóm, Thiết kế, Nghiên cứu số liệu.',
  },
  {
    feature: 'Giá trị dài hạn',
    traditional: 'Mỗi lần ứng tuyển là một lần sửa lại file PDF từ đầu.',
    fonlio: 'Tích lũy Reputation Score và huy hiệu danh tín nghề nghiệp vĩnh viễn.',
  },
];

const BENTO_PROJECTS = {
  marketing: {
    title: 'Chiến dịch Activation Tân Sinh Viên 2025',
    metric: 'Đạt 12.000 tiếp cận · 850 lượt đăng ký',
    tags: ['Chiến dịch thực tế', 'Báo cáo số liệu', 'Content & Thiết kế'],
    verifiedBy: 'Chủ nhiệm CLB Truyền thông',
  },
  design: {
    title: 'Hệ thống Thiết kế UI/UX Ứng dụng EduMatch',
    metric: '32 màn hình hoàn chỉnh · Figma Prototype 100%',
    tags: ['Figma link', 'User Research', 'Design System'],
    verifiedBy: 'Mentor Đồ án Tốt nghiệp',
  },
  tech: {
    title: 'Nền tảng Quản lý Điểm danh CLB qua QR Code',
    metric: '1.200 lượt quét/tháng · 99.8% Uptime',
    tags: ['GitHub Repo', 'Live Demo', 'PostgreSQL'],
    verifiedBy: 'Trưởng ban Kỹ thuật CLB IT',
  },
  club: {
    title: 'Đêm nhạc Gây quỹ Hơi Ấm Mùa Đông 2024',
    metric: 'Gây quỹ 45.000.000đ · 600 khán giả',
    tags: ['Kế hoạch tổng thể', 'Hợp đồng tài trợ', 'Album ảnh'],
    verifiedBy: 'Đại diện Đoàn trường',
  },
};

const STEPS = [
  {
    step: '01',
    keyword: 'Khởi tạo',
    title: 'Tạo Living Bio cá nhân',
    body: 'Định hình danh tính nghề nghiệp chỉ trong 3 phút với đường dẫn riêng mang tên bạn.',
    tag: '3 phút khởi tạo',
  },
  {
    step: '02',
    keyword: 'Gom nhặt',
    title: 'Gom dự án & sản phẩm thật',
    body: 'Kéo thả sản phẩm, slide thuyết trình, repo code và ghi rõ tỷ lệ đóng góp của bạn.',
    tag: 'Không cần đợi CV giấy',
  },
  {
    step: '03',
    keyword: 'Bảo chứng',
    title: 'Gắn bằng chứng & Xác thực',
    body: 'Mời Mentor, Trưởng nhóm hoặc người giao việc đóng dấu xác nhận vai trò thực tế.',
    tag: 'Minh bạch 100%',
  },
  {
    step: '04',
    keyword: 'Bứt phá',
    title: 'Chia sẻ & Mở lối cơ hội',
    body: 'Gửi 1 đường link cho nhà tuyển dụng để nổi bật tuyệt đối giữa hàng trăm CV truyền thống.',
    tag: 'Chuẩn Recruiter',
  },
];

const PERKS_LIST = [
  {
    icon: <Zap size={22} />,
    title: 'Quyền trải nghiệm MVP đầu tiên (Genesis Batch)',
    desc: 'Cấp quyền truy cập sớm nhất phiên bản Fonlio thử nghiệm ngay khi đợt mở cổng bắt đầu.',
  },
  {
    icon: <Trophy size={22} />,
    title: 'Huy hiệu Founding Member vĩnh viễn',
    desc: 'Được gắn huy hiệu người tiên phong trên hồ sơ cùng điểm uy tín Reputation Score khởi điểm.',
  },
  {
    icon: <Star size={22} />,
    title: 'Tặng trọn đời gói VIP Fonlio cho Top 10',
    desc: '10 bạn đăng ký sớm nhất nhận bản tài khoản cao cấp nhất của Fonlio cùng quà tặng đối tác.',
  },
  {
    icon: <Users size={22} />,
    title: 'Ưu tiên kết nối Nhà tuyển dụng & Đối tác',
    desc: 'Hồ sơ của bạn được đưa vào danh sách đề xuất ưu tiên cho các doanh nghiệp trong mạng lưới.',
  },
];

const FAQS = [
  {
    q: 'FONLIO khác gì so với Canva, Notion hay CV PDF thông thường?',
    a: 'Canva và CV PDF chỉ là các tài liệu chữ tĩnh, tự đánh bóng kỹ năng và không ai kiểm chứng. Notion thì tốn nhiều công sức định dạng và không chuẩn gu nhà tuyển dụng. FONLIO là Living Portfolio chuẩn hóa, cho phép đính kèm sản phẩm thực tế kèm cơ chế bảo chứng (Verified Proof) trực tiếp từ Mentor và Leader của bạn.',
  },
  {
    q: 'Mình là sinh viên năm nhất/năm hai chưa có kinh nghiệm thì có dùng được không?',
    a: 'Hoàn toàn phù hợp! FONLIO được sinh ra dành riêng cho người trẻ năng nổ. Bất kỳ hoạt động nào bạn từng tham gia — như chạy sự kiện CLB, bài tiểu luận nghiên cứu, thiết kế banner hay dự án bài tập lớn — đều có thể đưa vào để xây dựng hồ sơ sớm trước mùa thực tập.',
  },
  {
    q: 'Cơ chế xác thực (Proof Verification) hoạt động thế nào?',
    a: 'Khi thêm một dự án, bạn có thể mời người liên quan (ví dụ: Trưởng ban CLB, Giảng viên hướng dẫn, hoặc Đồng nghiệp) xác nhận vai trò và công sức của bạn qua email. Khi họ đồng ý, dự án sẽ có huy hiệu Verified Proof of Work giúp tăng uy tín gấp 3 lần.',
  },
  {
    q: 'Đăng ký danh sách chờ (Waitlist) có mất phí không?',
    a: 'Hoàn toàn miễn phí 100%. Tham gia sớm giúp bạn giữ chỗ thứ hạng ưu tiên, nhận huy hiệu Founding Member và có cơ hội nhận gói VIP trọn đời cho Top 10.',
  },
  {
    q: 'Khi nào FONLIO sẽ mở cửa phiên bản thử nghiệm MVP?',
    a: 'Chúng mình đang hoàn thiện những khâu cuối cùng và sẽ gửi email thư mời trải nghiệm cho các bạn trong danh sách chờ theo từng đợt đăng ký sớm nhất.',
  },
];

const CAREER_STAGES = [
  'Sinh viên năm 1 – 2',
  'Sinh viên năm 3 – 4',
  'Mới tốt nghiệp / Đang tìm việc',
  'Freelancer / Người làm tự do',
  'Người đi làm (1 – 3 năm kinh nghiệm)',
];

const SPECIALIZATIONS = [
  'Marketing / Truyền thông / PR',
  'Design / UI/UX / Video Creative',
  'Công nghệ thông tin / Lập trình',
  'Sự kiện / Quản lý CLB / Activation',
  'Content / Copywriting',
  'Kinh doanh / Sales / Tài chính',
  'Giáo dục / Nhân sự / Ngoại ngữ',
  'Đang khám phá định hướng',
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  careerStage: 'Sinh viên năm 1 – 2',
  specialization: 'Marketing / Truyền thông / PR',
  projectCount: '1 – 3 dự án / hoạt động',
  mainChallenge: 'Kinh nghiệm và sản phẩm nằm rải rác nhiều nơi',
  betaInterest: 'Muốn tham gia thử nghiệm và góp ý tính năng MVP',
  emailConsent: true,
  botField: '',
};

/* Deterministic Countdown Hook */
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(0, targetDate - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, targetDate - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

/* Scroll Reveal Helper */
function Reveal({ children, delay = 0, y = 24, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* 3D Mouse Tilt Physics Component */
function TiltCard({ children, maxTilt = 10, className = '', style = {}, glare = true, ...props }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [dynamicShadow, setDynamicShadow] = useState('0 14px 34px -10px rgba(0, 0, 0, 0.7)');

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
    const sX = (-rotateY * 1.6).toFixed(1);
    const sY = (rotateX * 1.6 + 18).toFixed(1);
    setDynamicShadow(`${sX}px ${sY}px 38px -8px rgba(0, 0, 0, 0.85), 0 0 24px rgba(185, 255, 0, 0.12)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
    setDynamicShadow('0 14px 34px -10px rgba(0, 0, 0, 0.7)');
  };

  return (
    <div
      ref={cardRef}
      className={`wl-tilt-wrap ${className}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.18s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease',
        boxShadow: dynamicShadow,
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      {children}
      {glare && (
        <div
          className="wl-tilt-glare"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(185, 255, 0, 0.35) 0%, rgba(45, 212, 191, 0.14) 36%, transparent 70%)`,
            opacity: glarePos.opacity,
            transition: 'opacity 0.25s ease-out',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}

/* Deterministic Confetti particles */
const CELEBRATION_PARTICLES = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  x: ((i * 19 + 7) % 100).toFixed(1),
  scale: (0.65 + ((i * 7) % 6) * 0.07).toFixed(2),
  rot: (i * 47) % 360,
  color: ['#b9ff00', '#d2ff4d', '#2dd4bf', '#ffffff', '#67e8f9'][i % 5],
  delay: (((i * 9) % 8) * 0.05).toFixed(2),
  duration: (1.6 + ((i * 11) % 7) * 0.14).toFixed(2),
}));

function CelebrationParticles() {
  return (
    <div className="wl-particles" aria-hidden="true">
      {CELEBRATION_PARTICLES.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            transform: `scale(${p.scale}) rotate(${p.rot}deg)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Brand Wordmark Logo Link */
function FonlioBrandLogo({ size = '42px', ...props }) {
  return (
    <a href="#top" className="wl-brand-logo" aria-label="fonlio — về đầu trang" {...props}>
      <BrandWordmark size={size} glow />
    </a>
  );
}

export function WaitlistPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [serverError, setServerError] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [ticketCode, setTicketCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [heroView, setHeroView] = useState('vip'); // 'vip' | 'envelope' | 'portfolio'
  const [showFloatBtn, setShowFloatBtn] = useState(false);
  const [selectedQuickRole, setSelectedQuickRole] = useState(QUICK_ROLES[0].id);

  // Bento Interactive States
  const [bentoCategory, setBentoCategory] = useState('marketing');
  const [stamped, setStamped] = useState(false);

  const countdown = useCountdown(LAUNCH_TARGET);
  const successRef = useRef(null);

  // Fetch live count
  useEffect(() => {
    let alive = true;
    getWaitlistCount()
      .then((cnt) => {
        if (alive && typeof cnt === 'number' && cnt > 0) {
          setWaitlistCount(cnt);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Sticky header background transition & floating button on scroll
  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 24);
      setShowFloatBtn(window.scrollY > 480);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto focus on success
  useEffect(() => {
    if (status === 'done') {
      successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      successRef.current?.focus();
    }
  }, [status]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: '' } : current));
  }

  function handleQuickRoleSelect(role) {
    setSelectedQuickRole(role.id);
    update('specialization', role.specialization);
    update('careerStage', role.stage);
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Vui lòng điền họ và tên của bạn.';
    if (!form.email.trim()) {
      next.email = 'Vui lòng cung cấp địa chỉ email.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) {
      next.email = 'Email chưa đúng định dạng (ví dụ: ban@domain.com).';
    }
    return next;
  }

  async function handleSubmit(event) {
    if (event) event.preventDefault();
    if (status === 'sending') return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      const target = document.getElementById(`wl-${firstKey}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus();
      return;
    }

    setStatus('sending');
    setServerError('');
    try {
      await joinWaitlist({ ...form, source: 'waitlist-genesis' });
      setTicketCode(`#WL-${Math.floor(1000 + Math.random() * 9000)}`);
      setStatus('done');
      setWaitlistCount((prev) => (prev ? prev + 1 : 1285));
    } catch (err) {
      setStatus('idle');
      setServerError(err?.message || 'Không gửi được đăng ký. Bạn thử lại giúp mình nhé.');
    }
  }

  function copyShareUrl() {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://nextplease.vn/waitlist';
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  }

  const displayCount = waitlistCount ? (waitlistCount + 1280).toLocaleString('vi-VN') : '1,280+';
  const currentQuickRoleObj = QUICK_ROLES.find((r) => r.id === selectedQuickRole) || QUICK_ROLES[0];

  return (
    <div className="wl np-neon" id="top">
      {/* Ambient Dynamic Neon Bloom */}
      <NeonBloom />

      {/* ── HEADER RIÊNG BIỆT DÀNH CHO WAITLIST (KHÔNG TRỎ VỀ HOMEPAGE) ── */}
      <header className={`wl-custom-header ${headerScrolled ? 'is-scrolled' : ''}`}>
        <div className="wl-inner wl-header-inner">
          <FonlioBrandLogo />

          {/* Desktop Nav */}
          <nav className="wl-header-nav" aria-label="Điều hướng chính Waitlist">
            <a href="#ve-fonlio" className="wl-nav-link">Về FONLIO</a>
            <a href="#so-sanh" className="wl-nav-link">So sánh CV</a>
            <a href="#tinh-nang" className="wl-nav-link">Tính năng</a>
            <a href="#lo-trinh" className="wl-nav-link">Lộ trình</a>
            <a href="#dac-quyen" className="wl-nav-link">Đặc quyền VIP</a>
            <a href="#faq" className="wl-nav-link">FAQ</a>
            <a href="#dang-ky" className="wl-btn wl-btn-primary wl-btn-sm">
              Khắc Thẻ VIP ➔
            </a>
          </nav>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="wl-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="wl-mobile-drawer">
            <nav className="wl-mobile-nav">
              <a href="#ve-fonlio" onClick={() => setMobileMenuOpen(false)}>Về FONLIO</a>
              <a href="#so-sanh" onClick={() => setMobileMenuOpen(false)}>So sánh với CV cũ</a>
              <a href="#tinh-nang" onClick={() => setMobileMenuOpen(false)}>Tính năng nổi bật</a>
              <a href="#lo-trinh" onClick={() => setMobileMenuOpen(false)}>4 bước bứt phá</a>
              <a href="#dac-quyen" onClick={() => setMobileMenuOpen(false)}>Đặc quyền Top 10</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#dang-ky" className="wl-btn wl-btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ width: '100%', marginTop: 8 }}>
                Tham gia danh sách chờ <ArrowRight size={18} />
              </a>
            </nav>
          </div>
        )}
      </header>

      <style>{`
        /* ── ROOT THEMING & FONTS ────────────────────────────────────────── */
        .wl {
          background-color: ${INK};
          color: ${ON_DARK};
          font-family: 'Be Vietnam Pro', 'Inter', ui-sans-serif, system-ui, sans-serif;
          letter-spacing: -0.015em;
          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          position: relative;
        }

        :root:has(.wl), body:has(.wl) {
          background: ${INK} !important;
          scroll-behavior: smooth;
        }

        .wl :focus-visible {
          outline: 2px solid ${EMERALD};
          outline-offset: 3px;
          border-radius: 8px;
        }

        .wl-inner {
          width: min(1200px, calc(100% - 44px));
          margin-inline: auto;
          position: relative;
          z-index: 2;
        }

        .wl-band {
          padding-block: clamp(70px, 9vw, 120px);
          position: relative;
          scroll-margin-top: 88px;
        }

        /* ── HEADER RIÊNG (WAITLIST STANDALONE HEADER) ───────────────────── */
        .wl-custom-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 80;
          padding-block: 18px;
          transition: background-color 300ms ease, backdrop-filter 300ms ease, box-shadow 300ms ease, padding 300ms ease;
        }
        .wl-custom-header.is-scrolled {
          background-color: rgba(7, 10, 15, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
          padding-block: 12px;
        }
        .wl-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .wl-brand-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          line-height: 0;
          transition: transform 200ms ease;
        }
        .wl-brand-logo:hover {
          transform: translateY(-1px);
        }
        .wl-header-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .wl-nav-link {
          font-size: 0.94rem;
          font-weight: 600;
          color: ${MUTED};
          text-decoration: none;
          transition: color 180ms ease, text-shadow 180ms ease;
        }
        .wl-nav-link:hover {
          color: ${EMERALD};
          text-shadow: ${GLOW_SM};
        }
        .wl-menu-toggle {
          display: none;
          background: transparent;
          border: 1px solid ${HAIRLINE};
          color: ${ON_DARK};
          padding: 8px;
          border-radius: 12px;
          cursor: pointer;
        }
        .wl-mobile-drawer {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(10, 14, 20, 0.98);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          animation: npDrawerIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes npDrawerIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wl-mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .wl-mobile-nav a {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${ON_DARK};
          text-decoration: none;
          padding-block: 6px;
        }

        /* ── TYPOGRAPHY ──────────────────────────────────────────────────── */
        .wl-display {
          font-family: 'Archivo', 'Be Vietnam Pro', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-weight: 900;
          text-transform: uppercase;
          line-height: 0.98;
          letter-spacing: -0.03em;
          font-size: clamp(2.8rem, 6.4vw, 5.2rem);
          color: ${ON_DARK};
          margin: 0;
        }
        .wl-display em {
          font-style: normal;
          color: ${EMERALD};
          text-shadow: ${GLOW_MD};
        }

        .wl-section-title {
          font-family: inherit;
          font-size: clamp(2rem, 3.8vw, 2.75rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: ${ON_DARK};
          margin: 0 0 16px;
        }
        .wl-section-title em {
          font-style: normal;
          color: ${EMERALD};
          text-shadow: ${GLOW_SM};
        }

        .wl-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${EMERALD};
          margin-bottom: 16px;
          text-shadow: ${GLOW_SM};
        }
        .wl-eyebrow::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: ${EMERALD};
          box-shadow: 0 0 10px ${EMERALD};
          flex: none;
        }

        .wl-lead {
          font-size: 1.14rem;
          line-height: 1.62;
          color: ${MUTED};
          margin: 0 0 32px;
          max-width: 64ch;
        }

        /* ── BUTTONS ─────────────────────────────────────────────────────── */
        .wl-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 999px;
          padding: 15px 30px;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 200ms ease, border-color 200ms ease, box-shadow 240ms ease, transform 200ms ease;
          position: relative;
          overflow: hidden;
        }
        .wl-btn-sm {
          padding: 10px 22px;
          font-size: 0.88rem;
        }
        .wl-btn-primary {
          background: ${EMERALD};
          color: ${INK};
          box-shadow: ${GLOW_SM};
        }
        .wl-btn-primary:hover {
          background: ${EMERALD_BRIGHT};
          box-shadow: ${GLOW_LG};
          transform: translateY(-2px);
        }

        /* ── HERO SECTION ────────────────────────────────────────────────── */
        .wl-hero {
          position: relative;
          overflow: hidden;
          padding-top: clamp(125px, 14vw, 175px);
          padding-bottom: clamp(64px, 8vw, 100px);
          scroll-margin-top: 80px;
        }
        .wl-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.05fr);
          gap: clamp(36px, 5vw, 68px);
          align-items: center;
        }
        .wl-hero-copy {
          text-align: left;
        }

        /* Live Pill */
        .wl-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 600;
          background: rgba(15, 19, 24, 0.8);
          border: 1px solid ${HAIRLINE};
          color: ${MUTED};
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(12px);
        }
        .wl-pulse-dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: ${EMERALD};
        }
        .wl-pulse-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 999px;
          background: ${EMERALD};
          opacity: 0.7;
          animation: npPulseRing 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
        @keyframes npPulseRing {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .wl-live-pill b {
          color: ${EMERALD};
          font-weight: 700;
        }

        /* Social Proof Avatar Cluster (Figma Inspired) */
        .wl-social-proof {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 24px;
        }
        .wl-avatar-cluster {
          display: flex;
          align-items: center;
        }
        .wl-avatar-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 2px solid ${INK};
          margin-left: -10px;
          display: grid;
          place-items: center;
          font-size: 0.72rem;
          font-weight: 800;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .wl-avatar-circle:first-child {
          margin-left: 0;
        }
        .wl-proof-text {
          font-size: 0.88rem;
          color: ${MUTED};
          line-height: 1.4;
        }
        .wl-proof-text b {
          color: ${ON_DARK};
        }

        /* Hero Quick-Mint Box */
        .wl-quick-mint-box {
          margin-top: 28px;
          padding: 24px;
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(15, 19, 24, 0.92) 0%, rgba(10, 14, 20, 0.98) 100%);
          border: 1.5px solid rgba(185, 255, 0, 0.32);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(${NEON_RGB}, 0.12);
        }
        .wl-quick-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
        }
        .wl-role-chip {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid ${HAIRLINE};
          background: rgba(255, 255, 255, 0.04);
          color: ${MUTED};
          transition: all 180ms ease;
        }
        .wl-role-chip:hover {
          border-color: ${EMERALD};
          color: ${ON_DARK};
        }
        .wl-role-chip.on {
          background: ${EMERALD};
          color: ${INK};
          border-color: ${EMERALD};
          font-weight: 800;
          box-shadow: ${GLOW_SM};
        }
        .wl-quick-inputs {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
        }
        .wl-quick-input {
          box-sizing: border-box;
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid ${HAIRLINE};
          background: #080b0f;
          color: ${ON_DARK};
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .wl-quick-input:focus {
          border-color: ${EMERALD};
          box-shadow: 0 0 0 2px rgba(${NEON_RGB}, 0.25);
        }

        /* ── 3D HERO STAGE ───────────────────────────────────────────────── */
        .wl-hero-stage-wrap {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .wl-stage-switcher {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px;
          border-radius: 999px;
          background: rgba(15, 19, 24, 0.85);
          border: 1px solid ${HAIRLINE};
          margin-bottom: 22px;
          z-index: 5;
          backdrop-filter: blur(12px);
        }
        .wl-stage-tab {
          padding: 7px 16px;
          border-radius: 999px;
          border: 0;
          background: transparent;
          color: ${MUTED};
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
        }
        .wl-stage-tab.on {
          background: ${EMERALD};
          color: ${INK};
          font-weight: 800;
          box-shadow: ${GLOW_SM};
        }
        .wl-stage-tab:not(.on):hover {
          color: ${ON_DARK};
          background: rgba(255, 255, 255, 0.06);
        }

        /* 3D Envelope Container */
        .wl-envelope-stage-tilt {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .wl-envelope-stage {
          width: 100%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .wl-stage-badge {
          position: absolute;
          padding: 8px 16px;
          border-radius: 999px;
          background: ${SURFACE_HI};
          border: 1px solid rgba(185, 255, 0, 0.35);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(${NEON_RGB}, 0.22);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          color: ${ON_DARK};
          z-index: 6;
          animation: npFloatBadge 5s ease-in-out infinite alternate;
        }
        .wl-badge-pos-1 { top: -10px; left: -10px; animation-delay: 0s; }
        .wl-badge-pos-2 { bottom: 10px; right: -10px; animation-delay: -2.5s; }
        @keyframes npFloatBadge {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-10px) rotate(1deg); }
        }

        /* ── MOCKUP GIAO DIỆN PORTFOLIO 3D ────────────────────────────────── */
        .wl-mock-shell {
          position: relative;
          width: 100%;
          max-width: 480px;
          margin-inline: auto;
        }
        .wl-mock-card {
          border-radius: 26px;
          background: linear-gradient(152deg, #121820 0%, #0a0d12 100%);
          border: 1.5px solid rgba(185, 255, 0, 0.28);
          box-shadow: 0 28px 70px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(${NEON_RGB}, 0.12);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .wl-mock-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 18px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
          margin-bottom: 18px;
          transform: translateZ(24px);
        }
        .wl-mock-avatar {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          background: linear-gradient(135deg, ${EMERALD} 0%, #0d9488 100%);
          color: ${INK};
          font-weight: 800;
          font-size: 1.1rem;
          display: grid;
          place-items: center;
          flex: none;
          box-shadow: 0 0 16px rgba(${NEON_RGB}, 0.4);
        }
        .wl-mock-info b {
          display: block;
          font-size: 1.05rem;
          color: ${ON_DARK};
          font-weight: 700;
        }
        .wl-mock-info small {
          font-size: 0.82rem;
          color: ${MUTED};
        }
        .wl-mock-projects {
          display: grid;
          gap: 12px;
          transform: translateZ(18px);
        }
        .wl-mock-item {
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: background-color 200ms ease, border-color 200ms ease, transform 200ms ease;
        }
        .wl-mock-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(185, 255, 0, 0.35);
          transform: translateZ(28px) scale(1.02);
        }
        .wl-mock-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        }
        .wl-mock-row h4 {
          margin: 0 0 3px;
          font-size: 0.95rem;
          font-weight: 700;
          color: ${ON_DARK};
        }
        .wl-mock-row p {
          margin: 0;
          font-size: 0.8rem;
          color: ${MUTED};
        }
        .wl-mock-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          flex: none;
        }
        .wl-mock-badge.ok {
          background: rgba(185, 255, 0, 0.15);
          border: 1px solid rgba(185, 255, 0, 0.4);
          color: ${EMERALD};
        }
        .wl-mock-badge.wait {
          background: rgba(45, 212, 191, 0.15);
          border: 1px solid rgba(45, 212, 191, 0.4);
          color: ${TEAL_ACCENT};
        }
        .wl-mock-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .wl-mock-tag {
          font-size: 0.74rem;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.75);
        }
        .wl-mock-tag.proof {
          background: rgba(185, 255, 0, 0.08);
          color: ${EMERALD};
          border: 1px solid rgba(185, 255, 0, 0.2);
        }
        .wl-mock-note {
          text-align: center;
          font-size: 0.84rem;
          color: ${MUTED};
          margin-top: 14px;
        }

        /* ── COUNTDOWN TIMER (FIGMA DARK WIREFRAME INSPIRED) ─────────────── */
        .wl-timer-wrap {
          margin: 36px auto 0;
          max-width: 620px;
          padding: 24px 32px;
          border-radius: 24px;
          background: rgba(15, 19, 24, 0.85);
          border: 1px solid ${HAIRLINE};
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(${NEON_RGB}, 0.08);
          backdrop-filter: blur(16px);
          text-align: center;
        }
        .wl-timer-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(10px, 3vw, 22px);
          margin-top: 14px;
        }
        .wl-timer-box {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .wl-timer-num {
          font-family: 'Archivo', monospace;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 900;
          line-height: 1;
          color: ${EMERALD};
          text-shadow: ${GLOW_SM};
          background: rgba(255, 255, 255, 0.03);
          padding: 10px 16px;
          border-radius: 14px;
          border: 1px solid rgba(185, 255, 0, 0.25);
          min-width: 68px;
        }
        .wl-timer-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: ${MUTED};
          text-transform: uppercase;
          margin-top: 6px;
        }
        .wl-timer-colon {
          font-size: 1.8rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 20px;
        }

        /* ── SECTION SO SÁNH (CONTRAST ARENA) ────────────────────────────── */
        .wl-contrast-arena {
          margin-top: 40px;
          border-radius: 28px;
          background: ${SURFACE};
          border: 1px solid ${HAIRLINE};
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }
        .wl-contrast-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .wl-contrast-table th,
        .wl-contrast-table td {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.98rem;
          line-height: 1.5;
        }
        .wl-contrast-table th {
          background: #090c10;
          font-weight: 700;
          color: ${ON_DARK};
          font-size: 1.05rem;
        }
        .wl-contrast-table th.col-fonlio {
          color: ${EMERALD};
          background: rgba(185, 255, 0, 0.08);
          border-bottom: 2px solid ${EMERALD};
        }
        .wl-contrast-table td.col-fonlio {
          background: rgba(185, 255, 0, 0.03);
          font-weight: 600;
          color: ${ON_DARK};
        }
        .wl-contrast-table td.col-trad {
          color: ${MUTED};
        }

        /* ── BENTO GRID ──────────────────────────────────────────────────── */
        .wl-bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
          margin-top: 40px;
        }
        .wl-bento-item {
          border-radius: 24px;
          background: ${SURFACE};
          border: 1px solid ${HAIRLINE};
          padding: 32px;
          position: relative;
          overflow: hidden;
          transition: border-color 240ms ease, box-shadow 240ms ease;
        }
        .wl-bento-item:hover {
          border-color: rgba(185, 255, 0, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), ${GLOW_SM};
        }
        .wl-bento-8 { grid-column: span 7; }
        .wl-bento-4 { grid-column: span 5; }
        .wl-bento-6 { grid-column: span 6; }

        /* Interactive Stamp */
        .wl-stamp-btn {
          margin-top: 18px;
          padding: 12px 24px;
          border-radius: 999px;
          background: rgba(185, 255, 0, 0.15);
          border: 1.5px solid ${EMERALD};
          color: ${EMERALD};
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          transition: all 180ms ease;
        }
        .wl-stamp-btn:hover {
          background: ${EMERALD};
          color: ${INK};
          transform: scale(1.03);
          box-shadow: ${GLOW_SM};
        }
        .wl-stamp-seal {
          margin-top: 16px;
          padding: 16px 20px;
          border-radius: 16px;
          background: rgba(185, 255, 0, 0.12);
          border: 1.5px dashed ${EMERALD};
          color: ${ON_DARK};
          display: flex;
          align-items: center;
          gap: 12px;
          animation: npStampPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes npStampPop {
          0% { transform: scale(0.6) rotate(-4deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* ── STEP PIPELINE ───────────────────────────────────────────────── */
        .wl-step-pipeline {
          position: relative;
          width: 100%;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-inline: 48px;
          box-sizing: border-box;
        }
        .wl-step-track {
          position: absolute;
          left: 48px;
          right: 48px;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
          z-index: 0;
        }
        .wl-step-beam {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 30%;
          background: linear-gradient(90deg, transparent 0%, ${EMERALD} 50%, #2dd4bf 100%);
          box-shadow: 0 0 14px ${EMERALD};
          animation: npStepBeamFlow 3.2s ease-in-out infinite alternate;
        }
        @keyframes npStepBeamFlow {
          0% { left: -10%; }
          100% { left: 82%; }
        }
        .wl-step-node {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #0f1318;
          border: 2px solid ${EMERALD};
          color: ${EMERALD};
          font-size: 0.82rem;
          font-weight: 800;
          display: grid;
          place-items: center;
          position: relative;
          z-index: 1;
          box-shadow: 0 0 16px rgba(${NEON_RGB}, 0.35);
        }

        .wl-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .wl-step-card {
          position: relative;
          overflow: hidden;
          padding: 32px 26px;
          border-radius: 24px;
          background: ${SURFACE};
          border: 1px solid rgba(${NEON_RGB}, 0.16);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          height: 100%;
          transition: border-color 260ms ease, background 260ms ease;
        }
        .wl-tilt-wrap:hover .wl-step-card {
          border-color: rgba(${NEON_RGB}, 0.5);
          background: ${SURFACE_HI};
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), ${GLOW_SM};
        }
        .wl-step-label {
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${EMERALD};
          margin-bottom: 16px;
          text-shadow: ${GLOW_SM};
          transform: translateZ(20px);
        }
        .wl-step-keyword {
          font-family: 'Archivo', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-size: clamp(2rem, 3.4vw, 2.7rem);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: ${EMERALD};
          text-shadow: ${GLOW_MD};
          margin-bottom: 16px;
          transform: translateZ(28px);
        }
        .wl-step-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: ${ON_DARK};
          margin-bottom: 10px;
          transform: translateZ(20px);
        }
        .wl-step-body {
          font-size: 0.96rem;
          line-height: 1.55;
          color: ${MUTED};
          margin-bottom: 22px;
          transform: translateZ(14px);
        }
        .wl-step-pill {
          margin-top: auto;
          display: inline-flex;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          transform: translateZ(24px);
        }
        .wl-step-ghost {
          position: absolute;
          right: 18px;
          top: -24px;
          z-index: 0;
          font-family: 'Archivo', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-size: 9.5rem;
          font-weight: 900;
          line-height: 1;
          color: rgba(${NEON_RGB}, 0.05);
          pointer-events: none;
          user-select: none;
          transform: translateZ(-8px);
        }
        .wl-tilt-wrap:hover .wl-step-ghost {
          color: rgba(${NEON_RGB}, 0.14);
        }
        .wl-step-card > *:not(.wl-step-ghost) {
          position: relative;
          z-index: 1;
        }

        /* ── TOP 10 VIP PERKS ────────────────────────────────────────────── */
        .wl-perks-box {
          padding: clamp(36px, 5vw, 56px);
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(185, 255, 0, 0.06) 0%, rgba(15, 19, 24, 0.95) 100%);
          border: 1.5px solid rgba(185, 255, 0, 0.32);
          box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(${NEON_RGB}, 0.08);
          margin-top: 40px;
        }
        .wl-perks-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        .wl-perk-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .wl-perk-ic {
          flex: none;
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(185, 255, 0, 0.15);
          color: ${EMERALD};
          border: 1px solid rgba(185, 255, 0, 0.3);
        }
        .wl-perk-item h4 {
          margin: 0 0 6px;
          font-size: 1.05rem;
          font-weight: 700;
          color: ${ON_DARK};
        }
        .wl-perk-item p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.55;
          color: ${MUTED};
        }
        .wl-top10-banner {
          margin-top: 36px;
          padding: 24px 28px;
          border-radius: 20px;
          background: rgba(185, 255, 0, 0.1);
          border: 1px solid rgba(185, 255, 0, 0.4);
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: ${GLOW_SM};
        }
        .wl-top10-badge {
          flex: none;
          padding: 8px 18px;
          border-radius: 999px;
          background: ${EMERALD};
          color: ${INK};
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .wl-top10-text {
          font-size: 1.02rem;
          line-height: 1.5;
          color: ${ON_DARK};
          margin: 0;
        }
        .wl-top10-text b {
          color: ${EMERALD};
        }

        /* ── SECTION ĐĂNG KÝ (FORM SECTION) ──────────────────────────────── */
        .wl-signup-wrap {
          position: relative;
          border-top: 1px solid ${HAIRLINE};
        }
        .wl-form-shell {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: clamp(36px, 6vw, 76px);
          align-items: start;
        }
        .wl-form-box {
          padding: clamp(28px, 4vw, 42px);
          border-radius: 28px;
          background: ${SURFACE};
          border: 1.5px solid rgba(185, 255, 0, 0.28);
          box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(${NEON_RGB}, 0.1);
          position: relative;
        }
        .wl-form {
          display: grid;
          gap: 22px;
        }
        .wl-field {
          display: grid;
          gap: 8px;
        }
        .wl-field label {
          font-size: 0.95rem;
          font-weight: 600;
          color: ${ON_DARK};
        }
        .wl-field label em {
          color: ${EMERALD};
          font-style: normal;
        }
        .wl-field-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .wl input[type='text'],
        .wl input[type='email'],
        .wl select {
          width: 100%;
          box-sizing: border-box;
          padding: 15px 18px;
          border: 1px solid ${HAIRLINE};
          border-radius: 14px;
          background: #090d12;
          color: ${ON_DARK};
          font-family: inherit;
          font-size: 1rem;
          outline: none;
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .wl input:focus,
        .wl select:focus {
          border-color: ${EMERALD};
          background: #0d131a;
          box-shadow: 0 0 0 3px rgba(${NEON_RGB}, 0.2);
        }
        .wl-select {
          position: relative;
          display: grid;
        }
        .wl-select select {
          appearance: none;
          padding-right: 44px;
          cursor: pointer;
        }
        .wl-select svg {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: ${MUTED};
        }
        .wl-consent {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.96rem;
          line-height: 1.5;
          color: ${MUTED};
          cursor: pointer;
        }
        .wl-consent input {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          accent-color: ${EMERALD};
          flex: none;
        }
        .wl-field.bad input,
        .wl-field.bad select {
          border-color: #f87171;
        }
        .wl-err {
          margin: 0;
          font-size: 0.85rem;
          color: #fca5a5;
        }
        .wl-alert {
          margin: 0;
          padding: 14px 18px;
          border-radius: 12px;
          background: rgba(248, 113, 113, 0.12);
          border: 1px solid rgba(248, 113, 113, 0.4);
          color: #fca5a5;
        }
        .wl-submit {
          width: 100%;
          padding: 18px;
          font-size: 1.1rem;
        }

        /* Success Card */
        .wl-success-card {
          padding: 36px 20px;
          text-align: center;
          position: relative;
          outline: none;
        }
        .wl-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .wl-particles span {
          position: absolute;
          width: 8px;
          height: 14px;
          border-radius: 3px;
          opacity: 0.85;
          animation: npConfettiFall linear forwards;
        }
        @keyframes npConfettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
        .wl-success-icon {
          display: grid;
          place-items: center;
          width: 76px;
          height: 76px;
          border-radius: 999px;
          background: ${EMERALD};
          color: ${INK};
          margin: 0 auto 20px;
          box-shadow: ${GLOW_LG};
          animation: npSuccessPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes npSuccessPop {
          0% { transform: scale(0.4); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .wl-share-bar {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 26px;
          flex-wrap: wrap;
        }

        /* ── FAQ ─────────────────────────────────────────────────────────── */
        .wl-faq-list {
          display: grid;
          gap: 14px;
          max-width: 900px;
          margin-inline: auto;
        }
        .wl-faq-item {
          border: 1px solid ${HAIRLINE};
          border-radius: 20px;
          background: ${SURFACE};
          overflow: hidden;
          transition: border-color 240ms ease, background-color 240ms ease;
        }
        .wl-faq-item:hover {
          border-color: rgba(255, 255, 255, 0.16);
          background-color: ${SURFACE_HI};
        }
        .wl-faq-item.open {
          border-color: ${EMERALD};
          background-color: ${SURFACE_HI};
          box-shadow: ${GLOW_SM};
        }
        .wl-faq-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          width: 100%;
          padding: 22px 26px;
          border: 0;
          background: transparent;
          color: ${ON_DARK};
          font-family: inherit;
          font-size: 1.05rem;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }
        .wl-faq-btn svg {
          flex: none;
          color: ${EMERALD};
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wl-faq-item.open .wl-faq-btn svg {
          transform: rotate(180deg);
        }
        .wl-faq-ans {
          margin: 0;
          padding: 0 26px 24px;
          font-size: 1.02rem;
          line-height: 1.6;
          color: ${MUTED};
        }

        /* ── FOOTER ──────────────────────────────────────────────────────── */
        .wl-footer {
          border-top: 1px solid ${HAIRLINE};
          background: #05080c;
          padding-top: clamp(60px, 8vw, 84px);
          padding-bottom: 0;
          margin-bottom: 0;
          overflow: hidden;
          position: relative;
          z-index: 2;
        }
        .wl-footer-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1.4fr);
          gap: clamp(32px, 5vw, 64px);
          margin-bottom: 50px;
        }
        .wl-footer-tagline {
          font-size: 0.95rem;
          line-height: 1.6;
          color: ${MUTED};
          margin: 16px 0 0;
          max-width: 34ch;
        }
        .wl-footer-col h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: ${ON_DARK};
          margin: 0 0 20px;
        }
        .wl-footer-col ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 12px;
        }
        .wl-footer-col ul li a {
          color: ${MUTED};
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 180ms ease;
        }
        .wl-footer-col ul li a:hover {
          color: ${EMERALD};
        }
        .wl-footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: ${MUTED};
          font-size: 0.92rem;
          line-height: 1.5;
        }
        .wl-footer-contact-item svg {
          flex: none;
          color: ${EMERALD};
          margin-top: 2px;
        }
        .wl-footer-contact-item a {
          color: ${MUTED};
          text-decoration: none;
          transition: color 180ms ease;
        }
        .wl-footer-contact-item a:hover {
          color: ${EMERALD};
        }
        .wl-footer-bottom {
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
          color: rgba(233, 247, 242, 0.45);
        }

        /* ── FLOATING PILL ───────────────────────────────────────────────── */
        .wl-float-pill {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 75;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 999px;
          background: rgba(7, 10, 15, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid ${EMERALD};
          color: ${ON_DARK};
          font-size: 0.94rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), ${GLOW_SM};
          transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease, color 200ms ease;
          animation: npFloatPillIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .wl-float-pill:hover {
          transform: translateY(-3px) scale(1.03);
          background: ${EMERALD};
          color: ${INK};
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85), ${GLOW_LG};
        }
        @keyframes npFloatPillIn {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── RESPONSIVE ADAPTATIONS ──────────────────────────────────────── */
        @media (max-width: 1024px) {
          .wl-hero-grid {
            grid-template-columns: minmax(0, 1fr);
            text-align: center;
          }
          .wl-hero-copy {
            text-align: center;
          }
          .wl-social-proof {
            justify-content: center;
          }
          .wl-quick-inputs {
            grid-template-columns: minmax(0, 1fr);
          }
          .wl-quick-roles {
            justify-content: center;
          }
          .wl-bento-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .wl-bento-8, .wl-bento-4, .wl-bento-6 {
            grid-column: span 1;
          }
          .wl-grid-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .wl-step-pipeline {
            display: none;
          }
          .wl-header-nav {
            display: none;
          }
          .wl-menu-toggle {
            display: block;
          }
          .wl-form-shell {
            grid-template-columns: minmax(0, 1fr);
          }
          .wl-footer-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 36px;
          }
        }

        @media (max-width: 640px) {
          .wl-grid-4, .wl-field-row, .wl-perks-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .wl-float-pill {
            bottom: 16px;
            right: 16px;
            left: 16px;
            justify-content: center;
            padding: 12px 20px;
            font-size: 0.88rem;
          }
          .wl-footer-bottom {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .wl-contrast-arena {
            overflow-x: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wl-stage-badge, .wl-pulse-dot::after, .wl-particles span, .wl-step-beam {
            animation: none !important;
          }
          .wl-tilt-wrap {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ── 1. CINEMATIC HERO & 3D MINTING TERMINAL ─────────────────────── */}
      <section className="wl-hero">
        {/* Interactive 3D WebGL Three.js Universe */}
        <Waitlist3DScene />
        <HeroMesh fade={false} veilOpacity={0.88} />

        <div className="wl-inner">
          <div className="wl-hero-grid">
            <Reveal>
              <div className="wl-hero-copy">
                <div className="wl-live-pill">
                  <span className="wl-pulse-dot" />
                  <span>
                    ✦ GENESIS BATCH 2026 · <b>{displayCount}</b> bạn trẻ đã giữ chỗ · 8/10 suất VIP còn lại
                  </span>
                </div>

                <h1 className="wl-display">
                  BẢO CHỨNG<br />
                  <em>NĂNG LỰC THẬT.</em><br />
                  MỞ LỐI TƯƠNG LAI.
                </h1>

                <p className="wl-lead" style={{ marginTop: 20 }}>
                  Đừng để kỹ năng của bạn bị chôn vùi trong thư mục Drive hay những gạch đầu dòng CV vô hồn.
                  <b> FONLIO</b> là nền tảng Living Portfolio chuẩn mực — nơi mọi dự án, sản phẩm và thành tựu đều được đồng nghiệp và người giao việc bảo chứng minh bạch.
                </p>

                {/* Social Proof Avatar Cluster (Figma Inspired) */}
                <div className="wl-social-proof">
                  <div className="wl-avatar-cluster">
                    <div className="wl-avatar-circle" style={{ background: 'linear-gradient(135deg, #b9ff00, #0d9488)', color: '#070a0f' }}>TN</div>
                    <div className="wl-avatar-circle" style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}>HQ</div>
                    <div className="wl-avatar-circle" style={{ background: 'linear-gradient(135deg, #f472b6, #fb7185)' }}>ML</div>
                    <div className="wl-avatar-circle" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>DK</div>
                  </div>
                  <div className="wl-proof-text">
                    <b>{displayCount} sinh viên &amp; bạn trẻ</b> đã tham gia · <span style={{ color: EMERALD }}>Top 10 nhận VIP trọn đời</span>
                  </div>
                </div>

                {/* Quick 3D Minting Box */}
                <div className="wl-quick-mint-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: EMERALD, textTransform: 'uppercase' }}>
                      ⚡ KHẮC THẺ VIP EARLY ACCESS CỦA BẠN
                    </span>
                    <span style={{ fontSize: '0.78rem', color: MUTED }}>Tạo trực tiếp trong 10 giây</span>
                  </div>

                  <div className="wl-quick-roles">
                    {QUICK_ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        className={`wl-role-chip${selectedQuickRole === role.id ? ' on' : ''}`}
                        onClick={() => handleQuickRoleSelect(role)}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>

                  <form className="wl-quick-inputs" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      className="wl-quick-input"
                      placeholder="Họ và tên của bạn"
                      value={form.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      className="wl-quick-input"
                      placeholder="Email nhận thư mời VIP"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      required
                    />
                    <button type="submit" className="wl-btn wl-btn-primary" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Đang khắc thẻ…' : 'Nhận Thẻ VIP ➔'}
                    </button>
                  </form>
                  {errors.fullName && <p className="wl-err" style={{ marginTop: 8 }}>{errors.fullName}</p>}
                  {errors.email && <p className="wl-err" style={{ marginTop: 4 }}>{errors.email}</p>}
                </div>
              </div>
            </Reveal>

            {/* Cột phải: 3D Interactive Stage */}
            <Reveal delay={150}>
              <div className="wl-hero-stage-wrap">
                <div className="wl-stage-switcher" role="tablist" aria-label="Chế độ xem 3D">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={heroView === 'vip'}
                    className={`wl-stage-tab${heroView === 'vip' ? ' on' : ''}`}
                    onClick={() => setHeroView('vip')}
                  >
                    <CreditCard size={16} /> Thẻ VIP Hologram
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={heroView === 'envelope'}
                    className={`wl-stage-tab${heroView === 'envelope' ? ' on' : ''}`}
                    onClick={() => setHeroView('envelope')}
                  >
                    <MailCheck size={16} /> Bức thư Fonlio
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={heroView === 'portfolio'}
                    className={`wl-stage-tab${heroView === 'portfolio' ? ' on' : ''}`}
                    onClick={() => setHeroView('portfolio')}
                  >
                    <Eye size={16} /> Hồ sơ bảo chứng mẫu
                  </button>
                </div>

                {heroView === 'vip' ? (
                  /* 3D Holographic VIP Pass */
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <HoloVIPCard
                      name={form.fullName || 'BẠN (EARLY ADOPTER)'}
                      code={ticketCode || '#FL-2026-VIP'}
                      tier="TOP 10 VIP FOUNDER"
                      role={currentQuickRoleObj.label}
                    />
                    <p className="wl-mock-note">
                      Rê chuột để cảm nhận ánh kim Hologram đổi màu &amp; vi mạch 3D nổi khối.
                    </p>
                  </div>
                ) : heroView === 'envelope' ? (
                  /* 3D Envelope Art Stage */
                  <TiltCard maxTilt={12} className="wl-envelope-stage-tilt" glare>
                    <div className="wl-envelope-stage">
                      <div className="wl-stage-badge wl-badge-pos-1">
                        <Sparkles size={16} color={EMERALD} />
                        <span>Top 10 VIP Early Bird</span>
                      </div>

                      <EnvelopeArt />

                      <div className="wl-stage-badge wl-badge-pos-2">
                        <Award size={16} color={EMERALD} />
                        <span>Verified Proof of Work</span>
                      </div>
                    </div>
                    <p className="wl-mock-note">Bức thư Fonlio gửi gắm đến các bạn trẻ đang tìm kiếm cơ hội.</p>
                  </TiltCard>
                ) : (
                  /* 3D Portfolio Mockup (Figma Profile Card Inspired) */
                  <TiltCard maxTilt={14} className="wl-mock-shell">
                    <div className="wl-mock-card" aria-label="Hình minh họa giao diện portfolio FONLIO 3D">
                      <div className="wl-mock-profile">
                        <div className="wl-mock-avatar">TB</div>
                        <div className="wl-mock-info">
                          <b>{form.fullName || 'Tên của bạn'}</b>
                          <small>{currentQuickRoleObj.specialization} · fonlio.me/@ban</small>
                        </div>
                      </div>

                      <div className="wl-mock-projects">
                        <div className="wl-mock-item">
                          <div className="wl-mock-row">
                            <div>
                              <h4>Chiến dịch Truyền thông CLB 2025</h4>
                              <p>Vai trò: Trưởng nhóm Dự án (85% đóng góp)</p>
                            </div>
                            <span className="wl-mock-badge ok">✓ Đã xác thực</span>
                          </div>
                          <div className="wl-mock-tags">
                            <span className="wl-mock-tag">Kế hoạch</span>
                            <span className="wl-mock-tag proof">Bằng chứng: 12.000 Reach</span>
                          </div>
                        </div>

                        <div className="wl-mock-item">
                          <div className="wl-mock-row">
                            <div>
                              <h4>Sản phẩm Thiết kế UI/UX App Sinh viên</h4>
                              <p>Vai trò: Lead Designer</p>
                            </div>
                            <span className="wl-mock-badge ok">✓ Đã xác thực</span>
                          </div>
                          <div className="wl-mock-tags">
                            <span className="wl-mock-tag">Design</span>
                            <span className="wl-mock-tag proof">Bằng chứng: 32 Screens</span>
                          </div>
                        </div>

                        <div className="wl-mock-item">
                          <div className="wl-mock-row">
                            <div>
                              <h4>Đề án Nghiên cứu Kinh tế Xanh</h4>
                              <p>Vai trò: Phân tích Dữ liệu</p>
                            </div>
                            <span className="wl-mock-badge wait">⏳ Chờ duyệt</span>
                          </div>
                          <div className="wl-mock-tags">
                            <span className="wl-mock-tag">Học thuật</span>
                            <span className="wl-mock-tag">Đang mời Mentor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="wl-mock-note">Portfolio Fonlio kết hợp chứng thực số và sản phẩm sống động.</p>
                  </TiltCard>
                )}
              </div>
            </Reveal>
          </div>

          {/* ── COUNTDOWN TIMER (FIGMA DARK WIREFRAME INSPIRED) ─────────── */}
          <Reveal delay={200}>
            <div className="wl-timer-wrap">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: EMERALD, fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <Clock size={16} /> MỞ CỔNG EARLY ACCESS GENESIS TRONG
              </div>
              <div className="wl-timer-grid">
                <div className="wl-timer-box">
                  <div className="wl-timer-num">{String(countdown.days).padStart(2, '0')}</div>
                  <span className="wl-timer-label">Ngày</span>
                </div>
                <span className="wl-timer-colon">:</span>
                <div className="wl-timer-box">
                  <div className="wl-timer-num">{String(countdown.hours).padStart(2, '0')}</div>
                  <span className="wl-timer-label">Giờ</span>
                </div>
                <span className="wl-timer-colon">:</span>
                <div className="wl-timer-box">
                  <div className="wl-timer-num">{String(countdown.minutes).padStart(2, '0')}</div>
                  <span className="wl-timer-label">Phút</span>
                </div>
                <span className="wl-timer-colon">:</span>
                <div className="wl-timer-box">
                  <div className="wl-timer-num">{String(countdown.seconds).padStart(2, '0')}</div>
                  <span className="wl-timer-label">Giây</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 2. PARTNERS / TRUST MARQUEE ─────────────────────────────────── */}
      <section className="wl-partners-section">
        <div className="wl-inner" style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: '0.92rem', fontWeight: 700, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ĐỒNG HÀNH CÙNG MẠNG LƯỚI CÁC CLB, TỔ CHỨC SINH VIÊN VÀ ĐỐI TÁC TUYỂN DỤNG HÀNG ĐẦU
          </p>
        </div>
        <PartnerLogos onDark colorLogos showHeading={false} />
      </section>

      {/* ── 3. CONTRAST ARENA: CV TRUYỀN THỐNG VS FONLIO LIVING PROOF ────── */}
      <section className="wl-band" id="so-sanh">
        <div className="wl-inner">
          <Reveal>
            <span className="wl-eyebrow">Cuộc cách mạng hồ sơ</span>
            <h2 className="wl-section-title">
              Vì sao bạn đã làm rất nhiều, nhưng <em>CV giấy</em> không ai tin?
            </h2>
            <p className="wl-lead">
              Thời đại của những bản PDF tự khen bản thân đã qua. Đây là lý do Fonlio thay thế hoàn toàn cách bạn trình bày năng lực.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="wl-contrast-arena">
              <table className="wl-contrast-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Tiêu chí</th>
                    <th style={{ width: '37%' }}>CV Giấy &amp; File PDF Truyền Thống</th>
                    <th className="col-fonlio" style={{ width: '38%' }}>FONLIO Verified Proof of Work</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISONS.map((row) => (
                    <tr key={row.feature}>
                      <td style={{ fontWeight: 700, color: ON_DARK }}>{row.feature}</td>
                      <td className="col-trad">❌ {row.traditional}</td>
                      <td className="col-fonlio">✦ {row.fonlio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 4. LINEAR-STYLE INTERACTIVE BENTO GRID ───────────────────────── */}
      <section className="wl-band" id="tinh-nang">
        <div className="wl-inner">
          <Reveal>
            <span className="wl-eyebrow">Hệ sinh thái tính năng</span>
            <h2 className="wl-section-title">
              Cỗ máy biến mọi trải nghiệm thành <em>bằng chứng vàng</em>.
            </h2>
            <p className="wl-lead">
              Không chỉ là nơi tạo web cá nhân. Fonlio là công cụ bảo chứng năng lực toàn diện cho thời đại số.
            </p>
          </Reveal>

          <div className="wl-bento-grid">
            {/* Bento 1: Interactive Verification Stamp */}
            <div className="wl-bento-item wl-bento-8">
              <span className="wl-eyebrow">Cơ chế độc quyền</span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 10px', color: ON_DARK }}>
                Verified Proof of Work: Dấu bảo chứng không thể làm giả
              </h3>
              <p style={{ color: MUTED, fontSize: '0.98rem', lineHeight: 1.6 }}>
                Thay vì tự viết "Em có kỹ năng quản lý giỏi", hãy để người giao việc thực tế — Trưởng ban, Mentor hoặc Đồng nghiệp — trực tiếp đóng dấu xác nhận đóng góp của bạn.
              </p>

              <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: '#0a0d12', border: `1px solid ${HAIRLINE}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ color: ON_DARK, fontSize: '1.05rem', display: 'block' }}>Dự án: Đêm nhạc Chào Tân Sinh viên 2024</b>
                    <small style={{ color: MUTED }}>Vai trò: Điều phối viên Âm thanh &amp; Ánh sáng</small>
                  </div>
                  <button
                    type="button"
                    className="wl-stamp-btn"
                    onClick={() => setStamped(true)}
                  >
                    <CheckCheck size={18} /> {stamped ? 'Đã đóng dấu ✓' : 'Thử đóng dấu bảo chứng'}
                  </button>
                </div>

                {stamped && (
                  <div className="wl-stamp-seal">
                    <ShieldCheck size={28} color={EMERALD} />
                    <div>
                      <b style={{ color: EMERALD, display: 'block' }}>CHỨNG THỰC BỞI CHỦ NHIỆM CLB NGHỆ THUẬT</b>
                      <small style={{ color: MUTED }}>Khóa điện tử: #VERIFIED-OCT-2026 · Tăng +150 Reputation Score</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bento 2: Living Vault */}
            <div className="wl-bento-item wl-bento-4">
              <span className="wl-eyebrow">Living Vault</span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 10px', color: ON_DARK }}>
                Gom trọn sản phẩm thực tế
              </h3>
              <p style={{ color: MUTED, fontSize: '0.95rem', lineHeight: 1.55 }}>
                Đính kèm sản phẩm Figma, video YouTube, bài báo cáo hay link Facebook về một nơi có cấu trúc.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18 }}>
                {Object.keys(BENTO_PROJECTS).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`wl-role-chip${bentoCategory === cat ? ' on' : ''}`}
                    onClick={() => setBentoCategory(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: '#090d12', border: `1px solid ${HAIRLINE}` }}>
                <b style={{ fontSize: '0.92rem', color: ON_DARK, display: 'block' }}>{BENTO_PROJECTS[bentoCategory].title}</b>
                <div style={{ fontSize: '0.82rem', color: EMERALD, marginTop: 4 }}>{BENTO_PROJECTS[bentoCategory].metric}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {BENTO_PROJECTS[bentoCategory].tags.map((t) => (
                    <span key={t} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: MUTED }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento 3: Reputation Score */}
            <div className="wl-bento-item wl-bento-6">
              <span className="wl-eyebrow">Hệ thống uy tín</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: ON_DARK }}>
                Reputation Score (RS): Tín nhiệm nghề nghiệp tích lũy
              </h3>
              <p style={{ color: MUTED, fontSize: '0.95rem', lineHeight: 1.55 }}>
                Mỗi sản phẩm hoàn thành và mỗi bảo chứng bạn nhận được sẽ tích lũy thành điểm tín nhiệm thực chất, giúp bạn tự tin ứng tuyển các công ty hàng đầu.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18, padding: 16, borderRadius: 16, background: '#090d12', border: `1px solid ${HAIRLINE}` }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(185,255,0,0.15)', border: `2px solid ${EMERALD}`, display: 'grid', placeItems: 'center', color: EMERALD, fontWeight: 900, fontSize: '1.2rem' }}>
                  850
                </div>
                <div>
                  <b style={{ color: ON_DARK, display: 'block' }}>Tier 1: High Credibility Candidate</b>
                  <small style={{ color: MUTED }}>Top 5% Sinh viên Năng nổ có nhiều dự án bảo chứng</small>
                </div>
              </div>
            </div>

            {/* Bento 4: 1-Link Bio Shareable */}
            <div className="wl-bento-item wl-bento-6">
              <span className="wl-eyebrow">One-Link Bio</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: ON_DARK }}>
                fonlio.me/@ban — Danh thiếp số ấn tượng
              </h3>
              <p style={{ color: MUTED, fontSize: '0.95rem', lineHeight: 1.55 }}>
                Đính kèm link trên Bio TikTok, Instagram, CV xin việc hay chữ ký email. Bất kỳ ai mở ra đều có trải nghiệm mượt mà, chuyên nghiệp chuẩn Recruiter.
              </p>
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, background: '#090d12', border: `1px solid ${HAIRLINE}` }}>
                <span style={{ fontFamily: 'monospace', color: EMERALD, fontWeight: 700 }}>fonlio.me/@{form.fullName ? form.fullName.toLowerCase().replace(/\s+/g, '') : 'tenban'}</span>
                <span style={{ fontSize: '0.8rem', color: MUTED }}>1-Click mở xem ngay</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BỐN BƯỚC BỨT PHÁ (THE 4-STAGE PIPELINE) ───────────────────── */}
      <section className="wl-band" id="lo-trinh">
        <div className="wl-inner">
          <Reveal>
            <span className="wl-eyebrow">Lộ trình 4 bước</span>
            <h2 className="wl-section-title">Từ trải nghiệm rời rạc đến <em>Living Portfolio</em> đỉnh cao.</h2>
            <p className="wl-lead">
              Bạn có thể bắt đầu ngay hôm nay dù chỉ có một vài sản phẩm đầu tay. Cứ đi từng bước theo nhịp của bạn.
            </p>
          </Reveal>

          {/* Animated 3D Step Pipeline Connector Beam */}
          <Reveal delay={60}>
            <div className="wl-step-pipeline" aria-hidden="true">
              <div className="wl-step-track">
                <div className="wl-step-beam" />
              </div>
              <div className="wl-step-node">01</div>
              <div className="wl-step-node">02</div>
              <div className="wl-step-node">03</div>
              <div className="wl-step-node">04</div>
            </div>
          </Reveal>

          <div className="wl-grid-4">
            {STEPS.map((s, idx) => (
              <Reveal key={s.step} delay={idx * 90}>
                <TiltCard maxTilt={12}>
                  <div className="wl-step-card">
                    <span className="wl-step-label">Bước {s.step}</span>
                    <span className="wl-step-keyword">{s.keyword}</span>
                    <h3 className="wl-step-title">{s.title}</h3>
                    <p className="wl-step-body">{s.body}</p>
                    <span className="wl-step-pill">{s.tag}</span>
                    <span className="wl-step-ghost" aria-hidden="true">{s.step}</span>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ĐẶC QUYỀN FOUNDING MEMBER & TOP 10 VIP ─────────────────────── */}
      <section className="wl-band" id="dac-quyen">
        <div className="wl-inner">
          <Reveal>
            <div className="wl-perks-box">
              <span className="wl-eyebrow">Kho báu quyền lợi</span>
              <h2 className="wl-section-title">Vì sao bạn nên giữ chỗ ngay trong đợt Genesis?</h2>
              <p className="wl-lead" style={{ marginBottom: 36 }}>
                Những thành viên đặt niềm tin đầu tiên luôn nhận được sự đồng hành sát cánh và những đặc quyền không bao giờ tái diễn.
              </p>

              <div className="wl-perks-grid">
                {PERKS_LIST.map((perk) => (
                  <div className="wl-perk-item" key={perk.title}>
                    <div className="wl-perk-ic">{perk.icon}</div>
                    <div>
                      <h4>{perk.title}</h4>
                      <p>{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="wl-top10-banner">
                <span className="wl-top10-badge">TOP 10 VIP</span>
                <p className="wl-top10-text">
                  <b>10 bạn đăng ký sớm nhất</b> sẽ được tặng gói tài khoản <b>VIP trọn đời</b> của FONLIO,
                  cùng các phần quà giá trị từ các đơn vị đối tác trong hệ sinh thái!
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 7. TERMINAL ĐĂNG KÝ HOÀN CHỈNH (FORM TERMINAL) ────────────────── */}
      <section className="wl-band wl-signup-wrap" id="dang-ky">
        <div className="wl-inner wl-form-shell">
          <Reveal>
            <div>
              <span className="wl-eyebrow">Early Access Terminal</span>
              <h2 className="wl-section-title">Bắt đầu khắc tên bạn vào tương lai nghề nghiệp.</h2>
              <p className="wl-lead">
                Chỉ mất khoảng 1 phút. Thông tin của bạn được mã hóa an toàn và đưa vào danh sách ưu tiên trải nghiệm MVP.
              </p>

              <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
                  <BadgeCheck size={20} color={EMERALD} />
                  <span>Miễn phí 100% không ràng buộc</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
                  <BadgeCheck size={20} color={EMERALD} />
                  <span>Khắc Thẻ VIP 3D Holographic cá nhân ngay tức thì</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
                  <BadgeCheck size={20} color={EMERALD} />
                  <span>Ưu tiên gửi thư mời đợt 1 ngay khi nền tảng mở cửa</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <TiltCard maxTilt={6} glare={false}>
              <div className="wl-form-box" ref={successRef} tabIndex={-1}>
                {status === 'done' ? (
                  <div className="wl-success-card">
                    <CelebrationParticles />
                    <div className="wl-success-icon">
                      <BadgeCheck size={42} strokeWidth={2.4} />
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px', color: ON_DARK }}>
                      Chúc mừng bạn đã có tên trong danh sách chờ!
                    </h3>
                    <p style={{ color: MUTED, fontSize: '1.02rem', margin: '0 0 20px' }}>
                      Cảm ơn bạn đã quan tâm. Đây là Thẻ VIP Founding Member chính thức của bạn:
                    </p>

                    {/* 3D Holographic VIP Pass with live user data */}
                    <div style={{ marginBlock: 20 }}>
                      <HoloVIPCard
                        name={form.fullName}
                        code={ticketCode || '#FL-2026-VIP'}
                        tier="TOP 10 VIP FOUNDER"
                        role={currentQuickRoleObj.label}
                      />
                    </div>

                    <div className="wl-share-bar">
                      <button
                        type="button"
                        className="wl-btn wl-btn-primary"
                        onClick={copyShareUrl}
                      >
                        <Copy size={16} />
                        {copiedLink ? 'Đã sao chép link!' : 'Chia sẻ cho bạn bè'}
                      </button>
                      <button
                        type="button"
                        className="wl-btn wl-btn-ghost"
                        onClick={() => {
                          setForm(EMPTY_FORM);
                          setStatus('idle');
                        }}
                      >
                        <RefreshCw size={16} />
                        Đăng ký lượt khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="wl-form" onSubmit={handleSubmit} noValidate>
                    {/* Bot Field Honeypot */}
                    <div style={{ display: 'none' }} aria-hidden="true">
                      <label htmlFor="wl-botField">Đừng điền trường này</label>
                      <input
                        id="wl-botField"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.botField}
                        onChange={(e) => update('botField', e.target.value)}
                      />
                    </div>

                    {serverError && <p className="wl-alert" role="alert">{serverError}</p>}

                    <div className={`wl-field${errors.fullName ? ' bad' : ''}`}>
                      <label htmlFor="wl-fullName">Họ và tên của bạn<em> *</em></label>
                      <input
                        id="wl-fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Ví dụ: Nguyễn Hà Trâm"
                        value={form.fullName}
                        onChange={(e) => update('fullName', e.target.value)}
                      />
                      {errors.fullName && <p className="wl-err">{errors.fullName}</p>}
                    </div>

                    <div className={`wl-field${errors.email ? ' bad' : ''}`}>
                      <label htmlFor="wl-email">Địa chỉ Email<em> *</em></label>
                      <input
                        id="wl-email"
                        type="email"
                        autoComplete="email"
                        placeholder="ban@example.com"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                      />
                      {errors.email && <p className="wl-err">{errors.email}</p>}
                    </div>

                    <div className="wl-field-row">
                      <div className="wl-field">
                        <label htmlFor="wl-careerStage">Giai đoạn hiện tại</label>
                        <div className="wl-select">
                          <select
                            id="wl-careerStage"
                            value={form.careerStage}
                            onChange={(e) => update('careerStage', e.target.value)}
                          >
                            {CAREER_STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} aria-hidden="true" />
                        </div>
                      </div>

                      <div className="wl-field">
                        <label htmlFor="wl-specialization">Lĩnh vực chuyên môn</label>
                        <div className="wl-select">
                          <select
                            id="wl-specialization"
                            value={form.specialization}
                            onChange={(e) => update('specialization', e.target.value)}
                          >
                            {SPECIALIZATIONS.map((sp) => (
                              <option key={sp} value={sp}>{sp}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="wl-field">
                      <label className="wl-consent" htmlFor="wl-emailConsent">
                        <input
                          id="wl-emailConsent"
                          type="checkbox"
                          checked={form.emailConsent}
                          onChange={(e) => update('emailConsent', e.target.checked)}
                        />
                        <span>
                          Tôi đồng ý nhận thư mời Early Access và cập nhật độc quyền từ FONLIO.<em> *</em>
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="wl-btn wl-btn-primary wl-submit"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? (
                        <>
                          <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                          Đang khắc thẻ và ghi nhận…
                        </>
                      ) : (
                        <>
                          Khắc Thẻ VIP &amp; Giữ Chỗ Ngay <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </form>
                )}
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ── 8. FAQ ACCORDION ────────────────────────────────────────────── */}
      <section className="wl-band" id="faq">
        <div className="wl-inner">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <span className="wl-eyebrow">Giải đáp thắc mắc</span>
              <h2 className="wl-section-title" style={{ maxWidth: '30ch', margin: '0 auto 14px' }}>
                Những câu bạn có thể đang quan tâm.
              </h2>
              <p className="wl-lead" style={{ margin: '0 auto' }}>
                Mọi thắc mắc của bạn về cơ chế bảo chứng của FONLIO đều được giải đáp tại đây.
              </p>
            </div>
          </Reveal>

          <div className="wl-faq-list">
            {FAQS.map((item, idx) => (
              <Reveal key={item.q} delay={idx * 60}>
                <div className={`wl-faq-item${openFaq === idx ? ' open' : ''}`}>
                  <button
                    type="button"
                    className="wl-faq-btn"
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={20} />
                  </button>
                  {openFaq === idx && <p className="wl-faq-ans">{item.a}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FOOTER CHUYÊN BIỆT CHO WAITLIST VỚI LOGO KHỔNG LỒ ────────── */}
      <footer className="wl-footer">
        <div className="wl-inner">
          <div className="wl-footer-grid">
            <div>
              <FonlioBrandLogo size="42px" />
              <p className="wl-footer-tagline">
                Foundation Of Your Next Journey. Biến mọi dự án, sản phẩm và trải nghiệm thành Living Portfolio có bằng chứng thật và được bảo chứng minh bạch.
              </p>
            </div>

            <div className="wl-footer-col">
              <h4>Khám phá</h4>
              <ul>
                <li><a href="#ve-fonlio">Về FONLIO</a></li>
                <li><a href="#so-sanh">So sánh với CV cũ</a></li>
                <li><a href="#tinh-nang">Tính năng nổi bật</a></li>
                <li><a href="#lo-trinh">Lộ trình 4 bước</a></li>
                <li><a href="#dac-quyen">Đặc quyền VIP</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>

            <div className="wl-footer-col">
              <h4>Liên hệ</h4>
              <ul>
                <li className="wl-footer-contact-item">
                  <MapPin size={18} />
                  <span>Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, Ho Chi Minh City, Vietnam</span>
                </li>
                <li className="wl-footer-contact-item">
                  <Phone size={18} />
                  <a href="tel:0981362340">0981 362 340</a>
                </li>
                <li className="wl-footer-contact-item">
                  <Mail size={18} />
                  <a href="mailto:fonlioofficial@gmail.com">fonlioofficial@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="wl-footer-bottom">
            <span>© 2026 FONLIO. Bảo lưu mọi quyền.</span>
            <span>Từ CV giấy đến Verified Proof of Work.</span>
          </div>
        </div>

        {/* Logo BrandWordmark khổng lồ chạy hết chiều ngang khớp 100% chân trang HomePage */}
        <div
          className="np-footer-wordmark-wrap"
          style={{
            width: '100%',
            margin: 'clamp(20px, 3vw, 40px) 0 0 0',
            padding: 0,
            marginBottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            textAlign: 'center',
            overflow: 'visible',
            lineHeight: 0,
            boxSizing: 'border-box',
          }}
        >
          <BrandWordmark
            size="auto"
            glow
            style={{
              display: 'block',
              width: 'min(1440px, 100%)',
              height: 'auto',
              maxHeight: '480px',
              marginBottom: 0,
              verticalAlign: 'bottom',
              filter: 'drop-shadow(0 0 24px rgba(185, 255, 0, 0.40)) drop-shadow(0 0 48px rgba(45, 212, 191, 0.22))',
            }}
          />
        </div>
      </footer>

      {/* Nút hành động nhanh nổi 3D (Floating Quick-Access Pill) */}
      {showFloatBtn && (
        <a href="#dang-ky" className="wl-float-pill" aria-label="Đăng ký nhận quyền truy cập sớm">
          <Sparkles size={16} />
          <span>Giữ chỗ VIP Early Access</span>
          <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
}
