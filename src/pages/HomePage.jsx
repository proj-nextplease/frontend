import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUp, ArrowUpRight, Search } from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { PartnerLogos } from '../components/PartnerLogos.jsx';
import { loadJobs } from '../api/jobsCache.js';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';

/* ──────────────────────────────────────────────────────────────────────────
   Trang chủ nextplease — nền tối, một màu nhấn emerald.

   Nhịp trang (dựng theo số đo lấy trực tiếp từ joinhandshake.com): hero là
   tiêu đề display + một dòng số liệu + ô tìm việc khổng lồ + chip gợi ý, đặt
   trên một tấm nền mesh gồm nhiều quầng sáng bị blur mạnh. Ngay dưới là LƯỚI
   6 thẻ việc làm thật (3 cột × 2 hàng, không phải hàng cuộn ngang) — người
   xem thấy nội dung có thật trước khi nghe bất kỳ lời hứa nào. Sau đó mới tới
   logo nhà tuyển dụng, ba cột giá trị, số liệu, cảm nhận và CTA.

   Quy ước màu: chỉ EMERALD là màu tương tác. Không gradient trang trí, không
   shadow màu — độ sâu đến từ nền đậm/nhạt xen kẽ và viền hairline.
   ────────────────────────────────────────────────────────────────────────── */

const INK = '#0b0f0e';          // nền tối chủ đạo
const INK_SOFT = '#121817';     // band tối nhạt hơn một bậc
const EMERALD = '#10b981';      // màu nhấn duy nhất
const ON_DARK = '#ffffff';
const MUTED_DARK = 'rgba(233,247,242,0.62)';
const LINE_DARK = 'rgba(255,255,255,0.12)';
const SNOW = '#ffffff';
const INK_LIGHT = '#0f2e2b';    // chữ trên nền sáng

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };
const BAND = (extra = {}) => ({ ...INNER, padding: 'clamp(64px, 9vw, 112px) 20px', ...extra });

/* Gợi ý tìm kiếm dưới ô search — bấm là nhảy thẳng sang /jobs với từ khoá. */
const SEARCH_CHIPS = ['Thực tập sinh', 'Part-time', 'Remote', 'Fresher', 'Quest từ CLB'];

/* Câu gợi ý chạy trong ô tìm việc. Đây KHÔNG phải placeholder: trang mẫu phủ
   một lớp chữ riêng lên ô input, mỗi ký tự là một <span> có opacity riêng sáng
   dần lên — nên nó mượt hơn kiểu cắt chuỗi và không cần con trỏ nhấp nháy.
   Viết như câu người ta thật sự gõ, đừng viết như tên chuyên mục. */
const SEARCH_HINTS = [
  'Thực tập Marketing tại TP.HCM cho sinh viên năm 3',
  'Việc part-time remote không cần kinh nghiệm',
  'Quest từ CLB để lấy proof đầu tiên',
  'Cộng tác viên thiết kế, nhận việc theo dự án',
];
const HINT_CHAR_MS = 55;    // mỗi ký tự sáng lên cách nhau bao lâu
const HINT_HOLD_MS = 2200;  // gõ xong thì giữ nguyên câu bao lâu
const HINT_FADE_MS = 450;   // cả câu mờ đi trước khi đổi câu kế

/* Thẻ việc làm mẫu — chỉ hiện khi API chưa trả về, để lưới không rỗng.
   Đúng 6 cái, khớp với lưới 3 cột × 2 hàng của trang mẫu. */
const FALLBACK_JOBS = [
  { id: null, title: 'Thực tập Marketing', pay: 'Tới 5 triệu/tháng', payKnown: true, type: 'Thực tập', where: 'TP.HCM' },
  { id: null, title: 'Cộng tác viên Content', pay: 'Tới 300k/bài', payKnown: true, type: 'Part-time', where: 'Remote' },
  { id: null, title: 'Frontend Intern', pay: 'Tới 8 triệu/tháng', payKnown: true, type: 'Thực tập', where: 'TP.HCM' },
  { id: null, title: 'Hỗ trợ sự kiện CLB', pay: 'Proof & điểm uy tín', payKnown: false, type: 'Quest', where: 'Hà Nội' },
  { id: null, title: 'Data Entry Part-time', pay: 'Tới 35k/giờ', payKnown: true, type: 'Part-time', where: 'Remote' },
  { id: null, title: 'Trợ lý Kinh doanh', pay: 'Tới 7 triệu/tháng', payKnown: true, type: 'Full-time', where: 'Đà Nẵng' },
];

/* Ba bước của quy trình thật, viết bằng đúng từ vựng sản phẩm.
   Bản trước là ba "giá trị" chung chung kèm ảnh giả lập giao diện có số liệu
   bịa (khớp 92%, doanh nghiệp xác nhận…) — trông thì lung linh nhưng nói
   những thứ hệ thống chưa làm được, và người đọc nhận ra ngay. Ở đây mỗi bước
   chỉ mô tả một việc có thật, và ô hình là một khối chữ chứ không giả vờ làm
   ảnh chụp màn hình. */
