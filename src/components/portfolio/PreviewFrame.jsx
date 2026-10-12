import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Một "cửa sổ trình duyệt ảo" để xem trước trang portfolio.
 *
 * Vì sao phải là iframe chứ không phải một div thu nhỏ bằng transform:
 *
 *  1. `.vp-page` (và vài chỗ khác trong trang hồ sơ) khai `width: 100vw`,
 *     `margin-left: calc(50% - 50vw)`, `padding: max(18px, (100vw - 980px)/2)`.
 *     `transform: scale()` KHÔNG đổi ý nghĩa của `vw` — nó vẫn là cửa sổ thật.
 *     Ở màn 2000px, nội dung tự dựng mình rộng 2000px rồi tự đẩy sang trái
 *     360px bên trong một cái hộp 1280px: cắt mép trái, chừa khoảng chết mép
 *     phải. Trong iframe, `vw` là bề ngang của chính iframe.
 *
 *  2. Trình dựng định nghĩa lại cả loạt token toàn cục (`--ink`, `--card-bg`,
 *     `--muted`…) sang hệ tối. Mọi thứ render bên trong nó đều thừa kế, nên
 *     theme nền sáng xem trước ra màu sai. Iframe là một cây document khác,
 *     không có đường thừa kế nào.
 *
 *  3. `position: fixed` bên trong trang hồ sơ hành xử đúng như trên một trang
 *     thật, thay vì bị cái transform của khung bẻ thành một kiểu khác.
 *
 * Iframe to bằng đúng khoang chứa, không thu nhỏ: nhờ vậy `vw` bên trong
 * khớp với bề ngang thật mà trang đang được xem, nên bản responsive hiện ra
 * đúng như người xem sẽ gặp.
 */
export function PreviewFrame({ children, bodyClassName = '', onReady }) {
  const frameRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  /* about:blank nạp bất đồng bộ, và ở Safari nó có thể đã sẵn sàng trước khi
     onLoad kịp gắn — nên kiểm tra cả hai đường. */
  const attach = () => {
    const frame = frameRef.current;
    let doc = frame?.contentDocument;
    if (!doc) return;

    /* about:blank KHÔNG có doctype, nên document chạy ở quirks mode. Ở chế độ
       đó `document.scrollingElement` là <body> và `documentElement.clientHeight`
       trả về chiều cao toàn bộ nội dung thay vì chiều cao khung nhìn — mọi
       phép tính cuộn đều sai, và cuộn tới khối đang sửa đi lệch hẳn. Viết một
       khung HTML có doctype để document ở standards mode. */
    if (!doc.doctype) {
      doc.open();
      doc.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
      doc.close();
      doc = frame.contentDocument;
    }
    if (!doc.body) return;

    doc.body.className = bodyClassName;
    setMountNode(doc.body);
    /* Báo ra cửa sổ con SAU khi đã ghi doctype: `document.open()` thay cả
       document, nên listener gắn trước đó bị dọn sạch. */
    onReady?.(frame.contentWindow);
  };

  useEffect(() => {
    attach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Chép CSS của trang cha sang iframe, và theo dõi tiếp: ở chế độ dev, Vite
     tiêm từng thẻ <style> một và thay chúng mỗi lần HMR, nên chép một lần là
     khung xem trước đứng hình ở phiên bản CSS cũ. */
  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc || !mountNode) return undefined;

    const sync = () => {
      const head = doc.head;
      const wanted = document.querySelectorAll('style, link[rel="stylesheet"]');
      head.querySelectorAll('[data-pf-copied]').forEach((n) => n.remove());
      wanted.forEach((node) => {
        const copy = node.cloneNode(true);
        copy.setAttribute('data-pf-copied', '');
        head.appendChild(copy);
      });

      /* Chép CSS toàn cục sang cũng chép luôn mấy luật dựng khung cho CỬA SỔ
         app — `body { overflow: hidden auto }` chẳng hạn. Trong iframe, nó
         biến <body> thành một khoang cuộn lồng bên trong khoang cuộn của cửa
         sổ: `scrollTo` chỉ đi được một phần đường, và đồng bộ cuộn sai chỗ.
         Trả <html>/<body> về mặc định, và đặt cuối cùng để thắng mọi luật
         vừa chép. */
      const reset = doc.createElement('style');
      reset.setAttribute('data-pf-copied', '');
      reset.textContent = `
        html, body {
          width: auto !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          background: transparent !important;
        }
      `;
      head.appendChild(reset);
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [mountNode]);

  return (
    <iframe
      ref={frameRef}
      onLoad={attach}
      title="Xem trước portfolio"
      /* allow-same-origin để React cắm cây DOM vào được; KHÔNG có allow-scripts
         hay allow-top-navigation, nên bấm nhầm một liên kết trong bản xem
         trước không kéo người dùng đi đâu cả. */
      sandbox="allow-same-origin"
      className="pf-frame"
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}
