import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import {
  PORTFOLIO_PREVIEW_STORAGE_PREFIX,
} from './CandidatePortfolioPage.jsx';
import { VerifiedPassport } from './CandidatePortfolioViewPage.jsx';
import { toPassportProfile } from '../lib/portfolioDraft.js';

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
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const themeOverride = urlParams.get('theme')?.toUpperCase();

  if (!draft) {
    const demoProfile = toPassportProfile({
      profile: {
        name: 'Trâm Nguyễn',
        headline: 'Digital Market-er & UI/UX Designer',
        major: 'Digital Marketing',
        school: 'Đại học FPT',
        location: 'Thành phố Hồ Chí Minh',
        bio: 'Mình là một người đam mê sáng tạo, luôn hướng tới việc kết hợp giữa tư duy phân tích thị trường và trải nghiệm người dùng tinh tế để mang lại giá trị thực tế cho từng dự án.',
        selectedTheme: themeOverride || 'FOMLIO',
        openToWork: true,
        socialLinks: {
          email: 'tram.nguyen@fpt.edu.vn',
          linkedin: 'tramnguyen',
          phone: '0909 123 456',
        },
        skills: [
          'Thiết kế giao diện',
          'Thiết kế đồ họa',
          'Marketing',
          'Phân tích tài chính',
          'Thiết kế website',
          'Nghiên cứu người dùng',
        ],
      },
      avatar: { gender: 'female' },
      experiences: [
        {
          title: 'Thiết kế Nền tảng E-Commerce Thời trang Thể thao',
          role: 'Lead UI/UX Designer',
          organization: 'Dự án Thương mại Điện tử',
          startDate: '10/2023',
          endDate: '04/2024',
          description:
            'Mô tả về dự án: Nghiên cứu hành vi mua sắm trực tuyến, tái cấu trúc luồng checkout 3 bước, xây dựng hệ thống design system với hơn 200 components và tối ưu tỷ lệ chuyển đổi đơn hàng tăng 38%.',
          verified: true,
        },
        {
          title: 'Ứng dụng Quản lý Tài chính & Đầu tư Cá nhân',
          role: 'Product Designer',
          organization: 'FinTech Innovation Lab',
          startDate: '05/2023',
          endDate: '09/2023',
          description:
            'Mô tả về dự án: Thiết kế giao diện theo dõi danh mục đầu tư theo thời gian thực, bảng phân tích dòng tiền trực quan bằng biểu đồ tương tác, mang lại sự tin cậy và tiện lợi tối đa cho người dùng trẻ.',
          verified: true,
        },
        {
          title: 'Hệ thống Quản lý Đào tạo & Khóa học Trực tuyến',
          role: 'UI Designer & Prototyper',
          organization: 'EdTech Platform',
          startDate: '01/2023',
          endDate: '05/2023',
          description:
            'Mô tả về dự án: Xây dựng cổng học tập số kết hợp lộ trình tương tác theo gamification, tích hợp hệ thống bài tập và nộp bài với giao diện thân thiện, hiện đại.',
          verified: false,
        },
      ],
      credentials: [],
    });
    return <VerifiedPassport profile={demoProfile} isDraft />;
  }

  const normalizedProfile = toPassportProfile({
    profile: {
      ...(draft.profile || {}),
      ...(themeOverride ? { selectedTheme: themeOverride } : {}),
    },
    avatar: draft.avatar || { gender: draft.gender || 'female' },
    experiences: draft.experiences,
    credentials: draft.credentials,
  });

  return <VerifiedPassport profile={normalizedProfile} isDraft />;
}
