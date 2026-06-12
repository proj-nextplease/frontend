import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Filter,
  MessageSquareText,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

const talentCards = [
  {
    name: 'Linh Pham',
    role: 'Event staff lead',
    proof: '11 verified activities',
    rs: '88 RS',
  },
  {
    name: 'Bao Nguyen',
    role: 'Campus marketer',
    proof: '7 campaign proofs',
    rs: '79 RS',
  },
  {
    name: 'Huy Tran',
    role: 'Freelance video editor',
    proof: '5 project proofs',
    rs: '74 RS',
  },
];

const hiringSteps = [
  'Đăng job, gig, quest hoặc nhu cầu event staffing',
  'Lọc theo verified skills, RS threshold, trường học và lịch rảnh',
  'Mời, shortlist và review applications đã qua backend',
];

export function BusinessPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-hero business-hero">
        <div>
          <p className="eyebrow">Trang Doanh nghiệp</p>
          <h1>Tìm talent trẻ bằng bằng chứng, không chỉ bằng lời hứa.</h1>
          <p>
            Đây là trang dành cho employer, organizer và partner cần sinh viên
            đáng tin cho sự kiện, campaign, internship, CLB và short gigs.
          </p>
        </div>
        <div className="search-panel">
          <div className="search-box">
            <Search size={20} />
            <span>Tìm verified marketing crew tại TP.HCM</span>
          </div>
          <div className="filter-row">
            <span>
              <Filter size={16} />
              RS 70+
            </span>
            <span>
              <BadgeCheck size={16} />
              Chỉ verified
            </span>
            <span>
              <UsersRound size={16} />
              Rảnh tuần này
            </span>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <ShieldCheck size={22} />
          <h3>Bộ lọc reputation</h3>
          <p>Doanh nghiệp dùng score, tier và verification status do backend trả về.</p>
        </article>
        <article className="feature-card">
          <ClipboardCheck size={22} />
          <h3>Hiring workflows</h3>
          <p>Đăng cơ hội và để backend kiểm tra RS/Premium eligibility.</p>
        </article>
        <article className="feature-card">
          <MessageSquareText size={22} />
          <h3>Organizer feedback</h3>
          <p>Ratings và reports trở thành tín hiệu audit-ready cho matching.</p>
        </article>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-title">
            <BriefcaseBusiness size={22} />
            <h2>Talent Shortlist</h2>
          </div>
          <div className="talent-list">
            {talentCards.map((talent) => (
              <article className="talent-card" key={talent.name}>
                <span className="avatar-token">{talent.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <h3>{talent.name}</h3>
                  <p>{talent.role}</p>
                  <small>{talent.proof}</small>
                </div>
                <strong>{talent.rs}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <ClipboardCheck size={22} />
            <h2>Hiring Flow</h2>
          </div>
          <div className="step-list">
            {hiringSteps.map((step, index) => (
              <article className="timeline-item" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
          <button className="button primary-button" type="button">
            Tạo cơ hội mới
          </button>
        </section>
      </div>
    </section>
  );
}
