import { httpClient } from './httpClient.js';

export async function getAdminStats() {
  const response = await httpClient.get('/admin/dashboard/stats');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải thống kê hệ thống.');
  }
  return response.data.data;
}

export async function getAdminUsers() {
  const response = await httpClient.get('/admin/dashboard/users');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách người dùng.');
  }
  return response.data.data;
}

export async function getAdminJobs() {
  const response = await httpClient.get('/admin/dashboard/jobs');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách tin tuyển dụng.');
  }
  return response.data.data;
}

export async function getAdminAuditLogs() {
  const response = await httpClient.get('/admin/dashboard/audit-logs');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải nhật ký hệ thống.');
  }
  return response.data.data;
}

export async function approveJob(id) {
  const response = await httpClient.post(`/admin/dashboard/jobs/${id}/approve`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Duyệt tin tuyển dụng thất bại.');
  }
  return response.data.data;
}

export async function rejectJob(id, reason) {
  const response = await httpClient.post(`/admin/dashboard/jobs/${id}/reject`, null, {
    params: { reason }
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Từ chối tin tuyển dụng thất bại.');
  }
  return response.data.data;
}

export async function updateUserStatus(userId, status, reason = '') {
  const response = await httpClient.patch(`/admin/dashboard/users/${userId}/status`, { status, reason });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Cập nhật trạng thái người dùng thất bại.');
  }
  return response.data.data;
}

export async function getActiveFraudFlags() {
  const response = await httpClient.get('/admin/dashboard/fraud-flags');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách cờ gian lận.');
  }
  return response.data.data || [];
}

export async function resolveFraudFlag(flagId, resolution = 'RESOLVED') {
  const response = await httpClient.patch(`/admin/dashboard/fraud-flags/${flagId}/resolve`, null, {
    params: { resolution }
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Cập nhật fraud flag thất bại.');
  }
  return response.data.data;
}

