import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUp, ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { PartnerLogos } from '../components/PartnerLogos.jsx';
import { loadJobs } from '../api/jobsCache.js';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { NeonBloom } from '../components/NeonBloom.jsx';

/* ──────────────────────────────────────────────────────────────────────────
   Trang chủ nextplease — Hiệu ứng cuộn chuột đổi nền động (Dynamic Scroll Theme)
   Chuẩn theo mẫu thiết kế của Handshake (https://joinhandshake.com/employers/):

   - Ở đầu trang (Hero): Toàn bộ nền trang là NỀN TỐI (#0b0f0e) với quầng sáng mesh
     neon emerald, thanh tìm kiếm kích thước lớn và lưới 6 thẻ việc làm.
   - KHI LƯỚT CHUỘT XUỐNG: Toàn bộ nền trang tự động CHUYỂN TIẾP MƯỢT SANG NỀN TRẮNG
     (#ffffff) qua CSS transition (duration: 700ms), chữ, viền, thẻ và logo đối tác
     chuyển màu sắc tương phản cao, hiện đại.
   - Khi cuộn ngược lên đỉnh trang: Tự động chuyển ngược lại nền tối.
   ────────────────────────────────────────────────────────────────────────── */

/* Bảng màu lấy từ module dùng chung — xem src/styles/neonPalette.js. Trước
   đây mỗi trang tự khai một bộ hằng số giống hệt nhau, đổi tông là phải sửa
   bốn chỗ và đã từng sót (footer giữ #0b0f0e cũ trong khi trang đã sang
   #070a0f, tạo một đường cắt ngang giữa màn hình). */
import {
  INK, SURFACE, SURFACE_HI, HAIRLINE,
  EMERALD, EMERALD_BRIGHT, EMERALD_DARK, NEON_RGB,
  TEAL_ACCENT, GLOW_SM, GLOW_MD, GLOW_LG,
} from '../styles/neonPalette.js';

const ON_DARK = '#ffffff';
const MUTED_DARK = 'rgba(233,247,242,0.62)';
const LINE_DARK = 'rgba(255,255,255,0.12)';
const SNOW = '#ffffff';

// Màu trên nền sáng (Light Theme Canvas khi cuộn)
const INK_LIGHT = '#0f2e2b';        // tiêu đề chính trên nền sáng
const TEXT_MUTED_LIGHT = '#475569'; // chữ phụ trên nền sáng
const LINE_LIGHT = '#e2efe9';       // viền thẻ trên nền sáng

const SCROLL_TO_LIGHT = false;

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

/* Gợi ý tìm kiếm dưới ô search — bấm là nhảy thẳng sang /jobs với từ khoá. */
const SEARCH_CHIPS = ['Thực tập sinh', 'Part-time', 'Remote', 'Fresher', 'Quest từ CLB'];

/* Câu gợi ý chạy trong ô tìm việc */
const SEARCH_HINTS = [
  'Thực tập Marketing tại TP.HCM cho sinh viên năm 3',
  'Việc part-time remote không cần kinh nghiệm',
  'Quest từ CLB để lấy proof đầu tiên',
  'Cộng tác viên thiết kế, nhận việc theo dự án',
];
const HINT_CHAR_MS = 55;    // mỗi ký tự sáng lên cách nhau bao lâu
const HINT_HOLD_MS = 2200;  // gõ xong thì giữ nguyên câu bao lâu
const HINT_FADE_MS = 450;   // cả câu mờ đi trước khi đổi câu kế

/* Thẻ việc làm mẫu — chỉ hiện khi API chưa trả về, để lưới không rỗng. */
const FALLBACK_JOBS = [
  { id: null, title: 'Thực tập Marketing', pay: 'Tới 5 triệu/tháng', payKnown: true, type: 'Thực tập', where: 'TP.HCM' },
  { id: null, title: 'Cộng tác viên Content', pay: 'Tới 300k/bài', payKnown: true, type: 'Part-time', where: 'Remote' },
  { id: null, title: 'Frontend Intern', pay: 'Tới 8 triệu/tháng', payKnown: true, type: 'Thực tập', where: 'TP.HCM' },
  { id: null, title: 'Hỗ trợ sự kiện CLB', pay: 'Proof & điểm uy tín', payKnown: false, type: 'Quest', where: 'Hà Nội' },
  { id: null, title: 'Data Entry Part-time', pay: 'Tới 35k/giờ', payKnown: true, type: 'Part-time', where: 'Remote' },
  { id: null, title: 'Trợ lý Kinh doanh', pay: 'Tới 7 triệu/tháng', payKnown: true, type: 'Full-time', where: 'Đà Nẵng' },
];

