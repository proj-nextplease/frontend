import {
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  FileCheck2,
  Flame,
  LockKeyhole,
  Star,
  Trophy,
} from 'lucide-react';

const proofItems = [
  {
    title: 'TEDx Campus Event Staff',
    meta: 'Đã được organizer duyệt',
    status: 'Verified',
  },
  {
    title: 'Startup Mondays Social Crew',
    meta: 'Đang chờ admin review',
    status: 'Pending',
  },
  {
    title: 'Faculty Career Fair Volunteer',
    meta: 'Điểm danh bằng QR',
    status: 'Verified',
  },
];

const quests = [
  'Apply 3 verified gigs trong tuần này',
  'Hoàn thiện checklist bằng chứng hồ sơ',
  'Xin một rating từ organizer',
];

export function UserPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-hero user-hero">
        <div>
          <p className="eyebrow">Trang Người dùng</p>
          <h1>Xây dựng hồ sơ uy tín từ những hoạt động thật.</h1>
          <p>
            Đây là trải nghiệm dành cho sinh viên/candidate: reputation passport,
            proof timeline, career quests, marketplace readiness và các bề mặt
            Premium/paywall.
          </p>
        </div>
        <div className="passport-card">
          <div className="passport-top">
            <span className="avatar-token">MA</span>
            <span className="status-badge">Dữ liệu từ backend</span>
          </div>
          <h2>Minh Anh Tran</h2>
          <p>Marketing crew, event staff, freelance content assistant</p>
          <div className="passport-stats">
            <span>
              <strong>82</strong>
              RS
            </span>
            <span>
              <strong>18</strong>
              Level
            </span>
            <span>
              <strong>4</strong>
              Proofs
            </span>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <Trophy size={22} />
          <h3>Reputation Score</h3>
          <p>Hiển thị từ backend response. Frontend không tự tính lại RS.</p>
        </article>
        <article className="feature-card">
          <Flame size={22} />
          <h3>Tiến trình EXP</h3>
          <p>Tín hiệu seniority lâu dài giúp sinh viên thể hiện quá trình phát triển.</p>
        </article>
        <article className="feature-card">
          <LockKeyhole size={22} />
          <h3>Premium Pass</h3>
          <p>Mở khoá luồng apply sau khi backend xác thực eligibility.</p>
        </article>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-title">
            <FileCheck2 size={22} />
            <h2>Proof Timeline</h2>
          </div>
          <div className="proof-list">
            {proofItems.map((item) => (
              <article className="proof-item" key={item.title}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </div>
                <span className={item.status === 'Verified' ? 'status-badge' : 'status-badge muted'}>
                  {item.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <Star size={22} />
            <h2>Career Quests</h2>
          </div>
          <ul className="quest-list">
            {quests.map((quest) => (
              <li key={quest}>
                <CalendarCheck size={18} />
                {quest}
              </li>
            ))}
          </ul>
          <button className="button primary-button" type="button">
            <Briefcase size={18} />
            Xem verified gigs
          </button>
        </section>
      </div>

      <section className="panel next-action-panel">
        <BadgeCheck size={22} />
        <div>
          <h2>Hành động tiếp theo: nộp một proof mạnh hơn.</h2>
          <p>
            Dashboard tốt nên hướng sinh viên tới bằng chứng tốt hơn, không chỉ
            hiển thị chỉ số. Verification, scoring, EXP, wallet và Premium vẫn
            thuộc backend workflows.
          </p>
        </div>
      </section>
    </section>
  );
}
