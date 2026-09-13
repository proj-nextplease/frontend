import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronDown, MapPin, Wallet, Clock, Users, Briefcase,
  Heart, List, LayoutGrid, RotateCcw, Building2, Check, Search,
  X, Share2, ArrowRight,
} from 'lucide-react';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { WaveBg } from '../components/WaveBg.jsx';
import { loadJobs, getCachedJobs } from '../api/jobsCache.js';

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
  SMALL_EVENT: 'Sự kiện nhỏ',
  SCHOOL_CAMPAIGN: 'Chiến dịch trường',
};

const FILTER_DEFS = [
  { key: 'location', label: 'Địa điểm', searchable: true },
  { key: 'type', label: 'Loại công việc' },
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
  const salaryText = formatSalary(raw.compensation);
  const skills = (raw.skills || []).map((s) => s.skillName || s.name || s).filter(Boolean);
  const workForm = raw.isRemote ? 'Remote' : 'On-site';
  const location = raw.location || 'Không xác định';
  const locationLabel = location.toLowerCase() === workForm.toLowerCase()
    ? location
    : `${location} (${workForm})`;
  return {
    id: String(raw.id),
    title: raw.title || 'Chưa đặt tên',
    company: raw.companyName || 'Nhà tuyển dụng',
    companyLogo: raw.companyLogo || null,
    description: (raw.description || '').trim(),
    salary: salaryText || 'Lương không công khai',
    salaryKnown: Boolean(salaryText),
    location,
    locationLabel,
    workForm,
    type: JOB_TYPE_LABELS[raw.jobType] || raw.jobType || 'Khác',
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
  return (
    <span className="jb-logo" style={{ background: LOGO_COLORS[index % LOGO_COLORS.length] }}>
      {initials(job.company) || <Building2 size={22} />}
    </span>
  );
}

function JobDetail({ job, onClose, saved, onToggleSave, onShare, closing }) {
  const descParas = job.description ? job.description.split(/\n+/).map((s) => s.trim()).filter(Boolean) : [];
  const requirements = [
    job.skills.length ? `Có kiến thức hoặc định hướng với ${job.skills.join(', ')}.` : 'Tinh thần cầu tiến, sẵn sàng học hỏi.',
    'Kỹ năng giao tiếp và làm việc nhóm tốt.',
    'Chủ động, trách nhiệm và cam kết với công việc.',
  ];
  const benefits = [
    `Mức lương: ${job.salary}.`,
    `Hình thức làm việc: ${job.workForm} · ${job.type}.`,
    'Tích EXP, RS và NP trên nextplease sau khi hoàn thành công việc.',
  ];
  return (
    <aside className={`jb-detail${closing ? ' out' : ''}`}>
      <div className="jb-detail-head">
        <div className="jb-detail-id">
          <JobLogo job={job} index={0} />
          <div style={{ minWidth: 0 }}>
            <h2>{job.title}</h2>
            <div className="jb-company">{job.company}</div>
          </div>
        </div>
        <div className="jb-detail-actions">
          <Link to={`/jobs/${job.id}`} className="jb-apply">Ứng tuyển</Link>
          <button type="button" className={`jb-iconbtn${saved ? ' on' : ''}`} onClick={onToggleSave} aria-label="Lưu việc làm"><Heart size={19} fill={saved ? '#ef5da8' : 'none'} /></button>
          <button type="button" className="jb-iconbtn" onClick={onShare} aria-label="Chia sẻ"><Share2 size={18} /></button>
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

        {job.skills.length > 0 && (
          <div className="jb-skillrow">
            {job.skills.map((s) => <span key={s} className="jb-skill">{s}</span>)}
          </div>
        )}

        <section>
          <h3>Mô tả công việc</h3>
          {descParas.length
            ? descParas.map((p, i) => <p key={i} className="jb-detail-p">{p}</p>)
            : (
              <ul>
                <li>{`Trực tiếp tham gia công việc ${job.title.toLowerCase()}.`}</li>
                <li>Phối hợp cùng đội ngũ để đạt mục tiêu chung.</li>
                <li>Theo dõi, báo cáo tiến độ và kết quả định kỳ.</li>
              </ul>
            )}
        </section>
        <section>
          <h3>Yêu cầu công việc</h3>
          <ul>{requirements.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
        <section>
          <h3>Quyền lợi</h3>
          <ul>{benefits.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>

        <Link to={`/jobs/${job.id}`} className="jb-apply jb-apply-lg">Ứng tuyển ngay <ArrowRight size={17} /></Link>
      </div>
    </aside>
  );
}

export function JobsPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [openChip, setOpenChip] = useState(null);
  const [view, setView] = useState('list');
  const [searchParams, setSearchParams] = useSearchParams();
  // Seed from the prefetch cache (warmed on the home page) so the list shows
  // instantly when it's already loaded; otherwise fetch on mount.
  const [jobs, setJobs] = useState(() => {
    const raw = getCachedJobs();
    return raw ? raw.map(normalizeJob) : [];
  });
  const [loading, setLoading] = useState(() => !getCachedJobs());
  const [loadError, setLoadError] = useState(null);
  // Deep-link: open the job named by ?preview=<id> on first load so a reload /
  // shared link keeps the detail panel open. Validated once jobs have loaded.
  const [selectedId, setSelectedId] = useState(() => searchParams.get('preview'));
  const [closing, setClosing] = useState(false);
  const [saved, setSaved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nextplease:saved-jobs') || '[]')); }
    catch { return new Set(); }
  });
  const barRef = useRef(null);

  // Load real job postings — instant if the home page already prefetched them.
  useEffect(() => {
    if (getCachedJobs()) return undefined; // already seeded from cache
    let alive = true;
    loadJobs({ limit: 60 })
      .then((data) => { if (alive) setJobs((Array.isArray(data) ? data : []).map(normalizeJob)); })
      .catch((err) => { if (alive) setLoadError(err.message || 'Không thể tải danh sách việc làm.'); })
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

  // When a job is opened (or switched), smoothly scroll its card up so it sits
  // at the top of the list, aligned with the sticky detail panel — like upzi.
  useEffect(() => {
    if (selectedId == null || closing) return;
    const el = document.querySelector(`[data-job-id="${selectedId}"]`);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = 150; // sticky header + filter bar height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }, [selectedId, closing, jobs]);

  const optionsFor = useMemo(() => {
    const map = {};
    for (const def of FILTER_DEFS) map[def.key] = [...new Set(jobs.map((j) => j[def.key]).filter(Boolean))];
    return map;
  }, [jobs]);

  const filtered = useMemo(() => jobs.filter((job) => {
    const haystack = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    return Object.entries(filters).every(([key, vals]) => !vals || vals.length === 0 || vals.includes(job[key]));
  }), [query, filters, jobs]);

  const activeCount = Object.values(filters).filter((v) => v && v.length).length;

  // Multi-select: toggle the option in this filter's array; keep the menu open.
  function pick(key, opt) {
    setFilters((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt];
      return { ...prev, [key]: next };
    });
  }
  function clearFilters() { setFilters({}); setQuery(''); setOpenChip(null); }
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
  function shareJob(job) {
    const url = `${window.location.origin}/jobs/${job.id}`;
    if (navigator.share) { navigator.share({ title: job.title, url }).catch(() => {}); }
    else { navigator.clipboard?.writeText(url).catch(() => {}); }
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

  return (
    <div style={{ background: '#f7fbf8', color: INK, width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', overflowX: 'clip', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        .jb-inner { width: min(1180px, calc(100% - 40px)); margin: 0 auto; }
        .jb-hero { position: relative; overflow: hidden; background: ${HERO_GRAD}; padding: 14px 0; }
        .jb-hero-inner { position: relative; z-index: 1; width: min(1180px, calc(100% - 40px)); margin: 0 auto; }
        .jb-search { display: flex; align-items: center; gap: 8px; height: 40px; box-sizing: border-box; background: #fff; border: 1px solid #e1e2e2; border-radius: 14px; padding: 3px; }
        .jb-search input { border: 0; outline: 0; flex: 1; min-width: 0; font: inherit; font-size: 15px; color: #1c1c1c; background: transparent; padding: 0 12px; }
        .jb-search input::placeholder { color: #6b7280; }
        .jb-search button { border: 2px solid #fff; background: ${TEAL}; color: #fff; border-radius: 12px; height: 100%; padding: 0 22px; font-weight: 600; font-size: 15px; cursor: pointer; display: inline-flex; align-items: center; white-space: nowrap; transition: background 0.2s ease; }
        .jb-search button:hover { background: #0b5f58; }

        .jb-filterbar { position: sticky; top: 69px; z-index: 40; background: rgba(247,251,248,0.92); backdrop-filter: saturate(180%) blur(10px); -webkit-backdrop-filter: saturate(180%) blur(10px); border-bottom: 1px solid ${LINE}; padding: 16px 0; }
        .jb-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
        .jb-chip-wrap { position: relative; }
        .jb-chip { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1px solid #dbe9e3; color: ${INK}; border-radius: 999px; padding: 9px 15px; font: inherit; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; white-space: nowrap; }
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

        .jb-listhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 26px 0 16px; flex-wrap: wrap; }
        .jb-listhead h1 { margin: 0; font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em; color: ${INK}; }
        .jb-listhead h1 b { color: ${TEAL}; }
        .jb-viewtoggle { display: inline-flex; background: #fff; border: 1px solid ${LINE}; border-radius: 11px; padding: 3px; }
        .jb-viewbtn { border: 0; background: transparent; color: #9bb0aa; padding: 7px 9px; border-radius: 8px; cursor: pointer; display: inline-flex; }
        .jb-viewbtn.active { background: ${MINT}; color: ${TEAL}; }

        .jb-results { padding-bottom: 70px; }
        .jb-results.split { display: grid; grid-template-columns: minmax(320px, 400px) 1fr; gap: 16px; align-items: start; }
        .jb-list { display: grid; gap: 14px; }
        .jb-list.grid { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 780px) { .jb-list.grid { grid-template-columns: 1fr; } }

        .jb-card { position: relative; background: #fff; border: 1px solid ${LINE}; border-radius: 18px; padding: 20px 22px; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, border-color 0.25s ease; text-decoration: none; color: inherit; display: block; cursor: pointer; }
        .jb-card:hover { transform: translateY(-4px); box-shadow: 0 22px 44px rgba(13,148,136,0.12); border-color: #cdeee2; }
        .jb-card:active { transform: scale(0.985); }
        .jb-card.selected { border-color: ${EMERALD}; box-shadow: 0 0 0 2px rgba(16,185,129,0.25); transform: none; }

        /* detail preview panel */
        .jb-detail { position: sticky; top: 150px; align-self: start; display: flex; flex-direction: column; background: #fff; border: 1px solid ${LINE}; border-radius: 18px; height: calc(100vh - 168px); overflow: hidden; box-shadow: 0 22px 50px rgba(6,40,36,0.08); animation: jbDetailIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
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
        .jb-detail-head { flex-shrink: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 20px; background: #fff; border-bottom: 1px solid #eef4f1; border-radius: 18px 18px 0 0; }
        .jb-detail-id { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .jb-detail h2 { margin: 0; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.01em; color: ${INK}; }
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
        .jb-divider { height: 1px; background: #eef4f1; margin: 16px 0 14px; }
        .jb-meta { display: flex; flex-direction: column; gap: 9px; }
        .jb-metarow { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; font-size: 0.88rem; color: ${MUTED}; }
        .jb-metarow span { display: inline-flex; align-items: center; gap: 6px; }
        .jb-metarow.accent span { color: ${EMERALD}; font-weight: 600; }
        .jb-pay { color: ${INK}; font-weight: 700; }
        .jb-empty { background: #fff; border: 1px solid ${LINE}; border-radius: 18px; padding: 52px 24px; text-align: center; color: ${MUTED}; }

        @media (max-width: 560px) {
          .jb-filterbar { top: 65px; }
          .jb-search button { padding: 0 15px; }
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
              placeholder="Tìm kiếm việc làm tại địa điểm, công ty, kỹ năng"
              aria-label="Tìm kiếm việc làm"
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
          {(activeCount > 0 || query) && (
            <button type="button" className="jb-clear" onClick={clearFilters}><RotateCcw size={15} /> Xóa lọc</button>
          )}
        </div>
      </div>

      {/* results */}
      <div className="jb-inner">
        <div className="jb-listhead">
          <h1>Tuyển dụng <b>{filtered.length}</b> việc làm mới nhất</h1>
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
                  className={`jb-card${selectedId === job.id ? ' selected' : ''}`}
                  onClick={() => openJob(job.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openJob(job.id); } }}
                >
                  <button
                    type="button"
                    className={`jb-save${saved.has(job.id) ? ' on' : ''}`}
                    aria-label={saved.has(job.id) ? 'Bỏ lưu' : 'Lưu việc làm'}
                    onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                  >
                    <Heart size={20} fill={saved.has(job.id) ? '#ef5da8' : 'none'} />
                  </button>
                  <div className="jb-card-top">
                    <JobLogo job={job} index={i} />
                    <div style={{ minWidth: 0 }}>
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
                </article>
              ))}
              {loading && <div className="jb-empty">Đang tải việc làm…</div>}
              {!loading && loadError && <div className="jb-empty">{loadError}</div>}
              {!loading && !loadError && !filtered.length && (
                <div className="jb-empty">
                  {jobs.length ? 'Chưa tìm thấy việc làm phù hợp. Thử bỏ bớt bộ lọc nhé.' : 'Hiện chưa có tin tuyển dụng nào.'}
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
              onToggleSave={() => toggleSave(selectedJob.id)}
              onShare={() => shareJob(selectedJob)}
            />
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
