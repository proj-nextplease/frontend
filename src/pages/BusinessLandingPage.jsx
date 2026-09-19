import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck,
  Building2, Users, FileText, BarChart3, Search,
  Zap, BrainCircuit, Target, Check, Phone, Mail,
  MapPin, Send, ExternalLink, ChevronRight, User,
  Globe, Laptop, Award, Layers, MousePointer,
  Clock, CheckSquare, MessageSquare, TrendingUp,
  Calendar, Paperclip, AtSign, ArrowUp, Briefcase
} from 'lucide-react';

/* ── Exact Navigos Talent One Design Tokens ── */
const NAV_INDIGO = '#304ffe'; // Primary Brand Blue/Indigo
const NAV_DARK = '#0f172a';   // Deep charcoal black for main headings
const NAV_MUTED = '#475569';  // Clean slate secondary text
const NAV_BLUE = '#3b82f6';   // Accent sky/royal blue
const BG_HERO = 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)';
const BG_SECTION_GRAY = '#edf2f7';
const BORDER_COLOR = '#e2e8f0';

const INNER = { width: 'min(1280px, calc(100% - 64px))', margin: '0 auto' };

/* ── Enterprise Real Brand Logos for 2-row Infinite Marquee ── */
const COMPANY_LOGOS_ROW1 = [
  { name: 'DAIKIN', src: '/companies/daikin.png' },
  { name: 'Vinamilk', src: '/companies/vinamilk.png' },
  { name: 'FPT Software', src: '/companies/fpt-software.png' },
  { name: 'MB Bank', src: '/companies/mbbank.png' },
  { name: 'Vingroup', src: '/companies/vingroup.png' },
  { name: 'Viettel AI', src: '/companies/viettel-ai.png' },
];

const COMPANY_LOGOS_ROW2 = [
  { name: 'Techcombank', src: '/companies/techcombank.png' },
  { name: 'MAERSK', src: '/companies/maersk.png' },
  { name: 'THACO AUTO', src: '/companies/thaco-auto.png' },
  { name: 'Home Credit', src: '/companies/homecredit.png' },
  { name: 'FPT IS', src: '/companies/fpt-is.png' },
  { name: 'Vinamilk', src: '/companies/vinamilk.png' },
  { name: 'DAIKIN', src: '/companies/daikin.png' },
];

const GRADIENT_BRAND = {
  background: 'linear-gradient(95deg, #1d4ed8 0%, #2563eb 35%, #0284c7 70%, #38bdf8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline',
  fontWeight: 900,
};

