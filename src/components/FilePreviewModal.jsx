import { useState } from 'react';
import { ExternalLink, X } from 'lucide-react';

/** Mã tệp Google Drive trong các dạng link hay gặp (file/d/…, ?id=…). */
function driveFileId(url) {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
    || url.match(/drive\.google\.com\/(?:thumbnail|open|uc)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/**
 * Xác định cách hiển thị một nguồn.
 *
 * Trước đây chỉ nhận data URL (ảnh / PDF người dùng tự tải lên). Nhưng ảnh dự
 * án trên portfolio thường là LINK: ảnh thu nhỏ Google Drive của minh chứng,
 * hoặc link ảnh trực tiếp — và mọi link đều rơi vào "Không thể xem trực tiếp
 * định dạng này", kèm một nút "Tải xuống" mang tên dự án.
 */
function classify(src) {
  if (/^data:image\//.test(src)) return { kind: 'image', url: src };
  if (/^data:application\/pdf/.test(src)) return { kind: 'pdf', url: src };
  if (/^https?:\/\//i.test(src)) {
    const id = driveFileId(src);
    if (id) {
      // Ảnh thu nhỏ khổ lớn: hiện được cả ảnh lẫn trang đầu của PDF, và vẫn
      // chạy bên trong khung xem trước (iframe không cho chạy script) — nơi
      // trình xem nhúng của Drive sẽ trắng trơn.
      return {
        kind: 'image',
        url: `https://drive.google.com/thumbnail?id=${id}&sz=w2000`,
        openUrl: `https://drive.google.com/file/d/${id}/view`,
        openLabel: 'Mở bản gốc trên Google Drive',
      };
    }
    if (/\.pdf($|[?#])/i.test(src)) return { kind: 'pdf', url: src, openUrl: src, openLabel: 'Mở trong tab mới' };
    // Link khác: thử như ảnh; không tải được thì chuyển sang nút mở link.
    return { kind: 'image', url: src, openUrl: src, openLabel: 'Mở trong tab mới' };
  }
  return { kind: 'unknown', url: src };
}

// In-app viewer for an image or PDF — a base64 data URL the user uploaded, or a
// link (Google Drive, direct image/PDF URL). Renders inline instead of opening
// a new tab: opening `data:`/blob URLs as a top-level navigation gets blocked
// by popup blockers and falls back to a download.
export function FilePreviewModal({ src, fileName, onClose }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src) return null;

  const view = classify(src);
  const failed = failedSrc === src;
  const showImage = view.kind === 'image' && !failed;
  const showPdf = view.kind === 'pdf';

  return (
    <div className="file-preview-overlay" onClick={onClose}>
      <div className="file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="file-preview-header">
          <span className="file-preview-title">{fileName || 'Xem chi tiết'}</span>
          <button type="button" className="file-preview-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="file-preview-body">
          {showImage && (
            <img
              src={view.url}
              alt={fileName || 'Ảnh minh chứng'}
              referrerPolicy="no-referrer"
              onError={() => setFailedSrc(src)}
            />
          )}
          {showPdf && <iframe src={view.url} title={fileName || 'PDF'} />}
          {!showImage && !showPdf && (
            <div className="file-preview-fallback">
              {view.openUrl ? (
                <>
                  <p>
                    Không xem trước được tệp này ngay trên trang
                    {/drive\.google\.com/.test(view.openUrl) ? ' — có thể tệp trên Google Drive chưa mở quyền "Bất kỳ ai có liên kết".' : '.'}
                  </p>
                  <a href={view.openUrl} target="_blank" rel="noopener noreferrer" className="button primary-button">
                    <ExternalLink size={16} /> {view.openLabel}
                  </a>
                </>
              ) : (
                <>
                  <p>Không thể xem trực tiếp định dạng này.</p>
                  <a href={src} download={fileName || 'file'} className="button primary-button">
                    Tải tệp xuống
                  </a>
                </>
              )}
            </div>
          )}
          {(showImage || showPdf) && view.openUrl && (
            <a href={view.openUrl} target="_blank" rel="noopener noreferrer" className="file-preview-open-link">
              <ExternalLink size={14} /> {view.openLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
