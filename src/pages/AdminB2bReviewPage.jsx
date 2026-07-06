/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useLayoutEffect, useId } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { NotificationBell } from '../components/NotificationBell.jsx';
import { useTheme } from '../lib/themeContext.jsx';
import {
  getPendingB2bRegistrations,
  approveB2bRegistration,
  rejectB2bRegistration,
  provisionCompany,
  getCurrentUser as fetchCurrentUser,
  getApprovedB2bRegistrations,
} from '../api/b2bApi.js';
import { logout } from '../api/httpClient.js';
import {
  getAdminStats,
  getAdminHealth,
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
  UserPlus,
  X,
  Users,
  BarChart2,
  ListFilter,
  CheckCircle,
  Activity,
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Server,
  Settings,
  Save,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Zap,
  Briefcase,
  Copy,
  Calendar,
  Lock,
  SlidersHorizontal,
  Wallet,
  GripVertical,
} from 'lucide-react';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';
import { AppShell } from '@astryxdesign/core/AppShell';
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs';
import { IconButton } from '@astryxdesign/core/IconButton';
import { ToggleButton } from '@astryxdesign/core/ToggleButton';
import { Badge } from '@astryxdesign/core/Badge';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Card } from '@astryxdesign/core/Card';
import { HStack, VStack } from '@astryxdesign/core/Layout';

const ADMIN_BASE_PATH = '/nextplease-admin-portal/b2b-reviews';

