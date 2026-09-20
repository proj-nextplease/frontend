import { useRef, useState } from 'react';
import { ImagePlus, Move, Plus, Minus, Trash2 } from 'lucide-react';
import { parseBanner, serializeBanner } from './postingConstants.js';

const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Chọn và căn ảnh bìa cho portfolio.
 *
 * Ảnh bìa là dải ngang nên phần hiển thị hiếm khi trùng với tâm ảnh — người
 * dùng cần kéo để chọn khung và phóng to. Dùng lại đúng quy ước "x% y% zoom"
 * của banner tin tuyển dụng (parseBanner/serializeBanner) để hai nơi không
 * trôi khỏi nhau.
 *
 * Ảnh lưu dưới dạng data URL, giống banner tin đăng — giới hạn 2MB.
 */
export function CoverBannerEditor({ url, pos, onChange, height = 180 }) {
  const [error, setError] = useState('');
  const dragRef = useRef(null);
  const banner = parseBanner(pos);

  function apply(x, y, z) {
    onChange({ url, pos: serializeBanner(x, y, z) });
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp ảnh.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Ảnh bìa phải nhỏ hơn 2MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange({ url: reader.result, pos: pos || '50% 50%' });
    reader.readAsDataURL(file);
  }

  function onPointerDown(e) {
    if (!url) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      px: banner.x, py: banner.y, z: banner.z,
      w: rect.width, h: rect.height,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d) return;
    const clamp = (n) => Math.max(0, Math.min(100, n));
    // Chia cho zoom để kéo khớp 1:1 với con trỏ ở mọi mức phóng.
    apply(
      clamp(d.px - ((e.clientX - d.startX) / d.w) * 100 / d.z),
      clamp(d.py - ((e.clientY - d.startY) / d.h) * 100 / d.z),
      d.z,
    );
  }

  function onPointerUp(e) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  function zoom(delta) {
    apply(banner.x, banner.y, Math.max(1, Math.min(3, banner.z + delta)));
  }

  const chip = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    borderRadius: 999, border: '1px solid var(--line, #e2e8f0)', background: 'var(--surface, #fff)',
    color: 'var(--ink, #0f172a)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'relative', height, borderRadius: 16, overflow: 'hidden',
          border: '1px dashed var(--line, #cbd5e1)',
          background: url
            ? `url(${url}) ${banner.x}% ${banner.y}% / ${banner.z * 100}% auto no-repeat`
            : 'rgba(255,255,255,0.03)',
          cursor: url ? 'grab' : 'default',
          touchAction: 'none',
        }}
      >
        {!url && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6,
            color: 'var(--muted, #64748b)', fontSize: '0.86rem', fontWeight: 600,
          }}>
            <ImagePlus size={26} />
            Chưa có ảnh bìa
          </div>
        )}
        {url && (
          <div style={{
            position: 'absolute', left: 12, bottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 999, background: 'rgba(15,23,42,0.6)',
            color: '#fff', fontSize: '0.74rem', fontWeight: 700, pointerEvents: 'none',
          }}>
            <Move size={12} /> Kéo để chọn khung hình
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <label style={chip}>
          <ImagePlus size={15} /> {url ? 'Đổi ảnh bìa' : 'Tải ảnh bìa'}
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>

        {url && (
          <>
            <button type="button" onClick={() => zoom(-0.15)} style={chip} title="Thu nhỏ"><Minus size={15} /></button>
            <button type="button" onClick={() => zoom(0.15)} style={chip} title="Phóng to"><Plus size={15} /></button>
            <button
              type="button"
              onClick={() => onChange({ url: '', pos: '50% 50%' })}
              style={{ ...chip, color: '#b91c1c', borderColor: '#fecaca' }}
            >
              <Trash2 size={15} /> Xoá
            </button>
          </>
        )}
      </div>

      {error && <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>{error}</span>}
    </div>
  );
}
