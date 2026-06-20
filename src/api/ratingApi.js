import { httpClient } from './httpClient.js';

/** Lấy đánh giá hiện có của một đơn (trả null nếu chưa chấm). */
export async function getRating({ applicationId, questApplicationId }) {
  const params = {};
  if (applicationId) params.applicationId = applicationId;
  if (questApplicationId) params.questApplicationId = questApplicationId;
  const response = await httpClient.get('/organizer/ratings', { params });
  if (!response.data?.success) throw new Error(response.data?.message || 'Không thể tải đánh giá.');
  return response.data.data; // có thể là null
}

/** Tạo đánh giá mới cho một đơn đã COMPLETED. */
export async function createRating({ applicationId, questApplicationId, score, comment }) {
  const response = await httpClient.post('/organizer/ratings', {
    applicationId: applicationId || null,
    questApplicationId: questApplicationId || null,
    score,
    comment: comment || null,
  });
  if (!response.data?.success) throw new Error(response.data?.message || 'Gửi đánh giá thất bại.');
  return response.data.data;
}

/** Sửa đánh giá (trong vòng 3 giờ). */
export async function updateRating(ratingId, { score, comment }) {
  const response = await httpClient.put(`/organizer/ratings/${ratingId}`, { score, comment: comment || null });
  if (!response.data?.success) throw new Error(response.data?.message || 'Cập nhật đánh giá thất bại.');
  return response.data.data;
}
