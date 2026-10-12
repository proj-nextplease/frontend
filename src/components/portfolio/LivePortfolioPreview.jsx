import { useCallback, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { VerifiedPassport } from '../../pages/CandidatePortfolioViewPage.jsx';
import { PORTFOLIO_THEME } from '../../constants/portfolioThemes.js';
import { PreviewFrame } from './PreviewFrame.jsx';

/**
 * Khung xem trước sống trong trình dựng.
 *
 * Chạy ở TỈ LỆ 1:1 — iframe to bằng đúng khoang chứa, không `scale` nữa.
 * Thu nhỏ bằng transform thì mọi khoảng cách của thiết kế cũng nhỏ theo, nên
 * trang lúc nào cũng trông chật hơn thực tế; và vì iframe là cửa sổ thật nên
 * cho nó đúng bề ngang màn hình cũng là cách duy nhất để thấy được bản
 * responsive mà người xem thật sự gặp.
 *
 * `scrollToSection` là id khối đang sửa bên bảng soạn; mỗi lần đổi, trang cuộn
 * tới đó và khối được rọi một vành sáng.
 */
export function LivePortfolioPreview({ profile, onOpenInNewTab, scrollToSection, onScroll }) {
  const stageRef = useRef(null);
  const onScrollRef = useRef(onScroll);
  useEffect(() => { onScrollRef.current = onScroll; }, [onScroll]);

  /* Mốc thời gian đánh dấu "cú cuộn sắp tới là do CODE gây ra".
     Trình duyệt bắn cùng một sự kiện `scroll` cho cả cuộn tay lẫn
     `scrollTo()`, nên nếu không đánh dấu thì việc nhảy sang bước 3/4/5 — vốn
     tự cuộn trang xuống khối tương ứng — bị hiểu nhầm là người dùng đang
     cuộn, và bảng soạn tự thu gọn ngay khi vừa bấm.
     Dùng cửa sổ thời gian vì `behavior: 'smooth'` không báo lúc nào xong;
     1200ms dư cho một cú cuộn mượt dài nhất trong khung này. */
  const programmaticUntil = useRef(0);

  /* Gắn listener vào cửa sổ CON, không phải cửa sổ cha: trang portfolio cuộn
     bên trong iframe nên cửa sổ cha không hề nhúc nhích. Đi qua một ref để
     listener không phải gỡ ra gắn lại mỗi lần component vẽ lại. */
  const handleFrameReady = useCallback((win) => {
    if (!win) return;
    win.addEventListener(
      'scroll',
      () => onScrollRef.current?.(win.scrollY, Date.now() < programmaticUntil.current),
      { passive: true },
    );
  }, []);

  useEffect(() => {
    if (!scrollToSection) return;
    const frame = stageRef.current?.querySelector('iframe');
    const doc = frame?.contentDocument;
    const target = doc?.getElementById(scrollToSection);
    if (!doc || !target) return;
    doc.querySelectorAll('.fom-spotlight').forEach((el) => el.classList.remove('fom-spotlight'));
    target.classList.add('fom-spotlight');
    programmaticUntil.current = Date.now() + 1200;
    frame.contentWindow.scrollTo({ top: Math.max(0, target.offsetTop - 24), behavior: 'smooth' });
    /* CHỈ chạy khi đổi khối. Nếu để `profile` vào deps thì mỗi ký tự gõ ra là
       một lần kéo trang về đầu khối — người dùng vừa tự cuộn xuống xem chỗ
       khác là bị giật ngược lại ngay. */
  }, [scrollToSection]);

  return (
    <div className="pf-live" ref={stageRef}>
      {/* Thanh công cụ nổi, không phải một dải chiếm chỗ: nó là điều khiển của
          trình dựng, không phải một phần của trang portfolio. */}
      <div className="pf-live-bar">
        {/* Một giao diện thì không còn gì để chọn — đây là nhãn cho biết
            trang đang mặc bộ nào, không phải một bộ nút giả vờ có lựa chọn. */}
        <span className="pf-live-theme-label">
          <span className="pf-live-swatches" aria-hidden="true">
            {PORTFOLIO_THEME.colorBox.map((col, i) => <span key={i} style={{ background: col }} />)}
          </span>
          Giao diện {PORTFOLIO_THEME.name}
        </span>

        <button type="button" className="pf-live-open" onClick={onOpenInNewTab}>
          Mở tab mới <ExternalLink size={13} />
        </button>
      </div>

      <PreviewFrame onReady={handleFrameReady}>
        <VerifiedPassport profile={profile} isDraft />
      </PreviewFrame>
    </div>
  );
}
