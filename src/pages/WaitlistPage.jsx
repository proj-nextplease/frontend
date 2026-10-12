import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, ChevronDown, FolderOpen, Layers, ShieldCheck } from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { NeonBloom } from '../components/NeonBloom.jsx';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { joinWaitlist } from '../api/waitlistApi.js';

/* Bảng màu dùng chung — KHÔNG khai lại hằng số ở đây. Mỗi trang tự chép một
   bộ là cách tông màu trôi khỏi nhau; xem ghi chú trong neonPalette.js. */
import {
  INK, SURFACE, SURFACE_HI, LINE, LINE_STRONG,
  EMERALD, EMERALD_BRIGHT, ON_DARK, MUTED,
} from '../styles/neonPalette.js';

/* ──────────────────────────────────────────────────────────────────────────
   Trang waitlist — dựng theo đúng ngôn ngữ của trang chủ.

   Cụ thể là theo FE/src/pages/HomePage.jsx chứ không theo DESIGN.md: tài liệu
   còn ghi emerald #10b981 trong khi màu nhấn thật đã là lime #b9ff00 và nền
   đã sang #070a0f. Khi hai nguồn lệch nhau thì bản dựng đang chạy mới là thứ
   người dùng nhìn thấy.

   Mượn đúng ba thứ làm nên nhận dạng của trang chủ:
     - SiteHeader/SiteFooter dùng chung, nên điều hướng và chân trang giống hệt.
     - HeroMesh cho quầng sáng sau hero.
     - Chữ display Archivo in hoa, CHỈ một lần trên trang (H1 của hero) —
       quy tắc này là thứ giữ cho cái H1 có sức nặng.
   ────────────────────────────────────────────────────────────────────────── */

const PROBLEMS = [
  'Kinh nghiệm nằm rải rác trong Drive, mạng xã hội, file cá nhân và các dự án khác nhau.',
  'Làm việc nhóm nên khó trình bày rõ vai trò và đóng góp của riêng bạn.',
  'Khó đưa ra bằng chứng đáng tin cậy cho những gì đã ghi trong CV hoặc portfolio.',
];

const VALUES = [
  {
    tag: 'CREATE',
    icon: <Layers size={22} />,
    title: 'Tạo portfolio',
    body: 'Dựng portfolio chuyên nghiệp từ dự án, sản phẩm và vai trò của bạn, theo một cấu trúc rõ ràng, dễ chia sẻ.',
  },
  {
    tag: 'ORGANIZE',
    icon: <FolderOpen size={22} />,
    title: 'Hệ thống hoá kinh nghiệm',
    body: 'Gom dự án, hoạt động ngoại khoá và trải nghiệm rời rạc về một nơi, để bạn luôn có sẵn khi cần.',
  },
  {
    tag: 'VERIFY',
    icon: <ShieldCheck size={22} />,
    title: 'Gắn bằng chứng, hỗ trợ xác thực',
    body: 'Gắn bằng chứng cho từng dự án và mời người liên quan xác nhận vai trò, đóng góp của bạn.',
  },
];

const STEPS = [
  { title: 'Tạo hồ sơ cá nhân', body: 'Giới thiệu bản thân, lĩnh vực chuyên môn và mục tiêu nghề nghiệp.' },
  { title: 'Thêm dự án & kết quả', body: 'Ghi lại dự án, vai trò, sản phẩm và những kết quả bạn đã tạo ra.' },
  { title: 'Gắn bằng chứng', body: 'Đính kèm sản phẩm thật và mời người liên quan xác nhận khi bạn sẵn sàng.' },
  { title: 'Xuất bản & chia sẻ', body: 'Xuất bản portfolio và gửi đường link cho nhà tuyển dụng hoặc đối tác.' },
];

