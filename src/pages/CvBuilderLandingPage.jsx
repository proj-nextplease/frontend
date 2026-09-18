import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, FileText, Sparkles, Download, QrCode,
  ChevronDown, CircleCheck, Layers, Clock,
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

/* Ba lợi ích, xen kẽ trái/phải như bố cục tham chiếu. */
const BENEFITS = [
  {
    kicker: 'BẠN SẼ ĐƯỢC #1',
    title: 'Điền một lần, dùng cho mọi nơi',
    body: 'CV lấy thẳng từ Portfolio bạn đã dựng — kinh nghiệm, kỹ năng, minh chứng. '
        + 'Không phải gõ lại từ đầu mỗi lần ứng tuyển, và sửa ở một chỗ thì mọi bản đều đúng.',
    icon: Layers,
    points: ['Không nhập trùng dữ liệu', 'Sửa một nơi, cập nhật tất cả', 'Luôn khớp với hồ sơ công khai'],
  },
  {
    kicker: 'BẠN SẼ ĐƯỢC #2',
    title: 'Minh chứng đã xác thực đi cùng CV',
    body: 'Mỗi kinh nghiệm được duyệt đều mang dấu Verified Proof of Work. '
        + 'CV của bạn không chỉ nói bạn đã làm gì — nó dẫn thẳng tới bằng chứng.',
    icon: ShieldCheck,
    points: ['Dấu xác thực do tổ chức cấp', 'Mã QR dẫn về portfolio sống', 'Nhà tuyển dụng kiểm chứng trong một chạm'],
  },
  {
    kicker: 'BẠN SẼ ĐƯỢC #3',
    title: 'Bố cục sạch, máy đọc được',
    body: 'Một cột, phông chữ hệ thống, không bảng biểu lồng nhau — dạng mà phần mềm '
        + 'lọc hồ sơ của doanh nghiệp đọc được. Xuất PDF để nộp qua email, hoặc gửi link để người ta xem bản sống.',
    icon: FileText,
    points: ['Bố cục thân thiện với ATS', 'Xuất PDF một chạm', 'Hoặc chia sẻ bằng link riêng'],
  },
];

