import { httpClient } from './httpClient.js';

export async function applyToJob(jobId, coverNote = '') {
  const response = await httpClient.post(`/jobs/${jobId}/apply`, { coverNote });
  if (!response.data?.success) {
    const err = new Error(response.data?.message || 'Ứng tuyển thất bại.');
    err.errorCode = response.data?.errorCode || null;
    throw err;
  }
  return response.data.data;
}

export async function getMyApplications() {
  const response = await httpClient.get('/me/applications');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách ứng tuyển.');
  }
  return response.data.data;
}
