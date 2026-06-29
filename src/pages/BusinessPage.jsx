/* eslint-disable no-unused-vars, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Lock,
  Pencil,
  Trash2,
  LogOut,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  UsersRound,
  Zap,
  X,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
} from 'lucide-react';
import {
  getCurrentUser,
  getMyCompany,
  resubmitB2bDocument,
  updateB2bProfile,
  getCompanyMembers,
  inviteCompanyMember,
  listCompanyInvitations,
  revokeCompanyInvitation,
  changeMemberRole,
  transferOwnership,
  removeCompanyMember,
  resendCompanyInvitation,
  leaveCompany,
} from '../api/b2bApi.js';
import { logout } from '../api/httpClient.js';
import { supabase } from '../services/supabaseClient.js';
import { JobPostForm } from '../components/JobPostForm.jsx';
import { QuestPostForm } from '../components/QuestPostForm.jsx';
import { getOrganizerJobs, getOrganizerJobById, closeJob, deleteJob, getJobDetail, getJobApplications, updateApplicationStatus, getOrgPipeline, saveOrgPipeline } from '../api/jobApi.js';
import { NotificationBell } from '../components/NotificationBell.jsx';
import { getOrganizerQuests, getOrganizerQuestById, closeQuest, deleteQuest, getQuestApplicants, updateQuestApplicationStatus } from '../api/questApi.js';
import { getRating, createRating, updateRating } from '../api/ratingApi.js';
import { Crown, ArrowLeft, Check, Calendar, Award, ChevronRight, ExternalLink as ExtLink, Loader2 } from 'lucide-react';


const DASHBOARD_BASE_PATH = '/businesses/dashboard';

const ACCOUNT_TAB = { key: 'account', route: 'account', label: 'Thông tin tài khoản', icon: UserRound, lockable: false };

const SIDEBAR_TABS = [
  { key: 'dashboard', route: '', label: 'Bảng điều khiển', icon: BriefcaseBusiness, lockable: false },
  { key: 'create-job', route: 'create-job', label: 'Đăng tin tuyển dụng', icon: Plus, lockable: true },
  { key: 'manage-jobs', route: 'manage-jobs', label: 'Quản lý tin đăng', icon: FileText, lockable: true },
  { key: 'find-talent', route: 'find-talent', label: 'Tìm kiếm Talent', icon: Search, lockable: true },
  { key: 'candidates', route: 'candidates', label: 'Quản lý ứng viên', icon: UsersRound, lockable: true },
  { key: 'members', route: 'members', label: 'Thành viên & Phân quyền', icon: ShieldCheck, lockable: true },
  { key: 'pipeline', route: 'pipeline', label: 'Quy trình tuyển dụng', icon: Filter, lockable: true },
];

const ALL_TABS = [...SIDEBAR_TABS, ACCOUNT_TAB];

const TAB_BY_ROUTE = ALL_TABS.reduce((acc, tab) => {
  acc[tab.route] = tab.key;
  return acc;
}, {});

/* ─── CandidatesView ─────────────────────────────────────────────────────── */
const STATUS_LABEL = { SUBMITTED: 'Đã nộp', APPLIED: 'Đã nộp', VIEWED: 'Đã xem', SHORTLISTED: 'Vào vòng tiếp', ACCEPTED: 'Chấp nhận', APPROVED: 'Chấp nhận', REJECTED: 'Từ chối', WITHDRAWN: 'Rút đơn', COMPLETED: 'Hoàn thành' };
const STATUS_COLOR = { SUBMITTED: '#6366f1', APPLIED: '#6366f1', VIEWED: '#0284c7', SHORTLISTED: '#d97706', ACCEPTED: '#16a34a', APPROVED: '#16a34a', REJECTED: '#dc2626', WITHDRAWN: '#9ca3af', COMPLETED: '#7c3aed' };

