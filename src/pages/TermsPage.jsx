import { LegalPageLayout } from '../components/LegalPageLayout.jsx';

const sections = [
  {
    id: 'chap-nhan',
    h: 'Chấp nhận điều khoản',
    p: [
      'Bằng việc tạo tài khoản hoặc sử dụng nền tảng next please ("Nền tảng"), bạn đồng ý với các Điều khoản dịch vụ này. Nếu bạn không đồng ý, vui lòng ngừng sử dụng Nền tảng.',
      'Điều khoản áp dụng cho cả ứng viên (sinh viên) và đối tác (doanh nghiệp, câu lạc bộ, tổ chức).',
    ],
  },
  {
    id: 'tai-khoan',
    h: 'Tài khoản & đăng ký',
    p: [
      'Bạn chịu trách nhiệm về tính chính xác của thông tin đăng ký và bảo mật mật khẩu của mình.',
      { list: [
        'Mỗi người dùng chỉ nên sở hữu một tài khoản ứng viên.',
        'Tài khoản đối tác cần cung cấp minh chứng pháp lý (giấy phép kinh doanh, quyết định thành lập CLB) để được xác minh.',
        'Bạn phải đủ tuổi tham gia lao động/hoạt động theo quy định pháp luật Việt Nam.',
      ] },
    ],
  },
  {
    id: 'proof',
    h: 'Hệ thống uy tín (RS, EXP, NP)',
    p: [
      'Điểm uy tín (RS), kinh nghiệm (EXP) và số dư NP đều do hệ thống kiểm soát qua nhật ký sự kiện, minh bạch và có thể kiểm chứng. Người dùng không được tự khai hay can thiệp các chỉ số này.',
      'Mọi minh chứng (proof) phải trung thực. Hành vi gian lận, làm giả minh chứng có thể dẫn tới khoá tài khoản và thu hồi điểm/thưởng liên quan.',
    ],
  },
  {
    id: 'noi-dung',
    h: 'Nội dung người dùng',
    p: [
      'Bạn giữ quyền sở hữu với nội dung mình đăng tải (hồ sơ, minh chứng, mô tả). Khi đăng tải, bạn cấp cho Nền tảng quyền lưu trữ và hiển thị nội dung đó nhằm vận hành dịch vụ.',
      'Bạn không được đăng nội dung vi phạm pháp luật, xâm phạm quyền của bên thứ ba, spam hoặc gây hiểu nhầm.',
    ],
  },
  {
    id: 'doi-tac',
    h: 'Quyền & nghĩa vụ đối tác',
    p: [
      'Đối tác đăng tin tuyển dụng, Quest và quản lý ứng viên có trách nhiệm cung cấp thông tin chính xác về cơ hội, thù lao và quyền lợi.',
      'Việc đánh giá và trao thưởng ứng viên phải dựa trên kết quả công việc thực tế, công bằng và đúng quy tắc của Nền tảng.',
    ],
  },
  {
    id: 'thanh-toan',
    h: 'NP, Premium & thanh toán',
    p: [
      'NP là đơn vị quy đổi nội bộ dùng cho một số tính năng (vd gói Premium). Các giao dịch nạp NP và mua Premium tuân theo mô tả tại thời điểm giao dịch.',
      'Trừ khi pháp luật yêu cầu khác, các khoản đã sử dụng cho dịch vụ là không hoàn lại.',
    ],
  },
  {
    id: 'dinh-chi',
    h: 'Đình chỉ & chấm dứt',
    p: [
      'Chúng tôi có thể tạm ngưng hoặc chấm dứt tài khoản vi phạm Điều khoản, gian lận, hoặc gây rủi ro cho người dùng khác.',
      'Bạn có thể ngừng sử dụng và yêu cầu xoá tài khoản bất kỳ lúc nào.',
    ],
  },
  {
    id: 'trach-nhiem',
    h: 'Giới hạn trách nhiệm',
    p: [
      'Nền tảng đóng vai trò kết nối ứng viên và đối tác. Chúng tôi không phải là một bên trong quan hệ lao động giữa hai phía và không bảo đảm kết quả tuyển dụng cụ thể.',
      'Dịch vụ được cung cấp trên cơ sở "nguyên trạng"; chúng tôi nỗ lực vận hành ổn định nhưng không bảo đảm không gián đoạn.',
    ],
  },
  {
    id: 'thay-doi',
    h: 'Thay đổi điều khoản',
    p: [
      'Chúng tôi có thể cập nhật Điều khoản theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo trên Nền tảng. Việc bạn tiếp tục sử dụng đồng nghĩa với chấp nhận bản cập nhật.',
    ],
  },
  {
    id: 'lien-he',
    h: 'Liên hệ',
    p: [
      'Mọi thắc mắc về Điều khoản, vui lòng liên hệ: lienhe@nextplease.vn.',
    ],
  },
];

export function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Pháp lý"
      title="Điều khoản dịch vụ"
      updated="29 tháng 6, 2026"
      intro="Điều khoản này quy định quyền và nghĩa vụ khi bạn sử dụng nền tảng next please. Vui lòng đọc kỹ trước khi tạo tài khoản."
      sections={sections}
    />
  );
}
