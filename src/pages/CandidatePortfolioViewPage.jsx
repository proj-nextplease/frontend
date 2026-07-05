import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Award, BriefcaseBusiness, ShieldCheck, ArrowLeft, GraduationCap,
  MapPin, BadgeCheck, ExternalLink, Code2, Link2, Globe, Mail, Eye, FileUp,
} from 'lucide-react';
import { PortfolioAvatar3D } from './CandidatePortfolioPage.jsx';
import { getPublicProfile } from '../api/portfolioApi.js';
import { FilePreviewModal } from '../components/FilePreviewModal.jsx';

/** Mirror of BE ExpService: advancing level N -> N+1 costs floor(100 * N^1.2) EXP. */
function levelProgress(totalExp, level) {
  const lvl = Math.max(1, level || 1);
  const span = Math.floor(100 * Math.pow(lvl, 1.2));
  let reached = 0;
  for (let l = 1; l < lvl; l++) reached += Math.floor(100 * Math.pow(l, 1.2));
  const into = Math.max(0, (totalExp || 0) - reached);
  const pct = Math.min(100, Math.round((into / Math.max(1, span)) * 100));
  return { into, span, pct };
}

const SOCIAL_META = {
  github: { icon: Code2, label: 'GitHub', href: (v) => (/^https?:/.test(v) ? v : `https://github.com/${v}`) },
  linkedin: { icon: Link2, label: 'LinkedIn', href: (v) => (/^https?:/.test(v) ? v : `https://linkedin.com/in/${v}`) },
  website: { icon: Globe, label: 'Website', href: (v) => (/^https?:/.test(v) ? v : `https://${v}`) },
  email: { icon: Mail, label: 'Email', href: (v) => (v.startsWith('mailto:') ? v : `mailto:${v}`) },
};

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
      <section className="vp-page">
        <div className="vp-loading"><div className="vp-spinner" /><span>Đang tải hồ sơ ứng viên...</span></div>
      </section>
    );
  }
  if (error || !profile) {
    return (
      <section className="vp-page">
        <div className="vp-loading">
          <p style={{ color: '#dc2626', fontWeight: 700 }}>{error || 'Không tìm thấy hồ sơ.'}</p>
          <button className="vp-close" onClick={() => window.close()}>Đóng tab</button>
        </div>
      </section>
    );
  }
  return <VerifiedPassport profile={profile} />;
}

/**
 * Shared presentational passport used both by the public /portfolio/view/:id page
 * (real, saved data with reputation/level) and the draft preview page (unsaved
 * editor state, no reputation stats yet). `isDraft` tones down claims that only
 * hold for a saved, live profile — no invented stats.
 */
