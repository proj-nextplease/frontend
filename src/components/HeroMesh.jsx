/**
 * Tấm nền mesh của hero — dùng chung cho trang chủ và trang Việc làm.
 *
 * Công thức (đo trực tiếp từ joinhandshake.com, xem DESIGN.md): năm quầng tròn
 * gradient chồng nhau, định vị bằng %, cả tấm chịu `blur(90px) saturate(1.2)`
 * rồi phủ một lớp vignette radial kéo mọi thứ tối dần về màu nền ở rìa.
 *
 * Ba chi tiết dễ làm sai nếu chép tay:
 *   - `opacity: 0.7` trên tấm mesh. Cặp cyan/emerald ở đây sáng hơn cặp
 *     cyan/lime của trang mẫu khá nhiều; để 100% thì cả hero bệt trắng và tiêu
 *     đề mất tương phản. (Trang mẫu cũng để 0.7 — trùng hợp mà đúng.)
 *   - Thiếu lớp vignette thì mảng màu cắt ngang trang một cách thô.
 *   - Cyan KHÔNG phải màu thương hiệu. Nó chỉ tồn tại sau lớp blur, và vai trò
 *     duy nhất là tạo khoảng chuyển sắc với emerald ở rìa quầng — thiếu cặp
 *     màu lệch tông này thì cả tấm bệt thành một mảng xanh phẳng.
 *
 * Prop `veil` nhận một gradient khác khi trang cần vùng sáng nằm ở chỗ khác
 * (trang chủ: quầng cao và rộng sau tiêu đề khổng lồ; trang danh sách: quầng
 * thấp và hẹp hơn để không lấn xuống khu vực nội dung).
 */

const INK = '#0b0f0e';
const EMERALD = '#10b981';
const MESH_CYAN = '#67e8f9';

const DEFAULT_VEIL = `radial-gradient(100% 95% at 58% 22%, rgba(11,15,14,0) 0%, ${INK} 100%)`;

const BLOBS = [
  { w: '60%', h: '52%', left: '2%', top: '-10%', bg: `radial-gradient(at 55% 45%, ${MESH_CYAN} 0%, ${MESH_CYAN} 50%, transparent 76%)` },
  { w: '54%', h: '48%', left: '48%', top: '-14%', bg: `radial-gradient(${MESH_CYAN} 0%, ${MESH_CYAN} 62%, transparent 78%)` },
  { w: '64%', h: '48%', left: '3%', top: '26%', bg: `radial-gradient(at 20% 55%, ${MESH_CYAN} 0%, ${EMERALD} 53%, transparent 76%)` },
  { w: '48%', h: '44%', left: '56%', top: '30%', bg: `radial-gradient(at 52% 48%, ${MESH_CYAN} 0%, ${EMERALD} 68%, transparent 80%)` },
  { w: '42%', h: '38%', left: '34%', top: '8%', bg: `radial-gradient(${MESH_CYAN} 0%, ${EMERALD} 70%, transparent 78%)` },
];

/* `fade` (mặc định bật): ép cả tấm mờ về 0 trước khi chạm đáy khung. Chỉ tắt
   khi khung chứa nó cao bằng đúng vùng cần loang (ví dụ hero trang chủ, nơi
   mesh phủ trọn section). */
export function HeroMesh({ veil = DEFAULT_VEIL, veilOpacity = 0.9, meshOpacity = 0.7, fade = true, fadeMask }) {
  /* `fadeMask` ghi đè mốc tan của lớp mask. Mặc định tính theo % chiều cao
     khung — đúng khi khung CHÍNH LÀ vùng cần loang (hero trang chủ). Trang nào
     dựng khung cao hơn vùng nhìn thấy (để mượn hình học quầng của trang chủ)
     thì truyền mốc bằng px, để chỗ tan không trôi theo chiều cao khung. */
  const maskStyle = fadeMask ? { WebkitMaskImage: fadeMask, maskImage: fadeMask } : undefined;
  return (
    <>
      <style>{`
        .np-mesh { position: absolute; inset: 0; pointer-events: none; filter: blur(90px) saturate(1.2); transform: translateZ(0); }
        .np-mesh-blob { position: absolute; border-radius: 9999px; will-change: transform; }
        /* Mỗi quầng trôi một nhịp khác nhau nên nền không bao giờ đứng yên hẳn
           mà cũng không bao giờ trùng pha thành một khối. */
        .np-mesh-blob:nth-child(1) { animation: npDrift1 19s ease-in-out infinite alternate; }
        .np-mesh-blob:nth-child(2) { animation: npDrift2 23s ease-in-out infinite alternate; }
        .np-mesh-blob:nth-child(3) { animation: npDrift3 27s ease-in-out infinite alternate; }
        .np-mesh-blob:nth-child(4) { animation: npDrift4 21s ease-in-out infinite alternate; }
        .np-mesh-blob:nth-child(5) { animation: npDrift5 25s ease-in-out infinite alternate; }
        @keyframes npDrift1 { from { transform: translate(-22px, 1px) scale(0.986); } to { transform: translate(18px, -14px) scale(1.03); } }
        @keyframes npDrift2 { from { transform: translate(-14px, 20px) scale(0.984); } to { transform: translate(16px, -10px) scale(1.02); } }
        @keyframes npDrift3 { from { transform: translate(31px, -13px) scale(1.03); } to { transform: translate(-20px, 14px) scale(0.98); } }
        @keyframes npDrift4 { from { transform: translate(-19px, 29px) scale(0.97); } to { transform: translate(22px, -12px) scale(1.03); } }
        @keyframes npDrift5 { from { transform: translate(10px, -8px) scale(1.026); } to { transform: translate(-16px, 18px) scale(0.98); } }
        .np-mesh-veil { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
        /* Lớp vignette radial không bao giờ đạt đủ 100% độ đục ở mép DƯỚI của
           khung: tâm quầng đặt ở ~20% chiều cao, nên mép dưới mới đi được
           ~85–93% dọc theo gradient. Phần màu còn sót đó gặp mép khung là
           thành một đường ngang rõ rệt cắt ngang trang. Mask này ép cả tấm mờ
           hẳn về 0 trước khi chạm đáy, nên không còn mép nào để lộ. */
        .np-mesh-fade {
          -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%);
        }
        @media (prefers-reduced-motion: reduce) { .np-mesh-blob { animation: none !important; } }
      `}</style>

      <div className={`np-mesh${fade ? ' np-mesh-fade' : ''}`} aria-hidden="true" style={{ opacity: meshOpacity, ...maskStyle }}>
        {BLOBS.map((b) => (
          <div
            key={`${b.left}-${b.top}`}
            className="np-mesh-blob"
            style={{ width: b.w, height: b.h, left: b.left, top: b.top, backgroundImage: b.bg }}
          />
        ))}
      </div>
      <div
        className={`np-mesh-veil${fade ? ' np-mesh-fade' : ''}`}
        aria-hidden="true"
        style={{ opacity: veilOpacity, background: veil, ...maskStyle }}
      />
    </>
  );
}
