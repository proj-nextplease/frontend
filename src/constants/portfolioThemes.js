/**
 * Giao diện của trang portfolio công khai.
 *
 * Sản phẩm từng có năm giao diện (Classic Default, Luxury Gold, Cyberpunk
 * Neon, Emerald Executive và Fomlio). Giờ chỉ còn MỘT: giữ năm bộ mặt cho
 * cùng một dữ liệu nghĩa là năm lần phải sửa mỗi khi trang đổi, mà bốn bộ
 * kia không ai chăm.
 *
 * Mã `FOMLIO` giữ nguyên vì nó đã nằm trong cột `profiles.selected_theme`
 * của những hồ sơ đã lưu; chỉ tên hiển thị là đổi. Những hồ sơ cũ còn ghi mã
 * khác vẫn hiện bằng giao diện này — VerifiedPassport không còn rẽ nhánh.
 */
export const PORTFOLIO_THEME = {
  id: 'FOMLIO',
  name: 'Cốm Neon',
  colorBox: ['#cbf748', '#7b3aec'],
};

/** Giữ dạng mảng cho nơi nào còn duyệt danh sách. */
export const PORTFOLIO_THEMES = [PORTFOLIO_THEME];
