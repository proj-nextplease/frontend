import { useEffect, useRef, useState } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { TERMS_DOC, PRIVACY_DOC } from '../lib/legalDocuments.js';

/**
 * Hộp thoại buộc đọc hết hai văn bản pháp lý trước khi tạo tài khoản.
 *
 * Cách hoạt động: hai thẻ (Điều khoản / Chính sách), mỗi thẻ là một khung
 * cuộn riêng. Chỉ khi khung cuộn chạm đáy thì thẻ đó mới được đánh dấu là đã
 * đọc. Nút đồng ý mở khoá khi CẢ HAI đã đọc.
 *
 * Vì sao hai khung tách rời chứ không gộp một khung dài: gộp lại thì thanh
 * cuộn dài gấp đôi và người dùng không biết mình đang ở đâu trong hai văn bản
 * khác nhau. Tách ra thì mỗi thẻ có đích riêng, và nhãn "đã đọc" cho thấy tiến
 * độ thật.
 *
 * MỘT GIỚI HẠN CẦN BIẾT: cuộn tới đáy KHÔNG chứng minh người dùng đã đọc. Nó
 * chỉ chứng minh họ đã kéo thanh cuộn. Thứ làm sự đồng ý có sức nặng là bản
 * ghi phía server: ai đồng ý, với LEGAL_VERSION nào, lúc nào. Hiện chưa có.
 */

const DOCS = [TERMS_DOC, PRIVACY_DOC];

function DocPane({ doc, read, onRead }) {
  const ref = useRef(null);

  /* Kiểm tra ngay khi gắn: văn bản ngắn hoặc màn hình cao thì khung không hề
     cuộn được, và nếu chỉ nghe sự kiện scroll thì nút sẽ khoá vĩnh viễn. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const check = () => {
      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
      if (atEnd) onRead();
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [onRead]);

  return (
    <div className="np-consent-pane">
      <div className="np-consent-pane-head">
        <h3>{doc.title}</h3>
        <span className={read ? 'np-consent-flag done' : 'np-consent-flag'}>
          {read ? <><Check size={13} /> Đã đọc</> : 'Cuộn tới cuối'}
        </span>
      </div>

      <div className="np-consent-scroll" ref={ref} tabIndex={0}>
        <p className="np-consent-intro">{doc.intro}</p>
        {doc.sections.map((s, i) => (
          <section key={s.id}>
            <h4><span>{String(i + 1).padStart(2, '0')}</span>{s.h}</h4>
            {s.p.map((item, pIdx) => {
              if (typeof item === 'string') return <p key={pIdx}>{item}</p>;
              if (item.list) {
                return <ul key={pIdx}>{item.list.map((li, l) => <li key={l}>{li}</li>)}</ul>;
              }
              return null;
            })}
          </section>
        ))}
        <p className="np-consent-end">— Hết {doc.title.toLowerCase()} —</p>
      </div>

      <a className="np-consent-open" href={doc.path} target="_blank" rel="noreferrer">
        Mở ở tab riêng <ExternalLink size={12} />
      </a>
    </div>
  );
}

/* Component này chỉ được GẮN khi cần mở — nơi gọi dùng `{open && <ConsentGate/>}`.
   Nhờ vậy mỗi lần mở là một lần gắn mới, trạng thái "đã đọc" tự về rỗng mà
   không cần effect nào reset. Giữ cờ `open` rồi reset trong effect vừa thừa
   vừa vi phạm quy tắc không gọi setState trong effect. */
export function ConsentGate({ onClose, onAccept, blocking = false, saving = false, error = '' }) {
  const [readKeys, setReadKeys] = useState(() => new Set());
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    // Bản CHẶN không đóng được bằng Escape: đóng được nghĩa là đi tiếp được mà
    // chưa đồng ý, tức cổng không chặn gì cả.
    const onKey = (e) => { if (e.key === 'Escape' && !blocking) onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, blocking]);

  const allRead = DOCS.every((d) => readKeys.has(d.key));

  return (
    <div className="np-consent-overlay" role="dialog" aria-modal="true" aria-label="Điều khoản và chính sách">
      <div className="np-consent-box">
        <header className="np-consent-head">
          <h2>{blocking ? 'Xác nhận điều khoản để tiếp tục' : 'Trước khi tạo tài khoản'}</h2>
          <p>
            {blocking
              ? 'Điều khoản dịch vụ và Chính sách bảo mật đã được cập nhật. Đọc hết hai văn bản dưới đây rồi xác nhận để tiếp tục dùng tài khoản.'
              : 'Đọc hết hai văn bản dưới đây rồi xác nhận. Bạn có thể mở từng văn bản ở tab riêng để đọc kỹ hơn.'}
          </p>
        </header>

        <div className="np-consent-panes">
          {DOCS.map((doc) => (
            <DocPane
              key={doc.key}
              doc={doc}
              read={readKeys.has(doc.key)}
              /* Hàm này đi vào dependency của useEffect bên trong DocPane, nên
                 phải ổn định theo doc.key — dùng cập nhật theo hàm để không
                 phụ thuộc readKeys hiện tại. */
              onRead={() => setReadKeys((prev) => (prev.has(doc.key) ? prev : new Set(prev).add(doc.key)))}
            />
          ))}
        </div>

        <footer className="np-consent-foot">
          <label className={allRead ? 'np-consent-check' : 'np-consent-check is-locked'}>
            <input
              type="checkbox"
              checked={agreed}
              disabled={!allRead}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              Tôi đã đọc và đồng ý với <strong>Điều khoản dịch vụ</strong> và{' '}
              <strong>Chính sách bảo mật</strong>.
              {!allRead && <em> Cuộn hết cả hai văn bản để mở khoá.</em>}
            </span>
          </label>

          <div className="np-consent-actions">
            {error && <span className="np-consent-error" role="alert">{error}</span>}
            <button type="button" className="np-consent-btn" onClick={onClose} disabled={saving}>
              {/* Bản chặn không có "Huỷ": huỷ rồi đi tiếp là cổng vô nghĩa.
                  Lối ra duy nhất còn lại là rời khỏi tài khoản. */}
              {blocking ? 'Đăng xuất' : 'Huỷ'}
            </button>
            <button
              type="button"
              className="np-consent-btn primary"
              disabled={!agreed || saving}
              onClick={onAccept}
            >
              {saving ? 'Đang lưu…' : 'Đồng ý & tiếp tục'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
