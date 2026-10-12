import { useState } from 'react';
import { BadgeCheck, Eye, ExternalLink, Award, GraduationCap, MapPin } from 'lucide-react';
import { PortfolioMascot } from '../PortfolioMascot.jsx';
import { FilePreviewModal } from '../FilePreviewModal.jsx';
import '../../styles/fomlioTheme.css';

import starUrl from '../../assets/fomlio/star.svg';
import dlOuterUrl from '../../assets/fomlio/dl-ring-outer.svg';
import dlInnerUrl from '../../assets/fomlio/dl-ring-inner.svg';
import dlIconUrl from '../../assets/fomlio/icon-download.svg';
import iconUxui from '../../assets/fomlio/icon-uxui.svg';
import iconTech from '../../assets/fomlio/icon-tech.svg';
import iconMarketing from '../../assets/fomlio/icon-marketing.svg';
import iconDatabase from '../../assets/fomlio/icon-database.svg';
import iconLight from '../../assets/fomlio/icon-light.svg';
import iconResearch from '../../assets/fomlio/icon-research.svg';

/* Sáu biểu tượng chuyên môn của bản thiết kế, dùng vòng theo thứ tự kỹ năng
   mà ứng viên khai — thiết kế có đúng sáu ô nên sáu icon là vừa đủ. */
const SPECIALITY_ICONS = [iconUxui, iconTech, iconMarketing, iconDatabase, iconLight, iconResearch];

/* Ngôi sao trang trí. Neo theo KHUNG HERO, không theo cả trang: trang dài
   ngắn tuỳ dữ liệu từng ứng viên, nên toạ độ tính theo % chiều cao trang sẽ
   rơi vào chỗ khác nhau ở mỗi hồ sơ — và đã từng rơi trúng dòng chữ.
   Tất cả nằm ở nửa trái, quanh đĩa chân dung, tránh hẳn cột chữ. */
const HERO_STARS = [
  { top: '2%', left: '30%', size: 46, rotate: -36 },
  { top: '12%', left: '-4%', size: 30, rotate: 24 },
  { top: '46%', left: '-7%', size: 22, rotate: -23 },
  { bottom: '6%', left: '6%', size: 34, rotate: 24 },
  { bottom: '-2%', left: '36%', size: 24, rotate: -23 },
];

/* Ở bản nháp, khối rỗng hiện lời nhắc thay vì biến mất. Người điền lần đầu
   cần biết "trang trống vì mình chưa nhập", chứ không phải đoán xem trang có
   hỏng không. Trên hồ sơ công khai thì khối rỗng vẫn ẩn hẳn — không ai muốn
   nhà tuyển dụng đọc thấy mình còn thiếu gì. */
function DraftHint({ children }) {
  return <p className="fom-draft-hint">{children}</p>;
}

/**
 * Năm kinh nghiệm, tính từ mốc bắt đầu sớm nhất.
 *
 * Trình dựng lưu ngày dạng `MM/YY` ("01/23"), không phải năm bốn chữ số —
 * bản trước bắt \d{4} nên không khớp gì cả và trang luôn hiện "0+ năm kinh
 * nghiệm" dù hồ sơ có đủ kinh nghiệm. Vẫn nhận cả `YYYY` phòng dữ liệu cũ.
 */
function yearsOfExperience(experiences) {
  const years = experiences
    .map((exp) => {
      const raw = String(exp.startDate || '').trim();
      const short = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(raw);
      if (short) return 2000 + Number(short[2]);
      const long = /\b(19|20)\d{2}\b/.exec(raw);
      return long ? Number(long[0]) : NaN;
    })
    .filter((y) => Number.isFinite(y) && y > 1950);
  if (!years.length) return null;
  return Math.max(1, new Date().getFullYear() - Math.min(...years));
}

