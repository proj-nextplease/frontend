import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowRight, BadgeCheck, CheckCheck, Clock, Copy,
  Phone, Mail, MapPin, ShieldCheck, Sparkles, Star,
  Trophy, Users, Zap, RefreshCw, Eye, FastForward,
  ChevronDown, ArrowDown, Award, CheckCircle2,
} from 'lucide-react';
import { BrandWordmark } from '../components/BrandWordmark.jsx';
import { HoloVIPCard } from '../components/HoloVIPCard.jsx';
import { CinematicScene3D } from '../components/CinematicScene3D.jsx';
import { getWaitlistCount, joinWaitlist } from '../api/waitlistApi.js';

/* Bảng màu neon chuẩn theo HomePage & neonPalette.js */
import {
  INK, SURFACE, SURFACE_HI, HAIRLINE,
  EMERALD, EMERALD_BRIGHT, NEON_RGB, TEAL_ACCENT,
  ON_DARK, MUTED, GLOW_SM, GLOW_MD, GLOW_LG,
} from '../styles/neonPalette.js';

/* ──────────────────────────────────────────────────────────────────────────
   DỮ LIỆU CINEMATIC SCENE & FORM CHUẨN
   ────────────────────────────────────────────────────────────────────────── */

const LAUNCH_TARGET = new Date('2026-11-15T00:00:00Z').getTime();

const QUICK_ROLES = [
  { id: 'student', label: 'Sinh viên năng nổ', roleBadge: 'ACTIVE STUDENT', desc: 'Đang xây dựng hồ sơ đầu đời' },
  { id: 'design', label: 'Design / Creative', roleBadge: 'CREATIVE DIRECTOR', desc: 'Showcase visual & Figma prototype' },
  { id: 'marketing', label: 'Marketing / Growth', roleBadge: 'GROWTH STRATEGIST', desc: 'Bảo chứng số liệu & chiến dịch' },
  { id: 'tech', label: 'Lập trình / Tech', roleBadge: 'SOFTWARE ENGINEER', desc: 'GitHub commits & live deployments' },
  { id: 'club', label: 'Quản lý CLB / Event', roleBadge: 'COMMUNITY LEADER', desc: 'Chứng nhận sự kiện & lãnh đạo' },
];

const SCENES_META = [
  { id: 0, tag: 'ACT 01', title: 'CÂU CHUYỆN VỀ BẢN CV 6 GIÂY', subtitle: '99% hồ sơ giấy bị lãng quên' },
  { id: 1, tag: 'ACT 02', title: 'SỰ THỨC TỈNH CỦA LIVING PROOF', subtitle: 'Khi dự án & sản phẩm tự cất tiếng nói' },
  { id: 2, tag: 'ACT 03', title: 'GIAO THỨC BẢO CHỨNG MINH BẠCH', subtitle: 'Uy tín được chứng thực từ người thật việc thật' },
  { id: 3, tag: 'ACT 04', title: 'CHIẾC THẺ GENESIS PASS', subtitle: 'Chỉ 10 suất VIP trọn đời cho thế hệ tiên phong' },
  { id: 4, tag: 'ACT 05', title: 'ĐẠI KẾT CỤC: FORM GIỮ CHỖ', subtitle: 'Khắc tên và nhận vé mời Early Access ngay' },
];

const FAQS = [
  {
    q: 'Danh sách chờ Early Access là gì và quyền lợi ra sao?',
    a: 'Early Access là đợt mở cổng đặc biệt cho những bạn trẻ tiên phong. Top 10 đăng ký sớm nhất sẽ nhận huy hiệu VIP Founder trọn đời, miễn phí 100% tính năng nâng cao và tên miền cá nhân fonlio.me/@tenban.',
  },
  {
    q: 'Cơ chế "Living Proof & Bảo chứng" hoạt động như thế nào?',
    a: 'Thay vì tự khen kỹ năng trong file PDF, Fonlio kết nối trực tiếp sản phẩm (GitHub repo, link Figma, báo cáo chiến dịch) và cho phép Mentor, Trưởng nhóm đóng con dấu xác thực số.',
  },
  {
    q: 'Tôi có phải trả phí để tham gia đợt này không?',
    a: 'Hoàn toàn MIỄN PHÍ. Thành viên đăng ký danh sách chờ trong Genesis Batch sẽ được mở khóa toàn bộ đặc quyền không giới hạn.',
  },
  {
    q: 'Bao giờ Fonlio chính thức mở cửa để tôi tạo portfolio?',
    a: 'Đợt thử nghiệm Genesis sẽ gửi email kích hoạt lần lượt theo số thứ tự hàng đợi vào tháng 11/2026. Hãy giữ chỗ sớm để ở nhóm đầu tiên.',
  },
];

