import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Clock, Building, Shield, Zap, Award, LockKeyhole,
  ArrowLeft, Users, Calendar, Briefcase, CheckCircle2, Star,
  ClipboardList, GraduationCap, FolderOpen, AlertTriangle,
  Heart, Share2, Link2, Check, Search, ChevronDown, ChevronUp,
  Sparkles, Building2, Wallet,
} from 'lucide-react';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { getJobDetail } from '../api/jobApi.js';
import { applyToJob } from '../api/applicationApi.js';
import { applyToQuest } from '../api/questApi.js';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { loadJobs } from '../api/jobsCache.js';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';
import { useSavedJobs } from '../lib/savedJobs.js';

/* ── Emerald & Teal Design Tokens ── */
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

const JOB_TYPE_LABELS = {
  INTERNSHIP: 'Thực tập sinh',
  PART_TIME: 'Bán thời gian',
  FREELANCE: 'Freelance',
  EVENT_STAFF: 'Event Staff',
  MICRO_INTERNSHIP: 'Thực tập ngắn hạn',
  SMALL_EVENT: 'Sự kiện nhỏ',
  SCHOOL_CAMPAIGN: 'Chiến dịch trường',
};

/* Nền ô logo dự phòng — sắc độ mờ thay cho dải pastel (pastel sáng trên nền
   tối thành những đốm chói). */
const LOGO_COLORS = [
  'rgba(16,185,129,0.16)', 'rgba(103,232,249,0.14)', 'rgba(167,139,250,0.14)',
  'rgba(56,189,248,0.14)', 'rgba(251,146,60,0.14)', 'rgba(163,230,53,0.14)',
];

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/* ── Floating Share Popover (Facebook, LinkedIn, X, Zalo, Copy Link) ── */
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
      className="np-share-dropdown"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        background: SURFACE,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        boxShadow: '0 16px 40px rgba(6, 40, 36, 0.16)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 60,
        animation: 'npShareFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <style>{`
        @keyframes npShareFade {
          0% { opacity: 0; transform: translateY(-6px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .np-share-btn {
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
        .np-share-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #0d9488;
          transform: translateY(-2px);
        }
        .np-copied-tag {
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
          className="np-share-btn"
          title={`Chia sẻ lên ${item.name}`}
          onClick={onClose}
        >
          {item.icon}
        </a>
      ))}
      <button
        type="button"
        className="np-share-btn"
        onClick={handleCopy}
        title="Sao chép liên kết"
      >
        {copied ? (
          <>
            <Check size={22} color="#10b981" />
            <span className="np-copied-tag">Đã sao chép!</span>
          </>
        ) : (
          <Link2 size={22} />
        )}
      </button>
    </div>
  );
}

