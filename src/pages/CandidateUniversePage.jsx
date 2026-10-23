import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { getMyApplications } from '../api/applicationApi.js';
import { getStoredUser } from '../lib/authStorage.js';
import { FonlioWrappedStory } from '../components/universe/FonlioWrappedStory.jsx';
import { MemorySpotlightModal } from '../components/universe/MemorySpotlightModal.jsx';

const SAMPLE_MEMORIES = [
  {
    id: 'sample-1',
    title: 'Tuần lễ Xanh ở trường',
    organization: 'CLB Môi trường ĐH FPT',
    category: 'CLB / Hoạt động xã hội',
    roleLevel: 'Trưởng ban điều phối',
    startDate: 'Tháng 3/2025',
    endDate: 'Tháng 5/2025',
    verified: true,
    expReward: 350,
    rsReward: 10,
    detail:
      'Chỉ huy chiến dịch gom rác và tái chế rác thải nhựa toàn trường, thu hút hơn 1,200 sinh viên tham gia và quyên góp 30 triệu đồng cho quỹ cây xanh.\n\nBài học: Quản trị sự bất định của thời tiết, phân quyền linh hoạt theo tổ đội và ứng dụng mã QR điểm danh để tối ưu 80% thời gian đón tiếp.',
  },
  {
    id: 'sample-2',
    title: '60 giây Sài Gòn — Viral Video',
    organization: 'Dự án Sáng tạo Độc lập',
    category: 'Sáng tạo & Media',
    roleLevel: 'Director & Editor',
    startDate: 'Tháng 6/2025',
    endDate: 'Tháng 7/2025',
    verified: true,
    expReward: 400,
    rsReward: 5,
    detail:
      'Sản xuất chuỗi thước phim ngắn về nhịp sống và ẩm thực Sài Gòn trên TikTok, đạt hơn 850,000 lượt xem và được chọn triển lãm tại Ngày hội Sáng tạo trẻ.\n\nBài học: Nghệ thuật bắt nhịp 3 giây đầu (Hook), tối ưu màu sắc theo tâm lý Gen Z và cách điều phối góc quay cơ động trong không gian hẹp.',
  },
  {
    id: 'sample-3',
    title: 'NextGen Tech Hackathon',
    organization: 'Khoa Công nghệ Thông tin',
    category: 'Công nghệ & Kỹ thuật',
    roleLevel: 'Lead Frontend Developer',
    startDate: 'Tháng 9/2025',
    endDate: 'Tháng 10/2025',
    verified: true,
    expReward: 500,
    rsReward: 10,
    detail:
      'Dẫn dắt đội ngũ 4 thành viên phát triển ứng dụng hỗ trợ học tập bằng AI, xuất sắc giành Giải Nhất chung cuộc sau 48 giờ thi liên tục.\n\nBài học: Kiến trúc component tái sử dụng cao, tối ưu render WebGL dưới 16ms và tinh thần kiên định khi đối mặt với bug phút chót.',
  },
  {
    id: 'sample-4',
    title: 'Chiến dịch Tuyển sinh Gen Z',
    organization: 'Phòng Tuyển sinh & Truyền thông',
    category: 'Kinh tế & Marketing',
    roleLevel: 'Content Creator',
    startDate: 'Tháng 11/2025',
    endDate: 'Tháng 12/2025',
    verified: false,
    expReward: 250,
    rsReward: 5,
    detail:
      'Chắp bút cho chuỗi bài viết định hướng nghề nghiệp, tiếp cận hơn 45,000 học sinh THPT trên toàn quốc.\n\nBài học: Nắm bắt nỗi sợ chọn sai ngành của học sinh cuối cấp, xây dựng giọng văn đồng cảm thay vì áp đặt.',
  },
  {
    id: 'sample-5',
    title: 'Hệ thống Quản lý Điểm danh QR',
    organization: 'CLB Lập trình Phần mềm',
    category: 'Công nghệ & Kỹ thuật',
    roleLevel: 'Fullstack Contributor',
    startDate: 'Tháng 1/2026',
    endDate: 'Tháng 3/2026',
    verified: true,
    expReward: 450,
    rsReward: 8,
    detail:
      'Xây dựng module quét mã QR và tích hợp xác thực khuôn mặt, giảm 80% thời gian điểm danh tại các hội thảo quy mô lớn.\n\nBài học: Tối ưu tải cơ sở dữ liệu PostgreSQL khi có 500 yêu cầu quét đồng thời trong vòng 3 phút.',
  },
  {
    id: 'sample-6',
    title: 'Bộ Nhận diện Thương hiệu Sinh viên',
    organization: 'Cộng đồng Sáng tạo Gen Z',
    category: 'Sáng tạo & Media',
    roleLevel: 'Brand Identity Designer',
    startDate: 'Tháng 4/2026',
    endDate: 'Tháng 5/2026',
    verified: false,
    expReward: 300,
    rsReward: 5,
    detail:
      'Dựng bộ nhận diện thương hiệu cho 3 dự án khởi nghiệp sinh viên với phong cách tối giản và typography hiện đại.\n\nBài học: Lắng nghe ý kiến của người sáng lập, chuyển hóa triết lý trừu tượng thành hệ thống hình khối có tính ứng dụng cao.',
  },
];

