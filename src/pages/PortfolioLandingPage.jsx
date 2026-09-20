import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Sparkles, BriefcaseBusiness, ChevronDown,
  CircleCheck, CircleX, Link2, Flame, Star, Zap, UserRound, FileText,
} from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';

/* ── Emerald palette (khớp với các trang landing còn lại) ── */
/* ── Hệ màu nền tối, dùng chung toàn site (xem DESIGN.md) ── */
const EMERALD = '#10b981';
const TEAL = '#0d9488';
const INK = '#0b0f0e';
const SURFACE = '#121817';
const ON_DARK = '#ffffff';
const MUTED = 'rgba(233,247,242,0.62)';
const LINE = 'rgba(255,255,255,0.1)';
const LINE_STRONG = 'rgba(255,255,255,0.2)';
const MINT = 'rgba(16,185,129,0.16)';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

/* Ba bước đúng theo cách hồ sơ thật sự lớn lên trên nền tảng. */
const STEPS = [
  {
    no: '01',
    icon: UserRound,
    title: 'Dựng hồ sơ',
    body: 'Chọn linh vật, điền kỹ năng và học vấn. Mất vài phút, và bạn đã có một đường dẫn mang tên mình.',
  },
  {
    no: '02',
    icon: BriefcaseBusiness,
    title: 'Nhận việc và Quest',
    body: 'Ứng tuyển một chạm vào công việc của doanh nghiệp hoặc hoạt động của CLB, ngay trên nền tảng.',
  },
  {
    no: '03',
    icon: ShieldCheck,
    title: 'Tổ chức xác nhận',
    body: 'Hoàn thành thì nơi bạn làm xác nhận. Hồ sơ có thêm một minh chứng, điểm uy tín và cấp độ đi lên.',
  },
];

/* So sánh trực diện — phần thuyết phục chính của trang. */
const COMPARISON = [
  ['Ai xác nhận những gì bạn viết', 'Không ai', 'Chính tổ chức bạn làm cùng'],
  ['Khi bạn có kinh nghiệm mới', 'Sửa file, gửi lại từ đầu', 'Link tự cập nhật'],
  ['Nhà tuyển dụng kiểm chứng', 'Phải gọi hỏi từng nơi', 'Bấm vào là thấy'],
  ['Thứ bạn tích luỹ được', 'Không có gì', 'Điểm uy tín, EXP, cấp độ'],
  ['Trông giống ai', 'Giống mọi CV khác', 'Linh vật và trang của riêng bạn'],
];

