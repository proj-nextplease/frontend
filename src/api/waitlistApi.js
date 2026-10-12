import { httpClient } from './httpClient.js';

/**
 * Đăng ký danh sách chờ Early Access.
 *
 * Gửi thẳng về backend của mình chứ không qua dịch vụ form bên ngoài: dữ liệu
 * nằm cùng chỗ với phần còn lại của hệ thống, truy vấn được bằng SQL, không
 * giới hạn số lượt, và khi hỏng thì đọc được log. Xem V59__waitlist_signups.sql.
 */
export async function joinWaitlist(payload) {
  let response;
  try {
    response = await httpClient.post('/waitlist', payload);
  } catch (err) {
    /* Phân biệt "máy chủ từ chối" với "không tới được máy chủ". Interceptor
       chung trả về thông điệp tiếng Anh dùng cho màn hình nội bộ; đây là
       trang công khai cho người lạ, lỗi phải đọc được và nói rõ nên làm gì. */
    const status = err?.response?.status;
    if (!err?.response) {
      throw new Error('Không kết nối được tới máy chủ. Bạn kiểm tra mạng rồi gửi lại giúp mình.');
    }
    if (status >= 500) {
      throw new Error('Máy chủ đang trục trặc. Bạn thử lại sau ít phút giúp mình nhé.');
    }
    throw new Error(err.response?.data?.message || 'Không gửi được đăng ký.');
  }

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không gửi được đăng ký.');
  }
  return response.data.data;
}

/** Số người đã trong danh sách. Lỗi thì trả null — đây chỉ là con số trang trí. */
export async function getWaitlistCount() {
  try {
    const response = await httpClient.get('/waitlist/count');
    return response.data?.data?.total ?? null;
  } catch {
    return null;
  }
}
