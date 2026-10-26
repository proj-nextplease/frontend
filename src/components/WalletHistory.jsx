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
  TOPUP: 'Nạp Điểm',
  REFUND: 'Hoàn Điểm',
  JOB_ACCEPTANCE_FEE: 'Phí nhận việc có trả lương',
  PORTFOLIO_EXPORT_FEE: 'Phí xuất Portfolio thành website',
  BOOST: 'Đẩy đơn ứng tuyển',
  SUBSCRIPTION: 'Gói dịch vụ',
  PREMIUM_PURCHASE: 'Dịch vụ nâng cao',
  ITEM_PURCHASE: 'Mua vật phẩm',
  ADJUSTMENT: 'Điều chỉnh',
};

function label(tx) {
  const reason = tx?.reason?.trim();
  if (reason) return reason;
  return TYPE_LABELS[tx?.transaction_type] || 'Giao dịch';
}

/*
 * Ngày kèm giờ.
 *
 * Giờ quan trọng ở đây vì trong cùng một ngày có thể có nhiều giao dịch — nạp
 * tiền, mua gói, rồi hoàn tiền — và không có giờ thì không xếp được thứ tự,
 * cũng không đối chiếu được với biên lai ngân hàng.
 *
 * `created_at` backend trả về có kèm múi giờ, nên `new Date` quy về giờ máy
 * người dùng. Với người dùng ở Việt Nam đó chính là giờ họ đã bấm.
 */
function formatDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  /* Ghi rõ 2-digit cho ngày và tháng: mặc định của vi-VN cho ra "29/9/2026"
     còn mobile luôn đệm số 0 thành "29/09/2026". Cùng một ví mà hai nơi viết
     ngày khác nhau là thứ người dùng để ý ngay. */
  return `${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

export function WalletHistory({ transactions, loading }) {
  const [open, setOpen] = useState(false);
  const rows = Array.isArray(transactions) ? transactions : [];

  return (
    <section className="fstore-history-section np-wallet-history">
      <button
        type="button"
        className={`fstore-history-toggle np-wallet-history-toggle${open ? ' is-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <div className="fstore-history-toggle-left">
          <div className="fstore-history-icon-box">
            <History size={16} />
          </div>
          <span className="fstore-history-title np-wallet-history-title">Lịch sử giao dịch ví</span>
          {!loading && (
            <span className="fstore-history-badge np-wallet-history-count">
              {rows.length} {rows.length === 1 ? 'giao dịch' : 'giao dịch'}
            </span>
          )}
        </div>
        <div className="fstore-history-toggle-right">
          <span className="fstore-history-action-hint">{open ? 'Thu gọn' : 'Xem chi tiết'}</span>
          <ChevronDown size={17} className="fstore-history-chevron np-wallet-history-chevron" />
        </div>
      </button>

      {!open ? null : loading && rows.length === 0 ? (
        <div className="fstore-history-box np-wallet-history-empty">
          <div className="fstore-history-spinner" />
          <p>Đang tải dữ liệu giao dịch từ blockchain/hệ thống ví…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="fstore-history-box np-wallet-history-empty">
          <div className="fstore-history-empty-icon">
            <History size={28} />
          </div>
          <h4>Chưa phát sinh giao dịch nào</h4>
          <p>
            Khi bạn nạp Điểm, nhận thù lao dự án hoặc xuất bản Portfolio, lịch sử biến động số dư sẽ được lưu vết minh bạch tại đây.
          </p>
        </div>
      ) : (
        <div className="fstore-history-box">
          <ul className="fstore-history-list np-wallet-history-list">
            {rows.map((tx, i) => {
              const amount = Number(tx.amount_np ?? 0);
              const gain = amount >= 0;
              const date = formatDateTime(tx.created_at);
              const balance = Number(tx.balance_after_np ?? 0);

              return (
                <li key={tx.id || i} className={`fstore-history-row np-wallet-history-row ${gain ? 'gain' : 'spend'}`}>
                  <div className="fstore-history-type-icon">
                    {gain ? '+' : '−'}
                  </div>
                  <div className="fstore-history-main np-wallet-history-main">
                    <div className="fstore-history-label-row">
                      <span className="fstore-history-label np-wallet-history-label">{label(tx)}</span>
                      {tx.transaction_type && (
                        <span className={`fstore-history-type-tag ${gain ? 'gain' : 'spend'}`}>
                          {tx.transaction_type}
                        </span>
                      )}
                    </div>
                    <span className="fstore-history-meta np-wallet-history-meta">
                      {date ? `${date} · ` : ''}Số dư sau GD: <strong>{balance.toLocaleString('vi-VN')} Điểm</strong>
                    </span>
                  </div>
                  <div className={`fstore-history-amount np-wallet-history-amount ${gain ? 'is-gain' : 'is-spend'}`}>
                    <span className="fstore-history-sign">{gain ? '+' : '−'}</span>
                    <span className="fstore-history-value">{Math.abs(amount).toLocaleString('vi-VN')}</span>
                    <span className="fstore-history-unit">Điểm</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
