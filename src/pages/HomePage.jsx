import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

const stats = [
  { value: 500, suffix: '+', label: 'cơ hội, gig và quest được đăng' },
  { value: 10000, suffix: '+', label: 'hồ sơ sinh viên sẵn sàng xác thực' },
  { value: 2000, suffix: '+', label: 'proof logs có thể kiểm chứng' },
];

const roleCards = [
  {
    icon: GraduationCap,
    title: 'Dành cho Người dùng',
    copy: 'Xây dựng Reputation Capital Profile từ hoạt động CLB, sự kiện, dự án, internship và freelance.',
    to: '/candidates',
    cta: 'Nắm bắt cơ hội',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Dành cho Doanh nghiệp',
    copy: 'Tìm talent trẻ bằng verified proof, kỹ năng, mức độ uy tín, trường học và độ phù hợp với vai trò.',
    to: '/businesses',
    cta: 'Tìm kiếm tài năng',
  },
];

const proofSteps = [
  'Sinh viên nộp minh chứng hoạt động thật',
  'Organizer hoặc đội ngũ vận hành kiểm duyệt proof',
  'Backend cập nhật RS, EXP, Premium, NP theo event log',
];

const featuredJobs = [
  {
    title: 'Event Staff Lead',
    company: 'Campus Tech Summit',
    meta: 'RS 70+ · 2 ngày · TP.HCM',
  },
  {
    title: 'Student Marketing Crew',
    company: 'LaunchPad Vietnam',
    meta: 'RS 65+ · Part-time · Hybrid',
  },
  {
    title: 'Content Intern',
    company: 'Young Founder Lab',
    meta: 'RS 60+ · 8 tuần · Remote',
  },
];

const testimonials = [
  {
    quote: 'nextplease giúp chúng tôi lọc ứng viên trẻ dựa trên bằng chứng công việc thay vì CV tự khai.',
    name: 'Hiring Partner',
  },
  {
    quote: 'Sinh viên nhìn thấy lộ trình phát triển rõ hơn: proof, level, quest và cơ hội tiếp theo.',
    name: 'Campus Organizer',
  },
];

function AnimatedStatNumber({ value, suffix }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1300;
    const startedAt = performance.now();
    let frameId;

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <>
      {displayValue.toLocaleString('en-US')}
      {suffix}
    </>
  );
}

