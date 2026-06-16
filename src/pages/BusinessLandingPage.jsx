import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building,
  FileCheck2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  UsersRound,
  FileText,
} from 'lucide-react';

const businessBenefits = [
  {
    icon: ShieldCheck,
    title: 'Verified Proof Mindset',
    copy: 'Sàng lọc ứng viên dựa trên kinh nghiệm thực tế đã được hệ thống xác thực, loại bỏ CV tự khai phóng đại.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Quest & Job Marketplace',
    copy: 'Đăng tuyển Gig, Quest, Internship, Event Staff hoặc Part-time trực tiếp đến hàng ngàn sinh viên năng động.',
  },
  {
    icon: GraduationCap,
    title: 'Độ phủ sóng học đường',
    copy: 'Kết nối chặt chẽ với Câu lạc bộ và sinh viên từ các trường Đại học đối tác hàng đầu trong mạng lưới.',
  },
];

const businessJourney = [
  'Đăng ký tài khoản và gửi tài liệu xác minh (Mã số thuế / Quyết định CLB mộc đỏ).',
  'Đợi Admin phê duyệt hồ sơ trong vòng 2 - 24 giờ làm việc.',
  'Bắt đầu đăng tin tuyển dụng, Gig, Quest hoặc lọc hồ sơ tài năng trực tiếp từ bảng điều khiển.',
];

export function BusinessLandingPage() {
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
      className="candidate-landing interactive-stage business-landing-container"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cursor-spotlight" aria-hidden="true" />

      <section className="candidate-hero" aria-labelledby="business-title">
        <div className="candidate-video-panel">
          <video
            aria-label="Đội ngũ đối tác doanh nghiệp đang làm việc và thảo luận dự án"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1100&q=80"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-group-of-people-working-together-in-an-office-4680/1080p.mp4"
              type="video/mp4"
            />
          </video>

          <div className="candidate-video-scrim" aria-hidden="true" style={{ background: 'rgba(0, 0, 0, 0.75)' }} />

          <div className="candidate-hero-copy">
            <Link className="back-home-link" to="/">
              Về trang chủ
            </Link>
            <p className="eyebrow" style={{ color: '#ff7a1a' }}>Tìm kiếm & Kết nối</p>
            <h1 id="business-title">
              <span className="candidate-title-line">Tìm kiếm tài năng qua</span>
              <span className="candidate-title-line">bằng chứng thực tế.</span>
            </h1>
            <p style={{ maxWidth: '800px' }}>
              Chào mừng bạn đến với Cổng thông tin Đối tác tuyển dụng và Ban tổ chức CLB của nextplease. 
              Nơi giúp bạn kết nối trực tiếp với thế hệ sinh viên năng động, tài năng 
              thông qua hệ thống Portfolio 3D và minh chứng hoạt động đã xác thực.
            </p>

            <div className="candidate-hero-actions centered-actions" aria-label="Business account actions">
              <Link className="button primary-button" to="/business/register" style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
                Bắt đầu làm đối tác
                <ArrowRight size={18} />
              </Link>
              <Link className="button secondary-button candidate-login-button" to="/business/login">
                Tôi đã là đối tác
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="candidate-benefit-grid" aria-label="Business benefits">
        {businessBenefits.map((item) => {
          const Icon = item.icon;
          return (
            <article className="candidate-benefit-card" key={item.title}>
              <span className="icon-tile" style={{ color: '#ff7a1a', backgroundColor: 'rgba(255,122,26,0.1)' }}>
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
            alt="Doanh nghiệp xem danh sách ứng viên đã được xác thực"
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1100&q=80"
          />
          <span className="media-chip" style={{ color: '#2563eb' }}>
            <BadgeCheck size={16} />
            Verified Recruiter
          </span>
        </div>

        <div className="candidate-showcase-copy">
          <p className="eyebrow" style={{ color: '#2563eb' }}>Quy trình tham gia mạng lưới</p>
          <h2>Khởi động chiến dịch tuyển dụng thông minh chỉ với 3 bước.</h2>
          <p>
            Hồ sơ của bạn sau khi đăng ký sẽ đi qua bước kiểm duyệt bảo mật của Admin 
            để đảm bảo tính minh bạch cho hệ thống. Khi được duyệt, toàn bộ cổng match-making sẽ tự động mở ra.
          </p>
          <div className="candidate-journey-list">
            {businessJourney.map((step, index) => (
              <article className="timeline-item" key={step}>
                <span style={{ backgroundColor: index % 2 === 0 ? '#2563eb' : '#ff7a1a' }}>{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="candidate-proof-strip">
        <article>
          <BadgeCheck size={22} style={{ color: '#2563eb' }} />
          <strong>Thông tin minh bạch</strong>
          <span>Không còn tình trạng gian lận hồ sơ hay thành tích ảo trên CV.</span>
        </article>
        <article>
          <Building size={22} style={{ color: '#ff7a1a' }} />
          <strong>Kiểm duyệt uy tín</strong>
          <span>Admin phê duyệt thủ công từng doanh nghiệp tuyển dụng và CLB.</span>
        </article>
        <article>
          <UsersRound size={22} style={{ color: '#16a34a' }} />
          <strong>Sinh viên năng động</strong>
          <span>Tiếp cận lực lượng cốt cán thuộc các CLB hàng đầu.</span>
        </article>
      </section>

      <section className="candidate-bottom-cta">
        <Sparkles size={24} style={{ color: '#ff7a1a' }} />
        <h2>Sẵn sàng kết nối với thế hệ tài năng thực tế?</h2>
        <div className="candidate-hero-actions centered-actions">
          <Link className="button primary-button" to="/business/register" style={{ background: 'linear-gradient(135deg, #2563eb, #ff7a1a)', borderColor: 'transparent' }}>
            Bắt đầu làm đối tác
            <ArrowRight size={18} />
          </Link>
          <Link className="button secondary-button candidate-login-button" to="/business/login">
            Tôi đã làm đối tác
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="candidate-footer">
        <div className="footer-brand">
          <strong>nextplease</strong>
          <p>
            Hệ sinh thái kết nối và bảo chứng năng lực sinh viên. 
            Giải pháp tuyển dụng thông qua Verified Proof of Work toàn diện đầu tiên tại Việt Nam.
          </p>
        </div>

        <div className="footer-column">
          <span>Đối tác B2B</span>
          <Link to="/business/register">Bắt đầu làm đối tác</Link>
          <Link to="/business/login">Đăng nhập đối tác</Link>
          <Link to="/">Về trang chủ</Link>
        </div>

        <div className="footer-column">
          <span>Giải pháp tuyển dụng</span>
          <p>Lọc hồ sơ qua Proof of Work</p>
          <p>Quản trị chiến dịch tuyển dụng</p>
          <p>Tương tác CLB và sự kiện sinh viên</p>
        </div>

        <div className="footer-bottom">
          <span>Partner-first matching platform for nextplease.</span>
          <span>B2B Portal · Verification · Student Network</span>
        </div>
      </footer>
    </section>
  );
}
