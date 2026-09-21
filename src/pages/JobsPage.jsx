import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, MapPin, Wallet, Clock, Users, Briefcase,
  Heart, List, LayoutGrid, RotateCcw, Building2, Check, Search,
  X, Share2, ArrowRight, Link2, GraduationCap, Zap, ShieldCheck,
  Star, Award, Sparkles, FolderOpen, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { loadOpportunities, getCachedOpportunities } from '../api/jobsCache.js';
import { EmptyStateMascot } from '../components/EmptyStateMascot.jsx';
import { extractProvince } from '../lib/vnProvince.js';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';
import { useSavedJobs } from '../lib/savedJobs.js';

/* ── Hệ màu nền tối, dùng chung với trang chủ (xem DESIGN.md) ──
   Cả trang là một nền tối liền mạch; emerald là màu tương tác duy nhất. */
const INK = '#0b0f0e';          // nền trang
const SURFACE = '#121817';      // bề mặt nổi: panel chi tiết, menu, ô trống
const EMERALD = '#10b981';
const TEAL = '#0d9488';
const ON_DARK = '#ffffff';
const MUTED = 'rgba(233,247,242,0.62)';
const LINE = 'rgba(255,255,255,0.1)';
const LINE_STRONG = 'rgba(255,255,255,0.2)';

/* Nền ô logo khi doanh nghiệp chưa tải ảnh lên — sắc độ mờ trên nền tối thay
   cho dải pastel cũ (pastel sáng trên nền tối thành sáu đốm chói). */
const LOGO_COLORS = [
  'rgba(16,185,129,0.16)', 'rgba(103,232,249,0.14)', 'rgba(167,139,250,0.14)',
  'rgba(56,189,248,0.14)', 'rgba(251,146,60,0.14)', 'rgba(163,230,53,0.14)',
];

const JOB_TYPE_LABELS = {
  INTERNSHIP: 'Thực tập sinh',
  PART_TIME: 'Bán thời gian',
  FREELANCE: 'Freelance',
  EVENT_STAFF: 'Event Staff',
  MICRO_INTERNSHIP: 'Thực tập ngắn hạn',
  // Quest dùng `category` làm loại. Enum đầy đủ nằm ở ràng buộc ck_quests_category
  // trong V2: SMALL_EVENT, SCHOOL_CAMPAIGN, COMPANY_PROJECT, SHORT_INTERNSHIP,
  // FREELANCE_GIG. Thiếu nhãn nào thì thẻ tin hiện nguyên mã hoa in đậm.
  SMALL_EVENT: 'Sự kiện CLB',
  SCHOOL_CAMPAIGN: 'Chiến dịch trường',
  COMPANY_PROJECT: 'Dự án doanh nghiệp',
  SHORT_INTERNSHIP: 'Thực tập ngắn hạn',
  FREELANCE_GIG: 'Việc tự do ngắn',
  CLUB_RECRUITMENT: 'Tuyển thành viên CLB',
  CLUB_QUEST: 'Quest / Thử thách CLB',
};

const FILTER_DEFS = [
  { key: 'orgTypeLabel', label: 'Đơn vị đăng' },
  { key: 'province', label: 'Địa điểm', searchable: true },
  { key: 'type', label: 'Loại cơ hội' },
  { key: 'workForm', label: 'Hình thức làm việc' },
  { key: 'postedBucket', label: 'Mới đăng' },
  { key: 'applicantBucket', label: 'Số ứng viên' },
];

function initials(name) {
  const words = (name || '').replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] || '') + (words[1]?.[0] || '')).toUpperCase() || 'NP';
}

/* Relative "Đăng … trước" from an ISO timestamp. */
function relativeTime(iso) {
  if (!iso) return 'Vừa đăng';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Vừa đăng';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `Đăng ${mins || 1} phút trước`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Đăng ${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days < 30) return `Đăng ${days} ngày trước`;
  const months = Math.round(days / 30);
  return `Đăng ${months} tháng trước`;
}

function postedBucket(iso) {
  if (!iso) return 'Trước đó';
  const days = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (days <= 1) return 'Hôm nay';
  if (days <= 7) return 'Tuần này';
  if (days <= 30) return 'Tháng này';
  return 'Trước đó';
}

function applicantText(count) {
  const n = Number(count) || 0;
  if (n === 0) return 'Hãy là ứng viên đầu tiên';
  if (n < 5) return 'Ít hơn 5 ứng viên';
  if (n < 20) return 'Ít hơn 20 ứng viên';
  return `${n} ứng viên`;
}

function applicantBucket(count) {
  const n = Number(count) || 0;
  if (n === 0) return 'Chưa có ứng viên';
  if (n < 20) return 'Dưới 20 ứng viên';
  return 'Từ 20 ứng viên';
}

/* Format the BE numeric compensation (VND) into a friendly salary string. */
function formatSalary(comp) {
  if (comp == null) return null;
  const n = typeof comp === 'number' ? comp : Number(String(comp).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) {
    return typeof comp === 'string' && comp.trim() ? comp.trim() : null;
  }
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const str = Number.isInteger(m) ? String(m) : m.toFixed(1).replace('.', ',');
    return `${str} triệu / tháng`;
  }
  return `${n.toLocaleString('vi-VN')} đ / tháng`;
}

/* Map a raw BE job into the display shape the cards + panel expect. */
/**
 * Đưa một quest về đúng hình dạng mà normalizeJob mong đợi.
 *
 * Hai payload lệch nhau ở vài chỗ nhỏ nhưng đủ để hỏng nếu bỏ qua:
 *   applicantCount (số ít) ≠ applicantsCount (số nhiều)
 *   quest không có jobType, không có compensation, và KHÔNG có createdAt
 *   quest dùng endsAt thay cho deadlineAt
 *
 * createdAt trước đây không có trong payload quest, khiến relativeTime() rơi về
 * "Vừa đăng" — một mốc thời gian bịa. Đã bổ sung cột đó ở QuestService thay vì
 * lấy tạm startsAt, vì startsAt là ngày BẮT ĐẦU hoạt động và thường nằm ở tương
 * lai, nghĩa hoàn toàn khác.
 */
function questToJobShape(raw) {
  return {
    ...raw,
    jobType: raw.category,              // SMALL_EVENT, SCHOOL_CAMPAIGN… đã có nhãn sẵn trong JOB_TYPE_LABELS
    compensation: null,                 // quest trả thưởng bằng EXP/NP chứ không phải tiền
    deadlineAt: raw.endsAt || null,
    applicantsCount: raw.applicantCount,
    isRemote: /remote|từ xa/i.test(raw.location || ''),
    givesProof: true,                   // mọi quest đều sinh minh chứng khi hoàn thành
  };
}

/** Điểm vào duy nhất: tin tuyển dụng đi thẳng, quest đi qua bước chuyển dạng. */
function toCard(raw) {
  return normalizeJob(raw.__kind === 'QUEST' ? questToJobShape(raw) : raw);
}

