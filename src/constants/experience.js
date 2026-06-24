// Activity categories & role levels — kept in sync with the dashboard
// "Nộp minh chứng" form so a Portfolio experience and a proof-of-work
// submission describe the same thing with the same fields.
export const EXPERIENCE_CATEGORY_OPTIONS = [
  { value: 'CLUB_SMALL', label: 'Sự kiện CLB / Khoa (+100 EXP)' },
  { value: 'SCHOOL_CAMPAIGN', label: 'Chiến dịch cấp Trường (+300 EXP)' },
  { value: 'COMPANY_PROJECT', label: 'Dự án Doanh nghiệp (+500 EXP)' },
  { value: 'SHORT_INTERNSHIP', label: 'Thực tập ngắn hạn (+500 EXP)' },
  { value: 'FREELANCE_GIG', label: 'Công việc tự do (+500 EXP)' },
];

export const EXPERIENCE_ROLE_LEVEL_OPTIONS = [
  { value: 'MEMBER', label: 'Thành viên (+5 RS khi duyệt)' },
  { value: 'LEADER', label: 'Trưởng nhóm / Ban (+10 RS khi duyệt)' },
];
