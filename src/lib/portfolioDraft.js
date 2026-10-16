/**
 * Chuyển state của trình dựng sang đúng shape mà VerifiedPassport đọc.
 *
 * Trình dựng giữ `skills` là một chuỗi phân tách bằng dấu phẩy (người dùng gõ
 * vào một ô duy nhất) còn trang hồ sơ đọc mảng, nên chỗ nối hai bên phải có
 * một hàm. Tách ra đây để khung xem trước sống trong trình dựng và tab xem
 * trước mở riêng không bao giờ lệch nhau: lệch một trường là người dùng thấy
 * hai kết quả khác nhau cho cùng một bản nháp.
 */
export function toPassportProfile({ profile = {}, avatar, experiences, credentials } = {}) {
  const skills = String(profile.skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  return {
    name: profile.name,
    headline: profile.headline,
    school: profile.school,
    location: profile.location,
    bio: profile.bio,
    skills,
    avatar: avatar || { gender: 'female' },
    /* Trình dựng luôn mở sẵn một dòng kinh nghiệm trống để người dùng có chỗ
       gõ ngay. Dòng đó KHÔNG phải một kinh nghiệm: để nguyên thì bản xem
       trước đếm "1 dự án đã hoàn thành" và vẽ một thẻ dự án rỗng trước khi
       người dùng kịp nhập chữ nào. */
    experiences: (experiences || []).filter(
      (exp) => exp && (exp.title?.trim() || exp.organization?.trim() || exp.detail?.trim()),
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
