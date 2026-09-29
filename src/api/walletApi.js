import { httpClient } from './httpClient.js';

export async function getWallet() {
  const response = await httpClient.get('/wallet');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể tải thông tin ví.');
  }
  return response.data.data;
}

export async function topUp(amountVnd) {
  const response = await httpClient.post('/wallet/topup', { amountVnd });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Nạp NP thất bại.');
  }
  return response.data.data;
}

export async function buyPremium() {
  const response = await httpClient.post('/wallet/subscribe');
  if (!response.data?.success) {
    const err = new Error(response.data?.message || 'Mua Premium thất bại.');
    err.errorCode = response.data?.errorCode || null;
    throw err;
  }
  return response.data.data;
}

/*
 * ── Nạp tiền thật qua PayOS ──
 *
 * topUp() ở trên là bản demo cộng NP ngay lập tức. Trên production backend đã
 * khoá nó (trả 410) — dùng hai hàm dưới đây.
 */

/**
 * Tạo yêu cầu nạp và lấy thông tin thanh toán PayOS. CHƯA cộng NP.
 *
 * Trả { orderCode, amountVnd, checkoutUrl, qrCode, accountNumber, accountName,
 * bin, description }. `qrCode` là chuỗi VietQR thô — webapp tự vẽ thành mã QR
 * để người dùng không phải rời khỏi site.
 */
export async function createPayOsTopUp(amountVnd) {
  const response = await httpClient.post('/payments/payos/create', { amountVnd });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không tạo được link thanh toán.');
  }
  return response.data.data;
}

/**
 * Hỏi trạng thái một yêu cầu nạp. Trả { status, amountVnd, paidAt }.
 *
 * Đây là NGUỒN SỰ THẬT duy nhất cho việc "đã trả tiền chưa". Người dùng quay
 * về returnUrl không chứng minh được gì: đó là URL trong trình duyệt của họ,
 * gõ tay hay bookmark lại đều được. Chỉ webhook mới đổi status sang PAID.
 */
export async function getPayOsTopUpStatus(orderCode) {
  const response = await httpClient.get('/payments/payos/status', { params: { orderCode } });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không kiểm tra được trạng thái nạp.');
  }
  return response.data.data;
}

/**
 * Huỷ một đơn nạp đang chờ.
 *
 * Backend chỉ huỷ khi đơn còn PENDING. Nếu người dùng đã chuyển khoản xong rồi
 * mới bấm huỷ thì đơn đã PAID và lệnh này không đụng tới — tiền vẫn vào ví.
 */
export async function cancelPayOsTopUp(orderCode) {
  const response = await httpClient.post('/payments/payos/cancel', { orderCode });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không huỷ được yêu cầu nạp.');
  }
  return response.data.data;
}