export function CandidateUniversePage() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState(0);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  useEffect(() => {
    document.title = 'FONLIO — Vũ Trụ Ký Ức & Triển Lãm Minh Chứng Sống';
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('wrapped') === 'true' || urlParams.get('openWrapped') === 'true') {
      setIsWrappedOpen(true);
    }

    // Bridge messages from the universe iframe
    const handleMessage = (event) => {
      if (event.data?.type === 'OPEN_WRAPPED') {
        setIsWrappedOpen(true);
      } else if (event.data?.type === 'OPEN_MEMORY_SPOTLIGHT') {
        const idx = typeof event.data?.payload?.memoryIndex === 'number' ? event.data.payload.memoryIndex : 0;
        setSelectedMemoryIndex(idx);
        setIsSpotlightOpen(true);
      } else if (event.data?.type === 'NAVIGATE_HOME') {
        navigate('/');
      } else if (event.data?.type === 'NAVIGATE_DASHBOARD') {
        navigate('/candidates/dashboard/overview');
      } else if (event.data?.type === 'NAVIGATE_PORTFOLIO_EDIT') {
        navigate('/candidates/dashboard/portfolio');
      }
    };

    window.addEventListener('message', handleMessage);

    // Fetch candidate portfolio and real completed jobs
    let isMounted = true;
    Promise.allSettled([getMyPortfolio(), getMyApplications()])
      .then(([portfolioRes, appsRes]) => {
        if (!isMounted) return;
        if (portfolioRes.status === 'fulfilled' && portfolioRes.value) {
          setPortfolio(portfolioRes.value);
        }
        if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value)) {
          setApplications(appsRes.value);
        }
      })
      .catch((err) => {
        console.warn('Universe data load error:', err);
      });

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('message', handleMessage);
      isMounted = false;
    };
  }, [navigate]);

  const user = getStoredUser();
  const displayName =
    portfolio?.name ||
    portfolio?.fullName ||
    user?.name ||
    user?.fullName ||
    user?.username ||
    'Tài Phát';
  const realExperiences = portfolio?.experiences || [];
  const displayExperiences = realExperiences.length > 0 ? realExperiences : SAMPLE_MEMORIES;

  const totalExp = useMemo(() => {
    if (portfolio?.totalExp !== undefined && portfolio?.totalExp !== null) {
      return portfolio.totalExp;
    }
    return displayExperiences.reduce((acc, curr) => acc + (curr.expReward || 300), 0);
  }, [portfolio?.totalExp, displayExperiences]);

  const totalRs = useMemo(() => {
    if (portfolio?.reputationScore !== undefined && portfolio?.reputationScore !== null) {
      return portfolio.reputationScore;
    }
    return displayExperiences.reduce((acc, curr) => acc + (curr.rsReward || 5), 0);
  }, [portfolio?.reputationScore, displayExperiences]);

  const verifiedCount = useMemo(() => {
    return displayExperiences.filter((e) => e.status === 'APPROVED' || e.verified).length;
  }, [displayExperiences]);

  // When portfolio finishes loading, update iframe dynamically
  useEffect(() => {
    if (loaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_UNIVERSE_DATA',
          payload: {
            name: displayName,
            exp: totalExp,
            rs: totalRs,
            verified: verifiedCount,
            experiences: displayExperiences,
            skills: portfolio?.skills || [],
            skillDetails: portfolio?.skillDetails || [],
            credentials: portfolio?.credentials || [],
            applications: applications || [],
          },
        },
        '*'
      );
    }
  }, [loaded, displayName, totalExp, totalRs, verifiedCount, displayExperiences, portfolio, applications]);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      v: '29',
      name: displayName,
      exp: String(totalExp),
      rs: String(totalRs),
      verified: String(verifiedCount),
    });
    return `/universe-clone/index.html?${params.toString()}`;
  }, [displayName, totalExp, totalRs, verifiedCount]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#070a0f',
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      <iframe
        ref={iframeRef}
        id="fonlioUniverseFrame"
        src={iframeSrc}
        title="FONLIO — Vũ Trụ Ký Ức & Triển Lãm Minh Chứng Sống"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          backgroundColor: '#070a0f',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#070a0f',
            color: '#f5e7df',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '13px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            gap: 16,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: '2px solid rgba(245, 231, 223, 0.2)',
              borderTopColor: '#b9ff00',
              borderRadius: '50%',
              animation: 'spinUniverse 0.8s linear infinite',
            }}
          />
          <span style={{ color: '#b9ff00', fontWeight: 700 }}>Đang khởi tạo Vũ Trụ Ký Ức Fonlio...</span>
          <style>{`
            @keyframes spinUniverse {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Spotify Wrapped Story Overlay Modal */}
      {isWrappedOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
          }}
        >
          <FonlioWrappedStory
            candidate={{
              name: displayName,
              avatar: portfolio?.avatar,
              avatarUrl: portfolio?.avatarUrl,
              totalExp: totalExp,
              reputationScore: totalRs,
              currentLevel: portfolio?.currentLevel || 2,
              skills: portfolio?.skills?.length ? portfolio.skills : ['UI/UX Design', 'ReactJS', 'Figma', 'TypeScript', 'NodeJS'],
              publicSlug: portfolio?.publicSlug || 'tai-phat',
            }}
            experiences={displayExperiences}
            onClose={() => setIsWrappedOpen(false)}
          />
        </div>
      )}

      {/* 3D Living Proof Memory Spotlight Modal */}
      {isSpotlightOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100001,
          }}
        >
          <MemorySpotlightModal
            experience={displayExperiences[selectedMemoryIndex] || displayExperiences[0]}
            currentIndex={selectedMemoryIndex}
            totalCount={displayExperiences.length}
            onClose={() => setIsSpotlightOpen(false)}
            onPrev={() => setSelectedMemoryIndex((prev) => Math.max(0, prev - 1))}
            onNext={() => setSelectedMemoryIndex((prev) => Math.min(displayExperiences.length - 1, prev + 1))}
            hasPrev={selectedMemoryIndex > 0}
            hasNext={selectedMemoryIndex < displayExperiences.length - 1}
          />
        </div>
      )}
    </div>
  );
}
