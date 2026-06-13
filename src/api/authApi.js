import { httpClient } from './httpClient.js';

export async function loginCandidate(email, password) {
  const response = await httpClient.post('/auth/login', { email, password });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Đăng nhập thất bại.');
  }
  return response.data.data;
}
