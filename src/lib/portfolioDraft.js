/**
 * Chuyển state của trình dựng sang đúng shape mà VerifiedPassport đọc.
 *
 * Trình dựng giữ `skills` là một chuỗi phân tách bằng dấu phẩy (người dùng gõ
 * vào một ô duy nhất) còn trang hồ sơ đọc mảng, nên chỗ nối hai bên phải có
 * một hàm. Tách ra đây để khung xem trước sống trong trình dựng và tab xem
 * trước mở riêng không bao giờ lệch nhau: lệch một trường là người dùng thấy
 * hai kết quả khác nhau cho cùng một bản nháp.
 */
export function toPassportProfile(data = {}) {
  const profile = data?.profile || {};
  const rawSkills = profile.skills;
  const skills = (
    Array.isArray(rawSkills)
      ? rawSkills
      : String(rawSkills || '').split(',')
  )
    .map((skill) => (typeof skill === 'string' ? skill.trim() : String(skill || '')))
    .filter(Boolean);

  const avatar = data?.avatar;
  const experiences = data?.experiences;
  const credentials = data?.credentials;

  return {
    name: profile.name,
    headline: profile.headline,
    school: profile.school,
    location: profile.location,
    bio: profile.bio,
    skills,
    avatar: avatar || { gender: 'female' },
    /* Trình dựng luôn mở sẵn một dòng kinh nghiệm trống để người dùng có chỗ
       gõ ngay. Dòng đó KHÔNG phải một kinh nghiệm. Ngoài ra, chỉ hiển thị các
       dự án đã duyệt (APPROVED) hoặc dự án mới đang soạn — tuyệt đối không đưa
       các dự án đang chờ duyệt hoặc bị từ chối vào preview portfolio. */
    experiences: (experiences || []).filter(
      (exp) =>
        exp &&
        (exp.title?.trim() || exp.organization?.trim() || exp.detail?.trim()) &&
        exp.verificationStatus !== 'PENDING' &&
        exp.verificationStatus !== 'REJECTED',
    ),
    credentials: (credentials || []).filter((cred) => cred && cred.name?.trim()),
    openToWork: !!profile.openToWork,
    /* Phải đi kèm, nếu không khung xem trước luôn vẽ bằng giao diện mặc
       định và người dùng đổi theme mà không thấy gì đổi. */
    selectedTheme: profile.selectedTheme,
    socialLinks: profile.socialLinks || {},
    coverBannerUrl: profile.coverBannerUrl,
    coverBannerPos: profile.coverBannerPos,
    /* Cố ý bỏ reputationScore/currentLevel/totalExp: đó là số liệu ở mức tài
       khoản, chưa đúng với một bản nháp chưa lưu, nên dải chỉ số tự ẩn. */
  };
}
