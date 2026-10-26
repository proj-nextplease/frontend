/**
 * Nhớ trang người dùng đang đứng khi họ bấm đăng nhập, để sau khi đăng nhập
 * xong đưa họ về đúng chỗ đó thay vì đá thẳng vào dashboard.
 *
 * Dùng sessionStorage vì đăng nhập Google rời khỏi trang rồi quay lại — biến
 * trong bộ nhớ React không sống qua vòng chuyển hướng đó. sessionStorage sống
 * theo tab nên hai tab đăng nhập song song không giẫm lên nhau.
 */

const KEY = 'fonlio:return-to';
const LEGACY_KEY = 'nextplease:return-to';

/** Các trang không đáng quay lại: quay về đây sau khi đăng nhập là vô nghĩa. */
const SKIP = [
  '/candidate/login', '/candidates/login',
  '/candidate/register', '/candidates/register',
  '/business/login', '/business/register', '/business/accept-invite',
  '/forgot-password', '/reset-password',
  '/nextplease-admin-portal',
];

function isReturnable(path) {
  if (!path || !path.startsWith('/')) return false;
  // Chỉ nhận đường dẫn nội bộ — chặn "//evil.com" bị hiểu là URL tuyệt đối.
  if (path.startsWith('//')) return false;
  if (SKIP.some((skip) => path.startsWith(skip))) return false;
  if (path.includes('auth=login') || path.includes('login=1')) return false;
  return true;
}

/**
 * Ghi nhớ vị trí hiện tại (đường dẫn + query + hash).
 * Gọi ngay trước khi mở form đăng nhập.
 */
export function rememberReturnTo(path = `${window.location.pathname}${window.location.search}${window.location.hash}`) {
  try {
    // Nếu path là trang chủ hoặc auth query param, mà trong session đã có sẵn một deep link hợp lệ thì giữ lại deep link đó
    if ((path === '/' || path.startsWith('/?') || path.startsWith('/#')) && peekReturnTo()) {
      return;
    }
    if (isReturnable(path)) {
      sessionStorage.setItem(KEY, path);
    } else {
      sessionStorage.removeItem(KEY);
      sessionStorage.removeItem(LEGACY_KEY);
    }
  } catch { /* chế độ riêng tư chặn storage thì bỏ qua, chỉ mất tiện ích */ }
}

/** Đọc điểm quay lại mà KHÔNG xoá — dùng để dựng redirectTo cho OAuth. */
export function peekReturnTo() {
  try {
    const path = sessionStorage.getItem(KEY) || sessionStorage.getItem(LEGACY_KEY);
    return isReturnable(path) ? path : null;
  } catch {
    return null;
  }
}

/**
 * Lấy điểm quay lại rồi xoá đi. Trả về `fallback` nếu không có.
 * Gọi khi đăng nhập thành công.
 */
export function consumeReturnTo(fallback = null) {
  const path = peekReturnTo();
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(LEGACY_KEY);
  } catch { /* bỏ qua */ }
  return path || fallback;
}