export function BusinessLandingPage() {
  const [activeTab, setActiveTab] = useState('gia-tri');

  // Interactive state for Contact modal / quick consult
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    phone: '',
    companyName: '',
    hiringScale: '10-50',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ fullName: '', workEmail: '', phone: '', companyName: '', hiringScale: '10-50' });
    }, 4000);
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      background: '#ffffff',
      color: NAV_DARK,
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      marginTop: '-34px',
      overflowX: 'clip',
    }}>
      {/* ── STICKY HEADER (Exact Navigos Talent One Style) ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER_COLOR}`,
        height: 74,
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}>
        {/* Left: Stacked Logo + Left Nav Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Link
            to="/businesses"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              lineHeight: 1.05,
              userSelect: 'none',
              paddingRight: 8,
            }}
          >
            <span style={{
              fontSize: '1.28rem',
              fontWeight: 900,
              fontStyle: 'normal',
              letterSpacing: '-0.03em',
              color: '#1e3a8a',
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
              display: 'block',
            }}>
              NEXTPLEASE
            </span>
            <span style={{
              fontSize: '1.24rem',
              fontWeight: 900,
              fontStyle: 'normal',
              letterSpacing: '-0.03em',
              color: '#2563eb',
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
              display: 'block',
            }}>
              TALENT ONE
            </span>
          </Link>

          {/* Left-Aligned Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <button
              onClick={() => scrollToSection('gia-tri')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'gia-tri' ? NAV_INDIGO : NAV_MUTED,
                fontWeight: activeTab === 'gia-tri' ? 800 : 600,
                fontSize: '0.98rem',
                cursor: 'pointer',
                padding: '6px 0',
                borderBottom: activeTab === 'gia-tri' ? `2px solid ${NAV_INDIGO}` : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Giá trị
            </button>
            <button
              onClick={() => scrollToSection('tinh-nang')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'tinh-nang' ? NAV_INDIGO : NAV_MUTED,
                fontWeight: activeTab === 'tinh-nang' ? 800 : 600,
                fontSize: '0.98rem',
                cursor: 'pointer',
                padding: '6px 0',
                borderBottom: activeTab === 'tinh-nang' ? `2px solid ${NAV_INDIGO}` : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Tính năng
            </button>
            <button
              onClick={() => scrollToSection('lien-he')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'lien-he' ? NAV_INDIGO : NAV_MUTED,
                fontWeight: activeTab === 'lien-he' ? 800 : 600,
                fontSize: '0.98rem',
                cursor: 'pointer',
                padding: '6px 0',
                borderBottom: activeTab === 'lien-he' ? `2px solid ${NAV_INDIGO}` : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Liên hệ
            </button>
          </nav>
        </div>

        {/* Right Header: Only Đăng nhập (Redirect to /business/login) */}
        <Link
          to="/business/login"
          style={{
            background: 'none',
            border: 'none',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 8,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = NAV_INDIGO; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#0f172a'; }}
        >
          <User size={21} strokeWidth={2.2} />
          <span>Đăng nhập</span>
        </Link>
      </header>

      {/* ── HERO BANNER: EXACT NAVIGOS TALENT ONE GRID WITH APP WINDOW ── */}
      <section style={{
        position: 'relative',
        padding: '70px 0 90px',
        background: 'radial-gradient(ellipse 65% 55% at 50% -15%, rgba(59, 130, 246, 0.12), transparent 75%), #fcfdff',
        overflow: 'hidden',
      }}>
        {/* Subtle grid background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />

        <div style={{
          ...INNER,
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1.05fr 1.35fr',
          gap: 48,
          alignItems: 'center',
        }}>
          {/* Left Hero Title & CTA */}
          <div>
            <h1 style={{
              fontSize: 'clamp(2.75rem, 4.5vw, 3.95rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#0f172a',
              letterSpacing: '-0.035em',
              margin: '0 0 36px',
            }}>
              Đăng tin tiếp cận<br />
              <span style={GRADIENT_BRAND}>2M+ ứng viên</span><br />
              mọi cấp bậc
            </h1>

            <Link
              to="/business/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: NAV_INDIGO,
                color: '#ffffff',
                fontSize: '1.08rem',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '16px 36px',
                borderRadius: 14,
                boxShadow: '0 10px 25px -4px rgba(48, 79, 254, 0.45)',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e40af'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = NAV_INDIGO; e.currentTarget.style.transform = 'none'; }}
            >
              <Sparkles size={19} />
              <span>Dùng thử miễn phí</span>
            </Link>
          </div>

          {/* Right Hero: Exact Navigos Talent App Window Mockup */}
          <div>
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #cbd5e1',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.22)',
              overflow: 'hidden',
            }}>
              {/* Dark Browser Frame Bar */}
              <div style={{
                background: '#1e293b',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  </div>
                  <div style={{
                    background: '#0f172a',
                    borderRadius: 6,
                    padding: '3px 14px',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    marginLeft: 8,
                  }}>
                    talent.nextplease.vn/tuyen-dung/tao-tin-tuyen-dung/xem-lai
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: 8 }}>
                  <span>🇻🇳</span>
                  <span>🔔</span>
                  <span>⚙️</span>
                </div>
              </div>

              {/* App Internal Layout: Mini Sidebar + Form Canvas + Mobile Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 180px', minHeight: 410, background: '#f8fafc' }}>
                {/* Mini Left Sidebar */}
                <div style={{ background: '#f1f5f9', padding: '14px 10px', borderRight: '1px solid #e2e8f0', fontSize: '0.72rem' }}>
                  <div style={{ fontWeight: 900, color: '#1e3a8a', fontStyle: 'italic', marginBottom: 12, fontSize: '0.78rem' }}>
                    NEXTPLEASE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, color: '#64748b' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>Tuyển dụng</span>
                    <span style={{ padding: '2px 6px' }}>Tổng quan</span>
                    <span style={{ background: '#ffffff', color: '#0f172a', fontWeight: 700, padding: '4px 6px', borderRadius: 5, border: '1px solid #cbd5e1' }}>
                      Tạo tin mới
                    </span>
                    <span style={{ padding: '2px 6px' }}>Danh sách việc làm</span>
                    <span style={{ padding: '2px 6px' }}>Ứng viên ứng tuyển</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', marginTop: 6 }}>Ứng viên</span>
                    <span style={{ padding: '2px 6px' }}>Tìm kiếm tài năng</span>
                    <span style={{ padding: '2px 6px' }}>Đề xuất ứng viên</span>
                  </div>
                </div>

                {/* Center Form Section */}
                <div style={{ padding: '16px 18px', background: '#ffffff', borderRight: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: 10 }}>
                    Thông tin công ty
                  </strong>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', marginBottom: 3 }}>Hồ sơ công ty</label>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>
                      NextPlease Tech Innovation
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', marginBottom: 3 }}>Tuyển dụng cho</label>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', color: '#94a3b8' }}>
                      Vui lòng chọn chi nhánh / phòng ban
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', marginBottom: 3 }}>Ngành nghề chi tiết</label>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>
                      Khởi Nghiệp &gt; Lập kế hoạch Kinh doanh &amp; AI
                    </div>
                  </div>

                  <div style={{ marginBottom: 12, position: 'relative' }}>
                    <label style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', marginBottom: 3 }}>Địa điểm làm việc</label>
                    <div style={{ background: '#f8fafc', border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 10px', color: '#0f172a', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Hồ Chí Minh</span>
                      <span>▾</span>
                    </div>
                    {/* Simulated hand cursor */}
                    <div style={{ position: 'absolute', right: 28, bottom: -6, fontSize: '1.2rem', pointerEvents: 'none' }}>
                      👆
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                    <strong style={{ fontSize: '0.78rem', color: '#0f172a', display: 'block', marginBottom: 4 }}>Quy định về bảo mật</strong>
                    <p style={{ color: '#94a3b8', fontSize: '0.65rem', margin: '0 0 6px' }}>Ứng viên cần đồng ý với quy định bảo mật trước khi nộp hồ sơ.</p>
                    <span style={{ color: '#2563eb', fontSize: '0.68rem', fontWeight: 700 }}>👁️ Xem quy định bảo mật</span>
                  </div>
                </div>

                {/* Right Mobile Preview */}
                <div style={{ padding: '14px 12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', marginBottom: 8, fontWeight: 700 }}>
                      <span>17:45</span>
                      <span>📶 🔋</span>
                    </div>
                    <strong style={{ fontSize: '0.76rem', color: '#0f172a', display: 'block', marginBottom: 6 }}>
                      Công việc cụ thể là gì?
                    </strong>
                    <ul style={{ paddingLeft: 12, margin: '0 0 8px', fontSize: '0.62rem', color: '#475569', lineHeight: 1.4 }}>
                      <li>Lãnh đạo và quản lý nhóm phát triển kinh doanh.</li>
                      <li>Thiết lập mục tiêu và KPI cho nhóm.</li>
                      <li>Xây dựng giải pháp AI tối ưu.</li>
                    </ul>

                    <strong style={{ fontSize: '0.72rem', color: '#0f172a', display: 'block', marginBottom: 4 }}>
                      Quyền lợi có gì? ✨
                    </strong>
                    <div style={{ fontSize: '0.62rem', color: '#475569', background: '#ffffff', padding: '6px', borderRadius: 4, border: '1px solid #e2e8f0', marginBottom: 6 }}>
                      💵 Lương thưởng hấp dẫn + EXP Bonus<br />
                      🛡️ Bảo hiểm &amp; sức khỏe toàn diện
                    </div>
                  </div>

                  <div style={{ background: NAV_INDIGO, color: '#ffffff', textAlign: 'center', padding: '6px', borderRadius: 6, fontWeight: 700, fontSize: '0.7rem' }}>
                    Ứng tuyển ngay
                  </div>
                </div>
              </div>

              {/* Bottom Action Strip */}
              <div style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '8px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#ffffff', padding: '4px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Hủy</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#ffffff', padding: '4px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Lưu nháp</span>
                <span style={{ fontSize: '0.72rem', color: '#ffffff', background: NAV_INDIGO, padding: '4px 14px', borderRadius: 6, fontWeight: 700 }}>Đăng tin tuyển dụng</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: GIÁ TRỊ NEXTPLEASE TALENT ONE MANG LẠI (Expanded Width & Bigger Images) ── */}
      <section id="gia-tri" style={{ padding: '105px 0 115px', background: '#ffffff', borderTop: `1px solid ${BORDER_COLOR}` }}>
        <div style={{ width: 'min(1420px, calc(100% - 64px))', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2.75rem, 4.4vw, 3.85rem)',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.035em',
            margin: '0 0 20px',
            lineHeight: 1.18,
          }}>
            Giá trị <span style={GRADIENT_BRAND}>NextPlease Talent One</span><br />
            mang lại
          </h2>

          <p style={{
            fontSize: '1.22rem',
            lineHeight: 1.68,
            color: NAV_MUTED,
            maxWidth: 840,
            margin: '0 auto 72px',
          }}>
            NextPlease Talent One giúp doanh nghiệp tiết kiệm thời gian và dễ dàng tìm đúng người, thay vì loay hoay với quy trình rời rạc và dữ liệu thiếu tin cậy.
          </p>

          {/* 4 Circular Pastel Value Props - Expanded Grid & Bigger Circle Graphics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 48,
            textAlign: 'center',
          }}>
            {/* Item 1: Trải nghiệm tuyển dụng liền mạch */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                transition: 'transform 0.25s ease',
              }}>
                <img
                  src="/values/value-one.png"
                  alt="Trải nghiệm tuyển dụng liền mạch"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{ fontSize: '1.38rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.35, letterSpacing: '-0.025em' }}>
                Trải nghiệm tuyển dụng liền mạch
              </h3>
              <p style={{ fontSize: '1.02rem', color: '#64748b', lineHeight: 1.65, margin: 0, maxWidth: 290 }}>
                Giao diện chuyên nghiệp, đơn giản, dễ dùng.
              </p>
            </div>

            {/* Item 2: AI đồng hành & hỗ trợ toàn diện */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                transition: 'transform 0.25s ease',
              }}>
                <img
                  src="/values/value-two.png"
                  alt="AI đồng hành & hỗ trợ toàn diện"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{ fontSize: '1.38rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.35, letterSpacing: '-0.025em' }}>
                AI đồng hành &amp; hỗ trợ toàn diện
              </h3>
              <p style={{ fontSize: '1.02rem', color: '#64748b', lineHeight: 1.65, margin: 0, maxWidth: 290 }}>
                Từ lọc hồ sơ đến đề xuất ứng viên, mọi bước đều có AI.
              </p>
            </div>

            {/* Item 3: Đa dạng giải pháp tuyển dụng */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                transition: 'transform 0.25s ease',
              }}>
                <img
                  src="/values/value-three.png"
                  alt="Đa dạng giải pháp tuyển dụng"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{ fontSize: '1.38rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.35, letterSpacing: '-0.025em' }}>
                Đa dạng giải pháp tuyển dụng
              </h3>
              <p style={{ fontSize: '1.02rem', color: '#64748b', lineHeight: 1.65, margin: 0, maxWidth: 290 }}>
                Lên chương trình tuyển dụng, chọn ứng viên phù hợp, truyền thông hiệu quả.
              </p>
            </div>

            {/* Item 4: Phù hợp mọi quy mô doanh nghiệp */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                transition: 'transform 0.25s ease',
              }}>
                <img
                  src="/values/value-four.png"
                  alt="Phù hợp mọi quy mô doanh nghiệp"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{ fontSize: '1.38rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.35, letterSpacing: '-0.025em' }}>
                Phù hợp mọi quy mô doanh nghiệp
              </h3>
              <p style={{ fontSize: '1.02rem', color: '#64748b', lineHeight: 1.65, margin: 0, maxWidth: 290 }}>
                Gói dịch vụ linh hoạt cho startup đến tập đoàn lớn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: CÁC TÍNH NĂNG NỔI BẬT (2x2 GRID MATCHING NAVIGOS & 4 FEATURE PNGs) ── */}
      <section id="tinh-nang" style={{ padding: '105px 0 115px', background: BG_SECTION_GRAY }}>
        <div style={{ width: 'min(1420px, calc(100% - 64px))', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto 64px' }}>
            <h2 style={{
              fontSize: 'clamp(2.75rem, 4.4vw, 3.85rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.035em',
              margin: '0 0 20px',
              lineHeight: 1.18,
            }}>
              Các tính năng nổi bật giúp việc<br />
              tuyển dụng <span style={GRADIENT_BRAND}>dễ dàng hơn</span>
            </h2>
            <p style={{ fontSize: '1.22rem', lineHeight: 1.65, color: NAV_MUTED, margin: 0 }}>
              Mọi công cụ bạn cần để tuyển dụng người, đúng lúc, gói gọn trong một nền tảng.
            </p>
          </div>

          {/* 2x2 Feature Grid with User Images */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
            {/* Card 1: Tạo tin tuyển dụng nhanh chóng */}
            <div style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '44px 40px 0',
              border: '1px solid #cbd5e1',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
                  <span style={GRADIENT_BRAND}>Tạo tin tuyển dụng</span> nhanh chóng
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Tạo tin tuyển dụng tự mô tả hoặc tự khóa, không cần nhập thủ công.</span>
                  </li>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Gợi ý mức lương phù hợp theo vị trí.</span>
                  </li>
                </ul>
              </div>

              {/* Feature Image 1 */}
              <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
                <img
                  src="/features/feature-one.png"
                  alt="Tạo tin tuyển dụng nhanh chóng"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                  }}
                />
              </div>
            </div>

            {/* Card 2: Tìm kiếm & sàng lọc ứng viên thông minh */}
            <div style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '44px 40px 0',
              border: '1px solid #cbd5e1',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
                  <span style={GRADIENT_BRAND}>Tìm kiếm &amp; sàng lọc</span> ứng viên thông minh
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Tìm theo JD, công việc hoặc CV mẫu.</span>
                  </li>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Phát hiện hồ sơ tương tự ứng viên đã chọn.</span>
                  </li>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Lọc nhanh theo tiêu chí nhờ AI Assistant.</span>
                  </li>
                </ul>
              </div>

              {/* Feature Image 2 */}
              <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
                <img
                  src="/features/feature-two.png"
                  alt="Tìm kiếm & sàng lọc ứng viên thông minh"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                  }}
                />
              </div>
            </div>

            {/* Card 3: Đề xuất ứng viên phù hợp & chuẩn xác */}
            <div style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '44px 40px 0',
              border: '1px solid #cbd5e1',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
                  <span style={GRADIENT_BRAND}>Đề xuất ứng viên</span> phù hợp &amp; chuẩn xác
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>AI phân tích yêu cầu và sàng lọc hàng triệu hồ sơ.</span>
                  </li>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Gửi ngay top ứng viên phù hợp nhất đến nhà tuyển dụng.</span>
                  </li>
                </ul>
              </div>

              {/* Feature Image 3 */}
              <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
                <img
                  src="/features/feature-three.png"
                  alt="Đề xuất ứng viên phù hợp & chuẩn xác"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                  }}
                />
              </div>
            </div>

            {/* Card 4: AI screening hiệu quả & linh hoạt */}
            <div style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '44px 40px 0',
              border: '1px solid #cbd5e1',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
                  <span style={GRADIENT_BRAND}>AI screening</span> hiệu quả &amp; linh hoạt
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Tự động chấm điểm hồ sơ, tiết kiệm đến 80% thời gian.</span>
                  </li>
                  <li style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                    <span>Tùy chỉnh tiêu chí đánh giá theo nhu cầu.</span>
                  </li>
                </ul>
              </div>

              {/* Feature Image 4 */}
              <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
                <img
                  src="/features/feature-four.png"
                  alt="AI screening hiệu quả & linh hoạt"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CÁC TÍNH NĂNG SẮP RA MẮT (Exact Navigos Upcoming Features Section) ── */}
      <section style={{ padding: '95px 0', background: '#ffffff', borderTop: `1px solid ${BORDER_COLOR}` }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 60px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#334155',
              marginBottom: 16,
            }}>
              <Calendar size={16} color="#4338ca" />
              <span>SẮP RA MẮT</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.035em',
              margin: '0 0 16px',
              lineHeight: 1.2,
            }}>
              Các tính năng <span style={GRADIENT_BRAND}>sắp ra mắt</span>
            </h2>
            <p style={{ fontSize: '1.18rem', color: NAV_MUTED, margin: 0, lineHeight: 1.6 }}>
              NextPlease Talent One không ngừng hoàn thiện để mang đến trải nghiệm tuyển dụng hiệu quả hơn mỗi ngày.
            </p>
          </div>

          {/* 2 Big Upcoming Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
            {/* Upcoming 1: Quản lý chiến dịch tuyển dụng quy mô lớn */}
            <div style={{
              background: '#f1f5ff',
              borderRadius: 24,
              padding: '44px 40px 0',
              border: '1px solid #dbeafe',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
                  <span style={GRADIENT_BRAND}>Quản lý chiến dịch</span> tuyển dụng quy mô lớn
                </h3>
                <p style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.65, margin: '0 0 32px' }}>
                  Công cụ hỗ trợ quảng cáo, showcase, quản lý &amp; đánh giá ứng viên với AI cho chiến dịch tuyển dụng quy mô lớn lên tới hàng chục nghìn ứng viên.
                </p>
              </div>

              {/* Incoming Feature Image 1 */}
              <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
                <img
                  src="/features/incoming-feature-one.png"
                  alt="Quản lý chiến dịch tuyển dụng quy mô lớn"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            </div>

            {/* Upcoming 2: Tích hợp linh hoạt với hệ thống khác */}
            <div style={{
              background: '#f1f5ff',
              borderRadius: 24,
              padding: '44px 40px 0',
              border: '1px solid #dbeafe',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
                  <span style={GRADIENT_BRAND}>Tích hợp linh hoạt</span> với hệ thống khác
                </h3>
                <p style={{ fontSize: '1.05rem', color: NAV_MUTED, lineHeight: 1.65, margin: '0 0 32px' }}>
                  Khả năng tích hợp dễ dàng với các hệ thống quản lý tuyển dụng khác: HRM, ATS, CRM, các công cụ phỏng vấn, đánh giá...
                </p>
              </div>

              {/* Incoming Feature Image 2 with NextPlease Talent One overlay badge */}
              <div style={{
                marginTop: 'auto',
                width: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                overflow: 'hidden',
              }}>
                <img
                  src="/features/incoming-feature-two.png"
                  alt="Tích hợp linh hoạt với hệ thống khác"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />

                {/* Overwrite badge with NEXTPLEASE TALENT ONE */}
                <div style={{
                  position: 'absolute',
                  left: '22.4%',
                  top: '66.8%',
                  width: '32.6%',
                  height: '21.1%',
                  background: '#3857f6',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  paddingLeft: '2.5%',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 16px rgba(56, 87, 246, 0.3)',
                  zIndex: 2,
                }}>
                  <span style={{
                    color: '#ffffff',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    fontSize: 'clamp(0.95rem, 1.65vw, 1.55rem)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.15,
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  }}>
                    NEXTPLEASE
                  </span>
                  <span style={{
                    color: '#ffffff',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    fontSize: 'clamp(0.92rem, 1.6vw, 1.5rem)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.15,
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  }}>
                    TALENT ONE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ĐỒNG HÀNH CÙNG NHIỀU THƯƠNG HIỆU TUYỂN DỤNG LỚN (2 Marquee Scrolling Tracks) ── */}
      <section style={{ padding: '100px 0 115px', background: '#ffffff', borderTop: `1px solid ${BORDER_COLOR}`, overflow: 'hidden' }}>
        {/* Style block for keyframe animation - no pause on hover */}
        <style>{`
          @keyframes marqueeScrollLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeScrollRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-track-left {
            display: flex;
            width: max-content;
            gap: 52px;
            animation: marqueeScrollLeft 32s linear infinite;
          }
          .marquee-track-right {
            display: flex;
            width: max-content;
            gap: 52px;
            animation: marqueeScrollRight 32s linear infinite;
          }
        `}</style>

        <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto 60px', padding: '0 24px' }}>
          <h2 style={{
            fontSize: 'clamp(2.75rem, 4.4vw, 3.85rem)',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.035em',
            margin: '0 0 16px',
            lineHeight: 1.2,
          }}>
            Đồng hành cùng nhiều <span style={GRADIENT_BRAND}>thương hiệu tuyển dụng lớn</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: NAV_MUTED, margin: 0, lineHeight: 1.6 }}>
            Hàng trăm doanh nghiệp hàng đầu tin tưởng đồng hành cùng nền tảng NextPlease Talent One.
          </p>
        </div>

        {/* Marquee Container with Gradient Fading Mask */}
        <div style={{
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}>
          {/* Row 1: Right to Left (Moving from right to left) */}
          <div className="marquee-track-left">
            {[...COMPANY_LOGOS_ROW1, ...COMPANY_LOGOS_ROW1, ...COMPANY_LOGOS_ROW1, ...COMPANY_LOGOS_ROW1].map((p, idx) => (
              <div
                key={`row1-${idx}`}
                style={{
                  minWidth: 160,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 12px',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                <img
                  src={p.src}
                  alt={p.name}
                  style={{
                    maxHeight: 46,
                    maxWidth: 160,
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Row 2: Left to Right (Moving from left to right / reverse) */}
          <div className="marquee-track-right">
            {[...COMPANY_LOGOS_ROW2, ...COMPANY_LOGOS_ROW2, ...COMPANY_LOGOS_ROW2, ...COMPANY_LOGOS_ROW2].map((p, idx) => (
              <div
                key={`row2-${idx}`}
                style={{
                  minWidth: 160,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 12px',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                <img
                  src={p.src}
                  alt={p.name}
                  style={{
                    maxHeight: 46,
                    maxWidth: 160,
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: MỘT NỀN TẢNG, MỌI QUY TRÌNH (Large Left Text, Enlarged Right Cards Flush to Edges) ── */}
      <section id="mot-nen-tang" style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        padding: '110px 0 120px',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 45%, #ede9fe 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(99, 102, 241, 0.15)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
      }}>
        {/* Soft Ambient Light Effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(70px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: 550,
          height: 550,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(70px)',
        }} />

        <div style={{
          width: '100%',
          maxWidth: 1600,
          margin: '0 auto',
          padding: '0 clamp(24px, 5vw, 80px)',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.35fr',
          gap: 'clamp(32px, 5vw, 70px)',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Left Content: Huge & Sát Trái */}
          <div style={{ maxWidth: 620, justifySelf: 'start' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#3730a3',
              padding: '8px 20px',
              borderRadius: 999,
              fontSize: '0.92rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: 24,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.1)',
              backdropFilter: 'blur(8px)',
            }}>
              <Sparkles size={17} color="#4f46e5" />
              <span>NỀN TẢNG TUYỂN DỤNG THÔNG MINH</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2.8rem, 4.5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              color: '#0f172a',
              letterSpacing: '-0.015em',
              margin: '0 0 24px',
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}>
              Một nền tảng,<br />
              <span style={{
                color: '#2563eb',
                fontWeight: 800,
                display: 'inline-block',
              }}>
                mọi quy trình
              </span>
            </h2>

            <p style={{
              fontSize: 'clamp(1.15rem, 1.8vw, 1.35rem)',
              lineHeight: 1.65,
              color: '#334155',
              margin: '0 0 42px',
              fontWeight: 500,
            }}>
              Tuyển dụng dễ hơn, nhanh hơn, chính xác hơn với công nghệ AI đột phá của NextPlease Talent One.
            </p>

            <Link
              to="/business/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '1.15rem',
                fontWeight: 800,
                textDecoration: 'none',
                padding: '18px 42px',
                borderRadius: 999,
                boxShadow: '0 12px 30px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(37, 99, 235, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.4)';
              }}
            >
              <span>Bắt đầu trải nghiệm</span>
              <ArrowRight size={22} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Right Graphic: Enlarged UI Mockups Pushed Right */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            userSelect: 'none',
            pointerEvents: 'none',
            width: '100%',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 360px) minmax(300px, 370px)',
              gap: 22,
              transform: 'rotate(-1.5deg) scale(1.06)',
              transformOrigin: 'right center',
            }}>
              {/* Card 1: Trợ lý AI */}
              <div style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: '26px 24px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Sparkles size={19} />
                    </div>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>Trợ lý AI</strong>
                  </div>
                  <FileText size={18} color="#64748b" />
                </div>

                <div style={{
                  background: '#8b5cf6',
                  color: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: '18px 18px 4px 18px',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 6px 18px rgba(139, 92, 246, 0.35)',
                }}>
                  Tôi muốn tìm Personal Assistant, làm việc full time tại Đà Nẵng.
                </div>

                <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f172a' }}>Sau đây là kết quả dựa trên các tiêu chí tìm kiếm của bạn:</p>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>Personal Assistant</li>
                    <li>Full time</li>
                    <li>Mong muốn làm việc tại Thành phố Đà Nẵng</li>
                  </ul>
                </div>

                <div style={{
                  marginTop: 6,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bạn cần trợ giúp tìm kiếm gì?</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Paperclip size={16} color="#64748b" />
                    <AtSign size={16} color="#64748b" />
                    <div style={{ width: 28, height: 28, borderRadius: 10, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ArrowUp size={15} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Tạo thông tin tuyển dụng NextPlease AI */}
              <div style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: '26px 24px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}>
                <div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>Tạo thông tin tuyển dụng</span>
                  <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>NextPlease AI</strong>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  Personal Assistant
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.55 }}>
                  Tuyển dụng Personal Assistant, tốt nghiệp ngành Human Resources, Business Administration... 1 năm kinh nghiệm trong lĩnh vực.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '8px 12px', borderRadius: 10, fontWeight: 600 }}>
                    <span>🖼️</span> <span>Thêm hình ảnh/video</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '8px 12px', borderRadius: 10, fontWeight: 600 }}>
                    <span>📎</span> <span>Tạo nội dung từ tệp tin đính kèm</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Đánh giá độ phù hợp 90% */}
              <div style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: '24px 24px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Đánh giá độ phù hợp</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <strong style={{ fontSize: '2.8rem', fontWeight: 900, color: '#7c3aed', lineHeight: 1 }}>90%</strong>
                  <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>hợp với công việc</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#475569', marginTop: 8, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <span>💼 Kỹ năng:</span>
                  <strong style={{ color: '#0f172a', fontWeight: 800 }}>90%</strong>
                </div>
              </div>

              {/* Card 4: Đánh giá tổng thể ứng viên */}
              <div style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: '24px 24px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Đánh giá tổng thể ứng viên</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#10b981', fontWeight: 900, fontSize: '1rem' }}>+</span>
                    <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, flex: 1, overflow: 'hidden' }}>
                      <div style={{ width: '85%', height: '100%', background: '#3b82f6', borderRadius: 5 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#10b981', fontWeight: 900, fontSize: '1rem' }}>+</span>
                    <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, flex: 1, overflow: 'hidden' }}>
                      <div style={{ width: '70%', height: '100%', background: '#8b5cf6', borderRadius: 5 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: LIÊN HỆ & TƯ VẤN (LEAD GENERATION FORM) ── */}
      <section id="lien-he" style={{
        padding: '95px 0',
        background: '#f8fafc',
        borderTop: `1px solid ${BORDER_COLOR}`,
      }}>
        <div style={{ ...INNER, display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 56, alignItems: 'center' }}>
          {/* Left Values List */}
          <div>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.035em',
              margin: '0 0 20px',
              lineHeight: 1.2,
            }}>
              Bắt đầu tuyển dụng nhân tài cùng <span style={GRADIENT_BRAND}>NextPlease</span> ngay hôm nay
            </h2>
            <p style={{ fontSize: '1.1rem', color: NAV_MUTED, lineHeight: 1.68, margin: '0 0 36px' }}>
              Điền thông tin doanh nghiệp, đội ngũ chuyên viên của NextPlease sẽ liên hệ tư vấn giải pháp tuyển dụng tối ưu nhất trong vòng 24 giờ.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color="#15803d" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#334155' }}>
                  Thiết lập tài khoản doanh nghiệp trong 2 phút
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color="#15803d" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#334155' }}>
                  Miễn phí đăng tin việc làm đầu tiên &amp; trải nghiệm AI
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color="#15803d" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#334155' }}>
                  Chuyên viên hỗ trợ 1-1 đồng hành xuyên suốt chiến dịch
                </span>
              </div>
            </div>
          </div>

          {/* Right Lead Capture Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: '40px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
          }}>
            <h3 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
              Đăng ký nhận <span style={GRADIENT_BRAND}>tư vấn tuyển dụng</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: NAV_MUTED, margin: '0 0 24px' }}>
              Vui lòng điền thông tin để chúng tôi hỗ trợ bạn nhanh nhất.
            </p>

            {formSubmitted ? (
              <div style={{
                background: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: 16,
                padding: '32px',
                textAlign: 'center',
                color: '#15803d',
              }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 12px', display: 'block' }} />
                <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: 6 }}>
                  Gửi yêu cầu thành công!
                </strong>
                <p style={{ fontSize: '0.92rem', margin: 0 }}>
                  Chuyên viên giải pháp NextPlease sẽ liên hệ với bạn trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Họ và tên người liên hệ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Email công việc *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="hr@company.com"
                      value={formData.workEmail}
                      onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.92rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.92rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Tên công ty / Doanh nghiệp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Quy mô tuyển dụng dự kiến:
                  </label>
                  <select
                    value={formData.hiringScale}
                    onChange={(e) => setFormData({ ...formData, hiringScale: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="under-10">Dưới 10 nhân sự</option>
                    <option value="10-50">10 - 50 nhân sự</option>
                    <option value="50-100">50 - 100 nhân sự</option>
                    <option value="over-100">Trên 100 nhân sự</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: 8,
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    background: NAV_INDIGO,
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 8px 24px rgba(48, 79, 254, 0.35)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1e40af'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = NAV_INDIGO; }}
                >
                  <Send size={18} />
                  <span>Gửi yêu cầu tư vấn</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER (Exact Navigos Talent One Footer) ── */}
      <footer style={{
        background: '#ffffff',
        color: '#475569',
        padding: '70px 0 40px',
        borderTop: `1px solid ${BORDER_COLOR}`,
      }}>
        <div style={{ ...INNER }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1.2fr 1fr',
            gap: 48,
            marginBottom: 48,
          }}>
            {/* Column 1: Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                <span style={{ fontSize: '1.42rem', fontWeight: 900, fontStyle: 'normal', letterSpacing: '-0.025em', color: '#1e3a8a', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>NEXTPLEASE</span>
                <span style={{ fontSize: '1.42rem', fontWeight: 900, fontStyle: 'normal', letterSpacing: '-0.025em', color: '#2563eb', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>TALENT ONE</span>
              </div>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#64748b', margin: 0, maxWidth: '22rem' }}>
                Hệ sinh thái tuyển dụng nhân tài sinh viên &amp; ứng viên mọi cấp bậc với công nghệ trí tuệ nhân tạo và Reputation Score.
              </p>
            </div>

            {/* Column 2: Contact Info */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Liên hệ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155' }}>
                  <Phone size={18} color="#2563eb" />
                  <span>Hồ Chí Minh: 028 3925 5000 - 028 73025273</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155' }}>
                  <Phone size={18} color="#2563eb" />
                  <span>Hà Nội: 024 39743033</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155' }}>
                  <Mail size={18} color="#2563eb" />
                  <span>Email: talent-support@nextplease.vn</span>
                </div>
              </div>
            </div>

            {/* Column 3: About Company */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Về công ty</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.92rem' }}>
                <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>NextPlease Group</Link>
                <Link to="/jobs" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>NextPlease - Tìm việc</Link>
                <Link to="/thao-luan" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Cộng đồng Thảo luận sinh viên</Link>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: `1px solid ${BORDER_COLOR}`,
            paddingTop: 24,
            fontSize: '0.85rem',
            color: '#94a3b8',
            textAlign: 'left',
          }}>
            ©2026 NextPlease Talent One. All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