const SIDEBAR_TABS = [
  { key: 'OVERVIEW', route: 'overview', label: 'Tổng quan hệ thống', icon: BarChart2 },
  { key: 'USERS', route: 'users', label: 'Quản lý người dùng', icon: Users },
  {
    key: 'B2B_REVIEWS', route: 'b2b-partners', label: 'Duyệt đối tác B2B', icon: Building, badgeCount: true,
    subItems: [
      { key: 'B2B_PENDING', subRoute: 'pending', label: 'Chờ duyệt', icon: Clock },
      { key: 'B2B_APPROVED', subRoute: 'approved', label: 'Đã duyệt', icon: CheckCircle },
    ],
  },
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


const CFG_GROUP_LABEL = { pricing: 'Giá & Ví', scoring: 'Điểm số', limits: 'Giới hạn', general: 'Chung', features: 'Tính năng' };
const CFG_GROUP_ICON = { pricing: Wallet, scoring: Award, limits: SlidersHorizontal, general: Settings, features: Zap };
const CFG_GROUP_ORDER_STORAGE_KEY = 'np_admin_config_group_order';

function SystemConfigPanel() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});      // key -> string value being edited
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [savedDiff, setSavedDiff] = useState(null); // { key, from, to }
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [slideDir, setSlideDir] = useState('right');
  const [groupOrder, setGroupOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(CFG_GROUP_ORDER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [draggedGroup, setDraggedGroup] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  const tabRefs = useRef({});
  const prevTabRectsRef = useRef({});

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
    const prevItem = configs.find((c) => c.key === key);
    const fromVal = prevItem ? (prevItem.valueInt ?? prevItem.valueText) : null;
    setSavingKey(key);
    setSavedKey(null);
    try {
      const res = await updateSystemConfig(key, parseInt(drafts[key], 10));
      setConfigs((prev) => prev.map((c) => c.key === key ? { ...c, valueInt: res.value } : c));
      setSavedKey(key);
      setSavedDiff({ key, from: fromVal, to: res.value });
      setTimeout(() => setSavedKey((cur) => (cur === key ? null : cur)), 2200);
      setTimeout(() => setSavedDiff((cur) => (cur && cur.key === key ? null : cur)), 1500);
    } catch (err) {
      setError(err.message || 'Lưu thất bại.');
    } finally {
      setSavingKey(null);
    }
  }

  const groupsMap = configs.reduce((acc, c) => { (acc[c.group] = acc[c.group] || []).push(c); return acc; }, {});
  const presentGroups = Object.keys(groupsMap);
  const orderedGroups = [
    ...groupOrder.filter((g) => presentGroups.includes(g)),
    ...presentGroups.filter((g) => !groupOrder.includes(g)),
  ];
  const orderedGroupsKey = orderedGroups.join('|');

  if (!activeGroup && orderedGroups.length) {
    setActiveGroup(orderedGroups[0]);
  }

  // Sliding active-tab indicator: measured via offsetLeft/offsetWidth so it is
  // unaffected by the transient transform the FLIP reorder effect applies below.
  useLayoutEffect(() => {
    const el = tabRefs.current[activeGroup];
    if (el) {
      setIndicator({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, ready: true });
    }
  }, [activeGroup, orderedGroupsKey]);

  // FLIP animation: when tab order changes (drag reorder), animate tabs sliding
  // from their previous screen position into the new one instead of snapping.
  useLayoutEffect(() => {
    const newRects = {};
    Object.entries(tabRefs.current).forEach(([g, el]) => {
      if (el) newRects[g] = el.getBoundingClientRect();
    });
    const prevRects = prevTabRectsRef.current;
    Object.entries(newRects).forEach(([g, newRect]) => {
      const prevRect = prevRects[g];
      const el = tabRefs.current[g];
      if (prevRect && el) {
        const dx = prevRect.left - newRect.left;
        if (Math.abs(dx) > 1) {
          el.style.transition = 'none';
          el.style.transform = `translateX(${dx}px)`;
          void el.offsetWidth; // force reflow
          requestAnimationFrame(() => {
            el.style.transition = 'transform 340ms cubic-bezier(0.16, 1, 0.3, 1)';
            el.style.transform = '';
          });
        }
      }
    });
    prevTabRectsRef.current = newRects;
  }, [orderedGroupsKey]);

  function persistOrder(newOrder) {
    setGroupOrder(newOrder);
    try { localStorage.setItem(CFG_GROUP_ORDER_STORAGE_KEY, JSON.stringify(newOrder)); } catch { /* ignore */ }
  }

  function handleDrop(targetGroup) {
    if (!draggedGroup || draggedGroup === targetGroup) {
      setDraggedGroup(null);
      setDragOverGroup(null);
      return;
    }
    const newOrder = [...orderedGroups];
    newOrder.splice(newOrder.indexOf(draggedGroup), 1);
    newOrder.splice(newOrder.indexOf(targetGroup), 0, draggedGroup);
    persistOrder(newOrder);
    setDraggedGroup(null);
    setDragOverGroup(null);
  }

  function selectGroup(g) {
    if (g === activeGroup) return;
    const oldIdx = orderedGroups.indexOf(activeGroup);
    const newIdx = orderedGroups.indexOf(g);
    setSlideDir(newIdx >= oldIdx ? 'right' : 'left');
    setActiveGroup(g);
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}><div className="b2b-loader" style={{ borderTopColor: '#2563eb' }} /></div>;
  }

  const isSearching = searchQuery.trim().length > 0;
  const q = searchQuery.trim().toLowerCase();
  const searchResults = isSearching
    ? configs.filter((c) => (c.label || '').toLowerCase().includes(q) || c.key.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))
    : [];
  const activeItems = isSearching ? searchResults : (groupsMap[activeGroup] || []);

  return (
    <div className="cfg-wrap">
      {error && (
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626', fontWeight: '600', fontSize: '0.88rem' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="cfg-search">
        <Search size={16} />
        <input
          placeholder="Tìm cấu hình theo tên, key hoặc mô tả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && (
          <button type="button" className="cfg-search-clear" onClick={() => setSearchQuery('')}>
            <X size={14} />
          </button>
        )}
      </div>

      {!isSearching && (
        <div className="cfg-tabs">
          {indicator.ready && (
            <span
              className="cfg-tab-indicator"
              style={{ transform: `translate(${indicator.left}px, ${indicator.top}px)`, width: `${indicator.width}px`, height: `${indicator.height}px` }}
            />
          )}
          {orderedGroups.map((g) => {
            const Icon = CFG_GROUP_ICON[g] || Settings;
            const items = groupsMap[g];
            const dirtyCount = items.filter((c) => String(c.valueInt ?? '') !== String(drafts[c.key] ?? '')).length;
            return (
              <button
                key={g}
                ref={(el) => { if (el) tabRefs.current[g] = el; }}
                type="button"
                draggable
                onDragStart={() => setDraggedGroup(g)}
                onDragOver={(e) => { e.preventDefault(); if (g !== draggedGroup) setDragOverGroup(g); }}
                onDragLeave={() => setDragOverGroup((cur) => (cur === g ? null : cur))}
                onDrop={() => handleDrop(g)}
                onDragEnd={() => { setDraggedGroup(null); setDragOverGroup(null); }}
                onClick={() => selectGroup(g)}
                className={`cfg-tab ${activeGroup === g ? 'active' : ''} ${draggedGroup === g ? 'dragging' : ''} ${dragOverGroup === g ? 'drag-over' : ''}`}
                title="Kéo để sắp xếp lại thứ tự nhóm"
              >
                <GripVertical size={13} className="cfg-tab-grip" />
                <Icon size={15} />
                <span>{CFG_GROUP_LABEL[g] || g}</span>
                <span className="cfg-tab-count">{items.length}</span>
                {dirtyCount > 0 && <span className="cfg-tab-dot" />}
              </button>
            );
          })}
        </div>
      )}

      {isSearching && (
        <p className="cfg-search-meta">{searchResults.length} kết quả cho “{searchQuery}”</p>
      )}

      <div className={`cfg-grid slide-${slideDir}`} key={isSearching ? 'search' : activeGroup}>
        {activeItems.length === 0 && (
          <div className="cfg-empty">Không tìm thấy cấu hình phù hợp.</div>
        )}
        {activeItems.map((c, ix) => {
          const changed = String(c.valueInt ?? '') !== String(drafts[c.key] ?? '');
          const justSaved = savedKey === c.key;
          const isSaving = savingKey === c.key;
          const diff = savedDiff && savedDiff.key === c.key ? savedDiff : null;
          const unit = c.key.includes('vnd') ? 'VND' : c.key.includes('np') ? 'NP'
            : c.key.startsWith('rs_') ? 'RS' : c.key.startsWith('exp_') ? 'EXP' : '';
          return (
            <div
              key={c.key}
              className={`cfg-card ${changed ? 'dirty' : ''} ${justSaved ? 'saved-pulse' : ''}`}
              style={{ animationDelay: `${ix * 35}ms` }}
            >
              {diff && <span className="cfg-diff-toast">{diff.from} → {diff.to}</span>}
              <div className="cfg-card-head">
                <span className="cfg-card-label">{c.label || c.key}</span>
                <code className="cfg-card-key">{c.key}</code>
              </div>
              {c.description && <p className="cfg-card-desc">{c.description}</p>}
              <div className="cfg-card-foot">
                <div className="cfg-input-wrap">
                  <input
                    type="number" min="0"
                    value={drafts[c.key] ?? ''}
                    onChange={(e) => setDrafts((p) => ({ ...p, [c.key]: e.target.value }))}
                    className={`cfg-input ${changed ? 'dirty' : ''}`}
                  />
                  {unit && <span className="cfg-unit">{unit}</span>}
                </div>
                <button
                  type="button"
                  disabled={!changed || isSaving}
                  onClick={() => save(c.key)}
                  className={`cfg-save-btn ${justSaved ? 'saved' : ''} ${changed ? 'dirty' : ''}`}
                >
                  {isSaving ? <span className="cfg-spinner" /> : justSaved ? <><CheckCircle size={15} /> Đã lưu</> : <><Save size={15} /> Lưu</>}
                  {justSaved && (
                    <span className="cfg-burst">
                      {Array.from({ length: 6 }).map((_, i) => <i key={i} className="cfg-particle" />)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProvisionPanel() {
  const [form, setForm] = useState({ name: '', companyType: 'SME', representativeEmail: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [lastLink, setLastLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRecentId, setCopiedRecentId] = useState(null);
  const [provisionSearchQuery, setProvisionSearchQuery] = useState('');
  const [provisionTab, setProvisionTab] = useState('active');
  const [resendingId, setResendingId] = useState(null);

  const [recentProvisions, setRecentProvisions] = useState(() => {
    try {
      const saved = localStorage.getItem('np_recent_provisions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const ORG_TYPES = [
    { key: 'SME', label: 'Doanh nghiệp SME', icon: Building, desc: 'Các doanh nghiệp vừa và nhỏ' },
    { key: 'STARTUP', label: 'Startup', icon: Zap, desc: 'Các công ty công nghệ sáng tạo' },
    { key: 'CLUB', label: 'CLB Sinh Viên', icon: GraduationCap, desc: 'CLB & Tổ chức Sinh viên trường' },
    { key: 'AGENCY', label: 'Agency / Headhunter', icon: Users, desc: 'Đơn vị tuyển dụng ngoài' },
    { key: 'ENTERPRISE', label: 'Tập đoàn', icon: Briefcase, desc: 'Doanh nghiệp lớn đa quốc gia' },
  ];

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleTypeSelect(typeKey) {
    setForm((current) => ({ ...current, companyType: typeKey }));
  }

  async function handleCopyText(text, isLastLink = true, entryId = null) {
    try {
      await navigator.clipboard.writeText(text);
      if (isLastLink) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedRecentId(entryId);
        setTimeout(() => setCopiedRecentId(null), 2000);
      }
    } catch {
      // fallback
    }
  }

  async function handleResend(entry) {
    if (resendingId) return;
    setResendingId(entry.id);
    setStatus({ type: 'idle', message: '' });
    try {
      const result = await provisionCompany({
        name: entry.name,
        companyType: entry.companyType,
        representativeEmail: entry.email
      });
      const inviteLink = result?.inviteUrl || '';
      
      const updated = recentProvisions.map((item) => {
        if (item.id === entry.id) {
          return {
            ...item,
            link: inviteLink,
            date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          };
        }
        return item;
      });
      setRecentProvisions(updated);
      localStorage.setItem('np_recent_provisions', JSON.stringify(updated));

      setStatus({
        type: 'success',
        message: `Đã gửi lại email mời tới ${entry.email} thành công!`
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: `Gửi lại lời mời tới ${entry.email} thất bại: ${err.message}`
      });
    } finally {
      setResendingId(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.representativeEmail.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập tên tổ chức và email người đại diện.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Đang khởi tạo tổ chức và gửi lời mời qua email...' });
    setLastLink('');
    setCopiedLink(false);
    try {
      const result = await provisionCompany(form);
      const inviteLink = result?.inviteUrl || '';
      setLastLink(inviteLink);
      
      const success = !!result?.emailSent;
      setStatus({
        type: success ? 'success' : 'error',
        message: success
          ? `Đã tạo tài khoản và gửi email mời tới ${result.email} thành công!`
          : `Đã tạo tài khoản cho ${result.email} nhưng chưa gửi được email. Vui lòng sao chép link mời bên dưới gửi thủ công.`,
      });

      // Add to recent history
      const newEntry = {
        id: Date.now(),
        name: form.name,
        companyType: form.companyType,
        email: form.representativeEmail,
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        link: inviteLink
      };
      const updated = [newEntry, ...recentProvisions];
      setRecentProvisions(updated);
      localStorage.setItem('np_recent_provisions', JSON.stringify(updated));

      // Reset form
      setForm({ name: '', companyType: 'SME', representativeEmail: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Cấp quyền tổ chức thất bại.' });
    }
  }

  // Stepper calculations
  const step1Active = form.name.trim().length > 0;
  const step2Active = form.representativeEmail.includes('@');
  const step3Active = status.type === 'success' || lastLink.length > 0;

  // Date limit for invitations (7 days in ms)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // Search filter
  const queryFiltered = recentProvisions.filter((item) => {
    const nameMatch = (item.name || '').toLowerCase().includes(provisionSearchQuery.toLowerCase());
    const emailMatch = (item.email || '').toLowerCase().includes(provisionSearchQuery.toLowerCase());
    return nameMatch || emailMatch;
  });

  // Snapshot "now" once per mount (the 7-day cutoff need not tick live) so the
  // age filters below stay pure — no Date.now() called during render.
  const [nowTs] = useState(() => Date.now());

  const activeInvites = queryFiltered.filter(
    (item) => typeof item.id === 'number' && (nowTs - item.id) <= SEVEN_DAYS_MS
  );

  const historyInvites = queryFiltered.filter(
    (item) => typeof item.id !== 'number' || (nowTs - item.id) > SEVEN_DAYS_MS
  );

  const totalActiveCount = recentProvisions.filter(
    (item) => typeof item.id === 'number' && (nowTs - item.id) <= SEVEN_DAYS_MS
  ).length;

  const totalHistoryCount = recentProvisions.filter(
    (item) => typeof item.id !== 'number' || (nowTs - item.id) > SEVEN_DAYS_MS
  ).length;

  const visibleList = provisionTab === 'active' ? activeInvites : historyInvites;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)',
      gap: '30px',
      alignItems: 'start',
      flexWrap: 'wrap'
    }}>
      {/* Left Column: Form Panel */}
      <div className="adm-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Step Progress Stepper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-soft)',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #f0f0f5',
          marginBottom: '4px'
        }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: step1Active ? '#0066cc' : 'rgba(0, 0, 0, 0.05)',
              color: step1Active ? '#ffffff' : '#7a7a7a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '800', transition: 'all 250ms ease',
              boxShadow: step1Active ? '0 3px 8px rgba(0, 102, 204, 0.2)' : 'none'
            }}>
              1
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: step1Active ? '#1d1d1f' : '#7a7a7a', transition: 'all 250ms ease' }}>Tổ chức</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: step2Active ? '#0066cc' : 'var(--line)', margin: '0 12px', transition: 'all 250ms ease' }} />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: step2Active ? '#0066cc' : 'rgba(0, 0, 0, 0.05)',
              color: step2Active ? '#ffffff' : '#7a7a7a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '800', transition: 'all 250ms ease',
              boxShadow: step2Active ? '0 3px 8px rgba(0, 102, 204, 0.2)' : 'none'
            }}>
              2
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: step2Active ? '#1d1d1f' : '#7a7a7a', transition: 'all 250ms ease' }}>Đại diện</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: step3Active ? '#0066cc' : 'var(--line)', margin: '0 12px', transition: 'all 250ms ease' }} />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: step3Active ? '#16a34a' : 'rgba(0, 0, 0, 0.05)',
              color: step3Active ? '#ffffff' : '#7a7a7a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '800', transition: 'all 250ms ease',
              boxShadow: step3Active ? '0 3px 8px rgba(22, 163, 74, 0.2)' : 'none'
            }}>
              3
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: step3Active ? '#16a34a' : '#7a7a7a', transition: 'all 250ms ease' }}>Lời mời</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Organisation Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tên tổ chức / Đối tác</label>
            <input
              name="name"
              value={form.name}
              onChange={update}
              placeholder="Ví dụ: Công ty TNHH Giải pháp Công nghệ Next"
              required
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--line)',
                fontSize: '14px',
                outline: 'none',
                background: 'var(--surface)',
                color: 'var(--ink)',
                transition: 'all 200ms ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0066cc';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 204, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Grid-based Card Selector for Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phân loại đối tác</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px'
            }}>
              {ORG_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = form.companyType === type.key;
                const activeColor = type.key === 'CLUB' ? '#ff7a1a' : '#0066cc';
                
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => handleTypeSelect(type.key)}
                    className="prov-type-card"
                    style={{
                      padding: '14px 12px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${activeColor}` : '1.5px solid var(--line)',
                      background: isSelected ? `${activeColor}04` : 'var(--surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      alignItems: 'flex-start',
                      boxShadow: isSelected ? `0 4px 14px ${activeColor}12` : 'none'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isSelected ? `${activeColor}12` : 'var(--surface-soft)',
                      color: isSelected ? activeColor : '#7a7a7a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 200ms ease'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{type.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', lineHeight: '1.3' }}>{type.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Representative Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email người đại diện (Tài khoản sở hữu)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--muted)' }} />
              <input
                name="representativeEmail"
                type="email"
                value={form.representativeEmail}
                onChange={update}
                placeholder="nguoidaidien@doitac.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  transition: 'all 200ms ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066cc';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 204, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="button primary-button"
            disabled={status.type === 'loading'}
            style={{
              height: '42px',
              padding: '0 24px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: status.type === 'loading' ? 'not-allowed' : 'pointer',
              background: '#0066cc',
              color: '#ffffff',
              border: 'none',
              alignSelf: 'flex-start',
              boxShadow: '0 4px 14px rgba(0, 102, 204, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 200ms ease'
            }}
            onMouseOver={(e) => {
              if (status.type !== 'loading') {
                e.currentTarget.style.background = '#0052a3';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (status.type !== 'loading') {
                e.currentTarget.style.background = '#0066cc';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {status.type === 'loading' ? (
              <>
                <RefreshCw size={14} className="adm-spin" />
                Đang khởi tạo...
              </>
            ) : (
              'Cấp quyền & Gửi lời mời'
            )}
          </button>
        </form>

        {/* Premium SVG Checkmark Draw Success Display Card */}
        {status.message && status.type === 'success' && (
          <div className="prov-success-pane" style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(22, 163, 74, 0.05)',
            border: '1px solid rgba(22, 163, 74, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px'
          }}>
            {/* SVG checkmark draw-in animation */}
            <svg width="48" height="48" viewBox="0 0 52 52" style={{ display: 'block' }}>
              <circle className="prov-checkmark-circle" cx="26" cy="26" r="25" />
              <path className="prov-checkmark-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#16a34a', marginBottom: '4px' }}>Khởi tạo thành công!</strong>
              <span style={{ fontSize: '13px', color: '#555555', lineHeight: '1.4' }}>{status.message}</span>
            </div>
          </div>
        )}

        {/* Failed status */}
        {status.message && status.type === 'error' && (
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(220, 38, 38, 0.06)',
            border: '1px solid rgba(220, 38, 38, 0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '13px',
            color: '#dc2626',
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'rgba(220, 38, 38, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <span>⚠</span>
            </div>
            <div>{status.message}</div>
          </div>
        )}

        {/* Generated Invitation Link Card */}
        {lastLink && (
          <div style={{
            background: 'var(--surface-soft)',
            border: '1.5px dashed #0066cc',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0066cc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Link mời tham gia (Sẵn sàng)</span>
              <button
                type="button"
                onClick={() => handleCopyText(lastLink, true)}
                style={{
                  border: 'none',
                  background: copiedLink ? '#16a34a' : 'rgba(0, 102, 204, 0.08)',
                  color: copiedLink ? '#ffffff' : '#0066cc',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 200ms ease'
                }}
              >
                {copiedLink ? <Check size={10} /> : <Copy size={10} />}
                {copiedLink ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            </div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#333',
              wordBreak: 'break-all',
              lineHeight: '1.4'
            }}>
              {lastLink}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Recent Provisioning History */}
      <div className="adm-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '400px' }}>
        <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '14px', marginBottom: '4px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--ink)' }}>Lời mời được tạo</h2>
          <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
            Quản lý tất cả lời mời cấp quyền đã được gửi đi từ trình duyệt của bạn.
          </span>
        </div>

        {/* Search bar inside right column */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
          <input
            type="text"
            value={provisionSearchQuery}
            onChange={(e) => setProvisionSearchQuery(e.target.value)}
            placeholder="Tìm theo tên đối tác hoặc email..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '9999px',
              border: '1.5px solid var(--line)',
              fontSize: '13px',
              outline: 'none',
              background: 'var(--surface-soft)',
              color: 'var(--ink)',
              transition: 'all 200ms ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0066cc';
              e.target.style.background = 'var(--surface)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e5ea';
              e.target.style.background = 'var(--surface-soft)';
            }}
          />
        </div>

        {/* Dynamic subtabs switcher for Active vs History */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-soft)',
          padding: '2px',
          borderRadius: '9999px',
          border: '1px solid var(--line)',
          gap: '2px',
          width: 'fit-content'
        }}>
          <button
            type="button"
            onClick={() => setProvisionTab('active')}
            style={{
              border: 'none',
              background: provisionTab === 'active' ? 'var(--surface)' : 'transparent',
              color: provisionTab === 'active' ? '#0066cc' : '#7a7a7a',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: provisionTab === 'active' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 180ms ease'
            }}
          >
            Hoạt động ({totalActiveCount})
          </button>
          <button
            type="button"
            onClick={() => setProvisionTab('history')}
            style={{
              border: 'none',
              background: provisionTab === 'history' ? 'var(--surface)' : 'transparent',
              color: provisionTab === 'history' ? '#0066cc' : '#7a7a7a',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: provisionTab === 'history' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 180ms ease'
            }}
          >
            Lịch sử ({totalHistoryCount})
          </button>
        </div>

        {recentProvisions.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: 'var(--muted)',
            textAlign: 'center',
            padding: '40px 20px',
            gap: '16px'
          }}>
            {/* Beautiful inline guided workflow illustration */}
            <svg width="220" height="90" viewBox="0 0 220 90" style={{ opacity: 0.85 }}>
              <rect x="10" y="25" width="46" height="40" rx="8" fill="#e5edff" stroke="#0066cc" strokeWidth="1.5" />
              <text x="33" y="49" textAnchor="middle" fill="#0066cc" fontSize="10" fontWeight="bold">Admin</text>
              
              <path d="M64 45 h36" stroke="#0066cc" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="104,45 98,42 98,48" fill="#0066cc" />
              
              <rect x="110" y="25" width="100" height="40" rx="8" fill="#fafafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="160" y="44" textAnchor="middle" fill="#1d1d1f" fontSize="9" fontWeight="bold">Tổ chức B2B</text>
              <text x="160" y="55" textAnchor="middle" fill="#7a7a7a" fontSize="8">Mời qua Email</text>
              
              <circle cx="160" cy="18" r="8" fill="#16a34a" />
              <path d="M157 18.5 l2 2.2 l4 -4.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            </svg>

            <div>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>Chưa cấp quyền tổ chức nào</strong>
              <span style={{ fontSize: '12px', display: 'block', marginTop: '4px', lineHeight: '1.4' }}>
                Khi bạn khởi tạo đối tác mới thành công, thông tin và liên kết mời sẽ được lưu lịch sử tại đây.
              </span>
            </div>
          </div>
        ) : visibleList.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: 'var(--muted)',
            textAlign: 'center',
            padding: '40px 20px',
            gap: '12px'
          }}>
            <Search size={24} style={{ color: '#aeaeb2' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>
                {provisionSearchQuery.trim() !== '' ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
              </strong>
              <span style={{ fontSize: '12px', display: 'block', marginTop: '4px', lineHeight: '1.4' }}>
                {provisionSearchQuery.trim() !== ''
                  ? 'Không tìm thấy lời mời nào khớp với từ khóa tìm kiếm.'
                  : provisionTab === 'active'
                  ? 'Không có lời mời hoạt động nào được gửi trong vòng 7 ngày qua.'
                  : 'Không có lịch sử lời mời nào gửi cách đây hơn 7 ngày.'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {visibleList.map((entry, index) => {
              const typeObj = ORG_TYPES.find((t) => t.key === entry.companyType);
              const color = entry.companyType === 'CLUB' ? '#ff7a1a' : '#0066cc';
              const isCopied = copiedRecentId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="prov-history-item"
                  style={{
                    background: 'var(--surface-soft)',
                    border: '1px solid #f0f0f5',
                    borderRadius: '12px',
                    padding: '14px',
                    position: 'relative',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {entry.name}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{entry.email}</span>
                    </div>

                    <span className="badge-role" style={{ background: `${color}08`, color: color, fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                      {typeObj?.label || entry.companyType}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f0f0f5',
                    paddingTop: '10px',
                    fontSize: '11px',
                    color: 'var(--muted)'
                  }}>
                    <span>Gửi lúc: {entry.date}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {provisionTab === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleResend(entry)}
                          disabled={resendingId === entry.id}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#0066cc',
                            cursor: 'pointer',
                            fontWeight: '600',
                            padding: '4px 0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 150ms ease'
                          }}
                        >
                          <RefreshCw size={10} className={resendingId === entry.id ? "adm-spin" : ""} />
                          {resendingId === entry.id ? 'Đang gửi...' : 'Mời lại'}
                        </button>
                      )}
                      {entry.link && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(entry.link, false, entry.id)}
                          style={{
                            border: 'none',
                            background: isCopied ? '#16a34a' : 'transparent',
                            color: isCopied ? '#ffffff' : '#0066cc',
                            cursor: 'pointer',
                            fontWeight: '600',
                            padding: isCopied ? '4px 8px' : '4px 0',
                            borderRadius: isCopied ? '4px' : '0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 150ms ease'
                          }}
                        >
                          {isCopied ? <Check size={10} /> : <Copy size={10} />}
                          {isCopied ? 'Đã chép!' : 'Chép link'}
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
    </div>
  );
}/* ── Lightweight inline SVG charts (no external lib) ── */
function CountUp({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const to = value || 0;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display.toLocaleString('vi-VN');
}

function useElementWidth(fallback = 600) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setWidth(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

function DonutCard({ data, centerValue, centerLabel, size = 176, thickness = 24 }) {
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const segments = data.map((d) => {
    const len = ((d.value || 0) / total) * circ;
    const seg = { ...d, len, offset: acc };
    acc += len;
    return seg;
  });
  const hovered = hoverIdx !== null ? segments[hoverIdx] : null;

  return (
    <div className="adm-donut-row">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="adm-donut-svg">
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" className="adm-donut-track" strokeWidth={thickness} />
          {total > 0 && segments.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color}
              strokeWidth={hoverIdx === i ? thickness + 5 : thickness}
              strokeDasharray={`${s.len} ${circ - s.len}`}
              strokeDashoffset={mounted ? -s.offset : circ - s.offset}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.3}
              className="adm-donut-seg"
              style={{ transitionDelay: `${i * 130}ms` }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}
        </g>
        <text x={cx} y={cy - 3} textAnchor="middle" className="adm-donut-center-val">
          {hovered ? hovered.value : <CountUp value={centerValue ?? total} />}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" className="adm-donut-center-label">
          {hovered ? hovered.label : centerLabel}
        </text>
      </svg>
      <div className="adm-legend">
        {data.map((d, i) => (
          <div
            key={d.label}
            className={`adm-legend-row ${hoverIdx === i ? 'active' : ''}`}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <span className="adm-legend-dot" style={{ background: d.color }} />
            <span className="adm-legend-label">{d.label}</span>
            <strong className="adm-legend-val">{d.value}</strong>
            <span className="adm-legend-pct">{total > 0 ? Math.round(((d.value || 0) / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  return (
    <div className="adm-barlist">
      {data.map((d, i) => (
        <div key={d.label} className="adm-barlist-row">
          <div className="adm-barlist-top">
            <span className="adm-barlist-label">{d.label}</span>
            <strong className="adm-barlist-val"><CountUp value={d.value} duration={650} /></strong>
          </div>
          <div className="adm-barlist-track">
            <div
              className="adm-barlist-fill"
              style={{ width: mounted ? `${((d.value || 0) / max) * 100}%` : '0%', background: d.color, transitionDelay: `${i * 70}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ points, height = 210, color = '#0066cc', deltaPct }) {
  const [wrapRef, width] = useElementWidth(640);
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  const gradId = `admTrendGrad-${useId().replace(/:/g, '')}`;
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const pad = 34;
  const innerW = Math.max(1, width - pad * 2);
  const innerH = height - pad * 2;
  const max = Math.max(1, ...points.map((p) => p.count || 0));
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
  const coords = points.map((p, i) => [pad + i * stepX, pad + innerH - ((p.count || 0) / max) * innerH]);

  // Smooth curve through the points (Catmull-Rom → cubic Bézier) so the line
  // reads as a gentle trend rather than a stark zig-zag.
  const smooth = (pts) => {
    if (pts.length < 2) return pts.length ? `M ${pts[0][0]} ${pts[0][1]}` : '';
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const t = 0.18;
      const c1x = p1[0] + (p2[0] - p0[0]) * t;
      const c1y = p1[1] + (p2[1] - p0[1]) * t;
      const c2x = p2[0] - (p3[0] - p1[0]) * t;
      const c2y = p2[1] - (p3[1] - p1[1]) * t;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  };
  const line = smooth(coords);
  const area = `${line} L ${pad + innerW} ${pad + innerH} L ${pad} ${pad + innerH} Z`;

  return (
    <div className="adm-trend-wrap" ref={wrapRef}>
      {typeof deltaPct === 'number' && (
        <span className={`adm-trend-delta ${deltaPct >= 0 ? 'up' : 'down'}`}>
          {deltaPct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {deltaPct >= 0 ? '+' : ''}{deltaPct}% so với tuần trước
        </span>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={pad + innerW} y1={pad + innerH * g} y2={pad + innerH * g} className="adm-trend-grid" />
        ))}
        <path d={area} fill={`url(#${gradId})`} className={`adm-trend-area ${mounted ? 'in' : ''}`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
          pathLength="1" className={`adm-trend-line ${mounted ? 'in' : ''}`} />
        {hoverIdx !== null && (
          <line x1={coords[hoverIdx][0]} x2={coords[hoverIdx][0]} y1={pad} y2={pad + innerH} className="adm-trend-crosshair" />
        )}
        {coords.map((c, i) => (
          <circle
            key={i} cx={c[0]} cy={c[1]} r="3.5" fill={color}
            className={`adm-trend-dot ${mounted ? 'in' : ''} ${hoverIdx === i ? 'hovered' : ''}`}
            style={{ transitionDelay: mounted ? `${650 + i * 45}ms` : '0ms' }}
            onMouseEnter={() => setHoverIdx(i)}
          />
        ))}
        {points.map((p, i) => (
          <text key={i} x={coords[i][0]} y={height - 7} textAnchor="middle" className="adm-trend-axis">{p.date.slice(5)}</text>
        ))}
      </svg>
      {hoverIdx !== null && (
        <div className="adm-trend-tooltip" style={{ left: `${(coords[hoverIdx][0] / width) * 100}%`, top: `${(coords[hoverIdx][1] / height) * 100}%` }}>
          <strong>{points[hoverIdx].count}</strong> người dùng mới
          <span>{points[hoverIdx].date}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Real Astryx Skeleton placeholder for the admin content pane — replaces the
 * old blur-filter + top progress bar + floating glass pill treatment
 * (2026-07-06 feedback: use Skeleton, astryx.atmeta.com/components/Skeleton,
 * instead). Shape approximates the common tab layout: a KPI-card row + a few
 * table-like rows below, per Skeleton's own guidance to preview the shape of
 * the real content rather than a generic spinner.
 */
function AdminContentSkeleton() {
  return (
    <VStack gap={5}>
      <HStack gap={4}>
        {[0, 1, 2].map((i) => (
          <Card key={i} padding={4} width="100%">
            <VStack gap={2}>
              <Skeleton width={90} height={12} index={i} />
              <Skeleton width={60} height={26} index={i + 3} />
              <Skeleton width="70%" height={10} index={i + 6} />
            </VStack>
          </Card>
        ))}
      </HStack>
      <VStack gap={3}>
        {[0, 1, 2, 3, 4].map((rowIndex) => (
          <HStack key={rowIndex} gap={4} vAlign="center">
            <Skeleton width={36} height={36} radius="rounded" index={rowIndex * 4 + 9} />
            <Skeleton width={220} height={14} index={rowIndex * 4 + 10} />
            <Skeleton width={120} height={14} index={rowIndex * 4 + 11} />
            <Skeleton width={80} height={14} index={rowIndex * 4 + 12} />
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

export function AdminB2bReviewPage() {
  const navigate = useNavigate();
  // Admin portal is light-only (no dark mode toggle) — force the app out of
  // dark mode on entry so it never inherits a dark preference set elsewhere.
  const { isDark, setTheme } = useTheme();
  useEffect(() => {
    if (isDark) setTheme('light');
  }, [isDark, setTheme]);
  const { tabSlug = '', subTabSlug = '' } = useParams();
  const activeTab = ROUTE_TO_TAB[tabSlug] || 'OVERVIEW';
  const [jobsSubTab, setJobsSubTab] = useState('new');
  const [verifSubTab, setVerifSubTab] = useState('pending');
  const [b2bSubTab, setB2bSubTab] = useState('pending');
  const [adminEmail, setAdminEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Manually-toggled nav sections (chevron click). Keys present here override
  // the route-derived default (expanded when its tab is the active section);
  // keys absent fall back to that default.
  const [manualNavExpand, setManualNavExpand] = useState(() => new Map());

  /* ─── State for B2B reviews ─── */
  const [pendingB2b, setPendingB2b] = useState([]);
  const [b2bPendingCount, setB2bPendingCount] = useState(0);
  const [filteredB2b, setFilteredB2b] = useState([]);
  const [activeB2bFilter, setActiveB2bFilter] = useState('ALL');
  const [searchB2bQuery, setSearchB2bQuery] = useState('');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewingDoc, setPreviewingDoc] = useState(null);
  const [b2bViewMode, setB2bViewMode] = useState('grid');
  const [jobsViewMode, setJobsViewMode] = useState('grid');
  const [jobsCurrentPage, setJobsCurrentPage] = useState(1);
  const [b2bCurrentPage, setB2bCurrentPage] = useState(1);
  const B2B_PER_PAGE = 8;
  const [jobsVisibleColumns, setJobsVisibleColumns] = useState({
    title: true,
    company: true,
    type: true,
    category: true,
    capacity: true,
    deadline: true,
    date: true,
    status: true
  });
  const [showJobsColConfig, setShowJobsColConfig] = useState(false);
  const [b2bVisibleColumns, setB2bVisibleColumns] = useState({
    partner: true,
    type: true,
    school: true,
    owner: true,
    document: true,
    status: true
  });
  const [showB2bColConfig, setShowB2bColConfig] = useState(false);

  /* ─── State for Overview ─── */
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);

  /* ─── State for Users ─── */
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [userViewMode, setUserViewMode] = useState('grid');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const USERS_PER_PAGE = 12;
  const [visibleColumns, setVisibleColumns] = useState({
    account: true,
    roles: true,
    premium: true,
    status: true,
    createdAt: true
  });
  const [showColConfig, setShowColConfig] = useState(false);

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
  const [verifViewMode, setVerifViewMode] = useState('grid');
  const [verifCurrentPage, setVerifCurrentPage] = useState(1);
  const [searchVerifQuery, setSearchVerifQuery] = useState('');
  const [verifVisibleColumns, setVerifVisibleColumns] = useState({
    candidate: true,
    count: true,
    priority: true,
    stats: true,
    status: true
  });
  const [showVerifColConfig, setShowVerifColConfig] = useState(false);
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
      const storedUser = sessionStorage.getItem('nextplease:current_user') || localStorage.getItem('nextplease:current_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (err) {
          console.warn('Cannot parse stored user info:', err);
        }
      }
    }

    // Always fetch latest profile to get real appUserId if token is available
    if (token) {
      fetchCurrentUser()
        .then(profile => {
          if (profile) {
            setCurrentUser(prev => ({
              ...prev,
              id: profile.appUserId,
              appUserId: profile.appUserId,
              email: profile.email || prev?.email || 'admin@nextplease.vn',
              roles: Array.from(profile.roles || prev?.roles || ['admin'])
            }));
          }
        })
        .catch(err => console.warn('Failed to fetch current user profile:', err));
    }
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
        setB2bPendingCount(b2bData ? b2bData.length : 0);
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

  /* Sync B2B sub-tab from URL */
  useEffect(() => {
    if (activeTab === 'B2B_REVIEWS' && subTabSlug) {
      if (subTabSlug === 'pending' || subTabSlug === 'approved') {
        setB2bSubTab(subTabSlug);
      } else {
        navigate(getAdminTabPath('B2B_REVIEWS', 'pending'), { replace: true });
      }
    }
  }, [activeTab, subTabSlug, navigate]);

  /* Redirect: bare /b2b-reviews → /b2b-reviews/overview */
  useEffect(() => {
    if (!tabSlug) {
      navigate(`${ADMIN_BASE_PATH}/overview`, { replace: true });
    } else if (!ROUTE_TO_TAB[tabSlug]) {
      navigate(`${ADMIN_BASE_PATH}/overview`, { replace: true });
    } else if (tabSlug === 'b2b-partners' && !subTabSlug) {
      navigate(getAdminTabPath('B2B_REVIEWS', 'pending'), { replace: true });
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
        // Trạng thái vận hành thời gian thực (fail-soft: không chặn dashboard nếu lỗi)
        getAdminHealth().then(setHealth).catch(() => setHealth(null));
      } else if (tabKey === 'USERS') {
        const data = await getAdminUsers();
        setUsers(data || []);
      } else if (tabKey === 'B2B_REVIEWS') {
        const data = b2bSubTab === 'approved'
          ? await getApprovedB2bRegistrations()
          : await getPendingB2bRegistrations();
        setPendingB2b(data || []);
        if (b2bSubTab === 'pending') {
          setB2bPendingCount(data ? data.length : 0);
        }
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
  }, [activeTab, tabSlug, b2bSubTab]);

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
    setB2bCurrentPage(1);
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
    setUserCurrentPage(1);
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
    setJobsCurrentPage(1);
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

  /* Duyệt toàn bộ tin đang chờ của một nhóm DN/CLB */
  function getGroupPendingJobs() {
    if (!selectedJobGroup) return [];
    return selectedJobGroup.jobs.filter((j) => {
      const live = jobs.find((x) => x.id === j.id) || j;
      const isPending = (j.status || '').toLowerCase() === 'pending';
      const claimedByOther = !!live.claimedByAdminId && live.claimedByMe !== true;
      return isPending && !claimedByOther;
    });
  }

  function openApproveAllGroupConfirmation() {
    const pendingJobs = getGroupPendingJobs();
    if (pendingJobs.length === 0) {
      setActionStatus({ type: 'error', message: 'Không có tin nào đang chờ duyệt (hoặc đã bị admin khác nhận).' });
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Duyệt toàn bộ tin',
      message: `Bạn có chắc chắn muốn phê duyệt tất cả ${pendingJobs.length} tin đang chờ của "${selectedJobGroup.companyName}"? Tất cả sẽ được hiển thị công khai cho ứng viên.`,
      confirmText: `Duyệt tất cả (${pendingJobs.length})`,
      confirmColor: '#16a34a',
      onConfirm: () => handleApproveAllGroupExecute(pendingJobs),
    });
  }

  async function handleApproveAllGroupExecute(pendingJobs) {
    setActionStatus({ type: 'loading', message: `Đang duyệt ${pendingJobs.length} tin...` });
    let ok = 0;
    let fail = 0;
    for (const job of pendingJobs) {
      try {
        await approveJob(job.id);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setActionStatus({
      type: fail === 0 ? 'success' : 'error',
      message: fail === 0
        ? `Đã duyệt toàn bộ ${ok} tin thành công!`
        : `Đã duyệt ${ok} tin, ${fail} tin thất bại.`,
    });
    setSelectedJobGroup(null);
    fetchTabData(activeTab);
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
      localStorage.removeItem('nextplease:admin-bypass');
      await logout();
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

    const userComp = [
      { label: 'Ứng viên', value: stats.totalCandidates || 0, color: '#0066cc' },
      { label: 'Doanh nghiệp SME', value: stats.totalCompanies || 0, color: '#34c759' },
      { label: 'CLB & Tổ chức', value: stats.totalClubs || 0, color: '#ff9f0a' },
    ];
    const userTotal = userComp.reduce((s, d) => s + d.value, 0);
    const contentComp = [
      { label: 'Cơ hội việc làm', value: stats.totalJobs || 0, color: '#5e5ce6' },
      { label: 'Quest & chiến dịch', value: stats.totalQuests || 0, color: '#32ade6' },
    ];
    const JOB_ST = {
      DRAFT: { label: 'Nháp', color: '#aeaeb2' },
      PENDING: { label: 'Chờ duyệt', color: '#ff9f0a' },
      OPEN: { label: 'Đang mở', color: '#34c759' },
      REJECTED: { label: 'Từ chối', color: '#ff3b30' },
      CLOSED: { label: 'Đã đóng', color: '#8e8e93' },
      COMPLETED: { label: 'Hoàn thành', color: '#0066cc' },
      CANCELLED: { label: 'Đã hủy', color: '#c7c7cc' },
    };
    const toStatusData = (obj) => obj && Object.keys(obj).length > 0
      ? Object.entries(obj).map(([k, v]) => ({ label: JOB_ST[k]?.label || k, value: v, color: JOB_ST[k]?.color || '#6b7280' }))
      : null;
    const jobStatusData = toStatusData(stats.jobsByStatus);
    const questStatusData = toStatusData(stats.questsByStatus);
    const signups = Array.isArray(stats.signupsLast7Days) ? stats.signupsLast7Days : null;
    const signupsTotal7d = signups ? signups.reduce((s, p) => s + (p.count || 0), 0) : 0;
    const prev7d = stats.signupsPrevious7Days;
    const deltaPct = (signups && typeof prev7d === 'number')
      ? (prev7d > 0 ? Math.round(((signupsTotal7d - prev7d) / prev7d) * 100) : (signupsTotal7d > 0 ? 100 : 0))
      : undefined;

    // Tính % tăng trưởng kỳ này so với kỳ trước từ cặp {last7, prev7} do BE trả về.
    const growthPct = (d) => {
      if (!d) return undefined;
      const { last7 = 0, prev7 = 0 } = d;
      if (prev7 > 0) return Math.round(((last7 - prev7) / prev7) * 100);
      return last7 > 0 ? 100 : 0;
    };
    const dl = stats.deltas || {};
    const statCards = [
      { label: 'Ứng viên', value: stats.totalCandidates, icon: Users, color: '#0066cc', hint: 'Tài khoản ứng viên', delta: growthPct(dl.candidates) },
      { label: 'Doanh nghiệp SME', value: stats.totalCompanies, icon: Building, color: '#34c759', hint: 'Đối tác tuyển dụng', delta: growthPct(dl.companies) },
      { label: 'CLB & Tổ chức', value: stats.totalClubs, icon: GraduationCap, color: '#ff9f0a', hint: 'Câu lạc bộ, tổ chức', delta: growthPct(dl.clubs) },
      { label: 'Chờ duyệt B2B', value: stats.totalPendingB2b, icon: Clock, color: '#ff9500', accent: true, hint: 'Hồ sơ đối tác B2B' },
      { label: 'Cơ hội việc làm', value: stats.totalJobs, icon: FileText, color: '#5e5ce6', hint: 'Tin tuyển dụng', delta: growthPct(dl.jobs) },
      { label: 'Quest & Chiến dịch', value: stats.totalQuests, icon: Activity, color: '#32ade6', hint: 'Nhiệm vụ CLB', delta: growthPct(dl.quests) },
      { label: 'Nhật ký hệ thống', value: stats.totalLogs, icon: ShieldCheck, color: '#8e8e93', hint: 'Bản ghi hoạt động' },
    ];

    return (
      <div className="adm-ov adm-fade-in-slide">
        <p className="adm-section-label">Tổng quan</p>
        <div className="adm-kpi-grid">
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className={`adm-kpi-card ${c.accent ? 'accent' : ''}`}
                style={{ '--kpi': c.color, animationDelay: `${i * 55}ms` }}
              >
                <span className="adm-kpi-ico"><Icon size={17} /></span>
                <div className="adm-kpi-body">
                  <span className="adm-kpi-label">{c.label}</span>
                  <div className="adm-kpi-valrow">
                    <div className="adm-kpi-value"><CountUp value={c.value ?? 0} /></div>
                    {typeof c.delta === 'number' && c.delta !== 0 && (
                      <span className={`adm-kpi-delta ${c.delta > 0 ? 'up' : 'down'}`}>
                        {c.delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {c.delta > 0 ? '+' : ''}{c.delta}%
                      </span>
                    )}
                  </div>
                  <span className="adm-kpi-hint">{c.hint}</span>
                </div>
                {c.accent && (c.value ?? 0) > 0 && <span className="adm-kpi-flag">Cần xử lý</span>}
              </div>
            );
          })}
        </div>

        <p className="adm-section-label">Phân bổ</p>
        <div className="adm-grid-2">
          <div className="adm-card adm-fade-item" style={{ animationDelay: '90ms' }}>
            <div className="adm-card-head"><h3>Cơ cấu người dùng & tổ chức</h3></div>
            <DonutCard data={userComp} centerValue={userTotal} centerLabel="Tài khoản" />
          </div>
          <div className="adm-card adm-fade-item" style={{ animationDelay: '140ms' }}>
            <div className="adm-card-head"><h3>Nội dung hệ thống</h3></div>
            <DonutCard data={contentComp} centerValue={(stats.totalJobs || 0) + (stats.totalQuests || 0)} centerLabel="Bài đăng" />
          </div>
        </div>

        {(jobStatusData || questStatusData || signups) && (
          <>
            <p className="adm-section-label">Trạng thái & xu hướng</p>
            <div className="adm-grid-2">
              {jobStatusData && (
                <div className="adm-card adm-fade-item" style={{ animationDelay: '190ms' }}>
                  <div className="adm-card-head"><h3>Tin tuyển dụng theo trạng thái</h3></div>
                  <BarList data={jobStatusData} />
                </div>
              )}
              {questStatusData && (
                <div className="adm-card adm-fade-item" style={{ animationDelay: '235ms' }}>
                  <div className="adm-card-head"><h3>Quest theo trạng thái</h3></div>
                  <BarList data={questStatusData} />
                </div>
              )}
              {signups && (
                <div className="adm-card adm-fade-item" style={{ gridColumn: (jobStatusData && questStatusData) ? '1 / -1' : 'auto', animationDelay: '280ms' }}>
                  <div className="adm-card-head"><h3>Người dùng mới · 7 ngày gần nhất</h3></div>
                  <TrendChart points={signups} deltaPct={deltaPct} />
                </div>
              )}
            </div>
          </>
        )}

        <p className="adm-section-label">Vận hành</p>
        <div className="adm-card adm-fade-item" style={{ animationDelay: '330ms' }}>
          <div className="adm-card-head"><h3>Trạng thái hệ thống</h3></div>
          <div className="adm-status-strip">
            {(() => {
              const fmtUptime = (s) => {
                if (!s && s !== 0) return '—';
                const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
                if (d > 0) return `${d} ngày ${h} giờ`;
                if (h > 0) return `${h} giờ ${m} phút`;
                return `${m} phút`;
              };
              const dbUp = health?.dbUp;
              const migOk = health?.migrationsOk;
              return (
                <>
                  <span className={`adm-status-pill ${dbUp ? 'good' : health ? 'bad' : 'info'}`}>
                    <span className="adm-status-dot" /> {dbUp ? 'API & Database ổn định' : health ? 'Mất kết nối Database' : 'Đang kiểm tra...'}
                  </span>
                  <span className={`adm-status-pill ${migOk ? 'good' : health ? 'bad' : 'info'}`}>
                    <span className="adm-status-dot" /> Migration {health?.migrationVersion ? `v${health.migrationVersion}` : ''} {migOk ? 'đã đồng bộ' : health ? 'chưa đồng bộ' : ''}
                  </span>
                  <span className="adm-status-pill info">
                    <span className="adm-status-dot" /> Uptime: {fmtUptime(health?.uptimeSeconds)}
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        <div className="adm-actions">
          <button type="button" className="adm-action adm-fade-item" style={{ animationDelay: '380ms' }} onClick={() => navigate(getAdminTabPath('B2B_REVIEWS'))}>
            <span className="adm-action-ico accent"><Clock size={20} /></span>
            <div className="adm-action-body">
              <h4>Duyệt hồ sơ đối tác B2B</h4>
              <p>Có <strong>{stats.totalPendingB2b}</strong> hồ sơ đang chờ xét duyệt.</p>
            </div>
            <ArrowRight size={18} className="adm-action-arrow" />
          </button>
          <button type="button" className="adm-action adm-fade-item" style={{ animationDelay: '420ms' }} onClick={() => navigate(getAdminTabPath('AUDIT_LOGS'))}>
            <span className="adm-action-ico"><ShieldCheck size={20} /></span>
            <div className="adm-action-body">
              <h4>Nhật ký hoạt động hệ thống</h4>
              <p>Theo dõi lịch sử thao tác của người dùng và quản trị viên.</p>
            </div>
            <ArrowRight size={18} className="adm-action-arrow" />
          </button>
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
    // Calculate dashboard statistics dynamically for the users tab
    const totalUsers = users.length;
    const adminCount = users.filter(u => (u.roles || '').toLowerCase().includes('admin')).length;
    const candidateCount = users.filter(u => (u.roles || '').toLowerCase().includes('candidate')).length;
    const partnerCount = users.filter(u => (u.roles || '').toLowerCase().includes('employer') || (u.roles || '').toLowerCase().includes('organizer')).length;

    const premiumCount = users.filter(u => u.premiumUntil && new Date(u.premiumUntil) > new Date()).length;
    const verifiedStudentCount = users.filter(u => u.studentEmailVerified).length;
    const activeStatusCount = users.filter(u => {
      const rolesStr = (u.roles || '').toLowerCase();
      const isPartner = rolesStr.includes('employer') || rolesStr.includes('organizer');
      if (isPartner) {
        return (u.companyStatus || '').toUpperCase() === 'APPROVED';
      }
      return (u.userStatus || '').toUpperCase() === 'ACTIVE' || !u.userStatus;
    }).length;

    const activePercentage = totalUsers > 0 ? Math.round((activeStatusCount / totalUsers) * 100) : 0;

    // Pagination Calculations
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
      (userCurrentPage - 1) * USERS_PER_PAGE,
      userCurrentPage * USERS_PER_PAGE
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Quick Insights Cards for Users */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '8px'
        }}>
          {/* Card 1: Total Users */}
          <div className="adm-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tổng tài khoản</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: '600', color: 'var(--ink)' }}>{totalUsers}</h3>
              </div>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'rgba(0, 102, 204, 0.06)', color: '#0066cc',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <span>Ứng viên: <strong>{candidateCount}</strong></span>
              <span>Đối tác: <strong>{partnerCount}</strong></span>
              <span>Quản trị viên: <strong>{adminCount}</strong></span>
            </div>
          </div>

          {/* Card 2: Premium Members */}
          <div className="adm-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Hội viên Premium</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: '600', color: '#ff7a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {premiumCount}
                </h3>
              </div>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'rgba(255, 122, 26, 0.08)', color: '#ff7a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Award size={20} />
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <span>Sinh viên đã xác thực: <strong>{verifiedStudentCount}</strong></span>
            </div>
          </div>

          {/* Card 3: Active Status Ratio */}
          <div className="adm-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tỷ lệ hoạt động</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: '600', color: '#16a34a' }}>{activePercentage}%</h3>
              </div>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Activity size={20} />
              </div>
            </div>
            {/* Elegant horizontal mini bar */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <div style={{ height: '6px', background: 'var(--surface-soft)', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#16a34a', width: `${activePercentage}%`, borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Filters, Search, View Mode Toggle */}
        <div className="admin-sticky-toolbar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          padding: '16px 20px',
          borderRadius: '20px',
          border: '1px solid var(--line)'
        }}>
          {/* Segmented Role Filters */}
          <div className="admin-filter-tabs" style={{ margin: 0 }}>
            {USER_ROLE_FILTERS.map((tab) => {
              const count = tab.key === 'ALL'
                ? totalUsers
                : tab.key === 'admin'
                ? adminCount
                : tab.key === 'candidate'
                ? candidateCount
                : partnerCount;

              return (
                <button
                  key={tab.key}
                  onClick={() => setUserRoleFilter(tab.key)}
                  className={`admin-filter-tab ${userRoleFilter === tab.key ? 'active' : ''}`}
                  type="button"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {tab.key === 'ALL'
                    ? 'Tất cả'
                    : tab.key === 'admin'
                    ? 'Quản trị viên'
                    : tab.key === 'candidate'
                    ? 'Ứng viên'
                    : 'Đối tác'}
                  <span className="admin-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Wrap */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px', justifyContent: 'flex-end' }}>
            <div className="admin-search-wrap" style={{ width: '100%', maxWidth: '340px' }}>
              <Search size={16} style={{ color: 'var(--muted)' }} />
              <input
                className="admin-search-input"
                placeholder="Tìm email, tên hiển thị..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
              />
            </div>

            {/* Column Config Dropdown Wrapper */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowColConfig(!showColConfig)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  border: '1.5px solid var(--line)',
                  background: 'var(--surface)',
                  height: '38px',
                  padding: '0 16px',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e5ea'}
              >
                <Settings size={14} style={{ color: 'var(--muted)' }} />
                Cấu hình cột
              </button>

              {showColConfig && (
                <div
                  className="adm-card"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0',
                    zIndex: 150,
                    padding: '18px',
                    width: '220px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    textAlign: 'left',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '16px'
                  }}
                >
                  <h4 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cột hiển thị</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.account}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, account: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Tài khoản
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.roles}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, roles: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Vai trò
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.premium}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, premium: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Gói Hội Viên
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.status}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, status: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Trạng thái
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.createdAt}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, createdAt: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Ngày tạo
                  </label>
                </div>
              )}
            </div>

            {/* View Switcher Segmented Control */}
            <div className="adm-view-switcher">
              <div className={`adm-view-switcher-slider ${userViewMode}`} />
              <button
                type="button"
                onClick={() => setUserViewMode('grid')}
                title="Xem dạng thẻ"
                className={`adm-view-switcher-btn ${userViewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setUserViewMode('list')}
                title="Xem dạng danh sách"
                className={`adm-view-switcher-btn ${userViewMode === 'list' ? 'active' : ''}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic View rendering */}
        {filteredUsers.length === 0 ? (
          <div className="admin-placeholder-pane" style={{ background: 'var(--surface)', borderStyle: 'dashed' }}>
            <Search size={32} style={{ color: 'var(--muted)', marginBottom: '12px' }} />
            <h3 className="admin-placeholder-title" style={{ marginTop: '12px' }}>Không tìm thấy tài khoản phù hợp</h3>
            <p className="admin-placeholder-desc">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc vai trò khác.</p>
          </div>
        ) : userViewMode === 'grid' ? (
          <div className="admin-stagger-grid adm-fade-in-slide" key="user-grid">
            {filteredUsers.map((u, index) => {
              const rolesArray = (u.roles || '').split(', ');
              const rolesStr = (u.roles || '').toLowerCase();
              const isCand = rolesStr.includes('candidate');
              const isPartner = rolesStr.includes('employer') || rolesStr.includes('organizer');

              // Visual avatar background gradients based on role
              let avatarBg = 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'; // Admin slate
              if (isCand) avatarBg = 'linear-gradient(135deg, #0066cc 0%, #2997ff 100%)'; // Candidate action blue
              if (isPartner) avatarBg = 'linear-gradient(135deg, #d97706 0%, #ff7a1a 100%)'; // Partner gold

              // Status check
              let statusText = 'Đang hoạt động';
              let statusColor = '#16a34a'; // Emerald active
              if (isPartner) {
                const compStatus = (u.companyStatus || '').toUpperCase();
                if (compStatus === 'PENDING') { statusText = 'Chờ duyệt đối tác'; statusColor = '#f59e0b'; }
                else if (compStatus === 'REJECTED') { statusText = 'Bị từ chối'; statusColor = '#dc2626'; }
                else if (compStatus !== 'APPROVED') { statusText = 'Chưa đăng ký đối tác'; statusColor = '#7a7a7a'; }
              } else {
                const userStat = (u.userStatus || '').toUpperCase();
                if (userStat === 'FROZEN') { statusText = 'Tạm khóa'; statusColor = '#f59e0b'; }
                else if (userStat === 'BANNED') { statusText = 'Bị khóa'; statusColor = '#dc2626'; }
              }

              // Checks for premium and student verify
              const isPremium = u.premiumUntil && new Date(u.premiumUntil) > new Date();

              return (
                <div
                  key={u.id}
                  className="adm-card admin-stagger-item"
                  onClick={() => setSelectedUserDetail(u)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                    cursor: 'pointer',
                    position: 'relative',
                    animationDelay: `${index * 0.03}s`
                  }}
                >
                  {/* Card Top: Avatar & Tags */}
                  {visibleColumns.account && (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: avatarBg, color: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '16px', flexShrink: 0
                      }}>
                        {(u.displayName || u.email || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--ink)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {u.displayName || '—'}
                        </h4>
                        <span style={{ fontSize: '13px', color: 'var(--muted)', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block', whiteSpace: 'nowrap' }}>
                          {u.email}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card Middle: Badges and verified indicators */}
                  {(visibleColumns.roles || visibleColumns.premium) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '18px 0 14px' }}>
                      {visibleColumns.roles && rolesArray.map((role) => {
                        const isRoleAdm = role.includes('admin');
                        const isRoleCand = role.includes('candidate');
                        const badgeClass = isRoleAdm ? 'admin' : isRoleCand ? 'candidate' : 'partner';
                        const label = isRoleAdm ? 'Quản trị' : isRoleCand ? 'Ứng viên' : 'Đối tác';
                        return (
                          <span key={role} className={`badge-role ${badgeClass}`}>
                            {label}
                          </span>
                        );
                      })}
                      {visibleColumns.premium && isPremium && (
                        <span className="badge-role" style={{ background: 'rgba(255, 122, 26, 0.08)', color: '#ff7a1a', fontWeight: '600' }}>
                          👑 Premium
                        </span>
                      )}
                      {visibleColumns.premium && u.studentEmailVerified && (
                        <span className="badge-role" style={{ background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', fontWeight: '600' }}>
                          🎓 Sinh Viên
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Bottom: Pulsing Status Dot & Created Date */}
                  {(visibleColumns.status || visibleColumns.createdAt) && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--line)',
                      paddingTop: '12px',
                      marginTop: 'auto',
                      fontSize: '13px',
                      color: 'var(--muted)'
                    }}>
                      {/* Breathing status element */}
                      {visibleColumns.status ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="adm-status-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                          <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{statusText}</span>
                        </div>
                      ) : <div />}
                      {visibleColumns.createdAt && (
                        <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="admin-table-wrapper adm-fade-in-slide" key="user-list">
            <table className="admin-table">
              <thead>
                <tr>
                  {visibleColumns.account && <th>Tài khoản</th>}
                  {visibleColumns.roles && <th>Vai trò</th>}
                  {visibleColumns.premium && <th>Gói Hội Viên</th>}
                  {visibleColumns.status && <th>Trạng thái</th>}
                  {visibleColumns.createdAt && <th>Ngày tạo</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const rolesArray = (u.roles || '').split(', ');
                  const rolesStr = (u.roles || '').toLowerCase();
                  const isCand = rolesStr.includes('candidate');
                  const isPartner = rolesStr.includes('employer') || rolesStr.includes('organizer');

                  let avatarBg = 'linear-gradient(135deg, #475569 0%, #1e293b 100%)';
                  if (isCand) avatarBg = 'linear-gradient(135deg, #0066cc 0%, #2997ff 100%)';
                  if (isPartner) avatarBg = 'linear-gradient(135deg, #d97706 0%, #ff7a1a 100%)';

                  let statusText = 'Đang hoạt động';
                  let statusColor = '#16a34a';
                  if (isPartner) {
                    const compStatus = (u.companyStatus || '').toUpperCase();
                    if (compStatus === 'PENDING') { statusText = 'Chờ duyệt'; statusColor = '#f59e0b'; }
                    else if (compStatus === 'REJECTED') { statusText = 'Bị từ chối'; statusColor = '#dc2626'; }
                    else if (compStatus !== 'APPROVED') { statusText = 'Chưa đối tác'; statusColor = '#7a7a7a'; }
                  } else {
                    const userStat = (u.userStatus || '').toUpperCase();
                    if (userStat === 'FROZEN') { statusText = 'Tạm khóa'; statusColor = '#f59e0b'; }
                    else if (userStat === 'BANNED') { statusText = 'Bị khóa'; statusColor = '#dc2626'; }
                  }

                  const isPremium = u.premiumUntil && new Date(u.premiumUntil) > new Date();

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserDetail(u)}
                      style={{ cursor: 'pointer' }}
                      title="Nhấn để xem chi tiết"
                    >
                      {visibleColumns.account && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: avatarBg, color: '#ffffff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '700', fontSize: '13px', flexShrink: 0
                            }}>
                              {(u.displayName || u.email || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{u.displayName || '—'}</div>
                              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.roles && (
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {rolesArray.map((role) => {
                              const isRoleAdm = role.includes('admin');
                              const isRoleCand = role.includes('candidate');
                              const badgeClass = isRoleAdm ? 'admin' : isRoleCand ? 'candidate' : 'partner';
                              const label = isRoleAdm ? 'Quản trị' : isRoleCand ? 'Ứng viên' : 'Đối tác';
                              return (
                                <span key={role} className={`badge-role ${badgeClass}`}>
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      )}
                      {visibleColumns.premium && (
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {isPremium ? (
                              <span className="badge-role" style={{ background: 'rgba(255, 122, 26, 0.08)', color: '#ff7a1a', fontWeight: '600' }}>
                                👑 Premium
                              </span>
                            ) : (
                              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Thường</span>
                            )}
                            {u.studentEmailVerified && (
                              <span className="badge-role" style={{ background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', fontWeight: '600' }}>
                                🎓 Sinh Viên
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="adm-status-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                            <span style={{ fontWeight: '500' }}>{statusText}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.createdAt && (
                        <td style={{ color: 'var(--muted)', fontSize: '14px' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {userViewMode === 'list' && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            marginTop: '28px',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              disabled={userCurrentPage === 1}
              onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                border: '1px solid ' + (userCurrentPage === 1 ? 'var(--line)' : 'var(--line)'),
                background: userCurrentPage === 1 ? 'var(--surface-soft)' : 'var(--surface)',
                color: userCurrentPage === 1 ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: userCurrentPage === 1 ? 'not-allowed' : 'pointer',
                boxShadow: userCurrentPage === 1 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === userCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setUserCurrentPage(pageNum)}
                  style={{
                    border: '1px solid ' + (isActive ? '#0066cc' : 'var(--line)'),
                    background: isActive ? '#0066cc' : 'var(--surface)',
                    color: isActive ? '#ffffff' : '#1d1d1f',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 102, 204, 0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={userCurrentPage === totalPages}
              onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                border: '1px solid ' + (userCurrentPage === totalPages ? 'var(--line)' : 'var(--line)'),
                background: userCurrentPage === totalPages ? 'var(--surface-soft)' : 'var(--surface)',
                color: userCurrentPage === totalPages ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: userCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                boxShadow: userCurrentPage === totalPages ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
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
    const JOBS_PER_PAGE = 8;
    const totalJobsPages = Math.ceil(displayedJobs.length / JOBS_PER_PAGE);
    const paginatedJobs = displayedJobs.slice(
      (jobsCurrentPage - 1) * JOBS_PER_PAGE,
      jobsCurrentPage * JOBS_PER_PAGE
    );
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

          {/* Column visibility configuration (only in List view mode) */}
          {jobsViewMode === 'list' && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowJobsColConfig(!showJobsColConfig)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  border: '1.5px solid var(--line)',
                  background: 'var(--surface)',
                  height: '38px',
                  padding: '0 16px',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e5ea'}
              >
                <Settings size={14} style={{ color: 'var(--muted)' }} />
                Cấu hình cột
              </button>

              {showJobsColConfig && (
                <div
                  className="adm-card"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0',
                    zIndex: 150,
                    padding: '18px',
                    width: '220px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    textAlign: 'left',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '16px'
                  }}
                >
                  <h4 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cột hiển thị</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.title}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, title: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Tiêu đề tin
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.company}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, company: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Tổ chức đăng
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.type}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, type: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Loại hình
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.category}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, category: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Phân loại
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.capacity}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, capacity: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Chỉ tiêu
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.deadline}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, deadline: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Hạn nộp
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.date}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, date: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Ngày đăng
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={jobsVisibleColumns.status}
                      onChange={(e) => setJobsVisibleColumns({ ...jobsVisibleColumns, status: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Trạng thái duyệt
                  </label>
                </div>
              )}
            </div>
          )}

          {/* View Switcher Segmented Control */}
          <div className="adm-view-switcher">
            <div className={`adm-view-switcher-slider ${jobsViewMode}`} />
            <button
              type="button"
              onClick={() => setJobsViewMode('grid')}
              title="Xem dạng lưới"
              className={`adm-view-switcher-btn ${jobsViewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setJobsViewMode('list')}
              title="Xem dạng danh sách"
              className={`adm-view-switcher-btn ${jobsViewMode === 'list' ? 'active' : ''}`}
            >
              <List size={15} />
            </button>
          </div>
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
        ) : jobsViewMode === 'grid' ? (
          <div className="admin-square-grid adm-fade-in-slide" key="jobs-grid">
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
        ) : (
          /* Premium Table list view of individual jobs */
          <div className="admin-table-wrapper adm-fade-in-slide" key="jobs-list">
            <table className="admin-table">
              <thead>
                <tr>
                  {jobsVisibleColumns.title && <th>Tiêu đề tin</th>}
                  {jobsVisibleColumns.company && <th>Tổ chức đăng</th>}
                  {jobsVisibleColumns.type && <th>Loại hình</th>}
                  {jobsVisibleColumns.category && <th>Phân loại</th>}
                  {jobsVisibleColumns.capacity && <th>Chỉ tiêu</th>}
                  {jobsVisibleColumns.deadline && <th>Hạn nộp</th>}
                  {jobsVisibleColumns.date && <th>Ngày đăng</th>}
                  {jobsVisibleColumns.status && <th>Trạng thái</th>}
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job) => {
                  const si = getStatusInfo(job.status);
                  const isClub = job.companyType === 'CLUB';
                  const liveJob = jobs.find(j => j.id === job.id) || job;
                  const isClaimedByMe = liveJob.claimedByMe === true;
                  const isClaimedByOther = !!liveJob.claimedByAdminId && !isClaimedByMe;
                  const isUnclaimed = !liveJob.claimedByAdminId;
                  const isPending = (job.status || '').toLowerCase() === 'pending';

                  return (
                    <tr key={job.id}>
                      {jobsVisibleColumns.title && (
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ color: 'var(--ink)', fontSize: '14px' }}>{job.title}</strong>
                            <span style={{ fontSize: '11px', color: '#8e8e93' }}>ID: {job.id}</span>
                          </div>
                        </td>
                      )}
                      {jobsVisibleColumns.company && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: '500' }}>{job.companyName}</span>
                            <span className="badge-role" style={{
                              background: isClub ? 'rgba(255, 122, 26, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                              color: isClub ? '#ff7a1a' : '#2563eb',
                              fontSize: '9px',
                              fontWeight: '700'
                            }}>
                              {isClub ? 'CLB' : 'SME'}
                            </span>
                          </div>
                        </td>
                      )}
                      {jobsVisibleColumns.type && (
                        <td>
                          <span className={`badge-role ${job.postType === 'JOB' ? 'candidate' : 'partner'}`} style={{ fontSize: '10px' }}>
                            {job.postType === 'QUEST' ? 'Quest' : 'Cơ hội'}
                          </span>
                        </td>
                      )}
                      {jobsVisibleColumns.category && (
                        <td>
                          <span style={{ fontSize: '13px', color: '#555555' }}>{job.jobType || '—'}</span>
                        </td>
                      )}
                      {jobsVisibleColumns.capacity && (
                        <td>
                          <span style={{ fontSize: '13px', color: '#555555', fontWeight: '600' }}>
                            {job.capacity ? `${job.capacity} chỉ tiêu` : 'Không giới hạn'}
                          </span>
                        </td>
                      )}
                      {jobsVisibleColumns.deadline && (
                        <td>
                          <span style={{ fontSize: '13px', color: '#555555' }}>
                            {job.deadlineAt ? new Date(job.deadlineAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                          </span>
                        </td>
                      )}
                      {jobsVisibleColumns.date && (
                        <td>
                          <span style={{ fontSize: '13px', color: '#555555' }}>
                            {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '—'}
                          </span>
                        </td>
                      )}
                      {jobsVisibleColumns.status && (
                        <td>
                          <span className={`badge-status ${si.badge}`}>{si.text}</span>
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="button secondary-button"
                            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '9999px' }}
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
                                  style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '9999px' }}
                                  onClick={() => handleClaim('JOB', job.id)}
                                  disabled={actionStatus.type === 'loading'}
                                >
                                  Nhận việc
                                </button>
                              )}
                              {isClaimedByMe && (
                                <>
                                  <button
                                    type="button"
                                    className="button primary-button"
                                    style={{ background: '#16a34a', border: 'none', padding: '4px 10px', fontSize: '12px', borderRadius: '9999px', color: '#ffffff' }}
                                    onClick={() => openApproveJobConfirmation(job.id, job.title)}
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    type="button"
                                    className="button danger-button"
                                    style={{ background: '#dc2626', border: 'none', padding: '4px 10px', fontSize: '12px', borderRadius: '9999px', color: '#ffffff' }}
                                    onClick={() => openRejectJobConfirmation(job.id, job.title)}
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {isClaimedByOther && (
                                <span className="badge-role" style={{ background: '#fef3c7', color: '#b45309', fontWeight: '700', fontSize: '11px' }}>
                                  🔒 {liveJob.claimedByAdminName || 'Admin khác'}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls for Jobs List View */}
        {jobsViewMode === 'list' && totalJobsPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            marginTop: '28px',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              disabled={jobsCurrentPage === 1}
              onClick={() => setJobsCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                border: '1px solid ' + (jobsCurrentPage === 1 ? 'var(--line)' : 'var(--line)'),
                background: jobsCurrentPage === 1 ? 'var(--surface-soft)' : 'var(--surface)',
                color: jobsCurrentPage === 1 ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: jobsCurrentPage === 1 ? 'not-allowed' : 'pointer',
                boxShadow: jobsCurrentPage === 1 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalJobsPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === jobsCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setJobsCurrentPage(pageNum)}
                  style={{
                    border: '1px solid ' + (isActive ? '#0066cc' : 'var(--line)'),
                    background: isActive ? '#0066cc' : 'var(--surface)',
                    color: isActive ? '#ffffff' : '#1d1d1f',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 102, 204, 0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={jobsCurrentPage === totalJobsPages}
              onClick={() => setJobsCurrentPage(prev => Math.min(prev + 1, totalJobsPages))}
              style={{
                border: '1px solid ' + (jobsCurrentPage === totalJobsPages ? 'var(--line)' : 'var(--line)'),
                background: jobsCurrentPage === totalJobsPages ? 'var(--surface-soft)' : 'var(--surface)',
                color: jobsCurrentPage === totalJobsPages ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: jobsCurrentPage === totalJobsPages ? 'not-allowed' : 'pointer',
                boxShadow: jobsCurrentPage === totalJobsPages ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronRight size={16} />
            </button>
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
      .filter((group) => {
        if (!searchVerifQuery) return true;
        const q = searchVerifQuery.toLowerCase();
        return (
          (group.name || '').toLowerCase().includes(q) ||
          (group.email || '').toLowerCase().includes(q)
        );
      })
      // Sort express candidates to the top
      .sort((a, b) => {
        const aHasExpress = a.credentials.some(item => item.expressVerification) ? 0 : 1;
        const bHasExpress = b.credentials.some(item => item.expressVerification) ? 0 : 1;
        return aHasExpress - bHasExpress;
      });

    const VERIF_PER_PAGE = 8;
    const totalVerifPages = Math.ceil(candidateGroups.length / VERIF_PER_PAGE);
    const paginatedCandidates = verifViewMode === 'list'
      ? candidateGroups.slice((verifCurrentPage - 1) * VERIF_PER_PAGE, verifCurrentPage * VERIF_PER_PAGE)
      : candidateGroups;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-controls">
          <div className="admin-filter-tabs">
            <button
              className={`admin-filter-tab ${isPendingView ? 'active' : ''}`}
              onClick={() => {
                navigate(getAdminTabPath('VERIF_QUEUE', 'pending'));
                setVerifCurrentPage(1);
              }}
              type="button"
            >
              <ShieldCheck size={14} />
              Xác thực
              <span className="admin-tab-count">{pendingCount}</span>
            </button>
            <button
              className={`admin-filter-tab ${!isPendingView ? 'active' : ''}`}
              onClick={() => {
                navigate(getAdminTabPath('VERIF_QUEUE', 'manage'));
                setVerifCurrentPage(1);
              }}
              type="button"
            >
              <FileText size={14} />
              Quản lý minh chứng
              <span className="admin-tab-count">{verifQueue.length}</span>
            </button>
          </div>

          {/* Search bar inside Verification Queue tab */}
          <div className="admin-search-wrap" style={{ flex: 1, minWidth: '200px', maxWidth: '360px' }}>
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm kiếm ứng viên theo tên, email..."
              value={searchVerifQuery}
              onChange={(e) => {
                setSearchVerifQuery(e.target.value);
                setVerifCurrentPage(1);
              }}
            />
          </div>

          {!isPendingView && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ListFilter size={15} style={{ color: 'var(--muted)' }} />
              <select
                value={verifStatusFilter}
                onChange={(e) => {
                  setVerifStatusFilter(e.target.value);
                  setSelectedVerifGroup(null);
                  setVerifCurrentPage(1);
                }}
                className="admin-select"
              >
                {VERIF_STATUS_FILTERS.map((filter) => (
                  <option key={filter.key} value={filter.key}>{filter.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Column visibility configuration (only in List view mode) */}
          {verifViewMode === 'list' && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowVerifColConfig(!showVerifColConfig)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  border: '1.5px solid var(--line)',
                  background: 'var(--surface)',
                  height: '38px',
                  padding: '0 16px',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e5ea'}
              >
                <Settings size={14} style={{ color: 'var(--muted)' }} />
                Cấu hình cột
              </button>

              {showVerifColConfig && (
                <div
                  className="adm-card"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0',
                    zIndex: 150,
                    padding: '18px',
                    width: '220px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    textAlign: 'left',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '16px'
                  }}
                >
                  <h4 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cột hiển thị</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={verifVisibleColumns.candidate}
                      onChange={(e) => setVerifVisibleColumns({ ...verifVisibleColumns, candidate: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Ứng viên
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={verifVisibleColumns.count}
                      onChange={(e) => setVerifVisibleColumns({ ...verifVisibleColumns, count: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Số minh chứng
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={verifVisibleColumns.priority}
                      onChange={(e) => setVerifVisibleColumns({ ...verifVisibleColumns, priority: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Độ ưu tiên
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={verifVisibleColumns.stats}
                      onChange={(e) => setVerifVisibleColumns({ ...verifVisibleColumns, stats: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Reputation & Level
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={verifVisibleColumns.status}
                      onChange={(e) => setVerifVisibleColumns({ ...verifVisibleColumns, status: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Trạng thái
                  </label>
                </div>
              )}
            </div>
          )}

          {/* View Switcher Segmented Control */}
          <div className="adm-view-switcher">
            <div className={`adm-view-switcher-slider ${verifViewMode}`} />
            <button
              type="button"
              onClick={() => setVerifViewMode('grid')}
              title="Xem dạng lưới"
              className={`adm-view-switcher-btn ${verifViewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setVerifViewMode('list')}
              title="Xem dạng danh sách"
              className={`adm-view-switcher-btn ${verifViewMode === 'list' ? 'active' : ''}`}
            >
              <List size={15} />
            </button>
          </div>
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
            <p>{isPendingView ? 'Tất cả minh chứng đã được xử lý. Quay lại sau nhé!' : 'Hãy thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.'}</p>
          </div>
        ) : verifViewMode === 'list' ? (
          /* Premium Table list view of Verification Queue */
          <div className="admin-table-wrapper adm-fade-in-slide" key="verif-list">
            <table className="admin-table">
              <thead>
                <tr>
                  {verifVisibleColumns.candidate && <th>Ứng viên</th>}
                  {verifVisibleColumns.count && <th>Số minh chứng</th>}
                  {verifVisibleColumns.priority && <th>Độ ưu tiên</th>}
                  {verifVisibleColumns.stats && <th>Reputation & Level</th>}
                  {verifVisibleColumns.status && <th>Trạng thái</th>}
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCandidates.map((group, idx) => {
                  const pendingInGroup = group.credentials.filter((item) => ((item.verification_status || item.status || 'PENDING').toUpperCase()) === 'PENDING').length;
                  const hasExpress = group.credentials.some(item => item.expressVerification);

                  return (
                    <tr
                      key={group.key}
                      className="adm-fade-in-slide"
                      style={{ animationDelay: `${idx * 35}ms` }}
                    >
                      {verifVisibleColumns.candidate && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="admin-square-avatar" style={{ '--accent-color': '#7c3aed', width: '32px', height: '32px', fontSize: '11px', flexShrink: 0 }}>
                              {(group.name || 'UV').slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                              <strong style={{ color: 'var(--ink)', fontSize: '14px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{group.name}</strong>
                              <span style={{ fontSize: '11px', color: '#8e8e93', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{group.email || '—'}</span>
                            </div>
                          </div>
                        </td>
                      )}
                      {verifVisibleColumns.count && (
                        <td>
                          <span style={{ fontSize: '13px', color: '#555555', fontWeight: '600' }}>
                            {group.credentials.length} minh chứng
                          </span>
                        </td>
                      )}
                      {verifVisibleColumns.priority && (
                        <td>
                          {hasExpress ? (
                            <span className="verif-express-tag"><Zap size={10} /> Express</span>
                          ) : (
                            <span className="verif-normal-tag">Thường</span>
                          )}
                        </td>
                      )}
                      {verifVisibleColumns.stats && (
                        <td>
                          <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: '500' }}>
                            RS: {group.reputationScore ?? '—'} · Lv.{group.currentLevel ?? '—'}
                          </span>
                        </td>
                      )}
                      {verifVisibleColumns.status && (
                        <td>
                          {pendingInGroup > 0 ? (
                            <span className="badge-status warning">
                              {pendingInGroup} chờ xác thực
                            </span>
                          ) : (
                            <span className="badge-status success">
                              Đã xử lý
                            </span>
                          )}
                        </td>
                      )}
                      <td>
                        <button
                          type="button"
                          className="button secondary-button"
                          style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '9999px' }}
                          onClick={() => {
                            setSelectedVerifGroup(group);
                            if (group.credentials?.length > 0) {
                              setActiveCredId(group.credentials[0].id);
                            }
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-square-grid">
            {candidateGroups.map((group, idx) => {
              const pendingInGroup = group.credentials.filter((item) => ((item.verification_status || item.status || 'PENDING').toUpperCase()) === 'PENDING').length;
              const hasExpress = group.credentials.some(item => item.expressVerification);
              return (
                <button
                  key={group.key}
                  className="admin-square-group-card adm-fade-in-slide"
                  style={{
                    '--accent-color': hasExpress ? '#d97706' : '#7c3aed',
                    animationDelay: `${idx * 35}ms`,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                    position: 'relative',
                    borderRadius: '20px',
                    border: '1.5px solid var(--line)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                    background: 'var(--surface)',
                    transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                    textAlign: 'left',
                    overflow: 'hidden',
                    width: '100%',
                    minHeight: '210px'
                  }}
                  onClick={() => {
                    setSelectedVerifGroup(group);
                    if (group.credentials?.length > 0) {
                      setActiveCredId(group.credentials[0].id);
                    }
                  }}
                  type="button"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                    e.currentTarget.style.borderColor = hasExpress ? '#d97706' : '#7c3aed';
                    e.currentTarget.style.boxShadow = hasExpress
                      ? '0 12px 30px rgba(217, 119, 6, 0.08), 0 2px 8px rgba(217, 119, 6, 0.04)'
                      : '0 12px 30px rgba(124, 58, 237, 0.08), 0 2px 8px rgba(124, 58, 237, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#e5e5ea';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
                  }}
                >
                  {/* Top Decorative Line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: hasExpress
                      ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)'
                  }} />

                  {/* Top block: Avatar + Name/Email */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px', width: '100%' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: hasExpress
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '15px',
                      flexShrink: 0,
                      boxShadow: hasExpress ? '0 4px 12px rgba(217, 119, 6, 0.22)' : '0 4px 12px rgba(124, 58, 237, 0.22)'
                    }}>
                      {(group.name || 'UV').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: 'var(--ink)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {group.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                        {group.email || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Role and Submission Status Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '16px 0 14px', width: '100%' }}>
                    {hasExpress ? (
                      <span style={{
                        background: 'rgba(217, 119, 6, 0.08)',
                        color: '#d97706',
                        fontWeight: '800',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Zap size={10} /> Express Pass
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(124, 58, 237, 0.08)',
                        color: '#7c3aed',
                        fontWeight: '800',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <User size={10} /> Ứng viên
                      </span>
                    )}

                    <span style={{
                      background: 'var(--surface-soft)',
                      color: '#4b5563',
                      fontWeight: '700',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FileText size={10} /> {group.credentials.length} Minh chứng
                    </span>

                    {pendingInGroup > 0 && (
                      <span style={{
                        background: 'rgba(234, 88, 12, 0.08)',
                        color: '#ea580c',
                        fontWeight: '800',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={10} /> {pendingInGroup} Chờ duyệt
                      </span>
                    )}
                  </div>

                  {/* Main stats block */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '14px',
                    borderTop: '1px solid #f0f0f2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)', fontWeight: '600', whiteSpace: 'nowrap', minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        RS: <strong style={{ color: 'var(--ink)', fontWeight: '800' }}>{group.reputationScore ?? 0}</strong>
                      </span>
                      <span style={{ color: '#d2d2d7' }}>·</span>
                      <span>Lv: <strong style={{ color: 'var(--ink)', fontWeight: '800' }}>{group.currentLevel ?? 1}</strong></span>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      color: hasExpress ? '#d97706' : '#7c3aed',
                      background: hasExpress ? 'rgba(217, 119, 6, 0.08)' : 'rgba(124, 58, 237, 0.08)',
                      padding: '5px 10px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: '800'
                    }}>
                      <span>Xem chi tiết</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination Controls for Verification List View */}
        {verifViewMode === 'list' && totalVerifPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            marginTop: '28px',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              disabled={verifCurrentPage === 1}
              onClick={() => setVerifCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                border: '1px solid ' + (verifCurrentPage === 1 ? 'var(--line)' : 'var(--line)'),
                background: verifCurrentPage === 1 ? 'var(--surface-soft)' : 'var(--surface)',
                color: verifCurrentPage === 1 ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: verifCurrentPage === 1 ? 'not-allowed' : 'pointer',
                boxShadow: verifCurrentPage === 1 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: '600' }}>
              Trang {verifCurrentPage} / {totalVerifPages}
            </span>
            <button
              type="button"
              disabled={verifCurrentPage === totalVerifPages}
              onClick={() => setVerifCurrentPage(prev => Math.min(prev + 1, totalVerifPages))}
              style={{
                border: '1px solid ' + (verifCurrentPage === totalVerifPages ? 'var(--line)' : 'var(--line)'),
                background: verifCurrentPage === totalVerifPages ? 'var(--surface-soft)' : 'var(--surface)',
                color: verifCurrentPage === totalVerifPages ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: verifCurrentPage === totalVerifPages ? 'not-allowed' : 'pointer',
                boxShadow: verifCurrentPage === totalVerifPages ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {selectedVerifGroup && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedVerifGroup(null)}>
            <div className="modal-card admin-group-modal" onClick={(e) => e.stopPropagation()}>
              <div className="verif-modal-header">
                <div className="verif-modal-avatar">
                  {(selectedVerifGroup.name || 'UV').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850, color: 'var(--ink)' }}>{selectedVerifGroup.name}</h3>
                    <span className="verif-modal-role-badge">
                      <User size={10} /> Ứng viên
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.86rem' }}>
                    {selectedVerifGroup.email || 'Chưa có email'} · RS {selectedVerifGroup.reputationScore ?? '—'} · Lv.{selectedVerifGroup.currentLevel ?? '—'}
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
                              <span className={`verif-md-row-dot ${cs.toLowerCase()}`} />
                              <span className="verif-md-row-body">
                                <span className="verif-md-row-title">
                                  {c.project_name}
                                  {c.expressVerification && <Zap size={11} className="verif-md-express" />}
                                  {c.contentFlag && <AlertTriangle size={12} style={{ color: '#d97706', marginLeft: '4px', flexShrink: 0 }} aria-label="Nghi ngờ nội dung" />}
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
                        <div className="verif-card-icon">
                          <ShieldCheck size={17} />
                        </div>
                        <div className="verif-card-titlewrap">
                          <div className="verif-card-titlerow">
                            <h4 className="verif-card-title">{activeCred.project_name}</h4>
                            {activeCred.expressVerification && (
                              <span className="verif-express-tag"><Zap size={10} /> Express</span>
                            )}
                          </div>
                          <div className="admin-subitem-meta">
                            <span className="proof-chip category">{CATEGORY_LABELS[activeCred.category] || activeCred.category}</span>
                            <span className={`proof-chip ${(activeCred.role_level || 'MEMBER').toLowerCase()}`}>{activeCred.role_level === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}</span>
                            {activeCred.position && activeCred.position !== activeCred.project_name && (
                              <span className="verif-card-meta-text">{activeCred.position}</span>
                            )}
                            <span className="verif-card-meta-text">{activeCred.created_at ? new Date(activeCred.created_at).toLocaleDateString('vi-VN') : '—'}</span>
                            {activeCred.contentFlag && <span className="admin-flag-badge"><AlertTriangle size={11} /> Nghi ngờ nội dung</span>}
                          </div>
                        </div>
                        <span className={`proof-status-badge ${status.toLowerCase()}`}>{statusLabel(status)}</span>
                      </div>

                      {activeCred.contentFlag && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 15px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', color: '#b45309', marginTop: '14px', fontSize: '0.84rem' }}>
                          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                          <span><strong>Cảnh báo kiểm duyệt tự động:</strong> Tên hoạt động/mô tả minh chứng có thể chứa từ ngữ không phù hợp. Hãy đọc kỹ trước khi duyệt.</span>
                        </div>
                      )}

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
                      <div className="verif-notes-block">
                        <label className="verif-notes-label">
                          <FileText size={12} /> Ghi chú nội bộ <span>(Chỉ Admin nhìn thấy)</span>
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesDrafts(prev => ({ ...prev, [activeCred.id]: e.target.value }))}
                            disabled={isClaimedByOther}
                            placeholder={isClaimedByOther ? "Đang bị khóa bởi admin khác..." : "Nhập ghi chú nội bộ cho minh chứng này..."}
                            className="verif-notes-textarea"
                            style={{ background: isClaimedByOther ? 'var(--surface-soft)' : 'var(--surface)' }}
                          />
                          {!isClaimedByOther && (
                            <button type="button"
                              onClick={() => handleSaveNotes('EXPERIENCE', activeCred.id)}
                              disabled={actionStatus.type === 'loading'}
                              className="verif-notes-save">
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
                                style={{ background: 'var(--surface-soft)', borderColor: '#d1d5db', color: '#1f2937', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
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
    // Dynamic Stats
    const b2bTotal = pendingB2b.length;
    const b2bClubCount = pendingB2b.filter(i => i.companyType === 'CLUB').length;
    const b2bSmeCount = pendingB2b.filter(i => i.companyType !== 'CLUB').length;

    const claimedCount = pendingB2b.filter(i => i.claimedByAdminId).length;
    const myClaimedCount = pendingB2b.filter(i => currentUser && i.claimedByAdminId && String(i.claimedByAdminId) === String(currentUser.id)).length;
    const unclaimedCount = pendingB2b.filter(i => !i.claimedByAdminId).length;

    // Pagination Calculations for List View
    const totalB2bPages = Math.ceil(filteredB2b.length / B2B_PER_PAGE);
    const paginatedB2b = filteredB2b.slice(
      (b2bCurrentPage - 1) * B2B_PER_PAGE,
      b2bCurrentPage * B2B_PER_PAGE
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Premium Quick Insights KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '4px'
        }}>
          {b2bSubTab === 'approved' ? (
            <>
              {/* Approved Card 1: Total B2b */}
              <div className="adm-card" style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1.5px solid var(--line)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'var(--surface)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#0066cc';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 102, 204, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e5e5ea';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng đối tác đã duyệt</span>
                    <h3 style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.02em' }}>{b2bTotal}</h3>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: 'rgba(0, 102, 204, 0.06)', color: '#0066cc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.06)'
                  }}>
                    <Building size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '20px', fontSize: '13px', color: '#555555', borderTop: '1.5px solid #f0f0f5', paddingTop: '14px' }}>
                  <span>Hoạt động bình thường trong hệ thống</span>
                </div>
              </div>

              {/* Approved Card 2: SMEs */}
              <div className="adm-card" style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1.5px solid var(--line)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'var(--surface)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#ff7a1a';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 122, 26, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e5e5ea';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doanh nghiệp (SME)</span>
                    <h3 style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: '800', color: '#ff7a1a', letterSpacing: '-0.02em' }}>{b2bSmeCount}</h3>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: 'rgba(255, 122, 26, 0.08)', color: '#ff7a1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255, 122, 26, 0.06)'
                  }}>
                    <Building size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '20px', fontSize: '13px', color: '#555555', borderTop: '1.5px solid #f0f0f5', paddingTop: '14px' }}>
                  <span>Tổ chức tuyển dụng thương mại</span>
                </div>
              </div>

              {/* Approved Card 3: Clubs */}
              <div className="adm-card" style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1.5px solid var(--line)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'var(--surface)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#16a34a';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(22, 163, 74, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e5e5ea';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CLB / Tổ chức học sinh</span>
                    <h3 style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: '800', color: '#16a34a', letterSpacing: '-0.02em' }}>{b2bClubCount}</h3>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.06)'
                  }}>
                    <GraduationCap size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '20px', fontSize: '13px', color: '#555555', borderTop: '1.5px solid #f0f0f5', paddingTop: '14px' }}>
                  <span>Tổ chức liên kết nhà trường phi lợi nhuận</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Card 1: Pending Registrations */}
              <div className="adm-card" style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1.5px solid var(--line)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'var(--surface)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#0066cc';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 102, 204, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e5e5ea';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hồ sơ chờ duyệt</span>
                    <h3 style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.02em' }}>{b2bTotal}</h3>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: 'rgba(0, 102, 204, 0.06)', color: '#0066cc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.06)'
                  }}>
                    <Building size={22} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '20px', fontSize: '13px', color: '#555555', borderTop: '1.5px solid #f0f0f5', paddingTop: '14px' }}>
                  <span>Doanh nghiệp SME: <strong style={{ color: 'var(--ink)', fontWeight: '700' }}>{b2bSmeCount}</strong></span>
                  <span style={{ color: '#e5e5ea' }}>|</span>
                  <span>CLB Sinh viên: <strong style={{ color: 'var(--ink)', fontWeight: '700' }}>{b2bClubCount}</strong></span>
                </div>
              </div>

              {/* Card 2: Claims Status */}
              <div className="adm-card" style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1.5px solid var(--line)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'var(--surface)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#ff7a1a';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 122, 26, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e5e5ea';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đang xử lý</span>
                    <h3 style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: '800', color: '#ff7a1a', letterSpacing: '-0.02em' }}>{claimedCount}</h3>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: 'rgba(255, 122, 26, 0.08)', color: '#ff7a1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255, 122, 26, 0.06)'
                  }}>
                    <Clock size={22} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '20px', fontSize: '13px', color: '#555555', borderTop: '1.5px solid #f0f0f5', paddingTop: '14px' }}>
                  <span>Bạn đang duyệt: <strong style={{ color: 'var(--ink)', fontWeight: '700' }}>{myClaimedCount}</strong></span>
                  <span style={{ color: '#e5e5ea' }}>|</span>
                  <span>Chưa ai nhận: <strong style={{ color: 'var(--ink)', fontWeight: '700' }}>{unclaimedCount}</strong></span>
                </div>
              </div>

              {/* Card 3: Claimed Ratio */}
              <div className="adm-card" style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1.5px solid var(--line)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'var(--surface)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#16a34a';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(22, 163, 74, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e5e5ea';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tỷ lệ tiếp nhận</span>
                    <h3 style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: '800', color: '#16a34a', letterSpacing: '-0.02em' }}>
                      {b2bTotal > 0 ? Math.round((claimedCount / b2bTotal) * 100) : 0}%
                    </h3>
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.06)'
                  }}>
                    <Activity size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '24px', borderTop: '1.5px solid #f0f0f5', paddingTop: '16px' }}>
                  <div style={{ height: '8px', background: 'var(--surface-soft)', borderRadius: '4px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #16a34a 0%, #34d399 100%)',
                      width: `${b2bTotal > 0 ? Math.round((claimedCount / b2bTotal) * 100) : 0}%`,
                      borderRadius: '4px',
                      transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toolbar: Filters, Search, Column Config, View Switcher */}
        <div className="admin-sticky-toolbar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          padding: '16px 20px',
          borderRadius: '20px',
          border: '1.5px solid var(--line)',
          background: 'var(--surface)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
        }}>
          {/* Segmented B2B Filter Tabs */}
          <div className="admin-filter-tabs" style={{ margin: 0, gap: '4px', background: 'var(--surface-soft)', padding: '4px', borderRadius: '9999px', border: '1px solid var(--line)' }}>
            {B2B_FILTER_TABS.map((tab) => {
              const count = tab.key === 'ALL'
                ? b2bTotal
                : tab.key === 'CLUB'
                ? b2bClubCount
                : b2bSmeCount;

              const isTabActive = activeB2bFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveB2bFilter(tab.key)}
                  className={`admin-filter-tab ${isTabActive ? 'active' : ''}`}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    background: isTabActive ? 'var(--surface)' : 'transparent',
                    color: isTabActive ? '#0066cc' : '#555555',
                    cursor: 'pointer',
                    boxShadow: isTabActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 200ms ease'
                  }}
                >
                  {tab.label}
                  <span className="admin-tab-count" style={{
                    background: isTabActive ? 'rgba(0, 102, 204, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    color: isTabActive ? '#0066cc' : '#7a7a7a',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    marginLeft: '4px'
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Wrap */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '285px', justifyContent: 'flex-end' }}>
            <div className="admin-search-wrap" style={{ width: '100%', maxWidth: '340px' }}>
              <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                className="admin-search-input"
                placeholder="Tìm theo tên đối tác, email, MST..."
                value={searchB2bQuery}
                onChange={(e) => setSearchB2bQuery(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            {/* Column Config Dropdown Wrapper */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowB2bColConfig(!showB2bColConfig)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  border: '1.5px solid var(--line)',
                  background: 'var(--surface)',
                  height: '38px',
                  padding: '0 16px',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e5ea'}
              >
                <Settings size={14} style={{ color: 'var(--muted)' }} />
                Cấu hình cột
              </button>

              {showB2bColConfig && (
                <div
                  className="adm-card"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0',
                    zIndex: 150,
                    padding: '18px',
                    width: '220px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    textAlign: 'left',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '16px'
                  }}
                >
                  <h4 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cột hiển thị</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={b2bVisibleColumns.partner}
                      onChange={(e) => setB2bVisibleColumns({ ...b2bVisibleColumns, partner: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Đối tác
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={b2bVisibleColumns.type}
                      onChange={(e) => setB2bVisibleColumns({ ...b2bVisibleColumns, type: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Phân loại
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={b2bVisibleColumns.school}
                      onChange={(e) => setB2bVisibleColumns({ ...b2bVisibleColumns, school: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Trường liên kết
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={b2bVisibleColumns.owner}
                      onChange={(e) => setB2bVisibleColumns({ ...b2bVisibleColumns, owner: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Người đại diện
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={b2bVisibleColumns.document}
                      onChange={(e) => setB2bVisibleColumns({ ...b2bVisibleColumns, document: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Tài liệu xác thực
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--ink)', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      checked={b2bVisibleColumns.status}
                      onChange={(e) => setB2bVisibleColumns({ ...b2bVisibleColumns, status: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Trạng thái duyệt
                  </label>
                </div>
              )}
            </div>

            {/* View Switcher Segmented Control */}
            <div className="adm-view-switcher">
              <div className={`adm-view-switcher-slider ${b2bViewMode}`} />
              <button
                type="button"
                onClick={() => setB2bViewMode('grid')}
                title="Xem dạng thẻ"
                className={`adm-view-switcher-btn ${b2bViewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setB2bViewMode('list')}
                title="Xem dạng danh sách"
                className={`adm-view-switcher-btn ${b2bViewMode === 'list' ? 'active' : ''}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic View rendering */}
        {filteredB2b.length === 0 ? (
          <div className="admin-placeholder-pane" style={{ background: 'var(--surface)', borderStyle: 'dashed', padding: '60px 20px' }}>
            <CheckCircle2 size={40} style={{ color: '#16a34a', marginBottom: '12px' }} />
            <h3 className="admin-placeholder-title" style={{ marginTop: '12px' }}>Không có hồ sơ nào chờ duyệt</h3>
            <p className="admin-placeholder-desc">Mọi yêu cầu đăng ký đối tác đã được xử lý xong.</p>
          </div>
        ) : b2bViewMode === 'grid' ? (
          <div className="admin-stagger-grid adm-fade-in-slide" key="b2b-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px'
          }}>
            {filteredB2b.map((item, index) => {
              const isClub = item.companyType === 'CLUB';
              const accentColor = isClub ? '#ff7a1a' : '#0066cc';
              const accentRgb = isClub ? '255, 122, 26' : '0, 102, 204';
              const submittedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—';
              const isClaimedByMe = currentUser && item.claimedByAdminId && String(item.claimedByAdminId) === String(currentUser.id);
              const isClaimedByOther = item.claimedByAdminId && (!currentUser || String(item.claimedByAdminId) !== String(currentUser.id));
              const isUnclaimed = !item.claimedByAdminId;
              const notesValue = notesDrafts[item.id] !== undefined ? notesDrafts[item.id] : (item.internalNotes || '');

              return (
                <div
                  key={item.id}
                  className="adm-card admin-stagger-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                    position: 'relative',
                    borderRadius: '20px',
                    border: '1.5px solid var(--line)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                    background: 'var(--surface)',
                    transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                    animationDelay: `${index * 0.04}s`,
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.boxShadow = `0 12px 30px rgba(${accentRgb}, 0.08), 0 2px 8px rgba(${accentRgb}, 0.04)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#e5e5ea';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
                  }}
                >
                  {/* Decorative background accent pill */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '6px',
                    background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}dd 100%)`
                  }} />

                  {/* Top Block: Title & Type Badge */}
                  {b2bVisibleColumns.partner && (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: `rgba(${accentRgb}, 0.08)`, color: accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: `0 4px 12px rgba(${accentRgb}, 0.08)`
                      }}>
                        {isClub ? <GraduationCap size={24} /> : <Building size={24} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--ink)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={item.name}>
                            {item.name}
                          </h3>
                          {item.isDuplicateNameApproved && (
                            <span title="Tên trùng lặp đã duyệt" style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center' }}>
                              <ShieldAlert size={14} />
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {item.description || 'Chưa cung cấp mô tả ngắn.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Badges block */}
                  {(b2bVisibleColumns.type || b2bVisibleColumns.school) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '16px 0 14px' }}>
                      {b2bVisibleColumns.type && (
                        <span className="badge-role" style={{
                          background: `rgba(${accentRgb}, 0.06)`,
                          color: accentColor,
                          fontWeight: '700',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '9999px'
                        }}>
                          {isClub ? <GraduationCap size={11} /> : <Building size={11} />}
                          {isClub ? 'CLB Sinh Viên' : 'Doanh nghiệp SME'}
                        </span>
                      )}
                      {b2bVisibleColumns.school && item.schoolName && (
                        <span className="badge-role" style={{
                          background: 'rgba(120, 120, 128, 0.06)',
                          color: '#555555',
                          fontSize: '10px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '9999px'
                        }}>
                          <GraduationCap size={12} /> {item.schoolName}
                        </span>
                      )}
                      <span className="badge-role" style={{
                        background: 'rgba(245, 158, 11, 0.06)',
                        color: '#d97706',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '9999px'
                      }}>
                        <Calendar size={12} /> {submittedDate}
                      </span>
                    </div>
                  )}

                  {/* Body Details: Contact & Tax code */}
                  {(b2bVisibleColumns.owner || b2bVisibleColumns.document) && (
                    <div style={{
                      background: 'var(--surface-soft)',
                      borderRadius: '14px',
                      padding: '16px',
                      marginBottom: '18px',
                      fontSize: '13px',
                      color: '#333333',
                      border: '1px solid #f0f0f5',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {b2bVisibleColumns.owner && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '500' }}>
                              {item.ownerEmail}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                            <span style={{ fontWeight: '500' }}>
                              {item.representativeName} {item.representativePhone ? `(${item.representativePhone})` : ''}
                            </span>
                          </div>
                        </>
                      )}

                      {b2bVisibleColumns.owner && item.taxCode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #f0f0f5', paddingTop: '10px', marginTop: '2px' }}>
                          <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mã số thuế:</span>
                          <strong style={{ fontWeight: '700', color: 'var(--ink)' }}>{item.taxCode}</strong>
                        </div>
                      )}

                      {/* Links row */}
                      {b2bVisibleColumns.owner && (item.websiteUrl || item.fanpageUrl) && (
                        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f0f0f5', paddingTop: '10px', marginTop: '2px' }}>
                          {item.websiteUrl && (
                            <a
                              href={item.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#0066cc',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                                transition: 'all 200ms ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#0066cc';
                                e.currentTarget.style.background = 'rgba(0,102,204,0.02)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.background = 'var(--surface)';
                              }}
                            >
                              <ExternalLink size={11} /> Website
                            </a>
                          )}
                          {item.fanpageUrl && (
                            <a
                              href={item.fanpageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#ff7a1a',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                                transition: 'all 200ms ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ff7a1a';
                                e.currentTarget.style.background = 'rgba(255,122,26,0.02)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.background = 'var(--surface)';
                              }}
                            >
                              <ExternalLink size={11} /> Fanpage
                            </a>
                          )}
                        </div>
                      )}

                      {/* Document Button inside card details */}
                      {b2bVisibleColumns.document && (
                        <div style={{ borderTop: '1px solid #f0f0f5', paddingTop: '10px', marginTop: '2px' }}>
                          {item.documentUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewingDoc(item)}
                              style={{
                                border: `1.5px solid rgba(${accentRgb}, 0.2)`,
                                background: `rgba(${accentRgb}, 0.04)`,
                                color: accentColor,
                                borderRadius: '10px',
                                padding: '8px 14px',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                transition: 'all 200ms ease',
                                fontSize: '12px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                boxShadow: `0 2px 6px rgba(${accentRgb}, 0.04)`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `rgba(${accentRgb}, 0.08)`;
                                e.currentTarget.style.borderColor = accentColor;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `rgba(${accentRgb}, 0.04)`;
                                e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.2)`;
                              }}
                            >
                              <FileText size={14} />
                              <span style={{ flex: 1, textAlign: 'left', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                Xem {isClub ? 'Xác nhận CLB' : 'GP Đăng ký KD'}
                              </span>
                              <ExternalLink size={12} />
                            </button>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#dc2626',
                              fontWeight: '700',
                              fontSize: '12px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              <ShieldAlert size={14} style={{ flexShrink: 0 }} /> Chưa có tài liệu xác thực
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Internal Notes Section */}
                  <div style={{ marginTop: 'auto', borderTop: '1.5px dashed var(--line)', paddingTop: '16px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <textarea
                        value={notesValue}
                        onChange={(e) => setNotesDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                        disabled={isClaimedByOther}
                        placeholder={isClaimedByOther ? "Đang bị khóa bởi admin khác..." : "Ghi chú nội bộ..."}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13px',
                          minHeight: '44px',
                          maxHeight: '80px',
                          resize: 'none',
                          outline: 'none',
                          background: isClaimedByOther ? 'var(--surface-soft)' : 'var(--surface)',
                          color: 'var(--ink)',
                          transition: 'all 200ms ease'
                        }}
                        onFocus={(e) => {
                          if (!isClaimedByOther) {
                            e.target.style.borderColor = accentColor;
                            e.target.style.boxShadow = `0 0 0 3px rgba(${accentRgb}, 0.1)`;
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {!isClaimedByOther && (
                        <button
                          type="button"
                          className="button secondary-button"
                          onClick={() => handleSaveNotes('B2B_PARTNER', item.id)}
                          disabled={actionStatus.type === 'loading'}
                          style={{
                            borderRadius: '10px',
                            padding: '0 16px',
                            fontSize: '13px',
                            fontWeight: '700',
                            height: '44px',
                            cursor: 'pointer',
                            border: '1.5px solid #cbd5e1',
                            background: 'var(--surface)',
                            color: 'var(--ink)',
                            transition: 'all 200ms ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.color = accentColor;
                            e.currentTarget.style.background = `rgba(${accentRgb}, 0.04)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#1d1d1f';
                            e.currentTarget.style.background = 'var(--surface)';
                          }}
                        >
                          Lưu
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  {b2bVisibleColumns.status && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderTop: '1px solid #f0f0f5',
                      paddingTop: '16px'
                    }}>
                      {b2bSubTab === 'approved' ? (
                        <div style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: 'rgba(22, 163, 74, 0.06)',
                          border: '1.5px solid rgba(22, 163, 74, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          color: '#16a34a',
                          fontWeight: '700'
                        }}>
                          <CheckCircle2 size={16} /> Đối tác đã phê duyệt
                        </div>
                      ) : (
                        <>
                          {isUnclaimed && (
                            <button
                              type="button"
                              style={{
                                width: '100%',
                                height: '42px',
                                borderRadius: '9999px',
                                fontSize: '13px',
                                fontWeight: '700',
                                background: '#0066cc',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(0, 102, 204, 0.2)',
                                transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0052a3';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 102, 204, 0.28)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#0066cc';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 102, 204, 0.2)';
                              }}
                              onClick={() => handleClaim('B2B_PARTNER', item.id)}
                              disabled={actionStatus.type === 'loading'}
                            >
                              <UserPlus size={14} /> Nhận việc (Claim)
                            </button>
                          )}
                          {isClaimedByMe && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge-role" style={{
                                  background: 'rgba(22, 163, 74, 0.08)',
                                  color: '#16a34a',
                                  fontWeight: '800',
                                  fontSize: '10px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <CheckCircle2 size={12} /> Bạn đang đảm nhận
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUnclaim('B2B_PARTNER', item.id)}
                                  disabled={actionStatus.type === 'loading'}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#dc2626',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 200ms ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(220, 38, 38, 0.06)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  Nhả việc
                                </button>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {/* Approve Button */}
                                <button
                                  type="button"
                                  style={{
                                    height: '40px',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                                    transition: 'all 200ms ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#148a3e';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#16a34a';
                                    e.currentTarget.style.transform = 'none';
                                  }}
                                  onClick={() => openApproveConfirmation(item.id, item.name)}
                                  disabled={actionStatus.type === 'loading'}
                                >
                                  <Check size={14} /> Duyệt
                                </button>

                                {/* Reject Button */}
                                <button
                                  type="button"
                                  style={{
                                    height: '40px',
                                    borderRadius: '9999px',
                                    border: '1.5px solid #dc2626',
                                    background: 'transparent',
                                    color: '#dc2626',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 200ms ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#dc2626';
                                    e.currentTarget.style.color = '#ffffff';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#dc2626';
                                    e.currentTarget.style.transform = 'none';
                                  }}
                                  onClick={() => setRejectingItem(item)}
                                  disabled={actionStatus.type === 'loading'}
                                >
                                  <X size={14} /> Từ chối
                                </button>
                              </div>
                            </div>
                          )}
                          {isClaimedByOther && (
                            <div style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              background: 'rgba(245, 158, 11, 0.06)',
                              border: '1px dashed rgba(245, 158, 11, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              color: '#d97706',
                              fontWeight: '600'
                            }}>
                              <Lock size={12} style={{ flexShrink: 0 }} /> Khóa bởi: {item.claimedByAdminName || 'Admin khác'}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="admin-table-wrapper adm-fade-in-slide" key="b2b-list">
            <table className="admin-table">
              <thead>
                <tr>
                  {b2bVisibleColumns.partner && <th>Đối tác</th>}
                  {b2bVisibleColumns.type && <th>Phân loại</th>}
                  {b2bVisibleColumns.school && <th>Trường liên kết</th>}
                  {b2bVisibleColumns.owner && <th>Người đại diện / MST</th>}
                  {b2bVisibleColumns.document && <th>Tài liệu xác thực</th>}
                  {b2bVisibleColumns.status && <th>Trạng thái duyệt</th>}
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedB2b.map((item) => {
                  const isClub = item.companyType === 'CLUB';
                  const accentColor = isClub ? '#ff7a1a' : '#0066cc';
                  const isClaimedByMe = currentUser && item.claimedByAdminId && String(item.claimedByAdminId) === String(currentUser.id);
                  const isClaimedByOther = item.claimedByAdminId && (!currentUser || String(item.claimedByAdminId) !== String(currentUser.id));
                  const isUnclaimed = !item.claimedByAdminId;

                  return (
                    <tr key={item.id}>
                      {b2bVisibleColumns.partner && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: `${accentColor}12`, color: accentColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              {isClub ? <GraduationCap size={16} /> : <Building size={16} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{item.name}</div>
                              {item.description && (
                                <div style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {b2bVisibleColumns.type && (
                        <td>
                          <span className="badge-role" style={{ background: `${accentColor}08`, color: accentColor, fontWeight: '600' }}>
                            {isClub ? 'CLB Sinh Viên' : 'Doanh nghiệp SME'}
                          </span>
                        </td>
                      )}

                      {b2bVisibleColumns.school && (
                        <td>
                          {item.schoolName ? (
                            <span style={{ fontWeight: '500' }}>{item.schoolName}</span>
                          ) : (
                            <span style={{ color: 'var(--muted)' }}>—</span>
                          )}
                        </td>
                      )}

                      {b2bVisibleColumns.owner && (
                        <td>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{item.representativeName}</div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{item.ownerEmail}</div>
                            {item.taxCode && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>MST: <strong>{item.taxCode}</strong></div>}
                          </div>
                        </td>
                      )}

                      {b2bVisibleColumns.document && (
                        <td>
                          {item.documentUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewingDoc(item)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#0066cc',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: 0,
                                fontWeight: '600'
                              }}
                            >
                              <FileText size={15} /> Xem tài liệu
                            </button>
                          ) : (
                            <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>⚠ Chưa gửi</span>
                          )}
                        </td>
                      )}

                      {b2bVisibleColumns.status && (
                        <td>
                          {b2bSubTab === 'approved' ? (
                            <span className="badge-role" style={{ background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', fontWeight: '700', fontSize: '11px' }}>
                              Đã phê duyệt
                            </span>
                          ) : (
                            <>
                              {isUnclaimed && (
                                <button
                                  type="button"
                                  className="button secondary-button"
                                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '9999px', cursor: 'pointer' }}
                                  onClick={() => handleClaim('B2B_PARTNER', item.id)}
                                  disabled={actionStatus.type === 'loading'}
                                >
                                  Nhận việc (Claim)
                                </button>
                              )}
                              {isClaimedByMe && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span className="badge-role" style={{ background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', fontWeight: '700', fontSize: '11px' }}>
                                    Bạn đang duyệt
                                  </span>
                                  <button
                                    type="button"
                                    style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                                    onClick={() => handleUnclaim('B2B_PARTNER', item.id)}
                                    disabled={actionStatus.type === 'loading'}
                                  >
                                    Nhả việc
                                  </button>
                                </div>
                              )}
                              {isClaimedByOther && (
                                <span className="badge-role" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#d97706', fontWeight: '700', fontSize: '11px' }}>
                                  Đã khóa bởi: {item.claimedByAdminName || 'Admin'}
                                </span>
                              )}
                            </>
                          )}
                        </td>
                      )}

                      <td>
                        {b2bSubTab === 'approved' ? (
                          <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: '700' }}>✓ Đã kích hoạt</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="button primary-button"
                              style={{
                                borderRadius: '9999px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                background: isClaimedByMe ? '#16a34a' : 'var(--line)',
                                color: isClaimedByMe ? '#ffffff' : '#a1a1aa',
                                border: 'none',
                                cursor: isClaimedByMe ? 'pointer' : 'not-allowed'
                              }}
                              onClick={() => openApproveConfirmation(item.id, item.name)}
                              disabled={actionStatus.type === 'loading' || !isClaimedByMe}
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              style={{
                                borderRadius: '9999px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: isClaimedByMe ? '1px solid #dc2626' : '1px solid #e5e7eb',
                                color: isClaimedByMe ? '#dc2626' : '#a1a1aa',
                                background: 'transparent',
                                cursor: isClaimedByMe ? 'pointer' : 'not-allowed',
                                transition: 'all 200ms ease'
                              }}
                              onMouseOver={(e) => {
                                      if (isClaimedByMe) {
                                        e.currentTarget.style.background = '#dc2626';
                                        e.currentTarget.style.color = '#ffffff';
                                      }
                                    }}
                              onMouseOut={(e) => {
                                      if (isClaimedByMe) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#dc2626';
                                      }
                                    }}
                              onClick={() => setRejectingItem(item)}
                              disabled={actionStatus.type === 'loading' || !isClaimedByMe}
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Pill for B2B list view */}
        {b2bViewMode === 'list' && totalB2bPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            marginTop: '28px',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              disabled={b2bCurrentPage === 1}
              onClick={() => setB2bCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                border: '1px solid ' + (b2bCurrentPage === 1 ? 'var(--line)' : 'var(--line)'),
                background: b2bCurrentPage === 1 ? 'var(--surface-soft)' : 'var(--surface)',
                color: b2bCurrentPage === 1 ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: b2bCurrentPage === 1 ? 'not-allowed' : 'pointer',
                boxShadow: b2bCurrentPage === 1 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalB2bPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === b2bCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setB2bCurrentPage(pageNum)}
                  style={{
                    border: '1px solid ' + (isActive ? '#0066cc' : 'var(--line)'),
                    background: isActive ? '#0066cc' : 'var(--surface)',
                    color: isActive ? '#ffffff' : '#1d1d1f',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 102, 204, 0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={b2bCurrentPage === totalB2bPages}
              onClick={() => setB2bCurrentPage(prev => Math.min(prev + 1, totalB2bPages))}
              style={{
                border: '1px solid ' + (b2bCurrentPage === totalB2bPages ? 'var(--line)' : 'var(--line)'),
                background: b2bCurrentPage === totalB2bPages ? 'var(--surface-soft)' : 'var(--surface)',
                color: b2bCurrentPage === totalB2bPages ? '#cccccc' : '#0066cc',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: b2bCurrentPage === totalB2bPages ? 'not-allowed' : 'pointer',
                boxShadow: b2bCurrentPage === totalB2bPages ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    );
  }

  /* ───────────────────────────────────────────────
     Main Return JSX Layout
  ─────────────────────────────────────────────── */
  return (
    <div className="admin-css-vars">
    <Theme theme={neutralTheme} mode="light">
      <AppShell
        contentPadding={0}
        height="fill"
        variant="surface"
        sideNav={
          <div className="admin-sidenav-wrap">
            <SideNav
              resizable={{ defaultWidth: 274, minWidth: 220, maxWidth: 380, autoSaveId: 'admin-sidenav-width' }}
              collapsible={{ isCollapsed: isSidebarCollapsed, onCollapsedChange: setIsSidebarCollapsed, hasButton: false }}
              header={
                <div className={`admin-sidenav-header${isSidebarCollapsed ? ' admin-sidenav-header--collapsed' : ''}`}>
                  {!isSidebarCollapsed && (
                    <Link to={ADMIN_BASE_PATH} className="admin-sidenav-brand">
                      <span className="admin-sidenav-eyebrow">Admin</span>
                      <span className="admin-sidenav-title">next please</span>
                    </Link>
                  )}
                  <ToggleButton
                    label={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
                    isIconOnly
                    size="sm"
                    isPressed={isSidebarCollapsed}
                    onPressedChange={setIsSidebarCollapsed}
                    icon={<PanelLeftClose size={16} />}
                    pressedIcon={<PanelLeftOpen size={16} />}
                  />
                </div>
              }
              topContent={
                <div className={`admin-sidebar-profile${isSidebarCollapsed ? ' admin-sidebar-profile--collapsed' : ''}`}>
                  <div className="admin-profile-avatar" title={adminEmail || 'admin@nextplease.vn'}>
                    {(adminEmail || 'A').slice(0, 2).toUpperCase()}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="admin-profile-info">
                      <span className="admin-profile-name" title={adminEmail || 'admin@nextplease.vn'}>
                        {adminEmail || 'admin@nextplease.vn'}
                      </span>
                      <span className="admin-profile-role">Administrator</span>
                    </div>
                  )}
                </div>
              }
              footerIcons={
                <IconButton
                  label="Đăng xuất"
                  tooltip="Đăng xuất"
                  variant="ghost"
                  icon={<LogOut size={18} />}
                  onClick={handleLogout}
                />
              }
            >
              <SideNavSection isHeaderHidden>
                {SIDEBAR_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const hasSubItems = tab.subItems && tab.subItems.length > 0;
                const isExpanded = manualNavExpand.has(tab.key) ? manualNavExpand.get(tab.key) : (isActive && hasSubItems);
                const pendingJobsCount = jobs.filter((j) => (j.status || '').toLowerCase() === 'pending').length;
                const pendingVerifCount = verifQueue.filter((item) => ((item.verification_status || item.status || 'PENDING').toUpperCase()) === 'PENDING').length;
                const badgeValue =
                  tab.key === 'B2B_REVIEWS'
                    ? b2bPendingCount
                    : tab.key === 'JOBS'
                      ? pendingJobsCount
                      : tab.key === 'VERIF_QUEUE'
                        ? pendingVerifCount
                        : 0;
                const showBadge = tab.badgeCount && badgeValue > 0;
                const badge = showBadge ? <Badge label={badgeValue} variant={isActive ? 'error' : 'neutral'} /> : undefined;

                if (hasSubItems) {
                  return (
                    <SideNavItem
                      key={tab.key}
                      label={tab.label}
                      icon={Icon}
                      isSelected={isActive && !isExpanded}
                      href={getAdminTabPath(tab.key, tab.subItems[0].subRoute)}
                      collapsible={{
                        isCollapsed: !isExpanded,
                        onCollapsedChange: (isCollapsed) =>
                          setManualNavExpand((prev) => new Map(prev).set(tab.key, !isCollapsed)),
                      }}
                      endContent={badge}
                    >
                      {tab.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const currentSubRoute = tab.key === 'VERIF_QUEUE' ? verifSubTab : tab.key === 'JOBS' ? jobsSubTab : b2bSubTab;
                        const isSubActive = currentSubRoute === sub.subRoute;
                        return (
                          <SideNavItem
                            key={sub.key}
                            label={sub.label}
                            icon={SubIcon}
                            isSelected={isSubActive}
                            href={getAdminTabPath(tab.key, sub.subRoute)}
                          />
                        );
                      })}
                    </SideNavItem>
                  );
                }

                return (
                  <SideNavItem
                    key={tab.key}
                    label={tab.label}
                    icon={Icon}
                    isSelected={isActive}
                    href={getAdminTabPath(tab.key)}
                    endContent={badge}
                  />
                );
              })}
            </SideNavSection>
            </SideNav>
          </div>
        }
      >
        <div className="admin-view-pane">
          {/* Top Compact Navigation Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '12px'
          }}>
            <Breadcrumbs variant="supporting">
              <BreadcrumbItem href={ADMIN_BASE_PATH}>Hệ thống</BreadcrumbItem>
              <BreadcrumbItem isCurrent>
                {activeTab === 'JOBS'
                  ? 'Bài đăng'
                  : activeTab === 'VERIF_QUEUE'
                  ? 'Xác thực'
                  : SIDEBAR_TABS.find((t) => t.key === activeTab)?.label}
              </BreadcrumbItem>
            </Breadcrumbs>

            {/* Inline Controls Wrap (Bell, Theme, Reload) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              {/* Inline Notification Bell */}
              <NotificationBell
                accent="#dc2626"
                style={{ position: 'relative', top: 'auto', right: 'auto', zIndex: 190 }}
                buttonStyle={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: '#1d1d1f',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              />

              {/* Tải lại Button */}
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => fetchTabData(activeTab)}
                disabled={loading}
                style={{
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  borderRadius: '9999px',
                  height: '38px',
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-soft)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
              >
                {loading ? <Spinner size="sm" shade="inherit" /> : <RefreshCw size={14} />}
                Tải lại
              </button>

            </div>
          </div>

          {/* Tab Render Switcher */}
          {loading ? (
            <AdminContentSkeleton />
          ) : (
            <div
              key={`${activeTab}-${jobsSubTab}-${verifSubTab}`}
              className="admin-view-anim"
            >
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
      </AppShell>

      {/* ── Custom Confirm Modal ── */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
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
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={(e) => e.target === e.currentTarget && setRejectingItem(null)}>
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
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={(e) => e.target === e.currentTarget && setRejectingJobItem(null)}>
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
              {selectedJobGroup.jobs.some((j) => (j.status || '').toLowerCase() === 'pending') && (
                <button
                  type="button"
                  className="button primary-button"
                  style={{ background: '#16a34a', borderColor: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
                  onClick={openApproveAllGroupConfirmation}
                  disabled={actionStatus.type === 'loading'}
                >
                  <Check size={15} /> Duyệt toàn bộ
                </button>
              )}
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
                        {job.contentFlag && (
                          <span className="admin-flag-badge" title="Hệ thống tự động phát hiện từ ngữ nghi ngờ — cần xem kỹ trước khi duyệt"><AlertTriangle size={11} /> Nghi ngờ nội dung</span>
                        )}
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
                              style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--surface-soft)', borderColor: '#d1d5db', color: '#1f2937', cursor: 'pointer' }}
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
                        background: isClaimedByMe ? '#dcfce7' : isClaimedByOther ? '#fef3c7' : 'var(--surface-soft)',
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
                              style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--surface)', borderColor: '#d1d5db', cursor: 'pointer' }}
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

                    {selectedJobDetail.contentFlag && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '13px 16px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', color: '#b45309', marginBottom: '18px', fontSize: '0.86rem' }}>
                        <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span><strong>Cảnh báo kiểm duyệt tự động:</strong> Hệ thống phát hiện tiêu đề/mô tả có thể chứa từ ngữ không phù hợp. Vui lòng đọc kỹ nội dung trước khi quyết định duyệt hoặc từ chối.</span>
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
                            background: isClaimedByOther ? 'var(--surface-soft)' : 'var(--surface)'
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

      {/* ── User Details Slide-Over Panel ── */}
      <div
        className={`admin-slideover-overlay ${selectedUserDetail ? 'open' : ''}`}
        onClick={() => setSelectedUserDetail(null)}
      >
        <div
          className="admin-slideover-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedUserDetail && (() => {
            const rolesArray = (selectedUserDetail.roles || '').split(', ');
            const rolesStr = (selectedUserDetail.roles || '').toLowerCase();
            const isAdm = rolesStr.includes('admin');
            const isCand = rolesStr.includes('candidate');
            const isPartner = rolesStr.includes('employer') || rolesStr.includes('organizer');
            const isPremium = selectedUserDetail.premiumUntil && new Date(selectedUserDetail.premiumUntil) > new Date();

            let avatarBg = 'linear-gradient(135deg, #475569 0%, #1e293b 100%)';
            if (isCand) avatarBg = 'linear-gradient(135deg, #0066cc 0%, #2997ff 100%)';
            if (isPartner) avatarBg = 'linear-gradient(135deg, #d97706 0%, #ff7a1a 100%)';

            let statusText = 'Đang hoạt động';
            let statusColor = '#16a34a';
            if (isPartner) {
              const compStatus = (selectedUserDetail.companyStatus || '').toUpperCase();
              if (compStatus === 'PENDING') { statusText = 'Chờ duyệt đối tác'; statusColor = '#f59e0b'; }
              else if (compStatus === 'REJECTED') { statusText = 'Bị từ chối'; statusColor = '#dc2626'; }
              else if (compStatus !== 'APPROVED') { statusText = 'Chưa đăng ký đối tác'; statusColor = '#7a7a7a'; }
            } else {
              const userStat = (selectedUserDetail.userStatus || '').toUpperCase();
              if (userStat === 'FROZEN') { statusText = 'Tạm khóa'; statusColor = '#f59e0b'; }
              else if (userStat === 'BANNED') { statusText = 'Bị khóa'; statusColor = '#dc2626'; }
            }

            return (
              <>
                {/* Header */}
                <div className="admin-slideover-header" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                    <User size={14} />
                    <span>Chi tiết tài khoản</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUserDetail(null)}
                    style={{
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      width: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--muted)', transition: 'background 150ms'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-soft)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="admin-slideover-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Hero Section */}
                  <div className="slideover-stagger-item" style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    background: 'var(--surface-soft)',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid var(--line)',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.01)'
                  }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      background: avatarBg, color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}>
                      {(selectedUserDetail.displayName || selectedUserDetail.email || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--ink)', fontFamily: 'SF Pro Display, sans-serif', letterSpacing: '-0.02em' }}>
                          {selectedUserDetail.displayName || '—'}
                        </h3>
                        {isPremium && (
                          <span className="badge-role" style={{ background: 'rgba(255, 122, 26, 0.1)', color: '#ff7a1a', fontSize: '11px', fontWeight: '700' }}>
                            👑 Premium
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--muted)', wordBreak: 'break-all', display: 'block', marginTop: '2px' }}>
                        {selectedUserDetail.email}
                      </span>
                    </div>
                  </div>

                  {/* Card 1: Core System Metadata */}
                  <div className="adm-detail-card slideover-stagger-item">
                    <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <FileText size={15} style={{ color: '#0066cc' }} /> Thông tin hệ thống
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ID Tài khoản (UUID)</span>
                        <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--muted)', wordBreak: 'break-all', marginTop: '4px' }}>{selectedUserDetail.id}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Đăng nhập qua</span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)', textTransform: 'capitalize', marginTop: '4px' }}>{selectedUserDetail.authProvider || 'supabase'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Account Status & Memberships */}
                  <div className="adm-detail-card slideover-stagger-item">
                    <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <ShieldCheck size={15} style={{ color: '#16a34a' }} /> Trạng thái & Quyền hạn
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Trạng thái hiện tại</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span className="adm-status-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{statusText}</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Xác minh sinh viên</span>
                        <div style={{ marginTop: '4px' }}>
                          {selectedUserDetail.studentEmailVerified ? (
                            <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600' }}>
                              <CheckCircle size={14} /> Đã xác minh
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Chưa xác minh</span>
                          )}
                        </div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gói Hội Viên</span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)', marginTop: '4px' }}>
                          {selectedUserDetail.premiumUntil ? (
                            new Date(selectedUserDetail.premiumUntil) > new Date() ? (
                              <span style={{ color: '#ff7a1a', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                👑 Premium (Hạn dùng đến: {new Date(selectedUserDetail.premiumUntil).toLocaleDateString('vi-VN')})
                              </span>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>Đã hết hạn Premium vào {new Date(selectedUserDetail.premiumUntil).toLocaleDateString('vi-VN')}</span>
                            )
                          ) : (
                            <span style={{ color: 'var(--muted)' }}>Tài khoản thường (Miễn phí)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Activity Timestamps */}
                  <div className="adm-detail-card slideover-stagger-item">
                    <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <Clock size={15} style={{ color: 'var(--muted)' }} /> Mốc thời gian hoạt động
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ngày tạo tài khoản</span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)', marginTop: '4px' }}>
                          {selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleString('vi-VN') : '—'}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Đăng nhập cuối</span>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)', marginTop: '4px' }}>
                          {selectedUserDetail.lastLoginAt ? new Date(selectedUserDetail.lastLoginAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Roles List */}
                  <div className="adm-detail-card slideover-stagger-item">
                    <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      Vai trò phân bổ
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {rolesArray.map((role) => {
                        const isRoleAdm = role.includes('admin');
                        const isRoleCand = role.includes('candidate');
                        const badgeClass = isRoleAdm ? 'admin' : isRoleCand ? 'candidate' : 'partner';
                        const label = isRoleAdm ? 'Quản trị viên' : isRoleCand ? 'Ứng viên' : 'Đối tác';
                        return (
                          <span key={role} className={`badge-role ${badgeClass}`}>
                            {label} ({role})
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 5: Linked Partner (conditionally rendered) */}
                  {isPartner && selectedUserDetail.companyType && (
                    <div className="adm-detail-card slideover-stagger-item">
                      <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                        <Building size={15} style={{ color: '#d97706' }} /> Thông tin đối tác liên kết
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px', color: 'var(--ink)' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phân loại</span>
                          <div style={{ fontWeight: '600', marginTop: '4px' }}>{selectedUserDetail.companyType}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Xác thực hồ sơ</span>
                          <div style={{ fontWeight: '600', marginTop: '4px', color: selectedUserDetail.companyStatus === 'APPROVED' ? '#16a34a' : '#d97706' }}>{selectedUserDetail.companyStatus || 'NONE'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 6: Audit Logs histories */}
                  <div className="adm-detail-card slideover-stagger-item">
                    <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <Activity size={15} style={{ color: 'var(--muted)' }} /> Nhật ký hoạt động gần đây
                    </h4>
                    {(() => {
                      const userLogs = logs.filter(log => log.actorEmail === selectedUserDetail.email);
                      if (userLogs.length === 0) {
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px',
                            border: '1px dashed var(--line)',
                            borderRadius: '12px',
                            background: 'var(--surface-soft)',
                            color: 'var(--muted)',
                            gap: '8px',
                            textAlign: 'center'
                          }}>
                            <Clock size={24} style={{ color: '#c7c7cc' }} />
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>Không ghi nhận hoạt động của tài khoản</span>
                          </div>
                        );
                      }
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                          {userLogs.slice(0, 5).map((log) => {
                            const logDate = log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—';
                            return (
                              <div key={log.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'var(--surface-soft)',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                border: '1px solid var(--line)'
                              }}>
                                <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{log.action}</span>
                                <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{logDate}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Card 7: Moderation Panel Actions */}
                  {!isAdm && (
                    <div className="adm-detail-card slideover-stagger-item" style={{ borderColor: 'rgba(220, 38, 38, 0.2)', background: 'rgba(220, 38, 38, 0.01)' }}>
                      <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(220, 38, 38, 0.1)', paddingBottom: '8px' }}>
                        <ShieldAlert size={15} /> Khóa / Mở khóa tài khoản
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(selectedUserDetail.userStatus || 'ACTIVE').toUpperCase() !== 'ACTIVE' && (
                          <button
                            type="button"
                            className="admin-filter-tab active"
                            style={{
                              fontSize: '13px',
                              borderRadius: '9999px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              background: '#0066cc',
                              color: '#ffffff',
                              border: 'none'
                            }}
                            disabled={userModerateLoading}
                            onClick={() => handleUpdateUserStatus(selectedUserDetail.id, 'ACTIVE', selectedUserDetail.displayName)}
                          >
                            Kích hoạt lại
                          </button>
                        )}
                        {(selectedUserDetail.userStatus || 'ACTIVE').toUpperCase() !== 'FROZEN' && (
                          <button
                            type="button"
                            style={{
                              fontSize: '13px',
                              borderRadius: '9999px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              border: '1px solid #d97706',
                              color: '#d97706',
                              background: 'transparent',
                              fontWeight: '600',
                              transition: 'all 200ms ease'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.color = '#ffffff'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d97706'; }}
                            disabled={userModerateLoading}
                            onClick={() => handleUpdateUserStatus(selectedUserDetail.id, 'FROZEN', selectedUserDetail.displayName)}
                          >
                            Đóng băng
                          </button>
                        )}
                        {(selectedUserDetail.userStatus || 'ACTIVE').toUpperCase() !== 'BANNED' && (
                          <button
                            type="button"
                            style={{
                              fontSize: '13px',
                              borderRadius: '9999px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              background: 'transparent',
                              fontWeight: '600',
                              transition: 'all 200ms ease'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#ffffff'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}
                            disabled={userModerateLoading}
                            onClick={() => handleUpdateUserStatus(selectedUserDetail.id, 'BANNED', selectedUserDetail.displayName)}
                          >
                            Cấm vĩnh viễn
                          </button>
                        )}
                        <button
                          type="button"
                          style={{
                            fontSize: '13px',
                            borderRadius: '9999px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            background: '#b91c1c',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: '600',
                            transition: 'all 200ms ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#991b1b'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#b91c1c'}
                          disabled={userModerateLoading}
                          onClick={() => handleDeleteUser(selectedUserDetail.id, selectedUserDetail.displayName)}
                        >
                          Xóa tài khoản
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer */}
                <div className="admin-slideover-footer" style={{ padding: '16px 24px', background: 'var(--surface-soft)' }}>
                  <button
                    type="button"
                    className="button primary-button"
                    style={{
                      borderRadius: '9999px',
                      padding: '8px 24px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: '#0066cc',
                      border: 'none',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)'
                    }}
                    onClick={() => setSelectedUserDetail(null)}
                  >
                    Đóng
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>

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
    </Theme>
    </div>
  );
}