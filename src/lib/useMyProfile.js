import { useEffect, useState } from 'react';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { getStoredToken } from './authStorage.js';
import { supabase } from '../services/supabaseClient.js';
import { onPortfolioSaved } from './onboardingTab.js';

/**
 * Hồ sơ của chính người đang đăng nhập, dùng chung cho mọi chỗ cần hiển thị
 * avatar / tên của "tôi".
 *
 * Cache ở phạm vi module (giống jobsCache.js) để nhiều component cùng cần —
 * header, ô soạn bài Thảo Luận… — chỉ gọi API một lần cho cả phiên thay vì mỗi
 * component một request.
 */

let cache = null;      // hồ sơ đã tải xong
let inflight = null;   // request đang bay, để gộp các lời gọi song song

/** Xoá cache khi đăng xuất hoặc đổi tài khoản. */
export function clearMyProfileCache() {
  cache = null;
  inflight = null;
}

function load() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = getMyPortfolio()
    .then((data) => { cache = data; inflight = null; return data; })
    .catch((err) => { inflight = null; throw err; });
  return inflight;
}

/**
 * @returns {{profile: object|null, signedIn: boolean}} hồ sơ (null khi chưa
 * tải xong / chưa đăng nhập) và trạng thái đăng nhập theo token đang lưu.
 */
export function useMyProfile() {
  /* signedIn phải là STATE có đăng ký theo dõi, không phải một phép đọc lúc
     render.
     Bản trước tính `Boolean(getStoredToken())` ngay trong thân hàm và không
     nghe ngóng gì cả. Ngay sau khi đăng nhập Google, ứng dụng khởi động lại từ
     URL chuyển hướng về, và Supabase khôi phục phiên BẤT ĐỒNG BỘ — nên ở lượt
     render đầu tiên token chưa có, signedIn = false, và component KHÔNG BAO
     GIỜ render lại để biết là đã đăng nhập.
     SiteHeader không lộ lỗi này vì nó tự giữ một subscription riêng; nhưng
     component đó render lại thì ConsentGuard ở nhánh khác của cây vẫn đứng im
     — đó là lý do cổng điều khoản không hiện sau khi đăng nhập bằng Google. */
  const [signedIn, setSignedIn] = useState(() => Boolean(getStoredToken()));
  const [loaded, setLoaded] = useState(cache);

  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(Boolean(data.session) || Boolean(getStoredToken()));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setSignedIn(Boolean(session));
      // Đăng xuất hoặc đổi tài khoản thì bộ đệm hồ sơ cũ phải đi theo.
      if (!session) clearMyProfileCache();
    });

    return () => { alive = false; subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!signedIn || cache) return undefined;
    let alive = true;
    load()
      .then((data) => { if (alive) setLoaded(data); })
      .catch(() => { /* không tải được thì hiển thị mặc định */ });
    return () => { alive = false; };
  }, [signedIn]);

  /* Hồ sơ có thể được tạo/sửa ở MỘT TAB KHÁC — cụ thể là tab dựng hồ sơ mà
     luồng đăng nhập mở ra (lib/onboardingTab.js). Cache ở phạm vi module nên
     tab này sẽ ôm mãi bản cũ ("chưa có hồ sơ") cho tới khi tải lại trang.
     Nghe tin rồi nạp lại — im lặng, không đụng gì tới việc người dùng đang làm
     trên tab này. */
  useEffect(() => {
    if (!signedIn) return undefined;
    let alive = true;
    const unsubscribe = onPortfolioSaved(() => {
      clearMyProfileCache();
      load()
        .then((data) => { if (alive) setLoaded(data); })
        .catch(() => { /* bỏ qua, lần đọc sau sẽ thử lại */ });
    });
    return () => { alive = false; unsubscribe(); };
  }, [signedIn]);

  // Đọc thẳng từ cache khi render: component gắn sau khi cache đã đầy vẫn có
  // dữ liệu ngay, khỏi cần một vòng setState nữa.
  return { profile: signedIn ? (cache || loaded) : null, signedIn };
}
