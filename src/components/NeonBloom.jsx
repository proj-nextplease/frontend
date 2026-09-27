import { INK, EMERALD, EMERALD_BRIGHT, ON_DARK, HAIRLINE, NEON_RGB, TEAL_ACCENT, GLOW_MD, GLOW_LG } from '../styles/neonPalette.js';

/* ──────────────────────────────────────────────────────────────────────────
   Lớp vệt loang nền.

   Sáu quầng, mỗi quầng một kích thước, vị trí, quỹ đạo và chu kỳ riêng. Chu kỳ
   đều là số nguyên tố (37, 43, 53, 61, 67, 71 giây) nên chúng gần như không
   bao giờ trùng pha — nền không lặp lại thành nhịp mà mắt nhận ra được. Mỗi
   quầng còn có độ trễ âm khác nhau nên ngay khi tải trang chúng đã ở các pha
   khác nhau chứ không cùng xuất phát.

   position: fixed nên vệt phủ toàn trang, kể cả footer.

   LƯU Ý khi dùng: trang chứa nó phải cho nội dung nổi lên trên (z-index), và
   PHẢI loại trừ thanh header khỏi mọi luật đặt `position` — header là fixed,
   ghi đè thành relative sẽ làm nó trôi mất khi cuộn.
   ────────────────────────────────────────────────────────────────────────── */
