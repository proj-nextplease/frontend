import { useMemo, useState } from 'react';
import { Award, BriefcaseBusiness, FileUp, ShieldCheck, Sparkles } from 'lucide-react';
import {
  PortfolioAvatar3D,
  PORTFOLIO_PREVIEW_STORAGE_PREFIX,
} from './CandidatePortfolioPage.jsx';
import { FilePreviewModal } from '../components/FilePreviewModal.jsx';
import { EXPERIENCE_CATEGORY_OPTIONS, EXPERIENCE_ROLE_LEVEL_OPTIONS } from '../constants/experience.js';

const CATEGORY_LABEL = Object.fromEntries(
  EXPERIENCE_CATEGORY_OPTIONS.map((o) => [o.value, o.label.replace(/ \(\+.*$/, '')]),
);
const ROLE_LABEL = Object.fromEntries(
  EXPERIENCE_ROLE_LEVEL_OPTIONS.map((o) => [o.value, o.label.replace(/ \(\+.*$/, '')]),
);

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
  const [preview, setPreview] = useState(null);

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
                  <span>
                    {experience.organization || 'Tên tổ chức / dự án'}
                    {(experience.startDate || experience.endDate) && ` (${experience.startDate || '?'}${experience.endDate ? ` - ${experience.endDate}` : ''})`}
                  </span>
                  <h3>{experience.title || 'Vai trò / vị trí'}</h3>
                  {(experience.category || experience.roleLevel) && (
                    <div className="experience-tag-row">
                      {experience.category && CATEGORY_LABEL[experience.category] && (
                        <span className="experience-tag category">{CATEGORY_LABEL[experience.category]}</span>
                      )}
                      {experience.roleLevel && ROLE_LABEL[experience.roleLevel] && (
                        <span className="experience-tag role">{ROLE_LABEL[experience.roleLevel]}</span>
                      )}
                    </div>
                  )}
                  <p>
                    {experience.detail ||
                      'Mô tả kinh nghiệm, kết quả và bằng chứng xác thực sẽ hiển thị tại đây.'}
                  </p>
                  {experience.proofLink && (
                    <a className="experience-proof-link" href={experience.proofLink} target="_blank" rel="noopener noreferrer">
                      <FileUp size={14} /> Link minh chứng
                    </a>
                  )}
                  {(experience.proofImages || []).length > 0 && (
                    <div className="experience-proof-grid">
                      {experience.proofImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreview({ src: img, fileName: `Minh chứng ${i + 1}` })}
                          className="experience-proof-thumb"
                        >
                          <img src={img} alt="Ảnh minh chứng kinh nghiệm" />
                        </button>
                      ))}
                    </div>
                  )}
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
                  {credential.fileName && credential.fileData ? (
                    <button
                      type="button"
                      onClick={() => setPreview({ src: credential.fileData, fileName: credential.fileName })}
                      className="credential-file-pill is-link"
                    >
                      <FileUp size={15} />
                      Xem file: {credential.fileName}
                    </button>
                  ) : (
                    <div className={credential.fileName ? 'credential-file-pill' : 'credential-file-pill muted'}>
                      <FileUp size={15} />
                      {credential.fileName || 'Chưa có file đính kèm'}
                    </div>
                  )}
                  {credential.fileData && /^data:image\//.test(credential.fileData) && (
                    <button
                      type="button"
                      onClick={() => setPreview({ src: credential.fileData, fileName: credential.fileName })}
                      className="credential-file-preview"
                    >
                      <img src={credential.fileData} alt={credential.fileName} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
      {preview && (
        <FilePreviewModal
          src={preview.src}
          fileName={preview.fileName}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}