/** Nút tròn "DOWNLOAD CV": chữ chạy vòng quanh viền, bấm để in / lưu PDF. */
function DownloadDial({ onClick }) {
  return (
    <button type="button" className="fom-download" onClick={onClick} title="Tải hồ sơ dạng PDF">
      <svg className="fom-download-spin" viewBox="0 0 199 199" aria-hidden="true">
        <defs>
          <path id="fom-dial" d="M99.5,12 a87.5,87.5 0 1,1 -0.1,0" fill="none" />
        </defs>
        <text><textPath href="#fom-dial">DOWNLOAD CV - DOWNLOAD CV - </textPath></text>
      </svg>
      <img className="fom-download-outer" src={dlOuterUrl} alt="" />
      <img className="fom-download-inner" src={dlInnerUrl} alt="" />
      <img className="fom-download-icon" src={dlIconUrl} alt="" />
    </button>
  );
}

/** Dải kỹ năng chạy ngang, lặp hai lần để vòng lặp khép kín không hở mối. */
function RoleMarquee({ items }) {
  if (!items.length) return null;
  return (
    <div className="fom-marquee" aria-label="Kỹ năng">
      <div className="fom-marquee-band" />
      <div className="fom-marquee-track">
        {[0, 1].map((copy) => (
          <div className="fom-marquee-group" key={copy} aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span className="fom-marquee-item" key={`${copy}-${i}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Theme "Fomlio" cho trang portfolio công khai — dựng theo Figma
 * "Portfolio Landing Page 1". Nhận cùng shape `profile` như VerifiedPassport
 * nên hai theme thay nhau được mà không đụng tới tầng dữ liệu.
 */
export function FomlioPassport({ profile, isDraft = false }) {
  const [preview, setPreview] = useState(null);

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  const credentials = (Array.isArray(profile.credentials) ? profile.credentials : []).filter((c) => c.name?.trim());
  const avatar = profile.avatar && Object.keys(profile.avatar).length > 0 ? profile.avatar : { gender: 'male' };

  const name = profile.name || 'Ứng viên';
  const years = yearsOfExperience(experiences);
  const verifiedCount = experiences.filter((e) => e.verified).length;
  const verifiedPct = experiences.length ? Math.round((verifiedCount / experiences.length) * 100) : null;

  /* Lưới dự án của bản thiết kế có sáu ô ảnh. Nguồn ảnh duy nhất trong dữ
     liệu là minh chứng của kinh nghiệm, nên mỗi kinh nghiệm thành một ô; ô
     nào chưa có ảnh thì hiện chữ thay vì khung rỗng. */
  const projects = experiences.slice(0, 6);
  const hasContent = profile.bio || skills.length || experiences.length || credentials.length;

  const email = profile.socialLinks?.email;
  const contactHref = email
    ? (email.startsWith('mailto:') ? email : `mailto:${email}`)
    : (profile.socialLinks?.linkedin ? `https://linkedin.com/in/${profile.socialLinks.linkedin}` : null);

  return (
    <div className="fom-page">
      <div className="fom-shell">
        <header className="fom-header">
          {/* Đây là trang của ỨNG VIÊN, không phải trang sản phẩm — chỗ này
              phải là tên họ. Bản thiết kế đặt nhãn hiệu "FOMLIO" vì nó vốn là
              portfolio cá nhân của chính designer. */}
          <span className="fom-logo">{name}</span>
          <nav className="fom-nav">
            <a className="active" href="#fom-top">Home</a>
            <a href="#fom-portfolio">Portfolio</a>
            <a href="#fom-services">Services</a>
            <a href="#fom-about">About</a>
          </nav>
          {contactHref
            ? <a className="fom-btn" href={contactHref}>Hire Me</a>
            : <span className="fom-btn" aria-disabled="true">Hire Me</span>}
        </header>

        <section className="fom-hero" id="fom-top">
          {HERO_STARS.map((star, i) => (
            <img
              key={i}
              className="fom-star"
              src={starUrl}
              alt=""
              style={{
                top: star.top,
                bottom: star.bottom,
                left: star.left,
                width: star.size,
                transform: `rotate(${star.rotate}deg)`,
              }}
            />
          ))}

          <div className="fom-portrait">
            <div className="fom-portrait-ring" aria-hidden="true" />
            {/* Hero này được thiết kế quanh một tấm chân dung 562×674. Linh vật
                là tranh nhỏ, thả vào giữa vòng tròn thì hai phần ba khung là
                màu nền — nên khi không có ảnh thật, linh vật đứng ở đáy vòng
                tròn như một nhân vật đứng trong khung, không cố lấp đầy nó. */}
            <div className={`fom-portrait-stage${avatar.portraitUrl ? ' has-photo' : ''}`}>
              {avatar.portraitUrl
                ? <img className="fom-portrait-photo" src={avatar.portraitUrl} alt={`Ảnh chân dung của ${name}`} />
                : <PortfolioMascot avatar={avatar} size={260} />}
            </div>
            <DownloadDial onClick={() => window.print()} />
          </div>

          <div className="fom-hero-copy">
            <span className="fom-pill">
              {isDraft ? <><Eye size={18} /> Bản nháp, chưa lưu</> : (profile.openToWork ? 'Đang tìm việc' : 'Hồ sơ đã xác thực')}
            </span>
            {/* Ba mẩu thông tin rời nhau — tên, nghề, nơi chốn — nhồi vào một
                câu thì ra thứ không ai viết: "Mình là Tài Phát, Information
                System tại FPTU HCM". Để chúng ở ba bậc riêng. */}
            <h1 className="fom-display">Xin chào! Mình là {name}</h1>
            {profile.headline && <p className="fom-lede">{profile.headline}</p>}
            {(profile.school || profile.location) && (
              <div className="fom-hero-tags">
                {profile.school && (
                  <span className="fom-hero-tag"><GraduationCap size={15} /><span>{profile.school}</span></span>
                )}
                {profile.location && (
                  <span className="fom-hero-tag"><MapPin size={15} /><span>{profile.location}</span></span>
                )}
              </div>
            )}
            <div className="fom-hero-actions">
              {contactHref && <a className="fom-btn" href={contactHref}>Let’s Talk!</a>}
              <a className="fom-btn ghost" href="#fom-portfolio">My Works</a>
            </div>
          </div>
        </section>
      </div>

      <RoleMarquee items={skills} />

      <div className="fom-shell">
        <section className={`fom-about${profile.bio ? '' : ' is-bare'}`} id="fom-about">
          <div className="fom-about-copy">
            <span className="fom-pill fom-eyebrow">About me</span>
            {profile.headline && <h2 className="fom-display">{profile.headline}</h2>}
            {profile.bio && <p className="fom-lede">{profile.bio}</p>}
            <button type="button" className="fom-btn lg" onClick={() => window.print()}>Download CV</button>
          </div>
          {/* Kim cương chỉ là trang trí. Khi chưa có phần giới thiệu thì nó
              là thứ DUY NHẤT trong nửa khối — một mảng hình to đứng cạnh một
              dòng chữ và một cái nút, nhìn như lỗi bố cục. Không có bio thì
              không vẽ. */}
          {profile.bio && <div className="fom-about-gem" aria-hidden="true" />}
        </section>

        {(years || experiences.length > 0 || verifiedPct !== null) && (
          <section className="fom-stats">
            <div className="fom-stat">
              <p className="fom-stat-value">{years ?? 0}<span>+</span></p>
              <p className="fom-stat-label">Năm kinh nghiệm</p>
            </div>
            <div className="fom-stat">
              <p className="fom-stat-value">{experiences.length}<span>+</span></p>
              <p className="fom-stat-label">Dự án đã hoàn thành</p>
            </div>
            <div className="fom-stat">
              <p className="fom-stat-value">{verifiedPct ?? 0}<span>%</span></p>
              <p className="fom-stat-label">Kinh nghiệm đã xác thực</p>
            </div>
          </section>
        )}

        {skills.length === 0 && isDraft && (
          <div className="fom-heading-block" id="fom-services">
            <span className="fom-pill fom-eyebrow">Services</span>
            <DraftHint>Thêm kỹ năng ở bước 2 — mỗi kỹ năng thành một thẻ chuyên môn ở đây.</DraftHint>
          </div>
        )}

        {skills.length > 0 && (
          <>
            <div className="fom-heading-block" id="fom-services">
              <span className="fom-pill fom-eyebrow">
                <img className="fom-heading-star" src={starUrl} alt="" />
                Services
              </span>
              <h2 className="fom-section-title">Chuyên môn của mình</h2>
            </div>
            <section className="fom-specialities">
              {skills.slice(0, 6).map((skill, i) => (
                <article className="fom-speciality" key={i}>
                  <img className="fom-speciality-icon" src={SPECIALITY_ICONS[i % SPECIALITY_ICONS.length]} alt="" />
                  <h3>{skill}</h3>
                </article>
              ))}
            </section>
          </>
        )}

        {projects.length === 0 && isDraft && (
          <div className="fom-heading-block" id="fom-portfolio">
            <span className="fom-pill fom-eyebrow">Portfolio</span>
            <DraftHint>Thêm kinh nghiệm ở bước 3 — mỗi mục thành một thẻ dự án, ảnh minh chứng thành ảnh bìa thẻ.</DraftHint>
          </div>
        )}

        {projects.length > 0 && (
          <>
            <div className="fom-heading-block" id="fom-portfolio">
              <span className="fom-pill fom-eyebrow">Portfolio</span>
              <h2 className="fom-section-title">Những dự án phản ánh năng lực và tầm nhìn của mình</h2>
            </div>
            <section className="fom-projects">
              {projects.map((exp, i) => {
                const shot = Array.isArray(exp.proofImages) ? exp.proofImages[0] : null;
                return (
                  <article className="fom-project" key={exp.id || i}>
                    {shot ? (
                      <button
                        type="button"
                        style={{ padding: 0, border: 0, background: 'none', cursor: 'zoom-in' }}
                        onClick={() => setPreview({ src: shot, fileName: exp.title || `Minh chứng ${i + 1}` })}
                      >
                        <img className="fom-project-shot" src={shot} alt={`Minh chứng của ${exp.title || 'dự án'}`} />
                      </button>
                    ) : (
                      <div className="fom-project-shot placeholder">{exp.organization || exp.title || 'Dự án'}</div>
                    )}
                    <div className="fom-project-body">
                      <h3>{exp.title || 'Vai trò'}</h3>
                      <div className="fom-project-meta">
                        <span>
                          {exp.organization || 'Tổ chức'}
                          {exp.startDate && ` · ${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - nay'}`}
                        </span>
                        {exp.verified && <span className="fom-project-verified"><BadgeCheck size={13} /> Xác thực</span>}
                        {exp.proofLink && (
                          <a
                            href={/^https?:/.test(exp.proofLink) ? exp.proofLink : `https://${exp.proofLink}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--fom-brand)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            Xem minh chứng <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {credentials.length === 0 && isDraft && (
          <div className="fom-heading-block" id="fom-credentials">
            <span className="fom-pill fom-eyebrow">Credentials</span>
            <DraftHint>Bằng cấp và chứng chỉ thêm ở bước 4. Bỏ qua được nếu bạn chưa có.</DraftHint>
          </div>
        )}

        {credentials.length > 0 && (
          <>
            <div className="fom-heading-block" id="fom-credentials">
              <span className="fom-pill fom-eyebrow">Credentials</span>
              <h2 className="fom-section-title">Bằng cấp &amp; chứng chỉ</h2>
            </div>
            <section className="fom-specialities">
              {credentials.map((c, i) => (
                <article className="fom-speciality" key={c.id || i}>
                  <Award size={48} />
                  <h3>{c.name}</h3>
                  <p>{c.issuer || 'Đơn vị cấp'}{c.issuedAt ? ` · ${c.issuedAt}` : ''}</p>
                  {c.fileData && (
                    <button
                      type="button"
                      className="fom-btn"
                      style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                      onClick={() => setPreview({ src: c.fileData, fileName: c.fileName })}
                    >
                      Xem file
                    </button>
                  )}
                </article>
              ))}
            </section>
          </>
        )}

        {!hasContent && <p className="fom-empty">Ứng viên chưa cập nhật thông tin portfolio.</p>}

        <footer className="fom-foot">
          {isDraft ? 'Bản xem trước Portfolio · fonlio' : 'Hồ sơ đã xác thực · fonlio'}
        </footer>
      </div>

      {preview && (
        <FilePreviewModal src={preview.src} fileName={preview.fileName} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
