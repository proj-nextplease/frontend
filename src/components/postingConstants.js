export const CATEGORY_MAP = {
  TECH: {
    label: 'Công nghệ & Kỹ thuật',
    specialties: [
      { value: 'SOFTWARE_ENG', label: 'Kỹ thuật phần mềm' },
      { value: 'INFO_SYSTEMS', label: 'Hệ thống thông tin' },
      { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu' },
      { value: 'CYBER_SEC', label: 'An toàn thông tin' },
      { value: 'OTHER_TECH', label: 'Lĩnh vực công nghệ khác' },
    ],
  },
  BUSINESS: {
    label: 'Kinh tế & Quản lý',
    specialties: [
      { value: 'MARKETING', label: 'Marketing / PR / Quảng cáo' },
      { value: 'FINANCE_ACC', label: 'Tài chính / Kế toán / Kiểm toán' },
      { value: 'BUSINESS_ADMIN', label: 'Quản trị kinh doanh / Vận hành' },
      { value: 'HR', label: 'Quản trị nhân sự' },
      { value: 'LOGISTICS', label: 'Logistics & Chuỗi cung ứng' },
      { value: 'OTHER_BIZ', label: 'Lĩnh vực kinh doanh khác' },
    ],
  },
  DESIGN: {
    label: 'Thiết kế & Nghệ thuật',
    specialties: [
      { value: 'GRAPHIC_DESIGN', label: 'Thiết kế đồ họa' },
      { value: 'UI_UX', label: 'Thiết kế giao diện UI/UX' },
      { value: 'FASHION', label: 'Thời trang / Nội thất' },
      { value: 'OTHER_DESIGN', label: 'Lĩnh vực thiết kế khác' },
    ],
  },
  MEDIA: {
    label: 'Truyền thông & Sự kiện',
    specialties: [
      { value: 'EVENT_PLANNING', label: 'Tổ chức sự kiện' },
      { value: 'CONTENT_CREATIVE', label: 'Sáng tạo nội dung / Copywriter' },
      { value: 'VIDEO_PRODUCTION', label: 'Quay dựng phim / Biên tập video' },
      { value: 'OTHER_MEDIA', label: 'Lĩnh vực truyền thông khác' },
    ],
  },
  LANGUAGE: {
    label: 'Ngôn ngữ & Nhân văn',
    specialties: [
      { value: 'TRANSLATION', label: 'Biên phiên dịch' },
      { value: 'TEACHING', label: 'Giảng dạy / Sư phạm / Đào tạo' },
      { value: 'OTHER_LANG', label: 'Lĩnh vực ngôn ngữ khác' },
    ],
  },
  OTHER: {
    label: 'Lĩnh vực khác',
    specialties: [{ value: 'OTHER', label: 'Công việc / Lĩnh vực khác' }],
  },
};

export const JOB_TYPES = [
  { value: 'INTERNSHIP', label: 'Thực tập sinh (Internship)', exp: 500 },
  { value: 'PART_TIME', label: 'Bán thời gian (Part-time)', exp: 300 },
  { value: 'FREELANCE', label: 'Công việc tự do (Freelance)', exp: 300 },
  { value: 'EVENT_STAFF', label: 'Nhân sự sự kiện (Event staff)', exp: 200 },
  { value: 'MICRO_INTERNSHIP', label: 'Thực tập ngắn hạn / Dự án (Micro-internship)', exp: 500 },
];

export const QUEST_CATEGORIES = [
  { value: 'SMALL_EVENT', label: 'Sự kiện CLB nhỏ', exp: 100 },
  { value: 'SCHOOL_CAMPAIGN', label: 'Chiến dịch cấp trường', exp: 300 },
];

export const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Cơ bản' },
  { value: 'INTERMEDIATE', label: 'Trung bình' },
  { value: 'ADVANCED', label: 'Nâng cao' },
  { value: 'EXPERT', label: 'Chuyên gia' },
];

export function formatVND(value) {
  if (!value) return '';
  const clean = value.toString().replace(/\D/g, '');
  if (!clean) return '';
  return parseInt(clean, 10).toLocaleString('vi-VN');
}

export function toLocalISOString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const offsetStr = `${sign}${pad(Math.floor(absMin / 60))}:${pad(absMin % 60)}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${offsetStr}`;
}

export const STATUS_LABEL = {
  PENDING: { text: 'Chờ duyệt', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  OPEN: { text: 'Đang mở', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  CLOSED: { text: 'Đã đóng', color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  REJECTED: { text: 'Bị từ chối', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
  DRAFT: { text: 'Nháp', color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
};