export function HomePage() {
  const pageRef = useRef(null);
  const [activeTimelineItem, setActiveTimelineItem] = useState(null);

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - bounds.top}px`);
    event.currentTarget.style.setProperty('--cursor-opacity', '1');
  }

  function handlePointerLeave(event) {
    event.currentTarget.style.setProperty('--cursor-opacity', '0');
  }

  return (
    <section
      className="home-page interactive-stage"
      ref={pageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cursor-spotlight" aria-hidden="true" />

      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-copy-block">
          <p className="eyebrow">Student reputation bridge</p>
          <h1 id="home-title">Kết nối tài năng sinh viên với cơ hội doanh nghiệp.</h1>
          <p className="hero-copy">
            nextplease biến hoạt động thật của sinh viên thành Verified Proof of Work.
            Người dùng xây dựng hồ sơ uy tín, doanh nghiệp tìm talent đáng tin cậy,
            hệ thống giữ mọi luồng xác thực và thanh toán an toàn.
          </p>

          <div className="hero-actions" aria-label="Choose your path">
            <Link className="button primary-button" to="/candidates">
              Nắm bắt cơ hội
              <ArrowRight size={18} />
            </Link>
            <Link className="button accent-button" to="/businesses">
              Tìm kiếm tài năng
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="hero-visual-card hero-video-card">
          <video
            aria-label="Nhóm sinh viên và nhân sự doanh nghiệp đang cộng tác"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=80"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-teamwork-in-the-office-7943/1080p.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      <section className="stats-strip" aria-label="Platform statistics">
        {stats.map((item) => (
          <article key={item.label}>
            <strong>
              <AnimatedStatNumber value={item.value} suffix={item.suffix} />
            </strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section
        className="journey-timeline-section"
        id="about"
        onPointerLeave={() => setActiveTimelineItem(null)}
      >
        <div className="section-heading centered timeline-intro">
          <p className="eyebrow">Xây dựng sự nghiệp tương lai</p>
          <h2>Một nền tảng cho hai hành trình chính của MVP.</h2>
          <p>
            Giao diện này lấy cảm hứng từ Stitch: sáng, thân thiện, nhiều khoảng thở,
            nhưng vẫn giữ đúng bản chất nextplease là reputation infrastructure.
          </p>
        </div>

        <div className="journey-timeline" aria-label="Nextplease platform journey">
          <article
            className={`journey-node left ${activeTimelineItem === 'roles' ? 'active' : ''}`}
            onPointerEnter={() => setActiveTimelineItem('roles')}
            onFocus={() => setActiveTimelineItem('roles')}
          >
            <span className="journey-dot" aria-hidden="true" />
            <div className="journey-card">
              <p className="eyebrow">Hai lối vào chính</p>
              <h3>Chọn vai trò phù hợp với mục tiêu của bạn.</h3>
              <div className="role-card-grid timeline-role-grid">
                {roleCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link className="role-card" to={card.to} key={card.title}>
                      <span className="icon-tile">
                        <Icon size={24} />
                      </span>
                      <h3>{card.title}</h3>
                      <p>{card.copy}</p>
                      <span className="card-link">
                        {card.cta}
                        <ArrowRight size={16} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </article>

          <article
            className={`journey-node right ${activeTimelineItem === 'proof' ? 'active' : ''}`}
            onPointerEnter={() => setActiveTimelineItem('proof')}
            onFocus={() => setActiveTimelineItem('proof')}
          >
            <span className="journey-dot" aria-hidden="true" />
            <div className="journey-card proof-journey-card">
              <div className="journey-media">
                <img
                  alt="Modern office with students and recruiters"
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80"
                />
              </div>
              <div>
                <p className="eyebrow">Nguồn nhân lực trẻ, thật và đáng tin</p>
                <h3>Thay CV tự khai bằng bằng chứng có thể kiểm chứng.</h3>
                <p>
                  nextplease không để frontend tự tính điểm uy tín. Mọi thay đổi
                  liên quan Reputation Score, EXP, NP Wallet, Premium và fraud đều
                  đi qua backend, transaction và event logs.
                </p>
                <div className="proof-step-list">
                  {proofSteps.map((step, index) => (
                    <article className="timeline-item" key={step}>
                      <span>{index + 1}</span>
                      <p>{step}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article
            className={`journey-node left ${activeTimelineItem === 'jobs' ? 'active' : ''}`}
            onPointerEnter={() => setActiveTimelineItem('jobs')}
            onFocus={() => setActiveTimelineItem('jobs')}
          >
            <span className="journey-dot" aria-hidden="true" />
            <div className="journey-card">
              <p className="eyebrow">Việc làm & thực tập nổi bật</p>
              <h3>Cơ hội được thiết kế cho verified young talent.</h3>
              <div className="job-grid timeline-job-grid">
                {featuredJobs.map((job) => (
                  <article className="job-card" key={job.title}>
                    <div className="job-icon">
                      <BriefcaseBusiness size={22} />
                    </div>
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                    <span>{job.meta}</span>
                  </article>
                ))}
              </div>
            </div>
          </article>

          <article
            className={`journey-node right ${activeTimelineItem === 'voices' ? 'active' : ''}`}
            onPointerEnter={() => setActiveTimelineItem('voices')}
            onFocus={() => setActiveTimelineItem('voices')}
          >
            <span className="journey-dot" aria-hidden="true" />
            <div className="journey-card">
              <p className="eyebrow">Tín hiệu từ hệ sinh thái</p>
              <h3>Để proof thật dẫn đường cho cơ hội thật.</h3>
              <div className="testimonial-section timeline-testimonial-grid">
                {testimonials.map((item) => (
                  <article className="testimonial-card" key={item.name}>
                    <Sparkles size={20} />
                    <p>{item.quote}</p>
                    <strong>{item.name}</strong>
                  </article>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow">Sẵn sàng vào hệ sinh thái?</p>
          <h2>Chọn vai trò và bắt đầu khám phá nextplease.</h2>
        </div>
        <div className="role-links">
          <Link to="/candidates">
            <Users size={20} />
            Nắm bắt cơ hội
          </Link>
          <Link to="/businesses">
            <Search size={20} />
            Tìm kiếm tài năng
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-brand">
          <strong>nextplease</strong>
          <p>
            Nền tảng reputation passport giúp sinh viên biến proof thật thành cơ hội
            nghề nghiệp đáng tin.
          </p>
        </div>

        <div className="footer-column">
          <span>Sản phẩm</span>
          <a href="#about">Về chúng tôi</a>
          <Link to="/candidates">Ứng viên</Link>
          <Link to="/businesses">Doanh nghiệp</Link>
        </div>

        <div className="footer-column">
          <span>Niềm tin hệ thống</span>
          <p>Verified Proof of Work</p>
          <p>Backend-owned RS / EXP / NP</p>
          <p>Audit-ready workflows</p>
        </div>

        <div className="footer-bottom">
          <span>Built for web-first MVP.</span>
          <span>PostgreSQL · Spring Boot · React</span>
        </div>
      </footer>
    </section>
  );
}
