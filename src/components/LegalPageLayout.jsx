import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteHeader } from './layout/SiteHeader.jsx';
import { SiteFooter } from './layout/SiteFooter.jsx';
import { HeroMesh } from './HeroMesh.jsx';

/**
 * Khung dùng chung cho hai trang pháp lý: /terms và /privacy.
 *
 * Bản trước là một trang tiếp thị đội lốt văn bản pháp lý: dải sóng teal,
 * huy hiệu bạc hà, tiêu đề vàng, thẻ giấy A4 trắng, và một dải CTA cuối trang
 * cỡ lớn ("Bạn có thắc mắc? Chúng tôi luôn sẵn sàng hỗ trợ"). Nó còn sót lại
 * từ hệ sáng cũ, nên đặt giữa SiteHeader và SiteFooter đã chuyển sang nền tối
 * thì thành ba mảng màu chỏi nhau.
 *
 * Bản này coi đây đúng là thứ nó phải là: MỘT TÀI LIỆU ĐỂ ĐỌC.
 *   - Nền tối như phần còn lại của site, mesh chỉ phủ phần đầu rồi tan.
 *   - Không font hiển thị: đây là trang công cụ, không phải trang tiếp thị.
 *   - Có MỤC LỤC dính bên trái, tự đánh dấu mục đang đọc. Đây là thứ đáng giá
 *     nhất cho một văn bản mười mục — người ta hiếm khi đọc từ đầu tới cuối,
 *     họ đi tìm một điều cụ thể.
 *   - Bỏ dải CTA cuối trang. Đặt lời tiếp thị vào trong văn bản pháp lý là
 *     đúng thứ không nên làm: nó hứa hẹn ở chỗ mà chữ nghĩa phải chính xác.
 *     Thay bằng một dòng liên hệ, dùng đúng địa chỉ mà chính văn bản đã nêu.
 */

const MESH_MASK = 'linear-gradient(to bottom, #000 0px, #000 180px, transparent 520px)';

export function LegalPageLayout({ eyebrow, title, updated, intro, sections }) {
  const location = useLocation();
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  /* Đánh dấu mục đang đọc trong mục lục.
     rootMargin cắt 70% dưới khung nhìn, nên "đang đọc" nghĩa là mục đã lên tới
     vùng trên của màn hình — không phải mục vừa ló ra ở mép dưới. */
  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!nodes.length) return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [sections]);

  return (
    <div className="np-legal">
      <div className="np-legal-bg" aria-hidden="true">
        <div className="np-legal-bg-inner"><HeroMesh fadeMask={MESH_MASK} /></div>
      </div>

      <SiteHeader overlay pinned={false} />

      <header className="np-legal-head">
        {eyebrow && <span className="np-legal-eyebrow">{eyebrow}</span>}
        <h1 className="np-legal-title">{title}</h1>
        {updated && <p className="np-legal-updated">Cập nhật lần cuối: {updated}</p>}
        {intro && <p className="np-legal-intro">{intro}</p>}
      </header>

      <div className="np-legal-body">
        <nav className="np-legal-toc" aria-label="Mục lục">
          <span className="np-legal-toc-label">Nội dung</span>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={activeId === s.id ? 'active' : undefined}
                  aria-current={activeId === s.id ? 'true' : undefined}
                >
                  <span className="np-legal-toc-num">{String(i + 1).padStart(2, '0')}</span>
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="np-legal-doc">
          {sections.map((s, i) => (
            <section className="np-legal-section" id={s.id} key={s.id}>
              <h2>
                <span className="np-legal-num">{String(i + 1).padStart(2, '0')}</span>
                {s.h}
              </h2>
              {s.p.map((item, pIdx) => {
                if (typeof item === 'string') return <p key={pIdx}>{item}</p>;
                if (item.list) {
                  /* Danh sách dựng bằng <ul>/<li> thật, không phải div kèm icon
                     tick. Trình đọc màn hình cần biết "đây là danh sách 3 mục",
                     và dấu tick màu xanh còn ngụ ý "đã hoàn thành" — sai nghĩa
                     ở một văn bản chỉ đang liệt kê điều khoản. */
                  return (
                    <ul key={pIdx}>
                      {item.list.map((li, lIdx) => <li key={lIdx}>{li}</li>)}
                    </ul>
                  );
                }
                return null;
              })}
            </section>
          ))}

        </article>
      </div>

      <SiteFooter />
    </div>
  );
}