const AUDIENCES = [
  { title: 'Sinh viên', body: 'Đang làm CLB, tổ chức sự kiện, tham gia cuộc thi hay dự án học thuật? Gom lại thành một hồ sơ để sẵn sàng khi ứng tuyển thực tập.' },
  { title: 'Thực tập sinh & người mới đi làm', body: 'Mới có vài dự án đầu tay vẫn đáng được trình bày bài bản. Cho thấy bạn đã làm gì, đóng góp ra sao.' },
  { title: 'Freelancer & cộng tác viên', body: 'Nhiều khách hàng, nhiều dự án nhỏ lẻ? Gom về một nơi, gắn bằng chứng để khách mới nhìn là hiểu năng lực của bạn.' },
  { title: 'Người làm nghề ở mọi lĩnh vực', body: 'Dù bạn làm Marketing, Thiết kế, Công nghệ, Kinh doanh hay lĩnh vực khác, dự án của bạn cần một chỗ đứng đẹp và đáng tin hơn một thư mục Drive.' },
];

const FAQS = [
  { q: 'FONLIO là gì?', a: 'FONLIO là nền tảng tạo portfolio, lưu trữ và xác thực kinh nghiệm dành cho đa dạng ngành nghề. FONLIO giúp bạn biến các dự án, sản phẩm sáng tạo, hoạt động ngoại khoá và trải nghiệm rời rạc thành một hồ sơ năng lực có cấu trúc, có bằng chứng và có thể chia sẻ.' },
  { q: 'FONLIO có dành cho sinh viên chưa có nhiều kinh nghiệm không?', a: 'Có. Sinh viên và người mới bắt đầu là nhóm mà FONLIO hướng tới. Dù bạn mới có vài hoạt động CLB, một cuộc thi hay một dự án học thuật, đó đều là điểm xuất phát tốt để bắt đầu portfolio.' },
  { q: 'Tôi có cần portfolio sẵn có để đăng ký không?', a: 'Không. Bạn chỉ cần điền form đăng ký. Việc xây portfolio sẽ làm khi bạn trải nghiệm FONLIO.' },
  { q: 'Xác thực kinh nghiệm trên FONLIO nghĩa là gì?', a: 'Bạn gắn bằng chứng (sản phẩm, đường link, tài liệu) vào dự án và mời người liên quan, chẳng hạn trưởng nhóm hoặc người quản lý, xác nhận vai trò và đóng góp của bạn. Đây là cơ chế hỗ trợ tăng độ tin cậy cho hồ sơ. Không phải mọi thông tin đều được xác thực tự động, và bạn không cần xác thực tất cả dự án ngay từ đầu.' },
  { q: 'Đăng ký waitlist có mất phí không?', a: 'Đăng ký danh sách chờ hoàn toàn miễn phí. FONLIO hiện chưa công bố bảng giá hay các gói dịch vụ chính thức, và chúng mình sẽ thông báo chi tiết đến bạn khi có kế hoạch cụ thể.' },
  { q: 'Sau khi đăng ký, tôi sẽ nhận được thông tin gì?', a: 'Chúng mình sẽ gửi đến bạn những cập nhật mới nhất về chương trình Early Access cùng quyền trải nghiệm phiên bản MVP của FONLIO trong thời gian sớm nhất. Đặc biệt, 10 bạn đăng ký sớm nhất sẽ được tạo portfolio bản VIP nhất của FONLIO, cùng các phần quà từ các đơn vị hợp tác.' },
];

const CAREER_STAGES = ['Sinh viên', 'Thực tập sinh / người mới đi làm', 'Freelancer / cộng tác viên', 'Đã có kinh nghiệm chuyên môn'];
const SPECIALIZATIONS = ['Marketing / Truyền thông', 'Content / Copywriting', 'Design / Creative / Video', 'Event / Activation', 'Công nghệ / IT', 'Kinh doanh / Tài chính', 'Giáo dục / Nghiên cứu', 'Khác / đang khám phá'];
const PROJECT_COUNTS = ['Chưa có', '1–3 dự án', '4–10 dự án', 'Trên 10 dự án'];
const CHALLENGES = ['Kinh nghiệm và sản phẩm nằm rải rác', 'Không biết cách trình bày portfolio', 'Khó chứng minh vai trò và đóng góp cá nhân', 'Chưa có nhiều kinh nghiệm để bắt đầu'];
const BETA_INTERESTS = ['Muốn tham gia thử nghiệm MVP', 'Có thể tham gia, tuỳ thời gian', 'Chỉ muốn nhận cập nhật'];

