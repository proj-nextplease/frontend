/**
 * Nội dung hai văn bản pháp lý — MỘT NGUỒN DUY NHẤT.
 *
 * Trước đây mỗi trang tự giữ mảng `sections` của mình. Giờ hộp thoại xin đồng
 * ý ở bước đăng ký cũng phải hiện đúng nội dung đó; để hai bản song song thì
 * sớm muộn chúng lệch nhau, và người dùng sẽ đồng ý với một văn bản khác với
 * văn bản đăng công khai.
 *
 * LEGAL_VERSION phải TĂNG mỗi lần sửa nội dung có ý nghĩa. Nó là thứ trả lời
 * được câu "người này đã đồng ý với bản nào" — không có nó thì bản ghi đồng ý
 * chỉ nói được "có đồng ý", không nói được "đồng ý với cái gì".
 */

const TERMS_SECTIONS = [
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

const PRIVACY_SECTIONS = [
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

export const LEGAL_VERSION = '2026-06-29';

export const TERMS_DOC = {
  key: 'terms',
  path: '/terms',
  title: 'Điều khoản dịch vụ',
  updated: '29 tháng 6, 2026',
  intro: 'Điều khoản này quy định quyền và nghĩa vụ khi bạn sử dụng nền tảng next please. Vui lòng đọc kỹ trước khi tạo tài khoản.',
  sections: TERMS_SECTIONS,
};

export const PRIVACY_DOC = {
  key: 'privacy',
  path: '/privacy',
  title: 'Chính sách bảo mật',
  updated: '29 tháng 6, 2026',
  intro: 'Chính sách này mô tả cách next please thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.',
  sections: PRIVACY_SECTIONS,
};
