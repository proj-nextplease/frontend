import { useCallback, useEffect, useState } from 'react';
import { getSavedJobIds, saveJob, unsaveJob } from '../api/jobApi.js';
import { getStoredToken } from './authStorage.js';

/**
 * Kho "việc đã lưu" dùng chung cho cả site.
 *
 * TRƯỚC ĐÓ NÓ HỎNG THẾ NÀY: trái tim ở /jobs và ở trang chi tiết chỉ ghi vào
 * localStorage['nextplease:saved-jobs']. Backend có sẵn bộ endpoint đầy đủ
 * (SavedJobController: POST/DELETE /jobs/{id}/save, GET /me/saved-jobs) nhưng
 * không ai gọi. Khu vực ứng viên thì đọc từ API. Hai bên nói chuyện với hai
 * nguồn khác nhau, nên bấm tim xong vào "việc đã lưu" là trống trơn — và mất
 * sạch khi đổi máy hoặc xoá cache trình duyệt.
 *
 * Giờ API là nguồn sự thật. localStorage rút về đúng hai vai trò:
 *   - bộ đệm để tim hiện đúng màu NGAY khi tải trang, trước lúc API trả về;
 *   - chỗ chứa cho người CHƯA đăng nhập, để họ vẫn lưu được (xem mergeGuestSaves).
 *
 * Mọi component dùng chung một Set trong module này + danh sách subscriber, nên
 * bấm tim ở trang danh sách thì trang chi tiết và tab "Việc đã lưu" đổi theo
 * ngay, không cần tải lại.
 */

const CACHE_KEY = 'nextplease:saved-jobs';

let ids = new Set(readCache());
let hydrated = false;
const listeners = new Set();

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

function writeCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...ids]));
  } catch {
    /* Safari riêng tư chặn ghi — không sao, API vẫn là nguồn chính. */
  }
}

function emit() {
  writeCache();
  // Set mới mỗi lần phát: React so sánh tham chiếu, giữ nguyên Set thì không render lại.
  const snapshot = new Set(ids);
  listeners.forEach((fn) => fn(snapshot));
}

/** Kéo danh sách thật từ server. Gọi lại được nhiều lần, chỉ chạy một lần thật. */
export async function hydrateSavedJobs({ force = false } = {}) {
  if (!getStoredToken()) return;
  if (hydrated && !force) return;
  hydrated = true;
  try {
    const serverIds = (await getSavedJobIds()).map(String);
    // Những id người dùng lưu lúc chưa đăng nhập vẫn nằm trong bộ đệm; đẩy nốt
    // lên server thay vì lặng lẽ vứt đi.
    const pending = [...ids].filter((id) => !serverIds.includes(id));
    ids = new Set(serverIds);
    emit();
    if (pending.length) {
      await Promise.allSettled(pending.map((id) => saveJob(id)));
      ids = new Set((await getSavedJobIds()).map(String));
      emit();
    }
  } catch {
    // Mất mạng / server lỗi: giữ nguyên bộ đệm và cho thử lại ở lần sau.
    hydrated = false;
  }
}

/** Xoá trạng thái khi đăng xuất, để tài khoản sau không thấy tim của tài khoản trước. */
export function resetSavedJobs() {
  hydrated = false;
  ids = new Set();
  emit();
}

/**
 * Bật/tắt trạng thái lưu. Đổi giao diện TRƯỚC rồi mới gọi API (optimistic):
 * bấm tim là hành động nhỏ và làm liên tục, bắt chờ mạng thì thấy khựng. Nếu
 * API lỗi thì trả lại trạng thái cũ và ném lỗi ra cho nơi gọi hiển thị.
 */
export async function toggleSavedJob(rawId) {
  const id = String(rawId);
  const wasSaved = ids.has(id);

  ids = new Set(ids);
  if (wasSaved) ids.delete(id); else ids.add(id);
  emit();

  if (!getStoredToken()) return !wasSaved;

  try {
    if (wasSaved) await unsaveJob(id); else await saveJob(id);
  } catch (err) {
    ids = new Set(ids);
    if (wasSaved) ids.add(id); else ids.delete(id);
    emit();
    throw err;
  }
  return !wasSaved;
}

/** Set các id đã lưu, tự đồng bộ khi có thay đổi ở bất kỳ đâu trong app. */
export function useSavedJobs() {
  const [snapshot, setSnapshot] = useState(() => new Set(ids));

  useEffect(() => {
    listeners.add(setSnapshot);
    hydrateSavedJobs();
    return () => listeners.delete(setSnapshot);
  }, []);

  const toggle = useCallback((id) => toggleSavedJob(id), []);

  return { savedIds: snapshot, toggleSave: toggle, isSaved: (id) => snapshot.has(String(id)) };
}