const EMPTY_FORM = {
  fullName: '', email: '', careerStage: '', specialization: '',
  projectCount: '', mainChallenge: '', betaInterest: '', emailConsent: false, botField: '',
};

export function WaitlistPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [serverError, setServerError] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const successRef = useRef(null);

  useEffect(() => {
    if (status === 'done') successRef.current?.focus();
  }, [status]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: '' } : current));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Vui lòng điền họ và tên.';
    if (!form.email.trim()) next.email = 'Vui lòng điền email.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) next.email = 'Email chưa đúng định dạng.';
    if (!form.careerStage) next.careerStage = 'Chọn giúp mình một giai đoạn.';
    if (!form.emailConsent) next.emailConsent = 'Cần đồng ý nhận email thì mình mới gửi tin cho bạn được.';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`wl-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setStatus('sending');
    setServerError('');
    try {
      await joinWaitlist({ ...form, source: 'waitlist-web' });
      setStatus('done');
    } catch (err) {
      /* Giữ nguyên dữ liệu đã nhập — xoá form khi gửi hỏng là bắt người ta gõ
         lại từ đầu vì một sự cố không phải lỗi của họ. */
      setStatus('idle');
      setServerError(err?.message || 'Không gửi được đăng ký. Bạn thử lại giúp mình.');
    }
  }

  return (
    <div className="wl np-neon">
      <NeonBloom />
      <SiteHeader />

      <style>{`
        .wl {
          background-color: ${INK};
          color: ${ON_DARK};
          font-family: 'Be Vietnam Pro', 'Inter', ui-sans-serif, system-ui, sans-serif;
          letter-spacing: -0.015em;
        }
        /* Nền tài liệu phải tối theo trang: body của app là màu sáng, cuộn quá
           đà là loé ra một mảng trắng ở mép. */
        :root:has(.wl), body:has(.wl) { background: ${INK}; }

        .wl :focus-visible { outline: 2px solid ${EMERALD}; outline-offset: 3px; border-radius: 8px; }
        .wl-inner { width: min(1180px, calc(100% - 40px)); margin-inline: auto; }
        .wl-band { padding-block: clamp(64px, 9vw, 112px); }

        /* ── Chữ ──────────────────────────────────────────────────────── */

        /* Display Archivo in hoa — ĐÚNG MỘT lần trên trang. Phải khai
           font-family: index.css có luật toàn cục gán Baloo 2 cho heading. */
        .wl-display {
          font-family: 'Archivo', 'Be Vietnam Pro', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-weight: 800;
          text-transform: uppercase;
          /* Không hạ dưới 0.92: dấu của Ẫ/Ộ/Ế bị cắt ngọn. */
          line-height: 1.02;
          letter-spacing: -0.022em;
          font-size: clamp(2.6rem, 7.4vw, 5.4rem);
          color: ${ON_DARK};
          margin: 0;
        }
        .wl-display em { font-style: normal; color: ${EMERALD}; }

        .wl-title {
          font-family: inherit;
          font-size: clamp(1.75rem, 3.2vw, 2.3rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: ${ON_DARK};
          margin: 0 0 14px;
          max-width: 22ch;
        }

        .wl-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 1rem; font-weight: 500; line-height: 1.4; color: ${MUTED};
          margin-bottom: 14px;
        }
        .wl-eyebrow::before {
          content: ''; width: 8px; height: 8px; border-radius: 9999px;
          background: ${EMERALD}; flex: none;
        }

        .wl-lead { font-size: 1.125rem; line-height: 1.4; color: ${MUTED}; margin: 0 0 32px; max-width: 62ch; }
        .wl-note { font-size: 0.85rem; line-height: 1.5; color: ${MUTED}; margin: 26px 0 0; max-width: 70ch; }

        /* ── Nút ──────────────────────────────────────────────────────── */

        .wl-btn {
          display: inline-flex; align-items: center; gap: 6px; border-radius: 12px;
          padding: 16px 24px; font-size: 1.05rem; font-weight: 600; line-height: 1;
          text-decoration: none; border: 1px solid transparent; cursor: pointer;
          font-family: inherit;
          transition: background-color 150ms ease-in-out, border-color 150ms ease-in-out, transform 150ms ease;
        }
        .wl-btn-primary { background: ${EMERALD}; color: ${INK}; font-weight: 700; }
        .wl-btn-primary:hover { background: ${EMERALD_BRIGHT}; transform: translateY(-2px); }
        .wl-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .wl-btn-ghost { background: transparent; color: ${ON_DARK}; border-color: ${LINE}; }
        .wl-btn-ghost:hover { border-color: ${EMERALD}; }

        /* ── Hero ─────────────────────────────────────────────────────── */

        .wl-hero { position: relative; overflow: hidden; padding-top: clamp(124px, 12vw, 176px); padding-bottom: clamp(56px, 7vw, 92px); }
        .wl-hero-inner { position: relative; z-index: 3; text-align: center; }
        .wl-hero-sub {
          font-family: inherit;
          margin: clamp(28px, 3.4vw, 40px) auto 0; max-width: 44rem;
          font-size: 1.25rem; font-weight: 400; line-height: 1.35; color: ${ON_DARK};
        }
        .wl-hero-note { margin: 16px auto 0; max-width: 46rem; font-size: 1.05rem; line-height: 1.5; color: ${MUTED}; }
        .wl-hero-actions { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; margin-top: clamp(28px, 3.4vw, 40px); }

        .wl-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 9999px; font-weight: 600; font-size: 0.95rem;
          background: rgba(255,255,255,0.05); border: 1px solid ${LINE}; color: ${MUTED};
        }
        .wl-chip b { color: ${EMERALD}; font-weight: 700; }

        /* ── Thẻ ──────────────────────────────────────────────────────── */

        .wl-card {
          display: flex; flex-direction: column; gap: 12px; align-items: flex-start;
          padding: 22px; border-radius: 16px;
          background: ${SURFACE}; border: 1px solid ${LINE};
          transition: border-color 150ms ease-in-out, transform 150ms ease, background-color 150ms ease;
        }
        .wl-card:hover { border-color: ${EMERALD}; transform: translateY(-4px); background: ${SURFACE_HI}; }
        .wl-card h3 {
          font-family: inherit; font-size: 1.02rem; font-weight: 700; line-height: 1.35;
          letter-spacing: -0.01em; color: ${ON_DARK}; margin: 0;
        }
        .wl-card p { font-size: 1rem; line-height: 1.5; color: ${MUTED}; margin: 0; }

        .wl-card-ic {
          display: grid; place-items: center; width: 44px; height: 44px;
          border-radius: 12px; background: rgba(185,255,0,0.12); color: ${EMERALD};
        }
        .wl-card-tag { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.14em; color: ${EMERALD}; }

        .wl-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
        .wl-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
        .wl-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }

        .wl-problems { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
        .wl-problems li {
          display: flex; align-items: flex-start; gap: 18px;
          padding: 22px; border-radius: 16px;
          background: ${SURFACE}; border: 1px solid ${LINE};
          font-size: 1.05rem; line-height: 1.5; color: ${MUTED};
        }
        .wl-problems b {
          font-family: 'Archivo', sans-serif; font-variation-settings: 'wdth' 84;
          font-weight: 800; font-size: 1.05rem; color: ${EMERALD}; flex: none;
        }

        .wl-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; margin: 0; padding: 0; list-style: none; }
        .wl-step-num {
          font-family: 'Archivo', sans-serif; font-variation-settings: 'wdth' 84;
          font-weight: 800; font-size: clamp(2.2rem, 4.4vw, 3.2rem); line-height: 1;
          letter-spacing: -0.03em; color: rgba(185,255,0,0.22);
        }

        /* ── Khối đăng ký ─────────────────────────────────────────────── */

        .wl-signup { border-top: 1px solid ${LINE}; }
        .wl-signup-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 560px); gap: clamp(32px, 5vw, 72px); align-items: start; }

        .wl-perks { display: grid; gap: 12px; margin: 0 0 26px; padding: 0; list-style: none; }
        .wl-perks li { display: flex; align-items: flex-start; gap: 10px; font-size: 1.05rem; line-height: 1.5; color: ${MUTED}; }
        .wl-perks svg { color: ${EMERALD}; flex: none; margin-top: 3px; }

        .wl-top10 {
          display: flex; align-items: flex-start; gap: 16px; padding: 22px; border-radius: 16px;
          background: rgba(185,255,0,0.07); border: 1px solid rgba(185,255,0,0.28);
        }
        .wl-top10 p { margin: 0; font-size: 1rem; line-height: 1.5; color: ${MUTED}; }
        .wl-top10 span {
          flex: none; padding: 6px 13px; border-radius: 9999px;
          background: ${EMERALD}; color: ${INK}; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em;
        }

        /* ── Biểu mẫu ─────────────────────────────────────────────────── */

        .wl-form-wrap { padding: clamp(24px, 3vw, 34px); border-radius: 16px; background: ${SURFACE}; border: 1px solid ${LINE}; }
        .wl-form { display: grid; gap: 20px; }

        /* Bẫy bot: giấu khỏi mắt và trình đọc màn hình nhưng KHÔNG dùng
           display:none — vài bot bỏ qua trường bị ẩn hẳn. */
        .wl-honeypot { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

        .wl-field { display: grid; gap: 8px; }
        .wl-field > label { font-size: 0.95rem; font-weight: 600; color: ${ON_DARK}; }
        .wl-field em, .wl-req em { color: ${EMERALD}; font-style: normal; }
        .wl-field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }

        .wl input[type='text'], .wl input[type='email'], .wl select {
          width: 100%; box-sizing: border-box; padding: 15px 16px;
          border: 1px solid ${LINE}; border-radius: 12px; background: ${INK};
          color: ${ON_DARK}; font-family: inherit; font-size: 1rem; letter-spacing: -0.015em;
          outline: none; transition: border-color 150ms ease-in-out;
        }
        .wl input::placeholder { color: rgba(233,247,242,0.34); }
        .wl input:focus, .wl select:focus { border-color: ${EMERALD}; }

        .wl-select { position: relative; display: grid; }
        .wl-select select { appearance: none; padding-right: 44px; cursor: pointer; }
        .wl-select svg { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: ${MUTED}; }
        .wl-select option { background: ${SURFACE}; color: ${ON_DARK}; }

        /* Bốn lựa chọn thì bày hết ra dạng chip: người dùng thấy ngay toàn bộ
           và bấm một nhát là xong, không phải mở một danh sách thả xuống. */
        .wl-choices { display: flex; flex-wrap: wrap; gap: 10px; }
        .wl-choice {
          padding: 11px 18px; border-radius: 9999px; font-family: inherit;
          font-size: 0.95rem; font-weight: 600; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid ${LINE}; color: ${MUTED};
          transition: border-color 150ms ease-in-out, color 150ms ease-in-out, background-color 150ms ease-in-out;
        }
        .wl-choice:hover { border-color: ${EMERALD}; background: rgba(185,255,0,0.1); }
        .wl-choice.on { background: ${EMERALD}; border-color: ${EMERALD}; color: ${INK}; font-weight: 700; }

        .wl-consent { display: flex; align-items: flex-start; gap: 12px; font-size: 1rem; line-height: 1.5; color: ${MUTED}; cursor: pointer; }
        .wl-consent input { margin-top: 3px; width: 18px; height: 18px; accent-color: ${EMERALD}; flex: none; }

        .wl-field.bad input, .wl-field.bad select { border-color: #f87171; }
        .wl-err { margin: 0; font-size: 0.85rem; color: #fca5a5; }
        .wl-alert {
          margin: 0; padding: 14px 16px; border-radius: 12px;
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.38);
          color: #fca5a5; font-size: 0.95rem; line-height: 1.5;
        }
        .wl-submit { width: 100%; justify-content: center; padding: 18px; }
        .wl-req { margin: 0; font-size: 0.85rem; color: ${MUTED}; text-align: center; }

        .wl-done { display: grid; justify-items: center; gap: 14px; padding: 44px 20px; text-align: center; outline: none; }
        .wl-done-ic { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 9999px; background: ${EMERALD}; color: ${INK}; }
        .wl-done h3 { font-family: inherit; margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em; color: ${ON_DARK}; }
        .wl-done p { margin: 0; color: ${MUTED}; max-width: 40ch; line-height: 1.5; }

        /* ── FAQ ──────────────────────────────────────────────────────── */

        .wl-faq { display: grid; gap: 12px; max-width: 860px; }
        .wl-faq-item { border: 1px solid ${LINE}; border-radius: 16px; background: ${SURFACE}; overflow: hidden; transition: border-color 150ms ease-in-out; }
        .wl-faq-item.open { border-color: ${EMERALD}; }
        .wl-faq-item button {
          display: flex; align-items: center; justify-content: space-between; gap: 18px;
          width: 100%; padding: 20px 22px; border: 0; background: transparent;
          color: ${ON_DARK}; font-family: inherit; font-size: 1.02rem; font-weight: 700;
          letter-spacing: -0.01em; text-align: left; cursor: pointer;
        }
        .wl-faq-item svg { flex: none; color: ${EMERALD}; transition: transform 200ms ease; }
        .wl-faq-item.open svg { transform: rotate(180deg); }
        .wl-faq-item p { margin: 0; padding: 0 22px 22px; font-size: 1rem; line-height: 1.55; color: ${MUTED}; }

        /* ── Màn hẹp ──────────────────────────────────────────────────── */

        @media (max-width: 1024px) {
          .wl-signup-grid { grid-template-columns: minmax(0, 1fr); }
          .wl-grid-3, .wl-grid-4, .wl-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .wl-grid-3, .wl-grid-2, .wl-grid-4, .wl-steps, .wl-field-row { grid-template-columns: minmax(0, 1fr); }
          .wl-title { max-width: none; }
          .wl-hero-actions .wl-btn { flex: 1 1 100%; justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wl-btn, .wl-card, .wl-faq-item svg { transition: none; }
          .wl-btn-primary:hover, .wl-card:hover { transform: none; }
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="wl-hero">
        <HeroMesh />
        <div className="wl-inner wl-hero-inner">
          <span className="wl-chip"><b>Early Access</b> · Top 10 đăng ký sớm nhận ưu đãi đặc biệt</span>
          <h1 className="wl-display" style={{ marginTop: 'clamp(22px, 2.6vw, 32px)' }}>
            Foundation of<br /><em>your next</em><br />journey
          </h1>
          <p className="wl-hero-sub">Đừng chỉ kể bạn đã làm gì. Hãy cho thấy bạn đã tạo ra điều gì.</p>
          <p className="wl-hero-note">
            FONLIO giúp bạn xây dựng portfolio, lưu trữ dự án và từng bước xác thực những
            trải nghiệm thực tế đa ngành.
          </p>
          <div className="wl-hero-actions">
            <a className="wl-btn wl-btn-primary" href="#dang-ky">Tham gia danh sách chờ <ArrowRight size={18} /></a>
            <a className="wl-btn wl-btn-ghost" href="#ve-fonlio">Khám phá FONLIO</a>
          </div>
        </div>
      </section>

      {/* ── Về FONLIO ────────────────────────────────────────────────── */}
      <section className="wl-band" id="ve-fonlio">
        <div className="wl-inner">
          <span className="wl-eyebrow">Về FONLIO</span>
          <h2 className="wl-title">Bạn đã làm nhiều hơn những gì CV có thể kể.</h2>
          <p className="wl-lead">
            Mình hiểu cảm giác đó: làm nhiều thứ hay ho nhưng khi cần trình bày thì không biết
            bắt đầu từ đâu. FONLIO sinh ra để giải quyết đúng chuyện này.
          </p>
          <ol className="wl-problems">
            {PROBLEMS.map((text, i) => (
              <li key={text}><b>{String(i + 1).padStart(2, '0')}</b>{text}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Giá trị ──────────────────────────────────────────────────── */}
      <section className="wl-band" id="gia-tri">
        <div className="wl-inner">
          <span className="wl-eyebrow">Giá trị cốt lõi</span>
          <h2 className="wl-title">Ba việc FONLIO giúp bạn: Create, Organize, Verify.</h2>
          <div className="wl-grid-3" style={{ marginTop: 34 }}>
            {VALUES.map(({ tag, icon, title, body }) => (
              <article className="wl-card" key={tag}>
                <span className="wl-card-ic">{icon}</span>
                <span className="wl-card-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <p className="wl-note">
            Xác thực là bước bạn chủ động thực hiện cùng người xác nhận phù hợp.
            Không phải mọi thông tin trên FONLIO đều được xác thực tự động.
          </p>
        </div>
      </section>

      {/* ── Cách hoạt động ───────────────────────────────────────────── */}
      <section className="wl-band" id="cach-hoat-dong">
        <div className="wl-inner">
          <span className="wl-eyebrow">Cách hoạt động</span>
          <h2 className="wl-title">Bốn bước từ trải nghiệm đến portfolio có bằng chứng.</h2>
          <p className="wl-lead">
            Bạn có thể bắt đầu với một portfolio cơ bản ngay, không cần xác thực tất cả dự án
            từ đầu. Cứ làm từng bước theo nhịp của bạn.
          </p>
          <ol className="wl-steps">
            {STEPS.map((step, i) => (
              <li className="wl-card" key={step.title}>
                <span className="wl-step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Dành cho ai ──────────────────────────────────────────────── */}
      <section className="wl-band">
        <div className="wl-inner">
          <span className="wl-eyebrow">Dành cho ai</span>
          <h2 className="wl-title">FONLIO đồng hành cùng mọi giai đoạn của bạn.</h2>
          <div className="wl-grid-2" style={{ marginTop: 34 }}>
            {AUDIENCES.map((a) => (
              <article className="wl-card" key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Đăng ký ──────────────────────────────────────────────────── */}
      <section className="wl-band wl-signup" id="dang-ky">
        <div className="wl-inner wl-signup-grid">
          <div>
            <span className="wl-eyebrow">Early Access</span>
            <h2 className="wl-title">Bắt đầu xây dựng câu chuyện nghề nghiệp của bạn.</h2>
            <p className="wl-lead" style={{ marginBottom: 26 }}>
              Đăng ký danh sách chờ để nhận thông tin và cơ hội trải nghiệm FONLIO MVP sớm.
            </p>
            <ul className="wl-perks">
              <li><BadgeCheck size={18} /> Chỉ mất khoảng 1 phút để điền</li>
              <li><BadgeCheck size={18} /> Chỉ cần họ tên và email, các câu còn lại giúp mình hiểu bạn hơn</li>
              <li><BadgeCheck size={18} /> Không cần có sẵn portfolio</li>
            </ul>
            <div className="wl-top10">
              <span>TOP 10</span>
              <p>
                10 bạn đăng ký sớm nhất sẽ được tạo portfolio bản VIP nhất của FONLIO,
                cùng các phần quà từ các đơn vị hợp tác.
              </p>
            </div>
          </div>

          <div className="wl-form-wrap">
            {status === 'done' ? (
              <div className="wl-done" ref={successRef} tabIndex={-1}>
                <span className="wl-done-ic"><BadgeCheck size={30} /></span>
                <h3>Bạn đã có tên trong danh sách chờ FONLIO!</h3>
                <p>Cảm ơn bạn đã quan tâm. Thông tin đăng ký của bạn đã được tiếp nhận.</p>
              </div>
            ) : (
              <form className="wl-form" onSubmit={handleSubmit} noValidate>
                <div className="wl-honeypot" aria-hidden="true">
                  <label htmlFor="wl-botField">Đừng điền ô này</label>
                  <input id="wl-botField" type="text" tabIndex={-1} autoComplete="off"
                    value={form.botField} onChange={(e) => update('botField', e.target.value)} />
                </div>

                {serverError && <p className="wl-alert" role="alert">{serverError}</p>}

                <Field id="wl-fullName" label="Họ và tên" required error={errors.fullName}>
                  <input id="wl-fullName" type="text" autoComplete="name" placeholder="Ví dụ: Nguyễn Hà Trâm"
                    value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </Field>

                <Field id="wl-email" label="Email" required error={errors.email}>
                  <input id="wl-email" type="email" autoComplete="email" placeholder="ban@example.com"
                    value={form.email} onChange={(e) => update('email', e.target.value)} />
                </Field>

                <Field id="wl-careerStage" label="Bạn đang ở giai đoạn nào?" required error={errors.careerStage}>
                  <div className="wl-choices" id="wl-careerStage" role="radiogroup" aria-label="Giai đoạn">
                    {CAREER_STAGES.map((stage) => (
                      <button type="button" key={stage} role="radio"
                        aria-checked={form.careerStage === stage}
                        className={`wl-choice${form.careerStage === stage ? ' on' : ''}`}
                        onClick={() => update('careerStage', stage)}>
                        {stage}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="wl-field-row">
                  <Field id="wl-specialization" label="Lĩnh vực chuyên môn">
                    <Select id="wl-specialization" value={form.specialization} placeholder="Chọn lĩnh vực"
                      options={SPECIALIZATIONS} onChange={(v) => update('specialization', v)} />
                  </Field>
                  <Field id="wl-projectCount" label="Số dự án đã có">
                    <Select id="wl-projectCount" value={form.projectCount} placeholder="Chọn số lượng"
                      options={PROJECT_COUNTS} onChange={(v) => update('projectCount', v)} />
                  </Field>
                </div>

                <Field id="wl-mainChallenge" label="Khó khăn lớn nhất của bạn hiện nay">
                  <Select id="wl-mainChallenge" value={form.mainChallenge} placeholder="Chọn khó khăn"
                    options={CHALLENGES} onChange={(v) => update('mainChallenge', v)} />
                </Field>

                <Field id="wl-betaInterest" label="Bạn muốn tham gia thử nghiệm ở mức nào?">
                  <Select id="wl-betaInterest" value={form.betaInterest} placeholder="Chọn mức độ"
                    options={BETA_INTERESTS} onChange={(v) => update('betaInterest', v)} />
                </Field>

                <div className={`wl-field${errors.emailConsent ? ' bad' : ''}`}>
                  <label className="wl-consent" htmlFor="wl-emailConsent">
                    <input id="wl-emailConsent" type="checkbox" checked={form.emailConsent}
                      onChange={(e) => update('emailConsent', e.target.checked)} />
                    <span>Mình đồng ý nhận email liên quan đến Early Access và cập nhật về FONLIO.<em> *</em></span>
                  </label>
                  {errors.emailConsent && <p className="wl-err">{errors.emailConsent}</p>}
                </div>

                <button type="submit" className="wl-btn wl-btn-primary wl-submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Đang gửi…' : 'Đăng ký Early Access'}
                </button>
                <p className="wl-req">Mục có dấu <em>*</em> là bắt buộc.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="wl-band" id="faq">
        <div className="wl-inner">
          <span className="wl-eyebrow">FAQ</span>
          <h2 className="wl-title">Những câu bạn có thể đang thắc mắc.</h2>
          <div className="wl-faq" style={{ marginTop: 30 }}>
            {FAQS.map((item, i) => (
              <div className={`wl-faq-item${openFaq === i ? ' open' : ''}`} key={item.q}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} />
                </button>
                {openFaq === i && <p>{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({ id, label, required, error, children }) {
  return (
    <div className={`wl-field${error ? ' bad' : ''}`}>
      <label htmlFor={id}>{label}{required && <em> *</em>}</label>
      {children}
      {error && <p className="wl-err">{error}</p>}
    </div>
  );
}

/* <select> gốc thay vì dropdown tự dựng: trên điện thoại nó mở bộ chọn của hệ
   điều hành, dễ dùng hơn bất cứ thứ gì dựng lại bằng div. */
function Select({ id, value, placeholder, options, onChange }) {
  return (
    <div className="wl-select">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={16} aria-hidden="true" />
    </div>
  );
}
