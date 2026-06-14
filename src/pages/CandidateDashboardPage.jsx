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
} from 'lucide-react';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { PortfolioAvatar3D, PORTFOLIO_PREVIEW_STORAGE_PREFIX } from './CandidatePortfolioPage.jsx';


const quests = [
  {
    id: 1,
    category: 'Sự kiện',
    title: 'Hỗ trợ check-in Tech Talk 2026',
    organizer: 'CLB Công nghệ sinh viên',
    summary: 'Hỗ trợ check-in, điều phối khu vực khách mời và ghi nhận proof sau sự kiện.',
    reward: '200,000 VND + NP',
    requirement: 'Backend kiểm RS',
    tone: 'blue',
    locked: false,
  },
  {
    id: 2,
    category: 'Truyền thông',
    title: 'Trực quầy truyền thông CLB',
    organizer: 'Ban Truyền thông SEC',
    summary: 'Tư vấn booth, thu lead sinh viên và tổng hợp recap hoạt động.',
    reward: 'NP reward',
    requirement: 'Phù hợp ứng viên mới',
    tone: 'green',
    locked: false,
  },
  {
    id: 3,
    category: 'Product',
    title: 'Review flow UX cho app nội bộ',
    organizer: 'Tech Startup Partner',
    summary: 'Cần portfolio rõ ràng và proof trải nghiệm trước khi ứng tuyển.',
    reward: 'Premium quest',
    requirement: 'Cần RS cao hơn',
    tone: 'pink',
    locked: true,
  },
];

export function CandidateDashboardPage({ initialPortfolio }) {

  const [portfolio, setPortfolio] = useState(initialPortfolio || null);
  const [loading, setLoading] = useState(!initialPortfolio);
  const [activeView, setActiveView] = useState('quests');

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
              <div className="candidate-panel-heading">
                <div>
                  <p className="eyebrow">Opportunity board</p>
                  <h2>Cơ hội đang mở</h2>
                </div>
                <div className="candidate-search-pill">
                  <Search size={16} />
                  Lọc theo kỹ năng
                </div>
              </div>

              <div className="candidate-quest-list">
                {quests.map((quest) => (
                  <article className={`candidate-quest-item ${quest.tone}`} key={quest.id}>
                    <div className="quest-item-main">
                      <span>{quest.category}</span>
                      <h3>{quest.title}</h3>
                      <p>{quest.summary}</p>
                      <small>{quest.organizer}</small>
                    </div>
                    <div className="quest-item-side">
                      <div>
                        <small>Thù lao</small>
                        <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{quest.reward}</strong>
                      </div>
                      <div>
                        <small>Điều kiện</small>
                        <strong>{quest.requirement}</strong>
                      </div>
                      <button disabled={quest.locked} type="button">
                        {quest.locked ? 'Cần thêm uy tín' : 'Ứng tuyển'}
                      </button>
                    </div>
                  </article>
                ))}
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