function CandidatesView() {
  const [postings, setPostings] = useState([]);
  const [postingsLoading, setPostingsLoading] = useState(true);
  const [postingSearch, setPostingSearch] = useState('');
  const [postingTypeFilter, setPostingTypeFilter] = useState('ALL'); // ALL | JOB | QUEST
  const [postingStatusTab, setPostingStatusTab] = useState('active'); // active | closed

  const [selectedPosting, setSelectedPosting] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState('');

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: 'idle', text: '' });

  // Custom pipeline (labels/colors/visibility over canonical statuses)
  const [pipeline, setPipeline] = useState([]);
  useEffect(() => { getOrgPipeline().then(setPipeline).catch(() => setPipeline([])); }, []);
  const pipeMap = pipeline.reduce((acc, s) => { acc[s.status] = s; return acc; }, {});
  const labelOf = (status) => pipeMap[status]?.label || STATUS_LABEL[status] || status;
  const colorOf = (status) => pipeMap[status]?.color || STATUS_COLOR[status] || '#6366f1';

  function loadPostings() {
    setPostingsLoading(true);
    Promise.all([
      getOrganizerJobs().catch(() => []),
      getOrganizerQuests().catch(() => []),
    ]).then(([jobs, quests]) => {
      const jobItems = (jobs || []).map(j => ({ ...j, postType: 'JOB', _count: j.applicantsCount || j.applicants_count || 0 }));
      const questItems = (quests || []).map(q => ({ ...q, postType: 'QUEST', _count: q.applicantCount || q.applicantsCount || q.applicants_count || 0 }));
      setPostings([...questItems, ...jobItems]);
    }).finally(() => setPostingsLoading(false));
  }

  useEffect(() => { loadPostings(); }, []);

  function selectPosting(posting) {
    setSelectedPosting(posting);
    setSelectedApplicant(null);
    setApplicants([]);
    setApplicantSearch('');
    setApplicantStatusFilter('');
    setApplicantsLoading(true);
    const fetchFn = posting.postType === 'QUEST' ? getQuestApplicants(posting.id) : getJobApplications(posting.id);
    fetchFn
      .then(data => {
        setApplicants(data || []);
        // update count on the posting list in real time
        setPostings(prev => prev.map(p => p.id === posting.id ? { ...p, _count: (data || []).length } : p));
      })
      .catch(err => console.error('Lỗi tải ứng viên:', err))
      .finally(() => setApplicantsLoading(false));
  }

  async function handleAction(appId, status, reason) {
    setActionLoading(appId + '_' + status);
    try {
      if (selectedPosting.postType === 'QUEST') {
        await updateQuestApplicationStatus(appId, status, reason || null);
      } else {
        await updateApplicationStatus(appId, status, reason || null);
      }
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      if (selectedApplicant?.id === appId) setSelectedApplicant(prev => ({ ...prev, status }));
      setShowRejectInput(false);
      setRejectReason('');
      setActionMsg({ type: 'success', text: 'Đã cập nhật trạng thái ứng viên.' });
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Thất bại.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMsg({ type: 'idle', text: '' }), 3500);
    }
  }

  const isQuest = selectedPosting?.postType === 'QUEST';
  const accent = isQuest ? '#ff7a1a' : '#2563eb';
  const getName = app => app.candidateName || app.candidate_name || app.display_name || 'Ứng viên';
  const getEmail = app => app.candidateEmail || app.candidate_email || app.email || '';
  const isBoosted = app => app?.boostedUntil && new Date(app.boostedUntil) > new Date();
  const boostedUntilLabel = app => new Date(app.boostedUntil).toLocaleString('vi-VN');

  // ── Level 1: Posting list ─────────────────────────────────────────────────
  if (!selectedPosting) {
    const ACTIVE_STATUSES = ['OPEN', 'PENDING'];
    const CLOSED_STATUSES = ['CLOSED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

    const activePostings = postings.filter(p => ACTIVE_STATUSES.includes(p.status));
    const closedPostings = postings.filter(p => CLOSED_STATUSES.includes(p.status));
    const currentPool = postingStatusTab === 'active' ? activePostings : closedPostings;

    const filtered = currentPool.filter(p => {
      const matchType = postingTypeFilter === 'ALL' || p.postType === postingTypeFilter;
      const matchSearch = !postingSearch || (p.title || '').toLowerCase().includes(postingSearch.toLowerCase());
      return matchType && matchSearch;
    });

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: '900', color: 'var(--ink)' }}>Quản lý ứng viên</h2>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>Chọn bài đăng để xem hồ sơ ứng viên đã nộp.</p>
          </div>
          <button className="button secondary-button" style={{ fontSize: '0.8rem', padding: '7px 14px', gap: '5px' }} onClick={loadPostings}>
            <RefreshCw size={13} /> Làm mới
          </button>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--surface-soft)', borderRadius: '14px', padding: '4px', width: 'fit-content' }}>
          {[
            { key: 'active', label: 'Đang hoạt động', count: activePostings.length, color: '#16a34a' },
            { key: 'closed', label: 'Đã đóng / Hết hạn', count: closedPostings.length, color: '#6b7280' },
          ].map(tab => (
            <button key={tab.key} type="button" onClick={() => { setPostingStatusTab(tab.key); setPostingSearch(''); setPostingTypeFilter('ALL'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '10px', border: 0, fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                background: postingStatusTab === tab.key ? 'var(--bg)' : 'transparent',
                color: postingStatusTab === tab.key ? 'var(--ink)' : 'var(--muted)',
                boxShadow: postingStatusTab === tab.key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none' }}>
              {tab.label}
              {tab.count > 0 && (
                <span style={{ fontSize: '0.72rem', fontWeight: '800', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                  background: postingStatusTab === tab.key ? tab.color : 'var(--line)',
                  color: postingStatusTab === tab.key ? '#fff' : 'var(--muted)' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + type filter */}
        {currentPool.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--muted)' }} />
              <input type="text" value={postingSearch} onChange={e => setPostingSearch(e.target.value)}
                placeholder="Tìm tên bài đăng..."
                style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem', color: 'var(--ink)', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', background: 'var(--p-surface-soft)', borderRadius: '12px', padding: '3px', gap: '3px' }}>
              {[{ k: 'ALL', l: 'Tất cả', Ic: null }, { k: 'JOB', l: 'Tuyển dụng', Ic: BriefcaseBusiness }, { k: 'QUEST', l: 'Quest', Ic: Zap }].map(({ k, l, Ic }) => (
                <button key={k} type="button" onClick={() => setPostingTypeFilter(k)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '9px', border: 0, fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', background: postingTypeFilter === k ? '#0d1b33' : 'transparent', color: postingTypeFilter === k ? '#fff' : 'var(--p-muted)', transition: 'all 0.15s' }}>
                  {Ic && <Ic size={14} />}{l}
                </button>
              ))}
            </div>
          </div>
        )}

        {postingsLoading ? (
          <div className="empty-state"><div className="empty-state-icon"><UsersRound size={32} /></div><p className="empty-state-title">Đang tải...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={32} /></div>
            <p className="empty-state-title">
              {postingStatusTab === 'active'
                ? (postings.length === 0 ? 'Bạn chưa có bài đăng nào.' : 'Không có bài đăng đang hoạt động.')
                : 'Không có bài đăng đã đóng.'}
            </p>
            {postings.length === 0 && <p className="empty-state-desc">Tạo tin tuyển dụng hoặc Quest để bắt đầu nhận hồ sơ ứng viên.</p>}
          </div>
        ) : (
          <div className="partner-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(posting => {
              const isQ = posting.postType === 'QUEST';
              const ac = isQ ? '#ff7a1a' : '#2563eb';
              const count = posting._count || 0;
              const statusLabel = { PENDING: 'Chờ duyệt', OPEN: 'Đang mở', CLOSED: 'Đã đóng', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', REJECTED: 'Từ chối' }[posting.status] || posting.status;
              const statusColor = { PENDING: '#f59e0b', OPEN: '#16a34a', CLOSED: '#6b7280', COMPLETED: '#7c3aed', CANCELLED: '#dc2626', REJECTED: '#dc2626' }[posting.status] || '#6b7280';
              const deadline = posting.deadline_at || posting.deadlineAt || posting.endsAt || posting.ends_at;
              return (
                <div key={posting.id} onClick={() => selectPosting(posting)} className="np-cand-row"
                  style={{ border: '1px solid var(--p-line)', borderRadius: '16px', padding: '16px 20px', background: 'var(--p-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ac + '66'; e.currentTarget.style.background = ac + '06'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--p-line)'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: `${ac}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ac, flexShrink: 0, border: `1px solid ${ac}20` }}>
                    {isQ ? <Zap size={22} /> : <BriefcaseBusiness size={22} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: ac, background: `${ac}12`, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isQ ? 'Quest' : 'Tuyển dụng'}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: statusColor, background: `${statusColor}12`, padding: '2px 8px', borderRadius: '6px' }}>
                        {statusLabel}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 3px', fontSize: '0.96rem', fontWeight: '800', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{posting.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.79rem', color: 'var(--muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{isQ ? (posting.category || '') : (posting.jobType || posting.job_type || '')}</span>
                      {deadline && <span>· Hạn: {new Date(deadline).toLocaleDateString('vi-VN')}</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center', minWidth: '44px' }}>
                      <strong style={{ fontSize: '1.5rem', fontWeight: '900', color: count > 0 ? ac : 'var(--muted)', display: 'block', lineHeight: 1 }}>{count}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: '600' }}>Ứng viên</span>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--muted)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Level 2+3: Applicant list + detail panel ──────────────────────────────
  const filteredApplicants = applicants.filter(app => {
    const name = getName(app).toLowerCase();
    const email = getEmail(app).toLowerCase();
    const matchSearch = !applicantSearch || name.includes(applicantSearch.toLowerCase()) || email.includes(applicantSearch.toLowerCase());
    const matchStatus = !applicantStatusFilter || app.status === applicantStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Back */}
      <button onClick={() => { setSelectedPosting(null); setSelectedApplicant(null); }}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 16px', fontWeight: '700' }}>
        <ArrowLeft size={15} /> Quay lại danh sách bài đăng
      </button>

      {/* Posting header card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', padding: '16px 20px', background: `${accent}08`, border: `1px solid ${accent}25`, borderRadius: '16px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
          {isQuest ? <Zap size={20} /> : <BriefcaseBusiness size={20} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 2px', fontSize: '1.05rem', fontWeight: '800', color: 'var(--ink)' }}>{selectedPosting.title}</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
            {isQuest ? 'Quest' : 'Tin tuyển dụng'} · {applicantsLoading ? '...' : `${applicants.length} ứng viên đã nộp`}
            {!applicantsLoading && applicants.some(isBoosted) && (
              <span style={{ color: '#d97706', fontWeight: '750' }}>
                {' '}· {applicants.filter(isBoosted).length} đang Boost
              </span>
            )}
          </p>
        </div>
        <button className="button secondary-button" style={{ fontSize: '0.8rem', padding: '7px 14px', gap: '5px', flexShrink: 0 }} onClick={() => selectPosting(selectedPosting)}>
          <RefreshCw size={13} /> Làm mới
        </button>
      </div>

      {actionMsg.type !== 'idle' && (
        <div style={{ marginBottom: '14px', padding: '10px 16px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: '700', background: actionMsg.type === 'success' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', color: actionMsg.type === 'success' ? '#16a34a' : '#dc2626', border: `1px solid ${actionMsg.type === 'success' ? '#16a34a' : '#dc2626'}30` }}>
          {actionMsg.text}
        </div>
      )}

      {/* Search + status filter */}
      {!applicantsLoading && applicants.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: '11px', top: '10px', color: 'var(--muted)' }} />
            <input type="text" value={applicantSearch} onChange={e => setApplicantSearch(e.target.value)}
              placeholder="Tìm ứng viên..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '10px', border: '1px solid var(--p-line)', background: 'var(--p-surface)', fontSize: '0.86rem', color: 'var(--p-ink)', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <select value={applicantStatusFilter} onChange={e => setApplicantStatusFilter(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--p-line)', background: 'var(--p-surface)', fontSize: '0.86rem', color: 'var(--p-ink)', cursor: 'pointer' }}>
            <option value="">Tất cả trạng thái</option>
            {(pipeline.length ? pipeline.filter(s => !s.hidden).map(s => [s.status, s.label]) : Object.entries(STATUS_LABEL).filter(([k]) => !['APPLIED'].includes(k))).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      )}

      {/* Two-panel */}
      <div className="np-cand-grid" style={{ display: 'grid', gridTemplateColumns: selectedApplicant ? '1fr 1.15fr' : '1fr 0fr', gap: selectedApplicant ? '16px' : '0', alignItems: 'start' }}>
        {/* Left: applicant cards */}
        <div>
          {applicantsLoading ? (
            <div className="empty-state" style={{ padding: '40px 0' }}><div className="empty-state-icon"><UsersRound size={28} /></div><p className="empty-state-title">Đang tải ứng viên...</p></div>
          ) : filteredApplicants.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon"><UsersRound size={28} /></div>
              <p className="empty-state-title">{applicants.length === 0 ? 'Chưa có ứng viên nào.' : 'Không tìm thấy ứng viên phù hợp.'}</p>
              {applicants.length === 0 && <p className="empty-state-desc">Khi có người ứng tuyển, họ sẽ xuất hiện ở đây.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredApplicants.map((app, idx) => {
                const isSelected = selectedApplicant?.id === app.id;
                const sColor = colorOf(app.status);
                const boosted = isBoosted(app);
                return (
                  <div key={app.id} className="np-cand-row" onClick={() => { setSelectedApplicant(app); setShowRejectInput(false); setRejectReason(''); }}
                    style={{ border: `1.5px solid ${isSelected ? accent : boosted ? '#f59e0b' : 'var(--p-line)'}`, borderRadius: '14px', padding: '14px 16px', background: isSelected ? `${accent}08` : boosted ? 'linear-gradient(90deg, rgba(245,158,11,0.10), var(--p-surface) 42%)' : 'var(--p-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${Math.min(idx * 0.04, 0.3)}s`, boxShadow: isSelected ? `0 0 0 3px ${accent}1a` : boosted ? '0 4px 16px rgba(245,158,11,0.1)' : 'none' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = accent + '55'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = boosted ? '#f59e0b' : 'var(--p-line)'; }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.05rem', color: accent, flexShrink: 0, overflow: 'hidden' }}>
                      {app.avatar_url ? <img src={app.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (getName(app)[0]?.toUpperCase() || 'U')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getName(app)}</strong>
                        {boosted && (
                          <span
                            title={`Ứng viên đã dùng Profile Boost, hiệu lực đến ${boostedUntilLabel(app)}`}
                            style={{ fontSize: '0.68rem', fontWeight: '850', color: '#92400e', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid #f59e0b66', padding: '2px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}
                          >
                            <Crown size={10} /> Đang Boost
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: sColor, background: `${sColor}15`, padding: '1px 7px', borderRadius: '6px', flexShrink: 0 }}>{labelOf(app.status)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                        <span>RS: <strong style={{ color: 'var(--ink)' }}>{app.reputation_score ?? '—'}</strong></span>
                        <span>Lv.<strong style={{ color: 'var(--ink)' }}>{app.current_level ?? '—'}</strong></span>
                        {(app.appliedAt || app.applied_at) && <span>{new Date(app.appliedAt || app.applied_at).toLocaleDateString('vi-VN')}</span>}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: isSelected ? accent : 'var(--muted)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        {selectedApplicant && (
          <div key={selectedApplicant.id} className="np-cand-detail" style={{ border: '1px solid var(--p-line)', borderRadius: '20px', background: 'var(--p-surface)', position: 'sticky', top: '16px', overflow: 'hidden' }}>
            {/* Panel header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--p-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${accent}06` }}>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--p-ink)' }}>Hồ sơ ứng viên</h3>
              <button onClick={() => setSelectedApplicant(null)} className="np-icon-btn" style={{ width: '32px', height: '32px' }} aria-label="Đóng">
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Avatar + name block */}
              <div className="np-di" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.5rem', color: accent, flexShrink: 0, overflow: 'hidden', border: `2px solid ${accent}30` }}>
                  {selectedApplicant.avatar_url ? <img src={selectedApplicant.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (getName(selectedApplicant)[0]?.toUpperCase() || 'U')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: '1.08rem', display: 'block', color: 'var(--ink)', marginBottom: '2px' }}>{getName(selectedApplicant)}</strong>
                  {getEmail(selectedApplicant) && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>{getEmail(selectedApplicant)}</div>}
                  {selectedApplicant.headline && <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--muted)', fontStyle: 'italic' }}>{selectedApplicant.headline}</p>}
                  {(selectedApplicant.school) && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: accent, fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><GraduationCap size={14} /> {selectedApplicant.school}</p>
                  )}
                </div>
              </div>

              {isBoosted(selectedApplicant) && (
                <div className="np-di" style={{ marginBottom: '16px', padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.45)', background: 'linear-gradient(135deg, rgba(254,243,199,0.8), rgba(255,255,255,0.95))', color: '#92400e', display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <Crown size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.82rem', fontWeight: '850' }}>Ứng viên đang sử dụng Profile Boost</strong>
                    <span style={{ display: 'block', marginTop: '2px', fontSize: '0.75rem', color: '#a16207' }}>
                      Hồ sơ được ưu tiên hiển thị đến {boostedUntilLabel(selectedApplicant)}
                    </span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="np-di" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[
                  { label: 'RS', value: selectedApplicant.reputation_score ?? '—', color: '#2563eb' },
                  { label: 'Level', value: selectedApplicant.current_level ?? '—', color: '#7c3aed' },
                  { label: 'EXP', value: selectedApplicant.total_exp ?? '—', color: '#7c3aed' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: '10px 6px', background: `${stat.color}08`, border: `1px solid ${stat.color}20`, borderRadius: '12px' }}>
                    <strong style={{ fontSize: '1.1rem', color: stat.color, display: 'block', lineHeight: 1.2 }}>{stat.value}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: '700' }}>{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Major */}
              {selectedApplicant.major && (
                <div className="np-di" style={{ fontSize: '0.82rem', color: 'var(--p-muted)', marginBottom: '10px', display: 'flex', gap: '6px' }}>
                  <span>Chuyên ngành:</span>
                  <strong style={{ color: 'var(--p-ink)' }}>{selectedApplicant.major}</strong>
                </div>
              )}

              {/* Portfolio button */}
              <a
                className="np-di"
                href={`/portfolio/view/${selectedApplicant.candidateId || selectedApplicant.candidate_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${accent}40`, background: `${accent}08`, color: accent, fontSize: '0.86rem', fontWeight: '800', textDecoration: 'none', marginBottom: '14px', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${accent}16`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${accent}08`; }}
              >
                <ExtLink size={14} /> Xem Portfolio của ứng viên
              </a>

              {/* Cover note */}
              {selectedApplicant.cover_note && (
                <div className="np-di" style={{ padding: '12px 14px', background: 'var(--p-surface-soft)', borderRadius: '10px', fontSize: '0.84rem', color: 'var(--p-ink)', lineHeight: 1.65, marginBottom: '14px', borderLeft: `3px solid ${accent}` }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--p-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thư giới thiệu</p>
                  <span style={{ fontStyle: 'italic' }}>"{selectedApplicant.cover_note}"</span>
                </div>
              )}

              {/* Custom application answers */}
              {(() => {
                let answers = [];
                try { answers = JSON.parse(selectedApplicant.custom_answers || '[]'); } catch { answers = []; }
                if (!Array.isArray(answers) || answers.length === 0) return null;
                return (
                  <div className="np-di" style={{ marginBottom: '14px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--p-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trả lời câu hỏi</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {answers.map((a, i) => (
                        <div key={i} style={{ padding: '10px 12px', background: 'var(--p-surface-soft)', borderRadius: '10px', border: '1px solid var(--p-line)' }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--p-muted)', marginBottom: '2px' }}>{a.label}</div>
                          <div style={{ fontSize: '0.86rem', color: 'var(--p-ink)', lineHeight: 1.5 }}>{a.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Status + applied date */}
              <div className="np-di" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: colorOf(selectedApplicant.status), background: `${colorOf(selectedApplicant.status)}12`, padding: '4px 12px', borderRadius: '8px' }}>
                  {labelOf(selectedApplicant.status)}
                </span>
                {(selectedApplicant.appliedAt || selectedApplicant.applied_at) && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Nộp ngày {new Date(selectedApplicant.appliedAt || selectedApplicant.applied_at).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="np-di">
              {selectedApplicant.status !== 'REJECTED' && selectedApplicant.status !== 'WITHDRAWN' && selectedApplicant.status !== 'COMPLETED' ? (
                showRejectInput ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input placeholder="Lý do từ chối..." value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.86rem', outline: 'none' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="button danger-button" style={{ flex: 1, fontSize: '0.83rem' }} disabled={!rejectReason.trim() || !!actionLoading}
                        onClick={() => handleAction(selectedApplicant.id, 'REJECTED', rejectReason)}>
                        {actionLoading ? '...' : 'Xác nhận từ chối'}
                      </button>
                      <button className="button secondary-button" style={{ fontSize: '0.83rem' }} onClick={() => { setShowRejectInput(false); setRejectReason(''); }}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedApplicant.status !== 'ACCEPTED' && selectedApplicant.status !== 'APPROVED' && (
                      <button className="button primary-button" style={{ fontSize: '0.86rem', gap: '6px', width: '100%' }} disabled={!!actionLoading}
                        onClick={() => handleAction(selectedApplicant.id, 'ACCEPTED')}>
                        <Check size={14} /> Chấp nhận ứng viên
                      </button>
                    )}
                    {isQuest && selectedApplicant.status === 'ACCEPTED' && (
                      <button className="button primary-button" style={{ fontSize: '0.86rem', gap: '6px', background: 'var(--p-navy)', width: '100%' }} disabled={!!actionLoading}
                        onClick={() => handleAction(selectedApplicant.id, 'COMPLETED')}>
                        <Award size={14} /> Đánh dấu hoàn thành (+EXP)
                      </button>
                    )}
                    {!isQuest && selectedApplicant.status !== 'ACCEPTED' && selectedApplicant.status !== 'SHORTLISTED' && (
                      <button className="button secondary-button" style={{ fontSize: '0.86rem', gap: '6px', width: '100%' }} disabled={!!actionLoading}
                        onClick={() => handleAction(selectedApplicant.id, 'SHORTLISTED')}>
                        <Star size={14} /> Đưa vào danh sách ngắn
                      </button>
                    )}
                    {!isQuest && selectedApplicant.status === 'ACCEPTED' && (
                      <button className="button primary-button" style={{ fontSize: '0.86rem', gap: '6px', background: 'var(--p-navy)', width: '100%' }} disabled={!!actionLoading}
                        onClick={() => handleAction(selectedApplicant.id, 'COMPLETED')}>
                        <Award size={14} /> Đánh dấu hoàn thành (+EXP)
                      </button>
                    )}
                    <button className="button danger-button" style={{ fontSize: '0.86rem', width: '100%' }} disabled={!!actionLoading} onClick={() => setShowRejectInput(true)}>
                      Từ chối ứng viên
                    </button>
                  </div>
                )
              ) : selectedApplicant.status === 'COMPLETED' ? (
                <RatingPanel
                  applicationId={isQuest ? null : selectedApplicant.id}
                  questApplicationId={isQuest ? selectedApplicant.id : null}
                  accent={accent}
                />
              ) : (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--p-surface-soft)', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--p-muted)', fontStyle: 'italic' }}>
                    Đơn ứng tuyển này đã kết thúc.
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StarPicker({ value, onChange, readOnly = false, size = 26 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer', lineHeight: 0 }}
            aria-label={`${n} sao`}
          >
            <Star size={size} fill={filled ? '#f59e0b' : 'none'} color={filled ? '#f59e0b' : 'var(--muted)'} />
          </button>
        );
      })}
    </div>
  );
}

/** Khung đánh giá ứng viên cho đơn đã COMPLETED. Tự load đánh giá hiện có. */
function RatingPanel({ applicationId, questApplicationId, accent }) {
  const idKey = { applicationId, questApplicationId };
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null); // bản ghi đã có
  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getRating(idKey)
      .then(data => {
        if (!alive) return;
        setRating(data);
        if (data) { setScore(data.score); setComment(data.comment || ''); }
        else { setEditing(true); }
      })
      .catch(() => { if (alive) setEditing(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, questApplicationId]);

  async function submit() {
    if (score < 1) { setError('Vui lòng chọn số sao.'); return; }
    setBusy(true); setError('');
    try {
      if (rating?.id) {
        await updateRating(rating.id, { score, comment });
      } else {
        await createRating({ ...idKey, score, comment });
      }
      const fresh = await getRating(idKey);
      setRating(fresh);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Không thể lưu đánh giá.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '14px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.84rem' }}>Đang tải đánh giá...</div>;
  }

  return (
    <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--surface-soft)', border: `1px solid ${accent}20` }}>
      <p style={{ margin: '0 0 10px', fontSize: '0.74rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Đánh giá ứng viên
      </p>

      {!editing && rating ? (
        <>
          <StarPicker value={rating.score} readOnly size={24} />
          {rating.comment && (
            <p style={{ margin: '10px 0 0', fontSize: '0.86rem', color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{rating.comment}"
            </p>
          )}
          {rating.score === 5 && (
            <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#16a34a', fontWeight: '700' }}>
              Ứng viên đã được thưởng 2.000 NP cho đánh giá 5 sao.
            </p>
          )}
          {rating.canEdit ? (
            <button onClick={() => setEditing(true)}
              style={{ marginTop: '12px', padding: '7px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
              Sửa đánh giá
            </button>
          ) : (
            <p style={{ margin: '10px 0 0', fontSize: '0.76rem', color: 'var(--muted)' }}>
              Đã quá 3 giờ — không thể sửa.
            </p>
          )}
        </>
      ) : (
        <>
          <StarPicker value={score} onChange={setScore} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Nhận xét về ứng viên (không bắt buộc)..."
            style={{ width: '100%', marginTop: '12px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.86rem', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
          />
          {score === 5 && (
            <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#16a34a', fontWeight: '700' }}>
              Đánh giá 5 sao sẽ thưởng 2.000 NP cho ứng viên.
            </p>
          )}
          {error && <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#dc2626', fontWeight: '600' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button onClick={submit} disabled={busy}
              style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', background: accent, color: '#fff', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}>
              {busy ? 'Đang lưu...' : rating ? 'Lưu thay đổi' : 'Gửi đánh giá'}
            </button>
            {rating && (
              <button onClick={() => { setEditing(false); setScore(rating.score); setComment(rating.comment || ''); setError(''); }} disabled={busy}
                style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                Hủy
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const ROLE_LABELS = { OWNER: 'Chủ sở hữu', MANAGER: 'Quản lý', MEMBER: 'Thành viên' };

function PipelineSettingsView({ setToast }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  useEffect(() => {
    getOrgPipeline()
      .then((data) => setStages(data || []))
      .catch(() => setToast({ type: 'error', message: 'Không tải được quy trình.' }))
      .finally(() => setLoading(false));
  }, [setToast]);

  function patch(i, p) { setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...p } : s))); }
  function reorder(to) {
    setStages((prev) => {
      if (dragIdx === null || dragIdx === to) return prev;
      const a = [...prev]; const [m] = a.splice(dragIdx, 1); a.splice(to, 0, m); return a;
    });
    setDragIdx(null);
    setOverIdx(null);
  }

  async function save() {
    setSaving(true);
    try {
      const saved = await saveOrgPipeline(stages);
      setStages(saved);
      setToast({ type: 'success', message: 'Đã lưu quy trình tuyển dụng.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Lưu thất bại.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="partner-placeholder-pane"><p>Đang tải quy trình...</p></div>;

  return (
    <div className="np-dash" style={{ maxWidth: 760 }}>
      <div className="np-page-head">
        <div className="np-page-head-l">
          <span className="np-page-head-ic"><Filter size={22} /></span>
          <div>
            <p className="np-page-eyebrow">Tùy biến quy trình</p>
            <h2 className="np-page-title">Quy trình tuyển dụng</h2>
          </div>
        </div>
        <button type="button" className="button primary-button" disabled={saving} onClick={save}
          style={{ background: 'var(--p-navy)', borderColor: 'transparent' }}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="np-card">
        <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--p-muted)', lineHeight: 1.55 }}>
          Đổi <strong>tên</strong>, <strong>màu</strong> hoặc <strong>ẩn</strong> các bước duyệt ứng viên cho phù hợp tổ chức. Đây chỉ là cách hiển thị — logic tính điểm vẫn giữ nguyên.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stages.map((s, i) => (
            <div key={s.status}
              className={`np-drag ${dragIdx === i ? 'is-dragging' : ''} ${overIdx === i && dragIdx !== i ? 'is-over' : ''}`}
              onDragOver={(e) => e.preventDefault()} onDragEnter={() => setOverIdx(i)} onDrop={() => reorder(i)}
              style={{ '--np-drag-accent': '#0d1b33', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid var(--p-line)', borderRadius: '12px', background: 'var(--p-surface)', flexWrap: 'wrap', opacity: (dragIdx !== i && s.hidden) ? 0.55 : 1 }}>
              <span className="np-drag-handle" draggable onDragStart={() => setDragIdx(i)} onDragEnd={() => { setDragIdx(null); setOverIdx(null); }} title="Kéo để đổi thứ tự"
                style={{ display: 'flex', alignItems: 'center', color: 'var(--p-muted)', flexShrink: 0 }}>
                <GripVertical size={16} />
              </span>
              <input type="color" value={s.color || '#6366f1'} onChange={(e) => patch(i, { color: e.target.value })}
                title="Màu" style={{ width: '34px', height: '34px', border: '1px solid var(--p-line)', borderRadius: '8px', background: 'none', cursor: 'pointer', flexShrink: 0 }} />
              <input value={s.label} onChange={(e) => patch(i, { label: e.target.value })}
                style={{ flex: 1, minWidth: 160, padding: '9px 12px', borderRadius: '9px', border: '1px solid var(--p-line)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--p-ink)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--p-muted)', fontFamily: 'monospace' }}>{s.status}</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--p-muted)', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!s.hidden} onChange={(e) => patch(i, { hidden: e.target.checked })} style={{ accentColor: '#0d1b33', cursor: 'pointer' }} /> Ẩn
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MembersView({ company, setToast }) {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [busy, setBusy] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(null); // member object pending transfer
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState('');
  const membersNavigate = useNavigate();

  const myRole = company?.myRole || null;
  const canManage = myRole === 'OWNER' || myRole === 'MANAGER';
  const isOwner = myRole === 'OWNER';

  async function handleLeave() {
    setBusy(true);
    try {
      await leaveCompany();
      setToast({ type: 'success', message: 'Bạn đã rời khỏi tổ chức.' });
      membersNavigate('/businesses');
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Rời tổ chức thất bại.' });
      setBusy(false);
      setConfirmLeave(false);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const [m, inv] = await Promise.all([getCompanyMembers(), listCompanyInvitations()]);
      setMembers(m || []);
      setInvitations(inv || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Không thể tải danh sách thành viên.' });
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function handleInvite(event) {
    event.preventDefault();
    if (!inviteEmail.trim()) {
      setToast({ type: 'error', message: 'Nhập email người được mời.' });
      return;
    }
    setBusy(true);
    try {
      const result = await inviteCompanyMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('MEMBER');
      setLastInviteLink(result?.inviteUrl || '');
      setToast({
        type: result?.emailSent ? 'success' : 'error',
        message: result?.emailSent
          ? 'Đã gửi lời mời qua email.'
          : `Đã tạo lời mời nhưng CHƯA gửi được email${result?.emailError ? ` (${result.emailError})` : ''}. Hãy sao chép link mời bên dưới.`,
      });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Gửi lời mời thất bại.' });
    } finally {
      setBusy(false);
    }
  }

  async function runAction(fn, successMsg) {
    setBusy(true);
    try {
      await fn();
      setToast({ type: 'success', message: successMsg });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Thao tác thất bại.' });
    } finally {
      setBusy(false);
      setConfirmTransfer(null);
    }
  }

  if (loading) {
    return <div className="partner-placeholder-pane"><p>Đang tải thành viên...</p></div>;
  }

  const roleTone = (role) =>
    role === 'OWNER' ? { pill: { background: 'rgba(13,27,51,0.08)', color: 'var(--p-ink)' }, av: '#0d1b33' }
      : role === 'MANAGER' ? { pill: { background: 'rgba(37,99,235,0.1)', color: '#2563eb' }, av: '#2563eb' }
        : { pill: { background: 'var(--p-surface-soft)', color: '#5b6472' }, av: '#94a3b8' };
  const initials = (m) => (m.displayName || m.email || '?').trim().slice(0, 2).toUpperCase();

  return (
    <div className="np-dash" style={{ maxWidth: 980 }}>
      {/* Header */}
      <div className="np-page-head">
        <div className="np-page-head-l">
          <span className="np-page-head-ic"><ShieldCheck size={22} /></span>
          <div>
            <p className="np-page-eyebrow">Phân quyền tổ chức</p>
            <h2 className="np-page-title">Thành viên & Ủy quyền</h2>
          </div>
        </div>
        {myRole && myRole !== 'OWNER' && (
          <button type="button" className="button secondary-button" disabled={busy} onClick={() => setConfirmLeave(true)} style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }}>
            <LogOut size={16} /> Rời tổ chức
          </button>
        )}
      </div>

      {/* Invite */}
      {canManage && (
        <div className="np-card">
          <div className="np-section-label"><Send size={16} style={{ color: '#2563eb' }} /> Mời thành viên mới</div>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="np-mem-field"
              type="email"
              placeholder="Email người được mời"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{ flex: '1 1 240px' }}
            />
            <select className="np-mem-field" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="MEMBER">Thành viên</option>
              {isOwner && <option value="MANAGER">Quản lý</option>}
            </select>
            <button type="submit" className="button primary-button" disabled={busy} style={{ background: 'var(--p-navy)', borderColor: 'transparent', minHeight: 46 }}>
              <Send size={16} /> Mời thành viên
            </button>
          </form>

          {lastInviteLink && (
            <div style={{ marginTop: 14, padding: 13, background: 'var(--p-blue-soft)', border: '1px solid rgba(37,99,235,0.18)', borderRadius: 12, fontSize: '0.82rem' }}>
              <strong style={{ color: 'var(--p-ink)' }}>Link lời mời</strong>
              <span style={{ color: 'var(--p-muted)' }}> (gửi thủ công nếu email chưa tới):</span>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ flex: '1 1 280px', wordBreak: 'break-all', background: 'var(--p-surface)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--p-line)', color: 'var(--p-ink)' }}>{lastInviteLink}</code>
                <button
                  type="button"
                  className="button secondary-button"
                  style={{ padding: '8px 14px', minHeight: 0 }}
                  onClick={() => { navigator.clipboard?.writeText(lastInviteLink); setToast({ type: 'success', message: 'Đã sao chép link mời.' }); }}
                >
                  Sao chép
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current members */}
      <div>
        <h3 className="np-section-label"><UsersRound size={16} style={{ color: '#2563eb' }} /> Thành viên hiện tại <span className="cnt">({members.length})</span></h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m) => {
            const tone = roleTone(m.nodeRole);
            return (
              <div key={m.userId} className="np-member-row">
                <span className="np-avatar-sm" style={{ background: tone.av }}>{initials(m)}</span>
                <div className="np-member-main">
                  <strong>{m.displayName || m.email}</strong>
                  <div className="sub">{m.email}{m.joinedAt ? ` · Tham gia ${new Date(m.joinedAt).toLocaleDateString('vi-VN')}` : ''}</div>
                </div>
                <span className="np-role-pill" style={tone.pill}>
                  {m.nodeRole === 'OWNER' && <Crown size={13} />}{ROLE_LABELS[m.nodeRole] || m.nodeRole}
                </span>
                {isOwner && m.nodeRole !== 'OWNER' && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <select
                      className="np-mem-field"
                      value={m.nodeRole}
                      disabled={busy}
                      onChange={(e) => runAction(() => changeMemberRole(m.userId, e.target.value), 'Đã đổi vai trò.')}
                      style={{ padding: '8px 10px', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      <option value="MEMBER">Thành viên</option>
                      <option value="MANAGER">Quản lý</option>
                    </select>
                    <button type="button" className="np-icon-btn" disabled={busy} onClick={() => setConfirmTransfer(m)} title="Chuyển quyền sở hữu">
                      <Crown size={15} />
                    </button>
                    <button type="button" className="np-icon-btn danger" disabled={busy} onClick={() => runAction(() => removeCompanyMember(m.userId), 'Đã gỡ thành viên.')} title="Gỡ khỏi tổ chức">
                      <X size={15} />
                    </button>
                  </div>
                )}
                {myRole === 'MANAGER' && m.nodeRole === 'MEMBER' && (
                  <button type="button" className="np-icon-btn danger" disabled={busy} onClick={() => runAction(() => removeCompanyMember(m.userId), 'Đã gỡ thành viên.')} title="Gỡ khỏi tổ chức">
                    <X size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending invitations */}
      {canManage && (
        <div>
          <h3 className="np-section-label"><Send size={16} style={{ color: '#5b6472' }} /> Lời mời đang chờ <span className="cnt">({invitations.length})</span></h3>
          {invitations.length === 0 ? (
            <p style={{ color: 'var(--p-muted)', fontSize: '0.9rem', margin: 0 }}>Chưa có lời mời nào đang chờ.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {invitations.map((inv) => (
                <div key={inv.id} className="np-member-row pending">
                  <span className="np-avatar-sm" style={{ background: 'var(--p-surface)', border: '1.5px dashed var(--p-line-strong)', color: 'var(--p-muted)' }}><Send size={17} /></span>
                  <div className="np-member-main">
                    <strong>{inv.invitedEmail}</strong>
                    <div className="sub">Vai trò: {ROLE_LABELS[inv.nodeRole] || inv.nodeRole}</div>
                  </div>
                  <button
                    type="button"
                    className="button secondary-button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        const r = await resendCompanyInvitation(inv.id);
                        setLastInviteLink(r?.inviteUrl || '');
                        setToast({
                          type: r?.emailSent ? 'success' : 'error',
                          message: r?.emailSent
                            ? 'Đã gửi lại lời mời qua email.'
                            : `Đã tạo lại link nhưng CHƯA gửi được email${r?.emailError ? ` (${r.emailError})` : ''}. Dùng link bên trên.`,
                        });
                        await load();
                      } catch (err) {
                        setToast({ type: 'error', message: err.message || 'Gửi lại thất bại.' });
                      } finally {
                        setBusy(false);
                      }
                    }}
                    style={{ padding: '8px 14px', minHeight: 0 }}
                  >
                    Gửi lại
                  </button>
                  <button type="button" className="button secondary-button" disabled={busy} onClick={() => runAction(() => revokeCompanyInvitation(inv.id), 'Đã thu hồi lời mời.')} style={{ padding: '8px 14px', minHeight: 0, color: '#dc2626' }}>
                    Thu hồi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmTransfer && (
        <div className="modal-overlay" onClick={() => setConfirmTransfer(null)}>
          <div className="modal-card" style={{ maxWidth: 460, width: '90%', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Chuyển quyền sở hữu</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Bạn sắp chuyển quyền <strong>Chủ sở hữu</strong> cho <strong>{confirmTransfer.displayName || confirmTransfer.email}</strong>.
              Bạn sẽ trở thành <strong>Quản lý</strong>. Hành động này không thể tự hoàn tác.
            </p>
            <div className="modal-footer" style={{ gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="button secondary-button" onClick={() => setConfirmTransfer(null)}>Hủy</button>
              <button type="button" className="button primary-button" disabled={busy} onClick={() => runAction(() => transferOwnership(confirmTransfer.userId), 'Đã chuyển quyền sở hữu.')} style={{ background: 'var(--p-navy)', borderColor: 'transparent' }}>
                Xác nhận chuyển quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmLeave && (
        <div className="modal-overlay" onClick={() => setConfirmLeave(false)}>
          <div className="modal-card" style={{ maxWidth: 460, width: '90%', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Rời khỏi tổ chức</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Bạn sẽ mất quyền truy cập vào tổ chức này. Tài khoản của bạn vẫn còn, và có thể được mời lại sau. Bạn chắc chứ?
            </p>
            <div className="modal-footer" style={{ gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="button secondary-button" onClick={() => setConfirmLeave(false)}>Hủy</button>
              <button type="button" className="button primary-button" disabled={busy} onClick={handleLeave} style={{ background: '#dc2626', borderColor: 'transparent' }}>
                Xác nhận rời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabPlaceholderView({ icon: Icon, title, desc }) {
  return (
    <div className="partner-placeholder-pane">
      <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '20px' }}>
        <Icon size={30} />
      </div>
      <h2 className="partner-placeholder-title">{title}</h2>
      <p className="partner-placeholder-desc">{desc}</p>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Mock data — will be replaced by real API later
─────────────────────────────────────────────── */
const mockTalents = [
  { name: 'Linh Phạm', role: 'Event Staff Lead', proof: '11 minh chứng đã xác thực', rs: 88, tier: 'Gold' },
  { name: 'Bảo Nguyễn', role: 'Campus Marketer', proof: '7 campaign proofs', rs: 79, tier: 'Silver' },
  { name: 'Huy Trần', role: 'Video Editor freelance', proof: '5 project proofs', rs: 74, tier: 'Silver' },
  { name: 'Mai Linh', role: 'Social Media Manager', proof: '9 verified posts', rs: 83, tier: 'Gold' },
];

const mockStats = [
  { label: 'Tin đang đăng', value: '0', icon: BriefcaseBusiness, color: '#2563eb' },
  { label: 'Ứng viên phù hợp', value: '142', icon: UsersRound, color: 'var(--p-ink)' },
  { label: 'Tỉ lệ phản hồi', value: '—', icon: TrendingUp, color: '#16a34a' },
];

const tierColors = { Gold: '#f59e0b', Silver: '#94a3b8', Bronze: '#cd7c40' };

function getPartnerTypeLabel(companyType) {
  if (companyType === 'CLUB') return 'CLB Sinh Viên';
  if (companyType === 'STARTUP') return 'Startup';
  if (companyType === 'AGENCY') return 'Agency';
  if (companyType === 'ENTERPRISE') return 'Doanh Nghiệp';
  if (companyType === 'EVENT_ORGANIZER') return 'Đơn vị tổ chức sự kiện';
  if (companyType === 'SCHOOL') return 'Trường / đơn vị giáo dục';
  return 'Doanh Nghiệp';
}

function getVerificationLabel(status) {
  if (status === 'APPROVED') return 'Đã xác thực';
  if (status === 'REJECTED') return 'Bị từ chối';
  if (status === 'SUSPENDED') return 'Tạm khóa';
  return 'Chờ duyệt';
}

function getVerificationTone(status) {
  if (status === 'APPROVED') return { background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' };
  if (status === 'REJECTED' || status === 'SUSPENDED') return { background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' };
  return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
}

function getTabPath(tabKey) {
  const tab = ALL_TABS.find((item) => item.key === tabKey);
  if (!tab?.route) return DASHBOARD_BASE_PATH;
  return `${DASHBOARD_BASE_PATH}/${tab.route}`;
}

function DetailItem({ label, value, href, onClick }) {
  const content = value || 'Chưa cập nhật';

  return (
    <div className="partner-account-detail-item">
      <span>{label}</span>
      {onClick && value ? (
        <button
          type="button"
          onClick={onClick}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#2563eb',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.92rem',
            fontWeight: '750',
            cursor: 'pointer',
            textDecoration: 'underline',
            textAlign: 'left'
          }}
        >
          {content}
          <ExternalLink size={13} />
        </button>
      ) : href && value ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {content}
          <ExternalLink size={13} />
        </a>
      ) : (
        <strong>{content}</strong>
      )}
    </div>
  );
}

function handleViewDocument(docUrl) {
  if (!docUrl) return;
  if (docUrl.startsWith('data:')) {
    try {
      const parts = docUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)[1];
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.error('Failed to parse document data url:', e);
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<iframe src="${docUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  } else {
    window.open(docUrl, '_blank');
  }
}


/* ───────────────────────────────────────────────
   Sub-components
─────────────────────────────────────────────── */
function PendingView({ company, onRefresh, onTabChange }) {
  const steps = [
    { label: 'Đã đăng ký', done: true },
    { label: 'Đang xét duyệt', active: true },
    { label: 'Bắt đầu tuyển dụng', done: false },
  ];

  return (
    <section className="dashboard-page" style={{ maxWidth: '860px', margin: '32px auto', padding: '0 16px' }}>
      {/* Profile Incomplete Prominent Warning for Invited Partners */}
      {(!company.representativeName || !company.taxCode || !company.representativePhone) && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1.5px dashed #ef4444',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              background: '#ef4444',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '850', color: '#b91c1c' }}>Hồ sơ đối tác chưa hoàn thiện</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.6, fontWeight: '500', marginBottom: '14px' }}>
                Tài khoản của bạn được tạo qua lời mời từ Admin nhưng chưa được điền thông tin doanh nghiệp/tổ chức. 
                Vui lòng nhấp vào nút dưới đây để cập nhật đầy đủ thông tin (Mã số thuế, Người đại diện, SĐT và tải lên Giấy phép hoạt động/xác thực) để gửi Admin phê duyệt.
              </p>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('account')}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'background 0.2s'
                }}
              >
                <UserRound size={16} /> Cập nhật thông tin hồ sơ ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status banner */}
      <div className="b2b-status-banner pending">
        <div className="b2b-status-icon">
          <Clock size={28} />
        </div>
        <div className="b2b-status-copy">
          <h1>Hồ sơ đối tác đang được Admin xét duyệt</h1>
          <p>
            Chào <strong>{company.representativeName}</strong>, đội ngũ nextplease đang đối chiếu tài liệu xác minh của{' '}
            <strong>{company.name}</strong>. Thời gian phê duyệt thường từ <strong>2 – 24 giờ làm việc</strong>.
          </p>
        </div>
        <button
          className="button secondary-button"
          onClick={onRefresh}
          style={{ flexShrink: 0, gap: '8px', fontSize: '0.88rem', padding: '10px 18px' }}
        >
          <RefreshCw size={15} />
          Làm mới
        </button>
      </div>

      {/* Progress tracker */}
      <div className="b2b-progress-track">
        {steps.map((step, i) => (
          <div key={step.label} className={`b2b-progress-step ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
            <div className="b2b-progress-dot">
              {step.done ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <span>{step.label}</span>
            {i < steps.length - 1 && <div className="b2b-progress-line" />}
          </div>
        ))}
      </div>

      {/* Company info card */}
      <div className="panel" style={{ borderRadius: '20px' }}>
        <div className="panel-title">
          <Building size={20} style={{ color: '#2563eb' }} />
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Thông tin hồ sơ đã đăng ký</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', fontSize: '0.9rem' }}>
          {[
            { label: 'Tên tổ chức', value: company.name },
            { label: 'Loại đối tác', value: company.companyType === 'CLUB' ? 'Câu lạc bộ sinh viên' : 'Doanh nghiệp tuyển dụng' },
            company.taxCode && { label: 'Mã số thuế', value: company.taxCode },
            { label: 'Người đại diện', value: company.representativeName },
            { label: 'Số điện thoại', value: company.representativePhone },
          ].filter(Boolean).map((item) => (
            <div key={item.label}>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>{item.label}</span>
              <strong style={{ fontWeight: '700' }}>{item.value}</strong>
            </div>
          ))}
          {company.documentUrl && (
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Tài liệu xác minh</span>
              <button
                type="button"
                onClick={() => handleViewDocument(company.documentUrl)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#2563eb',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'left'
                }}
              >
                <FileText size={14} /> Xem tài liệu <ExternalLink size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Locked feature preview */}
      <div style={{ marginTop: '8px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Sẽ mở khóa sau khi được phê duyệt
        </p>
        <div className="feature-grid" style={{ gap: '14px' }}>
          {[
            { icon: BriefcaseBusiness, label: 'Đăng tin tuyển dụng', desc: 'Tạo Job, Gig, Quest, Event Staff' },
            { icon: UsersRound, label: 'Tìm kiếm Talent', desc: 'Lọc theo RS, kỹ năng, trường học' },
            { icon: MessageSquareText, label: 'Quản lý ứng viên', desc: 'Shortlist, nhắn tin, theo dõi' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="feature-card b2b-locked-card">
                <div className="b2b-locked-overlay"><Lock size={20} /> Chờ phê duyệt</div>
                <Icon size={22} style={{ color: 'var(--muted)' }} />
                <h3 style={{ color: 'var(--muted)' }}>{f.label}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RejectedView({ company, onRefresh }) {
  const [resubmitFile, setResubmitFile] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });

  async function handleResubmit(event) {
    event.preventDefault();
    if (!resubmitFile) {
      setActionStatus({ type: 'error', message: 'Vui lòng chọn tệp minh chứng mới để gửi lại.' });
      return;
    }
    if (resubmitFile.size > 2 * 1024 * 1024) {
      setActionStatus({ type: 'error', message: 'Kích thước tệp quá lớn (yêu cầu dưới 2MB để chạy thử nghiệm).' });
      return;
    }
    setActionStatus({ type: 'loading', message: 'Đang gửi yêu cầu phê duyệt lại...' });
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await resubmitB2bDocument(reader.result);
        setActionStatus({ type: 'success', message: 'Đã gửi lại minh chứng! Đang tải lại...' });
        setTimeout(() => { setActionStatus({ type: 'idle', message: '' }); setResubmitFile(null); onRefresh(); }, 1800);
      } catch (err) {
        setActionStatus({ type: 'error', message: err.message || 'Gửi lại minh chứng thất bại.' });
      }
    };
    reader.onerror = () => {
      setActionStatus({ type: 'error', message: 'Không thể đọc tệp này.' });
    };
    reader.readAsDataURL(resubmitFile);
  }

  return (
    <section className="dashboard-page" style={{ maxWidth: '780px', margin: '32px auto', padding: '0 16px' }}>
      <div className="b2b-status-banner rejected">
        <div className="b2b-status-icon"><AlertTriangle size={28} /></div>
        <div className="b2b-status-copy">
          <h1>Yêu cầu phê duyệt bị từ chối</h1>
          <p>Hồ sơ của <strong>{company.name}</strong> không đủ điều kiện xác thực. Vui lòng đọc lý do bên dưới và gửi lại tài liệu phù hợp.</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <strong style={{ color: '#dc2626', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> Lý do từ chối:
        </strong>
        <p style={{ margin: '10px 0 0', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {company.rejectionReason || 'Tài liệu không rõ ràng hoặc không khớp với thông tin đã điền.'}
        </p>
      </div>

      <div className="panel" style={{ borderRadius: '20px' }}>
        <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
          <FileText size={18} style={{ color: '#2563eb' }} /> Cập nhật lại tài liệu xác thực
        </h3>

        <form onSubmit={handleResubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '2px dashed var(--border, #e4e9f2)', borderRadius: '14px', padding: '32px 20px', cursor: 'pointer', transition: 'border-color 200ms', textAlign: 'center' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border, #e4e9f2)'}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <FileText size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>{resubmitFile ? resubmitFile.name : 'Chọn tệp ảnh hoặc PDF'}</strong>
              <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>Giấy phép kinh doanh hoặc Quyết định CLB rõ nét</span>
            </div>
            <input type="file" required accept="image/*,.pdf" onChange={(e) => setResubmitFile(e.target.files[0])} style={{ display: 'none' }} />
          </label>

          {actionStatus.message && (
            <div className={`register-status ${actionStatus.type}`}>
              {actionStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <p>{actionStatus.message}</p>
            </div>
          )}

          <button type="submit" disabled={actionStatus.type === 'loading'} className="button primary-button"
            style={{ alignSelf: 'flex-start', background: 'var(--p-navy)', borderColor: 'transparent' }}>
            <Send size={16} />
            {actionStatus.type === 'loading' ? 'Đang gửi...' : 'Gửi lại tài liệu kiểm duyệt'}
          </button>
        </form>
      </div>
    </section>
  );
}

function ApprovedView({ company, onTabChange }) {
  const companyTypeLabel = getPartnerTypeLabel(company?.companyType);
  const isClub = company?.companyType === 'CLUB';
  const accent = isClub ? '#ff7a1a' : '#2563eb';
  const accentSoft = isClub ? 'rgba(255,122,26,0.1)' : 'rgba(37,99,235,0.1)';
  const canPost = company?.myRole !== 'MEMBER';
  const postLabel = isClub ? 'Tạo Quest sự kiện' : 'Đăng tin tuyển dụng';

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatsLoading(true);
      try {
        const [jobs, quests] = await Promise.all([
          getOrganizerJobs().catch(() => []),
          getOrganizerQuests().catch(() => []),
        ]);
        const postings = [
          ...(jobs || []).map((j) => ({ ...j, postType: 'JOB', _count: j.applicantsCount ?? j.applicants_count ?? 0 })),
          ...(quests || []).map((q) => ({ ...q, postType: 'QUEST', _count: q.applicantCount ?? q.applicantsCount ?? q.applicants_count ?? 0 })),
        ];
        const openCount = postings.filter((p) => (p.status || '').toUpperCase() === 'OPEN').length;

        const withApps = postings.filter((p) => (p._count || 0) > 0);
        const appLists = await Promise.all(
          withApps.map((p) =>
            (p.postType === 'QUEST' ? getQuestApplicants(p.id) : getJobApplications(p.id))
              .then((d) => (d || []).map((a) => ({ ...a, _postTitle: p.title, _postType: p.postType })))
              .catch(() => [])
          )
        );
        const apps = appLists.flat();
        const isNewStatus = (s) => ['SUBMITTED', 'APPLIED'].includes(s);
        const isDiscStatus = (s) => ['SHORTLISTED', 'ACCEPTED', 'APPROVED'].includes(s);
        const newCount = apps.filter((a) => isNewStatus(a.status)).length;
        const discCount = apps.filter((a) => isDiscStatus(a.status)).length;
        const responded = apps.filter((a) => !isNewStatus(a.status)).length;
        const rate = apps.length ? Math.round((responded / apps.length) * 100) : null;
        const recentSorted = [...apps]
          .sort((a, b) => new Date(b.appliedAt || b.applied_at || 0) - new Date(a.appliedAt || a.applied_at || 0))
          .slice(0, 5);

        if (!alive) return;
        setStats({ openCount, totalPostings: postings.length, total: apps.length, newCount, discCount, rate });
        setRecent(recentSorted);
      } catch {
        if (alive) { setStats({ openCount: 0, totalPostings: 0, total: 0, newCount: 0, discCount: 0, rate: null }); setRecent([]); }
      } finally {
        if (alive) setStatsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const fmt = (v) => (statsLoading ? '…' : String(v ?? 0));

  const kpis = [
    { label: isClub ? 'Quest đang mở' : 'Tin đang đăng', value: fmt(stats?.openCount), icon: isClub ? Star : BriefcaseBusiness, color: accent },
    { label: 'Ứng viên mới', value: fmt(stats?.newCount), icon: UsersRound, color: '#7c3aed' },
    { label: 'Đang trao đổi', value: fmt(stats?.discCount), icon: MessageSquareText, color: 'var(--p-ink)' },
    { label: 'Tỉ lệ phản hồi', value: statsLoading ? '…' : (stats?.rate == null ? '—' : `${stats.rate}%`), icon: TrendingUp, color: '#16a34a' },
  ];

  const quickActions = [
    { icon: isClub ? Star : BriefcaseBusiness, label: postLabel, desc: isClub ? 'Tuyển event staff, marketer' : 'Mô tả công việc & yêu cầu', color: accent, tab: 'create-job', hide: !canPost },
    { icon: FileText, label: 'Quản lý tin đăng', desc: 'Theo dõi & chỉnh sửa tin', color: 'var(--p-ink)', tab: 'manage-jobs' },
    { icon: Search, label: 'Tìm kiếm Talent', desc: 'Lọc theo proof, kỹ năng', color: '#16a34a', tab: 'find-talent' },
    { icon: MessageSquareText, label: 'Quản lý ứng viên', desc: 'Shortlist & theo dõi', color: '#7c3aed', tab: 'candidates' },
  ].filter((a) => !a.hide);

  const hasPosted = (stats?.totalPostings ?? 0) > 0;
  const hasReviewed = (stats?.total ?? 0) > 0;
  const checklist = [
    { done: true, title: 'Hồ sơ đã xác thực', desc: 'Tổ chức của bạn đã được duyệt', tab: 'account' },
    { done: hasPosted, title: isClub ? 'Tạo Quest đầu tiên' : 'Đăng tin đầu tiên', desc: 'Bắt đầu nhận hồ sơ ứng viên', tab: 'create-job', hide: !canPost },
    { done: false, title: 'Mời đồng đội', desc: 'Thêm thành viên & phân quyền', tab: 'members' },
    { done: hasReviewed, title: 'Duyệt ứng viên', desc: 'Xem & shortlist hồ sơ nhận được', tab: 'candidates' },
  ].filter((c) => !c.hide);

  const recName = (a) => a.candidateName || a.candidate_name || a.display_name || 'Ứng viên';

  return (
    <section className="np-dash">
      {/* ── Header ── */}
      <div className="np-dash-head">
        <div className="np-dash-id">
          <div className="np-dash-avatar" style={{ background: accent }}>
            {(company?.name || 'B').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="np-dash-badges">
              <span className="np-badge" style={{ background: accentSoft, color: accent }}>
                {isClub ? <GraduationCap size={13} /> : <Building size={13} />}
                {companyTypeLabel}
              </span>
              <span className="np-badge" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                <BadgeCheck size={13} /> Đã xác thực
              </span>
            </div>
            <h1>{company?.name}</h1>
            <div className="np-dash-meta">
              <span><UserRound size={14} /> {company?.representativeName || '—'}</span>
              {company?.representativePhone ? <span><Send size={13} /> {company.representativePhone}</span> : null}
              {company?.taxCode ? <span><FileText size={13} /> MST: {company.taxCode}</span> : null}
            </div>
          </div>
        </div>
        {canPost ? (
          <div className="np-dash-cta">
            <button className="button primary-button" type="button" onClick={() => onTabChange('create-job')}
              style={{ background: 'var(--p-navy)', borderColor: 'transparent' }}>
              <Plus size={17} /> {postLabel}
            </button>
            <button className="button secondary-button" type="button" onClick={() => onTabChange('find-talent')}>
              <Search size={17} /> Tìm Talent
            </button>
          </div>
        ) : null}
      </div>

      {/* ── KPI row ── */}
      <div className="np-kpi-row">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="np-kpi">
              <div className="np-kpi-icon" style={{ color: k.color, background: `${k.color}14` }}>
                <Icon size={20} />
              </div>
              <div>
                <div className="np-kpi-val">{k.value}</div>
                <div className="np-kpi-lbl">{k.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main grid ── */}
      <div className="np-dash-grid">
        <div className="np-col">
          {/* Quick actions */}
          <div className="np-card">
            <div className="np-card-head">
              <Zap size={18} style={{ color: accent }} />
              <h2>Thao tác nhanh</h2>
            </div>
            <div className="np-quick-grid">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.label} className="np-quick" type="button" onClick={() => onTabChange(a.tab)}>
                    <span className="np-quick-ic" style={{ color: a.color, background: `${a.color}14` }}>
                      <Icon size={19} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <b>{a.label}</b>
                      <small>{a.desc}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="np-card">
            <div className="np-card-head">
              <TrendingUp size={18} style={{ color: accent }} />
              <h2>Hoạt động gần đây</h2>
              {!statsLoading && recent.length > 0 ? (
                <button type="button" className="np-card-tag" style={{ border: 'none', cursor: 'pointer' }} onClick={() => onTabChange('candidates')}>Xem tất cả</button>
              ) : null}
            </div>
            {statsLoading ? (
              <div className="np-empty">
                <div className="np-empty-ic"><Loader2 size={24} className="np-spin" /></div>
                <p style={{ margin: 0 }}>Đang tải hoạt động...</p>
              </div>
            ) : recent.length === 0 ? (
              <div className="np-empty">
                <div className="np-empty-ic"><UsersRound size={26} /></div>
                <h3>Chưa có hoạt động</h3>
                <p>Khi ứng viên nộp hồ sơ hoặc tương tác với tin của bạn, mọi cập nhật sẽ xuất hiện tại đây.</p>
                {canPost ? (
                  <button className="button primary-button" type="button" onClick={() => onTabChange('create-job')}
                    style={{ background: 'var(--p-navy)', borderColor: 'transparent' }}>
                    <Plus size={16} /> {postLabel}
                  </button>
                ) : null}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recent.map((a) => {
                  const sColor = STATUS_COLOR[a.status] || '#6366f1';
                  const when = a.appliedAt || a.applied_at;
                  return (
                    <button key={a.id} type="button" onClick={() => onTabChange('candidates')} className="np-act-row">
                      <span className="np-avatar-sm" style={{ width: 38, height: 38, borderRadius: '50%', background: `${accent}1a`, color: accent, fontSize: '0.82rem' }}>
                        {(recName(a)[0] || 'U').toUpperCase()}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--p-ink)' }}>{recName(a)}</strong>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: sColor, background: `${sColor}15`, padding: '1px 7px', borderRadius: 6 }}>{STATUS_LABEL[a.status] || a.status}</span>
                        </span>
                        <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--p-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a._postTitle}{when ? ` · ${new Date(when).toLocaleDateString('vi-VN')}` : ''}
                        </span>
                      </span>
                      <ChevronRight size={16} style={{ color: 'var(--p-muted)', flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Setup checklist */}
        <div className="np-card">
          <div className="np-card-head">
            <ShieldCheck size={18} style={{ color: '#16a34a' }} />
            <h2>Hoàn tất thiết lập</h2>
          </div>
          <div className="np-checklist">
            {checklist.map((c, i) => (
              <button key={c.title} className={`np-check ${c.done ? 'done' : ''}`} type="button" onClick={() => onTabChange(c.tab)}>
                <span className="np-check-num">
                  {c.done ? <CheckCircle2 size={16} /> : i + 1}
                </span>
                <span className="np-check-txt">
                  <b>{c.title}</b>
                  <small>{c.desc}</small>
                </span>
                <ChevronsRight size={16} className="np-check-arrow" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatVND(value) {
  if (!value) return '';
  const clean = value.toString().replace(/\D/g, '');
  if (!clean) return '';
  return parseInt(clean, 10).toLocaleString('vi-VN');
}

function ManageJobsView({ onTabChange, company }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit mode state
  const [editingJob, setEditingJob] = useState(null); // { postType, data }

  // Delete confirm state
  const [deletingJob, setDeletingJob] = useState(null); // { id, postType, title }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Close confirm state
  const [closingJob, setClosingJob] = useState(null); // { id, postType, title }
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState('');

  // Edit success message
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Detail Modal state
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  async function fetchJobs() {
    setLoading(true);
    try {
      const [jobsData, questsData] = await Promise.all([
        getOrganizerJobs().catch(() => []),
        getOrganizerQuests().catch(() => []),
      ]);
      const merged = [
        ...(questsData || []).map(q => ({ ...q, postType: 'QUEST' })),
        ...(jobsData || []).map(j => ({ ...j, postType: 'JOB' })),
      ];
      setJobs(merged);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tin đã đăng:", err);
      setError(err.message || "Không thể tải danh sách tin tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function handleShowDetails(jobId) {
    setSelectedJobId(jobId);
    setLoadingDetail(true);
    setDetailError(null);
    setSelectedJobDetail(null);
    try {
      const detail = await getJobDetail(jobId);
      setSelectedJobDetail(detail);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết công việc:", err);
      setDetailError("Không thể tải chi tiết công việc này. Vui lòng thử lại.");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleEditClick(e, job) {
    e.stopPropagation();
    try {
      let detail;
      if (job.postType === 'QUEST') {
        detail = await getOrganizerQuestById(job.id);
      } else {
        detail = await getOrganizerJobById(job.id);
      }
      setEditingJob({ postType: job.postType, data: detail });
    } catch (err) {
      console.error('Không thể tải dữ liệu để sửa:', err);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingJob) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      if (deletingJob.postType === 'QUEST') {
        await deleteQuest(deletingJob.id);
      } else {
        await deleteJob(deletingJob.id);
      }
      setDeletingJob(null);
      fetchJobs();
    } catch (err) {
      setDeleteError(err.message || 'Xoá thất bại.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCloseConfirm() {
    if (!closingJob) return;
    setCloseLoading(true);
    setCloseError('');
    try {
      if (closingJob.postType === 'QUEST') {
        await closeQuest(closingJob.id);
      } else {
        await closeJob(closingJob.id);
      }
      setClosingJob(null);
      fetchJobs();
    } catch (err) {
      setCloseError(err.message || 'Đóng thất bại.');
    } finally {
      setCloseLoading(false);
    }
  }

  const CATEGORY_MAP = {
    TECH: 'Công nghệ & Kỹ thuật',
    BUSINESS: 'Kinh tế & Quản lý',
    DESIGN: 'Thiết kế & Nghệ thuật',
    MEDIA: 'Truyền thông & Sự kiện',
    LANGUAGE: 'Ngôn ngữ & Nhân văn',
    OTHER: 'Lĩnh vực khác'
  };

  const JOB_TYPES = {
    INTERNSHIP: 'Thực tập sinh (Internship)',
    PART_TIME: 'Bán thời gian (Part-time)',
    FREELANCE: 'Công việc tự do (Freelance)',
    EVENT_STAFF: 'Nhân sự sự kiện (Event staff)',
    MICRO_INTERNSHIP: 'Thực tập ngắn hạn (Micro-internship)'
  };

  // Compute metrics from jobs list
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => (j.status || '').toLowerCase() === 'pending').length;
  const activeJobs = jobs.filter(j => (j.status || '').toLowerCase() === 'open').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);

  const isPostingExpired = (job) => {
    const dl = job.deadlineAt || job.deadline_at || job.endsAt || job.ends_at;
    return dl ? new Date(dl) < new Date() : false;
  };

  // Filter jobs based on local search & status dropdown
  const filteredJobs = jobs.filter(job => {
    const titleMatch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = (CATEGORY_MAP[job.category] || job.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || categoryMatch;

    let matchesStatus;
    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else if (statusFilter === 'EXPIRED') {
      matchesStatus = isPostingExpired(job);
    } else if (statusFilter === 'OPEN') {
      matchesStatus = (job.status || '').toUpperCase() === 'OPEN' && !isPostingExpired(job);
    } else {
      matchesStatus = (job.status || '').toUpperCase() === statusFilter;
    }
    return matchesSearch && matchesStatus;
  });

  // If editing, show the form instead of the list
  if (editingJob) {
    const wasOpen = (editingJob.data?.status || '').toUpperCase() === 'OPEN';
    const editProps = {
      initialData: editingJob.data,
      onSuccess: () => {
        setEditingJob(null);
        fetchJobs();
        if (wasOpen) setEditSuccessMsg('Đã gửi lại để Admin duyệt.');
      },
      onCancel: () => setEditingJob(null),
    };
    return editingJob.postType === 'QUEST'
      ? <QuestPostForm {...editProps} />
      : <JobPostForm {...editProps} />;
  }

  return (
    <section className="dashboard-page">
      {/* Edit success banner */}
      {editSuccessMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ color: '#15803d', fontWeight: '600', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={15} /> {editSuccessMsg}</span>
          <button onClick={() => setEditSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Close confirm modal */}
      {closingJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '420px', background: 'var(--card-bg-strong, #fff)', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: 'var(--ink)' }}>Xác nhận đóng tin</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Bạn có chắc muốn đóng <strong style={{ color: 'var(--ink)' }}>&ldquo;{closingJob.title}&rdquo;</strong>? Ứng viên sẽ không thể nộp thêm sau khi đóng.
            </p>
            {closeError && <p style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 12px' }}>{closeError}</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleCloseConfirm} disabled={closeLoading} className="button"
                style={{ flex: 1, padding: '10px', background: '#d97706', color: '#fff', borderColor: 'transparent', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {closeLoading ? 'Đang đóng...' : <><Lock size={16} /> Đóng tin</>}
              </button>
              <button onClick={() => { setClosingJob(null); setCloseError(''); }} disabled={closeLoading} className="button secondary-button"
                style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: '700' }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '420px', background: 'var(--card-bg-strong, #fff)', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: 'var(--ink)' }}>Xác nhận xoá</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Bạn có chắc muốn xoá <strong style={{ color: 'var(--ink)' }}>&ldquo;{deletingJob.title}&rdquo;</strong>? Hành động này không thể hoàn tác.
            </p>
            {deleteError && <p style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 12px' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleDeleteConfirm} disabled={deleteLoading} className="button"
                style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', borderColor: 'transparent', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {deleteLoading ? 'Đang xoá...' : <><Trash2 size={16} /> Xoá</>}
              </button>
              <button onClick={() => { setDeletingJob(null); setDeleteError(''); }} disabled={deleteLoading} className="button secondary-button"
                style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: '700' }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Dashboard Metric Row */}
      {!loading && !error && jobs.length > 0 && (
        <div className="b2b-stats-row" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: '28px' }}>
          <div className="b2b-stat-card">
            <div className="b2b-stat-icon" style={{ color: '#2563eb', background: 'rgba(37, 99, 235, 0.08)' }}>
              <FileText size={20} />
            </div>
            <div>
              <strong className="b2b-stat-value">{totalJobs}</strong>
              <span className="b2b-stat-label">Tổng tin đăng</span>
            </div>
          </div>

          <div className="b2b-stat-card">
            <div className="b2b-stat-icon" style={{ color: '#16a34a', background: 'rgba(22, 163, 74, 0.08)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <strong className="b2b-stat-value">{activeJobs}</strong>
              <span className="b2b-stat-label">Đang hoạt động</span>
            </div>
          </div>

          <div className="b2b-stat-card">
            <div className="b2b-stat-icon" style={{ color: 'var(--p-ink)', background: 'rgba(13, 27, 51, 0.08)' }}>
              <Clock size={20} />
            </div>
            <div>
              <strong className="b2b-stat-value">{pendingJobs}</strong>
              <span className="b2b-stat-label">Chờ xét duyệt</span>
            </div>
          </div>

          <div className="b2b-stat-card">
            <div className="b2b-stat-icon" style={{ color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)' }}>
              <UsersRound size={20} />
            </div>
            <div>
              <strong className="b2b-stat-value">{totalApplicants}</strong>
              <span className="b2b-stat-label">Tổng ứng viên</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main list panel */}
      <div className="panel" style={{ borderRadius: '24px', padding: '32px' }}>
        <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Quản lý tin đăng tuyển</h2>
          </div>
          <button
            onClick={() => onTabChange('create-job')}
            className="button primary-button"
            style={{ padding: '10px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--p-navy)', borderColor: 'transparent' }}
          >
            <Plus size={16} /> Đăng tin mới
          </button>
        </div>

        {/* 3. Search and Filter Bar */}
        {!loading && !error && jobs.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Tìm tin tuyển dụng theo tiêu đề hoặc lĩnh vực..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                  height: '42px',
                  fontSize: '0.88rem'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--muted)' }} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                <Filter size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Lọc trạng thái:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  height: '42px',
                  fontSize: '0.88rem',
                  minWidth: '160px'
                }}
              >
                <option value="ALL">Tất cả</option>
                <option value="OPEN">Đang hoạt động</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="EXPIRED">Hết hạn nộp</option>
                <option value="REJECTED">Từ chối</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
            <div className="b2b-loader" style={{ width: '28px', height: '28px', borderTopColor: '#2563eb' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Đang tải danh sách tin đã đăng...</p>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626' }}>
            <AlertTriangle size={20} />
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600' }}>{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px dashed var(--line)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--card-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <FileText size={26} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--ink)' }}>Chưa có tin đăng nào</h3>
              <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: 'var(--muted)' }}>Bạn chưa tạo bất kỳ tin tuyển dụng hay cơ hội làm việc nào.</p>
              <button
                onClick={() => onTabChange('create-job')}
                className="button primary-button"
                style={{ padding: '10px 20px', background: 'var(--p-navy)', borderColor: 'transparent' }}
              >
                Tạo tin đăng đầu tiên
              </button>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '16px', border: '1px dashed var(--line)' }}>
            <Search size={24} style={{ color: 'var(--muted)' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Không tìm thấy tin tuyển dụng nào khớp với điều kiện lọc.</p>
          </div>
        ) : (
          /* Cards Grid Layout */
          <div className="partner-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '16px'
          }}>
            {filteredJobs.map((job) => {
              const statusLower = (job.status || '').toLowerCase();
              const expired = isPostingExpired(job);
              let badgeBg = 'rgba(107, 114, 128, 0.08)';
              let badgeColor = '#6b7280';
              let statusText = job.status;
              let StatusIcon = Clock;

              if (statusLower === 'open' && expired) {
                badgeBg = 'rgba(220, 38, 38, 0.08)';
                badgeColor = '#dc2626';
                statusText = 'Hết hạn';
                StatusIcon = Clock;
              } else if (statusLower === 'open') {
                badgeBg = 'rgba(22, 163, 74, 0.08)';
                badgeColor = '#16a34a';
                statusText = 'Hoạt động';
                StatusIcon = CheckCircle2;
              } else if (statusLower === 'pending') {
                badgeBg = 'rgba(245, 158, 11, 0.08)';
                badgeColor = '#d97706';
                statusText = 'Chờ duyệt';
                StatusIcon = Clock;
              } else if (statusLower === 'rejected') {
                badgeBg = 'rgba(220, 38, 38, 0.08)';
                badgeColor = '#dc2626';
                statusText = 'Từ chối';
                StatusIcon = X;
              } else if (statusLower === 'closed') {
                badgeBg = 'rgba(107, 114, 128, 0.08)';
                badgeColor = '#6b7280';
                statusText = 'Đã đóng';
                StatusIcon = Lock;
              } else if (statusLower === 'draft') {
                badgeBg = 'rgba(107, 114, 128, 0.08)';
                badgeColor = '#6b7280';
                statusText = 'Nháp';
                StatusIcon = Clock;
              }

              return (
                <div
                  key={job.id}
                  onClick={() => handleShowDetails(job.id)}
                  style={{
                    background: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--line)',
                    borderRadius: '20px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                    e.currentTarget.style.borderColor = 'var(--line)';
                  }}
                >
                  <div>
                    {/* Header block with category and status badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        background: 'var(--surface-soft)',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {CATEGORY_MAP[job.category] || job.category}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        background: badgeBg,
                        color: badgeColor,
                      }}>
                        <StatusIcon size={12} />
                        {statusText}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: '800',
                      color: 'var(--ink)',
                      margin: '0 0 12px',
                      lineHeight: 1.4,
                      height: '2.8em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {job.title}
                    </h3>

                    {/* Metadata info */}
                    {(() => {
                      const dl = job.deadlineAt || job.deadline_at || job.endsAt || job.ends_at;
                      const expired = dl ? new Date(dl) < new Date() : false;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building size={14} />
                            <span>{JOB_TYPES[job.jobType] || job.jobType || (job.postType === 'QUEST' ? 'Quest' : '—')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} />
                            <span>Đăng ngày: {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                          </div>
                          {dl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: expired ? '#dc2626' : 'var(--muted)', fontWeight: expired ? '700' : '400' }}>
                              <Calendar size={14} style={{ color: expired ? '#dc2626' : 'var(--muted)', flexShrink: 0 }} />
                              <span>
                                {job.postType === 'QUEST' ? 'Kết thúc' : 'Hạn nộp'}: {new Date(dl).toLocaleDateString('vi-VN')}
                                {expired && <span style={{ marginLeft: '6px', fontSize: '0.76rem', background: 'rgba(220,38,38,0.1)', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>Đã hết hạn</span>}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Rejection reason (admin) */}
                    {statusLower === 'rejected' && (job.rejectionReason || job.rejection_reason) && (
                      <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', padding: '11px 13px', borderRadius: '12px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.22)', marginBottom: '4px' }}>
                        <AlertTriangle size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Lý do từ chối</div>
                          <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--p-ink)' }}>{job.rejectionReason || job.rejection_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer/Stats Block */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UsersRound size={15} style={{ color: '#2563eb' }} />
                        <strong style={{ fontSize: '0.86rem', color: 'var(--ink)' }}>
                          {job.applicantsCount || job.applicantCount || 0} ứng viên
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> Xem chi tiết
                      </span>
                    </div>
                    {/* Edit / Close / Delete action row */}
                    <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleEditClick(e, job)}
                        style={{ flex: 1, padding: '8px 0', borderRadius: '10px', border: '1px solid var(--p-line)', background: 'var(--p-surface)', color: 'var(--p-ink)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Pencil size={15} /> Sửa
                      </button>
                      {(job.status || '').toUpperCase() === 'OPEN' ? (
                        <button onClick={(e) => { e.stopPropagation(); setClosingJob({ id: job.id, postType: job.postType, title: job.title }); setCloseError(''); }}
                          style={{ flex: 1, padding: '8px 0', borderRadius: '10px', border: '1px solid rgba(217,119,6,0.4)', background: 'rgba(217,119,6,0.06)', color: '#d97706', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Lock size={15} /> Đóng
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setDeletingJob({ id: job.id, postType: job.postType, title: job.title }); setDeleteError(''); }}
                          style={{ flex: 1, padding: '8px 0', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.04)', color: '#dc2626', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Trash2 size={15} /> Xoá
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Beautiful Overlay Details Modal */}
      {selectedJobId && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => {
              setSelectedJobId(null);
              setSelectedJobDetail(null);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Modal Content container */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '90%',
                maxWidth: '650px',
                background: 'var(--card-bg-strong, #ffffff)',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                padding: '32px',
                boxSizing: 'border-box',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                color: 'var(--ink)',
                animation: 'scaleIn 0.2s ease-out'
              }}
            >
              {/* Close icon */}
              <button
                onClick={() => {
                  setSelectedJobId(null);
                  setSelectedJobDetail(null);
                }}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-soft)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={18} />
              </button>

              {loadingDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
                  <div className="b2b-loader" style={{ width: '32px', height: '32px', borderTopColor: '#2563eb' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Đang tải chi tiết tin tuyển dụng...</p>
                </div>
              ) : detailError ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: '16px', textAlign: 'center' }}>
                  <AlertTriangle size={36} style={{ color: '#dc2626' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#dc2626' }}>{detailError}</p>
                  <button
                    onClick={() => handleShowDetails(selectedJobId)}
                    className="button primary-button"
                    style={{ padding: '8px 16px', background: '#2563eb', borderColor: 'transparent' }}
                  >
                    Thử lại
                  </button>
                </div>
              ) : selectedJobDetail ? (
                <div>
                  {/* Category */}
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(37,99,235,0.08)',
                    color: '#2563eb',
                    fontSize: '0.76rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '12px'
                  }}>
                    {CATEGORY_MAP[selectedJobDetail.category] || selectedJobDetail.category} / {selectedJobDetail.specialty}
                  </span>

                  {/* Title */}
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.35rem', fontWeight: '800', color: 'var(--ink)', paddingRight: '32px', lineHeight: 1.35 }}>
                    {selectedJobDetail.title}
                  </h3>

                  {/* Metadata Info Card block */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: 'var(--surface-soft)', padding: '18px', borderRadius: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Loại hình:</span>
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700' }}>{JOB_TYPES[selectedJobDetail.jobType] || selectedJobDetail.jobType}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Địa điểm:</span>
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700' }}>{selectedJobDetail.isRemote ? 'Làm việc từ xa (Remote)' : (selectedJobDetail.location || 'Chưa cập nhật')}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>
                        {(selectedJobDetail.postType === 'QUEST' || selectedJobDetail.isQuest) ? 'Phần thưởng:' : 'Thù lao / Phụ cấp:'}
                      </span>
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700', color: '#16a34a' }}>
                        {(selectedJobDetail.postType === 'QUEST' || selectedJobDetail.isQuest)
                          ? `+${selectedJobDetail.expReward || 0} EXP${selectedJobDetail.npReward ? ` · +${selectedJobDetail.npReward} NP` : ''}`
                          : (selectedJobDetail.compensation ? `${formatVND(selectedJobDetail.compensation)} VND` : 'Thỏa thuận')}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Số lượng chỉ tiêu:</span>
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700' }}>{selectedJobDetail.capacity ? `${selectedJobDetail.capacity} chỉ tiêu` : 'Không giới hạn'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Yêu cầu uy tín tối thiểu:</span>
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700', color: '#2563eb' }}>{selectedJobDetail.minReqRs} RS</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Hạn nộp hồ sơ:</span>
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--p-ink)' }}>
                        {selectedJobDetail.deadlineAt ? new Date(selectedJobDetail.deadlineAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Không giới hạn'}
                      </strong>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--muted)' }}>Trạng thái:</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      background:
                        selectedJobDetail.status?.toLowerCase() === 'open' ? 'rgba(22, 163, 74, 0.08)' :
                        selectedJobDetail.status?.toLowerCase() === 'pending' ? 'rgba(245, 158, 11, 0.08)' :
                        selectedJobDetail.status?.toLowerCase() === 'rejected' ? 'rgba(220, 38, 38, 0.08)' :
                        'rgba(107, 114, 128, 0.08)',
                      color:
                        selectedJobDetail.status?.toLowerCase() === 'open' ? '#16a34a' :
                        selectedJobDetail.status?.toLowerCase() === 'pending' ? '#d97706' :
                        selectedJobDetail.status?.toLowerCase() === 'rejected' ? '#dc2626' :
                        '#6b7280',
                    }}>
                      {selectedJobDetail.status?.toLowerCase() === 'open' ? 'Hoạt động' :
                       selectedJobDetail.status?.toLowerCase() === 'pending' ? 'Chờ duyệt' :
                       selectedJobDetail.status?.toLowerCase() === 'rejected' ? 'Từ chối' : 'Đã đóng'}
                    </span>
                  </div>

                  {/* Rejection reason (admin) */}
                  {selectedJobDetail.status?.toLowerCase() === 'rejected' && (selectedJobDetail.rejectionReason || selectedJobDetail.rejection_reason) && (
                    <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-start', padding: '14px 16px', borderRadius: '14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', marginBottom: '24px' }}>
                      <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>Lý do bị từ chối</div>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--ink)' }}>{selectedJobDetail.rejectionReason || selectedJobDetail.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Required Skills Section */}
                  {selectedJobDetail.skills && selectedJobDetail.skills.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Yêu cầu kỹ năng
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedJobDetail.skills.map((s, idx) => (
                          <span key={idx} style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'var(--surface-soft)',
                            border: '1px solid var(--line)',
                            fontSize: '0.82rem',
                            color: 'var(--ink)'
                          }}>
                            <strong style={{ color: '#2563eb', marginRight: '4px' }}>{s.skillName}</strong>
                            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 'bold' }}>
                              ({s.requiredLevel === 'BEGINNER' ? 'Cơ bản' :
                                s.requiredLevel === 'INTERMEDIATE' ? 'Trung bình' :
                                s.requiredLevel === 'ADVANCED' ? 'Nâng cao' : 'Chuyên gia'})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom application questions */}
                  {selectedJobDetail.formFields && selectedJobDetail.formFields.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Câu hỏi thêm cho ứng viên ({selectedJobDetail.formFields.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedJobDetail.formFields.map((f, idx) => {
                          const typeLabel = f.fieldType === 'TEXTAREA' ? 'Văn bản dài' : f.fieldType === 'SELECT' ? 'Chọn 1 đáp án' : 'Văn bản ngắn';
                          const opts = f.fieldType === 'SELECT' ? (f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean) : [];
                          return (
                            <div key={f.id || idx} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563eb' }}>{idx + 1}.</span>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>{f.label}</strong>
                                {f.required && <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#dc2626', background: 'rgba(220,38,38,0.08)', padding: '2px 7px', borderRadius: '999px' }}>Bắt buộc</span>}
                                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--muted)', background: 'var(--bg)', border: '1px solid var(--line)', padding: '2px 7px', borderRadius: '999px' }}>{typeLabel}</span>
                              </div>
                              {opts.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '7px' }}>
                                  {opts.map((o, i) => (
                                    <span key={i} style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--ink)', background: 'var(--bg)', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: '6px' }}>{o}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Job Description (JD) */}
                  <div style={{ marginBottom: '8px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Chi tiết công việc (JD)
                    </h4>
                    <div style={{
                      background: 'var(--surface-soft)',
                      padding: '20px',
                      borderRadius: '16px',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: '1px solid var(--line)'
                    }}>
                      {selectedJobDetail.description}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function AccountDetailView({ account, company, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [agreeProvideTaxInfo, setAgreeProvideTaxInfo] = useState(Boolean(company?.taxCode));
  const [formData, setFormData] = useState({
    companyName: company?.name || '',
    companyType: company?.companyType || 'ENTERPRISE',
    taxCode: company?.taxCode || '',
    representativeName: company?.representativeName || '',
    representativePhone: company?.representativePhone || '',
    websiteUrl: company?.websiteUrl || '',
    fanpageUrl: company?.fanpageUrl || '',
    description: company?.description || '',
    documentUrl: company?.documentUrl || '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.name || '',
        companyType: company.companyType || 'ENTERPRISE',
        taxCode: company.taxCode || '',
        representativeName: company.representativeName || '',
        representativePhone: company.representativePhone || '',
        websiteUrl: company.websiteUrl || '',
        fanpageUrl: company.fanpageUrl || '',
        description: company.description || '',
        documentUrl: company.documentUrl || '',
      });
      setAgreeProvideTaxInfo(Boolean(company.taxCode));
    }
  }, [company]);

  const companyTypeLabel = getPartnerTypeLabel(company?.companyType);
  const verificationTone = getVerificationTone(company?.verificationStatus);

  function handleInputChange(e) {
    const { name, value } = e.target;
    if (name === 'representativePhone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 11);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setActionStatus({ type: 'error', message: 'Kích thước tệp quá lớn (yêu cầu dưới 2MB).' });
      return;
    }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, documentUrl: reader.result }));
      setActionStatus({ type: 'idle', message: '' });
    };
    reader.onerror = () => {
      setActionStatus({ type: 'error', message: 'Không thể đọc tệp này.' });
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setActionStatus({ type: 'error', message: 'Tên tổ chức không được để trống.' });
      return;
    }
    if (!formData.representativeName.trim()) {
      setActionStatus({ type: 'error', message: 'Tên người đại diện không được để trống.' });
      return;
    }
    if (!formData.representativePhone.trim()) {
      setActionStatus({ type: 'error', message: 'Số điện thoại không được để trống.' });
      return;
    }
    if (!/^[0-9]{10,11}$/.test(formData.representativePhone)) {
      setActionStatus({ type: 'error', message: 'Số điện thoại liên hệ phải chứa từ 10 đến 11 chữ số.' });
      return;
    }
    if (agreeProvideTaxInfo && !formData.taxCode.trim()) {
      setActionStatus({ type: 'error', message: 'Vui lòng nhập Mã số thuế khi đã đồng ý cung cấp.' });
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 30) {
      setActionStatus({ type: 'error', message: 'Mô tả tổ chức không được để trống và phải có tối thiểu 30 ký tự.' });
      return;
    }

    setActionStatus({ type: 'loading', message: 'Đang cập nhật hồ sơ...' });

    try {
      await updateB2bProfile({
        ...formData,
        taxCode: agreeProvideTaxInfo ? formData.taxCode.trim() : null
      });
      setActionStatus({ type: 'success', message: 'Cập nhật hồ sơ đối tác thành công! Hồ sơ đang chờ duyệt.' });
      setTimeout(() => {
        setIsEditing(false);
        setUploadedFile(null);
        setActionStatus({ type: 'idle', message: '' });
        onRefresh();
      }, 2000);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Cập nhật hồ sơ thất bại.' });
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setUploadedFile(null);
    setActionStatus({ type: 'idle', message: '' });
    setFormData({
      companyName: company?.name || '',
      companyType: company?.companyType || 'ENTERPRISE',
      taxCode: company?.taxCode || '',
      representativeName: company?.representativeName || '',
      representativePhone: company?.representativePhone || '',
      websiteUrl: company?.websiteUrl || '',
      fanpageUrl: company?.fanpageUrl || '',
      description: company?.description || '',
      documentUrl: company?.documentUrl || '',
    });
    setAgreeProvideTaxInfo(Boolean(company?.taxCode));
  }

  return (
    <section className="dashboard-page partner-account-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="partner-account-hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div className="b2b-company-avatar" style={{ boxShadow: '0 4px 12px rgba(13,27,51,0.1)' }}>
            {(company?.name || account?.email || 'P').slice(0, 2).toUpperCase()}
          </div>
          <div className="partner-account-hero-copy">
            <span className="b2b-type-badge" style={{ ...verificationTone, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <BadgeCheck size={14} />
              {getVerificationLabel(company?.verificationStatus)}
            </span>
            <h1 style={{ margin: '8px 0 2px', fontSize: '1.75rem', fontWeight: '800', color: 'var(--p-ink)' }}>{company?.name || 'Thông tin đối tác'}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{account?.email || 'Email tài khoản sẽ hiển thị sau khi đồng bộ đăng nhập.'}</p>
          </div>
        </div>
        {!isEditing && (
          company?.myRole === 'OWNER' ? (
            <button className="button primary-button" onClick={() => setIsEditing(true)} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: 'var(--p-navy)', color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Pencil size={15} /> Chỉnh sửa hồ sơ
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', background: 'var(--p-surface-soft)', padding: '8px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '600' }}>
              <Lock size={14} style={{ color: '#f59e0b' }} />
              <span>Chỉ Chủ sở hữu được sửa</span>
            </div>
          )
        )}
      </div>

      <div className="partner-account-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0px' }}>
        <section className="panel partner-account-panel" style={{ padding: '28px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', border: '1px solid var(--line)' }}>
          <div className="panel-title" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building size={22} style={{ color: '#2563eb' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '750', margin: 0 }}>Hồ sơ đối tác</h2>
            </div>
            {isEditing && (
              <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold', background: '#fef3c7', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                * Sau khi lưu, hồ sơ sẽ được gửi lại cho Admin xét duyệt
              </span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Tên tổ chức *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Loại đối tác *</label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', height: '42px', cursor: 'pointer' }}
                    required
                  >
                    <option value="CLUB">CLB Sinh Viên</option>
                    <option value="STARTUP">Startup</option>
                    <option value="AGENCY">Agency</option>
                    <option value="ENTERPRISE">Doanh Nghiệp</option>
                    <option value="EVENT_ORGANIZER">Đơn vị tổ chức sự kiện</option>
                    <option value="SCHOOL">Trường / đơn vị giáo dục</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Mã số thuế</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      name="taxCode"
                      placeholder={agreeProvideTaxInfo ? "Nhập mã số thuế" : "Cần tích đồng ý bên dưới để điền"}
                      value={formData.taxCode}
                      disabled={!agreeProvideTaxInfo}
                      onChange={handleInputChange}
                      className="input-field"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)',
                        background: agreeProvideTaxInfo ? 'var(--bg)' : '#f8fafc',
                        color: 'var(--ink)',
                        cursor: agreeProvideTaxInfo ? 'text' : 'not-allowed',
                        opacity: agreeProvideTaxInfo ? 1 : 0.6
                      }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', userSelect: 'none', color: 'var(--muted)', width: 'fit-content' }}>
                      <input
                        type="checkbox"
                        checked={agreeProvideTaxInfo}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAgreeProvideTaxInfo(checked);
                          if (!checked) {
                            setFormData((prev) => ({ ...prev, taxCode: '' }));
                          }
                        }}
                        style={{ width: '15px', height: '15px', accentColor: '#2563eb', cursor: 'pointer' }}
                      />
                      <span>Đồng ý cung cấp thông tin MST</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Người đại diện *</label>
                  <input
                    type="text"
                    name="representativeName"
                    value={formData.representativeName}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Số điện thoại *</label>
                  <input
                    type="text"
                    name="representativePhone"
                    placeholder="Chỉ nhập số, từ 10-11 ký tự"
                    value={formData.representativePhone}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Website URL</label>
                  <input
                    type="url"
                    name="websiteUrl"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Fanpage URL</label>
                  <input
                    type="url"
                    name="fanpageUrl"
                    placeholder="https://facebook.com/..."
                    value={formData.fanpageUrl}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Tài liệu xác minh</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', border: '1px dashed var(--line)', borderRadius: '10px', background: 'var(--bg)', cursor: 'pointer', height: '42px', boxSizing: 'border-box', transition: 'border-color 0.2s' }}>
                    <FileText size={18} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {uploadedFile ? uploadedFile.name : (formData.documentUrl ? 'Đã tải lên tài liệu' : 'Chọn tệp ảnh hoặc PDF')}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Mô tả tổ chức *</label>
                  <span style={{ fontSize: '0.82rem', color: (formData.description?.length || 0) < 30 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                    {(formData.description?.length || 0)} / tối thiểu 30 ký tự
                  </span>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Nhập thông tin chi tiết về tổ chức của bạn (tối thiểu 30 ký tự)..."
                  className="input-field"
                  style={{ padding: '12px 14px', borderRadius: '10px', border: (formData.description?.length || 0) < 30 ? '1px solid #fca5a5' : '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', resize: 'vertical' }}
                  required
                />
              </div>

              {actionStatus.message && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: actionStatus.type === 'success' ? 'rgba(22,163,74,0.1)' : (actionStatus.type === 'error' ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.06)'), color: actionStatus.type === 'success' ? '#16a34a' : (actionStatus.type === 'error' ? '#dc2626' : '#2563eb'), fontWeight: '500' }}>
                  {actionStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{actionStatus.message}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" disabled={actionStatus.type === 'loading'} className="button primary-button" style={{ background: 'var(--p-navy)', borderColor: 'transparent', borderRadius: '12px', padding: '12px 24px', fontWeight: '600' }}>
                  Lưu thay đổi
                </button>
                <button type="button" onClick={handleCancel} className="button secondary-button" style={{ borderRadius: '12px', padding: '12px 24px' }}>
                  Hủy bỏ
                </button>
              </div>
            </form>
          ) : (
            <div className="partner-account-detail-grid">
              <DetailItem label="Tên tổ chức" value={company?.name} />
              <DetailItem label="Loại đối tác" value={companyTypeLabel} />
              <DetailItem
                label="Mã số thuế"
                value={company?.taxCode || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '500' }}>Chưa cung cấp</span>}
              />
              <DetailItem label="Người đại diện" value={company?.representativeName} />
              <DetailItem label="Số điện thoại" value={company?.representativePhone} />
              <DetailItem label="Website" value={company?.websiteUrl} href={company?.websiteUrl} />
              <DetailItem label="Fanpage" value={company?.fanpageUrl} href={company?.fanpageUrl} />
              <DetailItem
                label="Tài liệu xác minh"
                value={
                  company?.documentUrl ? (
                    company?.myRole === 'OWNER' ? (
                      'Xem tài liệu'
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '600' }}>
                        <Lock size={13} style={{ color: '#f59e0b' }} /> Đã tải lên (Chỉ Chủ sở hữu được xem)
                      </span>
                    )
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '500' }}>Chưa cập nhật</span>
                  )
                }
                onClick={company?.documentUrl && company?.myRole === 'OWNER' ? () => handleViewDocument(company.documentUrl) : null}
              />
            </div>
          )}
        </section>
      </div>

      {!isEditing && company?.description ? (
        <section className="panel partner-account-panel" style={{ padding: '28px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', border: '1px solid var(--line)' }}>
          <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '16px' }}>
            <FileText size={22} style={{ color: '#16a34a' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '750', margin: 0 }}>Mô tả tổ chức</h2>
          </div>
          <p className="partner-account-description" style={{ fontSize: '0.95rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{company.description}</p>
        </section>
      ) : null}
    </section>
  );
}

/* ───────────────────────────────────────────────
   Main component
─────────────────────────────────────────────── */
export function BusinessPage() {
  const navigate = useNavigate();
  const { tabSlug = '' } = useParams();
  const [company, setCompany] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noOrg, setNoOrg] = useState(false);
  const [toast, setToast] = useState({ type: 'idle', message: '' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);
  const activeTab = TAB_BY_ROUTE[tabSlug] || 'dashboard';

  async function fetchCompanyData() {
    setError(null);
    setNoOrg(false);
    if (!isSupabaseConfigured) {
      setAccount({
        appUserId: 'demo-app-user',
        supabaseUserId: 'demo-supabase-user',
        email: 'partner.demo@nextplease.vn',
        status: 'ACTIVE',
        roles: ['employer_free'],
      });
      setCompany({
        id: 'demo-company',
        ownerUserId: 'demo-app-user',
        name: 'FPT Software (Demo)',
        companyType: 'SME',
        taxCode: '0101234567',
        description: 'Tài khoản demo dành cho đối tác tuyển dụng trên nextplease.',
        websiteUrl: 'https://nextplease.vn',
        representativeName: 'Phat Tai',
        representativePhone: '0987654321',
        verificationStatus: 'APPROVED',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [companyData, accountData] = await Promise.all([
        getMyCompany(),
        getCurrentUser(),
      ]);
      setCompany(companyData);
      setAccount(accountData);
    } catch (err) {
      console.error('Lỗi khi tải thông tin công ty/CLB:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        navigate('/business/login');
      } else if (status === 404) {
        // Authenticated, but the account no longer belongs to any organization.
        setNoOrg(true);
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải thông tin đối tác.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/business/login');
  }

  function handleTabChange(tabKey) {
    navigate(getTabPath(tabKey));
  }

  useEffect(() => {
    fetchCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tabSlug && !TAB_BY_ROUTE[tabSlug]) {
      navigate(DASHBOARD_BASE_PATH, { replace: true });
    }
  }, [navigate, tabSlug]);

  /* Auto-dismiss toast notifications */
  useEffect(() => {
    if (toast.message && toast.type !== 'loading') {
      const timer = setTimeout(() => {
        setToast({ type: 'idle', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  /* Loading */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="b2b-loader" />
        <span style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải thông tin đối tác...</span>
      </div>
    );
  }

  /* Account no longer belongs to any organization (removed / left / ownership transferred away) */
  if (noOrg) {
    return (
      <section style={{ maxWidth: '560px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="panel" style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(37,99,235,0.2)' }}>
          <Lock size={40} style={{ color: '#2563eb', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Bạn không còn thuộc tổ chức nào</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>
            Tài khoản của bạn hiện không có quyền truy cập tổ chức Doanh nghiệp/CLB nào
            (có thể bạn đã rời tổ chức hoặc bị gỡ quyền). Nếu cho rằng đây là nhầm lẫn,
            hãy liên hệ Chủ sở hữu/Quản lý của tổ chức để được mời lại.
          </p>
          <button className="button primary-button" onClick={handleLogout}
            style={{ background: 'var(--p-navy)', borderColor: 'transparent' }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </section>
    );
  }

  /* Error */
  if (error) {
    return (
      <section style={{ maxWidth: '560px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="panel" style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(220,38,38,0.2)' }}>
          <AlertTriangle size={40} style={{ color: '#dc2626', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Không thể tải dữ liệu</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>{error}</p>
          <button className="button primary-button" onClick={fetchCompanyData}
            style={{ background: 'var(--p-navy)', borderColor: 'transparent' }}>
            <RefreshCw size={16} /> Thử lại
          </button>
        </div>
      </section>
    );
  }

  const companyTypeLabel = getPartnerTypeLabel(company?.companyType);

  function renderContent() {
    if (activeTab === 'account') {
      return <AccountDetailView account={account} company={company} onRefresh={fetchCompanyData} />;
    }

    if (company?.verificationStatus === 'PENDING') {
      return <PendingView company={company} onRefresh={fetchCompanyData} onTabChange={handleTabChange} />;
    }
    if (company?.verificationStatus === 'REJECTED') {
      return <RejectedView company={company} onRefresh={fetchCompanyData} />;
    }

    /* verificationStatus === 'APPROVED' */
    switch (activeTab) {
      case 'dashboard':
        return <ApprovedView company={company} onTabChange={handleTabChange} />;
      case 'create-job':
        if (company?.myRole === 'MEMBER') {
          return (
            <TabPlaceholderView
              icon={Lock}
              title="Không có quyền đăng tin"
              desc="Với vai trò Thành viên, bạn có thể xem tin đăng và duyệt ứng viên, nhưng không thể tạo tin mới. Hãy liên hệ Chủ sở hữu hoặc Quản lý của tổ chức."
            />
          );
        }
        return company?.companyType === 'CLUB'
          ? <QuestPostForm onSuccess={() => handleTabChange('manage-jobs')} onCancel={() => handleTabChange('manage-jobs')} />
          : <JobPostForm onSuccess={() => handleTabChange('manage-jobs')} onCancel={() => handleTabChange('manage-jobs')} />;
      case 'manage-jobs':
        return <ManageJobsView onTabChange={handleTabChange} company={company} />;
      case 'find-talent':
        return (
          <TabPlaceholderView
            icon={Search}
            title="Tìm kiếm Talent"
            desc="Hệ thống lọc thông minh theo trường học, nhóm kỹ năng chuyên môn, minh chứng thực tế và Reputation Score giúp bạn kết nối nhanh nhất."
          />
        );
      case 'candidates':
        return <CandidatesView />;
      case 'members':
        return <MembersView company={company} setToast={setToast} />;
      case 'pipeline':
        return <PipelineSettingsView setToast={setToast} />;
      default:
        return <ApprovedView company={company} onTabChange={handleTabChange} />;
    }
  }

  return (
    <div className={`partner-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <NotificationBell accent="#2563eb" />
      {/* ── Sidebar ── */}
      <aside className="partner-sidebar">
        <div className="partner-sidebar-header">
          <div className="partner-sidebar-brand">
            <span className="partner-sidebar-logo">next please<span className="np-dot">:</span></span>
            <span className="partner-sidebar-tag">Partner</span>
          </div>
          <button
            aria-label={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            className="partner-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            type="button"
          >
            {isSidebarCollapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          </button>
        </div>

        {/* Profile Card */}
        <div className="partner-sidebar-profile">
          <div className="partner-profile-avatar" style={{ background: company?.companyType === 'CLUB' ? '#ff7a1a' : '#0d1b33' }}>
            {(company?.name || 'P').slice(0, 2).toUpperCase()}
          </div>
          <div className="partner-profile-info">
            <span className="partner-profile-name" title={company?.name}>{company?.name}</span>
            <span className="partner-profile-role">{companyTypeLabel}</span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 'bold',
              marginTop: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              width: 'fit-content',
              ...getVerificationTone(company?.verificationStatus)
            }}>
              {getVerificationLabel(company?.verificationStatus)}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="partner-nav-menu">
          {SIDEBAR_TABS
            .filter((tab) => !(tab.key === 'create-job' && company?.myRole === 'MEMBER'))
            .map((tab) => {
            const Icon = tab.icon;
            const isLocked = company?.verificationStatus !== 'APPROVED' && tab.lockable;
            const isActive = !isLocked && activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (isLocked) {
                    setToast({ type: 'error', message: 'Hồ sơ đối tác chưa được phê duyệt. Vui lòng đợi Admin xác thực!' });
                    return;
                  }
                  handleTabChange(tab.key);
                }}
                className={`partner-nav-item ${isActive ? 'active' : ''} ${isActive && company?.companyType === 'CLUB' ? 'club-active' : ''} ${isLocked ? 'locked' : ''}`}
                style={{ position: 'relative' }}
                title={tab.label}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {isLocked && <Lock size={13} style={{ marginLeft: 'auto', color: 'var(--muted)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="partner-sidebar-footer">
          <button
            className={`partner-nav-item ${activeTab === ACCOUNT_TAB.key ? 'active' : ''} ${activeTab === ACCOUNT_TAB.key && company?.companyType === 'CLUB' ? 'club-active' : ''}`}
            onClick={() => handleTabChange(ACCOUNT_TAB.key)}
            title={ACCOUNT_TAB.label}
            type="button"
          >
            <UserRound size={18} />
            <span>{ACCOUNT_TAB.label}</span>
          </button>
          <button className="partner-nav-item partner-logout-item" onClick={handleLogout} title="Đăng xuất" type="button">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className="partner-main-container">
        <div className="partner-view-pane">
          <div key={activeTab} className="partner-view-anim">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast.message && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          ) : (
            <AlertTriangle size={18} style={{ color: '#dc2626' }} />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast({ type: 'idle', message: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '8px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
