import React from 'react';

/**
 * BrandWordmark — Typography Logo chính thức của NextPlease.
 *
 * Tái hiện 100% vector typography của `logoland`:
 * - Phông chữ tròn hiện đại chuẩn Fredoka / Baloo 2 (font-weight: 800).
 * - Thân chữ "nextplease" mang màu Neon Lime (#B9FF00 / #CCFF00).
 * - Dấu hai chấm ":" mang màu Neon Cyan (#2DD4BF / #00F5D4).
 * - Hiệu ứng ánh sáng neon đa lớp (text-shadow) sắc nét không bị vỡ hạt ở mọi kích thước.
 */
export function BrandWordmark({
  size = '1.75rem',
  glow = true,
  neonLime = '#B9FF00',
  neonCyan = '#2DD4BF',
  className = '',
  style = {},
  hoverEffect = false,
  ...props
}) {
  const isNumber = typeof size === 'number';
  const fontSize = isNumber ? `${size}px` : size;

  const glowStyle = glow
    ? {
        textShadow: `0 0 16px rgba(185, 255, 0, 0.35), 0 0 32px rgba(185, 255, 0, 0.15)`,
      }
    : {};

  const colonGlowStyle = glow
    ? {
        textShadow: `0 0 16px rgba(45, 212, 191, 0.45), 0 0 32px rgba(45, 212, 191, 0.20)`,
      }
    : {};

  return (
    <span
      className={`np-brand-wordmark ${hoverEffect ? 'hoverable' : ''} ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: "'Fredoka', 'Baloo 2', 'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        userSelect: 'none',
        verticalAlign: 'middle',
        ...style,
      }}
      {...props}
    >
      <span
        className="np-word-body"
        style={{
          color: neonLime,
          fontWeight: 800,
          fontStyle: 'normal',
          transition: 'color 0.2s ease, text-shadow 0.2s ease',
          ...glowStyle,
        }}
      >
        nextplease
      </span>
      <span
        className="np-word-colon"
        style={{
          color: neonCyan,
          fontWeight: 800,
          marginLeft: '0.02em',
          transition: 'color 0.2s ease, text-shadow 0.2s ease',
          ...colonGlowStyle,
        }}
      >
        :
      </span>
    </span>
  );
}

export default BrandWordmark;