const STEPS = [
  {
    step: '01',
    keyword: 'Hồ sơ',
    title: 'Dựng hồ sơ một lần',
    body: 'Khai những gì bạn đang có: kỹ năng, dự án môn học, hoạt động ở CLB. Không cần kinh nghiệm đi làm, không cần ai giới thiệu.',
    tags: ['Kỹ năng', 'Dự án', 'Hoạt động'],
    // Lối đăng ký đang được ẩn, nên nút này dẫn sang trang giới thiệu portfolio
    // thay vì /candidate/register. Khi mở lại đăng ký thì đổi ở đúng một chỗ này.
    cta: 'Xem cách dựng hồ sơ',
    href: '/tao-portfolio',
  },
  {
    step: '02',
    keyword: 'Proof',
    title: 'Làm thật, có người xác nhận',
    body: 'Nhận quest từ CLB hoặc doanh nghiệp. Làm xong thì bên giao việc xác nhận, và phần xác nhận đó gắn vào hồ sơ — bạn không tự chấm điểm mình.',
    tags: ['Quest', 'Dự án', 'Thực tập'],
    cta: 'Xem quest đang mở',
    href: '/jobs',
  },
  {
    step: '03',
    keyword: 'Cơ hội',
    title: 'Ứng tuyển bằng bằng chứng',
    body: 'Nộp hồ sơ kèm những proof đã được xác nhận. Nhà tuyển dụng đọc bằng chứng công việc thay vì đọc một dòng bạn tự khai.',
    tags: ['Việc làm', 'Thực tập', 'Part-time'],
    cta: 'Xem cơ hội',
    href: '/jobs',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Chúng tôi lọc ứng viên trẻ dựa trên bằng chứng công việc thật thay vì CV tự khai.',
    name: 'Hiring Partner',
    role: 'Doanh nghiệp tuyển dụng',
  },
  {
    quote: 'Sinh viên nhìn thấy lộ trình rõ ràng: proof, level, quest rồi tới cơ hội tiếp theo.',
    name: 'Campus Organizer',
    role: 'CLB / Tổ chức',
  },
  {
    quote: 'Một hồ sơ duy nhất, đi đâu cũng được công nhận. Mình thấy nỗ lực được ghi nhận.',
    name: 'phat280405',
    role: 'Ứng viên · FPTU HCM',
  },
];

/* Ô hình của mỗi bước.
   Không có kho ảnh nào dùng được (ảnh trong repo là screenshot sản phẩm khác),
   và dựng ảnh giao diện giả thì vừa xấu vừa nói sai về sản phẩm. Nên ô này là
   một khối chữ: nhãn bước, một từ khoá cỡ lớn bằng font display, và mấy chip
   từ vựng có thật. Không con số nào ở đây cả — không có gì để bịa. */
function StepPanel({ step, keyword, tags }) {
  return (
    <div className="np-step-panel">
      <span className="np-step-label">Bước {step}</span>
      <span className="np-step-keyword">{keyword}</span>
      <span className="np-step-tags">
        {tags.map((tag) => <span key={tag}>{tag}</span>)}
      </span>
      {/* Số bước khổng lồ chìm dưới nền, cắt bớt ở mép — chất liệu thị giác. */}
      <span className="np-step-ghost" aria-hidden="true">{step}</span>
    </div>
  );
}

/* Tiêu đề của MỌI section dưới hero.
   Trang mẫu chỉ dùng font display in hoa cho đúng một chỗ: H1 của hero. Từ
   section thứ hai trở xuống, tiêu đề quay về font body ở 32px, weight 400 và
   viết thường — chính sự kiềm chế đó khiến cái H1 khổng lồ kia có sức nặng.
   Dùng Display cho mọi tiêu đề thì cả trang hét lên và không còn điểm nhấn. */
function SectionTitle({ children, align = 'left', style }) {
  return (
    <h2 className="np-section-title" style={{ textAlign: align, ...style }}>
      {children}
    </h2>
  );
}

/* Headline display: Archivo ở độ rộng nén + in hoa + letter-spacing âm.
   CHỈ dùng cho H1 của hero — xem ghi chú ở SectionTitle. */
function Display({ children, size = 'clamp(2.4rem, 6.2vw, 4.6rem)', color = ON_DARK, align = 'left', style }) {
  return (
    <h2 className="np-display" style={{ fontSize: size, color, textAlign: align, ...style }}>
      {children}
    </h2>
  );
}

