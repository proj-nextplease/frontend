import { Link } from 'react-router-dom';
import { EmptyStateMascot } from '../components/EmptyStateMascot.jsx';

export function NotFoundPage() {
  return (
    <section className="not-found-page" style={{ display: 'grid', placeItems: 'center', padding: '64px 20px' }}>
      <EmptyStateMascot
        size={150}
        title="Không tìm thấy trang này"
        description="Đường dẫn có thể đã đổi hoặc bị gõ nhầm. Quay về trang chủ rồi đi tiếp nhé."
        action={<Link className="button primary-button" to="/">Về trang chủ</Link>}
      />
    </section>
  );
}
