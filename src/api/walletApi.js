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
