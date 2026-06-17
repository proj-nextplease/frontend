import { httpClient } from './httpClient.js';

export async function registerB2b(data) {
  const response = await httpClient.post('/auth/b2b/register', data);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Đăng ký đối tác thất bại.');
  }
  return response.data.data;
}

export async function getPendingB2bRegistrations() {
  const response = await httpClient.get('/admin/b2b/pending');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách kiểm duyệt.');
  }
  return response.data.data;
}

export async function approveB2bRegistration(companyId) {
  const response = await httpClient.post(`/admin/b2b/approve/${companyId}`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Phê duyệt thất bại.');
  }
  return response.data.data;
}

export async function rejectB2bRegistration(companyId, reason) {
  const response = await httpClient.post(`/admin/b2b/reject/${companyId}`, { reason });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Từ chối phê duyệt thất bại.');
  }
  return response.data.data;
}

export async function getMyCompany() {
  const response = await httpClient.get('/auth/b2b/company');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể lấy thông tin đối tác.');
  }
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await httpClient.get('/me');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể lấy thông tin tài khoản.');
  }
  return response.data.data;
}

export async function resubmitB2bDocument(documentUrl) {
  const response = await httpClient.post('/auth/b2b/resubmit', { documentUrl });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Gửi lại minh chứng thất bại.');
  }
  return response.data.data;
}

export async function updateB2bProfile(data) {
  const response = await httpClient.post('/auth/b2b/company/update', data);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Cập nhật hồ sơ đối tác thất bại.');
  }
  return response.data.data;
}