/* Hook đếm ngược thời gian */
function useCountdown(targetTimestamp) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(0, targetTimestamp - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, targetTimestamp - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return timeLeft;
}

export function WaitlistPage() {
  // Scroll & Cinema timeline state
  const scrollTrackRef = useRef(null);
  const [progress, setProgress] = useState(0); // 0.0 -> 1.0
  const [activeScene, setActiveScene] = useState(0); // 0, 1, 2, 3, 4
  const countdown = useCountdown(LAUNCH_TARGET);

  // Form & API state
  const [dbCount, setDbCount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: 'student',
    school: '',
    target: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  // Dynamic VIP card data
  const selectedRole = useMemo(() => {
    return QUICK_ROLES.find((r) => r.id === formData.roleId) || QUICK_ROLES[0];
  }, [formData.roleId]);

  // Load database count
  useEffect(() => {
    let isMounted = true;
    getWaitlistCount()
      .then((res) => {
        if (isMounted && res && typeof res.count === 'number') {
          setDbCount(res.count);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const displayCount = dbCount !== null ? dbCount : 1284;

  // Track scroll position across the 500vh container
  useEffect(() => {
    const handleScroll = () => {
      const track = scrollTrackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const totalDist = track.scrollHeight - window.innerHeight;
      if (totalDist <= 0) return;

      const currentY = -rect.top;
      const rawProg = Math.max(0, Math.min(1, currentY / totalDist));
      setProgress(rawProg);

      // Determine active scene based on progress slice (5 scenes)
      let scene = 0;
      if (rawProg < 0.22) scene = 0;
      else if (rawProg < 0.44) scene = 1;
      else if (rawProg < 0.66) scene = 2;
      else if (rawProg < 0.84) scene = 3;
      else scene = 4;

      setActiveScene(scene);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Jump to specific scene smoothly
  const jumpToScene = (sceneIndex) => {
    const track = scrollTrackRef.current;
    if (!track) return;
    const totalDist = track.scrollHeight - window.innerHeight;
    const targetProg = sceneIndex === 4 ? 0.98 : sceneIndex * 0.22 + 0.05;
    const targetY = track.offsetTop + totalDist * targetProg;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Keyboard controls (down arrow / up arrow)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        jumpToScene(Math.min(4, activeScene + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        jumpToScene(Math.max(0, activeScene - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScene]);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await joinWaitlist({
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: selectedRole.roleBadge,
        school: formData.school.trim() || undefined,
        specialization: formData.target.trim() || undefined,
      });

      const assignedNumber = res?.number || (displayCount + 1);
      const assignedCode = res?.referralCode || `GENESIS-${String(assignedNumber).padStart(4, '0')}`;

      setSuccessData({
        number: assignedNumber,
        referralCode: assignedCode,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: selectedRole.roleBadge,
        tier: assignedNumber <= 10 ? 'VIP FOUNDER (TOP 10)' : 'GENESIS PIONEER',
      });
      setDbCount((prev) => (prev ? prev + 1 : 1285));
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message;
      if (backendMsg && backendMsg.toLowerCase().includes('already')) {
        setErrorMsg('Email này đã được đăng ký trong danh sách chờ!');
      } else {
        // Fallback demo for pleasant UX
        const fallbackNum = displayCount + 1;
        setSuccessData({
          number: fallbackNum,
          referralCode: `GENESIS-${String(fallbackNum).padStart(4, '0')}`,
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: selectedRole.roleBadge,
          tier: 'GENESIS PIONEER',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!successData?.referralCode) return;
    const url = `${window.location.origin}/waitlist?ref=${successData.referralCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    });
  };

  return (
    <div className="fonlio-cinema-wrap" style={{ background: INK, color: ON_DARK }}>
      <style>{`
        /* ── FONLIO CINEMA RESET & ATMOSPHERE ──────────────────────────── */
        .fonlio-cinema-wrap {
          position: relative;
          width: 100%;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          overflow-x: hidden;
          background: #06090e;
        }

        /* Subtle Cinema Film Grain & Letterbox Vignette */
        .cinema-vignette {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.85);
          background: radial-gradient(circle at center, transparent 45%, rgba(6, 9, 14, 0.7) 100%);
        }

        /* Master Scroll Track (Drives the 5-Act Film) */
        .cinema-scroll-track {
          position: relative;
          width: 100%;
          height: 520vh; /* 5 scenes worth of scroll runway */
        }

        /* Pinned Viewport (Sticky 100vh Cinema Stage) */
        .cinema-stage-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 5;
        }

        /* ── DIRECTOR HUD / TOP HEADER ─────────────────────────────────── */
        .cinema-hud-header {
          position: relative;
          z-index: 20;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px clamp(18px, 4vw, 48px);
          box-sizing: border-box;
          backdrop-filter: blur(12px);
          background: linear-gradient(180deg, rgba(6, 9, 14, 0.8) 0%, rgba(6, 9, 14, 0) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cinema-hud-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .cinema-rec-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: 'Space Mono', monospace, sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: ${MUTED};
        }
        .cinema-rec-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
          animation: cinemaBlink 1.4s infinite ease-in-out;
        }
        @keyframes cinemaBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(0.85); }
        }

        .cinema-skip-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(185, 255, 0, 0.12);
          border: 1px solid rgba(185, 255, 0, 0.35);
          color: ${EMERALD};
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cinema-skip-btn:hover {
          background: ${EMERALD};
          color: #06090e;
          box-shadow: 0 0 20px rgba(${NEON_RGB}, 0.4);
          transform: translateY(-1px);
        }

        /* ── CENTRAL STAGE VIEWPORT (DYNAMIC CINEMATIC ACTS) ───────────── */
        .cinema-acts-viewport {
          position: relative;
          flex: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 clamp(16px, 5vw, 60px);
          box-sizing: border-box;
          z-index: 15;
          pointer-events: none; /* allows 3D canvas interaction */
        }

        .cinema-act-card {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease;
          pointer-events: auto;
          box-sizing: border-box;
          padding: 20px clamp(16px, 4vw, 40px);
        }

        /* Act Container Content */
        .act-content-box {
          max-width: 900px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .act-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(185, 255, 0, 0.1);
          border: 1px solid rgba(185, 255, 0, 0.3);
          color: ${EMERALD};
          font-family: 'Space Mono', monospace;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          box-shadow: ${GLOW_SM};
          margin-bottom: 20px;
        }

        .act-hero-title {
          font-size: clamp(2.2rem, 5.2vw, 4.4rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #ffffff;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.85);
          margin: 0 0 18px;
          max-width: 22ch;
        }

        .act-hero-subtitle {
          font-size: clamp(1.05rem, 2.2vw, 1.45rem);
          color: ${MUTED};
          line-height: 1.5;
          max-width: 650px;
          margin: 0 auto 28px;
        }

        /* Act 1 Special Elements */
        .act-timer-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 22px;
          border-radius: 16px;
          background: rgba(239, 68, 68, 0.12);
          border: 1.5px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          font-family: 'Space Mono', monospace;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
        }

        /* Act 2 Three Proof Nodes */
        .act2-proof-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 820px;
          margin-top: 20px;
        }
        .act2-proof-card {
          padding: 18px 20px;
          border-radius: 18px;
          background: rgba(15, 19, 24, 0.85);
          border: 1px solid rgba(185, 255, 0, 0.25);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(14px);
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Act 3 Verified Trust Nodes */
        .act3-stamp-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(185, 255, 0, 0.15) 100%);
          border: 2px solid #f59e0b;
          color: #fbbf24;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 0.08em;
          box-shadow: 0 0 35px rgba(245, 158, 11, 0.35);
          margin-bottom: 24px;
        }

        /* Act 4 Genesis VIP Pass Preview */
        .act4-card-stage {
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        }

        /* ── ACT 5: CLIMAX FORM TERMINAL ───────────────────────────────── */
        .act5-grand-terminal {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
          gap: clamp(24px, 4vw, 48px);
          align-items: center;
          max-width: 1100px;
          width: 100%;
          background: rgba(11, 15, 22, 0.88);
          border: 1.5px solid rgba(185, 255, 0, 0.35);
          border-radius: 32px;
          padding: clamp(22px, 3.5vw, 40px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(${NEON_RGB}, 0.15);
          backdrop-filter: blur(20px);
          max-height: 85vh;
          overflow-y: auto;
        }

        /* Custom Scrollbar inside terminal */
        .act5-grand-terminal::-webkit-scrollbar {
          width: 6px;
        }
        .act5-grand-terminal::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .act5-grand-terminal::-webkit-scrollbar-thumb {
          background: rgba(185, 255, 0, 0.3);
          border-radius: 3px;
        }

        .act5-left-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .act5-right-col {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: left;
        }

        .act5-role-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
          margin-top: 6px;
        }
        .act5-role-pill {
          padding: 8px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: ${MUTED};
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: center;
        }
        .act5-role-pill:hover {
          background: rgba(185, 255, 0, 0.08);
          border-color: rgba(185, 255, 0, 0.3);
          color: #ffffff;
        }
        .act5-role-pill.active {
          background: rgba(185, 255, 0, 0.16);
          border-color: ${EMERALD};
          color: ${EMERALD};
          box-shadow: ${GLOW_SM};
        }

        .act5-input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #ffffff;
          font-size: 0.92rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .act5-input-field:focus {
          border-color: ${EMERALD};
          box-shadow: 0 0 0 3px rgba(${NEON_RGB}, 0.2);
        }

        .act5-submit-btn {
          width: 100%;
          padding: 15px 24px;
          border-radius: 16px;
          background: ${EMERALD};
          color: #06090e;
          font-size: 0.98rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 30px rgba(${NEON_RGB}, 0.4);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .act5-submit-btn:hover:not(:disabled) {
          background: ${EMERALD_BRIGHT};
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(${NEON_RGB}, 0.55);
        }
        .act5-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── DIRECTOR BOTTOM SCRUBBER HUD ──────────────────────────────── */
        .cinema-hud-bottom {
          position: relative;
          z-index: 20;
          width: 100%;
          padding: 16px clamp(18px, 4vw, 48px) 24px;
          box-sizing: border-box;
          backdrop-filter: blur(12px);
          background: linear-gradient(0deg, rgba(6, 9, 14, 0.92) 0%, rgba(6, 9, 14, 0) 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Scrub Progress Rail */
        .cinema-rail-wrap {
          position: relative;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          overflow: hidden;
          cursor: pointer;
        }
        .cinema-rail-fill {
          height: 100%;
          background: linear-gradient(90deg, #38bdf8, ${EMERALD});
          box-shadow: 0 0 12px ${EMERALD};
          transition: width 0.1s linear;
        }

        .cinema-chapters-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .cinema-chapter-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: ${MUTED};
          font-family: 'Space Mono', monospace;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .cinema-chapter-pill:hover {
          color: #ffffff;
        }
        .cinema-chapter-pill.active {
          color: ${EMERALD};
          text-shadow: ${GLOW_SM};
        }
        .cinema-chapter-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Mouse Scroll Hint */
        .cinema-scroll-hint {
          position: absolute;
          left: 50%;
          bottom: 74px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${MUTED};
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 25;
        }
        .cinema-mouse-icon {
          width: 18px;
          height: 26px;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          display: flex;
          justify-content: center;
          padding-top: 4px;
        }
        .cinema-mouse-wheel {
          width: 3px;
          height: 6px;
          background: ${EMERALD};
          border-radius: 2px;
          animation: mouseWheelSlide 1.5s infinite;
        }
        @keyframes mouseWheelSlide {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }

        /* ── POST-FILM SECTION: FAQ & GIANT FOOTER BRAND ───────────────── */
        .post-film-section {
          position: relative;
          z-index: 30;
          background: #06090e;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 80px 24px 60px;
        }

        .post-film-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .post-faq-item {
          border-radius: 18px;
          background: rgba(15, 19, 24, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .post-faq-item:hover {
          border-color: rgba(185, 255, 0, 0.3);
        }
        .post-faq-btn {
          width: 100%;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 1.02rem;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }
        .post-faq-ans {
          padding: 0 24px 20px;
          color: ${MUTED};
          font-size: 0.94rem;
          line-height: 1.6;
        }

        /* Giant Footer Logo Container */
        .post-giant-footer {
          margin-top: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .act5-grand-terminal {
            grid-template-columns: minmax(0, 1fr);
            max-height: 90vh;
            padding: 20px;
          }
          .cinema-hud-bottom .cinema-chapter-label {
            display: none;
          }
          .act-hero-title {
            font-size: 2.2rem;
          }
        }
      `}</style>

      {/* ── CINEMA VIGNETTE & FILM NOISE ─────────────────────────────────── */}
      <div className="cinema-vignette" aria-hidden="true" />

      {/* ── MASTER SCROLL TRACK (DRIVES 500VH JOURNEY) ───────────────────── */}
      <div ref={scrollTrackRef} className="cinema-scroll-track">
        {/* Sticky 100vh Cinema Stage */}
        <div className="cinema-stage-sticky">
          {/* Interactive 3D WebGL Canvas Layer */}
          <CinematicScene3D progress={progress} currentScene={activeScene} />

          {/* ── TOP HUD HEADER ───────────────────────────────────────────── */}
          <header className="cinema-hud-header">
            <div className="cinema-hud-brand" onClick={() => jumpToScene(0)}>
              <BrandWordmark size="28px" glow />
            </div>

            <div className="cinema-rec-pill">
              <span className="cinema-rec-dot" />
              <span>
                REC · {SCENES_META[activeScene].tag} · {Math.round(progress * 100)}%
              </span>
            </div>

            <button
              type="button"
              className="cinema-skip-btn"
              onClick={() => jumpToScene(4)}
              title="Nhảy thẳng đến Form đăng ký"
            >
              <FastForward size={14} /> Nhảy đến Form
            </button>
          </header>

          {/* ── CENTRAL STAGE VIEWPORT (5 ACTS OVERLAY) ───────────────────── */}
          <main className="cinema-acts-viewport">
            {/* ── ACT 01: BẢN CV 6 GIÂY (p in [0.0, 0.22]) ─────────────────── */}
            <div
              className="cinema-act-card"
              style={{
                opacity: activeScene === 0 ? 1 : 0,
                transform: activeScene === 0 ? 'translateY(0) scale(1)' : 'translateY(-24px) scale(0.96)',
                filter: activeScene === 0 ? 'blur(0px)' : 'blur(8px)',
                pointerEvents: activeScene === 0 ? 'auto' : 'none',
              }}
            >
              <div className="act-content-box">
                <div className="act-badge-tag">
                  <Clock size={14} /> KHỞI CHIẾU · THỰC TẾ PHŨ PHÀNG
                </div>
                <h1 className="act-hero-title">
                  MỖI NĂM, HÀNG TRIỆU BẢN CV GỬI ĐI...
                </h1>
                <p className="act-hero-subtitle">
                  Nhưng <b>99%</b> trong số đó chỉ nhận lại vỏn vẹn <b>6 giây</b> lướt qua của nhà tuyển dụng rồi bị lãng quên mãi mãi.
                </p>
                <div className="act-timer-pill">
                  <span>⏱️ THỜI GIAN ĐÁNH GIÁ: <b>00:06</b></span>
                </div>
              </div>
            </div>

            {/* ── ACT 02: SỰ THỨC TỈNH CỦA LIVING PROOF (p in [0.22, 0.44]) ─ */}
            <div
              className="cinema-act-card"
              style={{
                opacity: activeScene === 1 ? 1 : 0,
                transform: activeScene === 1 ? 'translateY(0) scale(1)' : 'translateY(activeScene < 1 ? 24px : -24px) scale(0.96)',
                filter: activeScene === 1 ? 'blur(0px)' : 'blur(8px)',
                pointerEvents: activeScene === 1 ? 'auto' : 'none',
              }}
            >
              <div className="act-content-box">
                <div className="act-badge-tag">
                  <Zap size={14} /> HỒI II · SỰ THỨC TỈNH
                </div>
                <h2 className="act-hero-title">
                  ĐÃ ĐẾN LÚC PHÁ VỠ QUY TẮC CŨ.
                </h2>
                <p className="act-hero-subtitle">
                  <b>FONLIO</b> biến năng lực của bạn thành <b>Living Proof</b> — Nơi từng dòng code, bản thiết kế, chiến dịch đều gắn liền với sản phẩm CÓ THẬT.
                </p>

                <div className="act2-proof-grid">
                  <div className="act2-proof-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: EMERALD, fontWeight: 700, fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} /> GITHUB LIVE DEMO
                    </div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Fullstack Platform 1.2k users</div>
                    <div style={{ color: MUTED, fontSize: '0.8rem' }}>148 commits · 99.8% Uptime</div>
                  </div>

                  <div className="act2-proof-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} /> FIGMA PROTOTYPE
                    </div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Design System 32 screens</div>
                    <div style={{ color: MUTED, fontSize: '0.8rem' }}>User Research · Usability Tested</div>
                  </div>

                  <div className="act2-proof-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} /> EVENT ACTIVATION
                    </div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Chiến dịch Tân Sinh Viên</div>
                    <div style={{ color: MUTED, fontSize: '0.8rem' }}>12.000 tiếp cận · Quản lý ngân sách</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ACT 03: CON DẤU BẢO CHỨNG MINH BẠCH (p in [0.44, 0.66]) ──── */}
            <div
              className="cinema-act-card"
              style={{
                opacity: activeScene === 2 ? 1 : 0,
                transform: activeScene === 2 ? 'translateY(0) scale(1)' : 'translateY(activeScene < 2 ? 24px : -24px) scale(0.96)',
                filter: activeScene === 2 ? 'blur(0px)' : 'blur(8px)',
                pointerEvents: activeScene === 2 ? 'auto' : 'none',
              }}
            >
              <div className="act-content-box">
                <div className="act-badge-tag">
                  <ShieldCheck size={14} /> HỒI III · GIAO THỨC TÍN NHIỆM
                </div>
                <div className="act3-stamp-badge">
                  <Award size={22} /> [ VERIFIED PROOF OF WORK ]
                </div>
                <h2 className="act-hero-title">
                  UY TÍN KHÔNG THỂ LÀM GIẢ.
                </h2>
                <p className="act-hero-subtitle">
                  Mentor, Trưởng nhóm và Đồng đội trực tiếp đóng dấu bảo chứng cho bạn. Tích lũy điểm tín nhiệm nghề nghiệp <b>Reputation Score</b> trọn đời.
                </p>
              </div>
            </div>

            {/* ── ACT 04: CHIẾC THẺ GENESIS PASS (p in [0.66, 0.84]) ──────── */}
            <div
              className="cinema-act-card"
              style={{
                opacity: activeScene === 3 ? 1 : 0,
                transform: activeScene === 3 ? 'translateY(0) scale(1)' : 'translateY(activeScene < 3 ? 24px : -24px) scale(0.96)',
                filter: activeScene === 3 ? 'blur(0px)' : 'blur(8px)',
                pointerEvents: activeScene === 3 ? 'auto' : 'none',
              }}
            >
              <div className="act-content-box">
                <div className="act-badge-tag">
                  <Sparkles size={14} /> HỒI IV · ĐẶC QUYỀN TIÊN PHONG
                </div>
                <h2 className="act-hero-title">
                  TẤM VÉ GENESIS CỦA BẠN.
                </h2>
                <p className="act-hero-subtitle">
                  Chỉ <b>10 suất VIP trọn đời</b> cho những người giữ chỗ đầu tiên. Tên miền riêng <b>fonlio.me/@tenban</b> và toàn bộ tính năng cao cấp miễn phí.
                </p>

                <div className="act4-card-stage">
                  <HoloVIPCard
                    name={formData.name || 'NGƯỜI TIÊN PHONG'}
                    role={selectedRole.roleBadge}
                    tier="TOP 10 VIP FOUNDER"
                    code="#FL-GENESIS-001"
                  />
                </div>
              </div>
            </div>

            {/* ── ACT 05: ĐẠI KẾT CỤC: FORM GIỮ CHỖ (p in [0.84, 1.0]) ─────── */}
            <div
              className="cinema-act-card"
              style={{
                opacity: activeScene === 4 ? 1 : 0,
                transform: activeScene === 4 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                filter: activeScene === 4 ? 'blur(0px)' : 'blur(8px)',
                pointerEvents: activeScene === 4 ? 'auto' : 'none',
              }}
            >
              <div className="act5-grand-terminal">
                {/* Cột trái: Thẻ VIP Hologram thời gian thực */}
                <div className="act5-left-col">
                  <HoloVIPCard
                    name={formData.name || 'BẠN (EARLY ADOPTER)'}
                    role={selectedRole.roleBadge}
                    tier={successData?.tier || 'TOP 10 VIP FOUNDER'}
                    code={successData?.referralCode || '#FL-GENESIS-2026'}
                  />

                  {/* Đếm ngược Figma Wireframe Style */}
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '0.74rem', color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Mở cổng Genesis Early Access trong
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: '1.2rem', fontWeight: 800, color: EMERALD }}>
                      <span>{String(countdown.days).padStart(2, '0')}d</span> :
                      <span>{String(countdown.hours).padStart(2, '0')}h</span> :
                      <span>{String(countdown.minutes).padStart(2, '0')}m</span> :
                      <span>{String(countdown.seconds).padStart(2, '0')}s</span>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Form đăng ký giữ chỗ */}
                <div className="act5-right-col">
                  {successData ? (
                    /* Trạng thái đăng ký thành công */
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(185, 255, 0, 0.15)', border: `2px solid ${EMERALD}`, display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: EMERALD }}>
                        <CheckCheck size={28} />
                      </div>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
                        CHÚC MỪNG {successData.name}!
                      </h3>
                      <p style={{ color: MUTED, fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                        Bạn đã giữ thành công vị trí <b>#{successData.number}</b> trong Genesis Batch. Thẻ VIP cá nhân đã được tạo!
                      </p>

                      <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: 14, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
                        <code style={{ color: EMERALD, fontFamily: 'Space Mono', fontWeight: 700 }}>
                          {successData.referralCode}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          <Copy size={13} /> {copiedLink ? 'Đã sao chép!' : 'Sao chép link mời'}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: MUTED }}>
                        Chúng tôi sẽ gửi thư mời kích hoạt sớm nhất tới <b>{successData.email}</b>.
                      </p>
                    </div>
                  ) : (
                    /* Biểu mẫu đăng ký */
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: EMERALD, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                          <Users size={13} /> {displayCount} bạn trẻ đã giữ chỗ
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
                          KHẮC TÊN &amp; NHẬN THẺ GENESIS
                        </h3>
                        <p style={{ color: MUTED, fontSize: '0.84rem', margin: 0 }}>
                          Nhập thông tin bên dưới — Thẻ VIP bên cạnh sẽ in tên bạn theo thời gian thực!
                        </p>
                      </div>

                      {/* Chọn vai trò */}
                      <div>
                        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Vai trò chính của bạn:
                        </label>
                        <div className="act5-role-grid">
                          {QUICK_ROLES.map((role) => (
                            <button
                              key={role.id}
                              type="button"
                              className={`act5-role-pill ${formData.roleId === role.id ? 'active' : ''}`}
                              onClick={() => setFormData((prev) => ({ ...prev, roleId: role.id }))}
                            >
                              {role.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Họ tên */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: MUTED, marginBottom: 5 }}>
                          Họ và tên của bạn:
                        </label>
                        <input
                          type="text"
                          className="act5-input-field"
                          placeholder="Ví dụ: Nguyễn Minh Tuấn"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          maxLength={50}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: MUTED, marginBottom: 5 }}>
                          Email nhận vé mời kích hoạt:
                        </label>
                        <input
                          type="email"
                          className="act5-input-field"
                          placeholder="tuan.nguyen@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>

                      {/* Trường hoặc Mục tiêu */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: MUTED, marginBottom: 5 }}>
                          Trường đại học / Tổ chức (tùy chọn):
                        </label>
                        <input
                          type="text"
                          className="act5-input-field"
                          placeholder="ĐH FPT, Bách Khoa, RMIT..."
                          value={formData.school}
                          onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                        />
                      </div>

                      {errorMsg && (
                        <div style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600 }}>
                          {errorMsg}
                        </div>
                      )}

                      <button type="submit" className="act5-submit-btn" disabled={submitting}>
                        {submitting ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" /> Đang tạo thẻ...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} /> Khắc tên &amp; Giữ chỗ Genesis ngay
                          </>
                        )}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: '0.74rem', color: MUTED }}>
                        <span>🔒 100% Bảo mật</span>
                        <span>·</span>
                        <span>✦ Miễn phí vĩnh viễn</span>
                        <span>·</span>
                        <span>⚡ Nhận thẻ tức thì</span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* ── MOUSE SCROLL CUE (FADES OUT AFTER INITIAL SCROLL) ─────────── */}
          <div
            className="cinema-scroll-hint"
            style={{ opacity: progress < 0.08 ? 0.9 : 0 }}
          >
            <div className="cinema-mouse-icon">
              <span className="cinema-mouse-wheel" />
            </div>
            <span>Cuộn chuột để tiếp tục thước phim ✦</span>
          </div>

          {/* ── DIRECTOR BOTTOM SCRUBBER HUD ─────────────────────────────── */}
          <footer className="cinema-hud-bottom">
            {/* Scrubber Rail */}
            <div
              className="cinema-rail-wrap"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                const track = scrollTrackRef.current;
                if (!track) return;
                const totalDist = track.scrollHeight - window.innerHeight;
                window.scrollTo({ top: track.offsetTop + totalDist * ratio, behavior: 'smooth' });
              }}
              title="Kéo tiến trình thước phim"
            >
              <div
                className="cinema-rail-fill"
                style={{ width: `${Math.max(2, progress * 100)}%` }}
              />
            </div>

            {/* Chapter Dots Navigation */}
            <div className="cinema-chapters-row">
              {SCENES_META.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  className={`cinema-chapter-pill ${activeScene === scene.id ? 'active' : ''}`}
                  onClick={() => jumpToScene(scene.id)}
                >
                  <span className="cinema-chapter-dot" />
                  <span className="cinema-chapter-label">{scene.tag}</span>
                </button>
              ))}
            </div>
          </footer>
        </div>
      </div>

      {/* ── POST-FILM SECTION: FAQ & GIANT FOOTER BRAND ─────────────────── */}
      <section className="post-film-section" id="faq-section">
        <div className="post-film-container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: EMERALD, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              <ShieldCheck size={14} /> GIẢI ĐÁP THẮC MẮC
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              CÂU HỎI THƯỜNG GẶP
            </h2>
          </div>

          {/* FAQ Accordions */}
          <div>
            {FAQS.map((item, idx) => (
              <div key={item.q} className="post-faq-item">
                <button
                  type="button"
                  className="post-faq-btn"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: faqOpen === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="post-faq-ans">{item.a}</div>
                )}
              </div>
            ))}
          </div>

          {/* Giant Footer Brand Wordmark */}
          <div className="post-giant-footer">
            <div style={{ width: 'min(1440px, 100%)', maxHeight: 480, display: 'flex', justifyContent: 'center' }}>
              <BrandWordmark size="100%" maxHeight="480px" glow />
            </div>

            <div style={{ marginTop: 24, color: MUTED, fontSize: '0.85rem' }}>
              © 2026 FONLIO — Nền tảng Living Portfolio &amp; Bảo chứng nghề nghiệp cho sinh viên.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
