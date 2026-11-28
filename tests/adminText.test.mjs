// Chạy: npm test   (dùng trình chạy test có sẵn của Node, không cần thêm thư viện)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeAuditLog, parseAuditMetadata, auditLogSearchText } from '../src/utils/auditLogText.js';
import { formatVnd, formatNp } from '../src/utils/financeFormat.js';

test('Đăng xuất: câu dễ hiểu, IP hiện ở phần chi tiết thay vì khối JSON', () => {
  // Đúng dạng dữ liệu backend cũ trả về (đối tượng PGobject của Postgres).
  const log = {
    action: 'user.logged_out',
    metadata: { type: 'jsonb', value: '{"ip_address": "14.241.240.169"}', null: false },
  };
  const d = describeAuditLog(log);
  assert.equal(d.title, 'Đăng xuất khỏi hệ thống');
  assert.deepEqual(d.details, [{ label: 'Địa chỉ mạng (IP)', value: '14.241.240.169' }]);
  assert.equal(d.tone, 'neutral');
});

test('Metadata dạng chuỗi JSON (backend mới) và object đều đọc được', () => {
  assert.deepEqual(parseAuditMetadata('{"reason":"Sai thông tin"}'), { reason: 'Sai thông tin' });
  assert.deepEqual(parseAuditMetadata({ reason: 'x' }), { reason: 'x' });
  assert.deepEqual(parseAuditMetadata(null), {});
  assert.deepEqual(parseAuditMetadata('không phải json'), {});
  assert.deepEqual(parseAuditMetadata('[1,2]'), {});
});

test('Từ chối tin: màu đỏ và có lý do', () => {
  const d = describeAuditLog({ action: 'job.rejected', metadata: '{"reason":"Thiếu mức lương"}' });
  assert.equal(d.title, 'Từ chối một tin tuyển dụng');
  assert.equal(d.tone, 'danger');
  assert.deepEqual(d.details, [{ label: 'Lý do', value: 'Thiếu mức lương' }]);
});

test('Duyệt đối tác: màu xanh', () => {
  const d = describeAuditLog({ action: 'b2b.approved', metadata: '{"company_id":"abc"}' });
  assert.equal(d.title, 'Duyệt hồ sơ đối tác');
  assert.equal(d.tone, 'success');
  assert.equal(d.details.length, 0, 'mã company_id không hiện ra cho người dùng');
});

test('Đăng ký doanh nghiệp: tên tổ chức nằm trong câu, loại tổ chức dịch sang tiếng Việt', () => {
  const d = describeAuditLog({
    action: 'company.registered',
    metadata: '{"email":"hr@acme.vn","company_name":"ACME","company_type":"SME"}',
  });
  assert.equal(d.title, 'Đăng ký tài khoản doanh nghiệp “ACME”');
  assert.deepEqual(d.details, [
    { label: 'Email', value: 'hr@acme.vn' },
    { label: 'Loại tổ chức', value: 'Doanh nghiệp SME' },
  ]);
});

test('Đổi cấu hình: dùng tên dễ hiểu của khoá cấu hình', () => {
  const d = describeAuditLog({
    action: 'admin.system_config.updated',
    metadata: '{"key":"min_topup_vnd","value":"39000"}',
  });
  assert.equal(d.title, 'Đổi cấu hình “Số tiền nạp tối thiểu” thành 39000');
});

test('Xem danh sách người dùng: có số tài khoản', () => {
  const d = describeAuditLog({ action: 'admin.users_list.viewed', metadata: '{"records_returned":203}' });
  assert.equal(d.title, 'Xem danh sách người dùng (203 tài khoản)');
});

test('Mời thành viên: email đã ở trong câu thì không lặp lại, vai trò dịch sang tiếng Việt', () => {
  const d = describeAuditLog({
    action: 'company.member_invited',
    metadata: '{"email":"a@b.vn","role":"MANAGER"}',
  });
  assert.equal(d.title, 'Mời a@b.vn vào tổ chức');
  assert.deepEqual(d.details, [{ label: 'Vai trò', value: 'Quản lý' }]);
});

test('Khoá tài khoản: trạng thái mới được dịch', () => {
  const d = describeAuditLog({
    action: 'admin.user.frozen',
    metadata: '{"new_status":"FROZEN","reason":"Spam"}',
  });
  assert.equal(d.title, 'Đóng băng một tài khoản');
  assert.equal(d.tone, 'danger');
  assert.deepEqual(d.details, [
    { label: 'Lý do', value: 'Spam' },
    { label: 'Trạng thái mới', value: 'Đóng băng' },
  ]);
});

test('Hành động chưa biết: không vỡ, vẫn hiện mã để tra cứu', () => {
  const d = describeAuditLog({ action: 'something.new', metadata: null });
  assert.equal(d.title, 'Hoạt động khác (something.new)');
  assert.equal(d.known, false);
  assert.equal(describeAuditLog({}).title, 'Hoạt động không rõ');
});

test('Mọi hành động backend đang ghi đều có câu tiếng Việt', () => {
  const actions = [
    'user.logged_in', 'user.logged_out', 'candidate.registered', 'candidate.jit_provisioned',
    'company.registered', 'club.registered', 'b2b.approved', 'b2b.rejected', 'b2b.resubmitted_document',
    'b2b.profile_updated', 'job.created', 'job.updated', 'job.approved', 'job.rejected',
    'quest.approved', 'quest.rejected', 'admin.users_list.viewed', 'admin.b2b_pending.viewed',
    'admin.user.active', 'admin.user.frozen', 'admin.user.banned', 'admin.user.deleted',
    'admin.system_config.updated', 'admin.company_provisioned', 'admin.ambassador.granted',
    'admin.ambassador.revoked', 'account.display_name_updated', 'account.deactivated',
    'account.deleted_by_user', 'company.member_invited', 'company.invitation_revoked',
    'company.invitation_resent', 'company.invitation_accepted', 'company.invitation_accepted_direct',
    'company.member_role_changed', 'company.ownership_transferred', 'company.member_removed',
    'company.member_left', 'admin.finance_test_account.added', 'admin.finance_test_account.removed',
  ];
  for (const action of actions) {
    const d = describeAuditLog({ action, metadata: '{}' });
    assert.equal(d.known, true, `thiếu câu cho ${action}`);
    assert.ok(!d.title.includes(action), `${action} vẫn hiện mã kỹ thuật`);
  }
});

test('Tìm kiếm khớp cả câu tiếng Việt lẫn mã cũ và email', () => {
  const log = { action: 'user.logged_out', actorEmail: 'my@gmail.com', metadata: '{}' };
  const text = auditLogSearchText(log);
  assert.ok(text.includes('đăng xuất'));
  assert.ok(text.includes('user.logged_out'));
  assert.ok(text.includes('my@gmail.com'));
});

test('Định dạng tiền: dấu chấm phân cách hàng nghìn kiểu Việt Nam', () => {
  assert.equal(formatVnd(39000), '39.000đ');
  assert.equal(formatVnd(1250000), '1.250.000đ');
  assert.equal(formatVnd(null), '0đ');
  assert.equal(formatNp(19000), '19.000 NP');
});
