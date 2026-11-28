/*
 * Chuyển một dòng audit_logs thành câu tiếng Việt cho người không làm kỹ thuật.
 *
 * Backend lưu hành động dạng mã ("user.logged_out", "b2b.approved") và dữ liệu
 * kèm theo dạng JSON. Trang admin trước đây in thẳng hai thứ đó ra, nên người
 * vận hành phải tự đoán "user.logged_out" và một khối {"type":"jsonb",...}
 * nghĩa là gì. File này giữ toàn bộ việc dịch ở một chỗ để dễ thêm hành động mới.
 */

const ROLE_LABELS = {
  OWNER: 'Chủ sở hữu',
  MANAGER: 'Quản lý',
  MEMBER: 'Thành viên',
};

const CONFIG_LABELS = {
  min_topup_vnd: 'Số tiền nạp tối thiểu',
  default_topup_package_np: 'Gói nạp mặc định',
  paid_job_acceptance_fee_np: 'Phí nhận việc có lương',
  portfolio_export_fee_np: 'Phí xuất portfolio',
  five_star_reward_np: 'Thưởng NP cho đánh giá 5 sao',
  free_jd_quota_monthly: 'Số tin đăng miễn phí mỗi tháng',
  ai_auto_approve_min_score: 'Ngưỡng điểm AI tự duyệt',
  ai_auto_reject_max_score: 'Ngưỡng điểm AI tự từ chối',
  ai_verification_enabled: 'Bật AI thẩm định minh chứng',
};

/**
 * Metadata có thể tới ở ba dạng: object đã parse, chuỗi JSON (backend mới),
 * hoặc object PGobject {type:'jsonb', value:'{...}'} (backend cũ trả nguyên
 * đối tượng của driver Postgres). Luôn trả về một object thường.
 */
