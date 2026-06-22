/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Compass,
  Crown,
  FileText,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  WalletCards,
  Zap,
  LogOut,
  RefreshCw,
  Building,
  AlertTriangle,
  MapPin,
  Calendar,
  BadgeCheck,
  Check,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { PortfolioAvatar3D } from './CandidatePortfolioPage.jsx';
import { getJobs, getCompanies, getCompanyDetail, getJobDetail } from '../api/jobApi.js';
import { getMyCredentialSubmissions, submitCredential } from '../api/credentialApi.js';
import { applyToJob, getMyApplications, withdrawApplication } from '../api/applicationApi.js';
import { getWallet, topUp, buyPremium } from '../api/walletApi.js';
import { searchQuests, applyToQuest, getMyQuestApplications, withdrawQuestApplication } from '../api/questApi.js';
import { supabase } from '../services/supabaseClient.js';

const CATEGORY_MAP = {
  TECH: {
    label: 'Công nghệ & Kỹ thuật',
    specialties: [
      { value: 'SOFTWARE_ENG', label: 'Kỹ thuật phần mềm' },
      { value: 'INFO_SYSTEMS', label: 'Hệ thống thông tin' },
      { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu' },
      { value: 'CYBER_SEC', label: 'An toàn thông tin' },
      { value: 'OTHER_TECH', label: 'Lĩnh vực công nghệ khác' },
    ]
  },
  BUSINESS: {
    label: 'Kinh tế & Quản lý',
    specialties: [
      { value: 'MARKETING', label: 'Marketing / PR / Quảng cáo' },
      { value: 'FINANCE_ACC', label: 'Tài chính / Kế toán / Kiểm toán' },
      { value: 'BUSINESS_ADMIN', label: 'Quản trị kinh doanh / Vận hành' },
      { value: 'HR', label: 'Quản trị nhân sự' },
      { value: 'LOGISTICS', label: 'Logistics & Chuỗi cung ứng' },
      { value: 'OTHER_BIZ', label: 'Lĩnh vực kinh doanh khác' },
    ]
  },
  DESIGN: {
    label: 'Thiết kế & Nghệ thuật',
    specialties: [
      { value: 'GRAPHIC_DESIGN', label: 'Thiết kế đồ họa' },
      { value: 'UI_UX', label: 'Thiết kế giao diện UI/UX' },
      { value: 'FASHION', label: 'Thời trang / Nội thất' },
      { value: 'OTHER_DESIGN', label: 'Lĩnh vực thiết kế khác' },
    ]
  },
  MEDIA: {
    label: 'Truyền thông & Sự kiện',
    specialties: [
      { value: 'EVENT_PLANNING', label: 'Tổ chức sự kiện' },
      { value: 'CONTENT_CREATIVE', label: 'Sáng tạo nội dung / Copywriter' },
      { value: 'VIDEO_PRODUCTION', label: 'Quay dựng phim / Biên tập video' },
      { value: 'OTHER_MEDIA', label: 'Lĩnh vực truyền thông khác' },
    ]
  },
  LANGUAGE: {
    label: 'Ngôn ngữ & Nhân văn',
    specialties: [
      { value: 'TRANSLATION', label: 'Biên phiên dịch' },
      { value: 'TEACHING', label: 'Giảng dạy / Sư phạm / Đào tạo' },
      { value: 'OTHER_LANG', label: 'Lĩnh vực ngôn ngữ khác' },
    ]
  },
  OTHER: {
    label: 'Lĩnh vực khác',
    specialties: [
      { value: 'OTHER', label: 'Công việc / Lĩnh vực khác' }
    ]
  }
};

const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function compareMonthValues(left, right) {
  if (!left || !right) return 0;
  return left.localeCompare(right);
}

function formatMonthValue(value) {
  if (!value) return 'Chọn tháng / năm';
  const [year, month] = value.split('-');
  const monthIndex = Number(month) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11) return 'Chọn tháng / năm';
  return `${MONTH_LABELS[monthIndex]} ${year}`;
}

