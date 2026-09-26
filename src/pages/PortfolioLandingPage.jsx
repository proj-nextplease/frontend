import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, BriefcaseBusiness, ChevronDown,
  CircleCheck, CircleX, Star, Zap, FileText
} from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { EnvelopeArt } from '../components/EnvelopeArt.jsx';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';

/* ── Hệ màu chuẩn của NextPlease (theo DESIGN.md) ── */
const INK = '#0b0f0e';
const EMERALD = '#10b981';
const EMERALD_HOVER = '#34d399';
const EMERALD_DARK = '#059669';
const TEAL = '#0d9488';
const ON_DARK = '#ffffff';
const MUTED = 'rgba(233, 247, 242, 0.64)';
const LINE = 'rgba(255, 255, 255, 0.1)';
const LINE_STRONG = 'rgba(255, 255, 255, 0.2)';

// Màu trên nền sáng (khi cuộn chuột xuống)
const INK_LIGHT = '#0f2e2b';
const TEXT_MUTED_LIGHT = '#475569';
const LINE_LIGHT = '#e2efe9';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

/* 3 Bước phát triển tự nhiên của hồ sơ — Định dạng bản in theo DESIGN.md */
const EDITORIAL_STEPS = [
  {
    no: '01',
    label: 'Khởi tạo định danh',
    title: 'Dựng hồ sơ & chọn linh vật đại diện',
    body: 'Chọn linh vật đồng hành, điền chuyên môn và trường học. Trong vòng 3 phút, bạn sở hữu ngay một đường dẫn riêng mang tên mình (nextplease.vn/p/ten-ban) để gắn vào Bio mạng xã hội hoặc chia sẻ với nhà tuyển dụng.',
  },
  {
    no: '02',
    label: 'Nhận việc thực tế',
    title: 'Chinh phục Quest & Dự án đối tác',
    body: 'Không cần kinh nghiệm đi làm từ trước. Bạn nhận các nhiệm vụ, sự kiện từ CLB sinh viên hoặc dự án thực tập ngắn hạn từ doanh nghiệp đối tác trực tiếp trên nền tảng với một cú bấm.',
  },
  {
    no: '03',
    label: 'Tổ chức bảo chứng',
    title: 'Tổ chức duyệt minh chứng & lên cấp',
    body: 'Sau khi hoàn thành, ban tổ chức hoặc người giao việc duyệt xác thực minh chứng (Verified Proof of Work). Điểm uy tín (RS), EXP và cấp bậc trong hồ sơ của bạn tăng lên theo năng lực có thật.',
  },
];

/* Bảng so sánh trực diện */
const COMPARISON = [
  ['Nguồn gốc minh chứng', 'Tự soạn trong file Word/PDF, người đọc tự tin hoặc không', 'Do chính CLB hoặc doanh nghiệp bạn làm cùng đóng dấu xác nhận'],
  ['Khi có thành tích mới', 'Phải mở file sửa lại, xuất PDF mới, gửi lại từng nơi từ đầu', 'Hồ sơ sống tự động cập nhật ngay trên đường link cá nhân'],
  ['Kiểm chứng năng lực', 'Nhà tuyển dụng phải gọi điện xác minh từng dòng tự khai', 'Mở 1 link, bấm vào là xem được văn bản minh chứng & mã số xác thực'],
  ['Hệ thống tích lũy', 'Một mớ gạch đầu dòng vô hồn, không đo lường được thâm niên', 'Hệ thống điểm uy tín (RS), EXP và Cấp độ RPG rõ ràng'],
  ['Dấu ấn nhận diện', 'Trang văn bản đen trắng hoặc mẫu Canva đại trà giống mọi người', 'Linh vật tương tác theo ánh mắt, ảnh bìa tùy biến và đường dẫn riêng'],
];

