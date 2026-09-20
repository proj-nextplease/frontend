/**
 * Bộ linh vật đại diện cho hồ sơ ứng viên.
 *
 * Thay cho nhân vật 3D dựng bằng Three.js trước đây (PortfolioAvatar3D). Nhân
 * vật cũ tuỳ chỉnh được màu da / kiểu tóc / phụ kiện / dáng đứng; bộ này là
 * tranh cố định, nên toàn bộ phần tuỳ chỉnh đã bỏ — người dùng chỉ chọn một
 * trong bốn.
 *
 * Nguồn: page-mascot (MIT © Kamran Ahmed), https://koboyo.com/page-mascot.
 * Mỗi nhân vật là HAI sprite sheet 3×3: chín hướng nhìn và chín biểu cảm. Cùng
 * thư viện đang dùng cho con cóc ở các trạng thái trống (EmptyStateMascot).
 *
 * Thêm nhân vật mới: tải hai file từ trang trên vào public/mascots/ theo đúng
 * quy ước tên `<id>-directions.webp` / `<id>-reactions.webp`, rồi thêm một
 * dòng vào MASCOTS. Không cần sửa chỗ nào khác.
 */

export const MASCOTS = [
  { id: 'bald', label: 'Điềm tĩnh', gender: 'male' },
  { id: 'cap', label: 'Năng động', gender: 'male' },
  { id: 'ballerina', label: 'Thanh lịch', gender: 'female' },
  { id: 'skater', label: 'Phóng khoáng', gender: 'female' },
];

export const DEFAULT_MASCOT_BY_GENDER = { male: 'bald', female: 'ballerina' };

export function mascotsForGender(gender) {
  return MASCOTS.filter((m) => m.gender === gender);
}

export function mascotSheets(id) {
  return {
    directions: `/mascots/${id}-directions.webp`,
    reactions: `/mascots/${id}-reactions.webp`,
  };
}

/**
 * Đọc lựa chọn linh vật ra từ avatar_config đã lưu.
 *
 * Hồ sơ cũ lưu `{gender, skinTone, hairStyle, accessory, pose}` — không có
 * trường nào trỏ tới linh vật. Thay vì bắt những người đã dựng xong hồ sơ phải
 * vào chọn lại, suy ra từ giới tính họ đã chọn. Ai chưa có gì thì về ballerina,
 * đúng mặc định cũ của defaultAvatar (gender: 'female').
 */
export function resolveMascot(avatar) {
  const id = avatar?.mascot;
  if (id && MASCOTS.some((m) => m.id === id)) return id;
  return DEFAULT_MASCOT_BY_GENDER[avatar?.gender] || DEFAULT_MASCOT_BY_GENDER.female;
}
