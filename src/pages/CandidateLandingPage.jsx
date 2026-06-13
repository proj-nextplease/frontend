import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  FileCheck2,
  GraduationCap,
  Sparkles,
  Trophy,
  WandSparkles,
} from 'lucide-react';

const candidateBenefits = [
  {
    icon: WandSparkles,
    title: 'Portfolio 3D có cá tính',
    copy: 'Tạo hồ sơ ứng viên bằng avatar 3D, phong cách cá nhân, kinh nghiệm, kỹ năng và câu chuyện nghề nghiệp.',
  },
  {
    icon: FileCheck2,
    title: 'Minh chứng thay cho lời tự khai',
    copy: 'Lưu lại hoạt động CLB, sự kiện, dự án, internship, freelance và chứng chỉ để chuẩn bị cho luồng xác thực.',
  },
  {
    icon: Briefcase,
    title: 'Cơ hội hợp với năng lực',
    copy: 'Khám phá gig, quest, event staff, internship và vai trò part-time được thiết kế cho young talent.',
  },
];

const candidateJourney = [
  'Dựng Portfolio 3D để nhà tuyển dụng thấy bạn là ai.',
  'Bổ sung kinh nghiệm, chứng chỉ và proof thật theo từng hoạt động.',
  'Sẵn sàng apply vào cơ hội phù hợp khi backend xác thực đủ điều kiện.',
];

export function CandidateLandingPage() {
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
      className="candidate-landing interactive-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cursor-spotlight" aria-hidden="true" />

      <section className="candidate-hero" aria-labelledby="candidate-title">
        <div className="candidate-video-panel">
          <video
            aria-label="Ứng viên trẻ chuẩn bị hồ sơ và trao đổi trong không gian làm việc"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=80"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-focused-student-with-digital-devices/1080p.mp4"
              type="video/mp4"
            />
          </video>

          <div className="candidate-video-scrim" aria-hidden="true" />

          <div className="candidate-hero-copy">
            <Link className="back-home-link" to="/">
              Về trang chủ
            </Link>
            <p className="eyebrow">Nắm bắt cơ hội</p>
            <h1 id="candidate-title">
              <span className="candidate-title-line">Biến trải nghiệm sinh viên thành</span>
              <span className="candidate-title-line">hồ sơ ứng viên sống động.</span>
            </h1>
            <p>
              Đây là không gian dành riêng cho ứng viên của nextplease: dựng Portfolio
              3D, gom proof thật, kể câu chuyện kỹ năng và chuẩn bị bước vào marketplace
              cơ hội một cách tự tin hơn.
            </p>

            <div className="candidate-hero-actions centered-actions" aria-label="Candidate account actions">
              <Link className="button primary-button" to="/candidate/register">
                Bắt đầu làm ứng viên
                <ArrowRight size={18} />
              </Link>
              <Link className="button secondary-button candidate-login-button" to="/candidate/login">
                Tôi đã là ứng viên
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="candidate-benefit-grid" aria-label="Candidate features">
        {candidateBenefits.map((item) => {
          const Icon = item.icon;
          return (
            <article className="candidate-benefit-card" key={item.title}>
              <span className="icon-tile">
                <Icon size={23} />
              </span>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="candidate-showcase">
        <div className="candidate-showcase-media">
          <img
            alt="Young candidate working on a laptop portfolio"
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=80"
          />
          <span className="media-chip">
            <Camera size={16} />
            Visual proof ready
          </span>
        </div>

        <div className="candidate-showcase-copy">
          <p className="eyebrow">Flow dành cho ứng viên</p>
          <h2>Từ “mình đã làm gì?” đến “mình có thể chứng minh điều đó”.</h2>
          <p>
            Trang đăng ký là bước tiếp theo sau landing này. Người mới tạo tài khoản
            ứng viên trước, rồi tiếp tục dựng Portfolio 3D; ứng viên đã có tài khoản
            có thể quay lại luồng đăng nhập.
          </p>
          <div className="candidate-journey-list">
            {candidateJourney.map((step, index) => (
              <article className="timeline-item" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="candidate-proof-strip">
        <article>
          <BadgeCheck size={22} />
          <strong>Verified proof mindset</strong>
          <span>Chuẩn bị dữ liệu để backend xác thực, không tự tính điểm trên frontend.</span>
        </article>
        <article>
          <Trophy size={22} />
          <strong>Career RPG vibe</strong>
          <span>Hồ sơ có tiến trình, kỹ năng, trải nghiệm và câu chuyện phát triển.</span>
        </article>
        <article>
          <GraduationCap size={22} />
          <strong>Student-first UX</strong>
          <span>Ít form khô khan hơn, nhiều ngữ cảnh và hành động rõ ràng hơn.</span>
        </article>
      </section>

      <section className="candidate-bottom-cta">
        <Sparkles size={24} />
        <h2>Sẵn sàng dựng Portfolio ứng viên của bạn?</h2>
        <div className="candidate-hero-actions centered-actions">
          <Link className="button primary-button" to="/candidate/register">
            Bắt đầu làm ứng viên
            <ArrowRight size={18} />
          </Link>
          <Link className="button secondary-button candidate-login-button" to="/candidate/login">
            Tôi đã làm ứng viên
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="candidate-footer">
        <div className="footer-brand">
          <strong>nextplease</strong>
          <p>
            Không gian dành cho ứng viên biến hoạt động thật, kỹ năng và minh chứng
            thành Portfolio 3D dễ hiểu, dễ chia sẻ và sẵn sàng cho cơ hội mới.
          </p>
        </div>

        <div className="footer-column">
          <span>Ứng viên</span>
          <Link to="/candidate/register">Bắt đầu làm ứng viên</Link>
          <Link to="/candidate/login">Tôi đã làm ứng viên</Link>
          <Link to="/">Về trang chủ</Link>
        </div>

        <div className="footer-column">
          <span>Hồ sơ uy tín</span>
          <p>Portfolio 3D cá nhân</p>
          <p>Proof, chứng chỉ, kinh nghiệm</p>
          <p>Backend xác thực dữ liệu tin cậy</p>
        </div>

        <div className="footer-bottom">
          <span>Candidate-first experience for nextplease.</span>
          <span>Portfolio · Proof · Opportunity</span>
        </div>
      </footer>
    </section>
  );
}
