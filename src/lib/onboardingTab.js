/**
 * Mở trang tạo hồ sơ ở MỘT TAB RIÊNG ngay sau khi đăng nhập.
 *
 * Ý đồ: người dùng đang xem dở một trang rồi mới bấm đăng nhập thì tab đó phải
 * trả họ về đúng chỗ cũ, chứ không bị cuốn sang một biểu mẫu dài. Việc tạo hồ
 * sơ diễn ra bên cạnh, ở tab của riêng nó, và tab đó tự đóng khi xong.
 *
 * VÌ SAO PHẢI MỞ TAB TRỐNG TRƯỚC:
 * Trình duyệt chỉ cho `window.open` chạy trong đúng nhịp người dùng bấm chuột.
 * Sau khi `await` request đăng nhập thì nhịp đó đã đứt và popup bị chặn. Nên
 * tab được mở NGAY lúc submit — lúc đó còn chưa biết người này có hồ sơ chưa —
 * rồi mới trỏ nó tới /portfolio, hoặc đóng lại nếu hoá ra không cần.
 *
 * Cái giá: ai đã có hồ sơ rồi (đa số lượt đăng nhập) vẫn thấy một tab bật lên
 * rồi đóng ngay. Đây là đánh đổi đã biết và đã chọn, không phải sơ suất.
 */

const CHANNEL = 'nextplease:portfolio';
/** Cờ trong URL để trang dựng biết nó đang chạy trong tab do luồng này mở. */
export const ONBOARDING_TAB_FLAG = 'onboarding_tab';

/* Nội dung tạm cho tab trống. Không có nó thì người dùng nhìn một khoảng
   trắng trơ trọi và không biết chuyện gì đang xảy ra. Màu lấy theo hệ giấy
   của trang dựng để lúc trang thật vào chỗ không bị giật màu. */
const PLACEHOLDER = `<!doctype html><meta charset="utf-8">
<title>nextplease</title>
<style>
  html,body{height:100%;margin:0}
  body{display:grid;place-items:center;background:#fbf7ef;color:#16150f;
       font:500 15px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}
  .d{width:9px;height:9px;border-radius:50%;background:#16150f;margin:0 auto 14px;
     animation:p 1s ease-in-out infinite}
  @keyframes p{0%,100%{opacity:.2}50%{opacity:1}}
  @media (prefers-reduced-motion:reduce){.d{animation:none}}
</style>
<div style="text-align:center"><div class="d"></div>Đang chuẩn bị trang tạo hồ sơ…</div>`;

/**
 * Gọi ĐỒNG BỘ trong handler của sự kiện bấm/submit, trước mọi `await`.
 * Trả về handle của tab, hoặc null nếu trình duyệt vẫn chặn.
 */
export function openOnboardingTabEarly() {
  try {
    const tab = window.open('', '_blank');
    if (!tab) return null;
    tab.document.write(PLACEHOLDER);
    tab.document.close();
    return tab;
  } catch {
    return null;
  }
}

/** Trỏ tab đã mở tới trang dựng. Trả về false nếu tab không dùng được. */
export function sendTabToBuilder(tab) {
  if (!tab || tab.closed) return false;
  try {
    tab.location.replace(`/portfolio?${ONBOARDING_TAB_FLAG}=1`);
    return true;
  } catch {
    return false;
  }
}

/** Đóng tab đã mở dự phòng khi hoá ra không cần tới nó. */
export function discardOnboardingTab(tab) {
  try { if (tab && !tab.closed) tab.close(); } catch { /* bỏ qua */ }
}

/** Trang dựng báo về cho các tab khác rằng hồ sơ vừa được tạo/cập nhật. */
export function announcePortfolioSaved() {
  try {
    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage({ type: 'saved', at: Date.now() });
    ch.close();
  } catch { /* trình duyệt không hỗ trợ thì thôi, chỉ mất tiện ích */ }
}

/** Lắng nghe tin hồ sơ vừa lưu. Trả về hàm huỷ đăng ký. */
export function onPortfolioSaved(handler) {
  let ch;
  try {
    ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e) => { if (e.data?.type === 'saved') handler(); };
  } catch {
    return () => {};
  }
  return () => { try { ch.close(); } catch { /* bỏ qua */ } };
}
