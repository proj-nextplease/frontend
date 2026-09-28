import React from 'react';
import logoland2 from '../assets/logoland2.png';

/**
 * BrandWordmark — Typography Logo chính thức của NextPlease từ file logoland2.png.
 * 
 * - Hình ảnh độ phân giải cao 2400x888 sắc nét logo `nextplease:`.
 * - Nền trong suốt với hiệu ứng neon glow cao cấp.
 */
export function BrandWordmark({
  size = '42px',
  height,
  width,
  glow = true,
  className = '',
  style = {},
  ...props
}) {
  const isAuto = size === 'auto' || height === 'auto';
  const finalHeight = height || size;
  const heightStyle = typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight;
  const widthStyle = width || (isAuto ? '100%' : 'auto');

  return (
    <img
      src={logoland2}
      alt="nextplease:"
      className={`np-brand-wordmark ${className}`.trim()}
      style={{
        height: isAuto ? 'auto' : heightStyle,
        width: widthStyle,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        filter: glow
          ? 'drop-shadow(0 0 16px rgba(185, 255, 0, 0.45)) drop-shadow(0 0 36px rgba(45, 212, 191, 0.25))'
          : 'none',
        ...style,
      }}
      {...props}
    />
  );
}

export default BrandWordmark;
