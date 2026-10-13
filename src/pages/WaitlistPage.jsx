import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowRight, CheckCheck, Clock, Copy, RefreshCw,
  Sparkles, Users, Zap, ShieldCheck, Award, ArrowUpRight,
} from 'lucide-react';
import { BrandWordmark } from '../components/BrandWordmark.jsx';
import { HoloVIPCard } from '../components/HoloVIPCard.jsx';
import { CinematicScene3D } from '../components/CinematicScene3D.jsx';
import { getWaitlistCount, joinWaitlist } from '../api/waitlistApi.js';

/* Bảng màu neon & luxury dark theo phong cách studio */
import {
  INK, SURFACE, HAIRLINE,
  EMERALD, EMERALD_BRIGHT, NEON_RGB, TEAL_ACCENT,
  ON_DARK, MUTED, GLOW_SM, GLOW_MD, GLOW_LG,
} from '../styles/neonPalette.js';

const LAUNCH_TARGET = new Date('2026-11-15T00:00:00Z').getTime();

const NAV_SECTIONS = [
  { id: 'hero', label: 'Khởi đầu' },
  { id: 'manifesto', label: 'Tuyên ngôn' },
  { id: 'parcours', label: 'Hành trình' },
  { id: 'toolkit', label: 'Bảo chứng' },
  { id: 'projects', label: 'Dự án mẫu' },
  { id: 'waitlist', label: 'Đăng ký' },
];

const QUICK_ROLES = [
  { id: 'student', label: 'Sinh viên năng nổ', roleBadge: 'ACTIVE STUDENT' },
  { id: 'design', label: 'Design / Creative', roleBadge: 'CREATIVE DIRECTOR' },
  { id: 'marketing', label: 'Marketing / Growth', roleBadge: 'GROWTH STRATEGIST' },
  { id: 'tech', label: 'Lập trình / Tech', roleBadge: 'SOFTWARE ENGINEER' },
  { id: 'club', label: 'Quản lý CLB / Event', roleBadge: 'COMMUNITY LEADER' },
];

const SHOWCASE_PROJECTS = [
  {
    name: 'edumatch design system',
    type: 'Figma Prototype · 32 Screens',
    verifier: 'Verified by Mentor Tốt nghiệp',
    tag: 'Design',
  },
  {
    name: 'qr attendance platform',
    type: '1.200 users/month · 99.8% Uptime',
    verifier: 'Verified by Lead Kỹ thuật IT',
    tag: 'Fullstack Tech',
  },
  {
    name: 'chiến dịch tân sinh viên',
    type: '12.000 tiếp cận · 850 đăng ký',
    verifier: 'Verified by CLB Truyền thông',
    tag: 'Marketing',
  },
  {
    name: 'đêm nhạc gây quỹ đông 2025',
    type: '45.000.000đ ngân sách đối soát',
    verifier: 'Verified by Đại diện Đoàn trường',
    tag: 'Event & Community',
  },
  {
    name: 'fintech expense tracker',
    type: 'React Native & PostgreSQL',
    verifier: 'Top 1 Tech Fest University',
    tag: 'Mobile App',
  },
  {
    name: 'brand identity bloom',
    type: 'Full Guidelines · Motion Assets',
    verifier: 'Creative Director Bảo chứng',
    tag: 'Branding',
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
      seconds: Math.floor((diff / (1000 * 60)) % 60),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, targetTimestamp - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / (1000 * 60)) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return timeLeft;
}

