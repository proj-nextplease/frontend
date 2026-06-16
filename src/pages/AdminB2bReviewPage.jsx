import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.js';
import {
  getPendingB2bRegistrations,
  approveB2bRegistration,
  rejectB2bRegistration,
} from '../api/b2bApi.js';
import {
  getAdminStats,
  getAdminUsers,
  getAdminJobs,
  getAdminAuditLogs,
} from '../api/adminApi.js';
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
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
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
} from 'lucide-react';

const SIDEBAR_TABS = [
  { key: 'OVERVIEW', label: 'Tổng quan hệ thống', icon: BarChart2 },
  { key: 'USERS', label: 'Quản lý người dùng', icon: Users },
  { key: 'B2B_REVIEWS', label: 'Duyệt đối tác B2B', icon: Building, badgeCount: true },
  { key: 'JOBS', label: 'Quản lý đăng tin', icon: FileText },
  { key: 'AUDIT_LOGS', label: 'Ghi nhận hệ thống', icon: ShieldCheck },
];

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

export function AdminB2bReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: 'idle', message: '' });

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

  /* ─── State for Jobs/Quests ─── */
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchJobQuery, setSearchJobQuery] = useState('');
  const [jobPostTypeFilter, setJobPostTypeFilter] = useState('ALL');

  /* ─── State for Audit Logs ─── */
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  /* ─── State for Custom Confirmation Modal ─── */
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    confirmColor: '#2563eb',
    onConfirm: null,
  });

  /* Parse admin email from token on mount */
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
  }, []);

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
  }, [activeTab]);

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
    if (jobPostTypeFilter !== 'ALL') {
      result = result.filter((job) => job.postType === jobPostTypeFilter);
    }
    if (searchJobQuery.trim()) {
      const q = searchJobQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.companyName?.toLowerCase().includes(q),
      );
    }
    setFilteredJobs(result);
  }, [jobs, jobPostTypeFilter, searchJobQuery]);

  // 4. Logs Filter
  useEffect(() => {
    let result = [...logs];
    if (searchLogQuery.trim()) {
      const q = searchLogQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.action?.toLowerCase().includes(q) ||
          log.actorEmail?.toLowerCase().includes(q) ||
          log.entityType?.toLowerCase().includes(q),
      );
    }
    setFilteredLogs(result);
  }, [logs, searchLogQuery]);

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
          <div className="panel" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('B2B_REVIEWS')}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#f59e0b' }} />
              Duyệt hồ sơ chờ đối tác B2B
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
              Có <strong>{stats.totalPendingB2b}</strong> hồ sơ đang chờ xét duyệt minh chứng đăng ký và quyết định thành lập.
            </p>
          </div>
          <div className="panel" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('AUDIT_LOGS')}>
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
  function renderUsers() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search and filter controls */}
        <div className="admin-controls">
          <div className="admin-search-wrap" style={{ flex: 1 }}>
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm theo email, tên hiển thị..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ListFilter size={15} style={{ color: 'var(--muted)' }} />
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--card-bg-strong)',
                color: 'var(--ink)',
                fontSize: '0.88rem',
              }}
            >
              {USER_ROLE_FILTERS.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
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
                    <tr key={u.id}>
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
                        <span className={`badge-status ${String(u.status).toLowerCase()}`}>
                          {u.status}
                        </span>
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
     Jobs Tab Component View
  ─────────────────────────────────────────────── */
  function renderJobs() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Controls */}
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ListFilter size={15} style={{ color: 'var(--muted)' }} />
            <select
              value={jobPostTypeFilter}
              onChange={(e) => setJobPostTypeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--card-bg-strong)',
                color: 'var(--ink)',
                fontSize: '0.88rem',
              }}
            >
              {POST_TYPE_FILTERS.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Nhà tuyển dụng</th>
                <th>Phân loại</th>
                <th>Hình thức / Nhóm</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    Không tìm thấy tin đăng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: '750' }}>{j.title}</td>
                    <td>{j.companyName}</td>
                    <td>
                      <span className={`badge-role ${j.postType === 'JOB' ? 'candidate' : 'partner'}`}>
                        {j.postType}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>{j.jobType || '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {j.createdAt ? new Date(j.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <span className={`badge-status ${j.status === 'OPEN' ? 'active' : j.status === 'DRAFT' ? 'frozen' : 'banned'}`}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────
     Audit Logs Tab Component View
  ─────────────────────────────────────────────── */
  function renderAuditLogs() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Controls */}
        <div className="admin-controls">
          <div className="admin-search-wrap" style={{ flex: 1 }}>
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Tìm theo hành động (b2b.approved), email người thực hiện..."
              value={searchLogQuery}
              onChange={(e) => setSearchLogQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Timeline list of Audit logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredLogs.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Không tìm thấy ghi nhận lịch sử hệ thống phù hợp.
            </p>
          ) : (
            filteredLogs.map((log) => {
              const isApproved = log.action === 'b2b.approved';
              const isRejected = log.action === 'b2b.rejected';
              const iconColor = isApproved ? '#16a34a' : isRejected ? '#dc2626' : '#2563eb';
              const iconBg = isApproved ? 'rgba(22,163,74,0.08)' : isRejected ? 'rgba(220,38,38,0.08)' : 'rgba(37,99,235,0.08)';
              const logDate = log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—';
              const isExpanded = expandedLogId === log.id;

              return (
                <div key={log.id} className="admin-log-item">
                  <div className="admin-log-icon" style={{ color: iconColor, background: iconBg }}>
                    {isApproved ? <Check size={18} /> : isRejected ? <X size={18} /> : <ShieldAlert size={18} />}
                  </div>

                  <div className="admin-log-details">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{log.action}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{logDate}</span>
                    </div>

                    <p style={{ margin: '4px 0 0', fontSize: '0.86rem' }}>
                      Thực hiện bởi: <strong style={{ color: '#2563eb' }}>{log.actorEmail || 'Hệ thống'}</strong>
                    </p>

                    <div className="admin-log-meta">
                      Loại đối tượng tác động: <strong>{log.entityType || 'N/A'}</strong> (ID: {log.entityId || 'N/A'})
                    </div>

                    {log.metadata && (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          type="button"
                          className="button secondary-button"
                          style={{ padding: '4px 10px', fontSize: '0.74rem', gap: '4px' }}
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        >
                          {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                        </button>

                        {isExpanded && (
                          <pre className="admin-log-json">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
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
                            <span className="admin-type-badge" style={{ background: 'rgba(102,112,133,0.1)', color: 'var(--muted)' }}>
                              🎓 {item.schoolName}
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

                      <div className="admin-card-actions">
                        <button
                          className="button primary-button admin-approve-btn"
                          onClick={() => openApproveConfirmation(item.id, item.name)}
                          disabled={actionStatus.type === 'loading'}
                        >
                          <Check size={16} /> Phê duyệt
                        </button>
                        <button
                          className="button secondary-button admin-reject-btn"
                          onClick={() => setRejectingItem(item)}
                          disabled={actionStatus.type === 'loading'}
                        >
                          <X size={16} /> Từ chối
                        </button>
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
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <ShieldAlert size={20} style={{ color: '#dc2626' }} />
          <span className="admin-sidebar-logo">nextplease admin</span>
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
            // Get count of pending B2B only
            const showBadge = tab.badgeCount && pendingB2b.length > 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {showBadge && (
                  <span className="admin-tab-count" style={{ marginLeft: 'auto', background: isActive ? '#dc2626' : 'var(--line)', color: isActive ? '#fff' : 'var(--muted)' }}>
                    {pendingB2b.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogout} style={{ color: '#dc2626' }}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className="admin-main-container">
        <div className="admin-view-pane">
          {/* Section header title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>
                {SIDEBAR_TABS.find((t) => t.key === activeTab)?.label}
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.88rem' }}>
                {activeTab === 'OVERVIEW' && 'Số liệu tổng quan hoạt động và hạ tầng hệ thống.'}
                {activeTab === 'USERS' && 'Quản lý tài khoản Ứng viên, Doanh nghiệp & CLB và Quản trị viên.'}
                {activeTab === 'B2B_REVIEWS' && 'Duyệt các yêu cầu tham gia tuyển dụng của SME và CLB Sinh Viên.'}
                {activeTab === 'JOBS' && 'Quản lý tin tuyển dụng và chiến dịch Quest sự kiện đang hoạt động.'}
                {activeTab === 'AUDIT_LOGS' && 'Lịch sử nhật ký hoạt động hệ thống chi tiết.'}
              </p>
            </div>
            
            <button
              className="button secondary-button"
              onClick={() => fetchTabData(activeTab)}
              disabled={loading}
              style={{ gap: '8px', fontSize: '0.86rem' }}
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
            <div>
              {activeTab === 'OVERVIEW' && renderOverview()}
              {activeTab === 'USERS' && renderUsers()}
              {activeTab === 'B2B_REVIEWS' && renderB2bReviews()}
              {activeTab === 'JOBS' && renderJobs()}
              {activeTab === 'AUDIT_LOGS' && renderAuditLogs()}
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
