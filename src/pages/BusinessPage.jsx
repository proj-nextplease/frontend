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
  FileText,
  Filter,
  GraduationCap,
  Lock,
  LogOut,
  MessageSquareText,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  UserRound,
  UsersRound,
  Zap,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { getCurrentUser, getMyCompany, resubmitB2bDocument, updateB2bProfile } from '../api/b2bApi.js';
import { supabase } from '../services/supabaseClient.js';
import { JobCreateForm } from '../components/JobCreateForm.jsx';
import { getOrganizerJobs, getJobDetail } from '../api/jobApi.js';


const THEME_STORAGE_KEY = 'nextplease:theme';
const DASHBOARD_BASE_PATH = '/businesses/dashboard';

const ACCOUNT_TAB = { key: 'account', route: 'account', label: 'Thông tin tài khoản', icon: UserRound, lockable: false };

const SIDEBAR_TABS = [
  { key: 'dashboard', route: '', label: 'Bảng điều khiển', icon: BriefcaseBusiness, lockable: false },
  { key: 'create-job', route: 'create-job', label: 'Đăng tin tuyển dụng', icon: Plus, lockable: true },
  { key: 'manage-jobs', route: 'manage-jobs', label: 'Quản lý tin đăng', icon: FileText, lockable: true },
  { key: 'find-talent', route: 'find-talent', label: 'Tìm kiếm Talent', icon: Search, lockable: true },
  { key: 'candidates', route: 'candidates', label: 'Quản lý ứng viên', icon: UsersRound, lockable: true },
];

const ALL_TABS = [...SIDEBAR_TABS, ACCOUNT_TAB];

