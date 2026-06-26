import { httpClient } from './httpClient.js';

export async function getPremiumConfig() {
  const response = await httpClient.get('/premium/config');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải cấu hình dịch vụ.');
  }
  return response.data.data;
}

export async function boostApplication(applicationId, applicationType = 'JOB') {
  const response = await httpClient.post('/premium/boost', null, {
    params: { applicationId, applicationType },
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Đẩy tin nổi bật thất bại.');
  }
  return response.data.data;
}

export async function unlockInsight(targetId, applicationType = 'JOB') {
  const response = await httpClient.post('/premium/insight/unlock', null, {
    params: { targetId, applicationType },
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Mở khóa Insight thất bại.');
  }
  return response.data.data;
}

export async function getInsight(targetId, applicationType = 'JOB') {
  const response = await httpClient.get(`/premium/insight/${targetId}`, {
    params: { applicationType },
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải phân tích ứng viên.');
  }
  return response.data.data;
}

export async function requestExpressVerification(experienceId) {
  const response = await httpClient.post(`/premium/express?experienceId=${experienceId}`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Đăng ký duyệt nhanh thất bại.');
  }
  return response.data.data;
}

export async function unlockTheme() {
  const response = await httpClient.post('/premium/theme/unlock');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Mở khóa giao diện thất bại.');
  }
  return response.data.data;
}

export async function selectTheme(theme) {
  const response = await httpClient.post('/premium/theme/select', { theme });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Chọn giao diện thất bại.');
  }
  return response.data.data;
}

export async function subscribeJobMatchAlert() {
  const response = await httpClient.post('/premium/match-alert/subscribe');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Đăng ký nhận thông báo thất bại.');
  }
  return response.data.data;
}

export async function getPersonalizedRecommendations() {
  const response = await httpClient.get('/premium/recommendations');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách gợi ý cá nhân hóa.');
  }
  return response.data.data;
}
