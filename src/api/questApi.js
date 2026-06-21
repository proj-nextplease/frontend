import { httpClient } from './httpClient.js';

export async function searchQuests(keyword = '', category = '') {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (category) params.category = category;
  const response = await httpClient.get('/quests', { params });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách Quest.');
  }
  return response.data.data || [];
}

export async function applyToQuest(questId, coverNote = '') {
  const response = await httpClient.post(`/quests/${questId}/apply`, { coverNote });
  if (!response.data?.success) {
    const err = new Error(response.data?.message || 'Ứng tuyển Quest thất bại.');
    err.errorCode = response.data?.errorCode || null;
    throw err;
  }
  return response.data.data;
}

export async function getMyQuestApplications() {
  const response = await httpClient.get('/me/quest-applications');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải đơn Quest.');
  }
  return response.data.data || [];
}

export async function createQuest(questData) {
  const response = await httpClient.post('/organizer/quests', questData);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Tạo Quest thất bại.');
  }
  return response.data.data;
}

export async function getOrganizerQuests() {
  const response = await httpClient.get('/organizer/quests');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải Quest.');
  }
  return response.data.data || [];
}

export async function getQuestApplicants(questId) {
  const response = await httpClient.get(`/organizer/quests/${questId}/applications`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách ứng viên Quest.');
  }
  return response.data.data || [];
}

export async function getOrganizerQuestById(questId) {
  const response = await httpClient.get(`/organizer/quests/${questId}`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Không thể tải Quest.');
  return response.data.data;
}

export async function updateQuest(questId, questData) {
  const response = await httpClient.put(`/organizer/quests/${questId}`, questData);
  if (!response.data?.success) throw new Error(response.data?.message || 'Cập nhật Quest thất bại.');
  return response.data.data;
}

export async function withdrawQuestApplication(applicationId) {
  const response = await httpClient.patch(`/me/quest-applications/${applicationId}/withdraw`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Rút đơn thất bại.');
  return response.data.data;
}

export async function closeQuest(questId) {
  const response = await httpClient.patch(`/organizer/quests/${questId}/close`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Đóng Quest thất bại.');
  return response.data.data;
}

export async function deleteQuest(questId) {
  const response = await httpClient.delete(`/organizer/quests/${questId}`);
  if (!response.data?.success) throw new Error(response.data?.message || 'Xoá Quest thất bại.');
  return response.data.data;
}

export async function updateQuestApplicationStatus(applicationId, status, rejectReason = '') {
  const response = await httpClient.patch(`/organizer/quest-applications/${applicationId}/status`, {
    status,
    rejectReason,
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Cập nhật trạng thái thất bại.');
  }
  return response.data.data;
}
