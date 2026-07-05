import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import {
  PORTFOLIO_PREVIEW_STORAGE_PREFIX,
} from './CandidatePortfolioPage.jsx';
import { VerifiedPassport } from './CandidatePortfolioViewPage.jsx';

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

/**
 * Draft preview, opened in a new tab from the editor (or the header dropdown)
 * before anything is saved. Renders through the same `VerifiedPassport` used by
 * the real public profile so a candidate previews exactly what recruiters will
 * eventually see — just with `isDraft` toned down (no reputation stats yet,
 * since those belong to the saved account, not an unsaved draft).
 */
export function CandidatePortfolioPreviewPage() {
  const draft = useMemo(() => readPortfolioDraft(), []);

  if (!draft) {
    return (
      <section className="vp-page">
        <div className="vp-loading">
          <Sparkles size={28} />
          <p style={{ fontWeight: 700 }}>Chưa có bản xem trước để hiển thị.</p>
          <span>Quay lại trang tạo Portfolio và bấm "Xem trước" để mở bản nháp mới.</span>
        </div>
      </section>
    );
  }

  const draftProfile = draft.profile || {};
  const skills = (draftProfile.skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const normalizedProfile = {
    name: draftProfile.name,
    headline: draftProfile.headline,
    school: draftProfile.school,
    location: draftProfile.location,
    bio: draftProfile.bio,
    skills,
    avatar: draft.avatar || { gender: draft.gender || 'female' },
    experiences: draft.experiences || [],
    credentials: draft.credentials || [],
    openToWork: !!draftProfile.openToWork,
    socialLinks: draftProfile.socialLinks || {},
    // No reputationScore/currentLevel/totalExp: those are account-level growth
    // values, not accurate for an unsaved draft, so the stat strip stays hidden.
  };

  return <VerifiedPassport profile={normalizedProfile} isDraft />;
}
