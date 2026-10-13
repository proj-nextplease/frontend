import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronDown,
  Copy, FolderOpen, Layers, ShieldCheck, Sparkles, Star,
  Trophy, Users, Zap, RefreshCw, Menu, X, Phone, Mail, MapPin,
  MailCheck, Award, Eye, CreditCard,
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
  INK, SURFACE, SURFACE_HI, HAIRLINE, LINE, LINE_STRONG,
  EMERALD, EMERALD_BRIGHT, NEON_RGB, TEAL_ACCENT,
  ON_DARK, MUTED, GLOW_SM, GLOW_MD, GLOW_LG,
} from '../styles/neonPalette.js';

/* ──────────────────────────────────────────────────────────────────────────
   Trang Waitlist / Early Access — Phiên bản 3D Animation & Visual Cao Cấp:
   - Header & Footer hoàn toàn độc lập, chỉ trỏ anchor nội bộ (#ve-fonlio,
     #gia-tri, #cach-hoat-dong, #danh-cho-ai, #faq, #dang-ky)
   - Hero 3D Stage: Chuyển đổi linh hoạt giữa EnvelopeArt 3D sống động
     (bức thư Fonlio gửi sinh viên) và Hồ sơ Mẫu Verified Proof 3D tương tác
   - Real-time Mouse-tracking 3D Tilt Physics & Specular Glare trên mọi thẻ
   - 3D Floating Orbital Rings & Gyroscopic Rings phát sáng đa chiều
   - Hiệu ứng chiều sâu đa tầng (Layered Z-axis Parallax: translateZ)
   - Form đăng ký hiện đại, pháo hoa giấy Confetti và vé VIP chúc mừng
   ────────────────────────────────────────────────────────────────────────── */

const PROBLEMS = [
  {
    num: '01',
    title: 'Kinh nghiệm nằm rải rác khắp nơi',
    desc: 'Slide thuyết trình, sản phẩm thiết kế, chứng nhận CLB và link bài viết nằm tản mác trong Google Drive, Canva, Facebook... Đến lúc nộp thực tập thì cuống cuồng đi tìm lại.',
    solution: 'FONLIO gom tất cả về một đường dẫn hồ sơ duy nhất mang tên bạn.',
  },
  {
    num: '02',
    title: 'Làm việc nhóm khó chứng minh vai trò cá nhân',
    desc: 'Dự án có 5 người, ai cũng để tên trên báo cáo. Nhà tuyển dụng không thể biết bạn thực sự đóng góp 80% công sức hay chỉ là người đứng tên hỗ trợ.',
    solution: 'Đính kèm sản phẩm thực tế và tỷ lệ đóng góp minh bạch cho từng dự án.',
  },
  {
    num: '03',
    title: 'CV tự khai thiếu độ tin cậy đối với doanh nghiệp',
    desc: 'Ai cũng có thể tự viết "Kỹ năng lãnh đạo 5 sao" hoặc "Tổ chức sự kiện 1000 người". Nhà tuyển dụng ngày càng hoài nghi các dòng text tự đánh bóng trong CV giấy.',
    solution: 'Cơ chế Verified Proof of Work: người giao việc trực tiếp đóng dấu bảo chứng.',
  },
];

const VALUES = [
  {
    tag: 'CREATE',
    icon: <Layers size={24} />,
    title: 'Tạo portfolio',
    desc: 'Dựng portfolio chuyên nghiệp từ dự án, sản phẩm và vai trò của bạn, theo một cấu trúc rõ ràng, dễ chia sẻ.',
    highlights: ['Link cá nhân riêng', 'Giao diện chuẩn Recruiter', 'Chia sẻ 1-click lên Bio'],
  },
  {
    tag: 'ORGANIZE',
    icon: <FolderOpen size={24} />,
    title: 'Hệ thống hóa kinh nghiệm',
    desc: 'Gom dự án, hoạt động ngoại khóa và trải nghiệm rời rạc về một nơi, để bạn luôn có sẵn khi cần.',
    highlights: ['Hub dự án tập trung', 'Lưu trữ tài liệu & sản phẩm', 'Bộ lọc chuyên môn rõ ràng'],
  },
  {
    tag: 'VERIFY',
    icon: <ShieldCheck size={24} />,
    title: 'Gắn bằng chứng, hỗ trợ xác thực',
    desc: 'Gắn bằng chứng cho từng dự án và mời người liên quan xác nhận vai trò, đóng góp của bạn.',
    highlights: ['Verified Proof of Work', 'Tăng 3x độ tin cậy', 'Tích lũy Reputation Score'],
  },
];

const STEPS = [
  {
    step: '01',
    keyword: 'Khởi tạo',
    title: 'Tạo hồ sơ cá nhân',
    body: 'Giới thiệu bản thân, lĩnh vực chuyên môn và mục tiêu nghề nghiệp để nhận đường dẫn riêng.',
    tag: '3 phút khởi tạo',
  },
  {
    step: '02',
    keyword: 'Dự án',
    title: 'Thêm dự án & kết quả',
    body: 'Ghi lại dự án, vai trò, sản phẩm và những kết quả bạn đã tạo ra kèm ảnh minh họa.',
    tag: 'Không cần đợi CV giấy',
  },
  {
    step: '03',
    keyword: 'Bảo chứng',
    title: 'Gắn bằng chứng',
    body: 'Đính kèm sản phẩm thật và mời người liên quan xác nhận vai trò khi bạn sẵn sàng.',
    tag: 'Xác thực minh bạch',
  },
  {
    step: '04',
    keyword: 'Chia sẻ',
    title: 'Xuất bản & chia sẻ',
    body: 'Xuất bản portfolio và gửi đường link cho nhà tuyển dụng hoặc đối tác xem ngay.',
    tag: 'Nổi bật giữa hàng trăm CV',
  },
];

