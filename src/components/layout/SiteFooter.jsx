import { Link } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext.jsx';
import { getStoredToken } from '../../lib/authStorage.js';
import { BrandWordmark } from '../BrandWordmark.jsx';
import threadsLogo from '../../assets/logothreads.png';

/**
 * Footer dùng chung (nextplease) — dựng theo cấu trúc footer của trang mẫu:
 *
 *   - Nền TỐI, cùng màu với phần thân trang, không viền ngăn, không đổi sang
 *     nền trắng. Footer là phần kết của cùng một mặt phẳng chứ không phải một
 *     khối dán thêm vào.
 *   - Bên trái là một câu tuyên ngôn CỠ LỚN (40px, weight 400, viết thường) —
 *     không phải logo nhỏ kèm đoạn mô tả. Đây là điểm khác lớn nhất so với bản
 *     cũ và là thứ làm footer của họ trông có chủ đích.
 *   - Bên phải là các nhóm link: tiêu đề nhóm 18px, link 14px mờ hơn, hover
 *     chuyển sang màu nhấn.
 *   - Dưới cùng là một hàng pháp lý + copyright 14px, mờ 60%.
 *   - Và cuối cùng là LOGO CHỮ KHỔNG LỒ chạy hết chiều ngang, màu nhấn. Trang
 *     mẫu dùng một SVG `w-full` viewBox 1376×275 cho chi tiết này. Ở đây logo
 *     là chữ nên dùng <text> trong SVG có viewBox + textLength, để nó giãn đúng
 *     bằng bề ngang khung dù font hay chuỗi có đổi.
 */

const EMERALD = '#10b981';
const INK = '#0b0f0e';
const ON_DARK = '#ffffff';

const INNER = { width: 'min(1180px, calc(100% - 40px))', margin: '0 auto' };

function MailIcon({ className = '', style = {} }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0, ...style }}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon({ className = '', style = {} }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0, ...style }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function FacebookIcon({ className = '', style = {} }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0, ...style }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = '', style = {} }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0, ...style }}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = '', style = {} }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0, ...style }}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.27 6.27 0 0 0 1.95-4.5V8.69a8.18 8.18 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.95-.12z" />
    </svg>
  );
}

