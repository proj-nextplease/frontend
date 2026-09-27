/* ──────────────────────────────────────────────────────────────────────────
   Bảng màu neon dùng chung cho các trang giới thiệu nền tối.

   Trước đây mỗi trang tự khai một bộ hằng số giống hệt nhau (INK, EMERALD,
   SURFACE...). Đổi tông thì phải sửa bốn chỗ và rất dễ sót một chỗ — đúng thứ
   đã xảy ra: footer giữ #0b0f0e cũ trong khi trang chủ đã sang #070a0f, tạo
   một đường cắt ngang giữa màn hình.

   Tất cả giá trị ở đây đo từ ảnh mẫu bằng cách lọc pixel, không phải ước lượng
   bằng mắt: nền #070a0f, màu nhấn #b9ff00.
   ────────────────────────────────────────────────────────────────────────── */

/* Nền và bề mặt */
export const INK = '#070a0f';          // nền trang
export const SURFACE = '#0f1318';      // bề mặt nổi: thẻ, panel, ô nhập
export const SURFACE_HI = '#161d24';   // bề mặt khi rê chuột
export const HAIRLINE = 'rgba(255,255,255,0.08)';
export const LINE = HAIRLINE;
export const LINE_STRONG = 'rgba(255,255,255,0.18)';

/* Màu nhấn. Giữ tên EMERALD dù giá trị đã là lime, để mọi chỗ đang dùng không
   phải đổi tên — đổi tên trên ~200 điểm gọi rủi ro hơn nhiều so với lợi ích. */
export const EMERALD = '#b9ff00';
export const EMERALD_BRIGHT = '#d2ff4d';
export const EMERALD_HOVER = EMERALD_BRIGHT;   // tên cũ ở PortfolioLandingPage
export const EMERALD_DARK = '#3f6212';         // dùng khi nền sáng, lime không đọc nổi
export const NEON_RGB = '185, 255, 0';

/* Màu phụ duy nhất: teal. Có sẵn trong lớp vệt loang nền nên không phải màu lạ. */
export const TEAL_ACCENT = '#2dd4bf';
export const TEAL = TEAL_ACCENT;

/* Chữ */
export const ON_DARK = '#ffffff';
export const MUTED = 'rgba(233,247,242,0.62)';
export const MUTED_DARK = MUTED;

/* Quầng sáng. Ảnh mẫu đo được tỉ lệ quầng/mảng đặc chỉ 0.13 — gần như phẳng —
   nên glow ở đây cố tình rất mỏng. */
export const GLOW_SM = `0 0 6px rgba(${NEON_RGB}, 0.30)`;
export const GLOW_MD = `0 0 12px rgba(${NEON_RGB}, 0.32)`;
export const GLOW_LG = `0 0 20px rgba(${NEON_RGB}, 0.42)`;
