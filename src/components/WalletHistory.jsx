import { useState } from 'react';
import { ChevronDown, History } from 'lucide-react';

/*
 * Lịch sử giao dịch NP.
 *
 * Mặc định GẬP LẠI. Đây là thứ người dùng thỉnh thoảng mới cần tra, không
 * phải thứ họ tới tab Premium để xem — trải dài hai mươi dòng ra giữa trang
 * thì nó đẩy chính cái cửa hàng Premium xuống dưới màn hình.
 *
 * Dữ liệu lấy từ chính /wallet (trường `recentTransactions`) — backend đã trả
 * 20 dòng gần nhất từ lâu, web chỉ chưa hiện ra. Không gọi thêm API nào.
 *
 * Bản mobile đã có màn tương đương; nhãn và cách trình bày ở đây bám theo nó
 * để một người dùng cả hai nơi không phải học lại hai lần.
 */

/** Nhãn dự phòng khi giao dịch không có `reason` do backend ghi. */
const TYPE_LABELS = {
  EARN: 'Nhận thưởng',
  REWARD: 'Nhận thưởng',
  SPEND: 'Chi tiêu',
  PURCHASE: 'Chi tiêu',
  TOPUP: 'Nạp NP',
  REFUND: 'Hoàn NP',
  BOOST: 'Đẩy đơn ứng tuyển',
  SUBSCRIPTION: 'Gói trả phí',
  PREMIUM_PURCHASE: 'Mua Premium Pass',
  ITEM_PURCHASE: 'Mua vật phẩm',
  ADJUSTMENT: 'Điều chỉnh',
};

function label(tx) {
  const reason = tx?.reason?.trim();
  if (reason) return reason;
  return TYPE_LABELS[tx?.transaction_type] || 'Giao dịch';
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('vi-VN');
}

export function WalletHistory({ transactions, loading }) {
  const [open, setOpen] = useState(false);
  const rows = Array.isArray(transactions) ? transactions : [];

  return (
    <section className="np-wallet-history">
      <button
        type="button"
        className={`np-wallet-history-toggle${open ? ' is-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <History size={15} />
        <span className="np-wallet-history-title">Lịch sử giao dịch</span>
        {/* Số lượng hiện ngay trên nút: người dùng biết có gì bên trong trước
            khi bấm, và biết luôn là mình chưa có giao dịch nào. */}
        {!loading && <span className="np-wallet-history-count">{rows.length}</span>}
        <ChevronDown size={16} className="np-wallet-history-chevron" />
      </button>

      {!open ? null : loading && rows.length === 0 ? (
        <p className="np-wallet-history-empty">Đang tải…</p>
      ) : rows.length === 0 ? (
        <p className="np-wallet-history-empty">
          Chưa có giao dịch nào. Nạp NP hoặc hoàn thành nhiệm vụ để bắt đầu.
        </p>
      ) : (
        <ul className="np-wallet-history-list">
          {rows.map((tx, i) => {
            const amount = Number(tx.amount_np ?? 0);
            /* Dấu đã nằm sẵn trong số: backend lưu số âm cho khoản chi, nên
               không suy ra từ `transaction_type` — suy ra là có ngày một loại
               giao dịch mới hiện sai dấu. */
            const gain = amount >= 0;
            const date = formatDate(tx.created_at);
            const balance = Number(tx.balance_after_np ?? 0);

            return (
              <li key={tx.id || i} className="np-wallet-history-row">
                <div className="np-wallet-history-main">
                  <span className="np-wallet-history-label">{label(tx)}</span>
                  <span className="np-wallet-history-meta">
                    {date ? `${date} · ` : ''}còn {balance.toLocaleString('vi-VN')} NP
                  </span>
                </div>
                {/* Khoản chi dùng màu chữ thường, không phải màu cảnh báo:
                    tiêu NP là việc người dùng chủ động làm, không phải lỗi. */}
                <span className={`np-wallet-history-amount${gain ? ' is-gain' : ''}`}>
                  {gain ? '+' : '−'}{Math.abs(amount).toLocaleString('vi-VN')}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
