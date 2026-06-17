import { httpClient } from './httpClient.js';

export async function getMyCredentialSubmissions() {
  const response = await httpClient.get('/credentials');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách minh chứng.');
  }
  return response.data.data;
}

export async function submitCredential(data) {
  const response = await httpClient.post('/credentials', data);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Nộp minh chứng thất bại.');
  }
  return response.data.data;
}

export async function getVerificationQueue() {
  const response = await httpClient.get('/admin/dashboard/verification-queue');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải hàng chờ xác thực.');
  }
  return response.data.data;
}

export async function approveCredential(id, note) {
  const params = note ? { note } : {};
  const response = await httpClient.post(`/admin/dashboard/verification-queue/${id}/approve`, null, { params });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Phê duyệt minh chứng thất bại.');
  }
  return response.data.data;
}

export async function rejectCredential(id, reason) {
  const response = await httpClient.post(
    `/admin/dashboard/verification-queue/${id}/reject`,
    null,
    { params: { reason } }
  );
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Từ chối minh chứng thất bại.');
  }
  return response.data.data;
}
