import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { getPayOsTopUpStatus } from '../api/walletApi.js';

/*
 * Tên ngân hàng theo mã BIN. PayOS chỉ trả con số; hiện "970422" cho người
 * dùng thì vô nghĩa. Danh sách ngắn — chỉ các ngân hàng hay gặp — và luôn có
 * đường lùi về chính con số nếu không khớp, để không bao giờ hiện ô trống.
 */
const BANK_NAMES = {
  970422: 'MB Bank',
  970415: 'VietinBank',
  970436: 'Vietcombank',
  970418: 'BIDV',
  970405: 'Agribank',
  970407: 'Techcombank',
  970416: 'ACB',
  970432: 'VPBank',
  970423: 'TPBank',
  970403: 'Sacombank',
  970441: 'VIB',
  970437: 'HDBank',
  970443: 'SHB',
  970429: 'SCB',
  970448: 'OCB',
  970426: 'MSB',
};

/* PayOS đặt hạn 15 phút cho đơn; backend cũng ghi expires_at cùng mốc đó. */
const EXPIRY_SECONDS = 15 * 60;

function CopyField({ label, value, mono }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Trình duyệt chặn clipboard (thường vì trang không chạy HTTPS).
         Không báo lỗi — số vẫn hiện rõ để gõ tay. */
    }
  }

  return (
    <div className="np-payos-field">
      <span className="np-payos-field-label">{label}</span>
      <div className="np-payos-field-row">
        <span className={`np-payos-field-value${mono ? ' is-mono' : ''}`}>{value}</span>
        <button type="button" className="np-payos-copy" onClick={copy} title={`Sao chép ${label.toLowerCase()}`}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

/**
 * Màn thanh toán dựng ngay trong app, thay cho trang checkout của PayOS.
 *
 * Vì sao không dùng trang của họ: giao diện đó không sửa được, và nút "Huỷ"
 * trên đó điều hướng theo ý họ — người dùng rời site rồi quay lại bằng một URL
 * mà mình không kiểm soát. Dựng ở đây thì người dùng không bao giờ rời trang,
 * nên không có trạng thái "quay về nửa chừng" để mắc kẹt.
 *
 * `qrCode` PayOS trả về là chuỗi VietQR thô, không phải ảnh — tự vẽ bằng thư
 * viện qrcode. Vẫn giữ checkoutUrl làm đường lùi cho trường hợp PayOS đổi API
 * và không còn trả qrCode.
 */
export function PayOsCheckout({ payment, onCancel, onPaid, onExpired }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  /* Mốc hết hạn tính một lần lúc mở màn. Đếm lùi theo đồng hồ thật chứ không
     theo số lần interval chạy: trình duyệt bóp interval ở tab nền, đếm bằng
     biến thì tab để lâu sẽ báo sai giờ. Component được gắn key={orderCode} nên
     đổi đơn là mount mới, không cần đặt lại. */
  const [deadline] = useState(() => Date.now() + EXPIRY_SECONDS * 1000);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [pollError, setPollError] = useState('');
  const onPaidRef = useRef(onPaid);
  const onExpiredRef = useRef(onExpired);
  useEffect(() => { onPaidRef.current = onPaid; onExpiredRef.current = onExpired; });

  const amount = Number(payment?.amountVnd || 0);
  const bankName = BANK_NAMES[Number(payment?.bin)] || `Ngân hàng ${payment?.bin || ''}`.trim();

  // Vẽ mã QR
  useEffect(() => {
    if (!payment?.qrCode) return;
    let cancelled = false;
    QRCode.toDataURL(payment.qrCode, {
      width: 460,
      margin: 1,
      errorCorrectionLevel: 'M',
      /* QR phải là đen trên trắng. Tô theo màu nhấn của trang cho "hợp tông"
         là cách nhanh nhất để camera app ngân hàng không đọc được. */
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(url => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { /* không vẽ được thì phần chuyển khoản thủ công vẫn đủ dùng */ });
    return () => { cancelled = true; };
  }, [payment?.qrCode]);

  // Đếm ngược tới hạn đơn
  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(id);
        onExpiredRef.current?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  /*
   * Hỏi backend xem webhook đã cộng tiền chưa.
   *
   * Mỗi 3 giây, dừng hẳn khi hết hạn. Đây là cách duy nhất màn này biết người
   * dùng đã chuyển khoản: việc chuyển tiền xảy ra trong app ngân hàng, trang
   * này không hề hay biết.
   */
  useEffect(() => {
    const orderCode = payment?.orderCode;
    if (!orderCode) return;
    let cancelled = false;

    async function tick() {
      try {
        const status = await getPayOsTopUpStatus(orderCode);
        if (cancelled) return;
        setPollError('');
        if (status.status === 'PAID') {
          clearInterval(id);
          onPaidRef.current?.(status);
        } else if (['CANCELLED', 'FAILED', 'EXPIRED'].includes(status.status)) {
          clearInterval(id);
          onExpiredRef.current?.();
        }
      } catch (err) {
        if (cancelled) return;
        /* Mạng chập chờn không phải lý do để bỏ cuộc — tiền có thể đã chuyển
           rồi. Báo nhẹ và vẫn hỏi tiếp. */
        setPollError(err.message || 'Mất kết nối khi kiểm tra thanh toán.');
      }
    }

    const id = setInterval(tick, 3000);
    tick();
    return () => { cancelled = true; clearInterval(id); };
  }, [payment?.orderCode]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const expired = secondsLeft === 0;

  return (
    <div className="np-payos">
      <div className="np-payos-amount">
        <span className="np-payos-amount-label">Số tiền cần chuyển</span>
        <strong className="np-payos-amount-value">{amount.toLocaleString('vi-VN')}<span> đ</span></strong>
        <span className={`np-payos-timer${expired ? ' is-expired' : ''}`}>
          {expired ? 'Đơn đã hết hạn' : `Còn ${mm}:${ss}`}
        </span>
      </div>

      <div className="np-payos-grid">
        <div className="np-payos-qr">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Mã VietQR để thanh toán" />
          ) : (
            <div className="np-payos-qr-empty">Đang tạo mã QR…</div>
          )}
          <span className="np-payos-qr-hint">Mở app ngân hàng và quét mã</span>
        </div>

        <div className="np-payos-details">
          <p className="np-payos-details-intro">Hoặc chuyển khoản thủ công:</p>
          <CopyField label="Ngân hàng" value={bankName} />
          <CopyField label="Số tài khoản" value={payment?.accountNumber} mono />
          <CopyField label="Chủ tài khoản" value={payment?.accountName} />
          <CopyField label="Nội dung" value={payment?.description} mono />
          <p className="np-payos-warn">
            Giữ nguyên nội dung chuyển khoản — đó là thứ giúp hệ thống nhận ra
            khoản tiền này là của bạn.
          </p>
        </div>
      </div>

      <div className="np-payos-status">
        <span className="np-payos-pulse" />
        Đang chờ bạn chuyển khoản — NP vào ví ngay khi nhận được tiền, không cần bấm gì thêm.
      </div>
      {pollError && <p className="np-payos-poll-error">{pollError}</p>}

      <div className="np-payos-actions">
        <button type="button" className="button secondary-button" onClick={onCancel} style={{ flex: 1 }}>
          Huỷ thanh toán
        </button>
        {payment?.checkoutUrl && (
          <a className="np-payos-fallback" href={payment.checkoutUrl} target="_blank" rel="noreferrer">
            Mở trang PayOS <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