const AUDIENCES = [
  {
    role: 'Sinh viên',
    highlight: 'Dành cho người năng nổ',
    body: 'Đang làm CLB, tổ chức sự kiện, tham gia cuộc thi hay dự án học thuật? Gom lại thành một hồ sơ để sẵn sàng khi ứng tuyển thực tập.',
    perk: 'Dựng hồ sơ sớm trước mùa thực tập',
  },
  {
    role: 'Thực tập sinh & Người mới đi làm',
    highlight: 'Dành cho người bứt phá',
    body: 'Mới có vài dự án đầu tay vẫn đáng được trình bày bài bản. Cho thấy bạn đã làm gì, đóng góp ra sao thay vì một trang CV chữ khô khan.',
    perk: 'Gây ấn tượng mạnh với Hiring Manager',
  },
  {
    role: 'Freelancer & Cộng tác viên',
    highlight: 'Dành cho người làm tự do',
    body: 'Nhiều khách hàng, nhiều dự án nhỏ lẻ? Gom về một nơi, gắn bằng chứng để khách mới nhìn là hiểu năng lực của bạn.',
    perk: 'Chốt khách hàng với sản phẩm thật',
  },
  {
    role: 'Người làm nghề ở mọi lĩnh vực',
    highlight: 'Dành cho người đa ngành',
    body: 'Dù bạn làm Marketing, Thiết kế, Công nghệ, Kinh doanh hay lĩnh vực khác, dự án và sản phẩm của bạn cần một chỗ đứng đẹp và đáng tin hơn một thư mục Drive.',
    perk: 'Chứng minh năng lực qua sản phẩm',
  },
];

const PERKS_LIST = [
  {
    icon: <Zap size={20} />,
    title: 'Quyền trải nghiệm MVP đầu tiên',
    desc: 'Được cấp quyền truy cập sớm nhất phiên bản Fonlio thử nghiệm ngay khi mở đợt Early Access.',
  },
  {
    icon: <Trophy size={20} />,
    title: 'Huy hiệu Founding Member vĩnh viễn',
    desc: 'Được gắn huy hiệu thành viên tiên phong trên trang cá nhân kèm điểm uy tín (RS) khởi đầu.',
  },
  {
    icon: <Star size={20} />,
    title: 'Tùy biến giao diện VIP trọn đời cho Top 10',
    desc: '10 bạn đăng ký sớm nhất nhận gói tài khoản VIP nhất của Fonlio cùng quà tặng từ các đối tác.',
  },
  {
    icon: <Users size={20} />,
    title: 'Ưu tiên kết nối với Nhà tuyển dụng',
    desc: 'Hồ sơ của bạn được đưa vào danh sách ưu tiên xem xét trong các đợt tuyển thực tập đối tác.',
  },
];

const FAQS = [
  {
    q: 'FONLIO là gì?',
    a: 'FONLIO là nền tảng tạo portfolio, lưu trữ và xác thực kinh nghiệm dành cho đa dạng ngành nghề. FONLIO giúp bạn biến các dự án, sản phẩm sáng tạo, hoạt động ngoại khoá và trải nghiệm rời rạc thành một hồ sơ năng lực có cấu trúc, có bằng chứng và có thể chia sẻ.',
  },
  {
    q: 'FONLIO có dành cho sinh viên chưa có nhiều kinh nghiệm không?',
    a: 'Có. Sinh viên và người mới bắt đầu là nhóm mà FONLIO hướng tới. Dù bạn mới có vài hoạt động CLB, một cuộc thi hay một dự án học thuật, đó đều là điểm xuất phát tốt để bắt đầu portfolio.',
  },
  {
    q: 'Tôi có cần portfolio sẵn có để đăng ký không?',
    a: 'Không. Bạn chỉ cần điền form đăng ký. Việc xây portfolio sẽ làm khi bạn trải nghiệm FONLIO.',
  },
  {
    q: 'Xác thực kinh nghiệm trên FONLIO nghĩa là gì?',
    a: 'Bạn gắn bằng chứng (sản phẩm, đường link, tài liệu) vào dự án và mời người liên quan, chẳng hạn trưởng nhóm hoặc người quản lý, xác nhận vai trò và đóng góp của bạn. Đây là cơ chế hỗ trợ tăng độ tin cậy cho hồ sơ. Không phải mọi thông tin đều được xác thực tự động, và bạn không cần xác thực tất cả dự án ngay từ đầu.',
  },
  {
    q: 'Đăng ký waitlist có mất phí không?',
    a: 'Đăng ký danh sách chờ hoàn toàn miễn phí. FONLIO hiện chưa công bố bảng giá hay các gói dịch vụ chính thức, và chúng mình sẽ thông báo chi tiết đến bạn khi có kế hoạch cụ thể.',
  },
  {
    q: 'Sau khi đăng ký, tôi sẽ nhận được thông tin gì?',
    a: 'Chúng mình sẽ gửi đến bạn những cập nhật mới nhất về chương trình Early Access cùng quyền trải nghiệm phiên bản MVP của FONLIO trong thời gian sớm nhất. Đặc biệt, 10 bạn đăng ký sớm nhất sẽ được tạo portfolio bản VIP nhất của FONLIO, cùng các phần quà từ các đơn vị hợp tác.',
  },
];

const CAREER_STAGES = [
  'Sinh viên năm 1 - 2',
  'Sinh viên năm 3 - 4',
  'Mới tốt nghiệp / Thực tập sinh',
  'Freelancer / Tự do',
  'Đã đi làm 1–2 năm',
];

const SPECIALIZATIONS = [
  'Marketing / Truyền thông / PR',
  'Content / Copywriting',
  'Design / UI/UX / Video Creative',
  'Sự kiện / Quản lý CLB / Activation',
  'Công nghệ thông tin / Lập trình',
  'Kinh doanh / Sales / Tài chính',
  'Giáo dục / Nhân sự / Ngoại ngữ',
  'Khác / Đang khám phá định hướng',
];

const PROJECT_COUNTS = [
  'Chưa có dự án nào (đang bắt đầu)',
  '1 – 3 dự án / hoạt động',
  '4 – 8 dự án / hoạt động',
  'Trên 8 dự án thực tế',
];