/* Ba bước quy trình */
const STEPS = [
  {
    step: '01',
    keyword: 'Hồ sơ',
    title: 'Dựng hồ sơ một lần',
    body: 'Khai những gì bạn đang có: kỹ năng, dự án môn học, hoạt động ở CLB. Không cần kinh nghiệm đi làm, không cần ai giới thiệu.',
    tags: ['Kỹ năng', 'Dự án', 'Hoạt động'],
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

/* Ô hình minh họa của mỗi bước */
function StepPanel({ step, keyword, tags }) {
  return (
    <div className="np-step-panel">
      <span className="np-step-label">Bước {step}</span>
      <span className="np-step-keyword">{keyword}</span>
      <span className="np-step-tags">
        {tags.map((tag) => <span key={tag}>{tag}</span>)}
      </span>
      <span className="np-step-ghost" aria-hidden="true">{step}</span>
    </div>
  );
}

function SectionTitle({ children, align = 'left', style }) {
  return (
    <h2 className="np-section-title" style={{ textAlign: align, ...style }}>
      {children}
    </h2>
  );
}

function Display({ children, size = 'clamp(2.4rem, 6.2vw, 4.6rem)', color = ON_DARK, align = 'left', style }) {
  return (
    <h2
      className="np-display"
      style={{ fontSize: size, '--np-display-color': color, textAlign: align, ...style }}
    >
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
  const words = key.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function toRailJob(raw) {
  const pay = raw.salaryText
    || (Number(raw.salaryMax) ? `Tới ${Math.round(Number(raw.salaryMax) / 1e6)} triệu/tháng` : null)
    || (Number(raw.salaryMin) ? `Từ ${Math.round(Number(raw.salaryMin) / 1e6)} triệu/tháng` : null);
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
  
  /* Ảnh mẫu tối từ đầu tới cuối. Giữ đoạn chuyển sang nền trắng thì nửa dưới
     trang rơi lại tông cũ và lime mất chỗ tương phản. Tắt bằng cờ dưới đây —
     đổi lại thành true là khôi phục nguyên hành vi cũ, không mất code nào. */
  const [isLight, setIsLight] = useState(false);
  const scrollTriggerRef = useRef(null);

  /* Lắng nghe vị trí cuộn chuột để kích hoạt hiệu ứng đổi nền */
  useEffect(() => {
    const handleScroll = () => {
      // Khi cuộn qua ngưỡng ~420px (hoặc khi vị trí trigger tới gần nửa màn hình), kích hoạt đổi sang nền trắng
      if (SCROLL_TO_LIGHT && window.scrollY > 420) {
        setIsLight(true);
      } else {
        setIsLight(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check ban đầu
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Trạng thái câu gợi ý gõ */
  const [hint, setHint] = useState(() => ({
    phrase: 0,
    shown: prefersReducedMotion() ? [...SEARCH_HINTS[0]].length : 0,
    fading: false,
  }));

  /* Nạp danh sách việc làm */
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

  /* Animated search hints */
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
    <div className={`np-home np-neon ${isLight ? 'is-light' : ''}`}>
      <NeonBloom />
      <style>{`
        /* ── ROOT CONTAINER: Mặc định nền tối, khi cuộn (is-light) chuyển sang nền trắng mượt mà ── */
        .np-home {
          background-color: ${INK};
          color: ${ON_DARK};
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-top: -34px;
          overflow-x: clip;
          font-family: 'Be Vietnam Pro', 'Inter', sans-serif;
          transition: background-color 700ms cubic-bezier(0.16, 1, 0.3, 1), color 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Khi cuộn chuột xuống: Nền chuyển trắng tinh khiết */
        .np-home.is-light {
          background-color: #ffffff;
          color: ${INK_LIGHT};
        }

        .np-home :focus-visible { outline: 2px solid ${EMERALD}; outline-offset: 3px; border-radius: 8px; }

        /* ── Headline display ── */
        .np-display {
          color: var(--np-display-color, ${ON_DARK});
          font-family: 'Archivo', 'Be Vietnam Pro', sans-serif;
          font-variation-settings: 'wdth' 84;
          font-weight: 800;
          text-transform: uppercase;
          line-height: 1.02;
          letter-spacing: -0.022em;
          margin: 0;
        }

        /* ── Tiêu đề Section biến đổi màu theo theme ── */
        .np-section-title {
          font-family: inherit;
          font-size: clamp(1.75rem, 3.2vw, 2.3rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: ${ON_DARK};
          margin: 0;
          transition: color 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .np-home.is-light .np-section-title {
          color: ${INK_LIGHT};
        }
        .np-home.is-light .np-section-title:hover {
          color: ${EMERALD_DARK};
        }

        .np-display,
        .np-quote .np-quote-name {
          transition: color 220ms ease;
        }
        .np-display:hover,
        .np-quote .np-quote-name:hover {
          color: ${EMERALD_BRIGHT};
        }

        .np-jobcard-title { transition: color 220ms ease; }
        .np-jobcard:hover .np-jobcard-title { color: ${EMERALD_BRIGHT}; }

        @media (prefers-reduced-motion: reduce) {
          .np-display, .np-section-title, .np-feature-copy h4,
          .np-quote .np-quote-name, .np-jobcard-title, .np-home { transition: none !important; }
        }

        /* ── Hero section ── */
        .np-hero { position: relative; overflow: hidden; padding-top: clamp(124px, 12vw, 176px); }
        .np-hero-inner { position: relative; z-index: 3; text-align: center; }

        .np-hero-sub {
          font-family: inherit;
          margin: clamp(28px, 3.4vw, 40px) auto 0; max-width: 44rem;
          font-size: 1.25rem; font-weight: 400; line-height: 1.35; color: ${ON_DARK};
        }

        /* ── Ô tìm việc ── */
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
        .np-search-overlay {
          position: absolute; inset: 0; display: flex; align-items: center; gap: 16px;
          padding: 16px; pointer-events: none; color: #252630;
        }
        .np-search-icon { flex: none; }
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

        @media (max-width: 1279px) {
          .np-search { height: 152px; }
          .np-search input { padding: 0 24px 64px; border-radius: 24px; }
          .np-search-icon { display: none; }
          .np-search-overlay { align-items: flex-start; padding: 24px 24px 64px; }
          .np-search-hint { white-space: pre-wrap; }
          .np-search button { top: auto; bottom: 24px; right: 24px; transform: none; }
        }

        /* ── Chip gợi ý ── */
        .np-chips { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 24px; }
        .np-chip {
          border: 1px solid rgba(255,255,255,0.2); background: transparent; color: ${ON_DARK};
          border-radius: 8px; padding: 16px; font: inherit; font-size: 1rem; font-weight: 400; line-height: 1;
          cursor: pointer; transition: background-color 150ms ease-out;
        }
        .np-chip:hover { background-color: rgba(255,255,255,0.1); }

        /* ── Lưới thẻ việc làm trong Hero ── */
        .np-jobgrid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 80px;
          grid-auto-rows: 1fr;
        }
        .np-jobcard {
          position: relative; overflow: hidden; box-sizing: border-box;
          display: flex; flex-direction: column; align-items: flex-start;
          min-height: 216px; height: 100%; padding: 28px 30px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.016);
          color: ${ON_DARK}; text-align: left; text-decoration: none;
          transition: border-color 260ms ease, background-color 260ms ease, transform 320ms cubic-bezier(0.22,1,0.36,1);
        }
        .np-jobcard::before {
          content: ''; position: absolute; inset: 0 0 auto; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          opacity: 0.5; transition: opacity 260ms ease;
        }
        .np-jobcard::after {
          content: ''; position: absolute; right: -40%; bottom: -60%; width: 90%; height: 150%;
          background: radial-gradient(closest-side, rgba(${NEON_RGB},0.22), rgba(${NEON_RGB},0) 70%);
          opacity: 0; transition: opacity 320ms ease; pointer-events: none;
        }
        .np-jobcard:hover {
          border-color: rgba(${NEON_RGB},0.55); background-color: rgba(255,255,255,0.05);
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
        .np-jobcard:hover .np-jobcard-index { color: rgba(${NEON_RGB},0.22); }

        .np-jobcard-type {
          display: inline-block; margin-bottom: 18px; padding: 5px 11px;
          border-radius: 9999px; border: 1px solid rgba(255,255,255,0.16);
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.01em; text-transform: none;
          color: rgba(255,255,255,0.82); white-space: nowrap;
          transition: border-color 260ms ease, color 260ms ease;
        }
        .np-jobcard:hover .np-jobcard-type { border-color: rgba(${NEON_RGB},0.5); color: ${EMERALD}; }

        .np-jobcard-title {
          margin: 0; font-size: 1.25rem; line-height: 1.35; letter-spacing: -0.3px; font-weight: 400;
          flex-shrink: 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .np-jobcard-foot { margin-top: auto; padding-top: 20px; display: flex; flex-direction: column; gap: 3px; }
        .np-jobcard-pay { font-size: 0.95rem; letter-spacing: -0.015em; color: rgba(255,255,255,0.45); }
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
        div.np-jobcard { cursor: default; }
        div.np-jobcard .np-jobcard-arrow { display: none; }

        @media (max-width: 1023px) { .np-jobgrid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 639px) { .np-jobgrid { grid-template-columns: 1fr; } .np-jobcard { min-height: 200px; padding: 24px 26px; } .np-jobcard-index { font-size: 2.1rem; } }

        /* ── Nút ── */
        .np-btn {
          display: inline-flex; align-items: center; gap: 6px; border-radius: 12px;
          padding: 16px 24px; font-size: 1.05rem; font-weight: 600; line-height: 1;
          text-decoration: none; border: 1px solid transparent; cursor: pointer; font-family: inherit;
          transition: background-color 150ms ease-in-out, border-color 150ms ease-in-out, transform 150ms ease;
        }
        .np-btn-primary { background: ${EMERALD}; color: ${INK}; font-weight: 700; }
        .np-btn-primary:hover { background: #34d399; transform: translateY(-2px); }
        .np-btn-ghost { background: transparent; color: ${ON_DARK}; border-color: ${LINE_DARK}; }
        .np-btn-ghost:hover { border-color: ${EMERALD}; }

        /* ─────────────────────────────────────────────────────────────
           3 BƯỚC HOẠT ĐỘNG: CHUYỂN MÀU THEO THEME CUỘN
        ───────────────────────────────────────────────────────────── */
        .np-features { display: flex; flex-direction: column; gap: clamp(80px, 10vw, 160px); margin-top: 80px; }
        .np-feature { display: flex; align-items: center; justify-content: space-between; gap: clamp(32px, 5vw, 80px); }
        .np-feature-flip { flex-direction: row-reverse; }

        .np-feature-media {
          flex: none; width: 688px; max-width: 100%; height: 388px; border-radius: 32px; overflow: hidden;
          background:
            radial-gradient(120% 120% at 18% 12%, rgba(103,232,249,0.34) 0%, rgba(${NEON_RGB},0.1) 46%, rgba(0,0,0,0) 72%),
            linear-gradient(152deg, #14211f 0%, #0d1614 100%);
          border: 1px solid ${LINE_DARK};
          transition: background 700ms ease, border-color 600ms ease, box-shadow 600ms ease;
        }
        .np-home.is-light .np-feature-media {
          background:
            radial-gradient(120% 120% at 18% 12%, rgba(${NEON_RGB},0.16) 0%, rgba(240,253,249,0.85) 46%, #ffffff 100%),
            #ffffff;
          border: 1.5px solid ${LINE_LIGHT};
          box-shadow: 0 20px 40px -15px rgba(15, 46, 43, 0.06);
        }
        .np-feature > div:first-child { flex: 0 0 auto; max-width: 688px; }

        .np-feature-copy { flex: 0 1 360px; max-width: 360px; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
        .np-feature-copy h4 {
          font-family: inherit; font-size: clamp(1.5rem, 2.6vw, 1.95rem); font-weight: 800;
          line-height: 1.15; letter-spacing: -0.025em; margin: 0; color: ${ON_DARK};
          transition: color 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .np-home.is-light .np-feature-copy h4 { color: ${INK_LIGHT}; }
        .np-home.is-light .np-feature-copy h4:hover { color: ${EMERALD_DARK}; }

        .np-feature-copy p {
          font-size: 1.05rem; line-height: 1.6; letter-spacing: -0.015em; color: ${MUTED_DARK}; margin: 0;
          transition: color 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .np-home.is-light .np-feature-copy p { color: ${TEXT_MUTED_LIGHT}; }
        .np-feature-copy .np-btn { margin-top: 10px; }

        @media (max-width: 1199px) {
          .np-feature, .np-feature-flip { flex-direction: column; align-items: stretch; }
          .np-feature > div:first-child { max-width: 100%; }
          .np-feature-media { width: 100%; height: auto; aspect-ratio: 16 / 9; border-radius: 24px; }
          .np-feature-copy { flex: 1 1 auto; max-width: 100%; }
        }

        /* ── Panel bước học ── */
        .np-step-panel {
          position: relative; overflow: hidden; height: 100%; box-sizing: border-box;
          padding: 44px 48px; display: flex; flex-direction: column; align-items: flex-start;
        }
        .np-step-label {
          font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: ${EMERALD};
          transition: color 600ms ease;
        }
        .np-home.is-light .np-step-label { color: ${EMERALD_DARK}; }

        .np-step-keyword {
          margin-top: auto;
          font-family: 'Archivo', inherit; font-variation-settings: 'wdth' 84;
          font-size: clamp(2.6rem, 5.4vw, 4.2rem); font-weight: 900; line-height: 0.95;
          letter-spacing: -0.03em; text-transform: uppercase; color: ${ON_DARK};
          transition: color 600ms ease;
        }
        .np-home.is-light .np-step-keyword { color: ${INK_LIGHT}; }

        .np-step-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
        .np-step-tags span {
          padding: 7px 14px; border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04);
          font-size: 0.86rem; font-weight: 600; color: rgba(255,255,255,0.78); white-space: nowrap;
          transition: background 600ms ease, border-color 600ms ease, color 600ms ease;
        }
        .np-home.is-light .np-step-tags span {
          border: 1px solid #cbd5e1; background: #ffffff; color: ${INK_LIGHT};
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }

        .np-step-ghost {
          position: absolute; right: 30px; top: -44px; z-index: 0;
          font-family: 'Archivo', inherit; font-variation-settings: 'wdth' 84;
          font-size: 15rem; font-weight: 900; line-height: 1; letter-spacing: -0.05em;
          color: rgba(255,255,255,0.045); pointer-events: none; user-select: none;
          transition: color 600ms ease;
        }
        .np-home.is-light .np-step-ghost { color: rgba(15, 46, 43, 0.05); }

        .np-step-panel > *:not(.np-step-ghost) { position: relative; z-index: 1; }
        @media (max-width: 1199px) { .np-step-panel { padding: 34px 32px; } .np-step-ghost { font-size: 11rem; } }
        @media (max-width: 520px) { .np-step-panel { padding: 28px 26px; } .np-step-ghost { font-size: 8rem; right: -14px; } }

        /* ── Testimonial quotes biến đổi theo theme ── */
        .np-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        @media (max-width: 900px) { .np-grid-3 { grid-template-columns: 1fr; } }

        .np-quote {
          height: 100%; margin: 0; box-sizing: border-box; display: flex; flex-direction: column;
          background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px;
          color: ${ON_DARK};
          transition: background 600ms ease, border-color 600ms ease, box-shadow 600ms ease, color 600ms ease;
        }
        .np-home.is-light .np-quote {
          background: #ffffff;
          border: 1.5px solid ${LINE_LIGHT};
          color: #1e293b;
          box-shadow: 0 10px 30px rgba(15, 46, 43, 0.04);
        }
        .np-home.is-light .np-quote:hover {
          transform: translateY(-4px);
          border-color: ${EMERALD};
          box-shadow: 0 20px 40px rgba(${NEON_RGB}, 0.1);
        }
        .np-quote p { font-family: inherit; margin: 0 0 24px; font-size: 1.05rem; line-height: 1.55; letter-spacing: -0.015em; font-weight: 500; }
        .np-quote figcaption { margin-top: auto; }
        .np-quote .np-quote-name { font-weight: 800; font-size: 1rem; color: ${ON_DARK}; transition: color 600ms ease; }
        .np-home.is-light .np-quote .np-quote-name { color: ${INK_LIGHT}; }

        .np-quote .np-quote-role { font-size: 0.88rem; color: ${MUTED_DARK}; margin-top: 4px; transition: color 600ms ease; }
        .np-home.is-light .np-quote .np-quote-role { color: ${TEXT_MUTED_LIGHT}; }

        /* ── LỚP NEON ───────────────────────────────────────────────────────
           Đặt cuối khối style để đè lên các quy tắc phía trên. Mọi selector ở
           đây đều nằm dưới .np-home (nền tối); phần .is-light bên dưới tắt hết
           glow vì trên nền trắng quầng sáng chỉ thành vệt bẩn. */

        /* Chữ trắng để phẳng như ảnh mẫu. Chỉ phần chữ mang màu lime mới
           có chút quầng — và cũng rất mỏng. */
        .np-display span { text-shadow: ${GLOW_MD}; }

        /* Nút chính: khối neon có quầng, rê chuột thì sáng bùng lên */
        .np-btn-primary {
          box-shadow: ${GLOW_MD};
          transition: box-shadow 240ms ease, background-color 240ms ease, transform 240ms ease;
        }
        .np-btn-primary:hover {
          background: ${EMERALD_BRIGHT};
          box-shadow: ${GLOW_LG};
          transform: translateY(-1px);
        }
        .np-btn-ghost:hover { box-shadow: ${GLOW_SM}; }

        /* Thẻ việc làm: viền sáng khi rê chuột */
        .np-jobcard:hover { box-shadow: ${GLOW_MD}; }
        .np-jobcard:hover .np-jobcard-title { text-shadow: ${GLOW_SM}; }
        .np-jobcard-pay.is-known { text-shadow: ${GLOW_SM}; }

        /* Nhãn bước, số liệu */
        .np-step-label { text-shadow: ${GLOW_SM}; }

        /* Ô tìm kiếm: nhấn vào là phát sáng */
        .np-search:focus-within { box-shadow: ${GLOW_MD}; border-radius: 24px; }
        .np-home :focus-visible { box-shadow: ${GLOW_SM}; }

        /* Nền tối trở nên hơi ngả xanh thay vì đen trung tính */
        .np-home { background-image: radial-gradient(120% 80% at 50% 0%, rgba(${NEON_RGB}, 0.07), transparent 60%); }

        /* Nền trắng: tắt sạch glow, trả màu nhấn về bản đậm đọc được */
        .np-home.is-light .np-display span,
        .np-home.is-light .np-jobcard-title,
        .np-home.is-light .np-jobcard-pay.is-known,
        .np-home.is-light .np-step-label { text-shadow: none; }
        .np-home.is-light .np-btn-primary,
        .np-home.is-light .np-btn-primary:hover,
        .np-home.is-light .np-jobcard:hover,
        .np-home.is-light .np-search:focus-within { box-shadow: none; }
        .np-home.is-light { background-image: none; }
        .np-home.is-light .np-btn-primary { background: ${EMERALD_DARK}; color: #ffffff; }
        .np-home.is-light .np-jobcard-pay.is-known { color: ${EMERALD_DARK}; }

        /* .np-darkbox: khối CTA luôn có nền tối riêng, không đi theo nền trang.
           Vì vậy nó phải giữ neon cả khi trang đã chuyển sang nền trắng —
           nếu không, nút sẽ thành xanh đậm nằm trên nền đen, trông như bị tắt. */
        .np-home.is-light .np-darkbox .np-btn-primary {
          background: ${EMERALD};
          color: ${INK};
          box-shadow: ${GLOW_MD};
        }
        .np-home.is-light .np-darkbox .np-btn-primary:hover {
          background: ${EMERALD_BRIGHT};
          box-shadow: ${GLOW_LG};
        }

        /* ══ DỰNG LẠI KHỐI THEO ẢNH MẪU ═════════════════════════════════════
           Ảnh mẫu: nền phẳng gần đen, thẻ nền ĐẶC hơi sáng hơn nền một bậc,
           viền hairline, bo tròn lớn, nút hình viên thuốc màu lime đặc chữ
           đen, và ĐÚNG MỘT thẻ được tô lime để tạo nhịp. */

        /* Nền phẳng hoàn toàn */
        .np-home { background-image: none; background-color: ${INK}; }

        /* Ô tìm việc: từ khối trắng lớn sang khối tối viền mảnh */
        .np-search input {
          background: ${SURFACE};
          color: ${ON_DARK};
          border: 1px solid ${HAIRLINE};
          border-radius: 20px;
        }
        .np-search input:focus { border-color: rgba(${NEON_RGB}, 0.55); }
        .np-search-overlay { color: ${ON_DARK}; }
        .np-search-hint { color: rgba(255,255,255,0.34); }
        .np-search-icon { color: rgba(255,255,255,0.45); }
        .np-search button {
          background: ${EMERALD}; color: ${INK};
          width: 52px; height: 52px; border-radius: 999px;
        }
        .np-search button:hover { background: ${EMERALD_BRIGHT}; }
        .np-search:focus-within { box-shadow: none; }

        /* Chip: viên thuốc tối, rê chuột thì tô đặc lime */
        .np-chip {
          border-radius: 999px; padding: 12px 22px;
          border-color: ${HAIRLINE}; background: ${SURFACE};
          font-size: 0.95rem;
          transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
        }
        .np-chip:hover { background: ${EMERALD}; color: ${INK}; border-color: ${EMERALD}; }

        /* Thẻ việc làm: nền đặc, bo lớn, bỏ vệt sáng viền trên */
        .np-jobcard {
          background: ${SURFACE};
          border-color: ${HAIRLINE};
          border-radius: 24px;
        }
        .np-jobcard::before { display: none; }
        .np-jobcard:hover {
          background-color: ${SURFACE_HI};
          border-color: rgba(${NEON_RGB}, 0.45);
          box-shadow: none;
        }
        .np-jobcard-type { border-radius: 999px; }

        /* Nút: hình viên thuốc như ảnh mẫu */
        .np-btn-primary, .np-btn-ghost { border-radius: 999px; }
        .np-btn-primary { box-shadow: none; }
        .np-btn-primary:hover { box-shadow: ${GLOW_MD}; }
        .np-btn-ghost { border-color: ${HAIRLINE}; }
        .np-btn-ghost:hover { border-color: ${EMERALD}; box-shadow: none; }

        /* Khối minh hoạ "Ba bước": bỏ quầng cyan, về bề mặt đặc như thẻ khác.
           Cyan là tàn dư của bảng màu emerald cũ, đặt cạnh lime thì đục. */
        .np-feature-media {
          background: ${SURFACE};
          border-color: ${HAIRLINE};
          border-radius: 28px;
        }

        /* Trích dẫn cũng đưa về cùng một bề mặt */
        .np-quote { background: ${SURFACE}; border-color: ${HAIRLINE}; border-radius: 24px; }
        .np-quote:hover { border-color: rgba(${NEON_RGB}, 0.45); }

        /* Thẻ nhỏ trong khối bước */
        .np-step-tags span { border-radius: 999px; border-color: ${HAIRLINE}; }

        /* Nội dung phải nằm trên lớp vệt.

           PHẢI loại trừ .nph-shell. Thanh header là position: fixed, mà luật
           này có độ ưu tiên cao hơn (.np-home > *:not(...) = 2 class, còn
           .nph-shell = 1 class) nên nó ghi đè thành position: relative —
           header hết bám mép trên và trôi mất khi cuộn xuống. Nó chỉ cần
           z-index chứ không cần đổi position. */
        /* Liệt kê thẳng các khối nội dung, KHÔNG dùng kiểu loại trừ
           Kiểu loại trừ đó đã gây lỗi thật ở khu vực ứng viên: nó đè
           position: fixed của các overlay modal render ở cuối cây, làm modal
           rơi xuống đáy trang thay vì phủ giữa màn hình. Danh sách loại trừ
           luôn thiếu thứ chưa nghĩ ra; danh sách cho phép thì không. */
        .np-home > section,
        .np-home > footer,
        .np-home > div:not(.np-bloom):not(.nph-shell) { position: relative; z-index: 1; }
        .np-home > .nph-shell { z-index: 60; }

        @media (prefers-reduced-motion: reduce) {
          .np-bloom span { animation: none !important; }
        }

        /* ══ KHOẢNG TRỐNG ══════════════════════════════════════════════════
           Nhịp nghỉ cũ được canh cho nền TRẮNG. Trên nền đen, khoảng trống
           lớn không còn đọc là "thoáng" mà thành lỗ hổng. Thu lại. */
        .np-features { gap: clamp(56px, 6vw, 104px); margin-top: 56px; }

        /* ══ KHỐI "BA BƯỚC" SANG TÔNG NEON ══════════════════════════════════
           Trước đó khối này chỉ là mặt phẳng xám: số mờ xám, chữ trắng, thẻ
           viền trắng — không có gì thuộc bảng neon ngoài mỗi nhãn "BƯỚC 01".
           Đưa toàn bộ chi tiết bên trong về lime, và thêm một quầng lime chéo
           góc để lấp mảng rỗng giữa khối. */
        .np-feature-media {
          position: relative;
          border-color: rgba(${NEON_RGB}, 0.16);
          background:
            radial-gradient(90% 80% at 88% 8%, rgba(${NEON_RGB}, 0.13), transparent 62%),
            radial-gradient(70% 70% at 4% 96%, rgba(${NEON_RGB}, 0.07), transparent 66%),
            ${SURFACE};
        }
        /* Số chìm: từ xám sang lime mờ */
        .np-step-ghost { color: rgba(${NEON_RGB}, 0.09); }
        /* Từ khoá lớn: lime có quầng, đây là điểm nhìn chính của khối */
        .np-step-keyword { color: ${EMERALD}; text-shadow: ${GLOW_MD}; }
        /* Thẻ nhỏ: viền và chữ lime thay vì trắng */
        .np-step-tags span {
          border-color: rgba(${NEON_RGB}, 0.32);
          background: rgba(${NEON_RGB}, 0.06);
          color: rgba(${NEON_RGB}, 0.85);
        }
        /* Nhãn bước: thêm chấm lime đặc phía trước cho đồng bộ với eyebrow */
        .np-step-label { text-shadow: ${GLOW_SM}; }


      `}</style>

      {/* 0. HEADER — chế độ overlay: trong suốt + chữ trắng khi ở đỉnh hero,
          co lại thành viên thuốc kính mờ sáng ngay khi cuộn xuống. */}
      <SiteHeader overlay />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO (NỀN TỐI Ở ĐỈNH TRANG)
      ───────────────────────────────────────────────────────────── */}
      <section className="np-hero">
        {/* Ảnh mẫu dùng nền PHẲNG, không quầng. Mesh xanh ngọc kéo nền về
            xanh, mà lime trên xanh thì đục. Bỏ hẳn. */}

        <div style={{ ...INNER }} className="np-hero-inner">
          <Display size="clamp(2.6rem, 6.4vw, 5.4rem)" align="center" style={{ maxWidth: '16ch', margin: '0 auto' }}>
            Tìm <span style={{ color: EMERALD }}>việc tiếp theo</span><br />của bạn
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
            <span className="np-search-overlay" aria-hidden="true">
              <Search className="np-search-icon" size={32} strokeWidth={1.6} />
              {!query && (
                <span
                  className="np-search-hint"
                  style={{ opacity: hint.fading ? 0 : 1 }}
                >
                  {[...SEARCH_HINTS[hint.phrase]].map((char, index) => (
                    <span
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

          {/* Lưới việc làm thật trong Hero */}
          <div className="np-jobgrid">
            {rail.map((job, index) => {
              const Tag = job.id ? 'a' : 'div';
              return (
                <Reveal key={job.id ?? `${job.title}-${index}`} delay={index * 70} y={20} style={{ height: '100%' }}>
                  <Tag className="np-jobcard" {...(job.id ? { href: `/jobs/${job.id}` } : {})}>
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

          <div style={{ marginTop: '48px', paddingBottom: 'clamp(64px, 9vw, 108px)' }}>
            <a className="np-btn np-btn-primary" href="/jobs">
              Xem tất cả cơ hội <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Điểm kích hoạt cuộn đổi nền */}
      <div ref={scrollTriggerRef} style={{ height: 1, margin: '-1px 0 0' }} />

      {/* ─────────────────────────────────────────────────────────────
          2. CÁC PHÂN ĐOẠN TIẾP THEO (TỰ ĐỘNG CHUYỂN NỀN TRẮNG KHI LƯỚT)
      ───────────────────────────────────────────────────────────── */}
      
      {/* 2.1. LOGO ĐỐI TÁC DOANH NGHIỆP */}
      <section style={{ ...INNER, marginTop: 'clamp(80px, 10vw, 130px)' }}>
        <Reveal>
          <PartnerLogos onDark={!isLight} colorLogos showHeading={false} />
        </Reveal>
      </section>

      {/* 2.2. BA BƯỚC HOẠT ĐỘNG */}
      <section style={{ ...INNER, marginTop: 'clamp(90px, 11vw, 150px)' }}>
        <Reveal>
          <SectionTitle align="center" style={{ maxWidth: '680px', margin: '0 auto' }}>
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

      {/* 2.3. CẢM NHẬN & ĐÁNH GIÁ */}
      <section id="thao-luan" style={{ ...INNER, marginTop: 'clamp(90px, 11vw, 150px)', scrollMarginTop: '104px' }}>
        <Reveal>
          <SectionTitle align="center" style={{ maxWidth: '640px', margin: '0 auto' }}>
            nextplease trong mắt sinh viên và nhà tuyển dụng
          </SectionTitle>
        </Reveal>
        <div className="np-grid-3" style={{ marginTop: '72px' }}>
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.quote} delay={index * 110} style={{ height: '100%' }}>
              <figure className="np-quote">
                <p>“{item.quote}”</p>
                <figcaption>
                  <div className="np-quote-name">{item.name}</div>
                  <div className="np-quote-role">{item.role}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 2.4. CTA BANNER (HỘP BO TRÒN NỔI BẬT KIỂU HANDSHAKE) */}
      <section style={{ ...INNER, marginTop: 'clamp(90px, 11vw, 150px)', paddingBottom: 'clamp(90px, 11vw, 140px)' }}>
        <Reveal>
          <div className="np-darkbox" style={{
            background: `radial-gradient(ellipse 70% 60% at 50% -20%, rgba(${NEON_RGB}, 0.5), transparent 70%), ${INK}`,
            borderRadius: 32,
            padding: 'clamp(48px, 6vw, 76px) 36px',
            textAlign: 'center',
            color: '#ffffff',
            boxShadow: isLight ? '0 25px 60px rgba(11, 15, 14, 0.18)' : '0 25px 60px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `rgba(${NEON_RGB}, 0.18)`,
              border: `2px solid ${EMERALD}`,
              boxShadow: GLOW_MD,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Sparkles size={26} color={EMERALD} />
            </div>

            <h2 style={{
              fontSize: 'clamp(1.9rem, 3.8vw, 2.9rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              margin: '0 auto 16px',
              maxWidth: '680px',
            }}>
              Đọc tới đây rồi, không lẽ không thử?
            </h2>

            <p style={{
              fontSize: '1.12rem',
              color: 'rgba(255, 255, 255, 0.75)',
              margin: '0 auto 36px',
              maxWidth: '520px',
              lineHeight: 1.55,
            }}>
              Xem những cơ hội đang mở, hoặc bắt đầu xây dựng hồ sơ Proof of Work đầu tiên của bạn ngay hôm nay.
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="np-btn np-btn-primary" href="/jobs">
                Xem cơ hội đang mở <ArrowRight size={18} />
              </a>
              <a className="np-btn np-btn-ghost" href="/business/register">
                Tôi cần tuyển người
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
