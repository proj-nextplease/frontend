import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  House, PlusSquare, Heart, MessageCircle, Send, Share2,
  FileText, BarChart2,
  X, Check, ChevronRight, ArrowLeft, ShieldCheck,
  Sparkles, CheckCircle2, User, Link2, MoreHorizontal,
  Bookmark, Award, ThumbsUp, HelpCircle
} from 'lucide-react';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { useAuthModal } from '../context/AuthModalContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';
import { UserAvatar } from '../components/UserAvatar.jsx';
import { EmptyStateMascot } from '../components/EmptyStateMascot.jsx';
import { useMyProfile } from '../lib/useMyProfile.js';
import {
  getTopics, toggleFollowTopic, getPosts, createPost as apiCreatePost,
  toggleLikePost, votePoll as apiVotePoll, getComments, addComment as apiAddComment,
} from '../api/discussionApi.js';

/* ── Hệ màu nền tối, dùng chung với trang chủ và /jobs (xem DESIGN.md) ── */
const EMERALD = '#10b981';
const TEAL = '#0d9488';
const INK = '#0b0f0e';            // nền trang
const SURFACE = '#121817';        // bề mặt nổi: thẻ bài, modal, menu
const ON_DARK = '#ffffff';
const MUTED = 'rgba(233,247,242,0.62)';
const LINE = 'rgba(255,255,255,0.1)';
const LINE_STRONG = 'rgba(255,255,255,0.2)';
const BG_PAGE = INK;
/* Đặc hơn thẻ ở trang chủ/jobs: feed nằm đè lên tấm mesh, để nền 0.016 như
   bên kia thì thẻ chìm hẳn vào màu loang và mất cảm giác là một thẻ. */
const CARD_BG = 'rgba(18,24,23,0.72)';

/* ── 3D Sticker SVGs for Topics ── */
function Topic3DIcon({ type, size = 36 }) {
  if (type === 'phong-van') {
    // 3D Yellow Speech Bubble
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <radialGradient id="yBg" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
          <filter id="yShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#ca8a04" floodOpacity="0.35" />
          </filter>
        </defs>
        <rect width="48" height="48" rx="14" fill="#fef9c3" />
        <g filter="url(#yShadow)">
          <path
            d="M12 22C12 16.477 16.477 12 22 12H28C33.523 12 38 16.477 38 22C38 27.523 33.523 32 28 32H20L14 36V30.5C12.76 28.2 12 25.3 12 22Z"
            fill="url(#yBg)"
          />
          <circle cx="21" cy="22" r="2.2" fill="#78350f" />
          <circle cx="28" cy="22" r="2.2" fill="#78350f" />
          <path d="M22 25.5C23 27 26 27 27 25.5" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (type === 'open-to-work') {
    // 3D Purple Clipboard with Green Arrow
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="pBoard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="gArrow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="#f3e8ff" />
        <rect x="13" y="12" width="22" height="26" rx="5" fill="url(#pBoard)" stroke="#6b21a8" strokeWidth="1.5" />
        <rect x="18" y="9" width="12" height="5" rx="2" fill="#f3f4f6" stroke="#4b5563" strokeWidth="1.2" />
        <rect x="17" y="19" width="14" height="2" rx="1" fill="#e9d5ff" />
        <rect x="17" y="23" width="10" height="2" rx="1" fill="#e9d5ff" />
        <circle cx="32" cy="32" r="8" fill="#ffffff" />
        <circle cx="32" cy="32" r="7" fill="url(#gArrow)" />
        <path d="M32 28V36M32 28L29.5 30.5M32 28L34.5 30.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'nang-cap-ky-nang') {
    // 3D Memo Sheet with Pencil
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="memoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="penGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="#ede9fe" />
        <rect x="12" y="11" width="22" height="26" rx="4" fill="#ffffff" stroke="#c4b5fd" strokeWidth="1.5" />
        <rect x="16" y="16" width="14" height="2.5" rx="1" fill="#a78bfa" />
        <rect x="16" y="21" width="11" height="2.5" rx="1" fill="#c4b5fd" />
        <rect x="16" y="26" width="8" height="2.5" rx="1" fill="#ddd6fe" />
        {/* Pencil */}
        <g transform="rotate(40 32 30)">
          <rect x="30" y="18" width="5" height="16" rx="1" fill="url(#penGrad)" stroke="#b45309" strokeWidth="1" />
          <polygon points="30,34 35,34 32.5,39" fill="#fed7aa" stroke="#b45309" strokeWidth="1" />
          <polygon points="31.5,37 33.5,37 32.5,39" fill="#1f2937" />
        </g>
      </svg>
    );
  }

  if (type === 'kham-pha-ban-than') {
    // 3D Person Meditating / Reading
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#fef2f2" />
        <circle cx="24" cy="18" r="6" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.5" />
        <circle cx="22" cy="17" r="1" fill="#4b5563" />
        <circle cx="26" cy="17" r="1" fill="#4b5563" />
        <path d="M23 20C23.5 21 24.5 21 25 20" stroke="#db2777" strokeWidth="1.2" strokeLinecap="round" />
        {/* Body */}
        <path d="M16 35C16 28 20 25 24 25C28 25 32 28 32 35H16Z" fill="#ec4899" />
        {/* Book */}
        <rect x="19" y="30" width="10" height="7" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
        <line x1="24" y1="30" x2="24" y2="37" stroke="#ca8a04" strokeWidth="1.2" />
      </svg>
    );
  }

  if (type === 'kham-pha-nghe-nghiep') {
    // 3D Green Briefcase with Heart
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="caseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="#dcfce7" />
        <path d="M20 13H28V16H20V13Z" fill="#15803d" stroke="#166534" strokeWidth="1.2" />
        <rect x="11" y="16" width="26" height="20" rx="5" fill="url(#caseGrad)" stroke="#15803d" strokeWidth="1.5" />
        <line x1="11" y1="23" x2="37" y2="23" stroke="#15803d" strokeWidth="1.5" />
        <circle cx="24" cy="23" r="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        {/* Heart badge */}
        <circle cx="33" cy="32" r="5" fill="#ffffff" />
        <path d="M33 30.2C32.3 29.5 31.2 29.5 30.6 30.1C30 30.7 30 31.8 30.6 32.4L33 34.8L35.4 32.4C36 31.8 36 30.7 35.4 30.1C34.8 29.5 33.7 29.5 33 30.2Z" fill="#ec4899" />
      </svg>
    );
  }

  // 'viec-tim-nguoi' / default: 3D Purple Folder with Profile
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="folderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="#f3e8ff" />
      <path d="M12 17C12 15.343 13.343 14 15 14H21L24 17H33C34.657 17 36 18.343 36 20V32C36 33.657 34.657 35 33 35H15C13.343 35 12 33.657 12 32V17Z" fill="url(#folderGrad)" stroke="#581c87" strokeWidth="1.5" />
      <rect x="17" y="22" width="14" height="9" rx="2" fill="#ffffff" />
      <circle cx="21" cy="26" r="2" fill="#a855f7" />
      <line x1="25" y1="25" x2="29" y2="25" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="28" x2="28" y2="28" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── 6 Topics matching Upzi ── */