const CHALLENGES = [
  'Kinh nghiệm và sản phẩm nằm rải rác nhiều nơi',
  'Chưa biết cách trình bày portfolio sao cho chuyên nghiệp',
  'Khó chứng minh vai trò và đóng góp cá nhân trong nhóm',
  'Chưa có nhiều kinh nghiệm nên không biết bắt đầu từ đâu',
];

const BETA_INTERESTS = [
  'Muốn tham gia thử nghiệm và góp ý tính năng MVP',
  'Có thể tham gia thử nghiệm nếu sắp xếp được thời gian',
  'Chỉ muốn nhận thông báo khi nền tảng chính thức ra mắt',
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  careerStage: '',
  specialization: '',
  projectCount: '',
  mainChallenge: '',
  betaInterest: '',
  emailConsent: false,
  botField: '',
};

/* Scroll Reveal Helper Component */
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
      { threshold: 0.1 },
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

/* ──────────────────────────────────────────────────────────────────────────
   3D MOUSE-TILT PHYSICS CONTAINER COMPONENT
   Tạo hiệu ứng nghiêng 3D thực tế theo vị trí con trỏ chuột + Quầng sáng phản chiếu Specular Glare
   ────────────────────────────────────────────────────────────────────────── */
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
      opacity: 0.32,
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

/* Vòng quỹ đạo không gian 3D quay liên tục phía sau Hero */
function Floating3DRing({ size = 280, style = {} }) {
  return (
    <div
      className="wl-3d-orbit"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        position: 'absolute',
        pointerEvents: 'none',
        ...style,
      }}
    >
      <div className="wl-3d-ring-inner" />
      <div className="wl-3d-ring-outer" />
    </div>
  );
}

/* Deterministic Confetti particles for success celebration */
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

