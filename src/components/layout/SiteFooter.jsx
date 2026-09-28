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
        .np-footer { background: ${INK}; color: ${ON_DARK}; }
        .np-footer-inner { padding: clamp(64px, 8vw, 96px) 20px clamp(28px, 3vw, 40px); }

        .np-footer-top { display: flex; gap: clamp(40px, 6vw, 80px); align-items: flex-start; }
        .np-footer-tagline {
          flex: 1 1 auto; min-width: 0; margin: 0;
          /* index.css gán 'Baloo 2' cho h1-h3 nên phải khai báo lại font. */
          font-family: inherit;
          font-size: clamp(1.75rem, 3.4vw, 2.5rem); font-weight: 400; line-height: 1.1;
          letter-spacing: -0.025em; color: ${ON_DARK};
        }

        .np-footer-cols { flex: 0 1 auto; display: grid; grid-template-columns: repeat(3, minmax(140px, auto)); gap: clamp(28px, 4vw, 64px); }
        .np-footer-col { display: flex; flex-direction: column; gap: 12px; }
        .np-footer-colhead { font-size: 1.125rem; font-weight: 400; line-height: 1.4; letter-spacing: -0.015em; color: ${ON_DARK}; }
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
              <span className="np-footer-colhead">nextplease</span>
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
          <span>© 2026 next please. Bảo lưu mọi quyền.</span>
        </div>

        <div
          className="np-footer-wordmark-wrap"
          style={{
            width: '100%',
            marginTop: 'clamp(40px, 5vw, 64px)',
            paddingBottom: 'clamp(16px, 3vw, 40px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            overflow: 'visible',
          }}
        >
          <BrandWordmark
            size="auto"
            glow
            style={{
              width: 'min(1180px, 98%)',
              height: 'auto',
              maxHeight: '300px',
            }}
          />
        </div>
      </div>
    </footer>
  );
}
