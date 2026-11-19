/**
 * Ngày bắt đầu / kết thúc của kinh nghiệm: người dùng nhập dd/mm/yyyy.
 *
 * Bản ghi cũ chỉ có tháng/năm. Backend trả chúng về dạng mm/yyyy (hoặc mm/yy
 * nếu còn nằm trong bản nháp lưu trên trình duyệt) và vẫn nhận lại y nguyên.
 * Vì vậy giá trị cũ CHƯA bị sửa vẫn hợp lệ; còn ô nào người dùng đã gõ lại thì
 * phải đủ ngày. Nhờ thế lưu hồ sơ không bị chặn chỉ vì một kinh nghiệm cũ chưa
 * có ngày.
 */

const FULL = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const LEGACY = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;

export const DATE_PLACEHOLDER = 'dd/mm/yyyy';

/** Tự chèn dấu "/" khi gõ: "15092024" → "15/09/2024". */
export function maskDateInput(raw) {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** "15/09/2024" → Date (giờ địa phương), hoặc null nếu sai / không có thật (31/02). */
export function parseFullDate(value) {
  const m = FULL.exec(String(value || '').trim());
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

export function isLegacyMonth(value) {
  return LEGACY.test(String(value || '').trim());
}

/** "15/09/2024" → "2024-09-15" (dạng backend lưu vào cột date). Sai thì "". */
export function toIsoDate(value) {
  const d = parseFullDate(value);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayKey() {
  const t = new Date();
  return t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate();
}

/** Khoá so sánh: đủ ngày → yyyymmdd; chỉ tháng → yyyymm00. */
function keyOf(value) {
  const full = parseFullDate(value);
  if (full) return { key: full.getFullYear() * 10000 + (full.getMonth() + 1) * 100 + full.getDate(), hasDay: true };
  const m = LEGACY.exec(String(value || '').trim());
  if (!m) return null;
  const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  return { key: year * 10000 + Number(m[1]) * 100, hasDay: false };
}

const monthOf = (k) => Math.floor(k / 100);

/**
 * Kiểm một cặp ngày bắt đầu / kết thúc.
 *
 * @param {object} o
 * @param {string} o.start
 * @param {string} o.end
 * @param {boolean} [o.required] bắt buộc nhập cả hai
 * @param {boolean} [o.allowLegacyStart] chấp nhận mm/yyyy cũ (ô chưa bị sửa)
 * @param {boolean} [o.allowLegacyEnd]
 * @returns {{ start?: string, end?: string }} thông báo lỗi theo từng ô
 */
export function validateDateRange({ start, end, required = false, allowLegacyStart = false, allowLegacyEnd = false }) {
  const errors = {};
  const today = todayKey();

  function check(value, allowLegacy, label) {
    const v = String(value || '').trim();
    if (!v) return required ? `Vui lòng nhập ${label}.` : null;
    const k = keyOf(v);
    if (!k || (!k.hasDay && !allowLegacy)) return 'Đúng định dạng dd/mm/yyyy (ví dụ: 15/09/2024).';
    const future = k.hasDay ? k.key > today : monthOf(k.key) > monthOf(today);
    if (future) return `${label[0].toUpperCase()}${label.slice(1)} không được sau ngày hôm nay.`;
    return null;
  }

  const s = check(start, allowLegacyStart, 'thời gian bắt đầu');
  const e = check(end, allowLegacyEnd, 'thời gian kết thúc');
  if (s) errors.start = s;
  if (e) errors.end = e;

  if (!s && !e && String(start || '').trim() && String(end || '').trim()) {
    const a = keyOf(start);
    const b = keyOf(end);
    // Một bên chỉ có tháng thì chỉ so theo tháng được.
    const before = a.hasDay && b.hasDay ? b.key < a.key : monthOf(b.key) < monthOf(a.key);
    if (before) errors.end = `Thời gian kết thúc không được sớm hơn thời gian bắt đầu (${String(start).trim()}).`;
  }
  return errors;
}
