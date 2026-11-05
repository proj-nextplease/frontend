import { useEffect, useState } from 'react';
import { LegalPageLayout } from '../components/LegalPageLayout.jsx';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { supabase } from '../services/supabaseClient.js';
import { deleteMyAccount } from '../api/accountApi.js';

/**
 * /delete-account — trang yêu cầu xoá tài khoản.
 *
 * Google Play BẮT BUỘC ứng dụng cho tạo tài khoản phải có một đường link web
 * để người dùng xoá tài khoản, kể cả khi đã gỡ app. Link này điền vào mục
 * "An toàn dữ liệu" của Play Console, nên trang phải:
 *   - nêu rõ tên ứng dụng / nhà phát triển (fonlio),
 *   - chỉ các bước để xoá,
 *   - nói dữ liệu nào bị xoá, dữ liệu nào giữ lại và giữ bao lâu.
 *
 * Đăng nhập rồi thì xoá ngay tại đây; chưa đăng nhập thì mở hộp đăng nhập,
 * hoặc gửi email nếu không vào được tài khoản nữa.
 */

const CONTACT_EMAIL = 'fonlioofficial@gmail.com';

const SECTIONS = [
  {
    id: 'cach-xoa',
    h: 'Cách xoá tài khoản',
    p: [
      'Bạn có thể tự xoá tài khoản fonlio bằng một trong ba cách:',
      { list: [
        'Trên trang này: đăng nhập, gõ lại email đăng nhập rồi bấm "Xoá vĩnh viễn tài khoản".',
        'Trong ứng dụng fonlio trên điện thoại: Hồ sơ → Cài đặt tài khoản → Xoá tài khoản.',
        `Nếu không đăng nhập được nữa: gửi email tới ${CONTACT_EMAIL} từ chính địa chỉ email đã đăng ký, tiêu đề "Yêu cầu xoá tài khoản". Chúng tôi xử lý trong vòng 7 ngày làm việc.`,
      ] },
    ],
  },
  {
    id: 'du-lieu-bi-xoa',
    h: 'Dữ liệu bị xoá',
    p: [
      'Ngay khi bạn xác nhận, các dữ liệu sau bị xoá vĩnh viễn và không khôi phục được:',
      { list: [
        'Tài khoản đăng nhập (email, mật khẩu, liên kết Google/GitHub/Facebook).',
        'Hồ sơ năng lực: giới thiệu, trường, nơi ở, ảnh đại diện, liên kết mạng xã hội, đường dẫn công khai.',
        'Kinh nghiệm, kỹ năng, minh chứng và ảnh minh chứng đã tải lên.',
        'Điểm uy tín (RS), kinh nghiệm (EXP), chuỗi ngày và tiến độ nhiệm vụ.',
        'Số dư NP còn lại trong ví. NP đã nạp không được hoàn lại khi xoá tài khoản.',
      ] },
    ],
  },
  {
    id: 'du-lieu-giu-lai',
    h: 'Dữ liệu được giữ lại',
    p: [
      'Một số bản ghi được giữ lại ở dạng ẩn danh — tên hiển thị thành "Người dùng đã xoá" và không còn gắn với email của bạn:',
      { list: [
        'Lịch sử giao dịch nạp NP: lưu tối đa 5 năm theo quy định kế toán, thuế.',
        'Đơn ứng tuyển đã gửi: để tổ chức tuyển dụng giữ được lịch sử tuyển dụng của họ.',
        'Bài viết và bình luận trong mục Thảo luận: để không làm đứt mạch trao đổi của người khác. Bạn có thể tự xoá bài trước khi xoá tài khoản.',
      ] },
      'Sau khi xoá, bạn có thể dùng lại chính email đó để đăng ký một tài khoản mới hoàn toàn.',
    ],
  },
  {
    id: 'lien-he',
    h: 'Liên hệ',
    p: [
      `Mọi câu hỏi về việc xoá tài khoản và dữ liệu cá nhân, vui lòng liên hệ ${CONTACT_EMAIL}.`,
    ],
  },
];

function DeletePanel() {
  const { openLoginModal } = useAuthModal();
  const [session, setSession] = useState(undefined);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) { setSession(null); return undefined; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const email = session?.user?.email ?? '';
  const matches = email && confirmEmail.trim().toLowerCase() === email.toLowerCase();

  async function onDelete(e) {
    e.preventDefault();
    if (!matches || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteMyAccount(confirmEmail.trim());
      // Tài khoản Supabase đã bị xoá phía máy chủ; dọn phiên trên trình duyệt.
      try { await supabase?.auth.signOut({ scope: 'local' }); } catch { /* đã mất phiên */ }
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể xoá tài khoản.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="np-delacc" aria-live="polite">
        <h2 className="np-delacc-title">Đã xoá tài khoản</h2>
        <p className="np-delacc-text">
          Tài khoản và dữ liệu cá nhân của bạn đã được xoá. Cảm ơn bạn đã dùng fonlio.
        </p>
      </section>
    );
  }

  if (session === undefined) {
    return <section className="np-delacc"><p className="np-delacc-text">Đang kiểm tra phiên đăng nhập…</p></section>;
  }

  if (!session) {
    return (
      <section className="np-delacc">
        <h2 className="np-delacc-title">Xoá tài khoản fonlio</h2>
        <p className="np-delacc-text">
          Đăng nhập vào tài khoản bạn muốn xoá để tiếp tục. Không đăng nhập được nữa?
          Gửi email tới <a href={`mailto:${CONTACT_EMAIL}?subject=Y%C3%AAu%20c%E1%BA%A7u%20xo%C3%A1%20t%C3%A0i%20kho%E1%BA%A3n`}>{CONTACT_EMAIL}</a>.
        </p>
        <button type="button" className="np-delacc-btn np-delacc-btn--ghost" onClick={() => openLoginModal('candidate')}>
          Đăng nhập để xoá tài khoản
        </button>
      </section>
    );
  }

  return (
    <form className="np-delacc" onSubmit={onDelete}>
      <h2 className="np-delacc-title">Xoá tài khoản {email}</h2>
      <p className="np-delacc-text">
        Thao tác này <strong>không hoàn tác được</strong>. Hồ sơ, kinh nghiệm, minh chứng và số dư NP sẽ mất vĩnh viễn.
        Gõ lại email đăng nhập để xác nhận.
      </p>
      <label className="np-delacc-label" htmlFor="np-delacc-email">Email đăng nhập</label>
      <input
        id="np-delacc-email"
        className="np-delacc-input"
        type="email"
        autoComplete="off"
        placeholder={email}
        value={confirmEmail}
        onChange={(e) => setConfirmEmail(e.target.value)}
      />
      {error && <p className="np-delacc-error" role="alert">{error}</p>}
      <button type="submit" className="np-delacc-btn np-delacc-btn--danger" disabled={!matches || busy}>
        {busy ? 'Đang xoá…' : 'Xoá vĩnh viễn tài khoản'}
      </button>
    </form>
  );
}

export function DeleteAccountPage() {
  return (
    <LegalPageLayout
      eyebrow="Tài khoản"
      title="Xoá tài khoản fonlio"
      updated="05/11/2026"
      intro="Trang này dành cho người dùng ứng dụng fonlio (web và Android/iOS) muốn xoá tài khoản cùng dữ liệu cá nhân."
      sections={SECTIONS}
      lead={<DeletePanel />}
    />
  );
}
