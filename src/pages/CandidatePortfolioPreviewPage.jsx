import { useMemo } from 'react';
import { Award, BriefcaseBusiness, FileUp, ShieldCheck, Sparkles } from 'lucide-react';
import {
  PortfolioAvatar3D,
  PORTFOLIO_PREVIEW_STORAGE_PREFIX,
} from './CandidatePortfolioPage.jsx';

function readPortfolioDraft() {
  const params = new URLSearchParams(window.location.search);
  const draftId = params.get('draft');

  if (!draftId) return null;

  try {
    const rawDraft = localStorage.getItem(`${PORTFOLIO_PREVIEW_STORAGE_PREFIX}${draftId}`);
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch {
    return null;
  }
}

export function CandidatePortfolioPreviewPage() {
  const draft = useMemo(() => readPortfolioDraft(), []);
  const profile = draft?.profile || {};
  const experiences = draft?.experiences || [];
  const credentials = draft?.credentials || [];
  const skills = (profile.skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (!draft) {
    return (
      <section className="portfolio-preview-page">
        <div className="preview-empty-state">
          <Sparkles size={30} />
          <h1>Chưa có bản preview để hiển thị.</h1>
          <p>Quay lại trang tạo Portfolio và bấm “Xem trước” để mở bản nháp mới.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="portfolio-preview-page">
      <div className="public-portfolio-shell">
        <aside className="public-avatar-panel">
          <div className="avatar-stage">
            <PortfolioAvatar3D avatar={draft.avatar || { gender: draft.gender || 'female' }} />
          </div>
          <div className="public-profile-card">
            <span className="avatar-badge">
              <ShieldCheck size={16} />
              Portfolio draft
            </span>
            <h1>{profile.name || 'Tên ứng viên'}</h1>
            <p>{profile.headline || 'Headline nghề nghiệp'}</p>
            <div className="preview-meta">
              <span>{profile.school || 'Trường học'}</span>
              <span>{profile.location || 'Địa điểm'}</span>
            </div>
          </div>
        </aside>

        <main className="public-portfolio-content">
          <section className="public-section-card intro-card">
            <div className="preview-subheading">
              <Sparkles size={18} />
              <h2>Giới thiệu</h2>
            </div>
            <p className={profile.bio ? 'candidate-bio' : 'candidate-bio muted-preview'}>
              {profile.bio || 'Phần giới thiệu ngắn của ứng viên sẽ hiển thị tại đây sau khi nhập.'}
            </p>
            <div className="skill-cloud">
              {skills.length ? (
                skills.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <span>Kỹ năng sẽ hiển thị tại đây</span>
              )}
            </div>
          </section>

          <section className="public-section-card">
            <div className="preview-subheading">
              <BriefcaseBusiness size={18} />
              <h2>Kinh nghiệm nổi bật</h2>
            </div>
            <div className="experience-preview-list">
              {experiences.map((experience) => (
                <article className="experience-preview-card" key={experience.id}>
                  <span>{experience.organization || 'Tên tổ chức / dự án'}</span>
                  <h3>{experience.title || 'Vai trò / vị trí'}</h3>
                  <p>
                    {experience.detail ||
                      'Mô tả kinh nghiệm, kết quả và bằng chứng xác thực sẽ hiển thị tại đây.'}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="public-section-card">
            <div className="preview-subheading">
              <Award size={18} />
              <h2>Bằng cấp & chứng chỉ</h2>
            </div>
            <div className="credential-preview-list">
              {credentials.map((credential) => (
                <article className="credential-preview-card" key={credential.id}>
                  <span>{credential.issuer || 'Đơn vị cấp'}</span>
                  <h3>{credential.name || 'Tên bằng cấp / chứng chỉ'}</h3>
                  <p>{credential.issuedAt || 'Thời gian cấp'}</p>
                  <div className={credential.fileName ? 'credential-file-pill' : 'credential-file-pill muted'}>
                    <FileUp size={15} />
                    {credential.fileName || 'Chưa có file đính kèm'}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}
