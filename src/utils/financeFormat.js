/* Định dạng số tiền cho trang admin. 1 NP = 1 đồng nên dùng chung một cách viết. */

const nf = new Intl.NumberFormat('vi-VN');

export function formatVnd(value) {
  const n = Number(value) || 0;
  return `${nf.format(n)}đ`;
}

export function formatNp(value) {
  const n = Number(value) || 0;
  return `${nf.format(n)} NP`;
}
