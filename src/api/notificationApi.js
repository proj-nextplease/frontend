import { httpClient } from './httpClient.js';

export async function getNotifications() {
  const response = await httpClient.get('/me/notifications');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải thông báo.');
  }
  return response.data.data; // { items: [...], unreadCount }
}

export async function markNotificationRead(id) {
  const response = await httpClient.patch(`/me/notifications/${id}/read`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Thao tác thất bại.');
  return response.data.data;
}

export async function markAllNotificationsRead() {
  const response = await httpClient.patch('/me/notifications/read-all');
  if (!response.data?.success) throw new Error(response.data?.message || 'Thao tác thất bại.');
  return response.data.data;
}
