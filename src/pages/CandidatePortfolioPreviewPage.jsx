import { useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import {
  PORTFOLIO_PREVIEW_STORAGE_PREFIX,
} from './CandidatePortfolioPage.jsx';
import { VerifiedPassport } from './CandidatePortfolioViewPage.jsx';
import { toPassportProfile } from '../lib/portfolioDraft.js';
import { getMyPortfolio } from '../api/portfolioApi.js';

function readPortfolioDraft() {
  const params = new URLSearchParams(window.location.search);
  const draftId = params.get('draft');

  if (draftId) {
    try {
      const rawDraft = localStorage.getItem(`${PORTFOLIO_PREVIEW_STORAGE_PREFIX}${draftId}`);
      if (rawDraft) return JSON.parse(rawDraft);
    } catch {
      // ignore
    }
  }

  // Look for any recent preview drafts saved in localStorage
  try {
    let latestKey = null;
    let latestTime = 0;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PORTFOLIO_PREVIEW_STORAGE_PREFIX)) {
        const timestamp = parseInt(key.replace(PORTFOLIO_PREVIEW_STORAGE_PREFIX, ''), 10) || 0;
        if (timestamp > latestTime) {
          latestTime = timestamp;
          latestKey = key;
        }
      }
    }
    if (latestKey) {
      const rawDraft = localStorage.getItem(latestKey);
      if (rawDraft) return JSON.parse(rawDraft);
    }
  } catch {
    // ignore
  }

  return null;
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

  const initialDraft = useMemo(() => readPortfolioDraft(), []);
  const activeTheme = themeOverride || initialDraft?.profile?.selectedTheme || savedTheme || 'PURPLE_AURA';

  const [profileData, setProfileData] = useState(() => {
    if (initialDraft) {
      return toPassportProfile({
        profile: {
          ...(initialDraft.profile || {}),
          selectedTheme: activeTheme,
        },
        avatar: initialDraft.avatar || { gender: initialDraft.gender || 'female' },
        experiences: initialDraft.experiences,
        credentials: initialDraft.credentials,
      });
    }
    return null;
  });

  const [loading, setLoading] = useState(!initialDraft);

  useEffect(() => {
    if (initialDraft) return;

    let isMounted = true;
    getMyPortfolio()
      .then((data) => {
        if (!isMounted || !data) return;
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
        setProfileData(normalized);
      })
      .catch(() => {
        // Not logged in or network error, fallback will take over
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialDraft, activeTheme]);

  if (loading) {
    return (
      <div className="fom-page fom-page-state" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={28} />
        <p style={{ marginTop: '12px', color: '#7B3AEC' }}>Đang tải hồ sơ ứng viên...</p>
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
      selectedTheme: activeTheme,
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
        startDate: '10/2023',
        endDate: 'Hiện tại',
        description:
          'Thiết kế giao diện người dùng, đồng bộ trải nghiệm đa nền tảng và tối ưu hóa hiệu năng render các theme portfolio.',
        verified: true,
      },
      {
        title: 'Hệ thống Quản lý Dự án & Minh chứng Thực chiến',
        role: 'Product Designer',
        organization: 'Dự án Công nghệ fonlio',
        startDate: '05/2023',
        endDate: '09/2023',
        description:
          'Xây dựng luồng xác thực kinh nghiệm với bảo chứng phân tầng và bảng điều khiển tổng quan trực quan.',
        verified: true,
      },
    ],
    credentials: [],
  });

  return <VerifiedPassport profile={fallbackDemo} isDraft />;
}
