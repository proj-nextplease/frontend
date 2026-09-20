/**
 * Dải logo nhà tuyển dụng — HAI hàng chạy ngược chiều nhau.
 *
 * Hai hàng lấy hai nửa khác nhau của danh sách nên không bao giờ hiện cùng một
 * logo ở cùng thời điểm, và chạy ngược chiều để mắt không bị kéo trôi theo một
 * hướng duy nhất. Tốc độ cố tình chậm (70s/82s) — đây là nền, không phải nội
 * dung chính.
 *
 * Logo thật là nhãn hiệu của bên khác: file ảnh thả vào /public/companies theo
 * đúng tên bên dưới, chưa có file nào thì hiện dấu hình học tự vẽ + tên chữ.
 */

const INK = '#0f2e2b';
const EMERALD = '#10b981';

/* Original geometric marks — invented brands, no real trademarks. */
const svgProps = { className: 'np-logo-mark', viewBox: '0 0 24 24', width: 26, height: 26, 'aria-hidden': true };
const MARKS = {
  aurora: (<svg {...svgProps}><path d="M4 18a8 8 0 0 1 16 0" stroke="#0d9488" strokeWidth="2.4" fill="none" strokeLinecap="round" /><circle cx="12" cy="18" r="2.4" fill="#0d9488" /></svg>),
  nova: (<svg {...svgProps}><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="#4f46e5" /></svg>),
  leaf: (<svg {...svgProps}><path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" fill="#16a34a" /></svg>),
  vertex: (<svg {...svgProps}><path d="M12 4l8 15H4z" fill="#ea580c" /></svg>),
  lumina: (<svg {...svgProps}><circle cx="12" cy="12" r="9" fill="none" stroke="#0284c7" strokeWidth="2.2" /><circle cx="12" cy="12" r="3" fill="#0284c7" /></svg>),
  orbit: (<svg {...svgProps}><ellipse cx="12" cy="12" rx="10" ry="4.4" fill="none" stroke="#7c3aed" strokeWidth="2.2" transform="rotate(-28 12 12)" /><circle cx="12" cy="12" r="2.8" fill="#7c3aed" /></svg>),
  pulse: (<svg {...svgProps}><path d="M2 12h5l2-5 4 10 2-5h7" stroke="#e11d48" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  summit: (<svg {...svgProps}><path d="M2 19l7-11 4 6 3-4 6 9z" fill="#d97706" /></svg>),
};

const MARK_LIST = [MARKS.aurora, MARKS.nova, MARKS.leaf, MARKS.vertex, MARKS.lumina, MARKS.orbit, MARKS.pulse, MARKS.summit];

// Logo nhà tuyển dụng: file ảnh nằm ở /public/companies theo đúng tên dưới đây,
// chưa có file nào thì hiện dấu hình học tự vẽ + tên chữ thay thế.
//
// CẢNH BÁO: tên file trong thư mục này KHÔNG khớp với logo bên trong. Đã kiểm
// chứng: daikin.png thật ra chứa logo FPT Telecom (đã gỡ khỏi danh sách theo
// yêu cầu). Dải logo còn hiện Grab, Shopee, TikTok Shop — những thương hiệu
// không có tên nào ở đây, nên sai lệch là có hệ thống chứ không phải một ca lẻ.
// Hệ quả: thuộc tính `name` bên dưới (dùng làm alt text) đang mô tả sai ảnh.
// Cần đối chiếu lại từng file rồi đặt lại tên trước khi lên production.
const PARTNERS = [
  { name: 'FPT IS', img: '/companies/fpt-is.png' },
  { name: 'FPT Software', img: '/companies/fpt-software.png' },
  { name: 'Home Credit', img: '/companies/homecredit.png' },
  { name: 'Maersk', img: '/companies/maersk.png' },
  { name: 'MB Bank', img: '/companies/mbbank.png' },
  { name: 'Techcombank', img: '/companies/techcombank.png' },
  { name: 'Thaco Auto', img: '/companies/thaco-auto.png' },
  { name: 'Viettel AI', img: '/companies/viettel-ai.png' },
  { name: 'Vingroup', img: '/companies/vingroup.png' },
  { name: 'Vinamilk', img: '/companies/vinamilk.png' },
].map((p, i) => ({ ...p, mark: MARK_LIST[i % MARK_LIST.length] }));

function LogoChip({ name, mark, img }) {
  return (
    <div className="np-logo-chip">
      <span className="np-logo-lockup">
        {mark}
        <span className="np-logo-name">{name}</span>
      </span>
      <img
        className="np-logo-img"
        src={img}
        alt={name}
        onLoad={(e) => { const lk = e.currentTarget.previousElementSibling; if (lk) lk.style.display = 'none'; }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}

function MarqueeRow({ variant, items }) {
  // Nhân bốn bản để một chu kỳ (translateX -50% = hai bản) luôn rộng hơn màn
  // hình — thiếu cái này thì mối nối hở một khoảng trống trên màn hình rộng.
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className={`np-marquee np-marquee-${variant}`}>
      <div className="np-marquee-track">
        {loop.map((p, i) => (
          <LogoChip key={`${variant}-${p.name}-${i}`} name={p.name} mark={p.mark} img={p.img} />
        ))}
      </div>
    </div>
  );
}

export function PartnerLogos({ onDark = false, colorLogos = false, showHeading = true } = {}) {
  const half = Math.ceil(PARTNERS.length / 2);
  const rowA = PARTNERS.slice(0, half);
  const rowB = PARTNERS.slice(half);

  return (
    <div className={`np-partners${onDark ? ' np-partners-dark' : ''}${colorLogos ? ' np-partners-color' : ''}`}>
      <style>{`
        .np-partners-head { text-align: center; font-size: clamp(1.5rem, 3.2vw, 2.2rem); font-weight: 800; letter-spacing: -0.02em; color: ${INK}; line-height: 1.25; margin: 0 auto 40px; max-width: 34rem; }
        .np-partners-head b { color: ${EMERALD}; font-weight: 800; }

        .np-marquee { position: relative; overflow: hidden;
          width: 100vw; margin-left: calc(50% - 50vw);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
        .np-marquee + .np-marquee { margin-top: 24px; }
        .np-marquee-track { display: flex; width: max-content; }
        /* Chậm hơn nhiều so với bản 25s trước đây. Hai hàng lệch chu kỳ
           (70s / 82s) nên không bao giờ trùng nhịp thành một khối. */
        .np-marquee-a .np-marquee-track { animation: npMarqueeL 70s linear infinite; }
        .np-marquee-b .np-marquee-track { animation: npMarqueeR 82s linear infinite; }
        @keyframes npMarqueeL { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes npMarqueeR { from { transform: translateX(-50%); } to { transform: translateX(0); } }

        .np-logo-chip { flex: 0 0 auto; position: relative; height: 76px; min-width: 172px; padding: 0 20px; margin-right: 34px;
          background: transparent; border: 0; box-shadow: none;
          display: flex; align-items: center; justify-content: center; }
        .np-logo-lockup { display: inline-flex; align-items: center; gap: 10px; }
        .np-logo-mark { flex-shrink: 0; display: block; }
        .np-logo-name { font-weight: 800; color: ${INK}; font-size: 1.06rem; letter-spacing: -0.02em; white-space: nowrap; }
        .np-logo-img { position: absolute; inset: 12px 20px; width: calc(100% - 40px); height: calc(100% - 24px); object-fit: contain; }

        /* onDark: ép logo về một màu trắng đục. */
        .np-partners-dark .np-logo-name { color: #fff; }
        .np-partners-dark .np-logo-img { filter: brightness(0) invert(1); opacity: 0.72; transition: opacity 0.2s ease; }
        .np-partners-dark .np-logo-chip:hover .np-logo-img { opacity: 1; }
        .np-partners-dark .np-logo-mark path, .np-partners-dark .np-logo-mark circle, .np-partners-dark .np-logo-mark ellipse { fill: rgba(255,255,255,0.72); stroke: rgba(255,255,255,0.72); }

        /* colorLogos: giữ màu thương hiệu thật và KHÔNG bọc nền trắng — logo
           đứng thẳng trên nền tối. Khoảng cách nới gấp đôi để mỗi logo là một
           nhịp riêng thay vì dính thành dải liền. */
        .np-partners-color .np-logo-img { filter: none; opacity: 0.9; transition: opacity 0.2s ease; }
        .np-partners-color .np-logo-chip { background: transparent; height: 96px; min-width: 212px; margin-right: 76px; padding: 0; }
        /* Bỏ inset mặc định (12px 20px) để logo lấp đầy ô — giữ nguyên thì ô to
           lên mà hình bên trong vẫn nhỏ như cũ. */
        .np-partners-color .np-logo-img { inset: 0; width: 100%; height: 100%; }
        .np-partners-color .np-logo-chip:hover .np-logo-img { opacity: 1; }
        .np-partners-color .np-logo-name { color: #fff; }
        @media (max-width: 720px) {
          .np-partners-color .np-logo-chip { height: 68px; min-width: 150px; margin-right: 44px; }
          .np-marquee + .np-marquee { margin-top: 16px; }
        }

        @media (prefers-reduced-motion: reduce) { .np-marquee-track { animation: none; } }
      `}</style>

      {showHeading && (
        <h2 className="np-partners-head">
          Rất nhiều nhà tuyển dụng đang tìm<br />
          <b>“tân binh”</b> giỏi — như chính bạn.
        </h2>
      )}

      <MarqueeRow variant="a" items={rowA} />
      <MarqueeRow variant="b" items={rowB} />
    </div>
  );
}
