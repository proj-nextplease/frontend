import { useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { VerifiedPassport } from './CandidatePortfolioViewPage.jsx';
import { toPassportProfile } from '../lib/portfolioDraft.js';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { loadPreviewDraft } from '../lib/previewDraftStore.js';

/**
 * Đọc bản nháp do trang sửa cất (IndexedDB). Trang sửa mở tab này NGAY lúc
 * bấm rồi mới cất bản nháp song song, nên bản nháp có thể chưa kịp có mặt khi
 * tab tải xong — chờ thêm một lúc trước khi kết luận là không có.
 */
async function waitForDraft(draftId) {
  if (!draftId) return loadPreviewDraft(null);
  const deadline = Date.now() + 8000;
  for (;;) {
    const draft = await loadPreviewDraft(draftId);
    if (draft || Date.now() > deadline) return draft;
    await new Promise((r) => setTimeout(r, 200));
  }
}

function draftToProfile(draft, theme) {
  return toPassportProfile({
    profile: { ...(draft.profile || {}), selectedTheme: theme },
    avatar: draft.avatar || { gender: draft.gender || 'female' },
    experiences: draft.experiences,
    credentials: draft.credentials,
  });
}

/**
 * Draft preview, opened in a new tab from the editor (or the header dropdown).
 * Renders candidate's actual draft or real profile from backend with the requested theme.
 */
export function CandidatePortfolioPreviewPage() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const themeOverride = urlParams.get('theme')?.toUpperCase();
  const savedTheme = useMemo(() => {
    try {
      return localStorage.getItem('fonlio:candidate-selected-theme');
    } catch {
      return null;
    }
  }, []);

  const draftId = urlParams.get('draft');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftMissing, setDraftMissing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const draft = await waitForDraft(draftId);
      if (draft) {
        const theme = themeOverride || draft.profile?.selectedTheme || savedTheme || 'PURPLE_AURA';
        return { profile: draftToProfile(draft, theme) };
      }
      // Mở từ nút "Xem trước" mà bản nháp không tới được: nói thẳng ra, đừng
      // lặng lẽ hiện bản đã lưu khiến người dùng tưởng thay đổi bị mất.
      if (draftId) return { missing: true };

      const activeTheme = themeOverride || savedTheme || 'PURPLE_AURA';
      try {
        const data = await getMyPortfolio();
        if (!data) return {};
        const normalized = toPassportProfile({
          profile: {
            name: data.name || '',
            headline: data.headline || '',
            school: data.school || '',
            location: data.location || '',
            bio: data.bio || '',
            skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
            openToWork: !!data.openToWork,
            socialLinks: data.socialLinks || {},
            coverBannerUrl: data.coverBannerUrl,
            coverBannerPos: data.coverBannerPos,
            selectedTheme: activeTheme || data.selectedTheme || 'PURPLE_AURA',
          },
          avatar: data.avatar || { gender: 'female' },
          experiences: data.experiences || [],
          credentials: data.credentials || [],
        });
        if (data.reputationScore) {
          normalized.reputationScore = data.reputationScore;
        }
        return { profile: normalized };
      } catch {
        // Chưa đăng nhập hoặc lỗi mạng: hiện hồ sơ mẫu bên dưới.
        return {};
      }
    }

    load().then((result) => {
      if (!isMounted) return;
      if (result.profile) setProfileData(result.profile);
      if (result.missing) setDraftMissing(true);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [draftId, themeOverride, savedTheme]);

  if (loading) {
    return (
      <div className="fom-page fom-page-state" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={28} />
        <p style={{ marginTop: '12px', color: '#7B3AEC' }}>Đang tải hồ sơ ứng viên...</p>
      </div>
    );
  }

  if (draftMissing) {
    return (
      <div className="fom-page fom-page-state" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <Sparkles size={28} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '12px 0 8px', color: '#fff' }}>
          Không mở được bản xem trước
        </h2>
        <p style={{ maxWidth: '440px', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', fontSize: '0.9rem' }}>
          Bản xem trước này không còn trong trình duyệt (có thể đã được thay bằng lần bấm “Xem trước” mới hơn).
          Hãy đóng tab này và bấm “Xem trước” lại ở trang sửa Portfolio.
        </p>
        <button type="button" className="fom-btn" onClick={() => window.close()}>Đóng tab</button>
      </div>
    );
  }

  // If we have real profile data (from draft or backend), render it
  if (profileData) {
    return <VerifiedPassport profile={profileData} isDraft={!profileData.id} />;
  }

  // Fallback demo profile without fake brands or fake contact numbers
  const fallbackDemo = toPassportProfile({
    profile: {
      name: 'Tài Phát',
      headline: 'Product Designer & Frontend Engineer',
      major: 'Kỹ thuật Phần mềm',
      school: 'Đại học FPT',
      location: 'Thành phố Hồ Chí Minh',
      bio: 'Đam mê xây dựng trải nghiệm người dùng hiện đại, kết hợp thẩm mỹ tinh tế và hiệu năng mượt mà.',
      selectedTheme: themeOverride || savedTheme || 'PURPLE_AURA',
      openToWork: true,
      socialLinks: {},
      skills: [
        'Thiết kế giao diện',
        'Thiết kế đồ họa',
        'Frontend Development',
        'Nghiên cứu người dùng',
        'Hệ thống Design System',
      ],
    },
    avatar: { gender: 'female' },
    experiences: [
      {
        title: 'Xây dựng Nền tảng Portfolio fonlio',
        role: 'Lead UI/UX & Frontend',
        organization: 'fonlio Platform',
        startDate: '02/10/2023',
        endDate: 'Hiện tại',
        description:
          'Thiết kế giao diện người dùng, đồng bộ trải nghiệm đa nền tảng và tối ưu hóa hiệu năng render các theme portfolio.',
        verified: true,
      },
      {
        title: 'Hệ thống Quản lý Dự án & Minh chứng Thực chiến',
        role: 'Product Designer',
        organization: 'Dự án Công nghệ fonlio',
        startDate: '15/05/2023',
        endDate: '30/09/2023',
        description:
          'Xây dựng luồng xác thực kinh nghiệm với bảo chứng phân tầng và bảng điều khiển tổng quan trực quan.',
        verified: true,
      },
    ],
    credentials: [],
  });

  return <VerifiedPassport profile={fallbackDemo} isDraft />;
}