function Reveal({ children, delay = 0, y = 26, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setShown(true); },
      { threshold: 0.12 },
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
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Rút gọn job thô của BE về đúng ba thông tin thẻ rail cần. */
/* BE trả loại hình dưới dạng enum thô (INTERNSHIP, MICRO_INTERNSHIP,
   EVENT_STAFF…). Đổ thẳng lên giao diện thì thẻ hiện "MICRO_INTERNSHIP" —
   vừa xấu vừa không ai đọc. Bảng này dịch sang nhãn người đọc được; enum lạ
   thì rơi về cách chuyển chung ở dưới thay vì hiện nguyên xi. */
const JOB_TYPE_LABELS = {
  INTERNSHIP: 'Thực tập',
  MICRO_INTERNSHIP: 'Thực tập ngắn hạn',
  PART_TIME: 'Part-time',
  FULL_TIME: 'Toàn thời gian',
  FREELANCE: 'Freelance',
  EVENT_STAFF: 'Nhân sự sự kiện',
  CONTRACT: 'Theo hợp đồng',
  VOLUNTEER: 'Tình nguyện',
  QUEST: 'Quest',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'Tại văn phòng',
};

function jobTypeLabel(rawType, isClub) {
  if (!rawType) return isClub ? 'Quest' : 'Cơ hội';
  const key = String(rawType).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (JOB_TYPE_LABELS[key]) return JOB_TYPE_LABELS[key];
  // Enum chưa biết: bỏ gạch dưới, viết hoa chữ đầu — vẫn hơn là hét chữ in hoa.
  const words = key.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function toRailJob(raw) {
  const pay = raw.salaryText
    || (Number(raw.salaryMax) ? `Tới ${Math.round(Number(raw.salaryMax) / 1e6)} triệu/tháng` : null)
    || (Number(raw.salaryMin) ? `Từ ${Math.round(Number(raw.salaryMin) / 1e6)} triệu/tháng` : null);
  /* Loại hình tách hẳn thành chip riêng thay vì nhét vào ngoặc sau địa điểm —
     đây là thứ duy nhất khác nhau rõ giữa các thẻ, nên nó xứng đáng có chỗ. */
  const isClub = raw.companyType === 'CLUB' || raw.organizationType === 'CLUB';
  const type = jobTypeLabel(raw.jobType || raw.employmentType || raw.workForm || raw.workType, isClub);
  return {
    id: raw.id ?? raw.jobId ?? null,
    title: raw.title || 'Chưa đặt tên',
    pay: pay || 'Proof & điểm uy tín',
    payKnown: Boolean(pay),
    type,
    where: raw.location || 'Không xác định',
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState(null);

  /* Trạng thái câu gợi ý: đang ở câu nào, đã sáng bao nhiêu ký tự, và có đang
     mờ dần để nhường chỗ cho câu kế không. Khi tắt hiệu ứng chuyển động thì
     hiện sẵn trọn câu đầu tiên chứ không để ô trống. */
  const [hint, setHint] = useState(() => ({
    phrase: 0,
    shown: prefersReducedMotion() ? [...SEARCH_HINTS[0]].length : 0,
    fading: false,
  }));

  /* Nạp danh sách việc làm cho hàng rail; cache dùng chung với trang /jobs nên
     lần bấm "Xem tất cả" sau đó hiện ngay lập tức. */
  useEffect(() => {
    let alive = true;
    loadJobs()
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data.slice(0, 6).map(toRailJob) : [];
        setJobs(list.length ? list : FALLBACK_JOBS);
      })
      .catch(() => { if (alive) setJobs(FALLBACK_JOBS); });
    return () => { alive = false; };
  }, []);

  const rail = useMemo(() => jobs ?? FALLBACK_JOBS, [jobs]);

  /* Gõ → giữ → mờ cả câu → đổi câu, lặp vô hạn. Người dùng vừa gõ chữ đầu tiên
     là dừng hẳn (trang mẫu gỡ luôn lớp chữ này khỏi DOM khi ô có nội dung). */
  useEffect(() => {
    if (query || prefersReducedMotion()) return undefined;

    let phrase = 0;
    let shown = 0;
    let timer;

    function step() {
      const length = [...SEARCH_HINTS[phrase]].length;
      if (shown < length) {
        shown += 1;
        setHint({ phrase, shown, fading: false });
        timer = setTimeout(step, HINT_CHAR_MS);
        return;
      }
      timer = setTimeout(() => {
        setHint({ phrase, shown, fading: true });
        timer = setTimeout(() => {
          phrase = (phrase + 1) % SEARCH_HINTS.length;
          shown = 0;
          setHint({ phrase, shown: 0, fading: false });
          timer = setTimeout(step, 140);
        }, HINT_FADE_MS);
      }, HINT_HOLD_MS);
    }

    timer = setTimeout(step, 500);
    return () => clearTimeout(timer);
  }, [query]);

  function submitSearch(event) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/jobs?q=${encodeURIComponent(q)}` : '/jobs');
  }

  return (
    <div className="np-home">
      <style>{`
        .np-home {
          background: ${INK};
          color: ${ON_DARK};
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-top: -34px;
          overflow-x: clip;
          font-family: 'Be Vietnam Pro', 'Inter', sans-serif;
        }
        .np-home :focus-visible { outline: 2px solid ${EMERALD}; outline-offset: 3px; border-radius: 8px; }

        /* ── Headline display ──
           Archivo là variable font có wdth, nên nén được như font condensed mà
           vẫn đủ dấu tiếng Việt. Ẫ/Ộ vẫn hiện trọn dấu nhờ line-height 0.92 —
           Handshake để 0.8 nhưng bảng chữ của họ không có dấu. */
        .np-display {
          font-family: 'Archivo', 'Be Vietnam Pro', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-weight: 800;
          text-transform: uppercase;
          line-height: 0.92;
          letter-spacing: -0.022em;
          margin: 0;
        }

        /* Tiêu đề section: 32px, weight 400, viết thường — KHÔNG phải display
           in hoa. Đây là quy tắc quan trọng nhất của trang mẫu. */
        .np-section-title {
          /* index.css gán 'Baloo 2' cho mọi h1-h3 nên phải khai báo lại. */
          font-family: inherit;
          font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 400; line-height: 1.1;
          letter-spacing: -0.025em; color: ${ON_DARK}; margin: 0;
        }
        .np-lead { font-size: 1.125rem; line-height: 1.4; letter-spacing: -0.015em; color: ${MUTED_DARK}; margin: 24px 0 0; max-width: 40rem; }

        /* ── Hero ── Nền mesh nằm trong <HeroMesh />, dùng chung với /jobs. */
        .np-hero { position: relative; overflow: hidden; padding-top: clamp(124px, 12vw, 176px); }
        .np-hero-inner { position: relative; z-index: 3; text-align: center; }

        /* Dòng số liệu dưới tiêu đề — 20px, mảnh, không phải đoạn văn dài. */
        .np-hero-sub {
          font-family: inherit;
          margin: clamp(28px, 3.4vw, 40px) auto 0; max-width: 44rem;
          font-size: 1.25rem; font-weight: 400; line-height: 1.35; color: ${ON_DARK};
        }

        /* ── Ô tìm việc ──
           Số đo trang mẫu: cao 88px, rộng tối đa 920px, bo 24px; đệm trái 64px
           chừa cho kính lúp 32px, đệm phải 80px chừa cho nút 56px. */
        .np-search {
          position: relative; margin: clamp(28px, 3.4vw, 40px) auto 0;
          height: 88px; max-width: 920px; text-align: left;
        }
        .np-search input {
          box-sizing: border-box; width: 100%; height: 100%;
          border: 0; outline: 0; border-radius: 24px; background: ${SNOW};
          padding: 0 80px 0 64px;
          font-family: inherit; font-size: 1.25rem; letter-spacing: -0.3px; color: #252630;
        }
        /* Lớp phủ nằm trùng khít ô input; đệm 16px khớp với đệm trái 64px của
           input (16 đệm + 32 icon + 16 khoảng cách) nên chữ gợi ý rơi đúng chỗ
           con trỏ sẽ xuất hiện. */
        .np-search-overlay {
          position: absolute; inset: 0; display: flex; align-items: center; gap: 16px;
          padding: 16px; pointer-events: none; color: #252630;
        }
        .np-search-icon { flex: none; }
        /* Mỗi ký tự sáng lên riêng; cả câu có thêm một lớp mờ chung để chuyển
           sang câu kế. Hai transition khác thời lượng nên lúc đổi câu không bị
           giật: chữ tắt đồng loạt, rồi câu mới sáng từng ký tự. */
        .np-search-hint {
          min-width: 0; overflow: hidden; white-space: pre;
          font-size: 1.25rem; line-height: 1.4; letter-spacing: -0.3px; color: rgba(0,0,0,0.6);
          transition: opacity ${HINT_FADE_MS}ms ease-out;
        }
        .np-search-hint span { transition: opacity 260ms ease-out; }
        .np-search button {
          position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
          display: inline-flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: 12px; border: 0; cursor: pointer;
          background: rgba(37,38,48,0.10); color: #252630;
          transition: background-color 150ms ease-out;
        }
        .np-search button:hover { background: rgba(37,38,48,0.18); }

        /* Dưới 1280px ô tìm việc cao lên thành khối, nút xuống góc dưới-phải —
           giống hệt biến thể mobile của trang mẫu (h-38, đệm 24px). */
        @media (max-width: 1279px) {
          .np-search { height: 152px; }
          .np-search input { padding: 0 24px 64px; border-radius: 24px; }
          .np-search-icon { display: none; }
          .np-search-overlay { align-items: flex-start; padding: 24px 24px 64px; }
          .np-search-hint { white-space: pre-wrap; }
          .np-search button { top: auto; bottom: 24px; right: 24px; transform: none; }
        }

        /* ── Chip gợi ý ──
           Bo 8px (không phải viên thuốc), viền trắng 20%, đệm 16px, chữ 16px. */
        .np-chips { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 24px; }
        .np-chip {
          border: 1px solid rgba(255,255,255,0.2); background: transparent; color: ${ON_DARK};
          border-radius: 8px; padding: 16px; font: inherit; font-size: 1rem; font-weight: 400; line-height: 1;
          cursor: pointer; transition: background-color 150ms ease-out;
        }
        .np-chip:hover { background-color: rgba(255,255,255,0.1); }

        /* ── Lưới thẻ việc làm ──
           Trang mẫu KHÔNG cuộn ngang: 3 cột × 2 hàng, cách nhau 16px, mỗi thẻ
           cao 182px, viền trắng 10%, đệm 40px, không nền, hover sáng lên. */
        .np-jobgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 80px; }
        .np-jobcard {
          position: relative; overflow: hidden; box-sizing: border-box;
          display: flex; flex-direction: column; align-items: flex-start;
          /* Cao cố định để mọi thẻ khít nhau tuyệt đối. Chỉ dùng được vì khối
             tiêu đề bên dưới cũng đã khoá đúng 2 dòng — nếu để tiêu đề tự co
             thì thẻ 1 dòng và thẻ 2 dòng sẽ lệch nhau như bản trước. */
          height: 216px; padding: 28px 30px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.016);
          color: ${ON_DARK}; text-align: left; text-decoration: none;
          transition: border-color 260ms ease, background-color 260ms ease, transform 320ms cubic-bezier(0.22,1,0.36,1);
        }
        /* Vệt sáng 1px chạy dọc mép trên — thứ làm một thẻ phẳng trên nền tối
           trông như có bề mặt thật. Sáng hẳn lên khi hover. */
        .np-jobcard::before {
          content: ''; position: absolute; inset: 0 0 auto; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          opacity: 0.5; transition: opacity 260ms ease;
        }
        /* Quầng sáng emerald toả từ góc dưới-phải, chỉ hiện khi hover. */
        .np-jobcard::after {
          content: ''; position: absolute; right: -40%; bottom: -60%; width: 90%; height: 150%;
          background: radial-gradient(closest-side, rgba(16,185,129,0.22), rgba(16,185,129,0) 70%);
          opacity: 0; transition: opacity 320ms ease; pointer-events: none;
        }
        .np-jobcard:hover {
          border-color: rgba(16,185,129,0.55); background-color: rgba(255,255,255,0.05);
          transform: translateY(-4px);
        }
        .np-jobcard:hover::before { opacity: 1; }
        .np-jobcard:hover::after { opacity: 1; }

        .np-jobcard > * { position: relative; z-index: 1; }

        .np-jobcard-index {
          position: absolute; top: 22px; right: 26px; z-index: 0;
          font-family: 'Archivo', inherit; font-variation-settings: 'wdth' 84;
          font-size: 2.6rem; font-weight: 800; line-height: 1; letter-spacing: -0.03em;
          color: rgba(255,255,255,0.07); transition: color 320ms ease;
        }
        .np-jobcard:hover .np-jobcard-index { color: rgba(16,185,129,0.22); }

        .np-jobcard-type {
          display: inline-block; margin-bottom: 18px; padding: 5px 11px;
          border-radius: 9999px; border: 1px solid rgba(255,255,255,0.16);
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.01em; text-transform: none;
          color: rgba(255,255,255,0.82); white-space: nowrap;
          transition: border-color 260ms ease, color 260ms ease;
        }
        .np-jobcard:hover .np-jobcard-type { border-color: rgba(16,185,129,0.5); color: ${EMERALD}; }

        .np-jobcard-title {
          margin: 0; font-size: 1.25rem; line-height: 1.3; letter-spacing: -0.3px; font-weight: 400;
          /* Luôn chiếm đúng 2 dòng: tên ngắn thì chừa chỗ trống, tên dài thì cắt.
             Nhờ vậy chân thẻ của cả sáu cái nằm trên cùng một đường. */
          height: 2.6em;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        /* Đẩy chân thẻ xuống đáy — đây là chỗ bố cục cũ bị vỡ. */
        .np-jobcard-foot { margin-top: auto; padding-top: 20px; display: flex; flex-direction: column; gap: 3px; }
        .np-jobcard-pay { font-size: 0.95rem; letter-spacing: -0.015em; color: rgba(255,255,255,0.45); }
        /* Có mức thù lao thật thì cho lên màu nhấn; không có thì để mờ. Nhờ vậy
           hàng thẻ có nhịp sáng-tối thay vì sáu dòng xám y hệt nhau. */
        .np-jobcard-pay.is-known { color: ${EMERALD}; font-weight: 500; }
        .np-jobcard-where { font-size: 0.85rem; letter-spacing: -0.015em; color: rgba(255,255,255,0.45); }

        .np-jobcard-arrow {
          position: absolute; right: 26px; bottom: 26px; z-index: 1;
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 9999px;
          background: ${EMERALD}; color: ${INK};
          opacity: 0; transform: translate(6px, 6px) scale(0.8);
          transition: opacity 280ms ease, transform 320ms cubic-bezier(0.22,1,0.36,1);
        }
        .np-jobcard:hover .np-jobcard-arrow { opacity: 1; transform: none; }
        /* Thẻ tĩnh (chưa có API nên chưa có link) thì không hứa hẹn gì cả. */
        div.np-jobcard { cursor: default; }
        div.np-jobcard .np-jobcard-arrow { display: none; }

        @media (max-width: 1023px) { .np-jobgrid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 639px) { .np-jobgrid { grid-template-columns: 1fr; } .np-jobcard { height: 200px; padding: 24px 26px; } .np-jobcard-index { font-size: 2.1rem; } }

        /* ── Nút ── */
        .np-btn {
          display: inline-flex; align-items: center; gap: 4px; border-radius: 8px;
          padding: 16px 20px; font-size: 1.125rem; font-weight: 500; line-height: 1;
          text-decoration: none; border: 1px solid transparent; cursor: pointer; font-family: inherit;
          transition: background-color 150ms ease-in-out, border-color 150ms ease-in-out;
        }
        .np-btn-primary { background: ${EMERALD}; color: ${INK}; }
        .np-btn-primary:hover { background: #34d399; }
        .np-btn-ghost { background: transparent; color: ${ON_DARK}; border-color: ${LINE_DARK}; }
        .np-btn-ghost:hover { border-color: ${EMERALD}; }
        .np-btn-onlight { background: ${INK}; color: ${ON_DARK}; }

        .np-textlink {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 18px;
          color: ${EMERALD}; font-weight: 700; font-size: 0.93rem; text-decoration: none;
        }
        .np-textlink:hover { text-decoration: underline; text-underline-offset: 4px; }

        /* ── Ba hàng ảnh/chữ so le ──
           Hàng chẵn ảnh bên trái, hàng lẻ đảo chiều; cách nhau 200px như trang
           mẫu — khoảng trống lớn chính là thứ tạo nhịp, thay cho việc đổi nền. */
        .np-features { display: flex; flex-direction: column; gap: clamp(80px, 10vw, 200px); margin-top: 80px; }
        .np-feature { display: flex; align-items: center; justify-content: space-between; gap: clamp(32px, 5vw, 80px); }
        .np-feature-flip { flex-direction: row-reverse; }
        .np-feature-media {
          flex: none; width: 688px; max-width: 100%; height: 388px; border-radius: 32px; overflow: hidden;
          /* Nền on-brand đứng sẵn sau ảnh: khi chưa có ảnh thật thì ô vẫn là
             một mảng emerald có chiều sâu chứ không phải khung rỗng. */
          background:
            radial-gradient(120% 120% at 18% 12%, rgba(103,232,249,0.34) 0%, rgba(16,185,129,0.1) 46%, rgba(0,0,0,0) 72%),
            linear-gradient(152deg, #14211f 0%, #0d1614 100%);
          border: 1px solid ${LINE_DARK};
        }
        /* Reveal bọc ngoài ô hình cũng phải không co — nếu để nó co thì
           max-width:100% của ô hình bám theo và ô tụt từ 688 xuống ~509px. */
        .np-feature > div:first-child { flex: 0 0 auto; max-width: 688px; }

        .np-feature-copy { flex: 0 1 336px; max-width: 336px; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
        /* index.css có rule toàn cục cho h1-h4 nên phải khoá lại cả font lẫn cỡ. */
        .np-feature-copy h4 {
          font-family: inherit; font-size: clamp(1.4rem, 2.4vw, 1.75rem); font-weight: 400;
          line-height: 1.1; letter-spacing: -0.025em; margin: 0; color: ${ON_DARK};
        }
        .np-feature-copy p { font-size: 1rem; line-height: 1.5; letter-spacing: -0.015em; color: ${MUTED_DARK}; margin: 0; }
        .np-feature-copy .np-btn { margin-top: 8px; }
        @media (max-width: 1199px) {
          .np-feature, .np-feature-flip { flex-direction: column; align-items: stretch; }
          .np-feature > div:first-child { max-width: 100%; }
          .np-feature-media { width: 100%; height: auto; aspect-ratio: 16 / 9; border-radius: 24px; }
          .np-feature-copy { flex: 1 1 auto; max-width: 100%; }
        }

        /* ── Ô hình của mỗi bước ──
           Một khối chữ, không phải ảnh. Từ khoá dùng font display in hoa — đây
           là chỗ DUY NHẤT ngoài H1 được dùng nó, và hợp lệ vì ở đây nó đóng vai
           hình vẽ chứ không phải tiêu đề. */
        .np-step-panel {
          position: relative; overflow: hidden; height: 100%; box-sizing: border-box;
          padding: 44px 48px; display: flex; flex-direction: column; align-items: flex-start;
        }
        .np-step-label {
          font-size: 0.8rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          color: ${EMERALD};
        }
        .np-step-keyword {
          margin-top: auto;
          font-family: 'Archivo', inherit; font-variation-settings: 'wdth' 84;
          font-size: clamp(2.6rem, 5.4vw, 4rem); font-weight: 800; line-height: 0.95;
          letter-spacing: -0.03em; text-transform: uppercase; color: ${ON_DARK};
        }
        .np-step-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
        .np-step-tags span {
          padding: 6px 13px; border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04);
          font-size: 0.82rem; font-weight: 500; color: rgba(255,255,255,0.78); white-space: nowrap;
        }
        /* Số bước chìm dưới nền, tràn ra khỏi mép phải và bị cắt. */
        .np-step-ghost {
          position: absolute; right: 30px; top: -44px; z-index: 0;
          font-family: 'Archivo', inherit; font-variation-settings: 'wdth' 84;
          font-size: 15rem; font-weight: 800; line-height: 1; letter-spacing: -0.05em;
          color: rgba(255,255,255,0.045); pointer-events: none; user-select: none;
        }
        .np-step-panel > *:not(.np-step-ghost) { position: relative; z-index: 1; }
        @media (max-width: 1199px) { .np-step-panel { padding: 34px 32px; } .np-step-ghost { font-size: 11rem; } }
        @media (max-width: 520px) { .np-step-panel { padding: 28px 26px; } .np-step-ghost { font-size: 8rem; right: -14px; } }

        /* ── Lưới ── */
        .np-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        @media (max-width: 900px) { .np-grid-3 { grid-template-columns: 1fr; } }


        .np-quote { height: 100%; margin: 0; box-sizing: border-box; display: flex; flex-direction: column;
                    background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; }
        .np-quote p { font-family: inherit; margin: 0 0 24px; font-size: 1rem; line-height: 1.4; letter-spacing: -0.015em; font-weight: 400; }
        .np-quote figcaption { margin-top: auto; }
        .np-quote .np-quote-name { font-weight: 700; font-size: 0.93rem; }
        .np-quote .np-quote-role { font-size: 0.85rem; color: ${MUTED_DARK}; margin-top: 2px; }

        @media (prefers-reduced-motion: reduce) {
          .np-home *, .np-home *::before { transition: none !important; animation: none !important; }
        }
      `}</style>

      {/* 0. HEADER — chế độ đè: trong suốt + chữ trắng khi ở đỉnh hero,
          co lại thành viên thuốc trắng ngay khi bắt đầu cuộn. */}
      <SiteHeader overlay />

      {/* 1. HERO — tiêu đề + số liệu + ô tìm việc, trên nền mesh blur */}
      <section className="np-hero">
        <HeroMesh />

        <div style={{ ...INNER }} className="np-hero-inner">
          <Display size="clamp(2.6rem, 6.4vw, 5.4rem)" align="center" style={{ maxWidth: '16ch', margin: '0 auto' }}>
            Tìm việc tiếp theo<br />của bạn
          </Display>

          <h2 className="np-hero-sub">
            100+ doanh nghiệp &amp; CLB đang tuyển. Hàng trăm cơ hội cho sinh viên mọi ngành.
          </h2>

          <form className="np-search" onSubmit={submitSearch} role="search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Tìm việc làm, quest hoặc kỹ năng"
              maxLength={65}
            />
            {/* Lớp phủ: kính lúp + câu gợi ý, nằm cùng một hàng flex nên chữ
                luôn thẳng hàng với icon mà không phải canh tay. pointer-events
                tắt để bấm vào đâu cũng rơi vào ô input bên dưới. */}
            <span className="np-search-overlay" aria-hidden="true">
              <Search className="np-search-icon" size={32} strokeWidth={1.6} />
              {!query && (
                <span
                  className="np-search-hint"
                  style={{ opacity: hint.fading ? 0 : 1 }}
                >
                  {[...SEARCH_HINTS[hint.phrase]].map((char, index) => (
                    <span
                      // Ký tự trùng nhau rất nhiều nên key phải kèm vị trí.
                      key={`${hint.phrase}-${index}`}
                      style={{ opacity: index < hint.shown ? 1 : 0 }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              )}
            </span>
            <button type="submit" aria-label="Tìm kiếm">
              <ArrowUp size={22} />
            </button>
          </form>

          <div className="np-chips">
            {SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="np-chip"
                onClick={() => navigate(`/jobs?q=${encodeURIComponent(chip)}`)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Lưới việc làm thật — bằng chứng nội dung, ngay trong hero.
              Mỗi thẻ hiện lên lệch nhau một nhịp, đúng kiểu trang mẫu. */}
          <div className="np-jobgrid">
            {rail.map((job, index) => {
              const Tag = job.id ? 'a' : 'div';
              return (
                <Reveal key={job.id ?? `${job.title}-${index}`} delay={index * 70} y={20} style={{ height: '100%' }}>
                  <Tag className="np-jobcard" {...(job.id ? { href: `/jobs/${job.id}` } : {})}>
                    {/* Số thứ tự mờ ở góc — chỉ là chất liệu thị giác, để trống
                        khỏi màn hình đọc bằng aria-hidden. */}
                    <span className="np-jobcard-index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="np-jobcard-type">{job.type}</span>
                    <p className="np-jobcard-title">{job.title}</p>
                    <span className="np-jobcard-foot">
                      <span className={`np-jobcard-pay${job.payKnown ? ' is-known' : ''}`}>{job.pay}</span>
                      <span className="np-jobcard-where">{job.where}</span>
                    </span>
                    <span className="np-jobcard-arrow" aria-hidden="true">
                      <ArrowUpRight size={18} />
                    </span>
                  </Tag>
                </Reveal>
              );
            })}
          </div>

          <div style={{ marginTop: '40px', paddingBottom: 'clamp(56px, 8vw, 96px)' }}>
            <a className="np-btn np-btn-primary" href="/jobs">
              Xem tất cả cơ hội <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 2. LOGO NHÀ TUYỂN DỤNG — nhãn nhỏ có chấm + băng logo chạy.
          Trang mẫu không có band sáng nào: cả trang là một nền tối liền mạch,
          nhịp đến từ khoảng trống dọc chứ không từ việc đổi màu nền. */}
      <section style={{ ...INNER, marginTop: 'clamp(96px, 12vw, 160px)' }}>
        <Reveal>
          <PartnerLogos onDark colorLogos showHeading={false} />
        </Reveal>
      </section>

      {/* 3. CÁCH HOẠT ĐỘNG — ba bước, ảnh/chữ so le */}
      <section style={{ ...INNER, marginTop: 'clamp(96px, 12vw, 160px)' }}>
        <Reveal>
          <SectionTitle align="center" style={{ maxWidth: '620px', margin: '0 auto' }}>
            Ba bước, từ chưa có gì trong tay đến có bằng chứng thật
          </SectionTitle>
        </Reveal>

        <div className="np-features">
          {STEPS.map((item, index) => (
            <div
              key={item.step}
              className={`np-feature${index % 2 === 1 ? ' np-feature-flip' : ''}`}
            >
              <Reveal y={100} style={{ minWidth: 0 }}>
                <div className="np-feature-media">
                  <StepPanel step={item.step} keyword={item.keyword} tags={item.tags} />
                </div>
              </Reveal>
              <Reveal y={40} delay={90} style={{ minWidth: 0 }}>
                <div className="np-feature-copy">
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                  <a className="np-btn np-btn-primary" href={item.href}>
                    {item.cta} <ArrowRight size={18} />
                  </a>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CẢM NHẬN */}
      <section id="thao-luan" style={{ ...INNER, marginTop: 'clamp(96px, 12vw, 160px)', scrollMarginTop: '104px' }}>
        <Reveal>
          <SectionTitle align="center" style={{ maxWidth: '600px', margin: '0 auto' }}>
            nextplease trong mắt sinh viên và nhà tuyển dụng
          </SectionTitle>
        </Reveal>
        <div className="np-grid-3" style={{ marginTop: '80px' }}>
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.quote} delay={index * 110} style={{ height: '100%' }}>
              <figure className="np-quote">
                <p>{item.quote}</p>
                <figcaption>
                  <div className="np-quote-name">{item.name}</div>
                  <div className="np-quote-role">{item.role}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. CTA CUỐI — vẫn nền tối như cả trang, điểm nhấn nằm ở nút */}
      <section style={{ ...INNER, marginTop: 'clamp(96px, 12vw, 160px)', paddingBottom: 'clamp(96px, 12vw, 160px)', textAlign: 'center' }}>
        <Reveal>
          <SectionTitle align="center" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Đọc tới đây rồi, không lẽ không thử?
          </SectionTitle>
          <p className="np-lead" style={{ margin: '24px auto 0', textAlign: 'center' }}>
            Xem những cơ hội đang mở, hoặc đăng tin nếu bạn đang cần người.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
            <a className="np-btn np-btn-primary" href="/jobs">
              Xem cơ hội đang mở <ArrowRight size={18} />
            </a>
            <a className="np-btn np-btn-ghost" href="/business/register">
              Tôi cần tuyển người
            </a>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