const TAB_BY_ROUTE = ALL_TABS.reduce((acc, tab) => {
  acc[tab.route] = tab.key;
  return acc;
}, {});

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
  { label: 'Job đang đăng', value: '0', icon: BriefcaseBusiness, color: '#2563eb' },
  { label: 'Ứng viên phù hợp', value: '142', icon: UsersRound, color: '#ff7a1a' },
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
function PendingView({ company, onRefresh }) {
  const steps = [
    { label: 'Đã đăng ký', done: true },
    { label: 'Đang xét duyệt', active: true },
    { label: 'Bắt đầu tuyển dụng', done: false },
  ];

  return (
    <section className="dashboard-page" style={{ maxWidth: '860px', margin: '32px auto', padding: '0 16px' }}>
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
            style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
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
  const companyTypeColor = company?.companyType === 'CLUB' ? '#ff7a1a' : '#2563eb';

  return (
    <section className="dashboard-page">
      {/* ── Hero header ── */}
      <div className="b2b-dashboard-hero">
        <div className="b2b-hero-left">
          <div className="b2b-company-avatar">
            {(company?.name || 'B').slice(0, 2).toUpperCase()}
          </div>
          <div className="b2b-hero-copy">
            <div className="b2b-hero-badges">
              <span className="b2b-type-badge" style={{ background: companyTypeColor === '#2563eb' ? 'rgba(37,99,235,0.1)' : 'rgba(255,122,26,0.1)', color: companyTypeColor }}>
                {company?.companyType === 'CLUB' ? <GraduationCap size={13} /> : <Building size={13} />}
                {companyTypeLabel}
              </span>
              <span className="b2b-type-badge" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                <BadgeCheck size={13} /> Đã xác thực
              </span>
            </div>
            <h1>{company?.name}</h1>
            <div className="b2b-hero-meta">
              <span>Đại diện: {company?.representativeName}</span>
              <span>{company?.representativePhone}</span>
              {company?.taxCode ? <span>MST: {company.taxCode}</span> : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="b2b-stats-row">
        {mockStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="b2b-stat-card">
              <div className="b2b-stat-icon" style={{ color: s.color, background: `${s.color}18` }}>
                <Icon size={20} />
              </div>
              <div>
                <strong className="b2b-stat-value">{s.value}</strong>
                <span className="b2b-stat-label">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: '#ff7a1a' }} /> Thao tác nhanh
        </h2>
        <div className="b2b-quick-grid">
          {[
            { icon: BriefcaseBusiness, label: 'Đăng Job / Gig', desc: 'Mô tả công việc và yêu cầu RS', color: '#2563eb', soon: false, tab: 'create-job' },
            { icon: Star, label: 'Tạo Quest sự kiện', desc: 'Tuyển event staff, campus marketer', color: '#ff7a1a', soon: false, tab: 'create-job' },
            { icon: Search, label: 'Tìm kiếm Talent', desc: 'Lọc theo RS, kỹ năng, trường học', color: '#16a34a', soon: false, tab: 'find-talent' },
            { icon: MessageSquareText, label: 'Quản lý ứng viên', desc: 'Shortlist & theo dõi tiến trình', color: '#7c3aed', soon: true, tab: 'candidates' },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                className={`b2b-quick-card ${a.soon ? 'coming-soon' : ''}`}
                disabled={a.soon}
                onClick={() => onTabChange(a.tab)}
                type="button"
              >
                {a.soon && <span className="b2b-coming-badge">Sắp ra mắt</span>}
                <div className="b2b-quick-icon" style={{ color: a.color, background: `${a.color}14` }}>
                  <Icon size={22} />
                </div>
                <strong className="b2b-quick-label">{a.label}</strong>
                <p className="b2b-quick-desc">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Two column: Talent + Hiring flow ── */}
      <div className="two-column">
        <section className="panel">
          <div className="panel-title">
            <UsersRound size={20} style={{ color: '#2563eb' }} />
            <h2>Talent Shortlist mẫu</h2>
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: '600', padding: '4px 10px', borderRadius: '999px', background: 'var(--surface-soft)' }}>
              Demo data
            </span>
          </div>
          <div className="talent-list">
            {mockTalents.map((t) => (
              <article className="talent-card" key={t.name}>
                <span className="avatar-token" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff' }}>
                  {t.name.slice(0, 2).toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '0.92rem' }}>{t.name}</h3>
                  <p style={{ margin: '2px 0', fontSize: '0.82rem' }}>{t.role}</p>
                  <small>{t.proof}</small>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{t.rs} RS</strong>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: tierColors[t.tier] || '#667085' }}>{t.tier}</span>
                </div>
              </article>
            ))}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '16px 0 0', textAlign: 'center' }}>
            Danh sách talent thực tế sẽ hiển thị sau khi tính năng tìm kiếm được kích hoạt.
          </p>
        </section>

        <section className="panel">
          <div className="panel-title">
            <ShieldCheck size={20} style={{ color: '#16a34a' }} />
            <h2>Quy trình tuyển dụng</h2>
          </div>
          <div className="step-list">
            {[
              { n: 1, text: 'Đăng job, gig, quest hoặc nhu cầu event staffing', color: '#2563eb' },
              { n: 2, text: 'Lọc ứng viên theo RS threshold, verified skills và lịch rảnh', color: '#ff7a1a' },
              { n: 3, text: 'Xem portfolio 3D đã xác thực của từng ứng viên', color: '#7c3aed' },
              { n: 4, text: 'Mời, shortlist và quản lý applications qua dashboard', color: '#16a34a' },
            ].map((step) => (
              <article className="timeline-item" key={step.n}>
                <span style={{ background: `${step.color}18`, color: step.color, width: '32px', height: '32px', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step.n}
                </span>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{step.text}</p>
              </article>
            ))}
          </div>
          <button className="button primary-button" type="button" onClick={() => onTabChange('create-job')}
            style={{ marginTop: '20px', width: '100%', background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent', justifyContent: 'center' }}>
            <Plus size={18} /> Tạo cơ hội tuyển dụng đầu tiên
          </button>
        </section>
      </div>

      {/* ── How it works ── */}
      <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(255,122,26,0.02) 100%)' }}>
        <div className="panel-title">
          <Sparkles size={20} style={{ color: '#ff7a1a' }} />
          <h2>Tại sao chọn nextplease?</h2>
        </div>
        <div className="feature-grid" style={{ marginTop: '20px' }}>
          {[
            { icon: ShieldCheck, title: 'Verified Proof', desc: 'Mọi ứng viên đều có minh chứng thực tế đã được xác thực. Không còn CV phóng đại.', color: '#2563eb' },
            { icon: Filter, title: 'RS Filtering', desc: 'Lọc chính xác theo Reputation Score, tier, kỹ năng và trường học. Backend đảm bảo tin cậy.', color: '#ff7a1a' },
            { icon: TrendingUp, title: 'Campus Coverage', desc: 'Kết nối chặt chẽ với CLB và sinh viên năng động từ các trường đối tác.', color: '#16a34a' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <article className="feature-card" key={f.title}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${f.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ margin: '14px 0 6px' }}>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            );
          })}
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