const FAQS = [
  {
    q: 'NextPlease Portfolio khác gì so với một bản CV thông thường?',
    a: 'CV là văn bản tĩnh do bạn tự soạn, người đọc chỉ có thể tin hoặc nghi ngờ. NextPlease Portfolio là hồ sơ sống kỹ thuật số: mỗi kinh nghiệm và dự án bạn hoàn thành đều có thể được ban tổ chức hoặc doanh nghiệp xác nhận (Verified Proof of Work), kèm điểm uy tín (RS) và cấp bậc (EXP). Khi cần gửi tệp đính kèm qua email tuyển dụng, bạn vẫn có thể xuất bản PDF tiêu chuẩn bất kỳ lúc nào.',
  },
  {
    q: 'Tôi chưa có kinh nghiệm đi làm thì dựng Portfolio để làm gì?',
    a: 'Đó chính là lý do bạn nên bắt đầu sớm. Bạn dựng hồ sơ trước với kỹ năng và hoạt động trường học, sau đó nhận các Quest nhỏ từ CLB hay doanh nghiệp ngay trên nền tảng. Mỗi việc hoàn thành sẽ trở thành một minh chứng đã xác thực. Sau vài tháng, bạn đã có một hồ sơ phong phú thay vì một trang giấy trắng.',
  },
  {
    q: 'Việc tạo và duy trì Portfolio có tốn phí không?',
    a: 'Hoàn toàn miễn phí trọn đời. Dựng hồ sơ, chọn linh vật, nhận đường dẫn riêng, tích lũy minh chứng và ứng tuyển vào các cơ hội đều không mất phí.',
  },
  {
    q: 'Verified Proof of Work là gì và ai là người xác thực?',
    a: 'Là dấu chứng nhận điện tử do chính đơn vị tổ chức bạn làm việc cùng (CLB trường, ban tổ chức sự kiện, doanh nghiệp đối tác) cấp sau khi bạn hoàn thành công việc. Minh chứng này được lưu vĩnh viễn vào hồ sơ và ai xem cũng có thể kiểm chứng đối chiếu.',
  },
  {
    q: 'Tôi có thể đổi đường dẫn cá nhân (custom URL) của mình không?',
    a: 'Có. Khi tạo hồ sơ, hệ thống sẽ gợi ý đường link từ tên bạn (ví dụ: nextplease.vn/p/tai-phat). Bạn có thể đổi sang bất kỳ tên nào khác trong trang quản lý hồ sơ, miễn là chưa có người khác đăng ký trước.',
  },
  {
    q: 'Ai có thể xem được hồ sơ Portfolio của tôi?',
    a: 'Mặc định chỉ những người có đường link trực tiếp hoặc các nhà tuyển dụng khi bạn ứng tuyển vào tin của họ mới xem được. Bạn cũng có thể bật chế độ Riêng tư bất cứ lúc nào trong bảng điều khiển cá nhân.',
  },
];