function CredentialMonthPicker({ id, label, value, minValue, maxValue, openPicker, setOpenPicker, onChange, helperText }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, index) => currentYear - index);
  const isOpen = openPicker === id;

  function isDisabled(monthValue) {
    if (maxValue && compareMonthValues(monthValue, maxValue) > 0) return true;
    if (minValue && compareMonthValues(monthValue, minValue) < 0) return true;
    return false;
  }

  return (
    <div className="credential-month-field">
      {label && <label className="form-label">{label}</label>}
      <button
        type="button"
        className={`credential-month-trigger ${value ? 'has-value' : ''}`}
        onClick={() => setOpenPicker(isOpen ? null : id)}
        aria-expanded={isOpen}
      >
        <span>
          <Calendar size={16} />
          {formatMonthValue(value)}
        </span>
        <span className="credential-month-trigger-dot" />
      </button>
      {helperText && <p className="credential-month-helper">{helperText}</p>}

      {isOpen && (
        <div className="credential-month-popover">
          {years.map((year) => (
            <div className="credential-month-year" key={year}>
              <div className="credential-month-year-label">{year}</div>
              <div className="credential-month-grid">
                {MONTH_LABELS.map((monthLabel, index) => {
                  const monthValue = `${year}-${String(index + 1).padStart(2, '0')}`;
                  const disabled = isDisabled(monthValue);
                  return (
                    <button
                      key={monthValue}
                      type="button"
                      className={`credential-month-option ${value === monthValue ? 'selected' : ''}`}
                      disabled={disabled}
                      onClick={() => {
                        onChange(monthValue);
                        setOpenPicker(null);
                      }}
                    >
                      {monthLabel.replace('Tháng ', 'T')}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const JOB_TYPES = [
  { value: 'INTERNSHIP', label: 'Thực tập sinh (Internship)' },
  { value: 'PART_TIME', label: 'Bán thời gian (Part-time)' },
  { value: 'FREELANCE', label: 'Công việc tự do (Freelance)' },
  { value: 'EVENT_STAFF', label: 'Nhân sự sự kiện (Event staff)' },
  { value: 'MICRO_INTERNSHIP', label: 'Thực tập ngắn hạn / Dự án (Micro-internship)' },
];

function getCategoryTone(category) {
  if (category === 'BUSINESS' || category === 'LANGUAGE') return 'green';
  if (category === 'DESIGN' || category === 'MEDIA') return 'pink';
  return ''; // default blue
}

function getCompanyGradient(name) {
  const hash = Array.from(name || '').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'linear-gradient(135deg, #f97316, #ea580c)',
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #10b981, #047857)',
    'linear-gradient(135deg, #6366f1, #4338ca)',
  ];
  return gradients[hash % gradients.length];
}

const defaultMockOrganizations = [
  {
    id: 'org-1',
    name: 'FPT Software',
    type: 'BUSINESS',
    companyType: 'SME',
    description: 'Tập đoàn công nghệ hàng đầu Việt Nam, cung cấp dịch vụ xuất khẩu phần mềm, tích hợp hệ thống và giải pháp số toàn cầu.',
    logoColor: 'linear-gradient(135deg, #f97316, #ea580c)',
    location: 'Hà Nội & TP. Hồ Chí Minh',
    industry: 'Công nghệ thông tin',
    website: 'https://fptsoftware.com',
    verified: true
  },
  {
    id: 'org-2',
    name: 'VNG Corporation',
    type: 'BUSINESS',
    companyType: 'STARTUP',
    description: 'Công ty công nghệ kỳ lân hàng đầu tại Việt Nam, sở hữu hệ sinh thái Zing, Zalo, ZaloPay và phát hành trò chơi trực tuyến hàng đầu.',
    logoColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    location: 'TP. Hồ Chí Minh',
    industry: 'Giải trí & Nội dung số',
    website: 'https://vng.com.vn',
    verified: true
  },
  {
    id: 'org-3',
    name: 'Viettel Group',
    type: 'BUSINESS',
    companyType: 'SME',
    description: 'Tập đoàn Công nghiệp - Viễn thông Quân đội, cung cấp hạ tầng số, viễn thông và dịch vụ tài chính số hàng đầu khu vực.',
    logoColor: 'linear-gradient(135deg, #dc2626, #991b1b)',
    location: 'Hà Nội',
    industry: 'Viễn thông & Công nghiệp quốc phòng',
    website: 'https://viettel.com.vn',
    verified: true
  },
  {
    id: 'org-4',
    name: 'UEH Marketing Club',
    type: 'CLUB',
    companyType: 'CLUB',
    description: 'Câu lạc bộ học thuật chuyên sâu về Marketing thuộc Trường Đại học Kinh tế TP. Hồ Chí Minh, tổ chức các cuộc thi lớn như Bản lĩnh Marketer.',
    logoColor: 'linear-gradient(135deg, #ec4899, #db2777)',
    location: 'UEH TP. Hồ Chí Minh',
    industry: 'Marketing & Sự kiện sinh viên',
    website: 'https://uehmclub.org',
    verified: true
  },
  {
    id: 'org-5',
    name: 'FPT University Developer Club',
    type: 'CLUB',
    companyType: 'CLUB',
    description: 'Cộng đồng lập trình viên sinh viên tại Đại học FPT, chuyên kết nối học thuật, nghiên cứu công nghệ mới và tổ chức Hackathon.',
    logoColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    location: 'Đại học FPT Q9, TP. HCM',
    industry: 'Lập trình & Kỹ thuật phần mềm',
    website: 'https://fudc.dev',
    verified: true
  }
];

/* ─── Apply modal: candidate profile snapshot ─────────────────────────────── */
function CandidateProfilePreview({ portfolio, candidateRs, currentLevel, currentExp }) {
  const rs = portfolio?.reputationScore ?? candidateRs ?? 0;

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hồ sơ của bạn</p>

      {/* Avatar + name + headline + school */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e5533f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.05rem', color: '#fff', flexShrink: 0 }}>
          {portfolio?.name ? portfolio.name.slice(0, 2).toUpperCase() : 'UV'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: '0.94rem', display: 'block', color: 'var(--ink)' }}>{portfolio?.name || 'Ứng viên'}</strong>
          {portfolio?.headline && <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>{portfolio.headline}</span>}
          {portfolio?.school && (
            <span style={{ fontSize: '0.76rem', color: '#e5533f', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <BadgeCheck size={13} /> {portfolio.school}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[{ label: 'RS', val: rs, color: '#e5533f' }, { label: 'Level', val: currentLevel, color: '#d97706' }, { label: 'EXP', val: currentExp, color: '#7c3aed' }].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', background: `${s.color}08`, borderRadius: '10px', border: `1px solid ${s.color}20` }}>
            <strong style={{ fontSize: '0.9rem', color: s.color, display: 'block' }}>{s.val}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: '700' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* View full portfolio link */}
      <a
        href="/portfolio/edit"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-soft)', color: 'var(--ink)', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-soft)'}
      >
        <ExternalLink size={14} /> Xem lại Portfolio của bạn
      </a>
    </div>
  );
}

export function CandidateDashboardPage({ initialPortfolio }) {
  const navigate = useNavigate();
  const { tabSlug } = useParams();
  const location = useLocation();

  const [portfolio, setPortfolio] = useState(initialPortfolio || null);
  const [loading, setLoading] = useState(!initialPortfolio);
  const [activeView, setActiveView] = useState('OVERVIEW'); // OVERVIEW, OPPORTUNITIES, ROADMAP, CREDENTIALS, ORGANIZATIONS, ORGANIZATION_DETAIL, MY_APPLICATIONS
  const [myAppsTab, setMyAppsTab] = useState('BUSINESS'); // BUSINESS | CLUB
  const [myAppsSearch, setMyAppsSearch] = useState('');
  const [myAppsStatusFilter, setMyAppsStatusFilter] = useState('');
  const [myAppsClubSearch, setMyAppsClubSearch] = useState('');
  const [myAppsClubStatusFilter, setMyAppsClubStatusFilter] = useState('');

  // Candidate dashboard is light-only (warm flat language).
  useEffect(() => {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
  }, []);

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('nextplease:candidate-sidebar-collapsed') === 'true';
  });

  // Application states
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyFormFields, setApplyFormFields] = useState([]);
  const [applyAnswers, setApplyAnswers] = useState({});
  const [applyModalLoading, setApplyModalLoading] = useState(false);
  const [applyModalError, setApplyModalError] = useState('');
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [showPremiumPaywall, setShowPremiumPaywall] = useState(false);

  // Withdraw states
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawError, setWithdrawError] = useState('');

  // Wallet & Premium states
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState('');
  const [topUpSuccess, setTopUpSuccess] = useState('');
  const [buyPremiumLoading, setBuyPremiumLoading] = useState(false);
  const [buyPremiumError, setBuyPremiumError] = useState('');

  // Quest states
  const [questsList, setQuestsList] = useState([]);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [questApplications, setQuestApplications] = useState([]);
  const [questApplyLoading, setQuestApplyLoading] = useState(false);
  const [questApplyError, setQuestApplyError] = useState('');
  const [questApplySuccess, setQuestApplySuccess] = useState('');
  const [questSearchFilter, setQuestSearchFilter] = useState('');
  const [questCategoryFilter, setQuestCategoryFilter] = useState('');
  const [showQuestApplyModal, setShowQuestApplyModal] = useState(false);
  const [selectedQuestForApply, setSelectedQuestForApply] = useState(null);
  const [questCoverNote, setQuestCoverNote] = useState('');
  const [questAnswers, setQuestAnswers] = useState({});

  // Credential submission states
  const [credentialSubmissions, setCredentialSubmissions] = useState([]);
  const [credentialSubmissionsLoading, setCredentialSubmissionsLoading] = useState(false);
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [credentialForm, setCredentialForm] = useState({
    projectName: '', position: '', category: 'CLUB_SMALL', roleLevel: 'MEMBER',
    description: '', proofLink: '', startedAt: '', endedAt: '',
  });
  const [credentialFormLoading, setCredentialFormLoading] = useState(false);
  const [credentialFormError, setCredentialFormError] = useState('');
  const [credentialFormSuccess, setCredentialFormSuccess] = useState('');
  const [openCredentialMonthPicker, setOpenCredentialMonthPicker] = useState(null);

  // DB Loaded Organizations States
  const [companiesList, setCompaniesList] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [openOrgTabs, setOpenOrgTabs] = useState([]); // viewed company tabs spawned in Sidebar
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgTypeFilter, setOrgTypeFilter] = useState('ALL'); // ALL, BUSINESS, CLUB
  const [selectedOrg, setSelectedOrg] = useState(null); // Detailed view object
  const [selectedOrgJobs, setSelectedOrgJobs] = useState([]);
  const [selectedOrgJobsLoading, setSelectedOrgJobsLoading] = useState(false);
  const [selectedOrgDetailLoading, setSelectedOrgDetailLoading] = useState(false);

  // Job List and filtering states
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  // Filter States (synchronized with URL params)
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [filterIsRemote, setFilterIsRemote] = useState(false);
  const [filterCanApply, setFilterCanApply] = useState(false); // Filter by matching RS threshold

  // Merge database companies and mock companies (to guarantee a populated view)
  const allOrganizations = [...companiesList, ...defaultMockOrganizations.filter(mock => 
    !companiesList.some(db => db.name.toLowerCase() === mock.name.toLowerCase())
  )].map(org => ({
    ...org,
    // Add structural properties if missing
    logoColor: org.logoColor || getCompanyGradient(org.name),
    industry: org.industry || (org.companyType === 'CLUB' ? 'Hoạt động CLB & Tổ chức học thuật' : 'Lĩnh vực kinh doanh & Dịch vụ'),
    location: org.location || 'Việt Nam',
    website: org.website || 'https://nextplease.net',
    verified: org.verified !== undefined ? org.verified : true,
    type: org.type || (org.companyType === 'CLUB' ? 'CLUB' : 'BUSINESS')
  }));

  // Fetch approved companies from DB
  useEffect(() => {
    let isMounted = true;
    async function fetchCompanies() {
      try {
        const data = await getCompanies();
        if (isMounted) {
          setCompaniesList(data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách đối tác:", err);
      } finally {
        if (isMounted) {
          setCompaniesLoading(false);
        }
      }
    }
    fetchCompanies();
    return () => { isMounted = false; };
  }, []);

  // Sync tabSlug to activeView
  useEffect(() => {
    if (tabSlug) {
      const upperTab = tabSlug.toUpperCase();
      if (['OVERVIEW', 'OPPORTUNITIES', 'QUESTS', 'ROADMAP', 'CREDENTIALS', 'ORGANIZATIONS', 'MY_APPLICATIONS'].includes(upperTab)) {
        setActiveView(upperTab);
        setSelectedOrg(null);
      } else if (tabSlug.startsWith('org-')) {
        setActiveView('ORGANIZATION_DETAIL');
      } else {
        navigate('/candidates/dashboard/overview', { replace: true });
      }
    } else {
      navigate('/candidates/dashboard/overview', { replace: true });
    }
  }, [tabSlug, navigate]);

  // Fetch detailed B2B information and its jobs when viewing a specific company detail
  useEffect(() => {
    if (activeView === 'ORGANIZATION_DETAIL' && tabSlug?.startsWith('org-')) {
      const orgId = tabSlug.substring(4);
      
      let isMounted = true;
      async function loadOrgDetailAndJobs() {
        setSelectedOrgDetailLoading(true);
        setSelectedOrgJobsLoading(true);
        
        // Find in allOrganizations first as cached/instant placeholder
        const cached = allOrganizations.find(c => String(c.id) === orgId);
        if (cached && isMounted) {
          setSelectedOrg(cached);
          // Spawn this company as a dynamic tab in the sidebar
          setOpenOrgTabs(prev => {
            if (prev.some(t => String(t.id) === orgId)) return prev;
            return [...prev, cached];
          });
        }
        
        try {
          const detailedCompany = await getCompanyDetail(orgId);
          if (isMounted && detailedCompany) {
            const fullyLoadedOrg = {
              ...detailedCompany,
              logoColor: detailedCompany.logoColor || getCompanyGradient(detailedCompany.name),
              logoUrl: detailedCompany.logoUrl,
              website: detailedCompany.websiteUrl || 'https://nextplease.net',
              type: detailedCompany.companyType === 'CLUB' ? 'CLUB' : 'BUSINESS',
              verified: true
            };
            setSelectedOrg(fullyLoadedOrg);
            
            // Add or update sidebar tabs
            setOpenOrgTabs(prev => {
              const filtered = prev.filter(t => String(t.id) !== String(orgId));
              return [...filtered, fullyLoadedOrg];
            });
          }
        } catch (err) {
          console.error("Lỗi khi tải chi tiết đối tác từ DB:", err);
          if (!cached && isMounted) {
            navigate('/candidates/dashboard/organizations', { replace: true });
          }
        } finally {
          if (isMounted) {
            setSelectedOrgDetailLoading(false);
          }
        }
        
        try {
          const jobs = await getJobs({ companyId: orgId });
          if (isMounted) {
            setSelectedOrgJobs(jobs || []);
          }
        } catch (err) {
          console.error("Lỗi khi tải tin tuyển dụng của đối tác từ DB:", err);
        } finally {
          if (isMounted) {
            setSelectedOrgJobsLoading(false);
          }
        }
      }
      
      loadOrgDetailAndJobs();
      return () => { isMounted = false; };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabSlug, activeView, companiesLoading]);

  // Sync URL search queries to Opportunities filter states
  useEffect(() => {
    if (activeView === 'OPPORTUNITIES') {
      const searchParams = new URLSearchParams(location.search);
      setFilterSearch(searchParams.get('q') || '');
      setFilterCategory(searchParams.get('c') || '');
      setFilterSpecialty(searchParams.get('s') || '');
      setFilterJobType(searchParams.get('t') || '');
      setFilterIsRemote(searchParams.get('r') === 'true');
      setFilterCanApply(searchParams.get('fit') === 'true');
    }
  }, [location.search, activeView]);

  // Fetch portfolio data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getMyPortfolio();
        if (isMounted) {
          setPortfolio(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu portfolio:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Fetch jobs data
  useEffect(() => {
    let isMounted = true;
    async function fetchJobsData() {
      if (isMounted) {
        setJobsLoading(true);
      }
      try {
        const filters = {};
        if (filterSearch.trim()) filters.query = filterSearch.trim();
        if (filterCategory) filters.category = filterCategory;
        if (filterSpecialty) filters.specialty = filterSpecialty;
        if (filterJobType) filters.jobType = filterJobType;
        if (filterIsRemote) filters.isRemote = true;

        const data = await getJobs(filters);
        if (isMounted) {
          setJobsList(data || []);
          setJobsError(null);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách tin tuyển dụng:", err);
        if (isMounted) {
          setJobsError(err.message || "Không thể tải danh sách tin tuyển dụng.");
        }
      } finally {
        if (isMounted) {
          setJobsLoading(false);
        }
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchJobsData();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
  }, [filterSearch, filterCategory, filterSpecialty, filterJobType, filterIsRemote]);

  // Fetch credential submissions when CREDENTIALS tab is active
  useEffect(() => {
    if (activeView !== 'CREDENTIALS') return;
    let isMounted = true;
    setCredentialSubmissionsLoading(true);
    getMyCredentialSubmissions()
      .then(data => { if (isMounted) setCredentialSubmissions(data || []); })
      .catch(err => console.error('Lỗi tải minh chứng:', err))
      .finally(() => { if (isMounted) setCredentialSubmissionsLoading(false); });
    return () => { isMounted = false; };
  }, [activeView]);

  // Load real applications from API on mount
  useEffect(() => {
    let isMounted = true;
    setApplicationsLoading(true);
    getMyApplications()
      .then(data => { if (isMounted) setAppliedJobs(data || []); })
      .catch(err => console.error('Lỗi tải ứng tuyển:', err))
      .finally(() => { if (isMounted) setApplicationsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Load wallet on mount
  useEffect(() => {
    let isMounted = true;
    setWalletLoading(true);
    getWallet()
      .then(data => { if (isMounted) setWallet(data); })
      .catch(err => console.error('Lỗi tải ví:', err))
      .finally(() => { if (isMounted) setWalletLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Load quests when OPPORTUNITIES tab opens (or on mount)
  useEffect(() => {
    let isMounted = true;
    setQuestsLoading(true);
    searchQuests(questSearchFilter, questCategoryFilter)
      .then(data => { if (isMounted) setQuestsList(data || []); })
      .catch(err => console.error('Lỗi tải Quest:', err))
      .finally(() => { if (isMounted) setQuestsLoading(false); });
    return () => { isMounted = false; };
  }, [questSearchFilter, questCategoryFilter]);

  // Load my quest applications on mount
  useEffect(() => {
    let isMounted = true;
    getMyQuestApplications()
      .then(data => { if (isMounted) setQuestApplications(data || []); })
      .catch(err => console.error('Lỗi tải đơn Quest:', err));
    return () => { isMounted = false; };
  }, []);

  async function handleApplyToQuest() {
    if (!selectedQuestForApply) return;
    const qFields = selectedQuestForApply.formFields || [];
    const missing = qFields.find((f) => f.required && !(questAnswers[f.id] || '').trim());
    if (missing) { setQuestApplyError(`Vui lòng trả lời: ${missing.label}`); return; }
    setQuestApplyError('');
    setQuestApplyLoading(true);
    try {
      const answers = qFields.length
        ? Object.fromEntries(qFields.map((f) => [f.id, (questAnswers[f.id] || '').trim()]).filter(([, v]) => v))
        : null;
      await applyToQuest(selectedQuestForApply.id, questCoverNote, answers);
      setQuestApplications(prev => [...prev, {
        questId: selectedQuestForApply.id,
        questTitle: selectedQuestForApply.title,
        companyName: selectedQuestForApply.companyName,
        category: selectedQuestForApply.category,
        expReward: selectedQuestForApply.expReward,
        npReward: selectedQuestForApply.npReward,
        status: 'SUBMITTED',
        appliedAt: new Date().toISOString(),
      }]);
      setQuestApplySuccess(`Đã nộp đơn Quest "${selectedQuestForApply.title}" thành công!`);
      setShowQuestApplyModal(false);
      setSelectedQuestForApply(null);
      setQuestCoverNote('');
      setTimeout(() => setQuestApplySuccess(''), 4000);
    } catch (err) {
      if (err.errorCode === 'RS_TOO_LOW') {
        setQuestApplyError(err.message);
      } else if (err.errorCode === 'ALREADY_APPLIED') {
        setQuestApplyError('Bạn đã ứng tuyển Quest này rồi.');
      } else {
        setQuestApplyError(err.message || 'Ứng tuyển Quest thất bại.');
      }
    } finally {
      setQuestApplyLoading(false);
    }
  }

  async function handleTopUp(e) {
    e.preventDefault();
    setTopUpError('');
    const amount = parseInt(topUpAmount, 10);
    if (!amount || amount < 10000) {
      setTopUpError('Số tiền tối thiểu là 10,000 VND.');
      return;
    }
    setTopUpLoading(true);
    try {
      const result = await topUp(amount);
      setWallet(prev => prev ? { ...prev, npBalance: result.balanceAfter } : prev);
      setTopUpSuccess(`Nạp thành công ${amount.toLocaleString('vi-VN')} NP vào ví!`);
      setTopUpAmount('50000');
      setTimeout(() => { setTopUpSuccess(''); setShowTopUpModal(false); }, 2500);
    } catch (err) {
      setTopUpError(err.message || 'Nạp thất bại. Vui lòng thử lại.');
    } finally {
      setTopUpLoading(false);
    }
  }

  async function handleBuyPremium() {
    setBuyPremiumError('');
    setBuyPremiumLoading(true);
    try {
      const result = await buyPremium();
      setWallet(prev => prev ? {
        ...prev,
        npBalance: result.npBalance,
        isPremium: true,
        premiumUntil: result.premiumUntil,
      } : prev);
      setShowPremiumPaywall(false);
      setApplySuccessMsg('Premium Pass đã được kích hoạt! Bạn có thể ứng tuyển các cơ hội Premium ngay bây giờ.');
      setTimeout(() => setApplySuccessMsg(''), 7000);
    } catch (err) {
      if (err.errorCode === 'INSUFFICIENT_NP') {
        setBuyPremiumError(err.message);
      } else {
        setBuyPremiumError(err.message || 'Mua Premium thất bại. Vui lòng thử lại.');
      }
    } finally {
      setBuyPremiumLoading(false);
    }
  }

  const handleSubmitCredential = async (e) => {
    e.preventDefault();
    setCredentialFormError('');
    setCredentialFormSuccess('');
    const currentMonthValue = getCurrentMonthValue();
    if (!credentialForm.projectName.trim() || !credentialForm.position.trim()) {
      setCredentialFormError('Vui lòng điền tên hoạt động và vai trò.');
      return;
    }
    if (credentialForm.startedAt && compareMonthValues(credentialForm.startedAt, currentMonthValue) > 0) {
      setCredentialFormError('Thời gian bắt đầu không được sau tháng hiện tại.');
      return;
    }
    if (credentialForm.endedAt && compareMonthValues(credentialForm.endedAt, currentMonthValue) > 0) {
      setCredentialFormError('Thời gian kết thúc không được sau tháng hiện tại.');
      return;
    }
    if (credentialForm.startedAt && credentialForm.endedAt && compareMonthValues(credentialForm.endedAt, credentialForm.startedAt) < 0) {
      setCredentialFormError('Thời gian kết thúc không được trước thời gian bắt đầu.');
      return;
    }
    setCredentialFormLoading(true);
    try {
      await submitCredential(credentialForm);
      setCredentialFormSuccess('Nộp minh chứng thành công! Hệ thống sẽ xem xét và phản hồi trong 1-3 ngày làm việc.');
      setCredentialForm({ projectName: '', position: '', category: 'CLUB_SMALL', roleLevel: 'MEMBER', description: '', proofLink: '', startedAt: '', endedAt: '' });
      setShowCredentialForm(false);
      const data = await getMyCredentialSubmissions();
      setCredentialSubmissions(data || []);
    } catch (err) {
      setCredentialFormError(err.message || 'Nộp minh chứng thất bại. Vui lòng thử lại.');
    } finally {
      setCredentialFormLoading(false);
    }
  };

  const handleTabChange = (viewName) => {
    navigate(`/candidates/dashboard/${viewName.toLowerCase()}`);
  };

  const handleCloseOrgTab = (e, orgId) => {
    e.stopPropagation();
    // Remove tab from active spawned tabs
    const updatedTabs = openOrgTabs.filter(t => String(t.id) !== String(orgId));
    setOpenOrgTabs(updatedTabs);
    
    // If the closed tab is currently active, navigate to organizations directory
    if (tabSlug === `org-${orgId}`) {
      navigate('/candidates/dashboard/organizations');
    }
  };

  const updateSearchUrl = (field, value) => {
    const searchParams = new URLSearchParams(location.search);
    if (value === '' || value === false || value === undefined) {
      searchParams.delete(field);
    } else {
      searchParams.set(field, value);
    }
    navigate(`/candidates/dashboard/opportunities?${searchParams.toString()}`, { replace: true });
  };

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    navigate('/');
  }

  function handleApplyJob(job) {
    setSelectedJobForApply(job);
    setApplyModalError('');
    setApplyFormFields([]);
    setApplyAnswers({});
    setShowApplyModal(true);
    // Load custom questions (if any) for this job
    getJobDetail(job.id || job.jobId)
      .then((detail) => setApplyFormFields(detail?.formFields || []))
      .catch(() => setApplyFormFields([]));
  }

  async function confirmApplyJob() {
    if (!selectedJobForApply || applyModalLoading) return;
    // Validate required custom questions client-side
    const missing = applyFormFields.find((f) => f.required && !(applyAnswers[f.id] || '').trim());
    if (missing) {
      setApplyModalError(`Vui lòng trả lời: ${missing.label}`);
      return;
    }
    setApplyModalError('');
    setApplyModalLoading(true);
    try {
      const answers = applyFormFields.length
        ? Object.fromEntries(applyFormFields.map((f) => [f.id, (applyAnswers[f.id] || '').trim()]).filter(([, v]) => v))
        : null;
      await applyToJob(selectedJobForApply.id || selectedJobForApply.jobId, '', answers);
      // Reload real applications list
      const data = await getMyApplications();
      setAppliedJobs(data || []);
      setShowApplyModal(false);
      setSelectedJobForApply(null);
      setApplySuccessMsg(`Ứng tuyển thành công vị trí "${selectedJobForApply.title}"! Nhà tuyển dụng sẽ xem xét trong thời gian sớm nhất.`);
      setTimeout(() => setApplySuccessMsg(''), 6000);
    } catch (err) {
      if (err.errorCode === 'PREMIUM_REQUIRED') {
        setShowApplyModal(false);
        setShowPremiumPaywall(true);
      } else {
        setApplyModalError(err.message || 'Ứng tuyển thất bại. Vui lòng thử lại.');
      }
    } finally {
      setApplyModalLoading(false);
    }
  }

  async function handleWithdrawJob(applicationId) {
    setWithdrawingId(applicationId);
    setWithdrawError('');
    try {
      await withdrawApplication(applicationId);
      const data = await getMyApplications();
      setAppliedJobs(data || []);
    } catch (err) {
      setWithdrawError(err.message || 'Rút đơn thất bại.');
    } finally {
      setWithdrawingId(null);
    }
  }

  async function handleWithdrawQuest(applicationId) {
    setWithdrawingId(applicationId);
    setWithdrawError('');
    try {
      await withdrawQuestApplication(applicationId);
      const data = await getMyQuestApplications();
      setQuestApplications(data || []);
    } catch (err) {
      setWithdrawError(err.message || 'Rút đơn thất bại.');
    } finally {
      setWithdrawingId(null);
    }
  }

  // Level & EXP calculations
  const currentLevel = portfolio?.currentLevel || 1;
  const currentExp = portfolio?.totalExp || 0;
  const nextLevelExp = currentLevel * 1000;
  const expPercentage = Math.min(100, Math.round((currentExp / nextLevelExp) * 100));

  // Checklist verification states
  const has3D = portfolio?.onboardingCompleted === true;
  const hasSchool = !!portfolio?.school?.trim();
  const hasCredentials = portfolio?.credentials && portfolio.credentials.length > 0;
  const hasApplications = appliedJobs.length > 0;

  const timeline = [
    {
      title: 'Tạo tài khoản ứng viên',
      detail: 'Đã xác thực email và đồng bộ vào hệ thống.',
      state: 'done'
    },
    {
      title: 'Dựng Portfolio 3D',
      detail: has3D ? 'Đã kích hoạt Portfolio 3D' : 'Cần bổ sung kỹ năng, học văn & thiết kế avatar nhân vật.',
      state: has3D ? 'done' : 'current'
    },
    {
      title: 'Xác thực & Tích lũy RS',
      detail: hasCredentials ? 'Đã tải chứng chỉ & nhận RS xác thực.' : 'Nộp bằng chứng (proof) chứng chỉ để nâng Reputation Score.',
      state: hasCredentials ? 'done' : (has3D ? 'current' : 'next')
    },
    {
      title: 'Nộp đơn ứng tuyển Quest',
      detail: hasApplications ? 'Đã gửi hồ sơ ứng tuyển Quest.' : 'Tương tác ứng tuyển quest đầu tiên trên Bảng cơ hội.',
      state: hasApplications ? 'done' : (hasCredentials ? 'current' : 'next')
    },
  ];

  // Filters candidates jobs by RS threshold if checked
  const candidateRs = portfolio?.reputationScore || 0;
  const filteredJobs = jobsList.filter(job => {
    if (filterCanApply) {
      return candidateRs >= job.minReqRs;
    }
    return true;
  });

  // Filter organizations based on category/search input
  const filteredOrgs = allOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
                          org.description.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
                          org.industry.toLowerCase().includes(orgSearchQuery.toLowerCase());
    
    const matchesType = orgTypeFilter === 'ALL' || org.type === orgTypeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading && !portfolio) {
    return (
      <div className="route-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--muted)',
        background: 'var(--bg)',
      }}>
        Đang tải thông tin ứng viên...
      </div>
    );
  }

  return (
    <div className={`candidate-portal-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ─── Sidebar Navigation ─── */}
      <aside className="candidate-portal-sidebar">
        <div className="candidate-portal-sidebar-top">
          <div className="candidate-portal-brand">
            <div className="candidate-portal-brand-inner">
              <span className="candidate-portal-brand-logo">next please<span className="np-dot">:</span></span>
              <span className="candidate-portal-brand-tag">Hub</span>
            </div>
            <button
              aria-label={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
              className="candidate-sidebar-toggle"
              onClick={() => {
                const nextVal = !isSidebarCollapsed;
                setIsSidebarCollapsed(nextVal);
                localStorage.setItem('nextplease:candidate-sidebar-collapsed', String(nextVal));
              }}
              title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
              type="button"
            >
              {isSidebarCollapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
            </button>
          </div>

          {/* Mini User Profile Card */}
          <div className="candidate-portal-profile-card">
            <div className="candidate-portal-profile-avatar">
              {portfolio?.name ? portfolio.name.slice(0, 2).toUpperCase() : 'C'}
            </div>
            <div className="candidate-portal-profile-info">
              <span className="candidate-portal-profile-name" title={portfolio?.name || 'Ứng viên'}>
                {portfolio?.name || 'Ứng viên'}
              </span>
              <span className="candidate-portal-profile-level">Candidate Talent</span>
              <span className="candidate-portal-profile-badge">Cấp độ {currentLevel}</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="candidate-portal-nav" style={{ marginTop: isSidebarCollapsed ? '16px' : '0' }}>
            <button
              className={`candidate-portal-nav-item ${activeView === 'OVERVIEW' ? 'active' : ''}`}
              onClick={() => handleTabChange('OVERVIEW')}
              type="button"
            >
              <UserRound size={18} />
              {!isSidebarCollapsed && <span>Tổng quan tài năng</span>}
            </button>

            <button
              className={`candidate-portal-nav-item ${activeView === 'OPPORTUNITIES' ? 'active' : ''}`}
              onClick={() => handleTabChange('OPPORTUNITIES')}
              type="button"
            >
              <BriefcaseBusiness size={18} />
              {!isSidebarCollapsed && <span>Bảng cơ hội</span>}
            </button>

            <button
              className={`candidate-portal-nav-item ${activeView === 'QUESTS' ? 'active' : ''}`}
              onClick={() => handleTabChange('QUESTS')}
              type="button"
            >
              <Zap size={18} />
              {!isSidebarCollapsed && <span>Quest</span>}
            </button>

            <button
              className={`candidate-portal-nav-item ${activeView === 'ORGANIZATIONS' ? 'active' : ''}`}
              onClick={() => handleTabChange('ORGANIZATIONS')}
              type="button"
            >
              <Building size={18} />
              {!isSidebarCollapsed && <span>Doanh nghiệp & CLB</span>}
            </button>

            {/* Dynamic tabs spawned when viewing companies */}
            {openOrgTabs.map((org) => {
              const isActive = activeView === 'ORGANIZATION_DETAIL' && selectedOrg?.id === org.id;
              return (
                <button
                  key={org.id}
                  className={`candidate-portal-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabChange(`org-${org.id}`)}
                  type="button"
                  title={`Chi tiết: ${org.name}`}
                >
                  <div className="candidate-org-tab-content">
                    <div className="candidate-org-tab-logo" style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      background: org.logoUrl ? 'transparent' : org.logoColor,
                      color: 'white',
                      fontSize: '0.55rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        org.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <span>{org.name}</span>
                  </div>
                  <X
                    size={13}
                    className="tab-close-icon"
                    onClick={(e) => handleCloseOrgTab(e, org.id)}
                  />
                </button>
              );
            })}

            <button
              className={`candidate-portal-nav-item ${activeView === 'MY_APPLICATIONS' ? 'active' : ''}`}
              onClick={() => handleTabChange('MY_APPLICATIONS')}
              type="button"
            >
              <Clock3 size={18} />
              {!isSidebarCollapsed && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'space-between' }}>
                  Theo dõi ứng tuyển
                  {(appliedJobs.length + questApplications.length) > 0 && (
                    <span style={{ fontSize: '0.66rem', fontWeight: '900', background: 'var(--primary)', color: '#fff', borderRadius: '20px', padding: '1px 6px', minWidth: '18px', textAlign: 'center' }}>
                      {appliedJobs.length + questApplications.length}
                    </span>
                  )}
                </span>
              )}
            </button>

            <button
              className={`candidate-portal-nav-item ${activeView === 'ROADMAP' ? 'active' : ''}`}
              onClick={() => handleTabChange('ROADMAP')}
              type="button"
            >
              <Compass size={18} />
              {!isSidebarCollapsed && <span>Lộ trình phát triển</span>}
            </button>

            <button
              className={`candidate-portal-nav-item ${activeView === 'CREDENTIALS' ? 'active' : ''}`}
              onClick={() => handleTabChange('CREDENTIALS')}
              type="button"
            >
              <Award size={18} />
              {!isSidebarCollapsed && <span>Minh chứng & Trạng thái</span>}
            </button>

            {has3D ? (
              <Link className="candidate-portal-nav-item" to="/portfolio/edit" target="_blank" rel="noopener noreferrer">
                <FileText size={18} />
                {!isSidebarCollapsed && <span>Chỉnh sửa Portfolio 3D</span>}
              </Link>
            ) : (
              <Link className="candidate-portal-nav-item" to="/portfolio">
                <FileText size={18} />
                {!isSidebarCollapsed && <span>Khởi tạo Portfolio 3D</span>}
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="candidate-portal-sidebar-footer">
          {/* NP Balance chip */}
          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={() => setShowTopUpModal(true)}
              className={`candidate-wallet-chip ${wallet?.isPremium ? 'premium' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <WalletCards size={15} color={wallet?.isPremium ? '#d97706' : 'var(--muted)'} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--ink)' }}>
                  {walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString()} NP
                </span>
              </div>
              {wallet?.isPremium
                ? <Crown size={13} color="#d97706" />
                : <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>Nạp</span>
              }
            </button>
          )}

          <button
            className="candidate-portal-nav-item"
            onClick={handleLogout}
            style={{ color: '#ef4444', marginTop: '4px', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
            type="button"
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Workspace Content ─── */}
      <main className="candidate-portal-main">
        {applySuccessMsg && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.92rem',
            fontWeight: '600',
            animation: 'fadeInModal 0.3s ease'
          }}>
            <CheckCircle2 size={20} />
            <div style={{ flexGrow: 1 }}>{applySuccessMsg}</div>
            <button
              onClick={() => setApplySuccessMsg('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', display: 'flex' }}
              type="button"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* 1. OVERVIEW VIEW */}
        {activeView === 'OVERVIEW' && (
          <div className="np-view">
            <header className="candidate-overview-header">
              <div className="candidate-overview-title">
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '900',
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05rem',
                  background: 'rgba(37, 99, 235, 0.08)',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  marginBottom: '10px'
                }}>
                  <Sparkles size={13} /> Chào mừng trở lại, {portfolio?.name || 'Ứng viên'}
                </span>
                <h1>Không gian phát triển sự nghiệp</h1>
                <p>Theo dõi nhiệm vụ, hoàn thiện hồ sơ 3D và minh chứng năng lực của bạn.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {has3D ? (
                  <Link className="button primary-button" to="/portfolio/edit" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                    Chỉnh sửa Portfolio 3D <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link className="button primary-button" to="/portfolio" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                    Thiết lập Portfolio 3D <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </header>

            <div className="candidate-overview-workspace">
              {/* Left Column */}
              <div className="candidate-overview-left-panel">
                <section className="candidate-gaming-exp-card">
                  <div className="exp-gamer-header">
                    <div className="exp-gamer-level">
                      <span className="exp-level-label">Cấp độ tài năng</span>
                      <span className="exp-level-badge">LV. {currentLevel}</span>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--ink)' }}>
                      Tích lũy: <strong style={{ color: 'var(--primary)' }}>{currentExp}</strong> / {nextLevelExp} EXP
                    </span>
                  </div>

                  <div className="exp-bar-wrapper">
                    <div className="exp-bar-fill-glow" style={{ width: `${expPercentage}%` }}>
                      <div className="exp-bar-shine" />
                    </div>
                  </div>
                  <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                    <Zap size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', color: 'var(--primary)' }} />
                    Hoàn thành các mốc checklist hồ sơ hoặc được phê duyệt chứng chỉ để nhận thêm EXP thăng cấp!
                  </p>
                </section>

                <section className="candidate-checklist-card">
                  <h2 className="candidate-checklist-title">
                    <CheckCircle2 size={20} color="var(--primary)" />
                    Hành trình phát triển hồ sơ (Next Steps)
                  </h2>

                  <div className="checklist-item">
                    <div className="checklist-item-checkbox">
                      {has3D ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                    </div>
                    <div className="checklist-item-content">
                      <span className="checklist-item-title" style={{ textDecoration: has3D ? 'line-through' : 'none', opacity: has3D ? 0.6 : 1 }}>
                        Khởi tạo và lưu hồ sơ Portfolio 3D
                      </span>
                      <span className="checklist-item-desc">Thiết lập nhân vật avatar đại diện 3D và điền các kỹ năng chuyên môn cốt lõi.</span>
                    </div>
                  </div>

                  <div className="checklist-item">
                    <div className="checklist-item-checkbox">
                      {hasSchool ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                    </div>
                    <div className="checklist-item-content">
                      <span className="checklist-item-title" style={{ textDecoration: hasSchool ? 'line-through' : 'none', opacity: hasSchool ? 0.6 : 1 }}>
                        Bổ sung thông tin trường học & học vấn
                      </span>
                      <span className="checklist-item-desc">Điền thông tin trường cao đẳng/đại học để hỗ trợ bộ lọc tin tuyển dụng.</span>
                    </div>
                  </div>

                  <div className="checklist-item">
                    <div className="checklist-item-checkbox">
                      {hasCredentials ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                    </div>
                    <div className="checklist-item-content">
                      <span className="checklist-item-title" style={{ textDecoration: hasCredentials ? 'line-through' : 'none', opacity: hasCredentials ? 0.6 : 1 }}>
                        Đăng tải minh chứng chứng chỉ / bằng cấp
                      </span>
                      <span className="checklist-item-desc">Nộp file minh chứng để nâng điểm danh tiếng (Reputation Score) tối đa.</span>
                    </div>
                  </div>

                  <div className="checklist-item">
                    <div className="checklist-item-checkbox">
                      {hasApplications ? <CheckCircle2 size={18} color="#22c55e" /> : <Clock3 size={18} color="var(--muted)" />}
                    </div>
                    <div className="checklist-item-content">
                      <span className="checklist-item-title" style={{ textDecoration: hasApplications ? 'line-through' : 'none', opacity: hasApplications ? 0.6 : 1 }}>
                        Tìm kiếm và ứng tuyển Quest đầu tiên
                      </span>
                      <span className="checklist-item-desc">Khám phá Bảng cơ hội và gửi đơn ứng tuyển vào dự án phù hợp với năng lực.</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="candidate-overview-right-panel">
                <section className="candidate-avatar-3d-card">
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--ink)' }}>Avatar 3D của bạn</span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: has3D ? 'rgba(34, 197, 94, 0.12)' : 'rgba(249, 115, 22, 0.12)',
                      color: has3D ? '#22c55e' : '#f97316'
                    }}>
                      {has3D ? 'Đã kích hoạt' : 'Bản nháp mặc định'}
                    </span>
                  </div>

                  <div className="avatar-3d-glow-frame">
                    <PortfolioAvatar3D avatar={portfolio?.avatar} />
                  </div>

                  {has3D ? (
                    <Link className="avatar-quick-edit-btn" to="/portfolio/edit" target="_blank" rel="noopener noreferrer">
                      <UserRound size={16} /> Chỉnh sửa ngoại hình 3D
                    </Link>
                  ) : (
                    <Link className="avatar-quick-edit-btn" to="/portfolio">
                      <UserRound size={16} /> Kích hoạt Portfolio 3D
                    </Link>
                  )}
                </section>
              </div>
            </div>

            {/* Metrics cards grid */}
            <section className="candidate-metrics-grid np-stagger">
              <div className="candidate-metric-box" style={{ cursor: 'pointer' }} onClick={() => setShowTopUpModal(true)} title="Nhấn để nạp NP">
                <div className="candidate-metric-icon">
                  <WalletCards size={22} />
                </div>
                <div className="candidate-metric-details">
                  <span className="candidate-metric-label">Số dư ví {wallet?.isPremium && <Crown size={11} color="#d97706" style={{ verticalAlign: 'middle', marginLeft: '4px' }} />}</span>
                  <span className="candidate-metric-value">
                    {walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString()} NP
                  </span>
                  <span className="candidate-metric-subtext" style={{ color: wallet?.isPremium ? '#16a34a' : undefined }}>
                    {wallet?.isPremium
                      ? `Premium đến ${wallet.premiumUntil ? new Date(wallet.premiumUntil).toLocaleDateString('vi-VN') : '—'}`
                      : 'Nhấn để nạp NP'}
                  </span>
                </div>
              </div>

              <div className="candidate-metric-box">
                <div className="candidate-metric-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                  <ShieldCheck size={22} />
                </div>
                <div className="candidate-metric-details">
                  <span className="candidate-metric-label">Reputation Score</span>
                  <span className="candidate-metric-value">
                    {portfolio?.reputationScore !== undefined ? portfolio.reputationScore : '0'} RS
                  </span>
                  <span className="candidate-metric-subtext">Độ uy tín chuyên môn</span>
                </div>
              </div>

              <div className="candidate-metric-box">
                <div className="candidate-metric-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                  <BadgeCheck size={22} />
                </div>
                <div className="candidate-metric-details">
                  <span className="candidate-metric-label">Hồ sơ 3D</span>
                  <span className="candidate-metric-value" style={{ fontSize: '1.15rem', marginTop: '6px' }}>
                    {has3D ? 'Hoàn thành' : 'Đang thiết lập'}
                  </span>
                  <span className="candidate-metric-subtext">
                    {has3D ? 'Đã hiển thị trên Marketplace' : 'Cần bổ sung thông tin'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. OPPORTUNITIES VIEW */}
        {activeView === 'OPPORTUNITIES' && (
          <section className="np-view" style={{ border: '1px solid var(--c-line)', background: '#fff', borderRadius: '20px', padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: 'var(--c-red)', letterSpacing: '0.06em', margin: '0 0 6px' }}>Bảng cơ hội</p>
              <h2 style={{ margin: '0', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--c-ink)' }}>Cơ hội phát triển sự nghiệp</h2>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--c-muted)' }} />
              <input type="text" value={filterSearch}
                onChange={e => { setFilterSearch(e.target.value); updateSearchUrl('q', e.target.value); }}
                placeholder="Tìm vị trí tuyển dụng, kỹ năng, hoặc tên công ty..."
                className="np-candf"
                style={{ width: '100%', padding: '13px 40px 13px 46px', borderRadius: '12px', border: '1.5px solid var(--c-line)', background: '#fff', color: 'var(--c-ink)', fontSize: '0.94rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
              />
              {filterSearch && (
                <button type="button" onClick={() => { setFilterSearch(''); updateSearchUrl('q', ''); }}
                  style={{ position: 'absolute', right: '14px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-muted)', padding: '2px', display: 'flex' }} aria-label="Xóa tìm kiếm"><X size={16} /></button>
              )}
            </div>

            {/* 2-col layout: filter sidebar + list */}
            <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '20px', alignItems: 'start' }}>
              {/* LEFT FILTER PANEL */}
              <div style={{ background: '#faf7f5', border: '1px solid var(--c-line)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.84rem', fontWeight: '900', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}><SlidersHorizontal size={14} /> Bộ lọc</strong>
                  {(filterCategory || filterSpecialty || filterJobType || filterIsRemote || filterCanApply) && (
                    <button type="button" onClick={() => { setFilterCategory(''); setFilterSpecialty(''); setFilterJobType(''); setFilterIsRemote(false); setFilterCanApply(false); }}
                      style={{ fontSize: '0.74rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', padding: 0 }}>Xóa tất cả</button>
                  )}
                </div>

                {/* Loại hình */}
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: '850', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loại hình làm việc</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {JOB_TYPES.map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                        <input type="radio" name="jobType" checked={filterJobType === opt.value} onChange={() => { setFilterJobType(opt.value); updateSearchUrl('t', opt.value); }}
                          style={{ accentColor: 'var(--primary)', width: '15px', height: '15px', cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.86rem', color: filterJobType === opt.value ? 'var(--primary)' : 'var(--ink)', fontWeight: filterJobType === opt.value ? '700' : '500' }}>{opt.label}</span>
                        {opt.exp && <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: '800', marginLeft: 'auto' }}>+{opt.exp} EXP</span>}
                      </label>
                    ))}
                    {filterJobType && (
                      <button type="button" onClick={() => { setFilterJobType(''); updateSearchUrl('t', ''); }}
                        style={{ fontSize: '0.78rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '2px 0', fontWeight: '600' }}>
                        Bỏ chọn
                      </button>
                    )}
                  </div>
                </div>

                {/* Lĩnh vực */}
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: '850', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lĩnh vực</p>
                  <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterSpecialty(''); updateSearchUrl('c', e.target.value); updateSearchUrl('s', ''); }}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.84rem', color: 'var(--ink)', cursor: 'pointer' }}>
                    <option value="">Tất cả lĩnh vực</option>
                    {Object.keys(CATEGORY_MAP).map(key => <option key={key} value={key}>{CATEGORY_MAP[key].label}</option>)}
                  </select>
                  {filterCategory && (
                    <select value={filterSpecialty} onChange={e => { setFilterSpecialty(e.target.value); updateSearchUrl('s', e.target.value); }}
                      style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.84rem', color: 'var(--ink)', cursor: 'pointer', marginTop: '8px' }}>
                      <option value="">Tất cả chuyên ngành</option>
                      {(CATEGORY_MAP[filterCategory]?.specialties || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  )}
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={filterIsRemote} onChange={e => { setFilterIsRemote(e.target.checked); updateSearchUrl('r', e.target.checked); }}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.86rem', color: 'var(--ink)', fontWeight: '600' }}>Chỉ Remote</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={filterCanApply} onChange={e => { setFilterCanApply(e.target.checked); updateSearchUrl('fit', e.target.checked); }}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.86rem', color: 'var(--ink)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={13} color="var(--primary)" /> Đủ RS</span>
                  </label>
                </div>
              </div>

              {/* RIGHT: result count + list */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: '700' }}>
                    Tìm thấy <strong style={{ color: 'var(--ink)' }}>{filteredJobs.length}</strong> cơ hội
                  </span>
                </div>

                {jobsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '20px' }}>
                    <RefreshCw size={26} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                    <p style={{ fontSize: '0.92rem', color: 'var(--muted)', fontWeight: '600', margin: 0 }}>Đang tải...</p>
                  </div>
                ) : jobsError ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', background: 'rgba(220,38,38,0.05)', borderRadius: '16px', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
                    <AlertTriangle size={20} /><p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600' }}>{jobsError}</p>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px dashed var(--line)', textAlign: 'center' }}>
                    <Search size={28} style={{ color: 'var(--muted)' }} />
                    <div><h3 style={{ margin: '0 0 4px', color: 'var(--ink)' }}>Không tìm thấy cơ hội nào</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)' }}>Điều chỉnh bộ lọc để tìm thêm kết quả.</p></div>
                  </div>
                ) : (
                  <div className="np-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredJobs.map(job => {
                      const isLocked = candidateRs < job.minReqRs;
                      const alreadyApplied = appliedJobs.some(a => (a.job_id || a.jobId) === job.id);
                      const compensationText = job.compensation > 0 ? `${Number(job.compensation).toLocaleString()} VND` : 'Thỏa thuận';
                      const typeLabel = JOB_TYPES.find(t => t.value === job.jobType)?.label || job.jobType;
                      const typeExp = JOB_TYPES.find(t => t.value === job.jobType)?.exp;
                      return (
                        <article key={job.id} style={{ display: 'flex', gap: '16px', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--line)', background: '#fff', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-red)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(229,83,63,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          {/* Logo */}
                          <div style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid var(--c-line)', background: '#faf7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {job.companyLogo ? <img src={job.companyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building size={22} style={{ color: 'var(--c-muted)' }} />}
                          </div>

                          {/* Middle content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '6px' }}>
                              {job.requiresPremium && (
                                <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 7px', borderRadius: '5px', background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Crown size={9} /> Premium
                                </span>
                              )}
                              {isLocked && (
                                <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 7px', borderRadius: '5px', background: 'rgba(220,38,38,0.08)', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <LockKeyhole size={9} /> Cần {job.minReqRs} RS
                                </span>
                              )}
                            </div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: 'var(--ink)', lineHeight: 1.3 }}>{job.title}</h3>
                            <div style={{ fontSize: '0.84rem', color: 'var(--muted)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={12} />{job.companyName || 'Đối tác'}</span>
                              {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} />{job.isRemote ? 'Remote' : job.location}</span>}
                              {(job.deadlineAt) && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />HSD: {new Date(job.deadlineAt).toLocaleDateString('vi-VN')}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {typeLabel && <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 9px', borderRadius: '6px', background: 'rgba(229,83,63,0.08)', color: '#e5533f' }}>{typeLabel}</span>}
                              {job.isRemote && <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 9px', borderRadius: '6px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6' }}>Remote</span>}
                              {job.skills?.slice(0, 2).map((s, i) => <span key={i} style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 9px', borderRadius: '6px', background: 'var(--surface-soft)', border: '1px solid var(--line)', color: 'var(--ink)' }}>{s.skillName}</span>)}
                              {job.skills?.length > 2 && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '600' }}>+{job.skills.length - 2}</span>}
                            </div>
                          </div>

                          {/* Right: salary + actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0, minWidth: '140px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ display: 'block', fontSize: '0.96rem', color: '#16a34a', fontWeight: '900' }}>{compensationText}</strong>
                              {typeExp && <span style={{ fontSize: '0.76rem', color: '#f59e0b', fontWeight: '800' }}>+{typeExp} EXP khi xong</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                              <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', fontSize: '0.82rem', fontWeight: '700', borderRadius: '9px', border: '1px solid var(--c-line)', background: '#fff', color: 'var(--c-ink)', textDecoration: 'none' }}>
                                Xem chi tiết
                              </a>
                              <button type="button" disabled={isLocked || alreadyApplied} onClick={() => handleApplyJob(job)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px 12px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '9px', border: 'none', background: (isLocked || alreadyApplied) ? '#f3ede9' : 'var(--c-red)', color: (isLocked || alreadyApplied) ? 'var(--c-muted)' : '#fff', cursor: (isLocked || alreadyApplied) ? 'not-allowed' : 'pointer' }}>
                                {alreadyApplied ? <><Check size={12} /> Đã ứng tuyển</> : isLocked ? <><LockKeyhole size={12} /> Cần RS</> : 'Ứng tuyển'}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 2b. QUEST BOARD — dedicated QUESTS tab */}
        {activeView === 'QUESTS' && (
          <section className="np-view" style={{ border: '1px solid var(--c-line)', background: '#fff', borderRadius: '20px', padding: '24px' }}>
            {questApplySuccess && <div className="alert-banner success" style={{ marginBottom: '16px' }}>{questApplySuccess}</div>}

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: 'var(--c-red)', letterSpacing: '0.06em', margin: '0 0 6px' }}>Quest CLB</p>
              <h2 style={{ margin: '0', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--c-ink)' }}>Bảng Quest & Chiến dịch</h2>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--c-muted)' }} />
              <input type="text" value={questSearchFilter} onChange={e => setQuestSearchFilter(e.target.value)}
                placeholder="Tìm tên Quest, CLB, hoặc mô tả..."
                className="np-candf"
                style={{ width: '100%', padding: '13px 40px 13px 46px', borderRadius: '12px', border: '1.5px solid var(--c-line)', background: '#fff', color: 'var(--c-ink)', fontSize: '0.94rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
              {questSearchFilter && (
                <button type="button" onClick={() => setQuestSearchFilter('')}
                  style={{ position: 'absolute', right: '14px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-muted)', padding: '2px', display: 'flex' }} aria-label="Xóa tìm kiếm"><X size={16} /></button>
              )}
            </div>

            {/* 2-col layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '20px', alignItems: 'start' }}>
              {/* LEFT FILTER PANEL */}
              <div style={{ background: '#faf7f5', border: '1px solid var(--c-line)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--c-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}><SlidersHorizontal size={14} /> Bộ lọc</strong>
                  {questCategoryFilter && (
                    <button type="button" onClick={() => setQuestCategoryFilter('')}
                      style={{ fontSize: '0.74rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', padding: 0 }}>Xóa</button>
                  )}
                </div>

                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: '850', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loại Quest</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { value: 'SMALL_EVENT', label: 'Sự kiện nhỏ', exp: 100, color: '#8b5cf6' },
                      { value: 'SCHOOL_CAMPAIGN', label: 'Chiến dịch trường', exp: 300, color: '#0ea5e9' },
                      { value: 'COMPANY_PROJECT', label: 'Dự án DN', exp: 500, color: '#f59e0b' },
                      { value: 'SHORT_INTERNSHIP', label: 'Thực tập ngắn', exp: 500, color: '#10b981' },
                      { value: 'FREELANCE_GIG', label: 'Freelance', exp: 300, color: '#ec4899' },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                        <input type="radio" name="questCat" checked={questCategoryFilter === opt.value} onChange={() => setQuestCategoryFilter(opt.value)}
                          style={{ accentColor: opt.color, width: '15px', height: '15px', cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.86rem', color: questCategoryFilter === opt.value ? opt.color : 'var(--ink)', fontWeight: questCategoryFilter === opt.value ? '700' : '500', flex: 1 }}>{opt.label}</span>
                        <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: '800' }}>+{opt.exp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: list */}
              <div>
                {questsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '20px' }}>
                    <RefreshCw size={22} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                    <span style={{ color: 'var(--muted)', fontWeight: '600' }}>Đang tải Quest...</span>
                  </div>
                ) : questsList.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px dashed var(--line)', textAlign: 'center' }}>
                    <Sparkles size={28} style={{ color: 'var(--muted)' }} />
                    <p style={{ margin: 0, color: 'var(--muted)', fontWeight: '600' }}>Chưa có Quest nào đang mở. Quay lại sau nhé!</p>
                  </div>
                ) : (
                  <div className="np-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: '700', marginBottom: '2px' }}>
                      Tìm thấy <strong style={{ color: 'var(--ink)' }}>{questsList.length}</strong> Quest
                    </div>
                    {questsList.map((quest) => {
                      const isLocked = candidateRs < (quest.minReqRs || 0);
                      const alreadyApplied = questApplications.some(qa => qa.questId === quest.id);
                      const categoryMeta = { SMALL_EVENT: { label: 'Sự kiện nhỏ', color: '#8b5cf6' }, SCHOOL_CAMPAIGN: { label: 'Chiến dịch trường', color: '#0ea5e9' }, COMPANY_PROJECT: { label: 'Dự án DN', color: '#f59e0b' }, SHORT_INTERNSHIP: { label: 'Thực tập ngắn', color: '#10b981' }, FREELANCE_GIG: { label: 'Freelance', color: '#ec4899' } }[quest.category] || { label: quest.category, color: 'var(--primary)' };
                      return (
                        <article key={quest.id} style={{ display: 'flex', gap: '16px', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--c-line)', background: '#fff', borderLeftWidth: '4px', borderLeftColor: categoryMeta.color, transition: 'box-shadow 0.2s, border-color 0.2s', opacity: isLocked ? 0.75 : 1 }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${categoryMeta.color}20`; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          {/* Icon */}
                          <div style={{ width: '56px', height: '56px', borderRadius: '14px', border: `1px solid ${categoryMeta.color}30`, background: `${categoryMeta.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap size={24} style={{ color: categoryMeta.color }} />
                          </div>

                          {/* Middle */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', background: `${categoryMeta.color}15`, color: categoryMeta.color }}>{categoryMeta.label}</span>
                              {alreadyApplied && <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', background: 'rgba(22,163,74,0.1)', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Check size={10} /> Đã đăng ký</span>}
                              {isLocked && <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', background: 'rgba(220,38,38,0.08)', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><LockKeyhole size={9} /> Cần {quest.minReqRs} RS</span>}
                            </div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: 'var(--ink)', lineHeight: 1.3 }}>{quest.title}</h3>
                            <div style={{ fontSize: '0.84rem', color: 'var(--muted)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={12} />{quest.companyName || 'CLB'}</span>
                              {quest.endsAt && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />HSD: {new Date(quest.endsAt).toLocaleDateString('vi-VN')}</span>}
                              {quest.capacity > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} />{quest.capacity - (quest.applicantCount || 0)}/{quest.capacity} chỗ</span>}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                              {quest.description?.length > 100 ? `${quest.description.slice(0, 100)}...` : quest.description}
                            </p>
                          </div>

                          {/* Right */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0, minWidth: '130px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.1rem', color: '#f59e0b', fontWeight: '900', justifyContent: 'flex-end' }}><Zap size={14} />+{quest.expReward} EXP</strong>
                              {quest.npReward > 0 && <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: '800' }}>+{quest.npReward} NP</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                              <a href={`/quests/${quest.id}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', fontSize: '0.82rem', fontWeight: '700', borderRadius: '9px', border: '1px solid var(--c-line)', background: '#fff', color: 'var(--c-ink)', textDecoration: 'none' }}>
                                Xem chi tiết
                              </a>
                              <button type="button" disabled={isLocked || alreadyApplied}
                                onClick={() => { setSelectedQuestForApply(quest); setQuestCoverNote(''); setQuestAnswers({}); setQuestApplyError(''); setShowQuestApplyModal(true); }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px 12px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '9px', border: 'none', background: (alreadyApplied || isLocked) ? '#f3ede9' : categoryMeta.color, color: (alreadyApplied || isLocked) ? 'var(--c-muted)' : '#fff', cursor: (alreadyApplied || isLocked) ? 'not-allowed' : 'pointer' }}>
                                {alreadyApplied ? <><Check size={12} /> Đã đăng ký</> : isLocked ? <><LockKeyhole size={12} /> Cần RS</> : <><Zap size={12} /> Tham gia</>}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 2c. MY APPLICATIONS VIEW */}
        {activeView === 'MY_APPLICATIONS' && (() => {
          const JOB_STATUS_COLOR = { SUBMITTED: '#d97706', VIEWED: '#2563eb', SHORTLISTED: '#7c3aed', ACCEPTED: '#16a34a', REJECTED: '#dc2626', COMPLETED: '#0ea5e9', WITHDRAWN: '#6b7280' };
          const JOB_STATUS_LABEL = { SUBMITTED: 'Đã nộp', VIEWED: 'Đã xem', SHORTLISTED: 'Vào vòng tiếp', ACCEPTED: 'Chấp thuận', REJECTED: 'Từ chối', COMPLETED: 'Hoàn thành', WITHDRAWN: 'Rút đơn' };
          const filteredBizApps = appliedJobs.filter(app => {
            const title = (app.job_title || app.title || '').toLowerCase();
            const company = (app.company_name || app.companyName || '').toLowerCase();
            const matchSearch = !myAppsSearch || title.includes(myAppsSearch.toLowerCase()) || company.includes(myAppsSearch.toLowerCase());
            const matchStatus = !myAppsStatusFilter || (app.status || '') === myAppsStatusFilter;
            return matchSearch && matchStatus;
          });
          const filteredClubApps = questApplications.filter(qa => {
            const title = (qa.questTitle || '').toLowerCase();
            const company = (qa.companyName || '').toLowerCase();
            const matchSearch = !myAppsClubSearch || title.includes(myAppsClubSearch.toLowerCase()) || company.includes(myAppsClubSearch.toLowerCase());
            const matchStatus = !myAppsClubStatusFilter || (qa.status || '') === myAppsClubStatusFilter;
            return matchSearch && matchStatus;
          });

          return (
            <section className="np-view" style={{ border: '1px solid var(--c-line)', background: '#fff', borderRadius: '20px', padding: '28px' }}>
              {/* Header */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: 'var(--c-red)', letterSpacing: '0.06em', margin: '0 0 6px' }}>Theo dõi ứng tuyển</p>
                <h2 style={{ margin: '0', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--c-ink)' }}>Hồ sơ ứng tuyển của bạn</h2>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', background: '#faf7f5', border: '1px solid var(--c-line)', padding: '4px', borderRadius: '12px', gap: '4px', marginBottom: '24px', width: 'fit-content' }}>
                {[
                  { key: 'BUSINESS', icon: <Building size={15} />, label: 'Doanh nghiệp', count: appliedJobs.length },
                  { key: 'CLUB', icon: <Zap size={15} />, label: 'CLB / Quest', count: questApplications.length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMyAppsTab(tab.key)}
                    style={{ padding: '9px 18px', borderRadius: '9px', border: 0, fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', background: myAppsTab === tab.key ? 'var(--c-red)' : 'transparent', color: myAppsTab === tab.key ? '#fff' : 'var(--c-muted)' }}
                  >
                    {tab.icon}{tab.label}
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', background: myAppsTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--c-line)', color: myAppsTab === tab.key ? '#fff' : 'var(--c-muted)', borderRadius: '20px', padding: '1px 7px' }}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Withdraw error */}
              {withdrawError && (
                <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{withdrawError}</span>
                  <button onClick={() => setWithdrawError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
                </div>
              )}

              {/* Filters */}
              {myAppsTab === 'BUSINESS' ? (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                      <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--muted)' }} />
                      <input type="text" value={myAppsSearch} onChange={e => setMyAppsSearch(e.target.value)}
                        placeholder="Tìm vị trí hoặc công ty..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem', color: 'var(--ink)', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <select value={myAppsStatusFilter} onChange={e => setMyAppsStatusFilter(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem', color: 'var(--ink)', cursor: 'pointer' }}>
                      <option value="">Tất cả trạng thái</option>
                      {Object.entries(JOB_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {(myAppsSearch || myAppsStatusFilter) && (
                      <button type="button" onClick={() => { setMyAppsSearch(''); setMyAppsStatusFilter(''); }}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.84rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: '700' }}>
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>

                  {applicationsLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Đang tải...</div>
                  ) : filteredBizApps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                      <BriefcaseBusiness size={28} style={{ color: 'var(--muted)', marginBottom: '10px' }} />
                      <p style={{ margin: 0, color: 'var(--muted)', fontWeight: '600' }}>
                        {myAppsSearch || myAppsStatusFilter ? 'Không tìm thấy hồ sơ phù hợp.' : 'Bạn chưa ứng tuyển vị trí nào từ doanh nghiệp.'}
                      </p>
                    </div>
                  ) : (
                    <div className="np-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {filteredBizApps.map((app, idx) => {
                        const st = app.status || 'SUBMITTED';
                        const sc = JOB_STATUS_COLOR[st] || '#6b7280';
                        const sl = JOB_STATUS_LABEL[st] || st;
                        return (
                          <div key={app.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--line)', background: 'var(--bg)', borderLeftWidth: '4px', borderLeftColor: sc }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Building size={20} style={{ color: 'var(--muted)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ display: 'block', fontSize: '0.96rem', color: 'var(--ink)', marginBottom: '2px' }}>{app.job_title || app.title}</strong>
                              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={12} />{app.company_name || app.companyName || 'Đối tác'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />{app.applied_at ? new Date(app.applied_at).toLocaleDateString('vi-VN') : app.appliedAt || '—'}</span>
                                <span style={{ padding: '2px 8px', borderRadius: '5px', background: 'var(--surface-soft)', fontWeight: '700', fontSize: '0.76rem' }}>
                                  {JOB_TYPES.find(t => t.value === (app.job_type || app.jobType))?.label || app.job_type || app.jobType || '—'}
                                </span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', background: `${sc}15`, color: sc, fontWeight: '800', fontSize: '0.82rem' }}>
                                {st === 'SUBMITTED' && <Clock3 size={12} />}
                                {(st === 'ACCEPTED' || st === 'SHORTLISTED') && <CheckCircle2 size={12} />}
                                {st === 'REJECTED' && <AlertTriangle size={12} />}
                                {sl}
                              </span>
                              {st === 'REJECTED' && (app.reject_reason || app.rejectionReason) && (
                                <div style={{ fontSize: '0.76rem', color: '#dc2626', maxWidth: '200px', textAlign: 'right', fontWeight: '600' }}>
                                  Lý do: {app.reject_reason || app.rejectionReason}
                                </div>
                              )}
                              {app.rating_score != null && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', maxWidth: '220px' }}>
                                  <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <Star key={n} size={14} fill={n <= app.rating_score ? '#f59e0b' : 'none'} color={n <= app.rating_score ? '#f59e0b' : 'var(--muted)'} />
                                    ))}
                                  </div>
                                  {app.rating_comment && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'right', fontStyle: 'italic' }}>"{app.rating_comment}"</div>
                                  )}
                                </div>
                              )}
                              {['SUBMITTED', 'VIEWED', 'SHORTLISTED'].includes(st) && (
                                <button
                                  onClick={() => handleWithdrawJob(app.id)}
                                  disabled={withdrawingId === app.id}
                                  style={{ fontSize: '0.76rem', fontWeight: '700', color: '#6b7280', background: 'none', border: '1px solid var(--line)', borderRadius: '8px', padding: '3px 10px', cursor: 'pointer' }}>
                                  {withdrawingId === app.id ? 'Đang rút...' : 'Rút đơn'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                      <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--muted)' }} />
                      <input type="text" value={myAppsClubSearch} onChange={e => setMyAppsClubSearch(e.target.value)}
                        placeholder="Tìm tên Quest hoặc CLB..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem', color: 'var(--ink)', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <select value={myAppsClubStatusFilter} onChange={e => setMyAppsClubStatusFilter(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem', color: 'var(--ink)', cursor: 'pointer' }}>
                      <option value="">Tất cả trạng thái</option>
                      <option value="SUBMITTED">Đã nộp</option>
                      <option value="ACCEPTED">Chấp thuận</option>
                      <option value="REJECTED">Từ chối</option>
                      <option value="COMPLETED">Hoàn thành (+EXP)</option>
                      <option value="WITHDRAWN">Rút đơn</option>
                    </select>
                    {(myAppsClubSearch || myAppsClubStatusFilter) && (
                      <button type="button" onClick={() => { setMyAppsClubSearch(''); setMyAppsClubStatusFilter(''); }}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.84rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: '700' }}>
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>

                  {filteredClubApps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                      <Zap size={28} style={{ color: 'var(--muted)', marginBottom: '10px' }} />
                      <p style={{ margin: 0, color: 'var(--muted)', fontWeight: '600' }}>
                        {myAppsClubSearch || myAppsClubStatusFilter ? 'Không tìm thấy Quest phù hợp.' : 'Bạn chưa tham gia Quest nào từ CLB.'}
                      </p>
                    </div>
                  ) : (
                    <div className="np-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {filteredClubApps.map((qa, idx) => {
                        const QUEST_SC = { SUBMITTED: '#d97706', ACCEPTED: '#16a34a', REJECTED: '#dc2626', COMPLETED: '#2563eb', WITHDRAWN: '#6b7280' };
                        const QUEST_SL = { SUBMITTED: 'Đã nộp', ACCEPTED: 'Chấp thuận', REJECTED: 'Từ chối', COMPLETED: 'Hoàn thành', WITHDRAWN: 'Rút đơn' };
                        const sc = QUEST_SC[qa.status] || '#6b7280';
                        const sl = QUEST_SL[qa.status] || qa.status;
                        return (
                          <div key={qa.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--line)', background: 'var(--bg)', borderLeftWidth: '4px', borderLeftColor: sc }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Zap size={20} style={{ color: '#f59e0b' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ display: 'block', fontSize: '0.96rem', color: 'var(--ink)', marginBottom: '2px' }}>{qa.questTitle}</strong>
                              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={12} />{qa.companyName || 'CLB'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />{qa.appliedAt ? new Date(qa.appliedAt).toLocaleDateString('vi-VN') : '—'}</span>
                                {qa.expReward > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800', color: '#f59e0b' }}><Zap size={12} />+{qa.expReward} EXP</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', background: `${sc}15`, color: sc, fontWeight: '800', fontSize: '0.82rem' }}>
                                {qa.status === 'COMPLETED' && <CheckCircle2 size={12} />}
                                {qa.status === 'REJECTED' && <AlertTriangle size={12} />}
                                {qa.status === 'SUBMITTED' && <Clock3 size={12} />}
                                {sl}
                              </span>
                              {qa.status === 'REJECTED' && qa.rejectReason && (
                                <div style={{ fontSize: '0.76rem', color: '#dc2626', maxWidth: '200px', textAlign: 'right', fontWeight: '600' }}>
                                  Lý do: {qa.rejectReason}
                                </div>
                              )}
                              {qa.ratingScore != null && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', maxWidth: '220px' }}>
                                  <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <Star key={n} size={14} fill={n <= qa.ratingScore ? '#f59e0b' : 'none'} color={n <= qa.ratingScore ? '#f59e0b' : 'var(--muted)'} />
                                    ))}
                                  </div>
                                  {qa.ratingComment && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'right', fontStyle: 'italic' }}>"{qa.ratingComment}"</div>
                                  )}
                                </div>
                              )}
                              {qa.status === 'SUBMITTED' && (
                                <button
                                  onClick={() => handleWithdrawQuest(qa.id)}
                                  disabled={withdrawingId === qa.id}
                                  style={{ fontSize: '0.76rem', fontWeight: '700', color: '#6b7280', background: 'none', border: '1px solid var(--line)', borderRadius: '8px', padding: '3px 10px', cursor: 'pointer' }}>
                                  {withdrawingId === qa.id ? 'Đang rút...' : 'Rút đơn'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })()}

        {/* 3. ORGANIZATIONS VIEW (DIRECTORY) */}
        {activeView === 'ORGANIZATIONS' && (
          <section className="np-view" style={{ border: '1px solid var(--c-line)', background: '#fff', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '850', color: 'var(--muted)', letterSpacing: '0.05em', margin: 0 }}>Partners Directory</p>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: '900', color: 'var(--ink)' }}>Danh bạ Doanh nghiệp & Tổ chức CLB</h2>
              </div>
              <div style={{ display: 'flex', background: 'var(--surface-soft)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                <button
                  onClick={() => setOrgTypeFilter('ALL')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 0,
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: orgTypeFilter === 'ALL' ? 'var(--primary)' : 'transparent',
                    color: orgTypeFilter === 'ALL' ? '#fff' : 'var(--nav-text)'
                  }}
                  type="button"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setOrgTypeFilter('BUSINESS')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 0,
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: orgTypeFilter === 'BUSINESS' ? 'var(--primary)' : 'transparent',
                    color: orgTypeFilter === 'BUSINESS' ? '#fff' : 'var(--nav-text)'
                  }}
                  type="button"
                >
                  Doanh nghiệp
                </button>
                <button
                  onClick={() => setOrgTypeFilter('CLUB')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 0,
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: orgTypeFilter === 'CLUB' ? 'var(--primary)' : 'transparent',
                    color: orgTypeFilter === 'CLUB' ? '#fff' : 'var(--nav-text)'
                  }}
                  type="button"
                >
                  CLB & Tổ chức
                </button>
              </div>
            </div>

            {/* Org search bar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                type="text"
                value={orgSearchQuery}
                onChange={(e) => setOrgSearchQuery(e.target.value)}
                placeholder="Tìm kiếm đối tác theo tên, lĩnh vực chuyên môn hoặc giới thiệu..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                  fontSize: '0.92rem'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--muted)' }} />
              {orgSearchQuery && (
                <button
                  onClick={() => setOrgSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex'
                  }}
                  type="button"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Directory Loading vs Grid */}
            {companiesLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '20px', border: '1px solid var(--line)' }}>
                <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Đang nạp dữ liệu từ hệ thống...</p>
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                <Building size={32} color="var(--muted)" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.92rem', fontWeight: 'bold' }}>Không tìm thấy Doanh nghiệp hoặc CLB nào phù hợp.</p>
              </div>
            ) : (
              <div className="org-directory-grid">
                {filteredOrgs.map((org) => (
                  <article key={org.id} className="org-card" style={{ cursor: 'pointer' }} onClick={() => handleTabChange(`org-${org.id}`)}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="org-logo-circle" style={{ background: org.logoUrl ? 'transparent' : org.logoColor, overflow: 'hidden', border: org.logoUrl ? '1px solid var(--line)' : 'none' }}>
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            org.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className={`org-badge-type ${org.type.toLowerCase()}`}>
                          {org.type === 'BUSINESS' ? 'Doanh nghiệp' : 'CLB / Tổ chức'}
                        </span>
                      </div>
                      <h3 style={{ margin: '14px 0 6px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>{org.name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                        {org.industry}
                      </span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5, height: '65px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {org.description || 'Đối tác chưa cung cấp thông tin mô tả chi tiết.'}
                      </p>
                    </div>
                    <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{org.location}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Mở hồ sơ <ArrowRight size={13} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. DETAILED ORGANIZATION PROFILE VIEW (tab-spawning result) */}
        {activeView === 'ORGANIZATION_DETAIL' && selectedOrg && (
          selectedOrgDetailLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '16px', background: 'var(--surface-soft)', borderRadius: '28px', border: '1px solid var(--line)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
              <p style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 'bold' }}>Đang tải thông tin chi tiết đối tác...</p>
            </div>
          ) : (
            <div className="org-detail-container">
              {/* Hero Header */}
              <div className="org-profile-hero" style={{ position: 'relative', height: '180px', borderRadius: '24px', display: 'flex', alignItems: 'flex-end', padding: '24px', overflow: 'visible', background: `linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%), var(--card-bg-strong)`, border: '1px solid var(--line)', marginBottom: '60px' }}>
                <button
                  className="button secondary-button"
                  onClick={() => handleTabChange('organizations')}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    fontSize: '0.86rem',
                    borderRadius: '10px',
                    zIndex: 2
                  }}
                  type="button"
                >
                  <ArrowLeft size={14} /> Quay lại danh sách
                </button>
                
                <div className="org-profile-logo-container" style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '24px',
                  width: '88px',
                  height: '88px',
                  borderRadius: '20px',
                  border: '4px solid var(--bg)',
                  background: selectedOrg.logoUrl ? 'transparent' : selectedOrg.logoColor,
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  zIndex: 3
                }}>
                  {selectedOrg.logoUrl ? (
                    <img src={selectedOrg.logoUrl} alt={selectedOrg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
                      {selectedOrg.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="org-profile-details" style={{ background: 'var(--bg)', borderRadius: '24px', border: '1px solid var(--line)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'var(--ink)' }}>{selectedOrg.name}</h2>
                      {selectedOrg.verified && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: 'rgba(34, 197, 94, 0.12)',
                          color: '#22c55e'
                        }}>
                          <CheckCircle2 size={12} /> Đối tác đã xác thực
                        </span>
                      )}
                    </div>
                    
                    {/* Tag Classification & Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span className={`org-badge-type ${selectedOrg.type.toLowerCase()}`} style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {selectedOrg.type === 'CLUB' ? 'CLB / Tổ chức sinh viên' : 'Doanh nghiệp'}
                      </span>
                      {selectedOrg.schoolName && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', background: 'var(--surface-soft)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                          {selectedOrg.schoolName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* B2B Structural Fields Display */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', margin: '24px 0 14px' }}>
                  Thông tin hồ sơ đối tác
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {/* Specific Fields for CLUB/Organization */}
                  {selectedOrg.type === 'CLUB' ? (
                    <>
                      <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Trường liên kết</span>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--ink)', display: 'block', marginTop: '3px' }}>
                          {selectedOrg.schoolName || 'Chưa liên kết trường'}
                        </strong>
                      </div>
                      {selectedOrg.fanpageUrl && (
                        <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Fanpage chính thức</span>
                          <a href={selectedOrg.fanpageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px', textDecoration: 'none' }}>
                            Xem Fanpage <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                      {/* Advisor contact details safely parsed */}
                      {(() => {
                        let advName = '';
                        let advPhone = '';
                        let advEmail = '';
                        if (selectedOrg.advisorContact) {
                          try {
                            const adv = typeof selectedOrg.advisorContact === 'string' ? JSON.parse(selectedOrg.advisorContact) : selectedOrg.advisorContact;
                            advName = adv.name || adv.advisor_name || '';
                            advPhone = adv.phone || adv.advisor_phone || '';
                            advEmail = adv.email || adv.advisor_email || '';
                          } catch (e) {
                            console.error(e);
                          }
                        }
                        if (!advName) return null;
                        return (
                          <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)', gridColumn: '1 / -1' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Giáo viên / Ban cố vấn CLB</span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--ink)', display: 'block', marginTop: '3px' }}>{advName}</strong>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                              {advPhone && <span>SĐT: <strong>{advPhone}</strong></span>}
                              {advEmail && <span>Email: <strong>{advEmail}</strong></span>}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    /* Specific Fields for Enterprise */
                    <>
                      {selectedOrg.taxCode && (
                        <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Mã số thuế (MST)</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--ink)', display: 'block', marginTop: '3px' }}>{selectedOrg.taxCode}</strong>
                        </div>
                      )}
                    </>
                  )}

                  {/* Common Fields */}
                  <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Người đại diện liên hệ</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--ink)', display: 'block', marginTop: '3px' }}>
                      {selectedOrg.representativeName || 'Chưa cập nhật'}
                    </strong>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>SĐT Liên hệ</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--ink)', display: 'block', marginTop: '3px' }}>
                      {selectedOrg.representativePhone || 'Chưa cập nhật'}
                    </strong>
                  </div>

                  {selectedOrg.website && (
                    <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-soft)', border: '1px solid var(--line)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Website liên kết</span>
                      <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px', textDecoration: 'none' }}>
                        {selectedOrg.website.replace('https://', '').replace('http://', '')} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', margin: '0 0 12px' }}>
                    Giới thiệu đối tác
                  </h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: 0, fontSize: '0.94rem', whiteSpace: 'pre-line' }}>
                    {selectedOrg.description || 'Đối tác hiện chưa cập nhật mô tả chi tiết hồ sơ.'}
                  </p>
                </div>

                {/* Openings/Quests by this Org loaded dynamically from DB */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: 'var(--ink)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BriefcaseBusiness size={20} color="var(--primary)" />
                    Tin tuyển dụng & Quest của đối tác ({selectedOrgJobs.length})
                  </h3>

                  {selectedOrgJobsLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '8px', background: 'var(--surface-soft)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                      <RefreshCw className="animate-spin" size={20} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>Đang nạp các quest của đối tác...</p>
                    </div>
                  ) : selectedOrgJobs.length === 0 ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Đối tác hiện chưa có bài đăng quest hay tin tuyển dụng nào trên hệ thống.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {selectedOrgJobs.map((job) => {
                        const isLocked = candidateRs < job.minReqRs;
                        const tone = getCategoryTone(job.category);
                        const compText = job.compensation > 0 ? `${Number(job.compensation).toLocaleString()} VND` : 'Thỏa thuận';
                        return (
                          <article className={`candidate-quest-item ${tone}`} key={job.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeftWidth: '5px', padding: '18px', height: '100%', margin: 0 }}>
                            <div>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', padding: '3px 6px' }}>
                                  {JOB_TYPES.find(t => t.value === job.jobType)?.label || job.jobType}
                                </span>
                                {job.isRemote && (
                                  <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', padding: '3px 6px' }}>
                                    Remote
                                  </span>
                                )}
                              </div>
                              <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: '800', color: 'var(--ink)' }}>{job.title}</h4>
                              <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: '6px 0 12px', lineHeight: 1.45 }}>
                                {job.description?.length > 110 ? `${job.description.slice(0, 110)}...` : job.description}
                              </p>
                            </div>
                            <div style={{ marginTop: '10px', borderTop: '1px solid var(--line)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                                <span style={{ color: 'var(--muted)' }}>Lương: <strong style={{ color: 'var(--primary)' }}>{compText}</strong></span>
                                <span style={{ color: 'var(--muted)' }}>Yêu cầu RS: <strong style={{ color: isLocked ? '#ef4444' : 'var(--ink)' }}>{job.minReqRs > 0 ? `${job.minReqRs} RS` : 'Không'}</strong></span>
                              </div>
                              <button
                                disabled={isLocked}
                                onClick={() => handleApplyJob(job)}
                                style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 'bold' }}
                                type="button"
                              >
                                {isLocked ? 'Cần thêm RS' : 'Ứng tuyển'}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* 4. ROADMAP VIEW */}
        {activeView === 'ROADMAP' && (
          <section className="candidate-profile-summary np-view" style={{ border: '1px solid var(--c-line)', background: '#fff', borderRadius: '20px' }}>
            <div className="candidate-panel-heading">
              <div>
                <p className="eyebrow" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '850', color: 'var(--muted)', letterSpacing: '0.05em' }}>Talent Roadmap</p>
                <h2>Lộ trình phát triển năng lực số</h2>
              </div>
            </div>

            <div className="road-map-flow">
              {timeline.map((item, index) => (
                <article className={`road-map-node ${item.state}`} key={index}>
                  <div className="road-map-dot">
                    {item.state === 'done' && <Check size={12} color="#fff" />}
                  </div>
                  <div className="road-map-card" style={{ borderLeft: item.state === 'done' ? '4px solid #22c55e' : (item.state === 'current' ? '4px solid var(--primary)' : '1px solid var(--line)') }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Bước {index + 1}: {item.title}</h3>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: item.state === 'done' ? 'rgba(34, 197, 94, 0.12)' : (item.state === 'current' ? 'rgba(37, 99, 235, 0.12)' : 'var(--surface-soft)'),
                        color: item.state === 'done' ? '#22c55e' : (item.state === 'current' ? 'var(--primary)' : 'var(--muted)')
                      }}>
                        {item.state === 'done' ? 'Hoàn thành' : (item.state === 'current' ? 'Đang thực hiện' : 'Chưa mở khóa')}
                      </span>
                    </div>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 5. CREDENTIALS & STATUS VIEW */}
        {activeView === 'CREDENTIALS' && (
          <div className="candidate-credentials-workspace np-view">

            {/* Certifications & Diplomas Grid (My Credentials) */}
            <section className="credentials-list-section">
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={20} color="var(--primary)" />
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: 'var(--ink)' }}>Văn bằng & Chứng chỉ đã tải</h2>
                </div>
                {has3D ? (
                  <Link className="button secondary-button" to="/portfolio/edit" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}>
                    Thêm chứng chỉ
                  </Link>
                ) : (
                  <Link className="button secondary-button" to="/portfolio" style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}>
                    Thêm chứng chỉ
                  </Link>
                )}
              </div>

              {!portfolio?.credentials || portfolio.credentials.length === 0 || !portfolio.credentials.some(c => c.name?.trim()) ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                  <Award size={26} color="var(--muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: '0 0 8px', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: '600' }}>Chưa có chứng chỉ nào được xác thực.</p>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>Hãy truy cập Chỉnh sửa Portfolio để tải lên văn bằng chứng chỉ, giúp nâng điểm Reputation Score của bạn.</p>
                </div>
              ) : (
                <div className="np-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {portfolio.credentials.filter(c => c.name?.trim()).map((cred) => (
                    <article key={cred.id} style={{
                      border: '1px solid var(--c-line)',
                      borderRadius: '16px',
                      padding: '16px',
                      background: '#fff',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--c-red-soft)', color: 'var(--c-red)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Award size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: '800', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cred.name}>
                          {cred.name}
                        </h4>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '2px' }}>Cấp bởi: {cred.issuer || 'Chưa rõ'}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> Cấp: {cred.issuedAt || 'Chưa rõ'}
                          </span>
                          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                            Đã xác minh
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Proof of Work submission section */}
            <section className="credentials-list-section" style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--primary)" />
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: 'var(--ink)' }}>Nộp Minh chứng Hoạt động</h2>
                </div>
                <button
                  className="button primary-button"
                  style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: '10px' }}
                  onClick={() => { setShowCredentialForm(v => !v); setOpenCredentialMonthPicker(null); setCredentialFormError(''); setCredentialFormSuccess(''); }}
                >
                  {showCredentialForm ? 'Đóng form' : '+ Nộp minh chứng mới'}
                </button>
              </div>

              {credentialFormSuccess && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', fontSize: '0.88rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                  {credentialFormSuccess}
                </div>
              )}

              {showCredentialForm && (
                <form onSubmit={handleSubmitCredential} className="credential-submit-form">
                  <div className="credential-submit-topline">
                    <div className="credential-submit-mark">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3>Biến hoạt động thật thành Reputation Capital</h3>
                      <p>Điền thông tin hoạt động bạn đã tham gia. Sau khi Admin xét duyệt, EXP và RS sẽ được cộng tự động vào hồ sơ.</p>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-full">
                      <label className="form-label">Tên hoạt động / Dự án *</label>
                      <input className="form-input" placeholder="VD: Chiến dịch Mùa hè xanh 2024" value={credentialForm.projectName} onChange={e => setCredentialForm(f => ({ ...f, projectName: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="form-label">Vai trò / Chức danh *</label>
                      <input className="form-input" placeholder="VD: Trưởng ban truyền thông" value={credentialForm.position} onChange={e => setCredentialForm(f => ({ ...f, position: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="form-label">Cấp bậc vai trò</label>
                      <select className="form-input" value={credentialForm.roleLevel} onChange={e => setCredentialForm(f => ({ ...f, roleLevel: e.target.value }))}>
                        <option value="MEMBER">Thành viên (+5 RS khi duyệt)</option>
                        <option value="LEADER">Trưởng nhóm / Ban (+10 RS khi duyệt)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Loại hình hoạt động</label>
                      <select className="form-input" value={credentialForm.category} onChange={e => setCredentialForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="CLUB_SMALL">Sự kiện CLB / Khoa (+100 EXP)</option>
                        <option value="SCHOOL_CAMPAIGN">Chiến dịch cấp Trường (+300 EXP)</option>
                        <option value="COMPANY_PROJECT">Dự án Doanh nghiệp (+500 EXP)</option>
                        <option value="SHORT_INTERNSHIP">Thực tập ngắn hạn (+500 EXP)</option>
                        <option value="FREELANCE_GIG">Công việc tự do (+500 EXP)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Thời gian bắt đầu</label>
                      <CredentialMonthPicker
                        id="credential-started-at"
                        label=""
                        value={credentialForm.startedAt}
                        maxValue={getCurrentMonthValue()}
                        openPicker={openCredentialMonthPicker}
                        setOpenPicker={setOpenCredentialMonthPicker}
                        helperText="Không chọn sau tháng hiện tại."
                        onChange={(value) => setCredentialForm((form) => ({
                          ...form,
                          startedAt: value,
                          endedAt: form.endedAt && compareMonthValues(form.endedAt, value) < 0 ? '' : form.endedAt,
                        }))}
                      />
                    </div>
                    <div>
                      <label className="form-label">Thời gian kết thúc</label>
                      <CredentialMonthPicker
                        id="credential-ended-at"
                        label=""
                        value={credentialForm.endedAt}
                        minValue={credentialForm.startedAt}
                        maxValue={getCurrentMonthValue()}
                        openPicker={openCredentialMonthPicker}
                        setOpenPicker={setOpenCredentialMonthPicker}
                        helperText="Không trước tháng bắt đầu."
                        onChange={(value) => setCredentialForm(f => ({ ...f, endedAt: value }))}
                      />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Link minh chứng (certificate, fanpage sự kiện, ảnh...)</label>
                      <input className="form-input" placeholder="https://drive.google.com/... hoặc link Facebook event" value={credentialForm.proofLink} onChange={e => setCredentialForm(f => ({ ...f, proofLink: e.target.value }))} />
                    </div>
                    <div className="form-full">
                      <label className="form-label">Mô tả thêm (không bắt buộc)</label>
                      <textarea className="form-input" placeholder="Mô tả ngắn về đóng góp của bạn trong hoạt động này..." value={credentialForm.description} onChange={e => setCredentialForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                  {credentialFormError && (
                    <div className="alert-banner error" style={{ marginTop: '14px', marginBottom: 0 }}>
                      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                      {credentialFormError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                    <button type="submit" className="button primary-button" disabled={credentialFormLoading} style={{ fontSize: '0.86rem' }}>
                      {credentialFormLoading ? 'Đang gửi...' : 'Nộp minh chứng'}
                    </button>
                    <button type="button" className="button secondary-button" onClick={() => { setShowCredentialForm(false); setOpenCredentialMonthPicker(null); }} style={{ fontSize: '0.86rem' }}>Hủy</button>
                  </div>
                </form>
              )}

              {/* List of submitted proofs */}
              {credentialSubmissionsLoading ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><ShieldCheck size={28} /></div>
                  <p className="empty-state-title">Đang tải minh chứng...</p>
                </div>
              ) : credentialSubmissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><ShieldCheck size={28} /></div>
                  <p className="empty-state-title">Chưa có minh chứng nào được nộp.</p>
                  <p className="empty-state-desc">Nhấn "+ Nộp minh chứng mới" để bắt đầu tích luỹ EXP và RS thực tế.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {credentialSubmissions.map(sub => {
                    const categoryLabels = { CLUB_SMALL: 'Sự kiện CLB', SCHOOL_CAMPAIGN: 'Chiến dịch Trường', COMPANY_PROJECT: 'Dự án DN', SHORT_INTERNSHIP: 'Thực tập', FREELANCE_GIG: 'Freelance' };
                    const expRewards = { CLUB_SMALL: 100, SCHOOL_CAMPAIGN: 300, COMPANY_PROJECT: 500, SHORT_INTERNSHIP: 500, FREELANCE_GIG: 500 };
                    const statusKey = (sub.verification_status || '').toLowerCase();
                    const statusLabel = sub.verification_status === 'APPROVED' ? 'Đã duyệt' : sub.verification_status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt';
                    return (
                      <div key={sub.id} className={`proof-card ${statusKey}`}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: '800', color: 'var(--ink)' }}>{sub.project_name}</h4>
                            <span className="proof-chip category">{categoryLabels[sub.category] || sub.category}</span>
                            <span className={`proof-chip ${(sub.role_level || 'MEMBER').toLowerCase()}`}>{sub.role_level === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}</span>
                          </div>
                          <p style={{ margin: '0 0 6px', fontSize: '0.84rem', color: 'var(--muted)' }}>{sub.position}</p>
                          {sub.proof_link && (
                            <a href={sub.proof_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} /> Link minh chứng
                            </a>
                          )}
                          {sub.verification_status === 'REJECTED' && sub.reject_reason && (
                            <div className="alert-banner error" style={{ marginTop: '8px', marginBottom: 0, padding: '6px 10px' }}>
                              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                              Lý do từ chối: {sub.reject_reason}
                            </div>
                          )}
                          {sub.verification_status === 'APPROVED' && (
                            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#16a34a', fontWeight: '700' }}>
                              +{expRewards[sub.category] || 100} EXP · +{sub.role_level === 'LEADER' ? 10 : 5} RS đã được cộng
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span className={`proof-status-badge ${statusKey}`}>{statusLabel}</span>
                          <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* ─── Quest Apply Modal ─── */}
      {/* ─── Quest Apply Confirmation Modal ─── */}
      {showQuestApplyModal && selectedQuestForApply && (
        <div className="glass-modal-overlay" onClick={() => setShowQuestApplyModal(false)}>
          <div className="glass-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="glass-modal-header">
              <Zap size={20} color="var(--primary)" />
              <h2>Tham gia Quest</h2>
            </div>
            <div className="glass-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Quest info */}
              <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 16px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--ink)', fontWeight: '800' }}>{selectedQuestForApply.title}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '8px' }}>{selectedQuestForApply.companyName}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '6px' }}>+{selectedQuestForApply.expReward} EXP</span>
                  {selectedQuestForApply.npReward > 0 && <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '6px' }}>+{selectedQuestForApply.npReward} NP</span>}
                </div>
              </div>

              {/* Candidate profile preview */}
              <CandidateProfilePreview portfolio={portfolio} candidateRs={candidateRs} currentLevel={currentLevel} currentExp={currentExp} />

              {/* Cover note */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.86rem', fontWeight: '700', color: 'var(--ink)' }}>Giới thiệu bản thân (tùy chọn)</label>
                <textarea
                  value={questCoverNote}
                  onChange={e => setQuestCoverNote(e.target.value)}
                  placeholder="Hãy chia sẻ tại sao bạn muốn tham gia Quest này..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-soft)', fontSize: '0.88rem', color: 'var(--ink)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Custom questions from organizer */}
              {(selectedQuestForApply.formFields || []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Câu hỏi từ ban tổ chức</span>
                  {selectedQuestForApply.formFields.map((f) => (
                    <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--ink)' }}>
                        {f.label} {f.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </label>
                      {f.fieldType === 'TEXTAREA' ? (
                        <textarea rows={3} value={questAnswers[f.id] || ''} onChange={(e) => setQuestAnswers((p) => ({ ...p, [f.id]: e.target.value }))}
                          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-soft)', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical' }} />
                      ) : f.fieldType === 'SELECT' ? (
                        <select value={questAnswers[f.id] || ''} onChange={(e) => setQuestAnswers((p) => ({ ...p, [f.id]: e.target.value }))}
                          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-soft)', fontSize: '0.88rem', cursor: 'pointer' }}>
                          <option value="">— Chọn —</option>
                          {(f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={questAnswers[f.id] || ''} onChange={(e) => setQuestAnswers((p) => ({ ...p, [f.id]: e.target.value }))}
                          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-soft)', fontSize: '0.88rem' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {questApplyError && (
                <div className="alert-banner error">
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  {questApplyError}
                </div>
              )}
            </div>
            <div className="glass-modal-footer">
              <button className="button secondary-button" onClick={() => { setShowQuestApplyModal(false); setQuestApplyError(''); }} type="button" disabled={questApplyLoading}>Hủy bỏ</button>
              <button className="button primary-button" onClick={handleApplyToQuest} type="button" disabled={questApplyLoading}>
                {questApplyLoading ? 'Đang nộp...' : 'Xác nhận tham gia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Job Apply Confirmation Glass Modal ─── */}
      {showApplyModal && selectedJobForApply && (
        <div className="glass-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="glass-modal-header">
              <Sparkles size={20} color="var(--primary)" />
              <h2>Xác nhận ứng tuyển</h2>
            </div>
            <div className="glass-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Job info */}
              <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 16px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--ink)', fontWeight: '800' }}>{selectedJobForApply.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.84rem', marginBottom: '8px' }}>
                  <Building size={13} />
                  <span>{selectedJobForApply.companyName || selectedJobForApply.company_name || 'Đối tác'}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '10px', flexWrap: 'wrap' }}>
                  <span>Thù lao: <strong style={{ color: '#16a34a' }}>{selectedJobForApply.compensation > 0 ? `${Number(selectedJobForApply.compensation).toLocaleString()} VND` : 'Thỏa thuận'}</strong></span>
                  <span>Yêu cầu RS: <strong style={{ color: '#2563eb' }}>{(selectedJobForApply.minReqRs || selectedJobForApply.min_req_rs || 0) > 0 ? `${selectedJobForApply.minReqRs || selectedJobForApply.min_req_rs} RS` : 'Không có'}</strong></span>
                </div>
              </div>

              {/* Candidate profile preview */}
              <CandidateProfilePreview portfolio={portfolio} candidateRs={candidateRs} currentLevel={currentLevel} currentExp={currentExp} />

              {/* Custom questions from employer */}
              {applyFormFields.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Câu hỏi từ nhà tuyển dụng</span>
                  {applyFormFields.map((f) => (
                    <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--ink)' }}>
                        {f.label} {f.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </label>
                      {f.fieldType === 'TEXTAREA' ? (
                        <textarea rows={3} value={applyAnswers[f.id] || ''} onChange={(e) => setApplyAnswers((p) => ({ ...p, [f.id]: e.target.value }))}
                          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical' }} />
                      ) : f.fieldType === 'SELECT' ? (
                        <select value={applyAnswers[f.id] || ''} onChange={(e) => setApplyAnswers((p) => ({ ...p, [f.id]: e.target.value }))}
                          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem', cursor: 'pointer' }}>
                          <option value="">— Chọn —</option>
                          {(f.options || '').split(/[\n,]/).map((o) => o.trim()).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={applyAnswers[f.id] || ''} onChange={(e) => setApplyAnswers((p) => ({ ...p, [f.id]: e.target.value }))}
                          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--bg)', fontSize: '0.88rem' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {applyModalError && (
                <div className="alert-banner error">
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  {applyModalError}
                </div>
              )}
            </div>
            <div className="glass-modal-footer">
              <button className="button secondary-button" onClick={() => { setShowApplyModal(false); setApplyModalError(''); }} type="button" style={{ padding: '10px 16px', borderRadius: '12px' }} disabled={applyModalLoading}>
                Hủy bỏ
              </button>
              <button className="button primary-button" onClick={confirmApplyJob} type="button" style={{ padding: '10px 18px', borderRadius: '12px' }} disabled={applyModalLoading}>
                {applyModalLoading ? 'Đang nộp...' : 'Xác nhận nộp đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Top-Up NP Modal ─── */}
      {showTopUpModal && (
        <div className="glass-modal-overlay" onClick={() => { setShowTopUpModal(false); setTopUpError(''); setTopUpSuccess(''); }}>
          <div className="glass-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="glass-modal-header">
              <WalletCards size={20} color="var(--primary)" />
              <h2>Nạp NP vào ví</h2>
            </div>
            <div className="glass-modal-body">
              <div style={{ background: 'var(--surface-soft)', borderRadius: '14px', padding: '14px 16px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: '600' }}>Số dư hiện tại</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>{(wallet?.npBalance ?? 0).toLocaleString()} NP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: '600' }}>Tỷ giá</span>
                  <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>1 VND = 1 NP</span>
                </div>
              </div>

              {topUpSuccess ? (
                <div className="alert-banner success">{topUpSuccess}</div>
              ) : (
                <form onSubmit={handleTopUp}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Số tiền nạp (VND)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="10000"
                    max="10000000"
                    step="10000"
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    placeholder="VD: 50000"
                    style={{ marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {[20000, 50000, 100000, 200000].map(amt => (
                      <button key={amt} type="button" onClick={() => setTopUpAmount(String(amt))}
                        style={{ fontSize: '0.78rem', fontWeight: '700', padding: '5px 10px', borderRadius: '8px', border: `1px solid ${topUpAmount === String(amt) ? 'var(--primary)' : 'var(--line)'}`, background: topUpAmount === String(amt) ? 'rgba(var(--primary-rgb),0.08)' : 'transparent', color: topUpAmount === String(amt) ? 'var(--primary)' : 'var(--muted)', cursor: 'pointer' }}>
                        {(amt / 1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>
                  {topUpAmount && parseInt(topUpAmount) >= 10000 && (
                    <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: '#16a34a', fontWeight: '700' }}>
                      → Nhận được {parseInt(topUpAmount).toLocaleString('vi-VN')} NP
                    </p>
                  )}
                  {topUpError && (
                    <div className="alert-banner error" style={{ marginBottom: '12px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      {topUpError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="button primary-button" disabled={topUpLoading} style={{ flex: 1 }}>
                      {topUpLoading ? 'Đang nạp...' : 'Nạp ngay'}
                    </button>
                    <button type="button" className="button secondary-button" onClick={() => { setShowTopUpModal(false); setTopUpError(''); }}>Hủy</button>
                  </div>
                </form>
              )}
              <p style={{ margin: '14px 0 0', fontSize: '0.76rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.4 }}>
                Phiên bản demo — NP được cộng ngay lập tức (MOCK provider)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Premium Paywall Modal ─── */}
      {showPremiumPaywall && (
        <div className="glass-modal-overlay" onClick={() => setShowPremiumPaywall(false)}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="glass-modal-header">
              <Crown size={22} color="#f59e0b" />
              <h2>Yêu cầu Premium Pass</h2>
            </div>
            <div className="glass-modal-body">
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Crown size={32} color="#fff" />
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>Cơ hội này chỉ dành cho Premium</h3>
                <p style={{ margin: '0 0 18px', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Nhà tuyển dụng yêu cầu ứng viên có <strong>Premium Pass</strong> để ứng tuyển vị trí này — giúp đảm bảo chất lượng hồ sơ và giảm spam.
                </p>
                <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05))', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '14px 18px', textAlign: 'left', marginBottom: '6px' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: '800', fontSize: '0.9rem', color: 'var(--ink)' }}>Premium Pass bao gồm:</p>
                  {['Ứng tuyển không giới hạn vị trí Premium', 'Hồ sơ nổi bật hơn trong kết quả tìm kiếm', 'Badge xác nhận Premium trên Profile 3D'].map(item => (
                    <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '4px' }}>
                      <Check size={14} color="#16a34a" style={{ flexShrink: 0 }} /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-modal-body" style={{ paddingTop: 0 }}>
              {buyPremiumError && (
                <div className="alert-banner error" style={{ marginTop: 0, marginBottom: '12px' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  {buyPremiumError}
                  {buyPremiumError.includes('Số dư') && (
                    <button onClick={() => { setShowPremiumPaywall(false); setShowTopUpModal(true); }} style={{ marginLeft: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                      Nạp NP ngay
                    </button>
                  )}
                </div>
              )}
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)', textAlign: 'center' }}>
                Số dư hiện tại: <strong style={{ color: 'var(--ink)' }}>{walletLoading ? '...' : (wallet?.npBalance ?? 0).toLocaleString()} NP</strong>
                {' · '}Chi phí: <strong style={{ color: '#d97706' }}>40,000 NP</strong>
              </p>
            </div>
            <div className="glass-modal-footer">
              <button className="button secondary-button" onClick={() => { setShowPremiumPaywall(false); setBuyPremiumError(''); }} type="button" style={{ padding: '10px 16px', borderRadius: '12px' }}>
                Để sau
              </button>
              <button className="button primary-button" onClick={handleBuyPremium} type="button" disabled={buyPremiumLoading} style={{ padding: '10px 18px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
                {buyPremiumLoading ? 'Đang xử lý...' : <><Crown size={15} style={{ marginRight: '6px' }} /> Kích hoạt Premium</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
