/**
 * Danh sách trường testbed, khớp với dữ liệu seed trong
 * BE/src/main/resources/db/migration/V8__add_b2b_verification_fields.sql.
 *
 * Trước đây danh sách này nằm cứng trong BusinessRegisterPage. Hồ sơ đối tác
 * cũng cần nó để đổi school_id thành tên trường, và hai bản sao thì sớm muộn
 * cũng lệch nhau — nên gom về một chỗ.
 *
 * Còn là mảng tĩnh vì backend chưa có endpoint liệt kê schools. Khi có thì đây
 * là chỗ duy nhất phải đổi.
 */
export const SCHOOLS = [
  { value: '11111111-1111-1111-1111-111111111111', label: 'Trường Đại học FPT TP.HCM' },
  { value: '22222222-2222-2222-2222-222222222222', label: 'Trường Đại học Kinh tế TP.HCM (UEH)' },
  { value: '33333333-3333-3333-3333-333333333333', label: 'Trường Đại học Bách Khoa TP.HCM (HCMUT)' },
  { value: '44444444-4444-4444-4444-444444444444', label: 'Trường Đại học Quốc tế - ĐHQG TP.HCM (IU)' },
];

/** Trả về tên trường, hoặc null nếu id rỗng / không nằm trong danh sách. */
export function schoolNameById(id) {
  if (!id) return null;
  return SCHOOLS.find((s) => s.value === id)?.label || null;
}

/* advisor_contact là cột jsonb. Tuỳ đường ghi mà nó về dưới dạng object đã
   parse hay chuỗi JSON, nên phải chịu được cả hai — và cả chuỗi hỏng, vì đây
   chỉ là thông tin hiển thị, không đáng làm vỡ cả trang hồ sơ. */
export function parseAdvisorContact(raw) {
  if (!raw) return null;
  let obj = raw;
  if (typeof raw === 'string') {
    try { obj = JSON.parse(raw); } catch { return null; }
  }
  if (!obj || typeof obj !== 'object') return null;
  const name = obj.name || obj.advisorName || '';
  const phone = obj.phone || obj.advisorPhone || '';
  const email = obj.email || obj.advisorEmail || '';
  if (!name && !phone && !email) return null;
  return { name, phone, email };
}
