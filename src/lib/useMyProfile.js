import { useEffect, useState } from 'react';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { getStoredToken } from './authStorage.js';

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
  const signedIn = Boolean(getStoredToken());
  const [loaded, setLoaded] = useState(cache);

  useEffect(() => {
    if (!signedIn || cache) return undefined;
    let alive = true;
    load()
      .then((data) => { if (alive) setLoaded(data); })
      .catch(() => { /* không tải được thì hiển thị mặc định */ });
    return () => { alive = false; };
  }, [signedIn]);

  // Đọc thẳng từ cache khi render: component gắn sau khi cache đã đầy vẫn có
  // dữ liệu ngay, khỏi cần một vòng setState nữa.
  return { profile: signedIn ? (cache || loaded) : null, signedIn };
}
