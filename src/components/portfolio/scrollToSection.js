/**
 * Cuộn tới một khối trong trang portfolio.
 *
 * Phải tìm khối trong CHÍNH document đang chứa trang, không phải `document`
 * toàn cục: ở trang sửa portfolio, bản xem trước được cắm vào một iframe
 * (PreviewFrame) qua portal. `document.getElementById` ở đó tìm trong trang
 * sửa, không thấy khối nào, và các nút trên thanh điều hướng bấm không đi
 * đâu cả. Cũng vì thế mà không dùng `<a href="#id">`: trong iframe đó, đổi
 * hash là điều hướng cả iframe sang một URL khác.
 *
 * Cuộn cửa sổ của document đó thay vì `scrollIntoView`, vì `scrollIntoView`
 * cuộn luôn cả trang cha để đưa iframe vào tầm nhìn — trang sửa giật lên giật
 * xuống mỗi lần bấm.
 *
 * @param {Element|null} from một phần tử bất kỳ nằm trong trang portfolio
 * @param {string} id id của khối cần tới
 * @returns {boolean} true nếu tìm thấy khối
 */
export function scrollToSection(from, id) {
  const doc = from?.ownerDocument || document;
  const target = doc.getElementById(id);
  if (!target) return false;
  const win = doc.defaultView || window;
  const top = target.getBoundingClientRect().top + win.scrollY;
  win.scrollTo({ top, behavior: 'smooth' });
  return true;
}