function ManageJobsView({ onTabChange }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal state
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  async function fetchJobs() {
    setLoading(true);
    try {
      const data = await getOrganizerJobs();
      setJobs(data || []);
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

  // Filter jobs based on local search & status dropdown
  const filteredJobs = jobs.filter(job => {
    const titleMatch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = (CATEGORY_MAP[job.category] || job.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || categoryMatch;
    
    const matchesStatus = statusFilter === 'ALL' || (job.status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="dashboard-page">
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
            <div className="b2b-stat-icon" style={{ color: '#ff7a1a', background: 'rgba(255, 122, 26, 0.08)' }}>
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
            style={{ padding: '10px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}
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
                <option value="OPEN">Hoạt động (Approved)</option>
                <option value="PENDING">Chờ duyệt (Pending)</option>
                <option value="REJECTED">Từ chối (Rejected)</option>
                <option value="CLOSED">Đã đóng (Closed)</option>
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
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '16px'
          }}>
            {filteredJobs.map((job) => {
              const statusLower = (job.status || '').toLowerCase();
              let badgeBg = 'rgba(107, 114, 128, 0.08)';
              let badgeColor = '#6b7280';
              let statusText = job.status;
              let StatusIcon = Clock;

              if (statusLower === 'open') {
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={14} />
                        <span>{JOB_TYPES[job.jobType] || job.jobType}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        <span>Đăng ngày: {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer/Stats Block */}
                  <div style={{
                    borderTop: '1px solid var(--line)',
                    paddingTop: '12px',
                    marginTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UsersRound size={15} style={{ color: '#2563eb' }} />
                      <strong style={{ fontSize: '0.86rem', color: 'var(--ink)' }}>
                        {job.applicantsCount || 0} ứng viên
                      </strong>
                    </div>
                    <span style={{
                      fontSize: '0.78rem',
                      color: '#2563eb',
                      fontWeight: '800',
                      textDecoration: 'underline'
                    }}>
                      Xem chi tiết
                    </span>
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
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Thù lao / Phụ cấp:</span>
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700', color: '#16a34a' }}>
                        {selectedJobDetail.compensation ? `${formatVND(selectedJobDetail.compensation)} VND` : 'Thỏa thuận'}
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
                      <strong style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ff7a1a' }}>
                        {selectedJobDetail.deadlineAt ? new Date(selectedJobDetail.deadlineAt).toLocaleString('vi-VN') : 'Không giới hạn'}
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
    }
  }, [company]);

  const companyTypeLabel = getPartnerTypeLabel(company?.companyType);
  const verificationTone = getVerificationTone(company?.verificationStatus);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setActionStatus({ type: 'loading', message: 'Đang cập nhật hồ sơ...' });

    try {
      await updateB2bProfile(formData);
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
  }

  return (
    <section className="dashboard-page partner-account-page">
      <div className="partner-account-hero">
        <div className="b2b-company-avatar">
          {(company?.name || account?.email || 'P').slice(0, 2).toUpperCase()}
        </div>
        <div className="partner-account-hero-copy">
          <span className="b2b-type-badge" style={verificationTone}>
            <BadgeCheck size={13} />
            {getVerificationLabel(company?.verificationStatus)}
          </span>
          <h1>{company?.name || 'Thông tin đối tác'}</h1>
          <p>{account?.email || 'Email tài khoản sẽ hiển thị sau khi đồng bộ đăng nhập.'}</p>
        </div>
        {!isEditing && (
          <button className="button secondary-button" onClick={() => setIsEditing(true)} type="button">
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>

      <div className="partner-account-grid" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
        <section className="panel partner-account-panel">
          <div className="panel-title" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} style={{ color: '#ff7a1a' }} />
              <h2>Hồ sơ đối tác</h2>
            </div>
            {isEditing && (
              <span style={{ fontSize: '0.85rem', color: '#ff7a1a', fontWeight: 'bold' }}>
                * Sau khi lưu, hồ sơ sẽ được gửi lại cho Admin xét duyệt
              </span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', height: '42px' }}
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
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
                  />
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
                    value={formData.fanpageUrl}
                    onChange={handleInputChange}
                    className="input-field"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Tài liệu xác minh</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', border: '1px dashed var(--line)', borderRadius: '10px', background: 'var(--bg)', cursor: 'pointer', height: '42px', boxSizing: 'border-box' }}>
                    <FileText size={18} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {uploadedFile ? uploadedFile.name : (formData.documentUrl ? 'Đã tải lên tài liệu' : 'Chọn tệp ảnh hoặc PDF')}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--muted)' }}>Mô tả tổ chức</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', resize: 'vertical' }}
                />
              </div>

              {actionStatus.message && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: actionStatus.type === 'success' ? 'rgba(22,163,74,0.1)' : (actionStatus.type === 'error' ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.1)'), color: actionStatus.type === 'success' ? '#16a34a' : (actionStatus.type === 'error' ? '#dc2626' : '#2563eb') }}>
                  {actionStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{actionStatus.message}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={actionStatus.type === 'loading'} className="button primary-button" style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
                  Lưu thay đổi
                </button>
                <button type="button" onClick={handleCancel} className="button secondary-button">
                  Hủy bỏ
                </button>
              </div>
            </form>
          ) : (
            <div className="partner-account-detail-grid">
              <DetailItem label="Tên tổ chức" value={company?.name} />
              <DetailItem label="Loại đối tác" value={companyTypeLabel} />
              <DetailItem label="Mã số thuế" value={company?.taxCode} />
              <DetailItem label="Người đại diện" value={company?.representativeName} />
              <DetailItem label="Số điện thoại" value={company?.representativePhone} />
              <DetailItem label="Website" value={company?.websiteUrl} href={company?.websiteUrl} />
              <DetailItem label="Fanpage" value={company?.fanpageUrl} href={company?.fanpageUrl} />
              <DetailItem
                label="Tài liệu xác minh"
                value={company?.documentUrl ? 'Xem tài liệu' : ''}
                onClick={company?.documentUrl ? () => handleViewDocument(company.documentUrl) : null}
              />
            </div>
          )}
        </section>
      </div>

      {!isEditing && company?.description ? (
        <section className="panel partner-account-panel" style={{ marginTop: '24px' }}>
          <div className="panel-title">
            <FileText size={20} style={{ color: '#16a34a' }} />
            <h2>Mô tả tổ chức</h2>
          </div>
          <p className="partner-account-description">{company.description}</p>
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
  const [toast, setToast] = useState({ type: 'idle', message: '' });
  const [theme, setTheme] = useState(getInitialTheme);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);
  const activeTab = TAB_BY_ROUTE[tabSlug] || 'dashboard';
  const isDarkTheme = theme === 'dark';

  async function fetchCompanyData() {
    setError(null);
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
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải thông tin đối tác.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    sessionStorage.removeItem('nextplease:access_token');
    if (supabase) await supabase.auth.signOut().catch(() => {});
    navigate('/business/login');
  }

  function handleTabChange(tabKey) {
    navigate(getTabPath(tabKey));
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  useEffect(() => {
    fetchCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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

  /* Error */
  if (error) {
    return (
      <section style={{ maxWidth: '560px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="panel" style={{ padding: '40px', borderRadius: '20px', border: '1px solid rgba(220,38,38,0.2)' }}>
          <AlertTriangle size={40} style={{ color: '#dc2626', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Không thể tải dữ liệu</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>{error}</p>
          <button className="button primary-button" onClick={fetchCompanyData}
            style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
            <RefreshCw size={16} /> Thử lại
          </button>
        </div>
      </section>
    );
  }

  const companyTypeLabel = getPartnerTypeLabel(company?.companyType);
  const companyTypeColor = company?.companyType === 'CLUB' ? '#ff7a1a' : '#2563eb';

  function renderContent() {
    if (activeTab === 'account') {
      return <AccountDetailView account={account} company={company} onRefresh={fetchCompanyData} />;
    }

    if (company?.verificationStatus === 'PENDING') {
      return <PendingView company={company} onRefresh={fetchCompanyData} />;
    }
    if (company?.verificationStatus === 'REJECTED') {
      return <RejectedView company={company} onRefresh={fetchCompanyData} />;
    }

    /* verificationStatus === 'APPROVED' */
    switch (activeTab) {
      case 'dashboard':
        return <ApprovedView company={company} onTabChange={handleTabChange} />;
      case 'create-job':
        return (
          <JobCreateForm
            onSuccess={() => handleTabChange('dashboard')}
            onCancel={() => handleTabChange('dashboard')}
          />
        );
      case 'manage-jobs':
        return (
          <ManageJobsView
            onTabChange={handleTabChange}
          />
        );
      case 'find-talent':
        return (
          <TabPlaceholderView
            icon={Search}
            title="Tìm kiếm Talent"
            desc="Hệ thống lọc thông minh theo trường học, nhóm kỹ năng chuyên môn, minh chứng thực tế và Reputation Score giúp bạn kết nối nhanh nhất."
          />
        );
      case 'candidates':
        return (
          <TabPlaceholderView
            icon={UsersRound}
            title="Quản lý ứng viên"
            desc="Xem danh sách hồ sơ của các ứng viên ứng tuyển, lọc danh sách rút gọn (shortlist), duyệt hồ sơ và liên hệ trực tiếp với ứng viên qua hệ thống."
          />
        );
      default:
        return <ApprovedView company={company} onTabChange={handleTabChange} />;
    }
  }

  return (
    <div className={`partner-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="partner-sidebar">
        <div className="partner-sidebar-header">
          <div className="partner-sidebar-brand">
            <Building size={20} style={{ color: companyTypeColor }} />
            <span className="partner-sidebar-logo">nextplease partner</span>
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
          <div className="partner-profile-avatar" style={{ background: company?.companyType === 'CLUB' ? 'linear-gradient(135deg, #ff7a1a, #f59e0b)' : 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
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
          {SIDEBAR_TABS.map((tab) => {
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
            aria-label={isDarkTheme ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
            className="partner-nav-item partner-theme-toggle"
            onClick={toggleTheme}
            title={isDarkTheme ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
            type="button"
          >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkTheme ? 'Sáng' : 'Tối'}</span>
          </button>
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
          {renderContent()}
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
