import { useState } from 'react';
import { ConsentGate } from './ConsentGate.jsx';
import { LEGAL_VERSION } from '../lib/legalDocuments.js';
import { clearMyProfileCache, useMyProfile } from '../lib/useMyProfile.js';
import { acceptLegalConsent } from '../api/portfolioApi.js';
import { logout } from '../api/httpClient.js';

/**
 * Chặn sử dụng cho tới khi người dùng đồng ý với văn bản pháp lý hiện hành.
 *
 * VÌ SAO GẮN Ở ĐÂY CHỨ KHÔNG PHẢI Ở TRANG ĐĂNG KÝ:
 * điều kiện cần kiểm không phải "đang ở trang nào" mà là "tài khoản này đã có
 * bản ghi đồng ý chưa". Gắn ở trang đăng ký thì sót hết những đường vào khác:
 *   - Nút Google/Facebook/GitHub ở trang ĐĂNG NHẬP cũng tạo tài khoản mới —
 *     signInWithOAuth không phân biệt đăng nhập với đăng ký.
 *   - Toàn bộ người dùng đã có từ trước, chưa ai từng đồng ý.
 *   - Sau này sửa nội dung văn bản và tăng LEGAL_VERSION.
 * Một điều kiện duy nhất, kiểm sau khi xác thực, phủ hết cả ba.
 *
 * Với OAuth thì đây cũng là chỗ DUY NHẤT chặn được: không thể hỏi trước lúc
 * chuyển hướng, vì người dùng rời khỏi site rồi mới quay lại, và lúc bấm thì
 * chưa biết tài khoản mới hay cũ.
 */
export function ConsentGuard() {
  const { profile, signedIn } = useMyProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /* Chỉ chặn khi CHẮC CHẮN là thiếu đồng ý.
     `profile` là null trong lúc còn đang tải — chặn ngay lúc đó thì cổng nháy
     lên rồi biến mất ở mỗi lần tải trang, kể cả với người đã đồng ý rồi. */
  if (!signedIn || !profile) return null;
  if (profile.legalConsentVersion === LEGAL_VERSION) return null;

  async function handleAccept() {
    setSaving(true);
    setError('');
    try {
      await acceptLegalConsent(LEGAL_VERSION);
      // Bỏ bộ đệm rồi tải lại: hồ sơ đang giữ legalConsentVersion cũ, không dọn
      // thì cổng hiện lại ngay.
      clearMyProfileCache();
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Không ghi nhận được. Thử lại giúp mình.');
      setSaving(false);
    }
  }

  return (
    <ConsentGate
      blocking
      saving={saving}
      error={error}
      onClose={() => {
        /* Cổng đã chặn sử dụng thì không thể cho đóng rồi dùng tiếp. Hai lối ra
           trung thực: đồng ý, hoặc rời đi. */
        logout().finally(() => { window.location.assign('/'); });
      }}
      onAccept={handleAccept}
    />
  );
}
