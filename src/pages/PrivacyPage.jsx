import { LegalPageLayout } from '../components/LegalPageLayout.jsx';

const sections = [
  {
    id: 'thu-thap',
    h: 'Dữ liệu chúng tôi thu thập',
    p: [
      'Chúng tôi thu thập dữ liệu bạn cung cấp và dữ liệu phát sinh khi sử dụng Nền tảng:',
      { list: [
        'Thông tin tài khoản: tên hiển thị, email, email sinh viên, mật khẩu (được mã hoá).',
        'Hồ sơ năng lực: kỹ năng, học vấn, minh chứng (proof), chứng chỉ, kinh nghiệm.',
        'Dữ liệu hoạt động: điểm RS, EXP, NP, lịch sử ứng tuyển và Quest.',
        'Với đối tác: thông tin tổ chức, giấy tờ pháp lý phục vụ xác minh.',
      ] },
    ],
  },
  {
    id: 'muc-dich',
    h: 'Mục đích sử dụng',
    p: [
      'Chúng tôi dùng dữ liệu để: vận hành tài khoản, xác minh proof, kết nối ứng viên với cơ hội phù hợp, tính toán RS/EXP/NP, gửi thông báo liên quan và cải thiện dịch vụ.',
      'Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba.',
    ],
  },
  {
    id: 'co-so',
    h: 'Cơ sở xử lý & sự đồng ý',
    p: [
      'Chúng tôi xử lý dữ liệu trên cơ sở sự đồng ý của bạn khi đăng ký, và để thực hiện dịch vụ bạn yêu cầu. Bạn có thể rút lại đồng ý bằng cách yêu cầu xoá tài khoản.',
    ],
  },
  {
    id: 'chia-se',
    h: 'Chia sẻ dữ liệu',
    p: [
      'Một số dữ liệu được chia sẻ có chủ đích nhằm vận hành dịch vụ:',
      { list: [
        'Hồ sơ và proof của ứng viên được hiển thị cho đối tác khi bạn ứng tuyển hoặc bật chế độ hiển thị.',
        'Tổ chức liên quan có thể xác nhận minh chứng công việc bạn đã tham gia.',
        'Nhà cung cấp hạ tầng (lưu trữ, email) xử lý dữ liệu thay chúng tôi theo hợp đồng bảo mật.',
      ] },
    ],
  },
  {
    id: 'luu-tru',
    h: 'Lưu trữ & bảo mật',
    p: [
      'Dữ liệu được lưu trữ trên hạ tầng đám mây có biện pháp bảo mật phù hợp. Mật khẩu được mã hoá và không lưu ở dạng văn bản thuần.',
      'Chúng tôi giữ dữ liệu trong thời gian tài khoản còn hoạt động hoặc theo yêu cầu pháp luật.',
    ],
  },
  {
    id: 'quyen',
    h: 'Quyền của bạn',
    p: [
      'Bạn có quyền: truy cập, chỉnh sửa, xuất hoặc yêu cầu xoá dữ liệu cá nhân của mình. Hãy liên hệ chúng tôi để thực hiện các quyền này.',
    ],
  },
  {
    id: 'cookie',
    h: 'Cookie & lưu trữ cục bộ',
    p: [
      'Chúng tôi dùng cookie và bộ nhớ trình duyệt (localStorage) cho các mục đích cần thiết như giữ đăng nhập, ghi nhớ tuỳ chọn giao diện (sáng/tối) và một số tiến trình trải nghiệm. Bạn có thể xoá chúng trong cài đặt trình duyệt.',
    ],
  },
  {
    id: 'tre-vi-thanh-nien',
    h: 'Người chưa thành niên',
    p: [
      'Nền tảng hướng tới sinh viên và người dùng đủ tuổi tham gia hoạt động/lao động theo quy định. Nếu bạn dưới độ tuổi cho phép, vui lòng có sự đồng ý của người giám hộ.',
    ],
  },
  {
    id: 'thay-doi',
    h: 'Thay đổi chính sách',
    p: [
      'Chính sách có thể được cập nhật. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo trên Nền tảng và cập nhật ngày ở đầu trang.',
    ],
  },
  {
    id: 'lien-he',
    h: 'Liên hệ',
    p: [
      'Câu hỏi về quyền riêng tư, vui lòng liên hệ: lienhe@nextplease.vn.',
    ],
  },
];

export function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Pháp lý"
      title="Chính sách bảo mật"
      updated="29 tháng 6, 2026"
      intro="Chính sách này mô tả cách next please thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn."
      sections={sections}
    />
  );
}
