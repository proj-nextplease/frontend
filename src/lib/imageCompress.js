/**
 * Nén ảnh phía trình duyệt trước khi lưu dưới dạng data URL.
 *
 * Ảnh đang được lưu thẳng vào Postgres (base64), nên mỗi lần API trả danh
 * sách có ảnh là tốn egress Supabase. Thu nhỏ về cạnh dài tối đa `maxDim` và
 * mã hoá JPEG/WebP giúp ảnh chụp điện thoại 3–8 MB còn khoảng 150–400 KB.
 *
 * An toàn: GIF/SVG, tệp không phải ảnh, hoặc khi nén bị lỗi / không nhỏ hơn
 * thì trả về data URL gốc — hành vi y như FileReader.readAsDataURL cũ.
 */

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function fileToCompressedDataUrl(file, { maxDim = 1600, quality = 0.82 } = {}) {
  const original = await readAsDataUrl(file);
  const type = (file?.type || '').toLowerCase();
  if (!type.startsWith('image/') || type === 'image/gif' || type === 'image/svg+xml') {
    return original;
  }
  try {
    const img = await loadImage(original);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return original;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    // PNG có thể có nền trong suốt (logo) → giữ trong suốt bằng WebP;
    // các loại còn lại dùng JPEG.
    const keepAlpha = type === 'image/png' || type === 'image/webp';
    if (!keepAlpha) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tw, th);
    }
    ctx.drawImage(img, 0, 0, tw, th);
    let out = canvas.toDataURL(keepAlpha ? 'image/webp' : 'image/jpeg', quality);
    // Trình duyệt không hỗ trợ WebP sẽ trả PNG — có thể còn to hơn.
    if (!out || out.length >= original.length) return original;
    return out;
  } catch {
    return original;
  }
}
