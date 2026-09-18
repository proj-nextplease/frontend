import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mascot } from 'page-mascot';
import {
  ArrowRight, ShieldCheck, Sparkles, BriefcaseBusiness, ChevronDown,
  CircleCheck, CircleX, Link2, Flame, Star, Zap, UserRound, FileText,
} from 'lucide-react';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';

/* ── Emerald palette (khớp với các trang landing còn lại) ── */
const TEAL = '#0d9488';
const EMERALD = '#10b981';
const INK = '#0f2e2b';
const MUTED = '#5b7772';
const LINE = '#e2efe9';
const MINT = '#e7f7f0';
const HERO_GRAD = 'linear-gradient(158deg, #0f766e 0%, #0d9488 52%, #115e59 100%)';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

/* Ba bước đúng theo cách hồ sơ thật sự lớn lên trên nền tảng. */
const STEPS = [
  {
    no: '01',
    icon: UserRound,
    title: 'Dựng hồ sơ',
    body: 'Chọn nhân vật 3D, điền kỹ năng và học vấn. Mất vài phút, và bạn đã có một đường dẫn mang tên mình.',
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
  ['Trông giống ai', 'Giống mọi CV khác', 'Nhân vật 3D và trang của riêng bạn'],
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
          textAlign: 'left', fontSize: '1.08rem', fontWeight: 700, color: INK,
        }}
      >
        {item.q}
        <ChevronDown
          size={20}
          style={{ flex: 'none', color: TEAL, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .22s ease' }}
        />
      </button>
      {open && (
        <p style={{ margin: '0 4px 22px', color: MUTED, fontSize: '0.97rem', lineHeight: 1.75, maxWidth: '76ch' }}>
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
        borderRadius: 24, background: '#fff', overflow: 'hidden',
        boxShadow: '0 30px 70px rgba(4,47,42,0.3)',
      }}>
        {/* Ảnh bìa — đúng tính năng vừa làm xong */}
        <div style={{ height: 78, background: 'linear-gradient(120deg, #34d399, #0d9488 70%)' }} />

        <div style={{ padding: '0 20px 20px', marginTop: -30 }}>
          <div style={{
            width: 62, height: 62, borderRadius: '50%', border: '3px solid #fff',
            background: 'linear-gradient(135deg, #10b981, #0d9488)', display: 'grid', placeItems: 'center',
            color: '#fff', fontWeight: 900, fontSize: '1.3rem',
          }}>P</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: INK }}>Nguyễn Tài Phát</span>
            <span style={{ padding: '2px 9px', borderRadius: 999, background: MINT, color: TEAL, fontSize: '0.7rem', fontWeight: 900 }}>LV. 4</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 2 }}>Sinh viên Marketing · ĐH FPT</div>

          <div style={{
            display: 'flex', justifyContent: 'space-around', gap: 8, margin: '16px 0',
            padding: '12px 0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`,
          }}>
            {stat(<ShieldCheck size={14} />, '86', 'TRUST SCORE', TEAL)}
            {stat(<Zap size={14} />, '1.2K', 'EXP', '#f59e0b')}
            {stat(<Flame size={14} />, '7', 'STREAK', '#fb7185')}
          </div>

          {/* Một dòng kinh nghiệm đã được xác thực */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: '#f7fbf9' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, flex: 'none', borderRadius: 10, background: MINT, color: TEAL }}>
              <BriefcaseBusiness size={16} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Trưởng ban Truyền thông
              </div>
              <div style={{ fontSize: '0.74rem', color: MUTED }}>CLB F-Code · 2025</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 999, background: MINT, color: TEAL, fontSize: '0.66rem', fontWeight: 900, flex: 'none' }}>
              <ShieldCheck size={11} /> Đã xác thực
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: '0.76rem', fontWeight: 700, color: TEAL }}>
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
      background: '#fff', color: INK,
      width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', overflowX: 'clip',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      <SiteHeader />

      <style>{`
        .pf-cta { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; border-radius:9999px;
                  font-size:0.97rem; font-weight:800; text-decoration:none; border:none; cursor:pointer;
                  transition: transform .18s ease, box-shadow .18s ease; }
        .pf-cta:hover { transform: translateY(-2px); }
        .pf-cta.primary { background:#ecfccb; color:${INK}; box-shadow:0 10px 26px rgba(0,0,0,0.18); }
        .pf-cta.ghost { background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,0.55); }
        .pf-cta.solid { background:${TEAL}; color:#fff; box-shadow:0 12px 28px rgba(13,148,136,0.28); }

        /* Nhịp lấy theo trang tham chiếu: hero của họ cao 788px ở 1400px, mỗi
           phần nội dung gần một màn hình. Bản trước của ta chỉ thoáng bằng nửa
           nên đọc bị dồn. */
        .pf-hero { display:grid; grid-template-columns: 1.06fr 0.94fr; gap:clamp(32px, 5vw, 72px);
                   align-items:center; min-height:min(788px, 82vh);
                   padding: clamp(56px, 8vw, 110px) 0 clamp(64px, 9vw, 120px); }

        .pf-steps { display:grid; grid-template-columns: repeat(3, 1fr); gap:clamp(18px, 2.4vw, 28px); }
        .pf-step { position:relative; padding:clamp(28px, 3vw, 40px) clamp(24px, 2.6vw, 32px);
                   border-radius:26px; background:#fff;
                   border:1px solid ${LINE}; box-shadow:0 12px 30px rgba(4,47,42,0.05); }

        /* Bảng so sánh: hai cột nội dung, cột nhãn nằm bên trái. */
        .pf-cmp { display:grid; grid-template-columns: 1.15fr 1fr 1fr; align-items:stretch;
                  border:1px solid ${LINE}; border-radius:22px; overflow:hidden; background:#fff; }
        .pf-cmp > * { padding:clamp(16px, 1.8vw, 22px) clamp(18px, 2vw, 26px); border-bottom:1px solid ${LINE}; font-size:1rem; }
        .pf-cmp > *:nth-child(3n) { background:#f5fbf8; }
        .pf-cmp-head { font-weight:900; font-size:0.9rem !important; letter-spacing:0.02em; }

        .pf-faq { display:grid; grid-template-columns: 0.8fr 1.2fr; gap:clamp(24px, 4vw, 56px); align-items:start; }

        @media (max-width: 960px) {
          .pf-hero, .pf-faq { grid-template-columns: 1fr; }
          .pf-steps { grid-template-columns: 1fr; }
          /* Bảng ba cột không đọc nổi trên màn hẹp. Giữ hai cột so sánh, còn
             nhãn tiêu chí thành một dòng chạy suốt bề ngang phía trên — đọc
             một lần cho cả hai bên thay vì lặp lại ở từng ô. */
          .pf-cmp { grid-template-columns: 1fr 1fr; }
          .pf-cmp .pf-cmp-label { grid-column: 1 / -1; background:#f7fbf9;
                                  font-size:0.8rem !important; font-weight:800 !important;
                                  padding-top:12px; padding-bottom:12px; }
          .pf-cmp .pf-cmp-head.pf-cmp-label { display:none; }
        }
      `}</style>

      {/* ── 1. HERO — cho xem sản phẩm, không mô tả suông ── */}
      <section style={{ background: HERO_GRAD, color: '#fff' }}>
        <div style={{ ...INNER }}>
          <div className="pf-hero">
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.14)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em',
              }}>
                <Sparkles size={14} /> MIỄN PHÍ TOÀN BỘ
              </span>

              {/* Màu chữ phải khai tường minh trên mọi thẻ tiêu đề: reset của
                  design-system đặt color cho :where(h1..h6) bằng light-dark(),
                  nên giá trị kế thừa từ cha luôn thua và bám theo sáng/tối của
                  hệ điều hành. */}
              <h1 style={{
                margin: '22px 0 20px', fontSize: 'clamp(2.3rem, 5vw, 4rem)', fontWeight: 800,
                lineHeight: 1.08, letterSpacing: '-0.03em', color: '#fff',
              }}>
                Đây là hồ sơ của bạn sau ba tháng
              </h1>

              <p style={{ margin: 0, maxWidth: '50ch', fontSize: 'clamp(1.04rem, 1.5vw, 1.22rem)', lineHeight: 1.75, color: 'rgba(255,255,255,0.88)' }}>
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
        <div style={{ textAlign: 'center', maxWidth: '58ch', margin: '0 auto clamp(40px, 5vw, 64px)' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.025em', color: INK }}>
            Bạn không phải tự nghĩ ra thành tích
          </h2>
          <p style={{ margin: '18px 0 0', color: MUTED, fontSize: 'clamp(1.04rem, 1.4vw, 1.16rem)', lineHeight: 1.78 }}>
            Hồ sơ lớn lên theo việc bạn thật sự làm. Bắt đầu từ con số không cũng được.
          </p>
        </div>

        <div className="pf-steps">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.no} className="pf-step">
                <span style={{
                  position: 'absolute', top: 20, right: 22, fontSize: '2rem', fontWeight: 900,
                  color: MINT, letterSpacing: '-0.04em', lineHeight: 1,
                }}>{s.no}</span>

                <span style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 14, background: MINT, color: TEAL }}>
                  <Icon size={23} strokeWidth={2} />
                </span>
                <h3 style={{ margin: '20px 0 10px', fontSize: 'clamp(1.2rem, 1.5vw, 1.35rem)', fontWeight: 800, color: INK }}>{s.title}</h3>
                <p style={{ margin: 0, color: MUTED, fontSize: '1rem', lineHeight: 1.75 }}>{s.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. SO SÁNH — phần thuyết phục chính ── */}
      <section style={{ background: 'linear-gradient(180deg, #f4fbf8 0%, #ffffff 100%)' }}>
        <div style={{ ...INNER, padding: 'clamp(72px, 11vw, 140px) 0' }}>
          <div style={{ textAlign: 'center', maxWidth: '54ch', margin: '0 auto clamp(36px, 5vw, 60px)' }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.025em', color: INK }}>
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

      {/* ── 4. DẢI NHẤN — uy tín tích luỹ ── */}
      <section style={{ background: INK, color: '#fff' }}>
        <div style={{ ...INNER, padding: 'clamp(68px, 10vw, 124px) 0', display: 'grid', gap: 26, justifyItems: 'center', textAlign: 'center' }}>
          <Mascot
            directions="/mascots/frog-directions.webp"
            reactions="/mascots/frog-reactions.webp"
            size={104}
            label="Linh vật nextplease"
          />
          <h2 style={{ margin: 0, fontSize: 'clamp(1.7rem, 3.4vw, 2.7rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff', maxWidth: '20ch' }}>
            Mỗi việc bạn làm đều cộng vào hồ sơ
          </h2>

          <div style={{ display: 'flex', gap: 'clamp(20px, 4vw, 52px)', flexWrap: 'wrap', justifyContent: 'center', margin: '4px 0 6px' }}>
            {[
              [<Star key="i" size={17} />, 'Trust Score', 'Uy tín do tổ chức xác nhận'],
              [<Zap key="i" size={17} />, 'EXP & Cấp độ', 'Tăng theo từng việc hoàn thành'],
              [<ShieldCheck key="i" size={17} />, 'Verified Proof', 'Minh chứng ai cũng kiểm được'],
            ].map(([icon, name, desc]) => (
              <div key={name} style={{ display: 'grid', gap: 5, justifyItems: 'center', maxWidth: 200 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 900, color: EMERALD }}>{icon}{name}</span>
                <span style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>{desc}</span>
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
      <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f4fbf8 100%)' }}>
        <div style={{ ...INNER, padding: 'clamp(64px, 9vw, 112px) 0', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)', fontWeight: 800, lineHeight: 1.16, letterSpacing: '-0.025em', color: INK, maxWidth: '22ch', marginInline: 'auto' }}>
            Ba tháng nữa bạn muốn hồ sơ mình trông thế nào?
          </h2>
          <p style={{ margin: '20px auto 0', maxWidth: '54ch', color: MUTED, fontSize: 'clamp(1.02rem, 1.4vw, 1.14rem)', lineHeight: 1.78 }}>
            Dựng hồ sơ mất vài phút và hoàn toàn miễn phí. Phần còn lại để những việc
            bạn làm tự nói hộ.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 34 }}>
            <Link to="/portfolio" onClick={guard} className="pf-cta solid">
              Dựng hồ sơ của tôi <ArrowRight size={17} />
            </Link>
            <Link to="/jobs" className="pf-cta" style={{ background: '#fff', color: INK, border: `1.5px solid ${LINE}` }}>
              <BriefcaseBusiness size={16} /> Xem cơ hội đang mở
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section style={{ ...INNER, padding: 'clamp(68px, 10vw, 124px) 0' }}>
        <div className="pf-faq">
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.01em', color: INK }}>
              Câu hỏi thường gặp
            </h2>
            <p style={{ marginTop: 14, color: MUTED, fontSize: '0.97rem', lineHeight: 1.7 }}>
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
      <div className="pf-cmp-label" style={{ fontWeight: 700, color: INK }}>{label}</div>
      <div data-label={label} style={{ color: MUTED }}>
        <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8 }}>
          <CircleX size={16} style={{ color: '#f87171', flex: 'none', marginTop: 2 }} /> {cv}
        </span>
      </div>
      <div data-label={label} style={{ color: INK, fontWeight: 600 }}>
        <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8 }}>
          <CircleCheck size={16} style={{ color: EMERALD, flex: 'none', marginTop: 2 }} /> {pf}
        </span>
      </div>
    </>
  );
}
