import { ShieldCheck, Trophy, WalletCards } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard.jsx';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Verified Proof of Work',
    copy: 'Students build trust from approved clubs, events, projects, gigs, and internships.',
  },
  {
    icon: Trophy,
    title: 'Reputation Capital',
    copy: 'Reputation Score and EXP are calculated by backend services, not by the frontend.',
  },
  {
    icon: WalletCards,
    title: 'Premium & NP Wallet',
    copy: 'Wallet, Premium Pass, and payment webhooks stay transactional and idempotent.',
  },
];

export function HomePage() {
  return (
    <section className="home-page">
      <div className="hero">
        <p className="eyebrow">Gamified reputation infrastructure</p>
        <h1>Next Please turns student work into verified career signal.</h1>
        <p className="hero-copy">
          A web-first talent marketplace for Gen Z students, organizers, and employers.
        </p>
      </div>

      <div className="metrics-grid">
        <MetricCard label="RS cap" value="100" helper="Can increase or decrease" />
        <MetricCard label="EXP" value="Permanent" helper="Seniority and progression" />
        <MetricCard label="NP" value="Transactional" helper="Every change is logged" />
      </div>

      <div className="pillar-grid">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article className="pillar-card" key={pillar.title}>
              <Icon size={24} />
              <h2>{pillar.title}</h2>
              <p>{pillar.copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
