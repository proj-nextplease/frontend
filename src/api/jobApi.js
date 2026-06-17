import { httpClient } from './httpClient.js';

export async function getJobs(filters = {}) {
  const response = await httpClient.get('/jobs', { params: filters });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách tin tuyển dụng.');
  }
  return response.data.data;
}

export async function getJobDetail(id) {
  const response = await httpClient.get(`/jobs/${id}`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải chi tiết tin tuyển dụng.');
  }
  return response.data.data;
}

export async function getOrganizerJobs() {
  const response = await httpClient.get('/organizer/jobs');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách tin đã đăng.');
  }
  return response.data.data;
}

export async function createJob(data) {
  const response = await httpClient.post('/organizer/jobs', data);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Đăng tin tuyển dụng thất bại.');
  }
  return response.data.data;
}

export async function updateJob(id, data) {
  const response = await httpClient.put(`/organizer/jobs/${id}`, data);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Cập nhật tin tuyển dụng thất bại.');
  }
  return response.data.data;
}

export async function getSkills() {
  const response = await httpClient.get('/skills');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách kỹ năng.');
  }
  return response.data.data;
}

export async function getCompanies() {
  const response = await httpClient.get('/companies');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách đối tác.');
  }
  return response.data.data;
}

export async function getCompanyDetail(id) {
  const response = await httpClient.get(`/companies/${id}`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải chi tiết đối tác.');
  }
  return response.data.data;
}