export function VerifiedPassport({ profile, isDraft = false }) {
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  const credentials = (Array.isArray(profile.credentials) ? profile.credentials : []).filter(c => c.name?.trim());
  const avatar = profile.avatar && Object.keys(profile.avatar).length > 0 ? profile.avatar : { gender: 'male' };
  const socialLinks = profile.socialLinks && typeof profile.socialLinks === 'object' ? profile.socialLinks : {};

  const [preview, setPreview] = useState(null);
  const hasStats = typeof profile.reputationScore === 'number' && typeof profile.currentLevel === 'number';
  const rs = profile.reputationScore || 0;
  const level = profile.currentLevel || 1;
  const totalExp = profile.totalExp || 0;
  const { pct } = useMemo(() => levelProgress(totalExp, level), [totalExp, level]);
  const verifiedCount = experiences.filter(e => e.verified).length;

  const socialEntries = Object.entries(socialLinks)
    .filter(([k, v]) => SOCIAL_META[k] && typeof v === 'string' && v.trim())
    .map(([k, v]) => ({ key: k, value: v.trim(), ...SOCIAL_META[k] }));

  const themeClass = profile.selectedTheme && profile.selectedTheme !== 'DEFAULT' ? `theme-${profile.selectedTheme}` : '';
  const hasContent = profile.bio || skills.length || experiences.length || credentials.length;

  return (
    <section className={`vp-page ${themeClass}`}>
      <PassportThemeStyles />
      <div className="vp-topbar">
        <button className="vp-close" onClick={() => window.close()}><ArrowLeft size={15} /> Đóng</button>
        <span className="vp-brand">
          {isDraft ? <Eye size={14} /> : <ShieldCheck size={14} />}
          {isDraft ? 'Bản xem trước Portfolio' : 'Hồ sơ đã xác thực'} · next please
        </span>
      </div>

      <div className="vp-shell">
        <header className="vp-hero vp-reveal">
          <div className="vp-portrait"><div className="vp-portrait-stage"><PortfolioAvatar3D avatar={avatar} /></div></div>
          <div className="vp-identity">
            <div className="vp-badges">
              {isDraft ? (
                <span className="vp-badge draft"><Eye size={14} /> Bản nháp, chưa lưu</span>
              ) : (
                <span className="vp-badge verified"><BadgeCheck size={14} /> Đã xác thực</span>
              )}
              {profile.openToWork && <span className="vp-badge open"><BriefcaseBusiness size={13} /> Đang tìm việc</span>}
            </div>
            <h1 className="vp-name">{profile.name || 'Ứng viên'}</h1>
            {profile.headline && <p className="vp-headline">{profile.headline}</p>}
            <div className="vp-meta">
              {profile.school && <span><GraduationCap size={15} /> {profile.school}</span>}
              {profile.location && <span><MapPin size={15} /> {profile.location}</span>}
            </div>
            {socialEntries.length > 0 && (
              <div className="vp-social">
                {socialEntries.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a key={s.key} className="vp-social-link" href={s.href(s.value)} target="_blank" rel="noreferrer" title={s.label}>
                      <Icon size={16} /> <span>{s.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {hasStats && (
          <div className="vp-stats vp-reveal">
            <div className="vp-stat"><span className="vp-stat-label">Điểm uy tín</span><span className="vp-stat-value">{rs.toLocaleString('vi-VN')}</span></div>
            <div className="vp-stat vp-stat-level">
              <span className="vp-stat-label">Cấp độ</span>
              <span className="vp-stat-value">{level}</span>
              <span className="vp-stat-bar"><span style={{ width: `${pct}%` }} /></span>
            </div>
            <div className="vp-stat"><span className="vp-stat-label">Minh chứng xác thực</span><span className="vp-stat-value">{verifiedCount}</span></div>
          </div>
        )}

        {profile.bio && (
          <section className="vp-section vp-section-bio vp-reveal">
            <h2 className="vp-section-title">Giới thiệu</h2>
            <p className="vp-bio">{profile.bio}</p>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="vp-section vp-reveal">
            <h2 className="vp-section-title">Kinh nghiệm đã xác thực</h2>
            <div className="vp-timeline">
              {experiences.map((exp, i) => (
                <article className="vp-tl-item" key={exp.id || i}>
                  <span className="vp-tl-dot" />
                  <div className="vp-tl-head">
                    <h3>{exp.title || 'Vai trò'}</h3>
                    {exp.verified && <span className="vp-badge verified sm"><BadgeCheck size={12} /> Xác thực</span>}
                  </div>
                  <div className="vp-tl-meta">
                    {exp.organization || 'Tổ chức'}
                    {exp.startDate && ` · ${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - nay'}`}
                  </div>
                  {exp.detail && <p className="vp-tl-detail">{exp.detail}</p>}
                  {Array.isArray(exp.proofImages) && exp.proofImages.length > 0 && (
                    <div className="vp-tl-proof-grid">
                      {exp.proofImages.map((img, imgI) => (
                        <button
                          key={imgI}
                          type="button"
                          className="vp-tl-proof-thumb"
                          onClick={() => setPreview({ src: img, fileName: `Minh chứng ${imgI + 1}` })}
                        >
                          <img src={img} alt="Ảnh minh chứng" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="vp-tl-foot">
                    {(exp.expReward || exp.rsReward) && (
                      <span className="vp-reward">+{exp.expReward || 0} EXP · +{exp.rsReward || 0} RS</span>
                    )}
                    {exp.proofLink && (
                      <a className="vp-prooflink" href={/^https?:/.test(exp.proofLink) ? exp.proofLink : `https://${exp.proofLink}`} target="_blank" rel="noreferrer">
                        Xem minh chứng <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {credentials.length > 0 && (
          <section className="vp-section vp-reveal">
            <h2 className="vp-section-title">Bằng cấp & chứng chỉ</h2>
            <div className="vp-cred-list">
              {credentials.map((c, i) => (
                <div className="vp-cred" key={c.id || i}>
                  <Award size={16} />
                  <div>
                    <h3>{c.name}</h3>
                    <span>{c.issuer || 'Đơn vị cấp'}{c.issuedAt ? ` · ${c.issuedAt}` : ''}</span>
                  </div>
                  {c.fileData && (
                    <button
                      type="button"
                      className="vp-cred-file"
                      onClick={() => setPreview({ src: c.fileData, fileName: c.fileName })}
                    >
                      <FileUp size={13} /> Xem file
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="vp-section vp-reveal">
            <h2 className="vp-section-title">Kỹ năng</h2>
            <div className="vp-skills">{skills.map((s, i) => <span key={i} className="vp-skill">{s}</span>)}</div>
          </section>
        )}

        {!hasContent && (
          <section className="vp-section"><p className="vp-empty">Ứng viên chưa cập nhật thông tin portfolio.</p></section>
        )}
      </div>

      {preview && (
        <FilePreviewModal src={preview.src} fileName={preview.fileName} onClose={() => setPreview(null)} />
      )}
    </section>
  );
}

/** Preset theme accents (kept subtle to preserve the editorial language). */
function PassportThemeStyles() {
  return (
    <style>{`
      .vp-page.theme-DARK_GOLD { --vp-accent:#c2831a; }
      .vp-page.theme-CYBERPUNK { --vp-accent:#c026d3; }
      .vp-page.theme-EMERALD_CLASSIC { --vp-accent:#047857; }
    `}</style>
  );
}