/* Logo fonlio chính thức dùng chung với Header & Footer của trang chủ */
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
  const [heroView, setHeroView] = useState('envelope'); // 'envelope' | 'vip' | 'portfolio'
  const [showFloatBtn, setShowFloatBtn] = useState(false);
  const successRef = useRef(null);

  // Fetch live waitlist count from backend
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

  // Sticky header background transition on scroll & quick action button
  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 24);
      setShowFloatBtn(window.scrollY > 480);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus success message when status changes to 'done'
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

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Vui lòng điền họ và tên của bạn.';
    if (!form.email.trim()) {
      next.email = 'Vui lòng cung cấp địa chỉ email.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) {
      next.email = 'Email chưa đúng định dạng (ví dụ: ban@domain.com).';
    }
    if (!form.careerStage) next.careerStage = 'Hãy chọn một giai đoạn phù hợp với bạn.';
    if (!form.emailConsent) next.emailConsent = 'Cần đồng ý nhận email để chúng mình gửi thông tin Early Access.';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
      await joinWaitlist({ ...form, source: 'waitlist-web' });
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

  return (
    <div className="wl np-neon" id="top">
      {/* Ambient Dynamic Neon Bloom */}
      <NeonBloom />

      {/* ── HEADER RIÊNG BIỆT DÀNH CHO WAITLIST (KHÔNG TRỎ VỀ HOMEPAGE CHÍNH) ── */}
      <header className={`wl-custom-header ${headerScrolled ? 'is-scrolled' : ''}`}>
        <div className="wl-inner wl-header-inner">
          <FonlioBrandLogo />

          {/* Desktop Nav: Chỉ trỏ tới các anchor trong trang Waitlist */}
          <nav className="wl-header-nav" aria-label="Điều hướng chính Waitlist">
            <a href="#ve-fonlio" className="wl-nav-link">Về FONLIO</a>
            <a href="#gia-tri" className="wl-nav-link">Giá trị</a>
            <a href="#cach-hoat-dong" className="wl-nav-link">Cách hoạt động</a>
            <a href="#danh-cho-ai" className="wl-nav-link">Dành cho ai</a>
            <a href="#faq" className="wl-nav-link">FAQ</a>
            <a href="#dang-ky" className="wl-btn wl-btn-primary wl-btn-sm">
              Tham gia Waitlist
            </a>
          </nav>

          {/* Nút Mobile Toggle */}
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
              <a href="#gia-tri" onClick={() => setMobileMenuOpen(false)}>Giá trị cốt lõi</a>
              <a href="#cach-hoat-dong" onClick={() => setMobileMenuOpen(false)}>Cách hoạt động</a>
              <a href="#danh-cho-ai" onClick={() => setMobileMenuOpen(false)}>Dành cho ai</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#dang-ky" className="wl-btn wl-btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ width: '100%', marginTop: 8 }}>
                Tham gia Waitlist <ArrowRight size={18} />
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
          width: min(1180px, calc(100% - 40px));
          margin-inline: auto;
          position: relative;
          z-index: 2;
        }

        .wl-band {
          padding-block: clamp(68px, 9vw, 116px);
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
          font-size: 0.96rem;
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
          font-weight: 800;
          text-transform: uppercase;
          line-height: 1.02;
          letter-spacing: -0.022em;
          font-size: clamp(2.7rem, 6.8vw, 5.2rem);
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
          font-size: clamp(1.85rem, 3.4vw, 2.5rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: ${ON_DARK};
          margin: 0 0 16px;
        }
        .wl-section-title em {
          font-style: normal;
          color: ${EMERALD};
        }

        .wl-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.12em;
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
          font-size: 1.15rem;
          line-height: 1.6;
          color: ${MUTED};
          margin: 0 0 32px;
          max-width: 62ch;
        }

        /* ── NÚT (PILL BUTTONS - MATCH HOMEPAGE) ────────────────────────── */
        .wl-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 999px;
          padding: 16px 30px;
          font-size: 1.02rem;
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
          font-size: 0.9rem;
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
        .wl-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .wl-btn-ghost {
          background: rgba(255, 255, 255, 0.03);
          color: ${ON_DARK};
          border-color: ${HAIRLINE};
        }
        .wl-btn-ghost:hover {
          border-color: ${EMERALD};
          background: rgba(185, 255, 0, 0.08);
          color: ${EMERALD};
          transform: translateY(-2px);
        }

        /* ── HERO SECTION & 3D INTERACTIVE STAGE ─────────────────────────── */
        .wl-hero {
          position: relative;
          overflow: hidden;
          padding-top: clamp(130px, 14vw, 185px);
          padding-bottom: clamp(64px, 8vw, 100px);
          scroll-margin-top: 80px;
        }
        .wl-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.05fr);
          gap: clamp(32px, 4.5vw, 64px);
          align-items: center;
        }
        .wl-hero-copy {
          text-align: left;
        }
        .wl-hero-sub {
          margin: clamp(20px, 2.8vw, 28px) 0 16px;
          font-size: clamp(1.15rem, 1.8vw, 1.35rem);
          font-weight: 500;
          line-height: 1.45;
          color: ${ON_DARK};
        }
        .wl-hero-note {
          margin: 0 0 clamp(28px, 3.4vw, 36px);
          font-size: 1.05rem;
          line-height: 1.6;
          color: ${MUTED};
          max-width: 52ch;
        }
        .wl-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
        }

        /* Pill Badge Live Counter */
        .wl-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid ${HAIRLINE};
          color: ${MUTED};
          margin-bottom: 22px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
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

        /* ── 3D HERO STAGE & TABS ────────────────────────────────────────── */
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
          background: rgba(15, 19, 24, 0.8);
          border: 1px solid ${HAIRLINE};
          margin-bottom: 20px;
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
        .wl-envelope-stage {
          width: 100%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: npFloatStage 6s ease-in-out infinite alternate;
        }
        @keyframes npFloatStage {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.4deg); }
          100% { transform: translateY(3px) rotate(-0.3deg); }
        }

        /* Floating 3D Badges around Hero Art */
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

        /* ── 3D GYROSCOPIC ORBITAL RINGS ─────────────────────────────────── */
        .wl-3d-orbit {
          border-radius: 50%;
          border: 2px dashed rgba(${NEON_RGB}, 0.2);
          box-shadow: 0 0 35px rgba(${NEON_RGB}, 0.15), inset 0 0 25px rgba(${NEON_RGB}, 0.08);
          animation: npSpin3DOrbit 20s linear infinite;
        }
        .wl-3d-ring-inner {
          position: absolute;
          inset: 18%;
          border-radius: 50%;
          border: 1.5px solid rgba(45, 212, 191, 0.25);
          animation: npSpin3DOrbitRev 14s linear infinite;
        }
        .wl-3d-ring-outer {
          position: absolute;
          inset: -12%;
          border-radius: 50%;
          border: 1px dotted rgba(255, 255, 255, 0.12);
        }
        @keyframes npSpin3DOrbit {
          0% { transform: rotateX(68deg) rotateY(18deg) rotateZ(0deg); }
          100% { transform: rotateX(68deg) rotateY(18deg) rotateZ(360deg); }
        }
        @keyframes npSpin3DOrbitRev {
          0% { transform: rotateX(45deg) rotateY(-25deg) rotateZ(360deg); }
          100% { transform: rotateX(45deg) rotateY(-25deg) rotateZ(0deg); }
        }

        /* ── MOCKUP GIAO DIỆN PORTFOLIO 3D TƯƠNG TÁC ─────────────────────── */
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
        .wl-mock-badge.none {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.6);
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
          font-size: 0.82rem;
          color: ${MUTED};
          margin-top: 14px;
        }

        /* ── SECTION PARTNERS MARQUEE ────────────────────────────────────── */
        .wl-partners-section {
          padding-block: 54px;
          border-top: 1px solid ${HAIRLINE};
          border-bottom: 1px solid ${HAIRLINE};
          background: rgba(15, 19, 24, 0.4);
          text-align: center;
        }
        .wl-partners-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: ${MUTED};
          margin-bottom: 28px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── THẺ NỘI DUNG VỚI CHIỀU SÂU 3D ──────────────────────────────── */
        .wl-card {
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 32px 30px;
          border-radius: 24px;
          border: 1px solid ${HAIRLINE};
          background: ${SURFACE};
          color: ${ON_DARK};
          transition: border-color 280ms ease, background-color 280ms ease, box-shadow 300ms ease;
          height: 100%;
        }
        .wl-card::after {
          content: '';
          position: absolute;
          right: -30%;
          bottom: -40%;
          width: 80%;
          height: 120%;
          background: radial-gradient(closest-side, rgba(${NEON_RGB}, 0.16), transparent 70%);
          opacity: 0;
          transition: opacity 320ms ease;
          pointer-events: none;
        }
        .wl-tilt-wrap:hover .wl-card {
          border-color: rgba(${NEON_RGB}, 0.55);
          background-color: ${SURFACE_HI};
          box-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.7), ${GLOW_SM};
        }
        .wl-tilt-wrap:hover .wl-card::after {
          opacity: 1;
        }

        .wl-card-ic {
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: rgba(185, 255, 0, 0.1);
          color: ${EMERALD};
          margin-bottom: 20px;
          border: 1px solid rgba(185, 255, 0, 0.22);
          transition: transform 260ms ease, background 260ms ease;
          transform: translateZ(28px);
        }
        .wl-tilt-wrap:hover .wl-card-ic {
          transform: translateZ(36px) scale(1.1);
          background: rgba(185, 255, 0, 0.2);
        }

        .wl-card-tag {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: ${EMERALD};
          text-transform: uppercase;
          margin-bottom: 8px;
          transform: translateZ(22px);
        }

        .wl-card h3 {
          font-family: inherit;
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.015em;
          color: ${ON_DARK};
          margin: 0 0 12px;
          transform: translateZ(18px);
        }
        .wl-card p {
          font-size: 1.02rem;
          line-height: 1.6;
          color: ${MUTED};
          margin: 0;
          transform: translateZ(14px);
        }

        /* Lưới Card */
        .wl-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }
        .wl-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        .wl-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        /* ── VẤN ĐỀ (PROBLEM VS SOLUTION CARDS 3D) ───────────────────────── */
        .wl-prob-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 30px;
          border-radius: 24px;
          background: ${SURFACE};
          border: 1px solid ${HAIRLINE};
          transition: border-color 260ms ease, background-color 260ms ease;
          overflow: hidden;
          height: 100%;
        }
        .wl-tilt-wrap:hover .wl-prob-card {
          border-color: rgba(255, 255, 255, 0.25);
          background-color: ${SURFACE_HI};
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }
        .wl-prob-num {
          font-family: 'Archivo', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1;
          color: rgba(255, 255, 255, 0.08);
          margin-bottom: 12px;
          transition: color 260ms ease;
          transform: translateZ(8px);
        }
        .wl-tilt-wrap:hover .wl-prob-num {
          color: rgba(${NEON_RGB}, 0.28);
        }
        .wl-prob-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: ${ON_DARK};
          margin-bottom: 10px;
          transform: translateZ(22px);
        }
        .wl-prob-desc {
          font-size: 0.98rem;
          line-height: 1.55;
          color: ${MUTED};
          margin-bottom: 20px;
          transform: translateZ(14px);
        }
        .wl-prob-solution {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          font-size: 0.92rem;
          line-height: 1.5;
          color: ${EMERALD};
          display: flex;
          align-items: flex-start;
          gap: 8px;
          transform: translateZ(26px);
        }
        .wl-prob-solution svg {
          flex: none;
          margin-top: 2px;
        }

        /* ── BỐN BƯỚC (STEPS WITH 3D DEPTH) ─────────────────────────────── */
        .wl-step-card {
          position: relative;
          overflow: hidden;
          padding: 32px 28px;
          border-radius: 24px;
          background: ${SURFACE};
          border: 1px solid rgba(${NEON_RGB}, 0.16);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: border-color 260ms ease, background 260ms ease;
          height: 100%;
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
          font-size: clamp(2.2rem, 3.8vw, 3rem);
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
          font-size: 0.98rem;
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
          transition: color 260ms ease;
          transform: translateZ(-8px);
        }
        .wl-tilt-wrap:hover .wl-step-ghost {
          color: rgba(${NEON_RGB}, 0.14);
        }
        .wl-step-card > *:not(.wl-step-ghost) {
          position: relative;
          z-index: 1;
        }

        /* ── HIGHLIGHT PERKS & TOP 10 VIP BOX ────────────────────────────── */
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
          width: 44px;
          height: 44px;
          border-radius: 12px;
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

        /* Form Fields */
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
          letter-spacing: -0.015em;
          outline: none;
          transition: border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
        }
        .wl input::placeholder {
          color: rgba(233, 247, 242, 0.3);
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
        .wl-select option {
          background: ${SURFACE_HI};
          color: ${ON_DARK};
        }

        /* Radio Choice Chips */
        .wl-choices {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .wl-choice {
          padding: 10px 18px;
          border-radius: 999px;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid ${HAIRLINE};
          color: ${MUTED};
          transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease, transform 160ms ease;
        }
        .wl-choice:hover {
          border-color: ${EMERALD};
          background: rgba(185, 255, 0, 0.1);
          color: ${ON_DARK};
          transform: translateY(-1px);
        }
        .wl-choice.on {
          background: ${EMERALD};
          border-color: ${EMERALD};
          color: ${INK};
          font-weight: 800;
          box-shadow: ${GLOW_SM};
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
          box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
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
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .wl-submit {
          width: 100%;
          padding: 18px;
          font-size: 1.1rem;
        }

        /* ── CELEBRATION TICKET ON SUCCESS ───────────────────────────────── */
        .wl-success-card {
          padding: 40px 28px;
          text-align: center;
          position: relative;
          overflow: hidden;
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

        .wl-success-ticket {
          margin-top: 28px;
          padding: 24px;
          border-radius: 20px;
          background: rgba(185, 255, 0, 0.08);
          border: 1px solid rgba(185, 255, 0, 0.35);
          text-align: left;
        }
        .wl-share-bar {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 26px;
          flex-wrap: wrap;
        }

        /* ── FAQ SECTION ─────────────────────────────────────────────────── */
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
          transition: border-color 240ms ease, background-color 240ms ease, box-shadow 240ms ease;
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
          letter-spacing: -0.01em;
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

        /* ── FOOTER CHUYÊN BIỆT CHO WAITLIST ─────────────────────────────── */
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
          letter-spacing: -0.01em;
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

        /* ── 3D ENVELOPE TILT STAGE WRAPPER ──────────────────────────────── */
        .wl-envelope-stage-tilt {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── 3D STEP PIPELINE CONNECTOR BEAM ─────────────────────────────── */
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

        /* ── NÚT HÀNH ĐỘNG NHANH NỔI 3D (FLOATING QUICK-ACCESS PILL) ─────── */
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
          .wl-hero-actions {
            justify-content: center;
          }
          .wl-form-shell {
            grid-template-columns: minmax(0, 1fr);
          }
          .wl-grid-3, .wl-grid-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .wl-perks-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .wl-footer-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 36px;
          }
          .wl-header-nav {
            display: none;
          }
          .wl-menu-toggle {
            display: block;
          }
          .wl-step-pipeline {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .wl-grid-3, .wl-grid-2, .wl-grid-4, .wl-field-row {
            grid-template-columns: minmax(0, 1fr);
          }
          .wl-hero-actions .wl-btn {
            width: 100%;
          }
          .wl-top10-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .wl-card {
            padding: 24px 20px;
          }
          .wl-footer-bottom {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .wl-float-pill {
            bottom: 16px;
            right: 16px;
            left: 16px;
            justify-content: center;
            padding: 12px 20px;
            font-size: 0.88rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wl-3d-orbit, .wl-stage-badge, .wl-pulse-dot::after, .wl-particles span, .wl-envelope-stage, .wl-step-beam {
            animation: none !important;
          }
          .wl-tilt-wrap {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ── 1. HERO SECTION & 3D INTERACTIVE STAGE ───────────────────────── */}
      <section className="wl-hero">
        {/* Interactive 3D WebGL Three.js Universe */}
        <Waitlist3DScene />
        <HeroMesh fade={false} veilOpacity={0.88} />
        {/* Vòng quay không gian 3D lơ lửng phía sau Hero */}
        <Floating3DRing size={360} style={{ top: '8%', right: '2%', opacity: 0.6 }} />

        <div className="wl-inner">
          <div className="wl-hero-grid">
            <Reveal>
              <div className="wl-hero-copy">
                <div className="wl-live-pill">
                  <span className="wl-pulse-dot" />
                  <span>
                    Early Access: Top 10 đăng ký sớm nhận ưu đãi đặc biệt · <b>{displayCount}</b> bạn đã giữ chỗ
                  </span>
                </div>

                <h1 className="wl-display">
                  Foundation Of<br />
                  <em>Your Next</em><br />
                  Journey
                </h1>

                <p className="wl-hero-sub">
                  Đừng chỉ kể bạn đã làm gì. Hãy cho thấy bạn đã tạo ra điều gì.
                </p>

                <p className="wl-hero-note">
                  FONLIO giúp bạn xây dựng portfolio, lưu trữ dự án và từng bước xác thực những trải nghiệm thực tế đa ngành.
                </p>

                <div className="wl-hero-actions">
                  <a className="wl-btn wl-btn-primary" href="#dang-ky">
                    Tham gia danh sách chờ <ArrowRight size={18} />
                  </a>
                  <a className="wl-btn wl-btn-ghost" href="#ve-fonlio">
                    Khám phá FONLIO
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Cột phải: 3D Interactive Stage (EnvelopeArt & HoloVIPCard & Portfolio Mockup) */}
            <Reveal delay={150}>
              <div className="wl-hero-stage-wrap">
                {/* Bộ chuyển tab 3D Stage */}
                <div className="wl-stage-switcher" role="tablist" aria-label="Chế độ xem minh họa 3D">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={heroView === 'envelope'}
                    className={`wl-stage-tab${heroView === 'envelope' ? ' on' : ''}`}
                    onClick={() => setHeroView('envelope')}
                  >
                    <MailCheck size={16} /> Bức thư gửi bạn
                  </button>
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
                    aria-selected={heroView === 'portfolio'}
                    className={`wl-stage-tab${heroView === 'portfolio' ? ' on' : ''}`}
                    onClick={() => setHeroView('portfolio')}
                  >
                    <Eye size={16} /> Hồ sơ mẫu bảo chứng
                  </button>
                </div>

                {heroView === 'envelope' ? (
                  /* 3D Envelope Art Stage với các sticker và huy hiệu nhấp nhô */
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
                    <p className="wl-mock-note">Rê chuột để cảm nhận bức thư 3D đa tầng &amp; ánh sáng phản chiếu.</p>
                  </TiltCard>
                ) : heroView === 'vip' ? (
                  /* 3D Interactive Holographic VIP Pass */
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <HoloVIPCard
                      name={form.fullName || 'BẠN (EARLY ADOPTER)'}
                      code={ticketCode || '#FL-2026-VIP'}
                      tier="TOP 10 VIP FOUNDER"
                    />
                    <p className="wl-mock-note" style={{ marginTop: 14 }}>
                      Rê chuột để kích hoạt hiệu ứng 3D Holographic &amp; ánh kim đổi màu theo góc nhìn.
                    </p>
                  </div>
                ) : (
                  /* 3D Tilt Portfolio Mockup có phản chiếu ánh sáng Specular Glare */
                  <TiltCard maxTilt={14} className="wl-mock-shell">
                    <div className="wl-mock-card" aria-label="Hình minh họa giao diện portfolio FONLIO 3D">
                      <div className="wl-mock-profile">
                        <div className="wl-mock-avatar">TB</div>
                        <div className="wl-mock-info">
                          <b>Tên của bạn</b>
                          <small>Chuyên ngành của bạn · Portfolio mẫu</small>
                        </div>
                      </div>

                      <div className="wl-mock-projects">
                        <div className="wl-mock-item">
                          <div className="wl-mock-row">
                            <div>
                              <h4>Dự án nghiên cứu thị trường</h4>
                              <p>Vai trò: Trưởng nhóm</p>
                            </div>
                            <span className="wl-mock-badge ok">✓ Đã xác nhận</span>
                          </div>
                          <div className="wl-mock-tags">
                            <span className="wl-mock-tag">Nghiên cứu</span>
                            <span className="wl-mock-tag proof">Bằng chứng: báo cáo &amp; số liệu</span>
                          </div>
                        </div>

                        <div className="wl-mock-item">
                          <div className="wl-mock-row">
                            <div>
                              <h4>Sự kiện kết nối cộng đồng</h4>
                              <p>Vai trò: Điều phối chương trình</p>
                            </div>
                            <span className="wl-mock-badge wait">⏳ Chờ xác nhận</span>
                          </div>
                          <div className="wl-mock-tags">
                            <span className="wl-mock-tag">Event</span>
                            <span className="wl-mock-tag proof">Bằng chứng: ảnh &amp; link</span>
                          </div>
                        </div>

                        <div className="wl-mock-item">
                          <div className="wl-mock-row">
                            <div>
                              <h4>Ứng dụng quản lý học tập</h4>
                              <p>Vai trò: Thiết kế giao diện</p>
                            </div>
                            <span className="wl-mock-badge none">Chưa xác thực</span>
                          </div>
                          <div className="wl-mock-tags">
                            <span className="wl-mock-tag">Công nghệ</span>
                            <span className="wl-mock-tag">Có thể thêm bằng chứng sau</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="wl-mock-note">Rê chuột để cảm nhận hiệu ứng nghiêng 3D &amp; ánh sáng phản chiếu.</p>
                  </TiltCard>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 2. PARTNERS / TRUST MARQUEE ─────────────────────────────────── */}
      <section className="wl-partners-section">
        <div className="wl-inner">
          <p className="wl-partners-title">
            Đồng hành cùng mạng lưới các CLB, tổ chức sinh viên và đối tác tuyển dụng
          </p>
        </div>
        <PartnerLogos onDark colorLogos showHeading={false} />
      </section>

      {/* ── 3. VẤN ĐỀ CỦA CV TRUYỀN THỐNG (3D TILT CARDS) ────────────────── */}
      <section className="wl-band" id="ve-fonlio">
        <div className="wl-inner">
          <Reveal>
            <span className="wl-eyebrow">Về FONLIO</span>
            <h2 className="wl-section-title">Bạn đã làm nhiều hơn những gì <em>CV</em> có thể kể.</h2>
            <p className="wl-lead">
              Mình hiểu cảm giác đó: làm nhiều thứ hay ho nhưng khi cần trình bày thì không biết bắt đầu từ đâu. FONLIO sinh ra để giải quyết đúng chuyện này.
            </p>
          </Reveal>

          <div className="wl-grid-3" style={{ marginTop: 36 }}>
            {PROBLEMS.map((prob, idx) => (
              <Reveal key={prob.num} delay={idx * 100}>
                <TiltCard maxTilt={10}>
                  <div className="wl-prob-card">
                    <span className="wl-prob-num">{prob.num}</span>
                    <h3 className="wl-prob-title">{prob.title}</h3>
                    <p className="wl-prob-desc">{prob.desc}</p>
                    <div className="wl-prob-solution">
                      <CheckCircle2 size={16} />
                      <span><b>Giải pháp FONLIO:</b> {prob.solution}</span>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. BA GIÁ TRỊ CỐT LÕI (3D PERSPECTIVE CARDS) ─────────────────── */}
      <section className="wl-band" id="gia-tri">
        <div className="wl-inner">
          <Reveal>
            <span className="wl-eyebrow">Giá trị cốt lõi</span>
            <h2 className="wl-section-title">Ba việc FONLIO giúp bạn: <em>Create, Organize, Verify.</em></h2>
            <p className="wl-lead">
              Không cần kinh nghiệm đi làm từ trước, FONLIO giúp bạn thiết lập một danh tính nghề nghiệp vững chắc ngay từ thời sinh viên.
            </p>
          </Reveal>

          <div className="wl-grid-3" style={{ marginTop: 36 }}>
            {VALUES.map((val, idx) => (
              <Reveal key={val.tag} delay={idx * 120}>
                <TiltCard maxTilt={12}>
                  <article className="wl-card">
                    <span className="wl-card-ic">{val.icon}</span>
                    <span className="wl-card-tag">{val.tag}</span>
                    <h3>{val.title}</h3>
                    <p>{val.desc}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20, transform: 'translateZ(24px)' }}>
                      {val.highlights.map((h) => (
                        <span
                          key={h}
                          style={{
                            fontSize: '0.78rem',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${HAIRLINE}`,
                            color: MUTED,
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <p style={{ marginTop: 28, fontSize: '0.88rem', color: MUTED, textAlign: 'center' }}>
            Xác thực là bước bạn chủ động thực hiện cùng người xác nhận phù hợp. Không phải mọi thông tin trên FONLIO đều được xác thực tự động.
          </p>
        </div>
      </section>

      {/* ── 5. BỐN BƯỚC HOẠT ĐỘNG (STEPS WITH 3D DEPTH) ─────────────────── */}
      <section className="wl-band" id="cach-hoat-dong">
        <div className="wl-inner">
          <Reveal>
            <span className="wl-eyebrow">Cách hoạt động</span>
            <h2 className="wl-section-title">Bốn bước từ <em>trải nghiệm</em> đến portfolio có bằng chứng.</h2>
            <p className="wl-lead">
              Bạn có thể bắt đầu với một portfolio cơ bản ngay, không cần xác thực tất cả dự án từ đầu. Cứ làm từng bước theo nhịp của bạn.
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

          <div className="wl-grid-4" style={{ marginTop: 36 }}>
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

      {/* ── 6. DÀNH CHO AI (AUDIENCES) ──────────────────────────────────── */}
      <section className="wl-band" id="danh-cho-ai">
        <div className="wl-inner">
          <Reveal>
            <span className="wl-eyebrow">Dành cho ai</span>
            <h2 className="wl-section-title">FONLIO đồng hành cùng <em>mọi giai đoạn</em> của bạn.</h2>
          </Reveal>

          <div className="wl-grid-2" style={{ marginTop: 36 }}>
            {AUDIENCES.map((aud, idx) => (
              <Reveal key={aud.role} delay={idx * 100}>
                <TiltCard maxTilt={10}>
                  <article className="wl-card">
                    <span className="wl-card-tag">{aud.highlight}</span>
                    <h3>{aud.role}</h3>
                    <p style={{ marginBottom: 18 }}>{aud.body}</p>
                    <div
                      style={{
                        marginTop: 'auto',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: 'rgba(185, 255, 0, 0.08)',
                        border: '1px solid rgba(185, 255, 0, 0.25)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: EMERALD,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transform: 'translateZ(24px)',
                      }}
                    >
                      <Check size={16} /> {aud.perk}
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. ĐẶC QUYỀN EARLY ACCESS & TOP 10 VIP ──────────────────────── */}
      <section className="wl-band" id="dac-quyen">
        <div className="wl-inner">
          <Reveal>
            <div className="wl-perks-box">
              <span className="wl-eyebrow">Đặc quyền người tiên phong</span>
              <h2 className="wl-section-title">Vì sao bạn nên tham gia danh sách chờ ngay hôm nay?</h2>
              <p className="wl-lead" style={{ marginBottom: 36 }}>
                Những thành viên đầu tiên luôn nhận được sự đồng hành sát sao và những đặc quyền không bao giờ lặp lại.
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
                  <b>10 bạn đăng ký sớm nhất</b> sẽ được tặng gói tạo portfolio chuyên nghiệp <b>bản VIP nhất</b> của FONLIO,
                  cùng các phần quà giá trị từ các đơn vị hợp tác trong hệ sinh thái!
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 8. FORM ĐĂNG KÝ (INTERACTIVE TERMINAL FORM) ─────────────────── */}
      <section className="wl-band wl-signup-wrap" id="dang-ky">
        <div className="wl-inner wl-form-shell">
          <Reveal>
            <div>
              <span className="wl-eyebrow">Early Access</span>
              <h2 className="wl-section-title">Bắt đầu xây dựng câu chuyện nghề nghiệp của bạn.</h2>
              <p className="wl-lead">
                Đăng ký danh sách chờ để nhận thông tin và cơ hội trải nghiệm FONLIO MVP sớm.
              </p>

              <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
                  <BadgeCheck size={20} color={EMERALD} />
                  <span>Chỉ mất khoảng 1 phút để điền thông tin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
                  <BadgeCheck size={20} color={EMERALD} />
                  <span>Chỉ cần họ tên và email, các câu còn lại giúp mình hiểu bạn hơn</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: MUTED }}>
                  <BadgeCheck size={20} color={EMERALD} />
                  <span>Không cần có sẵn portfolio để đăng ký</span>
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
                    {/* Bẫy Bot ẩn */}
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
                      <label htmlFor="wl-fullName">Họ và tên<em> *</em></label>
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
                      <label htmlFor="wl-email">Email<em> *</em></label>
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

                    <div className={`wl-field${errors.careerStage ? ' bad' : ''}`}>
                      <label htmlFor="wl-careerStage">Bạn đang ở giai đoạn nào?<em> *</em></label>
                      <div className="wl-choices" id="wl-careerStage" role="radiogroup" aria-label="Giai đoạn">
                        {CAREER_STAGES.map((stage) => (
                          <button
                            type="button"
                            key={stage}
                            role="radio"
                            aria-checked={form.careerStage === stage}
                            className={`wl-choice${form.careerStage === stage ? ' on' : ''}`}
                            onClick={() => update('careerStage', stage)}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                      {errors.careerStage && <p className="wl-err">{errors.careerStage}</p>}
                    </div>

                    <div className="wl-field-row">
                      <div className="wl-field">
                        <label htmlFor="wl-specialization">Lĩnh vực chuyên môn</label>
                        <div className="wl-select">
                          <select
                            id="wl-specialization"
                            value={form.specialization}
                            onChange={(e) => update('specialization', e.target.value)}
                          >
                            <option value="">Chọn lĩnh vực</option>
                            {SPECIALIZATIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} aria-hidden="true" />
                        </div>
                      </div>

                      <div className="wl-field">
                        <label htmlFor="wl-projectCount">Số dự án đã có</label>
                        <div className="wl-select">
                          <select
                            id="wl-projectCount"
                            value={form.projectCount}
                            onChange={(e) => update('projectCount', e.target.value)}
                          >
                            <option value="">Chọn số lượng</option>
                            {PROJECT_COUNTS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="wl-field">
                      <label htmlFor="wl-mainChallenge">Khó khăn lớn nhất của bạn hiện nay</label>
                      <div className="wl-select">
                        <select
                          id="wl-mainChallenge"
                          value={form.mainChallenge}
                          onChange={(e) => update('mainChallenge', e.target.value)}
                        >
                          <option value="">Chọn khó khăn</option>
                          {CHALLENGES.map((ch) => (
                            <option key={ch} value={ch}>{ch}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} aria-hidden="true" />
                      </div>
                    </div>

                    <div className="wl-field">
                      <label htmlFor="wl-betaInterest">Bạn muốn tham gia thử nghiệm ở mức nào?</label>
                      <div className="wl-select">
                        <select
                          id="wl-betaInterest"
                          value={form.betaInterest}
                          onChange={(e) => update('betaInterest', e.target.value)}
                        >
                          <option value="">Chọn mức độ</option>
                          {BETA_INTERESTS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} aria-hidden="true" />
                      </div>
                    </div>

                    <div className={`wl-field${errors.emailConsent ? ' bad' : ''}`}>
                      <label className="wl-consent" htmlFor="wl-emailConsent">
                        <input
                          id="wl-emailConsent"
                          type="checkbox"
                          checked={form.emailConsent}
                          onChange={(e) => update('emailConsent', e.target.checked)}
                        />
                        <span>
                          Mình đồng ý nhận email liên quan đến Early Access và cập nhật về FONLIO.<em> *</em>
                        </span>
                      </label>
                      {errors.emailConsent && <p className="wl-err">{errors.emailConsent}</p>}
                    </div>

                    <button
                      type="submit"
                      className="wl-btn wl-btn-primary wl-submit"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? (
                        <>
                          <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                          Đang gửi đăng ký…
                        </>
                      ) : (
                        <>
                          Đăng ký Early Access <ArrowRight size={18} />
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

      {/* ── 9. FAQ ACCORDION ────────────────────────────────────────────── */}
      <section className="wl-band" id="faq">
        <div className="wl-inner">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <span className="wl-eyebrow">FAQ</span>
              <h2 className="wl-section-title" style={{ maxWidth: '28ch', margin: '0 auto 14px' }}>
                Những câu bạn có thể đang thắc mắc.
              </h2>
              <p className="wl-lead" style={{ margin: '0 auto' }}>
                Mọi thắc mắc của bạn về FONLIO và chương trình trải nghiệm sớm đều được giải đáp tại đây.
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

      {/* ── 10. FOOTER CHUYÊN BIỆT CHO CHIẾN DỊCH FONLIO WAITLIST ────────── */}
      <footer className="wl-footer">
        <div className="wl-inner">
          <div className="wl-footer-grid">
            <div>
              <FonlioBrandLogo size="42px" />
              <p className="wl-footer-tagline">
                Foundation Of Your Next Journey. Biến dự án, sản phẩm và trải nghiệm của bạn thành một portfolio có cấu trúc, có bằng chứng và có thể xác thực.
              </p>
            </div>

            <div className="wl-footer-col">
              <h4>Khám phá</h4>
              <ul>
                <li><a href="#ve-fonlio">Về FONLIO</a></li>
                <li><a href="#gia-tri">Giá trị cốt lõi</a></li>
                <li><a href="#cach-hoat-dong">Cách hoạt động</a></li>
                <li><a href="#danh-cho-ai">Dành cho ai</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#dang-ky">Tham gia Waitlist</a></li>
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
            <span>Từ CV đến Proof of Work.</span>
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
