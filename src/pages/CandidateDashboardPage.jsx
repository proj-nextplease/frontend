/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Crown,
  FileText,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  WalletCards,
  Zap,
  LogOut,
  RefreshCw,
  Building,
  AlertTriangle,
  MapPin,
  Calendar,
  BadgeCheck,
  Check,
  ExternalLink,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Users,
  ImagePlus,
  Palette,
  Settings,
} from 'lucide-react';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { logout } from '../api/httpClient.js';
import { AccountSettingsModal } from '../components/AccountSettingsModal.jsx';
import { PortfolioAvatar3D } from './CandidatePortfolioPage.jsx';
import { getJobs, getCompanies, getCompanyDetail, getJobDetail } from '../api/jobApi.js';
import { getMyCredentialSubmissions, submitCredential } from '../api/credentialApi.js';
import { applyToJob, getMyApplications, withdrawApplication } from '../api/applicationApi.js';
import { NotificationBell } from '../components/NotificationBell.jsx';
import { getWallet, topUp, buyPremium } from '../api/walletApi.js';
import { searchQuests, applyToQuest, getMyQuestApplications, withdrawQuestApplication } from '../api/questApi.js';
import {
  boostApplication,
  unlockInsight,
  getInsight,
  requestExpressVerification,
  subscribeJobMatchAlert,
  getPersonalizedRecommendations,
  getPremiumConfig,
  unlockTheme,
  selectTheme
} from '../api/premiumApi.js';
import { getGamification, pingGamification, claimQuest, recordGamificationEvent } from '../api/gamificationApi.js';
import { Flame, Target, Gift, ChevronDown, ChevronLeft, ChevronRight, TrendingUp, Eye } from 'lucide-react';

const CATEGORY_MAP = {
  TECH: {
    label: 'Công nghệ & Kỹ thuật',
    specialties: [
      { value: 'SOFTWARE_ENG', label: 'Kỹ thuật phần mềm' },
      { value: 'INFO_SYSTEMS', label: 'Hệ thống thông tin' },
      { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu' },
      { value: 'CYBER_SEC', label: 'An toàn thông tin' },
      { value: 'OTHER_TECH', label: 'Lĩnh vực công nghệ khác' },
    ]
  },
  BUSINESS: {
    label: 'Kinh tế & Quản lý',
    specialties: [
      { value: 'MARKETING', label: 'Marketing / PR / Quảng cáo' },
      { value: 'FINANCE_ACC', label: 'Tài chính / Kế toán / Kiểm toán' },
      { value: 'BUSINESS_ADMIN', label: 'Quản trị kinh doanh / Vận hành' },
      { value: 'HR', label: 'Quản trị nhân sự' },
      { value: 'LOGISTICS', label: 'Logistics & Chuỗi cung ứng' },
      { value: 'OTHER_BIZ', label: 'Lĩnh vực kinh doanh khác' },
    ]
  },
  DESIGN: {
    label: 'Thiết kế & Nghệ thuật',
    specialties: [
      { value: 'GRAPHIC_DESIGN', label: 'Thiết kế đồ họa' },
      { value: 'UI_UX', label: 'Thiết kế giao diện UI/UX' },
      { value: 'FASHION', label: 'Thời trang / Nội thất' },
      { value: 'OTHER_DESIGN', label: 'Lĩnh vực thiết kế khác' },
    ]
  },
  MEDIA: {
    label: 'Truyền thông & Sự kiện',
    specialties: [
      { value: 'EVENT_PLANNING', label: 'Tổ chức sự kiện' },
      { value: 'CONTENT_CREATIVE', label: 'Sáng tạo nội dung / Copywriter' },
      { value: 'VIDEO_PRODUCTION', label: 'Quay dựng phim / Biên tập video' },
      { value: 'OTHER_MEDIA', label: 'Lĩnh vực truyền thông khác' },
    ]
  },
  LANGUAGE: {
    label: 'Ngôn ngữ & Nhân văn',
    specialties: [
      { value: 'TRANSLATION', label: 'Biên phiên dịch' },
      { value: 'TEACHING', label: 'Giảng dạy / Sư phạm / Đào tạo' },
      { value: 'OTHER_LANG', label: 'Lĩnh vực ngôn ngữ khác' },
    ]
  },
  OTHER: {
    label: 'Lĩnh vực khác',
    specialties: [
      { value: 'OTHER', label: 'Công việc / Lĩnh vực khác' }
    ]
  }
};

const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function compareMonthValues(left, right) {
  if (!left || !right) return 0;
  return left.localeCompare(right);
}

function formatMonthValue(value) {
  if (!value) return 'Chọn tháng / năm';
  const [year, month] = value.split('-');
  const monthIndex = Number(month) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11) return 'Chọn tháng / năm';
  return `${MONTH_LABELS[monthIndex]} ${year}`;
}

function encodePremiumTarget(type, id) {
  return `${type}:${id}`;
}

function decodePremiumTarget(value) {
  const separatorIndex = value.indexOf(':');
  if (separatorIndex < 0) return { type: 'JOB', id: value };
  return {
    type: value.slice(0, separatorIndex),
    id: value.slice(separatorIndex + 1),
  };
}

