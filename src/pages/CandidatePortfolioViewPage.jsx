import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Award, BriefcaseBusiness, FileUp, ShieldCheck, Sparkles, ArrowLeft, GraduationCap } from 'lucide-react';
import { PortfolioAvatar3D } from './CandidatePortfolioPage.jsx';
import { getPublicProfile } from '../api/portfolioApi.js';

export function CandidatePortfolioViewPage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPublicProfile(userId)
      .then(setProfile)
      .catch(err => setError(err.message || 'Không thể tải hồ sơ.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <section className="portfolio-preview-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', color: 'var(--muted)' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Đang tải hồ sơ ứng viên...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="portfolio-preview-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#dc2626' }}>{error || 'Không tìm thấy hồ sơ.'}</p>
          <button onClick={() => window.close()} style={{ padding: '8px 20px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}>Đóng tab</button>
        </div>
      </section>
    );
  }

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  const credentials = Array.isArray(profile.credentials) ? profile.credentials : [];
  const avatar = profile.avatar && Object.keys(profile.avatar).length > 0 ? profile.avatar : { gender: 'male' };

  return (
    <section className="portfolio-preview-page">
      {/* Close button */}
      <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100 }}>
        <button onClick={() => window.close()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', color: '#fff', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '600' }}>
          <ArrowLeft size={14} /> Đóng
        </button>
      </div>

      <div className="public-portfolio-shell">
        <aside className="public-avatar-panel">
          <div className="avatar-stage">
            <PortfolioAvatar3D avatar={avatar} />
          </div>
          <div className="public-profile-card">
            <span className="avatar-badge">
              <ShieldCheck size={16} />
              Portfolio ứng viên
            </span>
            <h1>{profile.name || 'Ứng viên'}</h1>
            <p>{profile.headline || ''}</p>
            <div className="preview-meta">
              {profile.school && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GraduationCap size={13} /> {profile.school}</span>}
              {profile.location && <span>📍 {profile.location}</span>}
            </div>
          </div>
        </aside>

        <main className="public-portfolio-content">
          {/* Bio + Skills */}
          <section className="public-section-card intro-card">
            <div className="preview-subheading">
              <Sparkles size={18} />
              <h2>Giới thiệu</h2>
            </div>
            <p className={profile.bio ? 'candidate-bio' : 'candidate-bio muted-preview'}>
              {profile.bio || 'Ứng viên chưa thêm phần giới thiệu.'}
            </p>
            {skills.length > 0 && (
              <div className="skill-cloud">
                {skills.map((skill, i) => <span key={i}>{skill}</span>)}
              </div>
            )}
          </section>

          {/* Experiences */}
          {experiences.length > 0 && (
            <section className="public-section-card">
              <div className="preview-subheading">
                <BriefcaseBusiness size={18} />
                <h2>Kinh nghiệm nổi bật</h2>
              </div>
              <div className="experience-preview-list">
                {experiences.map((exp, i) => (
                  <article className="experience-preview-card" key={exp.id || i}>
                    <span>
                      {exp.projectName || exp.project_name || exp.organization || 'Tên tổ chức / dự án'}
                      {(exp.startedAt || exp.started_at) && ` (${exp.startedAt || exp.started_at}${(exp.endedAt || exp.ended_at) ? ` - ${exp.endedAt || exp.ended_at}` : ''})`}
                    </span>
                    <h3>{exp.position || exp.role || exp.title || 'Vai trò / vị trí'}</h3>
                    <p>{exp.description || exp.detail || 'Mô tả kinh nghiệm, kết quả và bằng chứng xác thực sẽ hiển thị tại đây.'}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Credentials */}
          {credentials.filter(c => c.name?.trim()).length > 0 && (
            <section className="public-section-card">
              <div className="preview-subheading">
                <Award size={18} />
                <h2>Bằng cấp & chứng chỉ</h2>
              </div>
              <div className="credential-preview-list">
                {credentials.filter(c => c.name?.trim()).map((cred, i) => (
                  <article className="credential-preview-card" key={cred.id || i}>
                    <span>{cred.issuer || 'Đơn vị cấp'}</span>
                    <h3>{cred.name}</h3>
                    <p>{cred.issuedAt || ''}</p>
                    {cred.fileName && (
                      <div className="credential-file-pill">
                        <FileUp size={15} />
                        {cred.fileName}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {!profile.bio && skills.length === 0 && experiences.length === 0 && credentials.length === 0 && (
            <section className="public-section-card">
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>Ứng viên chưa cập nhật thông tin portfolio.</p>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}
