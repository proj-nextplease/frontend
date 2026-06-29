import { httpClient } from './httpClient.js';

/** Streak + level progress + today's daily/weekly quests. */
export async function getGamification() {
  const response = await httpClient.get('/me/gamification');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải tiến trình.');
  }
  return response.data.data;
}

/** Mark the user active today (rolls the streak + completes daily login quest). */
export async function pingGamification() {
  const response = await httpClient.post('/me/gamification/ping');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể cập nhật streak.');
  }
  return response.data.data;
}

/** Advance quests tied to an activity, e.g. VIEW_OPPORTUNITY, APPLY, SUBMIT_PROOF. */
export async function recordGamificationEvent(event, amount = 1) {
  const response = await httpClient.post('/me/gamification/events', { event, amount });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể ghi nhận hoạt động.');
  }
  return response.data.data;
}

/** Claim the EXP reward of a completed quest. scope = 'DAILY' | 'WEEKLY'. */
export async function claimQuest(scope, key) {
  const response = await httpClient.post(`/me/gamification/quests/${scope}/${key}/claim`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Nhận thưởng thất bại.');
  }
  return response.data.data;
}
