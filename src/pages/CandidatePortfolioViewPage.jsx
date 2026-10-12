import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getPublicProfile, getPublicProfileBySlug } from '../api/portfolioApi.js';
import { FomlioPassport } from '../components/portfolio/FomlioPassport.jsx';


export function CandidatePortfolioViewPage() {
  // Trang này phục vụ hai đường dẫn: /p/:slug (link đẹp để chia sẻ) và
  // /portfolio/view/:userId (link cũ, giữ lại để không gãy link đã gửi đi).
  const { userId, slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const request = slug ? getPublicProfileBySlug(slug) : getPublicProfile(userId);
    request
      .then(setProfile)
      .catch(err => setError(err.message || 'Không thể tải hồ sơ.'))
      .finally(() => setLoading(false));
  }, [userId, slug]);

  /* Màn chờ và màn lỗi mặc cùng bộ đồ với trang sắp hiện ra. Trước đây chúng
     dùng lớp `.vp-page` nền giấy của giao diện cũ, nên người xem thấy một
     trang sáng rồi chớp sang một trang tối — một vết nối không cần thiết. */
  if (loading) {
    return (
      <div className="fom-page fom-page-state">
        <Sparkles size={28} />
        <p>Đang tải hồ sơ ứng viên…</p>
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="fom-page fom-page-state">
        <p>{error || 'Không tìm thấy hồ sơ.'}</p>
        <button type="button" className="fom-btn" onClick={() => window.close()}>Đóng tab</button>
      </div>
    );
  }
  return <VerifiedPassport profile={profile} />;
}

/**
 * Hồ sơ công khai của ứng viên. Dùng chung cho trang thật
 * (/p/:slug, /portfolio/view/:userId) và tab xem trước bản nháp; `isDraft`
 * hạ bớt những khẳng định chỉ đúng với hồ sơ đã lưu — không bịa số liệu.
 *
 * Trước đây đây là lớp rẽ giữa năm theme. Giờ sản phẩm chỉ còn một giao diện
 * (Cốm Neon), nên không còn gì để rẽ: mọi hồ sơ, kể cả những hồ sơ cũ còn ghi
 * selected_theme là DARK_GOLD hay CYBERPUNK trong DB, đều hiện bằng giao diện
 * này. Giữ nguyên tên `VerifiedPassport` để không phải sửa nơi gọi.
 */
export function VerifiedPassport({ profile, isDraft = false }) {
  return <FomlioPassport profile={profile} isDraft={isDraft} />;
}
