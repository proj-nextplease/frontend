/**
 * Kiểm tra định dạng giấy tờ Việt Nam, dùng chung cho form đăng ký đối tác và
 * form sửa hồ sơ đối tác. Hai form đó trước đây ràng buộc khác nhau, nên cùng
 * một dữ liệu lọt được ở chỗ này lại bị chặn ở chỗ kia.
 */

/* ── Mã số thuế ───────────────────────────────────────────────────────────
   Theo Thông tư 105/2020/TT-BTC, MST có đúng hai dạng:
       10 chữ số              — đơn vị độc lập
       10 chữ số + '-' + 3    — đơn vị trực thuộc / chi nhánh
   Không có dạng 11, 12 hay 14 ký tự. Đáng chú ý: CCCD là 12 chữ số, nên khi
   người dùng gõ nhầm CCCD vào ô MST thì độ dài là thứ bắt được ngay. */
export function normalizeTaxCode(raw) {
  if (!raw) return '';
  // Chỉ giữ số và dấu gạch; người dùng hay dán kèm khoảng trắng hoặc dấu chấm.
  return String(raw).replace(/[^\d-]/g, '').slice(0, 14);
}

export function validateTaxCode(raw) {
  const v = normalizeTaxCode(raw);
  if (!v) return 'Vui lòng nhập mã số thuế.';
  if (/^\d{10}$/.test(v)) return null;
  if (/^\d{10}-\d{3}$/.test(v)) return null;
  const digits = v.replace(/\D/g, '');
  if (digits.length === 12) {
    return 'Mã số thuế phải có 10 chữ số. Chuỗi 12 số bạn vừa nhập là định dạng CCCD — hãy kiểm tra lại.';
  }
  return 'Mã số thuế không hợp lệ: phải là 10 chữ số, hoặc 10 chữ số + “-” + 3 chữ số nếu là đơn vị trực thuộc.';
}

/* ── Số điện thoại ────────────────────────────────────────────────────────
   Từ đợt chuyển đổi đầu số năm 2018, mọi số di động Việt Nam đều có ĐÚNG 10
   chữ số. Các số 11 chữ số cũ đã không còn tồn tại. Đầu số hợp lệ:
       03, 05, 07, 08, 09  — di động
       02                  — cố định (có mã vùng)
   Ràng buộc cũ ở hồ sơ đối tác là "10 hoặc 11 chữ số", nên số 11 số đã chết
   vẫn lọt qua. */
const PHONE_PREFIX = /^(0(2|3|5|7|8|9))/;

export function normalizePhone(raw) {
  if (!raw) return '';
  let v = String(raw).replace(/\D/g, '');
  // Dạng quốc tế +84… quy về 0…, nếu không thì 84901234567 bị hiểu là 11 số sai.
  if (v.startsWith('84') && v.length >= 11) v = '0' + v.slice(2);
  /* KHÔNG cắt về 10. Cắt thì một số 11 chữ số (đầu số cũ đã chết) biến thành
     10 chữ số trông hợp lệ — vừa che mất lỗi, vừa âm thầm đổi số của người
     dùng thành một số khác. Chừa 11 để ô nhập giữ được chuỗi quá dài và phần
     kiểm tra bên dưới bắt được. */
  return v.slice(0, 11);
}

export function validatePhone(raw, { label = 'Số điện thoại' } = {}) {
  const v = normalizePhone(raw);
  if (!v) return `${label} không được để trống.`;
  if (v.length !== 10) return `${label} phải có đúng 10 chữ số (số Việt Nam sau chuyển đổi đầu số 2018).`;
  if (!PHONE_PREFIX.test(v)) return `${label} có đầu số không hợp lệ. Đầu số hợp lệ: 03, 05, 07, 08, 09 (di động) hoặc 02 (cố định).`;
  return null;
}
