import { httpClient } from './httpClient.js';

/** Diễn đàn Thảo Luận. GET đọc được khi chưa đăng nhập; thao tác ghi cần token. */

function unwrap(response, fallbackMessage) {
  if (!response.data?.success) {
    throw new Error(response.data?.message || fallbackMessage);
  }
  return response.data.data;
}

export async function getTopics() {
  return unwrap(await httpClient.get('/discussions/topics'), 'Không thể tải danh sách chủ đề.');
}

export async function toggleFollowTopic(topicId) {
  return unwrap(
    await httpClient.post(`/discussions/topics/${topicId}/follow`),
    'Không thể cập nhật theo dõi chủ đề.',
  );
}

export async function getPosts({ topic, sort, limit = 20, offset = 0 } = {}) {
  return unwrap(
    await httpClient.get('/discussions/posts', { params: { topic, sort, limit, offset } }),
    'Không thể tải bài viết thảo luận.',
  );
}

export async function createPost(data) {
  return unwrap(await httpClient.post('/discussions/posts', data), 'Đăng bài thất bại.');
}

export async function deletePost(postId) {
  return unwrap(await httpClient.delete(`/discussions/posts/${postId}`), 'Xoá bài viết thất bại.');
}

export async function toggleLikePost(postId) {
  return unwrap(await httpClient.post(`/discussions/posts/${postId}/like`), 'Không thể cập nhật lượt thích.');
}

export async function votePoll(postId, optionId) {
  return unwrap(
    await httpClient.post(`/discussions/posts/${postId}/vote`, { optionId }),
    'Bình chọn thất bại.',
  );
}

export async function getComments(postId) {
  return unwrap(await httpClient.get(`/discussions/posts/${postId}/comments`), 'Không thể tải bình luận.');
}

export async function addComment(postId, content) {
  return unwrap(
    await httpClient.post(`/discussions/posts/${postId}/comments`, { content }),
    'Gửi bình luận thất bại.',
  );
}
