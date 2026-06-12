import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const stats = [
  { value: '500+', label: 'cơ hội, gig và quest được đăng' },
  { value: '10,000+', label: 'hồ sơ sinh viên sẵn sàng xác thực' },
  { value: '2,000+', label: 'proof logs có thể kiểm chứng' },
];

const roleCards = [
  {
    icon: GraduationCap,
    title: 'Dành cho Người dùng',
    copy: 'Xây dựng Reputation Capital Profile từ hoạt động CLB, sự kiện, dự án, internship và freelance.',
    to: '/users',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Dành cho Doanh nghiệp',
    copy: 'Tìm talent trẻ bằng verified proof, kỹ năng, mức độ uy tín, trường học và độ phù hợp với vai trò.',
    to: '/businesses',
  },
  {
    icon: ShieldCheck,
    title: 'Dành cho Admin',
    copy: 'Quản trị verification queue, RBAC, audit logs, payment status và các luồng trust-critical.',
    to: '/admin',
  },
];

const proofSteps = [
  'Sinh viên nộp minh chứng hoạt động thật',
  'Organizer hoặc Admin kiểm duyệt proof',
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

export function HomePage() {
  const pageRef = useRef(null);

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
            admin giữ mọi luồng xác thực và thanh toán an toàn.
          </p>

          <div className="hero-actions" aria-label="Choose your path">
            <Link className="button primary-button" to="/portfolio">
              Nắm bắt cơ hội
              <ArrowRight size={18} />
            </Link>
            <Link className="button accent-button" to="/businesses">
              Tìm kiếm tài năng
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="hero-visual-card">
          <img
            alt="Students collaborating with business mentors"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=80"
          />
          <div className="floating-metric metric-top">
            <BadgeCheck size={18} />
            <div>
              <strong>82 RS</strong>
              <span>returned by backend</span>
            </div>
          </div>
          <div className="floating-metric metric-bottom">
            <CalendarCheck size={18} />
            <div>
              <strong>12 proof logs</strong>
              <span>approved activities</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Platform statistics">
        {stats.map((item) => (
          <article key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="section-block" id="about">
        <div className="section-heading centered">
          <p className="eyebrow">Xây dựng sự nghiệp tương lai</p>
          <h2>Một nền tảng cho ba vai trò chính của MVP.</h2>
          <p>
            Giao diện này lấy cảm hứng từ Stitch: sáng, thân thiện, nhiều khoảng thở,
            nhưng vẫn giữ đúng bản chất nextplease là reputation infrastructure.
          </p>
        </div>

        <div className="role-card-grid">
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
                  Xem trang
                  <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="split-section">
        <div className="split-image">
          <img
            alt="Modern office with students and recruiters"
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1100&q=80"
          />
        </div>
        <div className="split-content">
          <p className="eyebrow">Nguồn nhân lực trẻ, thật và đáng tin</p>
          <h2>Thay CV tự khai bằng bằng chứng có thể kiểm chứng.</h2>
          <p>
            nextplease không để frontend tự tính điểm uy tín. Mọi thay đổi liên quan
            Reputation Score, EXP, NP Wallet, Premium và fraud đều đi qua backend,
            transaction và event logs.
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
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Việc làm & thực tập nổi bật</p>
          <h2>Cơ hội được thiết kế cho verified young talent.</h2>
        </div>
        <div className="job-grid">
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
      </section>

      <section className="testimonial-section">
        {testimonials.map((item) => (
          <article className="testimonial-card" key={item.name}>
            <Sparkles size={20} />
            <p>{item.quote}</p>
            <strong>{item.name}</strong>
          </article>
        ))}
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow">Sẵn sàng vào hệ sinh thái?</p>
          <h2>Chọn vai trò và bắt đầu khám phá nextplease.</h2>
        </div>
        <div className="role-links">
          <Link to="/users">
            <Users size={20} />
            Người dùng
          </Link>
          <Link to="/businesses">
            <Search size={20} />
            Doanh nghiệp
          </Link>
          <Link to="/admin">
            <ClipboardCheck size={20} />
            Admin
          </Link>
          <Link to="/login">
            <Layers3 size={20} />
            Đăng nhập
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
          <Link to="/users">Người dùng</Link>
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
