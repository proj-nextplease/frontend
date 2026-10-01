import { Link } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext.jsx';
import { getStoredToken } from '../../lib/authStorage.js';
import { BrandWordmark } from '../BrandWordmark.jsx';

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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0, ...style }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = '', style = {} }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0, ...style }}>
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0, ...style }}>
      <path d="M12.186 24C5.467 24 0 18.675 0 12.128 0 5.58 5.467.255 12.186.255c6.643 0 11.977 5.178 12.064 11.724.086 6.547-5.068 11.725-11.71 11.725h-.354v-2.036h.354c5.556 0 9.67-4.218 9.67-9.689 0-5.47-4.269-9.688-9.873-9.688C6.67 1.99 2.036 6.505 2.036 12.128c0 5.623 4.634 10.138 10.15 10.138 3.518 0 6.67-1.85 8.243-4.835l1.802.946C20.24 22.04 16.49 24 12.186 24zm4.01-13.435c-.097-.847-.468-1.572-1.07-2.097-.604-.526-1.397-.81-2.302-.81-1.096 0-2.052.427-2.766 1.235-.714.808-1.127 1.916-1.194 3.205h7.332v-1.533zm-5.296 3.238c.118 1.002.559 1.83 1.277 2.399.718.57 1.636.868 2.656.868 1.455 0 2.72-.577 3.567-1.626l1.528 1.346c-1.22 1.503-2.99 2.316-5.095 2.316-1.597 0-3.023-.497-4.123-1.437-1.1-.94-1.722-2.28-1.8-3.866h9.522c.03-.4.045-.81.045-1.229 0-1.442-.43-2.67-1.244-3.553-.814-.882-1.928-1.35-3.224-1.35-1.433 0-2.645.503-3.504 1.455-.86.951-1.328 2.274-1.357 3.824l1.752.853z" />
    </svg>
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
        
        .np-footer-brand-side {
          flex: 1 1 380px;
          max-width: 480px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .np-footer-tagline {
          margin: 0;
          /* index.css gán 'Baloo 2' cho h1-h3 nên phải khai báo lại font. */
          font-family: inherit;
          font-size: clamp(1.75rem, 3.2vw, 2.35rem); font-weight: 400; line-height: 1.15;
          letter-spacing: -0.025em; color: ${ON_DARK};
        }

        .np-footer-contact-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .np-footer-contact-items {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 24px;
        }

        .np-footer-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          line-height: 1.4;
          letter-spacing: -0.015em;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          white-space: nowrap;
          transition: color 150ms ease;
        }
        .np-footer-contact-link:hover {
          color: ${EMERALD};
        }

        .np-footer-socials {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .np-footer-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          transition: all 180ms ease;
        }
        .np-footer-social-btn:hover {
          background: rgba(16, 185, 129, 0.16);
          border-color: rgba(16, 185, 129, 0.45);
          color: ${EMERALD};
          transform: translateY(-2px);
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

        .np-footer-bottom {
          margin-top: clamp(56px, 7vw, 88px); padding-top: 24px;
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
        @media (max-width: 600px) {
          .np-footer-cols { grid-template-columns: 1fr 1fr; }
          .np-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="np-footer-inner" style={{ ...INNER }}>
        <div className="np-footer-top">
          <div className="np-footer-brand-side">
            <h2 className="np-footer-tagline">
              Hồ sơ dựa trên bằng chứng,<br />cho sinh viên Việt Nam
            </h2>

            <div className="np-footer-contact-block">
              <div className="np-footer-contact-items">
                <a className="np-footer-contact-link" href="mailto:fonlioofficial@gmail.com" title="Email fonlio">
                  <MailIcon /> fonlioofficial@gmail.com
                </a>
                <a className="np-footer-contact-link" href="tel:0981362340" title="Hotline fonlio">
                  <PhoneIcon /> 0981 362 340
                </a>
              </div>
              <div className="np-footer-socials" aria-label="Mạng xã hội fonlio">
                <a
                  className="np-footer-social-btn"
                  href="https://www.facebook.com/profile.php?id=61594934129474"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook fonlio"
                  aria-label="Facebook fonlio"
                >
                  <FacebookIcon />
                </a>
                <a
                  className="np-footer-social-btn"
                  href="https://www.instagram.com/fonlioofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram @fonlioofficial"
                  aria-label="Instagram @fonlioofficial"
                >
                  <InstagramIcon />
                </a>
                <a
                  className="np-footer-social-btn"
                  href="https://www.tiktok.com/@fonlio.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="TikTok @fonlio.official"
                  aria-label="TikTok @fonlio.official"
                >
                  <TikTokIcon />
                </a>
                <a
                  className="np-footer-social-btn"
                  href="https://www.threads.com/@fonlioofficial/post/Dd87ob7j87A?xmt=AQG0sQna5phj3eo0gGFAz7fhAtyjYHfc5dwHr1LkXJ14a9E"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Threads @fonlioofficial"
                  aria-label="Threads @fonlioofficial"
                >
                  <ThreadsIcon />
                </a>
              </div>
            </div>
          </div>

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
