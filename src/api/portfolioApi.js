import { httpClient } from './httpClient.js';

export async function getPublicProfile(userId) {
  const response = await httpClient.get(`/profiles/${userId}/public`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Không thể tải hồ sơ.');
  return response.data.data;
}

/** Hồ sơ công khai tra theo đường dẫn chữ (/p/phat-nguyen). */
export async function getPublicProfileBySlug(slug) {
  const response = await httpClient.get(`/profiles/by-slug/${encodeURIComponent(slug)}/public`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Không thể tải hồ sơ.');
  return response.data.data;
}

/** Đổi đường dẫn công khai của chính mình. Trả về slug đã lưu. */
export async function updateMySlug(slug) {
  const response = await httpClient.patch('/profiles/me/slug', { slug });
  if (!response.data?.success) throw new Error(response.data?.message || 'Không thể đổi đường dẫn.');
  return response.data.data.publicSlug;
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

/** Ghi nhận người dùng hiện tại đã đồng ý với một phiên bản văn bản pháp lý. */
export async function acceptLegalConsent(version) {
  const response = await httpClient.post('/me/legal-consent', { version });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể ghi nhận đồng ý.');
  }
  return response.data;
}