export function parseAuditMetadata(raw) {
  if (raw == null) return {};
  let value = raw;
  if (typeof value === 'object' && !Array.isArray(value) && typeof value.value === 'string' && 'type' in value) {
    value = value.value;
  }
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

const quote = (s) => `“${s}”`;
const roleLabel = (r) => ROLE_LABELS[String(r || '').toUpperCase()] || r;

/* Mỗi mục trả về { title, tone } từ metadata; details thêm sau ở describeAuditLog. */
const ACTIONS = {
  'user.logged_in': () => ({ title: 'Đăng nhập vào hệ thống', tone: 'neutral' }),
  'user.logged_out': () => ({ title: 'Đăng xuất khỏi hệ thống', tone: 'neutral' }),
  'candidate.registered': () => ({ title: 'Đăng ký tài khoản ứng viên', tone: 'success' }),
  'candidate.jit_provisioned': () => ({ title: 'Tài khoản được tạo tự động ở lần đăng nhập đầu tiên', tone: 'success' }),
  'company.registered': (m) => ({
    title: m.company_name ? `Đăng ký tài khoản doanh nghiệp ${quote(m.company_name)}` : 'Đăng ký tài khoản doanh nghiệp',
    tone: 'success',
  }),
  'club.registered': (m) => ({
    title: m.company_name ? `Đăng ký câu lạc bộ ${quote(m.company_name)}` : 'Đăng ký câu lạc bộ',
    tone: 'success',
  }),
  'b2b.approved': () => ({ title: 'Duyệt hồ sơ đối tác', tone: 'success' }),
  'b2b.rejected': () => ({ title: 'Từ chối hồ sơ đối tác', tone: 'danger' }),
  'b2b.resubmitted_document': () => ({ title: 'Nộp lại giấy tờ xác minh tổ chức', tone: 'neutral' }),
  'b2b.profile_updated': (m) => ({
    title: m.company_name ? `Cập nhật thông tin tổ chức ${quote(m.company_name)}` : 'Cập nhật thông tin tổ chức',
    tone: 'neutral',
  }),
  'job.created': (m) => ({ title: m.title ? `Đăng tin tuyển dụng ${quote(m.title)}` : 'Đăng tin tuyển dụng mới', tone: 'neutral' }),
  'job.updated': (m) => ({ title: m.title ? `Sửa tin tuyển dụng ${quote(m.title)}` : 'Sửa một tin tuyển dụng', tone: 'neutral' }),
  'job.approved': () => ({ title: 'Duyệt một tin tuyển dụng', tone: 'success' }),
  'job.rejected': () => ({ title: 'Từ chối một tin tuyển dụng', tone: 'danger' }),
  'quest.approved': () => ({ title: 'Duyệt một nhiệm vụ', tone: 'success' }),
  'quest.rejected': () => ({ title: 'Từ chối một nhiệm vụ', tone: 'danger' }),
  'admin.users_list.viewed': (m) => ({
    title: typeof m.records_returned === 'number'
      ? `Xem danh sách người dùng (${m.records_returned} tài khoản)`
      : 'Xem danh sách người dùng',
    tone: 'neutral',
  }),
  'admin.b2b_pending.viewed': (m) => ({
    title: typeof m.records_returned === 'number'
      ? `Xem hàng chờ duyệt đối tác (${m.records_returned} hồ sơ)`
      : 'Xem hàng chờ duyệt đối tác',
    tone: 'neutral',
  }),
  'admin.user.active': () => ({ title: 'Mở khoá lại một tài khoản', tone: 'success' }),
  'admin.user.frozen': () => ({ title: 'Đóng băng một tài khoản', tone: 'danger' }),
  'admin.user.banned': () => ({ title: 'Cấm vĩnh viễn một tài khoản', tone: 'danger' }),
  'admin.user.deleted': () => ({ title: 'Xoá một tài khoản người dùng', tone: 'danger' }),
  'admin.system_config.updated': (m) => {
    const label = CONFIG_LABELS[m.key] || m.key;
    return {
      title: label ? `Đổi cấu hình ${quote(label)}${m.value != null ? ` thành ${m.value}` : ''}` : 'Đổi cấu hình hệ thống',
      tone: 'neutral',
    };
  },
  'admin.company_provisioned': (m) => ({
    title: m.name ? `Cấp tài khoản cho tổ chức ${quote(m.name)}` : 'Cấp tài khoản cho một tổ chức',
    tone: 'success',
  }),
  'admin.ambassador.granted': () => ({ title: 'Cấp quyền đại sứ thương hiệu', tone: 'success' }),
  'admin.ambassador.revoked': () => ({ title: 'Thu hồi quyền đại sứ thương hiệu', tone: 'danger' }),
  'admin.finance_test_account.added': () => ({ title: 'Đánh dấu một tài khoản là tài khoản test (không tính vào tài chính)', tone: 'neutral' }),
  'admin.finance_test_account.removed': () => ({ title: 'Bỏ đánh dấu tài khoản test (tính lại vào tài chính)', tone: 'neutral' }),
  'account.display_name_updated': (m) => ({
    title: m.displayName ? `Đổi tên hiển thị thành ${quote(m.displayName)}` : 'Đổi tên hiển thị',
    tone: 'neutral',
  }),
  'account.deactivated': () => ({ title: 'Tự vô hiệu hoá tài khoản', tone: 'danger' }),
  'account.deleted_by_user': () => ({ title: 'Tự xoá tài khoản', tone: 'danger' }),
  'company.member_invited': (m) => ({
    title: m.email ? `Mời ${m.email} vào tổ chức` : 'Mời thành viên vào tổ chức',
    tone: 'neutral',
  }),
  'company.invitation_revoked': () => ({ title: 'Thu hồi một lời mời vào tổ chức', tone: 'danger' }),
  'company.invitation_resent': (m) => ({
    title: m.email ? `Gửi lại lời mời cho ${m.email}` : 'Gửi lại lời mời vào tổ chức',
    tone: 'neutral',
  }),
  'company.invitation_accepted': () => ({ title: 'Chấp nhận lời mời vào tổ chức', tone: 'success' }),
  'company.invitation_accepted_direct': () => ({ title: 'Chấp nhận lời mời vào tổ chức', tone: 'success' }),
  'company.member_role_changed': (m) => ({
    title: m.role ? `Đổi vai trò một thành viên thành ${roleLabel(m.role)}` : 'Đổi vai trò một thành viên',
    tone: 'neutral',
  }),
  'company.ownership_transferred': () => ({ title: 'Chuyển quyền chủ sở hữu tổ chức', tone: 'neutral' }),
  'company.member_removed': () => ({ title: 'Xoá một thành viên khỏi tổ chức', tone: 'danger' }),
  'company.member_left': () => ({ title: 'Rời khỏi tổ chức', tone: 'neutral' }),
};

/* Những trường metadata đáng cho người vận hành xem, kèm nhãn dễ hiểu. */
const DETAIL_FIELDS = [
  ['reason', 'Lý do'],
  ['note', 'Ghi chú'],
  ['role', 'Vai trò', roleLabel],
  ['new_status', 'Trạng thái mới', (v) => ({ ACTIVE: 'Hoạt động', FROZEN: 'Đóng băng', BANNED: 'Cấm vĩnh viễn' }[v] || v)],
  ['email', 'Email'],
  ['student_email', 'Email sinh viên'],
  ['company_type', 'Loại tổ chức', (v) => ({ SME: 'Doanh nghiệp SME', CLUB: 'Câu lạc bộ', STARTUP: 'Startup', AGENCY: 'Agency', ENTERPRISE: 'Doanh nghiệp lớn', SCHOOL: 'Trường học' }[v] || v)],
  ['ip_address', 'Địa chỉ mạng (IP)'],
];

/**
 * @returns {{ title: string, tone: 'success'|'danger'|'neutral', details: {label:string,value:string}[], known: boolean }}
 */
export function describeAuditLog(log) {
  const meta = parseAuditMetadata(log?.metadata);
  const action = log?.action || '';
  const builder = ACTIONS[action];
  const base = builder
    ? builder(meta)
    : { title: action ? `Hoạt động khác (${action})` : 'Hoạt động không rõ', tone: 'neutral' };

  const details = [];
  for (const [key, label, fmt] of DETAIL_FIELDS) {
    const v = meta[key];
    if (v === undefined || v === null || v === '') continue;
    // Email đã nằm trong câu chính thì không lặp lại ở phần chi tiết.
    if (key === 'email' && base.title.includes(String(v))) continue;
    details.push({ label, value: String(fmt ? fmt(v) : v) });
  }

  return { ...base, details, known: Boolean(builder) };
}

/* Chuỗi để ô tìm kiếm khớp được cả câu tiếng Việt lẫn mã hành động cũ. */
export function auditLogSearchText(log) {
  const d = describeAuditLog(log);
  return [d.title, ...d.details.map((x) => x.value), log?.action, log?.actorEmail, log?.actorName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