/* ── Chuẩn hoá dữ liệu từ API về đúng shape mà phần render đang dùng ── */

/* Nền avatar dự phòng khi người dùng chưa có ảnh. Dải pastel cũ đặt trên nền
   tối biến thành một cột đốm sáng chạy dọc feed, kéo mắt khỏi nội dung — đổi
   sang các sắc độ mờ cùng tông với hệ. */
const POST_MAX_CHARS = 2000;

const AVATAR_BGS = [
  'rgba(16,185,129,0.22)', 'rgba(103,232,249,0.2)', 'rgba(167,139,250,0.2)',
  'rgba(56,189,248,0.2)', 'rgba(251,146,60,0.2)', 'rgba(163,230,53,0.2)',
];

/** Màu nền avatar ổn định theo tên, để cùng một người luôn ra cùng một màu. */
function avatarBgFor(name) {
  const key = String(name || '');
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 997;
  return AVATAR_BGS[hash % AVATAR_BGS.length];
}

function initialsFor(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] || '') + (words[1]?.[0] || '')).toUpperCase() || 'NP';
}

/** "9 phút trước" từ mốc thời gian ISO. */
function timeAgoFrom(iso) {
  if (!iso) return 'Vừa xong';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Vừa xong';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(then).toLocaleDateString('vi-VN');
}

/** 2400 → "2.4K"; số nhỏ giữ nguyên. */
function compactCount(n) {
  const value = Number(n) || 0;
  if (value < 1000) return String(value);
  const k = value / 1000;
  return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
}

/**
 * Chủ đề dùng slug làm `id` để URL ?chu-de=... và bộ lọc bài viết giữ nguyên
 * cách hoạt động; `uuid` là khoá thật để gọi API theo dõi.
 */
function normalizeTopic(raw) {
  return {
    id: raw.slug,
    uuid: raw.id,
    name: raw.name,
    type: raw.iconType,
    official: raw.official !== false,
    description: raw.description || '',
    followersCount: compactCount(raw.followersCount),
    postsCount: compactCount(raw.postsCount),
    isFollowing: Boolean(raw.isFollowing),
  };
}

function normalizeComment(raw) {
  return {
    id: raw.id,
    author: raw.author,
    avatarUrl: raw.authorAvatarUrl || '',
    avatarBg: avatarBgFor(raw.author),
    role: raw.role,
    content: raw.content,
    timeAgo: timeAgoFrom(raw.createdAt),
  };
}

function normalizePost(raw) {
  return {
    id: raw.id,
    author: {
      name: raw.authorName,
      avatarUrl: raw.authorAvatarUrl || '',
      initials: initialsFor(raw.authorName),
      avatarBg: avatarBgFor(raw.authorName),
      role: raw.authorRole,
    },
    topicId: raw.topicSlug,
    topicName: raw.topicName,
    timeAgo: timeAgoFrom(raw.createdAt),
    content: raw.content,
    attachment: null, // đính kèm file chưa triển khai
    likesCount: Number(raw.likesCount) || 0,
    commentsCount: Number(raw.commentsCount) || 0,
    hasLiked: Boolean(raw.hasLiked),
    isMine: Boolean(raw.isMine),
    poll: raw.poll
      ? {
          totalVotes: Number(raw.poll.totalVotes) || 0,
          votedOption: raw.poll.votedOption || null,
          options: (raw.poll.options || []).map((o) => ({
            id: o.id,
            text: o.text,
            votes: Number(o.votes) || 0,
          })),
        }
      : null,
    comments: (raw.comments || []).map(normalizeComment),
  };
}

