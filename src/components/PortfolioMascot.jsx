import { Mascot } from 'page-mascot';
import { mascotSheets, resolveMascot } from '../lib/mascots.js';

/**
 * Linh vật của một hồ sơ, đọc thẳng từ `avatar` đã lưu.
 *
 * Một chỗ duy nhất biết cách đi từ avatar_config sang cặp sprite sheet, để ba
 * nơi hiển thị (trình dựng, hộ chiếu ở Tổng quan, trang portfolio công khai)
 * không mỗi nơi tự suy luận một kiểu.
 *
 * Linh vật bám theo con trỏ — page-mascot tự tắt việc đó khi thiết bị không có
 * con trỏ chính xác, và tôn trọng prefers-reduced-motion khi bị bấm.
 */
export function PortfolioMascot({ avatar, size = 180, label, className }) {
  const id = resolveMascot(avatar);
  const { directions, reactions } = mascotSheets(id);

  return (
    <Mascot
      directions={directions}
      reactions={reactions}
      size={size}
      label={label || 'Linh vật hồ sơ'}
      className={className}
    />
  );
}