const FAQS = [
  {
    q: 'Portfolio ở nextplease khác gì CV thường?',
    a: 'CV là tệp tĩnh do bạn tự khai, người đọc chỉ có thể tin hoặc không. Portfolio ở đây là hồ sơ sống: '
     + 'mỗi kinh nghiệm đều có thể được tổ chức xác nhận, kèm điểm uy tín (RS) và cấp độ tích luỹ theo '
     + 'những việc bạn thật sự đã làm. Cần tệp để nộp qua email thì bạn vẫn xuất PDF được.',
  },
  {
    q: 'Tôi chưa có kinh nghiệm gì thì dựng portfolio để làm gì?',
    a: 'Đó chính là lúc nên bắt đầu. Bạn dựng hồ sơ trước, rồi nhận Quest và công việc nhỏ từ CLB hay '
     + 'doanh nghiệp ngay trên nền tảng — mỗi việc hoàn thành sẽ thành một minh chứng đã xác thực trong '
     + 'hồ sơ. Sau vài tháng bạn có thứ để đưa ra, thay vì một trang trắng.',
  },
  {
    q: 'Portfolio có miễn phí không?',
    a: 'Có. Dựng hồ sơ, tích minh chứng, chia sẻ link và ứng tuyển đều miễn phí. Gói trả phí chỉ mở thêm '
     + 'giao diện nâng cao cho trang công khai, không khoá dữ liệu hay khả năng ứng tuyển của bạn.',
  },
  {
    q: 'Verified Proof of Work là gì?',
    a: 'Là dấu xác nhận do chính tổ chức bạn làm việc cùng cấp, sau khi bạn hoàn thành công việc hoặc Quest. '
     + 'Nó được lưu vào hồ sơ và ai xem cũng kiểm chứng được — đây là điểm khiến hồ sơ của bạn đáng tin '
     + 'hơn một bản tự khai.',
  },
  {
    q: 'Ai xem được portfolio của tôi?',
    a: 'Chỉ những người bạn gửi link. Bạn cũng có thể chuyển hồ sơ sang chế độ riêng tư bất cứ lúc nào; '
     + 'khi đó link chia sẻ sẽ không mở được với người ngoài.',
  },
  {
    q: 'Tôi có đổi được đường dẫn của mình không?',
    a: 'Được. Hệ thống tự sinh một đường dẫn từ tên bạn ngay khi tạo hồ sơ, và bạn đổi lại bất cứ lúc nào '
     + 'trong Khu vực của tôi — miễn là chưa có người khác dùng.',
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, padding: '24px 4px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit', fontSize: '1.0625rem', fontWeight: 500, letterSpacing: '-0.015em', color: ON_DARK,
        }}
      >
        {item.q}
        <ChevronDown
          size={20}
          style={{ flex: 'none', color: EMERALD, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .22s ease' }}
        />
      </button>
      {open && (
        <p style={{ margin: '0 4px 22px', color: MUTED, fontSize: '1rem', lineHeight: 1.6, letterSpacing: '-0.015em', maxWidth: '76ch' }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

/**
 * Bản thu nhỏ của chính thứ người dùng sẽ nhận được.
 *
 * Bản cũ vẽ một "tờ giấy có mấy vạch xám" — thứ có thể là sản phẩm của bất kỳ
 * ai. Ở đây dựng đúng hình hài một portfolio thật: avatar, cấp độ, điểm uy tín,
 * một kinh nghiệm đã xác thực và đường dẫn riêng. Cho xem còn hơn mô tả.
 */
function PortfolioPreview() {
  const stat = (icon, value, label, color) => (
    <div style={{ display: 'grid', gap: 2, justifyItems: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '1.05rem', fontWeight: 900, color }}>
        {icon}{value}
      </span>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED, letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ position: 'relative' }} aria-hidden="true">
      <div style={{
        position: 'relative', width: 'min(430px, 100%)', margin: '0 auto',
        borderRadius: 20, background: SURFACE, border: `1px solid ${LINE_STRONG}`, overflow: 'hidden',
        boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
      }}>
        {/* Ảnh bìa — đúng tính năng vừa làm xong */}
        <div style={{ height: 78, background: 'linear-gradient(120deg, #34d399, #0d9488 70%)' }} />

        <div style={{ padding: '0 20px 20px', marginTop: -30 }}>
          <div style={{
            width: 62, height: 62, borderRadius: '50%', border: `3px solid ${SURFACE}`,
            background: 'linear-gradient(135deg, #10b981, #0d9488)', display: 'grid', placeItems: 'center',
            color: '#fff', fontWeight: 900, fontSize: '1.3rem',
          }}>P</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: ON_DARK }}>Nguyễn Tài Phát</span>
            <span style={{ padding: '3px 10px', borderRadius: 999, background: MINT, color: EMERALD, fontSize: '0.7rem', fontWeight: 600 }}>LV. 4</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 2 }}>Sinh viên Marketing · ĐH FPT</div>

          <div style={{
            display: 'flex', justifyContent: 'space-around', gap: 8, margin: '16px 0',
            padding: '12px 0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`,
          }}>
            {stat(<ShieldCheck size={14} />, '86', 'TRUST SCORE', EMERALD)}
            {stat(<Zap size={14} />, '1.2K', 'EXP', '#f59e0b')}
            {stat(<Flame size={14} />, '7', 'STREAK', '#fb7185')}
          </div>

          {/* Một dòng kinh nghiệm đã được xác thực */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${LINE}` }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, flex: 'none', borderRadius: 10, background: MINT, color: EMERALD }}>
              <BriefcaseBusiness size={16} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 500, color: ON_DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Trưởng ban Truyền thông
              </div>
              <div style={{ fontSize: '0.74rem', color: MUTED }}>CLB F-Code · 2025</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 999, background: MINT, color: EMERALD, fontSize: '0.66rem', fontWeight: 600, flex: 'none' }}>
              <ShieldCheck size={11} /> Đã xác thực
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: '0.76rem', fontWeight: 500, color: EMERALD }}>
            <Link2 size={13} /> nextplease.vn/p/tai-phat
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioLandingPage() {
  const { openLoginModal } = useAuthModal();
  const [openFaq, setOpenFaq] = useState(0);

  // Chưa đăng nhập thì mở form đăng nhập thay vì đẩy vào trang trống.
  function guard(e) {
    if (!getStoredToken()) {
      e.preventDefault();
      openLoginModal('candidate');
    }
  }

  return (
    // .app-main bị giới hạn 1180px; các trang landing khác thoát ra bằng cách
    // kéo rộng 100vw rồi bù lề âm, để dải màu chạy hết bề ngang màn hình.
    <div style={{
      background: INK, color: ON_DARK, position: 'relative',
      width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', overflowX: 'clip',
      fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
    }}>
      {/* Trang giới thiệu nên thanh điều hướng vẫn ghim như trang chủ — ở đây
          không có thanh công cụ nào khác tranh chỗ bám. */}
      <SiteHeader overlay />

      <style>{`
        /* Nút theo hệ: bo 8px, đệm 16/20, chữ 18px/500, đổi màu trong 150ms —
           không viên thuốc, không shadow màu, không nhấc lên khi hover. */
        .pf-cta { display:inline-flex; align-items:center; gap:6px; padding:15px 20px; border-radius:8px;
                  font-family:inherit; font-size:1rem; font-weight:500; line-height:1; text-decoration:none;
                  border:1px solid transparent; cursor:pointer;
                  transition: background-color .15s ease, border-color .15s ease, color .15s ease; }
        .pf-cta.primary, .pf-cta.solid { background:${EMERALD}; color:${INK}; }
        .pf-cta.primary:hover, .pf-cta.solid:hover { background:#34d399; }
        .pf-cta.ghost { background:transparent; color:${ON_DARK}; border-color:${LINE_STRONG}; }
        .pf-cta.ghost:hover { background:rgba(255,255,255,0.08); }

        /* index.css gán 'Baloo 2' cho h1–h4 nên mọi tiêu đề ở đây phải khai lại. */
        .pf-h1 { font-family:'Archivo','Be Vietnam Pro',sans-serif; font-variation-settings:'wdth' 84;
                 font-weight:800; text-transform:uppercase; line-height:0.92; letter-spacing:-0.022em;
                 font-size:clamp(2.3rem, 5vw, 4rem); color:${ON_DARK}; margin:22px 0 20px; }
        .pf-h2 { font-family:inherit; margin:0; font-size:clamp(1.6rem, 3vw, 2rem); font-weight:400;
                 line-height:1.1; letter-spacing:-0.025em; color:${ON_DARK}; }
        .pf-lead { margin:18px 0 0; color:${MUTED}; font-size:1.125rem; line-height:1.4; letter-spacing:-0.015em; }

        .pf-bg { position:absolute; inset:0 0 auto; height:1000px; overflow:hidden; pointer-events:none; z-index:0; }
        .pf-hero { position:relative; z-index:1; display:grid; grid-template-columns: 1.06fr 0.94fr;
                   gap:clamp(32px, 5vw, 72px); align-items:center;
                   padding: clamp(128px, 12vw, 176px) 0 clamp(64px, 9vw, 120px); }

        .pf-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:1rem; font-weight:500;
                      letter-spacing:-0.015em; color:${ON_DARK}; }
        .pf-eyebrow i { width:8px; height:8px; border-radius:9999px; background:${EMERALD}; flex:none; }

        /* ── Ba bước ──
           KHÔNG dùng lưới ba thẻ bo tròn, mỗi thẻ một icon trong ô vuông bo —
           đó là bố cục mặc định thấy ở mọi landing page, và đặt cạnh những thẻ
           bo tròn khác trên cùng trang thì cả trang thành một rổ hình chữ nhật
           giống hệt nhau. Ở đây là một danh sách kiểu bản in: số thứ tự cỡ lớn
           bằng font display làm cột mốc, các dòng ngăn nhau bằng kẻ mảnh, không
           khung bao. Chữ tự gánh, không cần icon. */
        .pf-steps { border-top: 1px solid ${LINE}; }
        .pf-step {
          display: grid; grid-template-columns: 112px minmax(0, 300px) minmax(0, 1fr);
          gap: clamp(16px, 3vw, 40px); align-items: start;
          padding: clamp(28px, 3.4vw, 44px) 4px;
          border-bottom: 1px solid ${LINE};
          transition: background-color .25s ease;
        }
        .pf-step:hover { background-color: rgba(255,255,255,0.025); }
        .pf-step-no {
          font-family: 'Archivo', inherit; font-variation-settings: 'wdth' 84;
          font-size: clamp(2.6rem, 4.6vw, 3.75rem); font-weight: 800; line-height: 0.9;
          letter-spacing: -0.04em; color: rgba(255,255,255,0.16);
          transition: color .25s ease;
        }
        .pf-step:hover .pf-step-no { color: ${EMERALD}; }
        .pf-step h3 {
          font-family: inherit; margin: 0; font-size: clamp(1.25rem, 2vw, 1.5rem); font-weight: 400;
          line-height: 1.15; letter-spacing: -0.025em; color: ${ON_DARK};
        }
        .pf-step p { margin: 0; color: ${MUTED}; font-size: 1rem; line-height: 1.55; letter-spacing: -0.015em; max-width: 46ch; }

        /* ── Bảng so sánh ── */
        .pf-cmp { display:grid; grid-template-columns: 1.15fr 1fr 1fr; align-items:stretch;
                  border:1px solid ${LINE}; border-radius:20px; overflow:hidden; background:transparent; }
        .pf-cmp > * { padding:clamp(16px, 1.8vw, 22px) clamp(18px, 2vw, 26px); border-bottom:1px solid ${LINE};
                      font-size:0.9375rem; line-height:1.5; letter-spacing:-0.015em; }
        /* Cột nextplease được tô nhẹ để mắt bám vào — đây là cột cần thắng. */
        .pf-cmp > *:nth-child(3n) { background:rgba(16,185,129,0.06); }
        .pf-cmp-head { font-weight:500; font-size:0.875rem !important; letter-spacing:0.01em; }
        .pf-cmp > *:nth-last-child(-n+3) { border-bottom:0; }

        .pf-faq { display:grid; grid-template-columns: 0.8fr 1.2fr; gap:clamp(24px, 4vw, 56px); align-items:start; }

        @media (max-width: 960px) {
          .pf-hero, .pf-faq { grid-template-columns: 1fr; }
          /* Dưới 960px số thứ tự lên một hàng riêng cùng tiêu đề, phần mô tả
             xuống dòng dưới — ba cột ở bề ngang này thì cột nào cũng hẹp. */
          .pf-step { grid-template-columns: 64px 1fr; gap: 14px 18px; }
          .pf-step p { grid-column: 2; }
          /* Bảng ba cột không đọc nổi trên màn hẹp. Giữ hai cột so sánh, còn
             nhãn tiêu chí thành một dòng chạy suốt bề ngang phía trên — đọc
             một lần cho cả hai bên thay vì lặp lại ở từng ô. */
          .pf-cmp { grid-template-columns: 1fr 1fr; }
          .pf-cmp .pf-cmp-label { grid-column: 1 / -1; background:rgba(255,255,255,0.05);
                                  font-size:0.8rem !important; font-weight:500 !important;
                                  padding-top:12px; padding-bottom:12px; }
          .pf-cmp .pf-cmp-head.pf-cmp-label { display:none; }
        }
      `}</style>

      {/* ── 1. HERO — cho xem sản phẩm, không mô tả suông ── */}
      <section style={{ position: 'relative' }}>
        <div className="pf-bg" aria-hidden="true">
          <HeroMesh veil="radial-gradient(100% 92% at 40% 24%, rgba(11,15,14,0) 0%, #0b0f0e 100%)" />
        </div>
        <div style={{ ...INNER, position: 'relative', zIndex: 1 }}>
          <div className="pf-hero">
            <div>
              <span className="pf-eyebrow"><i /> Miễn phí toàn bộ</span>

              {/* Font display in hoa chỉ dùng cho H1 của hero, và chỉ ở trang
                  giới thiệu (trang chủ, trang này). Trang công cụ như /jobs hay
                  /thao-luan không có tiêu đề kiểu này. */}
              <h1 className="pf-h1">
                Đây là hồ sơ của bạn sau ba tháng
              </h1>

              <p style={{ margin: 0, maxWidth: '50ch', fontSize: '1.125rem', lineHeight: 1.5, letterSpacing: '-0.015em', color: MUTED }}>
                Không phải một bản CV tự khai. Là một trang sống, có minh chứng do tổ chức xác nhận,
                điểm uy tín tích luỹ thật, và một đường dẫn mang tên bạn.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 38 }}>
                <Link to="/portfolio" onClick={guard} className="pf-cta primary">
                  Dựng hồ sơ của tôi <ArrowRight size={17} />
                </Link>
                <Link to="/jobs" className="pf-cta ghost">
                  <BriefcaseBusiness size={16} /> Xem cơ hội đang mở
                </Link>
              </div>
            </div>

            <PortfolioPreview />
          </div>
        </div>
      </section>

      {/* ── 2. BA BƯỚC — cách hồ sơ tự lớn lên ── */}
      <section style={{ ...INNER, padding: 'clamp(72px, 11vw, 140px) 0' }}>
        <div style={{ maxWidth: '58ch', margin: '0 0 clamp(32px, 4vw, 52px)' }}>
          <h2 className="pf-h2">
            Bạn không phải tự nghĩ ra thành tích
          </h2>
          <p className="pf-lead">
            Hồ sơ lớn lên theo việc bạn thật sự làm. Bắt đầu từ con số không cũng được.
          </p>
        </div>

        <div className="pf-steps">
          {STEPS.map((step) => (
            <div key={step.no} className="pf-step">
              <span className="pf-step-no" aria-hidden="true">{step.no}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. SO SÁNH — phần thuyết phục chính ── */}
      <section>
        <div style={{ ...INNER, padding: 'clamp(72px, 11vw, 140px) 0' }}>
          <div style={{ maxWidth: '54ch', margin: '0 0 clamp(28px, 4vw, 44px)' }}>
            <h2 className="pf-h2">
              Cùng một con người, hai cách kể
            </h2>
          </div>

          <div className="pf-cmp">
            <div className="pf-cmp-head pf-cmp-label" style={{ color: MUTED }} />
            <div className="pf-cmp-head" style={{ color: MUTED }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><FileText size={16} /> CV tự khai</span>
            </div>
            <div className="pf-cmp-head" style={{ color: TEAL }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><ShieldCheck size={16} /> Portfolio nextplease</span>
            </div>

            {COMPARISON.map(([label, cv, pf]) => (
              <Fragmentish key={label} label={label} cv={cv} pf={pf} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. DẢI NHẤN — ba thứ hồ sơ tích luỹ ──
             Bản trước có linh vật ếch ở giữa; đã gỡ cho khớp với trang chủ —
             hệ này không dùng nhân vật trang trí. */}
      <section style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ ...INNER, padding: 'clamp(68px, 10vw, 124px) 0', display: 'grid', gap: 40, justifyItems: 'center', textAlign: 'center' }}>
          <h2 className="pf-h2" style={{ maxWidth: '24ch' }}>
            Mỗi việc bạn làm đều cộng vào hồ sơ
          </h2>

          <div style={{ display: 'flex', gap: 'clamp(20px, 4vw, 52px)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              [<Star key="i" size={17} />, 'Trust Score', 'Uy tín do tổ chức xác nhận'],
              [<Zap key="i" size={17} />, 'EXP & Cấp độ', 'Tăng theo từng việc hoàn thành'],
              [<ShieldCheck key="i" size={17} />, 'Verified Proof', 'Minh chứng ai cũng kiểm được'],
            ].map(([icon, name, desc]) => (
              <div key={name} style={{ display: 'grid', gap: 6, justifyItems: 'center', maxWidth: 210 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 500, fontSize: '1rem', color: EMERALD }}>{icon}{name}</span>
                <span style={{ fontSize: '0.9375rem', color: MUTED, lineHeight: 1.5, letterSpacing: '-0.015em' }}>{desc}</span>
              </div>
            ))}
          </div>

          <Link to="/portfolio" onClick={guard} className="pf-cta primary">
            Bắt đầu miễn phí <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── 5. CTA LẶP LẠI — trang tham chiếu nhắc lại lời mời ngay trước FAQ,
             vì tới đây người đọc đã hiểu sản phẩm và không nên phải cuộn ngược
             lên đầu để bấm. ── */}
      <section>
        <div style={{ ...INNER, padding: 'clamp(64px, 9vw, 112px) 0', textAlign: 'center' }}>
          <h2 className="pf-h2" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
            Ba tháng nữa bạn muốn hồ sơ mình trông thế nào?
          </h2>
          <p className="pf-lead" style={{ margin: '20px auto 0', maxWidth: '54ch' }}>
            Dựng hồ sơ mất vài phút và hoàn toàn miễn phí. Phần còn lại để những việc
            bạn làm tự nói hộ.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 34 }}>
            <Link to="/portfolio" onClick={guard} className="pf-cta solid">
              Dựng hồ sơ của tôi <ArrowRight size={17} />
            </Link>
            <Link to="/jobs" className="pf-cta ghost">
              <BriefcaseBusiness size={16} /> Xem cơ hội đang mở
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section style={{ ...INNER, padding: 'clamp(68px, 10vw, 124px) 0' }}>
        <div className="pf-faq">
          <div>
            <h2 className="pf-h2">
              Câu hỏi thường gặp
            </h2>
            <p className="pf-lead" style={{ marginTop: 14 }}>
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
              />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/** Một hàng của bảng so sánh — ba ô rời để lưới CSS tự xếp cột. */
function Fragmentish({ label, cv, pf }) {
  return (
    <>
      <div className="pf-cmp-label" style={{ fontWeight: 500, color: ON_DARK }}>{label}</div>
      <div data-label={label} style={{ color: MUTED }}>
        <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8 }}>
          <CircleX size={16} style={{ color: 'rgba(255,255,255,0.35)', flex: 'none', marginTop: 2 }} /> {cv}
        </span>
      </div>
      <div data-label={label} style={{ color: ON_DARK }}>
        <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8 }}>
          <CircleCheck size={16} style={{ color: EMERALD, flex: 'none', marginTop: 2 }} /> {pf}
        </span>
      </div>
    </>
  );
}
