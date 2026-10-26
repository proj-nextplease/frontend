// StoreHeader.jsx – renders the header of the store tab in Cyber‑punk Neon Aura theme
import React from 'react';


export default function StoreHeader({ renderReloadButton }) {
  return (
    <div className="fstore-header">
      <div className="fstore-header-left">

        <h2 className="fstore-main-title">Cửa hàng Điểm fonlio</h2>
        <p className="fstore-subtitle">
          1 Điểm = 1 VNĐ · Điểm bảo lưu vĩnh viễn trọn đời · Không thu phí duy trì · 80% tính năng miễn phí 0đ, chỉ thanh toán khi nhận được giá trị thực tế
        </p>
      </div>
      <div className="fstore-header-right">
        {renderReloadButton && renderReloadButton()}
      </div>
    </div>
  );
}