function CredentialMonthPicker({ id, label, value, minValue, maxValue, openPicker, setOpenPicker, onChange, helperText }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, index) => currentYear - index);
  const isOpen = openPicker === id;

  function isDisabled(monthValue) {
    if (maxValue && compareMonthValues(monthValue, maxValue) > 0) return true;
    if (minValue && compareMonthValues(monthValue, minValue) < 0) return true;
    return false;
  }

  return (
    <div className="credential-month-field">
      {label && <label className="form-label">{label}</label>}
      <button
        type="button"
        className={`credential-month-trigger ${value ? 'has-value' : ''}`}
        onClick={() => setOpenPicker(isOpen ? null : id)}
        aria-expanded={isOpen}
      >
        <span>
          <Calendar size={16} />
          {formatMonthValue(value)}
        </span>
        <span className="credential-month-trigger-dot" />
      </button>
      {helperText && <p className="credential-month-helper">{helperText}</p>}

      {isOpen && (
        <div className="credential-month-popover">
          {years.map((year) => (
            <div className="credential-month-year" key={year}>
              <div className="credential-month-year-label">{year}</div>
              <div className="credential-month-grid">
                {MONTH_LABELS.map((monthLabel, index) => {
                  const monthValue = `${year}-${String(index + 1).padStart(2, '0')}`;
                  const disabled = isDisabled(monthValue);
                  return (
                    <button
                      key={monthValue}
                      type="button"
                      className={`credential-month-option ${value === monthValue ? 'selected' : ''}`}
                      disabled={disabled}
                      onClick={() => {
                        onChange(monthValue);
                        setOpenPicker(null);
                      }}
                    >
                      {monthLabel.replace('Tháng ', 'T')}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const JOB_TYPES = [
  { value: 'INTERNSHIP', label: 'Thực tập sinh (Internship)' },
  { value: 'PART_TIME', label: 'Bán thời gian (Part-time)' },
  { value: 'FREELANCE', label: 'Công việc tự do (Freelance)' },
  { value: 'EVENT_STAFF', label: 'Nhân sự sự kiện (Event staff)' },
  { value: 'MICRO_INTERNSHIP', label: 'Thực tập ngắn hạn / Dự án (Micro-internship)' },
];

function getCompanyGradient(name) {
  const hash = Array.from(name || '').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'linear-gradient(135deg, #f97316, #ea580c)',
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #10b981, #047857)',
    'linear-gradient(135deg, #6366f1, #4338ca)',
  ];
  return gradients[hash % gradients.length];
}

const defaultMockOrganizations = [];

/* Hạn nộp/kết thúc dạng đếm ngược "còn N ngày". */
function deadlineLabel(dateStr, prefix = 'Còn') {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  if (Number.isNaN(end.getTime())) return null;
  const days = Math.ceil((end - new Date()) / 86400000);
  if (days < 0) return { text: 'Đã hết hạn', tone: 'expired' };
  if (days === 0) return { text: 'Hết hạn hôm nay', tone: 'soon' };
  return { text: `${prefix} ${days} ngày`, tone: days <= 7 ? 'soon' : 'normal' };
}

/* ─── Apply modal: candidate profile snapshot ─────────────────────────────── */
function CandidateProfilePreview({ portfolio, candidateRs, currentLevel, currentExp }) {
  const rs = portfolio?.reputationScore ?? candidateRs ?? 0;

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hồ sơ của bạn</p>

      {/* Avatar + name + headline + school */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e5533f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.05rem', color: '#fff', flexShrink: 0 }}>
          {portfolio?.name ? portfolio.name.slice(0, 2).toUpperCase() : 'UV'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: '0.94rem', display: 'block', color: 'var(--ink)' }}>{portfolio?.name || 'Ứng viên'}</strong>
          {portfolio?.headline && <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>{portfolio.headline}</span>}
          {portfolio?.school && (
            <span style={{ fontSize: '0.76rem', color: '#e5533f', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <BadgeCheck size={13} /> {portfolio.school}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[{ label: 'RS', val: rs, color: '#e5533f' }, { label: 'Level', val: currentLevel, color: '#d97706' }, { label: 'EXP', val: currentExp, color: '#7c3aed' }].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', background: `${s.color}08`, borderRadius: '10px', border: `1px solid ${s.color}20` }}>
            <strong style={{ fontSize: '0.9rem', color: s.color, display: 'block' }}>{s.val}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: '700' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* View full portfolio link */}
      <a
        href="/portfolio/edit"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-soft)', color: 'var(--ink)', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-soft)'}
      >
        <ExternalLink size={14} /> Xem lại Portfolio của bạn
      </a>
    </div>
  );
}

// Shared apply/join modal shell — unifies the candidate Job-apply and Quest-apply
// flows so both look and behave identically. Caller passes the differing bits
// (icon, title, accent, info card content, submit label) as props.
function ApplyModal({
  icon, title, accent = 'var(--primary)', infoCard, profileProps,
  coverNote, setCoverNote, coverLabel, coverPlaceholder,
  fields = [], answers, setAnswers, fieldsTitle,
  error, loading, onClose, onSubmit, submitLabel,
}) {
  const Icon = icon;
  const isAnswered = (f) => (answers[f.id] ?? '').toString().trim().length > 0;
  const requiredFields = fields.filter((f) => f.required);
  const answeredRequired = requiredFields.filter(isAnswered).length;
  const allRequiredDone = answeredRequired === requiredFields.length;
  const COVER_MAX = 1000;

  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div className="glass-modal-content apply-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', '--apply-accent': accent }}>
        <div className="glass-modal-header" style={{ borderTop: `3px solid ${accent}`, borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
          <span className="apply-head-icon" style={{ background: `${accent}14`, color: accent }}>
            <Icon size={19} />
          </span>
          <h2>{title}</h2>
        </div>
        <div className="glass-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {infoCard}
          <CandidateProfilePreview {...profileProps} />

          <div className="apply-group">
            <div className="apply-label-row">
              <label className="apply-label">{coverLabel}</label>
              <span className="apply-counter">{(coverNote || '').length}/{COVER_MAX}</span>
            </div>
            <textarea className="apply-field" value={coverNote} maxLength={COVER_MAX} onChange={(e) => setCoverNote(e.target.value)} placeholder={coverPlaceholder} rows={3} style={{ resize: 'vertical' }} />
          </div>

          {fields.length > 0 && (
            <div className="apply-questions">
              <div className="apply-questions-head">
                <span className="apply-questions-title" style={{ color: accent }}>{fieldsTitle}</span>
                {requiredFields.length > 0 && (
                  <span className={`apply-req-progress ${allRequiredDone ? 'done' : ''}`}>
                    {allRequiredDone ? <><Check size={12} /> Đã đủ</> : `${answeredRequired}/${requiredFields.length} bắt buộc`}
                  </span>
                )}
              </div>
              {fields.map((f) => {
                const done = isAnswered(f);
                return (
                  <div key={f.id} className="apply-group">
                    <label className="apply-label">
                      {f.label} {f.required && <span className="apply-req-star">*</span>}
                      {f.required && done && <Check size={13} className="apply-field-check" />}
                    </label>
                    {f.fieldType === 'TEXTAREA' ? (
                      <textarea className="apply-field" rows={3} value={answers[f.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [f.id]: e.target.value }))} style={{ resize: 'vertical' }} />
                    ) : f.fieldType === 'SELECT' ? (
                      <select className="apply-field" value={answers[f.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [f.id]: e.target.value }))} style={{ cursor: 'pointer' }}>
                        <option value="">— Chọn —</option>
                        {(f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input className="apply-field" value={answers[f.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [f.id]: e.target.value }))} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="alert-banner error">
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>
        <div className="glass-modal-footer apply-footer">
          {requiredFields.length > 0 && !allRequiredDone ? (
            <span className="apply-foot-hint"><AlertTriangle size={13} /> Còn {requiredFields.length - answeredRequired} câu bắt buộc</span>
          ) : <span className="apply-foot-hint ok"><Check size={13} /> Sẵn sàng nộp đơn</span>}
          <div className="apply-foot-actions">
            <button className="button secondary-button" onClick={onClose} type="button" disabled={loading}>Hủy bỏ</button>
            <button className="button primary-button apply-submit" onClick={onSubmit} type="button" disabled={loading || !allRequiredDone} style={{ background: accent, borderColor: 'transparent' }}>
              {loading ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Đang nộp...</> : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Daily / weekly quest panel — Duolingo-style task list with claimable EXP rewards. */
function QuestPanel({ title, subtitle, icon, accent, accentSoft, quests, scope, onClaim, claiming }) {
  const doneCount = quests.filter((q) => q.completed).length;
  return (
    <section className="np-quest-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', fontSize: '1.02rem', fontWeight: '800', color: 'var(--ink)' }}>
          <span className="np-quest-icon" style={{ background: accentSoft, color: accent, width: '32px', height: '32px' }}>{icon}</span>
          {title}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--muted)' }}>{doneCount}/{quests.length} · {subtitle}</span>
      </div>
      <div>
        {quests.map((q) => {
          const pct = Math.min(100, Math.round((q.progress / Math.max(1, q.target)) * 100));
          const ready = q.completed && !q.claimed;
          return (
            <div key={q.key} className="np-quest-row">
              <span className="np-quest-icon" style={{ background: q.completed ? '#e7f6ec' : accentSoft, color: q.completed ? '#16a34a' : accent }}>
                {q.completed ? <Check size={18} /> : <Target size={17} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--ink)' }}>{q.title}</span>
                  {q.target > 1 && (
                    <span style={{ fontSize: '0.74rem', fontWeight: '800', color: q.completed ? '#16a34a' : accent }}>{Math.min(q.progress, q.target)}/{q.target}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{q.desc}</div>
                {!q.completed && q.target > 1 && (
                  <div className="np-quest-prog"><span style={{ width: `${pct}%`, background: accent }} /></div>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                {q.claimed ? (
                  <span className="np-quest-claim claimed"><Check size={14} /> +{q.exp}</span>
                ) : ready ? (
                  <button className="np-quest-claim ready" disabled={claiming === q.key} onClick={() => onClaim(scope, q.key)}>
                    <Gift size={14} /> {claiming === q.key ? '...' : `Nhận +${q.exp}`}
                  </button>
                ) : (
                  <span className="np-quest-claim locked">+{q.exp} EXP</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CandidateDashboardPage({ initialPortfolio }) {
  const navigate = useNavigate();
  const { tabSlug } = useParams();
  const location = useLocation();

  const [portfolio, setPortfolio] = useState(initialPortfolio || null);
  const [loading, setLoading] = useState(!initialPortfolio);
  const [activeView, setActiveView] = useState('OVERVIEW'); // OVERVIEW, OPPORTUNITIES, ROADMAP, CREDENTIALS, ORGANIZATIONS, ORGANIZATION_DETAIL, MY_APPLICATIONS
  const [myAppsTab, setMyAppsTab] = useState('BUSINESS'); // BUSINESS | CLUB
  const [myAppsSearch, setMyAppsSearch] = useState('');
  const [myAppsStatusFilter, setMyAppsStatusFilter] = useState('');
  const [myAppsClubSearch, setMyAppsClubSearch] = useState('');
  const [myAppsClubStatusFilter, setMyAppsClubStatusFilter] = useState('');

  // Gamification: streak + daily/weekly quests. Ping once on mount to roll the streak.
  const [gamification, setGamification] = useState(null);
  const [claimingQuest, setClaimingQuest] = useState(null);
  useEffect(() => {
    let mounted = true;
    pingGamification()
      .then((data) => { if (mounted) setGamification(data); })
      .catch(() => getGamification().then((d) => { if (mounted) setGamification(d); }).catch(() => {}));
    return () => { mounted = false; };
  }, []);

  // Advance quests tied to a real activity, then refresh the panel.
  const bumpQuest = async (event, amount = 1) => {
    try {
      const data = await recordGamificationEvent(event, amount);
      setGamification(data);
    } catch { /* non-blocking — gamification must never break a core flow */ }
  };

  // "Khám phá 3 cơ hội" counts 3 DISTINCT opportunities per day — re-opening the
  // same job/Quest doesn't add a view (dedup by id, scoped to today, in localStorage).
  const viewOpportunityOnce = (oppId) => {
    if (!oppId) return;
    const today = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD
    const key = `nextplease:viewed-opps:${today}`;
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(key) || '[]'); } catch { seen = []; }
    if (seen.includes(String(oppId))) return; // already counted today
    seen.push(String(oppId));
    try { localStorage.setItem(key, JSON.stringify(seen)); } catch { /* best-effort */ }
    bumpQuest('VIEW_OPPORTUNITY');
  };

  const handleClaimQuest = async (scope, key) => {
    setClaimingQuest(key);
    try {
      const data = await claimQuest(scope, key);
      setGamification(data);
    } catch { /* keep silent; UI stays in pre-claim state */ }
    finally { setClaimingQuest(null); }
  };

  // Dock profile popover (wallet balance + logout), replaces the old sidebar footer.
  const [showDockProfileMenu, setShowDockProfileMenu] = useState(false);
  const dockProfileRef = useRef(null);
  useEffect(() => {
    if (!showDockProfileMenu) return undefined;
    function handleClickOutside(e) {
      if (dockProfileRef.current && !dockProfileRef.current.contains(e.target)) {
        setShowDockProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDockProfileMenu]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Application states
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyFormFields, setApplyFormFields] = useState([]);
  const [applyAnswers, setApplyAnswers] = useState({});
  const [jobCoverNote, setJobCoverNote] = useState('');
  const [applyModalLoading, setApplyModalLoading] = useState(false);
  const [applyModalError, setApplyModalError] = useState('');
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [showPremiumPaywall, setShowPremiumPaywall] = useState(false);

  // Withdraw states
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawError, setWithdrawError] = useState('');

  // Wallet & Premium states
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState('');
  const [topUpSuccess, setTopUpSuccess] = useState('');
  const [buyPremiumLoading, setBuyPremiumLoading] = useState(false);
  const [buyPremiumError, setBuyPremiumError] = useState('');

  // Premium Monetization states
  const [premiumConfig, setPremiumConfig] = useState({
    boostPriceNp: 15000,
    boostDurationHours: 48,
    insightPriceNp: 10000,
    expressPriceNp: 25000,
    themePriceNp: 50000,
    matchAlertPriceNp: 19000,
    earlyAccessHours: 12
  });
  const [insightData, setInsightData] = useState(null);
  const [insightLoadingJobId, setInsightLoadingJobId] = useState(null);
  const [insightModalJob, setInsightModalJob] = useState(null);
  const [boostLoadingId, setBoostLoadingId] = useState(null);
  const [expressLoadingId, setExpressLoadingId] = useState(null);
  const [subscribingMatchAlert, setSubscribingMatchAlert] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showMatchAlertModal, setShowMatchAlertModal] = useState(false);
  const [selectedBoostAppId, setSelectedBoostAppId] = useState('');
  const [selectedExpressSubId, setSelectedExpressSubId] = useState('');
  const [selectedInsightJobId, setSelectedInsightJobId] = useState('');

  // Quest states
  const [questsList, setQuestsList] = useState([]);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [questApplications, setQuestApplications] = useState([]);
  const [questApplicationsLoading, setQuestApplicationsLoading] = useState(true);
  const [viewingApp, setViewingApp] = useState(null); // { app, isQuest } for the "Xem chi tiết" tracking modal
  const [questApplyLoading, setQuestApplyLoading] = useState(false);
  const [questApplyError, setQuestApplyError] = useState('');
  const [questApplySuccess, setQuestApplySuccess] = useState('');
  const [questSearchFilter, setQuestSearchFilter] = useState('');
  const [questCategoryFilter, setQuestCategoryFilter] = useState('');
  const [showQuestApplyModal, setShowQuestApplyModal] = useState(false);
  const [selectedQuestForApply, setSelectedQuestForApply] = useState(null);
  const [questCoverNote, setQuestCoverNote] = useState('');
  const [questAnswers, setQuestAnswers] = useState({});

  // Credential submission states
  const [credentialSubmissions, setCredentialSubmissions] = useState([]);
  const [credentialSubmissionsLoading, setCredentialSubmissionsLoading] = useState(false);
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [credentialForm, setCredentialForm] = useState({
    projectName: '', position: '', category: 'CLUB_SMALL', roleLevel: 'MEMBER',
    description: '', proofLink: '', proofImages: [], startedAt: '', endedAt: '',
  });

  function handleProofImageUpload(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) { setCredentialFormError('Mỗi ảnh minh chứng phải dưới 2MB.'); return; }
      const reader = new FileReader();
      reader.onload = () => setCredentialForm((f) => ({ ...f, proofImages: [...(f.proofImages || []), reader.result].slice(0, 6) }));
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }
  function removeProofImage(idx) {
    setCredentialForm((f) => ({ ...f, proofImages: f.proofImages.filter((_, i) => i !== idx) }));
  }
  const [credentialFormLoading, setCredentialFormLoading] = useState(false);
  const [credentialFormError, setCredentialFormError] = useState('');
  const [credentialFormSuccess, setCredentialFormSuccess] = useState('');
  const [openCredentialMonthPicker, setOpenCredentialMonthPicker] = useState(null);

  // DB Loaded Organizations States
  const [companiesList, setCompaniesList] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [openOrgTabs, setOpenOrgTabs] = useState([]); // viewed company tabs spawned in Sidebar
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgTypeFilter, setOrgTypeFilter] = useState('ALL'); // ALL, BUSINESS, CLUB
  const [selectedOrg, setSelectedOrg] = useState(null); // Detailed view object
  const [selectedOrgJobs, setSelectedOrgJobs] = useState([]);
  const [selectedOrgJobsLoading, setSelectedOrgJobsLoading] = useState(false);
  const [selectedOrgQuests, setSelectedOrgQuests] = useState([]);
  const [selectedOrgQuestsLoading, setSelectedOrgQuestsLoading] = useState(false);
  const [selectedOrgDetailLoading, setSelectedOrgDetailLoading] = useState(false);
  const [selectedOrgTab, setSelectedOrgTab] = useState('JOBS');

  useEffect(() => {
    if (selectedOrg) {
      setSelectedOrgTab(selectedOrg.type === 'CLUB' ? 'QUESTS' : 'JOBS');
    }
  }, [selectedOrg]);

  // Job List and filtering states
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  // Filter States (synchronized with URL params)
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [filterIsRemote, setFilterIsRemote] = useState(false);
  const [filterCanApply, setFilterCanApply] = useState(false); // Filter by matching RS threshold
  const [searchMenu, setSearchMenu] = useState(null); // 'cat' | 'type' — segmented search-bar dropdowns

  // Merge database companies and mock companies (to guarantee a populated view)
  const allOrganizations = [...companiesList, ...defaultMockOrganizations.filter(mock => 
    !companiesList.some(db => db.name.toLowerCase() === mock.name.toLowerCase())
  )].map(org => ({
    ...org,
    // Add structural properties if missing
    logoColor: org.logoColor || getCompanyGradient(org.name),
    industry: org.industry || (org.companyType === 'CLUB' ? 'Hoạt động CLB & Tổ chức học thuật' : 'Lĩnh vực kinh doanh & Dịch vụ'),
    location: org.location || 'Việt Nam',
    website: org.website || 'https://nextplease.net',
    verified: org.verified !== undefined ? org.verified : true,
    type: org.type || (org.companyType === 'CLUB' ? 'CLUB' : 'BUSINESS')
  }));

  // Fetch approved companies from DB
  useEffect(() => {
    let isMounted = true;
    async function fetchCompanies() {
      try {
        const data = await getCompanies();
        if (isMounted) {
          setCompaniesList(data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách đối tác:", err);
      } finally {
        if (isMounted) {
          setCompaniesLoading(false);
        }
      }
    }
    fetchCompanies();
    return () => { isMounted = false; };
  }, []);

  // Sync tabSlug to activeView
  useEffect(() => {
    if (tabSlug) {
      const upperTab = tabSlug.toUpperCase();
      if (['OVERVIEW', 'OPPORTUNITIES', 'QUESTS', 'CREDENTIALS', 'ORGANIZATIONS', 'MY_APPLICATIONS', 'RECOMMENDATIONS', 'PREMIUM_STORE'].includes(upperTab)) {
        setActiveView(upperTab);
        setSelectedOrg(null);
      } else if (tabSlug.startsWith('org-')) {
        setActiveView('ORGANIZATION_DETAIL');
      } else {
        navigate('/candidates/dashboard/overview', { replace: true });
      }
    } else {
      navigate('/candidates/dashboard/overview', { replace: true });
    }
  }, [tabSlug, navigate]);

  // Fetch detailed B2B information and its jobs when viewing a specific company detail
  useEffect(() => {
    if (activeView === 'ORGANIZATION_DETAIL' && tabSlug?.startsWith('org-')) {
      const orgId = tabSlug.substring(4);
      
      let isMounted = true;
      async function loadOrgDetailAndJobs() {
        setSelectedOrgDetailLoading(true);
        setSelectedOrgJobsLoading(true);
        setSelectedOrgQuestsLoading(true);
        setSelectedOrgJobs([]);
        setSelectedOrgQuests([]);
        
        // Find in allOrganizations first as cached/instant placeholder
        const cached = allOrganizations.find(c => String(c.id) === orgId);
        if (cached && isMounted) {
          setSelectedOrg(cached);
          // Spawn this company as a dynamic tab in the sidebar
          setOpenOrgTabs(prev => {
            if (prev.some(t => String(t.id) === orgId)) return prev;
            return [...prev, cached];
          });
        }
        
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgId);
        if (!isUuid) {
          if (isMounted) {
            setSelectedOrgDetailLoading(false);
            setSelectedOrgJobsLoading(false);
            setSelectedOrgQuestsLoading(false);
            setSelectedOrgJobs([]);
            setSelectedOrgQuests([]);
          }
          return;
        }
        
        try {
          const detailedCompany = await getCompanyDetail(orgId);
          if (isMounted && detailedCompany) {
            const fullyLoadedOrg = {
              ...detailedCompany,
              logoColor: detailedCompany.logoColor || getCompanyGradient(detailedCompany.name),
              logoUrl: detailedCompany.logoUrl,
              website: detailedCompany.websiteUrl || 'https://nextplease.net',
              type: detailedCompany.companyType === 'CLUB' ? 'CLUB' : 'BUSINESS',
              verified: true
            };
            setSelectedOrg(fullyLoadedOrg);
            
            // Add or update sidebar tabs
            setOpenOrgTabs(prev => {
              const filtered = prev.filter(t => String(t.id) !== String(orgId));
              return [...filtered, fullyLoadedOrg];
            });
          }
        } catch (err) {
          console.error("Lỗi khi tải chi tiết đối tác từ DB:", err);
          if (!cached && isMounted) {
            navigate('/candidates/dashboard/organizations', { replace: true });
          }
        } finally {
          if (isMounted) {
            setSelectedOrgDetailLoading(false);
          }
        }
        
        try {
          const jobs = await getJobs({ companyId: orgId, limit: 200 });
          if (isMounted) {
            setSelectedOrgJobs(jobs || []);
          }
        } catch (err) {
          console.error("Lỗi khi tải tin tuyển dụng của đối tác từ DB:", err);
        } finally {
          if (isMounted) {
            setSelectedOrgJobsLoading(false);
          }
        }

        try {
          const quests = await searchQuests('', '', orgId);
          if (isMounted) {
            setSelectedOrgQuests(quests || []);
          }
        } catch (err) {
          console.error("Lỗi khi tải quest của đối tác từ DB:", err);
        } finally {
          if (isMounted) {
            setSelectedOrgQuestsLoading(false);
          }
        }
      }
      
      loadOrgDetailAndJobs();
      return () => { isMounted = false; };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabSlug, activeView, companiesLoading]);

  // Sync URL search queries to Opportunities filter states
  useEffect(() => {
    if (activeView === 'OPPORTUNITIES') {
      const searchParams = new URLSearchParams(location.search);
      setFilterSearch(searchParams.get('q') || '');
      setFilterCategory(searchParams.get('c') || '');
      setFilterSpecialty(searchParams.get('s') || '');
      setFilterJobType(searchParams.get('t') || '');
      setFilterIsRemote(searchParams.get('r') === 'true');
      setFilterCanApply(searchParams.get('fit') === 'true');
    }
  }, [location.search, activeView]);

  // Fetch portfolio data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getMyPortfolio();
        if (isMounted) {
          setPortfolio(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu portfolio:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Fetch jobs data
  useEffect(() => {
    let isMounted = true;
    async function fetchJobsData() {
      if (isMounted) {
        setJobsLoading(true);
      }
      try {
        const filters = { limit: 200 };
        if (filterSearch.trim()) filters.query = filterSearch.trim();
        if (filterCategory) filters.category = filterCategory;
        if (filterSpecialty) filters.specialty = filterSpecialty;
        if (filterJobType) filters.jobType = filterJobType;
        if (filterIsRemote) filters.isRemote = true;

        const data = await getJobs(filters);
        if (isMounted) {
          setJobsList(data || []);
          setJobsError(null);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách tin tuyển dụng:", err);
        if (isMounted) {
          setJobsError(err.message || "Không thể tải danh sách tin tuyển dụng.");
        }
      } finally {
        if (isMounted) {
          setJobsLoading(false);
        }
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchJobsData();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
  }, [filterSearch, filterCategory, filterSpecialty, filterJobType, filterIsRemote]);

  // Fetch credential submissions when CREDENTIALS or PREMIUM_STORE tab is active
  useEffect(() => {
    if (activeView !== 'CREDENTIALS' && activeView !== 'PREMIUM_STORE') return;
    let isMounted = true;
    setCredentialSubmissionsLoading(true);
    getMyCredentialSubmissions()
      .then(data => { if (isMounted) setCredentialSubmissions(data || []); })
      .catch(err => console.error('Lỗi tải minh chứng:', err))
      .finally(() => { if (isMounted) setCredentialSubmissionsLoading(false); });
    return () => { isMounted = false; };
  }, [activeView]);

  // Load real applications from API on mount AND when navigating to PREMIUM_STORE
  useEffect(() => {
    let isMounted = true;
    setApplicationsLoading(true);
    getMyApplications()
      .then(data => { if (isMounted) setAppliedJobs(data || []); })
      .catch(err => console.error('Lỗi tải ứng tuyển:', err))
      .finally(() => { if (isMounted) setApplicationsLoading(false); });
    return () => { isMounted = false; };
  }, [activeView]);

  // Load wallet on mount
  useEffect(() => {
    let isMounted = true;
    setWalletLoading(true);
    getWallet()
      .then(data => { if (isMounted) setWallet(data); })
      .catch(err => console.error('Lỗi tải ví:', err))
      .finally(() => { if (isMounted) setWalletLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Load premium config and recommendations on mount/update
  useEffect(() => {
    getPremiumConfig()
      .then(setPremiumConfig)
      .catch(err => console.error('Lỗi tải cấu hình premium:', err));
  }, []);

  useEffect(() => {
    if (!wallet || (!wallet.isPremium && !wallet.hasJobMatchAlert)) return;
    let isMounted = true;
    setRecommendationsLoading(true);
    getPersonalizedRecommendations()
      .then(data => { if (isMounted) setRecommendations(data); })
      .catch(err => console.error('Lỗi tải gợi ý cá nhân hóa:', err))
      .finally(() => { if (isMounted) setRecommendationsLoading(false); });
    return () => { isMounted = false; };
  }, [wallet]);

  // Load quests when OPPORTUNITIES tab opens (or on mount)
  useEffect(() => {
    let isMounted = true;
    setQuestsLoading(true);
    searchQuests(questSearchFilter, questCategoryFilter)
      .then(data => { if (isMounted) setQuestsList(data || []); })
      .catch(err => console.error('Lỗi tải Quest:', err))
      .finally(() => { if (isMounted) setQuestsLoading(false); });
    return () => { isMounted = false; };
  }, [questSearchFilter, questCategoryFilter]);

  // Load my quest applications on mount
  useEffect(() => {
    let isMounted = true;
    setQuestApplicationsLoading(true);
    getMyQuestApplications()
      .then(data => { if (isMounted) setQuestApplications(data || []); })
      .catch(err => console.error('Lỗi tải đơn Quest:', err))
      .finally(() => { if (isMounted) setQuestApplicationsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  async function handleApplyToQuest() {
    if (!selectedQuestForApply) return;
    const qFields = selectedQuestForApply.formFields || [];
    const missing = qFields.find((f) => f.required && !(questAnswers[f.id] || '').trim());
    if (missing) { setQuestApplyError(`Vui lòng trả lời: ${missing.label}`); return; }
    setQuestApplyError('');
    setQuestApplyLoading(true);
    try {
      const answers = qFields.length
        ? Object.fromEntries(qFields.map((f) => [f.id, (questAnswers[f.id] || '').trim()]).filter(([, v]) => v))
        : null;
      await applyToQuest(selectedQuestForApply.id, questCoverNote, answers);
      setQuestApplications(prev => [...prev, {
        questId: selectedQuestForApply.id,
        questTitle: selectedQuestForApply.title,
        companyName: selectedQuestForApply.companyName,
        category: selectedQuestForApply.category,
        expReward: selectedQuestForApply.expReward,
        npReward: selectedQuestForApply.npReward,
        status: 'SUBMITTED',
        appliedAt: new Date().toISOString(),
      }]);
      setQuestApplySuccess(`Đã nộp đơn Quest "${selectedQuestForApply.title}" thành công!`);
      bumpQuest('APPLY');
      setShowQuestApplyModal(false);
      setSelectedQuestForApply(null);
      setQuestCoverNote('');
      setTimeout(() => setQuestApplySuccess(''), 4000);
    } catch (err) {
      if (err.errorCode === 'RS_TOO_LOW') {
        setQuestApplyError(err.message);
      } else if (err.errorCode === 'ALREADY_APPLIED') {
        setQuestApplyError('Bạn đã ứng tuyển Quest này rồi.');
      } else {
        setQuestApplyError(err.message || 'Ứng tuyển Quest thất bại.');
      }
    } finally {
      setQuestApplyLoading(false);
    }
  }

  async function handleTopUp(e) {
    e.preventDefault();
    setTopUpError('');
    const amount = parseInt(topUpAmount, 10);
    if (!amount || amount < 10000) {
      setTopUpError('Số tiền tối thiểu là 10,000 VND.');
      return;
    }
    setTopUpLoading(true);
    try {
      const result = await topUp(amount);
      setWallet(prev => prev ? { ...prev, npBalance: result.balanceAfter } : prev);
      setTopUpSuccess(`Nạp thành công ${amount.toLocaleString('vi-VN')} NP vào ví!`);
      setTopUpAmount('50000');
      setTimeout(() => { setTopUpSuccess(''); setShowTopUpModal(false); }, 2500);
    } catch (err) {
      setTopUpError(err.message || 'Nạp thất bại. Vui lòng thử lại.');
    } finally {
      setTopUpLoading(false);
    }
  }

  async function handleBuyPremium() {
    setBuyPremiumError('');
    setBuyPremiumLoading(true);
    try {
      const result = await buyPremium();
      setWallet(prev => prev ? {
        ...prev,
        npBalance: result.npBalance,
        isPremium: true,
        premiumUntil: result.premiumUntil,
      } : prev);
      setShowPremiumPaywall(false);
      setApplySuccessMsg('Premium Pass đã được kích hoạt! Bạn có thể ứng tuyển các cơ hội Premium ngay bây giờ.');
      setTimeout(() => setApplySuccessMsg(''), 7000);
    } catch (err) {
      if (err.errorCode === 'INSUFFICIENT_NP') {
        setBuyPremiumError(err.message);
      } else {
        setBuyPremiumError(err.message || 'Mua Premium thất bại. Vui lòng thử lại.');
      }
    } finally {
      setBuyPremiumLoading(false);
    }
  }

  const handleSubmitCredential = async (e) => {
    e.preventDefault();
    setCredentialFormError('');
    setCredentialFormSuccess('');
    const currentMonthValue = getCurrentMonthValue();
    if (!credentialForm.projectName.trim() || !credentialForm.position.trim()) {
      setCredentialFormError('Vui lòng điền tên hoạt động và vai trò.');
      return;
    }
    if (credentialForm.startedAt && compareMonthValues(credentialForm.startedAt, currentMonthValue) > 0) {
      setCredentialFormError('Thời gian bắt đầu không được sau tháng hiện tại.');
      return;
    }
    if (credentialForm.endedAt && compareMonthValues(credentialForm.endedAt, currentMonthValue) > 0) {
      setCredentialFormError('Thời gian kết thúc không được sau tháng hiện tại.');
      return;
    }
    if (credentialForm.startedAt && credentialForm.endedAt && compareMonthValues(credentialForm.endedAt, credentialForm.startedAt) < 0) {
      setCredentialFormError('Thời gian kết thúc không được trước thời gian bắt đầu.');
      return;
    }
    setCredentialFormLoading(true);
    try {
      await submitCredential(credentialForm);
      setCredentialFormSuccess('Nộp minh chứng thành công! Hệ thống sẽ xem xét và phản hồi trong 1-3 ngày làm việc.');
      // Nhiệm vụ "minh chứng được duyệt" chỉ tính khi admin DUYỆT (bắn từ backend), không tính lúc nộp.
      setCredentialForm({ projectName: '', position: '', category: 'CLUB_SMALL', roleLevel: 'MEMBER', description: '', proofLink: '', proofImages: [], startedAt: '', endedAt: '' });
      setShowCredentialForm(false);
      const data = await getMyCredentialSubmissions();
      setCredentialSubmissions(data || []);
    } catch (err) {
      setCredentialFormError(err.message || 'Nộp minh chứng thất bại. Vui lòng thử lại.');
    } finally {
      setCredentialFormLoading(false);
    }
  };

  const handleTabChange = (viewName) => {
    navigate(`/candidates/dashboard/${viewName.toLowerCase()}`);
  };

  const handleCloseOrgTab = (e, orgId) => {
    e.stopPropagation();
    // Remove tab from active spawned tabs
    const updatedTabs = openOrgTabs.filter(t => String(t.id) !== String(orgId));
    setOpenOrgTabs(updatedTabs);
    
    // If the closed tab is currently active, navigate to organizations directory
    if (tabSlug === `org-${orgId}`) {
      navigate('/candidates/dashboard/organizations');
    }
  };

  const updateSearchUrl = (field, value) => {
    const searchParams = new URLSearchParams(location.search);
    if (value === '' || value === false || value === undefined) {
      searchParams.delete(field);
    } else {
      searchParams.set(field, value);
    }
    navigate(`/candidates/dashboard/opportunities?${searchParams.toString()}`, { replace: true });
  };

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function handleApplyJob(job) {
    viewOpportunityOnce(job.id || job.jobId);
    setSelectedJobForApply(job);
    setApplyModalError('');
    setApplyFormFields([]);
    setApplyAnswers({});
    setJobCoverNote('');
    setShowApplyModal(true);
    // Load custom questions (if any) for this job
    getJobDetail(job.id || job.jobId)
      .then((detail) => setApplyFormFields(detail?.formFields || []))
      .catch(() => setApplyFormFields([]));
  }

  async function confirmApplyJob() {
    if (!selectedJobForApply || applyModalLoading) return;
    // Validate required custom questions client-side
    const missing = applyFormFields.find((f) => f.required && !(applyAnswers[f.id] || '').trim());
    if (missing) {
      setApplyModalError(`Vui lòng trả lời: ${missing.label}`);
      return;
    }
    setApplyModalError('');
    setApplyModalLoading(true);
    try {
      const answers = applyFormFields.length
        ? Object.fromEntries(applyFormFields.map((f) => [f.id, (applyAnswers[f.id] || '').trim()]).filter(([, v]) => v))
        : null;
      await applyToJob(selectedJobForApply.id || selectedJobForApply.jobId, jobCoverNote.trim(), answers);
      // Reload real applications list
      const data = await getMyApplications();
      setAppliedJobs(data || []);
      bumpQuest('APPLY');
      setShowApplyModal(false);
      setSelectedJobForApply(null);
      setApplySuccessMsg(`Ứng tuyển thành công vị trí "${selectedJobForApply.title}"! Nhà tuyển dụng sẽ xem xét trong thời gian sớm nhất.`);
      setTimeout(() => setApplySuccessMsg(''), 6000);
    } catch (err) {
      if (err.errorCode === 'PREMIUM_REQUIRED') {
        setShowApplyModal(false);
        setShowPremiumPaywall(true);
      } else if (err.errorCode === 'EARLY_ACCESS_REQUIRED') {
        setShowApplyModal(false);
        setShowMatchAlertModal(true);
      } else {
        setApplyModalError(err.message || 'Ứng tuyển thất bại. Vui lòng thử lại.');
      }
    } finally {
      setApplyModalLoading(false);
    }
  }

  // Styled confirm dialog + toast (replaces native window.confirm / alert)
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => setToast({ type, message });
  const askConfirm = (opts) => setConfirmDialog(opts);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleBoostApplication = (applicationId, applicationType) => {
    askConfirm({
      title: 'Đẩy tin nổi bật (Profile Boost)',
      message: `Hệ thống sẽ trừ ${premiumConfig.boostPriceNp.toLocaleString()} NP để ghim đơn ứng tuyển này lên đầu danh sách của nhà tuyển dụng trong ${premiumConfig.boostDurationHours || 48} giờ.`,
      confirmText: 'Boost ngay',
      accent: '#d97706',
      onConfirm: async () => {
        const loadingKey = encodePremiumTarget(applicationType, applicationId);
        setBoostLoadingId(loadingKey);
        try {
          const result = await boostApplication(applicationId, applicationType);
          if (applicationType === 'QUEST') {
            const apps = await getMyQuestApplications();
            setQuestApplications(apps || []);
          } else {
            const apps = await getMyApplications();
            setAppliedJobs(apps || []);
          }
          setWallet(prev => prev ? { ...prev, npBalance: result.npBalance } : prev);
          showToast('success', 'Đẩy tin nổi bật thành công!');
        } catch (err) {
          showToast('error', err.message || 'Đẩy tin nổi bật thất bại.');
        } finally {
          setBoostLoadingId(null);
        }
      },
    });
  };

  const handleViewInsight = async (application) => {
    const applicationType = application.applicationType || 'JOB';
    const targetId = application.targetId || application.job_id || application.jobId || application.questId || application.id;
    const loadingKey = encodePremiumTarget(applicationType, targetId);
    setInsightLoadingJobId(loadingKey);
    try {
      const res = await getInsight(targetId, applicationType);
      setInsightData(res);
      setInsightModalJob({ ...application, applicationType, targetId });
    } catch (err) {
      showToast('error', err.message || "Không thể tải thống kê ứng tuyển.");
    } finally {
      setInsightLoadingJobId(null);
    }
  };

  const handleUnlockInsight = (targetId, applicationType) => {
    askConfirm({
      title: 'Mở khóa Application Insight',
      message: `Hệ thống sẽ trừ ${premiumConfig.insightPriceNp.toLocaleString()} NP để mở khóa thứ hạng và phân tích cạnh tranh cho đơn ứng tuyển này.`,
      confirmText: 'Mở khóa',
      accent: '#7c3aed',
      onConfirm: async () => {
        try {
          const res = await unlockInsight(targetId, applicationType);
          setWallet(prev => prev ? { ...prev, npBalance: res.npBalance } : prev);
          const newInsight = await getInsight(targetId, applicationType);
          setInsightData(newInsight);
          showToast('success', 'Mở khóa Insight thành công!');
        } catch (err) {
          showToast('error', err.message || 'Mở khóa Insight thất bại.');
        }
      },
    });
  };

  const handleExpressVerification = (experienceId) => {
    askConfirm({
      title: 'Xác thực nhanh 24h (Express)',
      message: `Hệ thống sẽ trừ ${premiumConfig.expressPriceNp.toLocaleString()} NP để ưu tiên thẩm định minh chứng này trong 24 giờ.`,
      confirmText: 'Nâng cấp Express',
      accent: '#d97706',
      onConfirm: async () => {
        setExpressLoadingId(experienceId);
        try {
          const res = await requestExpressVerification(experienceId);
          setWallet(prev => prev ? { ...prev, npBalance: res.npBalance } : prev);
          const creds = await getMyCredentialSubmissions();
          setCredentialSubmissions(creds || []);
          showToast('success', 'Đăng ký xác thực nhanh thành công!');
        } catch (err) {
          showToast('error', err.message || 'Đăng ký duyệt nhanh thất bại.');
        } finally {
          setExpressLoadingId(null);
        }
      },
    });
  };

  const handleSubscribeMatchAlert = () => {
    askConfirm({
      title: 'Đăng ký Job Match Alert',
      message: `Hệ thống sẽ trừ ${(premiumConfig.matchAlertPriceNp || 19000).toLocaleString()} NP cho gói 30 ngày: gợi ý việc làm cá nhân hóa + xem sớm tin mới.`,
      confirmText: 'Đăng ký ngay',
      accent: '#059669',
      onConfirm: async () => {
        setSubscribingMatchAlert(true);
        try {
          await subscribeJobMatchAlert();
          const newWallet = await getWallet();
          setWallet(newWallet);
          showToast('success', 'Đăng ký dịch vụ Job Match Alert thành công!');
          setShowMatchAlertModal(false);
        } catch (err) {
          showToast('error', err.message || 'Đăng ký thất bại.');
        } finally {
          setSubscribingMatchAlert(false);
        }
      },
    });
  };

  async function handleWithdrawJob(applicationId) {
    setWithdrawingId(applicationId);
    setWithdrawError('');
    try {
      await withdrawApplication(applicationId);
      const data = await getMyApplications();
      setAppliedJobs(data || []);
    } catch (err) {
      setWithdrawError(err.message || 'Rút đơn thất bại.');
    } finally {
      setWithdrawingId(null);
    }
  }

  async function handleWithdrawQuest(applicationId) {
    setWithdrawingId(applicationId);
    setWithdrawError('');
    try {
      await withdrawQuestApplication(applicationId);
      const data = await getMyQuestApplications();
      setQuestApplications(data || []);
    } catch (err) {
      setWithdrawError(err.message || 'Rút đơn thất bại.');
    } finally {
      setWithdrawingId(null);
    }
  }

  // Level & EXP calculations — prefer real gamification data (matches backend threshold 100·N^1.2).
  const currentLevel = gamification?.level ?? portfolio?.currentLevel ?? 1;
  const currentExp = gamification?.expIntoLevel ?? portfolio?.totalExp ?? 0;
  const nextLevelExp = gamification?.expForNextLevel ?? (currentLevel * 1000);
  const expPercentage = Math.min(100, Math.round((currentExp / Math.max(1, nextLevelExp)) * 100));
  const streak = gamification?.currentStreak ?? 0;
  const dailyQuests = gamification?.dailyQuests ?? [];
  const weeklyQuests = gamification?.weeklyQuests ?? [];

  // Checklist verification states
  const has3D = portfolio?.onboardingCompleted === true;
  const hasSchool = !!portfolio?.school?.trim();
  const hasCredentials = portfolio?.credentials && portfolio.credentials.length > 0;
  const hasApplications = appliedJobs.length > 0;


  // Filters candidates jobs by RS threshold if checked
  const candidateRs = portfolio?.reputationScore || 0;
  const filteredJobs = jobsList.filter(job => {
    if (filterCanApply) {
      return candidateRs >= job.minReqRs;
    }
    return true;
  });

  // Pagination (Bảng cơ hội + Quest) — ~18 tin / trang
  const OPP_PAGE_SIZE = 18;
  const [jobsPage, setJobsPage] = useState(1);
  const [questsPage, setQuestsPage] = useState(1);
  const [orgJobsPage, setOrgJobsPage] = useState(1);
  const [orgQuestsPage, setOrgQuestsPage] = useState(1);
  const ORG_PAGE_SIZE = 6;
  useEffect(() => { setJobsPage(1); }, [filterCategory, filterSpecialty, filterJobType, filterIsRemote, filterCanApply, filterSearch]);
  useEffect(() => { setQuestsPage(1); }, [questSearchFilter, questCategoryFilter]);
  useEffect(() => { setOrgJobsPage(1); }, [selectedOrg?.id, selectedOrgTab]);
  useEffect(() => { setOrgQuestsPage(1); }, [selectedOrg?.id, selectedOrgTab]);
  const pagedJobs = filteredJobs.slice((jobsPage - 1) * OPP_PAGE_SIZE, jobsPage * OPP_PAGE_SIZE);
  const pagedQuests = questsList.slice((questsPage - 1) * OPP_PAGE_SIZE, questsPage * OPP_PAGE_SIZE);
  const renderPager = (total, page, setPage, pageSize = OPP_PAGE_SIZE) => {
    const pageCount = Math.ceil(total / pageSize);
    if (pageCount <= 1) return null;
    const nums = Array.from({ length: pageCount }, (_, i) => i + 1);
    const scrollUp = () => document.querySelector('.candidate-portal-main')?.scrollTo({ top: 0, behavior: 'smooth' });
    return (
      <div className="np-pager">
        <button type="button" className="np-pager-btn" disabled={page === 1} onClick={() => { setPage(p => Math.max(1, p - 1)); scrollUp(); }} aria-label="Trang trước"><ChevronLeft size={16} /></button>
        {nums.map(n => (
          <button type="button" key={n} className={`np-pager-num ${n === page ? 'active' : ''}`} onClick={() => { setPage(n); scrollUp(); }}>{n}</button>
        ))}
        <button type="button" className="np-pager-btn" disabled={page === pageCount} onClick={() => { setPage(p => Math.min(pageCount, p + 1)); scrollUp(); }} aria-label="Trang sau"><ChevronRight size={16} /></button>
      </div>
    );
  };

  // Filter organizations based on category/search input
  const filteredOrgs = allOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
                          org.description.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
                          org.industry.toLowerCase().includes(orgSearchQuery.toLowerCase());
    
    const matchesType = orgTypeFilter === 'ALL' || org.type === orgTypeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading && !portfolio) {
    return (
      <div className="route-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--muted)',
        background: 'var(--bg)',
      }}>
        Đang tải thông tin ứng viên...
      </div>
    );
  }

  return (
    <div className="candidate-portal-layout">
      <NotificationBell accent="#e5533f" />

      {/* ─── Bottom Dock Navigation (macOS-style) ─── */}
      <nav className="np-dock" aria-label="Điều hướng chính">
        <div className="np-dock-inner">
          <button
            className={`np-dock-item ${activeView === 'OVERVIEW' ? 'active' : ''}`}
            onClick={() => handleTabChange('OVERVIEW')}
            type="button"
          >
            <UserRound size={22} />
            <span className="np-dock-label">Tổng quan tài năng</span>
          </button>

          <button
            className={`np-dock-item ${activeView === 'OPPORTUNITIES' ? 'active' : ''}`}
            onClick={() => handleTabChange('OPPORTUNITIES')}
            type="button"
          >
            <BriefcaseBusiness size={22} />
            <span className="np-dock-label">Bảng cơ hội</span>
          </button>

          <button
            className={`np-dock-item ${activeView === 'QUESTS' ? 'active' : ''}`}
            onClick={() => handleTabChange('QUESTS')}
            type="button"
          >
            <Zap size={22} />
            <span className="np-dock-label">Quest</span>
          </button>

          <button
            className={`np-dock-item ${activeView === 'RECOMMENDATIONS' ? 'active' : ''}`}
            onClick={() => handleTabChange('RECOMMENDATIONS')}
            type="button"
          >
            <Sparkles size={22} color={wallet?.hasJobMatchAlert ? '#facc15' : 'currentColor'} />
            <span className="np-dock-badge np-dock-badge-new">NEW</span>
            <span className="np-dock-label">Gợi ý việc làm AI</span>
          </button>

          <button
            className={`np-dock-item ${activeView === 'PREMIUM_STORE' ? 'active' : ''}`}
            onClick={() => handleTabChange('PREMIUM_STORE')}
            type="button"
            style={{ color: '#f59e0b' }}
          >
            <Crown size={22} color="#f59e0b" />
            <span className="np-dock-badge np-dock-badge-hot">HOT</span>
            <span className="np-dock-label">Cửa hàng Premium</span>
          </button>

          <button
            className={`np-dock-item ${activeView === 'ORGANIZATIONS' ? 'active' : ''}`}
            onClick={() => handleTabChange('ORGANIZATIONS')}
            type="button"
          >
            <Building size={22} />
            <span className="np-dock-label">Doanh nghiệp & CLB</span>
          </button>

          {/* Dynamic tabs spawned when viewing companies */}
          {openOrgTabs.length > 0 && <span className="np-dock-sep" />}
          {openOrgTabs.map((org) => {
            const isActive = activeView === 'ORGANIZATION_DETAIL' && selectedOrg?.id === org.id;
            return (
              <button
                key={org.id}
                className={`np-dock-item np-dock-org-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(`org-${org.id}`)}
                type="button"
              >
                <div className="np-dock-org-logo" style={{ background: org.logoUrl ? 'transparent' : org.logoColor }}>
                  {org.logoUrl ? (
                    <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    org.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <button
                  type="button"
                  className="np-dock-tab-close"
                  aria-label={`Đóng tab ${org.name}`}
                  onClick={(e) => handleCloseOrgTab(e, org.id)}
                >
                  <X size={11} />
                </button>
                <span className="np-dock-label">{org.name}</span>
              </button>
            );
          })}

          <span className="np-dock-sep" />

          <button
            className={`np-dock-item ${activeView === 'MY_APPLICATIONS' ? 'active' : ''}`}
            onClick={() => handleTabChange('MY_APPLICATIONS')}
            type="button"
          >
            <Clock3 size={22} />
            {(appliedJobs.length + questApplications.length) > 0 && (
              <span className="np-dock-badge np-dock-badge-count">{appliedJobs.length + questApplications.length}</span>
            )}
            <span className="np-dock-label">Theo dõi ứng tuyển</span>
          </button>

          <button
            className={`np-dock-item ${activeView === 'CREDENTIALS' ? 'active' : ''}`}
            onClick={() => handleTabChange('CREDENTIALS')}
            type="button"
          >
            <Award size={22} />
            <span className="np-dock-label">Minh chứng & Trạng thái</span>
          </button>

          {has3D ? (
            <Link className="np-dock-item" to="/portfolio/edit">
              <FileText size={22} />
              <span className="np-dock-label">Chỉnh sửa Portfolio 3D</span>
            </Link>
          ) : (
            <Link className="np-dock-item" to="/portfolio">
              <FileText size={22} />
              <span className="np-dock-label">Khởi tạo Portfolio 3D</span>
            </Link>
          )}

          <span className="np-dock-sep" />

          {/* Profile — replaces the old sidebar's profile card + wallet chip + logout */}
          <div className="np-dock-profile-wrap" ref={dockProfileRef}>
            <button
              className="np-dock-item np-dock-profile-trigger"
              onClick={() => setShowDockProfileMenu((v) => !v)}
              type="button"
            >
              <span className="np-dock-avatar">
                {portfolio?.name ? portfolio.name.slice(0, 2).toUpperCase() : 'C'}
              </span>
              <span className="np-dock-label">Tài khoản</span>
            </button>

            {showDockProfileMenu && (
              <div className="np-dock-profile-menu">
                <div className="np-dock-profile-menu-header">
                  <span className="np-dock-avatar np-dock-avatar-lg">
                    {portfolio?.name ? portfolio.name.slice(0, 2).toUpperCase() : 'C'}
                  </span>
                  <div>
                    <div className="np-dock-profile-menu-name">{portfolio?.name || 'Ứng viên'}</div>
                    <div className="np-dock-profile-menu-level">Candidate Talent · Cấp độ {currentLevel}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowTopUpModal(true); setShowDockProfileMenu(false); }}
                  className={`candidate-wallet-chip np-dock-profile-wallet ${wallet?.isPremium ? 'premium' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <WalletCards size={15} color={wallet?.isPremium ? '#d97706' : 'var(--muted)'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--ink)' }}>
                      {walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString()} NP
                    </span>
                  </div>
                  {wallet?.isPremium
                    ? <Crown size={13} color="#d97706" />
                    : <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>Nạp</span>
                  }
                </button>

                <button
                  className="np-dock-profile-settings"
                  onClick={() => { setShowSettingsModal(true); setShowDockProfileMenu(false); }}
                  type="button"
                >
                  <Settings size={16} />
                  <span>Cài đặt tài khoản</span>
                </button>

                <button
                  className="np-dock-profile-logout"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Main Workspace Content ─── */}
      <main className="candidate-portal-main">
        {applySuccessMsg && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.92rem',
            fontWeight: '600',
            animation: 'fadeInModal 0.3s ease'
          }}>
            <CheckCircle2 size={20} />
            <div style={{ flexGrow: 1 }}>{applySuccessMsg}</div>
            <button
              onClick={() => setApplySuccessMsg('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', display: 'flex' }}
              type="button"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* 1. OVERVIEW VIEW */}
        {activeView === 'OVERVIEW' && (
          <div className="np-view">
            <style>{`
              @keyframes npStreakPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
              @keyframes npQuestPop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
              @keyframes npBarFill { from { width: 0; } }
              @keyframes npFloatUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
              .np-streak-flame { animation: npStreakPulse 1.8s ease-in-out infinite; }
              .np-quest-card { background:var(--card-bg-strong); border:1px solid var(--c-line); border-radius:16px; padding:18px 20px; display:flex; flex-direction:column; gap:16px; animation: npFloatUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
              .np-quest-row { display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid var(--c-line); }
              .np-quest-row:last-child { border-bottom:none; }
              .np-quest-icon { flex-shrink:0; width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; }
              .np-quest-prog { height:7px; border-radius:999px; background:var(--c-line); overflow:hidden; margin-top:6px; }
              .np-quest-prog > span { display:block; height:100%; border-radius:999px; transition: width 0.6s cubic-bezier(0.22,1,0.36,1); }
              .np-quest-claim { border:none; cursor:pointer; font-weight:800; font-size:0.8rem; padding:7px 14px; border-radius:999px; display:inline-flex; align-items:center; gap:6px; transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease; }
              .np-quest-claim:hover { transform: translateY(-2px); box-shadow:0 10px 22px rgba(229,83,63,0.25); }
              .np-quest-claim:active { transform: scale(0.96); }
              .np-quest-claim.ready { background:#e5533f; color:#fff; animation: npQuestPop 0.4s ease both; }
              .np-quest-claim.claimed { background:#e7f6ec; color:#16a34a; cursor:default; }
              .np-quest-claim.locked { background:var(--c-line); color:var(--c-muted); cursor:default; }
              @media (prefers-reduced-motion: reduce) { .np-streak-flame, .np-quest-card, .np-quest-claim.ready { animation:none !important; } }
            `}</style>
            <header className="candidate-overview-header" style={{ marginBottom: '20px' }}>
              <div className="candidate-overview-title">
                <h1>Chào {portfolio?.name || 'bạn'}</h1>
                <p>Không gian danh tiếng của bạn. Giữ streak và hoàn thành nhiệm vụ để lên hạng.</p>
              </div>
            </header>

            {/* Reputation Passport - hero focal point */}
            <section className="np-passport">
              <div className="np-pp-avatar">
                <div className="avatar-3d-glow-frame">
                  <PortfolioAvatar3D avatar={portfolio?.avatar} />
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="np-pp-name">{portfolio?.name || 'Ứng viên'}</span>
                  <span className="exp-level-badge">LV. {currentLevel}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(249,115,22,0.18)', padding: '5px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', color: '#fb923c' }} title={`Chuỗi dài nhất: ${gamification?.longestStreak ?? 0} ngày`}>
                    <Flame className="np-streak-flame" size={15} color="#fb923c" fill={streak > 0 ? '#fb923c' : 'none'} /> {streak} ngày streak
                  </span>
                </div>
                <div className="np-pp-sub">{has3D ? 'Hồ sơ 3D đã kích hoạt, đang hiển thị với nhà tuyển dụng' : 'Hồ sơ 3D chưa thiết lập, hoàn thiện để nổi bật hơn'}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '18px 0 7px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>Tiến độ lên cấp {currentLevel + 1}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800' }}><span style={{ color: '#f6845f' }}>{Number(currentExp).toLocaleString('vi-VN')}</span> / {Number(nextLevelExp).toLocaleString('vi-VN')} EXP</span>
                </div>
                <div className="np-pp-expbar"><span style={{ width: `${expPercentage}%` }} /></div>

                <Link to={has3D ? '/portfolio/edit' : '/portfolio'} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '16px', fontSize: '0.86rem', fontWeight: '700', color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '9px 16px', borderRadius: '999px', textDecoration: 'none' }}>
                  <UserRound size={15} /> {has3D ? 'Chỉnh sửa Portfolio 3D' : 'Thiết lập Portfolio 3D'} <ArrowRight size={14} />
                </Link>
              </div>

              <div className="np-pp-stats">
                <button type="button" onClick={() => setShowTopUpModal(true)} title="Nhấn để nạp NP" className="np-pp-stat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, textAlign: 'left' }}>
                  <div className="np-pp-stat-val" style={{ color: '#4ade80' }}>{walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString('vi-VN')}</div>
                  <div className="np-pp-stat-label"><WalletCards size={13} /> Ví NP {wallet?.isPremium && <Crown size={11} color="#fbbf24" style={{ marginLeft: '2px' }} />}</div>
                </button>
                <div className="np-pp-divider" />
                <div className="np-pp-stat">
                  <div className="np-pp-stat-val" style={{ color: '#c4b5fd' }}>{portfolio?.reputationScore ?? 0}</div>
                  <div className="np-pp-stat-label"><ShieldCheck size={13} /> Trust Score (RS)</div>
                </div>
              </div>
            </section>


            {/* Daily & weekly quests */}
            {gamification && (
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '20px' }}>
                <QuestPanel
                  title="Nhiệm vụ hằng ngày"
                  subtitle="đặt lại mỗi ngày"
                  icon={<Target size={17} />}
                  accent="#e5533f"
                  accentSoft="rgba(229,83,63,0.1)"
                  quests={dailyQuests}
                  scope="DAILY"
                  onClaim={handleClaimQuest}
                  claiming={claimingQuest}
                />
                <QuestPanel
                  title="Nhiệm vụ tuần"
                  subtitle="đặt lại mỗi tuần"
                  icon={<Award size={17} />}
                  accent="#7c3aed"
                  accentSoft="rgba(124,58,237,0.1)"
                  quests={weeklyQuests}
                  scope="WEEKLY"
                  onClaim={handleClaimQuest}
                  claiming={claimingQuest}
                />
              </section>
            )}

            <section className="candidate-checklist-card" style={{ marginTop: '20px' }}>
              <h2 className="candidate-checklist-title">
                <CheckCircle2 size={20} color="var(--primary)" />
                Hành trình phát triển hồ sơ (Next Steps)
              </h2>

              <div className="checklist-item">
                <div className="checklist-item-checkbox">
                  {has3D ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                </div>
                <div className="checklist-item-content">
                  <span className="checklist-item-title" style={{ textDecoration: has3D ? 'line-through' : 'none', opacity: has3D ? 0.6 : 1 }}>
                    Khởi tạo và lưu hồ sơ Portfolio 3D
                  </span>
                  <span className="checklist-item-desc">Thiết lập nhân vật avatar đại diện 3D và điền các kỹ năng chuyên môn cốt lõi.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-item-checkbox">
                  {hasSchool ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                </div>
                <div className="checklist-item-content">
                  <span className="checklist-item-title" style={{ textDecoration: hasSchool ? 'line-through' : 'none', opacity: hasSchool ? 0.6 : 1 }}>
                    Bổ sung thông tin trường học & học vấn
                  </span>
                  <span className="checklist-item-desc">Điền thông tin trường cao đẳng/đại học để hỗ trợ bộ lọc tin tuyển dụng.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-item-checkbox">
                  {hasCredentials ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                </div>
                <div className="checklist-item-content">
                  <span className="checklist-item-title" style={{ textDecoration: hasCredentials ? 'line-through' : 'none', opacity: hasCredentials ? 0.6 : 1 }}>
                    Đăng tải minh chứng chứng chỉ / bằng cấp
                  </span>
                  <span className="checklist-item-desc">Nộp file minh chứng để nâng điểm danh tiếng (Reputation Score) tối đa.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-item-checkbox">
                  {hasApplications ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                </div>
                <div className="checklist-item-content">
                  <span className="checklist-item-title" style={{ textDecoration: hasApplications ? 'line-through' : 'none', opacity: hasApplications ? 0.6 : 1 }}>
                    Tìm kiếm và ứng tuyển Quest đầu tiên
                  </span>
                  <span className="checklist-item-desc">Khám phá Bảng cơ hội và gửi đơn ứng tuyển vào dự án phù hợp với năng lực.</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. OPPORTUNITIES VIEW */}
        {activeView === 'OPPORTUNITIES' && (
          <section className="np-view">
            {/* HERO SEARCH */}
            <div className="np-jobs-hero">
              <p className="np-jobs-eyebrow">{jobsList.length}+ cơ hội việc làm & Quest đang mở</p>
              <h2 className="np-jobs-title">Tìm bước tiếp theo</h2>
            </div>
            <div className="np-search-bar">
                <div className="np-sb-seg">
                  <button type="button" className="np-sb-trigger accent" onClick={() => setSearchMenu(searchMenu === 'cat' ? null : 'cat')}>
                    <SlidersHorizontal size={16} /> {filterCategory ? CATEGORY_MAP[filterCategory].label : 'Danh mục'} <ChevronDown size={15} />
                  </button>
                  {searchMenu === 'cat' && (
                    <div className="np-sb-menu">
                      <button className={!filterCategory ? 'active' : ''} onClick={() => { setFilterCategory(''); setFilterSpecialty(''); updateSearchUrl('c', ''); updateSearchUrl('s', ''); setSearchMenu(null); }}>Mọi lĩnh vực</button>
                      {Object.keys(CATEGORY_MAP).map(key => (
                        <button key={key} className={filterCategory === key ? 'active' : ''} onClick={() => { setFilterCategory(key); setFilterSpecialty(''); updateSearchUrl('c', key); updateSearchUrl('s', ''); setSearchMenu(null); }}>{CATEGORY_MAP[key].label}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="np-search-div" />
                <Search size={18} style={{ color: 'var(--c-muted)', flexShrink: 0 }} />
                <input type="text" value={filterSearch} onChange={e => { setFilterSearch(e.target.value); updateSearchUrl('q', e.target.value); }} placeholder="Vị trí tuyển dụng, tên công ty..." />
                <div className="np-search-div" />
                <div className="np-sb-seg">
                  <button type="button" className="np-sb-trigger" onClick={() => setSearchMenu(searchMenu === 'type' ? null : 'type')}>
                    <SlidersHorizontal size={15} /> Bộ lọc{(filterJobType || filterIsRemote || filterCanApply) ? ` · ${[filterJobType, filterIsRemote, filterCanApply].filter(Boolean).length}` : ''} <ChevronDown size={15} />
                  </button>
                  {searchMenu === 'type' && (
                    <div className="np-sb-menu" style={{ minWidth: '260px' }}>
                      <div className="np-sb-menu-label">Loại hình</div>
                      <button className={!filterJobType ? 'active' : ''} onClick={() => { setFilterJobType(''); updateSearchUrl('t', ''); }}>Tất cả loại hình</button>
                      {JOB_TYPES.map(opt => (
                        <button key={opt.value} className={filterJobType === opt.value ? 'active' : ''} onClick={() => { setFilterJobType(opt.value); updateSearchUrl('t', opt.value); }}>{opt.label}</button>
                      ))}
                      <div className="np-sb-menu-sep" />
                      <div className="np-sb-menu-label">Khác</div>
                      <button className={filterIsRemote ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => { const v = !filterIsRemote; setFilterIsRemote(v); updateSearchUrl('r', v); }}>Chỉ Remote {filterIsRemote && <Check size={15} />}</button>
                      <button className={filterCanApply ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => { const v = !filterCanApply; setFilterCanApply(v); updateSearchUrl('fit', v); }}>Đủ RS để ứng tuyển {filterCanApply && <Check size={15} />}</button>
                    </div>
                  )}
                </div>
                <button type="button" className="np-search-btn">Tìm kiếm</button>
              </div>
              {searchMenu && <div className="np-sb-overlay" onClick={() => setSearchMenu(null)} />}
              {(filterCategory || filterSpecialty || filterJobType || filterIsRemote || filterCanApply || filterSearch) && (
                <button type="button" onClick={() => { setFilterCategory(''); setFilterSpecialty(''); setFilterJobType(''); setFilterIsRemote(false); setFilterCanApply(false); setFilterSearch(''); }}
                  style={{ display: 'block', margin: '14px auto 0', fontSize: '0.82rem', color: 'var(--c-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Xóa tất cả bộ lọc</button>
              )}

            {/* FEATURED COMPANIES */}
            {(() => {
              const byCo = new Map();
              jobsList.forEach(j => { const key = j.companyId || j.companyName; if (!key) return; if (!byCo.has(key)) byCo.set(key, { key, companyId: j.companyId, name: j.companyName, logo: j.companyLogo, count: 0 }); byCo.get(key).count += 1; });
              const totalCo = byCo.size;
              const featured = [...byCo.values()].sort((a, b) => b.count - a.count).slice(0, 8);
              if (featured.length === 0) return null;
              return (
                <div className="np-jobs-section">
                  <div className="np-jobs-section-head">
                    <h3>Đối tác đang tuyển <span className="np-head-count">{totalCo}</span></h3>
                    <button type="button" onClick={() => handleTabChange('ORGANIZATIONS')} style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--c-red)', background: 'none', border: 'none', cursor: 'pointer' }}>Xem tất cả</button>
                  </div>
                  <div className="np-co-strip">
                    {featured.map(co => (
                      <button type="button" key={co.key} className="np-co-chip" onClick={() => { if (co.companyId) { handleTabChange(`org-${co.companyId}`); } else { setFilterSearch(co.name); updateSearchUrl('q', co.name); } }}>
                        <div className="np-job-logo">
                          {co.logo ? <img src={co.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building size={18} style={{ color: 'var(--c-muted)' }} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="np-co-chip-name">{co.name || 'Đối tác'}</div>
                          <div className="np-co-chip-sub">{co.count} vị trí đang mở</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* JOB LIST */}
            <div className="np-jobs-section">
              <div className="np-jobs-section-head">
                <h3>Cơ hội phù hợp</h3>
                <span style={{ fontSize: '0.88rem', color: 'var(--c-muted)', fontWeight: '700' }}><strong style={{ color: 'var(--c-ink)' }}>{filteredJobs.length}</strong> kết quả</span>
              </div>
              {jobsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '70px 20px', gap: '12px', background: 'var(--c-surface-soft)', borderRadius: '20px' }}>
                  <RefreshCw size={26} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                  <p style={{ fontSize: '0.92rem', color: 'var(--c-muted)', fontWeight: '600', margin: 0 }}>Đang tải...</p>
                </div>
              ) : jobsError ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', background: 'rgba(220,38,38,0.05)', borderRadius: '16px', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
                  <AlertTriangle size={20} /><p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600' }}>{jobsError}</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '70px 20px', gap: '12px', background: 'var(--c-surface-soft)', borderRadius: '20px', border: '1px dashed var(--c-line)', textAlign: 'center' }}>
                  <Search size={28} style={{ color: 'var(--c-muted)' }} />
                  <div><h3 style={{ margin: '0 0 4px', color: 'var(--c-ink)' }}>Không tìm thấy cơ hội nào</h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--c-muted)' }}>Thử bỏ bớt bộ lọc để xem thêm kết quả.</p></div>
                </div>
              ) : (
                <div className="np-joblist np-stagger" key={`jobs-${jobsPage}`}>
                  {pagedJobs.map(job => {
                    const isLocked = candidateRs < job.minReqRs;
                    const isEarlyAccess = job.createdAt && (new Date() - new Date(job.createdAt)) < (premiumConfig.earlyAccessHours * 60 * 60 * 1000);
                    const userHasEarlyAccess = wallet?.isPremium || wallet?.hasJobMatchAlert;
                    const alreadyApplied = appliedJobs.some(a => (a.job_id || a.jobId) === job.id);
                    const compensationText = job.compensation > 0 ? `${Number(job.compensation).toLocaleString()} VND` : 'Thỏa thuận';
                    const typeLabel = JOB_TYPES.find(t => t.value === job.jobType)?.label || job.jobType;
                    const typeExp = JOB_TYPES.find(t => t.value === job.jobType)?.exp;
                    return (
                      <div key={job.id} className="np-job-row">
                        <div className="np-job-logo">
                          {job.companyLogo ? <img src={job.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building size={20} style={{ color: 'var(--c-muted)' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(job.id)} className="np-role-title">{job.title}</a>
                            {job.requiresPremium && <span className="np-role-badge" style={{ color: '#d97706', background: 'rgba(245,158,11,0.14)' }}><Crown size={9} /> Premium</span>}
                            {isEarlyAccess && <span className="np-role-badge" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}><Clock3 size={9} /> {userHasEarlyAccess ? 'Xem sớm' : 'Xem sớm'}</span>}
                            {isLocked && <span className="np-role-badge" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}><LockKeyhole size={9} /> Cần {job.minReqRs} RS</span>}
                          </div>
                          <div className="np-job-meta">
                            <span>{job.companyName || 'Đối tác'}</span>
                            <span>{job.isRemote ? 'Remote' : (job.location || 'Linh hoạt')}</span>
                            <span style={{ color: '#16a34a', fontWeight: '700' }}>{compensationText}</span>
                            {typeLabel && <span>{typeLabel}</span>}
                            {typeExp && <span style={{ color: '#f59e0b', fontWeight: '700' }}>+{typeExp} EXP</span>}
                            {(() => { const d = deadlineLabel(job.deadlineAt); return d ? <span style={{ color: d.tone === 'expired' ? '#dc2626' : (d.tone === 'soon' ? '#ea580c' : undefined), fontWeight: d.tone !== 'normal' ? '700' : undefined }} title={`Hạn nộp ${new Date(job.deadlineAt).toLocaleDateString('vi-VN')}`}>{d.text}</span> : null; })()}
                          </div>
                        </div>
                        <div className="np-job-actions">
                          <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(job.id)} className="np-job-detail">Chi tiết</a>
                          <button type="button" disabled={isLocked || alreadyApplied} onClick={() => handleApplyJob(job)}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '9px', border: 'none', whiteSpace: 'nowrap', background: (isLocked || alreadyApplied) ? 'var(--c-disabled)' : 'var(--c-red)', color: (isLocked || alreadyApplied) ? 'var(--c-muted)' : '#fff', cursor: (isLocked || alreadyApplied) ? 'not-allowed' : 'pointer' }}>
                            {alreadyApplied ? <><Check size={12} /> Đã ứng tuyển</> : isLocked ? <><LockKeyhole size={12} /> Cần RS</> : 'Ứng tuyển'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!jobsLoading && !jobsError && renderPager(filteredJobs.length, jobsPage, setJobsPage)}
            </div>
          </section>
        )}

        {/* 2b. QUEST BOARD — dedicated QUESTS tab */}
        {activeView === 'QUESTS' && (
          <section className="np-view">
            {questApplySuccess && <div className="alert-banner success" style={{ marginBottom: '16px' }}>{questApplySuccess}</div>}
            {(() => {
              const CAT = { SMALL_EVENT: { label: 'Sự kiện nhỏ', color: '#8b5cf6' }, SCHOOL_CAMPAIGN: { label: 'Chiến dịch trường', color: '#0ea5e9' }, COMPANY_PROJECT: { label: 'Dự án DN', color: '#f59e0b' }, SHORT_INTERNSHIP: { label: 'Thực tập ngắn', color: '#10b981' }, FREELANCE_GIG: { label: 'Freelance', color: '#ec4899' } };
              const byCo = new Map();
              questsList.forEach(q => { const key = q.companyId || q.companyName; if (!key) return; if (!byCo.has(key)) byCo.set(key, { key, companyId: q.companyId, name: q.companyName, count: 0 }); byCo.get(key).count += 1; });
              const totalClubs = byCo.size;
              const featured = [...byCo.values()].sort((a, b) => b.count - a.count).slice(0, 8);
              return (
                <>
                  {/* HERO SEARCH */}
                  <div className="np-jobs-hero">
                    <p className="np-jobs-eyebrow">{questsList.length}+ Quest & chiến dịch từ câu lạc bộ</p>
                    <h2 className="np-jobs-title">Tham gia Quest CLB</h2>
                  </div>
                  <div className="np-search-bar">
                      <div className="np-sb-seg">
                        <button type="button" className="np-sb-trigger accent" onClick={() => setSearchMenu(searchMenu === 'cat' ? null : 'cat')}>
                          <SlidersHorizontal size={16} /> {questCategoryFilter ? (CAT[questCategoryFilter]?.label || 'Danh mục') : 'Danh mục'} <ChevronDown size={15} />
                        </button>
                        {searchMenu === 'cat' && (
                          <div className="np-sb-menu">
                            <button className={!questCategoryFilter ? 'active' : ''} onClick={() => { setQuestCategoryFilter(''); setSearchMenu(null); }}>Mọi loại Quest</button>
                            {['SMALL_EVENT', 'SCHOOL_CAMPAIGN'].map(val => (
                              <button key={val} className={questCategoryFilter === val ? 'active' : ''} onClick={() => { setQuestCategoryFilter(val); setSearchMenu(null); }}>{CAT[val].label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="np-search-div" />
                      <Search size={18} style={{ color: 'var(--c-muted)', flexShrink: 0 }} />
                      <input type="text" value={questSearchFilter} onChange={e => setQuestSearchFilter(e.target.value)} placeholder="Tìm Quest, CLB hoặc mô tả..." />
                      <button type="button" className="np-search-btn">Tìm kiếm</button>
                    </div>
                    {searchMenu && <div className="np-sb-overlay" onClick={() => setSearchMenu(null)} />}
                    {(questCategoryFilter || questSearchFilter) && (
                      <div className="np-quick-filters">
                        <button type="button" onClick={() => { setQuestCategoryFilter(''); setQuestSearchFilter(''); }}
                          style={{ fontSize: '0.8rem', color: 'var(--c-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', padding: '6px 8px' }}>Xóa lọc</button>
                      </div>
                    )}

                  {/* FEATURED CLUBS */}
                  {featured.length > 0 && (
                    <div className="np-jobs-section">
                      <div className="np-jobs-section-head">
                        <h3>CLB đang mở Quest <span className="np-head-count">{totalClubs}</span></h3>
                      </div>
                      <div className="np-co-strip">
                        {featured.map(co => (
                          <button type="button" key={co.key} className="np-co-chip" onClick={() => { if (co.companyId) { handleTabChange(`org-${co.companyId}`); } else { setQuestSearchFilter(co.name); } }}>
                            <div className="np-job-logo"><Building size={18} style={{ color: 'var(--c-muted)' }} /></div>
                            <div style={{ minWidth: 0 }}>
                              <div className="np-co-chip-name">{co.name || 'CLB'}</div>
                              <div className="np-co-chip-sub">{co.count} Quest đang mở</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUEST LIST */}
                  <div className="np-jobs-section">
                    <div className="np-jobs-section-head">
                      <h3>Quest phù hợp</h3>
                      <span style={{ fontSize: '0.88rem', color: 'var(--c-muted)', fontWeight: '700' }}><strong style={{ color: 'var(--c-ink)' }}>{questsList.length}</strong> kết quả</span>
                    </div>
                    {questsLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px', background: 'var(--c-surface-soft)', borderRadius: '20px' }}>
                        <RefreshCw size={22} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                        <span style={{ color: 'var(--c-muted)', fontWeight: '600' }}>Đang tải Quest...</span>
                      </div>
                    ) : questsList.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: '12px', background: 'var(--c-surface-soft)', borderRadius: '20px', border: '1px dashed var(--c-line)', textAlign: 'center' }}>
                        <Sparkles size={28} style={{ color: 'var(--c-muted)' }} />
                        <p style={{ margin: 0, color: 'var(--c-muted)', fontWeight: '600' }}>Chưa có Quest nào đang mở. Quay lại sau nhé!</p>
                      </div>
                    ) : (
                      <div className="np-joblist np-stagger" key={`quests-${questsPage}`}>
                        {pagedQuests.map(quest => {
                          const isLocked = candidateRs < (quest.minReqRs || 0);
                          const alreadyApplied = questApplications.some(qa => qa.questId === quest.id);
                          const meta = CAT[quest.category] || { label: quest.category, color: 'var(--primary)' };
                          return (
                            <div key={quest.id} className="np-job-row" style={{ opacity: isLocked ? 0.7 : 1 }}>
                              <div className="np-job-logo" style={{ background: `${meta.color}14`, borderColor: `${meta.color}33` }}><Zap size={20} style={{ color: meta.color }} /></div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <a href={`/quests/${quest.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(quest.id)} className="np-role-title">{quest.title}</a>
                                  <span className="np-role-badge" style={{ color: meta.color, background: `${meta.color}1f` }}>{meta.label}</span>
                                  {alreadyApplied && <span className="np-role-badge" style={{ color: '#16a34a', background: 'rgba(22,163,74,0.1)' }}><Check size={9} /> Đã đăng ký</span>}
                                  {isLocked && <span className="np-role-badge" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}><LockKeyhole size={9} /> Cần {quest.minReqRs} RS</span>}
                                </div>
                                <div className="np-job-meta">
                                  <span>{quest.companyName || 'CLB'}</span>
                                  <span style={{ color: '#f59e0b', fontWeight: '700' }}>+{quest.expReward} EXP</span>
                                  {quest.npReward > 0 && <span style={{ color: '#10b981', fontWeight: '700' }}>+{quest.npReward} NP</span>}
                                  {quest.capacity > 0 && <span>{quest.capacity - (quest.applicantCount || 0)}/{quest.capacity} chỗ</span>}
                                  {(() => { const d = deadlineLabel(quest.endsAt); return d ? <span style={{ color: d.tone === 'expired' ? '#dc2626' : (d.tone === 'soon' ? '#ea580c' : undefined), fontWeight: d.tone !== 'normal' ? '700' : undefined }} title={`Kết thúc ${new Date(quest.endsAt).toLocaleDateString('vi-VN')}`}>{d.text}</span> : null; })()}
                                </div>
                              </div>
                              <div className="np-job-actions">
                                <a href={`/quests/${quest.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(quest.id)} className="np-job-detail">Chi tiết</a>
                                <button type="button" disabled={isLocked || alreadyApplied} onClick={() => { setSelectedQuestForApply(quest); setQuestCoverNote(''); setQuestAnswers({}); setQuestApplyError(''); setShowQuestApplyModal(true); }}
                                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '9px', border: 'none', whiteSpace: 'nowrap', background: (alreadyApplied || isLocked) ? 'var(--c-disabled)' : meta.color, color: (alreadyApplied || isLocked) ? 'var(--c-muted)' : '#fff', cursor: (alreadyApplied || isLocked) ? 'not-allowed' : 'pointer' }}>
                                  {alreadyApplied ? <><Check size={12} /> Đã đăng ký</> : isLocked ? <><LockKeyhole size={12} /> Cần RS</> : <><Zap size={12} /> Tham gia</>}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!questsLoading && questsList.length > 0 && renderPager(questsList.length, questsPage, setQuestsPage)}
                  </div>
                </>
              );
            })()}
          </section>
        )}

        {/* 2c. MY APPLICATIONS VIEW */}
        {activeView === 'MY_APPLICATIONS' && (() => {
          const JOB_STATUS_COLOR = { SUBMITTED: '#d97706', VIEWED: '#2563eb', SHORTLISTED: '#7c3aed', ACCEPTED: '#16a34a', REJECTED: '#dc2626', COMPLETED: '#0ea5e9', WITHDRAWN: '#6b7280' };
          const JOB_STATUS_LABEL = { SUBMITTED: 'Đã nộp', VIEWED: 'Đã xem', SHORTLISTED: 'Vào vòng tiếp', ACCEPTED: 'Chấp thuận', REJECTED: 'Từ chối', COMPLETED: 'Hoàn thành', WITHDRAWN: 'Rút đơn' };
          const filteredBizApps = appliedJobs.filter(app => {
            const title = (app.job_title || app.title || '').toLowerCase();
            const company = (app.company_name || app.companyName || '').toLowerCase();
            const matchSearch = !myAppsSearch || title.includes(myAppsSearch.toLowerCase()) || company.includes(myAppsSearch.toLowerCase());
            const matchStatus = !myAppsStatusFilter || (app.status || '') === myAppsStatusFilter;
            return matchSearch && matchStatus;
          });
          const filteredClubApps = questApplications.filter(qa => {
            const title = (qa.questTitle || '').toLowerCase();
            const company = (qa.companyName || '').toLowerCase();
            const matchSearch = !myAppsClubSearch || title.includes(myAppsClubSearch.toLowerCase()) || company.includes(myAppsClubSearch.toLowerCase());
            const matchStatus = !myAppsClubStatusFilter || (qa.status || '') === myAppsClubStatusFilter;
            return matchSearch && matchStatus;
          });

          const bizCount = (s) => appliedJobs.filter(a => (a.status || 'SUBMITTED') === s).length;
          const clubCount = (s) => questApplications.filter(a => a.status === s).length;
          const statCards = myAppsTab === 'BUSINESS'
            ? [
                { label: 'Tổng đơn', val: appliedJobs.length, color: 'var(--c-ink)' },
                { label: 'Đang chờ', val: bizCount('SUBMITTED') + bizCount('VIEWED'), color: '#d97706' },
                { label: 'Vào vòng tiếp', val: bizCount('SHORTLISTED'), color: '#7c3aed' },
                { label: 'Chấp thuận', val: bizCount('ACCEPTED'), color: '#16a34a' },
                { label: 'Hoàn thành', val: bizCount('COMPLETED'), color: '#0ea5e9' },
                { label: 'Từ chối', val: bizCount('REJECTED'), color: '#dc2626' },
              ]
            : [
                { label: 'Tổng đơn', val: questApplications.length, color: 'var(--c-ink)' },
                { label: 'Đã nộp', val: clubCount('SUBMITTED'), color: '#d97706' },
                { label: 'Chấp thuận', val: clubCount('ACCEPTED'), color: '#16a34a' },
                { label: 'Hoàn thành', val: clubCount('COMPLETED'), color: '#2563eb' },
                { label: 'Từ chối', val: clubCount('REJECTED'), color: '#dc2626' },
              ];

          return (
            <section className="np-view apptrack">
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(1.6rem, 2.4vw, 2rem)', fontWeight: '800', letterSpacing: '-0.035em', color: 'var(--c-ink)' }}>Theo dõi ứng tuyển</h2>
                <p style={{ margin: 0, fontSize: '0.96rem', color: 'var(--c-muted)' }}>Trạng thái các đơn ứng tuyển việc làm và Quest của bạn.</p>
              </div>

              <div className="apptrack-stats">
                {statCards.map(s => (
                  <div className="apptrack-stat" key={s.label}>
                    <div className="apptrack-stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className="apptrack-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="apptrack-tabs">
                {[
                  { key: 'BUSINESS', icon: <Building size={15} />, label: 'Doanh nghiệp', count: appliedJobs.length },
                  { key: 'CLUB', icon: <Zap size={15} />, label: 'CLB / Quest', count: questApplications.length },
                ].map(tab => (
                  <button key={tab.key} type="button" onClick={() => setMyAppsTab(tab.key)} className={`apptrack-tab ${myAppsTab === tab.key ? 'active' : ''}`}>
                    {tab.icon}{tab.label}<span className="apptrack-tab-count">{tab.count}</span>
                  </button>
                ))}
              </div>

              {withdrawError && (
                <div className="apptrack-error">
                  <span><AlertTriangle size={15} /> {withdrawError}</span>
                  <button onClick={() => setWithdrawError('')} aria-label="Đóng"><X size={15} /></button>
                </div>
              )}

              {myAppsTab === 'BUSINESS' ? (
                <>
                  <div className="apptrack-filters">
                    <div className="apptrack-search">
                      <Search size={16} />
                      <input type="text" value={myAppsSearch} onChange={e => setMyAppsSearch(e.target.value)} placeholder="Tìm vị trí hoặc công ty..." />
                    </div>
                    <select className="apptrack-select" value={myAppsStatusFilter} onChange={e => setMyAppsStatusFilter(e.target.value)}>
                      <option value="">Tất cả trạng thái</option>
                      {Object.entries(JOB_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {(myAppsSearch || myAppsStatusFilter) && (
                      <button type="button" className="apptrack-btn" onClick={() => { setMyAppsSearch(''); setMyAppsStatusFilter(''); }}>Xóa bộ lọc</button>
                    )}
                  </div>

                  {applicationsLoading ? (
                    <div className="apptrack-state"><RefreshCw size={20} style={{ color: 'var(--primary)', animation: 'spin 1.4s linear infinite' }} /><p>Đang tải hồ sơ ứng tuyển...</p></div>
                  ) : filteredBizApps.length === 0 ? (
                    <div className="apptrack-empty"><BriefcaseBusiness size={28} /><p>{myAppsSearch || myAppsStatusFilter ? 'Không tìm thấy hồ sơ phù hợp.' : 'Bạn chưa ứng tuyển vị trí nào từ doanh nghiệp.'}</p></div>
                  ) : (
                    <div className="np-stagger apptrack-list">
                      {filteredBizApps.map((app, idx) => {
                        const st = app.status || 'SUBMITTED';
                        const sc = JOB_STATUS_COLOR[st] || '#6b7280';
                        const sl = JOB_STATUS_LABEL[st] || st;
                        const isBoosted = app.boostedUntil && new Date(app.boostedUntil) > new Date();
                        return (
                          <div className="appcard" key={app.id || idx} style={{ '--app-status': sc, '--app-status-soft': `${sc}1a` }}>
                            <div className="appcard-logo"><Building size={20} style={{ color: 'var(--c-muted)' }} /></div>
                            <div className="appcard-body">
                              <div className="appcard-head">
                                <div style={{ minWidth: 0 }}>
                                  <div className="appcard-title">{app.job_title || app.title}</div>
                                  <div className="appcard-meta">
                                    <span><Building size={12} />{app.company_name || app.companyName || 'Đối tác'}</span>
                                    <span><Calendar size={12} />{app.applied_at ? new Date(app.applied_at).toLocaleDateString('vi-VN') : app.appliedAt || '—'}</span>
                                    <span><BriefcaseBusiness size={12} />{JOB_TYPES.find(t => t.value === (app.job_type || app.jobType))?.label || app.job_type || app.jobType || '—'}</span>
                                  </div>
                                </div>
                                <span className="appcard-status">
                                  {st === 'SUBMITTED' && <Clock3 size={13} />}
                                  {(st === 'ACCEPTED' || st === 'SHORTLISTED') && <CheckCircle2 size={13} />}
                                  {st === 'REJECTED' && <AlertTriangle size={13} />}
                                  {sl}
                                </span>
                              </div>
                              {st === 'REJECTED' && (app.reject_reason || app.rejectionReason) && (
                                <div className="appcard-reject">Lý do từ chối: {app.reject_reason || app.rejectionReason}</div>
                              )}
                              {app.rating_score != null && (
                                <div className="appcard-rating">
                                  <span className="appcard-stars">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={15} fill={n <= app.rating_score ? '#f59e0b' : 'none'} color={n <= app.rating_score ? '#f59e0b' : 'var(--c-line-strong)'} />)}</span>
                                  {app.rating_comment && <span className="appcard-ratenote">"{app.rating_comment}"</span>}
                                </div>
                              )}
                              <div className="appcard-actions">
                                <button type="button" className="apptrack-btn" onClick={() => setViewingApp({ app, isQuest: false })}><Eye size={14} /> Chi tiết</button>
                                {['SUBMITTED', 'VIEWED', 'SHORTLISTED'].includes(st) && (
                                  <button type="button" className="apptrack-btn" onClick={() => handleWithdrawJob(app.id)} disabled={withdrawingId === app.id}>{withdrawingId === app.id ? 'Đang rút...' : 'Rút đơn'}</button>
                                )}
                                {(() => { const ik = encodePremiumTarget('JOB', app.job_id || app.jobId || app.id); return (
                                  <button type="button" className="apptrack-btn insight" onClick={() => handleViewInsight(app)} disabled={insightLoadingJobId === ik}>
                                    <TrendingUp size={14} /> {insightLoadingJobId === ik ? '...' : 'Insight'}
                                  </button>
                                ); })()}
                                {isBoosted ? (
                                  <span className="apptrack-btn boosted" title={`Nổi bật đến ${new Date(app.boostedUntil).toLocaleString('vi-VN')}`}><Sparkles size={13} /> Đang nổi bật</span>
                                ) : ['SUBMITTED', 'VIEWED'].includes(st) ? (
                                  (() => { const bk = encodePremiumTarget('JOB', app.id); return (
                                  <button type="button" className="apptrack-btn boost" onClick={() => handleBoostApplication(app.id, 'JOB')} disabled={boostLoadingId === bk} title={`Đẩy tin nổi bật ${premiumConfig.boostDurationHours}h · ${premiumConfig.boostPriceNp.toLocaleString()} NP`}>
                                    {boostLoadingId === bk ? '...' : <><Sparkles size={13} /> Đẩy nổi bật</>}
                                  </button>
                                  ); })()
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="apptrack-filters">
                    <div className="apptrack-search">
                      <Search size={16} />
                      <input type="text" value={myAppsClubSearch} onChange={e => setMyAppsClubSearch(e.target.value)} placeholder="Tìm tên Quest hoặc CLB..." />
                    </div>
                    <select className="apptrack-select" value={myAppsClubStatusFilter} onChange={e => setMyAppsClubStatusFilter(e.target.value)}>
                      <option value="">Tất cả trạng thái</option>
                      <option value="SUBMITTED">Đã nộp</option>
                      <option value="ACCEPTED">Chấp thuận</option>
                      <option value="REJECTED">Từ chối</option>
                      <option value="COMPLETED">Hoàn thành (+EXP)</option>
                      <option value="WITHDRAWN">Rút đơn</option>
                    </select>
                    {(myAppsClubSearch || myAppsClubStatusFilter) && (
                      <button type="button" className="apptrack-btn" onClick={() => { setMyAppsClubSearch(''); setMyAppsClubStatusFilter(''); }}>Xóa bộ lọc</button>
                    )}
                  </div>

                  {filteredClubApps.length === 0 ? (
                    <div className="apptrack-empty"><Zap size={28} /><p>{myAppsClubSearch || myAppsClubStatusFilter ? 'Không tìm thấy Quest phù hợp.' : 'Bạn chưa tham gia Quest nào từ CLB.'}</p></div>
                  ) : (
                    <div className="np-stagger apptrack-list">
                      {filteredClubApps.map((qa, idx) => {
                        const QUEST_SC = { SUBMITTED: '#d97706', ACCEPTED: '#16a34a', REJECTED: '#dc2626', COMPLETED: '#2563eb', WITHDRAWN: '#6b7280' };
                        const QUEST_SL = { SUBMITTED: 'Đã nộp', ACCEPTED: 'Chấp thuận', REJECTED: 'Từ chối', COMPLETED: 'Hoàn thành', WITHDRAWN: 'Rút đơn' };
                        const sc = QUEST_SC[qa.status] || '#6b7280';
                        const sl = QUEST_SL[qa.status] || qa.status;
                        return (
                          <div className="appcard" key={qa.id || idx} style={{ '--app-status': sc, '--app-status-soft': `${sc}1a` }}>
                            <div className="appcard-logo quest"><Zap size={20} style={{ color: '#f59e0b' }} /></div>
                            <div className="appcard-body">
                              <div className="appcard-head">
                                <div style={{ minWidth: 0 }}>
                                  <div className="appcard-title">{qa.questTitle}</div>
                                  <div className="appcard-meta">
                                    <span><Building size={12} />{qa.companyName || 'CLB'}</span>
                                    <span><Calendar size={12} />{qa.appliedAt ? new Date(qa.appliedAt).toLocaleDateString('vi-VN') : '—'}</span>
                                    {qa.expReward > 0 && <span style={{ color: '#f59e0b', fontWeight: '700' }}><Zap size={12} />+{qa.expReward} EXP</span>}
                                  </div>
                                </div>
                                <span className="appcard-status">
                                  {qa.status === 'COMPLETED' && <CheckCircle2 size={13} />}
                                  {qa.status === 'REJECTED' && <AlertTriangle size={13} />}
                                  {qa.status === 'SUBMITTED' && <Clock3 size={13} />}
                                  {sl}
                                </span>
                              </div>
                              {qa.status === 'REJECTED' && qa.rejectReason && (
                                <div className="appcard-reject">Lý do từ chối: {qa.rejectReason}</div>
                              )}
                              {qa.ratingScore != null && (
                                <div className="appcard-rating">
                                  <span className="appcard-stars">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={15} fill={n <= qa.ratingScore ? '#f59e0b' : 'none'} color={n <= qa.ratingScore ? '#f59e0b' : 'var(--c-line-strong)'} />)}</span>
                                  {qa.ratingComment && <span className="appcard-ratenote">"{qa.ratingComment}"</span>}
                                </div>
                              )}
                              <div className="appcard-actions">
                                <button type="button" className="apptrack-btn" onClick={() => setViewingApp({ app: qa, isQuest: true })}><Eye size={14} /> Chi tiết</button>
                                {qa.status === 'SUBMITTED' && (
                                  <button type="button" className="apptrack-btn" onClick={() => handleWithdrawQuest(qa.id)} disabled={withdrawingId === qa.id}>{withdrawingId === qa.id ? 'Đang rút...' : 'Rút đơn'}</button>
                                )}
                                {(() => { const ik = encodePremiumTarget('QUEST', qa.questId); return (
                                  <button type="button" className="apptrack-btn insight" onClick={() => handleViewInsight({ ...qa, applicationType: 'QUEST', targetId: qa.questId })} disabled={insightLoadingJobId === ik}>
                                    <TrendingUp size={14} /> {insightLoadingJobId === ik ? '...' : 'Insight'}
                                  </button>
                                ); })()}
                                {(qa.boostedUntil && new Date(qa.boostedUntil) > new Date()) ? (
                                  <span className="apptrack-btn boosted" title={`Nổi bật đến ${new Date(qa.boostedUntil).toLocaleString('vi-VN')}`}><Sparkles size={13} /> Đang nổi bật</span>
                                ) : qa.status === 'SUBMITTED' ? (
                                  (() => { const bk = encodePremiumTarget('QUEST', qa.id); return (
                                  <button type="button" className="apptrack-btn boost" onClick={() => handleBoostApplication(qa.id, 'QUEST')} disabled={boostLoadingId === bk} title={`Đẩy nổi bật ${premiumConfig.boostDurationHours}h · ${premiumConfig.boostPriceNp.toLocaleString()} NP`}>
                                    {boostLoadingId === bk ? '...' : <><Sparkles size={13} /> Đẩy nổi bật</>}
                                  </button>
                                  ); })()
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })()}

        {/* 2d. PERSONALIZED AI RECOMMENDATIONS VIEW */}
        {activeView === 'RECOMMENDATIONS' && (
          <section className="np-view">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--c-red)', margin: '0 0 8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Sparkles size={13} /> Gợi ý từ AI</p>
                <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(1.6rem, 2.4vw, 2rem)', fontWeight: '800', letterSpacing: '-0.035em', color: 'var(--c-ink)' }}>Gợi ý dành riêng cho bạn</h2>
                <p style={{ margin: 0, fontSize: '0.96rem', color: 'var(--c-muted)' }}>Hệ thống đối khớp kỹ năng đã xác thực của bạn với cơ hội phù hợp nhất.</p>
              </div>
              {wallet?.hasJobMatchAlert && (
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#16a34a', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', padding: '7px 13px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={15} /> Job Match Alert đang bật</span>
              )}
            </div>

            {!wallet?.hasJobMatchAlert ? (
              <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: '20px', padding: 'clamp(28px, 4vw, 48px)', maxWidth: '560px', margin: '8px auto 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(217,119,6,0.12)', color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}><Sparkles size={26} /></span>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--c-ink)' }}>Mở khóa gợi ý AI & Job Match Alert</h3>
                <p style={{ margin: '0 0 22px', fontSize: '0.96rem', color: 'var(--c-muted)', lineHeight: 1.6 }}>Nhận danh sách cơ hội cá nhân hóa khớp với kỹ năng thực chiến, kèm quyền xem sớm 12 giờ cho mọi tin mới.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignSelf: 'stretch', textAlign: 'left', marginBottom: '24px' }}>
                  {['Đề xuất khớp kỹ năng đã xác thực', 'Ưu tiên xem & ứng tuyển sớm 12 giờ', 'Tăng tỉ lệ được mời phỏng vấn'].map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(22,163,74,0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} /></span>
                      <span style={{ fontSize: '0.92rem', color: 'var(--c-ink)', fontWeight: '600' }}>{t}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleSubscribeMatchAlert} disabled={subscribingMatchAlert}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', fontSize: '0.94rem', fontWeight: '800', color: '#fff', background: '#d97706', border: 'none', borderRadius: '12px', cursor: subscribingMatchAlert ? 'wait' : 'pointer' }}>
                  <Sparkles size={16} /> {subscribingMatchAlert ? 'Đang kích hoạt...' : `Kích hoạt · ${(premiumConfig.matchAlertPriceNp || 19000).toLocaleString()} NP / tháng`}
                </button>
              </div>
            ) : recommendationsLoading ? (
              <div style={{ textAlign: 'center', padding: '70px 20px' }}>
                <RefreshCw className="spin" size={30} style={{ color: 'var(--c-red)', marginBottom: '12px' }} />
                <p style={{ margin: 0, color: 'var(--c-muted)', fontWeight: '600' }}>AI đang phân tích và tìm cơ hội phù hợp...</p>
              </div>
            ) : !recommendations || ((recommendations.jobs || []).length === 0 && (recommendations.quests || []).length === 0) ? (
              <div style={{ textAlign: 'center', padding: '70px 20px', border: '1px dashed var(--c-line)', borderRadius: '16px', background: 'var(--c-surface-soft)' }}>
                <Sparkles size={30} style={{ color: 'var(--c-muted)', marginBottom: '12px' }} />
                <p style={{ margin: '0 0 6px', color: 'var(--c-ink)', fontWeight: '750' }}>Chưa có gợi ý phù hợp lúc này</p>
                <p style={{ margin: 0, color: 'var(--c-muted)', fontSize: '0.86rem' }}>Cập nhật và xác thực thêm kinh nghiệm để nhận gợi ý chính xác hơn.</p>
              </div>
            ) : (
              <>
                {(recommendations.jobs || []).length > 0 && (
                  <div className="np-jobs-section">
                    <div className="np-jobs-section-head"><h3>Việc làm phù hợp nhất</h3></div>
                    <div className="np-joblist">
                      {recommendations.jobs.map(job => {
                        const alreadyApplied = appliedJobs.some(a => (a.job_id || a.jobId) === job.id);
                        const compensationText = job.compensation > 0 ? `${Number(job.compensation).toLocaleString()} VND` : 'Thỏa thuận';
                        const typeLabel = JOB_TYPES.find(t => t.value === job.jobType)?.label || job.jobType;
                        return (
                          <div key={job.id} className="np-job-row">
                            <div className="np-job-logo">
                              {job.companyLogo ? <img src={job.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building size={20} style={{ color: 'var(--c-muted)' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(job.id)} className="np-role-title">{job.title}</a>
                                <span className="np-role-badge" style={{ color: '#d97706', background: 'rgba(245,158,11,0.14)' }}><Sparkles size={9} /> Khớp {job.match_count || 0} kỹ năng</span>
                                {job.requiresPremium && <span className="np-role-badge" style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.1)' }}>Premium</span>}
                              </div>
                              <div className="np-job-meta">
                                <span>{job.companyName || 'Đối tác'}</span>
                                <span>{job.isRemote ? 'Remote' : (job.location || 'Linh hoạt')}</span>
                                <span style={{ color: '#16a34a', fontWeight: '700' }}>{compensationText}</span>
                                {typeLabel && <span>{typeLabel}</span>}
                              </div>
                            </div>
                            <div className="np-job-actions">
                              <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(job.id)} className="np-job-detail">Chi tiết</a>
                              <button type="button" disabled={alreadyApplied} onClick={() => handleApplyJob(job)}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '9px', border: 'none', whiteSpace: 'nowrap', background: alreadyApplied ? 'var(--c-disabled)' : 'var(--c-red)', color: alreadyApplied ? 'var(--c-muted)' : '#fff', cursor: alreadyApplied ? 'not-allowed' : 'pointer' }}>
                                {alreadyApplied ? 'Đã ứng tuyển' : 'Ứng tuyển'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(recommendations.quests || []).length > 0 && (
                  <div className="np-jobs-section">
                    <div className="np-jobs-section-head"><h3>Quest CLB phù hợp</h3></div>
                    <div className="np-joblist">
                      {recommendations.quests.map(quest => {
                        const alreadyApplied = questApplications.some(qa => qa.questId === quest.id);
                        return (
                          <div key={quest.id} className="np-job-row">
                            <div className="np-job-logo" style={{ background: 'rgba(37,99,235,0.1)', borderColor: 'rgba(37,99,235,0.25)' }}><Zap size={20} style={{ color: '#2563eb' }} /></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <a href={`/quests/${quest.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(quest.id)} className="np-role-title">{quest.title}</a>
                                <span className="np-role-badge" style={{ color: '#2563eb', background: 'rgba(37,99,235,0.1)' }}><Sparkles size={9} /> Khớp {quest.match_count || 0} kỹ năng</span>
                              </div>
                              <div className="np-job-meta">
                                <span>{quest.companyName || 'CLB'}</span>
                                <span style={{ color: '#f59e0b', fontWeight: '700' }}>+{quest.expReward} EXP</span>
                                {quest.npReward > 0 && <span style={{ color: '#10b981', fontWeight: '700' }}>+{quest.npReward} NP</span>}
                                {quest.minReqRs > 0 && <span>Cần {quest.minReqRs} RS</span>}
                              </div>
                            </div>
                            <div className="np-job-actions">
                              <a href={`/quests/${quest.id}`} target="_blank" rel="noopener noreferrer" onClick={() => viewOpportunityOnce(quest.id)} className="np-job-detail">Chi tiết</a>
                              <button type="button" disabled={alreadyApplied} onClick={() => { setSelectedQuestForApply(quest); setShowQuestApplyModal(true); }}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '9px', border: 'none', whiteSpace: 'nowrap', background: alreadyApplied ? 'var(--c-disabled)' : '#2563eb', color: alreadyApplied ? 'var(--c-muted)' : '#fff', cursor: alreadyApplied ? 'not-allowed' : 'pointer' }}>
                                {alreadyApplied ? 'Đã tham gia' : <><Zap size={12} /> Tham gia</>}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* 2e. PREMIUM STORE VIEW */}
        {activeView === 'PREMIUM_STORE' && (
          <section className="candidate-premium-workspace np-view">
            <header className="candidate-overview-header candidate-premium-header">
              <div className="candidate-overview-title">
                <h1>Cửa hàng Premium</h1>
                <p>Nâng cấp trải nghiệm và tăng tốc hồ sơ bằng số dư NP.</p>
              </div>
            </header>

            {buyPremiumError && (
              <div className="alert-banner error candidate-premium-alert">
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{buyPremiumError}</span>
                {buyPremiumError.includes('Số dư') && (
                  <button type="button" className="candidate-premium-inline-link" onClick={() => setShowTopUpModal(true)}>Nạp thêm NP</button>
                )}
              </div>
            )}

            <div className="np-premium-wallet">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <span style={{ flexShrink: 0, width: '46px', height: '46px', borderRadius: '13px', background: 'var(--c-red-soft)', color: 'var(--c-red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><WalletCards size={22} /></span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', fontWeight: '600' }}>Số dư ví của bạn</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--c-ink)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', color: 'var(--c-muted)' }}>NP</span></div>
                </div>
              </div>
              <button type="button" className="button primary-button" onClick={() => setShowTopUpModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <WalletCards size={16} /> Nạp NP
              </button>
            </div>

            <div className="candidate-premium-layout">
              <section className={`candidate-premium-pass-card ${wallet?.isPremium ? 'active' : ''}`}>
                <div className="candidate-premium-card-header">
                  <div className="candidate-premium-card-title">
                    <div className="candidate-premium-mark">
                      <Crown size={22} />
                    </div>
                    <div>
                      <span>{wallet?.isPremium ? 'Đang sở hữu' : 'Gói tài khoản'}</span>
                      <h2>Premium Pass</h2>
                    </div>
                  </div>
                  <span className={`candidate-premium-status ${wallet?.isPremium ? 'success' : ''}`}>
                    {wallet?.isPremium ? 'Đã kích hoạt' : '40,000 NP / tháng'}
                  </span>
                </div>
                <p className="candidate-premium-pass-copy">
                  Mở quyền ứng tuyển vào cơ hội yêu cầu Premium, hiển thị huy hiệu trên portfolio và tăng độ tin cậy khi nhà tuyển dụng xem hồ sơ.
                </p>
                <div className="candidate-premium-benefit-list">
                  <span><CheckCircle2 size={15} /> Ứng tuyển cơ hội yêu cầu Premium</span>
                  <span><CheckCircle2 size={15} /> Huy hiệu Premium trên hồ sơ</span>
                  <span><CheckCircle2 size={15} /> Phù hợp ứng viên muốn tìm cơ hội chất lượng cao</span>
                </div>
                {!wallet?.isPremium ? (
                  <button
                    type="button"
                    className="button primary-button candidate-premium-full-button"
                    onClick={handleBuyPremium}
                    disabled={buyPremiumLoading}
                  >
                    {buyPremiumLoading ? 'Đang xử lý...' : 'Kích hoạt Premium'}
                  </button>
                ) : (
                  <span className="candidate-premium-owned">Đã sở hữu quyền lợi Premium</span>
                )}
              </section>

              <aside className="candidate-premium-side-card">
                <h3>Trạng thái dịch vụ</h3>
                <div className="candidate-premium-state-list">
                  <div>
                    <span className={wallet?.isPremium ? 'active' : ''} />
                    <div><strong>Premium Pass</strong><p>{wallet?.isPremium ? 'Đang sở hữu' : 'Chưa kích hoạt'}</p></div>
                  </div>
                  <div>
                    <span className={wallet?.hasJobMatchAlert ? 'active' : ''} />
                    <div><strong>Job Match Alert</strong><p>{wallet?.hasJobMatchAlert ? 'Đang bật' : 'Chưa đăng ký'}</p></div>
                  </div>
                  <div>
                    <span className={portfolio?.themeUnlocked ? 'active' : ''} />
                    <div><strong>Portfolio Theme</strong><p>{portfolio?.themeUnlocked ? 'Đã mở khóa' : 'Chưa mở khóa'}</p></div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="candidate-premium-section-heading">
              <div>
                <h2>Dịch vụ tăng tốc hồ sơ</h2>
              </div>
              <p>Giúp bạn nổi bật và ứng tuyển hiệu quả hơn.</p>
            </div>

            <div className="candidate-premium-service-list np-stagger">
              <article className={`candidate-premium-service-row ${wallet?.hasJobMatchAlert ? 'active' : ''}`}>
                <div className="candidate-premium-service-copy">
                  <div className="candidate-premium-mark green"><Sparkles size={20} /></div>
                  <div>
                    <div className="candidate-premium-service-title">
                      <h3>Job Match Alert & Đề xuất AI</h3>
                      <span>{wallet?.hasJobMatchAlert ? 'Đang hoạt động' : `${(premiumConfig.matchAlertPriceNp || 19000).toLocaleString()} NP / tháng`}</span>
                    </div>
                    <p>Xem sớm trước {premiumConfig.earlyAccessHours || 12}h các tin hot và mở tab gợi ý việc làm, Quest CLB khớp kỹ năng.</p>
                  </div>
                </div>
                <div className="candidate-premium-row-action">
                  <button type="button" className={`button ${wallet?.hasJobMatchAlert ? 'secondary-button' : 'primary-button accent-green'}`} onClick={handleSubscribeMatchAlert} disabled={subscribingMatchAlert}>
                    {subscribingMatchAlert ? <><span className="premium-loading-dot" aria-hidden="true" /> Đang xử lý...</> : wallet?.hasJobMatchAlert ? 'Gia hạn 30 ngày' : 'Đăng ký ngay'}
                  </button>
                </div>
              </article>

              <article className={`candidate-premium-service-row ${portfolio?.themeUnlocked ? 'active' : ''}`}>
                <div className="candidate-premium-service-copy">
                  <div className="candidate-premium-mark violet"><Palette size={20} /></div>
                  <div>
                    <div className="candidate-premium-service-title">
                      <h3>Visual Upgrade</h3>
                      <span>{portfolio?.themeUnlocked ? 'Đã mở khóa' : `${(premiumConfig.themePriceNp || 50000).toLocaleString()} NP`}</span>
                    </div>
                    <p>Mở khóa trọn đời bộ theme màu cho link portfolio công khai mà không ảnh hưởng Reputation Score.</p>
                  </div>
                </div>
                <div className="candidate-premium-row-action wide">
                  {portfolio?.themeUnlocked ? (
                    <div className="premium-theme-grid candidate-premium-theme-grid">
                      {[
                        { id: 'DEFAULT', name: 'Classic Default', colorBox: ['#e5533f', '#f3ede9'] },
                        { id: 'DARK_GOLD', name: 'Luxury Gold', colorBox: ['#eab308', '#fef08a'] },
                        { id: 'CYBERPUNK', name: 'Cyberpunk Neon', colorBox: ['#ec4899', '#06b6d4'] },
                        { id: 'EMERALD_CLASSIC', name: 'Emerald Executive', colorBox: ['#10b981', '#a7f3d0'] }
                      ].map(theme => {
                        const isActive = (portfolio?.selectedTheme || 'DEFAULT') === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={async () => {
                              try {
                                await selectTheme(theme.id);
                                const updated = await getMyPortfolio();
                                setPortfolio(updated);
                              } catch (err) {
                                showToast('error', err.message || 'Thay đổi giao diện thất bại.');
                              }
                            }}
                            className={`premium-theme-option ${isActive ? 'active' : ''}`}
                          >
                            <span className="premium-theme-swatches">
                              {theme.colorBox.map((col, idx) => (
                                <span key={idx} style={{ background: col }} />
                              ))}
                            </span>
                            <span>{theme.name}{isActive ? ' · đang dùng' : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => askConfirm({
                        title: 'Mở khóa Visual Upgrade',
                        message: `Hệ thống sẽ trừ ${(premiumConfig.themePriceNp || 50000).toLocaleString()} NP để mở khóa trọn đời bộ theme cho link portfolio công khai.`,
                        confirmText: 'Mua trọn đời',
                        accent: '#7c3aed',
                        onConfirm: async () => {
                          try {
                            const res = await unlockTheme();
                            if (res.npBalance !== undefined) {
                              setWallet(prev => prev ? { ...prev, npBalance: res.npBalance } : prev);
                            } else {
                              const newWallet = await getWallet();
                              setWallet(newWallet);
                            }
                            const updated = await getMyPortfolio();
                            setPortfolio(updated);
                            showToast('success', 'Mở khóa Theme thành công!');
                          } catch (err) {
                            showToast('error', err.message || 'Mở khóa thất bại.');
                          }
                        },
                      })}
                      className="button primary-button accent-violet"
                    >
                      Mua trọn đời
                    </button>
                  )}
                </div>
              </article>

              {(() => {
                const allApplications = [
                  ...appliedJobs.map(app => ({
                    ...app,
                    applicationType: 'JOB',
                    title: app.job_title || app.title,
                    companyName: app.company_name || app.companyName,
                  })),
                  ...questApplications.map(app => ({
                    ...app,
                    applicationType: 'QUEST',
                    title: app.questTitle,
                    companyName: app.companyName,
                  })),
                ];
                const boostableApps = allApplications.filter(app =>
                  !['WITHDRAWN', 'REJECTED', 'COMPLETED'].includes(app.status)
                  && !(app.boostedUntil && new Date(app.boostedUntil) > new Date())
                );
                const premiumApplicationsLoading = applicationsLoading || questApplicationsLoading;
                return (
                  <article className="candidate-premium-service-row">
                    <div className="candidate-premium-service-copy">
                      <div className="candidate-premium-mark amber"><ExternalLink size={19} /></div>
                      <div>
                        <div className="candidate-premium-service-title">
                          <h3>Profile Boost</h3>
                          <span>{(premiumConfig.boostPriceNp || 15000).toLocaleString()} NP</span>
                        </div>
                        <p>Ghim đơn ứng tuyển trong {premiumConfig.boostDurationHours || 48}h để xuất hiện nổi bật hơn trong danh sách của nhà tuyển dụng.</p>
                      </div>
                    </div>
                    <div className="candidate-premium-row-action wide">
                      <label className="premium-field-label">Chọn đơn ứng tuyển để ghim</label>
                      {premiumApplicationsLoading ? (
                        <div className="premium-inline-state">Đang tải danh sách đơn ứng tuyển...</div>
                      ) : allApplications.length === 0 ? (
                        <div className="premium-inline-state danger">Bạn chưa có đơn ứng tuyển nào. Hãy ứng tuyển vào một công việc trước.</div>
                      ) : boostableApps.length === 0 ? (
                        <div className="premium-inline-state warning">Tất cả đơn ứng tuyển của bạn đang được boost hoặc đã kết thúc.</div>
                      ) : (
                        <select value={selectedBoostAppId} onChange={(e) => setSelectedBoostAppId(e.target.value)} className="premium-store-select">
                          <option value="">-- Chọn đơn ứng tuyển --</option>
                          {boostableApps.map(app => (
                            <option key={`${app.applicationType}-${app.id}`} value={encodePremiumTarget(app.applicationType, app.id)}>
                              [{app.applicationType === 'QUEST' ? 'Quest' : 'Việc làm'}] {app.title} ({app.companyName})
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        className="button primary-button accent-amber"
                        disabled={!selectedBoostAppId || boostLoadingId === selectedBoostAppId}
                        onClick={async () => {
                          const target = decodePremiumTarget(selectedBoostAppId);
                          await handleBoostApplication(target.id, target.type);
                          setSelectedBoostAppId('');
                        }}
                      >
                        {boostLoadingId === selectedBoostAppId ? <><span className="premium-loading-dot" aria-hidden="true" /> Đang xử lý...</> : 'Boost đơn ngay'}
                      </button>
                    </div>
                  </article>
                );
              })()}

              {(() => {
                const expressableCredentials = credentialSubmissions.filter(sub => sub.verification_status === 'PENDING' && !sub.expressVerification);
                return (
                  <article className="candidate-premium-service-row">
                    <div className="candidate-premium-service-copy">
                      <div className="candidate-premium-mark amber"><Zap size={20} /></div>
                      <div>
                        <div className="candidate-premium-service-title">
                          <h3>Duyệt nhanh 24h Express</h3>
                          <span>{(premiumConfig.expressPriceNp || 25000).toLocaleString()} NP</span>
                        </div>
                        <p>Ưu tiên thẩm định minh chứng đang chờ duyệt để rút ngắn thời gian tích lũy RS và EXP.</p>
                      </div>
                    </div>
                    <div className="candidate-premium-row-action wide">
                      <label className="premium-field-label">Chọn minh chứng chờ duyệt</label>
                      {expressableCredentials.length === 0 ? (
                        <div className="premium-inline-state warning">Bạn chưa có minh chứng chờ duyệt phù hợp để nâng cấp Express.</div>
                      ) : (
                        <select value={selectedExpressSubId} onChange={(e) => setSelectedExpressSubId(e.target.value)} className="premium-store-select">
                          <option value="">-- Chọn minh chứng --</option>
                          {expressableCredentials.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.project_name} - {sub.position}</option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        className="button primary-button accent-amber"
                        disabled={!selectedExpressSubId || expressLoadingId === selectedExpressSubId}
                        onClick={async () => {
                          await handleExpressVerification(selectedExpressSubId);
                          setSelectedExpressSubId('');
                        }}
                      >
                        {expressLoadingId === selectedExpressSubId ? <><span className="premium-loading-dot" aria-hidden="true" /> Đang xử lý...</> : 'Nâng cấp Express'}
                      </button>
                    </div>
                  </article>
                );
              })()}

              {(() => {
                const insightApps = [
                  ...appliedJobs.map(app => ({
                    ...app,
                    applicationType: 'JOB',
                    targetId: app.job_id || app.jobId,
                    title: app.job_title || app.title,
                    companyName: app.company_name || app.companyName,
                  })),
                  ...questApplications.map(app => ({
                    ...app,
                    applicationType: 'QUEST',
                    targetId: app.questId,
                    title: app.questTitle,
                    companyName: app.companyName,
                  })),
                ];
                const premiumApplicationsLoading = applicationsLoading || questApplicationsLoading;
                return (
                  <article className="candidate-premium-service-row">
                    <div className="candidate-premium-service-copy">
                      <div className="candidate-premium-mark violet"><Award size={20} /></div>
                      <div>
                        <div className="candidate-premium-service-title">
                          <h3>Application Insight</h3>
                          <span>{(premiumConfig.insightPriceNp || 10000).toLocaleString()} NP</span>
                        </div>
                        <p>Mở khóa xếp hạng thực tế và phân tích Reputation Score trong nhóm ứng viên của từng cơ hội.</p>
                      </div>
                    </div>
                    <div className="candidate-premium-row-action wide">
                      <label className="premium-field-label">Chọn đơn tuyển dụng để xem</label>
                      {premiumApplicationsLoading ? (
                        <div className="premium-inline-state">Đang tải danh sách đơn ứng tuyển...</div>
                      ) : insightApps.length === 0 ? (
                        <div className="premium-inline-state danger">Bạn chưa có đơn ứng tuyển nào.</div>
                      ) : (
                        <select value={selectedInsightJobId} onChange={(e) => setSelectedInsightJobId(e.target.value)} className="premium-store-select">
                          <option value="">-- Chọn đơn ứng tuyển --</option>
                          {insightApps.map(app => (
                            <option key={`${app.applicationType}-${app.id}`} value={encodePremiumTarget(app.applicationType, app.targetId)}>
                              [{app.applicationType === 'QUEST' ? 'Quest' : 'Việc làm'}] {app.title} ({app.companyName})
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        className="button primary-button accent-violet"
                        disabled={!selectedInsightJobId || insightLoadingJobId === selectedInsightJobId}
                        onClick={async () => {
                          const target = decodePremiumTarget(selectedInsightJobId);
                          const matched = insightApps.find(app =>
                            app.applicationType === target.type && String(app.targetId) === target.id
                          );
                          await handleViewInsight(matched || {
                            applicationType: target.type,
                            targetId: target.id,
                            title: 'Đơn ứng tuyển',
                            companyName: 'Đối tác',
                          });
                          setSelectedInsightJobId('');
                        }}
                      >
                        {insightLoadingJobId === selectedInsightJobId ? <><span className="premium-loading-dot" aria-hidden="true" /> Đang tải...</> : 'Xem Insight'}
                      </button>
                    </div>
                  </article>
                );
              })()}

            </div>
          </section>
        )}

        {/* 3. ORGANIZATIONS VIEW (DIRECTORY) */}
        {activeView === 'ORGANIZATIONS' && (
          <section className="np-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(1.6rem, 2.4vw, 2rem)', fontWeight: '800', letterSpacing: '-0.035em', color: 'var(--c-ink)' }}>Doanh nghiệp & CLB</h2>
                <p style={{ margin: 0, fontSize: '0.96rem', color: 'var(--c-muted)' }}>Khám phá các tổ chức đang tuyển dụng và mở Quest trên nền tảng.</p>
              </div>
              <div style={{ display: 'flex', background: 'var(--surface-soft)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                <button
                  onClick={() => setOrgTypeFilter('ALL')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 0,
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: orgTypeFilter === 'ALL' ? 'var(--primary)' : 'transparent',
                    color: orgTypeFilter === 'ALL' ? '#fff' : 'var(--nav-text)'
                  }}
                  type="button"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setOrgTypeFilter('BUSINESS')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 0,
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: orgTypeFilter === 'BUSINESS' ? 'var(--primary)' : 'transparent',
                    color: orgTypeFilter === 'BUSINESS' ? '#fff' : 'var(--nav-text)'
                  }}
                  type="button"
                >
                  Doanh nghiệp
                </button>
                <button
                  onClick={() => setOrgTypeFilter('CLUB')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 0,
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: orgTypeFilter === 'CLUB' ? 'var(--primary)' : 'transparent',
                    color: orgTypeFilter === 'CLUB' ? '#fff' : 'var(--nav-text)'
                  }}
                  type="button"
                >
                  CLB & Tổ chức
                </button>
              </div>
            </div>

            {/* Org search bar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                type="text"
                value={orgSearchQuery}
                onChange={(e) => setOrgSearchQuery(e.target.value)}
                placeholder="Tìm kiếm đối tác theo tên, lĩnh vực chuyên môn hoặc giới thiệu..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                  fontSize: '0.92rem'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--muted)' }} />
              {orgSearchQuery && (
                <button
                  onClick={() => setOrgSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex'
                  }}
                  type="button"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Directory Loading vs Grid */}
            {companiesLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px solid var(--line)' }}>
                <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Đang nạp dữ liệu từ hệ thống...</p>
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                <Building size={32} color="var(--muted)" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.92rem', fontWeight: 'bold' }}>Không tìm thấy Doanh nghiệp hoặc CLB nào phù hợp.</p>
              </div>
            ) : (
              <div className="org-directory-grid">
                {filteredOrgs.map((org) => (
                  <article key={org.id} className="org-card" style={{ cursor: 'pointer' }} onClick={() => handleTabChange(`org-${org.id}`)}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="org-logo-circle" style={{ background: org.logoUrl ? 'transparent' : org.logoColor, overflow: 'hidden', border: org.logoUrl ? '1px solid var(--line)' : 'none' }}>
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            org.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className={`org-badge-type ${org.type.toLowerCase()}`}>
                          {org.type === 'BUSINESS' ? 'Doanh nghiệp' : 'CLB / Tổ chức'}
                        </span>
                      </div>
                      <h3 style={{ margin: '14px 0 6px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>{org.name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                        {org.industry}
                      </span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5, height: '65px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {org.description || 'Đối tác chưa cung cấp thông tin mô tả chi tiết.'}
                      </p>
                    </div>
                    <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{org.location}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Mở hồ sơ <ArrowRight size={13} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. DETAILED ORGANIZATION PROFILE VIEW (tab-spawning result) */}
        {activeView === 'ORGANIZATION_DETAIL' && selectedOrg && (
          selectedOrgDetailLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '16px', background: 'var(--surface-soft)', borderRadius: '28px', border: '1px solid var(--line)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
              <p style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 'bold' }}>Đang tải thông tin chi tiết đối tác...</p>
            </div>
          ) : (
            <div className="org-detail-container orgw">
              <button className="org-back-btn" onClick={() => handleTabChange('organizations')} type="button">
                <ArrowLeft size={16} /> Quay lại danh sách
              </button>

              {/* Hero */}
              <div className="orgw-hero" style={{ '--org-accent': selectedOrg.type === 'CLUB' ? '#f97316' : '#2563eb' }}>
                <div className="orgw-cover" />
                <div className="orgw-hero-body">
                  <div className="orgw-logo" style={{ background: selectedOrg.logoUrl ? 'var(--c-surface)' : selectedOrg.logoColor }}>
                    {selectedOrg.logoUrl
                      ? <img src={selectedOrg.logoUrl} alt={selectedOrg.name} />
                      : <span>{selectedOrg.name.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="orgw-title-row">
                    <h1>{selectedOrg.name}</h1>
                    {selectedOrg.verified && <span className="orgw-verify"><CheckCircle2 size={14} /> Đã xác thực</span>}
                  </div>
                </div>
                <div className="orgw-sub">
                  <span className="orgw-type-pill">{selectedOrg.type === 'CLUB' ? 'CLB / Tổ chức sinh viên' : 'Doanh nghiệp'}</span>
                  <span className="orgw-dot" />
                  {selectedOrg.type === 'CLUB'
                    ? <span><strong>{selectedOrgQuests.length}</strong> Quest & hoạt động</span>
                    : <span><strong>{selectedOrgJobs.length}</strong> tin tuyển dụng</span>}
                </div>
              </div>

              {/* Two-column layout */}
              <div className="orgw-layout">
                {/* MAIN */}
                <div className="orgw-main">
                  <div className="orgw-tabs">
                    {selectedOrg.type === 'CLUB' ? (
                      <span className="orgw-tab active">Quest & Hoạt động <span className="orgw-tab-count">{selectedOrgQuests.length}</span></span>
                    ) : (
                      <span className="orgw-tab active">Tin tuyển dụng <span className="orgw-tab-count">{selectedOrgJobs.length}</span></span>
                    )}
                  </div>

                  {selectedOrgTab === 'JOBS' ? (
                    selectedOrgJobsLoading ? (
                      <div className="orgw-state"><RefreshCw size={20} style={{ color: 'var(--primary)', animation: 'spin 1.4s linear infinite' }} /><p>Đang nạp tin tuyển dụng...</p></div>
                    ) : selectedOrgJobs.length === 0 ? (
                      <div className="orgw-empty"><BriefcaseBusiness size={26} /><p>Đối tác hiện chưa có tin tuyển dụng nào.</p></div>
                    ) : (
                      <>
                        <div className="orgw-rows" key={`ojobs-${orgJobsPage}`}>
                          {selectedOrgJobs.slice((orgJobsPage - 1) * ORG_PAGE_SIZE, orgJobsPage * ORG_PAGE_SIZE).map((job) => {
                            const isLocked = candidateRs < job.minReqRs;
                            const alreadyApplied = appliedJobs.some(a => (a.job_id || a.jobId) === job.id);
                            const compText = job.compensation > 0 ? `${Number(job.compensation).toLocaleString()} VND` : 'Thỏa thuận';
                            return (
                              <div className="orgw-row" key={job.id}>
                                <div className="orgw-row-body">
                                  <div className="orgw-row-tags">
                                    <span className="orgw-tag">{JOB_TYPES.find(t => t.value === job.jobType)?.label || job.jobType}</span>
                                    {job.isRemote && <span className="orgw-tag remote">Remote</span>}
                                    {isLocked && <span className="orgw-tag lock"><LockKeyhole size={10} /> Cần {job.minReqRs} RS</span>}
                                  </div>
                                  <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" className="orgw-row-title" onClick={() => viewOpportunityOnce(job.id)}>{job.title}</a>
                                  <p className="orgw-row-desc">{job.description?.length > 150 ? `${job.description.slice(0, 150)}...` : job.description}</p>
                                  <div className="orgw-row-meta">
                                    <span className="pay">{compText}</span>
                                    <span className="orgw-dot" />
                                    <span>{job.isRemote ? 'Remote' : (job.location || 'Linh hoạt')}</span>
                                    <span className="orgw-dot" />
                                    <span>{job.minReqRs > 0 ? `Yêu cầu ${job.minReqRs} RS` : 'Không yêu cầu RS'}</span>
                                  </div>
                                </div>
                                <div className="orgw-row-actions">
                                  <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" className="orgw-detail" onClick={() => viewOpportunityOnce(job.id)}>Chi tiết</a>
                                  <button type="button" className="orgw-apply" disabled={isLocked || alreadyApplied} onClick={() => handleApplyJob(job)}>
                                    {alreadyApplied ? <><Check size={14} /> Đã ứng tuyển</> : isLocked ? 'Cần RS' : 'Ứng tuyển'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {selectedOrgJobs.length > ORG_PAGE_SIZE && (
                          <div className="orgw-pager">{renderPager(selectedOrgJobs.length, orgJobsPage, setOrgJobsPage, ORG_PAGE_SIZE)}</div>
                        )}
                      </>
                    )
                  ) : (
                    selectedOrgQuestsLoading ? (
                      <div className="orgw-state"><RefreshCw size={20} style={{ color: 'var(--primary)', animation: 'spin 1.4s linear infinite' }} /><p>Đang nạp các Quest...</p></div>
                    ) : selectedOrgQuests.length === 0 ? (
                      <div className="orgw-empty"><Zap size={26} /><p>Đối tác hiện chưa có Quest nào.</p></div>
                    ) : (
                      <>
                        <div className="orgw-rows" key={`oquests-${orgQuestsPage}`}>
                          {selectedOrgQuests.slice((orgQuestsPage - 1) * ORG_PAGE_SIZE, orgQuestsPage * ORG_PAGE_SIZE).map((quest) => {
                            const isLocked = candidateRs < (quest.minReqRs || 0);
                            const alreadyApplied = questApplications.some(qa => qa.questId === quest.id);
                            const categoryMeta = {
                              SMALL_EVENT: { label: 'Sự kiện nhỏ', color: '#8b5cf6' },
                              SCHOOL_CAMPAIGN: { label: 'Chiến dịch trường', color: '#0ea5e9' },
                              COMPANY_PROJECT: { label: 'Dự án DN', color: '#f59e0b' },
                              SHORT_INTERNSHIP: { label: 'Thực tập ngắn', color: '#10b981' },
                              FREELANCE_GIG: { label: 'Freelance', color: '#ec4899' }
                            }[quest.category] || { label: quest.category, color: 'var(--primary)' };
                            return (
                              <div className="orgw-row" key={quest.id}>
                                <div className="orgw-row-body">
                                  <div className="orgw-row-tags">
                                    <span className="orgw-tag" style={{ background: `${categoryMeta.color}1a`, color: categoryMeta.color }}>{categoryMeta.label}</span>
                                    {alreadyApplied && <span className="orgw-tag applied"><Check size={10} /> Đã đăng ký</span>}
                                    {isLocked && <span className="orgw-tag lock"><LockKeyhole size={10} /> Cần {quest.minReqRs} RS</span>}
                                  </div>
                                  <a href={`/quests/${quest.id}`} target="_blank" rel="noopener noreferrer" className="orgw-row-title" onClick={() => viewOpportunityOnce(quest.id)}>{quest.title}</a>
                                  <p className="orgw-row-desc">{quest.description?.length > 150 ? `${quest.description.slice(0, 150)}...` : quest.description}</p>
                                  <div className="orgw-row-meta">
                                    <span className="pay" style={{ color: '#f59e0b' }}>+{quest.expReward} EXP{quest.npReward > 0 ? ` · +${quest.npReward} NP` : ''}</span>
                                    <span className="orgw-dot" />
                                    <span>{quest.minReqRs > 0 ? `Yêu cầu ${quest.minReqRs} RS` : 'Không yêu cầu RS'}</span>
                                  </div>
                                </div>
                                <div className="orgw-row-actions">
                                  <a href={`/quests/${quest.id}`} target="_blank" rel="noopener noreferrer" className="orgw-detail" onClick={() => viewOpportunityOnce(quest.id)}>Chi tiết</a>
                                  <button type="button" className="orgw-apply" disabled={isLocked || alreadyApplied} onClick={() => { setSelectedQuestForApply(quest); setQuestCoverNote(''); setQuestAnswers({}); setQuestApplyError(''); setShowQuestApplyModal(true); }} style={{ background: (isLocked || alreadyApplied) ? undefined : categoryMeta.color }}>
                                    {alreadyApplied ? 'Đã đăng ký' : isLocked ? 'Cần RS' : 'Tham gia'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {selectedOrgQuests.length > ORG_PAGE_SIZE && (
                          <div className="orgw-pager">{renderPager(selectedOrgQuests.length, orgQuestsPage, setOrgQuestsPage, ORG_PAGE_SIZE)}</div>
                        )}
                      </>
                    )
                  )}
                </div>

                {/* SIDEBAR */}
                <aside className="orgw-side">
                  {selectedOrg.description && (
                    <div className="orgw-card">
                      <h3 className="orgw-card-title">Về {selectedOrg.name}</h3>
                      <p className="orgw-card-desc">{selectedOrg.description}</p>
                    </div>
                  )}
                  <div className="orgw-card">
                    <h3 className="orgw-card-title">Thông tin đối tác</h3>
                    <ul className="orgw-info">
                      <li><span>Loại hình</span><strong>{selectedOrg.type === 'CLUB' ? 'CLB / Tổ chức' : 'Doanh nghiệp'}</strong></li>
                      {selectedOrg.schoolName && <li><span>Trường liên kết</span><strong>{selectedOrg.schoolName}</strong></li>}
                      {selectedOrg.representativeName && <li><span>Người đại diện</span><strong>{selectedOrg.representativeName}</strong></li>}
                      {selectedOrg.taxCode && <li><span>Mã số thuế</span><strong>{selectedOrg.taxCode}</strong></li>}
                      {selectedOrg.type === 'CLUB'
                        ? <li><span>Quest & hoạt động</span><strong>{selectedOrgQuests.length}</strong></li>
                        : <li><span>Tin tuyển dụng</span><strong>{selectedOrgJobs.length}</strong></li>}
                      <li><span>Trạng thái</span><strong className="orgw-ok">Đã xác thực</strong></li>
                    </ul>
                    {selectedOrg.fanpageUrl && (
                      <a href={selectedOrg.fanpageUrl} target="_blank" rel="noopener noreferrer" className="orgw-side-link"><ExternalLink size={14} /> Fanpage chính thức</a>
                    )}
                    {selectedOrg.website && !/seed:|nextplease\.net/.test(selectedOrg.website) && (
                      <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="orgw-side-link"><ExternalLink size={14} /> Truy cập website</a>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          )
        )}

        {/* 5. CREDENTIALS & STATUS VIEW */}
        {activeView === 'CREDENTIALS' && (
          <div className="candidate-credentials-workspace np-view">

            {/* Certifications & Diplomas Grid (My Credentials) */}
            <section className="credentials-list-section">
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={20} color="var(--primary)" />
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: 'var(--ink)' }}>Văn bằng & Chứng chỉ đã tải</h2>
                </div>
                {has3D ? (
                  <Link className="button secondary-button" to="/portfolio/edit" style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}>
                    Thêm chứng chỉ
                  </Link>
                ) : (
                  <Link className="button secondary-button" to="/portfolio" style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}>
                    Thêm chứng chỉ
                  </Link>
                )}
              </div>

              {!portfolio?.credentials || portfolio.credentials.length === 0 || !portfolio.credentials.some(c => c.name?.trim()) ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                  <Award size={26} color="var(--muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: '0 0 8px', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: '600' }}>Chưa có chứng chỉ nào được xác thực.</p>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>Hãy truy cập Chỉnh sửa Portfolio để tải lên văn bằng chứng chỉ, giúp nâng điểm Reputation Score của bạn.</p>
                </div>
              ) : (
                <div className="np-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {portfolio.credentials.filter(c => c.name?.trim()).map((cred) => (
                    <article key={cred.id} style={{
                      border: '1px solid var(--c-line)',
                      borderRadius: '16px',
                      padding: '16px',
                      background: 'var(--c-surface)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--c-red-soft)', color: 'var(--c-red)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Award size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: '800', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cred.name}>
                          {cred.name}
                        </h4>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '2px' }}>Cấp bởi: {cred.issuer || 'Chưa rõ'}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> Cấp: {cred.issuedAt || 'Chưa rõ'}
                          </span>
                          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                            Đã xác minh
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Proof of Work submission section */}
            <section className="credentials-list-section" style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--primary)" />
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: 'var(--ink)' }}>Nộp Minh chứng Hoạt động</h2>
                </div>
                <button
                  className="button primary-button"
                  style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: '10px' }}
                  onClick={() => { setShowCredentialForm(v => !v); setOpenCredentialMonthPicker(null); setCredentialFormError(''); setCredentialFormSuccess(''); }}
                >
                  {showCredentialForm ? 'Đóng form' : '+ Nộp minh chứng mới'}
                </button>
              </div>

              {credentialFormSuccess && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', fontSize: '0.88rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                  {credentialFormSuccess}
                </div>
              )}

              {showCredentialForm && (
                <form onSubmit={handleSubmitCredential} className="credential-submit-form">
                  <div className="credential-submit-topline">
                    <div className="credential-submit-mark">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3>Biến hoạt động thật thành Reputation Capital</h3>
                      <p>Điền thông tin hoạt động bạn đã tham gia. Sau khi Admin xét duyệt, EXP và RS sẽ được cộng tự động vào hồ sơ.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-full">
                      <label className="form-label">Tên hoạt động / Dự án *</label>
                      <input className="form-input" placeholder="VD: Chiến dịch Mùa hè xanh 2024" value={credentialForm.projectName} onChange={e => setCredentialForm(f => ({ ...f, projectName: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="form-label">Vai trò / Chức danh *</label>
                      <input className="form-input" placeholder="VD: Trưởng ban truyền thông" value={credentialForm.position} onChange={e => setCredentialForm(f => ({ ...f, position: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="form-label">Cấp bậc vai trò</label>
                      <select className="form-input" value={credentialForm.roleLevel} onChange={e => setCredentialForm(f => ({ ...f, roleLevel: e.target.value }))}>
                        <option value="MEMBER">Thành viên (+5 RS khi duyệt)</option>
                        <option value="LEADER">Trưởng nhóm / Ban (+10 RS khi duyệt)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Loại hình hoạt động</label>
                      <select className="form-input" value={credentialForm.category} onChange={e => setCredentialForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="CLUB_SMALL">Sự kiện CLB / Khoa (+100 EXP)</option>
                        <option value="SCHOOL_CAMPAIGN">Chiến dịch cấp Trường (+300 EXP)</option>
                        <option value="COMPANY_PROJECT">Dự án Doanh nghiệp (+500 EXP)</option>
                        <option value="SHORT_INTERNSHIP">Thực tập ngắn hạn (+500 EXP)</option>
                        <option value="FREELANCE_GIG">Công việc tự do (+500 EXP)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Thời gian bắt đầu</label>
                      <CredentialMonthPicker
                        id="credential-started-at"
                        label=""
                        value={credentialForm.startedAt}
                        maxValue={getCurrentMonthValue()}
                        openPicker={openCredentialMonthPicker}
                        setOpenPicker={setOpenCredentialMonthPicker}
                        helperText="Không chọn sau tháng hiện tại."
                        onChange={(value) => setCredentialForm((form) => ({
                          ...form,
                          startedAt: value,
                          endedAt: form.endedAt && compareMonthValues(form.endedAt, value) < 0 ? '' : form.endedAt,
                        }))}
                      />
                    </div>
                    <div>
                      <label className="form-label">Thời gian kết thúc</label>
                      <CredentialMonthPicker
                        id="credential-ended-at"
                        label=""
                        value={credentialForm.endedAt}
                        minValue={credentialForm.startedAt}
                        maxValue={getCurrentMonthValue()}
                        openPicker={openCredentialMonthPicker}
                        setOpenPicker={setOpenCredentialMonthPicker}
                        helperText="Không trước tháng bắt đầu."
                        onChange={(value) => setCredentialForm(f => ({ ...f, endedAt: value }))}
                      />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Link minh chứng (certificate, fanpage sự kiện, ảnh...)</label>
                      <input className="form-input" placeholder="https://drive.google.com/... hoặc link Facebook event" value={credentialForm.proofLink} onChange={e => setCredentialForm(f => ({ ...f, proofLink: e.target.value }))} />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Ảnh minh chứng (giấy xác nhận, ảnh hoạt động — tối đa 6 ảnh, &lt;2MB)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {(credentialForm.proofImages || []).map((img, i) => (
                          <div key={i} style={{ position: 'relative', width: '92px', height: '92px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => removeProofImage(i)} aria-label="Gỡ ảnh"
                              style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.92)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                        {(credentialForm.proofImages || []).length < 6 && (
                          <label style={{ width: '92px', height: '92px', borderRadius: '12px', border: '1.5px dashed var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.72rem', fontWeight: '600', textAlign: 'center' }}>
                            <ImagePlus size={20} /> Tải ảnh
                            <input type="file" accept="image/*" multiple onChange={handleProofImageUpload} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="form-full">
                      <label className="form-label">Mô tả thêm (không bắt buộc)</label>
                      <textarea className="form-input" placeholder="Mô tả ngắn về đóng góp của bạn trong hoạt động này..." value={credentialForm.description} onChange={e => setCredentialForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                  {credentialFormError && (
                    <div className="alert-banner error" style={{ marginTop: '14px', marginBottom: 0 }}>
                      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                      {credentialFormError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                    <button type="submit" className="button primary-button" disabled={credentialFormLoading} style={{ fontSize: '0.86rem' }}>
                      {credentialFormLoading ? 'Đang gửi...' : 'Nộp minh chứng'}
                    </button>
                    <button type="button" className="button secondary-button" onClick={() => { setShowCredentialForm(false); setOpenCredentialMonthPicker(null); }} style={{ fontSize: '0.86rem' }}>Hủy</button>
                  </div>
                </form>
              )}

              {/* List of submitted proofs */}
              {credentialSubmissionsLoading ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><ShieldCheck size={28} /></div>
                  <p className="empty-state-title">Đang tải minh chứng...</p>
                </div>
              ) : credentialSubmissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><ShieldCheck size={28} /></div>
                  <p className="empty-state-title">Chưa có minh chứng nào được nộp.</p>
                  <p className="empty-state-desc">Nhấn "+ Nộp minh chứng mới" để bắt đầu tích luỹ EXP và RS thực tế.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {credentialSubmissions.map(sub => {
                    const categoryLabels = { CLUB_SMALL: 'Sự kiện CLB', SCHOOL_CAMPAIGN: 'Chiến dịch Trường', COMPANY_PROJECT: 'Dự án DN', SHORT_INTERNSHIP: 'Thực tập', FREELANCE_GIG: 'Freelance' };
                    const expRewards = { CLUB_SMALL: 100, SCHOOL_CAMPAIGN: 300, COMPANY_PROJECT: 500, SHORT_INTERNSHIP: 500, FREELANCE_GIG: 500 };
                    const statusKey = (sub.verification_status || '').toLowerCase();
                    const statusLabel = sub.verification_status === 'APPROVED' ? 'Đã duyệt' : sub.verification_status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt';
                    return (
                      <div key={sub.id} className={`proof-card ${statusKey}`}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: '800', color: 'var(--ink)' }}>{sub.project_name}</h4>
                            <span className="proof-chip category">{categoryLabels[sub.category] || sub.category}</span>
                            <span className={`proof-chip ${(sub.role_level || 'MEMBER').toLowerCase()}`}>{sub.role_level === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}</span>
                          </div>
                          <p style={{ margin: '0 0 6px', fontSize: '0.84rem', color: 'var(--muted)' }}>{sub.position}</p>
                          {sub.proof_link && (
                            <a href={sub.proof_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} /> Link minh chứng
                            </a>
                          )}
                          {sub.verification_status === 'REJECTED' && sub.reject_reason && (
                            <div className="alert-banner error" style={{ marginTop: '8px', marginBottom: 0, padding: '6px 10px' }}>
                              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                              Lý do từ chối: {sub.reject_reason}
                            </div>
                          )}
                          {sub.verification_status === 'APPROVED' && (
                            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#16a34a', fontWeight: '700' }}>
                              +{expRewards[sub.category] || 100} EXP · +{sub.role_level === 'LEADER' ? 10 : 5} RS đã được cộng
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {sub.expressVerification && (
                              <span style={{ fontSize: '0.72rem', fontWeight: '800', border: '1px solid #f59e0b', color: '#d97706', background: 'rgba(245,158,11,0.1)', padding: '3px 9px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Zap size={11} /> Express
                              </span>
                            )}
                            <span className={`proof-status-badge ${statusKey}`}>{statusLabel}</span>
                          </div>
                          
                          {!sub.expressVerification && sub.verification_status === 'PENDING' && (
                            <button
                              onClick={() => handleExpressVerification(sub.id)}
                              disabled={expressLoadingId === sub.id}
                              style={{ fontSize: '0.72rem', fontWeight: '700', color: '#d97706', background: 'none', border: '1px solid rgba(217,119,6,0.35)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', transition: 'all 0.2s' }}
                              title={`Nâng cấp duyệt nhanh 24h với ${premiumConfig.expressPriceNp.toLocaleString()} NP`}
                            >
                              {expressLoadingId === sub.id ? '...' : <><Zap size={11} /> Duyệt nhanh 24h</>}
                            </button>
                          )}

                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* ─── Quest Apply Modal ─── */}
      {/* ─── Quest Apply Confirmation Modal ─── */}
      {showQuestApplyModal && selectedQuestForApply && (
        <ApplyModal
          icon={Zap}
          title="Tham gia Quest"
          accent="#f59e0b"
          profileProps={{ portfolio, candidateRs, currentLevel, currentExp }}
          coverNote={questCoverNote}
          setCoverNote={setQuestCoverNote}
          coverLabel="Giới thiệu bản thân (tùy chọn)"
          coverPlaceholder="Hãy chia sẻ tại sao bạn muốn tham gia Quest này..."
          fields={selectedQuestForApply.formFields || []}
          answers={questAnswers}
          setAnswers={setQuestAnswers}
          fieldsTitle="Câu hỏi từ ban tổ chức"
          error={questApplyError}
          loading={questApplyLoading}
          submitLabel="Xác nhận tham gia"
          onClose={() => { setShowQuestApplyModal(false); setQuestApplyError(''); }}
          onSubmit={handleApplyToQuest}
          infoCard={(
            <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 16px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--ink)', fontWeight: '800' }}>{selectedQuestForApply.title}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '10px' }}>{selectedQuestForApply.companyName}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '6px' }}>+{selectedQuestForApply.expReward} EXP</span>
                {selectedQuestForApply.npReward > 0 && <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '6px' }}>+{selectedQuestForApply.npReward} NP</span>}
              </div>
            </div>
          )}
        />
      )}

      {/* ─── Job Apply Confirmation Glass Modal ─── */}
      {showApplyModal && selectedJobForApply && (
        <ApplyModal
          icon={Sparkles}
          title="Xác nhận ứng tuyển"
          accent="#2563eb"
          profileProps={{ portfolio, candidateRs, currentLevel, currentExp }}
          coverNote={jobCoverNote}
          setCoverNote={setJobCoverNote}
          coverLabel="Thư giới thiệu (tùy chọn)"
          coverPlaceholder="Hãy chia sẻ vì sao bạn phù hợp với vị trí này..."
          fields={applyFormFields}
          answers={applyAnswers}
          setAnswers={setApplyAnswers}
          fieldsTitle="Câu hỏi từ nhà tuyển dụng"
          error={applyModalError}
          loading={applyModalLoading}
          submitLabel="Xác nhận nộp đơn"
          onClose={() => { setShowApplyModal(false); setApplyModalError(''); }}
          onSubmit={confirmApplyJob}
          infoCard={(
            <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 16px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--ink)', fontWeight: '800' }}>{selectedJobForApply.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.84rem', marginBottom: '10px' }}>
                <Building size={13} />
                <span>{selectedJobForApply.companyName || selectedJobForApply.company_name || 'Đối tác'}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '10px', flexWrap: 'wrap' }}>
                <span>Thù lao: <strong style={{ color: '#16a34a' }}>{selectedJobForApply.compensation > 0 ? `${Number(selectedJobForApply.compensation).toLocaleString()} VND` : 'Thỏa thuận'}</strong></span>
                <span>Yêu cầu RS: <strong style={{ color: '#2563eb' }}>{(selectedJobForApply.minReqRs || selectedJobForApply.min_req_rs || 0) > 0 ? `${selectedJobForApply.minReqRs || selectedJobForApply.min_req_rs} RS` : 'Không có'}</strong></span>
              </div>
            </div>
          )}
        />
      )}

      {/* ─── Application detail (tracking) Modal ─── */}
      {viewingApp && (() => {
        const { app, isQuest } = viewingApp;
        const accent = isQuest ? '#f59e0b' : '#2563eb';
        const title = isQuest ? app.questTitle : (app.job_title || app.title);
        const company = isQuest ? app.companyName : (app.company_name || app.companyName);
        const coverNote = app.cover_note || app.coverNote || '';
        const postId = isQuest ? app.questId : (app.job_id || app.jobId);
        const postHref = isQuest ? `/quests/${postId}` : `/jobs/${postId}`;
        let answers = [];
        try { answers = JSON.parse(app.custom_answers || app.customAnswers || '[]'); } catch { answers = []; }
        if (!Array.isArray(answers)) answers = [];
        return (
          <div className="glass-modal-overlay" onClick={() => setViewingApp(null)}>
            <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div className="glass-modal-header" style={{ borderTop: `3px solid ${accent}`, borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
                <span style={{ display: 'inline-flex', width: '34px', height: '34px', borderRadius: '10px', alignItems: 'center', justifyContent: 'center', background: `${accent}14`, color: accent }}>
                  {isQuest ? <Zap size={19} /> : <Building size={19} />}
                </span>
                <h2>Chi tiết ứng tuyển</h2>
              </div>
              <div className="glass-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 16px' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--ink)', fontWeight: '800' }}>{title}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Building size={13} /> {company || 'Đối tác'}
                  </div>
                  {postId && (
                    <a href={postHref} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: accent, textDecoration: 'none', padding: '7px 12px', borderRadius: '9px', border: `1px solid ${accent}40`, background: `${accent}08` }}>
                      <ExternalLink size={14} /> Mở trang chi tiết tin đăng
                    </a>
                  )}
                </div>

                <CandidateProfilePreview portfolio={portfolio} candidateRs={candidateRs} currentLevel={currentLevel} currentExp={currentExp} />

                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thư giới thiệu</p>
                  {coverNote.trim()
                    ? <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '12px 14px', background: 'var(--surface-soft)', borderRadius: '12px', border: '1px solid var(--line)' }}>{coverNote}</p>
                    : <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)', fontStyle: 'italic' }}>Không có thư giới thiệu.</p>}
                </div>

                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Câu trả lời của bạn</p>
                  {answers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {answers.map((a, i) => (
                        <div key={i} style={{ padding: '11px 14px', background: 'var(--surface-soft)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--muted)', marginBottom: '3px' }}>{a.label}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{a.value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)', fontStyle: 'italic' }}>Tin này không có câu hỏi thêm.</p>
                  )}
                </div>
              </div>
              <div className="glass-modal-footer">
                <button className="button secondary-button" onClick={() => setViewingApp(null)} type="button">Đóng</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Account Settings Modal ─── */}
      {showSettingsModal && (
        <AccountSettingsModal
          onClose={() => setShowSettingsModal(false)}
          currentDisplayName={portfolio?.name}
        />
      )}

      {/* ─── Top-Up NP Modal ─── */}
      {showTopUpModal && (
        <div className="glass-modal-overlay" onClick={() => { setShowTopUpModal(false); setTopUpError(''); setTopUpSuccess(''); }}>
          <div className="glass-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="glass-modal-header">
              <WalletCards size={20} color="var(--primary)" />
              <h2>Nạp NP vào ví</h2>
            </div>
            <div className="glass-modal-body">
              <div style={{ background: 'var(--surface-soft)', borderRadius: '14px', padding: '14px 16px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: '600' }}>Số dư hiện tại</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>{(wallet?.npBalance ?? 0).toLocaleString()} NP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: '600' }}>Tỷ giá</span>
                  <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>1 VND = 1 NP</span>
                </div>
              </div>

              {topUpSuccess ? (
                <div className="alert-banner success">{topUpSuccess}</div>
              ) : (
                <form onSubmit={handleTopUp}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Số tiền nạp (VND)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="10000"
                    max="10000000"
                    step="10000"
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    placeholder="VD: 50000"
                    style={{ marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {[20000, 50000, 100000, 200000].map(amt => (
                      <button key={amt} type="button" onClick={() => setTopUpAmount(String(amt))}
                        style={{ fontSize: '0.78rem', fontWeight: '700', padding: '5px 10px', borderRadius: '8px', border: `1px solid ${topUpAmount === String(amt) ? 'var(--primary)' : 'var(--line)'}`, background: topUpAmount === String(amt) ? 'rgba(var(--primary-rgb),0.08)' : 'transparent', color: topUpAmount === String(amt) ? 'var(--primary)' : 'var(--muted)', cursor: 'pointer' }}>
                        {(amt / 1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>
                  {topUpAmount && parseInt(topUpAmount) >= 10000 && (
                    <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: '#16a34a', fontWeight: '700' }}>
                      → Nhận được {parseInt(topUpAmount).toLocaleString('vi-VN')} NP
                    </p>
                  )}
                  {topUpError && (
                    <div className="alert-banner error" style={{ marginBottom: '12px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      {topUpError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="button primary-button" disabled={topUpLoading} style={{ flex: 1 }}>
                      {topUpLoading ? 'Đang nạp...' : 'Nạp ngay'}
                    </button>
                    <button type="button" className="button secondary-button" onClick={() => { setShowTopUpModal(false); setTopUpError(''); }}>Hủy</button>
                  </div>
                </form>
              )}
              <p style={{ margin: '14px 0 0', fontSize: '0.76rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.4 }}>
                Phiên bản demo — NP được cộng ngay lập tức (MOCK provider)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Premium Paywall Modal ─── */}
      {showPremiumPaywall && (
        <div className="glass-modal-overlay" onClick={() => setShowPremiumPaywall(false)}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="glass-modal-header">
              <Crown size={22} color="#f59e0b" />
              <h2>Yêu cầu Premium Pass</h2>
            </div>
            <div className="glass-modal-body">
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Crown size={32} color="#fff" />
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>Cơ hội này chỉ dành cho Premium</h3>
                <p style={{ margin: '0 0 18px', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Nhà tuyển dụng yêu cầu ứng viên có <strong>Premium Pass</strong> để ứng tuyển vị trí này — giúp đảm bảo chất lượng hồ sơ và giảm spam.
                </p>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '14px 18px', textAlign: 'left', marginBottom: '6px' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: '800', fontSize: '0.9rem', color: 'var(--ink)' }}>Premium Pass bao gồm:</p>
                  {['Ứng tuyển không giới hạn vị trí Premium', 'Hồ sơ nổi bật hơn trong kết quả tìm kiếm', 'Badge xác nhận Premium trên Profile 3D'].map(item => (
                    <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '4px' }}>
                      <Check size={14} color="#16a34a" style={{ flexShrink: 0 }} /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-modal-body" style={{ paddingTop: 0 }}>
              {buyPremiumError && (
                <div className="alert-banner error" style={{ marginTop: 0, marginBottom: '12px' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  {buyPremiumError}
                  {buyPremiumError.includes('Số dư') && (
                    <button onClick={() => { setShowPremiumPaywall(false); setShowTopUpModal(true); }} style={{ marginLeft: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                      Nạp NP ngay
                    </button>
                  )}
                </div>
              )}
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)', textAlign: 'center' }}>
                Số dư hiện tại: <strong style={{ color: 'var(--ink)' }}>{walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString()} NP</strong>
                {' · '}Chi phí: <strong style={{ color: '#d97706' }}>40,000 NP</strong>
              </p>
            </div>
            <div className="glass-modal-footer">
              <button className="button secondary-button" onClick={() => { setShowPremiumPaywall(false); setBuyPremiumError(''); }} type="button" style={{ padding: '10px 16px', borderRadius: '12px' }}>
                Để sau
              </button>
              <button className="button primary-button" onClick={handleBuyPremium} type="button" disabled={buyPremiumLoading} style={{ padding: '10px 18px', borderRadius: '12px', background: '#d97706', border: 'none' }}>
                {buyPremiumLoading ? 'Đang xử lý...' : <><Crown size={15} style={{ marginRight: '6px' }} /> Kích hoạt Premium</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Application Insight Modal ─── */}
      {insightModalJob && (
        <div className="glass-modal-overlay" onClick={() => { setInsightModalJob(null); setInsightData(null); }}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="glass-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#7c3aed" />
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Phân tích cạnh tranh</h2>
              </div>
              <button 
                onClick={() => { setInsightModalJob(null); setInsightData(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-muted)', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>
            
            <div className="glass-modal-body" style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--c-muted)' }}>
                  {insightModalJob.applicationType === 'QUEST' ? 'Quest / CLB' : 'Công việc'}
                </p>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--c-ink)' }}>{insightModalJob.job_title || insightModalJob.questTitle || insightModalJob.title}</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>{insightModalJob.company_name || insightModalJob.companyName}</p>
              </div>

              {/* Total applicants (Teaser, always unlocked) */}
              <div style={{ background: 'var(--c-surface-soft)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1px solid var(--c-line)' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--c-ink)' }}>Tổng số ứng viên ứng tuyển:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--c-red)', fontWeight: '900' }}>
                  {insightData?.totalApplicants ?? 0}
                </strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {/* Avg RS */}
                <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: '12px', padding: '14px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: '750', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Trung bình RS</span>
                  <div style={{ filter: !insightData?.unlocked ? 'blur(4px)' : 'none', fontSize: '1.4rem', fontWeight: '900', color: 'var(--c-ink)' }}>
                    {insightData?.unlocked ? insightData.averageRs : 99}
                  </div>
                  {!insightData?.unlocked && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-veil)' }}>
                      <LockKeyhole size={16} color="var(--c-muted)" />
                    </div>
                  )}
                </div>

                {/* My Rank */}
                <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: '12px', padding: '14px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: '750', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Hạng của bạn</span>
                  <div style={{ filter: !insightData?.unlocked ? 'blur(4px)' : 'none', fontSize: '1.4rem', fontWeight: '900', color: 'var(--c-ink)' }}>
                    {insightData?.unlocked ? `${insightData.myRank} / ${insightData.totalApplicants}` : '7 / 42'}
                  </div>
                  {!insightData?.unlocked && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-veil)' }}>
                      <LockKeyhole size={16} color="var(--c-muted)" />
                    </div>
                  )}
                </div>
              </div>

              {/* Percentile visual indicator */}
              <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden', marginBottom: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: '750', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px', textAlign: 'center' }}>Tỷ lệ phần trăm cạnh tranh</span>
                <div style={{ filter: !insightData?.unlocked ? 'blur(4px)' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: '950', color: '#7c3aed' }}>
                    {insightData?.unlocked ? `Giỏi hơn ${insightData.percentile}%` : 'Giỏi hơn 85%'}
                  </strong>
                  <div style={{ width: '100%', height: '8px', background: 'var(--c-line)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: insightData?.unlocked ? `${insightData.percentile}%` : '85%', height: '100%', background: '#7c3aed', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                    {insightData?.unlocked ? 'Hồ sơ của bạn vượt trội hơn ' + insightData.percentile + '% số ứng viên khác.' : 'Độ cạnh tranh so với các đối thủ khác'}
                  </span>
                </div>
                {!insightData?.unlocked && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-veil)' }}>
                    <LockKeyhole size={20} color="var(--c-muted)" />
                  </div>
                )}
              </div>

              {/* Unlock Actions */}
              {!insightData?.unlocked && (
                <div style={{ background: 'rgba(124,58,237,0.04)', border: '1.5px dashed rgba(124,58,237,0.35)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: 'var(--c-ink)', lineHeight: 1.4, fontWeight: '600' }}>
                    Tìm hiểu đối thủ và xem vị trí xếp hạng thực tế của bạn dựa trên điểm Reputation Score để chuẩn bị tốt nhất.
                  </p>
                  <button
                    onClick={() => handleUnlockInsight(insightModalJob.targetId, insightModalJob.applicationType)}
                    style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}
                  >
                    Mở khóa ngay ({premiumConfig.insightPriceNp.toLocaleString()} NP)
                  </button>
                </div>
              )}
            </div>
            <div className="glass-modal-footer">
              <button 
                className="button secondary-button" 
                onClick={() => { setInsightModalJob(null); setInsightData(null); }}
                style={{ padding: '10px 16px', borderRadius: '12px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Job Match Alert / Early Access Modal ─── */}
      {showMatchAlertModal && (
        <div className="glass-modal-overlay" onClick={() => setShowMatchAlertModal(false)}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="glass-modal-header">
              <Sparkles size={22} color="#f59e0b" />
              <h2>Cơ hội trong Cổng xem sớm</h2>
            </div>
            <div className="glass-modal-body" style={{ padding: '20px 24px' }}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', margin: '0 auto 16px' }}>
                  <Clock3 size={28} />
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>Tin tuyển dụng vừa đăng tải</h3>
                <p style={{ margin: '0 0 18px', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Vị trí tuyển dụng này hiện đang trong thời gian <strong>Early Access (12 giờ đầu)</strong> dành riêng cho các thành viên đã đăng ký gói Job Match Alert.
                </p>
                <div style={{ background: 'var(--c-surface-soft)', border: '1px solid var(--c-line)', borderRadius: '12px', padding: '14px', textAlign: 'left', fontSize: '0.84rem', color: 'var(--ink)', lineHeight: 1.4 }}>
                  <p style={{ margin: '0 0 6px', fontWeight: '800' }}>Quyền lợi khi đăng ký Job Match Alert:</p>
                  <div>⌛ Xem sớm & nộp hồ sơ trước các ứng viên khác 12h.</div>
                  <div>✨ Mở khóa bảng Gợi ý việc làm & thử thách CLB cá nhân hóa.</div>
                </div>
              </div>
            </div>
            <div className="glass-modal-body" style={{ paddingTop: 0 }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center' }}>
                Số dư hiện tại: <strong style={{ color: 'var(--ink)' }}>{wallet?.npBalance?.toLocaleString() ?? 0} NP</strong>
                {' · '}Gói đăng ký: <strong style={{ color: '#d97706' }}>{(premiumConfig.matchAlertPriceNp || 19000).toLocaleString()} NP / tháng</strong>
              </p>
            </div>
            <div className="glass-modal-footer">
              <button className="button secondary-button" onClick={() => setShowMatchAlertModal(false)} style={{ padding: '10px 16px', borderRadius: '12px' }}>
                Để sau
              </button>
              <button 
                className="button primary-button" 
                onClick={handleSubscribeMatchAlert} 
                disabled={subscribingMatchAlert} 
                style={{ padding: '10px 18px', borderRadius: '12px', background: '#d97706', border: 'none' }}
              >
                {subscribingMatchAlert ? 'Đang kích hoạt...' : 'Kích hoạt ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled confirm dialog (replaces window.confirm) */}
      {confirmDialog && (
        <div className="glass-modal-overlay" onClick={() => setConfirmDialog(null)}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="glass-modal-header" style={{ borderTop: `3px solid ${confirmDialog.accent || 'var(--primary)'}`, borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
              <span style={{ display: 'inline-flex', width: '34px', height: '34px', borderRadius: '10px', alignItems: 'center', justifyContent: 'center', background: `${confirmDialog.accent || 'var(--primary)'}14`, color: confirmDialog.accent || 'var(--primary)' }}>
                <Crown size={18} />
              </span>
              <h2>{confirmDialog.title}</h2>
            </div>
            <div className="glass-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--c-ink)' }}>{confirmDialog.message}</p>
            </div>
            <div className="glass-modal-footer">
              <button className="button secondary-button" type="button" onClick={() => setConfirmDialog(null)}>Hủy bỏ</button>
              <button
                className="button primary-button"
                type="button"
                style={{ background: confirmDialog.accent || undefined, borderColor: 'transparent' }}
                onClick={() => { const fn = confirmDialog.onConfirm; setConfirmDialog(null); if (fn) fn(); }}
              >
                {confirmDialog.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast (replaces alert) */}
      {toast && (
        <div className={`candidate-toast ${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Đóng"><X size={15} /></button>
        </div>
      )}
    </div>
  );
}
