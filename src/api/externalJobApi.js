import { httpClient } from './httpClient.js';

/**
 * Tin tuyển dụng nguồn ngoài (Careerjet).
 *
 * Endpoint này KHÔNG gọi thẳng Careerjet — nó đọc từ bảng external_jobs trong
 * DB của mình, được nạp sẵn bằng thao tác đồng bộ của admin. Nhờ vậy trang việc
 * làm không bao giờ phụ thuộc vào việc API bên thứ ba có sống hay còn quota.
 */
export async function getExternalJobs({ q, location, limit = 30 } = {}) {
  const params = {};
  if (q) params.q = q;
  if (location) params.location = location;
  if (limit) params.limit = limit;
  const res = await httpClient.get('/jobs/external', { params });
  return res.data?.data ?? [];
}

/* ── Chỉ admin ── */

export async function getExternalJobStats() {
  const res = await httpClient.get('/admin/external-jobs/stats');
  return res.data?.data ?? null;
}

export async function syncExternalJobs({ keywords, location, pages = 1 } = {}) {
  const res = await httpClient.post('/admin/external-jobs/sync', { keywords, location, pages });
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Đồng bộ thất bại.');
  }
  return res.data.data;
}

export async function deactivateStaleExternalJobs(days = 30) {
  const res = await httpClient.post('/admin/external-jobs/deactivate-stale', { days });
  return res.data?.data ?? null;
}
