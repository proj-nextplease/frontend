import { httpClient } from './httpClient.js';

export async function getPublicProfile(userId) {
  const response = await httpClient.get(`/profiles/${userId}/public`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Không thể tải hồ sơ.');
  return response.data.data;
}

export async function getMyPortfolio() {
  const response = await httpClient.get('/profiles/me');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải thông tin portfolio.');
  }
  return response.data.data;
}

export async function updateMyPortfolio(payload, isDraft = false) {
  const response = await httpClient.put(isDraft ? '/profiles/me?draft=true' : '/profiles/me', payload);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể cập nhật portfolio.');
  }
  return response.data;
}
