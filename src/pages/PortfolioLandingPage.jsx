import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Sparkles, Award, BriefcaseBusiness,
  ChevronDown, CircleCheck, Layers, Clock,
} from 'lucide-react';
import { Mascot } from 'page-mascot';
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
    no: 1,
    title: 'Minh chứng do tổ chức xác nhận, không phải lời tự khai',
    body: 'Mỗi công việc hay Quest bạn hoàn thành qua nextplease đều được chính tổ chức đó xác nhận '
        + 'và cấp Verified Proof of Work. Nhà tuyển dụng bấm vào là thấy ai xác nhận, xác nhận khi nào.',
    icon: ShieldCheck,
    caption: 'Thực tập sinh Marketing · F-Code',
    chips: ['Đã xác thực', '+120 EXP'],
    points: ['Dấu xác thực gắn với từng kinh nghiệm', 'Điểm uy tín RS tăng theo việc đã làm', 'Kiểm chứng được trong một chạm'],
  },
  {
    no: 2,
    title: 'Một trang mang cá tính của riêng bạn',
    body: 'Nhân vật 3D bạn tự tạo, ảnh bìa bạn tự chọn, và một đường dẫn mang tên bạn. '
        + 'Không phải một mẫu hồ sơ ai cũng giống ai.',
    icon: Sparkles,
    caption: 'nextplease.vn/p/ten-cua-ban',
    chips: ['Nhân vật 3D', 'Ảnh bìa riêng'],
    points: ['Nhân vật 3D tuỳ chỉnh', 'Ảnh bìa tự căn khung', 'Đường dẫn riêng dạng /p/ten-cua-ban'],
  },
  {
    no: 3,
    title: 'Dựng một lần, dùng ở mọi nơi',
    body: 'Chia sẻ bằng link để người đọc thấy bản sống luôn cập nhật, hoặc xuất PDF khi cần nộp '
        + 'qua email. Ứng tuyển trong hệ thống thì chỉ một chạm, không phải đính kèm gì thêm.',
    icon: Layers,
    caption: 'Một hồ sơ, mọi nơi đều dùng được',
    chips: ['Link chia sẻ', 'PDF'],
    points: ['Ứng tuyển một chạm', 'Xuất PDF khi cần tệp', 'Sửa một nơi, mọi nơi đều đúng'],
  },
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

/**
 * Minh hoạ cho mỗi khối lợi ích: linh vật đứng cạnh một tấm thẻ nói đúng nội
 * dung của khối đó.
 *
 * Trang tham chiếu dùng nhân vật thương hiệu tương tác với một tờ CV ở mỗi
 * mục; ta có sẵn linh vật con cóc nên dùng lại, vừa thống nhất với trang chủ
 * vừa khỏi phải thuê vẽ minh hoạ.
 */
function BenefitArt({ icon, caption, chips, mascot = false }) {
  const Icon = icon;
  return (
    <div className="cv-benefit-art" style={{
      position: 'relative', display: 'grid', placeItems: 'center',
      minHeight: 280, padding: '28px 24px', borderRadius: 28,
      background: 'linear-gradient(150deg, #ecfdf5 0%, #f0fdfa 60%, #eff6ff 100%)',
      border: `1px solid ${LINE}`, overflow: 'hidden',
    }}>
      {/* Đốm sáng trang trí phía sau, bo tròn mềm cho đỡ phẳng */}
      <span aria-hidden="true" style={{
        position: 'absolute', width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(16,185,129,0.14)', filter: 'blur(6px)', top: -60, right: -40,
      }} />

      <div style={{ position: 'relative', display: 'grid', gap: 14, justifyItems: 'center', width: '100%' }}>
        {/* Tấm thẻ nói nội dung của khối */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, width: 'min(300px, 100%)',
          padding: '14px 16px', borderRadius: 16, background: '#fff',
          boxShadow: '0 16px 36px rgba(4,47,42,0.12)',
        }}>
          <span style={{
            display: 'grid', placeItems: 'center', width: 42, height: 42, flex: 'none',
            borderRadius: 12, background: MINT, color: TEAL,
          }}>
            <Icon size={21} strokeWidth={2} />
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: INK, lineHeight: 1.35 }}>{caption}</span>
        </div>

        {/* Hai nhãn nhỏ nổi quanh, gợi cảm giác trang đang "sống" */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {chips.map((c) => (
            <span key={c} style={{
              padding: '5px 12px', borderRadius: 999, background: '#fff',
              border: `1px solid ${LINE}`, fontSize: '0.74rem', fontWeight: 800, color: TEAL,
            }}>{c}</span>
          ))}
        </div>

        {/* Chỉ một khối có linh vật: ta chỉ có một bộ sprite nên ba con giống
            hệt nhau trên cùng một trang sẽ thành lặp. Khối còn lại dùng huy
            hiệu icon để nhịp trang có thay đổi. */}
        {mascot ? (
          <Mascot
            directions="/mascots/frog-directions.webp"
            reactions="/mascots/frog-reactions.webp"
            size={116}
            label="Linh vật nextplease"
          />
        ) : (
          <span style={{
            display: 'grid', placeItems: 'center', width: 96, height: 96, borderRadius: '50%',
            background: '#fff', boxShadow: '0 14px 32px rgba(4,47,42,0.12)', color: TEAL,
          }}>
            <Icon size={42} strokeWidth={1.6} />
          </span>
        )}
      </div>
    </div>
  );
}

