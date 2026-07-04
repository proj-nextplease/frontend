import { httpClient } from './httpClient.js';

export async function requestCandidateRegistrationOtp(payload) {
  const response = await httpClient.post('/auth/candidates/register/request-otp', payload);
  return unwrapApiResponse(response.data);
}

export async function verifyCandidateRegistrationOtp(payload) {
  const response = await httpClient.post('/auth/candidates/register/verify-otp', payload);
  return unwrapApiResponse(response.data);
}

function unwrapApiResponse(apiResponse) {
  if (!apiResponse?.success) {
    throw new Error(apiResponse?.message || 'Không thể xử lý yêu cầu đăng ký ứng viên.');
  }

  return apiResponse.data;
}