function FaqItem({ item, open, onToggle, isLight }) {
  return (
    <div className="pf-faq-item" style={{ borderBottom: `1px solid ${isLight ? LINE_LIGHT : LINE}` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="pf-faq-btn"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit', fontSize: '1.05rem', fontWeight: 600,
          letterSpacing: '-0.015em', color: isLight ? INK_LIGHT : ON_DARK,
          transition: 'color 0.25s ease',
        }}
      >
        <span>{item.q}</span>
        <ChevronDown
          size={18}
          style={{
            flex: 'none', color: isLight ? EMERALD_DARK : EMERALD,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </button>
      {open && (
        <p className="pf-faq-answer" style={{
          margin: '0 0 20px', color: isLight ? TEXT_MUTED_LIGHT : MUTED, fontSize: '0.98rem', lineHeight: 1.65,
          letterSpacing: '-0.015em', maxWidth: '78ch',
        }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

export function PortfolioLandingPage() {
  const { openLoginModal } = useAuthModal();
  const [openFaq, setOpenFaq] = useState(0);
  const [testHandle, setTestHandle] = useState('nguyen-minh-anh');
  
  /* Hiệu ứng chuyển nền sang trắng khi cuộn chuột */
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Khi cuộn qua ~380px, đổi nền sang trắng
      if (window.scrollY > 380) {
        setIsLight(true);
      } else {
        setIsLight(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function guard(e) {
    if (!getStoredToken()) {
      e.preventDefault();
      openLoginModal('candidate');
    }
  }

  return (
    <div className={`pf-landing ${isLight ? 'is-light' : ''}`}>
      {/* SiteHeader ghim overlay theo chuẩn DESIGN.md */}
      <SiteHeader overlay />

      <style>{`
        /* ── ROOT CONTAINER: Nền tối ở đỉnh, chuyển trắng mượt mà khi cuộn ── */
        .pf-landing {
          background-color: ${INK};
          color: ${ON_DARK};
          position: relative;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-top: -34px;
          overflow-x: clip;
          font-family: 'Be Vietnam Pro', 'Inter', sans-serif;
          transition: background-color 700ms cubic-bezier(0.16, 1, 0.3, 1), color 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pf-landing.is-light {
          background-color: #ffffff;
          color: ${INK_LIGHT};
        }

        /* ── Typography & Layout Tokens ── */
        .pf-h1 {
          font-family: 'Archivo', 'Be Vietnam Pro', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-weight: 800;
          text-transform: uppercase;
          line-height: 0.94;
          letter-spacing: -0.025em;
          font-size: clamp(2.4rem, 5.4vw, 4.4rem);
          color: ${ON_DARK};
          margin: 18px 0 22px;
        }

        .pf-section-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          margin: 0;
          font-size: clamp(1.6rem, 3vw, 2.15rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: ${ON_DARK};
          transition: color 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pf-landing.is-light .pf-section-title {
          color: ${INK_LIGHT};
        }

        .pf-lead {
          margin: 14px 0 0;
          color: ${MUTED};
          font-size: 1.08rem;
          line-height: 1.55;
          letter-spacing: -0.015em;
          transition: color 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pf-landing.is-light .pf-lead {
          color: ${TEXT_MUTED_LIGHT};
        }

        /* ── Nút theo quy chuẩn hệ thống ── */
        .pf-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 15px 24px; border-radius: 12px;
          font-family: inherit; font-size: 1rem; font-weight: 600; line-height: 1;
          text-decoration: none; border: 1px solid transparent; cursor: pointer;
          transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
        }
        .pf-btn.primary {
          background: ${EMERALD}; color: ${INK}; font-weight: 700;
        }
        .pf-btn.primary:hover {
          background: ${EMERALD_HOVER}; transform: translateY(-2px);
        }
        .pf-btn.ghost {
          background: transparent; color: ${ON_DARK}; border-color: ${LINE_STRONG};
        }
        .pf-btn.ghost:hover {
          background: rgba(255, 255, 255, 0.08); border-color: ${EMERALD};
        }
        .pf-landing.is-light .pf-btn.ghost {
          color: ${INK_LIGHT}; border-color: #cbd5e1;
        }
        .pf-landing.is-light .pf-btn.ghost:hover {
          background: #f1f5f9; border-color: ${EMERALD_DARK};
        }

        /* ── Hero Layout (Phóng to kích thước của EnvelopeArt) ── */
        .pf-hero-wrap {
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1fr 1.25fr;
          gap: clamp(24px, 4vw, 56px); align-items: center;
          padding: clamp(124px, 11vw, 168px) 0 clamp(64px, 8vw, 112px);
        }

        .pf-hero-art-box {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .pf-hero-art-box .np-upzi-envelope-wrap {
          width: 100% !important;
          max-width: 780px !important;
          margin: 0 auto !important;
        }

        /* ── Eyebrow Tag ── */
        .pf-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.94rem; font-weight: 600; letter-spacing: -0.01em; color: ${ON_DARK};
        }
        .pf-eyebrow i {
          width: 8px; height: 8px; border-radius: 9999px; background: ${EMERALD}; flex: none;
        }

        /* ── Danh sách Ba Bước kiểu bản in ── */
        .pf-steps-list {
          border-top: 1px solid ${LINE};
          transition: border-color 600ms ease;
        }
        .pf-landing.is-light .pf-steps-list {
          border-top-color: ${LINE_LIGHT};
        }

        .pf-step-row {
          display: grid; grid-template-columns: 100px minmax(0, 310px) minmax(0, 1fr);
          gap: clamp(16px, 3vw, 40px); align-items: start;
          padding: clamp(28px, 3.4vw, 44px) 4px;
          border-bottom: 1px solid ${LINE};
          transition: background-color .2s ease, border-color 600ms ease;
        }
        .pf-landing.is-light .pf-step-row {
          border-bottom-color: ${LINE_LIGHT};
        }
        .pf-step-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .pf-landing.is-light .pf-step-row:hover {
          background-color: #f8fafc;
        }

        .pf-step-num {
          font-family: 'Archivo', sans-serif; font-variation-settings: 'wdth' 84;
          font-size: clamp(2.6rem, 4.4vw, 3.6rem); font-weight: 800; line-height: 0.9;
          letter-spacing: -0.04em; color: rgba(255, 255, 255, 0.16);
          transition: color .2s ease;
        }
        .pf-landing.is-light .pf-step-num {
          color: rgba(15, 46, 43, 0.12);
        }
        .pf-step-row:hover .pf-step-num { color: ${EMERALD}; }
        .pf-landing.is-light .pf-step-row:hover .pf-step-num { color: ${EMERALD_DARK}; }

        .pf-step-row h3 {
          font-family: inherit; margin: 0 0 6px;
          font-size: clamp(1.2rem, 1.8vw, 1.45rem); font-weight: 700;
          line-height: 1.2; letter-spacing: -0.02em; color: ${ON_DARK};
          transition: color 600ms ease;
        }
        .pf-landing.is-light .pf-step-row h3 {
          color: ${INK_LIGHT};
        }

        .pf-step-tag {
          display: inline-block; font-size: 0.74rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.04em; color: ${EMERALD}; margin-bottom: 4px;
        }
        .pf-landing.is-light .pf-step-tag {
          color: ${EMERALD_DARK};
        }

        .pf-step-row p {
          margin: 0; color: ${MUTED}; font-size: 0.98rem; line-height: 1.6;
          letter-spacing: -0.015em; max-width: 48ch;
          transition: color 600ms ease;
        }
        .pf-landing.is-light .pf-step-row p {
          color: ${TEXT_MUTED_LIGHT};
        }

        /* ── Bảng So Sánh ── */
        .pf-cmp-table {
          display: grid; grid-template-columns: 1.15fr 1fr 1fr; align-items: stretch;
          border: 1px solid ${LINE}; border-radius: 20px; overflow: hidden; background: transparent;
          transition: border-color 600ms ease, background 600ms ease, box-shadow 600ms ease;
        }
        .pf-landing.is-light .pf-cmp-table {
          border-color: ${LINE_LIGHT};
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 46, 43, 0.04);
        }
        .pf-cmp-table > * {
          padding: clamp(16px, 1.8vw, 22px) clamp(18px, 2vw, 26px);
          border-bottom: 1px solid ${LINE}; font-size: 0.94rem; line-height: 1.5;
          letter-spacing: -0.015em;
          transition: border-color 600ms ease, color 600ms ease, background 600ms ease;
        }
        .pf-landing.is-light .pf-cmp-table > * {
          border-bottom-color: ${LINE_LIGHT};
          color: #1e293b;
        }
        .pf-cmp-table > *:nth-child(3n) {
          background: rgba(16, 185, 129, 0.06);
        }
        .pf-landing.is-light .pf-cmp-table > *:nth-child(3n) {
          background: rgba(16, 185, 129, 0.08);
        }
        .pf-cmp-head {
          font-weight: 600; font-size: 0.88rem !important; letter-spacing: 0.01em;
        }
        .pf-landing.is-light .pf-cmp-head {
          color: ${TEXT_MUTED_LIGHT} !important;
        }
        .pf-landing.is-light .pf-cmp-label {
          color: ${INK_LIGHT} !important;
        }
        .pf-cmp-table > *:nth-last-child(-n+3) { border-bottom: 0; }

        @media (max-width: 960px) {
          .pf-hero-wrap { grid-template-columns: 1fr; }
          .pf-step-row { grid-template-columns: 56px 1fr; gap: 12px 16px; }
          .pf-step-row p { grid-column: 2; }
          .pf-cmp-table { grid-template-columns: 1fr 1fr; }
          .pf-cmp-table .pf-cmp-label {
            grid-column: 1 / -1; background: rgba(255, 255, 255, 0.04);
            font-size: 0.82rem !important; font-weight: 600 !important;
            padding-top: 10px; padding-bottom: 10px;
          }
          .pf-landing.is-light .pf-cmp-table .pf-cmp-label {
            background: #f1f5f9;
          }
          .pf-cmp-table .pf-cmp-head.pf-cmp-label { display: none; }
        }
      `}</style>

      {/* ═════════════════════════════════════════════════════════════
          1. HERO — XÁC THỰC BẰNG MINH CHỨNG, MINH HỌA ENVELOPEART NỔI BẬT
          ═════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '0 0 auto', height: 1000, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
          <HeroMesh veil="radial-gradient(100% 92% at 40% 24%, rgba(11,15,14,0) 0%, #0b0f0e 100%)" />
        </div>

        <div style={{ ...INNER, position: 'relative', zIndex: 1 }}>
          <div className="pf-hero-wrap">
            {/* Cột trái: Tuyên ngôn sản phẩm & Hành động */}
            <div>
              <span className="pf-eyebrow"><i /> Miễn phí toàn bộ cho sinh viên</span>

              <h1 className="pf-h1">
                Đây là hồ sơ của bạn sau ba tháng
              </h1>

              <p style={{ margin: 0, maxWidth: '50ch', fontSize: '1.125rem', lineHeight: 1.55, letterSpacing: '-0.015em', color: MUTED }}>
                Không phải một bản CV tự khai. Là một trang sống, có minh chứng do chính tổ chức xác nhận,
                điểm uy tín tích lũy thật, và một đường dẫn định danh mang tên bạn.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 36, alignItems: 'center' }}>
                <Link to="/portfolio" onClick={guard} className="pf-btn primary">
                  Dựng hồ sơ của tôi <ArrowRight size={17} />
                </Link>
                <Link to="/jobs" className="pf-btn ghost">
                  <BriefcaseBusiness size={16} /> Xem cơ hội đang mở
                </Link>
              </div>

              {/* 3 Mốc số liệu thực tế */}
              <div style={{
                display: 'flex', gap: 28, marginTop: 44, paddingTop: 28,
                borderTop: `1px solid ${LINE}`, flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: ON_DARK, fontFamily: 'Archivo, sans-serif' }}>100%</div>
                  <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 2 }}>Minh chứng đối chứng được</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: ON_DARK, fontFamily: 'Archivo, sans-serif' }}>1 Link</div>
                  <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 2 }}>Dùng nộp mọi vị trí</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: EMERALD, fontFamily: 'Archivo, sans-serif' }}>0 Đồng</div>
                  <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 2 }}>Trọn đời cho sinh viên</div>
                </div>
              </div>
            </div>

            {/* Cột phải: EnvelopeArt Minh Họa Bự & Độc Bản */}
            <div className="pf-hero-art-box">
              <EnvelopeArt />
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          2. BA BƯỚC — ĐỊNH DẠNG BẢN IN THEO CHUẨN DESIGN.MD
          ═════════════════════════════════════════════════════════════ */}
      <section style={{ ...INNER, padding: 'clamp(72px, 11vw, 140px) 0' }}>
        <div style={{ maxWidth: '58ch', margin: '0 0 clamp(32px, 4vw, 52px)' }}>
          <h2 className="pf-section-title">
            Bạn không phải tự nghĩ ra thành tích
          </h2>
          <p className="pf-lead">
            Hồ sơ lớn lên theo việc bạn thật sự làm. Bắt đầu từ con số không cũng được.
          </p>
        </div>

        <div className="pf-steps-list">
          {EDITORIAL_STEPS.map((step) => (
            <div key={step.no} className="pf-step-row">
              <span className="pf-step-num" aria-hidden="true">{step.no}</span>
              <div>
                <span className="pf-step-tag">{step.label}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          3. SO SÁNH TRỰC DIỆN — PHẦN THUYẾT PHỤC CHÍNH
          ═════════════════════════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${isLight ? LINE_LIGHT : LINE}`, transition: 'border-color 600ms ease' }}>
        <div style={{ ...INNER, padding: 'clamp(72px, 11vw, 140px) 0' }}>
          <div style={{ maxWidth: '54ch', margin: '0 0 clamp(28px, 4vw, 44px)' }}>
            <h2 className="pf-section-title">
              Cùng một con người, hai cách kể
            </h2>
            <p className="pf-lead">
              CV tự khai khiến nhà tuyển dụng phải đoán định; Portfolio có minh chứng giúp bạn được tin cậy ngay.
            </p>
          </div>

          <div className="pf-cmp-table">
            <div className="pf-cmp-head pf-cmp-label" style={{ color: isLight ? TEXT_MUTED_LIGHT : MUTED }}>Tiêu chí</div>
            <div className="pf-cmp-head" style={{ color: isLight ? TEXT_MUTED_LIGHT : MUTED }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><FileText size={16} /> CV tự khai thông thường</span>
            </div>
            <div className="pf-cmp-head" style={{ color: isLight ? EMERALD_DARK : TEAL, fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><ShieldCheck size={16} /> NextPlease Portfolio</span>
            </div>

            {COMPARISON.map(([label, cv, pf]) => (
              <FragmentCmp key={label} label={label} cv={cv} pf={pf} isLight={isLight} />
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          4. THỬ NGHIỆM ĐƯỜNG DẪN ĐỊNH DANH (CUSTOM URL WIDGET)
          ═════════════════════════════════════════════════════════════ */}
      <section style={{
        borderTop: `1px solid ${isLight ? LINE_LIGHT : LINE}`,
        borderBottom: `1px solid ${isLight ? LINE_LIGHT : LINE}`,
        transition: 'border-color 600ms ease'
      }}>
        <div style={{ ...INNER, padding: 'clamp(68px, 10vw, 120px) 0' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center'
          }}>
            <div>
              <span className="pf-step-tag">Định danh cá nhân</span>
              <h2 className="pf-section-title" style={{ margin: '6px 0 14px' }}>
                Giữ tên đường dẫn của bạn trước
              </h2>
              <p className="pf-lead" style={{ margin: 0, maxWidth: '48ch' }}>
                Mỗi ứng viên có một đường dẫn duy nhất để gửi cho nhà tuyển dụng hoặc gắn vào Bio.
                Đổi lại bất cứ lúc nào trong Khu vực của tôi — hoàn toàn miễn phí.
              </p>

              {/* Khung gõ thử URL */}
              <div style={{ marginTop: 28, maxWidth: 440 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '6px 6px 6px 14px',
                  borderRadius: 12,
                  background: isLight ? '#ffffff' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isLight ? '#cbd5e1' : LINE_STRONG}`,
                  boxShadow: isLight ? '0 4px 14px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 600ms ease',
                }}>
                  <span style={{ fontSize: '0.9rem', color: isLight ? TEXT_MUTED_LIGHT : MUTED, userSelect: 'none', fontWeight: 500 }}>
                    nextplease.vn/p/
                  </span>
                  <input
                    type="text"
                    value={testHandle}
                    onChange={(e) => setTestHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    placeholder="ten-ban"
                    style={{
                      flex: 1, minWidth: 0, background: 'none', border: 'none',
                      color: isLight ? EMERALD_DARK : EMERALD, fontSize: '0.94rem', fontWeight: 700, outline: 'none', padding: '6px 8px'
                    }}
                  />
                  <Link
                    to="/portfolio"
                    onClick={guard}
                    className="pf-btn primary"
                    style={{ padding: '10px 18px', fontSize: '0.88rem', flex: 'none', borderRadius: 8 }}
                  >
                    Dựng ngay
                  </Link>
                </div>
                <div style={{ fontSize: '0.78rem', color: isLight ? TEXT_MUTED_LIGHT : MUTED, marginTop: 8 }}>
                  Đường dẫn xem trước: <strong style={{ color: isLight ? EMERALD_DARK : EMERALD }}>nextplease.vn/p/{testHandle || 'ten-ban'}</strong>
                </div>
              </div>
            </div>

            {/* Ba giá trị cốt lõi tích lũy */}
            <div style={{
              display: 'grid', gap: 16, padding: '28px 30px',
              borderRadius: 20,
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
              border: `1.5px solid ${isLight ? LINE_LIGHT : LINE}`,
              boxShadow: isLight ? '0 10px 30px rgba(15, 46, 43, 0.04)' : 'none',
              transition: 'all 600ms ease',
            }}>
              {[
                [<Star key="1" size={18} />, 'Trust Score (RS)', 'Điểm uy tín tối đa 100, tăng theo việc thật và giảm nếu vi phạm cam kết.'],
                [<Zap key="2" size={18} />, 'EXP & Cấp độ', 'Vĩnh viễn không giảm, đại diện cho thâm niên và số lượng dự án đã chạy.'],
                [<ShieldCheck key="3" size={18} />, 'Verified Proof of Work', 'Tổ chức cấp dấu xác nhận sau khi bạn hoàn thành nhiệm vụ.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ color: isLight ? EMERALD_DARK : EMERALD, marginTop: 2, flex: 'none' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: isLight ? INK_LIGHT : ON_DARK }}>{title}</div>
                    <div style={{ fontSize: '0.9rem', color: isLight ? TEXT_MUTED_LIGHT : MUTED, lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          5. CTA LẶP LẠI — TRƯỚC PHẦN FAQ
          ═════════════════════════════════════════════════════════════ */}
      <section>
        <div style={{ ...INNER, padding: 'clamp(64px, 9vw, 112px) 0', textAlign: 'center' }}>
          <h2 className="pf-section-title" style={{ maxWidth: '24ch', marginInline: 'auto' }}>
            Ba tháng nữa bạn muốn hồ sơ mình trông thế nào?
          </h2>
          <p className="pf-lead" style={{ margin: '18px auto 0', maxWidth: '52ch' }}>
            Dựng hồ sơ mất chưa đầy 3 phút và hoàn toàn miễn phí. Phần còn lại để những việc
            bạn thật sự làm tự nói hộ.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 32 }}>
            <Link to="/portfolio" onClick={guard} className="pf-btn primary">
              Dựng hồ sơ của tôi <ArrowRight size={17} />
            </Link>
            <Link to="/jobs" className="pf-btn ghost">
              <BriefcaseBusiness size={16} /> Xem cơ hội đang mở
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          6. CÂU HỎI THƯỜNG GẶP (FAQ)
          ═════════════════════════════════════════════════════════════ */}
      <section style={{
        borderTop: `1px solid ${isLight ? LINE_LIGHT : LINE}`,
        padding: 'clamp(68px, 10vw, 124px) 0',
        transition: 'border-color 600ms ease'
      }}>
        <div style={INNER}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 'clamp(24px, 4vw, 56px)', alignItems: 'start' }}>
            <div>
              <h2 className="pf-section-title">
                Câu hỏi thường gặp
              </h2>
              <p className="pf-lead">
                Chưa rõ chỗ nào? Đây là những thắc mắc hay gặp nhất về Portfolio.
              </p>
            </div>
            <div>
              {FAQS.map((item, i) => (
                <FaqItem
                  key={item.q}
                  item={item}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                  isLight={isLight}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SiteFooter chuẩn của toàn hệ thống */}
      <SiteFooter />
    </div>
  );
}

/** Một hàng so sánh của bảng */
function FragmentCmp({ label, cv, pf, isLight }) {
  return (
    <>
      <div className="pf-cmp-label" style={{ fontWeight: 600, color: isLight ? INK_LIGHT : ON_DARK }}>{label}</div>
      <div data-label={label} style={{ color: isLight ? TEXT_MUTED_LIGHT : MUTED }}>
        <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8 }}>
          <CircleX size={16} style={{ color: isLight ? '#94a3b8' : 'rgba(255,255,255,0.35)', flex: 'none', marginTop: 2 }} />
          <span>{cv}</span>
        </span>
      </div>
      <div data-label={label} style={{ color: isLight ? INK_LIGHT : ON_DARK, fontWeight: 500 }}>
        <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8 }}>
          <CircleCheck size={16} style={{ color: isLight ? EMERALD_DARK : EMERALD, flex: 'none', marginTop: 2 }} />
          <span>{pf}</span>
        </span>
      </div>
    </>
  );
}