/** Ảnh minh hoạ tấm hồ sơ — dựng bằng CSS nên không phải tải thêm tài nguyên. */
function PortfolioSheetArt() {
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
        .cv-cta { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; border-radius:9999px;
                  font-size:0.95rem; font-weight:800; text-decoration:none; border:none; cursor:pointer;
                  transition: transform .18s ease, box-shadow .18s ease; }
        .cv-cta:hover { transform: translateY(-2px); }
        .cv-cta.primary { background:#ecfccb; color:${INK}; box-shadow:0 10px 26px rgba(0,0,0,0.18); }
        .cv-cta.ghost { background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,0.55); }
        .cv-hero { display:grid; grid-template-columns: 1.05fr 0.95fr; gap:48px; align-items:center;
                   padding: clamp(48px, 7vw, 86px) 0; }
        .cv-benefit { display:grid; grid-template-columns: 1fr 1fr; gap:clamp(28px, 5vw, 80px); align-items:center;
                      padding: clamp(52px, 8vw, 104px) 0; }
        .cv-benefit.flip .cv-benefit-art { order:-1; }

        /* Nhãn "BẠN SẼ ĐƯỢC #n" dạng chip viền, số dùng màu nhấn — dễ nhận ra
           đây là một chuỗi có thứ tự hơn là mấy chữ nhỏ trôi nổi. */
        .cv-kicker { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px;
                     border:1px solid ${LINE}; background:#fff; font-size:0.74rem; font-weight:800;
                     letter-spacing:0.1em; color:${MUTED}; }
        .cv-kicker b { color:${EMERALD}; font-weight:900; }

        /* Dải nền xen kẽ để mỗi lợi ích là một chặng riêng, thay vì một mảng
           trắng dài liền mạch. */
        .cv-band { width:100%; }
        .cv-band.tint { background:linear-gradient(180deg, #f4fbf8 0%, #ffffff 100%); }
        .cv-faq-grid { display:grid; grid-template-columns: 0.8fr 1.2fr; gap:clamp(24px, 4vw, 56px); align-items:start; }
        @media (max-width: 900px) {
          .cv-hero, .cv-benefit, .cv-faq-grid { grid-template-columns: 1fr; }
          .cv-benefit.flip .cv-benefit-art { order:0; }
          .cv-benefit { padding: clamp(36px, 9vw, 56px) 0; }
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
                Hồ sơ năng lực có minh chứng, không chỉ là lời tự khai
              </h1>

              <p style={{ margin: 0, maxWidth: '54ch', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.7, color: 'rgba(255,255,255,0.88)' }}>
                Dựng Portfolio với nhân vật 3D của riêng bạn, tích minh chứng được tổ chức xác nhận
                qua từng công việc, và chia sẻ bằng một đường dẫn mang tên bạn.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 30 }}>
                <Link to="/portfolio" onClick={guard} className="cv-cta primary">
                  Tạo Portfolio ngay <ArrowRight size={17} />
                </Link>
                <Link to="/jobs" className="cv-cta ghost">
                  <BriefcaseBusiness size={16} /> Xem cơ hội đang mở
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 26, fontSize: '0.86rem', color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CircleCheck size={15} /> Không cần thẻ thanh toán</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={15} /> Dựng xong trong vài phút</span>
              </div>
            </div>

            <PortfolioSheetArt />
          </div>
        </div>
      </section>

      {/* ── Ba lợi ích: mỗi khối là một dải riêng, nền xen kẽ ── */}
      {BENEFITS.map((b, i) => (
        <section key={b.no} className={`cv-band${i % 2 === 1 ? ' tint' : ''}`}>
          <div style={{ ...INNER }}>
            <div className={`cv-benefit${i % 2 === 1 ? ' flip' : ''}`}>
              <div>
                <span className="cv-kicker">BẠN SẼ ĐƯỢC <b>#{b.no}</b></span>

                <h2 style={{ margin: '16px 0 14px', fontSize: 'clamp(1.6rem, 3.1vw, 2.45rem)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.02em', color: INK }}>
                  {b.title}
                </h2>
                <p style={{ margin: '0 0 22px', color: MUTED, fontSize: 'clamp(1rem, 1.2vw, 1.06rem)', lineHeight: 1.78, maxWidth: '50ch' }}>
                  {b.body}
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                  {b.points.map((p) => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.96rem', fontWeight: 600, color: INK }}>
                      <CircleCheck size={18} style={{ color: EMERALD, flex: 'none' }} /> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <BenefitArt icon={b.icon} caption={b.caption} chips={b.chips} mascot={b.no === 2} />
            </div>
          </div>
        </section>
      ))}

      {/* ── Dải nhấn: khác biệt so với CV thường ── */}
      <section style={{ background: INK, color: '#fff', marginTop: 'clamp(32px, 5vw, 56px)' }}>
        <div style={{ ...INNER, padding: 'clamp(44px, 6vw, 72px) 20px', display: 'grid', gap: 26, textAlign: 'center' }}>
          <Award size={40} strokeWidth={1.4} style={{ color: EMERALD, justifySelf: 'center' }} />
          <h2 style={{ margin: 0, fontSize: 'clamp(1.35rem, 2.6vw, 2rem)', fontWeight: 800, lineHeight: 1.3, color: '#fff' }}>
            Mỗi việc bạn làm đều cộng vào hồ sơ
          </h2>
          <p style={{ margin: '0 auto', maxWidth: '62ch', color: 'rgba(255,255,255,0.78)', fontSize: '1rem', lineHeight: 1.75 }}>
            Nhận Quest và công việc nhỏ ngay trên nền tảng. Hoàn thành thì tổ chức xác nhận, hồ sơ có
            thêm một minh chứng, điểm uy tín và cấp độ của bạn đi lên. Bắt đầu từ con số không cũng được.
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