export function JobDetailPage() {
  const { id } = useParams();
  const { openLoginModal } = useAuthModal();
  const isQuestPage = window.location.pathname.startsWith('/quests/');

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [portfolio, setPortfolio] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [answers, setAnswers] = useState({});
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const [showShare, setShowShare] = useState(false);
  const [showFullCompanyBio, setShowFullCompanyBio] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  // Dùng chung kho với /jobs và khu vực ứng viên — xem lib/savedJobs.js.
  const { savedIds: savedJobs, toggleSave: toggleSavedJob } = useSavedJobs();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getJobDetail(id);
        setJob(data);
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin việc làm.');
      } finally {
        setLoading(false);
      }
    }
    load();
    getMyPortfolio().then(setPortfolio).catch(() => {});

    // Load recommendations
    loadJobs({ limit: 8 })
      .then((data) => {
        const raw = Array.isArray(data) ? data : [];
        setSimilarJobs(raw.filter((j) => String(j.id) !== String(id)).slice(0, 4));
      })
      .catch(() => {});
  }, [id]);

  function toggleSave(jobId) {
    if (!getStoredToken()) {
      openLoginModal('candidate');
      return;
    }
    toggleSavedJob(jobId).catch(() => {});
  }

  async function handleApply() {
    const fields = job.formFields || [];
    const missing = fields.find((f) => f.required && !(answers[f.id] || '').trim());
    if (missing) {
      setApplyError(`Vui lòng trả lời câu hỏi bắt buộc: ${missing.label}`);
      return;
    }

    const answersPayload = fields.length
      ? Object.fromEntries(
          fields.map((f) => [f.id, (answers[f.id] || '').trim()]).filter(([, v]) => v),
        )
      : null;

    setApplyLoading(true);
    setApplyError('');
    try {
      if (job.postType === 'QUEST' || isQuestPage) {
        await applyToQuest(id, coverNote, answersPayload);
      } else {
        await applyToJob(id, coverNote, answersPayload);
      }
      setApplySuccess('Nộp đơn thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.');
      setShowApplyModal(false);
    } catch (err) {
      const code = err.errorCode;
      if (code === 'RS_TOO_LOW') setApplyError('RS của bạn chưa đủ để ứng tuyển vị trí này.');
      else if (code === 'PREMIUM_REQUIRED') setApplyError('Vị trí này yêu cầu Premium Pass.');
      else if (code === 'ALREADY_APPLIED') setApplyError('Bạn đã ứng tuyển vị trí này rồi.');
      else setApplyError(err.message || 'Không thể nộp đơn. Vui lòng thử lại.');
    } finally {
      setApplyLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: INK, color: ON_DARK, overflowX: 'clip' }}>
        <SiteHeader overlay pinned={false} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: MUTED }}>
            <div style={{ width: '42px', height: '42px', border: '3px solid #dbe9e3', borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Đang tải thông tin việc làm…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: INK, color: ON_DARK, overflowX: 'clip' }}>
        <SiteHeader overlay pinned={false} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '440px' }}>
            <p style={{ color: '#fca5a5', fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>{error || 'Không tìm thấy thông tin bài đăng.'}</p>
            <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '12px', background: TEAL, color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
              <ArrowLeft size={16} /> Quay lại danh sách việc làm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isQuest = job.postType === 'QUEST' || isQuestPage;
  const rs = portfolio?.reputationScore || 0;
  const isLocked = rs < (job.minReqRs || 0);
  const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType || (isQuest ? 'Quest sinh viên' : 'Toàn thời gian');
  const formFields = job.formFields || [];
  const requiredFields = formFields.filter((f) => f.required);
  const answeredRequired = requiredFields.filter((f) => (answers[f.id] || '').trim()).length;
  const allRequiredDone = answeredRequired === requiredFields.length;
  const isCurrentJobSaved = savedJobs.has(String(job.id));

  const salaryDisplay = isQuest
    ? (job.expReward > 0 ? `+${job.expReward} EXP Phần thưởng` : 'EXP Thưởng')
    : (job.salary || (job.compensation > 0 ? `${Number(job.compensation).toLocaleString()} VND` : 'Lương thỏa thuận'));

  const deadlineDate = (job.deadlineAt || job.endsAt)
    ? new Date(job.deadlineAt || job.endsAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Đang mở';

  const postedAgo = job.posted || 'Gần đây';

  return (
    <div style={{ background: INK, color: ON_DARK, position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh', overflowX: 'clip', fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}>
      {/* Thanh điều hướng trôi theo trang: trang này dài, và cột phải đã có thẻ
          ứng tuyển bám rồi. */}
      <SiteHeader overlay pinned={false} />

      {/* Thanh điều hướng ở chế độ đè nên trang tự chừa chỗ cho nó. Dải tìm
          kiếm gradient teal của bản cũ đã bỏ: cả site giờ là một nền tối liền
          mạch, và trang chi tiết không cần một ô tìm việc thứ hai — người tới
          đây là để đọc tin này; muốn tìm tiếp thì có breadcrumb quay lại /jobs. */}
      <div style={{ height: 'clamp(104px, 10vw, 124px)' }} aria-hidden="true" />

      {/* ── Breadcrumb ── */}
      <div style={{ width: 'min(1200px, calc(100% - 40px))', margin: '0 auto 24px' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: MUTED, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: MUTED, textDecoration: 'none', fontWeight: 600 }}>Trang chủ</Link>
          <span>›</span>
          <Link to="/jobs" style={{ color: MUTED, textDecoration: 'none', fontWeight: 600 }}>Việc làm</Link>
          <span>›</span>
          <span style={{ color: ON_DARK, fontWeight: 700 }}>{job.title}</span>
        </nav>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="np-detail-grid" style={{ width: 'min(1200px, calc(100% - 40px))', margin: '0 auto 60px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', alignItems: 'start' }}>
        
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Main Job Overview Card */}
          <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', boxShadow: 'none' }}>
            <h1 style={{ fontFamily: 'inherit', margin: '0 0 16px', fontSize: 'clamp(1.5rem, 2.6vw, 1.9rem)', fontWeight: 400, color: ON_DARK, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              {job.title}
            </h1>

            {/* Quick Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '20px 0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: ON_DARK }}>
                <span style={{ color: TEAL, display: 'flex' }}><Wallet size={18} /></span>
                <span style={{ fontWeight: 800, color: TEAL }}>{salaryDisplay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: MUTED }}>
                <span style={{ color: TEAL, display: 'flex' }}><MapPin size={18} /></span>
                <span>{job.location || (job.isRemote ? 'Remote (Làm việc từ xa)' : 'Toàn quốc')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: MUTED }}>
                <span style={{ color: TEAL, display: 'flex' }}><Briefcase size={18} /></span>
                <span>{typeLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: MUTED }}>
                <span style={{ color: TEAL, display: 'flex' }}><Calendar size={18} /></span>
                <span>{isQuest ? 'Kết thúc: ' : 'Hạn chót '}{deadlineDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: MUTED }}>
                <span style={{ color: TEAL, display: 'flex' }}><Clock size={18} /></span>
                <span>Đăng {postedAgo}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: EMERALD, fontWeight: 700 }}>
                <span style={{ color: EMERALD, display: 'flex' }}><Users size={18} /></span>
                <span>{job.applicants > 0 ? `${job.applicants} ứng viên đã nộp` : 'Hãy là ứng viên đầu tiên'}</span>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f0fdf4' }}>
              {/* Primary Apply Button */}
              {applySuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '14px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: EMERALD, fontSize: '0.92rem', fontWeight: 800 }}>
                  <CheckCircle2 size={18} /> {applySuccess}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!getStoredToken()) {
                      openLoginModal('candidate');
                      return;
                    }
                    setShowApplyModal(true);
                    setApplyError('');
                  }}
                  disabled={isLocked}
                  style={{
                    background: isLocked ? 'rgba(255,255,255,0.12)' : EMERALD,
                    color: isLocked ? MUTED : INK,
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    padding: '14px 26px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    boxShadow: 'none',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isLocked ? (
                    <><LockKeyhole size={16} /> Chưa đủ RS ({rs}/{job.minReqRs})</>
                  ) : isQuest ? (
                    <><Zap size={16} /> Tham gia Quest</>
                  ) : (
                    'Ứng tuyển'
                  )}
                </button>
              )}

              {/* Save / Tym Button */}
              <button
                type="button"
                onClick={() => toggleSave(job.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: SURFACE,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: isCurrentJobSaved ? '#ef5da8' : INK,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Heart size={19} fill={isCurrentJobSaved ? '#ef5da8' : 'none'} color={isCurrentJobSaved ? '#ef5da8' : '#64748b'} />
                <span>{isCurrentJobSaved ? 'Đã lưu' : 'Lưu'}</span>
              </button>

              {/* Share Button with Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowShare((prev) => !prev)}
                  aria-label="Chia sẻ"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: MUTED,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Share2 size={19} />
                </button>
                {showShare && (
                  <SharePopover job={job} onClose={() => setShowShare(false)} />
                )}
              </div>
            </div>
          </div>

          {/* Section: Yêu cầu công việc & Năng lực */}
          <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', boxShadow: 'none' }}>
            <h2 style={{ fontFamily: 'inherit', margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.02em', color: ON_DARK }}>
              Yêu cầu công việc
            </h2>

            {/* Min RS Badge */}
            {job.minReqRs > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: isLocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(13, 148, 136, 0.08)', border: `1px solid ${isLocked ? 'rgba(239,68,68,0.35)' : '#99f6e4'}`, marginBottom: '18px' }}>
                <Shield size={16} color={isLocked ? '#fca5a5' : TEAL} />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isLocked ? '#fca5a5' : TEAL }}>
                  Yêu cầu tối thiểu {job.minReqRs} Reputation Score {isLocked ? `(Bạn đang có ${rs} RS)` : `✓ (Bạn có ${rs} RS)`}
                </span>
              </div>
            )}

            {/* Required Skills Chips */}
            {job.skills && job.skills.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.86rem', fontWeight: 700, color: MUTED }}>Kỹ năng chuyên môn:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {job.skills.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: MINT,
                        color: TEAL,
                        borderRadius: '999px',
                        padding: '6px 14px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle2 size={13} /> {s.skillName || s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ul style={{ margin: '0', paddingLeft: '22px', color: MUTED, fontSize: '0.94rem', lineHeight: 1.8 }}>
              <li>Tinh thần cầu tiến, trách nhiệm và kỷ luật trong công việc.</li>
              <li>Kỹ năng giao tiếp và phối hợp làm việc nhóm hiệu quả.</li>
              <li>Chủ động học hỏi các công nghệ và quy trình làm việc mới.</li>
            </ul>
          </div>

          {/* Section: Mô tả công việc / Công việc cụ thể là gì? */}
          <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', boxShadow: 'none' }}>
            <h2 style={{ fontFamily: 'inherit', margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.02em', color: ON_DARK }}>
              Công việc cụ thể là gì?
            </h2>
            <div style={{ fontSize: '0.95rem', color: MUTED, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {job.description || 'Tham gia trực tiếp vào các quy trình dự án và báo cáo kết quả định kỳ theo hướng dẫn của người hướng dẫn.'}
            </div>
          </div>

          {/* Section: Quyền lợi & Phần thưởng */}
          <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', boxShadow: 'none' }}>
            <h2 style={{ fontFamily: 'inherit', margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.02em', color: ON_DARK }}>
              Quyền lợi được hưởng
            </h2>
            <ul style={{ margin: 0, paddingLeft: '22px', color: MUTED, fontSize: '0.94rem', lineHeight: 1.8 }}>
              <li>Mức thù lao / lương: <b>{salaryDisplay}</b>.</li>
              <li>Cơ hội tích lũy Reputation Score và EXP trên hệ thống nextplease.</li>
              <li>Nhận chứng nhận hoàn thành và xác thực năng lực trực tiếp từ nhà tuyển dụng.</li>
              <li>Môi trường làm việc năng động, tôn trọng ý kiến cá nhân của người trẻ Gen Z.</li>
            </ul>
          </div>

          {/* Section: Application Questionnaire (If configured) */}
          {formFields.length > 0 && (
            <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', boxShadow: 'none' }}>
              <h2 style={{ fontFamily: 'inherit', margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.02em', color: ON_DARK }}>
                Câu hỏi khi ứng tuyển
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: MUTED }}>
                Bạn sẽ trả lời những câu hỏi này khi bấm {isQuest ? 'Tham gia Quest' : 'Ứng tuyển'}.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formFields.map((f, idx) => (
                  <div key={f.id || idx} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: TEAL }}>{idx + 1}.</span>
                      <strong style={{ fontSize: '0.92rem', color: ON_DARK }}>{f.label}</strong>
                      {f.required && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                          Bắt buộc
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (Sidebar) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Company / Organizer Profile Card */}
          <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#dff7ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #cdeee2' }}>
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Building2 size={26} color={TEAL} />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontFamily: 'inherit', margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 500, letterSpacing: '-0.015em', color: ON_DARK, lineHeight: 1.2 }}>
                  {job.companyName || job.company || 'Doanh nghiệp đối tác'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: EMERALD, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Đã xác thực
                </span>
              </div>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: MUTED, lineHeight: 1.6 }}>
              {showFullCompanyBio
                ? (job.companyBio || `${job.companyName || 'Đơn vị tuyển dụng'} là đối tác uy tín trên nền tảng NextPlease, cung cấp các cơ hội nghề nghiệp chất lượng cho sinh viên và bạn trẻ.`)
                : `${(job.companyBio || `${job.companyName || 'Đơn vị tuyển dụng'} là đối tác uy tín trên nền tảng NextPlease...`).slice(0, 140)}...`}
            </p>

            <button
              type="button"
              onClick={() => setShowFullCompanyBio((prev) => !prev)}
              style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0 }}
            >
              {showFullCompanyBio ? <>Thu gọn <ChevronUp size={14} /></> : <>Xem thêm <ChevronDown size={14} /></>}
            </button>
          </div>

          {/* Similar Opportunities Widget ("Việc làm bạn sẽ thích") */}
          <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'inherit', margin: 0, fontSize: '1.05rem', fontWeight: 500, letterSpacing: '-0.015em', color: ON_DARK }}>
                Việc làm bạn sẽ thích
              </h3>
              <Sparkles size={18} color="#8b5cf6" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {similarJobs.length > 0 ? (
                similarJobs.map((simJob, idx) => (
                  <article
                    key={simJob.id}
                    style={{
                      border: '1px solid #eef4f1',
                      borderRadius: '16px',
                      padding: '14px',
                      background: SURFACE,
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Lưu việc làm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(simJob.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px',
                        color: savedJobs.has(String(simJob.id)) ? '#ef5da8' : 'rgba(255,255,255,0.45)',
                      }}
                    >
                      <Heart size={18} fill={savedJobs.has(String(simJob.id)) ? '#ef5da8' : 'none'} />
                    </button>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingRight: '28px' }}>
                      <span
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: LOGO_COLORS[idx % LOGO_COLORS.length],
                          color: TEAL,
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {initials(simJob.company) || <Building2 size={18} />}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <Link
                          to={`/jobs/${simJob.id}`}
                          style={{
                            display: 'block',
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            color: ON_DARK,
                            textDecoration: 'none',
                            lineHeight: 1.3,
                            marginBottom: '3px',
                          }}
                        >
                          {simJob.title}
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: MUTED }}>
                          {simJob.company}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: MUTED }}>
                      <div style={{ fontWeight: 700, color: TEAL }}>
                        {simJob.salary || (simJob.compensation > 0 ? `${Number(simJob.compensation).toLocaleString()} VND` : 'Lương thỏa thuận')}
                      </div>
                      <div>
                        📍 {simJob.location || 'Toàn quốc'} · {simJob.type || 'Linh hoạt'}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div style={{ fontSize: '0.88rem', color: MUTED, textAlign: 'center', padding: '16px 0' }}>
                  Đang cập nhật các cơ hội tương tự…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply Modal (Application Form & Confirmation) ── */}
      {showApplyModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(4, 47, 46, 0.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'npFadeIn 0.2s ease-out both',
          }}
          onClick={() => setShowApplyModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: SURFACE,
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16,185,129,0.08)' }}>
              <span style={{ display: 'inline-flex', width: '38px', height: '38px', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', background: MINT, color: TEAL }}>
                {isQuest ? <Zap size={20} /> : <ClipboardList size={20} />}
              </span>
              <div>
                <h3 style={{ fontFamily: 'inherit', margin: 0, fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.02em', color: ON_DARK }}>
                  {isQuest ? 'Xác nhận tham gia Quest' : 'Xác nhận nộp đơn ứng tuyển'}
                </h3>
                <span style={{ fontSize: '0.82rem', color: MUTED }}>{job.title}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Profile Preview */}
              {portfolio && (
                <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Hồ sơ của bạn
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1.05rem', flexShrink: 0 }}>
                      {portfolio.name ? portfolio.name.slice(0, 2).toUpperCase() : 'UV'}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: ON_DARK }}>{portfolio.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: MUTED }}>{portfolio.headline || portfolio.school || 'Ứng viên NextPlease'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                      <strong style={{ fontSize: '0.9rem', color: TEAL, display: 'block' }}>{portfolio.reputationScore || 0}</strong>
                      <span style={{ fontSize: '0.7rem', color: MUTED, fontWeight: 700 }}>RS Score</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(251,191,36,0.1)', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#d97706', display: 'block' }}>Lv {portfolio.currentLevel || 1}</strong>
                      <span style={{ fontSize: '0.7rem', color: MUTED, fontWeight: 700 }}>Level</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(167,139,250,0.12)', borderRadius: '10px', border: '1px solid #ede9fe' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#7c3aed', display: 'block' }}>+{portfolio.totalExp || 0}</strong>
                      <span style={{ fontSize: '0.7rem', color: MUTED, fontWeight: 700 }}>EXP</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Note */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 700, color: ON_DARK }}>
                  Lời giới thiệu bản thân (Tùy chọn)
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Chia sẻ ngắn về lý do bạn phù hợp với cơ hội này..."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: SURFACE, fontSize: '0.9rem', color: ON_DARK, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Questionnaire Form Fields */}
              {formFields.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Câu hỏi bắt buộc từ nhà tuyển dụng
                  </div>
                  {formFields.map((f, idx) => {
                    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: SURFACE, fontSize: '0.9rem', color: ON_DARK, outline: 'none', boxSizing: 'border-box' };
                    return (
                      <div key={f.id || idx}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 700, color: ON_DARK }}>
                          {f.label} {f.required && <span style={{ color: '#fca5a5' }}>*</span>}
                        </label>
                        {f.fieldType === 'TEXTAREA' ? (
                          <textarea rows={3} value={answers[f.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [f.id]: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
                        ) : f.fieldType === 'SELECT' ? (
                          <select value={answers[f.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [f.id]: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="">— Chọn câu trả lời —</option>
                            {(f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input value={answers[f.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [f.id]: e.target.value }))} style={inputStyle} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {applyError && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid #fecaca', color: '#fca5a5', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{applyError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(255,255,255,0.04)' }}>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                disabled={applyLoading}
                style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: SURFACE, color: MUTED, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applyLoading || !allRequiredDone}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #0d9488)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: (applyLoading || !allRequiredDone) ? 'not-allowed' : 'pointer',
                  opacity: (applyLoading || !allRequiredDone) ? 0.6 : 1,
                }}
              >
                {applyLoading ? 'Đang nộp…' : (isQuest ? 'Xác nhận tham gia' : 'Xác nhận nộp đơn')}
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes npFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 900px) {
          .np-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
