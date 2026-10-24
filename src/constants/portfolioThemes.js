/**
 * Giao diện của trang portfolio công khai.
 *
 * Mỗi giao diện ở đây CHỈ là một bảng màu: cùng một bố cục, cùng một
 * component (FomlioPassport), khác nhau ở các biến CSS mà `data-fom-theme`
 * trên `.fom-page` chọn ra. Cố ý giữ như vậy — sản phẩm từng có năm giao
 * diện dựng riêng và hệ quả là mỗi lần đổi trang phải sửa năm chỗ, bốn chỗ
 * không ai chăm. Thêm màu thì rẻ, thêm bố cục thì đắt.
 *
 * `id` được ghi thẳng vào cột `profiles.selected_theme`, nên đổi chuỗi là
 * làm hỏng những hồ sơ đã lưu. Hồ sơ nào còn ghi mã cũ (DEFAULT, DARK_GOLD,
 * CYBERPUNK, EMERALD_CLASSIC) sẽ rơi về giao diện mặc định.
 */
export const PORTFOLIO_THEMES = [
  {
    id: 'FOMLIO',
    name: 'Cốm Neon',
    hint: 'Nền đen, quầng cốm',
    colorBox: ['#cbf748', '#7b3aec'],
  },
  {
    id: 'NHO_NEON',
    name: 'Nho Neon',
    hint: 'Xanh hoàng gia, cốm neon & trắng (Figma 10-129)',
    colorBox: ['#160ae6', '#cbf748'],
  },
];

/** Giao diện dùng khi hồ sơ chưa chọn, hoặc ghi một mã không còn tồn tại. */
export const PORTFOLIO_THEME = PORTFOLIO_THEMES[0];

/** Đổi mã trong DB thành một giao diện có thật. Không bao giờ trả về null:
 *  một mã lạ không được phép làm trắng cả trang hồ sơ. */
export function resolveTheme(id) {
  return PORTFOLIO_THEMES.find((t) => t.id === id) || PORTFOLIO_THEME;
}
