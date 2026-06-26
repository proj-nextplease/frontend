/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.js';
import { NotificationBell } from '../components/NotificationBell.jsx';
import {
  getPendingB2bRegistrations,
  approveB2bRegistration,
  rejectB2bRegistration,
  provisionCompany,
} from '../api/b2bApi.js';
import {
  getAdminStats,
  getAdminUsers,
  getAdminJobs,
  getAdminAuditLogs,
  approveJob,
  rejectJob,
  updateUserStatus,
  deleteUserAccount,
  getActiveFraudFlags,
  resolveFraudFlag,
  getSystemConfigs,
  updateSystemConfig,
  claimReview,
  unclaimReview,
  updateReviewNotes,
} from '../api/adminApi.js';
import { getJobDetail } from '../api/jobApi.js';
import { getAllVerificationSubmissions, approveCredential, rejectCredential } from '../api/credentialApi.js';
import {
  AlertCircle,
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Award,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
  Users,
  BarChart2,
  ListFilter,
  CheckCircle,
  Activity,
  Server,
  Settings,
  Save,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ADMIN_BASE_PATH = '/nextplease-admin-portal/b2b-reviews';

const SIDEBAR_TABS = [
  { key: 'OVERVIEW', route: 'overview', label: 'Tổng quan hệ thống', icon: BarChart2 },
  { key: 'USERS', route: 'users', label: 'Quản lý người dùng', icon: Users },
  { key: 'B2B_REVIEWS', route: 'b2b-partners', label: 'Duyệt đối tác B2B', icon: Building, badgeCount: true },
  { key: 'PROVISION', route: 'provision', label: 'Cấp quyền tổ chức', icon: Building },
  {
    key: 'JOBS', route: 'jobs', label: 'Quản lý đăng tin', icon: FileText, badgeCount: true,
    subItems: [
      { key: 'JOBS_NEW', subRoute: 'new', label: 'Quản lý tin mới', icon: Clock },
      { key: 'JOBS_ALL', subRoute: 'all', label: 'Quản lý tin', icon: FileText },
    ],
  },
  {
    key: 'VERIF_QUEUE', route: 'verification-queue', label: 'Hàng chờ xác thực', icon: ShieldCheck, badgeCount: true,
    subItems: [
      { key: 'VERIF_PENDING', subRoute: 'pending', label: 'Xác thực', icon: ShieldCheck },
      { key: 'VERIF_MANAGE', subRoute: 'manage', label: 'Quản lý minh chứng', icon: FileText },
    ],
  },
  { key: 'FRAUD_FLAGS', route: 'fraud-flags', label: 'Cờ gian lận', icon: ShieldAlert },
  { key: 'AUDIT_LOGS', route: 'audit-logs', label: 'Ghi nhận hệ thống', icon: Activity },
  { key: 'SYSTEM_CONFIG', route: 'system-config', label: 'Cấu hình hệ thống', icon: Settings },
];

const ROUTE_TO_TAB = SIDEBAR_TABS.reduce((acc, tab) => {
  acc[tab.route] = tab.key;
  return acc;
}, {});

function getAdminTabPath(tabKey, subRoute) {
  const tab = SIDEBAR_TABS.find((t) => t.key === tabKey);
  if (!tab) return ADMIN_BASE_PATH;
  const base = `${ADMIN_BASE_PATH}/${tab.route}`;
  return subRoute ? `${base}/${subRoute}` : base;
}

const B2B_FILTER_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'SME', label: 'Doanh nghiệp' },
  { key: 'CLUB', label: 'CLB / Tổ chức' },
];

const USER_ROLE_FILTERS = [
  { key: 'ALL', label: 'Tất cả vai trò' },
  { key: 'admin', label: 'Quản trị viên' },
  { key: 'candidate', label: 'Ứng viên (Candidate)' },
  { key: 'partner', label: 'Đối tác (SME / CLB)' },
];

const POST_TYPE_FILTERS = [
  { key: 'ALL', label: 'Tất cả loại tin' },
  { key: 'JOB', label: 'Cơ hội việc làm (Job)' },
  { key: 'QUEST', label: 'Quest sự kiện (Quest)' },
];

