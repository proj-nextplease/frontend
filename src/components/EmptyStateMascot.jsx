import { Mascot } from 'page-mascot';

/**
 * Trạng thái trống có linh vật.
 *
 * Chỉ dùng cho những khoảnh khắc màn hình *đang* trống — feed chưa có bài, bộ
 * lọc không ra kết quả, trang 404. Đúng lúc đó linh vật không tranh chỗ với
 * thứ gì, mà lại biến một dòng chữ xám thành một khoảnh khắc có tính cách.
 *
 * Không dùng nó như vật trang trí thường trực trên các trang công cụ: linh vật
 * bám con trỏ, mà ở trang danh sách thì con trỏ động liên tục — chuyển động ở
 * rìa tầm nhìn gây mệt sau vài phút.
 *
 * Màu chữ lấy từ --ink/--muted của ứng dụng chứ KHÔNG dùng `inherit`: cây DOM
 * nằm trong phạm vi design-system Astryx, nơi màu chữ được đặt bằng
 * `light-dark()` nên nó bám theo cài đặt sáng/tối của hệ điều hành, không phải
 * theme của web. Máy đang để dark mode thì `inherit` cho ra chữ trắng trên nền
 * trắng.
 */
export function EmptyStateMascot({ title, description, action, size = 120, style }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      textAlign: 'center', padding: '8px 12px',
      ...style,
    }}>
      <Mascot
        directions="/mascots/frog-directions.webp"
        reactions="/mascots/frog-reactions.webp"
        size={size}
        label="Linh vật nextplease"
      />

      <p style={{ margin: '10px 0 0', fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink)' }}>
        {title}
      </p>

      {description && (
        <p style={{ margin: '6px 0 0', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '44ch', color: 'var(--muted)' }}>
          {description}
        </p>
      )}

      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