export function DiscussionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTopicParam = searchParams.get('chu-de');

  const [topics, setTopics] = useState([]);
  const [actionError, setActionError] = useState(null);

  // Feed được lưu kèm "khoá" của lần tải (chủ đề + cách sắp xếp + phiên đăng
  // nhập). Khoá lệch với tham số hiện tại nghĩa là đang tải — nhờ vậy không cần
  // setState đồng bộ trong effect.
  const [feed, setFeed] = useState({ key: null, rows: [], error: null });
  // Chủ đề đang xem lấy thẳng từ URL — không nhân bản sang state để hai nguồn
  // khỏi lệch nhau khi người dùng bấm back/forward.
  const selectedTopicId = activeTopicParam || null;
  const activeTab = selectedTopicId ? 'chu-de' : 'danh-cho-ban';
  const [filterMode, setFilterMode] = useState('newest'); // 'newest' | 'highlight'

  // Expanded posts (xem thêm)
  const [expandedPostIds, setExpandedPostIds] = useState({});

  // Comment input state per post
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Share popover state
  const [activeSharePostId, setActiveSharePostId] = useState(null);
  const [copyToast, setCopyToast] = useState(false);

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('open-to-work');
  const [newPostPollEnabled, setNewPostPollEnabled] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [creatingPost, setCreatingPost] = useState(false);

  // Following topics state — khoá theo slug, đồng bộ từ API khi tải chủ đề
  const [followedTopics, setFollowedTopics] = useState({});

  const { openLoginModal } = useAuthModal();
  const storedToken = getStoredToken();
  const { profile: myProfile } = useMyProfile();
  const myName = myProfile?.name?.trim() || 'Bạn';

  const feedKey = `${selectedTopicId || ''}|${filterMode}|${storedToken ? 'auth' : 'guest'}`;
  const posts = feed.rows;
  const loading = feed.key !== feedKey;
  const feedError = feed.error;

  /** Cập nhật feed tại chỗ, giữ nguyên khoá của lần tải hiện tại. */
  function setPosts(updater) {
    setFeed((prev) => ({
      ...prev,
      rows: typeof updater === 'function' ? updater(prev.rows) : updater,
    }));
  }

  // Tải danh sách chủ đề (kèm trạng thái theo dõi của người đang đăng nhập)
  useEffect(() => {
    let alive = true;
    getTopics()
      .then((rows) => {
        if (!alive) return;
        const normalized = rows.map(normalizeTopic);
        setTopics(normalized);
        setFollowedTopics(
          Object.fromEntries(normalized.filter((t) => t.isFollowing).map((t) => [t.id, true])),
        );
      })
      .catch(() => { if (alive) setTopics([]); });
    return () => { alive = false; };
  }, [storedToken]);

  // Tải feed; chạy lại khi đổi chủ đề hoặc cách sắp xếp. Việc lọc và sắp xếp do
  // BE làm để phân trang về sau vẫn đúng.
  useEffect(() => {
    let alive = true;
    getPosts({ topic: selectedTopicId || undefined, sort: filterMode === 'highlight' ? 'highlight' : 'newest' })
      .then((rows) => { if (alive) setFeed({ key: feedKey, rows: rows.map(normalizePost), error: null }); })
      .catch((err) => {
        if (alive) setFeed({ key: feedKey, rows: [], error: err.message || 'Không tải được bài viết thảo luận.' });
      });
    return () => { alive = false; };
  }, [feedKey, selectedTopicId, filterMode]);

  // Handler: Select Topic
  const handleSelectTopic = (topicId) => {
    setSearchParams({ 'chu-de': topicId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Back to Main Feed
  const handleBackToMain = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Guard Helper
  const requireAuth = (callback) => {
    if (!storedToken) {
      openLoginModal('candidate');
      return;
    }
    callback();
  };

  // Handler: Like Post — cập nhật lạc quan, hoàn tác nếu API lỗi
  const handleLikePost = (postId) => {
    requireAuth(async () => {
      const before = posts.find((p) => p.id === postId);
      if (!before) return;
      setPosts((prev) => prev.map((p) => (p.id === postId
        ? { ...p, hasLiked: !p.hasLiked, likesCount: p.hasLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1 }
        : p)));
      try {
        const result = await toggleLikePost(postId);
        setPosts((prev) => prev.map((p) => (p.id === postId
          ? { ...p, hasLiked: result.hasLiked, likesCount: result.likesCount }
          : p)));
      } catch (err) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? before : p)));
        setActionError(err.message || 'Không thể cập nhật lượt thích.');
      }
    });
  };

  // Handler: Vote Poll — mỗi người một phiếu cho mỗi bài, không đổi lại được
  const handleVotePoll = (postId, optionId) => {
    requireAuth(async () => {
      const before = posts.find((p) => p.id === postId);
      if (!before?.poll || before.poll.votedOption) return;
      setPosts((prev) => prev.map((p) => (p.id === postId && p.poll
        ? {
            ...p,
            poll: {
              ...p.poll,
              totalVotes: p.poll.totalVotes + 1,
              votedOption: optionId,
              options: p.poll.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
            },
          }
        : p)));
      try {
        await apiVotePoll(postId, optionId);
      } catch (err) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? before : p)));
        setActionError(err.message || 'Bình chọn thất bại.');
      }
    });
  };

  // Handler: Toggle Comments Thread. Feed chỉ kèm vài bình luận mới nhất nên
  // lần đầu mở thread sẽ tải đầy đủ.
  const toggleComments = (postId) => {
    const willOpen = !openComments[postId];
    setOpenComments((prev) => ({ ...prev, [postId]: willOpen }));
    if (!willOpen) return;
    const post = posts.find((p) => p.id === postId);
    if (!post || (post.comments?.length ?? 0) >= post.commentsCount) return;
    getComments(postId)
      .then((rows) => {
        setPosts((prev) => prev.map((p) => (p.id === postId
          ? { ...p, comments: rows.map(normalizeComment), commentsCount: rows.length }
          : p)));
      })
      .catch(() => { /* giữ nguyên các bình luận đã có */ });
  };

  // Handler: Add Comment
  const handleAddComment = (postId) => {
    requireAuth(async () => {
      const text = commentInputs[postId]?.trim();
      if (!text) return;
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      try {
        const created = await apiAddComment(postId, text);
        setPosts((prev) => prev.map((p) => (p.id === postId
          ? {
              ...p,
              commentsCount: p.commentsCount + 1,
              comments: [...(p.comments || []), normalizeComment(created)],
            }
          : p)));
      } catch (err) {
        setCommentInputs((prev) => ({ ...prev, [postId]: text }));
        setActionError(err.message || 'Gửi bình luận thất bại.');
      }
    });
  };

  // Handler: Toggle Follow Topic (topicId ở đây là slug)
  const handleToggleFollowTopic = (topicId) => {
    requireAuth(async () => {
      const topic = topics.find((t) => t.id === topicId);
      if (!topic) return;
      const wasFollowing = Boolean(followedTopics[topicId]);
      setFollowedTopics((prev) => ({ ...prev, [topicId]: !wasFollowing }));
      try {
        const result = await toggleFollowTopic(topic.uuid);
        setFollowedTopics((prev) => ({ ...prev, [topicId]: result.isFollowing }));
      } catch (err) {
        setFollowedTopics((prev) => ({ ...prev, [topicId]: wasFollowing }));
        setActionError(err.message || 'Không thể cập nhật theo dõi chủ đề.');
      }
    });
  };

  // Handler: Submit Create Post. Đăng xong tải lại feed để lấy đúng bài vừa tạo
  // từ server (id thật, mốc thời gian, poll) thay vì dựng tạm ở client.
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || creatingPost) return;

    requireAuth(async () => {
      const options = newPostPollEnabled
        ? pollOptions.map((o) => o.trim()).filter(Boolean)
        : [];
      if (newPostPollEnabled && options.length < 2) {
        setActionError('Bình chọn cần ít nhất 2 lựa chọn.');
        return;
      }

      setCreatingPost(true);
      setActionError(null);
      try {
        await apiCreatePost({
          topic: newPostTopic,
          content: newPostContent.trim(),
          pollOptions: options,
        });
        const rows = await getPosts({
          topic: selectedTopicId || undefined,
          sort: filterMode === 'highlight' ? 'highlight' : 'newest',
        });
        setFeed({ key: feedKey, rows: rows.map(normalizePost), error: null });
        setNewPostContent('');
        setNewPostPollEnabled(false);
        setPollOptions(['', '']);
        setIsCreateModalOpen(false);
      } catch (err) {
        setActionError(err.message || 'Đăng bài thất bại.');
      } finally {
        setCreatingPost(false);
      }
    });
  };

  // Handler: Copy Link
  const handleCopyLink = (postId) => {
    const shareUrl = `${window.location.origin}/thao-luan?post=${postId}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
    setActiveSharePostId(null);
  };

  // Current selected topic object (if in topic view)
  const currentTopic = topics.find((t) => t.id === selectedTopicId);

  // BE đã lọc theo chủ đề và sắp xếp theo filterMode, nên feed dùng thẳng.
  const displayedPosts = posts;

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      background: BG_PAGE,
      minHeight: '100vh',
      fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
      color: ON_DARK,
      marginTop: '-34px',
      overflowX: 'clip',
      // SiteHeader ở chế độ pinned={false} dùng position: absolute nên thẻ bọc
      // ngoài cùng phải có position để nó neo đúng chỗ.
      position: 'relative',
    }}>
      {/* Toast Notification */}
      {copyToast && (
        <div style={{
          position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: SURFACE, border: `1px solid ${LINE_STRONG}`, color: '#fff', padding: '12px 24px',
          borderRadius: 999, fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          Đã sao chép liên kết bài viết vào bộ nhớ tạm!
        </div>
      )}

      <style>{`
        .np-disc-bg { position: absolute; inset: 0 0 auto; height: 620px; overflow: hidden; pointer-events: none; z-index: 0; }
        .np-discussion-layout {
          position: relative; z-index: 1;
          width: min(1400px, calc(100% - 40px));
          margin: 0 auto;
          /* Chế độ đè không render spacer nên phải tự chừa 24px lề + 56px thanh. */
          padding: clamp(104px, 10vw, 124px) 0 80px;
          display: grid;
          grid-template-columns: 1fr minmax(auto, 720px) 1fr;
          gap: 32px;
          align-items: start;
        }
        /* Ô lưới mặc định có min-width: auto, nên nội dung không xuống dòng
           được (nhãn ở cột trái đặt white-space: nowrap) sẽ đẩy cả cột rộng
           hơn khung. Trên 375px cột phình lên 428px và bị overflow:clip của
           thẻ bọc cắt cụt — nhìn như thiết kế hỏng chứ không ai thấy thanh
           cuộn để biết là tràn. */
        .np-discussion-layout > * { min-width: 0; }
        @media (max-width: 1200px) {
          .np-discussion-layout {
            grid-template-columns: 240px 1fr !important;
          }
          .np-discussion-right-spacer {
            display: none !important;
          }
        }
        @media (max-width: 860px) {
          .np-discussion-layout {
            grid-template-columns: 1fr !important;
            padding: 92px 12px 60px !important;
          }
          .np-discussion-sidebar {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Xếp ngang trên màn hẹp: hai mục xếp dọc chiếm hơn 100px chiều cao
             trước khi thấy bài viết nào — trên điện thoại đó là 1/8 màn hình. */
          .np-discussion-sidenav {
            flex-direction: row !important;
          }
          .np-discussion-sidenav > * {
            flex: 1;
            justify-content: center !important;
            white-space: nowrap;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }
      `}</style>

      {/* Nền mesh chung với trang chủ / trang việc làm. Đặt ở tầng nền của cả
          trang (không nhét vào một khối cao ~300px) thì màu mới kịp loang. */}
      <div className="np-disc-bg" aria-hidden="true">
        <HeroMesh veil="radial-gradient(100% 92% at 50% 18%, rgba(11,15,14,0) 0%, #0b0f0e 100%)" />
      </div>

      {/* Thanh điều hướng trôi theo trang: cột trái và ô soạn bài đã bám rồi,
          thêm một thanh dính nữa là ba lớp chồng nhau ở mép trên. */}
      <SiteHeader overlay pinned={false} />

      {/* Page Content Container (Dead-centered feed, Left Sidebar flush to the left) */}
      <div className="np-discussion-layout">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="np-discussion-sidebar" style={{ position: 'sticky', top: 24, justifySelf: 'start', width: '100%', maxWidth: 240 }}>
          <div className="np-discussion-sidenav" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 'Dành cho bạn' Pill Link */}
            <button
              onClick={handleBackToMain}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 18px',
                borderRadius: 9999,
                background: activeTab === 'danh-cho-ban' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'danh-cho-ban' ? '#ffffff' : 'rgba(233,247,242,0.55)',
                fontWeight: activeTab === 'danh-cho-ban' ? 700 : 600,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'danh-cho-ban') e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'danh-cho-ban') e.currentTarget.style.background = 'transparent';
              }}
            >
              <House size={20} color={activeTab === 'danh-cho-ban' ? '#ffffff' : 'rgba(233,247,242,0.62)'} strokeWidth={2.4} />
              <span>Dành cho bạn</span>
            </button>

            {/* 'Đăng bài mới' Action Link */}
            <button
              onClick={() => requireAuth(() => setIsCreateModalOpen(true))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 18px',
                borderRadius: 9999,
                background: 'transparent',
                color: 'rgba(233,247,242,0.72)',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <PlusSquare size={20} color="rgba(233,247,242,0.55)" strokeWidth={2.2} />
              <span>Đăng bài mới</span>
            </button>
          </div>
        </aside>

        {/* ── CENTER FEED COLUMN ── */}
        <main style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
          {/* VIEW A: MAIN DISCUSSION FEED (DÀNH CHO BẠN) */}
          {activeTab === 'danh-cho-ban' && (
            <>
              {/* 1. Create Post Prompt Card */}
              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 20,
                  padding: '14px 18px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                {/* Avatar của chính người đang đăng nhập */}
                <UserAvatar src={myProfile?.avatarUrl} name={myName} size={42} />

                {/* Input Trigger Field */}
                <div
                  onClick={() => requireAuth(() => setIsCreateModalOpen(true))}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 9999,
                    padding: '10px 18px',
                    fontSize: '0.92rem',
                    color: 'rgba(233,247,242,0.62)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                >
                  Bạn có điều gì muốn hỏi không?
                </div>

                {/* Action Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(233,247,242,0.55)' }}>
                  {/* Đính kèm ảnh/tệp chưa triển khai — xem README phần Thảo Luận. */}
                  <button
                    onClick={() => requireAuth(() => {
                      setNewPostPollEnabled(true);
                      setIsCreateModalOpen(true);
                    })}
                    title="Tạo cuộc bình chọn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(233,247,242,0.55)', padding: 4 }}
                  >
                    <BarChart2 size={21} />
                  </button>
                </div>
              </div>

              {/* 2. Topic Chips Grid (2 rows x 3 columns) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic.id)}
                    style={{
                      background: CARD_BG,
                      borderRadius: 9999,
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      padding: '6px 8px 6px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {topic.name}
                    </span>
                    <div style={{ flexShrink: 0 }}>
                      <Topic3DIcon type={topic.type} size={36} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* VIEW B: TOPIC DETAIL HEADER (WHEN A TOPIC IS SELECTED) */}
          {activeTab === 'chu-de' && currentTopic && (
            <div style={{ marginBottom: 20 }}>
              {/* Back Link */}
              <button
                onClick={handleBackToMain}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px 0 16px',
                }}
              >
                <ArrowLeft size={20} />
                <span>Chủ đề</span>
              </button>

              {/* Topic Hero Card */}
              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 20,
                  padding: '24px 28px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
                  <div style={{ flexShrink: 0 }}>
                    <Topic3DIcon type={currentTopic.type} size={64} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {currentTopic.name}
                      </h1>
                      <ShieldCheck size={20} color="#8b5cf6" />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(233,247,242,0.62)', marginBottom: 6 }}>
                      Chủ đề chính thức · được NextPlease quản trị
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(233,247,242,0.72)', fontWeight: 600 }}>
                      {currentTopic.followersCount} người theo dõi · {currentTopic.postsCount} bài viết
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleToggleFollowTopic(currentTopic.id)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 9999,
                    background: followedTopics[currentTopic.id] ? 'rgba(255,255,255,0.06)' : '#8b5cf6',
                    color: followedTopics[currentTopic.id] ? 'rgba(233,247,242,0.55)' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {followedTopics[currentTopic.id] ? 'Đang theo dõi chủ đề' : 'Theo dõi chủ đề'}
                </button>
              </div>

              {/* Prompt box customized to topic */}
              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 20,
                  padding: '14px 18px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <UserAvatar src={myProfile?.avatarUrl} name={myName} size={42} />
                <div
                  onClick={() => {
                    setNewPostTopic(currentTopic.id);
                    requireAuth(() => setIsCreateModalOpen(true));
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 9999,
                    padding: '10px 18px',
                    fontSize: '0.92rem',
                    color: 'rgba(233,247,242,0.62)',
                    cursor: 'pointer',
                  }}
                >
                  Chia sẻ quan điểm {currentTopic.name} của bạn...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(233,247,242,0.55)' }}>
                  <BarChart2
                    size={21}
                    style={{ cursor: 'pointer' }}
                    onClick={() => requireAuth(() => { setNewPostPollEnabled(true); setIsCreateModalOpen(true); })}
                  />
                </div>
              </div>

              {/* Topic Filter Pills (Mới nhất | Nổi bật) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 4px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setFilterMode('newest')}
                    style={{
                      background: filterMode === 'newest' ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: filterMode === 'newest' ? '#ffffff' : 'rgba(233,247,242,0.62)',
                      padding: '6px 14px',
                      borderRadius: 9999,
                      fontSize: '0.88rem',
                      fontWeight: filterMode === 'newest' ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => setFilterMode('highlight')}
                    style={{
                      background: filterMode === 'highlight' ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: filterMode === 'highlight' ? '#ffffff' : 'rgba(233,247,242,0.62)',
                      padding: '6px 14px',
                      borderRadius: 9999,
                      fontSize: '0.88rem',
                      fontWeight: filterMode === 'highlight' ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Nổi bật
                  </button>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'rgba(233,247,242,0.62)' }}>
                  {displayedPosts.length} bài viết tuần này
                </span>
              </div>
            </div>
          )}

          {/* 3. POST FEED STREAM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {actionError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5',
                borderRadius: 14, padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <span>{actionError}</span>
                <X size={16} style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setActionError(null)} />
              </div>
            )}

            {loading ? (
              <div style={{
                background: CARD_BG, borderRadius: 20, padding: '48px 24px',
                textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(233,247,242,0.62)', fontWeight: 600,
              }}>
                Đang tải bài viết…
              </div>
            ) : feedError ? (
              <div style={{
                background: CARD_BG, borderRadius: 20, padding: '48px 24px',
                textAlign: 'center', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontWeight: 600,
              }}>
                {feedError}
              </div>
            ) : displayedPosts.length === 0 ? (
              <div
                style={{
                  background: CARD_BG,
                  borderRadius: 20,
                  padding: '48px 24px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(233,247,242,0.62)',
                }}
              >
                <EmptyStateMascot
                  title={currentTopic ? `Chưa có bài viết nào trong ${currentTopic.name}` : 'Chưa có bài viết nào'}
                  description="Cứ mở đầu đi — một câu hỏi cũng được tính là bắt đầu cuộc trò chuyện."
                  action={(
                    <button
                      onClick={() => requireAuth(() => setIsCreateModalOpen(true))}
                      style={{
                        background: TEAL,
                        color: '#fff',
                        padding: '10px 22px',
                        borderRadius: 9999,
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Hãy là người đầu tiên đăng bài!
                    </button>
                  )}
                />
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isExpanded = expandedPostIds[post.id];
                const shouldTruncate = post.content.length > 280 && !isExpanded;
                const isCommentsOpen = openComments[post.id];

                return (
                  <article
                    key={post.id}
                    style={{
                      background: CARD_BG,
                      borderRadius: 20,
                      padding: '22px 24px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Post Author Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                      {/* Avatar */}
                      <UserAvatar
                        src={post.author.avatarUrl}
                        name={post.author.name}
                        size={44}
                        background={post.author.avatarBg}
                        style={{ color: '#ffffff' }}
                      />

                      {/* Author Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', lineHeight: 1.3 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#ffffff' }}>
                            {post.author.name}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>›</span>
                          <button
                            onClick={() => handleSelectTopic(post.topicId)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: '#ffffff',
                              cursor: 'pointer',
                            }}
                          >
                            {post.topicName}
                          </button>
                          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>· {post.timeAgo}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'rgba(233,247,242,0.62)', marginTop: 3 }}>
                          {post.author.role}
                        </div>
                      </div>
                    </div>

                    {/* Post Body Content */}
                    <div style={{
                      fontSize: '0.93rem',
                      lineHeight: 1.65,
                      color: '#ffffff',
                      whiteSpace: 'pre-line',
                      marginBottom: 14,
                    }}>
                      {shouldTruncate ? `${post.content.slice(0, 280)}...` : post.content}
                      {post.content.length > 280 && (
                        <button
                          onClick={() => setExpandedPostIds((prev) => ({ ...prev, [post.id]: !isExpanded }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0 0 0 6px',
                            color: '#2563eb',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.93rem',
                          }}
                        >
                          {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                      )}
                    </div>

                    {/* Attachment: CV Badge (Matching Upzi CV card) */}
                    {post.attachment?.type === 'cv' && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 10,
                          background: '#0b0f0e',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 14,
                          padding: '10px 16px',
                          marginBottom: 16,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'rgba(233,247,242,0.72)',
                        }}
                      >
                        <FileText size={18} color="rgba(233,247,242,0.62)" />
                        <span style={{ textDecoration: 'underline' }}>{post.attachment.name}</span>
                      </div>
                    )}

                    {/* Interactive Poll Component (if any) */}
                    {post.poll && (
                      <div
                        style={{
                          background: '#0b0f0e',
                          borderRadius: 16,
                          padding: '16px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          marginBottom: 16,
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {post.poll.options.map((option) => {
                            const percent = post.poll.totalVotes > 0
                              ? Math.round((option.votes / post.poll.totalVotes) * 100)
                              : 0;
                            const isSelected = post.poll.votedOption === option.id;

                            return (
                              <button
                                key={option.id}
                                onClick={() => handleVotePoll(post.id, option.id)}
                                style={{
                                  position: 'relative',
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: 12,
                                  background: isSelected ? 'rgba(16,185,129,0.16)' : 'rgba(255,255,255,0.04)',
                                  border: isSelected ? `1.5px solid ${TEAL}` : '1px solid rgba(255,255,255,0.22)',
                                  textAlign: 'left',
                                  cursor: post.poll.votedOption ? 'default' : 'pointer',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {post.poll.votedOption && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      bottom: 0,
                                      width: `${percent}%`,
                                      background: isSelected ? '#a7f3d0' : 'rgba(255,255,255,0.1)',
                                      opacity: 0.45,
                                      zIndex: 0,
                                      transition: 'width 0.4s ease',
                                    }}
                                  />
                                )}
                                <span style={{ position: 'relative', zIndex: 1, fontWeight: isSelected ? 700 : 500, fontSize: '0.9rem', color: '#ffffff' }}>
                                  {option.text}
                                </span>
                                {post.poll.votedOption && (
                                  <span style={{ position: 'relative', zIndex: 1, fontWeight: 700, fontSize: '0.88rem', color: isSelected ? TEAL : 'rgba(233,247,242,0.62)' }}>
                                    {percent}%
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(233,247,242,0.62)', marginTop: 10, textAlign: 'right' }}>
                          Tổng {post.poll.totalVotes} lượt bình chọn
                        </div>
                      </div>
                    )}

                    {/* Post Actions Footer (Heart, Comment, Share matching Upzi) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                        paddingTop: 12,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        position: 'relative',
                      }}
                    >
                      {/* Like Action */}
                      <button
                        onClick={() => handleLikePost(post.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'none',
                          border: 'none',
                          color: post.hasLiked ? '#ef4444' : 'rgba(233,247,242,0.62)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                        }}
                      >
                        <Heart
                          size={20}
                          fill={post.hasLiked ? '#ef4444' : 'none'}
                          strokeWidth={2}
                        />
                        <span>{post.likesCount > 0 ? post.likesCount : ''}</span>
                      </button>

                      {/* Comment Action */}
                      <button
                        onClick={() => toggleComments(post.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'none',
                          border: 'none',
                          color: 'rgba(233,247,242,0.62)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                        }}
                      >
                        <MessageCircle size={20} strokeWidth={2} />
                        <span>{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                      </button>

                      {/* Share Action */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setActiveSharePostId(activeSharePostId === post.id ? null : post.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'none',
                            border: 'none',
                            color: 'rgba(233,247,242,0.62)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <Send size={19} strokeWidth={2} />
                        </button>

                        {/* Share Popover */}
                        {activeSharePostId === post.id && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '100%',
                              left: 0,
                              marginBottom: 8,
                              background: SURFACE,
                              borderRadius: 14,
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: 8,
                              zIndex: 100,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 4,
                              minWidth: 170,
                            }}
                          >
                            <button
                              onClick={() => handleCopyLink(post.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                            >
                              <Link2 size={16} color={TEAL} />
                              Sao chép liên kết
                            </button>
                            <button
                              onClick={() => {
                                const url = encodeURIComponent(`${window.location.origin}/thao-luan?post=${post.id}`);
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                setActiveSharePostId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                            >
                              <Share2 size={16} color="#2563eb" />
                              Chia sẻ lên Facebook
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Comments Section */}
                    {isCommentsOpen && (
                      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {/* List of comments */}
                        {post.comments && post.comments.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                            {post.comments.map((comment) => (
                              <div key={comment.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <UserAvatar
                                  src={comment.avatarUrl}
                                  name={comment.author}
                                  size={32}
                                  background={comment.avatarBg}
                                  style={{ color: '#ffffff' }}
                                />
                                <div style={{ background: '#0b0f0e', borderRadius: 12, padding: '10px 14px', flex: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>{comment.author}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>· {comment.timeAgo}</span>
                                  </div>
                                  <div style={{ fontSize: '0.88rem', color: 'rgba(233,247,242,0.72)', lineHeight: 1.5 }}>{comment.content}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 12px' }}>Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</p>
                        )}

                        {/* Comment Input Box */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Viết bình luận của bạn..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            style={{
                              flex: 1,
                              background: '#0b0f0e',
                              border: '1px solid rgba(255,255,255,0.22)',
                              borderRadius: 9999,
                              padding: '10px 16px',
                              fontSize: '0.88rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            style={{
                              background: TEAL,
                              color: '#fff',
                              border: 'none',
                              borderRadius: 9999,
                              padding: '10px 18px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            Gửi
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* ── RIGHT SPACER (Balancing left sidebar for exact center alignment) ── */}
        <div className="np-discussion-right-spacer" style={{ width: '100%', maxWidth: 240, justifySelf: 'end' }} />
      </div>

      {/* ── CREATE POST MODAL ── */}
      {isCreateModalOpen && (
        <div
          className="np-modal-overlay"
          role="presentation"
          onClick={() => setIsCreateModalOpen(false)}
        >
          {/* Các trạng thái focus / placeholder / hover không viết được bằng
              inline style, nên phần còn lại của trang dùng inline thì riêng
              modal vẫn cần một khối <style> nhỏ. */}
          <style>{`
            .np-modal-overlay {
              position: fixed; inset: 0; z-index: 1000; padding: 20px;
              display: flex; align-items: center; justify-content: center;
              background: rgba(11,15,14,0.72);
              backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
              animation: npModalFade 180ms ease-out both;
            }
            .np-modal {
              width: 100%; max-width: 560px; box-sizing: border-box;
              background: ${SURFACE}; border: 1px solid ${LINE_STRONG}; border-radius: 20px;
              box-shadow: 0 30px 70px rgba(0,0,0,0.6);
              animation: npModalIn 240ms cubic-bezier(0.22,1,0.36,1) both;
              max-height: calc(100vh - 40px); display: flex; flex-direction: column;
            }
            @keyframes npModalFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes npModalIn { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
            @media (prefers-reduced-motion: reduce) {
              .np-modal-overlay, .np-modal { animation: none !important; }
            }

            .np-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px 18px; border-bottom: 1px solid ${LINE}; }
            .np-modal-title { font-family: inherit; margin: 0; font-size: 1.25rem; font-weight: 500; letter-spacing: -0.02em; color: ${ON_DARK}; }
            .np-modal-sub { margin: 6px 0 0; font-size: 0.875rem; line-height: 1.4; color: ${MUTED}; }
            .np-modal-x { flex: none; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid ${LINE_STRONG}; background: transparent; color: ${MUTED}; cursor: pointer; transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease; }
            .np-modal-x:hover { color: ${ON_DARK}; background: rgba(255,255,255,0.06); }

            .np-modal-body { padding: 20px 24px; overflow-y: auto; }
            .np-field-label { display: block; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase; color: ${MUTED}; margin-bottom: 10px; }

            /* Chủ đề là chip chứ không phải <select>: danh sách chỉ vài mục, mà
               <select> gốc thì mỗi hệ điều hành vẽ một kiểu — trên Windows nó
               bung ra một danh sách nền trắng giữa giao diện tối. */
            .np-topicchips { display: flex; flex-wrap: wrap; gap: 8px; }
            .np-topicchip { border: 1px solid ${LINE_STRONG}; background: transparent; color: ${ON_DARK}; border-radius: 8px; padding: 9px 14px; font: inherit; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease; }
            .np-topicchip:hover { background: rgba(255,255,255,0.08); }
            .np-topicchip[aria-pressed="true"] { background: rgba(16,185,129,0.16); border-color: rgba(16,185,129,0.6); color: ${EMERALD}; }

            /* Khung ôm lấy textarea mới là thứ mang viền + vòng focus; textarea
               bên trong bỏ viền hẳn. Nhờ vậy bộ đếm ký tự nằm chung trong khung
               thay vì lơ lửng bên ngoài. */
            .np-composer { margin-top: 22px; border: 1px solid ${LINE_STRONG}; border-radius: 14px; background: rgba(255,255,255,0.03); transition: border-color 150ms ease, box-shadow 150ms ease; }
            .np-composer:focus-within { border-color: rgba(16,185,129,0.6); box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
            .np-composer textarea { display: block; width: 100%; box-sizing: border-box; min-height: 150px; resize: vertical; border: 0; outline: 0; background: transparent; padding: 16px 16px 8px; font: inherit; font-size: 1.0625rem; line-height: 1.6; color: ${ON_DARK}; }
            .np-composer textarea::placeholder { color: rgba(255,255,255,0.38); }
            .np-composer-foot { display: flex; justify-content: flex-end; padding: 0 16px 12px; font-size: 0.78rem; color: rgba(255,255,255,0.38); }
            .np-composer-foot.over { color: #fca5a5; }

            .np-poll { margin-top: 18px; border: 1px solid ${LINE}; border-radius: 14px; padding: 16px; background: rgba(255,255,255,0.03); }
            .np-poll-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
            .np-poll-head span { font-size: 0.875rem; font-weight: 500; color: ${ON_DARK}; }
            .np-poll-drop { background: none; border: 0; color: #fca5a5; font: inherit; font-size: 0.8rem; font-weight: 500; cursor: pointer; padding: 4px; }
            .np-poll-drop:hover { text-decoration: underline; text-underline-offset: 3px; }
            .np-poll-row { display: flex; align-items: center; gap: 8px; }
            .np-poll-row input { flex: 1; min-width: 0; box-sizing: border-box; padding: 10px 13px; border-radius: 10px; border: 1px solid ${LINE_STRONG}; background: transparent; font: inherit; font-size: 0.9rem; color: ${ON_DARK}; outline: 0; transition: border-color 150ms ease; }
            .np-poll-row input::placeholder { color: rgba(255,255,255,0.35); }
            .np-poll-row input:focus { border-color: rgba(16,185,129,0.6); }
            .np-poll-x { flex: none; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 8px; background: transparent; color: ${MUTED}; cursor: pointer; transition: color 150ms ease, background-color 150ms ease; }
            .np-poll-x:hover { color: #fca5a5; background: rgba(239,68,68,0.12); }
            .np-poll-add { width: 100%; border: 1px dashed ${LINE_STRONG}; border-radius: 10px; padding: 10px; background: none; font: inherit; font-size: 0.85rem; font-weight: 500; color: ${EMERALD}; cursor: pointer; transition: border-color 150ms ease, background-color 150ms ease; }
            .np-poll-add:hover { border-color: rgba(16,185,129,0.6); background: rgba(16,185,129,0.08); }

            .np-modal-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 24px 20px; border-top: 1px solid ${LINE}; }
            .np-modal-foot-right { display: flex; align-items: center; gap: 10px; }
            .np-btn-poll { display: inline-flex; align-items: center; gap: 7px; border: 1px solid ${LINE_STRONG}; background: transparent; color: ${MUTED}; border-radius: 8px; padding: 9px 14px; font: inherit; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease; }
            .np-btn-poll:hover:not(:disabled) { color: ${EMERALD}; border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.08); }
            .np-btn-poll:disabled { opacity: 0.4; cursor: not-allowed; }
            .np-btn-ghost { border: 1px solid ${LINE_STRONG}; background: transparent; color: ${ON_DARK}; border-radius: 8px; padding: 11px 18px; font: inherit; font-size: 0.9375rem; font-weight: 500; cursor: pointer; transition: background-color 150ms ease; }
            .np-btn-ghost:hover { background: rgba(255,255,255,0.08); }
            .np-btn-send { border: 0; background: ${EMERALD}; color: ${INK}; border-radius: 8px; padding: 11px 22px; font: inherit; font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: background-color 150ms ease; }
            .np-btn-send:hover:not(:disabled) { background: #34d399; }
            .np-btn-send:disabled { opacity: 0.45; cursor: not-allowed; }

            @media (max-width: 560px) {
              .np-modal-foot { flex-direction: column; align-items: stretch; }
              .np-modal-foot-right { justify-content: flex-end; }
            }
          `}</style>

          <div
            className="np-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Tạo bài viết mới"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="np-modal-head">
              <div style={{ minWidth: 0 }}>
                <h2 className="np-modal-title">Tạo bài viết mới</h2>
                <p className="np-modal-sub">
                  Đăng với tên <b style={{ color: ON_DARK, fontWeight: 500 }}>{myName}</b>
                </p>
              </div>
              <button type="button" className="np-modal-x" aria-label="Đóng" onClick={() => setIsCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'contents' }}>
              <div className="np-modal-body">
                <span className="np-field-label">Chủ đề</span>
                <div className="np-topicchips" role="group" aria-label="Chọn chủ đề">
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="np-topicchip"
                      aria-pressed={String(newPostTopic) === String(t.id)}
                      onClick={() => setNewPostTopic(t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                <div className="np-composer">
                  <textarea
                    placeholder="Bạn muốn chia sẻ điều gì với cộng đồng hôm nay?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    maxLength={POST_MAX_CHARS}
                    required
                    aria-label="Nội dung bài viết"
                  />
                  <div className={`np-composer-foot${newPostContent.length > POST_MAX_CHARS - 100 ? ' over' : ''}`}>
                    {newPostContent.length}/{POST_MAX_CHARS}
                  </div>
                </div>

                {newPostPollEnabled && (
                  <div className="np-poll">
                    <div className="np-poll-head">
                      <span>Lựa chọn bình chọn</span>
                      <button type="button" className="np-poll-drop" onClick={() => setNewPostPollEnabled(false)}>
                        Bỏ bình chọn
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {pollOptions.map((opt, idx) => (
                        // Dùng index làm key vì lựa chọn chưa có id và nội dung
                        // có thể trùng nhau; danh sách chỉ thêm/bớt ở cuối.
                        <div className="np-poll-row" key={idx}>
                          <input
                            type="text"
                            placeholder={`Lựa chọn ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const next = [...pollOptions];
                              next[idx] = e.target.value;
                              setPollOptions(next);
                            }}
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              className="np-poll-x"
                              aria-label={`Xoá lựa chọn ${idx + 1}`}
                              onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 4 && (
                        <button type="button" className="np-poll-add" onClick={() => setPollOptions([...pollOptions, ''])}>
                          + Thêm lựa chọn
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="np-modal-foot">
                <button
                  type="button"
                  className="np-btn-poll"
                  disabled={newPostPollEnabled}
                  onClick={() => setNewPostPollEnabled(true)}
                >
                  <BarChart2 size={16} /> Thêm bình chọn
                </button>
                <div className="np-modal-foot-right">
                  <button type="button" className="np-btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="np-btn-send" disabled={creatingPost || !newPostContent.trim()}>
                    {creatingPost ? 'Đang đăng…' : 'Đăng bài'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}
