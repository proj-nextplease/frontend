import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, MapPin, Wallet, Clock, Users, Briefcase,
  Heart, List, LayoutGrid, RotateCcw, Building2, Check, Search,
  X, Share2, ArrowRight, Link2, GraduationCap, Zap, ShieldCheck,
  Star, Award, Sparkles, FolderOpen,
} from 'lucide-react';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { WaveBg } from '../components/WaveBg.jsx';
import { loadJobs, getCachedJobs } from '../api/jobsCache.js';
import { extractProvince } from '../lib/vnProvince.js';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';

/* ── Emerald palette (matches the landing) ── */
const TEAL = '#0d9488';
const EMERALD = '#10b981';
const INK = '#0f2e2b';
const MUTED = '#5b7772';
const LINE = '#e2efe9';
const MINT = '#e7f7f0';
const HERO_GRAD = 'linear-gradient(158deg, #0f766e 0%, #0d9488 52%, #115e59 100%)';

const LOGO_COLORS = ['#dff7ee', '#fff2bd', '#eee5ff', '#dff0ff', '#ffe7d3', '#e4f5c8'];

const JOB_TYPE_LABELS = {
  INTERNSHIP: 'Thực tập sinh',
  PART_TIME: 'Bán thời gian',
  FREELANCE: 'Freelance',
  EVENT_STAFF: 'Event Staff',
  MICRO_INTERNSHIP: 'Thực tập ngắn hạn',
  SMALL_EVENT: 'Sự kiện CLB',
  SCHOOL_CAMPAIGN: 'Chiến dịch trường',
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
      <span className="jb-logo jb-logo-club" style={{ background: '#ecfdf5', color: TEAL, border: '1px solid #cdeee2' }}>
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
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [activeOrgTab, setActiveOrgTab] = useState('ALL'); // 'ALL' | 'BUSINESS' | 'CLUB'
  const [openChip, setOpenChip] = useState(null);
  const [view, setView] = useState('list');
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState(() => {
    const raw = getCachedJobs();
    return Array.isArray(raw) ? raw.map(normalizeJob) : [];
  });
  const [loading, setLoading] = useState(() => !getCachedJobs());
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(() => searchParams.get('preview'));
  const [closing, setClosing] = useState(false);
  const [saved, setSaved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nextplease:saved-jobs') || '[]')); }
    catch { return new Set(); }
  });
  const barRef = useRef(null);

  // Load real job postings
  useEffect(() => {
    let alive = true;
    loadJobs({ limit: 60 })
      .then((data) => {
        if (!alive) return;
        setJobs(Array.isArray(data) ? data.map(normalizeJob) : []);
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
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('nextplease:saved-jobs', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  function handleApply(jobId) {
    if (!getStoredToken()) {
      openLoginModal('candidate');
      return;
    }
    navigate(`/jobs/${jobId}`);
  }

  function handleToggleSave(id) {
    if (!getStoredToken()) {
      openLoginModal('candidate');
      return;
    }
    toggleSave(id);
  }

  return (
    <div style={{ background: '#f7fbf8', color: INK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', overflowX: 'clip', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        .jb-inner { width: min(1180px, calc(100% - 40px)); margin: 0 auto; }
        .jb-hero { position: relative; overflow: hidden; background: ${HERO_GRAD}; padding: 18px 0 16px; }
        .jb-hero-inner { position: relative; z-index: 1; width: min(1180px, calc(100% - 40px)); margin: 0 auto; }
        .jb-search { display: flex; align-items: center; gap: 8px; height: 44px; box-sizing: border-box; background: #fff; border: 1px solid #e1e2e2; border-radius: 14px; padding: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .jb-search input { border: 0; outline: 0; flex: 1; min-width: 0; font: inherit; font-size: 15px; color: #1c1c1c; background: transparent; padding: 0 14px; }
        .jb-search input::placeholder { color: #6b7280; }
        .jb-search button { border: 2px solid #fff; background: ${TEAL}; color: #fff; border-radius: 12px; height: 100%; padding: 0 24px; font-weight: 700; font-size: 15px; cursor: pointer; display: inline-flex; align-items: center; white-space: nowrap; transition: background 0.2s ease; }
        .jb-search button:hover { background: #0b5f58; }

        /* Segment tabs for Business vs CLB */
        .jb-org-tabs { display: inline-flex; gap: 8px; margin: 18px 0 6px; background: #ebf5f0; padding: 5px; border-radius: 16px; border: 1px solid ${LINE}; flex-wrap: wrap; }
        .jb-org-tab { display: inline-flex; align-items: center; gap: 8px; border: none; background: transparent; color: ${MUTED}; padding: 8px 18px; border-radius: 12px; font-size: 0.92rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
        .jb-org-tab:hover { color: ${TEAL}; }
        .jb-org-tab.active { background: #fff; color: ${INK}; box-shadow: 0 4px 14px rgba(13,148,136,0.12); }
        .jb-org-tab.club.active { color: #059669; }
        .jb-org-count { display: inline-flex; align-items: center; justify-content: center; background: rgba(13,148,136,0.1); color: ${TEAL}; font-size: 0.78rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
        .jb-org-tab.active .jb-org-count { background: ${MINT}; color: ${TEAL}; }

        /* Organization Pill Tags */
        .jb-org-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 0.76rem; font-weight: 800; padding: 3px 10px; border-radius: 999px; letter-spacing: 0.02em; }
        .jb-org-pill.club { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .jb-org-pill.biz { background: #f0fdfa; color: #0d9488; border: 1px solid #ccfbf1; }
        
        /* Reward badges */
        .jb-reward-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2efe9; }
        .jb-reward-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 700; padding: 3px 9px; border-radius: 8px; }
        .jb-reward-badge.proof { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .jb-reward-badge.exp { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .jb-reward-badge.rs { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

        .jb-detail-rewards { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 14px 16px; margin: 16px 0 8px; }
        .jb-reward-title { font-size: 0.88rem; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .jb-reward-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 600px) { .jb-reward-grid { grid-template-columns: 1fr; } }
        .jb-reward-card { background: #ffffff; border: 1px solid #dcfce7; border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; }
        .jb-reward-card strong { display: block; font-size: 0.85rem; color: ${INK}; }
        .jb-reward-card span { font-size: 0.76rem; color: ${MUTED}; }

        .jb-filterbar { position: sticky; top: 69px; z-index: 40; background: rgba(247,251,248,0.94); backdrop-filter: saturate(180%) blur(10px); -webkit-backdrop-filter: saturate(180%) blur(10px); border-bottom: 1px solid ${LINE}; padding: 14px 0; }
        .jb-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
        .jb-chip-wrap { position: relative; }
        .jb-chip { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1px solid #dbe9e3; color: ${INK}; border-radius: 999px; padding: 8px 15px; font: inherit; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; white-space: nowrap; }
        .jb-chip:hover { border-color: ${EMERALD}; }
        .jb-chip.active { background: ${MINT}; border-color: ${EMERALD}; color: ${TEAL}; font-weight: 800; }
        .jb-menu { position: absolute; top: calc(100% + 8px); left: 0; z-index: 50; min-width: 210px; background: #fff; border: 1px solid ${LINE}; border-radius: 14px; box-shadow: 0 20px 44px rgba(6,40,36,0.16); padding: 6px; max-height: 300px; overflow: auto; }
        .jb-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; border: 0; background: transparent; padding: 9px 12px; border-radius: 9px; font: inherit; font-size: 0.9rem; color: ${INK}; cursor: pointer; }
        .jb-menu-item:hover { background: #f1f8f4; }
        .jb-menu-item.active { color: ${TEAL}; font-weight: 700; }
        .jb-check { flex-shrink: 0; width: 17px; height: 17px; border-radius: 5px; border: 1.5px solid #cdd9d4; display: inline-flex; align-items: center; justify-content: center; color: #fff; transition: background 0.15s ease, border-color 0.15s ease; }
        .jb-menu-item.active .jb-check { background: ${EMERALD}; border-color: ${EMERALD}; }
        .jb-menu-searchwrap { display: flex; align-items: center; gap: 7px; padding: 8px 10px; margin-bottom: 4px; border: 1px solid ${LINE}; border-radius: 9px; color: ${MUTED}; }
        .jb-menu-search { border: 0; outline: 0; flex: 1; min-width: 0; font: inherit; font-size: 0.88rem; color: ${INK}; background: transparent; }
        .jb-menu-search::placeholder { color: #9bb0aa; }
        .jb-menu-empty { padding: 10px 12px; color: ${MUTED}; font-size: 0.86rem; }
        .jb-clear { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 0; color: ${EMERALD}; font: inherit; font-size: 0.88rem; font-weight: 700; cursor: pointer; padding: 8px; }
        .jb-clear:hover { color: ${TEAL}; }

        .jb-listhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 20px 0 16px; flex-wrap: wrap; }
        .jb-listhead h1 { margin: 0; font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em; color: ${INK}; }
        .jb-listhead h1 b { color: ${TEAL}; }
        .jb-viewtoggle { display: inline-flex; background: #fff; border: 1px solid ${LINE}; border-radius: 11px; padding: 3px; }
        .jb-viewbtn { border: 0; background: transparent; color: #9bb0aa; padding: 7px 9px; border-radius: 8px; cursor: pointer; display: inline-flex; }
        .jb-viewbtn.active { background: ${MINT}; color: ${TEAL}; }

        .jb-results { padding-bottom: 70px; }
        .jb-results.split { display: grid; grid-template-columns: minmax(320px, 420px) 1fr; gap: 18px; align-items: start; }
        .jb-list { display: grid; gap: 14px; }
        .jb-list.grid { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 780px) { .jb-list.grid { grid-template-columns: 1fr; } }

        .jb-card { position: relative; background: #fff; border: 1px solid ${LINE}; border-radius: 20px; padding: 20px 22px; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, border-color 0.25s ease; text-decoration: none; color: inherit; display: block; cursor: pointer; }
        .jb-card:hover { transform: translateY(-4px); box-shadow: 0 22px 44px rgba(13,148,136,0.12); border-color: #cdeee2; }
        .jb-card:active { transform: scale(0.985); }
        .jb-card.selected { border-color: ${EMERALD}; box-shadow: 0 0 0 2px rgba(16,185,129,0.25); transform: none; }
        .jb-card.is-club { border-left: 4px solid #10b981; }

        /* detail preview panel */
        .jb-detail { position: sticky; top: 150px; align-self: start; display: flex; flex-direction: column; background: #fff; border: 1px solid ${LINE}; border-radius: 20px; height: calc(100vh - 168px); overflow: hidden; box-shadow: 0 22px 50px rgba(6,40,36,0.08); animation: jbDetailIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
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
        .jb-detail-head { flex-shrink: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 20px; background: #fff; border-bottom: 1px solid #eef4f1; border-radius: 20px 20px 0 0; }
        .jb-detail-id { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .jb-detail h2 { margin: 0; font-size: 1.15rem; font-weight: 800; letter-spacing: -0.01em; color: ${INK}; }
        .jb-detail-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .jb-apply { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, ${EMERALD}, ${TEAL}); color: #fff; border: none; border-radius: 12px; padding: 10px 18px; font-weight: 800; font-size: 0.9rem; text-decoration: none; cursor: pointer; white-space: nowrap; }
        .jb-apply:hover { filter: brightness(1.05); }
        .jb-iconbtn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid ${LINE}; background: #fff; color: ${MUTED}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
        .jb-iconbtn:hover { border-color: #cdeee2; color: ${TEAL}; }
        .jb-iconbtn.on { color: #ef5da8; border-color: #f6c9de; }
        .jb-detail-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 18px 22px 26px; }
        .jb-detail-meta { display: flex; flex-direction: column; gap: 9px; font-size: 0.9rem; color: ${MUTED}; }
        .jb-detail-meta span { display: inline-flex; align-items: center; gap: 8px; }
        .jb-detail-meta .accent { color: ${EMERALD}; font-weight: 600; }
        .jb-skillrow { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 4px; }
        .jb-skill { background: ${MINT}; color: ${TEAL}; border-radius: 999px; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; }
        .jb-detail section { margin-top: 22px; }
        .jb-detail h3 { margin: 0 0 10px; font-size: 1rem; font-weight: 800; color: ${INK}; }
        .jb-detail ul { margin: 0; padding-left: 20px; color: ${MUTED}; font-size: 0.9rem; line-height: 1.75; }
        .jb-apply-lg { margin-top: auto; width: 100%; justify-content: center; padding: 13px 0; font-size: 0.96rem; }
        .jb-detail section:last-of-type { margin-bottom: 24px; }

        @media (max-width: 900px) {
          .jb-results.split { grid-template-columns: 1fr; }
          .jb-results.split .jb-col-list { display: none; }
          .jb-detail { position: static; height: auto; max-height: none; }
          .jb-detail-body { overflow: visible; }
          .jb-apply-lg { margin-top: 24px; }
        }
        .jb-card-top { display: flex; align-items: flex-start; gap: 14px; }
        .jb-logo { flex-shrink: 0; width: 52px; height: 52px; border-radius: 15px; display: grid; place-items: center; font-weight: 800; font-size: 0.95rem; color: ${TEAL}; }
        .jb-logo-img { background: #fff; border: 1px solid ${LINE}; overflow: hidden; }
        .jb-logo-img img { width: 100%; height: 100%; object-fit: cover; }
        .jb-detail-p { margin: 0 0 10px; color: ${MUTED}; font-size: 0.9rem; line-height: 1.75; white-space: pre-line; }
        .jb-title { margin: 0; font-size: 1.04rem; font-weight: 800; letter-spacing: -0.01em; color: ${INK}; padding-right: 34px; }
        .jb-company { color: ${MUTED}; font-size: 0.88rem; margin-top: 3px; }
        .jb-save { position: absolute; top: 18px; right: 18px; border: 0; background: transparent; color: #b7cbc4; cursor: pointer; padding: 4px; border-radius: 8px; transition: color 0.2s, transform 0.2s; }
        .jb-save:hover { color: ${EMERALD}; transform: scale(1.1); }
        .jb-save.on { color: #ef5da8; }
        .jb-divider { height: 1px; background: #eef4f1; margin: 14px 0; }
        .jb-meta { display: flex; flex-direction: column; gap: 9px; }
        .jb-metarow { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; font-size: 0.88rem; color: ${MUTED}; }
        .jb-metarow span { display: inline-flex; align-items: center; gap: 6px; }
        .jb-metarow.accent span { color: ${EMERALD}; font-weight: 600; }
        .jb-pay { color: ${INK}; font-weight: 700; }
        .jb-empty { background: #fff; border: 1px solid ${LINE}; border-radius: 18px; padding: 52px 24px; text-align: center; color: ${MUTED}; }

        @media (max-width: 560px) {
          .jb-filterbar { top: 65px; }
          .jb-search button { padding: 0 15px; }
          .jb-org-tabs { width: 100%; }
          .jb-org-tab { flex: 1; justify-content: center; }
        }
      `}</style>

      <SiteHeader />

      {/* hero search band */}
      <section className="jb-hero">
        <WaveBg variant="emerald" pattern="contour" />
        <div className="jb-hero-inner">
          <form className="jb-search" onSubmit={(e) => e.preventDefault()}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm cơ hội, CLB, doanh nghiệp, kỹ năng (ví dụ: F-Code, Canva, React)..."
              aria-label="Tìm kiếm cơ hội"
            />
            <button type="submit">Tìm kiếm</button>
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

        <div className="jb-listhead">
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
              {filtered.map((job, i) => (
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
                    className={`jb-save${saved.has(job.id) ? ' on' : ''}`}
                    aria-label={saved.has(job.id) ? 'Bỏ lưu' : 'Lưu cơ hội'}
                    onClick={(e) => { e.stopPropagation(); handleToggleSave(job.id); }}
                  >
                    <Heart size={20} fill={saved.has(job.id) ? '#ef5da8' : 'none'} />
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
                  {activeOrgTab === 'CLUB' && !jobs.some((j) => j.isClub)
                    ? 'Hiện chưa có Quest nào từ CLB.'
                    : jobs.length
                      ? 'Chưa tìm thấy cơ hội phù hợp. Thử bỏ bớt bộ lọc hoặc chọn tab khác nhé.'
                      : 'Hiện chưa có tin tuyển dụng nào.'}
                </div>
              )}
            </div>
          </div>

          {selectedJob && (
            <JobDetail
              key={selectedJob.id}
              job={selectedJob}
              closing={closing}
              onClose={closeDetail}
              saved={saved.has(selectedJob.id)}
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