/**
 * Dãy số trang hiển thị: luôn có trang đầu, trang cuối, trang hiện tại và hai
 * trang kề bên; phần bị bỏ qua thay bằng '…'.
 *
 * Mục đích là giữ thanh phân trang có chiều rộng ổn định. Liệt kê hết số trang
 * thì với 20 trang thanh này sẽ tràn ngang trên điện thoại.
 */
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) out.push('…');
  for (let n = from; n <= to; n += 1) out.push(n);
  if (to < total - 1) out.push('…');
  out.push(total);
  return out;
}

function normalizeJob(raw) {
  // Only the organization's own type decides CLB vs doanh nghiệp — a job type
  // like EVENT_STAFF or a company name containing "CLB" is not evidence.
  const isClub = raw.companyType === 'CLUB' || raw.organizationType === 'CLUB';

  const orgType = isClub ? 'CLUB' : 'BUSINESS';
  const orgTypeLabel = isClub ? 'CLB / Tổ chức' : 'Doanh nghiệp';
  const campus = raw.campus || null;

  const expReward = raw.expReward || null;
  const rsReward = raw.rsReward || null;
  const npReward = raw.npReward || null;
  const givesProof = Boolean(raw.givesProof);

  const rawSalary = formatSalary(raw.compensation);
  const salary = isClub && !rawSalary ? 'Hỗ trợ sự kiện & Proof' : (rawSalary || 'Lương không công khai');
  const salaryKnown = Boolean(rawSalary);

  const skills = (raw.skills || []).map((s) => s.skillName || s.name || s).filter(Boolean);
  const workForm = raw.isRemote ? 'Remote' : 'On-site';
  const location = raw.location || 'Không xác định';
  // Bộ lọc gom theo tỉnh/thành, còn thẻ tin vẫn hiển thị địa chỉ đầy đủ.
  // null khi không đoán được tỉnh: tin đó không tạo thêm lựa chọn trong dropdown.
  const province = extractProvince(raw.location);
  const locationLabel = location.toLowerCase() === workForm.toLowerCase()
    ? location
    : `${location} (${workForm})`;

  return {
    id: String(raw.id),
    /* Quest và tin tuyển dụng nằm ở hai bảng, hai endpoint, hai trang chi tiết.
       Sau khi trộn vào một danh sách thì phải mang theo dấu vết đó, nếu không
       bấm vào một quest sẽ nhảy sang /jobs/:id và ra trang trống. */
    kind: raw.__kind === 'QUEST' ? 'QUEST' : 'JOB',
    title: raw.title || 'Chưa đặt tên',
    company: raw.companyName || (isClub ? 'CLB Sinh Viên' : 'Nhà tuyển dụng'),
    companyLogo: raw.companyLogo || null,
    companyType: raw.companyType || orgType,
    isClub,
    orgType,
    orgTypeLabel,
    campus,
    expReward,
    rsReward,
    npReward,
    givesProof,
    description: (raw.description || '').trim(),
    salary,
    salaryKnown,
    location,
    province,
    locationLabel,
    workForm,
    type: JOB_TYPE_LABELS[raw.jobType] || raw.jobType || (isClub ? 'Sự kiện CLB' : 'Khác'),
    skills,
    posted: relativeTime(raw.createdAt),
    postedBucket: postedBucket(raw.createdAt),
    applicants: applicantText(raw.applicantsCount),
    applicantBucket: applicantBucket(raw.applicantsCount),
  };
}

function FilterChip({ def, values, options, open, onToggle, onPick }) {
  const [q, setQ] = useState('');
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ('');
    }
  }, [open]);
  const count = values.length;
  const label = count === 0 ? def.label : count === 1 ? values[0] : `${def.label} · ${count}`;
  const shown = def.searchable && q.trim()
    ? options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase()))
    : options;
  return (
    <div className="jb-chip-wrap">
      <button
        type="button"
        className={`jb-chip${count ? ' active' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>
      {open && (
        <div className="jb-menu" role="menu">
          {def.searchable && (
            <div className="jb-menu-searchwrap">
              <Search size={14} />
              <input
                className="jb-menu-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Tìm ${def.label.toLowerCase()}...`}
                aria-label={`Tìm ${def.label.toLowerCase()}`}
                autoFocus
              />
            </div>
          )}
          {shown.map((opt) => {
            const on = values.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className={`jb-menu-item${on ? ' active' : ''}`}
                onClick={() => onPick(def.key, opt)}
                role="menuitemcheckbox"
                aria-checked={on}
              >
                <span className="jb-check">{on && <Check size={13} strokeWidth={3} />}</span>
                {opt}
              </button>
            );
          })}
          {shown.length === 0 && <div className="jb-menu-empty">Không tìm thấy</div>}
        </div>
      )}
    </div>
  );
}

function JobLogo({ job, index }) {
  if (job.companyLogo) {
    return <span className="jb-logo jb-logo-img"><img src={job.companyLogo} alt="" /></span>;
  }
  if (job.isClub) {
    return (
      <span className="jb-logo jb-logo-club" style={{ background: 'rgba(16,185,129,0.16)', color: EMERALD, border: '1px solid rgba(16,185,129,0.35)' }}>
        <GraduationCap size={26} strokeWidth={2.2} />
      </span>
    );
  }
  return (
    <span className="jb-logo" style={{ background: LOGO_COLORS[index % LOGO_COLORS.length] }}>
      {initials(job.company) || <Building2 size={22} />}
    </span>
  );
}

