import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Compass,
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
} from 'lucide-react';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { PortfolioAvatar3D, PORTFOLIO_PREVIEW_STORAGE_PREFIX } from './CandidatePortfolioPage.jsx';
import { getJobs } from '../api/jobApi.js';
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

const JOB_TYPES = [
  { value: 'INTERNSHIP', label: 'Thực tập sinh (Internship)' },
  { value: 'PART_TIME', label: 'Bán thời gian (Part-time)' },
  { value: 'FREELANCE', label: 'Công việc tự do (Freelance)' },
  { value: 'EVENT_STAFF', label: 'Nhân sự sự kiện (Event staff)' },
  { value: 'MICRO_INTERNSHIP', label: 'Thực tập ngắn hạn / Dự án (Micro-internship)' },
];

function getCategoryTone(category) {
  if (category === 'BUSINESS' || category === 'LANGUAGE') return 'green';
  if (category === 'DESIGN' || category === 'MEDIA') return 'pink';
  return ''; // default blue
}


export function CandidateDashboardPage({ initialPortfolio }) {

  const [portfolio, setPortfolio] = useState(initialPortfolio || null);
  const [loading, setLoading] = useState(!initialPortfolio);
  const [activeView, setActiveView] = useState('quests');

  // Job List and filtering states
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [filterIsRemote, setFilterIsRemote] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getMyPortfolio();
        if (isMounted) {
          setPortfolio(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchJobsData() {
      if (isMounted) {
        setJobsLoading(true);
      }
      try {
        const filters = {};
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




  const currentLevel = portfolio?.currentLevel || 1;
  const currentExp = portfolio?.totalExp || 0;
  const nextLevelExp = currentLevel * 1000;
  const expPercentage = Math.min(100, Math.round((currentExp / nextLevelExp) * 100));

  const dashboardStats = [
    { 
      label: 'Next Point', 
      value: portfolio?.npBalance !== undefined ? portfolio.npBalance.toLocaleString() : '0', 
      helper: 'Tài sản tích luỹ', 
      icon: WalletCards 
    },
    { 
      label: 'Reputation Score', 
      value: portfolio?.reputationScore !== undefined ? portfolio.reputationScore : '0', 
      helper: 'Độ uy tín xác thực', 
      icon: ShieldCheck 
    },
    { 
      label: 'Portfolio 3D', 
      value: portfolio?.onboardingCompleted ? 'Đã hoàn thành' : 'Đang thiết lập', 
      helper: portfolio?.onboardingCompleted ? 'Đã kích hoạt' : 'Cần bổ sung thông tin', 
      icon: FileText 
    },
  ];

  const timeline = [
    { 
      title: 'Tạo tài khoản ứng viên', 
      detail: 'Đã xác thực email đăng nhập', 
      state: 'done' 
    },
    { 
      title: 'Dựng Portfolio 3D', 
      detail: portfolio?.onboardingCompleted ? 'Đã hoàn thành Portfolio' : 'Thêm kỹ năng, kinh nghiệm và chứng chỉ', 
      state: portfolio?.onboardingCompleted ? 'done' : 'current' 
    },
    { 
      title: 'Nộp proof đầu tiên', 
      detail: portfolio?.onboardingCompleted ? 'Tích lũy Reputation Score qua quest' : 'Đợi backend mở luồng verification', 
      state: portfolio?.onboardingCompleted ? 'current' : 'next' 
    },
  ];

  if (loading && !portfolio) {
    return (
      <div className="route-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
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
    <section className="candidate-dashboard-page" style={{ paddingBottom: '60px' }}>
      <div className="candidate-dashboard-shell" style={{ marginTop: '24px' }}>
        <header className="candidate-hub-hero">
          <div className="candidate-hub-copy">
            <span className="candidate-hub-kicker">
              <Sparkles size={16} />
              Chào mừng, {portfolio?.name || 'Ứng viên'}
            </span>
            <h1>Không gian phát triển sự nghiệp của riêng bạn.</h1>
            <p>
              Theo dõi nhiệm vụ phù hợp, hoàn thiện Portfolio 3D và chuẩn bị proof thật để bước vào
              marketplace cơ hội của nextplease.
            </p>
            <div className="candidate-hub-actions">
              {portfolio?.onboardingCompleted ? (
                <Link className="button primary-button" to="/portfolio/edit" target="_blank" rel="noopener noreferrer">
                  Chỉnh sửa Portfolio 3D
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link className="button primary-button" to="/portfolio">
                  Hoàn thiện Portfolio
                  <ArrowRight size={18} />
                </Link>
              )}
              <button className="button secondary-button" onClick={() => setActiveView('quests')} type="button">
                Xem nhiệm vụ
              </button>
            </div>
          </div>

          <aside className="candidate-hub-profile-card">
            {portfolio?.avatar ? (
              <div className="candidate-hub-avatar-3d-wrapper" style={{
                height: '190px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, var(--card-bg-strong) 0%, var(--surface-soft) 100%)',
                border: '2px solid rgba(168, 85, 247, 0.2)',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.06)'
              }}>
                <PortfolioAvatar3D avatar={portfolio.avatar} />
              </div>
            ) : (
              <div className="candidate-hub-avatar">
                <UserRound size={34} />
              </div>
            )}
            
            <div style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)' }}>
                  {portfolio?.name || 'Ứng viên nextplease'}
                </span>
                <span className="level-badge" style={{
                  fontSize: '0.72rem',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                  color: '#fff',
                  fontWeight: 900,
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                }}>
                  LV.{currentLevel}
                </span>
              </div>
              <p style={{ margin: '6px 0 14px', fontSize: '0.86rem', color: 'var(--muted)', fontWeight: 550, lineHeight: 1.4 }}>
                {portfolio?.onboardingCompleted ? (portfolio.headline || 'Ứng viên tiềm năng') : 'Portfolio chưa hoàn thành'}
              </p>

              {/* EXP Progress Bar Section */}
              <div className="exp-section" style={{
                background: 'var(--soft-card-bg)',
                borderRadius: '12px',
                padding: '10px 12px',
                border: '1px solid var(--line)',
                marginBottom: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, marginBottom: '6px', color: 'var(--ink)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={11} color="var(--primary)" /> Lũy kế EXP
                  </span>
                  <span>{currentExp} / {nextLevelExp}</span>
                </div>
                <div className="exp-bar-container" style={{
                  height: '6px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <div className="exp-bar-fill" style={{
                    width: `${expPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary), #a855f7)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease-out'
                  }} />
                </div>
              </div>
            </div>

            <div className="candidate-readiness-list">
              {timeline.map((item) => (
                <div className={item.state} key={item.title}>
                  {item.state === 'done' ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </aside>
        </header>

        <section className="candidate-hub-stats" aria-label="Candidate trust metrics">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label}>
                <span>
                  <Icon size={18} />
                </span>
                <div>
                  <p>{stat.label}</p>
                  <strong>{stat.value}</strong>
                  <small>{stat.helper}</small>
                </div>
              </article>
            );
          })}
        </section>

        <nav className="candidate-hub-tabs" aria-label="Candidate hub views">
          <button className={activeView === 'quests' ? 'active' : ''} onClick={() => setActiveView('quests')} type="button">
            <BriefcaseBusiness size={18} />
            Nhiệm vụ phù hợp
          </button>
          <button className={activeView === 'profile' ? 'active' : ''} onClick={() => setActiveView('profile')} type="button">
            <UserRound size={18} />
            Hồ sơ tài năng
          </button>
          {portfolio?.onboardingCompleted ? (
            <Link to="/portfolio/edit" target="_blank" rel="noopener noreferrer">
              <FileText size={18} />
              Portfolio 3D
            </Link>
          ) : (
            <Link to="/portfolio">
              <FileText size={18} />
              Portfolio 3D
            </Link>
          )}
        </nav>

        {activeView === 'quests' ? (
          <section className="candidate-hub-grid">
            <main className="candidate-quest-panel">
              <div className="candidate-panel-heading" style={{ marginBottom: '16px' }}>
                <div>
                  <p className="eyebrow">Opportunity board</p>
                  <h2>Cơ hội đang mở</h2>
                </div>
              </div>

              {/* Premium Filter Controls */}
              <div className="candidate-filters-panel" style={{
                background: 'var(--surface-soft)',
                border: '1px solid var(--line)',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Tìm kiếm tiêu đề, mô tả công việc..."
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 40px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        background: 'var(--bg)',
                        color: 'var(--ink)',
                        boxSizing: 'border-box',
                        fontSize: '0.92rem'
                      }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--muted)' }} />
                    {filterSearch && (
                      <button
                        onClick={() => setFilterSearch('')}
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--muted)',
                          fontSize: '1.1rem'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div>
                    <select
                      value={filterJobType}
                      onChange={(e) => setFilterJobType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        background: 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '0.92rem',
                        height: '46px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Tất cả loại hình</option>
                      {JOB_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '46px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={filterIsRemote}
                        onChange={(e) => setFilterIsRemote(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)' }}>Remote</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Lĩnh vực chính</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setFilterSpecialty(''); // reset specialty
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        background: 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '0.92rem',
                        height: '46px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Tất cả lĩnh vực</option>
                      {Object.keys(CATEGORY_MAP).map(key => (
                        <option key={key} value={key}>{CATEGORY_MAP[key].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Chuyên ngành chi tiết</label>
                    <select
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                      disabled={!filterCategory}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        background: !filterCategory ? 'var(--surface-soft)' : 'var(--bg)',
                        color: !filterCategory ? 'var(--muted)' : 'var(--ink)',
                        fontSize: '0.92rem',
                        height: '46px',
                        cursor: !filterCategory ? 'not-allowed' : 'pointer',
                        opacity: !filterCategory ? 0.6 : 1
                      }}
                    >
                      <option value="">Tất cả chuyên ngành</option>
                      {filterCategory && (CATEGORY_MAP[filterCategory]?.specialties || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Jobs List */}
              <div className="candidate-quest-list">
                {jobsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px solid var(--line)' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Đang tải danh sách cơ hội tuyển dụng...</p>
                  </div>
                ) : jobsError ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626' }}>
                    <AlertTriangle size={20} />
                    <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600' }}>{jobsError}</p>
                  </div>
                ) : jobsList.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px dashed var(--line)', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--card-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                      <Search size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--ink)' }}>Không tìm thấy cơ hội nào</h3>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)' }}>Hãy thử thay đổi tiêu chí lọc hoặc từ khóa tìm kiếm của bạn.</p>
                    </div>
                  </div>
                ) : (
                  jobsList.map((job) => {
                    const isLocked = (portfolio?.reputationScore || 0) < job.minReqRs;
                    const tone = getCategoryTone(job.category);
                    const compensationText = job.compensation > 0
                      ? `${Number(job.compensation).toLocaleString()} VND`
                      : 'Thỏa thuận';
                    const categoryLabel = CATEGORY_MAP[job.category]?.label || job.category;
                    const specialtyLabel = CATEGORY_MAP[job.category]?.specialties?.find(s => s.value === job.specialty)?.label;

                    return (
                      <article className={`candidate-quest-item ${tone}`} key={job.id}>
                        <div className="quest-item-main">
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                            <span>{categoryLabel}</span>
                            {specialtyLabel && (
                              <span style={{ background: 'var(--surface-soft)', color: 'var(--muted)', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '800', padding: '7px 10px' }}>
                                {specialtyLabel}
                              </span>
                            )}
                            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '800', padding: '7px 10px' }}>
                              {JOB_TYPES.find(t => t.value === job.jobType)?.label || job.jobType}
                            </span>
                            {job.isRemote && (
                              <span style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '800', padding: '7px 10px' }}>
                                Remote
                              </span>
                            )}
                          </div>

                          <h3 style={{ marginTop: '8px' }}>{job.title}</h3>
                          <p style={{ fontSize: '0.92rem', color: 'var(--ink)', opacity: 0.85, lineHeight: 1.5 }}>
                            {job.description?.length > 180 ? `${job.description.slice(0, 180)}...` : job.description}
                          </p>
                          <small style={{ marginTop: '12px', color: 'var(--muted)', fontWeight: '750' }}>Đăng bởi: {job.companyName || 'Đối tác'}</small>

                          {job.skills && job.skills.length > 0 && (
                            <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--muted)' }}>Yêu cầu:</span>
                              {job.skills.map((s, idx) => (
                                <span key={idx} style={{
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: 'var(--card-bg-strong)',
                                  border: '1px solid var(--line)',
                                  color: 'var(--ink)'
                                }}>
                                  {s.skillName} ({s.requiredLevel === 'BEGINNER' ? 'Cơ bản' : s.requiredLevel === 'INTERMEDIATE' ? 'Trung bình' : s.requiredLevel === 'ADVANCED' ? 'Nâng cao' : 'Chuyên gia'})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="quest-item-side">
                          <div>
                            <small>Thù lao</small>
                            <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{compensationText}</strong>
                          </div>
                          <div>
                            <small>Điều kiện RS</small>
                            <strong style={{ color: isLocked ? '#dc2626' : 'inherit', fontWeight: isLocked ? '800' : 'inherit' }}>
                              {job.minReqRs > 0 ? `${job.minReqRs} RS` : 'Không yêu cầu'}
                            </strong>
                          </div>
                          <button
                            disabled={isLocked}
                            type="button"
                            onClick={() => {
                              alert(`Đã gửi yêu cầu ứng tuyển cho "${job.title}". Tính năng nộp đơn chính thức sẽ mở khóa khi luồng xác minh của Candidate sẵn sàng!`);
                            }}
                          >
                            {isLocked ? 'Cần thêm uy tín' : 'Ứng tuyển'}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </main>

            <aside className="candidate-side-stack">
              <article className="candidate-next-step-card">
                <Compass size={24} />
                <h3>Việc nên làm tiếp theo</h3>
                <p>Hoàn thiện Portfolio 3D trước để backend có đủ dữ liệu kiểm tra điều kiện ứng tuyển.</p>
                {portfolio?.onboardingCompleted ? (
                  <Link to="/portfolio/edit" target="_blank" rel="noopener noreferrer">
                    Mở Portfolio
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link to="/portfolio">
                    Mở Portfolio
                    <ArrowRight size={16} />
                  </Link>
                )}
              </article>

              <article className="candidate-premium-mini">
                <Crown size={22} />
                <span>Premium later</span>
                <p>Quest cao cấp, ưu tiên hiển thị và tuỳ biến hồ sơ sẽ mở sau khi luồng thanh toán sẵn sàng.</p>
              </article>
            </aside>
          </section>
        ) : (
          <section className="candidate-profile-workspace">
            <main className="candidate-profile-summary">
              <div className="candidate-panel-heading">
                <div>
                  <p className="eyebrow">Talent profile</p>
                  <h2>Lộ trình hồ sơ ứng viên</h2>
                </div>
                {portfolio?.onboardingCompleted ? (
                  <Link className="button secondary-button" to="/portfolio/edit" target="_blank" rel="noopener noreferrer">
                    Chỉnh Portfolio
                  </Link>
                ) : (
                  <Link className="button secondary-button" to="/portfolio">
                    Chỉnh Portfolio
                  </Link>
                )}
              </div>

              <div className="candidate-timeline-clean">
                {timeline.map((item, index) => (
                  <article className={item.state} key={item.title}>
                    <span>{index + 1}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </main>

            <aside className="candidate-profile-actions">
              <article>
                <Award size={24} />
                <h3>Proof & chứng chỉ</h3>
                <p>Gom bằng chứng thật để chuẩn bị cho hàng chờ xác thực.</p>
              </article>
              <article className="locked">
                <LockKeyhole size={24} />
                <h3>Tuỳ biến PRO</h3>
                <p>Badge, theme và hiệu ứng profile sẽ mở theo Premium.</p>
              </article>
              <article>
                <Star size={24} />
                <h3>Gợi ý cơ hội</h3>
                <p>Backend sẽ đề xuất nhiệm vụ dựa trên hồ sơ và proof đã duyệt.</p>
              </article>
            </aside>
          </section>
        )}
      </div>
    </section>
  );
}