const FAQS = [
  {
    q: 'CV và Portfolio ở nextplease khác nhau thế nào?',
    a: 'Portfolio là hồ sơ sống: một đường link luôn cập nhật, có minh chứng đã xác thực, điểm uy tín (RS) '
     + 'và kinh nghiệm được tổ chức duyệt. CV là bản rút gọn của chính hồ sơ đó, đóng thành PDF để nộp qua '
     + 'email hoặc các hệ thống tuyển dụng chỉ nhận tệp. Cùng một nguồn dữ liệu, hai cách trình bày.',
  },
  {
    q: 'Tôi có phải nhập lại thông tin không?',
    a: 'Không. CV đọc trực tiếp từ Portfolio của bạn. Nếu chưa dựng Portfolio, bạn sẽ được đưa qua bước đó '
     + 'trước — làm một lần rồi dùng mãi.',
  },
  {
    q: 'Minh chứng được xác thực nghĩa là gì?',
    a: 'Khi bạn hoàn thành một công việc hoặc Quest qua nextplease, tổ chức đó xác nhận và hệ thống cấp '
     + 'Verified Proof of Work. Đây là điểm khác biệt so với CV tự khai: người đọc bấm vào là thấy ai đã xác nhận, '
     + 'xác nhận khi nào.',
  },
  {
    q: 'CV có miễn phí không?',
    a: 'Có. Dựng Portfolio, xuất CV PDF và chia sẻ link đều miễn phí. Các gói trả phí chỉ mở thêm giao diện '
     + 'nâng cao cho trang công khai, không khoá dữ liệu hay khả năng ứng tuyển của bạn.',
  },
  {
    q: 'CV nên dài bao nhiêu?',
    a: 'Với sinh viên và người mới đi làm, một trang là đủ và cũng là điều nhà tuyển dụng mong đợi. '
     + 'Hãy ưu tiên những kinh nghiệm có minh chứng, thay vì liệt kê mọi hoạt động từng tham gia.',
  },
  {
    q: 'Nhà tuyển dụng có xem được portfolio từ CV không?',
    a: 'Có. Bản PDF mang theo đường dẫn riêng của bạn (dạng /p/ten-cua-ban) và mã QR, nên từ tệp tĩnh '
     + 'người đọc vẫn sang được bản sống có đầy đủ minh chứng.',
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
          gap: 16, padding: '20px 4px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontSize: '1.02rem', fontWeight: 700, color: INK,
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

/** Ảnh minh hoạ tờ CV — dựng bằng CSS nên không phải tải thêm tài nguyên. */
function CvSheetArt() {
  const line = (w, dim = false) => (
    <span style={{ display: 'block', height: 7, width: w, borderRadius: 99, background: dim ? '#e6efec' : '#cfe6de' }} />
  );
  return (
    <div style={{ position: 'relative', minHeight: 360 }} aria-hidden="true">
      {/* Tờ phía sau, hơi nghiêng để tạo chiều sâu */}
      <div style={{
        position: 'absolute', top: 28, right: 6, width: '72%', height: 300, borderRadius: 16,
        background: 'rgba(255,255,255,0.35)', transform: 'rotate(6deg)',
      }} />
      {/* Tờ chính */}
      <div style={{
        position: 'relative', width: 'min(360px, 86%)', padding: '26px 24px', borderRadius: 18,
        background: '#fff', boxShadow: '0 24px 60px rgba(4,47,42,0.28)', display: 'grid', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${EMERALD}, ${TEAL})` }} />
          <div style={{ display: 'grid', gap: 6, flex: 1 }}>
            {line('62%')}
            {line('40%', true)}
          </div>
        </div>
        <div style={{ height: 1, background: LINE }} />
        <div style={{ display: 'grid', gap: 9 }}>
          <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.12em', color: TEAL }}>KINH NGHIỆM</span>
          {line('92%')}{line('78%', true)}{line('84%', true)}
        </div>
        <div style={{ display: 'grid', gap: 9 }}>
          <span style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.12em', color: TEAL }}>KỸ NĂNG</span>
          {line('70%', true)}{line('55%', true)}
        </div>
      </div>
      {/* Huy hiệu xác thực nổi lên trên — điểm khác biệt so với CV thường */}
      <div style={{
        position: 'absolute', right: '4%', bottom: 18, display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 999, background: '#fff',
        boxShadow: '0 14px 34px rgba(4,47,42,0.26)', fontSize: '0.82rem', fontWeight: 800, color: TEAL,
      }}>
        <ShieldCheck size={16} /> Verified Proof
      </div>
    </div>
  );
}

export function CvBuilderLandingPage() {
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
        .cv-cta { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; border-radius:9999px;
                  font-size:0.95rem; font-weight:800; text-decoration:none; border:none; cursor:pointer;
                  transition: transform .18s ease, box-shadow .18s ease; }
        .cv-cta:hover { transform: translateY(-2px); }
        .cv-cta.primary { background:#ecfccb; color:${INK}; box-shadow:0 10px 26px rgba(0,0,0,0.18); }
        .cv-cta.ghost { background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,0.55); }
        .cv-hero { display:grid; grid-template-columns: 1.05fr 0.95fr; gap:48px; align-items:center;
                   padding: clamp(48px, 7vw, 86px) 0; }
        .cv-benefit { display:grid; grid-template-columns: 1fr 1fr; gap:clamp(28px, 5vw, 72px); align-items:center;
                      padding: clamp(40px, 6vw, 72px) 0; }
        .cv-benefit.flip .cv-benefit-art { order:-1; }
        .cv-faq-grid { display:grid; grid-template-columns: 0.8fr 1.2fr; gap:clamp(24px, 4vw, 56px); align-items:start; }
        @media (max-width: 900px) {
          .cv-hero, .cv-benefit, .cv-faq-grid { grid-template-columns: 1fr; }
          .cv-benefit.flip .cv-benefit-art { order:0; }
        }
      `}</style>

      {/* ── Hero ── */}
      <section style={{ background: HERO_GRAD, color: '#fff' }}>
        <div style={{ ...INNER }}>
          <div className="cv-hero">
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.14)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em',
              }}>
                <Sparkles size={14} /> MIỄN PHÍ TOÀN BỘ
              </span>

              {/* Màu chữ phải khai tường minh trên mọi thẻ tiêu đề: reset của
                  design-system đặt color cho :where(h1..h6), mà giá trị kế thừa
                  từ cha thì luôn thua một rule khớp trực tiếp — kể cả rule có
                  độ ưu tiên bằng 0 như :where(). */}
              <h1 style={{
                margin: '18px 0 16px', fontSize: 'clamp(2.1rem, 4.4vw, 3.4rem)', fontWeight: 800,
                lineHeight: 1.12, letterSpacing: '-0.02em', color: '#fff',
              }}>
                Tạo CV từ hồ sơ đã được xác thực của bạn
              </h1>

              <p style={{ margin: 0, maxWidth: '54ch', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.7, color: 'rgba(255,255,255,0.88)' }}>
                Không phải một biểu mẫu trống nữa. CV lấy thẳng từ Portfolio bạn đã dựng, mang theo
                minh chứng do tổ chức xác nhận — thứ mà CV tự khai không có.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 30 }}>
                <Link to="/portfolio" onClick={guard} className="cv-cta primary">
                  Tạo CV ngay <ArrowRight size={17} />
                </Link>
                <Link to="/candidates/dashboard/overview" onClick={guard} className="cv-cta ghost">
                  <Download size={16} /> Xuất CV từ Portfolio
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 26, fontSize: '0.86rem', color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CircleCheck size={15} /> Không cần thẻ thanh toán</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={15} /> Xong trong vài phút</span>
              </div>
            </div>

            <CvSheetArt />
          </div>
        </div>
      </section>

      {/* ── Ba lợi ích ── */}
      <section style={{ ...INNER, padding: 'clamp(40px, 6vw, 72px) 20px 0' }}>
        {BENEFITS.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={b.kicker} className={`cv-benefit${i % 2 === 1 ? ' flip' : ''}`}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: EMERALD }}>
                  {b.kicker}
                </span>
                <h2 style={{ margin: '12px 0 14px', fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.01em', color: INK }}>
                  {b.title}
                </h2>
                <p style={{ margin: '0 0 18px', color: MUTED, fontSize: '1rem', lineHeight: 1.75, maxWidth: '52ch' }}>
                  {b.body}
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                  {b.points.map((p) => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.94rem', fontWeight: 600 }}>
                      <CircleCheck size={17} style={{ color: EMERALD, flex: 'none' }} /> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cv-benefit-art" style={{
                display: 'grid', placeItems: 'center', minHeight: 220, borderRadius: 24,
                background: MINT, border: `1px solid ${LINE}`,
              }}>
                <Icon size={76} strokeWidth={1.3} style={{ color: TEAL }} />
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Dải nhấn: khác biệt so với CV thường ── */}
      <section style={{ background: INK, color: '#fff', marginTop: 'clamp(32px, 5vw, 56px)' }}>
        <div style={{ ...INNER, padding: 'clamp(44px, 6vw, 72px) 20px', display: 'grid', gap: 26, textAlign: 'center' }}>
          <QrCode size={40} strokeWidth={1.4} style={{ color: EMERALD, justifySelf: 'center' }} />
          <h2 style={{ margin: 0, fontSize: 'clamp(1.35rem, 2.6vw, 2rem)', fontWeight: 800, lineHeight: 1.3, color: '#fff' }}>
            Một tệp PDF tĩnh vẫn dẫn về hồ sơ sống của bạn
          </h2>
          <p style={{ margin: '0 auto', maxWidth: '62ch', color: 'rgba(255,255,255,0.78)', fontSize: '1rem', lineHeight: 1.75 }}>
            CV mang theo đường dẫn riêng và mã QR. Nhà tuyển dụng đọc bản in vẫn sang được portfolio
            đầy đủ minh chứng — không phải tin vào lời tự khai.
          </p>
          <Link to="/portfolio" onClick={guard} className="cv-cta primary" style={{ justifySelf: 'center' }}>
            Bắt đầu miễn phí <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ ...INNER, padding: 'clamp(48px, 7vw, 86px) 20px' }}>
        <div className="cv-faq-grid">
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.01em', color: INK }}>
              Câu hỏi thường gặp
            </h2>
            <p style={{ marginTop: 14, color: MUTED, fontSize: '0.97rem', lineHeight: 1.7 }}>
              Chưa rõ chỗ nào? Đây là những thắc mắc hay gặp nhất về CV và Portfolio.
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
