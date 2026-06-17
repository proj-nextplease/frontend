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
  Moon,
  Sun,
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
} from 'lucide-react';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { PortfolioAvatar3D } from './CandidatePortfolioPage.jsx';
import { getJobs, getCompanies, getCompanyDetail } from '../api/jobApi.js';
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

const defaultMockApplications = [
  {
    id: 'mock-app-1',
    title: 'Thực tập sinh Thiết kế UI/UX',
    companyName: 'FPT Software',
    category: 'DESIGN',
    jobType: 'INTERNSHIP',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
    status: 'REJECTED',
    rejectionReason: 'Hồ sơ 3D chưa hoàn thành đầy đủ các thông tin kỹ năng thực tế về thiết kế sản phẩm Figma.'
  },
  {
    id: 'mock-app-2',
    title: 'Cộng tác viên Marketing Online',
    companyName: 'VNG Corporation',
    category: 'BUSINESS',
    jobType: 'PART_TIME',
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
    status: 'PENDING',
    rejectionReason: null
  }
];

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

export function CandidateDashboardPage({ initialPortfolio }) {
  const navigate = useNavigate();
  const { tabSlug } = useParams();
  const location = useLocation();

  const [portfolio, setPortfolio] = useState(initialPortfolio || null);
  const [loading, setLoading] = useState(!initialPortfolio);
  const [activeView, setActiveView] = useState('OVERVIEW'); // OVERVIEW, OPPORTUNITIES, ROADMAP, CREDENTIALS, ORGANIZATIONS, ORGANIZATION_DETAIL

  // Theme support
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('nextplease:candidate-sidebar-collapsed') === 'true';
  });

  // Application simulator states
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const saved = localStorage.getItem('nextplease:candidate-applied-jobs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('nextplease:candidate-applied-jobs', JSON.stringify(defaultMockApplications));
    return defaultMockApplications;
  });
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

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
      if (['OVERVIEW', 'OPPORTUNITIES', 'ROADMAP', 'CREDENTIALS', 'ORGANIZATIONS'].includes(upperTab)) {
        setActiveView(upperTab);
        setSelectedOrg(null);
        
        if (upperTab === 'OPPORTUNITIES') {
          setIsSidebarCollapsed(true);
          localStorage.setItem('nextplease:candidate-sidebar-collapsed', 'true');
        }
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

  function toggleTheme() {
    const nextTheme = isDarkTheme ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('nextplease:theme', nextTheme);
    setIsDarkTheme(!isDarkTheme);
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    navigate('/');
  }

  function handleApplyJob(job) {
    setSelectedJobForApply(job);
    setShowApplyModal(true);
  }

  function confirmApplyJob() {
    if (!selectedJobForApply) return;

    const newApplication = {
      id: `app-${Date.now()}`,
      title: selectedJobForApply.title,
      companyName: selectedJobForApply.companyName || 'Đối tác',
      category: selectedJobForApply.category,
      jobType: selectedJobForApply.jobType,
      appliedAt: new Date().toLocaleDateString('vi-VN'),
      status: 'PENDING',
      rejectionReason: null
    };

    const updated = [newApplication, ...appliedJobs];
    setAppliedJobs(updated);
    localStorage.setItem('nextplease:candidate-applied-jobs', JSON.stringify(updated));

    setShowApplyModal(false);
    setSelectedJobForApply(null);

    setApplySuccessMsg(`Ứng tuyển thành công vị trí "${newApplication.title}"! Trạng thái đang ở chế độ Chờ duyệt.`);
    setTimeout(() => {
      setApplySuccessMsg('');
    }, 6000);
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
  const hasApplications = appliedJobs.length > defaultMockApplications.length;

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
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className="candidate-portal-brand" style={{ display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="candidate-portal-brand-logo">
                <Sparkles size={18} />
              </span>
              {!isSidebarCollapsed && <span style={{ fontWeight: 950 }}>nextplease Hub</span>}
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
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted)',
                padding: '4px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSidebarCollapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
            </button>
          </div>

          {/* Mini User Profile Card */}
          {!isSidebarCollapsed && (
            <div className="candidate-portal-profile-card">
              <div className="candidate-portal-profile-avatar">
                {portfolio?.name ? portfolio.name.slice(0, 2).toUpperCase() : 'C'}
              </div>
              <div className="candidate-portal-profile-info">
                <span className="candidate-portal-profile-name" title={portfolio?.name || 'Ứng viên'}>
                  {portfolio?.name || 'Ứng viên'}
                </span>
                <span className="candidate-portal-profile-level">Cấp độ {currentLevel}</span>
              </div>
            </div>
          )}

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
              {!isSidebarCollapsed && <span>Bảng cơ hội & Quest</span>}
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
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent' }}
                  title={`Chi tiết: ${org.name}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
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
                    {!isSidebarCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{org.name}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <X
                      size={13}
                      className="tab-close-icon"
                      onClick={(e) => handleCloseOrgTab(e, org.id)}
                      style={{
                        marginLeft: '8px',
                        borderRadius: '4px',
                        transition: 'all 150ms ease',
                        color: 'var(--muted)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.15)'; e.target.style.color = '#ef4444'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--muted)'; }}
                    />
                  )}
                </button>
              );
            })}

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
          <button
            className="theme-switch-btn"
            onClick={toggleTheme}
            type="button"
            title={isDarkTheme ? 'Đổi sang Giao diện Sáng' : 'Đổi sang Giao diện Tối'}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
          >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
            {!isSidebarCollapsed && <span>{isDarkTheme ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>}
          </button>

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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', fontWeight: 'bold' }}
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. OVERVIEW VIEW */}
        {activeView === 'OVERVIEW' && (
          <div>
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
            <section className="candidate-metrics-grid">
              <div className="candidate-metric-box">
                <div className="candidate-metric-icon">
                  <WalletCards size={22} />
                </div>
                <div className="candidate-metric-details">
                  <span className="candidate-metric-label">Số dư ví</span>
                  <span className="candidate-metric-value">
                    {portfolio?.npBalance !== undefined ? portfolio.npBalance.toLocaleString() : '0'} NP
                  </span>
                  <span className="candidate-metric-subtext">Điểm thưởng tích luỹ</span>
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
          <section style={{ border: '1px solid var(--line)', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(15px)', borderRadius: '28px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '850', color: 'var(--muted)', letterSpacing: '0.05em', margin: 0 }}>Opportunity board</p>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: '900', color: 'var(--ink)' }}>Bảng cơ hội phát triển sự nghiệp</h2>
              </div>
              <span style={{ fontSize: '0.86rem', color: 'var(--muted)', background: 'var(--surface-soft)', padding: '6px 12px', borderRadius: '10px', fontWeight: 'bold' }}>
                Tìm thấy {filteredJobs.length} bài đăng
              </span>
            </div>

            {/* Filter Console */}
            <div className="candidate-filters-panel" style={{
              background: 'var(--surface-soft)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Row 1: Search */}
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => {
                      setFilterSearch(e.target.value);
                      updateSearchUrl('q', e.target.value);
                    }}
                    placeholder="Tìm kiếm vị trí tuyển dụng, từ khóa kỹ năng, hoặc tên công ty..."
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '14px',
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--ink)',
                      boxSizing: 'border-box',
                      fontSize: '0.94rem'
                    }}
                  />
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--muted)' }} />
                  {filterSearch && (
                    <button
                      onClick={() => {
                        setFilterSearch('');
                        updateSearchUrl('q', '');
                      }}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--muted)',
                        fontSize: '1.1rem'
                      }}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Select Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '850', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Lĩnh vực chính</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setFilterSpecialty('');
                      updateSearchUrl('c', e.target.value);
                      updateSearchUrl('s', '');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--ink)',
                      fontSize: '0.92rem',
                      height: '46px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Tất cả lĩnh vực</option>
                    {Object.keys(CATEGORY_MAP).map(key => (
                      <option key={key} value={key}>{CATEGORY_MAP[key].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '850', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Chuyên ngành chi tiết</label>
                  <select
                    value={filterSpecialty}
                    onChange={(e) => {
                      setFilterSpecialty(e.target.value);
                      updateSearchUrl('s', e.target.value);
                    }}
                    disabled={!filterCategory}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--line)',
                      background: !filterCategory ? 'var(--surface-soft)' : 'var(--bg)',
                      color: !filterCategory ? 'var(--muted)' : 'var(--ink)',
                      fontSize: '0.92rem',
                      height: '46px',
                      cursor: !filterCategory ? 'not-allowed' : 'pointer',
                      opacity: !filterCategory ? 0.6 : 1
                    }}
                  >
                    <option value="">Tất cả chuyên ngành</option>
                    {filterCategory && (CATEGORY_MAP[filterCategory]?.specialties || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '850', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Loại hình làm việc</label>
                  <select
                    value={filterJobType}
                    onChange={(e) => {
                      setFilterJobType(e.target.value);
                      updateSearchUrl('t', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--ink)',
                      fontSize: '0.92rem',
                      height: '46px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Tất cả loại hình</option>
                    {JOB_TYPES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Toggles */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: '14px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={filterIsRemote}
                    onChange={(e) => {
                      setFilterIsRemote(e.target.checked);
                      updateSearchUrl('r', e.target.checked);
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)' }}>Chỉ hiển thị việc Remote</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={filterCanApply}
                    onChange={(e) => {
                      setFilterCanApply(e.target.checked);
                      updateSearchUrl('fit', e.target.checked);
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} color="var(--primary)" /> Chỉ hiện Quest có thể ứng tuyển (Đủ RS)
                  </span>
                </label>
              </div>
            </div>

            {/* Grid of Cards */}
            <div className="candidate-opportunities-grid">
              {jobsLoading ? (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '12px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--line)' }}>
                  <RefreshCw className="animate-spin" size={26} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                  <p style={{ fontSize: '0.92rem', color: 'var(--muted)', fontWeight: '600' }}>Đang tải bảng cơ hội...</p>
                </div>
              ) : jobsError ? (
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626' }}>
                  <AlertTriangle size={20} />
                  <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600' }}>{jobsError}</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px dashed var(--line)', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--card-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                    <Search size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--ink)' }}>Không tìm thấy cơ hội nào</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)' }}>Hãy thử điều chỉnh lại bộ lọc tìm kiếm ở phía trên.</p>
                  </div>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isLocked = candidateRs < job.minReqRs;
                  const tone = getCategoryTone(job.category);
                  const compensationText = job.compensation > 0
                    ? `${Number(job.compensation).toLocaleString()} VND`
                    : 'Thỏa thuận';

                  return (
                    <article className={`candidate-quest-item ${tone}`} key={job.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeftWidth: '6px',
                      padding: '20px',
                      height: '100%',
                      margin: 0
                    }}>
                      <div>
                        {/* Top Line tags */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '850', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--surface-soft)', color: 'var(--ink)' }}>
                            <Building size={11} /> {job.companyName || 'Đối tác'}
                          </span>
                          <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', padding: '4px 8px' }}>
                            {JOB_TYPES.find(t => t.value === job.jobType)?.label || job.jobType}
                          </span>
                          {job.isRemote && (
                            <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', padding: '4px 8px' }}>
                              Remote
                            </span>
                          )}
                        </div>

                        <h3 style={{ margin: '4px 0 6px', fontSize: '1.2rem', fontWeight: '800', color: 'var(--ink)' }}>{job.title}</h3>
                        
                        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: '8px 0 12px', lineHeight: 1.5 }}>
                          {job.description?.length > 130 ? `${job.description.slice(0, 130)}...` : job.description}
                        </p>

                        {/* Skills Badge */}
                        {job.skills && job.skills.length > 0 && (
                          <div style={{ margin: '12px 0', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                            {job.skills.slice(0, 3).map((s, idx) => (
                              <span key={idx} style={{
                                fontSize: '0.68rem',
                                fontWeight: '700',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'var(--card-bg-strong)',
                                border: '1px solid var(--line)',
                                color: 'var(--ink)'
                              }}>
                                {s.skillName}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--muted)' }}>+{job.skills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom row actions */}
                      <div style={{
                        marginTop: '16px',
                        borderTop: '1px solid var(--line)',
                        paddingTop: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <div>
                            <span style={{ color: 'var(--muted)', fontSize: '0.74rem', display: 'block' }}>THÙ LAO</span>
                            <strong style={{ color: 'var(--primary)', fontWeight: '900' }}>{compensationText}</strong>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: 'var(--muted)', fontSize: '0.74rem', display: 'block' }}>YÊU CẦU RS</span>
                            <strong style={{ color: isLocked ? '#ef4444' : 'var(--ink)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              {job.minReqRs > 0 ? `${job.minReqRs} RS` : 'Không'}
                              {isLocked && <LockKeyhole size={11} color="#ef4444" />}
                            </strong>
                          </div>
                        </div>

                        <button
                          disabled={isLocked}
                          type="button"
                          onClick={() => handleApplyJob(job)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px 14px',
                            fontSize: '0.88rem',
                            fontWeight: '800'
                          }}
                        >
                          {isLocked ? 'Cần thêm điểm RS' : 'Ứng tuyển ngay'}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* 3. ORGANIZATIONS VIEW (DIRECTORY) */}
        {activeView === 'ORGANIZATIONS' && (
          <section style={{ border: '1px solid var(--line)', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(15px)', borderRadius: '28px', padding: '24px' }}>
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
                    fontSize: '1.1rem'
                  }}
                  type="button"
                >
                  ✕
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
          <section className="candidate-profile-summary" style={{ border: '1px solid var(--line)', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(15px)', borderRadius: '28px' }}>
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
          <div className="candidate-credentials-workspace">
            {/* Applied Jobs Tracker Section */}
            <section className="applications-tracker-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <BriefcaseBusiness size={20} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: 'var(--ink)' }}>Theo dõi Hồ sơ Ứng tuyển</h2>
              </div>

              {appliedJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', border: '1px dashed var(--line)', borderRadius: '16px', background: 'var(--surface-soft)' }}>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Bạn chưa nộp hồ sơ ứng tuyển vị trí nào.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="credential-table">
                    <thead>
                      <tr>
                        <th>Vị trí</th>
                        <th>Công ty</th>
                        <th>Thời gian</th>
                        <th>Loại hình</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appliedJobs.map((app) => (
                        <tr key={app.id}>
                          <td style={{ fontWeight: '800', color: 'var(--ink)' }}>{app.title}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building size={14} color="var(--muted)" />
                              {app.companyName}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--muted)' }}>
                              <Calendar size={13} />
                              {app.appliedAt}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '6px', background: 'var(--surface-soft)', fontWeight: 'bold' }}>
                              {JOB_TYPES.find(t => t.value === app.jobType)?.label || app.jobType}
                            </span>
                          </td>
                          <td>
                            <div>
                              <span className={`status-badge ${app.status.toLowerCase()}`}>
                                {app.status === 'PENDING' && <Clock3 size={12} />}
                                {app.status === 'APPROVED' && <CheckCircle2 size={12} />}
                                {app.status === 'REJECTED' && <AlertTriangle size={12} />}
                                {app.status === 'PENDING' ? 'Chờ duyệt' : app.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                              </span>
                              {app.status === 'REJECTED' && app.rejectionReason && (
                                <div className="rejection-reason-box">
                                  <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                                  <span>Lý do: {app.rejectionReason}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {portfolio.credentials.filter(c => c.name?.trim()).map((cred) => (
                    <article key={cred.id} style={{
                      border: '1px solid var(--line)',
                      borderRadius: '16px',
                      padding: '16px',
                      background: 'var(--bg)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

            {/* Score transaction history mock */}
            <section className="credentials-list-section" style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: 'var(--ink)' }}>Lịch sử giao dịch điểm uy tín (RS)</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: 'var(--soft-card-bg)', border: '1px solid var(--line)' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)', fontWeight: '800' }}>Khởi tạo tài khoản và đồng bộ</h5>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Hệ thống kích hoạt</span>
                  </div>
                  <strong style={{ color: '#22c55e', fontSize: '0.95rem' }}>+100 RS</strong>
                </div>
                {has3D && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: 'var(--soft-card-bg)', border: '1px solid var(--line)' }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)', fontWeight: '800' }}>Dựng hình ảnh 3D Portfolio cá nhân</h5>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Xác thực cấu trúc hồ sơ</span>
                    </div>
                    <strong style={{ color: '#22c55e', fontSize: '0.95rem' }}>+50 RS</strong>
                  </div>
                )}
                {hasCredentials && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: 'var(--soft-card-bg)', border: '1px solid var(--line)' }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)', fontWeight: '800' }}>Tải chứng chỉ ngoại ngữ và chuyên môn</h5>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Minh chứng thực tế</span>
                    </div>
                    <strong style={{ color: '#22c55e', fontSize: '0.95rem' }}>+150 RS</strong>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ─── Application Confirmation Glass Modal ─── */}
      {showApplyModal && selectedJobForApply && (
        <div className="glass-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <Sparkles size={20} color="var(--primary)" />
              <h2>Xác nhận ứng tuyển cơ hội</h2>
            </div>
            <div className="glass-modal-body">
              <p style={{ margin: '0 0 16px', lineHeight: 1.5, fontSize: '0.95rem', color: 'var(--ink)' }}>
                Bạn đang thực hiện nộp hồ sơ trực tuyến cho cơ hội sau:
              </p>
              <div style={{
                background: 'var(--surface-soft)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: 'var(--ink)', fontWeight: '800' }}>{selectedJobForApply.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.88rem' }}>
                  <Building size={14} />
                  <span>{selectedJobForApply.companyName || 'Đối tác'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '10px', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  <span>Thù lao: <strong style={{ color: 'var(--primary)' }}>{selectedJobForApply.compensation > 0 ? `${Number(selectedJobForApply.compensation).toLocaleString()} VND` : 'Thỏa thuận'}</strong></span>
                  <span>Điều kiện RS: <strong>{selectedJobForApply.minReqRs > 0 ? `${selectedJobForApply.minReqRs} RS` : 'Không có'}</strong></span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', color: '#22c55e' }} />
                Hệ thống sẽ tự động đính kèm Portfolio 3D hiện tại, học vấn và các bằng cấp đã được xác minh của bạn để gửi tới nhà tuyển dụng.
              </p>
            </div>
            <div className="glass-modal-footer">
              <button
                className="button secondary-button"
                onClick={() => setShowApplyModal(false)}
                type="button"
                style={{ padding: '10px 16px', borderRadius: '12px' }}
              >
                Hủy bỏ
              </button>
              <button
                className="button primary-button"
                onClick={confirmApplyJob}
                type="button"
                style={{ padding: '10px 18px', borderRadius: '12px' }}
              >
                Xác nhận nộp đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
