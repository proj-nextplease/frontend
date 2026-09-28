import React from 'react';
import logoland1 from '../assets/logoland1.png';

/**
 * BrandWordmark — Typography Logo chính thức của NextPlease từ file logoland1.png.
 * 
 * - Hình ảnh chuẩn sắc nét logo `nextplease:`.
 * - Nền trong suốt với hiệu ứng neon glow cao cấp.
 */
export function BrandWordmark({
  size = '32px',
  height,
  glow = true,
  className = '',
  style = {},
  ...props
}) {
  const finalHeight = height || size;
  const heightStyle = typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight;

  return (
    <img
      src={logoland1}
      alt="nextplease:"
      className={`np-brand-wordmark ${className}`.trim()}
      style={{
        height: heightStyle,
        width: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        filter: glow
          ? 'drop-shadow(0 0 10px rgba(185, 255, 0, 0.35)) drop-shadow(0 0 20px rgba(45, 212, 191, 0.2))'
          : 'none',
        ...style,
      }}
      {...props}
    />
  );
}

export default BrandWordmark;