const VERIF_STATUS_FILTERS = [
  { key: 'ALL', label: 'Tất cả trạng thái' },
  { key: 'PENDING', label: 'Chờ xác thực' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Từ chối' },
];


function SystemConfigPanel() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});      // key -> string value being edited
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getSystemConfigs();
      setConfigs(data);
      const d = {};
      data.forEach((c) => { d[c.key] = String(c.valueInt ?? c.valueText ?? ''); });
      setDrafts(d);
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(key) {
    setSavingKey(key);
    setSavedKey(null);
    try {
      const res = await updateSystemConfig(key, parseInt(drafts[key], 10));
      setConfigs((prev) => prev.map((c) => c.key === key ? { ...c, valueInt: res.value } : c));
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2500);
    } catch (err) {
      setError(err.message || 'Lưu thất bại.');
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}><div className="b2b-loader" style={{ borderTopColor: '#2563eb' }} /></div>;
  }

  const groups = configs.reduce((acc, c) => { (acc[c.group] = acc[c.group] || []).push(c); return acc; }, {});
  const GROUP_LABEL = { pricing: 'Giá & Ví', scoring: 'Điểm số', limits: 'Giới hạn', general: 'Chung', features: 'Tính năng' };

  return (
    <div style={{ display: 'grid', gap: '22px', maxWidth: '760px' }}>
      {error && (
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626', fontWeight: '600', fontSize: '0.88rem' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="admin-stat-card" style={{ display: 'block', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: '800', color: 'var(--p-ink, #101828)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} style={{ color: '#2563eb' }} /> {GROUP_LABEL[group] || group}
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: '700', color: 'var(--p-muted, #5b6472)', background: '#f1f4f9', padding: '2px 9px', borderRadius: '999px' }}>{items.length} mục</span>
          </h3>
          <div>
            {items.map((c, ix) => {
              const changed = String(c.valueInt ?? '') !== String(drafts[c.key] ?? '');
              const unit = c.key.includes('vnd') ? 'VND' : c.key.includes('np') ? 'NP'
                : c.key.startsWith('rs_') ? 'RS' : c.key.startsWith('exp_') ? 'EXP' : '';
              return (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '14px 4px', borderTop: ix === 0 ? 'none' : '1px solid var(--p-line, #e3e8ef)' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--p-ink, #101828)' }}>{c.label || c.key}</span>
                      <code style={{ fontSize: '0.68rem', color: 'var(--p-muted, #5b6472)', background: '#f1f4f9', padding: '2px 7px', borderRadius: '6px' }}>{c.key}</code>
                    </div>
                    {c.description && <div style={{ fontSize: '0.8rem', color: 'var(--p-muted, #5b6472)', marginTop: '4px', lineHeight: 1.45 }}>{c.description}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number" min="0"
                        value={drafts[c.key] ?? ''}
                        onChange={(e) => setDrafts((p) => ({ ...p, [c.key]: e.target.value }))}
                        style={{ width: '150px', padding: `10px ${unit ? '46px' : '12px'} 10px 12px`, borderRadius: '10px', border: `1.5px solid ${changed ? '#0d1b33' : 'var(--p-line, #e3e8ef)'}`, fontSize: '0.95rem', fontWeight: '700', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: 'var(--p-ink, #101828)' }}
                      />
                      {unit && <span style={{ position: 'absolute', right: '12px', fontSize: '0.74rem', fontWeight: '700', color: 'var(--p-muted, #5b6472)', pointerEvents: 'none' }}>{unit}</span>}
                    </div>
                    <button type="button" disabled={!changed || savingKey === c.key} onClick={() => save(c.key)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.85rem',
                        background: savedKey === c.key ? '#16a34a' : (changed ? '#0d1b33' : '#eef1f6'),
                        color: (savedKey === c.key || changed) ? '#fff' : 'var(--p-muted, #5b6472)',
                        cursor: (changed && savingKey !== c.key) ? 'pointer' : 'default', transition: 'background 0.15s' }}>
                      {savedKey === c.key ? <><CheckCircle size={15} /> Đã lưu</> : savingKey === c.key ? '...' : <><Save size={15} /> Lưu</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProvisionPanel() {
  const [form, setForm] = useState({ name: '', companyType: 'SME', representativeEmail: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [lastLink, setLastLink] = useState('');

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.representativeEmail.trim()) {
      setStatus({ type: 'error', message: 'Nhập tên tổ chức và email người đại diện.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Đang tạo tổ chức và gửi lời mời...' });
    setLastLink('');
    try {
      const result = await provisionCompany(form);
      setLastLink(result?.inviteUrl || '');
      setStatus({
        type: result?.emailSent ? 'success' : 'error',
        message: result?.emailSent
          ? `Đã cấp quyền và gửi lời mời tới ${result.email}.`
          : `Đã cấp quyền cho ${result.email} nhưng CHƯA gửi được email${result?.emailError ? ` (${result.emailError})` : ''}. Hãy gửi link mời bên dưới thủ công.`,
      });
      setForm({ name: '', companyType: 'SME', representativeEmail: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Cấp quyền tổ chức thất bại.' });
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20, border: '1px solid var(--border, #e5edff)', borderRadius: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          Tên tổ chức
          <input name="name" value={form.name} onChange={update} placeholder="VD: CLB Truyền thông FPTU" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #cbd5e1)' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          Loại hình
          <select name="companyType" value={form.companyType} onChange={update} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #cbd5e1)' }}>
            <option value="SME">Doanh nghiệp (SME)</option>
            <option value="STARTUP">Startup</option>
            <option value="AGENCY">Agency</option>
            <option value="ENTERPRISE">Tập đoàn</option>
            <option value="CLUB">CLB / Tổ chức sinh viên</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          Email người đại diện (Chủ sở hữu)
          <input name="representativeEmail" type="email" value={form.representativeEmail} onChange={update} placeholder="nguoidaidien@tochuc.vn" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #cbd5e1)' }} />
        </label>

        {status.message && (
          <div className={`register-status ${status.type === 'loading' ? 'loading' : status.type}`}>
            <p style={{ margin: 0 }}>{status.message}</p>
          </div>
        )}

        {lastLink && (
          <div style={{ fontSize: '0.82rem', wordBreak: 'break-all', padding: 12, background: 'rgba(37,99,235,0.06)', borderRadius: 10 }}>
            <strong>Link lời mời:</strong><br />{lastLink}
          </div>
        )}

        <button type="submit" className="button primary-button" disabled={status.type === 'loading'} style={{ alignSelf: 'flex-start', background: '#0d1b33', borderColor: 'transparent' }}>
          Cấp quyền & gửi lời mời
        </button>
      </form>
    </div>
  );
}

export function AdminB2bReviewPage() {
  const navigate = useNavigate();
  const { tabSlug = '', subTabSlug = '' } = useParams();
  const activeTab = ROUTE_TO_TAB[tabSlug] || 'OVERVIEW';
  const [jobsSubTab, setJobsSubTab] = useState('new');
  const [verifSubTab, setVerifSubTab] = useState('pending');
  const [adminEmail, setAdminEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  /* ─── State for B2B reviews ─── */
  const [pendingB2b, setPendingB2b] = useState([]);
  const [filteredB2b, setFilteredB2b] = useState([]);
  const [activeB2bFilter, setActiveB2bFilter] = useState('ALL');
  const [searchB2bQuery, setSearchB2bQuery] = useState('');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewingDoc, setPreviewingDoc] = useState(null);

  /* ─── State for Overview ─── */
  const [stats, setStats] = useState(null);

  /* ─── State for Users ─── */
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  /* ─── State for Jobs/Quests ─── */
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchJobQuery, setSearchJobQuery] = useState('');
  const [jobPostTypeFilter, setJobPostTypeFilter] = useState('ALL');
  const [jobManageTypeTab, setJobManageTypeTab] = useState('JOB');
  const [selectedJobGroup, setSelectedJobGroup] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [rejectingJobItem, setRejectingJobItem] = useState(null);
  const [rejectJobReason, setRejectJobReason] = useState('');

  /* ─── State for Audit Logs ─── */
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  /* ─── State for Verification Queue ─── */
  const [verifQueue, setVerifQueue] = useState([]);
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifActionLoading, setVerifActionLoading] = useState(null);
  const [verifRejectingId, setVerifRejectingId] = useState(null);
  const [verifRejectReason, setVerifRejectReason] = useState('');
  const [verifStatusFilter, setVerifStatusFilter] = useState('ALL');
  const [selectedVerifGroup, setSelectedVerifGroup] = useState(null);
  const [activeCredId, setActiveCredId] = useState(null);
  const [verifLightbox, setVerifLightbox] = useState(null);
  const [auditLogTab, setAuditLogTab] = useState('ALL');
  const [expandedActors, setExpandedActors] = useState({});

  /* ─── State for Fraud Flags ─── */
  const [fraudFlags, setFraudFlags] = useState([]);
  const [fraudFlagsLoading, setFraudFlagsLoading] = useState(false);

  /* ─── State for User Moderation ─── */
  const [userModerateLoading, setUserModerateLoading] = useState(false);
  const [notesDrafts, setNotesDrafts] = useState({});

  /* ─── State for Custom Confirmation Modal ─── */
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    confirmColor: '#2563eb',
    onConfirm: null,
  });

  /* Parse admin email and load user info from token/session on mount */
  useEffect(() => {
    const token = sessionStorage.getItem('nextplease:access_token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.email) {
            setAdminEmail(payload.email);
          }
        }
      } catch (err) {
        console.warn('Cannot parse admin token email:', err);
      }
    }
    if (sessionStorage.getItem('nextplease:admin-bypass') === 'true') {
      setCurrentUser({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@nextplease.vn',
        displayName: 'Quản trị viên Hệ thống',
        roles: ['admin']
      });
      setAdminEmail('admin@nextplease.vn');
    } else {
      const storedUser = sessionStorage.getItem('nextplease:current_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (err) {
          console.warn('Cannot parse stored user info:', err);
        }
      }
    }
  }, []);

  // Admin portal is light-only (Wellfound-flat language).
  useEffect(() => {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchSidebarCounts() {
      try {
        const [b2bData, jobsData, verifData] = await Promise.all([
          getPendingB2bRegistrations(),
          getAdminJobs(),
          getAllVerificationSubmissions(),
        ]);
        if (!isMounted) return;
        setPendingB2b(b2bData || []);
        setJobs(jobsData || []);
        setVerifQueue(verifData || []);
      } catch (err) {
        console.warn('Không thể tải số lượng cảnh báo sidebar admin:', err);
      }
    }
    fetchSidebarCounts();
    return () => { isMounted = false; };
  }, []);

  /* Sync jobsSubTab from URL */
  useEffect(() => {
    if (activeTab === 'JOBS' && subTabSlug) {
      if (subTabSlug === 'new' || subTabSlug === 'all') {
        setJobsSubTab(subTabSlug);
      } else {
        navigate(getAdminTabPath('JOBS', 'new'), { replace: true });
      }
    }
  }, [activeTab, subTabSlug, navigate]);

  /* Sync verification sub-tab from URL */
  useEffect(() => {
    if (activeTab === 'VERIF_QUEUE' && subTabSlug) {
      if (subTabSlug === 'pending' || subTabSlug === 'manage') {
        setVerifSubTab(subTabSlug);
      } else {
        navigate(getAdminTabPath('VERIF_QUEUE', 'pending'), { replace: true });
      }
    }
  }, [activeTab, subTabSlug, navigate]);

  /* Redirect: bare /b2b-reviews → /b2b-reviews/overview */
  useEffect(() => {
    if (!tabSlug) {
      navigate(`${ADMIN_BASE_PATH}/overview`, { replace: true });
    } else if (!ROUTE_TO_TAB[tabSlug]) {
      navigate(`${ADMIN_BASE_PATH}/overview`, { replace: true });
    } else if (tabSlug === 'jobs' && !subTabSlug) {
      navigate(getAdminTabPath('JOBS', 'new'), { replace: true });
    } else if (tabSlug === 'verification-queue' && !subTabSlug) {
      navigate(getAdminTabPath('VERIF_QUEUE', 'pending'), { replace: true });
    }
  }, [tabSlug, subTabSlug, navigate]);

  /* Auto-dismiss toast notifications for actions */
  useEffect(() => {
    if (actionStatus.message && actionStatus.type !== 'loading') {
      const timer = setTimeout(() => {
        setActionStatus({ type: 'idle', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionStatus]);

  /* Auto-dismiss error notifications */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /* Fetch Data based on Active Tab */
  async function fetchTabData(tabKey) {
    setLoading(true);
    setError(null);
    try {
      if (tabKey === 'OVERVIEW') {
        const data = await getAdminStats();
        setStats(data);
      } else if (tabKey === 'USERS') {
        const data = await getAdminUsers();
        setUsers(data || []);
      } else if (tabKey === 'B2B_REVIEWS') {
        const data = await getPendingB2bRegistrations();
        setPendingB2b(data || []);
      } else if (tabKey === 'JOBS') {
        const data = await getAdminJobs();
        setJobs(data || []);
      } else if (tabKey === 'AUDIT_LOGS') {
        const data = await getAdminAuditLogs();
        setLogs(data || []);
      } else if (tabKey === 'VERIF_QUEUE') {
        setVerifLoading(true);
        const data = await getAllVerificationSubmissions();
        setVerifQueue(data || []);
        setVerifLoading(false);
      } else if (tabKey === 'FRAUD_FLAGS') {
        setFraudFlagsLoading(true);
        const data = await getActiveFraudFlags();
        setFraudFlags(data || []);
        setFraudFlagsLoading(false);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('Phiên làm việc đã hết hoặc không có quyền truy cập. Đang chuyển về trang đăng nhập...');
        setTimeout(() => navigate('/nextplease-admin-portal/login'), 2500);
      } else {
        setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tabSlug]);

  /* ─── Filtering & Searching logic ─── */
  // 1. B2B Filter
  useEffect(() => {
    let result = [...pendingB2b];
    if (activeB2bFilter !== 'ALL') {
      result = result.filter((item) => {
        if (activeB2bFilter === 'CLUB') return item.companyType === 'CLUB';
        return item.companyType !== 'CLUB';
      });
    }
    if (searchB2bQuery.trim()) {
      const q = searchB2bQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.ownerEmail?.toLowerCase().includes(q) ||
          item.taxCode?.toLowerCase().includes(q),
      );
    }
    setFilteredB2b(result);
  }, [pendingB2b, activeB2bFilter, searchB2bQuery]);

  // 2. Users Filter
  useEffect(() => {
    let result = [...users];
    if (userRoleFilter !== 'ALL') {
      result = result.filter((user) => {
        const rolesStr = (user.roles || '').toLowerCase();
        if (userRoleFilter === 'admin') return rolesStr.includes('admin');
        if (userRoleFilter === 'candidate') return rolesStr.includes('candidate');
        if (userRoleFilter === 'partner') return rolesStr.includes('employer') || rolesStr.includes('organizer');
        return true;
      });
    }
    if (searchUserQuery.trim()) {
      const q = searchUserQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.email?.toLowerCase().includes(q) ||
          user.displayName?.toLowerCase().includes(q),
      );
    }
    setFilteredUsers(result);
  }, [users, userRoleFilter, searchUserQuery]);

  // 3. Jobs Filter
  useEffect(() => {
    let result = [...jobs];
    if (searchJobQuery.trim()) {
      const q = searchJobQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.companyName?.toLowerCase().includes(q),
      );
    }
    setFilteredJobs(result);
  }, [jobs, searchJobQuery]);

  // 4. Logs Filter
  useEffect(() => {
    let result = [...logs];

    // Filter by tab
    if (auditLogTab !== 'ALL') {
      result = result.filter((log) => {
        const roles = (log.actorRoles || '').toLowerCase();
        const email = log.actorEmail;
        const isAdmin = roles.includes('admin');
        const isPartner = roles.includes('employer') || roles.includes('organizer');
        const isCandidate = roles.includes('candidate');

        if (auditLogTab === 'ADMIN') return isAdmin;
        if (auditLogTab === 'PARTNER') return isPartner;
        if (auditLogTab === 'CANDIDATE') return isCandidate;
        if (auditLogTab === 'SYSTEM') {
          return !email || roles === 'none' || (!isAdmin && !isPartner && !isCandidate);
        }
        return true;
      });
    }

    if (searchLogQuery.trim()) {
      const q = searchLogQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.action?.toLowerCase().includes(q) ||
          log.actorEmail?.toLowerCase().includes(q) ||
          log.actorName?.toLowerCase().includes(q) ||
          log.entityType?.toLowerCase().includes(q),
      );
    }
    setFilteredLogs(result);
  }, [logs, auditLogTab, searchLogQuery]);

  /* ─── Admin Review Collaboration Handlers ─── */
  async function handleClaim(itemType, itemId) {
    setActionStatus({ type: 'loading', message: 'Đang nhận việc...' });
    try {
      await claimReview(itemType, itemId);
      setActionStatus({ type: 'success', message: 'Đã nhận duyệt thành công!' });
      fetchTabData(activeTab);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Nhận duyệt thất bại.' });
    }
  }

  async function handleUnclaim(itemType, itemId) {
    setActionStatus({ type: 'loading', message: 'Đang nhả việc...' });
    try {
      await unclaimReview(itemType, itemId);
      setActionStatus({ type: 'success', message: 'Đã nhả việc về hàng chờ chung.' });
      fetchTabData(activeTab);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Nhả việc thất bại.' });
    }
  }

  async function handleSaveNotes(itemType, itemId) {
    const notes = notesDrafts[itemId] ?? '';
    setActionStatus({ type: 'loading', message: 'Đang lưu ghi chú...' });
    try {
      await updateReviewNotes(itemType, itemId, notes);
      setActionStatus({ type: 'success', message: 'Đã cập nhật ghi chú nội bộ thành công!' });
      fetchTabData(activeTab);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Lưu ghi chú thất bại.' });
    }
  }

  /* ─── B2B Review Handler Actions ─── */
  function openApproveConfirmation(companyId, companyName) {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận phê duyệt',
      message: `Bạn có chắc chắn muốn phê duyệt hoạt động tuyển dụng chính thức cho đối tác "${companyName}"?`,
      confirmText: 'Phê duyệt',
      confirmColor: '#16a34a',
      onConfirm: () => handleApproveExecute(companyId, companyName),
    });
  }

  async function handleApproveExecute(companyId, companyName) {
    setActionStatus({ type: 'loading', message: 'Đang gửi yêu cầu phê duyệt...' });
    try {
      await approveB2bRegistration(companyId);
      setActionStatus({ type: 'success', message: `Đã phê duyệt "${companyName}" thành công!` });
      fetchTabData(activeTab);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Phê duyệt thất bại.' });
    }
  }

  async function handleRejectSubmit(event) {
    event.preventDefault();
    if (!rejectReason.trim()) {
      setActionStatus({ type: 'error', message: 'Vui lòng nhập lý do từ chối.' });
      return;
    }
    setActionStatus({ type: 'loading', message: 'Đang gửi lý do từ chối...' });
    try {
      await rejectB2bRegistration(rejectingItem.id, rejectReason);
      setActionStatus({ type: 'success', message: `Đã từ chối phê duyệt "${rejectingItem.name}".` });
      setRejectingItem(null);
      setRejectReason('');
      fetchTabData(activeTab);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Từ chối thất bại.' });
    }
  }

  function openApproveJobConfirmation(jobId, jobTitle) {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận duyệt tin',
      message: `Bạn có chắc chắn muốn phê duyệt tin tuyển dụng "${jobTitle}" để hiển thị cho ứng viên?`,
      confirmText: 'Duyệt',
      confirmColor: '#16a34a',
      onConfirm: () => handleApproveJobExecute(jobId, jobTitle),
    });
  }

  async function handleApproveJobExecute(jobId, jobTitle) {
    setActionStatus({ type: 'loading', message: 'Đang phê duyệt tin tuyển dụng...' });
    try {
      await approveJob(jobId);
      setActionStatus({ type: 'success', message: `Đã duyệt tin "${jobTitle}" thành công!` });
      fetchTabData(activeTab);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Phê duyệt thất bại.' });
    }
  }

  function openRejectJobConfirmation(jobId, jobTitle) {
    setRejectingJobItem({ id: jobId, title: jobTitle });
    setRejectJobReason('');
  }

  async function handleRejectJobSubmit(event) {
    event.preventDefault();
    if (!rejectJobReason.trim()) {
      setActionStatus({ type: 'error', message: 'Vui lòng nhập lý do từ chối.' });
      return;
    }
    setActionStatus({ type: 'loading', message: 'Đang gửi lý do từ chối...' });
    try {
      await rejectJob(rejectingJobItem.id, rejectJobReason);
      setActionStatus({ type: 'success', message: `Đã từ chối tin "${rejectingJobItem.title}".` });
      setRejectingJobItem(null);
      setRejectJobReason('');
      fetchTabData(activeTab);
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Từ chối thất bại.' });
    }
  }

  async function handleShowJobDetails(jobId) {
    setSelectedJobId(jobId);
    setLoadingDetail(true);
    setDetailError(null);
    setSelectedJobDetail(null);
    try {
      const detail = await getJobDetail(jobId);
      setSelectedJobDetail(detail);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết công việc:', err);
      setDetailError('Không thể tải chi tiết công việc này. Vui lòng thử lại.');
    } finally {
      setLoadingDetail(false);
    }
  }

  /* Logout */
  async function handleLogout() {
    try {
      sessionStorage.removeItem('nextplease:admin-bypass');
      sessionStorage.removeItem('nextplease:access_token');
      localStorage.removeItem('nextplease:admin-bypass');
      if (supabase) await supabase.auth.signOut();
    } catch (err) {
      console.error('Lỗi khi đăng xuất admin:', err);
    } finally {
      navigate('/nextplease-admin-portal/login');
    }
  }

  /* ───────────────────────────────────────────────
     Overview Tab Component View
  ─────────────────────────────────────────────── */
  function renderOverview() {
    if (!stats) return <p style={{ color: 'var(--muted)' }}>Không có số liệu tổng hợp.</p>;

    const statCards = [
      { label: 'Ứng viên (Candidates)', value: stats.totalCandidates, icon: Users, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
      { label: 'Doanh nghiệp SME', value: stats.totalCompanies, icon: Building, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
      { label: 'Câu lạc bộ & Tổ chức', value: stats.totalClubs, icon: GraduationCap, color: '#ff7a1a', bg: 'rgba(255,122,26,0.08)' },
      { label: 'Yêu cầu chờ duyệt B2B', value: stats.totalPendingB2b, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
      { label: 'Cơ hội việc làm (Jobs)', value: stats.totalJobs, icon: FileText, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
      { label: 'Quests & Chiến dịch', value: stats.totalQuests, icon: Activity, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
      { label: 'Số nhật ký hệ thống', value: stats.totalLogs, icon: ShieldCheck, color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="admin-stat-card" style={{ borderColor: `${c.color}25` }}>
                <div className="admin-stat-icon" style={{ color: c.color, background: c.bg }}>
                  <Icon size={20} />
                </div>
                <div>
                  <strong className="admin-stat-value">{c.value}</strong>
                  <span className="admin-stat-label">{c.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Settings & Health Status Card */}
        <div className="panel" style={{ borderRadius: '24px' }}>
          <div className="panel-title" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '16px' }}>
            <Server size={20} style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Thông tin cấu hình & Sức khỏe hệ thống</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Trạng thái API</span>
              <strong style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> Hoạt động ổn định
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Kết nối Database</span>
              <strong>Remote Supabase Pooler</strong>
            </div>
            <div>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Flyway Migration</span>
              <strong style={{ color: '#2563eb' }}>Đã đồng bộ (V8__add_b2b...)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Phiên bản Hệ thống</span>
              <strong>v0.9.4-BETA</strong>
            </div>
          </div>
        </div>

        {/* Action card linking to active sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="panel" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => navigate(getAdminTabPath('B2B_REVIEWS'))}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#f59e0b' }} />
              Duyệt hồ sơ chờ đối tác B2B
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
              Có <strong>{stats.totalPendingB2b}</strong> hồ sơ đang chờ xét duyệt minh chứng đăng ký và quyết định thành lập.
            </p>
          </div>
          <div className="panel" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => navigate(getAdminTabPath('AUDIT_LOGS'))}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: '#dc2626' }} />
              Xem nhật ký hoạt động hệ thống
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
              Theo dõi và ghi nhận lịch sử tương tác, thao tác của tất cả tài khoản người dùng và quản trị viên.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────
     Users Tab Component View
  ─────────────────────────────────────────────── */
  async function handleUpdateUserStatus(userId, newStatus, displayName) {
    const verb = newStatus === 'FROZEN' ? 'đóng băng' : newStatus === 'BANNED' ? 'cấm vĩnh viễn' : 'kích hoạt lại';
    setConfirmModal({
      isOpen: true,
      title: `Xác nhận ${verb} tài khoản`,
      message: `Bạn có chắc muốn ${verb} tài khoản của "${displayName || 'người dùng này'}"?`,
      confirmText: verb.charAt(0).toUpperCase() + verb.slice(1),
      confirmColor: newStatus === 'ACTIVE' ? '#16a34a' : newStatus === 'FROZEN' ? '#d97706' : '#dc2626',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setUserModerateLoading(true);
        setActionStatus({ type: 'loading', message: `Đang ${verb} tài khoản...` });
        try {
          await updateUserStatus(userId, newStatus);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, userStatus: newStatus } : u));
          setSelectedUserDetail(prev => prev ? { ...prev, userStatus: newStatus } : prev);
          setActionStatus({ type: 'success', message: `Đã ${verb} tài khoản thành công.` });
        } catch (err) {
          setActionStatus({ type: 'error', message: err.message || `Không thể ${verb} tài khoản.` });
        } finally {
          setUserModerateLoading(false);
        }
      },
    });
  }

  async function handleDeleteUser(userId, displayName) {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa tài khoản',
      message: `Xóa tài khoản của "${displayName || 'người dùng này'}"? Tài khoản sẽ bị thu hồi mọi quyền truy cập và không thể đăng nhập lại. Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa tài khoản',
      confirmColor: '#dc2626',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setUserModerateLoading(true);
        setActionStatus({ type: 'loading', message: 'Đang xóa tài khoản...' });
        try {
          await deleteUserAccount(userId);
          setUsers(prev => prev.filter(u => u.id !== userId));
          setSelectedUserDetail(null);
          setActionStatus({ type: 'success', message: 'Đã xóa tài khoản thành công.' });
        } catch (err) {
          setActionStatus({ type: 'error', message: err.message || 'Không thể xóa tài khoản.' });
        } finally {
          setUserModerateLoading(false);
        }
      },
    });
  }

  function renderFraudFlags() {
    if (fraudFlagsLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '12px' }}>
          <div className="b2b-loader" />
          <span style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải danh sách cờ gian lận...</span>
        </div>
      );
    }

    const SEVERITY_COLORS = {
      LOW:      { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Thấp' },
      MEDIUM:   { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', label: 'Trung bình' },
      HIGH:     { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626', label: 'Cao' },
      CRITICAL: { bg: 'rgba(127,29,29,0.15)',  color: '#7f1d1d', label: 'Nguy hiểm' },
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--ink)' }}>
            Cờ gian lận đang hoạt động ({fraudFlags.length})
          </h3>
          <button className="button primary-button" style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            onClick={() => fetchTabData('FRAUD_FLAGS')}>
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>

        {fraudFlags.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={32} style={{ color: 'var(--muted)', marginBottom: '8px' }} />
            <p>Không có cờ gian lận nào đang hoạt động.</p>
          </div>
        ) : (
          fraudFlags.map((flag) => {
            const sev = SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.LOW;
            return (
              <div key={flag.id} className="verif-queue-card">
                <div className="verif-queue-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={18} style={{ color: sev.color }} />
                    <div>
                      <strong style={{ color: 'var(--ink)', fontSize: '0.95rem' }}>{flag.userName || flag.userEmail}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>{flag.userEmail}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: sev.bg, color: sev.color }}>
                      {sev.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {flag.createdAt ? new Date(flag.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </div>
                </div>
                <div className="verif-queue-body">
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '10px', fontSize: '0.84rem' }}>
                    <div><span style={{ color: 'var(--muted)' }}>Mã lý do:</span> <strong>{flag.reasonCode}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Trạng thái TK:</span> <strong>{flag.userStatus}</strong></div>
                    <div><span style={{ color: 'var(--muted)' }}>Báo cáo bởi:</span> <strong>{flag.reportedByEmail || 'Hệ thống'}</strong></div>
                  </div>
                </div>
                <div className="verif-queue-actions">
                  <button
                    className="button secondary-button"
                    style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                    onClick={async () => {
                      try {
                        await resolveFraudFlag(flag.id, 'FALSE_POSITIVE');
                        setFraudFlags(prev => prev.filter(f => f.id !== flag.id));
                        setActionStatus({ type: 'success', message: 'Đã đánh dấu là báo cáo sai.' });
                      } catch (err) {
                        setActionStatus({ type: 'error', message: err.message });
                      }
                    }}
                  >Báo cáo sai</button>
                  <button
                    className="button danger-button"
                    style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                    onClick={async () => {
                      try {
                        await resolveFraudFlag(flag.id, 'RESOLVED');
                        setFraudFlags(prev => prev.filter(f => f.id !== flag.id));
                        setActionStatus({ type: 'success', message: 'Đã đánh dấu là đã xử lý.' });
                      } catch (err) {
                        setActionStatus({ type: 'error', message: err.message });
                      }
                    }}
                  >Đã xử lý</button>
                  <button
                    className="button danger-button"
                    style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                    onClick={() => handleUpdateUserStatus(flag.userId, 'FROZEN', flag.userName)}
                  >Đóng băng TK</button>
                  <button
                    className="button danger-button"
                    style={{ fontSize: '0.82rem', padding: '7px 14px', background: '#7f1d1d' }}
                    onClick={() => handleUpdateUserStatus(flag.userId, 'BANNED', flag.userName)}
                  >Cấm vĩnh viễn</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  function renderUsers() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Role filter pills/tabs */}
        <div className="admin-controls" style={{ marginBottom: '4px' }}>
          <div className="admin-filter-tabs">
            {USER_ROLE_FILTERS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setUserRoleFilter(tab.key)}
                className={`admin-filter-tab ${userRoleFilter === tab.key ? 'active' : ''}`}
                type="button"
              >
                {tab.label}
                <span className="admin-tab-count">
                  {tab.key === 'ALL'
                    ? users.length
                    : tab.key === 'admin'
                    ? users.filter(u => (u.roles || '').toLowerCase().includes('admin')).length
                    : tab.key === 'candidate'
                    ? users.filter(u => (u.roles || '').toLowerCase().includes('candidate')).length
                    : users.filter(u => (u.roles || '').toLowerCase().includes('employer') || (u.roles || '').toLowerCase().includes('organizer')).length}
                </span>
              </button>
            ))}
          </div>

          <div className="admin-search-wrap" style={{ flex: 1 }}>
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm theo email, tên hiển thị..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên hiển thị</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const rolesArray = (u.roles || '').split(', ');
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserDetail(u)}
                      style={{ cursor: 'pointer' }}
                      title="Nhấn để xem chi tiết người dùng"
                    >
                      <td style={{ fontWeight: '700' }}>{u.displayName || '—'}</td>
                      <td>{u.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {rolesArray.map((role) => {
                            const isAdm = role.includes('admin');
                            const isCand = role.includes('candidate');
                            const badgeClass = isAdm ? 'admin' : isCand ? 'candidate' : 'partner';
                            const label = isAdm ? 'Admin' : isCand ? 'Candidate' : 'Partner';
                            return (
                              <span key={role} className={`badge-role ${badgeClass}`}>
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        {(() => {
                          const rolesStr = (u.roles || '').toLowerCase();
                          const isPartner = rolesStr.includes('employer') || rolesStr.includes('organizer');
                          
                          if (isPartner) {
                            const compStatus = (u.companyStatus || '').toUpperCase();
                            if (compStatus === 'APPROVED') {
                              return <span className="badge-status active">Đang hoạt động</span>;
                            } else if (compStatus === 'PENDING') {
                              return <span className="badge-status frozen">Chờ duyệt đối tác</span>;
                            } else if (compStatus === 'REJECTED') {
                              return <span className="badge-status banned">Bị từ chối đối tác</span>;
                            } else {
                              return <span className="badge-status frozen">Chưa đăng ký đối tác</span>;
                            }
                          } else {
                            const userStat = (u.userStatus || '').toUpperCase();
                            if (userStat === 'ACTIVE') {
                              return <span className="badge-status active">Đang hoạt động</span>;
                            } else if (userStat === 'FROZEN') {
                              return <span className="badge-status frozen">Tạm khóa</span>;
                            } else if (userStat === 'BANNED') {
                              return <span className="badge-status banned">Bị khóa</span>;
                            } else {
                              return <span className="badge-status active">{u.userStatus || 'ACTIVE'}</span>;
                            }
                          }
                        })()}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────
     Jobs Tab Component View — Grouped by Company
  ─────────────────────────────────────────────── */
  function getStatusInfo(status) {
    const s = (status || '').toLowerCase();
    if (s === 'open') return { badge: 'active', text: 'Hoạt động', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' };
    if (s === 'pending') return { badge: 'frozen', text: 'Chờ duyệt', color: '#d97706', bg: 'rgba(245,158,11,0.08)' };
    if (s === 'rejected') return { badge: 'banned', text: 'Từ chối', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' };
    if (s === 'closed') return { badge: 'banned', text: 'Đã đóng', color: '#6b7280', bg: 'rgba(107,114,128,0.08)' };
    if (s === 'draft') return { badge: 'frozen', text: 'Nháp', color: '#6b7280', bg: 'rgba(107,114,128,0.08)' };
    return { badge: 'banned', text: status, color: '#6b7280', bg: 'rgba(107,114,128,0.08)' };
  }

  function renderJobs() {
    const isPendingView = jobsSubTab === 'new';
    const managedType = isPendingView ? 'ALL' : jobManageTypeTab;
    const displayedJobs = filteredJobs.filter((j) => {
      const isPending = (j.status || '').toLowerCase() === 'pending';
      if (isPendingView) return isPending && (jobPostTypeFilter === 'ALL' || j.postType === jobPostTypeFilter);
      return j.postType === managedType;
    });
    const opportunityCount = jobs.filter((j) => j.postType === 'JOB').length;
    const questCount = jobs.filter((j) => j.postType === 'QUEST').length;

    const groupedByCompany = {};
    displayedJobs.forEach((j) => {
      const key = j.companyName || 'Không rõ tổ chức';
      if (!groupedByCompany[key]) {
        groupedByCompany[key] = {
          companyName: key,
          companyType: j.companyType || 'ENTERPRISE',
          jobs: [],
        };
      }
      groupedByCompany[key].jobs.push(j);
    });
    const companyGroups = Object.values(groupedByCompany);
    const manageTabs = [
      { key: 'JOB', label: 'Cơ hội', icon: Building, count: opportunityCount, accent: '#2563eb' },
      { key: 'QUEST', label: 'Quest', icon: GraduationCap, count: questCount, accent: '#ff7a1a' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-controls">
          <div className="admin-search-wrap" style={{ flex: 1 }}>
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm theo tiêu đề, tên đối tác đăng..."
              value={searchJobQuery}
              onChange={(e) => setSearchJobQuery(e.target.value)}
            />
          </div>

          {isPendingView && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ListFilter size={15} style={{ color: 'var(--muted)' }} />
              <select
                value={jobPostTypeFilter}
                onChange={(e) => setJobPostTypeFilter(e.target.value)}
                className="admin-select"
              >
                {POST_TYPE_FILTERS.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!isPendingView && (
          <div className="admin-filter-tabs">
            {manageTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = jobManageTypeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  className={`admin-filter-tab ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setJobManageTypeTab(tab.key);
                    setSelectedJobGroup(null);
                  }}
                  type="button"
                >
                  <TabIcon size={14} />
                  {tab.label}
                  <span className="admin-tab-count">{tab.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {companyGroups.length === 0 ? (
          <div className="admin-empty-panel">
            <div className="admin-empty-icon">
              <CheckCircle2 size={28} />
            </div>
            <h3>
              {isPendingView
                ? 'Không có tin nào đang chờ duyệt'
                : `Không tìm thấy ${jobManageTypeTab === 'JOB' ? 'cơ hội' : 'quest'} phù hợp`}
            </h3>
            <p>
              {isPendingView ? 'Tất cả tin đăng đã được xử lý. Tốt lắm!' : 'Hãy thử tìm kiếm với từ khóa hoặc bộ lọc khác.'}
            </p>
          </div>
        ) : (
          <div className="admin-square-grid">
            {companyGroups.map((group) => {
              const isClub = group.companyType === 'CLUB';
              const accentColor = isClub ? '#ff7a1a' : '#2563eb';
              const pendingInGroup = group.jobs.filter((j) => (j.status || '').toLowerCase() === 'pending').length;
              const activeInGroup = group.jobs.filter((j) => (j.status || '').toLowerCase() === 'open').length;

              return (
                <button
                  key={group.companyName}
                  className="admin-square-group-card"
                  style={{ '--accent-color': accentColor }}
                  onClick={() => setSelectedJobGroup(group)}
                  type="button"
                >
                  <div className="admin-square-card-top">
                    <div className="admin-square-avatar large">
                      {isClub ? <GraduationCap size={24} /> : <Building size={24} />}
                    </div>
                    <span className="admin-mini-badge">
                      {isClub ? <GraduationCap size={10} /> : <Building size={10} />}
                      {isClub ? 'CLB / Tổ chức' : group.companyType}
                    </span>
                  </div>

                  <div className="admin-square-card-main">
                    <h3>{group.companyName}</h3>
                    <div className="admin-accordion-meta">
                      <span><FileText size={12} /> {group.jobs.length} tin đăng</span>
                      {activeInGroup > 0 && <span className="success"><CheckCircle2 size={12} /> {activeInGroup} hoạt động</span>}
                      {pendingInGroup > 0 && <span className="warning"><Clock size={12} /> {pendingInGroup} chờ duyệt</span>}
                    </div>
                  </div>

                  <div className="admin-square-detail-cta">
                    <span>Xem chi tiết</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>
    );
  }


  /* ───────────────────────────────────────────────
     Verification Queue Tab
  ─────────────────────────────────────────────── */
  function renderVerifQueue() {
    const CATEGORY_LABELS = { CLUB_SMALL: 'Sự kiện CLB', SCHOOL_CAMPAIGN: 'Chiến dịch Trường', COMPANY_PROJECT: 'Dự án DN', SHORT_INTERNSHIP: 'Thực tập', FREELANCE_GIG: 'Freelance' };
    const EXP_REWARDS = { CLUB_SMALL: 100, SCHOOL_CAMPAIGN: 300, COMPANY_PROJECT: 500, SHORT_INTERNSHIP: 500, FREELANCE_GIG: 500 };

    const handleApprove = async (id) => {
      setVerifActionLoading(id + '_approve');
      try {
        await approveCredential(id, '');
        const data = await getAllVerificationSubmissions();
        setVerifQueue(data || []);
        setSelectedVerifGroup(null);
        setActionStatus({ type: 'success', message: 'Đã phê duyệt — EXP và RS đã được cộng cho ứng viên.' });
      } catch (err) {
        setActionStatus({ type: 'error', message: err.message || 'Phê duyệt thất bại.' });
      } finally {
        setVerifActionLoading(null);
        setTimeout(() => setActionStatus({ type: 'idle', message: '' }), 4000);
      }
    };

    const handleReject = async (id) => {
      if (!verifRejectReason.trim()) return;
      setVerifActionLoading(id + '_reject');
      try {
        await rejectCredential(id, verifRejectReason);
        const data = await getAllVerificationSubmissions();
        setVerifQueue(data || []);
        setSelectedVerifGroup(null);
        setVerifRejectingId(null);
        setVerifRejectReason('');
        setActionStatus({ type: 'success', message: 'Đã từ chối minh chứng.' });
      } catch (err) {
        setActionStatus({ type: 'error', message: err.message || 'Từ chối thất bại.' });
      } finally {
        setVerifActionLoading(null);
        setTimeout(() => setActionStatus({ type: 'idle', message: '' }), 4000);
      }
    };

    const pendingCount = verifQueue.filter((item) => ((item.verification_status || item.status || 'PENDING').toUpperCase()) === 'PENDING').length;
    const isPendingView = verifSubTab === 'pending';
    const displayedCredentials = verifQueue.filter((item) => {
      const status = (item.verification_status || item.status || 'PENDING').toUpperCase();
      if (isPendingView) return status === 'PENDING';
      return verifStatusFilter === 'ALL' || status === verifStatusFilter;
    });
    const groupedByCandidate = {};
    displayedCredentials.forEach((item) => {
      const key = item.candidate_email || item.candidate_id || item.candidate_name || item.id;
      if (!groupedByCandidate[key]) {
        groupedByCandidate[key] = {
          key,
          name: item.candidate_name || 'Ứng viên',
          email: item.candidate_email || '',
          reputationScore: item.reputation_score,
          currentLevel: item.current_level,
          credentials: [],
        };
      }
      groupedByCandidate[key].credentials.push(item);
    });
    const candidateGroups = Object.values(groupedByCandidate)
      // Sort express candidates to the top
      .sort((a, b) => {
        const aHasExpress = a.credentials.some(item => item.expressVerification) ? 0 : 1;
        const bHasExpress = b.credentials.some(item => item.expressVerification) ? 0 : 1;
        return aHasExpress - bHasExpress;
      });


    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-controls">
          <div className="admin-filter-tabs">
            <button
              className={`admin-filter-tab ${isPendingView ? 'active' : ''}`}
              onClick={() => navigate(getAdminTabPath('VERIF_QUEUE', 'pending'))}
              type="button"
            >
              <ShieldCheck size={14} />
              Xác thực
              <span className="admin-tab-count">{pendingCount}</span>
            </button>
            <button
              className={`admin-filter-tab ${!isPendingView ? 'active' : ''}`}
              onClick={() => navigate(getAdminTabPath('VERIF_QUEUE', 'manage'))}
              type="button"
            >
              <FileText size={14} />
              Quản lý minh chứng
              <span className="admin-tab-count">{verifQueue.length}</span>
            </button>
          </div>

          {!isPendingView && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ListFilter size={15} style={{ color: 'var(--muted)' }} />
              <select
                value={verifStatusFilter}
                onChange={(e) => {
                  setVerifStatusFilter(e.target.value);
                  setSelectedVerifGroup(null);
                }}
                className="admin-select"
              >
                {VERIF_STATUS_FILTERS.map((filter) => (
                  <option key={filter.key} value={filter.key}>{filter.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {actionStatus.type !== 'idle' && (
          <div className={`alert-banner ${actionStatus.type}`} style={{ marginBottom: '16px' }}>
            {actionStatus.message}
          </div>
        )}

        {verifLoading ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShieldCheck size={32} /></div>
            <p className="empty-state-title">Đang tải hàng chờ...</p>
          </div>
        ) : candidateGroups.length === 0 ? (
          <div className="admin-empty-panel">
            <div className="admin-empty-icon"><CheckCircle size={28} /></div>
            <h3>{isPendingView ? 'Không có yêu cầu xác thực mới' : 'Không tìm thấy minh chứng phù hợp'}</h3>
            <p>{isPendingView ? 'Tất cả minh chứng đã được xử lý. Quay lại sau nhé!' : 'Hãy thử đổi bộ lọc trạng thái.'}</p>
          </div>
        ) : (
          <div className="admin-square-grid">
            {candidateGroups.map((group) => {
              const pendingInGroup = group.credentials.filter((item) => ((item.verification_status || item.status || 'PENDING').toUpperCase()) === 'PENDING').length;
              const hasExpress = group.credentials.some(item => item.expressVerification);
              return (
                <button
                  key={group.key}
                  className="admin-square-group-card"
                  style={{
                    '--accent-color': '#7c3aed',
                    border: hasExpress ? '1px solid #eab308' : undefined,
                    boxShadow: hasExpress ? '0 0 10px rgba(234,179,8,0.12)' : undefined
                  }}
                  onClick={() => setSelectedVerifGroup(group)}
                  type="button"
                >
                  <div className="admin-square-card-top">
                    <div className="admin-square-avatar large">
                      {(group.name || 'UV').slice(0, 2).toUpperCase()}
                    </div>
                    {hasExpress ? (
                      <span style={{ fontSize: '0.68rem', fontWeight: '850', color: '#fff', background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '2px', textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(217,119,6,0.15)' }}>
                        ⚡ EXPRESS
                      </span>
                    ) : (
                      <span className="admin-mini-badge">
                        <User size={10} /> Ứng viên
                      </span>
                    )}
                  </div>

                  <div className="admin-square-card-main">
                    <h3>{group.name}</h3>
                    <div className="admin-accordion-meta">
                      {group.email && <span><Mail size={12} /> {group.email}</span>}
                      <span><FileText size={12} /> {group.credentials.length} minh chứng</span>
                      {pendingInGroup > 0 && (
                        <span className="warning" style={hasExpress ? { color: '#d97706', fontWeight: '800' } : undefined}>
                          <Clock size={12} /> {pendingInGroup} chờ xác thực
                        </span>
                      )}
                      <span>RS: {group.reputationScore ?? '—'} · Lv.{group.currentLevel ?? '—'}</span>
                    </div>
                  </div>

                  <div className="admin-square-detail-cta">
                    <span>Xem chi tiết</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedVerifGroup && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedVerifGroup(null)}>
            <div className="modal-card admin-group-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ marginBottom: '20px' }}>
                <div className="admin-square-avatar" style={{ '--accent-color': '#7c3aed' }}>
                  {(selectedVerifGroup.name || 'UV').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="admin-mini-badge" style={{ '--accent-color': '#7c3aed' }}>
                    <User size={10} /> Ứng viên
                  </span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '1.35rem', fontWeight: 850 }}>{selectedVerifGroup.name}</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {selectedVerifGroup.email || 'Chưa có email'} · RS: {selectedVerifGroup.reputationScore ?? '—'} · Lv.{selectedVerifGroup.currentLevel ?? '—'}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedVerifGroup(null)} className="modal-close-btn">
                  <X size={18} />
                </button>
              </div>

              {(() => {
                // Read live data from verifQueue so claim/approve/reject/notes reflect immediately
                // (selectedVerifGroup is only a snapshot captured when the modal opened).
                const groupKey = selectedVerifGroup.key;
                const liveCreds = (verifQueue || []).filter(item =>
                  (item.candidate_email || item.candidate_id || item.candidate_name || item.id) === groupKey
                );
                const creds = liveCreds.length > 0 ? liveCreds : (selectedVerifGroup.credentials || []);
                const statusLabel = (s) => s === 'APPROVED' ? 'Đã duyệt' : s === 'REJECTED' ? 'Từ chối' : 'Chờ xác thực';
                const activeCred = creds.find(c => c.id === activeCredId) || creds[0];
                if (!activeCred) return null;

                const status = (activeCred.verification_status || activeCred.status || 'PENDING').toUpperCase();
                const isClaimedByMe = activeCred.claimedByMe === true;
                const isClaimedByOther = !!activeCred.claimedByAdminId && !isClaimedByMe;
                const isUnclaimed = !activeCred.claimedByAdminId;
                const notesValue = notesDrafts[activeCred.id] !== undefined ? notesDrafts[activeCred.id] : (activeCred.internalNotes || '');
                let imgs = [];
                try { imgs = JSON.parse(activeCred.proof_images || '[]'); } catch { imgs = []; }
                if (!Array.isArray(imgs)) imgs = [];
                const hasProof = imgs.length > 0 || !!activeCred.proof_link;

                return (
                  <div className={`verif-md ${creds.length < 2 ? 'single' : ''}`}>
                    {/* MASTER — credential list */}
                    {creds.length > 1 && (
                      <aside className="verif-md-list">
                        {creds.map((c) => {
                          const cs = (c.verification_status || c.status || 'PENDING').toUpperCase();
                          const active = c.id === activeCred.id;
                          return (
                            <button key={c.id} type="button"
                              className={`verif-md-row ${cs.toLowerCase()} ${active ? 'active' : ''}`}
                              onClick={() => setActiveCredId(c.id)}>
                              <span className="verif-md-row-avatar"><ShieldCheck size={16} /></span>
                              <span className="verif-md-row-body">
                                <span className="verif-md-row-title">
                                  {c.project_name}
                                  {c.expressVerification && <span className="verif-md-express" title="Express">⚡</span>}
                                </span>
                                <span className={`proof-status-badge ${cs.toLowerCase()}`}>{statusLabel(cs)}</span>
                              </span>
                              <ChevronRight size={15} className="verif-md-row-chev" />
                            </button>
                          );
                        })}
                      </aside>
                    )}

                    {/* DETAIL — selected credential */}
                    <section key={activeCred.id} className={`verif-md-detail ${status.toLowerCase()}`}>
                      <div className="verif-card-head">
                        <div className="admin-post-icon credential">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="verif-card-titlewrap">
                          <div className="verif-card-titlerow">
                            <h4 className="verif-card-title">{activeCred.project_name}</h4>
                            {activeCred.expressVerification && (
                              <span className="verif-express-tag">⚡ EXPRESS</span>
                            )}
                          </div>
                          <div className="admin-subitem-meta">
                            <span className="proof-chip category">{CATEGORY_LABELS[activeCred.category] || activeCred.category}</span>
                            <span className={`proof-chip ${(activeCred.role_level || 'MEMBER').toLowerCase()}`}>{activeCred.role_level === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}</span>
                            <span>{activeCred.position}</span>
                            <span>{activeCred.created_at ? new Date(activeCred.created_at).toLocaleDateString('vi-VN') : '—'}</span>
                          </div>
                        </div>
                        <span className={`proof-status-badge ${status.toLowerCase()}`}>{statusLabel(status)}</span>
                      </div>

                      {activeCred.description && <p className="admin-subitem-desc" style={{ marginTop: '14px' }}>{activeCred.description}</p>}

                      {imgs.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <div className="verif-md-imglabel"><ImageIcon size={13} /> Ảnh minh chứng ({imgs.length})</div>
                          <div className="verif-md-imggrid">
                            {imgs.map((src, i) => (
                              <button key={i} type="button" className="verif-md-img" onClick={() => setVerifLightbox({ images: imgs, index: i })} title="Bấm để phóng to">
                                <img src={src} alt={`Minh chứng ${i + 1}`} />
                                <span className="verif-md-img-zoom"><Search size={20} /></span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeCred.proof_link && (
                        <a href={activeCred.proof_link} target="_blank" rel="noopener noreferrer" className="proof-card-proof-link" style={{ marginTop: '12px' }}>
                          <ExternalLink size={12} /> Mở link minh chứng
                        </a>
                      )}
                      {!hasProof && (
                        <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                          <AlertTriangle size={13} /> Chưa có minh chứng đính kèm
                        </span>
                      )}

                      <div style={{ marginTop: '16px' }}>
                        <span className="verif-reward-badge">+{EXP_REWARDS[activeCred.category] || 100} EXP · +{activeCred.role_level === 'LEADER' ? 10 : 5} RS</span>
                      </div>

                      {/* Internal Notes */}
                      <div className="admin-card-notes" style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px dashed var(--line, #e2e8f0)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--p-ink, #0d1b33)', marginBottom: '8px' }}>
                          📓 Ghi chú nội bộ (Chỉ Admin nhìn thấy)
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesDrafts(prev => ({ ...prev, [activeCred.id]: e.target.value }))}
                            disabled={isClaimedByOther}
                            placeholder={isClaimedByOther ? "Đang bị khóa bởi admin khác..." : "Nhập ghi chú nội bộ cho minh chứng này..."}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--p-line, #cbd5e1)', fontSize: '0.85rem', minHeight: '54px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', background: isClaimedByOther ? '#f9fafb' : '#fff' }}
                          />
                          {!isClaimedByOther && (
                            <button type="button" className="button secondary-button"
                              onClick={() => handleSaveNotes('EXPERIENCE', activeCred.id)}
                              disabled={actionStatus.type === 'loading'}
                              style={{ height: 'auto', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              Lưu
                            </button>
                          )}
                        </div>
                      </div>

                      {status === 'PENDING' && (
                        <div className="verif-md-actions">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {isUnclaimed && (
                              <button type="button" className="button secondary-button"
                                style={{ background: '#f3f4f6', borderColor: '#d1d5db', color: '#1f2937', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                onClick={() => handleClaim('EXPERIENCE', activeCred.id)}
                                disabled={actionStatus.type === 'loading'}>
                                <Clock size={14} /> Nhận việc (Claim)
                              </button>
                            )}
                            {isClaimedByMe && (
                              <>
                                <span className="admin-type-badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={12} /> Bạn đang duyệt
                                </span>
                                <button type="button" className="button secondary-button"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', height: 'auto', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}
                                  onClick={() => handleUnclaim('EXPERIENCE', activeCred.id)}
                                  disabled={actionStatus.type === 'loading'}>
                                  Nhả việc
                                </button>
                              </>
                            )}
                            {isClaimedByOther && (
                              <span className="admin-type-badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 'bold' }}>
                                🔒 Đang duyệt bởi: {activeCred.claimedByAdminName || 'Admin khác'}
                              </span>
                            )}
                          </div>

                          {!isClaimedByMe && (
                            <p className="verif-md-hint">Bấm “Nhận việc” để mở khoá nút Phê duyệt / Từ chối.</p>
                          )}

                          {verifRejectingId === activeCred.id ? (
                            <div className="verif-reject-inline" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                              <input className="form-input" placeholder="Nhập lý do từ chối..." value={verifRejectReason}
                                onChange={e => setVerifRejectReason(e.target.value)} style={{ flex: 1, fontSize: '0.86rem' }} />
                              <button className="button danger-button" disabled={verifActionLoading === activeCred.id + '_reject' || !verifRejectReason.trim() || !isClaimedByMe} onClick={() => handleReject(activeCred.id)}>
                                {verifActionLoading === activeCred.id + '_reject' ? 'Đang xử lý...' : 'Xác nhận'}
                              </button>
                              <button className="button secondary-button" onClick={() => { setVerifRejectingId(null); setVerifRejectReason(''); }}>Hủy</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                              <button className="button primary-button" style={{ width: '100%', justifyContent: 'center' }} disabled={verifActionLoading === activeCred.id + '_approve' || !isClaimedByMe} onClick={() => handleApprove(activeCred.id)}>
                                <CheckCircle2 size={16} /> {verifActionLoading === activeCred.id + '_approve' ? 'Đang duyệt...' : 'Phê duyệt minh chứng'}
                              </button>
                              <button className="button danger-button" style={{ width: '100%', justifyContent: 'center' }} disabled={!isClaimedByMe} onClick={() => { setVerifRejectingId(activeCred.id); setVerifRejectReason(''); }}>
                                Từ chối minh chứng
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {verifLightbox && (() => {
          const { images, index } = verifLightbox;
          const go = (delta) => setVerifLightbox((c) => ({ ...c, index: (c.index + delta + images.length) % images.length }));
          return (
            <div onClick={() => setVerifLightbox(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(8,12,24,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
              <button type="button" onClick={() => setVerifLightbox(null)} aria-label="Đóng"
                style={{ position: 'absolute', top: '20px', right: '24px', width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.14)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={22} />
              </button>
              {images.length > 1 && (
                <>
                  <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Ảnh trước"
                    style={{ position: 'absolute', left: '24px', width: '46px', height: '46px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.14)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={24} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Ảnh sau"
                    style={{ position: 'absolute', right: '24px', width: '46px', height: '46px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.14)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              <img src={images[index]} alt={`Minh chứng ${index + 1}`} onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '90vw', maxHeight: '84vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
              {images.length > 1 && (
                <span style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '0.86rem', fontWeight: 700, background: 'rgba(255,255,255,0.12)', padding: '5px 14px', borderRadius: '999px' }}>
                  {index + 1} / {images.length}
                </span>
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  /* ───────────────────────────────────────────────
     Audit Logs Tab Component View
  ─────────────────────────────────────────────── */
  function renderAuditLogs() {
    const AUDIT_LOG_TABS = [
      { key: 'ALL', label: 'Tất cả' },
      { key: 'ADMIN', label: 'Admin' },
      { key: 'PARTNER', label: 'Đối tác' },
      { key: 'CANDIDATE', label: 'Ứng viên' },
      { key: 'SYSTEM', label: 'Hệ thống' },
    ];

    // Group logs by actor
    const groups = {};
    filteredLogs.forEach((log) => {
      const actorKey = log.actorEmail || 'system';
      if (!groups[actorKey]) {
        groups[actorKey] = {
          actorEmail: log.actorEmail,
          actorName: log.actorName || (log.actorEmail ? log.actorEmail.split('@')[0] : 'Hệ thống'),
          actorRoles: log.actorRoles,
          logs: [],
        };
      }
      groups[actorKey].logs.push(log);
    });

    const actorGroups = Object.values(groups);

    // Sort groups by the latest log's createdAt date descending
    actorGroups.sort((a, b) => {
      const dateA = a.logs[0]?.createdAt ? new Date(a.logs[0].createdAt) : 0;
      const dateB = b.logs[0]?.createdAt ? new Date(b.logs[0].createdAt) : 0;
      return dateB - dateA;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Sub-tab pills */}
        <div className="admin-controls" style={{ marginBottom: '4px' }}>
          <div className="admin-filter-tabs">
            {AUDIT_LOG_TABS.map((tab) => {
              // Calculate count for each category
              let count = 0;
              if (tab.key === 'ALL') {
                count = logs.length;
              } else {
                count = logs.filter((log) => {
                  const roles = (log.actorRoles || '').toLowerCase();
                  const email = log.actorEmail;
                  const isAdmin = roles.includes('admin');
                  const isPartner = roles.includes('employer') || roles.includes('organizer');
                  const isCandidate = roles.includes('candidate');

                  if (tab.key === 'ADMIN') return isAdmin;
                  if (tab.key === 'PARTNER') return isPartner;
                  if (tab.key === 'CANDIDATE') return isCandidate;
                  if (tab.key === 'SYSTEM') {
                    return !email || roles === 'none' || (!isAdmin && !isPartner && !isCandidate);
                  }
                  return false;
                }).length;
              }

              return (
                <button
                  key={tab.key}
                  onClick={() => setAuditLogTab(tab.key)}
                  className={`admin-filter-tab ${auditLogTab === tab.key ? 'active' : ''}`}
                  type="button"
                >
                  {tab.label}
                  <span className="admin-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="admin-search-wrap" style={{ flex: 1 }}>
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm hành động (b2b.approved), email, đối tượng..."
              value={searchLogQuery}
              onChange={(e) => setSearchLogQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grouped Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {actorGroups.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Không tìm thấy ghi nhận lịch sử hệ thống phù hợp.
            </p>
          ) : (
            actorGroups.map((group) => {
              const actorKey = group.actorEmail || 'system';
              const isExpanded = !!expandedActors[actorKey];
              const rolesStr = (group.actorRoles || '').toLowerCase();
              const isAdmin = rolesStr.includes('admin');
              const isPartner = rolesStr.includes('employer') || rolesStr.includes('organizer');
              const isCandidate = rolesStr.includes('candidate');

              let accentColor = '#2563eb'; // Default color (blue)
              let ActorIcon = User;

              if (actorKey === 'system') {
                accentColor = '#6b7280'; // Gray
                ActorIcon = Server;
              } else if (isAdmin) {
                accentColor = '#dc2626'; // Red
                ActorIcon = ShieldAlert;
              } else if (isPartner) {
                accentColor = '#ff7a1a'; // Orange/Orange-red
                ActorIcon = Building;
              } else if (isCandidate) {
                accentColor = '#16a34a'; // Green
                ActorIcon = User;
              }

              const latestLog = group.logs[0];
              const latestDateStr = latestLog?.createdAt
                ? new Date(latestLog.createdAt).toLocaleString('vi-VN')
                : '';

              return (
                <div
                  key={actorKey}
                  style={{
                    background: 'var(--card-bg-strong)',
                    border: `1px solid ${isExpanded ? accentColor + '40' : 'var(--line)'}`,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'border-color 200ms ease, box-shadow 200ms ease',
                    boxShadow: isExpanded ? `0 4px 20px ${accentColor}12` : 'var(--shadow-soft)',
                  }}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => {
                      setExpandedActors((prev) => ({
                        ...prev,
                        [actorKey]: !prev[actorKey],
                      }));
                    }}
                    type="button"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px 24px',
                      background: isExpanded
                        ? `linear-gradient(135deg, ${accentColor}08, transparent)`
                        : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 200ms ease',
                      color: 'var(--ink)',
                    }}
                  >
                    {/* Icon / Avatar */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: `${accentColor}12`,
                        color: accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ActorIcon size={22} />
                    </div>

                    {/* Actor Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                          marginBottom: '4px',
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1.05rem',
                            fontWeight: '800',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {group.actorName}
                        </h3>

                        {/* Roles badges */}
                        {actorKey !== 'system' && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {isAdmin && <span className="badge-role admin">Admin</span>}
                            {isPartner && <span className="badge-role partner">Đối tác</span>}
                            {isCandidate && <span className="badge-role candidate">Ứng viên</span>}
                            {!isAdmin && !isPartner && !isCandidate && (
                              <span className="badge-role">{group.actorRoles}</span>
                            )}
                          </div>
                        )}
                        {actorKey === 'system' && (
                          <span
                            className="badge-role"
                            style={{
                              background: 'rgba(107,114,128,0.08)',
                              color: '#6b7280',
                              borderColor: 'rgba(107,114,128,0.15)',
                            }}
                          >
                            Hệ thống
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '0.8rem',
                          color: 'var(--muted)',
                          flexWrap: 'wrap',
                        }}
                      >
                        {group.actorEmail && <span>{group.actorEmail}</span>}
                        <span>•</span>
                        <span>{group.logs.length} ghi nhận</span>
                        {latestLog && (
                          <>
                            <span>•</span>
                            <span style={{ fontStyle: 'italic' }}>
                              Lần cuối: {latestLog.action} ({latestDateStr})
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Chevron Toggle Icon */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isExpanded ? `${accentColor}14` : 'var(--surface-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isExpanded ? accentColor : 'var(--muted)',
                        flexShrink: 0,
                        transition: 'all 200ms ease',
                      }}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {/* Expanded Content — Timeline logs */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 24px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* Divider */}
                      <div style={{ height: '1px', background: 'var(--line)', marginBottom: '8px' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {group.logs.map((log) => {
                          const isApproved =
                            log.action === 'b2b.approved' ||
                            log.action === 'job.approved' ||
                            log.action === 'quest.approved';
                          const isRejected =
                            log.action === 'b2b.rejected' ||
                            log.action === 'job.rejected' ||
                            log.action === 'quest.rejected';
                          const subColor = isApproved
                            ? '#16a34a'
                            : isRejected
                            ? '#dc2626'
                            : '#2563eb';
                          const subBg = isApproved
                            ? 'rgba(22,163,74,0.08)'
                            : isRejected
                            ? 'rgba(220,38,38,0.08)'
                            : 'rgba(37,99,235,0.08)';
                          const logDate = log.createdAt
                            ? new Date(log.createdAt).toLocaleString('vi-VN')
                            : '—';
                          const isLogMetaExpanded = expandedLogId === log.id;

                          return (
                            <div
                              key={log.id}
                              style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--line)',
                                borderRadius: '16px',
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '14px',
                                transition: 'border-color 150ms ease',
                              }}
                              className="admin-log-subitem"
                            >
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '8px',
                                  background: subBg,
                                  color: subColor,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {isApproved ? (
                                  <Check size={14} />
                                ) : isRejected ? (
                                  <X size={14} />
                                ) : (
                                  <Clock size={14} />
                                )}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                  }}
                                >
                                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>
                                    {log.action}
                                  </strong>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                                    {logDate}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--muted)',
                                    marginTop: '4px',
                                  }}
                                >
                                  Đối tượng: <strong>{log.entityType || 'N/A'}</strong> (ID:{' '}
                                  {log.entityId || 'N/A'})
                                </div>

                                {log.metadata && (
                                  <div style={{ marginTop: '8px' }}>
                                    <button
                                      type="button"
                                      className="button secondary-button"
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        gap: '4px',
                                        height: 'auto',
                                        minHeight: '0',
                                      }}
                                      onClick={() =>
                                        setExpandedLogId(isLogMetaExpanded ? null : log.id)
                                      }
                                    >
                                      {isLogMetaExpanded ? 'Ẩn chi tiết' : 'Xem dữ liệu chi tiết'}
                                    </button>

                                    {isLogMetaExpanded && (
                                      <pre className="admin-log-json">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────
     B2B Reviews Tab Component View
  ─────────────────────────────────────────────── */
  function renderB2bReviews() {
    return (
      <div>
        {/* Controls Section */}
        <div className="admin-controls" style={{ marginBottom: '24px' }}>
          <div className="admin-filter-tabs">
            {B2B_FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveB2bFilter(tab.key)}
                className={`admin-filter-tab ${activeB2bFilter === tab.key ? 'active' : ''}`}
              >
                {tab.label}
                <span className="admin-tab-count">
                  {tab.key === 'ALL'
                    ? pendingB2b.length
                    : tab.key === 'CLUB'
                    ? pendingB2b.filter((i) => i.companyType === 'CLUB').length
                    : pendingB2b.filter((i) => i.companyType !== 'CLUB').length}
                </span>
              </button>
            ))}
          </div>

          <div className="admin-search-wrap" style={{ flex: 1 }}>
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm theo tên, email, MST..."
              value={searchB2bQuery}
              onChange={(e) => setSearchB2bQuery(e.target.value)}
            />
          </div>

          <button className="button secondary-button" onClick={() => fetchTabData('B2B_REVIEWS')} style={{ gap: '8px', fontSize: '0.86rem', flexShrink: 0 }}>
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>

        {/* List Section */}
        <div className="panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="panel-title" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '0' }}>
            <Building size={20} style={{ color: '#2563eb' }} />
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>
              Hồ sơ chờ phê duyệt B2B
              <span style={{ marginLeft: '10px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted)' }}>
                ({filteredB2b.length} hồ sơ)
              </span>
            </h2>
          </div>

          {filteredB2b.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
              <CheckCircle2 size={52} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
              <h3 style={{ marginBottom: '8px' }}>
                {searchB2bQuery || activeB2bFilter !== 'ALL' ? 'Không có kết quả phù hợp' : 'Không có hồ sơ nào chờ duyệt!'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {searchB2bQuery ? 'Thử tìm kiếm với từ khóa khác.' : 'Mọi hồ sơ đã được xử lý. Tốt lắm!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredB2b.map((item, index) => {
                const isClub = item.companyType === 'CLUB';
                const accentColor = isClub ? '#ff7a1a' : '#2563eb';
                const submittedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—';
                const isClaimedByMe = currentUser && item.claimedByAdminId === currentUser.id;
                const isClaimedByOther = item.claimedByAdminId && item.claimedByAdminId !== currentUser?.id;
                const isUnclaimed = !item.claimedByAdminId;
                const notesValue = notesDrafts[item.id] !== undefined ? notesDrafts[item.id] : (item.internalNotes || '');

                return (
                  <article
                    key={item.id}
                    className="admin-review-card"
                    style={{
                      borderTop: index > 0 ? '1px solid var(--line)' : 'none',
                      borderLeft: `4px solid ${accentColor}`,
                    }}
                  >
                    <div className="admin-card-header">
                      <div className="admin-card-avatar" style={{ background: `${accentColor}18`, color: accentColor }}>
                        {isClub ? <GraduationCap size={22} /> : <Building size={22} />}
                      </div>

                      <div className="admin-card-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span className="admin-type-badge" style={{ background: `${accentColor}14`, color: accentColor }}>
                            {isClub ? <GraduationCap size={12} /> : <Building size={12} />}
                            {isClub ? 'CLB sinh viên' : item.companyType}
                          </span>
                          {item.schoolName && (
                            <span className="admin-type-badge" style={{ background: 'rgba(102,112,133,0.1)', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <GraduationCap size={12} /> {item.schoolName}
                            </span>
                          )}
                          <span className="admin-type-badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                            <Clock size={11} /> {submittedDate}
                          </span>
                          {item.isDuplicateNameApproved && (
                            <span className="admin-type-badge" style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626', fontWeight: 'bold' }}>
                              ⚠️ Trùng tên với đối tác đã duyệt
                            </span>
                          )}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{item.name}</h3>
                        {item.description && (
                          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                            {item.description.length > 120 ? item.description.slice(0, 120) + '...' : item.description}
                          </p>
                        )}
                      </div>

                      <div className="admin-card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        {isUnclaimed && (
                          <button
                            type="button"
                            className="button secondary-button"
                            style={{ background: '#f3f4f6', borderColor: '#d1d5db', color: '#1f2937', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => handleClaim('B2B_PARTNER', item.id)}
                            disabled={actionStatus.type === 'loading'}
                          >
                            <Clock size={14} /> Nhận việc (Claim)
                          </button>
                        )}
                        {isClaimedByMe && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="admin-type-badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> Bạn đang duyệt
                            </span>
                            <button
                              type="button"
                              className="button secondary-button"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}
                              onClick={() => handleUnclaim('B2B_PARTNER', item.id)}
                              disabled={actionStatus.type === 'loading'}
                            >
                              Nhả việc
                            </button>
                          </div>
                        )}
                        {isClaimedByOther && (
                          <span className="admin-type-badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 'bold' }}>
                            🔒 Đang duyệt bởi: {item.claimedByAdminName || 'Admin khác'}
                          </span>
                        )}

                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button
                            className="button primary-button admin-approve-btn"
                            onClick={() => openApproveConfirmation(item.id, item.name)}
                            disabled={actionStatus.type === 'loading' || !isClaimedByMe}
                          >
                            <Check size={16} /> Phê duyệt
                          </button>
                          <button
                            className="button secondary-button admin-reject-btn"
                            onClick={() => setRejectingItem(item)}
                            disabled={actionStatus.type === 'loading' || !isClaimedByMe}
                          >
                            <X size={16} /> Từ chối
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card-details">
                      <div className="admin-detail-group">
                        <span className="admin-detail-heading">
                          <User size={13} /> Người đăng ký
                        </span>
                        <div className="admin-detail-items">
                          <span><Mail size={13} style={{ color: 'var(--muted)' }} /> {item.ownerEmail}</span>
                          <span><User size={13} style={{ color: 'var(--muted)' }} /> {item.representativeName}</span>
                          <span><Phone size={13} style={{ color: 'var(--muted)' }} /> {item.representativePhone}</span>
                        </div>
                      </div>

                      <div className="admin-detail-group">
                        <span className="admin-detail-heading">
                          <FileText size={13} /> Thông tin tổ chức
                        </span>
                        <div className="admin-detail-items">
                          {item.taxCode && <span>🏷️ MST: <strong>{item.taxCode}</strong></span>}
                          {item.websiteUrl && (
                            <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} /> Website
                            </a>
                          )}
                          {item.fanpageUrl && (
                            <a href={item.fanpageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff7a1a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} /> Fanpage
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="admin-detail-group">
                        <span className="admin-detail-heading">
                          <ShieldCheck size={13} /> Tài liệu xác thực
                        </span>
                        {item.documentUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewingDoc(item)}
                            className="admin-doc-link"
                            style={{ borderColor: `${accentColor}40`, color: accentColor, background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                          >
                            <FileText size={16} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <strong style={{ display: 'block', fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Xem tài liệu</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {isClub ? 'Quyết định thành lập / Xác nhận CLB' : 'Giấy phép kinh doanh'}
                              </span>
                            </div>
                            <ExternalLink size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.86rem', color: '#dc2626' }}>⚠ Chưa có tài liệu</span>
                        )}
                      </div>
                    </div>

                    <div className="admin-card-notes" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--line, #e2e8f0)' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--p-ink, #0d1b33)', marginBottom: '8px' }}>
                        📓 Ghi chú nội bộ (Chỉ Admin nhìn thấy)
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                          disabled={isClaimedByOther}
                          placeholder={isClaimedByOther ? "Đang bị khóa bởi admin khác..." : "Nhập ghi chú nội bộ (VD: cần kiểm tra thêm giấy phép, thông tin mập mờ...)"}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--p-line, #cbd5e1)',
                            fontSize: '0.85rem',
                            minHeight: '60px',
                            resize: 'vertical',
                            outline: 'none',
                            fontFamily: 'inherit',
                            background: isClaimedByOther ? '#f9fafb' : '#fff'
                          }}
                        />
                        {!isClaimedByOther && (
                          <button
                            type="button"
                            className="button secondary-button"
                            onClick={() => handleSaveNotes('B2B_PARTNER', item.id)}
                            disabled={actionStatus.type === 'loading'}
                            style={{ height: 'auto', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            Lưu
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────
     Main Return JSX Layout
  ─────────────────────────────────────────────── */
  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <NotificationBell accent="#dc2626" />
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-logo">next please<span className="np-dot">:</span></span>
            <span className="admin-sidebar-tag">Admin</span>
          </div>
          <button
            aria-label={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            className="admin-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            type="button"
          >
            {isSidebarCollapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          </button>
        </div>

        {/* Profile Info */}
        <div className="admin-sidebar-profile">
          <div className="admin-profile-avatar">
            {(adminEmail || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div className="admin-profile-info">
            <span className="admin-profile-name" title={adminEmail || 'admin@nextplease.vn'}>
              {adminEmail || 'admin@nextplease.vn'}
            </span>
            <span className="admin-profile-role">Administrator</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav-menu">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const hasSubItems = tab.subItems && tab.subItems.length > 0;
            const isExpanded = isActive && hasSubItems;
            const pendingJobsCount = jobs.filter((j) => (j.status || '').toLowerCase() === 'pending').length;
            const pendingVerifCount = verifQueue.filter((item) => ((item.verification_status || item.status || 'PENDING').toUpperCase()) === 'PENDING').length;
            const badgeValue =
              tab.key === 'B2B_REVIEWS'
                ? pendingB2b.length
                : tab.key === 'JOBS'
                  ? pendingJobsCount
                  : tab.key === 'VERIF_QUEUE'
                    ? pendingVerifCount
                    : 0;
            const showBadge = tab.badgeCount && badgeValue > 0;

            return (
              <div key={tab.key}>
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      // Navigate to the first sub-item by default
                      navigate(getAdminTabPath(tab.key, tab.subItems[0].subRoute));
                    } else {
                      navigate(getAdminTabPath(tab.key));
                    }
                  }}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  title={tab.label}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {showBadge && (
                    <span className="admin-tab-count" style={{ marginLeft: 'auto', background: isActive ? '#dc2626' : 'var(--line)', color: isActive ? '#fff' : 'var(--muted)' }}>
                      {badgeValue}
                    </span>
                  )}
                  {hasSubItems && (
                    <span style={{ marginLeft: showBadge ? '6px' : 'auto', display: 'flex', alignItems: 'center' }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {/* Sub-items accordion */}
                {isExpanded && (
                  <div className="admin-subnav-menu">
                    {tab.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const currentSubRoute = tab.key === 'VERIF_QUEUE' ? verifSubTab : jobsSubTab;
                      const isSubActive = currentSubRoute === sub.subRoute;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => navigate(getAdminTabPath(tab.key, sub.subRoute))}
                          className={`admin-subnav-item ${isSubActive ? 'active' : ''}`}
                          title={sub.label}
                          type="button"
                        >
                          <SubIcon size={14} />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item admin-logout-item" onClick={handleLogout} title="Đăng xuất" type="button">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className="admin-main-container">
        <div className="admin-view-pane">
          {/* Section header title */}
          <div className="admin-section-header">
            <div>
              <div className="admin-section-eyebrow">
                <ShieldCheck size={14} />
                Admin Control Center
              </div>
              <h1>
                {activeTab === 'JOBS'
                  ? (jobsSubTab === 'new' ? 'Quản lý tin mới' : 'Quản lý tin')
                  : activeTab === 'VERIF_QUEUE'
                    ? (verifSubTab === 'pending' ? 'Xác thực minh chứng' : 'Quản lý minh chứng')
                  : SIDEBAR_TABS.find((t) => t.key === activeTab)?.label}
              </h1>
              <p>
                {activeTab === 'OVERVIEW' && 'Số liệu tổng quan hoạt động và hạ tầng hệ thống.'}
                {activeTab === 'USERS' && 'Quản lý tài khoản Ứng viên, Doanh nghiệp & CLB và Quản trị viên.'}
                {activeTab === 'B2B_REVIEWS' && 'Duyệt các yêu cầu tham gia tuyển dụng của SME và CLB Sinh Viên.'}
                {activeTab === 'PROVISION' && 'Cấp quyền truy cập tổ chức cho một người đại diện qua lời mời email.'}
                {activeTab === 'JOBS' && jobsSubTab === 'new' && 'Xét duyệt tin tuyển dụng mới đang chờ phê duyệt từ đối tác.'}
                {activeTab === 'JOBS' && jobsSubTab === 'all' && `Theo dõi ${jobManageTypeTab === 'JOB' ? 'các bài đăng Cơ hội từ Doanh nghiệp' : 'các Quest từ CLB và Tổ chức'}.`}
                {activeTab === 'VERIF_QUEUE' && verifSubTab === 'pending' && 'Tiếp nhận yêu cầu xác thực mới từ ứng viên, mở từng hồ sơ để xem minh chứng chi tiết.'}
                {activeTab === 'VERIF_QUEUE' && verifSubTab === 'manage' && 'Quản lý toàn bộ minh chứng theo từng ứng viên và lọc theo trạng thái xử lý.'}
                {activeTab === 'FRAUD_FLAGS' && 'Danh sách cờ gian lận đang hoạt động, chờ xử lý.'}
                {activeTab === 'AUDIT_LOGS' && 'Lịch sử nhật ký hoạt động hệ thống chi tiết.'}
                {activeTab === 'SYSTEM_CONFIG' && 'Tinh chỉnh giá Premium, mức nạp tối thiểu, thưởng điểm... áp dụng cho sự kiện mới.'}
              </p>
            </div>
            
            <button
              className="button secondary-button"
              onClick={() => fetchTabData(activeTab)}
              disabled={loading}
              style={{ gap: '8px', fontSize: '0.86rem', flexShrink: 0 }}
            >
              <RefreshCw size={14} className={loading ? 'b2b-loader' : ''} style={loading ? { width: '14px', height: '14px', margin: 0, borderWidth: '1px', borderTopColor: '#2563eb' } : {}} />
              Tải lại
            </button>
          </div>

          {/* Tab Render Switcher */}
          {loading && !stats && users.length === 0 && pendingB2b.length === 0 && jobs.length === 0 && logs.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
              <div className="b2b-loader" style={{ borderTopColor: '#dc2626' }} />
              <span style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div key={`${activeTab}-${jobsSubTab}-${verifSubTab}`} className="admin-view-anim">
              {activeTab === 'OVERVIEW' && renderOverview()}
              {activeTab === 'USERS' && renderUsers()}
              {activeTab === 'B2B_REVIEWS' && renderB2bReviews()}
              {activeTab === 'PROVISION' && <ProvisionPanel />}
              {activeTab === 'JOBS' && renderJobs()}
              {activeTab === 'VERIF_QUEUE' && renderVerifQueue()}
              {activeTab === 'FRAUD_FLAGS' && renderFraudFlags()}
              {activeTab === 'AUDIT_LOGS' && renderAuditLogs()}
              {activeTab === 'SYSTEM_CONFIG' && <SystemConfigPanel />}
            </div>
          )}
        </div>
      </main>

      {/* ── Custom Confirm Modal ── */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
          <div className="custom-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '16px' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: 'var(--ink)' }}>{confirmModal.title}</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
              <button
                type="button"
                className="button secondary-button"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Hủy
              </button>
              <button
                type="button"
                className="button primary-button"
                style={{ flex: 1, background: confirmModal.confirmColor, borderColor: 'transparent', color: '#fff', justifyContent: 'center' }}
                onClick={() => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection Reason Input Modal ── */}
      {rejectingItem && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setRejectingItem(null)}>
          <form className="modal-card" onSubmit={handleRejectSubmit}>
            <div className="modal-header">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.1rem' }}>Từ chối phê duyệt</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.88rem' }}>
                  Gửi lý do từ chối tới <strong>{rejectingItem.name}</strong>
                </p>
              </div>
              <button type="button" onClick={() => setRejectingItem(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: '0 0 16px', lineHeight: '1.6' }}>
              Lý do này sẽ hiển thị trực tiếp cho đối tác để họ thực hiện cập nhật lại tài liệu xác minh.
            </p>

            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Tài liệu minh chứng bị mờ, không khớp mã số thuế hoặc thông tin liên lạc..."
              className="admin-reject-textarea"
            />

            <div className="modal-footer">
              <button type="button" className="button secondary-button" onClick={() => setRejectingItem(null)}>
                Hủy
              </button>
              <button
                type="submit"
                className="button primary-button"
                disabled={actionStatus.type === 'loading'}
                style={{ background: '#dc2626', borderColor: 'transparent' }}
              >
                {actionStatus.type === 'loading' ? 'Đang gửi...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Job/Quest Rejection Reason Input Modal ── */}
      {rejectingJobItem && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setRejectingJobItem(null)}>
          <form className="modal-card" onSubmit={handleRejectJobSubmit}>
            <div className="modal-header">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.1rem' }}>Từ chối tin đăng</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.88rem' }}>
                  Từ chối tin: <strong>{rejectingJobItem.title}</strong>
                </p>
              </div>
              <button type="button" onClick={() => setRejectingJobItem(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: '0 0 16px', lineHeight: '1.6' }}>
              Lý do này giúp nhà tuyển dụng hiểu tại sao bài đăng bị từ chối để chỉnh sửa lại thông tin phù hợp.
            </p>

            <textarea
              required
              rows={4}
              value={rejectJobReason}
              onChange={(e) => setRejectJobReason(e.target.value)}
              placeholder="Ví dụ: Thiếu mô tả chi tiết công việc, kỹ năng yêu cầu không khớp, thù lao không hợp lệ..."
              className="admin-reject-textarea"
            />

            <div className="modal-footer">
              <button type="button" className="button secondary-button" onClick={() => setRejectingJobItem(null)}>
                Hủy
              </button>
              <button
                type="submit"
                className="button primary-button"
                disabled={actionStatus.type === 'loading'}
                style={{ background: '#dc2626', borderColor: 'transparent' }}
              >
                {actionStatus.type === 'loading' ? 'Đang gửi...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Document Preview Modal ── */}
      {previewingDoc && (
        <div className="modal-overlay" onClick={() => setPreviewingDoc(null)}>
          <div className="modal-card" style={{ maxWidth: '800px', width: '95%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <FileText size={22} style={{ color: '#2563eb' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Tài liệu minh chứng - {previewingDoc.name}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.82rem' }}>
                  {previewingDoc.companyType === 'CLUB' ? 'Quyết định thành lập / Xác nhận CLB' : 'Giấy phép đăng ký kinh doanh'}
                </p>
              </div>
              <button type="button" onClick={() => setPreviewingDoc(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', maxHeight: '70vh', overflow: 'auto' }}>
              {previewingDoc.documentUrl?.startsWith('data:image/') ? (
                <img src={previewingDoc.documentUrl} alt="Tài liệu minh chứng" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }} />
              ) : previewingDoc.documentUrl?.startsWith('data:application/pdf') ? (
                <iframe src={previewingDoc.documentUrl} title="Tài liệu minh chứng PDF" style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '8px' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                  <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>Tài liệu không phải là dạng xem trước trực tiếp được.</p>
                  <a href={previewingDoc.documentUrl} download={`tai-lieu-minh-chung-${previewingDoc.name}`} className="button primary-button" style={{ display: 'inline-flex', gap: '8px' }}>
                    Tải tài liệu xuống máy
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '16px' }}>
              {previewingDoc.documentUrl && (
                <a href={previewingDoc.documentUrl} download={`tai-lieu-minh-chung-${previewingDoc.name}`} className="button secondary-button" style={{ display: 'inline-flex', gap: '8px', marginRight: 'auto' }}>
                  Tải xuống máy
                </a>
              )}
              <button type="button" className="button primary-button" onClick={() => setPreviewingDoc(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Job Group Details Modal ── */}
      {selectedJobGroup && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedJobGroup(null)}>
          <div className="modal-card admin-group-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div
                className="admin-square-avatar"
                style={{ '--accent-color': selectedJobGroup.companyType === 'CLUB' ? '#ff7a1a' : '#2563eb' }}
              >
                {selectedJobGroup.companyType === 'CLUB' ? <GraduationCap size={22} /> : <Building size={22} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="admin-mini-badge" style={{ '--accent-color': selectedJobGroup.companyType === 'CLUB' ? '#ff7a1a' : '#2563eb' }}>
                  {selectedJobGroup.companyType === 'CLUB' ? 'CLB / Tổ chức' : selectedJobGroup.companyType}
                </span>
                <h3 style={{ margin: '8px 0 0', fontSize: '1.35rem', fontWeight: 850 }}>{selectedJobGroup.companyName}</h3>
                <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {selectedJobGroup.jobs.length} tin đăng trong nhóm này. Chọn một tin để xem chi tiết đầy đủ.
                </p>
              </div>
              <button type="button" onClick={() => setSelectedJobGroup(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="admin-group-modal-grid">
              {selectedJobGroup.jobs.map((job) => {
                const si = getStatusInfo(job.status);
                const liveJob = jobs.find(j => j.id === job.id) || job;
                const isClaimedByMe = liveJob.claimedByMe === true;
                const isClaimedByOther = !!liveJob.claimedByAdminId && !isClaimedByMe;
                const isUnclaimed = !liveJob.claimedByAdminId;
                const isPending = (job.status || '').toLowerCase() === 'pending';

                return (
                  <article key={job.id} className="admin-group-job-card">
                    <div className={`admin-post-icon ${job.postType === 'QUEST' ? 'quest' : ''}`}>
                      <FileText size={16} />
                    </div>
                    <div className="admin-subitem-main">
                      <h4>{job.title}</h4>
                      <div className="admin-subitem-meta">
                        <span className={`badge-role ${job.postType === 'JOB' ? 'candidate' : 'partner'}`} style={{ fontSize: '0.68rem' }}>
                          {job.postType === 'QUEST' ? 'Quest' : 'Cơ hội'}
                        </span>
                        <span>{job.jobType || '—'}</span>
                        <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                      </div>
                    </div>
                    <span className={`badge-status ${si.badge}`}>{si.text}</span>
                    <div className="admin-group-job-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="button secondary-button"
                        onClick={() => handleShowJobDetails(job.id)}
                      >
                        Xem chi tiết
                      </button>
                      {isPending && (
                        <>
                          {isUnclaimed && (
                            <button
                              type="button"
                              className="button secondary-button"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#f3f4f6', borderColor: '#d1d5db', color: '#1f2937', cursor: 'pointer' }}
                              onClick={() => handleClaim('JOB', job.id)}
                              disabled={actionStatus.type === 'loading'}
                            >
                              Nhận việc
                            </button>
                          )}
                          {isClaimedByMe && (
                            <>
                              <button type="button" className="button primary-button" style={{ background: '#16a34a', borderColor: 'transparent', cursor: 'pointer' }} onClick={() => openApproveJobConfirmation(job.id, job.title)}>
                                <Check size={13} /> Duyệt
                              </button>
                              <button type="button" className="button danger-button" style={{ background: '#dc2626', borderColor: 'transparent', cursor: 'pointer' }} onClick={() => openRejectJobConfirmation(job.id, job.title)}>
                                <X size={13} /> Từ chối
                              </button>
                              <button
                                type="button"
                                className="button secondary-button"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}
                                onClick={() => handleUnclaim('JOB', job.id)}
                                disabled={actionStatus.type === 'loading'}
                              >
                                Nhả việc
                              </button>
                            </>
                          )}
                          {isClaimedByOther && (
                            <span className="admin-type-badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 'bold', fontSize: '0.75rem' }}>
                              🔒 {liveJob.claimedByAdminName || 'Admin khác'}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Beautiful Overlay Job/Quest Details Modal ── */}
      {selectedJobId && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedJobId(null);
            setSelectedJobDetail(null);
          }}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '650px', width: '95%', padding: '28px', color: 'var(--ink)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: '16px', position: 'relative' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: selectedJobDetail?.postType === 'JOB' ? 'rgba(37,99,235,0.08)' : 'rgba(255,122,26,0.08)',
                color: selectedJobDetail?.postType === 'JOB' ? '#2563eb' : '#ff7a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText size={22} />
              </div>
              <div style={{ paddingRight: '24px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'var(--surface-soft)',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '4px'
                }}>
                  {selectedJobDetail?.category || 'ĐANG TẢI...'}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.3 }}>
                  {selectedJobDetail?.title || 'Đang tải thông tin...'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedJobId(null);
                  setSelectedJobDetail(null);
                }}
                className="modal-close-btn"
                style={{ position: 'absolute', top: '0px', right: '0px' }}
              >
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
                <div className="b2b-loader" style={{ width: '32px', height: '32px', borderTopColor: '#2563eb' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Đang tải chi tiết bài đăng...</p>
              </div>
            ) : detailError ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: '16px', textAlign: 'center' }}>
                <AlertTriangle size={36} style={{ color: '#dc2626' }} />
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#dc2626' }}>{detailError}</p>
                <button
                  onClick={() => handleShowJobDetails(selectedJobId)}
                  className="button primary-button"
                  style={{ padding: '8px 16px', background: '#2563eb', borderColor: 'transparent' }}
                >
                  Thử lại
                </button>
              </div>
            ) : selectedJobDetail ? (
              (() => {
                const liveJob = jobs.find(j => j.id === selectedJobDetail.id) || selectedJobDetail;
                const isClaimedByMe = liveJob.claimedByMe === true;
                const isClaimedByOther = !!liveJob.claimedByAdminId && !isClaimedByMe;
                const isUnclaimed = !liveJob.claimedByAdminId;
                const notesValue = notesDrafts[selectedJobDetail.id] !== undefined ? notesDrafts[selectedJobDetail.id] : (liveJob.internalNotes || '');
                const isPending = (selectedJobDetail.status || '').toLowerCase() === 'pending';

                return (
                  <div>
                    {/* Rejection Reason Alert if status is rejected / closed */}
                    {(selectedJobDetail.status?.toLowerCase() === 'rejected' || (selectedJobDetail.isQuest && selectedJobDetail.status?.toLowerCase() === 'closed')) && selectedJobDetail.rejectionReason && (
                      <div style={{
                        backgroundColor: 'rgba(220,38,38,0.05)',
                        border: '1px solid rgba(220,38,38,0.2)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '20px',
                        fontSize: '0.88rem',
                      }}>
                        <strong style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={15} /> Lý do từ chối kiểm duyệt:
                        </strong>
                        <p style={{ margin: '6px 0 0', lineHeight: '1.4', color: 'var(--ink)' }}>
                          {selectedJobDetail.rejectionReason}
                        </p>
                      </div>
                    )}

                    {isPending && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: isClaimedByMe ? '#dcfce7' : isClaimedByOther ? '#fef3c7' : '#f3f4f6',
                        color: isClaimedByMe ? '#15803d' : isClaimedByOther ? '#b45309' : '#1f2937',
                        marginBottom: '16px',
                        fontSize: '0.88rem',
                        fontWeight: '600'
                      }}>
                        <span>
                          {isClaimedByMe ? '✅ Bạn đang phụ trách duyệt bài đăng này.' :
                           isClaimedByOther ? `🔒 Đang được duyệt bởi: ${liveJob.claimedByAdminName || 'Admin khác'}` :
                           '⌛ Bài đăng này chưa có người phụ trách.'}
                        </span>
                        <div>
                          {isUnclaimed && (
                            <button
                              type="button"
                              className="button secondary-button"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#fff', borderColor: '#d1d5db', cursor: 'pointer' }}
                              onClick={() => handleClaim('JOB', selectedJobDetail.id)}
                              disabled={actionStatus.type === 'loading'}
                            >
                              Nhận việc
                            </button>
                          )}
                          {isClaimedByMe && (
                            <button
                              type="button"
                              className="button secondary-button"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}
                              onClick={() => handleUnclaim('JOB', selectedJobDetail.id)}
                              disabled={actionStatus.type === 'loading'}
                            >
                              Nhả việc
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '20px',
                      background: 'var(--surface-soft)',
                      padding: '16px',
                      borderRadius: '16px',
                      fontSize: '0.86rem'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Phân loại bài đăng:</span>
                        <strong style={{ textTransform: 'uppercase' }}>
                          {selectedJobDetail.postType === 'JOB' ? 'Cơ hội việc làm (Job)' : 'Quest chiến dịch (Quest)'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Loại hình:</span>
                        <strong>{selectedJobDetail.jobType || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Nhà tuyển dụng / Tổ chức:</span>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {selectedJobDetail.companyType === 'CLUB' ? <GraduationCap size={13} style={{ color: '#ff7a1a' }} /> : <Building size={13} style={{ color: '#2563eb' }} />}
                          {selectedJobDetail.companyName}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Hạn nộp hồ sơ:</span>
                        <strong style={{ color: '#ff7a1a' }}>
                          {selectedJobDetail.deadlineAt ? new Date(selectedJobDetail.deadlineAt).toLocaleString('vi-VN') : 'Không giới hạn'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Địa điểm:</span>
                        <strong>{selectedJobDetail.isRemote ? 'Làm việc từ xa (Remote)' : (selectedJobDetail.location || 'Chưa cập nhật')}</strong>
                      </div>
                      {selectedJobDetail.postType === 'QUEST' ? (
                        <div>
                          <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Thù lao / Phụ cấp:</span>
                          <strong style={{ color: 'var(--muted)' }}>Không có</strong>
                          <span style={{ fontSize: '0.76rem', color: '#ff7a1a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Award size={13} /> Điểm EXP: +{selectedJobDetail.expReward || 100} EXP khi hoàn thành
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Thù lao / Phụ cấp:</span>
                          <strong style={{ color: '#16a34a' }}>
                            {selectedJobDetail.compensation ? `${parseInt(selectedJobDetail.compensation, 10).toLocaleString('vi-VN')} VND` : 'Thỏa thuận'}
                          </strong>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Chỉ tiêu Capacity:</span>
                        <strong>{selectedJobDetail.capacity ? `${selectedJobDetail.capacity} chỉ tiêu` : 'Không giới hạn'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Uy tín tối thiểu:</span>
                        <strong style={{ color: '#2563eb' }}>{selectedJobDetail.minReqRs} RS</strong>
                      </div>
                    </div>

                    {/* Required Skills */}
                    {selectedJobDetail.skills && selectedJobDetail.skills.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Yêu cầu kỹ năng
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedJobDetail.skills.map((s, idx) => (
                            <span key={idx} style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: 'var(--surface-soft)',
                              border: '1px solid var(--line)',
                              fontSize: '0.8rem',
                            }}>
                              <strong style={{ color: '#2563eb', marginRight: '4px' }}>{s.skillName}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 'bold' }}>
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
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Câu hỏi thêm cho ứng viên ({selectedJobDetail.formFields.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedJobDetail.formFields.map((f, idx) => {
                            const typeLabel = f.fieldType === 'TEXTAREA' ? 'Văn bản dài' : f.fieldType === 'SELECT' ? 'Chọn 1 đáp án' : 'Văn bản ngắn';
                            const opts = f.fieldType === 'SELECT' ? (f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean) : [];
                            return (
                              <div key={f.id || idx} style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563eb' }}>{idx + 1}.</span>
                                  <strong style={{ fontSize: '0.85rem' }}>{f.label}</strong>
                                  {f.required && <span style={{ fontSize: '0.66rem', fontWeight: '800', color: '#dc2626', background: 'rgba(220,38,38,0.08)', padding: '2px 7px', borderRadius: '999px' }}>Bắt buộc</span>}
                                  <span style={{ fontSize: '0.66rem', fontWeight: '700', color: 'var(--muted)', background: 'var(--bg)', border: '1px solid var(--line)', padding: '2px 7px', borderRadius: '999px' }}>{typeLabel}</span>
                                </div>
                                {opts.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                                    {opts.map((o, i) => (
                                      <span key={i} style={{ fontSize: '0.72rem', fontWeight: '600', background: 'var(--bg)', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: '6px' }}>{o}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Job Description */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Mô tả chi tiết (JD)
                      </h4>
                      <div style={{
                        background: 'var(--surface-soft)',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        border: '1px solid var(--line)'
                      }}>
                        {selectedJobDetail.description}
                      </div>
                    </div>

                    {/* Internal Notes */}
                    <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px dashed var(--line, #e2e8f0)' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        📓 Ghi chú nội bộ (Chỉ Admin nhìn thấy)
                      </h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesDrafts(prev => ({ ...prev, [selectedJobDetail.id]: e.target.value }))}
                          disabled={isClaimedByOther}
                          placeholder={isClaimedByOther ? "Đang bị khóa bởi admin khác..." : "Nhập ghi chú nội bộ cho bài đăng này..."}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--p-line, #cbd5e1)',
                            fontSize: '0.85rem',
                            minHeight: '60px',
                            resize: 'vertical',
                            outline: 'none',
                            fontFamily: 'inherit',
                            background: isClaimedByOther ? '#f9fafb' : '#fff'
                          }}
                        />
                        {!isClaimedByOther && (
                          <button
                            type="button"
                            className="button secondary-button"
                            onClick={() => handleSaveNotes('JOB', selectedJobDetail.id)}
                            disabled={actionStatus.type === 'loading'}
                            style={{ height: 'auto', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            Lưu
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                      <button
                        type="button"
                        className="button secondary-button"
                        onClick={() => {
                          setSelectedJobId(null);
                          setSelectedJobDetail(null);
                        }}
                      >
                        Đóng
                      </button>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            className="button primary-button"
                            style={{ background: '#dc2626', borderColor: 'transparent', color: '#fff', cursor: isClaimedByMe ? 'pointer' : 'not-allowed' }}
                            disabled={!isClaimedByMe}
                            title={!isClaimedByMe ? 'Bấm "Nhận việc" trước khi xử lý' : undefined}
                            onClick={() => {
                              setSelectedJobId(null);
                              setSelectedJobDetail(null);
                              openRejectJobConfirmation(selectedJobDetail.id, selectedJobDetail.title);
                            }}
                          >
                            <X size={15} /> Từ chối
                          </button>
                          <button
                            type="button"
                            className="button primary-button"
                            style={{ background: '#16a34a', borderColor: 'transparent', color: '#fff', cursor: isClaimedByMe ? 'pointer' : 'not-allowed' }}
                            disabled={!isClaimedByMe}
                            title={!isClaimedByMe ? 'Bấm "Nhận việc" trước khi xử lý' : undefined}
                            onClick={() => {
                              setSelectedJobId(null);
                              setSelectedJobDetail(null);
                              openApproveJobConfirmation(selectedJobDetail.id, selectedJobDetail.title);
                            }}
                          >
                            <Check size={15} /> Duyệt bài
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>
        </div>
      )}

      {/* ── User Details Modal ── */}
      {selectedUserDetail && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedUserDetail(null)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '600px', width: '95%', padding: '28px', color: 'var(--ink)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: '20px', position: 'relative' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(37,99,235,0.08)',
                color: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <User size={22} />
              </div>
              <div style={{ paddingRight: '24px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'var(--surface-soft)',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  color: 'var(--muted)',
                  marginBottom: '4px'
                }}>
                  Chi tiết người dùng
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.3 }}>
                  {selectedUserDetail.displayName || '—'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="modal-close-btn"
                style={{ position: 'absolute', top: '0px', right: '0px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div>
              {/* User Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
                background: 'var(--surface-soft)',
                padding: '16px',
                borderRadius: '16px',
                fontSize: '0.86rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Email:</span>
                  <strong>{selectedUserDetail.email}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Trạng thái tài khoản:</span>
                  {(() => {
                    const rolesStr = (selectedUserDetail.roles || '').toLowerCase();
                    const isPartner = rolesStr.includes('employer') || rolesStr.includes('organizer');
                    if (isPartner) {
                      const compStatus = (selectedUserDetail.companyStatus || '').toUpperCase();
                      if (compStatus === 'APPROVED') return <span className="badge-status active">Đang hoạt động (Đối tác)</span>;
                      if (compStatus === 'PENDING') return <span className="badge-status frozen">Chờ duyệt đối tác</span>;
                      if (compStatus === 'REJECTED') return <span className="badge-status banned">Bị từ chối đối tác</span>;
                      return <span className="badge-status frozen">Chưa đăng ký đối tác</span>;
                    } else {
                      const userStat = (selectedUserDetail.userStatus || '').toUpperCase();
                      if (userStat === 'ACTIVE') return <span className="badge-status active">Đang hoạt động</span>;
                      if (userStat === 'FROZEN') return <span className="badge-status frozen">Tạm khóa</span>;
                      if (userStat === 'BANNED') return <span className="badge-status banned">Bị khóa</span>;
                      return <span className="badge-status active">{selectedUserDetail.userStatus || 'ACTIVE'}</span>;
                    }
                  })()}
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>ID hệ thống (UUID):</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all' }}>{selectedUserDetail.id}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Nguồn đăng ký (Auth):</span>
                  <strong style={{ textTransform: 'capitalize' }}>{selectedUserDetail.authProvider || 'supabase'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Ngày đăng ký:</span>
                  <strong>{selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleString('vi-VN') : '—'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Lần cuối đăng nhập:</span>
                  <strong>{selectedUserDetail.lastLoginAt ? new Date(selectedUserDetail.lastLoginAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Xác minh Email Sinh viên:</span>
                  <strong>
                    {selectedUserDetail.studentEmailVerified ? (
                      <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Đã xác minh
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>Chưa xác minh</span>
                    )}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Gói tài khoản (Premium):</span>
                  <strong>
                    {selectedUserDetail.premiumUntil ? (
                      new Date(selectedUserDetail.premiumUntil) > new Date() ? (
                        <span style={{ color: '#ff7a1a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          👑 Premium (Hạn: {new Date(selectedUserDetail.premiumUntil).toLocaleDateString('vi-VN')})
                        </span>
                      ) : (
                        `Hết hạn ngày ${new Date(selectedUserDetail.premiumUntil).toLocaleDateString('vi-VN')}`
                      )
                    ) : (
                      'Tài khoản Standard (Free)'
                    )}
                  </strong>
                </div>
              </div>

              {/* Roles list */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Vai trò được gán (Roles)
                </h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(selectedUserDetail.roles || '').split(', ').map((role) => {
                    const isAdm = role.includes('admin');
                    const isCand = role.includes('candidate');
                    const badgeClass = isAdm ? 'admin' : isCand ? 'candidate' : 'partner';
                    const label = isAdm ? 'Admin' : isCand ? 'Candidate' : 'Partner';
                    return (
                      <span key={role} className={`badge-role ${badgeClass}`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                        {label} ({role})
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Associated Company info if Partner */}
              {((selectedUserDetail.roles || '').toLowerCase().includes('employer') || (selectedUserDetail.roles || '').toLowerCase().includes('organizer')) && selectedUserDetail.companyType && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '12px', background: 'var(--card-bg-strong)' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} /> Thông tin đối tác liên kết
                  </h4>
                  <div style={{ fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Phân loại đối tác: <strong>{selectedUserDetail.companyType}</strong></div>
                    <div>Trạng thái xác thực hồ sơ: <strong>{selectedUserDetail.companyStatus || 'NONE'}</strong></div>
                  </div>
                </div>
              )}

              {/* User Activities Timeline */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} /> Hoạt động gần đây trên hệ thống
                </h4>
                
                {(() => {
                  const userLogs = logs.filter(log => log.actorEmail === selectedUserDetail.email);
                  if (userLogs.length === 0) {
                    return (
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)', fontStyle: 'italic', padding: '10px 0' }}>
                        Không ghi nhận hoạt động gần đây của tài khoản này trên hệ thống.
                      </p>
                    );
                  }

                  return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '160px',
                      overflowY: 'auto',
                      paddingRight: '4px'
                    }}>
                      {userLogs.slice(0, 10).map((log) => {
                        const logDate = log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—';
                        return (
                          <div key={log.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--surface-soft)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem'
                          }}>
                            <span style={{ fontWeight: '700', color: 'var(--ink)' }}>{log.action}</span>
                            <span style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{logDate}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Moderation Actions */}
            {!(selectedUserDetail.roles || '').toLowerCase().includes('admin') && (
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} /> Quản lý tài khoản
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(selectedUserDetail.userStatus || 'ACTIVE').toUpperCase() !== 'ACTIVE' && (
                    <button
                      className="button secondary-button"
                      style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                      disabled={userModerateLoading}
                      onClick={() => handleUpdateUserStatus(selectedUserDetail.id, 'ACTIVE', selectedUserDetail.displayName)}
                    >
                      Kích hoạt lại
                    </button>
                  )}
                  {(selectedUserDetail.userStatus || 'ACTIVE').toUpperCase() !== 'FROZEN' && (
                    <button
                      className="button danger-button"
                      style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                      disabled={userModerateLoading}
                      onClick={() => handleUpdateUserStatus(selectedUserDetail.id, 'FROZEN', selectedUserDetail.displayName)}
                    >
                      Đóng băng (Tạm khóa)
                    </button>
                  )}
                  {(selectedUserDetail.userStatus || 'ACTIVE').toUpperCase() !== 'BANNED' && (
                    <button
                      className="button danger-button"
                      style={{ fontSize: '0.82rem', padding: '7px 14px', background: 'rgba(127,29,29,0.85)' }}
                      disabled={userModerateLoading}
                      onClick={() => handleUpdateUserStatus(selectedUserDetail.id, 'BANNED', selectedUserDetail.displayName)}
                    >
                      Cấm vĩnh viễn (Ban)
                    </button>
                  )}
                  {!(selectedUserDetail.roles || '').toLowerCase().includes('admin') && (
                    <button
                      className="button danger-button"
                      style={{ fontSize: '0.82rem', padding: '7px 14px', background: '#dc2626' }}
                      disabled={userModerateLoading}
                      onClick={() => handleDeleteUser(selectedUserDetail.id, selectedUserDetail.displayName)}
                    >
                      Xóa tài khoản
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '20px' }}>
              <button
                type="button"
                className="button primary-button"
                onClick={() => setSelectedUserDetail(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {actionStatus.message && (
        <div className={`toast-notification ${actionStatus.type === 'loading' ? 'info' : actionStatus.type}`}>
          {actionStatus.type === 'loading' ? (
            <div className="b2b-loader" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: '#2563eb' }} />
          ) : actionStatus.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          ) : (
            <AlertCircle size={18} style={{ color: '#dc2626' }} />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{actionStatus.message}</span>
          {actionStatus.type !== 'loading' && (
            <button
              type="button"
              onClick={() => setActionStatus({ type: 'idle', message: '' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '8px' }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="toast-notification error">
          <AlertCircle size={18} style={{ color: '#dc2626' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '8px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}