function ThreadsIcon({ className = '', style = {} }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '16px',
        height: '16px',
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${threadsLogo})`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskImage: `url(${threadsLogo})`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function SiteFooter() {
  const { openLoginModal } = useAuthModal();

  // Trình dựng portfolio cần đăng nhập — chặn ở đây để người chưa đăng nhập
  // không bị đá sang một trang trống rồi mới bị hỏi.
  const handlePortfolioClick = (event) => {
    if (!getStoredToken()) {
      event.preventDefault();
      openLoginModal('candidate');
    }
  };

  return (
    <footer className="np-footer">
      <style>{`
        .np-footer { background: ${INK}; color: ${ON_DARK}; overflow: hidden; padding-bottom: 0; margin-bottom: 0; }
        .np-footer-inner { padding: clamp(64px, 8vw, 96px) 20px clamp(28px, 3vw, 40px); }

        .np-footer-top { display: flex; gap: clamp(40px, 6vw, 80px); align-items: flex-start; justify-content: space-between; }

        .np-footer-tagline {
          flex: 1 1 auto; min-width: 0; margin: 0;
          /* index.css gán 'Baloo 2' cho h1-h3 nên phải khai báo lại font. */
          font-family: inherit;
          font-size: clamp(1.75rem, 3.4vw, 2.5rem); font-weight: 400; line-height: 1.15;
          letter-spacing: -0.025em; color: ${ON_DARK};
        }

        .np-footer-cols { flex: 0 1 auto; display: grid; grid-template-columns: repeat(3, minmax(140px, auto)); gap: clamp(28px, 4vw, 64px); }
        .np-footer-col { display: flex; flex-direction: column; gap: 12px; }
        .np-footer-colhead { font-size: 1.125rem; font-weight: 500; line-height: 1.4; letter-spacing: -0.015em; color: ${ON_DARK}; }
        .np-footer-link {
          font-size: 0.875rem; line-height: 1.4; letter-spacing: -0.015em;
          color: rgba(255,255,255,0.8); text-decoration: none; width: fit-content;
          transition: color 150ms ease;
        }
        .np-footer-link:hover { color: ${EMERALD}; }

        /* Thanh liên hệ & mạng xã hội riêng biệt */
        .np-footer-contact-bar {
          margin-top: clamp(48px, 6vw, 72px);
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .np-footer-contact-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .np-footer-contact-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .np-footer-contact-item:hover {
          color: ${EMERALD};
        }

        .np-footer-contact-sep {
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.75rem;
        }

        .np-footer-socials {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .np-footer-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          transition: all 180ms ease;
        }
        .np-footer-social-btn:hover {
          background: rgba(16, 185, 129, 0.16);
          border-color: rgba(16, 185, 129, 0.45);
          color: ${EMERALD};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .np-footer-bottom {
          margin-top: 28px;
          padding-top: 24px;
          border-top: none;
          background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent);
          background-size: 100% 1px;
          background-repeat: no-repeat;
          background-position: top;
          display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          font-size: 0.875rem; letter-spacing: -0.015em; color: rgba(255,255,255,0.6);
        }
        .np-footer-legal { display: flex; gap: 24px; flex-wrap: wrap; }

        /* Logo chữ khổng lồ khép lại trang */
        .np-footer-wordmark { display: block; width: 100%; margin-top: clamp(40px, 5vw, 64px); }

        @media (max-width: 1023px) {
          .np-footer-top { flex-direction: column; }
          .np-footer-cols { width: 100%; }
        }
        @media (max-width: 768px) {
          .np-footer-contact-bar { flex-direction: column; align-items: flex-start; gap: 16px; }
          .np-footer-contact-sep { display: none; }
          .np-footer-contact-info { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
        @media (max-width: 600px) {
          .np-footer-cols { grid-template-columns: 1fr 1fr; }
          .np-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="np-footer-inner" style={{ ...INNER }}>
        <div className="np-footer-top">
          <h2 className="np-footer-tagline">
            Hồ sơ dựa trên bằng chứng,<br />cho sinh viên Việt Nam
          </h2>

          <div className="np-footer-cols">
            <div className="np-footer-col">
              <span className="np-footer-colhead">Ứng viên</span>
              <Link className="np-footer-link" to="/jobs">Việc làm &amp; Quest</Link>
              <Link className="np-footer-link" to="/portfolio" onClick={handlePortfolioClick}>Tạo portfolio</Link>
              <Link className="np-footer-link" to="/thao-luan">Thảo luận</Link>
            </div>

            <div className="np-footer-col">
              <span className="np-footer-colhead">Doanh nghiệp &amp; CLB</span>
              <Link className="np-footer-link" to="/businesses" target="_blank" rel="noopener noreferrer">Vì sao tuyển ở đây</Link>
              <Link className="np-footer-link" to="/business/register">Đăng ký tuyển dụng</Link>
              <Link className="np-footer-link" to="/business/login">Đăng nhập đối tác</Link>
            </div>

            <div className="np-footer-col">
              <span className="np-footer-colhead">fonlio</span>
              <Link className="np-footer-link" to="/tao-portfolio">Proof hoạt động thế nào</Link>
              <Link className="np-footer-link" to="/terms">Điều khoản</Link>
              <Link className="np-footer-link" to="/privacy">Bảo mật</Link>
            </div>
          </div>
        </div>

        {/* Thanh liên hệ & Mạng xã hội */}
        <div className="np-footer-contact-bar">
          <div className="np-footer-contact-info">
            <a className="np-footer-contact-item" href="mailto:fonlioofficial@gmail.com" title="Email fonlio">
              <MailIcon /> fonlioofficial@gmail.com
            </a>
            <span className="np-footer-contact-sep">•</span>
            <a className="np-footer-contact-item" href="tel:0981362340" title="Hotline fonlio">
              <PhoneIcon /> 0981 362 340
            </a>
          </div>

          <div className="np-footer-socials" aria-label="Mạng xã hội fonlio">
            <a
              className="np-footer-social-btn"
              href="https://www.facebook.com/profile.php?id=61594934129474"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              className="np-footer-social-btn"
              href="https://www.instagram.com/fonlioofficial/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              className="np-footer-social-btn"
              href="https://www.tiktok.com/@fonlio.official"
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
              aria-label="TikTok"
            >
              <TikTokIcon />
            </a>
            <a
              className="np-footer-social-btn"
              href="https://www.threads.com/@fonlioofficial/post/Dd87ob7j87A?xmt=AQG0sQna5phj3eo0gGFAz7fhAtyjYHfc5dwHr1LkXJ14a9E"
              target="_blank"
              rel="noopener noreferrer"
              title="Threads"
              aria-label="Threads"
            >
              <ThreadsIcon />
            </a>
          </div>
        </div>

        <div className="np-footer-bottom">
          <div className="np-footer-legal">
            <Link className="np-footer-link" to="/terms">Điều khoản sử dụng</Link>
            <Link className="np-footer-link" to="/privacy">Chính sách bảo mật</Link>
          </div>
          <span>© 2026 fonlio. Bảo lưu mọi quyền.</span>
        </div>
      </div>

      <div
        className="np-footer-wordmark-wrap"
        style={{
          width: '100%',
          margin: 'clamp(20px, 3vw, 40px) 0 0 0',
          padding: 0,
          marginBottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          textAlign: 'center',
          overflow: 'visible',
          lineHeight: 0,
          boxSizing: 'border-box',
        }}
      >
        <BrandWordmark
          size="auto"
          glow
          style={{
            display: 'block',
            width: 'min(1440px, 100%)',
            height: 'auto',
            maxHeight: '480px',
            marginBottom: 0,
            verticalAlign: 'bottom',
            filter: 'drop-shadow(0 0 24px rgba(185, 255, 0, 0.40)) drop-shadow(0 0 48px rgba(45, 212, 191, 0.22))',
          }}
        />
      </div>
    </footer>
  );
}
