// WalletCard.jsx – renders the holographic wallet card for the store
import React from 'react';
import { WalletCards, CheckCircle2, Clock3, ShieldCheck, Coins } from 'lucide-react';

export default function WalletCard({ wallet, walletLoading, onTopUp }) {
  return (
    <div className="fstore-wallet-card">
      <div className="fstore-card-watermark">FONLIO // CYBER WALLET ID</div>
      <div className="fstore-wallet-left">
        <div className="fstore-wallet-icon-ring">
          <WalletCards size={26} />
        </div>
        <div className="fstore-wallet-details">
          <div className="fstore-wallet-status-row">
            <span className="fstore-wallet-label">SỐ DƯ KHẢ DỤNG TRONG VÍ</span>
            <span className="fstore-wallet-live-badge">
              <span className="fstore-live-dot" /> ACTIVE 24/7
            </span>
          </div>
          <div className="fstore-wallet-balance">
            <span className="fstore-wallet-num">
              {walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString('vi-VN')}
            </span>
            <span className="fstore-wallet-unit">Điểm FONLIO</span>
          </div>
          <div className="fstore-wallet-tags">
            <span className="fstore-wtag">
              <CheckCircle2 size={13} /> Tương đương <strong>{(wallet?.npBalance ?? 0).toLocaleString('vi-VN')} VNĐ</strong> (Tỷ giá 1:1)
            </span>
            <span className="fstore-wtag">
              <Clock3 size={13} /> Bảo lưu vĩnh viễn trọn đời
            </span>
            <span className="fstore-wtag">
              <ShieldCheck size={13} /> Không phí duy trì tài khoản
            </span>
          </div>
        </div>
      </div>
      <div className="fstore-wallet-action">
        <button
          type="button"
          className="fstore-btn-topup-main"
          onClick={() => onTopUp?.('39000')}
        >
          <Coins size={18} />
          <span>Nạp Điểm Ngay</span>
        </button>
      </div>
    </div>
  );
}