export function WaitlistPage() {
  // Preloader Intro state
  const [introDone, setIntroDone] = useState(() => Boolean(sessionStorage.getItem('fonlio_intro_seen')));
  const [introCount, setIntroCount] = useState(0);
  const [introLeaving, setIntroLeaving] = useState(false);

  // Sound toggle state (Web Audio API synthetic ambient)
  const [soundActive, setSoundActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  // Active section tracking (Scroll Indicator)
  const [activeSection, setActiveSection] = useState('hero');

  // Trajectory pinned scroll state
  const trajectoryRef = useRef(null);
  const [trajectoryStep, setTrajectoryStep] = useState(0);

  // Form & Waitlist state
  const countdown = useCountdown(LAUNCH_TARGET);
  const [dbCount, setDbCount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: 'student',
    school: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedRole = useMemo(() => {
    return QUICK_ROLES.find((r) => r.id === formData.roleId) || QUICK_ROLES[0];
  }, [formData.roleId]);

  // Load count from API
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

  // Intro Preloader Animation (000 -> 100% counter with smooth curtain exit)
  useEffect(() => {
    if (introDone) return undefined;

    const duration = 2000;
    const start = performance.now();

    const frame = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setIntroCount(Math.round(eased * 100));

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setIntroLeaving(true);
        setTimeout(() => {
          setIntroDone(true);
          sessionStorage.setItem('fonlio_intro_seen', 'true');
        }, 850);
      }
    };

    const req = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(req);
  }, [introDone]);

  // Audio Toggle synth tone
  const toggleSound = () => {
    if (!soundActive) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // gentle warm ambient tone A3
        gain.gain.setValueAtTime(0.02, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = { osc, gain, ctx };
        setSoundActive(true);
      } catch {
        setSoundActive(false);
      }
    } else {
      if (oscRef.current) {
        try {
          oscRef.current.osc.stop();
          oscRef.current.ctx.close();
        } catch (err) {
          void err;
        }
        oscRef.current = null;
      }
      setSoundActive(false);
    }
  };

  // Scroll listener: update activeSection & trajectory scrollytelling step
  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight;

      // 1. Trajectory scrollytelling sentences calculation
      if (trajectoryRef.current) {
        const rect = trajectoryRef.current.getBoundingClientRect();
        const totalDist = trajectoryRef.current.scrollHeight - vh;
        if (totalDist > 0) {
          const currentY = -rect.top;
          const prog = Math.max(0, Math.min(1, currentY / totalDist));
          if (prog < 0.25) setTrajectoryStep(0);
          else if (prog < 0.50) setTrajectoryStep(1);
          else if (prog < 0.75) setTrajectoryStep(2);
          else setTrajectoryStep(3);
        }
      }

      // 2. Active section detection
      const sections = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        const rect = sec.getBoundingClientRect();
        if (rect.top <= vh * 0.45) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Form submit
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
    <div className="ximi-style-page" style={{ background: INK, color: ON_DARK }}>
      <style>{`
        /* ── RESET & LUXURY TYPOGRAPHY (INSPIRED BY LAB1.XIMITECH.VN) ── */
        .ximi-style-page {
          --color-cream: #f5e7df;
          --color-dark: #070a0f;
          --letter-spacing-display: -0.035em;
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          background-color: var(--color-dark);
          color: var(--color-cream);
        }

        /* ── 1. PRELOADER INTRO SCREEN ─────────────────────────────────── */
        .fonlio-intro {
          position: fixed;
          inset: 0;
          z-index: 10002;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #06090e;
          color: #ffffff;
          clip-path: inset(0 0 0 0);
          transition: clip-path 0.85s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .fonlio-intro.is-leaving {
          clip-path: inset(0 0 100% 0);
        }
        .fonlio-intro__glow {
          position: absolute;
          width: min(90vw, 850px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(185, 255, 0, 0.18) 0%, transparent 65%);
          animation: fonlioGlow 2.4s ease-out both;
        }
        @keyframes fonlioGlow {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .fonlio-intro__center {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }
        .fonlio-intro__word {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: clamp(48px, 9vw, 92px);
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin: 0;
          color: #ffffff;
          text-shadow: 0 0 30px rgba(${NEON_RGB}, 0.45);
        }
        .fonlio-intro__tagline {
          margin: 0;
          font-size: clamp(12px, 1.1vw, 15px);
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${EMERALD};
        }
        .fonlio-intro__meta {
          position: absolute;
          left: clamp(20px, 4vw, 54px);
          right: clamp(20px, 4vw, 54px);
          bottom: clamp(24px, 5vh, 48px);
          display: flex;
          align-items: center;
          gap: 20px;
          font-family: 'Space Mono', monospace;
          font-size: clamp(13px, 1vw, 15px);
          color: ${MUTED};
        }
        .fonlio-intro__count {
          font-variant-numeric: tabular-nums;
          min-width: 3ch;
          color: #ffffff;
          font-weight: 700;
        }
        .fonlio-intro__line {
          flex: 1;
          height: 1.5px;
          background: rgba(255, 255, 255, 0.15);
          overflow: hidden;
        }
        .fonlio-intro__line span {
          display: block;
          height: 100%;
          background: ${EMERALD};
          box-shadow: 0 0 10px ${EMERALD};
          transition: width 0.1s linear;
        }

        /* ── 2. SITE HEADER (FLOATING CAPSULE) ─────────────────────────── */
        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px clamp(20px, 3.5vw, 48px);
          box-sizing: border-box;
          pointer-events: none;
        }
        .site-header__logo {
          pointer-events: auto;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .site-header__nav {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: clamp(12px, 2.4vw, 32px);
          height: clamp(52px, 4.8vw, 64px);
          padding-inline: clamp(16px, 2.5vw, 32px);
          border-radius: 999px;
          background: rgba(15, 19, 24, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
        }
        .site-header__link {
          color: rgba(255, 255, 255, 0.7);
          font-size: clamp(14px, 1.05vw, 16px);
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .site-header__link:hover,
        .site-header__link.active {
          color: ${EMERALD};
        }

        /* ── 3. VERTICAL SEGMENTED SCROLL INDICATOR ────────────────────── */
        .scroll-indicator {
          position: fixed;
          bottom: clamp(24px, 4vh, 48px);
          left: clamp(20px, 2.5vw, 40px);
          z-index: 900;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        .scroll-indicator__item {
          width: 54px;
          height: 18px;
          display: flex;
          align-items: center;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 0;
          position: relative;
        }
        .scroll-indicator__item:after {
          content: attr(data-label);
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.8);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .scroll-indicator__item:hover:after {
          opacity: 1;
        }
        .scroll-indicator__bar {
          height: 2px;
          width: 14px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 2px;
          transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.35s;
        }
        .scroll-indicator__item.is-active .scroll-indicator__bar {
          width: 48px;
          background: ${EMERALD};
          box-shadow: 0 0 10px ${EMERALD};
        }
        .scroll-indicator__item.is-neighbor .scroll-indicator__bar {
          width: 26px;
          background: rgba(255, 255, 255, 0.6);
        }

        /* ── 4. SOUND TOGGLE BUTTON ────────────────────────────────────── */
        .sound-toggle {
          position: fixed;
          bottom: clamp(24px, 4vh, 48px);
          right: clamp(20px, 2.5vw, 40px);
          z-index: 900;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(15, 19, 24, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sound-toggle:hover {
          border-color: ${EMERALD};
          color: ${EMERALD};
        }
        .sound-toggle__bars {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 14px;
        }
        .sound-toggle__bars i {
          width: 2.5px;
          background: currentColor;
          border-radius: 1px;
          height: 4px;
          transition: height 0.2s;
        }
        .sound-toggle.is-playing .sound-toggle__bars i:nth-child(1) { animation: soundBar 0.9s infinite ease-in-out; }
        .sound-toggle.is-playing .sound-toggle__bars i:nth-child(2) { animation: soundBar 1.2s infinite ease-in-out 0.2s; }
        .sound-toggle.is-playing .sound-toggle__bars i:nth-child(3) { animation: soundBar 0.8s infinite ease-in-out 0.4s; }
        .sound-toggle.is-playing .sound-toggle__bars i:nth-child(4) { animation: soundBar 1.1s infinite ease-in-out 0.1s; }
        @keyframes soundBar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }

        /* ── 5. HERO SECTION (#hero) ───────────────────────────────────── */
        .hero-three {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #06090e;
        }
        .hero-three__canvas-wrap {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: clamp(24px, 5vw, 64px);
          box-sizing: border-box;
          pointer-events: none;
        }
        .hero-main-title {
          font-size: clamp(3rem, 7.5vw, 8rem);
          font-weight: 900;
          line-height: 0.92;
          letter-spacing: var(--letter-spacing-display);
          color: #ffffff;
          margin: 0 0 20px;
          text-shadow: 0 6px 30px rgba(0, 0, 0, 0.8);
          max-width: 14ch;
        }
        .hero-main-desc {
          font-size: clamp(1.1rem, 2vw, 1.45rem);
          color: ${MUTED};
          max-width: 580px;
          line-height: 1.5;
          margin: 0;
        }
        /* Floating lab badge in bottom right (Exactly like lab1.ximitech.vn) */
        .lab-badge {
          position: absolute;
          right: clamp(24px, 3.5vw, 48px);
          bottom: clamp(24px, 4vw, 54px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          max-width: 340px;
          padding: 20px 22px;
          border-radius: 24px;
          background: rgba(15, 19, 24, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
          pointer-events: auto;
        }
        .lab-badge__eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${MUTED};
        }
        .lab-badge__dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${EMERALD};
          box-shadow: 0 0 10px ${EMERALD};
        }
        .lab-badge__dot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: inherit;
          animation: labDotPulse 2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        @keyframes labDotPulse {
          from { transform: scale(1); opacity: 0.8; }
          to { transform: scale(2.8); opacity: 0; }
        }
        .lab-badge__skills {
          font-size: clamp(19px, 1.6vw, 24px);
          font-weight: 700;
          line-height: 1.15;
          color: #ffffff;
          margin: 0;
        }
        .lab-badge__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          padding: 10px 18px;
          border-radius: 999px;
          background: ${EMERALD};
          color: #070a0f;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s, transform 0.2s;
        }
        .lab-badge__cta:hover {
          background: ${EMERALD_BRIGHT};
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(${NEON_RGB}, 0.4);
        }

        /* ── 6. MANIFESTO SECTION (#manifesto) ─────────────────────────── */
        .manifesto {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px clamp(24px, 6vw, 100px);
          box-sizing: border-box;
          background: #06090e;
        }
        .manifesto-inner {
          max-width: 1100px;
          text-align: center;
        }
        .manifesto-text {
          font-size: clamp(2.6rem, 5.8vw, 5.8rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: var(--letter-spacing-display);
          color: #ffffff;
          margin: 0 0 32px;
        }
        .manifesto-sub {
          font-size: clamp(1.15rem, 1.8vw, 1.6rem);
          color: ${MUTED};
          line-height: 1.6;
          max-width: 780px;
          margin: 0 auto;
        }

        /* ── 7. TRAJECTORY PINNED SCROLLYTELLING (#parcours) ───────────── */
        .trajectory-section {
          position: relative;
          width: 100%;
          height: 380vh; /* Pinned scroll distance */
          background: #06090e;
        }
        .trajectory-sticky-stage {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .trajectory-sentences-box {
          position: relative;
          width: 100%;
          max-width: 1200px;
          padding: 0 24px;
          text-align: center;
        }
        .trajectory-sentence-item {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .trajectory-sentence-huge {
          font-size: clamp(3.2rem, 8.5vw, 8.5rem);
          font-weight: 900;
          line-height: 0.94;
          letter-spacing: var(--letter-spacing-display);
          color: #ffffff;
          margin: 0;
          text-shadow: 0 6px 30px rgba(0, 0, 0, 0.9);
        }
        .trajectory-sentence-tag {
          font-size: clamp(1rem, 1.8vw, 1.4rem);
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: ${EMERALD};
          margin-bottom: 16px;
        }

        /* ── 8. TOOLKIT / CAPABILITIES (#toolkit) ──────────────────────── */
        .toolkit-section {
          position: relative;
          width: 100%;
          min-height: 100vh;
          padding: 120px clamp(24px, 5vw, 80px);
          box-sizing: border-box;
          background: #06090e;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .section-header-center {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-tag {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${EMERALD};
          margin-bottom: 12px;
          display: inline-block;
        }
        .section-title {
          font-size: clamp(2.4rem, 5vw, 4.8rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: var(--letter-spacing-display);
          color: #ffffff;
          margin: 0;
        }
        .toolkit-cards-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1140px;
        }
        .toolkit-pillar-card {
          padding: 36px 32px;
          border-radius: 28px;
          background: rgba(15, 19, 24, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 380px;
        }
        .toolkit-pillar-card:hover {
          transform: translateY(-8px);
          border-color: rgba(185, 255, 0, 0.4);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(${NEON_RGB}, 0.12);
        }
        .pillar-num {
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          color: ${EMERALD};
          font-weight: 700;
        }
        .pillar-title {
          font-size: 26px;
          font-weight: 800;
          color: #ffffff;
          margin: 14px 0 8px;
        }
        .pillar-desc {
          font-size: 15px;
          color: ${MUTED};
          line-height: 1.6;
          margin: 0 0 24px;
        }
        .pillar-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pillar-badge {
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
        }

        /* ── 9. PROJECTS SHOWCASE (#projects) ──────────────────────────── */
        .projects-section {
          position: relative;
          width: 100%;
          min-height: 100vh;
          padding: 120px clamp(24px, 5vw, 80px);
          box-sizing: border-box;
          background: #06090e;
        }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 20px;
          max-width: 1140px;
          margin: 0 auto;
        }
        .project-row-item {
          padding: 28px 32px;
          border-radius: 20px;
          background: rgba(15, 19, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s ease;
          cursor: default;
        }
        .project-row-item:hover {
          background: rgba(15, 19, 24, 0.95);
          border-color: rgba(185, 255, 0, 0.35);
          transform: translateX(6px);
        }
        .project-item-name {
          font-size: clamp(20px, 2vw, 28px);
          font-style: italic;
          font-weight: 400;
          color: #ffffff;
          margin: 0 0 6px;
        }
        .project-item-sub {
          font-size: 13px;
          color: ${MUTED};
        }

        /* ── 10. CURVED SVG PATH & NEXT SECTION ────────────────────────── */
        .next-path-section {
          position: relative;
          width: 100%;
          padding: 80px 0 20px;
          overflow: hidden;
          background: #06090e;
        }
        .curved-svg-container {
          width: 100%;
          overflow: visible;
        }

        /* ── 11. WAITLIST FINALE FORM & VIP CARD MINTING (#waitlist) ───── */
        .waitlist-finale-section {
          position: relative;
          width: 100%;
          padding: 100px clamp(24px, 5vw, 80px) 60px;
          box-sizing: border-box;
          background: #06090e;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .finale-terminal-card {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr);
          gap: clamp(28px, 4vw, 56px);
          align-items: center;
          max-width: 1140px;
          width: 100%;
          background: rgba(15, 19, 24, 0.88);
          border: 1.5px solid rgba(185, 255, 0, 0.38);
          border-radius: 36px;
          padding: clamp(28px, 4vw, 48px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(${NEON_RGB}, 0.16);
          backdrop-filter: blur(24px);
        }
        .finale-left-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .finale-right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .role-selector-pills {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }
        .role-pill-btn {
          padding: 9px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: ${MUTED};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .role-pill-btn:hover {
          color: #ffffff;
          border-color: rgba(185, 255, 0, 0.3);
        }
        .role-pill-btn.active {
          background: rgba(185, 255, 0, 0.18);
          border-color: ${EMERALD};
          color: ${EMERALD};
          box-shadow: ${GLOW_SM};
        }
        .finale-input-field {
          width: 100%;
          padding: 13px 18px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .finale-input-field:focus {
          border-color: ${EMERALD};
          box-shadow: 0 0 0 3px rgba(${NEON_RGB}, 0.22);
        }
        .finale-submit-btn {
          width: 100%;
          padding: 16px 28px;
          border-radius: 16px;
          background: ${EMERALD};
          color: #070a0f;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 32px rgba(${NEON_RGB}, 0.45);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .finale-submit-btn:hover:not(:disabled) {
          background: ${EMERALD_BRIGHT};
          transform: translateY(-2px);
          box-shadow: 0 14px 44px rgba(${NEON_RGB}, 0.6);
        }

        /* ── 12. GIANT FOOTER BRAND WORDMARK ───────────────────────────── */
        .giant-brand-footer {
          width: 100%;
          padding: 80px 24px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: #06090e;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 900px) {
          .finale-terminal-card {
            grid-template-columns: minmax(0, 1fr);
          }
          .scroll-indicator {
            display: none;
          }
          .site-header__nav {
            display: none;
          }
        }
      `}</style>

      {/* ── 1. PRELOADER INTRO SCREEN (LIKE LAB1.XIMITECH.VN) ───────────── */}
      {!introDone && (
        <div className={`fonlio-intro ${introLeaving ? 'is-leaving' : ''}`} aria-hidden="true">
          <div className="fonlio-intro__glow" />
          <div className="fonlio-intro__center">
            <BrandWordmark size="92px" glow />
            <p className="fonlio-intro__word">FONLIO</p>
            <p className="fonlio-intro__tagline">LIVING PORTFOLIO · EARLY ACCESS 2026</p>
          </div>
          <div className="fonlio-intro__meta">
            <span className="fonlio-intro__count">{String(introCount).padStart(3, '0')}</span>
            <div className="fonlio-intro__line">
              <span style={{ width: `${introCount}%` }} />
            </div>
            <span>fonlio.me</span>
          </div>
        </div>
      )}

      {/* ── 2. SITE HEADER (FLOATING GLASS CAPSULE) ─────────────────────── */}
      <header className="site-header">
        <div className="site-header__logo" onClick={() => scrollToId('hero')}>
          <BrandWordmark size="32px" glow />
        </div>

        <nav className="site-header__nav">
          {NAV_SECTIONS.map((sec) => (
            <a
              key={sec.id}
              className={`site-header__link ${activeSection === sec.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(sec.id);
              }}
              href={`#${sec.id}`}
            >
              {sec.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="lab-badge__cta"
          style={{ pointerEvents: 'auto' }}
          onClick={() => scrollToId('waitlist')}
        >
          Giữ chỗ ngay ↗
        </button>
      </header>

      {/* ── 3. VERTICAL SEGMENTED SCROLL INDICATOR ──────────────────────── */}
      <nav className="scroll-indicator" aria-label="Điều hướng các phần">
        {NAV_SECTIONS.map((sec, idx) => {
          const isAct = activeSection === sec.id;
          const curIdx = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
          const isNeighbor = Math.abs(curIdx - idx) === 1;

          return (
            <button
              key={sec.id}
              type="button"
              className={`scroll-indicator__item ${isAct ? 'is-active' : isNeighbor ? 'is-neighbor' : ''}`}
              data-label={sec.label}
              onClick={() => scrollToId(sec.id)}
            >
              <span className="scroll-indicator__bar" />
            </button>
          );
        })}
      </nav>

      {/* ── 4. SOUND TOGGLE BUTTON ──────────────────────────────────────── */}
      <button
        type="button"
        className={`sound-toggle ${soundActive ? 'is-playing' : ''}`}
        onClick={toggleSound}
        title="Bật/Tắt âm thanh không gian"
      >
        <span className="sound-toggle__bars">
          <i /><i /><i /><i />
        </span>
        <span>{soundActive ? 'Âm thanh: Bật' : 'Bật âm thanh'}</span>
      </button>

      <main>
        {/* ── 5. HERO SECTION (#hero) ───────────────────────────────────── */}
        <section className="hero-three" id="hero">
          <div className="hero-three__canvas-wrap">
            <CinematicScene3D progress={0.12} currentScene={0} />
          </div>

          <div className="hero-content">
            <h1 className="hero-main-title">
              NĂNG LỰC SỐNG ĐỘNG.
            </h1>
            <p className="hero-main-desc">
              FONLIO biến từng dòng code, bản thiết kế và chiến dịch của bạn thành Living Proof được bảo chứng minh bạch từ người thật, việc thật.
            </p>

            {/* Lab Badge floating in bottom-right (Like lab1.ximitech.vn) */}
            <aside className="lab-badge">
              <div className="lab-badge__eyebrow">
                <span className="lab-badge__dot" />
                <span>GENESIS BATCH 2026 · EARLY ACCESS</span>
              </div>
              <p className="lab-badge__skills">
                Living Proof · 3D · Bảo chứng
              </p>
              <button
                type="button"
                className="lab-badge__cta"
                onClick={() => scrollToId('waitlist')}
              >
                Giữ chỗ sớm <ArrowUpRight size={15} />
              </button>
            </aside>
          </div>
        </section>

        {/* ── 6. MANIFESTO SECTION (#manifesto) ─────────────────────────── */}
        <section className="manifesto" id="manifesto">
          <div className="manifesto-inner">
            <p className="manifesto-text">
              Đẹp thôi chưa đủ. Chúng tôi tạo ra Living Proof khiến nhà tuyển dụng tin, ở lại và trao cơ hội.
            </p>
            <p className="manifesto-sub">
              Một bản CV giấy tự chấm 5 sao không thể nói lên năng lực thật. Đã đến lúc các sản phẩm và thành tựu của bạn tự cất tiếng nói.
            </p>
          </div>
        </section>

        {/* ── 7. TRAJECTORY PINNED SCROLLYTELLING (#parcours) ───────────── */}
        <section className="trajectory-section" id="parcours" ref={trajectoryRef}>
          <div className="trajectory-sticky-stage">
            <div className="trajectory-sentences-box">
              {/* Sentence 0 */}
              <div
                className="trajectory-sentence-item"
                style={{
                  opacity: trajectoryStep === 0 ? 1 : 0,
                  transform: trajectoryStep === 0 ? 'scale(1)' : 'scale(0.92)',
                  pointerEvents: trajectoryStep === 0 ? 'auto' : 'none',
                }}
              >
                <span className="trajectory-sentence-tag">HÀNG TRIỆU HỒ SƠ</span>
                <p className="trajectory-sentence-huge">
                  Gửi đi mỗi năm.
                </p>
              </div>

              {/* Sentence 1 */}
              <div
                className="trajectory-sentence-item"
                style={{
                  opacity: trajectoryStep === 1 ? 1 : 0,
                  transform: trajectoryStep === 1 ? 'scale(1)' : 'scale(0.92)',
                  pointerEvents: trajectoryStep === 1 ? 'auto' : 'none',
                }}
              >
                <span className="trajectory-sentence-tag" style={{ color: '#f87171' }}>CHỈ 6 GIÂY</span>
                <p className="trajectory-sentence-huge">
                  Để bị lãng quên mãi mãi.
                </p>
              </div>

              {/* Sentence 2 */}
              <div
                className="trajectory-sentence-item"
                style={{
                  opacity: trajectoryStep === 2 ? 1 : 0,
                  transform: trajectoryStep === 2 ? 'scale(1)' : 'scale(0.92)',
                  pointerEvents: trajectoryStep === 2 ? 'auto' : 'none',
                }}
              >
                <span className="trajectory-sentence-tag">HÔM NAY</span>
                <p className="trajectory-sentence-huge">
                  FONLIO thay đổi cuộc chơi.
                </p>
              </div>

              {/* Sentence 3 */}
              <div
                className="trajectory-sentence-item"
                style={{
                  opacity: trajectoryStep === 3 ? 1 : 0,
                  transform: trajectoryStep === 3 ? 'scale(1)' : 'scale(0.92)',
                  pointerEvents: trajectoryStep === 3 ? 'auto' : 'none',
                }}
              >
                <span className="trajectory-sentence-tag">LIVING PROOF</span>
                <p className="trajectory-sentence-huge">
                  Bảo chứng bằng sự thật.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. TOOLKIT / CAPABILITIES (#toolkit) ──────────────────────── */}
        <section className="toolkit-section" id="toolkit">
          <div className="section-header-center">
            <span className="section-tag">TRỤ CỘT BẢO CHỨNG</span>
            <h2 className="section-title">Năng lực thực chứng</h2>
          </div>

          <div className="toolkit-cards-row">
            {/* Pillar 1: Lập trình */}
            <div className="toolkit-pillar-card">
              <div>
                <span className="pillar-num">01 / TECH</span>
                <h3 className="pillar-title">Lập trình &amp; Dữ liệu</h3>
                <p className="pillar-desc">
                  Liên kết trực tiếp commit GitHub, repo thực tế, độ khả dụng sản phẩm và tỷ lệ đóng góp dòng code.
                </p>
              </div>
              <div className="pillar-badges">
                <span className="pillar-badge">GitHub Sync</span>
                <span className="pillar-badge">Live Deploy</span>
                <span className="pillar-badge">Tech Lead Stamp</span>
              </div>
            </div>

            {/* Pillar 2: Thiết kế */}
            <div className="toolkit-pillar-card">
              <div>
                <span className="pillar-num">02 / DESIGN</span>
                <h3 className="pillar-title">Thiết kế &amp; Sáng tạo</h3>
                <p className="pillar-desc">
                  Showcase nguyên mẫu tương tác Figma, hệ thống thiết kế và nghiên cứu trải nghiệm người dùng thực chiến.
                </p>
              </div>
              <div className="pillar-badges">
                <span className="pillar-badge">Figma Interactive</span>
                <span className="pillar-badge">Design System</span>
                <span className="pillar-badge">Art Director Verified</span>
              </div>
            </div>

            {/* Pillar 3: Vận hành */}
            <div className="toolkit-pillar-card">
              <div>
                <span className="pillar-num">03 / GROWTH</span>
                <h3 className="pillar-title">Marketing &amp; Sự kiện</h3>
                <p className="pillar-desc">
                  Bảo chứng qua số liệu tiếp cận thực, đối soát ngân sách gây quỹ và xác thực từ Chủ nhiệm CLB.
                </p>
              </div>
              <div className="pillar-badges">
                <span className="pillar-badge">Verified Metrics</span>
                <span className="pillar-badge">Event Report</span>
                <span className="pillar-badge">Club Leader Sign</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. PROJECTS SHOWCASE (#projects) ──────────────────────────── */}
        <section className="projects-section" id="projects">
          <div className="section-header-center">
            <span className="section-tag">TIÊU BIỂU</span>
            <h2 className="section-title">Dự án đã bảo chứng</h2>
          </div>

          <div className="projects-grid">
            {SHOWCASE_PROJECTS.map((proj) => (
              <div key={proj.name} className="project-row-item">
                <div>
                  <h4 className="project-item-name">{proj.name}</h4>
                  <div className="project-item-sub">{proj.type} · {proj.verifier}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)', color: EMERALD }}>
                  {proj.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 10. CURVED SVG PATH TEXT (LIKE LAB1.XIMITECH.VN) ──────────── */}
        <section className="next-path-section">
          <svg
            className="curved-svg-container"
            fill="none"
            viewBox="0 0 2400 320"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="fonlioCurvePath"
              d="M0 240 C 400 80, 800 340, 1200 160 C 1600 40, 2000 280, 2400 120"
            />
            <text fill="rgba(255, 255, 255, 0.85)" fontSize="48" fontWeight="800" letterSpacing="-0.02em">
              <textPath href="#fonlioCurvePath" startOffset="5%">
                Ý TƯỞNG &amp; NĂNG LỰC CỦA BẠN XỨNG ĐÁNG MỘT NƠI TỎA SÁNG ĐÍCH THỰC ✦ FONLIO GENESIS BATCH 2026 ✦
              </textPath>
            </text>
          </svg>
        </section>

        {/* ── 11. WAITLIST FINALE FORM & VIP CARD MINTING (#waitlist) ───── */}
        <section className="waitlist-finale-section" id="waitlist">
          <div className="section-header-center" style={{ marginBottom: 44 }}>
            <span className="section-tag">GENESIS BATCH 2026</span>
            <h2 className="section-title">Khắc tên &amp; Giữ chỗ ngay</h2>
          </div>

          <div className="finale-terminal-card">
            {/* Cột trái: Thẻ VIP Hologram thời gian thực & Đồng hồ đếm ngược */}
            <div className="finale-left-col">
              <HoloVIPCard
                name={formData.name || 'NGƯỜI TIÊN PHONG'}
                role={selectedRole.roleBadge}
                tier={successData?.tier || 'TOP 10 VIP FOUNDER'}
                code={successData?.referralCode || '#FL-GENESIS-2026'}
              />

              {/* Countdown Wireframe module */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                  <Clock size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                  MỞ CỔNG EARLY ACCESS TRONG
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', fontFamily: 'Space Mono, monospace', fontSize: '1.3rem', fontWeight: 800, color: EMERALD }}>
                  <span>{String(countdown.days).padStart(2, '0')}d</span> :
                  <span>{String(countdown.hours).padStart(2, '0')}h</span> :
                  <span>{String(countdown.minutes).padStart(2, '0')}m</span> :
                  <span>{String(countdown.seconds).padStart(2, '0')}s</span>
                </div>
              </div>
            </div>

            {/* Cột phải: Form đăng ký */}
            <div className="finale-right-col">
              {successData ? (
                /* Thành công */
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(185, 255, 0, 0.15)', border: `2px solid ${EMERALD}`, display: 'grid', placeItems: 'center', margin: '0 auto 18px', color: EMERALD }}>
                    <CheckCheck size={30} />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
                    CHÚC MỪNG {successData.name}!
                  </h3>
                  <p style={{ color: MUTED, fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 22px' }}>
                    Bạn đã giữ thành công vị trí <b>#{successData.number}</b> trong Genesis Batch. Thẻ VIP cá nhân đã được tạo!
                  </p>

                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: 16, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                    <code style={{ color: EMERALD, fontFamily: 'Space Mono', fontWeight: 700, fontSize: '1.05rem' }}>
                      {successData.referralCode}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.12)', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      <Copy size={14} /> {copiedLink ? 'Đã sao chép!' : 'Sao chép link'}
                    </button>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: MUTED }}>
                    Thư mời kích hoạt sớm sẽ được gửi tới <b>{successData.email}</b>.
                  </p>
                </div>
              ) : (
                /* Form nhập */
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: EMERALD, fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      <Users size={13} /> {displayCount} bạn trẻ đã tham gia
                    </div>
                    <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', margin: '0 0 4px' }}>
                      ĐĂNG KÝ GENESIS PASS
                    </h3>
                    <p style={{ color: MUTED, fontSize: '0.86rem', margin: 0 }}>
                      Gõ tên bạn — Thẻ VIP bên cạnh lập tức được khắc tên theo thời gian thực!
                    </p>
                  </div>

                  {/* Vai trò */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                      Vai trò chuyên môn:
                    </label>
                    <div className="role-selector-pills">
                      {QUICK_ROLES.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          className={`role-pill-btn ${formData.roleId === role.id ? 'active' : ''}`}
                          onClick={() => setFormData((prev) => ({ ...prev, roleId: role.id }))}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Họ tên */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUTED, marginBottom: 5 }}>
                      Họ và tên của bạn:
                    </label>
                    <input
                      type="text"
                      className="finale-input-field"
                      placeholder="Ví dụ: Nguyễn Minh Tuấn"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      maxLength={50}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUTED, marginBottom: 5 }}>
                      Email nhận mã vé kích hoạt:
                    </label>
                    <input
                      type="email"
                      className="finale-input-field"
                      placeholder="tuan.nguyen@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  {/* Trường đại học */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUTED, marginBottom: 5 }}>
                      Trường đại học / Tổ chức (tùy chọn):
                    </label>
                    <input
                      type="text"
                      className="finale-input-field"
                      placeholder="ĐH FPT, Bách Khoa, RMIT..."
                      value={formData.school}
                      onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{ color: '#f87171', fontSize: '0.84rem', fontWeight: 600 }}>
                      {errorMsg}
                    </div>
                  )}

                  <button type="submit" className="finale-submit-btn" disabled={submitting}>
                    {submitting ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" /> Đang tạo thẻ VIP...
                      </>
                    ) : (
                      <>
                        <Sparkles size={17} /> Khắc tên &amp; Nhận thẻ Genesis ngay
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: '12px', color: MUTED }}>
                    <span>🔒 Miễn phí 100%</span>
                    <span>·</span>
                    <span>✦ Top 10 nhận VIP trọn đời</span>
                    <span>·</span>
                    <span>⚡ Nhận vé tức thì</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── 12. GIANT FOOTER BRAND WORDMARK (EXACTLY AS BRAND STANDARD) ── */}
      <footer className="giant-brand-footer">
        <div style={{ width: 'min(1440px, 100%)', maxHeight: 480, display: 'flex', justifyContent: 'center' }}>
          <BrandWordmark size="100%" maxHeight="480px" glow />
        </div>

        <p style={{ marginTop: 28, color: MUTED, fontSize: '0.88rem' }}>
          © 2026 FONLIO — Nền tảng Living Portfolio &amp; Bảo chứng nghề nghiệp thế hệ mới.
        </p>
      </footer>
    </div>
  );
}
