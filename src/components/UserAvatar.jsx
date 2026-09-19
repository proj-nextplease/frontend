import { useState } from 'react';

/**
 * Avatar tròn của một người dùng.
 *
 * Có ảnh thì hiện ảnh, không thì hiện chữ cái đầu của tên trên nền gradient.
 * Ảnh hỏng giữa chừng cũng lùi về chữ cái, nên không bao giờ để lại ô vỡ.
 */
export function UserAvatar({ src, name, size = 34, background, style }) {
  // Lưu chính URL bị hỏng (thay vì cờ boolean) để khi đổi sang ảnh khác thì tự
  // động thử lại — không cần effect reset state.
  const [brokenSrc, setBrokenSrc] = useState(null);
  const broken = Boolean(src) && brokenSrc === src;

  const initial = (String(name || '').trim().charAt(0) || 'N').toUpperCase();
  const base = {
    width: size,
    height: size,
    flex: 'none',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name || 'Ảnh đại diện'}
        style={base}
        // googleusercontent chặn hotlink nếu request kèm referrer.
        referrerPolicy="no-referrer"
        onError={() => setBrokenSrc(src)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        ...base,
        background: background || 'linear-gradient(135deg, #10b981, #0d9488)',
        color: '#fff',
        fontWeight: 800,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initial}
    </span>
  );
}
