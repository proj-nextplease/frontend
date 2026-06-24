import { X } from 'lucide-react';

// In-app viewer for a base64 data URL (image or PDF). Renders inline instead of
// opening a new tab — opening `data:`/blob URLs as a top-level navigation gets
// blocked by popup blockers and falls back to a download, which is not what the
// user wants when they just click to "view".
export function FilePreviewModal({ src, fileName, onClose }) {
  if (!src) return null;

  const isImage = /^data:image\//.test(src);
  const isPdf = /^data:application\/pdf/.test(src);

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
          {isImage && <img src={src} alt={fileName || 'Ảnh minh chứng'} />}
          {isPdf && <iframe src={src} title={fileName || 'PDF'} />}
          {!isImage && !isPdf && (
            <div className="file-preview-fallback">
              <p>Không thể xem trực tiếp định dạng này.</p>
              <a href={src} download={fileName || 'file'} className="button primary-button">
                Tải xuống {fileName}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