function SharePopover({ job, onClose }) {
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef(null);
  const shareUrl = `${window.location.origin}/jobs/${job.id}`;

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  function handleCopy() {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const shareOptions = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      name: 'X',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(job.title)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Zalo',
      url: `https://sp.zalo.me/share_inline?link=${encodeURIComponent(shareUrl)}`,
      icon: (
        <span style={{ fontSize: '15.5px', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px', lineHeight: 1 }}>
          Zalo
        </span>
      ),
    },
  ];

  return (
    <div
      ref={popoverRef}
      className="jb-share-dropdown"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        background: '#ffffff',
        border: '1px solid #e2efe9',
        borderRadius: '24px',
        boxShadow: '0 16px 40px rgba(6, 40, 36, 0.16)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 60,
        animation: 'jbShareFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <style>{`
        @keyframes jbShareFade {
          0% { opacity: 0; transform: translateY(-6px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .jb-share-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          color: #374151;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }
        .jb-share-btn:hover {
          background: #f1f8f4;
          color: #0d9488;
          transform: translateY(-2px);
        }
        .jb-copied-tag {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #042f2e;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }
      `}</style>
      {shareOptions.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="jb-share-btn"
          title={`Chia sẻ lên ${item.name}`}
          onClick={onClose}
        >
          {item.icon}
        </a>
      ))}
      <button
        type="button"
        className="jb-share-btn"
        onClick={handleCopy}
        title="Sao chép liên kết"
      >
        {copied ? (
          <>
            <Check size={22} color="#10b981" />
            <span className="jb-copied-tag">Đã sao chép!</span>
          </>
        ) : (
          <Link2 size={22} />
        )}
      </button>
    </div>
  );
}

function JobDetail({ job, onClose, saved, onToggleSave, closing, onApply }) {
  const [showShare, setShowShare] = useState(false);
  const descParas = job.description ? job.description.split(/\n+/).map((s) => s.trim()).filter(Boolean) : [];
  
  const requirements = [
    job.skills.length ? `Có kiến thức hoặc định hướng với ${job.skills.join(', ')}.` : 'Tinh thần cầu tiến, nhiệt huyết và sẵn sàng học hỏi.',
    'Kỹ năng giao tiếp và làm việc nhóm tốt.',
    'Chủ động, có trách nhiệm và cam kết đồng hành cùng chương trình.',
  ];

  const benefits = job.isClub ? [
    'Nhận giấy chứng nhận hoạt động & Verified Proof of Work chính thức từ CLB.',
    `Tích luỹ +${job.expReward || 120} EXP kinh nghiệm & +${job.rsReward || 5} Điểm uy tín (RS) vào hồ sơ.`,
    'Môi trường hoạt động năng động, cọ xát thực tế và kết nối mạng lưới sinh viên tài năng.',
    'Cơ hội thăng tiến vào Core Team / Ban Chủ Nhiệm hoặc nhận thư giới thiệu từ CLB.',
  ] : [
    `Mức lương / thù lao: ${job.salary}.`,
    `Hình thức làm việc: ${job.workForm} · ${job.type}.`,
    'Tích luỹ EXP, RS và NP trên NextPlease sau khi hoàn thành nhiệm vụ.',
    'Cơ hội phát triển nghề nghiệp và làm việc cùng đội ngũ chuyên nghiệp.',
  ];

  return (
    <aside className={`jb-detail${closing ? ' out' : ''}`}>
      <div className="jb-detail-head">
        <div className="jb-detail-id">
          <JobLogo job={job} index={0} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              {job.isClub ? (
                <span className="jb-org-pill club">
                  <GraduationCap size={13} /> CLB Sinh Viên {job.campus ? `· ${job.campus}` : ''}
                </span>
              ) : (
                <span className="jb-org-pill biz">
                  <Building2 size={13} /> Doanh nghiệp
                </span>
              )}
            </div>
            <h2>{job.title}</h2>
            <div className="jb-company">{job.company}</div>
          </div>
        </div>
        <div className="jb-detail-actions">
          <button type="button" className="jb-apply" onClick={() => onApply(job.id)}>
            {job.isClub ? 'Ứng tuyển / Tham gia' : 'Ứng tuyển'}
          </button>
          <button type="button" className={`jb-iconbtn${saved ? ' on' : ''}`} onClick={onToggleSave} aria-label="Lưu việc làm"><Heart size={19} fill={saved ? '#ef5da8' : 'none'} /></button>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`jb-iconbtn${showShare ? ' on' : ''}`}
              onClick={() => setShowShare((prev) => !prev)}
              aria-label="Chia sẻ"
            >
              <Share2 size={18} />
            </button>
            {showShare && (
              <SharePopover
                job={job}
                onClose={() => setShowShare(false)}
              />
            )}
          </div>
          <button type="button" className="jb-iconbtn" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
        </div>
      </div>
      <div className="jb-detail-body">
        <div className="jb-detail-meta">
          <span><Wallet size={16} /> <b className={job.salaryKnown ? 'jb-pay' : ''}>{job.salary}</b></span>
          <span><MapPin size={16} /> {job.locationLabel}</span>
          <span><Briefcase size={16} /> {job.type}</span>
          <span className="accent"><Clock size={16} /> {job.posted}</span>
          <span className="accent"><Users size={16} /> {job.applicants}</span>
        </div>

        {/* Rewards Section for CLB */}
        {(job.givesProof || job.expReward || job.rsReward) && (
          <div className="jb-detail-rewards">
            <div className="jb-reward-title"><Sparkles size={15} /> Minh chứng & Phần thưởng hệ thống</div>
            <div className="jb-reward-grid">
              {job.givesProof && (
                <div className="jb-reward-card">
                  <ShieldCheck size={20} color={EMERALD} />
                  <div>
                    <strong>Cấp Verified Proof</strong>
                    <span>Chứng nhận số lưu trực tiếp vào Portfolio</span>
                  </div>
                </div>
              )}
              {(job.expReward || job.rsReward) && (
                <div className="jb-reward-card">
                  <Zap size={20} color="#f59e0b" />
                  <div>
                    <strong>{[job.expReward && `+${job.expReward} EXP`, job.rsReward && `+${job.rsReward} RS`].filter(Boolean).join(' & ')}</strong>
                    <span>Gia tăng cấp độ và điểm uy tín cá nhân</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {job.skills.length > 0 && (
          <div className="jb-skillrow">
            {job.skills.map((s) => <span key={s} className="jb-skill">{s}</span>)}
          </div>
        )}

        <section>
          <h3>Mô tả {job.isClub ? 'hoạt động / vai trò' : 'công việc'}</h3>
          {descParas.length
            ? descParas.map((p, i) => <p key={i} className="jb-detail-p">{p}</p>)
            : (
              <ul>
                <li>{`Trực tiếp tham gia vai trò ${job.title.toLowerCase()}.`}</li>
                <li>Phối hợp cùng các thành viên trong ban để triển khai kế hoạch.</li>
                <li>Theo dõi, báo cáo tiến độ và kết quả các chặng hoạt động.</li>
              </ul>
            )}
        </section>
        <section>
          <h3>Yêu cầu ứng tuyển</h3>
          <ul>{requirements.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
        <section>
          <h3>Quyền lợi & Giá trị nhận được</h3>
          <ul>{benefits.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>

        <button type="button" className="jb-apply jb-apply-lg" onClick={() => onApply(job.id)}>
          {job.isClub ? 'Nộp hồ sơ tham gia ngay' : 'Ứng tuyển ngay'} <ArrowRight size={17} />
        </button>
      </div>
    </aside>
  );
}

export function JobsPage() {
  const navigate = useNavigate();
  const { openLoginModal } = useAuthModal();
  // Trang chủ gửi từ khoá sang bằng /jobs?q=… nên ô tìm kiếm mở lên đã có sẵn chữ.
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const [filters, setFilters] = useState({});
  const [activeOrgTab, setActiveOrgTab] = useState('ALL'); // 'ALL' | 'BUSINESS' | 'CLUB'
  const [openChip, setOpenChip] = useState(null);
  const [view, setView] = useState('list');
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState(() => {
    const raw = getCachedOpportunities();
    return Array.isArray(raw) ? raw.map(toCard) : [];
  });
  const [loading, setLoading] = useState(() => !getCachedOpportunities());
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(() => searchParams.get('preview'));
  const [closing, setClosing] = useState(false);
  // Trạng thái lưu nằm ở kho dùng chung (lib/savedJobs.js) chứ không phải state
  // cục bộ: trước đây trang này chỉ ghi localStorage nên khu vực ứng viên —
  // vốn đọc từ API — không bao giờ thấy tin đã lưu.
  const { savedIds: saved, toggleSave: toggleSavedJob } = useSavedJobs();
  const barRef = useRef(null);

  // Load real job postings
  useEffect(() => {
    let alive = true;
    loadOpportunities({ limit: 60 })
      .then((data) => {
        if (!alive) return;
        setJobs(Array.isArray(data) ? data.map(toCard) : []);
      })
      .catch(() => {
        if (alive) {
          setLoadError('Không tải được danh sách cơ hội. Vui lòng thử lại sau.');
          setJobs([]);
        }
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // Close any open dropdown when clicking outside the filter bar.
  useEffect(() => {
    function onDown(e) {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenChip(null);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (selectedId == null || closing) return;
    const el = document.querySelector(`[data-job-id="${selectedId}"]`);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = 150;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }, [selectedId, closing, jobs]);

  const optionsFor = useMemo(() => {
    const map = {};
    for (const def of FILTER_DEFS) {
      const values = [...new Set(jobs.map((j) => j[def.key]).filter(Boolean))];
      // Danh sách tỉnh/thành dài nên sắp theo alphabet tiếng Việt cho dễ tìm.
      map[def.key] = def.key === 'province' ? values.sort((a, b) => a.localeCompare(b, 'vi')) : values;
    }
    return map;
  }, [jobs]);

  const bizCount = useMemo(() => jobs.filter((j) => !j.isClub).length, [jobs]);
  const clubCount = useMemo(() => jobs.filter((j) => j.isClub).length, [jobs]);

  const filtered = useMemo(() => jobs.filter((job) => {
    if (activeOrgTab === 'BUSINESS' && job.isClub) return false;
    if (activeOrgTab === 'CLUB' && !job.isClub) return false;

    const haystack = `${job.title} ${job.company} ${job.location} ${job.type} ${job.skills.join(' ')}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    return Object.entries(filters).every(([key, vals]) => !vals || vals.length === 0 || vals.includes(job[key]));
  }), [query, filters, jobs, activeOrgTab]);

  /* ── Phân trang ────────────────────────────────────────────────────────
     Cắt trang ở phía client vì toàn bộ dữ liệu đã nằm sẵn trong bộ nhớ (60 tin
     + quest, lấy một lần rồi cache). Không gọi lại API theo từng trang: bộ lọc
     và ô tìm kiếm cũng đang chạy hoàn toàn ở client, nên nếu phân trang ở
     server thì hai bên sẽ đếm lệch nhau.

     Khi nào số cơ hội vượt vài trăm thì phải chuyển cả lọc lẫn phân trang sang
     server một lượt, chứ không nửa này nửa kia. */
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const listTopRef = useRef(null);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  /* Kẹp trong khoảng hợp lệ ngay lúc render thay vì sửa state trong effect:
     đổi bộ lọc làm số trang tụt xuống, và nếu chờ effect thì có một nhịp render
     hiện danh sách rỗng. */
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  /* Đổi bộ lọc / từ khoá / tab thì quay về trang đầu.

     Chỉnh state ngay trong lúc render thay vì trong useEffect: đây là cách
     React khuyến nghị cho loại "state phụ thuộc state khác", và useEffect ở
     đây vừa vi phạm quy tắc lint vừa tạo thêm một nhịp render trung gian mà
     người dùng thấy được. */
  const filterSignature = `${query}|${activeOrgTab}|${JSON.stringify(filters)}`;
  const [lastSignature, setLastSignature] = useState(filterSignature);
  if (lastSignature !== filterSignature) {
    setLastSignature(filterSignature);
    setPage(1);
  }

  function goToPage(next) {
    const target = Math.min(Math.max(1, next), pageCount);
    setPage(target);
    // Cuộn về đầu danh sách, nếu không người dùng sang trang mới mà vẫn đang ở giữa trang.
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const activeCount = Object.values(filters).filter((v) => v && v.length).length;

  function pick(key, opt) {
    setFilters((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt];
      return { ...prev, [key]: next };
    });
  }

  function clearFilters() { setFilters({}); setQuery(''); setOpenChip(null); setActiveOrgTab('ALL'); }

  function setPreviewParam(id) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (id == null) p.delete('preview'); else p.set('preview', String(id));
      return p;
    }, { replace: true });
  }

  function openJob(id) { setClosing(false); setSelectedId(id); setPreviewParam(id); }
  function closeDetail() {
    setClosing(true);
    window.setTimeout(() => { setSelectedId(null); setClosing(false); setPreviewParam(null); }, 230);
  }

  const selectedJob = jobs.find((j) => String(j.id) === String(selectedId)) || null;

  function toggleSave(id) {
    // Chưa đăng nhập thì lưu ở máy cũng vô nghĩa: danh sách nằm ở tài khoản.
    // Hỏi đăng nhập ngay, và mergeGuestSaves sẽ đẩy nốt những gì đã lưu trước đó.
    if (!getStoredToken()) {
      openLoginModal('candidate');
      return;
    }
    toggleSavedJob(id).catch(() => {});
  }

  function handleApply(jobId) {
    if (!getStoredToken()) {
      openLoginModal('candidate');
      return;
    }
    // Quest có trang chi tiết riêng (/quests/:id); gửi nhầm sang /jobs/:id là ra trang trống.
    const item = jobs.find((j) => j.id === jobId);
    navigate(item?.kind === 'QUEST' ? `/quests/${jobId}` : `/jobs/${jobId}`);
  }

  function handleToggleSave(id) {
    if (!getStoredToken()) {
      openLoginModal('candidate');
      return;
    }
    toggleSave(id);
  }

  return (
    <div style={{ background: INK, color: ON_DARK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', position: 'relative', overflowX: 'clip', fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}>
      <style>{`
        .jb-inner { position: relative; z-index: 1; width: min(1180px, calc(100% - 40px)); margin: 0 auto; }

        /* ── Hero ──
           Cùng tấm mesh với trang chủ (<HeroMesh />). Thanh điều hướng ở chế độ
           đè nên hero phải tự chừa chỗ cho nó: 24px lề trên + 56px thanh. */
        .jb-bg { position: absolute; inset: 0 0 auto; height: 720px; overflow: hidden; pointer-events: none; z-index: 0; }
        .jb-hero { position: relative; z-index: 1; padding: clamp(112px, 10vw, 136px) 0 clamp(28px, 3vw, 40px); }
        .jb-hero-inner { position: relative; z-index: 3; width: min(1180px, calc(100% - 40px)); margin: 0 auto; }
        /* Ô lọc: cùng ngôn ngữ với ô tìm việc ở trang chủ, chỉ thấp hơn. */
        /* Trải hết bề ngang khung nội dung và hạ chiều cao xuống 56px: đây là
           ô lọc của một trang danh sách, không phải nhân vật chính như ô tìm
           việc ở hero trang chủ — để nó vừa cao vừa ngắn thì nhìn thô. */
        .jb-search {
          position: relative; display: flex; align-items: center;
          height: 56px; width: 100%;
          background: #fff; border-radius: 14px;
        }
        .jb-search-icon { position: absolute; left: 18px; color: #252630; pointer-events: none; }
        .jb-search input {
          box-sizing: border-box; width: 100%; height: 100%;
          border: 0; outline: 0; border-radius: 14px; background: transparent;
          padding: 0 52px 0 52px;
          font: inherit; font-size: 1rem; letter-spacing: -0.015em; color: #252630;
        }
        .jb-search input::placeholder { color: #8d9a97; }
        .jb-search-clear {
          position: absolute; right: 14px; display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border: 0; border-radius: 9999px; cursor: pointer;
          background: rgba(37,38,48,0.08); color: #252630; transition: background-color 150ms ease;
        }
        .jb-search-clear:hover { background: rgba(37,38,48,0.18); }

        /* Đây mới là thứ cần bám khi cuộn: lọc xong mà phải cuộn ngược lên đầu
           trang để đổi bộ lọc thì vô dụng. Thanh điều hướng thì trôi đi
           (SiteHeader pinned={false}) nên top = 0, không phải né gì cả. */
        .jb-filterbar {
          position: sticky; top: 0; z-index: 40;
          /* Nằm đè lên mesh và lên danh sách nên nền phải đục hơn lúc trước. */
          background: rgba(11,15,14,0.86);
          backdrop-filter: saturate(160%) blur(14px); -webkit-backdrop-filter: saturate(160%) blur(14px);
          border-top: 1px solid ${LINE}; border-bottom: 1px solid ${LINE}; padding: 14px 0;
        }
        .jb-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
        .jb-chip-wrap { position: relative; }
        .jb-chip {
          display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
          background: transparent; border: 1px solid ${LINE_STRONG}; color: ${ON_DARK};
          border-radius: 8px; padding: 10px 14px; font: inherit; font-size: 0.875rem; font-weight: 500;
          cursor: pointer; transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
        }
        .jb-chip:hover { background-color: rgba(255,255,255,0.1); }
        .jb-chip.active { background: rgba(16,185,129,0.14); border-color: rgba(16,185,129,0.55); color: ${EMERALD}; }

        .jb-menu { position: absolute; top: calc(100% + 8px); left: 0; z-index: 50; min-width: 220px; background: ${SURFACE}; border: 1px solid ${LINE_STRONG}; border-radius: 14px; box-shadow: 0 22px 50px rgba(0,0,0,0.55); padding: 6px; max-height: 320px; overflow: auto; }
        .jb-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; border: 0; background: transparent; padding: 10px 12px; border-radius: 9px; font: inherit; font-size: 0.9rem; color: ${ON_DARK}; cursor: pointer; transition: background-color 150ms ease; }
        .jb-menu-item:hover { background: rgba(255,255,255,0.08); }
        .jb-menu-item.active { color: ${EMERALD}; font-weight: 600; }
        .jb-check { flex-shrink: 0; width: 17px; height: 17px; border-radius: 5px; border: 1.5px solid ${LINE_STRONG}; display: inline-flex; align-items: center; justify-content: center; color: ${INK}; transition: background 0.15s ease, border-color 0.15s ease; }
        .jb-menu-item.active .jb-check { background: ${EMERALD}; border-color: ${EMERALD}; }
        .jb-menu-searchwrap { display: flex; align-items: center; gap: 7px; padding: 9px 11px; margin-bottom: 4px; border: 1px solid ${LINE}; border-radius: 9px; color: ${MUTED}; }
        .jb-menu-search { border: 0; outline: 0; flex: 1; min-width: 0; font: inherit; font-size: 0.88rem; color: ${ON_DARK}; background: transparent; }
        .jb-menu-search::placeholder { color: rgba(255,255,255,0.4); }
        .jb-menu-empty { padding: 10px 12px; color: ${MUTED}; font-size: 0.86rem; }
        .jb-clear { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 0; color: ${EMERALD}; font: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; padding: 8px; }
        .jb-clear:hover { text-decoration: underline; text-underline-offset: 4px; }

        /* ── Tab nguồn đăng ── */
        .jb-org-tabs { display: inline-flex; gap: 4px; margin: 28px 0 4px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px; border: 1px solid ${LINE}; flex-wrap: wrap; }
        .jb-org-tab { display: inline-flex; align-items: center; gap: 8px; border: none; background: transparent; color: ${MUTED}; padding: 9px 16px; border-radius: 8px; font: inherit; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background-color 150ms ease, color 150ms ease; }
        .jb-org-tab:hover { color: ${ON_DARK}; background: rgba(255,255,255,0.06); }
        .jb-org-tab.active { background: ${EMERALD}; color: ${INK}; font-weight: 600; }
        .jb-org-count { display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); color: inherit; font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
        .jb-org-tab.active .jb-org-count { background: rgba(11,15,14,0.18); }

        /* ── Nhãn nguồn trên thẻ ── */
        .jb-org-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 500; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${LINE_STRONG}; color: rgba(255,255,255,0.82); }
        .jb-org-pill.club { border-color: rgba(16,185,129,0.4); color: ${EMERALD}; }

        /* ── Huy hiệu phần thưởng ── */
        .jb-reward-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid ${LINE}; }
        .jb-reward-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 500; padding: 4px 10px; border-radius: 8px; border: 1px solid ${LINE_STRONG}; color: rgba(255,255,255,0.82); }
        .jb-reward-badge.proof { border-color: rgba(16,185,129,0.4); color: ${EMERALD}; }
        .jb-reward-badge.exp { border-color: rgba(251,191,36,0.4); color: #fbbf24; }
        .jb-reward-badge.rs { border-color: rgba(103,232,249,0.4); color: #67e8f9; }

        .jb-detail-rewards { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.28); border-radius: 16px; padding: 16px; margin: 18px 0 8px; }
        .jb-reward-title { font-size: 0.875rem; font-weight: 600; color: ${EMERALD}; display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
        .jb-reward-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 600px) { .jb-reward-grid { grid-template-columns: 1fr; } }
        .jb-reward-card { background: rgba(255,255,255,0.04); border: 1px solid ${LINE}; border-radius: 12px; padding: 11px 13px; display: flex; align-items: center; gap: 10px; }
        .jb-reward-card strong { display: block; font-size: 0.875rem; font-weight: 500; color: ${ON_DARK}; }
        .jb-reward-card span { font-size: 0.78rem; color: ${MUTED}; }

        /* ── Đầu danh sách ── */
        .jb-listhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 22px 0 18px; flex-wrap: wrap; }
        .jb-listhead h1 { font-family: inherit; margin: 0; font-size: 1.125rem; font-weight: 400; letter-spacing: -0.015em; color: ${MUTED}; }
        .jb-listhead h1 b { color: ${ON_DARK}; font-weight: 600; }
        .jb-viewtoggle { display: inline-flex; background: rgba(255,255,255,0.05); border: 1px solid ${LINE}; border-radius: 10px; padding: 3px; }
        .jb-viewbtn { border: 0; background: transparent; color: ${MUTED}; padding: 7px 9px; border-radius: 7px; cursor: pointer; display: inline-flex; transition: background-color 150ms ease, color 150ms ease; }
        .jb-viewbtn:hover { color: ${ON_DARK}; }
        .jb-viewbtn.active { background: rgba(255,255,255,0.1); color: ${ON_DARK}; }

        .jb-results { padding-bottom: 80px; }
        .jb-results.split { display: grid; grid-template-columns: minmax(320px, 420px) 1fr; gap: 18px; align-items: start; }
        .jb-list { display: grid; gap: 14px; }
        .jb-list.grid { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 780px) { .jb-list.grid { grid-template-columns: 1fr; } }

        /* ── Thẻ tin ──
           Cùng công thức với thẻ việc làm ở trang chủ: nền trong suốt, viền
           hairline, hover thì viền lên emerald + nhấc nhẹ + một quầng sáng ở
           góc dưới-phải. Không dùng box-shadow màu. */
        .jb-card {
          position: relative; overflow: hidden; display: block; cursor: pointer;
          background: rgba(255,255,255,0.016); border: 1px solid ${LINE}; border-radius: 20px;
          padding: 22px 24px; color: inherit; text-decoration: none;
          transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), background-color 0.25s ease, border-color 0.25s ease;
        }
        .jb-card::before { content: ''; position: absolute; inset: 0 0 auto; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); opacity: 0.5; transition: opacity 0.25s ease; }
        .jb-card::after { content: ''; position: absolute; right: -40%; bottom: -60%; width: 90%; height: 150%; pointer-events: none; background: radial-gradient(closest-side, rgba(16,185,129,0.2), rgba(16,185,129,0) 70%); opacity: 0; transition: opacity 0.3s ease; }
        .jb-card > * { position: relative; z-index: 1; }
        .jb-card:hover { transform: translateY(-4px); background-color: rgba(255,255,255,0.05); border-color: rgba(16,185,129,0.55); }
        .jb-card:hover::before { opacity: 1; }
        .jb-card:hover::after { opacity: 1; }
        .jb-card:active { transform: scale(0.99); }
        .jb-card.selected { border-color: ${EMERALD}; background-color: rgba(16,185,129,0.08); transform: none; }
        .jb-card.is-club::before { background: linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent); opacity: 0.8; }

        .jb-card-top { display: flex; align-items: flex-start; gap: 14px; }
        .jb-logo { flex-shrink: 0; width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-weight: 600; font-size: 0.95rem; color: ${ON_DARK}; }
        .jb-logo-img { background: #fff; border: 1px solid ${LINE}; overflow: hidden; }
        .jb-logo-img img { width: 100%; height: 100%; object-fit: cover; }
        .jb-title { font-family: inherit; margin: 0; font-size: 1.0625rem; font-weight: 500; line-height: 1.35; letter-spacing: -0.015em; color: ${ON_DARK}; padding-right: 34px; }
        .jb-company { color: ${MUTED}; font-size: 0.875rem; margin-top: 4px; }
        .jb-save { position: absolute; top: 20px; right: 20px; z-index: 2; border: 0; background: transparent; color: rgba(255,255,255,0.35); cursor: pointer; padding: 4px; border-radius: 8px; transition: color 0.2s, transform 0.2s; }
        .jb-save:hover { color: ${EMERALD}; transform: scale(1.1); }
        .jb-save.on { color: #ef5da8; }
        .jb-divider { height: 1px; background: ${LINE}; margin: 16px 0; }
        .jb-meta { display: flex; flex-direction: column; gap: 9px; }
        .jb-metarow { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; font-size: 0.875rem; color: ${MUTED}; }
        .jb-metarow span { display: inline-flex; align-items: center; gap: 6px; }
        .jb-metarow.accent span { color: rgba(255,255,255,0.5); }
        .jb-pay { color: ${EMERALD}; font-weight: 500; }
        .jb-empty { background: transparent; border: 1px solid ${LINE}; border-radius: 20px; padding: 56px 24px; text-align: center; color: ${MUTED}; }

        /* ── Panel chi tiết ── */
        .jb-detail { position: sticky; top: 90px; align-self: start; display: flex; flex-direction: column; background: ${SURFACE}; border: 1px solid ${LINE_STRONG}; border-radius: 20px; height: calc(100vh - 112px); overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.5); animation: jbDetailIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .jb-detail.out { animation: jbDetailOut 0.22s ease-in both; }
        @keyframes jbDetailIn { from { opacity: 0; transform: translateX(28px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes jbDetailOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(28px) scale(0.98); } }
        .jb-detail-body > * { animation: jbRise 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .jb-detail-body > :nth-child(1) { animation-delay: 0.04s; }
        .jb-detail-body > :nth-child(2) { animation-delay: 0.09s; }
        .jb-detail-body > :nth-child(3) { animation-delay: 0.14s; }
        .jb-detail-body > :nth-child(4) { animation-delay: 0.19s; }
        .jb-detail-body > :nth-child(5) { animation-delay: 0.24s; }
        .jb-detail-body > :nth-child(6) { animation-delay: 0.29s; }
        @keyframes jbRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .jb-detail, .jb-detail.out, .jb-detail-body > * { animation: none !important; }
        }
        .jb-detail-head { flex-shrink: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 20px; background: rgba(255,255,255,0.03); border-bottom: 1px solid ${LINE}; border-radius: 20px 20px 0 0; }
        .jb-detail-id { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .jb-detail h2 { font-family: inherit; margin: 0; font-size: 1.125rem; font-weight: 500; letter-spacing: -0.015em; color: ${ON_DARK}; }
        .jb-detail-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .jb-pager { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 28px; padding-top: 22px; border-top: 1px solid rgba(255,255,255,0.1); }
        .jb-pagebtn {
          min-width: 38px; height: 38px; padding: 0 10px;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: rgba(233,247,242,0.72);
          border: 1px solid rgba(255,255,255,0.14); border-radius: 8px;
          font: inherit; font-size: 0.9375rem; cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
        }
        .jb-pagebtn:hover:not(:disabled) { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.28); }
        .jb-pagebtn.active { background: ${EMERALD}; color: ${INK}; border-color: ${EMERALD}; font-weight: 600; }
        /* Nút đã tắt vẫn chiếm chỗ để thanh không nhảy khi sang trang đầu/cuối. */
        .jb-pagebtn:disabled { opacity: 0.35; cursor: default; }
        .jb-pagegap { min-width: 22px; text-align: center; color: rgba(233,247,242,0.45); user-select: none; }
        .jb-pageinfo { margin-left: auto; font-size: 0.875rem; color: rgba(233,247,242,0.62); }
        @media (max-width: 560px) {
          .jb-pageinfo { margin-left: 0; width: 100%; order: 2; }
        }
        .jb-apply { display: inline-flex; align-items: center; gap: 6px; background: ${EMERALD}; color: ${INK}; border: none; border-radius: 8px; padding: 11px 18px; font: inherit; font-weight: 500; font-size: 0.9375rem; text-decoration: none; cursor: pointer; white-space: nowrap; transition: background-color 150ms ease; }
        .jb-apply:hover { background: #34d399; }
        .jb-iconbtn { width: 40px; height: 40px; border-radius: 8px; border: 1px solid ${LINE_STRONG}; background: transparent; color: ${MUTED}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.2s, border-color 0.2s, background-color 0.2s; }
        .jb-iconbtn:hover { border-color: rgba(16,185,129,0.5); color: ${EMERALD}; background: rgba(255,255,255,0.05); }
        .jb-iconbtn.on { color: #ef5da8; border-color: rgba(239,93,168,0.5); }
        .jb-detail-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 20px 22px 26px; }
        .jb-detail-meta { display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; color: ${MUTED}; }
        .jb-detail-meta span { display: inline-flex; align-items: center; gap: 8px; }
        .jb-detail-meta .accent { color: ${EMERALD}; }
        .jb-detail-p { margin: 0 0 10px; color: ${MUTED}; font-size: 0.9rem; line-height: 1.7; white-space: pre-line; }
        .jb-skillrow { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 4px; }
        .jb-skill { background: rgba(255,255,255,0.05); border: 1px solid ${LINE}; color: rgba(255,255,255,0.82); border-radius: 9999px; padding: 6px 13px; font-size: 0.8rem; font-weight: 500; }
        .jb-detail section { margin-top: 24px; }
        .jb-detail h3 { font-family: inherit; margin: 0 0 10px; font-size: 1rem; font-weight: 500; color: ${ON_DARK}; }
        .jb-detail ul { margin: 0; padding-left: 20px; color: ${MUTED}; font-size: 0.9rem; line-height: 1.75; }
        .jb-apply-lg { margin-top: auto; width: 100%; justify-content: center; padding: 15px 0; font-size: 1rem; }
        .jb-detail section:last-of-type { margin-bottom: 24px; }

        @media (max-width: 900px) {
          .jb-results.split { grid-template-columns: 1fr; }
          .jb-results.split .jb-col-list { display: none; }
          .jb-detail { position: static; height: auto; max-height: none; }
          .jb-detail-body { overflow: visible; }
          .jb-apply-lg { margin-top: 24px; }
        }

        @media (max-width: 560px) {
          .jb-search { height: 56px; }
          .jb-search input { font-size: 1rem; padding: 0 52px; }
          /* Ba nhãn dài không chia được đều trên màn hẹp: "Doanh nghiệp tuyển
             dụng" vỡ thành 3 dòng trong khi nhãn khác chỉ 1–2, nhìn rất lởm
             chởm. Xếp dọc, mỗi tab một dòng, số đếm đẩy sang phải. */
          .jb-org-tabs { width: 100%; flex-direction: column; flex-wrap: nowrap; }
          .jb-org-tab { width: 100%; justify-content: flex-start; white-space: nowrap; }
          .jb-org-tab .jb-org-count { margin-left: auto; }
        }
      `}</style>

      <SiteHeader overlay pinned={false} />

      {/* hero — tiêu đề trang + ô tìm kiếm */}
      {/* Tấm mesh nằm ở tầng nền của CẢ TRANG chứ không nằm trong hero: hero ở
          đây chỉ cao ~350px, nhét mesh vào trong thì các quầng (định vị bằng %)
          bị bóp dẹt và vignette tắt ngay, nên màu không kịp loang. Cho nó cao
          900px và đè xuống qua thanh lọc thì mới ra được vệt loang như trang
          chủ. */}
      <div className="jb-bg" aria-hidden="true">
        <HeroMesh veil="radial-gradient(100% 92% at 50% 22%, rgba(11,15,14,0) 0%, #0b0f0e 100%)" />
      </div>

      <section className="jb-hero">
        <div className="jb-hero-inner">
          {/* Danh sách lọc ngay khi gõ, nên không có nút "Tìm kiếm" — một nút
              không làm gì thêm chỉ khiến người dùng tưởng phải bấm mới ra kết
              quả. Kính lúp nằm trong ô là quy ước cho ô lọc tức thời. */}
          <form className="jb-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <Search className="jb-search-icon" size={22} strokeWidth={1.8} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm cơ hội, CLB, doanh nghiệp hoặc kỹ năng…"
              aria-label="Tìm kiếm cơ hội"
            />
            {query && (
              <button type="button" className="jb-search-clear" aria-label="Xoá từ khoá" onClick={() => setQuery('')}>
                <X size={18} />
              </button>
            )}
          </form>
        </div>
      </section>

      {/* sticky filter chips */}
      <div className="jb-filterbar" ref={barRef}>
        <div className="jb-inner jb-filters">
          {FILTER_DEFS.map((def) => (
            <FilterChip
              key={def.key}
              def={def}
              values={filters[def.key] || []}
              options={optionsFor[def.key]}
              open={openChip === def.key}
              onToggle={() => setOpenChip((cur) => (cur === def.key ? null : def.key))}
              onPick={pick}
            />
          ))}
          {(activeCount > 0 || query || activeOrgTab !== 'ALL') && (
            <button type="button" className="jb-clear" onClick={clearFilters}><RotateCcw size={15} /> Xóa lọc</button>
          )}
        </div>
      </div>

      {/* results */}
      <div className="jb-inner">
        {/* Source Segment Tabs (Tất cả / Doanh nghiệp / CLB Sinh viên) */}
        <div className="jb-org-tabs" role="tablist" aria-label="Nguồn đăng cơ hội">
          <button
            type="button"
            role="tab"
            aria-selected={activeOrgTab === 'ALL'}
            className={`jb-org-tab${activeOrgTab === 'ALL' ? ' active' : ''}`}
            onClick={() => setActiveOrgTab('ALL')}
          >
            Tất cả cơ hội <span className="jb-org-count">{jobs.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeOrgTab === 'BUSINESS'}
            className={`jb-org-tab${activeOrgTab === 'BUSINESS' ? ' active' : ''}`}
            onClick={() => setActiveOrgTab('BUSINESS')}
          >
            <Building2 size={16} /> Doanh nghiệp tuyển dụng <span className="jb-org-count">{bizCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeOrgTab === 'CLUB'}
            className={`jb-org-tab club${activeOrgTab === 'CLUB' ? ' active' : ''}`}
            onClick={() => setActiveOrgTab('CLUB')}
          >
            <GraduationCap size={16} /> CLB & Đoàn hội <span className="jb-org-count">{clubCount}</span>
          </button>
        </div>

        <div className="jb-listhead" ref={listTopRef}>
          <h1>
            Đang hiển thị <b>{filtered.length}</b> {activeOrgTab === 'CLUB' ? 'hoạt động / Quest CLB' : activeOrgTab === 'BUSINESS' ? 'việc làm từ doanh nghiệp' : 'cơ hội việc làm & CLB'}
          </h1>
          {!selectedJob && (
            <div className="jb-viewtoggle" role="group" aria-label="Kiểu hiển thị">
              <button type="button" className={`jb-viewbtn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} aria-label="Danh sách"><List size={18} /></button>
              <button type="button" className={`jb-viewbtn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')} aria-label="Lưới"><LayoutGrid size={18} /></button>
            </div>
          )}
        </div>

        <div className={`jb-results${selectedJob ? ' split' : ''}`}>
          <div className="jb-col-list">
            <div className={`jb-list${view === 'grid' && !selectedJob ? ' grid' : ''}`}>
              {paged.map((job, i) => (
                <article
                  key={job.id}
                  data-job-id={job.id}
                  className={`jb-card${job.isClub ? ' is-club' : ''}${selectedId === job.id ? ' selected' : ''}`}
                  onClick={() => openJob(job.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openJob(job.id); } }}
                >
                  <button
                    type="button"
                    className={`jb-save${saved.has(String(job.id)) ? ' on' : ''}`}
                    aria-label={saved.has(String(job.id)) ? 'Bỏ lưu' : 'Lưu cơ hội'}
                    onClick={(e) => { e.stopPropagation(); handleToggleSave(job.id); }}
                  >
                    <Heart size={20} fill={saved.has(String(job.id)) ? '#ef5da8' : 'none'} />
                  </button>
                  <div className="jb-card-top">
                    <JobLogo job={job} index={i} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        {job.isClub ? (
                          <span className="jb-org-pill club">
                            <GraduationCap size={12} /> CLB Sinh Viên {job.campus ? `· ${job.campus}` : ''}
                          </span>
                        ) : (
                          <span className="jb-org-pill biz">
                            <Building2 size={12} /> Doanh nghiệp
                          </span>
                        )}
                      </div>
                      <h3 className="jb-title">{job.title}</h3>
                      <div className="jb-company">{job.company}</div>
                    </div>
                  </div>

                  <div className="jb-divider" />

                  <div className="jb-meta">
                    <div className="jb-metarow">
                      <span><Wallet size={15} /> <span className={job.salaryKnown ? 'jb-pay' : ''}>{job.salary}</span></span>
                    </div>
                    <div className="jb-metarow">
                      <span><MapPin size={15} /> {job.locationLabel}</span>
                      <span><Briefcase size={15} /> {job.type}</span>
                    </div>
                    <div className="jb-metarow accent">
                      <span><Clock size={15} /> {job.posted}</span>
                      <span><Users size={15} /> {job.applicants}</span>
                    </div>
                  </div>

                  {/* Rewards summary row for CLB posts */}
                  {(job.givesProof || job.expReward || job.rsReward) && (
                    <div className="jb-reward-row">
                      {job.givesProof && (
                        <span className="jb-reward-badge proof">
                          <ShieldCheck size={13} /> Cấp Verified Proof
                        </span>
                      )}
                      {job.expReward && (
                        <span className="jb-reward-badge exp">
                          <Zap size={13} /> +{job.expReward} EXP
                        </span>
                      )}
                      {job.rsReward && (
                        <span className="jb-reward-badge rs">
                          <Star size={13} /> +{job.rsReward} RS
                        </span>
                      )}
                    </div>
                  )}
                </article>
              ))}
              {loading && <div className="jb-empty">Đang tải cơ hội…</div>}
              {!loading && loadError && <div className="jb-empty">{loadError}</div>}
              {!loading && !loadError && !filtered.length && (
                <div className="jb-empty">
                  {activeOrgTab === 'CLUB' && !jobs.some((j) => j.isClub) ? (
                    <EmptyStateMascot
                      title="Hiện chưa có Quest nào từ CLB"
                      description="Các CLB chưa đăng hoạt động nào. Ghé lại sau, hoặc xem tin từ doanh nghiệp ở tab bên cạnh."
                    />
                  ) : jobs.length ? (
                    <EmptyStateMascot
                      title="Chưa tìm thấy cơ hội phù hợp"
                      description="Thử bỏ bớt bộ lọc hoặc chuyển sang tab khác — có thể cơ hội đang nằm ở nhóm bạn chưa mở."
                      action={activeCount > 0 ? (
                        <button
                          type="button"
                          onClick={clearFilters}
                          style={{
                            background: EMERALD, color: INK, padding: '16px 20px', borderRadius: 8,
                            border: 'none', fontWeight: 500, fontSize: '1.125rem', cursor: 'pointer',
                          }}
                        >
                          Xoá hết bộ lọc
                        </button>
                      ) : null}
                    />
                  ) : (
                    <EmptyStateMascot
                      title="Hiện chưa có tin tuyển dụng nào"
                      description="Nền tảng đang chờ những cơ hội đầu tiên. Quay lại sau nhé."
                    />
                  )}
                </div>
              )}
            </div>

            {/* Thanh phân trang — chỉ hiện khi thật sự có nhiều hơn một trang. */}
            {!loading && !loadError && pageCount > 1 && (
              <nav className="jb-pager" aria-label="Phân trang danh sách cơ hội">
                <button
                  type="button"
                  className="jb-pagebtn"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers(safePage, pageCount).map((n, i) =>
                  n === '…' ? (
                    <span key={`gap-${i}`} className="jb-pagegap" aria-hidden="true">…</span>
                  ) : (
                    <button
                      type="button"
                      key={n}
                      className={`jb-pagebtn${n === safePage ? ' active' : ''}`}
                      onClick={() => goToPage(n)}
                      aria-current={n === safePage ? 'page' : undefined}
                      aria-label={`Trang ${n}`}
                    >
                      {n}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="jb-pagebtn"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === pageCount}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>

                <span className="jb-pageinfo">
                  Trang {safePage}/{pageCount} · {filtered.length} cơ hội
                </span>
              </nav>
            )}
          </div>

          {selectedJob && (
            <JobDetail
              key={selectedJob.id}
              job={selectedJob}
              closing={closing}
              onClose={closeDetail}
              saved={saved.has(String(selectedJob.id))}
              onToggleSave={() => handleToggleSave(selectedJob.id)}
              onApply={handleApply}
            />
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

