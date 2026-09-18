/**
 * Rút gọn một địa chỉ tự do của người đăng tin thành tên tỉnh / thành phố.
 *
 * Địa chỉ trong DB là text tự do ("Lô E2a-7, Đường D1, Khu CNC, TP. Thủ Đức,
 * TP. Hồ Chí Minh"), nên bộ lọc "Địa điểm" không thể dùng nguyên chuỗi. Hàm
 * dò tên tỉnh/thành trong chuỗi và trả về dạng chuẩn để gom nhóm.
 *
 * Tên tỉnh được giữ đúng như người dùng viết (chỉ chuẩn hoá cách viết tắt);
 * các tỉnh đã sáp nhập KHÔNG bị ánh xạ sang tên mới, tránh hiển thị sai so
 * với dữ liệu gốc.
 */

/* Tên chuẩn → các cách viết thường gặp (đã bỏ dấu, viết thường khi so khớp). */
const PROVINCE_ALIASES = {
  'TP. Hồ Chí Minh': ['ho chi minh', 'hcm', 'tphcm', 'tp hcm', 'sai gon', 'saigon', 'hcmc'],
  'Hà Nội': ['ha noi', 'hanoi'],
  'Đà Nẵng': ['da nang', 'danang'],
  'Hải Phòng': ['hai phong'],
  'Cần Thơ': ['can tho'],
  'Huế': ['hue', 'thua thien hue'],
  'An Giang': ['an giang'],
  'Bà Rịa - Vũng Tàu': ['ba ria', 'vung tau'],
  'Bắc Giang': ['bac giang'],
  'Bắc Kạn': ['bac kan'],
  'Bạc Liêu': ['bac lieu'],
  'Bắc Ninh': ['bac ninh'],
  'Bến Tre': ['ben tre'],
  'Bình Định': ['binh dinh'],
  'Bình Dương': ['binh duong'],
  'Bình Phước': ['binh phuoc'],
  'Bình Thuận': ['binh thuan'],
  'Cà Mau': ['ca mau'],
  'Cao Bằng': ['cao bang'],
  'Đắk Lắk': ['dak lak', 'daklak', 'buon ma thuot'],
  'Đắk Nông': ['dak nong'],
  'Điện Biên': ['dien bien'],
  'Đồng Nai': ['dong nai', 'bien hoa'],
  'Đồng Tháp': ['dong thap'],
  'Gia Lai': ['gia lai', 'pleiku'],
  'Hà Giang': ['ha giang'],
  'Hà Nam': ['ha nam'],
  'Hà Tĩnh': ['ha tinh'],
  'Hải Dương': ['hai duong'],
  'Hậu Giang': ['hau giang'],
  'Hòa Bình': ['hoa binh'],
  'Hưng Yên': ['hung yen'],
  'Khánh Hòa': ['khanh hoa', 'nha trang'],
  'Kiên Giang': ['kien giang', 'phu quoc'],
  'Kon Tum': ['kon tum'],
  'Lai Châu': ['lai chau'],
  'Lâm Đồng': ['lam dong', 'da lat'],
  'Lạng Sơn': ['lang son'],
  'Lào Cai': ['lao cai', 'sa pa'],
  'Long An': ['long an'],
  'Nam Định': ['nam dinh'],
  'Nghệ An': ['nghe an', 'vinh'],
  'Ninh Bình': ['ninh binh'],
  'Ninh Thuận': ['ninh thuan', 'phan rang'],
  'Phú Thọ': ['phu tho', 'viet tri'],
  'Phú Yên': ['phu yen', 'tuy hoa'],
  'Quảng Bình': ['quang binh'],
  'Quảng Nam': ['quang nam', 'hoi an', 'tam ky'],
  'Quảng Ngãi': ['quang ngai'],
  'Quảng Ninh': ['quang ninh', 'ha long'],
  'Quảng Trị': ['quang tri'],
  'Sóc Trăng': ['soc trang'],
  'Sơn La': ['son la'],
  'Tây Ninh': ['tay ninh'],
  'Thái Bình': ['thai binh'],
  'Thái Nguyên': ['thai nguyen'],
  'Thanh Hóa': ['thanh hoa'],
  'Tiền Giang': ['tien giang', 'my tho'],
  'Trà Vinh': ['tra vinh'],
  'Tuyên Quang': ['tuyen quang'],
  'Vĩnh Long': ['vinh long'],
  'Vĩnh Phúc': ['vinh phuc'],
  'Yên Bái': ['yen bai'],
};

/** Bỏ dấu tiếng Việt + gom khoảng trắng để so khớp không phụ thuộc cách gõ. */
function fold(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/* Dựng sẵn danh sách cặp [alias đã fold, tên chuẩn], alias dài ưu tiên trước
   để "ba ria vung tau" không bị "vung tau" cắt mất. */
const ALIAS_INDEX = Object.entries(PROVINCE_ALIASES)
  .flatMap(([canonical, aliases]) => [fold(canonical), ...aliases].map((a) => [a, canonical]))
  .sort((a, b) => b[0].length - a[0].length);

/* Người đăng hay ghi hình thức làm việc vào ô địa chỉ; đó không phải tỉnh/thành
   (đã có bộ lọc "Hình thức làm việc" riêng) nên bỏ qua. */
const NOT_A_PLACE = new Set([
  'remote', 'online', 'work from home', 'wfh', 'tu xa', 'lam viec tu xa',
  'hybrid', 'toan quoc', 'linh hoat', 'onsite', 'on site', 'khong xac dinh',
]);

/* Tiền tố đơn vị hành chính cần gỡ khi phải đoán từ đoạn cuối địa chỉ. */
const ADMIN_PREFIX = /^(tp|thanh pho|tinh|quan|huyen|phuong|xa|thi xa|thi tran)\s+/;

/**
 * Trả về tên tỉnh/thành của một địa chỉ, hoặc null nếu không nhận ra.
 * @param {string} raw địa chỉ tự do
 */
export function extractProvince(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  const foldedWhole = fold(text);
  if (NOT_A_PLACE.has(foldedWhole)) return null;

  const folded = ` ${foldedWhole} `;
  for (const [alias, canonical] of ALIAS_INDEX) {
    if (folded.includes(` ${alias} `)) return canonical;
  }

  // Không khớp danh sách: lấy đoạn cuối của địa chỉ và gỡ tiền tố hành chính.
  const last = text.split(',').map((s) => s.trim()).filter(Boolean).pop();
  if (!last) return null;
  const cleaned = last.replace(/^(TP\.?|Thành phố|Tỉnh)\s+/i, '').trim();
  if (!cleaned || NOT_A_PLACE.has(fold(cleaned)) || ADMIN_PREFIX.test(fold(cleaned))) return null;
  return cleaned;
}
