import {
  Activity,
  AlertTriangle,
  Banknote,
  FileWarning,
  KeyRound,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

const queueItems = [
  {
    title: 'Experience proof approvals',
    count: '24',
    helper: 'Organizer and admin review queue',
  },
  {
    title: 'Authority node requests',
    count: '8',
    helper: 'Schools, clubs, event partners',
  },
  {
    title: 'Payment reconciliation',
    count: '5',
    helper: 'Top-up webhook and audit checks',
  },
];

const auditEvents = [
  'Fraud flag opened for duplicate proof evidence',
  'Premium Pass purchase idempotency check passed',
  'Wallet top-up matched transfer content NEXTPLEASE NAP',
];

export function AdminPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-hero admin-hero">
        <div>
          <p className="eyebrow">Admin control center</p>
          <h1>Bảo vệ trust, payment, role và chất lượng verification.</h1>
          <p>
            Đây là trang dành cho quản trị web app: RBAC, proof approval, reports,
            payment audits, reputation events, EXP events, wallet transactions
            và system health.
          </p>
        </div>
        <div className="admin-alert-card">
          <ShieldAlert size={28} />
          <h2>Mọi trust-critical action phải được backend authorize.</h2>
          <p>
            Frontend chỉ hiển thị queue và controls. Backend services sở hữu
            scoring, EXP, NP, Premium, freezes và audit logs.
          </p>
        </div>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <ListChecks size={22} />
          <h3>Verification Queue</h3>
          <p>Duyệt hoặc từ chối proof qua transactional backend workflows.</p>
        </article>
        <article className="feature-card">
          <KeyRound size={22} />
          <h3>RBAC & Accounts</h3>
          <p>Review role changes, premium state, freezes và authority nodes.</p>
        </article>
        <article className="feature-card">
          <Banknote size={22} />
          <h3>Wallet & Payments</h3>
          <p>Theo dõi NP top-ups, VietQR/PayOS status và idempotent webhooks.</p>
        </article>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-title">
            <Activity size={22} />
            <h2>Operations Queue</h2>
          </div>
          <div className="admin-queue">
            {queueItems.map((item) => (
              <article className="queue-card" key={item.title}>
                <strong>{item.count}</strong>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.helper}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <FileWarning size={22} />
            <h2>Audit Feed</h2>
          </div>
          <ul className="quest-list">
            {auditEvents.map((event) => (
              <li key={event}>
                <ShieldCheck size={18} />
                {event}
              </li>
            ))}
          </ul>
          <button className="button secondary-button" type="button">
            <AlertTriangle size={18} />
            Review risk flags
          </button>
        </section>
      </div>
    </section>
  );
}
