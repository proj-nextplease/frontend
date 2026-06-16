import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound,
  Zap,
  X,
} from 'lucide-react';
import { getMyCompany, resubmitB2bDocument } from '../api/b2bApi.js';
import { supabase } from '../services/supabaseClient.js';

const SIDEBAR_TABS = [
  { key: 'dashboard', label: 'Bảng điều khiển', icon: BriefcaseBusiness, lockable: false },
  { key: 'create-job', label: 'Đăng tin tuyển dụng', icon: Plus, lockable: true },
  { key: 'manage-jobs', label: 'Quản lý tin đăng', icon: FileText, lockable: true },
  { key: 'find-talent', label: 'Tìm kiếm Talent', icon: Search, lockable: true },
  { key: 'candidates', label: 'Quản lý ứng viên', icon: UsersRound, lockable: true },
];

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
              <a href={company.documentUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: '600' }}>
                <FileText size={14} /> Xem tài liệu <ExternalLink size={12} />
              </a>
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
  const companyTypeLabel = company?.companyType === 'CLUB' ? 'CLB Sinh Viên' : 'Doanh Nghiệp';
  const companyTypeColor = company?.companyType === 'CLUB' ? '#ff7a1a' : '#2563eb';

  return (
    <section className="dashboard-page">
      {/* ── Hero header ── */}
      <div className="b2b-dashboard-hero">
        <div className="b2b-hero-left">
          <div className="b2b-company-avatar">
            {(company?.name || 'B').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="b2b-type-badge" style={{ background: companyTypeColor === '#2563eb' ? 'rgba(37,99,235,0.1)' : 'rgba(255,122,26,0.1)', color: companyTypeColor }}>
                {company?.companyType === 'CLUB' ? <GraduationCap size={13} /> : <Building size={13} />}
                {companyTypeLabel}
              </span>
              <span className="b2b-type-badge" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                <BadgeCheck size={13} /> Đã xác thực
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', lineHeight: 1.15 }}>{company?.name}</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.92rem' }}>
              Đại diện: {company?.representativeName} · {company?.representativePhone}
            </p>
          </div>
        </div>
        <div className="b2b-hero-actions">
          <button
            onClick={() => onTabChange('create-job')}
            className="button primary-button b2b-create-btn"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderColor: 'transparent' }}
          >
            <Plus size={18} /> Đăng tin tuyển dụng
          </button>
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
            { icon: BriefcaseBusiness, label: 'Đăng Job / Gig', desc: 'Mô tả công việc và yêu cầu RS', color: '#2563eb', soon: false },
            { icon: Star, label: 'Tạo Quest sự kiện', desc: 'Tuyển event staff, campus marketer', color: '#ff7a1a', soon: false },
            { icon: Search, label: 'Tìm kiếm Talent', desc: 'Lọc theo RS, kỹ năng, trường học', color: '#16a34a', soon: false },
            { icon: MessageSquareText, label: 'Quản lý ứng viên', desc: 'Shortlist & theo dõi tiến trình', color: '#7c3aed', soon: true },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.label} className={`b2b-quick-card ${a.soon ? 'coming-soon' : ''}`}>
                {a.soon && <span className="b2b-coming-badge">Sắp ra mắt</span>}
                <div className="b2b-quick-icon" style={{ color: a.color, background: `${a.color}14` }}>
                  <Icon size={22} />
                </div>
                <strong className="b2b-quick-label">{a.label}</strong>
                <p className="b2b-quick-desc">{a.desc}</p>
              </div>
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

/* ───────────────────────────────────────────────
   Main component
─────────────────────────────────────────────── */
export function BusinessPage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState({ type: 'idle', message: '' });
  const isSupabaseConfigured = Boolean(supabase);

  async function fetchCompanyData() {
    setError(null);
    if (!isSupabaseConfigured) {
      setCompany({
        name: 'FPT Software (Demo)',
        companyType: 'SME',
        taxCode: '0101234567',
        representativeName: 'Phat Tai',
        representativePhone: '0987654321',
        verificationStatus: 'APPROVED',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getMyCompany();
      setCompany(data);
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

  useEffect(() => {
    fetchCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const companyTypeLabel = company?.companyType === 'CLUB' ? 'CLB Sinh Viên' : 'Doanh Nghiệp';
  const companyTypeColor = company?.companyType === 'CLUB' ? '#ff7a1a' : '#2563eb';

  function renderContent() {
    if (company?.verificationStatus === 'PENDING') {
      return <PendingView company={company} onRefresh={fetchCompanyData} />;
    }
    if (company?.verificationStatus === 'REJECTED') {
      return <RejectedView company={company} onRefresh={fetchCompanyData} />;
    }

    /* verificationStatus === 'APPROVED' */
    switch (activeTab) {
      case 'dashboard':
        return <ApprovedView company={company} onTabChange={setActiveTab} />;
      case 'create-job':
        return (
          <TabPlaceholderView
            icon={Plus}
            title="Đăng tin tuyển dụng mới"
            desc="Tạo cơ hội (Job, Gig, Quest, Event Staff) với mô tả chi tiết, phân nhóm kỹ năng và yêu cầu mức điểm uy tín RS tối thiểu từ ứng viên."
          />
        );
      case 'manage-jobs':
        return (
          <TabPlaceholderView
            icon={FileText}
            title="Quản lý tin đăng tuyển"
            desc="Xem danh sách các tin tuyển dụng đã đăng, theo dõi số lượt ứng tuyển, chỉnh sửa nội dung hoặc đóng/mở tin tuyển dụng của bạn."
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
        return <ApprovedView company={company} onTabChange={setActiveTab} />;
    }
  }

  return (
    <div className="partner-layout">
      {/* ── Sidebar ── */}
      <aside className="partner-sidebar">
        <div className="partner-sidebar-header">
          <Building size={20} style={{ color: companyTypeColor }} />
          <span className="partner-sidebar-logo">nextplease partner</span>
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
              background: company?.verificationStatus === 'APPROVED' ? 'rgba(22, 163, 74, 0.1)' : company?.verificationStatus === 'REJECTED' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: company?.verificationStatus === 'APPROVED' ? '#16a34a' : company?.verificationStatus === 'REJECTED' ? '#dc2626' : '#f59e0b'
            }}>
              {company?.verificationStatus === 'APPROVED' ? 'Đã xác thực' : company?.verificationStatus === 'REJECTED' ? 'Bị từ chối' : 'Chờ duyệt'}
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
                  setActiveTab(tab.key);
                }}
                className={`partner-nav-item ${isActive ? 'active' : ''} ${isActive && company?.companyType === 'CLUB' ? 'club-active' : ''} ${isLocked ? 'locked' : ''}`}
                style={{ position: 'relative' }}
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
          <button className="partner-nav-item" onClick={handleLogout} style={{ color: '#dc2626' }}>
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
