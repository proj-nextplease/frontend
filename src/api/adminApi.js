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