export function NeonBloom() {
  return (
    <div className="np-bloom" aria-hidden="true">
      <style>{`
        .np-bloom {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          overflow: hidden; filter: blur(80px) saturate(1.15);
        }
        .np-bloom span { position: absolute; border-radius: 9999px; display: block; will-change: transform, opacity; }
        .np-bloom span:nth-child(1) {
          width: 46vw; height: 38vw; left: -8vw; top: -6vw;
          background: radial-gradient(circle at 42% 48%, rgba(${NEON_RGB}, 0.20), transparent 68%);
          animation: npBloomA 37s ease-in-out infinite alternate;
        }
        .np-bloom span:nth-child(2) {
          width: 38vw; height: 34vw; right: -6vw; top: 8vh;
          background: radial-gradient(circle at 55% 45%, rgba(${NEON_RGB}, 0.14), transparent 70%);
          animation: npBloomB 43s ease-in-out infinite alternate; animation-delay: -11s;
        }
        .np-bloom span:nth-child(3) {
          width: 52vw; height: 40vw; left: 22vw; bottom: -14vw;
          background: radial-gradient(circle at 48% 52%, rgba(45, 212, 191, 0.10), transparent 72%);
          animation: npBloomC 53s ease-in-out infinite alternate; animation-delay: -23s;
        }
        .np-bloom span:nth-child(4) {
          width: 30vw; height: 30vw; left: 6vw; top: 42vh;
          background: radial-gradient(circle at 50% 50%, rgba(${NEON_RGB}, 0.10), transparent 70%);
          animation: npBloomD 61s ease-in-out infinite alternate; animation-delay: -7s;
        }
        .np-bloom span:nth-child(5) {
          width: 34vw; height: 26vw; right: 10vw; bottom: 6vh;
          background: radial-gradient(circle at 45% 50%, rgba(${NEON_RGB}, 0.12), transparent 68%);
          animation: npBloomE 67s ease-in-out infinite alternate; animation-delay: -31s;
        }
        .np-bloom span:nth-child(6) {
          width: 28vw; height: 24vw; left: 44vw; top: -8vw;
          background: radial-gradient(circle at 50% 50%, rgba(45, 212, 191, 0.09), transparent 70%);
          animation: npBloomF 71s ease-in-out infinite alternate; animation-delay: -17s;
        }
        @keyframes npBloomA { from { transform: translate(-6vw, 2vh) scale(0.92); opacity: 0.75; } to { transform: translate(9vw, -5vh) scale(1.14); opacity: 1; } }
        @keyframes npBloomB { from { transform: translate(5vw, -4vh) scale(1.10); opacity: 1; } to { transform: translate(-7vw, 7vh) scale(0.90); opacity: 0.65; } }
        @keyframes npBloomC { from { transform: translate(-9vw, 3vh) scale(1.05); opacity: 0.8; } to { transform: translate(7vw, -6vh) scale(0.88); opacity: 1; } }
        @keyframes npBloomD { from { transform: translate(4vw, 6vh) scale(0.86); opacity: 0.6; } to { transform: translate(-6vw, -8vh) scale(1.18); opacity: 0.95; } }
        @keyframes npBloomE { from { transform: translate(-5vw, -3vh) scale(1.12); opacity: 0.9; } to { transform: translate(6vw, 5vh) scale(0.94); opacity: 0.6; } }
        @keyframes npBloomF { from { transform: translate(7vw, 4vh) scale(0.90); opacity: 0.7; } to { transform: translate(-8vw, -3vh) scale(1.10); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .np-bloom span { animation: none !important; } }

        /* ══ THANH HEADER VÀ FOOTER ════════════════════════════════════════
           Các luật này trước đây nằm trong HomePage và bị khoá vào .np-home,
           nên chỉ trang chủ được áp — ba trang còn lại vẫn giữ header viên
           thuốc trắng và footer nền đặc màu cũ. Chuyển sang phạm vi .np-neon
           để mọi trang nền tối dùng chung; trang nào muốn áp thì thêm class
           "np-neon" vào thẻ gốc.

           Đặt trong component này vì mọi trang nền tối đều đã render nó, nên
           không phát sinh thêm import nào ở phía trang.
           SiteFooter tự tô nền đặc bằng hằng INK riêng của nó (#0b0f0e — giá
           trị CŨ, trước khi trang chủ đổi sang #070a0f). Hai hệ quả: màu lệch
           một bậc so với phần trên, và mảng đặc đó CHE lớp vệt loang, tạo một
           đường cắt ngang rõ rệt ở mép trên footer.

           Cho nền footer trong suốt để vệt loang chạy xuyên qua. Chỉ áp trong
           .np-neon nên các trang khác vẫn giữ footer nền đặc như cũ. */
        .np-neon .np-footer { background: transparent; }

        /* Chữ ký lớn cuối trang và link footer vẫn dùng emerald #10b981 + cam
           #f59e0b của bảng màu cũ — hai màu duy nhất còn sót lại trên trang. */
        .np-neon .np-footer-wordmark text { fill: ${EMERALD}; }
        .np-neon .np-footer-wordmark .np-footer-wordmark-dot { fill: ${TEAL_ACCENT}; }
        .np-neon .np-footer-link:hover { color: ${EMERALD}; }

        /* ══ HEADER ════════════════════════════════════════════════════════
           SiteHeader tự đổi sáng/tối theo scrollY của chính nó: cuộn quá 8px
           là nó chuyển sang chế độ "onlight" và tô viên thuốc màu TRẮNG. Luật
           đó đúng khi trang chủ còn đổi nền sang trắng; giờ trang tối suốt nên
           viên thuốc trắng thành một vệt sáng chói giữa nền đen.

           Ép cả hai chế độ về cùng một diện mạo tối. Chỉ áp trong .np-neon —
           các trang khác giữ nguyên hành vi cũ. */
        /* Ở ĐỈNH TRANG (ondark): viên thuốc trong suốt hoàn toàn, không viền,
           không blur — header như nổi thẳng trên nền. */
        .np-neon .nph-shell[data-mode="ondark"] .nph-pill {
          background-color: transparent;
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
          border-color: transparent;
          box-shadow: none;
          border-radius: 999px;
          color: ${ON_DARK};
        }
        /* KHI ĐÃ CUỘN (onlight): đặc lại thành kính mờ tối có viền. Vẫn giữ
           nguyên hiệu ứng chuyển trạng thái, chỉ là đích đến không còn màu
           trắng nữa. Mọi thuộc tính ở đây đều nằm trong transition sẵn có của
           .nph-pill nên chuyển vẫn mượt. */
        .np-neon .nph-shell[data-mode="onlight"] .nph-pill {
          /* Bản trước dùng rgba(12,16,21,0.72) — gần như trùng màu nền trang,
             nên tuy hiệu ứng vẫn chạy thì mắt không thấy gì đổi. Ở trang sáng
             viên thuốc chuyển sang TRẮNG nên nổi bật rõ; bản tối phải tự tạo
             lấy độ tương phản đó: nền sáng hơn nền trang vài bậc, viền lime,
             và một quầng lime mỏng dưới đáy. */
          background-color: rgba(23, 30, 38, 0.94);
          -webkit-backdrop-filter: blur(16px) saturate(1.3);
          backdrop-filter: blur(16px) saturate(1.3);
          border-color: rgba(${NEON_RGB}, 0.26);
          border-radius: 999px;
          box-shadow:
            0 12px 34px rgba(0, 0, 0, 0.6),
            0 0 22px rgba(${NEON_RGB}, 0.10);
          color: ${ON_DARK};
        }
        /* Nút "Đăng nhập": lime đặc chữ đen, giống mọi nút chính khác */
        .np-neon .nph-shell[data-mode="onlight"] .nph-btn-solid,
        .np-neon .nph-shell[data-mode="ondark"] .nph-btn-solid {
          background-color: ${EMERALD}; color: ${INK};
        }
        .np-neon .nph-shell[data-mode="onlight"] .nph-btn-solid:hover,
        .np-neon .nph-shell[data-mode="ondark"] .nph-btn-solid:hover {
          background-color: ${EMERALD_BRIGHT}; box-shadow: ${GLOW_MD};
        }
        .np-neon .nph-btn-solid, .np-neon .nph-btn-ghost { border-radius: 999px; }
        .np-neon .nph-shell[data-mode="onlight"] .nph-navlink:hover,
        .np-neon .nph-shell[data-mode="ondark"] .nph-navlink:hover {
          background-color: rgba(255,255,255,0.12);
        }
        .np-neon .nph-shell[data-mode="onlight"] .nph-navlink.active,
        .np-neon .nph-shell[data-mode="ondark"] .nph-navlink.active {
          background-color: rgba(${NEON_RGB}, 0.16); color: ${EMERALD};
        }
        /* Logo: phải lặp lại [data-mode] cho ĐỦ CẢ HAI chế độ. SiteHeader có
           luật .nph-shell[data-mode="ondark"] .nph-brand-word i với độ ưu tiên
           cao hơn ".np-neon .nph-brand-word i", nên nếu chỉ viết dạng ngắn thì
           ở đỉnh trang logo vẫn bị kéo về emerald #10b981 cũ — lệch màu với
           chữ ký lime dưới footer. */
        .np-neon .nph-shell[data-mode="ondark"] .nph-brand-word i,
        .np-neon .nph-shell[data-mode="onlight"] .nph-brand-word i { color: ${EMERALD}; }
        .np-neon .nph-shell[data-mode="ondark"] .nph-brand-word b,
        .np-neon .nph-shell[data-mode="onlight"] .nph-brand-word b { color: ${TEAL_ACCENT}; }
        .np-neon .nph-brand-mark { background: ${EMERALD}; color: ${INK}; }
      `}</style>
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}
